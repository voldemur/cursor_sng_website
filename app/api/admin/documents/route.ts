import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/auth/guard";
import { readContent, updateContent } from "@/lib/content/store";
import { HttpError } from "@/lib/errors";
import { externalDocumentFromUrl, removeStoredFile, saveUploadedDocument } from "@/lib/storage/documents";
import type { ContentDocument } from "@/types/content";

function nextOrder(orders: number[]): number {
  return orders.length ? Math.max(...orders) + 1 : 1;
}

function labelsFromForm(form: FormData) {
  return {
    titleRu: String(form.get("titleRu") || "").trim(),
    titleEn: String(form.get("titleEn") || "").trim(),
    descriptionRu: String(form.get("descriptionRu") || ""),
    descriptionEn: String(form.get("descriptionEn") || ""),
    published: String(form.get("published") || "") === "true",
  };
}

export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    const content = await readContent();
    return NextResponse.json(content.documentation.documents);
  });
}

export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    const form = await request.formData();
    const labels = labelsFromForm(form);
    const file = form.get("file");
    const externalUrl = String(form.get("url") || "").trim();

    let created: ContentDocument;
    let uploaded: { id: string; originalName: string } | null = null;

    if (file instanceof File && file.size > 0) {
      const stored = await saveUploadedDocument(file);
      uploaded = { id: stored.id, originalName: stored.originalName };
      created = {
        ...stored,
        title: {
          ru: labels.titleRu || stored.originalName,
          en: labels.titleEn || stored.originalName,
        },
        description: { ru: labels.descriptionRu, en: labels.descriptionEn },
        published: labels.published,
        order: 0,
      };
    } else if (externalUrl) {
      const stored = externalDocumentFromUrl(externalUrl, labels.titleRu || "Document");
      created = {
        ...stored,
        title: {
          ru: labels.titleRu || stored.title.ru,
          en: labels.titleEn || stored.title.en,
        },
        description: { ru: labels.descriptionRu, en: labels.descriptionEn },
        published: labels.published,
        order: 0,
      };
    } else {
      throw new HttpError(400, "File or external URL is required");
    }

    try {
      const content = await updateContent((current) => ({
        ...current,
        documentation: {
          ...current.documentation,
          documents: [
            ...current.documentation.documents,
            { ...created, order: nextOrder(current.documentation.documents.map((doc) => doc.order)) },
          ],
        },
      }));
      const saved = content.documentation.documents.find((doc) => doc.id === created.id);
      return NextResponse.json(saved, { status: 201 });
    } catch (error) {
      if (uploaded) {
        await removeStoredFile(uploaded.id, uploaded.originalName);
      }
      throw error;
    }
  });
}
