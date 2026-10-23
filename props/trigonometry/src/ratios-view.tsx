import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { AngleArc, RightMark, fitPoints, pathOf } from "./draw";
import {
  GIVEN_STEPS,
  RatioReference,
  RatiosAction,
  RatiosPart,
  type RatiosState,
  SIZE_MAX,
  angleOf,
  givenSideTex,
  lengthsOf,
  ratioAsSides,
  referenceAngleOf,
  sideRoles,
  valuesOf,
  workingOf,
} from "./ratios";
import {
  PARTNER,
  type Pt,
  type Ratio,
  SIDE_WORDS,
  type Side,
  type Words,
  numText,
  ratioName,
  say,
} from "./trig";
import { Button, Nudger } from "./ui";

const WORDS = {
  lookFrom: { en: "Look from", hi: "यहाँ से देखो:" },
  next: { en: "Next step", hi: "अगला कदम" },
  again: { en: "Start again", hi: "फिर से" },
  notDefined: { en: "not defined", hi: "परिभाषित नहीं" },
} as const satisfies Record<string, Words>;

const H = 200;

/** TeX like 2\sqrt{2}k as plain text for an SVG label: 2√2k. */
export const plainOf = (tex: string): string =>
  tex.replace(/\\sqrt\{(\d+)\}/g, "√$1").replace(/\\tfrac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2");

const SIDE_CLASS: Record<Side, string> = {
  opposite: "is-opposite",
  adjacent: "is-adjacent",
  hypotenuse: "is-hypotenuse",
};

/** A side's label: its role and/or length, pushed off the side away from the triangle. */
function SideText({
  p,
  q,
  away,
  lines,
  cls,
}: {
  p: Pt;
  q: Pt;
  away: Pt;
  lines: string[];
  cls: string;
}): JSX.Element {
  const m: Pt = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const dx = m[0] - away[0];
  const dy = m[1] - away[1];
  const len = Math.hypot(dx, dy) || 1;
  const gap = 14;
  const x = m[0] + (dx / len) * gap;
  const y = m[1] + (dy / len) * gap;
  const anchor = Math.abs(dx / len) < 0.3 ? "middle" : dx > 0 ? "start" : "end";
  return (
    <text
      class={`tr-side ${cls}`}
      x={x}
      y={y - ((lines.length - 1) * 12) / 2 + 4}
      text-anchor={anchor}
    >
      {lines.map((l, i) => (
        <tspan key={l} x={x} dy={i === 0 ? 0 : 12}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

export function RatiosView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as RatiosState;
  const l = lengthsOf(s);
  const roles = sideRoles(s);
  const [na, nb, nc] = s.names;
  const ref = s.reference === RatioReference.A ? na : nc;
  const other = s.reference === RatioReference.A ? nc : na;
  const refAngle = referenceAngleOf(s);
  const v = valuesOf(s);
  const k = givenSideTex(s.given ?? { ratio: "sin", num: 1, den: 2 });
  // Free mode keeps one frame for the largest triangle, so scaling visibly changes the size.
  const frame: Pt[] =
    s.given === null
      ? [
          [0, 0],
          [SIZE_MAX, 0],
          [SIZE_MAX, SIZE_MAX * 0.72],
        ]
      : [
          [0, 0],
          [l.ab, 0],
          [l.ab, l.bc],
        ];
  // Room on the right for the side label beside BC (Hindi words are long).
  const fit = fitPoints(frame, { left: 6, top: 4, width: width - 60, height: H - 8 }, 30);
  const A = fit.px([0, 0]);
  const B = fit.px([l.ab, 0]);
  const C = fit.px([l.ab, l.bc]);
  const centre: Pt = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
  const lenText = (seg: "ab" | "bc" | "ac"): string | null => {
    if (s.given !== null) {
      if (k === null) return null;
      const side = roles[seg];
      return plainOf(k[side]);
    }
    return s.showValues ? numText(l[seg], 1) : null;
  };
  const sideLines = (seg: "ab" | "bc" | "ac"): string[] => {
    const out: string[] = [];
    if (s.showSides) out.push(say(locale, SIDE_WORDS[roles[seg]]));
    const t = lenText(seg);
    if (t !== null) out.push(t);
    return out;
  };
  const angleLabel =
    s.given !== null
      ? ""
      : `${numText(s.reference === RatioReference.A ? angleOf(s) : refAngle, 0)}°`;
  const valueTex = (r: Ratio): string => {
    const val = v[r];
    if (s.given !== null) return "";
    if (!s.showValues) return "";
    return val === null ? `\\text{${say(locale, WORDS.notDefined)}}` : numText(val);
  };
  const work = workingOf(s);
  const label = `Right triangle ${na}${nb}${nc}, right angle at ${nb}, angle ${ref} = ${numText(refAngle, 1)}°`;
  return (
    <div class="tr tr-ratios">
      <Stage label={label} x={[0, width]} width={width} height={H} svg={{ class: "tr-svg" }}>
        <g data-part={RatiosPart.Triangle}>
          <path class="tr-triangle" d={pathOf([A, B, C])} />
          {(["ab", "bc", "ac"] as const).map((seg) => {
            const [p, q] = seg === "ab" ? [A, B] : seg === "bc" ? [B, C] : [A, C];
            return (
              <line
                key={seg}
                class={`tr-edge ${s.showSides ? SIDE_CLASS[roles[seg]] : ""}`}
                x1={p[0]}
                y1={p[1]}
                x2={q[0]}
                y2={q[1]}
              />
            );
          })}
          <RightMark v={B} p={A} q={C} size={9} />
          {s.reference === RatioReference.A ? (
            <AngleArc v={A} p={B} q={C} r={22} label={angleLabel} cls="tr-arc is-ref" />
          ) : (
            <AngleArc v={C} p={A} q={B} r={22} label={angleLabel} cls="tr-arc is-ref" />
          )}
          <text class="tr-vertex" x={A[0] - 10} y={A[1] + 14} text-anchor="middle">
            {na}
          </text>
          <text class="tr-vertex" x={B[0] + 10} y={B[1] + 14} text-anchor="middle">
            {nb}
          </text>
          <text class="tr-vertex" x={C[0] + 10} y={C[1] - 4} text-anchor="middle">
            {nc}
          </text>
        </g>
        <g data-part={RatiosPart.Sides}>
          <SideText p={A} q={B} away={centre} lines={sideLines("ab")} cls={SIDE_CLASS[roles.ab]} />
          <SideText p={B} q={C} away={centre} lines={sideLines("bc")} cls={SIDE_CLASS[roles.bc]} />
          <SideText p={A} q={C} away={centre} lines={sideLines("ac")} cls={SIDE_CLASS[roles.ac]} />
        </g>
      </Stage>
      {s.shown.length > 0 && s.given === null && (
        <div class="tr-list" data-part={RatiosPart.Ratios}>
          {s.shown.map((r) => {
            const value = valueTex(r);
            return (
              <p key={r}>
                <RichText
                  text={`$${ratioName(r, ref)} = ${ratioAsSides(s, r)}${value === "" ? "" : ` = ${value}`}$`}
                />
              </p>
            );
          })}
        </div>
      )}
      {s.showPairs && (
        <div class="tr-list is-pairs" data-part={RatiosPart.Pairs}>
          {s.shown.map((r) => (
            <p key={r}>
              <RichText
                text={`$${ratioName(r, ref)} = ${ratioName(PARTNER[r], other)} = ${ratioName(PARTNER[r], `(90^\\circ - ${ref})`)}$`}
              />
            </p>
          ))}
        </div>
      )}
      {s.given !== null && s.step > 0 && (
        <div class="tr-working" data-part={RatiosPart.Working}>
          {work.slice(0, s.step).map((line) => (
            <p key={line}>
              <RichText text={`$${line}$`} />
            </p>
          ))}
        </div>
      )}
      {(s.canSetAngle || s.canScale || s.canSwap || (s.given !== null && s.canStep)) && (
        <div class="tr-controls">
          {s.canSetAngle && s.given === null && (
            <Nudger
              name={na}
              value={`${numText(s.angle, 0)}°`}
              part={RatiosPart.Controls}
              canDown={s.angle > 5}
              canUp={s.angle < 85}
              onNudge={(by) => call(RatiosAction.NudgeAngle, { by })}
            />
          )}
          {s.canScale && (
            <Nudger
              name={`${na}${nc}`}
              value={numText(s.size, 1)}
              part={RatiosPart.Controls}
              canDown={s.size > 2}
              canUp={s.size < SIZE_MAX}
              onNudge={(by) => call(RatiosAction.NudgeSize, { by })}
            />
          )}
          {s.canSwap && s.given === null && (
            <Button
              isWide
              label={`${say(locale, WORDS.lookFrom)} ${other}`}
              part={RatiosPart.Controls}
              onPress={() => call(RatiosAction.Swap, {})}
            >
              {`${say(locale, WORDS.lookFrom)} ${other}`}
            </Button>
          )}
          {s.given !== null && s.canStep && (
            <Button
              isWide
              label={say(locale, s.step < GIVEN_STEPS ? WORDS.next : WORDS.again)}
              part={RatiosPart.Next}
              onPress={() =>
                call(s.step < GIVEN_STEPS ? RatiosAction.Next : RatiosAction.Reset, {})
              }
            >
              {say(locale, s.step < GIVEN_STEPS ? WORDS.next : WORDS.again)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
