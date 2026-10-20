/**
 * Locale switching re-renders the same page with different copy. Russian and
 * English text wrap differently, so every block changes height and the whole
 * document gets taller or shorter. `scroll={false}` on the locale link keeps the
 * raw `scrollTop`, which therefore points at a different block after the switch.
 *
 * These helpers anchor the reader to the block under the viewport top (and the
 * offset inside that block) instead of to an absolute pixel offset.
 */

export type BlockMetrics = {
  /** `id` of the block, empty when the block has none (e.g. the hero). */
  id: string;
  /** Distance from the document top to the block top, in px. */
  top: number;
};

export type ScrollAnchor = {
  id: string;
  /** Position of the block in the document; used when the block has no id. */
  index: number;
  /** Distance from the block top to the viewport top, in px. */
  offset: number;
  /** Scroll ratio of the captured document; fallback when the block is gone. */
  ratio: number;
};

/** Picks the last block whose top sits at or above the viewport top. */
export function createScrollAnchor(
  blocks: readonly BlockMetrics[],
  viewportTop: number,
  maxScroll: number,
): ScrollAnchor | null {
  let index = -1;
  for (let i = 0; i < blocks.length; i += 1) {
    if (blocks[i].top <= viewportTop + 1) index = i;
  }
  if (index < 0) return null;

  return {
    id: blocks[index].id,
    index,
    offset: viewportTop - blocks[index].top,
    ratio: maxScroll > 0 ? Math.min(1, Math.max(0, viewportTop / maxScroll)) : 0,
  };
}

/**
 * Resolves the scroll offset that puts the anchored block back at the same
 * distance from the viewport top in the re-rendered document.
 */
export function resolveScrollTop(
  anchor: ScrollAnchor,
  blocks: readonly BlockMetrics[],
  maxScroll: number,
): number {
  const byIndex = blocks[anchor.index];
  // The index is only trustworthy while it points at the same block; the same
  // section can disappear when the editors hide a block.
  const block =
    byIndex && byIndex.id === anchor.id
      ? byIndex
      : anchor.id
        ? blocks.find((candidate) => candidate.id === anchor.id)
        : byIndex;

  const target = block ? block.top + anchor.offset : anchor.ratio * maxScroll;
  return Math.min(Math.max(0, Math.round(target)), Math.max(0, Math.round(maxScroll)));
}

const BLOCK_SELECTOR = "main > section, footer";
/**
 * A captured anchor must outlive a slow locale navigation but must not leak into
 * an unrelated later one (e.g. the click was cancelled or opened a new tab).
 */
const ANCHOR_TTL_MS = 10_000;

let pendingAnchor: { anchor: ScrollAnchor; capturedAt: number } | null = null;

function maxScroll(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function measureBlocks(): BlockMetrics[] {
  const scrollY = window.scrollY;
  return Array.from(document.querySelectorAll<HTMLElement>(BLOCK_SELECTOR)).map((element) => ({
    id: element.id,
    top: element.getBoundingClientRect().top + scrollY,
  }));
}

/** Call from the locale link click, before the route changes. */
export function rememberScrollPosition(): void {
  const anchor = createScrollAnchor(measureBlocks(), window.scrollY, maxScroll());
  pendingAnchor = anchor ? { anchor, capturedAt: Date.now() } : null;
}

/** Call after the new locale has been committed to the DOM. */
export function restoreScrollPosition(): void {
  const stored = pendingAnchor;
  pendingAnchor = null;
  if (!stored || Date.now() - stored.capturedAt > ANCHOR_TTL_MS) return;

  scrollInstantly(resolveScrollTop(stored.anchor, measureBlocks(), maxScroll()));
}

function scrollInstantly(top: number): void {
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  // `html { scroll-behavior: smooth }` would otherwise animate the correction.
  html.style.scrollBehavior = "auto";
  // Chrome only picks the override up after a forced reflow.
  html.getClientRects();
  window.scrollTo(0, top);
  html.style.scrollBehavior = previous;
}
