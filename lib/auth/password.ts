import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";
import { isProduction } from "@/lib/config";

const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8x3KqGq0oGwqO1q1q1q1q1q1q1q1q";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, Buffer.alloc(left.length));
    return false;
  }
  return timingSafeEqual(left, right);
}

export async function verifyAdminCredentials(login: string, password: string): Promise<boolean> {
  const expectedLogin = process.env.ADMIN_LOGIN || "admin";
  const loginOk = safeEqual(login, expectedLogin);

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    const ok = await bcrypt.compare(password, hash);
    return loginOk && ok;
  }

  const devPassword = process.env.ADMIN_PASSWORD;
  if (devPassword && !isProduction()) {
    const ok = safeEqual(password, devPassword);
    await bcrypt.compare(password, DUMMY_HASH);
    return loginOk && ok;
  }

  await bcrypt.compare(password, DUMMY_HASH);
  return false;
}

export function usingDevelopmentPassword(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && !process.env.ADMIN_PASSWORD_HASH && !isProduction();
}
