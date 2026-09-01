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
});
