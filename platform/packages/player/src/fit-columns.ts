import type { RefObject } from "preact";
import { useLayoutEffect, useRef, useState } from "preact/hooks";

/**
 * How many equal columns a row of options gets, measured rather than guessed: the widest
 * option's own width (KaTeX, Hindi and all) decides how many fit across the column, and the
 * rows are then balanced (nine that fit seven across sit 5 + 4, not 7 + 2). The last row is
 * more than half full, or there are fewer columns (three that fit two across stack, not 2 + 1).
 * Long options get one column. Measured again when the grid's width changes, fonts arrive, or
 * `key` (the labels) changes. Put the ref on a grid whose children are the options, and use the count in
 * `grid-template-columns`.
 */
export function useFitColumns<T extends HTMLElement>(
  count: number,
  key: string,
): [RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [columns, setColumns] = useState(1);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` is when to measure again, not read
  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const measure = () => setColumns(fitColumns(grid, count));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [count, key]);
  return [ref, columns];
}

/** Lays the options out at their own widths for a moment, reads them, and puts the grid back. */
function fitColumns(grid: HTMLElement, count: number): number {
  // Widths as drawn (getBoundingClientRect), the grid's and the options' alike: under a prop's
  // zoom, clientWidth and the gap are in unzoomed pixels and would not compare.
  const width = grid.getBoundingClientRect().width;
  if (count < 2 || width === 0) return 1;
  const gap =
    (Number.parseFloat(getComputedStyle(grid).columnGap) || 0) * (width / grid.offsetWidth || 1);
  const { gridTemplateColumns, width: inlineWidth } = grid.style;
  grid.style.gridTemplateColumns = `repeat(${count}, max-content)`;
  grid.style.width = "max-content";
  let widest = 0;
  for (const option of grid.children) {
    widest = Math.max(widest, option.getBoundingClientRect().width);
  }
  grid.style.gridTemplateColumns = gridTemplateColumns;
  grid.style.width = inlineWidth;
  const across = Math.min(
    count,
    Math.max(1, Math.floor((width + gap) / (Math.ceil(widest) + gap))),
  );
  return balanced(count, across);
}

/** Even rows of at most `across`, the last more than half full (else fewer columns). */
export function balanced(count: number, across: number): number {
  const rows = Math.ceil(count / across);
  let columns = Math.ceil(count / rows);
  while (columns > 1) {
    const last = count - (Math.ceil(count / columns) - 1) * columns;
    if (last * 2 > columns) break;
    columns -= 1;
  }
  return columns;
}
