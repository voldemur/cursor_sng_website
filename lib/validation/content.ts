import { z } from "zod";
import { sanitizeHttpUrl } from "@/lib/validation/urls";
import type { LocalizedText } from "@/types/content";

export const localizedTextSchema = z.object({
  ru: z.string(),
  en: z.string(),
});

/**
 * Accepts the current `{ ru, en }` shape and also the legacy plain-string shape
 * used before contact details became bilingual. Legacy values are kept as the
 * Russian variant so existing installations keep working after the upgrade.
 */
export const localizedTextOrLegacySchema = z
  .unknown()
  .transform((value, ctx): LocalizedText => {
    if (typeof value === "string") return { ru: value, en: "" };
    const parsed = localizedTextSchema.safeParse(value);
    if (!parsed.success) {
      ctx.addIssue({ code: "custom", message: "Expected localized text or a plain string" });
      return { ru: "", en: "" };
    }
    return parsed.data;
  });

const httpUrlOrEmpty = z.string().transform((value) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return sanitizeHttpUrl(trimmed);
});

const internalDocumentUrl = /^\/api\/documents\/[a-zA-Z0-9_-]+$/;

export const documentSchema = z
  .object({
    id: z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/),
    title: localizedTextSchema,
    description: localizedTextSchema,
    fileUrl: z.string().max(2000),
    originalName: z.string().max(255),
    mimeType: z.string().max(200),
    size: z.number().int().nonnegative(),
    uploadedAt: z.string().max(40),
    published: z.boolean(),
    order: z.number().int(),
    externalLink: z.boolean(),
  })
  .superRefine((doc, ctx) => {
    if (doc.externalLink) {
      if (!sanitizeHttpUrl(doc.fileUrl)) {
        ctx.addIssue({ code: "custom", message: "External document URL must be http(s)", path: ["fileUrl"] });
      }
      return;
    }
    if (!internalDocumentUrl.test(doc.fileUrl)) {
      ctx.addIssue({ code: "custom", message: "Stored document URL is invalid", path: ["fileUrl"] });
    }
  });

export const advantageSchema = z.object({
  id: z.string().min(1).max(80),
  title: localizedTextSchema,
  description: localizedTextSchema,
  icon: z.string().max(40),
  visible: z.boolean(),
  order: z.number().int(),
});

export const productSchema = z.object({
  id: z.string().min(1).max(80),
  title: localizedTextSchema,
  description: localizedTextSchema,
  features: z.array(localizedTextSchema).max(20),
  priceLabel: localizedTextSchema,
  ctaLabel: localizedTextSchema,
  visible: z.boolean(),
  order: z.number().int(),
});

export const siteContentSchema = z.object({
  site: z.object({
    name: localizedTextSchema,
    fullName: localizedTextSchema,
    description: localizedTextSchema,
    seoTitle: localizedTextSchema,
    seoDescription: localizedTextSchema,
  }),
  navigation: z.object({
    advantages: localizedTextSchema,
    about: localizedTextSchema,
    products: localizedTextSchema,
    documentation: localizedTextSchema,
    contacts: localizedTextSchema,
    cta: localizedTextSchema,
  }),
  hero: z.object({
    visible: z.boolean(),
    eyebrow: localizedTextSchema,
    title: localizedTextSchema,
    description: localizedTextSchema,
    primaryCta: localizedTextSchema,
    secondaryCta: localizedTextSchema,
  }),
  advantages: z.object({
    visible: z.boolean(),
    title: localizedTextSchema,
    description: localizedTextSchema,
    items: z.array(advantageSchema).max(20),
  }),
  about: z.object({
    title: localizedTextSchema,
    paragraphs: z.array(localizedTextSchema).max(20),
    audienceTitle: localizedTextSchema,
    audienceItems: z.array(localizedTextSchema).max(20),
    visible: z.boolean(),
  }),
  products: z.object({
    visible: z.boolean(),
    title: localizedTextSchema,
    description: localizedTextSchema,
    items: z.array(productSchema).max(20),
  }),
  documentation: z.object({
    title: localizedTextSchema,
    description: localizedTextSchema,
    registryTitle: localizedTextSchema,
    registryDescription: localizedTextSchema,
    registryLinkLabel: localizedTextSchema,
    registryLinkUrl: httpUrlOrEmpty,
    softwareCardLabel: localizedTextSchema,
    softwareCardUrl: httpUrlOrEmpty,
    documents: z.array(documentSchema).max(100),
    visible: z.boolean(),
  }),
  contacts: z.object({
    title: localizedTextSchema,
    description: localizedTextSchema,
    companyName: localizedTextOrLegacySchema,
    legalAddress: localizedTextOrLegacySchema,
    legalAddressLabel: localizedTextSchema.default({ ru: "Юридический адрес", en: "Legal address" }),
    actualAddress: localizedTextOrLegacySchema,
    actualAddressLabel: localizedTextSchema.default({ ru: "Фактический адрес", en: "Actual address" }),
    email: z.string().max(200),
    phone: z.string().max(80),
    workingHours: localizedTextSchema,
    mapUrl: httpUrlOrEmpty,
    telegramUrl: httpUrlOrEmpty,
    visible: z.boolean(),
  }),
  footer: z.object({
    tagline: localizedTextSchema,
    copyright: localizedTextSchema,
    privacyPolicyLabel: localizedTextSchema,
    privacyPolicyUrl: httpUrlOrEmpty,
  }),
});

export type SiteContentInput = z.infer<typeof siteContentSchema>;
