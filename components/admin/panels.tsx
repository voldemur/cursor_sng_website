import { ICON_OPTIONS } from "@/components/landing/AdvantageIcon";
import { Card, LocalizedPair, TextField, Toggle } from "@/components/admin/fields";
import { emptyText } from "@/lib/content/empty";
import { moveItem } from "@/lib/admin/reorder";
import type { ContentDocument, SiteContent } from "@/types/content";

type EditorProps = {
  content: SiteContent;
  onChange: (content: SiteContent) => void;
};

function SortRemove({
  onUp,
  onDown,
  onRemove,
}: {
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn-secondary !px-3 !py-1.5 text-xs" onClick={onUp}>
        Вверх
      </button>
      <button type="button" className="btn-secondary !px-3 !py-1.5 text-xs" onClick={onDown}>
        Вниз
      </button>
      <button type="button" className="btn-secondary !px-3 !py-1.5 text-xs" onClick={onRemove}>
        Удалить
      </button>
    </div>
  );
}

export function SitePanel({ content, onChange }: EditorProps) {
  return (
    <div className="space-y-4">
      <Card title="Сайт">
        <LocalizedPair label="Название" value={content.site.name} onChange={(name) => onChange({ ...content, site: { ...content.site, name } })} />
        <LocalizedPair label="Полное название" value={content.site.fullName} onChange={(fullName) => onChange({ ...content, site: { ...content.site, fullName } })} />
        <LocalizedPair
          label="Краткое описание"
          value={content.site.description}
          multiline
          onChange={(description) => onChange({ ...content, site: { ...content.site, description } })}
        />
        <LocalizedPair label="SEO title" value={content.site.seoTitle} onChange={(seoTitle) => onChange({ ...content, site: { ...content.site, seoTitle } })} />
        <LocalizedPair
          label="SEO description"
          value={content.site.seoDescription}
          multiline
          onChange={(seoDescription) => onChange({ ...content, site: { ...content.site, seoDescription } })}
        />
      </Card>
      <Card title="Навигация">
        <LocalizedPair label="Преимущества" value={content.navigation.advantages} onChange={(advantages) => onChange({ ...content, navigation: { ...content.navigation, advantages } })} />
        <LocalizedPair label="О компании" value={content.navigation.about} onChange={(about) => onChange({ ...content, navigation: { ...content.navigation, about } })} />
        <LocalizedPair label="Продукты" value={content.navigation.products} onChange={(products) => onChange({ ...content, navigation: { ...content.navigation, products } })} />
        <LocalizedPair label="Документация" value={content.navigation.documentation} onChange={(documentation) => onChange({ ...content, navigation: { ...content.navigation, documentation } })} />
        <LocalizedPair label="Контакты" value={content.navigation.contacts} onChange={(contacts) => onChange({ ...content, navigation: { ...content.navigation, contacts } })} />
        <LocalizedPair label="Кнопка CTA" value={content.navigation.cta} onChange={(cta) => onChange({ ...content, navigation: { ...content.navigation, cta } })} />
      </Card>
      <Card title="Подвал">
        <LocalizedPair label="Краткое описание" value={content.footer.tagline} multiline onChange={(tagline) => onChange({ ...content, footer: { ...content.footer, tagline } })} />
        <LocalizedPair label="Копирайт" value={content.footer.copyright} onChange={(copyright) => onChange({ ...content, footer: { ...content.footer, copyright } })} />
      </Card>
    </div>
  );
}

export function HeroPanel({ content, onChange }: EditorProps) {
  return (
    <Card title="Hero" actions={<Toggle label="Показывать блок" checked={content.hero.visible} onChange={(visible) => onChange({ ...content, hero: { ...content.hero, visible } })} />}>
      <LocalizedPair label="Надзаголовок" value={content.hero.eyebrow} onChange={(eyebrow) => onChange({ ...content, hero: { ...content.hero, eyebrow } })} />
      <LocalizedPair label="Заголовок" value={content.hero.title} multiline onChange={(title) => onChange({ ...content, hero: { ...content.hero, title } })} />
      <LocalizedPair label="Описание" value={content.hero.description} multiline onChange={(description) => onChange({ ...content, hero: { ...content.hero, description } })} />
      <LocalizedPair label="Основная кнопка" value={content.hero.primaryCta} onChange={(primaryCta) => onChange({ ...content, hero: { ...content.hero, primaryCta } })} />
      <LocalizedPair label="Вторая кнопка" value={content.hero.secondaryCta} onChange={(secondaryCta) => onChange({ ...content, hero: { ...content.hero, secondaryCta } })} />
    </Card>
  );
}

export function AdvantagesPanel({ content, onChange }: EditorProps) {
  const items = [...content.advantages.items].sort((a, b) => a.order - b.order);
  return (
    <div className="space-y-4">
      <Card title="Секция" actions={<Toggle label="Показывать блок" checked={content.advantages.visible} onChange={(visible) => onChange({ ...content, advantages: { ...content.advantages, visible } })} />}>
        <LocalizedPair label="Заголовок" value={content.advantages.title} onChange={(title) => onChange({ ...content, advantages: { ...content.advantages, title } })} />
        <LocalizedPair label="Описание" value={content.advantages.description} multiline onChange={(description) => onChange({ ...content, advantages: { ...content.advantages, description } })} />
      </Card>
      {items.map((item, index) => (
        <Card
          key={item.id}
          title={`Преимущество ${index + 1}`}
          actions={
            <SortRemove
              onUp={() => onChange({ ...content, advantages: { ...content.advantages, items: moveItem(items, index, -1) } })}
              onDown={() => onChange({ ...content, advantages: { ...content.advantages, items: moveItem(items, index, 1) } })}
              onRemove={() =>
                onChange({
                  ...content,
                  advantages: { ...content.advantages, items: items.filter((entry) => entry.id !== item.id).map((entry, i) => ({ ...entry, order: i + 1 })) },
                })
              }
            />
          }
        >
          <Toggle label="Видимо на сайте" checked={item.visible} onChange={(visible) => {
            const next = items.map((entry) => (entry.id === item.id ? { ...entry, visible } : entry));
            onChange({ ...content, advantages: { ...content.advantages, items: next } });
          }} />
          <label className="block">
            <span className="mb-1.5 block text-xs tracking-wide text-platinum uppercase">Иконка</span>
            <select
              className="admin-input"
              value={item.icon}
              onChange={(event) => {
                const next = items.map((entry) => (entry.id === item.id ? { ...entry, icon: event.target.value } : entry));
                onChange({ ...content, advantages: { ...content.advantages, items: next } });
              }}
            >
              {ICON_OPTIONS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </label>
          <LocalizedPair
            label="Заголовок"
            value={item.title}
            onChange={(title) => onChange({ ...content, advantages: { ...content.advantages, items: items.map((entry) => (entry.id === item.id ? { ...entry, title } : entry)) } })}
          />
          <LocalizedPair
            label="Описание"
            value={item.description}
            multiline
            onChange={(description) => onChange({ ...content, advantages: { ...content.advantages, items: items.map((entry) => (entry.id === item.id ? { ...entry, description } : entry)) } })}
          />
        </Card>
      ))}
      <button
        type="button"
        className="btn-secondary"
        onClick={() =>
          onChange({
            ...content,
            advantages: {
              ...content.advantages,
              items: [
                ...items,
                {
                  id: crypto.randomUUID(),
                  title: emptyText(),
                  description: emptyText(),
                  icon: "activity",
                  visible: true,
                  order: items.length + 1,
                },
              ],
            },
          })
        }
      >
        Добавить преимущество
      </button>
    </div>
  );
}

export function AboutPanel({ content, onChange }: EditorProps) {
  return (
    <div className="space-y-4">
      <Card title="Компания" actions={<Toggle label="Показывать блок" checked={content.about.visible} onChange={(visible) => onChange({ ...content, about: { ...content.about, visible } })} />}>
        <LocalizedPair label="Заголовок" value={content.about.title} onChange={(title) => onChange({ ...content, about: { ...content.about, title } })} />
        <LocalizedPair label="Заголовок аудитории" value={content.about.audienceTitle} onChange={(audienceTitle) => onChange({ ...content, about: { ...content.about, audienceTitle } })} />
      </Card>
      {content.about.paragraphs.map((paragraph, index) => (
        <Card
          key={index}
          title={`Абзац ${index + 1}`}
          actions={
            <button
              type="button"
              className="btn-secondary !px-3 !py-1.5 text-xs"
              onClick={() => onChange({ ...content, about: { ...content.about, paragraphs: content.about.paragraphs.filter((_, i) => i !== index) } })}
            >
              Удалить
            </button>
          }
        >
          <LocalizedPair
            label="Текст"
            value={paragraph}
            multiline
            onChange={(value) => {
              const paragraphs = content.about.paragraphs.map((item, i) => (i === index ? value : item));
              onChange({ ...content, about: { ...content.about, paragraphs } });
            }}
          />
        </Card>
      ))}
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onChange({ ...content, about: { ...content.about, paragraphs: [...content.about.paragraphs, emptyText()] } })}
      >
        Добавить абзац
      </button>
      {content.about.audienceItems.map((item, index) => (
        <Card
          key={`aud-${index}`}
          title={`Аудитория ${index + 1}`}
          actions={
            <button
              type="button"
              className="btn-secondary !px-3 !py-1.5 text-xs"
              onClick={() => onChange({ ...content, about: { ...content.about, audienceItems: content.about.audienceItems.filter((_, i) => i !== index) } })}
            >
              Удалить
            </button>
          }
        >
          <LocalizedPair
            label="Пункт"
            value={item}
            onChange={(value) => {
              const audienceItems = content.about.audienceItems.map((entry, i) => (i === index ? value : entry));
              onChange({ ...content, about: { ...content.about, audienceItems } });
            }}
          />
        </Card>
      ))}
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onChange({ ...content, about: { ...content.about, audienceItems: [...content.about.audienceItems, emptyText()] } })}
      >
        Добавить пункт аудитории
      </button>
    </div>
  );
}

export function ProductsPanel({ content, onChange }: EditorProps) {
  const items = [...content.products.items].sort((a, b) => a.order - b.order);
  return (
    <div className="space-y-4">
      <Card title="Секция" actions={<Toggle label="Показывать блок" checked={content.products.visible} onChange={(visible) => onChange({ ...content, products: { ...content.products, visible } })} />}>
        <LocalizedPair label="Заголовок" value={content.products.title} onChange={(title) => onChange({ ...content, products: { ...content.products, title } })} />
        <LocalizedPair label="Описание" value={content.products.description} multiline onChange={(description) => onChange({ ...content, products: { ...content.products, description } })} />
      </Card>
      {items.map((item, index) => (
        <Card
          key={item.id}
          title={`Продукт ${index + 1}`}
          actions={
            <SortRemove
              onUp={() => onChange({ ...content, products: { ...content.products, items: moveItem(items, index, -1) } })}
              onDown={() => onChange({ ...content, products: { ...content.products, items: moveItem(items, index, 1) } })}
              onRemove={() =>
                onChange({
                  ...content,
                  products: { ...content.products, items: items.filter((entry) => entry.id !== item.id).map((entry, i) => ({ ...entry, order: i + 1 })) },
                })
              }
            />
          }
        >
          <Toggle
            label="Видимо на сайте"
            checked={item.visible}
            onChange={(visible) => onChange({ ...content, products: { ...content.products, items: items.map((entry) => (entry.id === item.id ? { ...entry, visible } : entry)) } })}
          />
          <LocalizedPair label="Название" value={item.title} onChange={(title) => onChange({ ...content, products: { ...content.products, items: items.map((entry) => (entry.id === item.id ? { ...entry, title } : entry)) } })} />
          <LocalizedPair label="Описание" value={item.description} multiline onChange={(description) => onChange({ ...content, products: { ...content.products, items: items.map((entry) => (entry.id === item.id ? { ...entry, description } : entry)) } })} />
          <LocalizedPair label="Цена (без суммы)" value={item.priceLabel} onChange={(priceLabel) => onChange({ ...content, products: { ...content.products, items: items.map((entry) => (entry.id === item.id ? { ...entry, priceLabel } : entry)) } })} />
          <LocalizedPair label="Текст кнопки" value={item.ctaLabel} onChange={(ctaLabel) => onChange({ ...content, products: { ...content.products, items: items.map((entry) => (entry.id === item.id ? { ...entry, ctaLabel } : entry)) } })} />
          {item.features.map((feature, featureIndex) => (
            <div key={featureIndex} className="rounded-xl border border-white/8 p-3">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  className="text-xs text-mist hover:text-white"
                  onClick={() =>
                    onChange({
                      ...content,
                      products: {
                        ...content.products,
                        items: items.map((entry) =>
                          entry.id === item.id ? { ...entry, features: entry.features.filter((_, i) => i !== featureIndex) } : entry,
                        ),
                      },
                    })
                  }
                >
                  Удалить возможность
                </button>
              </div>
              <LocalizedPair
                label={`Возможность ${featureIndex + 1}`}
                value={feature}
                onChange={(value) =>
                  onChange({
                    ...content,
                    products: {
                      ...content.products,
                      items: items.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, features: entry.features.map((current, i) => (i === featureIndex ? value : current)) }
                          : entry,
                      ),
                    },
                  })
                }
              />
            </div>
          ))}
          <button
            type="button"
            className="btn-secondary !px-3 !py-1.5 text-xs"
            onClick={() =>
              onChange({
                ...content,
                products: {
                  ...content.products,
                  items: items.map((entry) => (entry.id === item.id ? { ...entry, features: [...entry.features, emptyText()] } : entry)),
                },
              })
            }
          >
            Добавить возможность
          </button>
        </Card>
      ))}
      <button
        type="button"
        className="btn-secondary"
        onClick={() =>
          onChange({
            ...content,
            products: {
              ...content.products,
              items: [
                ...items,
                {
                  id: crypto.randomUUID(),
                  title: emptyText(),
                  description: emptyText(),
                  features: [emptyText()],
                  priceLabel: { ru: "Цена предоставляется по запросу", en: "Price available on request" },
                  ctaLabel: { ru: "Получить предложение", en: "Get a proposal" },
                  visible: true,
                  order: items.length + 1,
                },
              ],
            },
          })
        }
      >
        Добавить продукт
      </button>
    </div>
  );
}

export function ContactsPanel({ content, onChange }: EditorProps) {
  return (
    <Card title="Контакты" actions={<Toggle label="Показывать блок" checked={content.contacts.visible} onChange={(visible) => onChange({ ...content, contacts: { ...content.contacts, visible } })} />}>
      <LocalizedPair label="Заголовок" value={content.contacts.title} onChange={(title) => onChange({ ...content, contacts: { ...content.contacts, title } })} />
      <LocalizedPair label="Описание" value={content.contacts.description} multiline onChange={(description) => onChange({ ...content, contacts: { ...content.contacts, description } })} />
      <LocalizedPair label="Название организации" value={content.contacts.companyName} onChange={(companyName) => onChange({ ...content, contacts: { ...content.contacts, companyName } })} />
      <LocalizedPair label="Подпись «Юридический адрес»" value={content.contacts.legalAddressLabel} onChange={(legalAddressLabel) => onChange({ ...content, contacts: { ...content.contacts, legalAddressLabel } })} />
      <LocalizedPair label="Юридический адрес" value={content.contacts.legalAddress} multiline onChange={(legalAddress) => onChange({ ...content, contacts: { ...content.contacts, legalAddress } })} />
      <LocalizedPair label="Подпись «Фактический адрес»" value={content.contacts.actualAddressLabel} onChange={(actualAddressLabel) => onChange({ ...content, contacts: { ...content.contacts, actualAddressLabel } })} />
      <LocalizedPair label="Фактический адрес" value={content.contacts.actualAddress} multiline onChange={(actualAddress) => onChange({ ...content, contacts: { ...content.contacts, actualAddress } })} />
      <p className="text-xs text-platinum">
        Для английской версии заполните поля EN. Если поле EN пустое, на английской странице показывается русский текст.
      </p>
      <TextField label="Email" value={content.contacts.email} onChange={(email) => onChange({ ...content, contacts: { ...content.contacts, email } })} />
      <TextField label="Телефон" value={content.contacts.phone} onChange={(phone) => onChange({ ...content, contacts: { ...content.contacts, phone } })} />
      <LocalizedPair label="Часы работы" value={content.contacts.workingHours} onChange={(workingHours) => onChange({ ...content, contacts: { ...content.contacts, workingHours } })} />
      <TextField label="Ссылка на карту (http/https)" value={content.contacts.mapUrl} onChange={(mapUrl) => onChange({ ...content, contacts: { ...content.contacts, mapUrl } })} />
      <TextField label="Telegram или другой канал (http/https)" value={content.contacts.telegramUrl} onChange={(telegramUrl) => onChange({ ...content, contacts: { ...content.contacts, telegramUrl } })} />
    </Card>
  );
}

export function SettingsPanel({ content, onChange, developmentPassword }: EditorProps & { developmentPassword: boolean }) {
  return (
    <div className="space-y-4">
      {developmentPassword ? (
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Сейчас используется development-only `ADMIN_PASSWORD`. Для production задайте `ADMIN_PASSWORD_HASH` и уберите открытый пароль.
        </p>
      ) : null}
      <Card title="Политика конфиденциальности">
        <LocalizedPair label="Подпись ссылки" value={content.footer.privacyPolicyLabel} onChange={(privacyPolicyLabel) => onChange({ ...content, footer: { ...content.footer, privacyPolicyLabel } })} />
        <TextField label="URL (http/https, пусто — скрыть)" value={content.footer.privacyPolicyUrl} onChange={(privacyPolicyUrl) => onChange({ ...content, footer: { ...content.footer, privacyPolicyUrl } })} />
      </Card>
      <Card title="Реестр российского ПО">
        <p className="text-sm text-mist">Не утверждайте включение в реестр, пока не указана карточка ПО.</p>
        <LocalizedPair label="Заголовок блока" value={content.documentation.registryTitle} onChange={(registryTitle) => onChange({ ...content, documentation: { ...content.documentation, registryTitle } })} />
        <LocalizedPair label="Описание блока" value={content.documentation.registryDescription} multiline onChange={(registryDescription) => onChange({ ...content, documentation: { ...content.documentation, registryDescription } })} />
        <LocalizedPair label="Подпись ссылки на реестр" value={content.documentation.registryLinkLabel} onChange={(registryLinkLabel) => onChange({ ...content, documentation: { ...content.documentation, registryLinkLabel } })} />
        <TextField label="URL реестра" value={content.documentation.registryLinkUrl} onChange={(registryLinkUrl) => onChange({ ...content, documentation: { ...content.documentation, registryLinkUrl } })} />
        <LocalizedPair label="Подпись карточки ПО" value={content.documentation.softwareCardLabel} onChange={(softwareCardLabel) => onChange({ ...content, documentation: { ...content.documentation, softwareCardLabel } })} />
        <TextField label="URL карточки ПО (если появится)" value={content.documentation.softwareCardUrl} onChange={(softwareCardUrl) => onChange({ ...content, documentation: { ...content.documentation, softwareCardUrl } })} />
      </Card>
    </div>
  );
}

export function DocumentationPanel({
  content,
  onChange,
  onUpload,
  onAddLink,
  onDelete,
  busy,
}: EditorProps & {
  onUpload: (file: File, meta: { titleRu: string; titleEn: string; descriptionRu: string; descriptionEn: string; published: boolean }) => void;
  onAddLink: (url: string, meta: { titleRu: string; titleEn: string; descriptionRu: string; descriptionEn: string; published: boolean }) => void;
  onDelete: (doc: ContentDocument) => void;
  busy: boolean;
}) {
  const documents = [...content.documentation.documents].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <Card title="Секция" actions={<Toggle label="Показывать блок" checked={content.documentation.visible} onChange={(visible) => onChange({ ...content, documentation: { ...content.documentation, visible } })} />}>
        <LocalizedPair label="Заголовок" value={content.documentation.title} onChange={(title) => onChange({ ...content, documentation: { ...content.documentation, title } })} />
        <LocalizedPair label="Описание" value={content.documentation.description} multiline onChange={(description) => onChange({ ...content, documentation: { ...content.documentation, description } })} />
      </Card>
      <UploadForms busy={busy} onUpload={onUpload} onAddLink={onAddLink} />
      {documents.map((doc, index) => (
        <Card
          key={doc.id}
          title={doc.title.ru || doc.originalName}
          actions={
            <SortRemove
              onUp={() => onChange({ ...content, documentation: { ...content.documentation, documents: moveItem(documents, index, -1) } })}
              onDown={() => onChange({ ...content, documentation: { ...content.documentation, documents: moveItem(documents, index, 1) } })}
              onRemove={() => onDelete(doc)}
            />
          }
        >
          <Toggle
            label="Опубликован"
            checked={doc.published}
            onChange={(published) =>
              onChange({
                ...content,
                documentation: {
                  ...content.documentation,
                  documents: documents.map((entry) => (entry.id === doc.id ? { ...entry, published } : entry)),
                },
              })
            }
          />
          <p className="text-xs text-mist">
            {doc.externalLink ? doc.fileUrl : `${doc.originalName} · ${doc.mimeType}`}
          </p>
          <LocalizedPair
            label="Название"
            value={doc.title}
            onChange={(title) =>
              onChange({
                ...content,
                documentation: {
                  ...content.documentation,
                  documents: documents.map((entry) => (entry.id === doc.id ? { ...entry, title } : entry)),
                },
              })
            }
          />
          <LocalizedPair
            label="Описание"
            value={doc.description}
            multiline
            onChange={(description) =>
              onChange({
                ...content,
                documentation: {
                  ...content.documentation,
                  documents: documents.map((entry) => (entry.id === doc.id ? { ...entry, description } : entry)),
                },
              })
            }
          />
        </Card>
      ))}
    </div>
  );
}

function UploadForms({
  busy,
  onUpload,
  onAddLink,
}: {
  busy: boolean;
  onUpload: (file: File, meta: { titleRu: string; titleEn: string; descriptionRu: string; descriptionEn: string; published: boolean }) => void;
  onAddLink: (url: string, meta: { titleRu: string; titleEn: string; descriptionRu: string; descriptionEn: string; published: boolean }) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form
        className="card space-y-3 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          const file = data.get("file");
          if (!(file instanceof File) || !file.size) return;
          onUpload(file, {
            titleRu: String(data.get("titleRu") || ""),
            titleEn: String(data.get("titleEn") || ""),
            descriptionRu: String(data.get("descriptionRu") || ""),
            descriptionEn: String(data.get("descriptionEn") || ""),
            published: data.get("published") === "on",
          });
          form.reset();
        }}
      >
        <h3 className="text-base font-medium text-white">Загрузить PDF / DOC / DOCX</h3>
        <input name="file" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="text-sm text-mist" required />
        <input name="titleRu" placeholder="Название RU" className="admin-input" />
        <input name="titleEn" placeholder="Title EN" className="admin-input" />
        <textarea name="descriptionRu" placeholder="Описание RU" className="admin-input" />
        <textarea name="descriptionEn" placeholder="Description EN" className="admin-input" />
        <label className="flex items-center gap-2 text-sm text-mist">
          <input type="checkbox" name="published" defaultChecked /> Опубликовать сразу
        </label>
        <button type="submit" className="btn-primary" disabled={busy}>
          Загрузить файл
        </button>
      </form>
      <form
        className="card space-y-3 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          const url = String(data.get("url") || "").trim();
          if (!url) return;
          onAddLink(url, {
            titleRu: String(data.get("titleRu") || ""),
            titleEn: String(data.get("titleEn") || ""),
            descriptionRu: String(data.get("descriptionRu") || ""),
            descriptionEn: String(data.get("descriptionEn") || ""),
            published: data.get("published") === "on",
          });
          form.reset();
        }}
      >
        <h3 className="text-base font-medium text-white">Внешняя ссылка</h3>
        <input name="url" placeholder="https://" className="admin-input" required />
        <input name="titleRu" placeholder="Название RU" className="admin-input" />
        <input name="titleEn" placeholder="Title EN" className="admin-input" />
        <textarea name="descriptionRu" placeholder="Описание RU" className="admin-input" />
        <textarea name="descriptionEn" placeholder="Description EN" className="admin-input" />
        <label className="flex items-center gap-2 text-sm text-mist">
          <input type="checkbox" name="published" defaultChecked /> Опубликовать сразу
        </label>
        <button type="submit" className="btn-primary" disabled={busy}>
          Добавить ссылку
        </button>
      </form>
    </div>
  );
}
