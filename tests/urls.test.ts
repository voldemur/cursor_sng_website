import { describe, expect, it } from "vitest";
import { safeDocumentHref, sanitizeHttpUrl, sanitizeMailto, sanitizeTel } from "@/lib/validation/urls";

describe("URL sanitization", () => {
  it("allows http(s) and blocks dangerous schemes", () => {
    expect(sanitizeHttpUrl("https://reestr.digital.gov.ru/")).toContain("https://reestr.digital.gov.ru/");
    expect(sanitizeHttpUrl("javascript:alert(1)")).toBe("");
    expect(sanitizeHttpUrl("data:text/html,hi")).toBe("");
    expect(sanitizeHttpUrl("/relative")).toBe("");
  });

  it("builds mailto and tel independently", () => {
    expect(sanitizeMailto("info@example.com")).toBe("mailto:info@example.com");
    expect(sanitizeTel("not-a-phone")).toBe("");
    expect(sanitizeTel("123")).toBe("");
    expect(sanitizeTel("+7 (000) 000-00-00")).toBe("tel:+7(000)000-00-00");
  });

  it("allows only internal document routes or http(s) externals", () => {
    expect(safeDocumentHref("/api/documents/abc_1", false)).toBe("/api/documents/abc_1");
    expect(safeDocumentHref("/api/documents/../etc", false)).toBe("");
    expect(safeDocumentHref("https://example.com/file.pdf", true)).toBe("https://example.com/file.pdf");
    expect(safeDocumentHref("javascript:alert(1)", true)).toBe("");
  });
});
