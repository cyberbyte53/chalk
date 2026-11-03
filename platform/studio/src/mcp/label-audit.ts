/**
 * The label audit (platform/docs/plans/label-placement.md): reads a drawn board's labels on its
 * planes as they are on the page, knowing nothing of how they were placed, so placings compare
 * fairly. Run in the page (`card.evaluate(labelAudit)`): self-contained.
 */

/** One label as drawn. */
export type AuditedLabel = {
  /** "pair" (a dot's), "swap" (its swap's), "origin", "walker". */
  kind: string;
  text: string;
  /** Not drawn: hidden, or an empty box. */
  isHidden: boolean;
  /** Other labels it overlaps. */
  onLabels: number;
  /** Dots and other words (an axis's numbers, a place's name) it overlaps, not its own dot. */
  onMarks: number;
  /** Lines it crosses: the axes, a swap's dashed line, a point's guides. */
  onLines: number;
  /** Its middle is nearer another dot than its own (a pair only). */
  isNearerOther: boolean;
  /** Outside the plane's drawing. */
  isOff: boolean;
  /** From its middle to its own dot's middle, px (-1: no own dot). */
  distance: number;
  /** Which side of its own dot: "ur", "ul", "dr", "dl", "u", "d", "l", "r" (or ""). */
  side: string;
  /** Its box on the page, rounded: to see which labels moved between two drawings. */
  at: [number, number];
  /** What it overlaps or crosses, named ("text 2", "circle.cp-swap", "line.cp-axis"). */
  hits: string[];
};

export type LabelAudit = {
  labels: AuditedLabel[];
  /** Time spent placing labels since the last audit, ms (every placing on the page, summed). */
  placingMs: number;
  /** Boxes read while placing since the last audit (each can force a layout). */
  boxReads: number;
};

/** Counts the boxes read while a placing runs (`__chalkPlacing`, set by the props' timer). */
export const COUNT_BOX_READS = `(() => {
  const count = (proto, name) => {
    const was = proto[name];
    proto[name] = function (...args) {
      if ((globalThis.__chalkPlacing ?? 0) > 0) globalThis.__chalkBoxReads = (globalThis.__chalkBoxReads ?? 0) + 1;
      return was.apply(this, args);
    };
  };
  count(Element.prototype, "getBoundingClientRect");
  count(SVGGraphicsElement.prototype, "getBBox");
  count(SVGGraphicsElement.prototype, "getCTM");
  count(SVGGraphicsElement.prototype, "getScreenCTM");
})();`;

export function labelAudit(card: Element): LabelAudit {
  const w = globalThis as { __chalkBoxReads?: number };
  const measures = performance.getEntriesByName("chalk:labels");
  const placingMs = measures.reduce((sum, m) => sum + m.duration, 0);
  performance.clearMeasures("chalk:labels");
  const boxReads = w.__chalkBoxReads ?? 0;
  w.__chalkBoxReads = 0;
  const labels: AuditedLabel[] = [];
  /**
   * A thing's box as inked: a word's box is its line's (ascent to descent), about a fifth more
   * above and below than its letters, so two words a line apart, or O in the axes' corner, would
   * touch by their boxes alone.
   */
  const ink = (e: Element): DOMRect => {
    const r = e.getBoundingClientRect();
    if (e.tagName !== "text") return r;
    return new DOMRect(r.left, r.top + r.height * 0.2, r.width, r.height * 0.65);
  };
  const touch = (a: DOMRect, b: DOMRect) =>
    a.left < b.right - 0.5 &&
    b.left < a.right - 0.5 &&
    a.top < b.bottom - 0.5 &&
    b.top < a.bottom - 0.5;
  const middle = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  const far = (a: DOMRect, b: DOMRect) =>
    Math.hypot(middle(a).x - middle(b).x, middle(a).y - middle(b).y);
  for (const svg of card.querySelectorAll("svg")) {
    const found: { el: SVGTextElement; kind: string; own: Element | null }[] = [];
    for (const el of svg.querySelectorAll<SVGTextElement>(".cp-dot > text")) {
      const own = el.previousElementSibling;
      found.push({
        el,
        kind: el.classList.contains("cp-swap-label") ? "swap" : "pair",
        own: own?.tagName === "circle" ? own : null,
      });
    }
    for (const el of svg.querySelectorAll<SVGTextElement>("text.cp-origin"))
      found.push({ el, kind: "origin", own: null });
    for (const el of svg.querySelectorAll<SVGTextElement>("text.cp-walker-name"))
      found.push({ el, kind: "walker", own: el.closest(".cp-walker") });
    if (found.length === 0) continue;
    const frame = svg.getBoundingClientRect();
    const isShown = (e: Element) => {
      const r = e.getBoundingClientRect();
      return (
        getComputedStyle(e).display !== "none" &&
        getComputedStyle(e).visibility !== "hidden" &&
        (r.width > 0 || r.height > 0)
      );
    };
    const labelEls = new Set<Element>(found.map((f) => f.el));
    const dots = [
      ...svg.querySelectorAll(".cp-dot > circle:not(.cp-swap-self), .cp-dot > .cp-swap"),
    ];
    const words = [...svg.querySelectorAll("text")].filter((t) => !labelEls.has(t) && isShown(t));
    // A line as its two ends on the page: a slanted line's box is far bigger than the line.
    const lineEls = [
      ...svg.querySelectorAll<SVGLineElement>("line.cp-axis, line.cp-swap-line, line.cp-drop"),
    ].filter((l) => l.getScreenCTM() !== null && isShown(l));
    const lines = lineEls.flatMap((l) => {
      const m = l.getScreenCTM();
      if (m === null) return [];
      const end = (x: number, y: number) => new DOMPoint(x, y).matrixTransform(m);
      return [
        [
          end(l.x1.baseVal.value, l.y1.baseVal.value),
          end(l.x2.baseVal.value, l.y2.baseVal.value),
        ] as const,
      ];
    });
    /** Whether a line's segment passes through a box (Liang–Barsky). */
    const crosses = (box: DOMRect, [a, b]: readonly [DOMPoint, DOMPoint]) => {
      // Half a pixel in, as for boxes: a line along a word's edge doesn't cross it.
      const r = new DOMRect(box.left + 0.5, box.top + 0.5, box.width - 1, box.height - 1);
      let t0 = 0;
      let t1 = 1;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      for (const [p, q] of [
        [-dx, a.x - r.left],
        [dx, r.right - a.x],
        [-dy, a.y - r.top],
        [dy, r.bottom - a.y],
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
    };
    for (const { el, kind, own } of found) {
      const r = ink(el);
      const isHidden = !isShown(el);
      const mine = (e: Element) => e === own || own?.contains(e) === true;
      const others = found.filter((f) => f.el !== el && isShown(f.el));
      const ownAt = own?.getBoundingClientRect();
      const m = middle(r);
      const o = ownAt === undefined ? undefined : middle(ownAt);
      const dx = o === undefined ? 0 : m.x - o.x;
      const dy = o === undefined ? 0 : m.y - o.y;
      const side =
        o === undefined
          ? ""
          : Math.abs(dx) < r.width / 4
            ? dy < 0
              ? "u"
              : "d"
            : Math.abs(dy) < r.height / 3
              ? dx < 0
                ? "l"
                : "r"
              : `${dy < 0 ? "u" : "d"}${dx < 0 ? "l" : "r"}`;
      labels.push({
        kind,
        text: el.textContent ?? "",
        isHidden,
        onLabels: isHidden ? 0 : others.filter((f) => touch(r, ink(f.el))).length,
        onMarks: isHidden
          ? 0
          : [...dots, ...words].filter((d) => !mine(d) && touch(r, ink(d))).length,
        onLines: isHidden ? 0 : lines.filter((l) => crosses(r, l)).length,
        hits: isHidden
          ? []
          : [
              ...[...dots, ...words]
                .filter((d) => !mine(d) && touch(r, ink(d)))
                .map(
                  (d) =>
                    `${d.tagName}${d.classList.length > 0 ? `.${[...d.classList].join(".")}` : ""}${d.tagName === "text" ? ` "${d.textContent}"` : ""}`,
                ),
              ...lineEls
                .filter((_, i) => crosses(r, lines[i] as never))
                .map((l) => `line.${[...l.classList].join(".")}`),
            ],
        isNearerOther:
          !isHidden &&
          (kind === "pair" || kind === "swap") &&
          ownAt !== undefined &&
          dots.some((d) => d !== own && far(r, d.getBoundingClientRect()) < far(r, ownAt)),
        isOff:
          !isHidden &&
          (r.left < frame.left - 0.5 ||
            r.right > frame.right + 0.5 ||
            r.top < frame.top - 0.5 ||
            r.bottom > frame.bottom + 0.5),
        distance: isHidden || ownAt === undefined ? -1 : Math.round(far(r, ownAt)),
        side: isHidden ? "" : side,
        at: [Math.round(r.left - frame.left), Math.round(r.top - frame.top)],
      });
    }
  }
  return { labels, placingMs, boxReads };
}
