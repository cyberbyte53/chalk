import { useSpace } from "@chalk/draw";
import type { JSX } from "preact";
import { px, unitPx } from "./frame";
import type { Pt } from "./geometry";
import type { Tone } from "./pieces";

/**
 * Any outline made of straight sides and circular arcs, in model units: for shaded regions such as
 * a square with circles cut out, a petal between two semicircles, or a flower bed beyond a chord.
 * Several closed loops in one shape with `isEvenOdd` cut holes (a loop inside another is a hole).
 */
export type PathCmd =
  | { k: "M"; p: Pt }
  | { k: "L"; p: Pt }
  /** An arc of the circle (centre c, radius r) from angle `from` to angle `to`, in degrees,
   * anticlockwise unless `cw`. A straight side joins the pen to the arc's start first. */
  | { k: "A"; c: Pt; r: number; from: number; to: number; cw?: boolean }
  | { k: "Z" };

const f = (n: number) => n.toFixed(1);

/** The SVG `d` of a shape, in pixels. */
export function pathD(cmds: readonly PathCmd[], toPx: (p: Pt) => Pt, unit: number): string {
  const out: string[] = [];
  // After a Z (or at the start) there is no pen to draw a side from: an arc starts a new loop.
  let isPenDown = false;
  for (const c of cmds) {
    if (c.k === "Z") {
      out.push("Z");
      isPenDown = false;
    } else if (c.k === "M" || c.k === "L") {
      const [x, y] = toPx(c.p);
      out.push(`${isPenDown ? c.k : "M"}${f(x)} ${f(y)}`);
      isPenDown = true;
    } else {
      const at = (a: number): Pt =>
        toPx([
          c.c[0] + c.r * Math.cos((a * Math.PI) / 180),
          c.c[1] + c.r * Math.sin((a * Math.PI) / 180),
        ]);
      let span = c.cw === true ? c.from - c.to : c.to - c.from;
      while (span < 0) span += 360;
      while (span > 360) span -= 360;
      const s = at(c.from);
      const rp = c.r * unit;
      const sweep = c.cw === true ? 1 : 0;
      out.push(`${isPenDown ? "L" : "M"}${f(s[0])} ${f(s[1])}`);
      isPenDown = true;
      if (span >= 359.999) {
        const h = at(c.from + (c.cw === true ? -180 : 180));
        out.push(
          `A${f(rp)} ${f(rp)} 0 1 ${sweep} ${f(h[0])} ${f(h[1])} A${f(rp)} ${f(rp)} 0 1 ${sweep} ${f(s[0])} ${f(s[1])}`,
        );
      } else {
        const e = at(c.cw === true ? c.from - span : c.from + span);
        out.push(`A${f(rp)} ${f(rp)} 0 ${span > 180 ? 1 : 0} ${sweep} ${f(e[0])} ${f(e[1])}`);
      }
    }
  }
  return out.join(" ");
}

/** A shape made of sides and arcs, filled with a tone (and outlined when `isOutlined`). */
export function PathShape({
  cmds,
  tone,
  isEvenOdd,
  isOutlined,
  part,
  class: extra,
}: {
  cmds: readonly PathCmd[];
  tone?: Tone;
  isEvenOdd?: boolean;
  isOutlined?: boolean;
  part?: string;
  class?: string;
}): JSX.Element {
  const space = useSpace();
  return (
    <path
      class={`gk-region gk-${tone ?? "accent"}${isOutlined === true ? " gk-outlined" : ""}${extra === undefined ? "" : ` ${extra}`}`}
      d={pathD(cmds, (p) => px(space, p), unitPx(space))}
      fill-rule={isEvenOdd === true ? "evenodd" : undefined}
      data-part={part}
    />
  );
}

/** Shape helpers, in model units. */
export const shapes = {
  polygon: (pts: readonly Pt[]): PathCmd[] => [
    ...pts.map((p, i): PathCmd => ({ k: i === 0 ? "M" : "L", p })),
    { k: "Z" },
  ],
  rect: (x0: number, y0: number, x1: number, y1: number): PathCmd[] =>
    shapes.polygon([
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ]),
  circle: (c: Pt, r: number): PathCmd[] => [{ k: "A", c, r, from: 0, to: 360 }, { k: "Z" }],
  sector: (c: Pt, r: number, from: number, to: number): PathCmd[] => [
    { k: "M", p: c },
    { k: "A", c, r, from, to },
    { k: "Z" },
  ],
  /** The part of the disc cut off by the chord between the arc's ends. */
  segment: (c: Pt, r: number, from: number, to: number): PathCmd[] => [
    { k: "A", c, r, from, to },
    { k: "Z" },
  ],
};
