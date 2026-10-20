"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { restoreScrollPosition } from "@/lib/scroll/anchor";

/**
 * Puts the reader back on the block they were looking at after a locale switch.
 *
 * `LanguageSwitcher` remembers the block before navigating; this component
 * restores it once the new locale is in the DOM. It must live in the root
 * layout: a layout is the only part of the tree that survives the navigation,
 * so `usePathname()` here sees the change after React has committed the new page
 * (a layout effect runs after the children's DOM is updated, before paint, which
 * keeps the correction invisible).
 */
export function ScrollAnchorRestorer() {
  const pathname = usePathname();
  const restoredFor = useRef(pathname);

  useLayoutEffect(() => {
    if (restoredFor.current === pathname) return;
    restoredFor.current = pathname;
    restoreScrollPosition();
  }, [pathname]);

  return null;
}
