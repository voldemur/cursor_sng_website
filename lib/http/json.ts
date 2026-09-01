import { NextRequest } from "next/server";
import { JSON_BODY_LIMIT_BYTES } from "@/lib/config";
import { HttpError } from "@/lib/errors";

export async function readJsonBody<T>(request: NextRequest): Promise<T> {
  const length = Number(request.headers.get("content-length") || "0");
  if (length > JSON_BODY_LIMIT_BYTES) {
    throw new HttpError(413, "Payload too large");
  }
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > JSON_BODY_LIMIT_BYTES) {
    throw new HttpError(413, "Payload too large");
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
}
