import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/auth/guard";
import { readContent, writeContent } from "@/lib/content/store";
import { readJsonBody } from "@/lib/http/json";
import { siteContentSchema } from "@/lib/validation/content";

export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    const content = await readContent();
    return NextResponse.json(content);
  });
}

export async function PUT(request: NextRequest) {
  return withAdmin(request, async () => {
    const parsed = siteContentSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid content payload" }, { status: 400 });
    }
    await writeContent(parsed.data);
    return NextResponse.json(parsed.data);
  });
}
