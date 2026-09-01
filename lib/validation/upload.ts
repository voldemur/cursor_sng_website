export const ALLOWED_DOCUMENT_MIME: Record<string, string[]> = {
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const BLOCKED_EXTENSIONS = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".com",
  ".msi",
  ".scr",
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".php",
  ".py",
  ".sh",
  ".ps1",
  ".html",
  ".htm",
  ".svg",
  ".xml",
  ".zip",
  ".rar",
  ".7z",
  ".tar",
  ".gz",
  ".wasm",
]);

export function fileExtension(name: string): string {
  const index = name.lastIndexOf(".");
  if (index < 0) return "";
  return name.slice(index).toLowerCase();
}

export function isAllowedDocument(fileName: string, mimeType: string): boolean {
  const ext = fileExtension(fileName);
  if (!ext || BLOCKED_EXTENSIONS.has(ext)) return false;
  const allowed = ALLOWED_DOCUMENT_MIME[ext];
  if (!allowed) return false;
  if (!mimeType) return true;
  return allowed.includes(mimeType) || mimeType === "application/octet-stream";
}

export function looksLikePdf(buffer: Buffer): boolean {
  return buffer.subarray(0, 5).toString("utf8") === "%PDF-";
}

export function looksLikeZipContainer(buffer: Buffer): boolean {
  return buffer[0] === 0x50 && buffer[1] === 0x4b;
}

export function looksLikeOleDoc(buffer: Buffer): boolean {
  return (
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0
  );
}

export function validateDocumentBytes(ext: string, buffer: Buffer): boolean {
  if (buffer.length < 8) return false;
  if (ext === ".pdf") return looksLikePdf(buffer);
  if (ext === ".docx") return looksLikeZipContainer(buffer);
  if (ext === ".doc") return looksLikeOleDoc(buffer);
  return false;
}
