export function moveItem<T extends { order: number }>(items: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const copy = [...items];
  const current = copy[index];
  const swap = copy[nextIndex];
  if (!current || !swap) return items;
  copy[index] = swap;
  copy[nextIndex] = current;
  return copy.map((item, i) => ({ ...item, order: i + 1 }));
}
