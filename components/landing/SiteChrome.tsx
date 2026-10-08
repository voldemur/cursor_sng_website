"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import { t } from "@/lib/i18n/text";
import { emailHref, phoneHref, sanitizeHttpUrl } from "@/lib/validation/urls";
import type { Locale, SiteContent } from "@/types/content";

const LINKS = [
  { id: "advantages", key: "advantages" as const },
  { id: "about", key: "about" as const },
  { id: "products", key: "products" as const },
  { id: "documentation", key: "documentation" as const },
  { id: "contacts", key: "contacts" as const },
];

export function SiteHeader({ locale, content }: { locale: Locale; content: SiteContent }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0b0d11]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href={`/${locale}#top`} className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 font-semibold text-accent">
            Σ
          </span>
          <span className="text-sm font-semibold tracking-[0.18em] text-white uppercase">
            {t(content.site.name, locale)}
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm text-mist lg:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <a key={link.id} href={`#${link.id}`} className="transition hover:text-white">
              {t(content.navigation[link.key], locale)}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher locale={locale} />
          <a href="#contacts" className="btn-primary">
            {t(content.navigation.cta, locale)}
          </a>
        </div>
        <button
          type="button"
          className="rounded-lg border border-white/10 p-2 text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open ? (
        <div id="mobile-nav" className="border-t border-white/8 px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3 text-sm" aria-label="Mobile">
            {LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="text-mist hover:text-white"
                onClick={() => setOpen(false)}
              >
                {t(content.navigation[link.key], locale)}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between gap-3">
            <LanguageSwitcher locale={locale} />
            <a href="#contacts" className="btn-primary" onClick={() => setOpen(false)}>
              {t(content.navigation.cta, locale)}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter({ locale, content }: { locale: Locale; content: SiteContent }) {
  const mail = emailHref(content.contacts.email);
  const tel = phoneHref(content.contacts.phone);
  const privacy = sanitizeHttpUrl(content.footer.privacyPolicyUrl);

  return (
    <footer className="border-t border-white/8 bg-[#08090c]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-sm font-semibold tracking-[0.18em] text-white uppercase">
            {t(content.site.name, locale)}
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-mist">{t(content.footer.tagline, locale)}</p>
        </div>
        <div>
          <p className="text-xs tracking-widest text-platinum uppercase">Nav</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-mist">
            {LINKS.map((link) => (
              <a key={link.id} href={`#${link.id}`} className="hover:text-white">
                {t(content.navigation[link.key], locale)}
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs tracking-widest text-platinum uppercase">
            {t(content.navigation.contacts, locale)}
          </p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-mist">
            <span>{t(content.contacts.companyName, locale)}</span>
            {mail ? (
              <a className="hover:text-white" href={mail}>
                {content.contacts.email}
              </a>
            ) : null}
            {tel ? (
              <a className="hover:text-white" href={tel}>
                {content.contacts.phone}
              </a>
            ) : null}
            <LanguageSwitcher locale={locale} />
            {privacy ? (
              <a
                className="hover:text-white"
                href={privacy}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t(content.footer.privacyPolicyLabel, locale)}
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 px-4 py-4 text-center text-xs text-mist">
        {t(content.footer.copyright, locale)}
      </div>
    </footer>
  );
}
