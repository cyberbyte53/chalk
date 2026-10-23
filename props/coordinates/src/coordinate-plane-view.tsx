import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import {
  DragHandle,
  type LabelItem,
  Labels,
  PointDot,
  type Pt,
  RightMark,
  Seg,
  StepBar,
  type Words,
  clean,
  mid,
  say,
} from "@chalk/prop-circles/kit";
import type { JSX } from "preact";
import {
  PROOF_STEPS,
  PlaneAction,
  PlaneJoin,
  PlanePart,
  type PlaneState,
  collinearOf,
  d2Of,
  sidesOf,
  workingOf,
} from "./coordinate-plane";
import { Grid, planeFrame } from "./grid";
import { coordText, dist2, pairText, ptOf, sqrtText } from "./plane";

export const PLANE_WORDS = {
  move: { en: "move", hi: "खिसकाओ" },
  collinear: { en: "The three points lie on one line", hi: "तीनों बिंदु एक रेखा पर हैं" },
} as const satisfies Record<string, Words>;

export function CoordinatePlaneView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as PlaneState;
  const { frame, height } = planeFrame(s.window, width);
  const pts: Pt[] = s.points.map(ptOf);
  const names = s.points.map((p) => p.name);
  const P = pts[0] as Pt;
  const Q = (pts[1] ?? pts[0]) as Pt;
  const T: Pt = [Q[0], P[1]];
  const R: Pt = [P[0], 0];
  const S: Pt = [Q[0], 0];
  const step = s.proof ? s.step : PROOF_STEPS.length - 1;
  const tri = s.points.length >= 2 && (s.showTriangle || s.proof);
  const showFeet = s.proof && step >= 1;
  const showT = tri && step >= 2;
  const showLegs = tri && step >= 3;
  const sides = sidesOf(s);
  const centre: Pt = [
    pts.reduce((a, p) => a + p[0], 0) / pts.length,
    pts.reduce((a, p) => a + p[1], 0) / pts.length,
  ];
  const labels: LabelItem[] = s.points.map((p, i) => ({
    id: `p${i}`,
    at: pts[i] as Pt,
    text: s.showCoords ? `${p.name}${pairText(pts[i] as Pt)}` : p.name,
    away: pts.length > 1 ? centre : undefined,
    prefer: pts.length > 1 ? undefined : 315,
  }));
  if (s.showLengths)
    for (const [i, j] of sides)
      labels.push({
        id: `s${i}${j}`,
        at: mid(pts[i] as Pt, pts[j] as Pt),
        text: sqrtText(dist2(pts[i] as Pt, pts[j] as Pt)),
        kind: "length",
        tone: "result",
        away: centre,
      });
  if (showT && !near0(P[0] - Q[0]) && !near0(P[1] - Q[1]))
    labels.push({ id: "t", at: T, text: "T", away: mid(P, Q) });
  if (showFeet) {
    labels.push({ id: "r", at: R, text: "R", prefer: 90 });
    labels.push({ id: "s", at: S, text: "S", prefer: 90 });
  }
  if (showLegs) {
    labels.push({
      id: "pt",
      at: mid(P, T),
      text: coordText(Math.abs(clean(Q[0] - P[0]))),
      kind: "length",
      tone: "accent",
      away: Q,
    });
    labels.push({
      id: "qt",
      at: mid(Q, T),
      text: coordText(Math.abs(clean(Q[1] - P[1]))),
      kind: "length",
      tone: "accent",
      away: P,
    });
  }
  const segs: [Pt, Pt][] = sides.map(([i, j]) => [pts[i] as Pt, pts[j] as Pt]);
  const isCollinear = collinearOf(s);
  const lines =
    s.showWorking && s.points.length >= 2 && (!s.proof || step >= 4) ? workingOf(s) : [];
  const caption = s.proof ? (PROOF_STEPS[step] as Words) : null;
  const pqName = `${names[0] ?? ""}${names[1] ?? ""}`;
  return (
    <div class="co co-plane">
      <Stage
        label={`Graph paper with ${s.points.map((p, i) => `${p.name}${pairText(pts[i] as Pt)}`).join(", ")}${s.points.length >= 2 ? `; ${pqName} = ${sqrtText(d2Of(s))}` : ""}`}
        x={frame.x}
        y={frame.y}
        width={width}
        height={height}
        svg={{ class: "co-svg" }}
      >
        <g data-part={PlanePart.Plane}>
          <Grid win={s.window} quadrants={s.showQuadrants} />
        </g>
        {showFeet && (
          <g>
            <Seg from={P} to={R} tone="construction" dashed />
            <Seg from={Q} to={S} tone="construction" dashed />
            <RightMark vertex={R} p={P} q={[R[0] + 1, 0]} size={7} />
            <RightMark vertex={S} p={Q} q={[S[0] + 1, 0]} size={7} />
            <PointDot at={R} tone="muted" />
            <PointDot at={S} tone="muted" />
          </g>
        )}
        {tri && showT && !near0(P[0] - Q[0]) && !near0(P[1] - Q[1]) && (
          <g data-part={PlanePart.Triangle}>
            <Seg from={P} to={T} tone="accent" dashed />
            <Seg from={T} to={Q} tone="accent" dashed />
            <RightMark vertex={T} p={P} q={Q} />
          </g>
        )}
        {segs.map(([a, b], i) => (
          <Seg
            // biome-ignore lint/suspicious/noArrayIndexKey: sides in order
            key={i}
            from={a}
            to={b}
            tone={s.join === PlaneJoin.Segment || (tri && i === 0) ? "result" : "main"}
          />
        ))}
        <g data-part={PlanePart.Points}>
          {pts.map((p, i) => (
            <PointDot
              // biome-ignore lint/suspicious/noArrayIndexKey: points in order
              key={i}
              at={p}
              tone={s.movable.includes(i) ? "accent" : "main"}
            />
          ))}
        </g>
        <Labels items={labels} segments={segs} />
        {s.points.map((p, i) =>
          s.movable.includes(i) ? (
            <DragHandle
              // biome-ignore lint/suspicious/noArrayIndexKey: points in order
              key={i}
              at={pts[i] as Pt}
              label={`${say(locale, PLANE_WORDS.move)} ${p.name}: ${pairText(pts[i] as Pt)}`}
              part={`${PlanePart.Points}-${i}`}
              onMove={(to) =>
                call(PlaneAction.SetPoint, { i, x: to[0], y: to[1], isSnapped: true })
              }
              onStep={(d) =>
                call(PlaneAction.Nudge, { i, dx: d[0] as -1 | 0 | 1, dy: d[1] as -1 | 0 | 1 })
              }
            />
          ) : null,
        )}
      </Stage>
      {caption !== null && (
        <div class="co-caption" data-part={PlanePart.Steps} aria-live="polite">
          <p>{say(locale, caption)}</p>
          <StepBar
            step={step}
            count={PROOF_STEPS.length}
            locale={locale}
            onNext={() => call(PlaneAction.Next, {})}
            onBack={() => call(PlaneAction.Back, {})}
            onAgain={() => call(PlaneAction.Again, {})}
          />
        </div>
      )}
      {lines.length > 0 && (
        <div class="co-working" data-part={PlanePart.Working} aria-live="polite">
          {lines.map((l) => (
            <p key={l}>
              <RichText text={`$${l}$`} />
            </p>
          ))}
        </div>
      )}
      {s.points.length >= 3 && s.join !== PlaneJoin.None && s.showLengths && isCollinear && (
        <p class="co-verdict is-on">{say(locale, PLANE_WORDS.collinear)}</p>
      )}
    </div>
  );
}

const near0 = (v: number) => Math.abs(v) < 1e-9;
