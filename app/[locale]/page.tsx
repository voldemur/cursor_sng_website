import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { readPublicContent } from "@/lib/content/public";
import { getSiteUrl } from "@/lib/config";
import { isLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/text";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import { LOCALES, type Locale } from "@/types/content";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const content = await readPublicContent();
  const title = t(content.site.seoTitle, locale);
  const description = t(content.site.seoDescription, locale);
  const url = `${getSiteUrl()}/${locale}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ru: `${getSiteUrl()}/ru`,
        en: `${getSiteUrl()}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      locale: locale === "ru" ? "ru_RU" : "en_US",
      siteName: t(content.site.name, locale),
      type: "website",
    },
  };
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = await readPublicContent();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: t(content.site.name, locale),
    description: t(content.site.description, locale),
    applicationCategory: "FinanceApplication",
    inLanguage: locale,
    url: `${getSiteUrl()}/${locale}`,
  };

  return (
    <div className="min-h-full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <SiteHeader locale={locale} content={content} />
      <LandingPage locale={locale} content={content} />
      <SiteFooter locale={locale} content={content} />
    </div>
  );
}
