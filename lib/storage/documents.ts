import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { createReadStream } from "fs";
import { getMaxUploadBytes } from "@/lib/config";
import { HttpError } from "@/lib/errors";
import { fileExtension, isAllowedDocument, validateDocumentBytes } from "@/lib/validation/upload";
import { sanitizeHttpUrl } from "@/lib/validation/urls";
import type { ContentDocument } from "@/types/content";

const STORAGE_DIR = path.join(process.cwd(), "storage", "documents");

function assertSafeId(id: string): void {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new HttpError(400, "Invalid document id");
  }
}

export function storedFilePath(id: string, originalName: string): string {
  assertSafeId(id);
  const ext = fileExtension(originalName);
  if (!ext || ext.includes("/") || ext.includes("\\")) {
    throw new HttpError(400, "Invalid path");
  }
  const root = path.resolve(STORAGE_DIR);
  const resolved = path.resolve(root, `${id}${ext}`);
  const relative = path.relative(root, resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new HttpError(400, "Invalid path");
  }
  return resolved;
}

export async function saveUploadedDocument(file: File): Promise<Omit<ContentDocument, "title" | "description" | "published" | "order">> {
  if (file.size > getMaxUploadBytes()) {
    throw new HttpError(413, "File is too large");
  }

  const originalName = path.basename(file.name);
  if (!isAllowedDocument(originalName, file.type)) {
    throw new HttpError(400, "Unsupported file type");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > getMaxUploadBytes()) {
    throw new HttpError(413, "File is too large");
  }
  const ext = fileExtension(originalName);
  if (!validateDocumentBytes(ext, buffer)) {
    throw new HttpError(400, "File contents do not match the declared type");
  }

  const id = nanoid();
  await mkdir(STORAGE_DIR, { recursive: true });
  const target = storedFilePath(id, originalName);
  await writeFile(target, buffer);

  return {
    id,
    fileUrl: `/api/documents/${id}`,
    originalName,
    mimeType: file.type || "application/octet-stream",
    size: buffer.length,
    uploadedAt: new Date().toISOString(),
    externalLink: false,
  };
}

export async function removeStoredFile(id: string, originalName: string): Promise<void> {
  try {
    await unlink(storedFilePath(id, originalName));
  } catch {
    // Missing file should not block metadata cleanup.
  }
}

export function openStoredFile(id: string, originalName: string) {
  return createReadStream(storedFilePath(id, originalName));
}

export function externalDocumentFromUrl(url: string, titleRu: string): Omit<ContentDocument, "published" | "order"> {
  const safeUrl = sanitizeHttpUrl(url);
  if (!safeUrl) throw new HttpError(400, "Invalid URL");
  const id = nanoid();
  return {
    id,
    title: { ru: titleRu, en: titleRu },
    description: { ru: "", en: "" },
    fileUrl: safeUrl,
    originalName: safeUrl,
    mimeType: "text/uri-list",
    size: 0,
    uploadedAt: new Date().toISOString(),
    externalLink: true,
  };
}
