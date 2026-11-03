import { useLayoutEffect } from "preact/hooks";
import { type Box, type LabelProblem, NEAR, boxesClash, solveLabels } from "./label-solver";
import { LABEL_WEIGHTS } from "./label-weights";

/**
 * A picture's labels placed together (platform/docs/plans/label-placement.md,
 * generic-labels.md): a prop draws its label's words and says where they may go and what they keep
 * clear of (`useLabel`); once the picture is drawn, every label in it is measured once, placed by
 * `solveLabels`, and written once. In any SVG: a frame's, a `Stage`'s, a prop's own.
 */

/** A place for a label's words: x, y and its anchor, in the units of the group it is drawn in. */
export type LabelSpot = readonly [number, number, "start" | "middle" | "end"];

export type LabelSpec = {
  /** Its places, in its order of preference. */
  spots: readonly LabelSpot[];
  /**
   * What a place keeps clear of (a selector in the picture), and how far, px. Left out: everything
   * inked in the picture (words, lines, shapes that show) but labels and what is tagged
   * `data-backdrop` (a grid, a tint, a tap area), `gap` away.
   */
  avoid?: (spot: number) => { what: string; gap: number };
  /** How far it keeps from other labels, px. */
  gap: number;
  /** The thing it names (a dot, a figure): it may touch it. */
  own?: Element | null;
  /** It must be nearer its own thing than any other label's own thing. */
  isNearOwn?: boolean;
  /** Its transform at a place (kept upright on a turned plane). */
  transform?: (x: number, y: number) => string | undefined;
};

// What a place's clash costs (label-weights.ts).
const OFF = LABEL_WEIGHTS.offPicture;
const ON_MARK = LABEL_WEIGHTS.onMark;
const ON_LINE = LABEL_WEIGHTS.onLine;
const NEARER_OTHER = LABEL_WEIGHTS.nearerAnother;

type Placer = {
  labels: Map<SVGTextElement, LabelSpec>;
  isDue: boolean;
  /** The last problem solved and its answer: the same boxes again (another drawing of the same board), the same answer. */
  last?: { problem: string; at: number[] };
};
const placers = new Map<SVGSVGElement, Placer>();

/**
 * Runs a placing, timed: every placing on the page is summed under one name, which the drawing
 * tool's label audit reads, and the boxes read meanwhile are counted there.
 */
export function timedPlacing(fn: () => void): void {
  const from = performance.now();
  const placing = globalThis as { __chalkPlacing?: number };
  placing.__chalkPlacing = (placing.__chalkPlacing ?? 0) + 1;
  try {
    fn();
  } finally {
    placing.__chalkPlacing = (placing.__chalkPlacing ?? 1) - 1;
    performance.measure("chalk:labels", { start: from });
  }
}

/**
 * Places these words with the picture's other labels, after every drawing of it. The words are
 * the prop's own `<text>`, drawn where it likes (in its own group, with its own look); this moves
 * them to one of their spots.
 */
export function useLabel(ref: { current: SVGTextElement | null }, label: () => LabelSpec): void {
  useLayoutEffect(() => {
    const el = ref.current;
    const svg = el?.ownerSVGElement;
    if (el === null || el === undefined || svg === null || svg === undefined) return;
    let placer = placers.get(svg);
    if (placer === undefined) {
      placer = { labels: new Map(), isDue: false };
      placers.set(svg, placer);
    }
    placer.labels.set(el, label());
    // Placed labels are found by this (the label audit), whichever prop drew them.
    el.setAttribute("data-label", "");
    due(svg, placer);
    return () => {
      placer.labels.delete(el);
      if (placer.labels.size === 0) placers.delete(svg);
      else due(svg, placer);
    };
  });
}

/** Placed once the layout effects of this drawing have all run, before it is painted. */
function due(svg: SVGSVGElement, placer: Placer): void {
  if (placer.isDue) return;
  placer.isDue = true;
  queueMicrotask(() => {
    placer.isDue = false;
    if (svg.isConnected && placer.labels.size > 0) timedPlacing(() => place(svg, placer));
  });
}

// Fonts change words' sizes (Hindi above all): every plane is placed again once they have loaded.
if (typeof document !== "undefined" && "fonts" in document) {
  const again = () => {
    for (const [svg, placer] of placers) due(svg, placer);
  };
  void document.fonts.ready.then(again);
  document.fonts.addEventListener("loadingdone", again);
}

const boxOf = (r: DOMRect): Box => ({ l: r.left, t: r.top, r: r.right, b: r.bottom });
/**
 * A word's inked letters: its box is its line's (ascent to descent), about a fifth more above and
 * below than its letters, so two words a line apart would overlap by their boxes alone.
 */
const inkOf = (b: Box): Box => ({
  l: b.l,
  t: b.t + (b.b - b.t) * 0.2,
  r: b.r,
  b: b.b - (b.b - b.t) * 0.15,
});
const shift = (anchor: string | null, width: number) =>
  anchor === "middle" ? width / 2 : anchor === "end" ? width : 0;

/** Two elements in the order they stand in the document. */
export function inPictureOrder(a: Node, b: Node): number {
  if (a === b) return 0;
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

/** What is drawn, of the kinds a label can sit on. */
const INKED = "text, line, circle, ellipse, rect, path, polygon, polyline";

/** Whether a thing shows: visible, and with a fill or a stroke that isn't clear. */
function hasInk(e: Element): boolean {
  if (!e.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
  const style = getComputedStyle(e);
  const isClear = (paint: string) =>
    paint === "none" || paint === "transparent" || /rgba\([^)]*,\s*0\)$/.test(paint);
  const isFilled = !isClear(style.fill) && Number(style.fillOpacity) > 0;
  const isStroked =
    !isClear(style.stroke) &&
    Number(style.strokeOpacity) > 0 &&
    Number.parseFloat(style.strokeWidth) > 0;
  return isFilled || isStroked;
}

/** A path or polyline drawn as a line (no fill): kept clear of along its length, not its box. */
function isLineLike(e: SVGGeometryElement): boolean {
  if (
    e instanceof SVGRectElement ||
    e instanceof SVGCircleElement ||
    e instanceof SVGEllipseElement
  )
    return false;
  const fill = getComputedStyle(e).fill;
  return fill === "none" || fill === "transparent" || /rgba\([^)]*,\s*0\)$/.test(fill);
}

function place(svg: SVGSVGElement, placer: Placer): void {
  // In the order they stand in the picture, not the order they were registered in: a board opened
  // at a state and the same board played there register their labels in different orders, and
  // the solver must be given the same problem to give the same answer.
  const entries = [...placer.labels]
    .filter(([el]) => el.isConnected)
    .sort(([a], [b]) => inPictureOrder(a, b));
  const frame = boxOf(svg.getBoundingClientRect());
  const labelEls = new Set<Element>(entries.map(([el]) => el));
  // The things labels name: a label must be nearer its own than any other's.
  const named = [
    ...new Set(entries.flatMap(([, l]) => (l.own === undefined || l.own === null ? [] : [l.own]))),
  ].map((d) => ({ el: d, box: boxOf(d.getBoundingClientRect()) }));
  // Each set of things kept clear of, read once: boxes, and lines (a line, an unfilled path) as
  // the segments they are drawn along.
  type Mark = { el: Element; box: Box; ink: Box; lines?: [DOMPoint, DOMPoint][] };
  const marks = new Map<string, Mark[]>();
  const markOf = (e: Element): Mark[] => {
    const r = e.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return [];
    const box = boxOf(r);
    const m = e instanceof SVGGraphicsElement ? e.getScreenCTM() : null;
    const on = (p: { x: number; y: number }) =>
      new DOMPoint(p.x, p.y).matrixTransform(m ?? undefined);
    if (e instanceof SVGLineElement && m !== null)
      return [
        {
          el: e,
          box,
          ink: box,
          lines: [
            [
              on({ x: e.x1.baseVal.value, y: e.y1.baseVal.value }),
              on({ x: e.x2.baseVal.value, y: e.y2.baseVal.value }),
            ],
          ],
        },
      ];
    if (e instanceof SVGGeometryElement && m !== null && isLineLike(e)) {
      const length = e.getTotalLength();
      const steps = Math.max(1, Math.min(64, Math.ceil(length / 12)));
      const points = Array.from({ length: steps + 1 }, (_, i) =>
        on(e.getPointAtLength((length * i) / steps)),
      );
      return [
        {
          el: e,
          box,
          ink: box,
          lines: points.slice(1).map((p, i) => [points[i] ?? p, p] as [DOMPoint, DOMPoint]),
        },
      ];
    }
    return [{ el: e, box, ink: e.tagName === "text" ? inkOf(box) : box }];
  };
  const marksOf = (what: string | undefined) => {
    const key = what ?? "";
    let found = marks.get(key);
    if (found === undefined) {
      found = (
        what === undefined
          ? [...svg.querySelectorAll(INKED)].filter(
              (e) => e.closest("[data-backdrop]") === null && hasInk(e),
            )
          : [...svg.querySelectorAll(what)]
      )
        .filter((e) => !labelEls.has(e))
        .flatMap(markOf);
      marks.set(key, found);
    }
    return found;
  };
  // Each label's box at each of its places, worked out from one measure where it is now.
  const problem: LabelProblem = {
    labels: entries.map(([el, label]) => {
      const bb = el.getBBox();
      const x = Number(el.getAttribute("x") ?? 0);
      const y = Number(el.getAttribute("y") ?? 0);
      const left = bb.x - x + shift(el.getAttribute("text-anchor"), bb.width);
      const top = bb.y - y;
      const parent = el.parentNode as SVGGraphicsElement;
      const m = parent.getScreenCTM() ?? new DOMMatrix();
      const scale = Math.hypot(m.a, m.b);
      const ownBox = label.own?.getBoundingClientRect();
      const mine = (e: Element) => e === el || e === label.own || label.own?.contains(e) === true;
      return {
        gap: label.gap,
        spots: label.spots.map(([sx, sy, anchor], k) => {
          const p = new DOMPoint(sx, sy).matrixTransform(m);
          const l = p.x + scale * (left - shift(anchor, bb.width));
          const t = p.y + scale * top;
          const box = { l, t, r: l + scale * bb.width, b: t + scale * bb.height };
          const ink = inkOf(box);
          const { what, gap } = label.avoid?.(k) ?? { what: undefined, gap: label.gap };
          let cost =
            box.l < frame.l || box.r > frame.r || box.t < frame.t || box.b > frame.b ? OFF : 0;
          // On a thing costs in full; only within the gap of it, a quarter (NEAR).
          for (const mark of marksOf(what)) {
            if (mine(mark.el)) continue;
            const lines = mark.lines;
            const weight = lines === undefined ? ON_MARK : ON_LINE;
            const isOn =
              lines === undefined
                ? boxesClash(ink, mark.ink, 0)
                : lines.some((line) => crosses(ink, line, 0));
            const isNear =
              lines === undefined
                ? boxesClash(box, mark.box, gap)
                : boxesClash(box, mark.box, gap) && lines.some((line) => crosses(box, line, gap));
            cost += isOn ? weight : isNear ? weight * NEAR : 0;
          }
          if (label.isNearOwn === true && ownBox !== undefined) {
            const mx = (box.l + box.r) / 2;
            const my = (box.t + box.b) / 2;
            const far = (b: Box) => Math.hypot(mx - (b.l + b.r) / 2, my - (b.t + b.b) / 2);
            const toOwn = far(boxOf(ownBox));
            if (named.some((d) => !mine(d.el) && far(d.box) < toOwn)) cost += NEARER_OTHER;
          }
          return { box, ink, cost };
        }),
      };
    }),
  };
  const asked = JSON.stringify(problem, (_, v) =>
    typeof v === "number" ? Math.round(v * 100) / 100 : v,
  );
  const isNew = placer.last?.problem !== asked;
  const solvingFrom = performance.now();
  const at = !isNew && placer.last !== undefined ? placer.last.at : solveLabels(problem);
  // For the label audit: each problem solved, and the time solving it took.
  if (isNew) performance.measure("chalk:label-solve", { start: solvingFrom, detail: asked });
  placer.last = { problem: asked, at };
  for (const [i, [el, label]] of entries.entries()) {
    const spot = label.spots[at[i] ?? 0];
    if (spot === undefined) continue;
    const [x, y, anchor] = spot;
    el.setAttribute("x", `${x}`);
    el.setAttribute("y", `${y}`);
    el.setAttribute("text-anchor", anchor);
    const turned = label.transform?.(x, y);
    if (turned === undefined) el.removeAttribute("transform");
    else el.setAttribute("transform", turned);
  }
}

/** Whether a line, its two ends on the page, comes within `gap` of a box (Liang–Barsky). */
function crosses(box: Box, [a, b]: readonly [DOMPoint, DOMPoint], gap: number): boolean {
  const r = { l: box.l - gap, t: box.t - gap, r: box.r + gap, b: box.b + gap };
  let t0 = 0;
  let t1 = 1;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  for (const [p, q] of [
    [-dx, a.x - r.l],
    [dx, r.r - a.x],
    [-dy, a.y - r.t],
    [dy, r.b - a.y],
  ] as const) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      if (t0 > t1) return false;
    }
  }
  return true;
}
