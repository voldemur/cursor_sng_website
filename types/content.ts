export type Locale = "ru" | "en";

export type LocalizedText = {
  ru: string;
  en: string;
};

export type ContentDocument = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  fileUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  published: boolean;
  order: number;
  externalLink: boolean;
};

export type AdvantageItem = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
  visible: boolean;
  order: number;
};

export type ProductItem = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  features: LocalizedText[];
  priceLabel: LocalizedText;
  ctaLabel: LocalizedText;
  visible: boolean;
  order: number;
};

export type SiteContent = {
  site: {
    name: LocalizedText;
    fullName: LocalizedText;
    description: LocalizedText;
    seoTitle: LocalizedText;
    seoDescription: LocalizedText;
  };
  navigation: {
    advantages: LocalizedText;
    about: LocalizedText;
    products: LocalizedText;
    documentation: LocalizedText;
    contacts: LocalizedText;
    cta: LocalizedText;
  };
  hero: {
    visible: boolean;
    eyebrow: LocalizedText;
    title: LocalizedText;
    description: LocalizedText;
    primaryCta: LocalizedText;
    secondaryCta: LocalizedText;
  };
  advantages: {
    visible: boolean;
    title: LocalizedText;
    description: LocalizedText;
    items: AdvantageItem[];
  };
  about: {
    title: LocalizedText;
    paragraphs: LocalizedText[];
    audienceTitle: LocalizedText;
    audienceItems: LocalizedText[];
    visible: boolean;
  };
  products: {
    visible: boolean;
    title: LocalizedText;
    description: LocalizedText;
    items: ProductItem[];
  };
  documentation: {
    title: LocalizedText;
    description: LocalizedText;
    registryTitle: LocalizedText;
    registryDescription: LocalizedText;
    registryLinkLabel: LocalizedText;
    registryLinkUrl: string;
    softwareCardLabel: LocalizedText;
    softwareCardUrl: string;
    documents: ContentDocument[];
    visible: boolean;
  };
  contacts: {
    title: LocalizedText;
    description: LocalizedText;
    companyName: LocalizedText;
    legalAddress: LocalizedText;
    legalAddressLabel: LocalizedText;
    actualAddress: LocalizedText;
    actualAddressLabel: LocalizedText;
    email: string;
    phone: string;
    workingHours: LocalizedText;
    mapUrl: string;
    telegramUrl: string;
    visible: boolean;
  };
  footer: {
    tagline: LocalizedText;
    copyright: LocalizedText;
    privacyPolicyLabel: LocalizedText;
    privacyPolicyUrl: string;
  };
};

export const LOCALES: Locale[] = ["ru", "en"];
export const DEFAULT_LOCALE: Locale = "ru";
