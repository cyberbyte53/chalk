import { useLayoutEffect } from "preact/hooks";
import { type Box, type LabelProblem, NEAR, boxesClash, solveLabels } from "./label-solver";
import type { WordPlace } from "./place-clear";
import { timedPlacing } from "./place-clear";

/**
 * A plane's labels placed together (platform/docs/plans/label-placement.md): each label says where
 * it may go and what it keeps clear of; once a frame's drawing is done, every label on the plane is
 * measured once, placed by `solveLabels`, and written once.
 */
export type PlaneLabel = {
  /** Its places, in its order of preference, in its parent's units. */
  spots: readonly WordPlace[];
  /** What a place keeps clear of (a selector in the plane's drawing), and how far, px. */
  avoid: (spot: number) => { what: string; gap: number };
  /** How far it keeps from other labels, px. */
  gap: number;
  /** Its own dot or figure: it may touch it, and (`isNearOwn`) must be nearer it than any other dot. */
  own?: Element | null;
  isNearOwn?: boolean;
  /** Its transform at a place (kept upright on a turned plane). */
  transform?: (x: number, y: number) => string | undefined;
};

/**
 * What a place's clash costs, as one placed alone weighed them (a word or dot 10, a line 1, nearer
 * another dot 20, off the plane 1000), with another label as a word: a clash between labels is 1.
 */
const OFF = 100;
const ON_MARK = 1;
const ON_LINE = 0.1;
const NEARER_OTHER = 2;
/** The dots a pair must be nearest its own of. */
const DOTS = ".cp-dot > circle, .cp-swap";

type Placer = {
  labels: Map<SVGTextElement, PlaneLabel>;
  isDue: boolean;
  /** The last problem solved and its answer: the same boxes again (another drawing of the same board), the same answer. */
  last?: { problem: string; at: number[] };
};
const placers = new Map<SVGSVGElement, Placer>();

/** Places this label with the others on its plane, after every drawing of it. */
export function usePlaneLabel(
  ref: { current: SVGTextElement | null },
  label: () => PlaneLabel,
): void {
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

function place(svg: SVGSVGElement, placer: Placer): void {
  const entries = [...placer.labels].filter(([el]) => el.isConnected);
  const frame = boxOf(svg.getBoundingClientRect());
  const labelEls = new Set<Element>(entries.map(([el]) => el));
  const dots = [...svg.querySelectorAll(DOTS)].map((d) => ({
    el: d,
    box: boxOf(d.getBoundingClientRect()),
  }));
  // Each set of things kept clear of, read once: boxes, and lines as their two ends.
  type Mark = { el: Element; box: Box; ink: Box; line?: [DOMPoint, DOMPoint] };
  const marks = new Map<string, Mark[]>();
  const marksOf = (what: string) => {
    let found = marks.get(what);
    if (found === undefined) {
      found = [...svg.querySelectorAll(what)]
        .filter((e) => !labelEls.has(e))
        .flatMap((e): Mark[] => {
          const r = e.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return [];
          if (e instanceof SVGLineElement) {
            const m = e.getScreenCTM();
            if (m === null) return [];
            const end = (x: number, y: number) => new DOMPoint(x, y).matrixTransform(m);
            return [
              {
                el: e,
                box: boxOf(r),
                ink: boxOf(r),
                line: [
                  end(e.x1.baseVal.value, e.y1.baseVal.value),
                  end(e.x2.baseVal.value, e.y2.baseVal.value),
                ] as [DOMPoint, DOMPoint],
              },
            ];
          }
          const box = boxOf(r);
          return [{ el: e, box, ink: e.tagName === "text" ? inkOf(box) : box }];
        });
      marks.set(what, found);
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
          const { what, gap } = label.avoid(k);
          let cost =
            box.l < frame.l || box.r > frame.r || box.t < frame.t || box.b > frame.b ? OFF : 0;
          // On a thing costs in full; only within the gap of it, a quarter (NEAR).
          for (const mark of marksOf(what)) {
            if (mine(mark.el)) continue;
            const weight = mark.line === undefined ? ON_MARK : ON_LINE;
            const isOn =
              mark.line === undefined ? boxesClash(ink, mark.ink, 0) : crosses(ink, mark.line, 0);
            const isNear =
              mark.line === undefined
                ? boxesClash(box, mark.box, gap)
                : crosses(box, mark.line, gap);
            cost += isOn ? weight : isNear ? weight * NEAR : 0;
          }
          if (label.isNearOwn === true && ownBox !== undefined) {
            const mx = (box.l + box.r) / 2;
            const my = (box.t + box.b) / 2;
            const far = (b: Box) => Math.hypot(mx - (b.l + b.r) / 2, my - (b.t + b.b) / 2);
            const toOwn = far(boxOf(ownBox));
            if (dots.some((d) => !mine(d.el) && far(d.box) < toOwn)) cost += NEARER_OTHER;
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
