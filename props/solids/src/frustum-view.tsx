import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { AxisMark, Cone, Frustum, HeightMark, Look, RadiusMark, fit, ring } from "./draw";
import {
  FrustumAction,
  FrustumMeasure,
  FrustumPart,
  type FrustumState,
  FrustumStep,
  frustumNumbers,
} from "./frustum";
import { SolidShape } from "./shapes";
import {
  type Words,
  alignedTex,
  answerTex,
  eqTex,
  numTex,
  numText,
  piTex,
  say,
  unitTex,
} from "./solids";
import { Button, Chips } from "./ui";

const WORDS = {
  next: { en: "Next", hi: "आगे" },
  again: { en: "Start again", hi: "फिर से" },
  find: { en: "Find", hi: "निकालो" },
  volume: { en: "Volume", hi: "आयतन" },
  curved: { en: "Curved surface", hi: "वक्र पृष्ठ" },
  total: { en: "Total surface", hi: "कुल पृष्ठ" },
  cone: { en: "The whole cone", hi: "पूरा शंकु" },
  plane: { en: "Cut parallel to the base", hi: "आधार के समांतर काटो" },
  lifted: { en: "Take the small cone off", hi: "छोटा शंकु हटाओ" },
  frustum: { en: "What is left: a frustum", hi: "जो बचा: छिन्नक" },
} as const satisfies Record<string, Words>;

const STEP_WORDS = [WORDS.cone, WORDS.plane, WORDS.lifted, WORDS.frustum];

/** The worked lines for the state's step and measure. */
export function frustumLines(s: FrustumState): string[] {
  const n = frustumNumbers(s);
  const v = (x: number) => numTex(x);
  const P = piTex(s.pi);
  const u1 = unitTex(s.unit, 1);
  const lines: string[] = [];
  if (s.step === FrustumStep.Cone) return lines;
  lines.push(
    `\\frac{h_2}{h_2 + h} = \\frac{r_2}{r_1} \\Rightarrow h_2 = \\frac{h\\,r_2}{r_1 - r_2} = \\frac{${v(s.h)} \\times ${v(s.r2)}}{${v(s.r1 - s.r2)}} ${eqTex(n.h2)} ${v(n.h2)}${u1}`,
  );
  if (s.step === FrustumStep.Plane) return lines;
  lines.push(`h_1 = h + h_2 ${eqTex(n.h1)} ${v(n.h1)}${u1}`);
  if (s.step === FrustumStep.Lifted) return lines;
  if (s.measure === FrustumMeasure.Volume) {
    lines.push(
      `V = \\tfrac{1}{3}\\pi r_1^2 h_1 - \\tfrac{1}{3}\\pi r_2^2 h_2 = \\tfrac{1}{3} \\times ${P} \\times (${v(s.r1 * s.r1 * n.h1)} - ${v(s.r2 * s.r2 * n.h2)})`,
    );
    lines.push(answerTex(n.volume, s.pi, s.unit, 3));
    lines.push(
      `\\text{and } \\tfrac{1}{3}\\pi h(r_1^2 + r_2^2 + r_1 r_2) ${answerTex(n.volume, s.pi, s.unit, 3)}`,
    );
  } else {
    lines.push(`l = \\sqrt{h^2 + (r_1 - r_2)^2} ${eqTex(n.l)} ${v(n.l)}${u1}`);
    lines.push(
      `\\pi r_1 l_1 - \\pi r_2 l_2 = \\pi(r_1 + r_2)\\,l = ${P} \\times ${v(s.r1 + s.r2)} \\times ${v(n.l)}`,
    );
    lines.push(answerTex(n.curved, s.pi, s.unit, 2));
    if (s.measure === FrustumMeasure.Total) {
      lines.push("\\text{TSA} = \\text{CSA} + \\pi r_1^2 + \\pi r_2^2");
      lines.push(answerTex(n.total, s.pi, s.unit, 2));
    }
  }
  return lines;
}

export function FrustumPicture({
  s,
  width,
  height,
}: { s: FrustumState; width: number; height: number }): JSX.Element {
  const n = frustumNumbers(s);
  const lift = s.step >= FrustumStep.Lifted ? n.h1 * 0.22 : 0;
  const top = s.step === FrustumStep.Frustum ? s.h : n.h1 + lift;
  const f = fit([{ y0: 0, y1: top, r: s.r1 }], width, height, 18, 0, 30);
  const unit = s.unit === "" ? "" : ` ${s.unit}`;
  const plane = ring(f, s.h, s.r2 * 1.9);
  return (
    <Stage
      label={`A frustum of a cone, step ${s.step + 1}`}
      x={[0, width]}
      width={width}
      height={height}
      svg={{ class: "so-svg" }}
    >
      <g class="so-solid" data-part={FrustumPart.Picture}>
        {s.step <= FrustumStep.Plane && (
          <g>
            <Cone f={f} yBase={0} yApex={n.h1} r={s.r1} look={Look.Solid} tone={1} />
            <AxisMark f={f} y0={0} y1={n.h1} label={`h₁ = ${numText(n.h1)}${unit}`} />
            <RadiusMark f={f} y={0} r={s.r1} label={`r₁ = ${numText(s.r1)}${unit}`} isBelow />
          </g>
        )}
        {s.step === FrustumStep.Plane && (
          <ellipse class="so-plane" cx={plane.x} cy={plane.y} rx={plane.rx} ry={plane.ry} />
        )}
        {s.step === FrustumStep.Lifted && (
          <g class="so-lift">
            <Frustum f={f} y0={0} y1={s.h} rBottom={s.r1} rTop={s.r2} look={Look.Solid} tone={1} />
            <g class="is-lifting">
              <Cone
                f={f}
                yBase={s.h + lift}
                yApex={n.h1 + lift}
                r={s.r2}
                look={Look.Ghost}
                tone={2}
              />
              <HeightMark
                f={f}
                y0={s.h + lift}
                y1={n.h1 + lift}
                x={s.r2 * 1.3}
                label={`h₂ = ${numText(n.h2)}${unit}`}
              />
            </g>
            <HeightMark
              f={f}
              y0={0}
              y1={s.h}
              x={s.r1 * 1.08}
              label={`h = ${numText(s.h)}${unit}`}
            />
          </g>
        )}
        {s.step === FrustumStep.Frustum && (
          <SolidShape
            f={f}
            solid="frustum"
            d={{ l: 1, b: 1, a: 1, r: 1, r1: s.r1, r2: s.r2, h: s.h }}
            labels={{ show: true, values: true, unit: s.unit }}
          />
        )}
      </g>
    </Stage>
  );
}

export function FrustumView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as FrustumState;
  const height = Math.round(Math.min(280, width * 0.75));
  const lines = frustumLines(s);
  return (
    <div class="so-frustum">
      <div class="so-caption">{say(locale, STEP_WORDS[s.step] ?? WORDS.cone)}</div>
      <FrustumPicture s={s} width={width} height={height} />
      {s.showLines && lines.length > 0 && (
        <div class="so-lines" data-part={FrustumPart.Lines}>
          <RichText text={alignedTex(lines)} />
        </div>
      )}
      {s.canPick && s.step === FrustumStep.Frustum && (
        <Chips
          part={FrustumPart.Measures}
          label={say(locale, WORDS.find)}
          value={s.measure}
          options={[
            { id: FrustumMeasure.Volume, text: say(locale, WORDS.volume) },
            { id: FrustumMeasure.Curved, text: say(locale, WORDS.curved) },
            { id: FrustumMeasure.Total, text: say(locale, WORDS.total) },
          ]}
          onPick={(measure) => call(FrustumAction.Pick, { measure })}
        />
      )}
      {s.canStep && (
        <div class="so-controls">
          {s.step > 0 && (
            <Button
              isWide
              part={FrustumPart.Back}
              label={say(locale, WORDS.again)}
              onPress={() => call(FrustumAction.Back, {})}
            >
              {say(locale, WORDS.again)}
            </Button>
          )}
          {s.step < FrustumStep.Frustum && (
            <Button
              isWide
              part={FrustumPart.Step}
              label={say(locale, WORDS.next)}
              onPress={() => call(FrustumAction.Step, {})}
            >
              {say(locale, WORDS.next)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
