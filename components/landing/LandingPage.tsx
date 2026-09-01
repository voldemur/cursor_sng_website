import { ArrowUpRight, FileText, Mail, MapPin, Phone } from "lucide-react";
import { AdvantageIcon } from "@/components/landing/AdvantageIcon";
import { FadeIn } from "@/components/landing/FadeIn";
import { emailHref, phoneHref, safeDocumentHref, sanitizeHttpUrl } from "@/lib/validation/urls";
import { t } from "@/lib/i18n/text";
import type { Locale, SiteContent } from "@/types/content";

function formatBytes(size: number, locale: Locale): string {
  if (!size) return "";
  const units = locale === "ru" ? ["Б", "КБ", "МБ"] : ["B", "KB", "MB"];
  let value = size;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function LandingPage({ locale, content }: { locale: Locale; content: SiteContent }) {
  const registryUrl = sanitizeHttpUrl(content.documentation.registryLinkUrl);
  const cardUrl = sanitizeHttpUrl(content.documentation.softwareCardUrl);
  const mapUrl = sanitizeHttpUrl(content.contacts.mapUrl);
  const telegramUrl = sanitizeHttpUrl(content.contacts.telegramUrl);
  const mail = emailHref(content.contacts.email);
  const tel = phoneHref(content.contacts.phone);

  return (
    <main id="top">
      {content.hero.visible ? (
        <section className="relative overflow-hidden border-b border-white/8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,140,255,0.16),transparent_42%),linear-gradient(180deg,#0b0d11_0%,#10131a_100%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
            <p className="text-xs font-medium tracking-[0.28em] text-platinum uppercase">
              {t(content.hero.eyebrow, locale)}
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.05]">
              {t(content.hero.title, locale)}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-mist">{t(content.hero.description, locale)}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#products" className="btn-primary">
                {t(content.hero.primaryCta, locale)}
              </a>
              <a href="#documentation" className="btn-secondary">
                {t(content.hero.secondaryCta, locale)}
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {content.advantages.visible ? (
        <section id="advantages" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <FadeIn>
            <h2 className="text-3xl font-semibold tracking-tight text-white">{t(content.advantages.title, locale)}</h2>
            <p className="mt-4 max-w-2xl text-mist">{t(content.advantages.description, locale)}</p>
          </FadeIn>
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {content.advantages.items.map((item) => (
              <FadeIn key={item.id}>
                <article className="card h-full p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                    <AdvantageIcon name={item.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-medium text-white">{t(item.title, locale)}</h3>
                  <p className="mt-2 text-sm leading-6 text-mist">{t(item.description, locale)}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </section>
      ) : null}

      {content.about.visible ? (
        <section id="about" className="border-y border-white/8 bg-white/[0.02]">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
            <FadeIn>
              <h2 className="text-3xl font-semibold tracking-tight text-white">{t(content.about.title, locale)}</h2>
              <div className="mt-6 space-y-5 text-mist">
                {content.about.paragraphs.map((paragraph, index) => (
                  <p key={index} className="leading-7">
                    {t(paragraph, locale)}
                  </p>
                ))}
              </div>
            </FadeIn>
            <FadeIn>
              <div className="card p-6">
                <h3 className="text-sm tracking-[0.2em] text-platinum uppercase">
                  {t(content.about.audienceTitle, locale)}
                </h3>
                <ul className="mt-5 space-y-3 text-sm text-white">
                  {content.about.audienceItems.map((item, index) => (
                    <li key={index} className="border-b border-white/8 pb-3 last:border-0">
                      {t(item, locale)}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </section>
      ) : null}

      {content.products.visible ? (
        <section id="products" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <FadeIn>
            <h2 className="text-3xl font-semibold tracking-tight text-white">{t(content.products.title, locale)}</h2>
            <p className="mt-4 max-w-2xl text-mist">{t(content.products.description, locale)}</p>
          </FadeIn>
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {content.products.items.map((product) => (
              <FadeIn key={product.id}>
                <article className="card flex h-full flex-col p-6">
                  <h3 className="text-xl font-medium text-white">{t(product.title, locale)}</h3>
                  <p className="mt-3 text-sm leading-6 text-mist">{t(product.description, locale)}</p>
                  <ul className="mt-5 space-y-2 text-sm text-platinum">
                    {product.features.map((feature, index) => (
                      <li key={index}>— {t(feature, locale)}</li>
                    ))}
                  </ul>
                  <p className="mt-6 text-sm text-mist">{t(product.priceLabel, locale)}</p>
                  <a href="#contacts" className="btn-secondary mt-auto w-fit">
                    {t(product.ctaLabel, locale)}
                  </a>
                </article>
              </FadeIn>
            ))}
          </div>
        </section>
      ) : null}

      {content.documentation.visible ? (
        <section id="documentation" className="border-y border-white/8 bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <FadeIn>
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                {t(content.documentation.title, locale)}
              </h2>
              <p className="mt-4 max-w-3xl text-mist">{t(content.documentation.description, locale)}</p>
            </FadeIn>
            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              <FadeIn>
                <article className="card p-6">
                  <h3 className="text-lg font-medium text-white">{t(content.documentation.registryTitle, locale)}</h3>
                  <p className="mt-3 text-sm leading-6 text-mist">
                    {t(content.documentation.registryDescription, locale)}
                  </p>
                  {registryUrl ? (
                    <a
                      href={registryUrl}
                      className="mt-5 inline-flex items-center gap-2 text-sm text-accent hover:underline"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {t(content.documentation.registryLinkLabel, locale)}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  ) : null}
                  {cardUrl ? (
                    <div className="mt-3">
                      <a
                        href={cardUrl}
                        className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {t(content.documentation.softwareCardLabel, locale)}
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </a>
                    </div>
                  ) : null}
                </article>
              </FadeIn>
              {content.documentation.documents.map((doc) => {
                const href = safeDocumentHref(doc.fileUrl, doc.externalLink);
                return (
                <FadeIn key={doc.id}>
                  <article className="card p-6">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 text-accent" size={18} aria-hidden="true" />
                      <div>
                        <h3 className="font-medium text-white">{t(doc.title, locale)}</h3>
                        <p className="mt-2 text-sm text-mist">{t(doc.description, locale)}</p>
                        <p className="mt-2 text-xs text-platinum">
                          {doc.externalLink
                            ? "URL"
                            : `${doc.originalName}${doc.size ? ` · ${formatBytes(doc.size, locale)}` : ""}`}
                        </p>
                        {href ? (
                            <a
                              href={href}
                              className="mt-4 inline-flex text-sm text-accent hover:underline"
                              rel={doc.externalLink ? "noopener noreferrer" : undefined}
                              target={doc.externalLink ? "_blank" : undefined}
                            >
                              {locale === "ru" ? "Открыть документ" : "Open document"}
                            </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                </FadeIn>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {content.contacts.visible ? (
        <section id="contacts" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <FadeIn>
            <h2 className="text-3xl font-semibold tracking-tight text-white">{t(content.contacts.title, locale)}</h2>
            <p className="mt-4 max-w-2xl text-mist">{t(content.contacts.description, locale)}</p>
          </FadeIn>
          <div className="card mt-10 grid gap-8 p-6 md:grid-cols-2">
            <div className="space-y-4 text-sm">
              <p className="text-lg text-white">{content.contacts.companyName}</p>
              <p className="flex gap-2 text-mist">
                <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  {locale === "ru" ? "Юридический адрес" : "Legal address"}: {content.contacts.legalAddress}
                </span>
              </p>
              <p className="flex gap-2 text-mist">
                <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  {locale === "ru" ? "Фактический адрес" : "Actual address"}: {content.contacts.actualAddress}
                </span>
              </p>
              <p className="text-mist">{t(content.contacts.workingHours, locale)}</p>
            </div>
            <div className="space-y-3 text-sm">
              {mail ? (
                <a className="flex items-center gap-2 text-white hover:text-accent" href={mail}>
                  <Mail size={16} aria-hidden="true" /> {content.contacts.email}
                </a>
              ) : null}
              {tel ? (
                <a className="flex items-center gap-2 text-white hover:text-accent" href={tel}>
                  <Phone size={16} aria-hidden="true" /> {content.contacts.phone}
                </a>
              ) : null}
              {telegramUrl ? (
                <a
                  className="inline-flex text-accent hover:underline"
                  href={telegramUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Telegram
                </a>
              ) : null}
              {mapUrl ? (
                <a
                  className="inline-flex text-accent hover:underline"
                  href={mapUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {locale === "ru" ? "Открыть карту" : "Open map"}
                </a>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
