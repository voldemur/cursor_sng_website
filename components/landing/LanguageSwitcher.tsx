"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/types/content";
import { LOCALES } from "@/types/content";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/ru";
  const rest = pathname.replace(/^\/(ru|en)(?=\/|$)/, "") || "";

  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-0.5 text-xs font-medium">
      {LOCALES.map((item) => {
        const href = `/${item}${rest}`;
        const active = item === locale;
        return (
          <Link
            key={item}
            href={href}
            // Both locales render the same page, so the visitor must keep their
            // place. Without this, Next.js scrolls to the top of the page when
            // the viewport sits past the top of the new route's content (which
            // is always the case for the switcher in the footer).
            scroll={false}
            hrefLang={item}
            lang={item}
            className={`rounded-full px-2.5 py-1 uppercase tracking-wide transition ${
              active ? "bg-white text-ink" : "text-mist hover:text-white"
            }`}
            aria-current={active ? "true" : undefined}
            aria-label={item === "ru" ? "Русский язык" : "English language"}
          >
            {item}
          </Link>
        );
      })}
    </div>
  );
}
