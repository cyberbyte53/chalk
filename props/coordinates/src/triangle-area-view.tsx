import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import {
  DragHandle,
  type LabelItem,
  Labels,
  PointDot,
  type Pt,
  Region,
  RightMark,
  Seg,
  StepBar,
  type Words,
  say,
} from "@chalk/prop-circles/kit";
import type { JSX } from "preact";
import { Grid, planeFrame } from "./grid";
import { coordText, pairText, ptOf } from "./plane";
import {
  AREA_STEP_COUNT,
  AreaAction,
  AreaPart,
  type AreaState,
  areaOf,
  isCollinearOf,
  workingOf,
} from "./triangle-area";

export const AREA_WORDS = {
  move: { en: "move", hi: "खिसकाओ" },
  area: { en: "Area", hi: "क्षेत्रफल" },
  squareUnits: { en: "square units", hi: "वर्ग इकाई" },
  collinear: {
    en: "Area 0: the three points are collinear (on one line), so there is no triangle",
    hi: "क्षेत्रफल 0: तीनों बिंदु संरेख (एक रेखा पर) हैं, इसलिए त्रिभुज नहीं बनता",
  },
} as const satisfies Record<string, Words>;

/** The derivation's captions, with this triangle's names (L, M, R are the vertices by x). */
export function areaSteps(
  names: string[],
  feet: string[],
  order: [number, number, number],
): Words[] {
  const [l, m, r] = order;
  const [L, M, R] = [names[l], names[m], names[r]] as [string, string, string];
  const [fL, fM, fR] = [feet[l], feet[m], feet[r]] as [string, string, string];
  const [n1, n2, n3] = names as [string, string, string];
  const [f1, f2, f3] = feet as [string, string, string];
  const t1 = `${M}${L}${fL}${fM}`;
  const t2 = `${M}${fM}${fR}${R}`;
  const t3 = `${L}${fL}${fR}${R}`;
  return [
    {
      en: `∆${n1}${n2}${n3} with ${n1}(x₁, y₁), ${n2}(x₂, y₂) and ${n3}(x₃, y₃). How big is it?`,
      hi: `∆${n1}${n2}${n3}, जिसमें ${n1}(x₁, y₁), ${n2}(x₂, y₂) और ${n3}(x₃, y₃) हैं। यह कितना बड़ा है?`,
    },
    {
      en: `Draw ${n1}${f1}, ${n2}${f2} and ${n3}${f3} perpendicular to the x-axis. They make three trapezia: ${t1}, ${t2} and ${t3}.`,
      hi: `x-अक्ष पर लंब ${n1}${f1}, ${n2}${f2} और ${n3}${f3} खींचो। इनसे तीन समलंब बनते हैं: ${t1}, ${t2} और ${t3}।`,
    },
    {
      en: `Add the two trapezia under the upper sides: ${t1} + ${t2}.`,
      hi: `ऊपर की दो भुजाओं के नीचे के दोनों समलंब जोड़ो: ${t1} + ${t2}।`,
    },
    {
      en: `Take away the trapezium under the long side, ${t3}. What is left is exactly ∆${n1}${n2}${n3}.`,
      hi: `लंबी भुजा के नीचे का समलंब ${t3} घटाओ। जो बचता है, वह ठीक ∆${n1}${n2}${n3} है।`,
    },
    {
      en: "Each trapezium is ½ × (sum of its parallel sides) × (the distance between them). Put in the coordinates and simplify: area = ½ [x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)].",
      hi: "हर समलंब = ½ × (समांतर भुजाओं का योग) × (उनके बीच की दूरी)। निर्देशांक रखकर सरल करो: क्षेत्रफल = ½ [x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)]।",
    },
  ];
}

export function TriangleAreaView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as AreaState;
  const { frame, height } = planeFrame(s.window, width);
  const pts = s.points.map(ptOf) as [Pt, Pt, Pt];
  const names = s.points.map((p) => p.name);
  const order = [0, 1, 2].sort((i, j) => (pts[i] as Pt)[0] - (pts[j] as Pt)[0]) as [
    number,
    number,
    number,
  ];
  const step = s.proof ? s.step : -1;
  const foot = (i: number): Pt => [(pts[i] as Pt)[0], 0];
  const trap = (i: number, j: number): Pt[] => [pts[i] as Pt, pts[j] as Pt, foot(j), foot(i)];
  const [l, m, r] = order;
  const isFlat = isCollinearOf(s);
  const area = areaOf(s);
  const centre: Pt = [
    (pts[0][0] + pts[1][0] + pts[2][0]) / 3,
    (pts[0][1] + pts[1][1] + pts[2][1]) / 3,
  ];
  const labels: LabelItem[] = s.points.map((p, i) => ({
    id: `v${i}`,
    at: pts[i] as Pt,
    text: s.showCoords ? `${p.name}${pairText(pts[i] as Pt)}` : p.name,
    away: isFlat ? undefined : centre,
    prefer: isFlat ? 315 : undefined,
  }));
  if (step >= 1)
    s.feet.forEach((f, i) => labels.push({ id: `f${i}`, at: foot(i), text: f, prefer: 90 }));
  const sides: [Pt, Pt][] = [
    [pts[0], pts[1]],
    [pts[1], pts[2]],
    [pts[2], pts[0]],
  ];
  const steps = s.proof ? areaSteps(names, s.feet, order) : [];
  const lines = s.showWorking && (!s.proof || step >= AREA_STEP_COUNT - 1) ? workingOf(s) : [];
  return (
    <div class="co co-area">
      <Stage
        label={`Triangle ${s.points.map((p, i) => `${p.name}${pairText(pts[i] as Pt)}`).join(", ")}; area ${coordText(area)} square units${isFlat ? " (the points are collinear)" : ""}`}
        x={frame.x}
        y={frame.y}
        width={width}
        height={height}
        svg={{ class: "co-svg" }}
      >
        <g data-part={AreaPart.Plane}>
          <Grid win={s.window} />
        </g>
        {step >= 2 && (
          <g data-part={AreaPart.Trapezia}>
            {step === 2 && (
              <>
                <Region points={trap(m, l)} tone="accent" />
                <Region points={trap(m, r)} tone="construction" />
              </>
            )}
            {step >= 3 && <Region points={trap(l, r)} tone="muted" />}
          </g>
        )}
        {!isFlat && (step < 0 || step === 0 || step === 1 || step >= 3) && (
          <g data-part={AreaPart.Triangle}>
            <Region points={pts} tone={step >= 3 || step < 0 ? "result" : "main"} />
          </g>
        )}
        {step >= 1 &&
          [0, 1, 2].map((i) => (
            <g key={i}>
              <Seg from={pts[i] as Pt} to={foot(i)} tone="construction" dashed />
              <RightMark vertex={foot(i)} p={pts[i] as Pt} q={[foot(i)[0] + 1, 0]} size={6} />
            </g>
          ))}
        {step >= 3 && <Seg from={pts[l] as Pt} to={pts[r] as Pt} tone="wrong" dashed />}
        {sides.map(([a, b], i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: three sides in order
          <Seg key={i} from={a} to={b} tone={isFlat ? "wrong" : "main"} />
        ))}
        {pts.map((p, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: three vertices in order
          <PointDot key={i} at={p} tone={s.movable.includes(i) ? "accent" : "main"} />
        ))}
        <Labels items={labels} segments={sides} />
        {s.points.map((p, i) =>
          s.movable.includes(i) ? (
            <DragHandle
              // biome-ignore lint/suspicious/noArrayIndexKey: three vertices in order
              key={i}
              at={pts[i] as Pt}
              label={`${say(locale, AREA_WORDS.move)} ${p.name}: ${pairText(pts[i] as Pt)}`}
              onMove={(to) => call(AreaAction.SetPoint, { i, x: to[0], y: to[1], isSnapped: true })}
              onStep={(d) =>
                call(AreaAction.Nudge, { i, dx: d[0] as -1 | 0 | 1, dy: d[1] as -1 | 0 | 1 })
              }
            />
          ) : null,
        )}
      </Stage>
      {s.proof && (
        <div class="co-caption" data-part={AreaPart.Steps} aria-live="polite">
          <p>{say(locale, steps[step] as Words)}</p>
          <StepBar
            step={step}
            count={AREA_STEP_COUNT}
            locale={locale}
            onNext={() => call(AreaAction.Next, {})}
            onBack={() => call(AreaAction.Back, {})}
            onAgain={() => call(AreaAction.Again, {})}
          />
        </div>
      )}
      {lines.length > 0 && (
        <div class="co-working" data-part={AreaPart.Working} aria-live="polite">
          {lines.map((line) => (
            <p key={line}>
              <RichText text={`$${line}$`} />
            </p>
          ))}
        </div>
      )}
      {!s.proof && (
        <p class={`co-verdict${isFlat ? " is-on" : ""}`} data-part={AreaPart.Verdict}>
          {isFlat ? (
            say(locale, AREA_WORDS.collinear)
          ) : (
            <strong>
              {say(locale, AREA_WORDS.area)} = {coordText(area)}{" "}
              {say(locale, AREA_WORDS.squareUnits)}
            </strong>
          )}
        </p>
      )}
    </div>
  );
}
