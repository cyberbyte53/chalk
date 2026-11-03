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
export const TextAnchor = { Start: "start", Middle: "middle", End: "end" } as const;
export type TextAnchor = (typeof TextAnchor)[keyof typeof TextAnchor];

/** Which side of its thing a label tries first. */
export const LabelSide = {
  /** A point's name: up and to the right, as on maps. */
  UpperRight: "upper-right",
  /** A person's name: above their head. */
  Above: "above",
} as const;
export type LabelSide = (typeof LabelSide)[keyof typeof LabelSide];

export type LabelSpot = readonly [number, number, TextAnchor];

export type LabelSpec = {
  /**
   * Its places, in its order of preference. Left out: round its own thing, at two distances from
   * its edge, upper-right first (`spotsRound`).
   */
  spots?: readonly LabelSpot[];
  /**
   * What a place keeps clear of (a selector in the picture), and how far, px. Left out: everything
   * inked in the picture (words, lines, shapes that show) but labels and what is tagged
   * `data-coverable` (a grid, a tint, a tap area), `gap` away.
   */
  avoid?: (spot: number) => { what: string; gap: number };
  /** How far it keeps from other labels, px. */
  gap: number;
  /**
   * The thing it names (a dot, a figure): it may touch it, and it sits clearly nearer it than any
   * other thing it could be read as naming.
   */
  own?: Element | null;
  /**
   * Which side of its thing it tries first: a point's name up and to the right (the default, as
   * on maps), a person's above their head.
   */
  prefer?: LabelSide;
  /** Its transform at a place (kept upright on a turned plane). */
  transform?: (x: number, y: number) => string | undefined;
};

// What a place's clash costs (label-weights.ts).
const OFF = LABEL_WEIGHTS.offPicture;
const ON_MARK = LABEL_WEIGHTS.onMark;
const ON_LINE = LABEL_WEIGHTS.onLine;
const NEARER_OTHER = LABEL_WEIGHTS.nearerAnother;
const FAR = LABEL_WEIGHTS.farAtOuterRing;

type Placer = {
  labels: Map<SVGTextElement, LabelSpec>;
  isDue: boolean;
  /** The last problem solved and its answer: the same boxes again (another drawing of the same board), the same answer. */
  last?: { problem: string; at: number[] };
};
const placers = new Map<SVGSVGElement, Placer>();
let labelIds = 0;

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
    const spec = label();
    placer.labels.set(el, spec);
    // Placed labels, and what each names, are found by these (the label audit), whichever prop
    // drew them.
    el.dataset.label ??= `${++labelIds}`;
    spec.own?.setAttribute("data-label-of", el.dataset.label);
    due(svg, placer);
    return () => {
      placer.labels.delete(el);
      el.removeAttribute("data-label");
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
  anchor === TextAnchor.Middle ? width / 2 : anchor === TextAnchor.End ? width : 0;

/**
 * From an element's own units to the page's, as getBoundingClientRect measures it: its matrix
 * within its picture (getCTM, pure SVG), then the picture's box on the page. Not getScreenCTM,
 * which can disagree with the boxes inside an embedded frame or a zoomed page (an editor's
 * preview), and put a label where its spot isn't.
 */
function toPage(el: SVGGraphicsElement): DOMMatrix | null {
  const svg = el instanceof SVGSVGElement && el.ownerSVGElement === null ? el : el.ownerSVGElement;
  const inner = el.getCTM();
  if (svg === null || inner === null) return null;
  const box = svg.getBoundingClientRect();
  const view = svg.viewBox.baseVal;
  const hasView = view !== null && view.width > 0 && view.height > 0;
  const width = hasView ? view.width : svg.width.baseVal.value || box.width;
  const height = hasView ? view.height : svg.height.baseVal.value || box.height;
  const sx = box.width / width;
  const sy = box.height / height;
  const x0 = hasView ? view.x : 0;
  const y0 = hasView ? view.y : 0;
  return new DOMMatrix([sx, 0, 0, sy, box.left - x0 * sx, box.top - y0 * sy]).multiply(inner);
}

/** Two elements in the order they stand in the document. */
export function inPictureOrder(a: Node, b: Node): number {
  if (a === b) return 0;
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

/** How much nearer its own thing a label must be than any other, px (the label audit's too). */
export const CLEARLY_NEARER = 4;

/** The gap between two boxes, 0 when they meet. */
function gapOf(a: Box, b: Box): number {
  return Math.hypot(Math.max(0, b.l - a.r, a.l - b.r), Math.max(0, b.t - a.b, a.t - b.b));
}

/** A thing's box on the page, but the label itself when it is drawn inside the thing (Riya's name). */
function thingBox(thing: Element, label: Element): Box {
  const parts = thing.contains(label)
    ? [...thing.children].filter((c) => !c.contains(label))
    : [thing];
  const boxes = parts
    .map((p) => p.getBoundingClientRect())
    .filter((b) => b.width > 0 || b.height > 0);
  if (boxes.length === 0) return boxOf(thing.getBoundingClientRect());
  return {
    l: Math.min(...boxes.map((b) => b.left)),
    t: Math.min(...boxes.map((b) => b.top)),
    r: Math.max(...boxes.map((b) => b.right)),
    b: Math.max(...boxes.map((b) => b.bottom)),
  };
}

/** How far a label sits from its thing's edge, px: next to it, then a little further out. */
const DISTANCES = [3, 12, 28] as const;
const NEAREST = DISTANCES[0];
const FARTHEST = DISTANCES[DISTANCES.length - 1] ?? NEAREST + 1;
/** The directions round a thing, in the order a label prefers them: the diagonals first. */
const DIRECTIONS = [
  [1, -1],
  [-1, -1],
  [1, 1],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, 0],
  [-1, 0],
] as const;
/** A person's name: above their head, then beside it, then at their sides, below last. */
const ABOVE_FIRST = [
  [0, -1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [-1, 1],
  [0, 1],
] as const;

/**
 * A label's places round its thing, in the units of the label's group: each direction at each
 * distance from the thing's edge, nearest first. Its words' size, measured where they are now,
 * says where its baseline and anchor go so that its box keeps that distance.
 */
function spotsRound(
  el: SVGTextElement,
  own: Element | null | undefined,
  prefer: LabelSide = LabelSide.UpperRight,
): LabelSpot[] {
  const parent = el.parentNode as SVGGraphicsElement;
  const m = toPage(parent);
  if (own === null || own === undefined || m === null) return [];
  const toLocal = m.inverse();
  // The thing as drawn, but the label itself when the label is drawn inside it.
  const parts = own.contains(el) ? [...own.children].filter((c) => !c.contains(el)) : [own];
  const corners = parts.flatMap((p) => {
    const r = p.getBoundingClientRect();
    return r.width === 0 && r.height === 0
      ? []
      : [new DOMPoint(r.left, r.top), new DOMPoint(r.right, r.bottom)].map((c) =>
          c.matrixTransform(toLocal),
        );
  });
  if (corners.length === 0) return [];
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  const box = { l: Math.min(...xs), r: Math.max(...xs), t: Math.min(...ys), b: Math.max(...ys) };
  const bb = el.getBBox();
  const y = Number(el.getAttribute("y") ?? 0);
  const above = y - bb.y;
  const below = bb.y + bb.height - y;
  return DISTANCES.flatMap((d) =>
    (prefer === LabelSide.Above ? ABOVE_FIRST : DIRECTIONS).map(([dx, dy]): LabelSpot => {
      const x = dx > 0 ? box.r + d : dx < 0 ? box.l - d : (box.l + box.r) / 2;
      const baseline =
        dy < 0
          ? box.t - d - below
          : dy > 0
            ? box.b + d + above
            : (box.t + box.b) / 2 + (above - below) / 2;
      return [x, baseline, dx > 0 ? TextAnchor.Start : dx < 0 ? TextAnchor.End : TextAnchor.Middle];
    }),
  );
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
  // Things a label could be read as naming, of the kind labels name: every label's own thing
  // (a dot, a figure), and what is marked a thing (a point, as the crossing). Not pictures or words.
  const things = [
    ...new Set([
      ...svg.querySelectorAll("[data-thing]"),
      ...entries.flatMap(([, l]) => (l.own === undefined || l.own === null ? [] : [l.own])),
    ]),
  ];
  // Each set of things kept clear of, read once: boxes, and lines (a line, an unfilled path) as
  // the segments they are drawn along.
  type Mark = { el: Element; box: Box; ink: Box; lines?: [DOMPoint, DOMPoint][] };
  const marks = new Map<string, Mark[]>();
  const markOf = (e: Element): Mark[] => {
    const r = e.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return [];
    const box = boxOf(r);
    const m = e instanceof SVGGraphicsElement ? toPage(e) : null;
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
              (e) => e.closest("[data-coverable]") === null && hasInk(e),
            )
          : [...svg.querySelectorAll(what)]
      )
        .filter((e) => !labelEls.has(e))
        .flatMap(markOf);
      marks.set(key, found);
    }
    return found;
  };
  // Each label's places: its own, or round its thing.
  const spotsOf = entries.map(
    ([el, label]) => label.spots ?? spotsRound(el, label.own, label.prefer),
  );
  // Each label's box at each of its places, worked out from one measure where it is now.
  const problem: LabelProblem = {
    labels: entries.map(([el, label], i) => {
      const bb = el.getBBox();
      const x = Number(el.getAttribute("x") ?? 0);
      const y = Number(el.getAttribute("y") ?? 0);
      const left = bb.x - x + shift(el.getAttribute("text-anchor"), bb.width);
      const top = bb.y - y;
      const parent = el.parentNode as SVGGraphicsElement;
      const m = toPage(parent) ?? new DOMMatrix();
      const scale = Math.hypot(m.a, m.b);
      const own =
        label.own === null || label.own === undefined ? undefined : thingBox(label.own, el);
      const others = things
        .filter((t) => t !== label.own && !t.contains(el) && label.own?.contains(t) !== true)
        .map((t) => thingBox(t, el));
      const mine = (e: Element) => e === el || e === label.own || label.own?.contains(e) === true;
      return {
        gap: label.gap,
        spots: (spotsOf[i] ?? []).map(([sx, sy, anchor], k) => {
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
          // Read as naming the thing nearest its edge: that must clearly be its own; and the
          // farther from it, the dearer, evenly from the nearest ring to the farthest.
          if (own !== undefined) {
            const toOwn = gapOf(ink, own);
            if (others.some((o) => gapOf(ink, o) < toOwn + CLEARLY_NEARER)) cost += NEARER_OTHER;
            // Measured from its box, as its spots are made: its ink box would make spots above and
            // below seem farther than those beside at the same distance.
            cost += (FAR * Math.max(0, gapOf(box, own) - NEAREST)) / (FARTHEST - NEAREST);
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
    const spot = spotsOf[i]?.[at[i] ?? 0];
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
