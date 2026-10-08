# SigmatNG

Сайт технологической платформы **SigmatNG** — системы автоматизированной высокочастотной торговли. Это production-ready MVP: публичный двуязычный лендинг и защищённая админ-панель для редактирования контента и документов без изменения исходного кода.

Тексты не содержат обещаний доходности, неподтверждённых лицензий и фиктивной биржевой статистики. MOEX и SPBX упоминаются только как возможные направления интеграции, без заявлений о партнёрстве.

## Архитектура URL

Выбрана схема App Router с локалью в пути и **единым** административным маршрутом:

| URL | Назначение |
| --- | --- |
| `/` | редирект на `/ru` или сохранённую локаль |
| `/ru`, `/en` | публичный одностраничный сайт |
| `/admin/login` | вход администратора |
| `/admin` | редактирование контента (не в публичной навигации) |
| `/api/admin/*` | защищённые API |
| `/api/documents/:id` | выдача загруженных файлов |

Русский — локаль по умолчанию. Переключатель RU/EN пишет cookie `sng_locale`, поэтому язык сохраняется при переходах. Редактируемые строки хранятся в `data/content.json` с полями `ru` и `en`. Если перевод пуст, показывается fallback на другой язык.

Админка не дублируется как `/ru/admin`: так проще защищать маршрут, cookie сессии и CSRF, и нет риска рассинхрона двух копий UI.

В Next.js 16 файл `proxy.ts` выполняет роль прежнего `middleware.ts`: редирект локали, заголовок `x-locale` для `html lang` и проверка сессии для `/admin` и admin API.

## Стек

Next.js (App Router), TypeScript, React, Tailwind CSS, Zod, bcryptjs, jose (JWT-сессия), lucide-react, Framer Motion (лёгкий fade-in с учётом `prefers-reduced-motion`).

Хранилище: JSON на диске + файлы в `storage/documents/`. Внешняя CMS не используется.

## Запуск

Требуются Node.js 20+ и npm.

В PowerShell Windows, если `npm` блокируется политикой выполнения, используйте `npm.cmd`.

```bash
npm install
copy .env.example .env.local
```

Заполните `.env.local` (см. ниже), затем:

```bash
npm run dev
```

Откройте http://localhost:3000 и http://localhost:3000/admin/login.

Скрипты:

- `npm run dev` — разработка
- `npm run build` / `npm start` — production-сборка и запуск Node-сервера
- `npm run lint`
- `npm run typecheck`
- `npm test`

## Переменные окружения

Скопируйте `.env.example` в `.env.local` (файл не коммитится).

| Переменная | Назначение |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | канонический URL для SEO, sitemap и Open Graph |
| `ADMIN_LOGIN` | логин администратора |
| `ADMIN_PASSWORD_HASH` | bcrypt-хеш пароля (рекомендуется) |
| `ADMIN_PASSWORD` | открытый пароль **только для development**; в production игнорируется |
| `SESSION_SECRET` | секрет JWT не короче 16 символов |
| `MAX_UPLOAD_BYTES` | лимит загрузки документа (по умолчанию 10 МБ) |

Сгенерировать хеш:

```bash
node -e "require('bcryptjs').hash('your-password', 10).then(console.log)"
```

После перехода на `ADMIN_PASSWORD_HASH` удалите `ADMIN_PASSWORD`. Пароль, хеш и `SESSION_SECRET` не должны попадать в клиентский код, логи и git.

### Экранирование `$` в `ADMIN_PASSWORD_HASH`

bcrypt-хеш содержит символы `$` (`$2b$10$…`), а Next.js выполняет подстановку переменных вида `$ИМЯ` при чтении `.env`-файлов. Поэтому **все `$` в хеше нужно экранировать обратным слешем**:

```dotenv
# правильно
ADMIN_PASSWORD_HASH=\$2b\$10\$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQ

# неправильно: значение молча станет пустой строкой, и вход в админку
# всегда будет отвечать 401, даже если логин и пароль верные
ADMIN_PASSWORD_HASH=$2b$10$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQ
```

Проверить, что хеш дошёл до приложения без потерь:

```bash
node -e "const {loadEnvConfig}=require('@next/env');loadEnvConfig(process.cwd(),false);console.log(JSON.stringify(process.env.ADMIN_PASSWORD_HASH))"
```

Вывод должен совпасть с хешем целиком. Пустая строка `""` или `undefined` означает, что `$` не экранированы либо переменная не задана.

Экранирование нужно только в `.env`-файлах. В `docker-compose.yml` знак `$` удваивается (`$$`), а в конфигах nginx и в переменных окружения процесса escaping не требуется — там `$` имеет собственный смысл.

## Админ-панель

- Вход: логин и пароль, проверка только на сервере.
- Сессия: HTTP-only cookie, SameSite=Lax, Secure в production, срок 8 часов.
- Изменяющие запросы: same-origin и заголовок `x-csrf-token`.
- Login API: rate limit и одинаковый ответ при ошибке (без утечки, существует ли логин).
- Можно править RU/EN тексты, порядок и видимость блоков, контакты, загружать PDF/DOC/DOCX, публиковать и удалять документы.

Скрытый URL не является защитой: без сессии `/admin` и `/api/admin/*` недоступны.

## Резервное копирование

Перед каждой записью `data/content.json` копируется в `data/backups/` (хранятся последние 10 файлов). Запись атомарная: временный файл + rename. Конкурентные сохранения выстраиваются в очередь.

Регулярно копируйте:

- `data/content.json` и `data/backups/`
- `storage/documents/`

## Production

Текущая реализация рассчитана на **обычный Node.js-сервер или VPS**, где файловая система постоянна (`npm run build` и `npm start`).

На serverless (в том числе типичный Vercel) диск ephemeral: правки JSON и загрузки пропадут. Для такого окружения вынесите контент и файлы в постоянное хранилище, например объектное хранилище в РФ (Yandex Object Storage, Selectel S3, Timeweb Cloud S3) или том на VPS.

Перед публикацией:

1. Задайте `ADMIN_PASSWORD_HASH` и длинный `SESSION_SECRET`.
2. Укажите боевой `NEXT_PUBLIC_SITE_URL`.
3. Замените placeholder-реквизиты в админке.
4. Не утверждайте включение в реестр российского ПО, пока не заполнена карточка ПО.
5. Не выкладывайте `storage/documents` и бэкапы в публичный git.

## Развёртывание в production с HTTPS (nginx)

Схема: **nginx слушает 80/443 и терминирует TLS, Next.js работает только на петлевом интерфейсе**.

```
интернет → nginx :443 (TLS) → 127.0.0.1:3000 (next start)
              :80  → 301 → https
```

`next start` не умеет HTTPS (флаг `--experimental-https` есть только у `next dev`), поэтому TLS всегда терминируется на прокси. Запускать Next напрямую на порту 80 бессмысленно и небезопасно: по HTTP браузер не сохранит cookie сессии с флагом `Secure` (`lib/auth/session.ts`), и после успешного входа панель будет возвращать на `/admin/login`.

### 1. Переменные окружения

Заполните `.env.local` на сервере (файл не коммитится):

```dotenv
NEXT_PUBLIC_SITE_URL=https://sng.example.ru
ADMIN_LOGIN=admin
# bcrypt-хеш; символы $ обязательно экранировать обратным слешем
# (подробнее — в разделе «Переменные окружения»)
ADMIN_PASSWORD_HASH=\$2b\$10\$....
SESSION_SECRET=<случайная строка не короче 32 символов>
MAX_UPLOAD_BYTES=10485760
```

Два важных момента:

- `ADMIN_PASSWORD` (открытый пароль) в production игнорируется, без `ADMIN_PASSWORD_HASH` вход в админку невозможен.
- `NEXT_PUBLIC_SITE_URL` впекается в статические `sitemap.xml`, `robots.txt` и метаданные, поэтому после его изменения нужен повторный `npm run build`.

### 2. Сборка и запуск Node-сервера

```bash
npm ci
npm run build
npx next start -H 127.0.0.1 -p 3000
```

Порт 3000 не публикуйте наружу: снаружи доступен только прокси. (Напоминание: `PORT` нельзя задавать в `.env` — сервер стартует раньше чтения файла.)

Автозапуск на Linux (systemd), файл `/etc/systemd/system/sng-web.service`:

```ini
[Unit]
Description=SigmatNG (Next.js)
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/sng
User=www-data
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/www/sng/node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now sng-web
```

Автозапуск на Windows (NSSM как служба):

```powershell
nssm install sng-web "C:\Program Files\nodejs\node.exe" "C:\sites\sng\node_modules\next\dist\bin\next start -H 127.0.0.1 -p 3000"
nssm set sng-web AppDirectory C:\sites\sng
nssm start sng-web
```

### 3. nginx

Готовый конфиг — [deploy/nginx/sng.conf](deploy/nginx/sng.conf). Замените в нём домен (в `server_name` и в проверке `$host`) и пути к сертификатам.

- Linux: скопируйте в `/etc/nginx/conf.d/sng.conf`, затем `sudo nginx -t` и `sudo systemctl reload nginx`.
- Windows: положите файл, например, в `C:\nginx\conf\sng.conf` и добавьте `include C:/nginx/conf/sng.conf;` внутрь блока `http { }` в `C:\nginx\conf\nginx.conf`; проверка и перезагрузка — `C:\nginx\nginx.exe -t` и `C:\nginx\nginx.exe -s reload`. Пути к сертификатам указывайте через прямой слеш: `ssl_certificate C:/nginx/certs/fullchain.pem;`.

Что уже настроено в конфиге:

| Параметр | Зачем |
| --- | --- |
| `listen 80 → 301 https` | постоянный редирект; ACME-челлендж остаётся доступным для продления сертификата |
| `Host`, `X-Forwarded-Host` | приложение сверяет `Origin` с `x-forwarded-host`, иначе сохранение контента вернёт `403` |
| `X-Forwarded-For`, `X-Real-IP` | корректный rate limit попыток входа по IP |
| `client_max_body_size 12m` | загрузка документов до 10 МБ не падает с `413` |
| `proxy_buffering off` | стриминг RSC/SSR |
| `Strict-Transport-Security` | HSTS; включайте после проверки HTTPS |

> На Windows порт 80 (а при IIS и 443) удерживает HTTP.SYS: пока служба `W3SVC` запущена, ни `next start -p 80`, ни nginx не смогут занять порт — попытка завершится ошибкой `EACCES`. Либо освободите порт (`Stop-Service W3SVC`), либо используйте IIS как прокси вместо nginx.

### 4. Сертификат

- Linux, Let's Encrypt: `sudo certbot --nginx -d sng.example.ru` либо `--webroot -w /var/www/certbot`.
- Windows, Let's Encrypt: win-acme (`wacs.exe`).
- Внутренняя сеть без публичного домена: сертификат внутреннего CA (`mkcert`) или корпоративный. `Secure`-cookie работает и с ним, но DNS-имя должно быть постоянным, а корневой сертификат — установлен на клиентах.

### 5. Проверка после развёртывания

```bash
curl -I http://sng.example.ru                    # 301 на https
curl -sI https://sng.example.ru/admin            # 307 на /admin/login — сессии ещё нет
curl -s https://sng.example.ru/api/admin/content # {"error":"Unauthorized"}
```

В браузере:

1. `/admin/login` → вход → открывается `/admin`. Если снова страница логина — проверьте, что `$` в `ADMIN_PASSWORD_HASH` экранированы и что значение не пустое.
2. DevTools → Application → Cookies: `sng_session` присутствует, флаги `Secure`, `HttpOnly`, `SameSite=Lax`.
3. Сохранение контента и загрузка документа ~10 МБ отвечают `200`, а не `403` (проверка Origin — заголовки прокси) и не `413` (лимит размера тела).

## Безопасность контента

Внешние ссылки допускают только `http`/`https`. `mailto` и `tel` обрабатываются отдельно. Загрузка ограничена PDF/DOC/DOCX с проверкой расширения, MIME и сигнатуры файла. Файлы лежат вне `public/` и отдаются как вложение с `X-Content-Type-Options: nosniff`. Идентификаторы документов не позволяют path traversal.
