export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function publicErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpError) return error.message;
  return fallback;
}
