import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import {
  DragHandle,
  type LabelItem,
  Labels,
  Nudger,
  PointDot,
  type Pt,
  RightMark,
  Seg,
  type Words,
  lerp,
  say,
  sub,
} from "@chalk/prop-circles/kit";
import type { JSX } from "preact";
import { Grid, planeFrame } from "./grid";
import { pairText } from "./plane";
import {
  SectionAction,
  SectionPart,
  type SectionState,
  isMidpointOf,
  pointOf,
  workingOf,
} from "./section-divider";

export const SECTION_WORDS = {
  dragP: { en: "drag P along the segment", hi: "P को खंड पर खिसकाओ" },
  move: { en: "move", hi: "खिसकाओ" },
  midpoint: { en: "P is the mid-point", hi: "P मध्य-बिंदु है" },
  ratio: { en: "ratio", hi: "अनुपात" },
} as const satisfies Record<string, Words>;

export function SectionDividerView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SectionState;
  const { frame, height } = planeFrame(s.window, width);
  const A = s.a as Pt;
  const B = s.b as Pt;
  const P = pointOf(s);
  const [nA, nB, nP] = s.names as [string, string, string];
  const parts = s.m + s.n;
  const Q: Pt = [P[0], A[1]];
  const C: Pt = [B[0], P[1]];
  const isUpright = Math.abs(B[0] - A[0]) < 1e-9 || Math.abs(B[1] - A[1]) < 1e-9;
  const labels: LabelItem[] = [
    { id: "a", at: A, text: s.showCoords ? `${nA}${pairText(A)}` : nA, away: B },
    { id: "b", at: B, text: s.showCoords ? `${nB}${pairText(B)}` : nB, away: A },
    {
      id: "p",
      at: P,
      text: s.showCoords ? `${nP}${pairText(P)}` : nP,
      tone: "accent",
      prefer: B[1] >= A[1] === B[0] >= A[0] ? 315 : 45,
    },
  ];
  if (s.showSimilar && !isUpright) {
    labels.push({ id: "q", at: Q, text: "Q", away: P });
    labels.push({ id: "c", at: C, text: "C", away: P });
  }
  const along = (to: Pt) => {
    const d = sub(B, A);
    const l2 = d[0] * d[0] + d[1] * d[1] || 1;
    const w = sub(to, A);
    return (w[0] * d[0] + w[1] * d[1]) / l2;
  };
  const lines = s.showWorking ? workingOf(s) : [];
  return (
    <div class="co co-section">
      <Stage
        label={`${nA}${pairText(A)} to ${nB}${pairText(B)}; ${nP}${pairText(P)} divides it in ${s.m} : ${s.n}`}
        x={frame.x}
        y={frame.y}
        width={width}
        height={height}
        svg={{ class: "co-svg" }}
      >
        <g data-part={SectionPart.Plane}>
          <Grid win={s.window} />
        </g>
        {s.showSimilar && !isUpright && (
          <g data-part={SectionPart.Triangles}>
            <Seg from={A} to={Q} tone="accent" dashed />
            <Seg from={Q} to={P} tone="accent" dashed />
            <RightMark vertex={Q} p={A} q={P} />
            <Seg from={P} to={C} tone="construction" dashed />
            <Seg from={C} to={B} tone="construction" dashed />
            <RightMark vertex={C} p={P} q={B} />
          </g>
        )}
        <g data-part={SectionPart.Segment}>
          <Seg from={A} to={P} tone="accent" />
          <Seg from={P} to={B} tone="main" />
          {s.showParts &&
            Array.from({ length: parts - 1 }, (_, i) => (
              <PointDot
                // biome-ignore lint/suspicious/noArrayIndexKey: equal parts in order
                key={i}
                at={lerp(A, B, (i + 1) / parts)}
                kind="hollow"
                tone="muted"
              />
            ))}
          <PointDot at={A} />
          <PointDot at={B} />
        </g>
        <g data-part={SectionPart.Point}>
          <PointDot at={P} tone="accent" />
        </g>
        <Labels items={labels} segments={[[A, B]]} />
        {s.canMove && (
          <>
            <DragHandle
              at={A}
              label={`${say(locale, SECTION_WORDS.move)} ${nA}: ${pairText(A)}`}
              onMove={(to) => call(SectionAction.SetEnd, { end: "a", x: to[0], y: to[1] })}
              onStep={(d) =>
                call(SectionAction.SetEnd, { end: "a", x: A[0] + d[0], y: A[1] + d[1] })
              }
            />
            <DragHandle
              at={B}
              label={`${say(locale, SECTION_WORDS.move)} ${nB}: ${pairText(B)}`}
              onMove={(to) => call(SectionAction.SetEnd, { end: "b", x: to[0], y: to[1] })}
              onStep={(d) =>
                call(SectionAction.SetEnd, { end: "b", x: B[0] + d[0], y: B[1] + d[1] })
              }
            />
          </>
        )}
        {s.canRatio && (
          <DragHandle
            at={P}
            label={`${say(locale, SECTION_WORDS.dragP)}: ${nA}${nP} : ${nP}${nB} = ${s.m} : ${s.n}`}
            part={SectionPart.Point}
            onMove={(to) => call(SectionAction.SetAlong, { t: along(to) })}
            onStep={(d) =>
              d[0] + d[1] >= 0
                ? s.n > 1
                  ? call(SectionAction.SetRatio, { m: s.m + 1, n: s.n - 1 })
                  : undefined
                : s.m > 1
                  ? call(SectionAction.SetRatio, { m: s.m - 1, n: s.n + 1 })
                  : undefined
            }
          />
        )}
      </Stage>
      <p class={`co-verdict${isMidpointOf(s) ? " is-on" : ""}`} data-part={SectionPart.Ratio}>
        <strong>
          {nA}
          {nP} : {nP}
          {nB} = {s.m} : {s.n}
        </strong>
        {isMidpointOf(s) && ` · ${say(locale, SECTION_WORDS.midpoint)}`}
      </p>
      {s.canRatio && (
        <div class="co-controls">
          <Nudger
            locale={locale}
            name="m₁"
            value={`${s.m}`}
            canDown={s.m > 1}
            canUp={s.m < 12}
            onNudge={(by) => call(SectionAction.NudgeM, { by })}
          />
          <Nudger
            locale={locale}
            name="m₂"
            value={`${s.n}`}
            canDown={s.n > 1}
            canUp={s.n < 12}
            onNudge={(by) => call(SectionAction.NudgeN, { by })}
          />
        </div>
      )}
      {lines.length > 0 && (
        <div class="co-working" data-part={SectionPart.Working} aria-live="polite">
          {lines.map((l) => (
            <p key={l}>
              <RichText text={`$${l}$`} />
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
