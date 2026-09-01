import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/auth/guard";
import { updateContent } from "@/lib/content/store";
import { HttpError } from "@/lib/errors";
import { removeStoredFile } from "@/lib/storage/documents";

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/admin/documents/[id]">) {
  const { id } = await ctx.params;
  return withAdmin(request, async () => {
    let removedName = "";
    let external = false;

    await updateContent((current) => {
      const found = current.documentation.documents.find((doc) => doc.id === id);
      if (!found) throw new HttpError(404, "Document not found");
      removedName = found.originalName;
      external = found.externalLink;
      return {
        ...current,
        documentation: {
          ...current.documentation,
          documents: current.documentation.documents.filter((doc) => doc.id !== id),
        },
      };
    });

    if (!external) {
      await removeStoredFile(id, removedName);
    }

    return NextResponse.json({ ok: true });
  });
}
