import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { AngleArc, RightMark, centreOf, fitPoints, pathOf } from "./draw";
import {
  DivideBy,
  IDENTITY_TEX,
  IdentityAction,
  IdentityPart,
  type IdentityState,
  checkOf,
  sidesOf,
} from "./identity";
import { type Pt, type Words, numText, say } from "./trig";
import { Button, Nudger } from "./ui";

const WORDS = {
  divide: { en: "Divide by the square of the", hi: "किसके वर्ग से भाग दें:" },
  hypotenuse: { en: "hypotenuse", hi: "कर्ण" },
  adjacent: { en: "adjacent", hi: "संलग्न भुजा" },
  opposite: { en: "opposite", hi: "सम्मुख भुजा" },
} as const satisfies Record<string, Words>;

/** Plain-text side names for SVG labels. */
const PLAIN: Record<DivideBy, { ab: string; bc: string; ac: string }> = {
  [DivideBy.Hypotenuse]: { ab: "cos A", bc: "sin A", ac: "1" },
  [DivideBy.Adjacent]: { ab: "1", bc: "tan A", ac: "sec A" },
  [DivideBy.Opposite]: { ab: "cot A", bc: "1", ac: "cosec A" },
};

const sq = (name: string): string => name.replace(" A", "²A");
/** The area label of a square: "1" for the unit side, else "cos²A = 0.67". */
const areaText = (name: string, area: number): string =>
  name === "1" ? "1" : `${sq(name)} = ${numText(area)}`;

const H = 230;

/** An area label that fits its square: one line, two lines, the name alone, or nothing. */
function lines(text: string, side: number): string[] {
  const [name, value] = text.split(" = ");
  if (value === undefined) return side > 14 ? [text] : [];
  if (side > 78) return [text];
  if (side > 32) return [name as string, value];
  return side > 22 ? [name as string] : [];
}

export function IdentityView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as IdentityState;
  const { ab, bc, ac } = sidesOf(s);
  const names = PLAIN[s.divideBy];
  const n: Pt = [-bc, ab];
  const model = {
    A: [0, 0] as Pt,
    B: [ab, 0] as Pt,
    C: [ab, bc] as Pt,
  };
  const sqAB: Pt[] = [model.A, model.B, [ab, -ab], [0, -ab]];
  const sqBC: Pt[] = [model.B, model.C, [ab + bc, bc], [ab + bc, 0]];
  const sqAC: Pt[] = [model.A, model.C, [ab + n[0], bc + n[1]], [n[0], n[1]]];
  const all = s.showSquares ? [...sqAB, ...sqBC, ...sqAC] : [model.A, model.B, model.C];
  const fit = fitPoints(all, { left: 0, top: 4, width, height: H - 8 }, 18);
  const px = (pts: Pt[]): Pt[] => pts.map((p) => fit.px(p));
  const A = fit.px(model.A);
  const B = fit.px(model.B);
  const C = fit.px(model.C);
  const centre = centreOf([A, B, C]);
  const c = checkOf(s);
  const square = (pts: Pt[], cls: string, text: string): JSX.Element => {
    const p = px(pts);
    const m = centreOf(p);
    const [p0, p1] = pts as [Pt, Pt];
    const side = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) * fit.k;
    return (
      <g>
        <path class={`tr-square ${cls}`} d={pathOf(p)} />
        {lines(text, side).map((line, i, all) => (
          <text
            key={line}
            class="tr-area"
            x={m[0]}
            y={m[1] + 4 + (i - (all.length - 1) / 2) * 12}
            text-anchor="middle"
          >
            {line}
          </text>
        ))}
      </g>
    );
  };
  const sideText = (p: Pt, q: Pt, text: string, cls: string): JSX.Element => {
    const m: Pt = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const dx = centre[0] - m[0];
    const dy = centre[1] - m[1];
    const l = Math.hypot(dx, dy) || 1;
    return (
      <text
        class={`tr-side ${cls}`}
        x={m[0] + (dx / l) * 12}
        y={m[1] + (dy / l) * 12 + 4}
        text-anchor="middle"
      >
        {text}
      </text>
    );
  };
  return (
    <div class="tr tr-identity">
      <Stage
        label={`Right triangle with angle A = ${s.angle}° and sides ${names.ab}, ${names.bc}, ${names.ac}`}
        x={[0, width]}
        width={width}
        height={H}
        svg={{ class: "tr-svg" }}
      >
        {s.showSquares && (
          <g data-part={IdentityPart.Squares}>
            {square(sqAB, "is-adjacent", areaText(names.ab, ab * ab))}
            {square(sqBC, "is-opposite", areaText(names.bc, bc * bc))}
            {square(sqAC, "is-hypotenuse", areaText(names.ac, ac * ac))}
          </g>
        )}
        <g data-part={IdentityPart.Triangle}>
          <path class="tr-triangle" d={pathOf([A, B, C])} />
          <RightMark v={B} p={A} q={C} size={8} />
          <AngleArc v={A} p={B} q={C} r={18} label={`${s.angle}°`} cls="tr-arc is-ref" />
          {/* With the squares drawn, their labels name the sides; without, the sides are named. */}
          {!s.showSquares && sideText(A, B, names.ab, "is-adjacent")}
          {!s.showSquares && sideText(B, C, names.bc, "is-opposite")}
          {!s.showSquares && sideText(A, C, names.ac, "is-hypotenuse")}
        </g>
      </Stage>
      <div class="tr-working" data-part={IdentityPart.Check}>
        <p>
          <RichText text={`$${IDENTITY_TEX[s.divideBy]}$`} />
        </p>
        <p>
          <RichText text={`$${c.tex}$`} />
        </p>
      </div>
      {(s.canSetAngle || s.canDivide) && (
        <div class="tr-controls" data-part={IdentityPart.Controls}>
          {s.canSetAngle && (
            <Nudger
              name="A"
              value={`${s.angle}°`}
              canDown={s.angle > 5}
              canUp={s.angle < 85}
              onNudge={(by) => call(IdentityAction.NudgeAngle, { by })}
            />
          )}
          {s.canDivide && (
            <div class="tr-choose">
              <span class="tr-choose-label">{say(locale, WORDS.divide)}</span>
              {([DivideBy.Hypotenuse, DivideBy.Adjacent, DivideBy.Opposite] as const).map((d) => (
                <Button
                  key={d}
                  isWide
                  isOn={s.divideBy === d}
                  label={say(locale, WORDS[d])}
                  onPress={() => call(IdentityAction.Divide, { by: d })}
                >
                  {say(locale, WORDS[d])}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
