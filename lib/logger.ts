const SENSITIVE = /password|secret|cookie|authorization|token|hash/i;

export function logError(scope: string, error: unknown): void {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`[${scope}]`, message.replace(SENSITIVE, "[redacted]"));
}
