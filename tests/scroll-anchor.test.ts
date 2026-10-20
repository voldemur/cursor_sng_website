import { describe, expect, it } from "vitest";
import {
  createScrollAnchor,
  resolveScrollTop,
  type BlockMetrics,
} from "@/lib/scroll/anchor";

/**
 * Positions measured in Edge at a 1280x485 viewport (2026-10-20):
 * `/en` document 6534px tall, `/ru` document 6916px tall. The same sections sit
 * a few hundred pixels lower on `/ru` because the Russian copy wraps more.
 */
const EN: BlockMetrics[] = [
  { id: "", top: 0 }, // hero, no id
  { id: "advantages", top: 748 },
  { id: "about", top: 2204 },
  { id: "products", top: 2978 },
  { id: "documentation", top: 4895 },
  { id: "contacts", top: 5400 },
  { id: "", top: 5950 }, // footer
];
const RU: BlockMetrics[] = [
  { id: "", top: 0 },
  { id: "advantages", top: 906 },
  { id: "about", top: 2458 },
  { id: "products", top: 3288 },
  { id: "documentation", top: 5277 },
  { id: "contacts", top: 5782 },
  { id: "", top: 6332 },
];

const EN_MAX_SCROLL = 6049;
const RU_MAX_SCROLL = 6431;

describe("createScrollAnchor", () => {
  it("anchors the reader to the footer, not to the raw scroll offset", () => {
    // Scrolled to the very bottom of /en: the footer starts 99px above the viewport.
    const anchor = createScrollAnchor(EN, EN_MAX_SCROLL, EN_MAX_SCROLL);

    expect(anchor).toEqual({ id: "", index: 6, offset: 99, ratio: 1 });
  });

  it("anchors the section under the viewport top mid-page", () => {
    const anchor = createScrollAnchor(EN, 3000, EN_MAX_SCROLL);

    expect(anchor?.id).toBe("products");
    expect(anchor?.index).toBe(3);
    expect(anchor?.offset).toBe(22);
  });

  it("returns null when the viewport sits above every block", () => {
    expect(createScrollAnchor([{ id: "main", top: 100 }], 0, 500)).toBeNull();
  });

  it("survives a document that cannot scroll", () => {
    expect(createScrollAnchor(EN, 0, 0)?.ratio).toBe(0);
  });
});

describe("resolveScrollTop", () => {
  it("keeps the footer in place when the new locale is taller", () => {
    const anchor = createScrollAnchor(EN, EN_MAX_SCROLL, EN_MAX_SCROLL);
    const top = resolveScrollTop(anchor!, RU, RU_MAX_SCROLL);

    // Same 99px into the footer as before the switch (the new document ends there).
    expect(top).toBe(RU_MAX_SCROLL);
    expect(RU[6].top - top).toBe(-99);
  });

  it("keeps the same block and offset mid-page", () => {
    const anchor = createScrollAnchor(EN, 3000, EN_MAX_SCROLL);
    const top = resolveScrollTop(anchor!, RU, RU_MAX_SCROLL);

    expect(top).toBe(3310);
    expect(RU[3].top - top).toBe(-22);
  });

  it("follows the block by id when an earlier section was hidden", () => {
    const anchor = createScrollAnchor(EN, 3000, EN_MAX_SCROLL);
    const withoutAdvantages = RU.filter((block) => block.id !== "advantages");
    const shifted = withoutAdvantages.map((block) => ({ ...block, top: block.top - 337 }));

    expect(resolveScrollTop(anchor!, shifted, RU_MAX_SCROLL)).toBe(3288 - 337 + 22);
  });

  it("clamps the target when the new document is shorter", () => {
    const top = resolveScrollTop({ id: "contacts", index: 5, offset: 900, ratio: 0.9 }, EN, EN_MAX_SCROLL);

    expect(top).toBe(EN_MAX_SCROLL);
  });

  it("falls back to the scroll ratio when the block is gone", () => {
    const anchor = createScrollAnchor(EN, 3000, EN_MAX_SCROLL);
    const withoutProducts = RU.filter((block) => block.id !== "products");

    expect(resolveScrollTop(anchor!, withoutProducts, 5000)).toBe(
      Math.round(anchor!.ratio * 5000),
    );
  });

  it("never returns a negative offset", () => {
    expect(resolveScrollTop({ id: "products", index: 3, offset: -4000, ratio: 0.5 }, EN, EN_MAX_SCROLL)).toBe(0);
  });
});
