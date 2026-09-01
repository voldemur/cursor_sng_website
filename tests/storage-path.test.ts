import path from "node:path";
import { describe, expect, it } from "vitest";
import { HttpError } from "@/lib/errors";
import { storedFilePath } from "@/lib/storage/documents";

describe("storedFilePath", () => {
  const root = path.resolve(process.cwd(), "storage", "documents");

  it("keeps files inside the documents directory", () => {
    const resolved = storedFilePath("abc123", "spec.pdf");
    expect(resolved).toBe(path.join(root, "abc123.pdf"));
    expect(path.relative(root, resolved).startsWith("..")).toBe(false);
  });

  it("rejects traversal in the document id", () => {
    expect(() => storedFilePath("../etc", "spec.pdf")).toThrow(HttpError);
    expect(() => storedFilePath("..", "spec.pdf")).toThrow(HttpError);
    expect(() => storedFilePath("abc/../x", "spec.pdf")).toThrow(HttpError);
  });

  it("does not follow a traversal original name outside storage", () => {
    const resolved = storedFilePath("safeid", "../../passwd.pdf");
    expect(path.relative(root, resolved)).toBe("safeid.pdf");
  });
});
