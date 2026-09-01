import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { readSessionLogin } from "@/lib/auth/session";
import { readContent } from "@/lib/content/store";
import { storedFilePath } from "@/lib/storage/documents";

function disposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]+/g, "_").replace(/["\\]/g, "_") || "document";
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/documents/[id]">) {
  const { id } = await ctx.params;
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const content = await readContent();
  const doc = content.documentation.documents.find((item) => item.id === id);
  if (!doc || doc.externalLink) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!doc.published) {
    const login = await readSessionLogin();
    if (!login) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  try {
    const bytes = await readFile(storedFilePath(id, doc.originalName));
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": doc.mimeType || "application/octet-stream",
        "Content-Length": String(bytes.length),
        "Content-Disposition": disposition(doc.originalName),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": doc.published ? "private, max-age=300" : "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
