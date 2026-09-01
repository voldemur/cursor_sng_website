import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "@/lib/config";
import { parseLocale } from "@/lib/i18n/locale";

export default async function RootPage() {
  const store = await cookies();
  const locale = parseLocale(store.get(LOCALE_COOKIE)?.value);
  redirect(`/${locale}`);
}
