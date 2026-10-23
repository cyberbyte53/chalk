import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { AngleArc, RightMark, fitPoints, pathOf } from "./draw";
import {
  SPECIAL_WORKING,
  SpecialAction,
  SpecialMode,
  SpecialPart,
  type SpecialState,
  stepCountOf,
} from "./special";
import {
  EXACT,
  type Pt,
  type Ratio,
  SPECIAL_ANGLES,
  type Words,
  numText,
  ratioName,
  ratioValue,
  say,
} from "./trig";
import { Button, Nudger } from "./ui";

const WORDS = {
  next: { en: "Next step", hi: "अगला कदम" },
  again: { en: "Start again", hi: "फिर से" },
  notDefined: { en: "not defined", hi: "परिभाषित नहीं" },
  angle: { en: "Angle", hi: "कोण" },
  flatZero: { en: "C has reached B: AC lies along AB", hi: "C, B पर पहुँच गया: AC, AB पर पड़ा है" },
  flatNinety: { en: "A has reached B: AC lies along BC", hi: "A, B पर पहुँच गया: AC, BC पर पड़ा है" },
} as const satisfies Record<string, Words>;

const H = 190;

function Label({
  p,
  text,
  dx = 0,
  dy = 0,
}: { p: Pt; text: string; dx?: number; dy?: number }): JSX.Element {
  return (
    <text class="tr-vertex" x={p[0] + dx} y={p[1] + dy} text-anchor="middle">
      {text}
    </text>
  );
}

function SquareFigure({ width, step }: { width: number; step: number }): JSX.Element {
  const fit = fitPoints(
    [
      [0, 0],
      [1, 1],
    ],
    { left: 0, top: 4, width, height: H - 8 },
    28,
  );
  const A = fit.px([0, 0]);
  const B = fit.px([1, 0]);
  const C = fit.px([1, 1]);
  const D = fit.px([0, 1]);
  return (
    <g data-part={SpecialPart.Figure}>
      <path class="tr-ghost" d={pathOf([A, B, C, D])} />
      <path class="tr-triangle" d={pathOf([A, B, C])} />
      <RightMark v={B} p={A} q={C} />
      <AngleArc v={A} p={B} q={C} r={22} label="45°" cls="tr-arc is-ref" />
      <AngleArc v={C} p={A} q={B} r={22} label="45°" cls="tr-arc" />
      <Label p={A} text="A" dx={-10} dy={14} />
      <Label p={B} text="B" dx={10} dy={14} />
      <Label p={C} text="C" dx={10} dy={-4} />
      <text class="tr-side" x={(A[0] + B[0]) / 2} y={A[1] + 16} text-anchor="middle">
        a
      </text>
      <text class="tr-side" x={B[0] + 8} y={(B[1] + C[1]) / 2 + 4} text-anchor="start">
        a
      </text>
      <text
        class="tr-side is-hypotenuse"
        x={(A[0] + C[0]) / 2 - 12}
        y={(A[1] + C[1]) / 2 - 4}
        text-anchor="end"
      >
        {step >= 2 ? "a√2" : "?"}
      </text>
    </g>
  );
}

function EquilateralFigure({ width, step }: { width: number; step: number }): JSX.Element {
  const h = Math.sqrt(3);
  const fit = fitPoints(
    [
      [-1, 0],
      [1, 0],
      [0, h],
    ],
    { left: 0, top: 4, width, height: H - 8 },
    26,
  );
  const A = fit.px([0, h]);
  const B = fit.px([-1, 0]);
  const C = fit.px([1, 0]);
  const D = fit.px([0, 0]);
  return (
    <g data-part={SpecialPart.Figure}>
      <path class="tr-ghost" d={pathOf([A, B, C])} />
      <path class="tr-triangle" d={pathOf([A, B, D])} />
      <line class="tr-altitude" x1={A[0]} y1={A[1]} x2={D[0]} y2={D[1]} />
      <RightMark v={D} p={B} q={A} />
      <AngleArc v={A} p={B} q={D} r={24} label={step >= 1 ? "30°" : ""} cls="tr-arc is-ref" />
      <AngleArc v={B} p={C} q={A} r={20} label="60°" cls="tr-arc" />
      <Label p={A} text="A" dy={-6} />
      <Label p={B} text="B" dx={-10} dy={14} />
      <Label p={C} text="C" dx={10} dy={14} />
      <Label p={D} text="D" dy={16} />
      <text
        class="tr-side is-hypotenuse"
        x={(A[0] + B[0]) / 2 - 10}
        y={(A[1] + B[1]) / 2}
        text-anchor="end"
      >
        2a
      </text>
      <text class="tr-side" x={(A[0] + C[0]) / 2 + 10} y={(A[1] + C[1]) / 2} text-anchor="start">
        2a
      </text>
      <text class="tr-side" x={(B[0] + D[0]) / 2} y={B[1] + 16} text-anchor="middle">
        {step >= 1 ? "a" : ""}
      </text>
      <text class="tr-side" x={(D[0] + C[0]) / 2} y={B[1] + 16} text-anchor="middle">
        {step >= 1 ? "a" : ""}
      </text>
      <text class="tr-side is-opposite" x={A[0] + 6} y={(A[1] + D[1]) / 2 + 4} text-anchor="start">
        {step >= 2 ? "a√3" : ""}
      </text>
    </g>
  );
}

function LimitsFigure({
  width,
  angle,
  locale,
}: { width: number; angle: number; locale: string }): JSX.Element {
  // Hypotenuse fixed at 1: AB = cos A, BC = sin A. Frame for the whole quarter turn.
  const fit = fitPoints(
    [
      [0, 0],
      [1, 0],
      [1, 1],
    ],
    { left: 0, top: 4, width, height: H - 30 },
    26,
  );
  const r = (angle * Math.PI) / 180;
  const c = angle === 90 ? 0 : Math.cos(r);
  const sn = angle === 0 ? 0 : Math.sin(r);
  // B stays put at the right; A slides along the ground, C up the upright.
  const A = fit.px([1 - c, 0]);
  const B = fit.px([1, 0]);
  const C = fit.px([1, sn]);
  const flat = angle === 0 ? WORDS.flatZero : angle === 90 ? WORDS.flatNinety : null;
  return (
    <g data-part={SpecialPart.Figure}>
      <line class="tr-ground-line" x1={fit.px([0, 0])[0]} y1={B[1]} x2={B[0]} y2={B[1]} />
      <line class="tr-ground-line" x1={B[0]} y1={B[1]} x2={B[0]} y2={fit.px([1, 1])[1]} />
      {flat === null && <path class="tr-triangle" d={pathOf([A, B, C])} />}
      {flat === null && <RightMark v={B} p={A} q={C} />}
      {flat === null && (
        <AngleArc v={A} p={B} q={C} r={20} label={`${angle}°`} cls="tr-arc is-ref" />
      )}
      {flat !== null && (
        <line class="tr-edge is-hypotenuse" x1={A[0]} y1={A[1]} x2={C[0]} y2={C[1]} />
      )}
      <Label p={A} text="A" dx={angle === 90 ? 12 : -8} dy={14} />
      <Label p={B} text="B" dx={10} dy={14} />
      <Label p={C} text="C" dx={10} dy={angle === 0 ? -6 : -4} />
      {flat !== null && (
        <text class="tr-note" x={width / 2} y={H - 8} text-anchor="middle">
          {say(locale, flat)}
        </text>
      )}
    </g>
  );
}

export function SpecialView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SpecialState;
  const total = stepCountOf(s);
  const notDefined = `\\text{${say(locale, WORDS.notDefined)}}`;
  const figure =
    s.mode === SpecialMode.Square ? (
      <SquareFigure width={width} step={s.step} />
    ) : s.mode === SpecialMode.Equilateral ? (
      <EquilateralFigure width={width} step={s.step} />
    ) : (
      <LimitsFigure width={width} angle={s.angle} locale={locale} />
    );
  const label =
    s.mode === SpecialMode.Square
      ? "Half a square: right triangle ABC with AB = BC = a"
      : s.mode === SpecialMode.Equilateral
        ? "Equilateral triangle ABC of side 2a with altitude AD"
        : `Right triangle ABC with angle A = ${s.angle}°`;
  const sinV = ratioValue("sin", s.angle);
  const cosV = ratioValue("cos", s.angle);
  const tanV = ratioValue("tan", s.angle);
  return (
    <div class="tr tr-special">
      <Stage label={label} x={[0, width]} width={width} height={H} svg={{ class: "tr-svg" }}>
        {figure}
      </Stage>
      {s.mode !== SpecialMode.Limits && s.step > 0 && (
        <div class="tr-working" data-part={SpecialPart.Working}>
          {SPECIAL_WORKING[s.mode].slice(0, s.step).map((line) => (
            <p key={line}>
              <RichText text={`$${line}$`} />
            </p>
          ))}
        </div>
      )}
      {s.mode === SpecialMode.Limits && (
        <div class="tr-readout" data-part={SpecialPart.Readout}>
          <span class="tr-chip">
            <RichText text={`$\\sin ${s.angle}^\\circ = ${numText(sinV ?? 0, 3)}$`} />
          </span>
          <span class="tr-chip">
            <RichText text={`$\\cos ${s.angle}^\\circ = ${numText(cosV ?? 0, 3)}$`} />
          </span>
          <span class="tr-chip">
            <RichText
              text={`$\\tan ${s.angle}^\\circ = ${tanV === null ? notDefined : numText(tanV, 3)}$`}
            />
          </span>
        </div>
      )}
      {s.showTable && (
        <div class="tr-table-wrap" data-part={SpecialPart.Table}>
          <table class="tr-table">
            <thead>
              <tr>
                <th>
                  <RichText text="$\angle A$" />
                </th>
                {SPECIAL_ANGLES.map((a) => (
                  <th key={a} class={s.filled.includes(a) ? "is-filled" : ""}>
                    {`${a}°`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.rows.map((r) => (
                <tr key={r}>
                  <th>
                    <RichText text={`$${ratioName(r as Ratio, "A")}$`} />
                  </th>
                  {SPECIAL_ANGLES.map((a) => {
                    const v = EXACT[a][r as Ratio];
                    return (
                      <td key={a} class={s.filled.includes(a) ? "is-filled" : ""}>
                        {s.filled.includes(a) ? (
                          v === null ? (
                            <span class="tr-not-defined">{say(locale, WORDS.notDefined)}</span>
                          ) : (
                            <RichText text={`$${v}$`} />
                          )
                        ) : (
                          ""
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {((s.mode === SpecialMode.Limits && s.canTurn) ||
        (s.mode !== SpecialMode.Limits && s.canStep)) && (
        <div class="tr-controls">
          {s.mode === SpecialMode.Limits && s.canTurn && (
            <Nudger
              name="A"
              value={`${s.angle}°`}
              part={SpecialPart.Controls}
              canDown={s.angle > 0}
              canUp={s.angle < 90}
              onNudge={(by) => call(SpecialAction.Nudge, { by })}
            />
          )}
          {s.mode !== SpecialMode.Limits && s.canStep && (
            <Button
              isWide
              label={say(locale, s.step < total ? WORDS.next : WORDS.again)}
              part={SpecialPart.Next}
              onPress={() => call(s.step < total ? SpecialAction.Next : SpecialAction.Reset, {})}
            >
              {say(locale, s.step < total ? WORDS.next : WORDS.again)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
