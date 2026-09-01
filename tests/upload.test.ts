import { describe, expect, it } from "vitest";
import { isAllowedDocument, validateDocumentBytes } from "@/lib/validation/upload";

describe("document upload validation", () => {
  it("accepts PDF, DOC and DOCX names", () => {
    expect(isAllowedDocument("a.pdf", "application/pdf")).toBe(true);
    expect(isAllowedDocument("a.doc", "application/msword")).toBe(true);
    expect(isAllowedDocument("a.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe(
      true,
    );
  });

  it("rejects executables, scripts, HTML, SVG and archives", () => {
    expect(isAllowedDocument("payload.exe", "application/octet-stream")).toBe(false);
    expect(isAllowedDocument("run.js", "text/javascript")).toBe(false);
    expect(isAllowedDocument("page.html", "text/html")).toBe(false);
    expect(isAllowedDocument("icon.svg", "image/svg+xml")).toBe(false);
    expect(isAllowedDocument("pack.zip", "application/zip")).toBe(false);
  });

  it("rejects PDF extension when bytes are not a PDF", () => {
    const html = Buffer.from("<html>not a pdf</html>");
    expect(validateDocumentBytes(".pdf", html)).toBe(false);
  });

  it("accepts a PDF header", () => {
    expect(validateDocumentBytes(".pdf", Buffer.from("%PDF-1.7 extra"))).toBe(true);
  });
});
