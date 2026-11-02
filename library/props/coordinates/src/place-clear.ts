/** A place for a word: x, y and its anchor, in the coordinates of the group it is drawn in. */
export type WordPlace = readonly [number, number, "start" | "middle" | "end"];

/** How far a word keeps from everything else, in pixels. */
const GAP_PX = 4;

/**
 * Puts a word drawn on a plane at the first of `places` where it is clear: inside the plane and a
 * few pixels from every word and every thing `avoid` names; else where it clashes least (off the
 * plane worst, then each word or mark it touches, then each line). Measured as drawn, so it holds
 * in every language and at every size. `ignore`: things it may touch (its own dot). Says how badly
 * the place it took clashes: 0, clear.
 */
export function placeClear(
  el: SVGTextElement,
  places: readonly WordPlace[],
  avoid: string,
  ignore: readonly Element[] = [],
): number {
  const svg = el.ownerSVGElement;
  if (svg === null || places.length === 0) return 0;
  const frame = svg.getBoundingClientRect();
  const others = [...svg.querySelectorAll(avoid)]
    .filter((t) => t !== el && !ignore.includes(t))
    .map((t) => ({ r: t.getBoundingClientRect(), weight: t.tagName === "line" ? 1 : 10 }))
    .filter(({ r }) => r.width > 0 || r.height > 0);
  const clash = (r: DOMRect) => {
    const off =
      r.left < frame.left || r.right > frame.right || r.top < frame.top || r.bottom > frame.bottom
        ? 1000
        : 0;
    return (
      off +
      others
        .filter(
          ({ r: o }) =>
            r.left - GAP_PX < o.right &&
            o.left < r.right + GAP_PX &&
            r.top - GAP_PX < o.bottom &&
            o.top < r.bottom + GAP_PX,
        )
        .reduce((sum, o) => sum + o.weight, 0)
    );
  };
  const put = ([x, y, anchor]: WordPlace) => {
    el.setAttribute("x", `${x}`);
    el.setAttribute("y", `${y}`);
    el.setAttribute("text-anchor", anchor);
  };
  // The first place that clashes with nothing; else the one that clashes least.
  let best: { place: WordPlace; score: number } | undefined;
  for (const place of places) {
    put(place);
    const score = clash(el.getBoundingClientRect());
    if (score === 0) return 0;
    if (best === undefined || score < best.score) best = { place, score };
  }
  put(best?.place ?? places[0]!);
  return best?.score ?? 0;
}
