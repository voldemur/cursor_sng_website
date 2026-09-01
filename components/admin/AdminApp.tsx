"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AboutPanel,
  AdvantagesPanel,
  ContactsPanel,
  DocumentationPanel,
  HeroPanel,
  ProductsPanel,
  SettingsPanel,
  SitePanel,
} from "@/components/admin/panels";
import { adminFetch, adminJson } from "@/components/admin/api";
import { Toasts, type ToastItem } from "@/components/admin/toasts";
import type { ContentDocument, SiteContent } from "@/types/content";

const TABS = [
  { id: "site", label: "Основная информация" },
  { id: "hero", label: "Hero" },
  { id: "advantages", label: "Преимущества" },
  { id: "about", label: "Компания" },
  { id: "products", label: "Продукты и услуги" },
  { id: "docs", label: "Документация" },
  { id: "contacts", label: "Контакты" },
  { id: "settings", label: "Настройки" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminApp({
  initial,
  developmentPassword,
}: {
  initial: SiteContent;
  developmentPassword: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [tab, setTab] = useState<TabId>("site");
  const [saving, setSaving] = useState(false);
  const [busyDocs, setBusyDocs] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [pendingDelete, setPendingDelete] = useState<ContentDocument | null>(null);

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);

  const pushToast = useCallback((kind: ToastItem["kind"], message: string) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, kind, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    void adminFetch("/api/admin/session");
  }, []);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  async function save() {
    setSaving(true);
    try {
      const next = await adminJson<SiteContent>("/api/admin/content", {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      setSaved(next);
      setDraft(next);
      pushToast("ok", "Изменения сохранены");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось сохранить";
      if (message === "Unauthorized") {
        router.replace("/admin/login");
        return;
      }
      pushToast("err", message);
    } finally {
      setSaving(false);
    }
  }

  function insertDocument(doc: ContentDocument) {
    setDraft((current) => ({
      ...current,
      documentation: { ...current.documentation, documents: [...current.documentation.documents, doc] },
    }));
    setSaved((current) => ({
      ...current,
      documentation: { ...current.documentation, documents: [...current.documentation.documents, doc] },
    }));
  }

  async function upload(file: File, meta: { titleRu: string; titleEn: string; descriptionRu: string; descriptionEn: string; published: boolean }) {
    setBusyDocs(true);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("titleRu", meta.titleRu);
      body.set("titleEn", meta.titleEn);
      body.set("descriptionRu", meta.descriptionRu);
      body.set("descriptionEn", meta.descriptionEn);
      body.set("published", String(meta.published));
      const doc = await adminJson<ContentDocument>("/api/admin/documents", { method: "POST", body });
      insertDocument(doc);
      pushToast("ok", "Файл загружен");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Загрузка не удалась";
      if (message === "Unauthorized") {
        router.replace("/admin/login");
        return;
      }
      pushToast("err", message);
    } finally {
      setBusyDocs(false);
    }
  }

  async function addLink(url: string, meta: { titleRu: string; titleEn: string; descriptionRu: string; descriptionEn: string; published: boolean }) {
    setBusyDocs(true);
    try {
      const body = new FormData();
      body.set("url", url);
      body.set("titleRu", meta.titleRu);
      body.set("titleEn", meta.titleEn);
      body.set("descriptionRu", meta.descriptionRu);
      body.set("descriptionEn", meta.descriptionEn);
      body.set("published", String(meta.published));
      const doc = await adminJson<ContentDocument>("/api/admin/documents", { method: "POST", body });
      insertDocument(doc);
      pushToast("ok", "Ссылка добавлена");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось добавить ссылку";
      if (message === "Unauthorized") {
        router.replace("/admin/login");
        return;
      }
      pushToast("err", message);
    } finally {
      setBusyDocs(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setBusyDocs(true);
    try {
      await adminJson(`/api/admin/documents/${id}`, { method: "DELETE" });
      const drop = (content: SiteContent): SiteContent => ({
        ...content,
        documentation: {
          ...content.documentation,
          documents: content.documentation.documents.filter((doc) => doc.id !== id),
        },
      });
      setDraft(drop);
      setSaved(drop);
      setPendingDelete(null);
      pushToast("ok", "Документ удалён");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось удалить";
      if (message === "Unauthorized") {
        router.replace("/admin/login");
        return;
      }
      pushToast("err", message);
    } finally {
      setBusyDocs(false);
    }
  }

  async function logout() {
    if (dirty && !window.confirm("Есть несохранённые изменения. Выйти?")) return;
    await adminFetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-white/8 bg-[#08090c] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-4 py-4 lg:block">
          <p className="text-xs font-semibold tracking-[0.2em] text-white uppercase">SigmatNG Admin</p>
          <p className="hidden text-xs text-mist lg:mt-2 lg:block">{dirty ? "Есть несохранённые изменения" : "Все изменения сохранены"}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:overflow-visible" aria-label="Разделы админки">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap ${
                tab === item.id ? "bg-white/10 text-white" : "text-mist hover:text-white"
              }`}
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-white/8 bg-[#0b0d11]/90 px-4 py-3 backdrop-blur-xl">
          <div>
            <h1 className="text-lg font-medium text-white">Редактирование сайта</h1>
            {dirty ? <p className="text-xs text-accent">Несохранённые изменения</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <a className="btn-secondary" href="/ru" target="_blank" rel="noreferrer">
              Предпросмотр
            </a>
            <button type="button" className="btn-secondary" disabled={!dirty || saving} onClick={() => setDraft(saved)}>
              Отменить изменения
            </button>
            <button type="button" className="btn-primary" disabled={!dirty || saving} onClick={() => void save()}>
              {saving ? "Сохранение…" : "Сохранить"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => void logout()}>
              Выйти
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-4 py-6">
          {tab === "site" ? <SitePanel content={draft} onChange={setDraft} /> : null}
          {tab === "hero" ? <HeroPanel content={draft} onChange={setDraft} /> : null}
          {tab === "advantages" ? <AdvantagesPanel content={draft} onChange={setDraft} /> : null}
          {tab === "about" ? <AboutPanel content={draft} onChange={setDraft} /> : null}
          {tab === "products" ? <ProductsPanel content={draft} onChange={setDraft} /> : null}
          {tab === "docs" ? (
            <DocumentationPanel
              content={draft}
              onChange={setDraft}
              busy={busyDocs}
              onUpload={(file, meta) => void upload(file, meta)}
              onAddLink={(url, meta) => void addLink(url, meta)}
              onDelete={setPendingDelete}
            />
          ) : null}
          {tab === "contacts" ? <ContactsPanel content={draft} onChange={setDraft} /> : null}
          {tab === "settings" ? <SettingsPanel content={draft} onChange={setDraft} developmentPassword={developmentPassword} /> : null}
        </div>
      </div>
      {pendingDelete ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="card max-w-md p-6">
            <h2 id="delete-title" className="text-lg text-white">
              Удалить документ?
            </h2>
            <p className="mt-2 text-sm text-mist">{pendingDelete.title.ru || pendingDelete.originalName}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setPendingDelete(null)}>
                Отмена
              </button>
              <button type="button" className="btn-primary" disabled={busyDocs} onClick={() => void confirmDelete()}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <Toasts items={toasts} onDismiss={dismissToast} />
    </div>
  );
}
