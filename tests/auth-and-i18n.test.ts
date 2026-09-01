import { afterEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { verifyAdminCredentials } from "@/lib/auth/password";
import { consumeRateLimit } from "@/lib/auth/rate-limit";
import { t } from "@/lib/i18n/text";
import { serializeJsonLd } from "@/lib/seo/json-ld";

describe("admin credentials", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts a matching development password outside production", async () => {
    vi.stubEnv("ADMIN_LOGIN", "admin");
    vi.stubEnv("ADMIN_PASSWORD", "correct-horse");
    vi.stubEnv("ADMIN_PASSWORD_HASH", "");
    expect(await verifyAdminCredentials("admin", "correct-horse")).toBe(true);
    expect(await verifyAdminCredentials("admin", "wrong")).toBe(false);
    expect(await verifyAdminCredentials("other", "correct-horse")).toBe(false);
  });

  it("prefers bcrypt hash when provided", async () => {
    const hash = await bcrypt.hash("hashed-secret", 4);
    vi.stubEnv("ADMIN_LOGIN", "admin");
    vi.stubEnv("ADMIN_PASSWORD_HASH", hash);
    vi.stubEnv("ADMIN_PASSWORD", "ignored-plaintext");
    expect(await verifyAdminCredentials("admin", "hashed-secret")).toBe(true);
    expect(await verifyAdminCredentials("admin", "ignored-plaintext")).toBe(false);
  });
});

describe("login rate limit", () => {
  it("blocks a key after the configured number of attempts", () => {
    const key = `test-${Math.random()}`;
    expect(consumeRateLimit(key, 2, 60_000)).toBe(true);
    expect(consumeRateLimit(key, 2, 60_000)).toBe(true);
    expect(consumeRateLimit(key, 2, 60_000)).toBe(false);
  });
});

describe("i18n fallback", () => {
  it("falls back to Russian when English is empty", () => {
    expect(t({ ru: "Платформа", en: "" }, "en")).toBe("Платформа");
    expect(t({ ru: "", en: "Platform" }, "ru")).toBe("Platform");
  });
});

describe("json-ld", () => {
  it("escapes < to avoid breaking out of the script tag", () => {
    expect(serializeJsonLd({ name: "</script><b>x" })).toContain("\\u003c/script>");
    expect(serializeJsonLd({ name: "</script><b>x" })).not.toContain("</script>");
  });
});
