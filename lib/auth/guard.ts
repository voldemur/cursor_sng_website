import { NextResponse } from "next/server";
import { assertMutationProtection } from "@/lib/auth/csrf";
import { requireSession } from "@/lib/auth/session";
import { HttpError } from "@/lib/errors";
import { logError } from "@/lib/logger";

export async function withAdmin(request: Request, handler: () => Promise<Response>): Promise<Response> {
  try {
    await requireSession();
    assertMutationProtection(request);
    return await handler();
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logError("admin-api", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
