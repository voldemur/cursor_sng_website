import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { siteContentSchema } from "@/lib/validation/content";

const fixture = JSON.parse(readFileSync(path.join(process.cwd(), "data/content.json"), "utf8"));

describe("site content schema", () => {
  it("accepts the shipped content.json", () => {
    const parsed = siteContentSchema.safeParse(fixture);
    expect(parsed.success).toBe(true);
  });

  it("rejects javascript URLs on external documents", () => {
    const payload = structuredClone(fixture);
    payload.documentation.documents = [
      {
        id: "doc1",
        title: { ru: "x", en: "x" },
        description: { ru: "", en: "" },
        fileUrl: "javascript:alert(1)",
        originalName: "x",
        mimeType: "text/uri-list",
        size: 0,
        uploadedAt: new Date().toISOString(),
        published: true,
        order: 1,
        externalLink: true,
      },
    ];
    expect(siteContentSchema.safeParse(payload).success).toBe(false);
  });

  it("rejects stored files with path-like URLs", () => {
    const payload = structuredClone(fixture);
    payload.documentation.documents = [
      {
        id: "doc1",
        title: { ru: "x", en: "x" },
        description: { ru: "", en: "" },
        fileUrl: "/api/documents/../../secret",
        originalName: "note.pdf",
        mimeType: "application/pdf",
        size: 12,
        uploadedAt: new Date().toISOString(),
        published: true,
        order: 1,
        externalLink: false,
      },
    ];
    expect(siteContentSchema.safeParse(payload).success).toBe(false);
  });

  it("keeps bilingual company details in the shipped content", () => {
    const { contacts } = siteContentSchema.parse(fixture);
    for (const field of ["companyName", "legalAddress", "actualAddress"] as const) {
      expect(typeof contacts[field].ru).toBe("string");
      expect(typeof contacts[field].en).toBe("string");
      expect(contacts[field].ru.length).toBeGreaterThan(0);
      expect(contacts[field].en.length).toBeGreaterThan(0);
    }
  });

  it("migrates legacy plain-string company details to the Russian variant", () => {
    const payload = structuredClone(fixture);
    payload.contacts.companyName = "ООО «Пример»";
    payload.contacts.legalAddress = "Москва, ул. Примерная, д. 1";
    payload.contacts.actualAddress = "Москва, ул. Примерная, д. 1";
    delete payload.contacts.legalAddressLabel;
    delete payload.contacts.actualAddressLabel;

    const parsed = siteContentSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.contacts.companyName).toEqual({ ru: "ООО «Пример»", en: "" });
    expect(parsed.data.contacts.legalAddress).toEqual({ ru: "Москва, ул. Примерная, д. 1", en: "" });
    expect(parsed.data.contacts.actualAddress).toEqual({ ru: "Москва, ул. Примерная, д. 1", en: "" });
    expect(parsed.data.contacts.legalAddressLabel).toEqual({ ru: "Юридический адрес", en: "Legal address" });
    expect(parsed.data.contacts.actualAddressLabel).toEqual({ ru: "Фактический адрес", en: "Actual address" });
  });
});
