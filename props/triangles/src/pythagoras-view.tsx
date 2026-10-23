import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { AngleArc, RightMark, VertexLabel, centreOf, fitPoints, pathOf } from "./draw";
import { type Pt, type Words, numText, placeTriangle, say } from "./geometry";
import {
  PROOF_STEPS,
  PythAction,
  PythMode,
  PythPart,
  PythSide,
  type PythState,
  altitudeOf,
  angleBOf,
  rightAtOf,
  sidesOf,
  squaresOf,
} from "./pythagoras";
import { Button, Nudger } from "./ui";

const WORDS = {
  next: { en: "Next step", hi: "अगला कदम" },
  again: { en: "Start again", hi: "फिर से" },
  right: { en: "Right angle at", hi: "समकोण है" },
  notRight: { en: "No right angle", hi: "कोई समकोण नहीं" },
} as const satisfies Record<string, Words>;

const H = 230;

/** A square built outward on segment p→q (away from `inside`). */
function squareOn(p: Pt, q: Pt, inside: Pt): Pt[] {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  let nx = -dy;
  let ny = dx;
  const mx = (p[0] + q[0]) / 2;
  const my = (p[1] + q[1]) / 2;
  if ((inside[0] - mx) * nx + (inside[1] - my) * ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  return [p, q, [q[0] + nx, q[1] + ny], [p[0] + nx, p[1] + ny]];
}

/** Grid lines inside a square of whole side n (corners in pixels). */
function gridLines(sq: Pt[], n: number): JSX.Element[] {
  const [p, q, , s] = sq as [Pt, Pt, Pt, Pt];
  const out: JSX.Element[] = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const a: Pt = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
    const b: Pt = [s[0] + (q[0] - p[0]) * t, s[1] + (q[1] - p[1]) * t];
    const c: Pt = [p[0] + (s[0] - p[0]) * t, p[1] + (s[1] - p[1]) * t];
    const d: Pt = [q[0] + (s[0] - p[0]) * t, q[1] + (s[1] - p[1]) * t];
    out.push(<line key={`g${i}a`} class="tg-grid" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />);
    out.push(<line key={`g${i}b`} class="tg-grid" x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} />);
  }
  return out;
}

export function PythagorasView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as PythState;
  const [A, B, C, D] = s.names as [string, string, string, string];
  const t = sidesOf(s);
  const q = squaresOf(s);
  const right = rightAtOf(s);
  const tri = placeTriangle(t);
  const showSquares = s.mode !== PythMode.Altitude;
  const inside = centreOf([tri.a, tri.b, tri.c]);
  const sqAB = squareOn(tri.a, tri.b, inside);
  const sqBC = squareOn(tri.b, tri.c, inside);
  const sqCA = squareOn(tri.c, tri.a, inside);
  const all = showSquares ? [...sqAB, ...sqBC, ...sqCA] : [tri.a, tri.b, tri.c];
  const fit = fitPoints(all, { left: 0, top: 0, width, height: H }, showSquares ? 14 : 28);
  const a = fit.px(tri.a);
  const b = fit.px(tri.b);
  const c = fit.px(tri.c);
  const centre = centreOf([a, b, c]);
  const whole = (x: number) => Number.isInteger(x) && x <= 12;
  const square = (sq: Pt[], area: number, side: number, cls: string) => {
    const px = sq.map(fit.px);
    const m = centreOf(px);
    return (
      <g>
        <path class={`tg-square ${cls}`} d={pathOf(px)} />
        {whole(side) && gridLines(px, side)}
        {s.showAreas && (
          <text class="tg-area" x={m[0]} y={m[1] + 5} text-anchor="middle">
            {numText(area)}
          </text>
        )}
      </g>
    );
  };
  // Altitude: D is the foot of the perpendicular from B to AC.
  const alt = altitudeOf(s);
  const dModel: Pt = [
    tri.a[0] + ((tri.c[0] - tri.a[0]) * alt.ad) / t.ca,
    tri.a[1] + ((tri.c[1] - tri.a[1]) * alt.ad) / t.ca,
  ];
  const d = fit.px(dModel);
  const work: (string | string[])[] = [
    `${B}${D} \\perp ${A}${C}`,
    [
      `\\triangle ${A}${D}${B} \\sim \\triangle ${A}${B}${C} \\Rightarrow \\dfrac{${A}${D}}{${A}${B}} = \\dfrac{${A}${B}}{${A}${C}}`,
      `\\Rightarrow ${A}${D}\\cdot ${A}${C} = ${A}${B}^2`,
    ],
    `\\triangle ${B}${D}${C} \\sim \\triangle ${A}${B}${C} \\Rightarrow ${C}${D}\\cdot ${A}${C} = ${B}${C}^2`,
    [
      `${A}${C}(${A}${D} + ${C}${D}) = ${A}${B}^2 + ${B}${C}^2`,
      `\\Rightarrow ${A}${C}^2 = ${A}${B}^2 + ${B}${C}^2`,
    ],
  ];
  const vertexName = (v: "A" | "B" | "C") => (v === "A" ? A : v === "B" ? B : C);
  return (
    <div class="tg tg-pyth">
      <Stage
        label={`Triangle ${A}${B}${C} with sides ${numText(t.ab)}, ${numText(t.bc)}, ${numText(t.ca)}${right === null ? "" : `, right-angled at ${vertexName(right)}`}`}
        x={[0, width]}
        width={width}
        height={H}
        svg={{ class: "tg-svg" }}
      >
        {showSquares && (
          <g data-part={PythPart.Squares}>
            {square(sqAB, q.ab, t.ab, "is-one")}
            {square(sqBC, q.bc, t.bc, "is-two")}
            {square(sqCA, q.ca, t.ca, "is-three")}
          </g>
        )}
        <g data-part={PythPart.Triangle}>
          <path class="tg-shape-1" d={pathOf([a, b, c])} />
        </g>
        {s.mode === PythMode.Altitude && (
          <g data-part={PythPart.Altitude}>
            {s.step >= 2 && <path class="tg-part is-one" d={pathOf([a, d, b])} />}
            {s.step >= 3 && <path class="tg-part is-two" d={pathOf([b, d, c])} />}
            {s.step >= 1 && (
              <>
                <line class="tg-cut is-parallel" x1={b[0]} y1={b[1]} x2={d[0]} y2={d[1]} />
                <RightMark v={d} p={b} q={c} size={8} />
                <circle class="tg-point" cx={d[0]} cy={d[1]} r={3.5} />
                <VertexLabel at={d} centre={b} text={D} gap={13} />
              </>
            )}
          </g>
        )}
        <g>
          {right === "B" && <RightMark v={b} p={a} q={c} />}
          {right === "A" && <RightMark v={a} p={b} q={c} />}
          {right === "C" && <RightMark v={c} p={a} q={b} />}
          {s.mode === PythMode.Converse && right !== "B" && (
            <AngleArc v={b} p={c} q={a} r={14} label={`${numText(angleBOf(s), 0)}°`} />
          )}
          <VertexLabel at={a} centre={centre} text={A} gap={showSquares ? 9 : 12} />
          <VertexLabel at={b} centre={centre} text={B} gap={showSquares ? 9 : 12} />
          <VertexLabel at={c} centre={centre} text={C} gap={showSquares ? 9 : 12} />
        </g>
      </Stage>
      {s.mode === PythMode.Squares && s.showAreas && (
        <p class="tg-verdict is-on" data-part={PythPart.Triangle}>
          {`${A}${B}² + ${B}${C}² = ${numText(q.ab)} + ${numText(q.bc)} = ${numText(q.ca)} = ${A}${C}²`}
        </p>
      )}
      {s.mode === PythMode.Converse && (
        <p class={`tg-verdict ${right === null ? "is-off" : "is-on"}`} data-part={PythPart.Verdict}>
          {right === null
            ? `${say(locale, WORDS.notRight)}: ${A}${B}² + ${B}${C}² = ${numText(q.ab + q.bc)}, ${A}${C}² = ${numText(q.ca)}`
            : `${say(locale, WORDS.right)} ${vertexName(right)}`}
        </p>
      )}
      {s.mode === PythMode.Altitude && (
        <div class="tg-working" data-part={PythPart.Working}>
          {work
            .slice(0, s.step + 1)
            .flat()
            .map((line) => (
              <p key={line}>
                <RichText text={`$${line}$`} />
              </p>
            ))}
        </div>
      )}
      {(s.canSetSides || (s.mode === PythMode.Altitude && s.canStep)) && (
        <div class="tg-controls">
          {s.canSetSides && (
            <>
              <Nudger
                name={`${A}${B}`}
                value={numText(t.ab)}
                part={PythPart.Controls}
                canDown={t.ab > s.sideStep + 1e-9}
                onNudge={(by) => call(PythAction.NudgeSide, { side: PythSide.AB, by })}
              />
              <Nudger
                name={`${B}${C}`}
                value={numText(t.bc)}
                part={PythPart.Controls}
                canDown={t.bc > s.sideStep + 1e-9}
                onNudge={(by) => call(PythAction.NudgeSide, { side: PythSide.BC, by })}
              />
              {s.mode === PythMode.Converse && (
                <Nudger
                  name={`${A}${C}`}
                  value={numText(t.ca)}
                  part={PythPart.Controls}
                  canDown={t.ca > s.sideStep + 1e-9}
                  onNudge={(by) => call(PythAction.NudgeSide, { side: PythSide.CA, by })}
                />
              )}
            </>
          )}
          {s.mode === PythMode.Altitude && s.canStep && (
            <Button
              isWide
              label={say(locale, s.step < PROOF_STEPS ? WORDS.next : WORDS.again)}
              part={PythPart.Next}
              onPress={() => call(s.step < PROOF_STEPS ? PythAction.Next : PythAction.Reset, {})}
            >
              {say(locale, s.step < PROOF_STEPS ? WORDS.next : WORDS.again)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
