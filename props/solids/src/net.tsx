import { Stage } from "@chalk/draw";
import type { JSX } from "preact";
import { type Dims, Solid, numText, slantOfCone, slantOfFrustum } from "./solids";

/**
 * A solid opened out flat. The curved (or side) surface is one shape, the flat faces others:
 *   cylinder: a rectangle 2πr by h, and two circles;
 *   cone: a sector of radius l whose arc is 2πr, and the base circle;
 *   frustum: a ring piece (a sector of radius L minus one of radius L − l), and two circles;
 *   cuboid, cube: six rectangles in a cross;
 *   sphere, hemisphere: no flat net; the area as circles of radius r (four, or two plus the base).
 * Drawn in model units, then scaled to fit.
 */

type Shape =
  | { kind: "rect"; x: number; y: number; w: number; h: number; isCurved: boolean }
  | { kind: "circle"; x: number; y: number; r: number; isCurved: boolean }
  | { kind: "poly"; points: [number, number][]; isCurved: boolean };
type Note = { x: number; y: number; text: string; anchor?: "start" | "middle" | "end" };

/** Points along an arc of radius R about (0, 0), angles measured from straight down. */
function arc(R: number, from: number, to: number, steps = 48): [number, number][] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = from + ((to - from) * i) / steps;
    return [R * Math.sin(t), R * Math.cos(t)] as [number, number];
  });
}

function netOf(
  solid: Solid,
  d: Dims,
  values: boolean,
  unit: string,
): { shapes: Shape[]; notes: Note[] } {
  const u = unit === "" ? "" : ` ${unit}`;
  const lab = (letter: string, v: number) => (values ? `${letter} = ${numText(v)}${u}` : letter);
  switch (solid) {
    case Solid.Cylinder: {
      const w = 2 * Math.PI * d.r;
      return {
        shapes: [
          { kind: "rect", x: 0, y: 0, w, h: d.h, isCurved: true },
          { kind: "circle", x: d.r, y: -d.r, r: d.r, isCurved: false },
          { kind: "circle", x: d.r, y: d.h + d.r, r: d.r, isCurved: false },
        ],
        notes: [
          { x: w / 2, y: d.h / 2, text: values ? `2πr = ${numText(w)}${u}` : "2πr" },
          { x: w + w * 0.02, y: d.h / 2, text: lab("h", d.h), anchor: "start" },
        ],
      };
    }
    case Solid.Cone: {
      const l = slantOfCone(d.r, d.h);
      const theta = (2 * Math.PI * d.r) / l;
      const rim = arc(l, -theta / 2, theta / 2);
      return {
        shapes: [
          { kind: "poly", points: [[0, 0], ...rim], isCurved: true },
          { kind: "circle", x: 0, y: l + d.r, r: d.r, isCurved: false },
        ],
        notes: [
          {
            x: l * Math.sin(theta / 4),
            y: l * Math.cos(theta / 4) * 0.5,
            text: lab("l", l),
            anchor: "start",
          },
          { x: 0, y: l * 0.72, text: "2πr" },
        ],
      };
    }
    case Solid.Frustum: {
      const l = slantOfFrustum(d.r1, d.r2, d.h);
      const L = (l * d.r1) / (d.r1 - d.r2);
      const inner = L - l;
      const theta = (2 * Math.PI * d.r1) / L;
      const outerArc = arc(L, -theta / 2, theta / 2);
      const innerArc = arc(inner, theta / 2, -theta / 2);
      return {
        shapes: [
          { kind: "poly", points: [...outerArc, ...innerArc], isCurved: true },
          { kind: "circle", x: 0, y: L + d.r1, r: d.r1, isCurved: false },
          { kind: "circle", x: 0, y: inner - d.r2, r: d.r2, isCurved: false },
        ],
        notes: [
          {
            x: (L - l / 2) * Math.sin(theta / 2),
            y: (L - l / 2) * Math.cos(theta / 2),
            text: lab("l", l),
            anchor: "start",
          },
          { x: 0, y: L + d.r1, text: values ? `r₁ = ${numText(d.r1)}${u}` : "r₁" },
          { x: 0, y: inner - d.r2, text: values ? `r₂ = ${numText(d.r2)}${u}` : "r₂" },
        ],
      };
    }
    case Solid.Cuboid:
    case Solid.Cube: {
      const l = solid === Solid.Cube ? d.a : d.l;
      const b = solid === Solid.Cube ? d.a : d.b;
      const h = solid === Solid.Cube ? d.a : d.h;
      const rect = (x: number, y: number, w: number, hh: number, isCurved: boolean): Shape => ({
        kind: "rect",
        x,
        y,
        w,
        h: hh,
        isCurved,
      });
      // Columns: left side (b wide), the middle (l wide), right side (b wide).
      // Rows down the middle: top (b), front (h), bottom (b), back (h).
      return {
        shapes: [
          rect(b, 0, l, b, false),
          rect(b, b, l, h, true),
          rect(0, b, b, h, true),
          rect(b + l, b, b, h, true),
          rect(b, b + h, l, b, false),
          rect(b, 2 * b + h, l, h, true),
        ],
        notes: [
          { x: b + l / 2, y: b + h / 2, text: solid === Solid.Cube ? lab("a", l) : lab("l", l) },
          { x: b + l + b / 2, y: b + h / 2, text: solid === Solid.Cube ? "" : lab("b", b) },
          {
            x: b - b * 0.08,
            y: b + h / 2,
            text: solid === Solid.Cube ? "" : lab("h", h),
            anchor: "end",
          },
        ],
      };
    }
    case Solid.Sphere: {
      const r = d.r;
      return {
        shapes: [0, 1, 2, 3].map((i) => ({
          kind: "circle" as const,
          x: (i % 2) * 2.3 * r,
          y: Math.floor(i / 2) * 2.3 * r,
          r,
          isCurved: true,
        })),
        notes: [0, 1, 2, 3].map((i) => ({
          x: (i % 2) * 2.3 * r,
          y: Math.floor(i / 2) * 2.3 * r,
          text: "πr²",
        })),
      };
    }
    case Solid.Hemisphere: {
      const r = d.r;
      return {
        shapes: [
          { kind: "circle", x: 0, y: 0, r, isCurved: true },
          { kind: "circle", x: 2.3 * r, y: 0, r, isCurved: true },
          { kind: "circle", x: 4.6 * r, y: 0, r, isCurved: false },
        ],
        notes: [
          { x: 0, y: 0, text: "πr²" },
          { x: 2.3 * r, y: 0, text: "πr²" },
          { x: 4.6 * r, y: 0, text: "πr²" },
        ],
      };
    }
  }
}

function boundsOf(shapes: Shape[]): { x0: number; x1: number; y0: number; y1: number } {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const s of shapes) {
    if (s.kind === "rect") {
      xs.push(s.x, s.x + s.w);
      ys.push(s.y, s.y + s.h);
    } else if (s.kind === "circle") {
      xs.push(s.x - s.r, s.x + s.r);
      ys.push(s.y - s.r, s.y + s.r);
    } else {
      for (const [x, y] of s.points) {
        xs.push(x);
        ys.push(y);
      }
    }
  }
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

/** The net, fitted to `width` × at most `maxHeight` px. */
export function Net({
  solid,
  d,
  width,
  maxHeight,
  unit,
  values,
  isCurvedLit,
  label,
}: {
  solid: Solid;
  d: Dims;
  width: number;
  maxHeight: number;
  unit: string;
  values: boolean;
  isCurvedLit: boolean;
  label: string;
}): JSX.Element {
  const { shapes, notes } = netOf(solid, d, values, unit);
  const b = boundsOf(shapes);
  const pad = 26;
  const k = Math.min((width - 2 * pad) / (b.x1 - b.x0), (maxHeight - 2 * pad) / (b.y1 - b.y0));
  const height = Math.ceil((b.y1 - b.y0) * k + 2 * pad);
  const ox = (width - (b.x1 - b.x0) * k) / 2 - b.x0 * k;
  const oy = pad - b.y0 * k;
  const X = (x: number) => Math.round((ox + x * k) * 10) / 10;
  const Y = (y: number) => Math.round((oy + y * k) * 10) / 10;
  const cls = (s: Shape) =>
    `so-net-piece${s.isCurved ? " is-curved" : ""}${s.isCurved && isCurvedLit ? " is-lit" : ""}`;
  return (
    <Stage label={label} x={[0, width]} width={width} height={height} svg={{ class: "so-svg" }}>
      <g data-part="net">
        {shapes.map((s) =>
          s.kind === "rect" ? (
            <rect
              key={`r${s.x},${s.y}`}
              class={cls(s)}
              x={X(s.x)}
              y={Y(s.y)}
              width={X(s.x + s.w) - X(s.x)}
              height={Y(s.y + s.h) - Y(s.y)}
            />
          ) : s.kind === "circle" ? (
            <circle
              key={`c${s.x},${s.y}`}
              class={cls(s)}
              cx={X(s.x)}
              cy={Y(s.y)}
              r={Math.round(s.r * k * 10) / 10}
            />
          ) : (
            <path
              key={`p${s.points[0]?.join(",")}`}
              class={cls(s)}
              d={`${s.points.map(([x, y], j) => `${j === 0 ? "M" : "L"} ${X(x)} ${Y(y)}`).join(" ")} Z`}
            />
          ),
        )}
        {notes
          .filter((t) => t.text !== "")
          .map((t) => (
            <text
              key={`${t.text}-${t.x}-${t.y}`}
              class="so-dim-text"
              x={X(t.x)}
              y={Y(t.y) + 4}
              text-anchor={t.anchor ?? "middle"}
            >
              {t.text}
            </text>
          ))}
      </g>
    </Stage>
  );
}
