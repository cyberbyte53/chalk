import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  ConstructionAction,
  ConstructionPart,
  type ConstructionState,
  type Item,
  type Step,
  stepsOf,
} from "./construction";
import { StepBar } from "./kit/controls";
import { frameOf } from "./kit/frame";
import { type Pt, add, say, scale, unit } from "./kit/geometry";
import {
  AngleMark,
  ArcShape,
  CircleShape,
  EqualTicks,
  type LabelItem,
  Labels,
  ParallelMarks,
  PointDot,
  RightMark,
  Seg,
} from "./kit/pieces";
import { Compass, Ruler } from "./kit/tools";

const H = 250;

/** Every point a construction ever draws, so the frame stays put from the first step to the last. */
function extentOf(steps: readonly Step[]): Pt[] {
  const out: Pt[] = [];
  for (const st of steps)
    for (const it of st.items) {
      switch (it.k) {
        case "seg":
        case "ray":
        case "ticks":
        case "parallel":
          out.push(it.from, it.to);
          break;
        case "circle":
          out.push(add(it.c, [-it.r, -it.r]), add(it.c, [it.r, it.r]));
          break;
        case "arc":
          for (const a of [it.from, (it.from + it.to) / 2, it.to])
            out.push(add(it.c, scale(unit(a), it.r)));
          break;
        case "point":
        case "label":
          out.push(it.at);
          break;
        case "right":
        case "angle":
          out.push(it.v);
          break;
      }
    }
  return out;
}

function Piece({ it, isNew }: { it: Item; isNew: boolean }): JSX.Element | null {
  switch (it.k) {
    case "seg":
      return (
        <Seg from={it.from} to={it.to} tone={it.tone ?? "main"} dashed={it.dashed} isNew={isNew} />
      );
    case "ray":
      return <Seg from={it.from} to={it.to} tone={it.tone ?? "construction"} isNew={isNew} />;
    case "circle":
      return <CircleShape centre={it.c} r={it.r} tone={it.tone ?? "main"} isNew={isNew} />;
    case "arc":
      return (
        <ArcShape
          centre={it.c}
          r={it.r}
          from={it.from}
          to={it.to}
          tone={it.tone ?? "construction"}
          isNew={isNew}
        />
      );
    case "point":
      return <PointDot at={it.at} kind={it.kind} tone={it.tone} isNew={isNew} />;
    case "right":
      return <RightMark vertex={it.v} p={it.p} q={it.q} />;
    case "angle":
      return (
        <AngleMark
          vertex={it.v}
          p={it.p}
          q={it.q}
          label={it.label}
          count={it.count}
          tone={it.tone}
        />
      );
    case "ticks":
      return <EqualTicks from={it.from} to={it.to} count={it.count} />;
    case "parallel":
      return <ParallelMarks from={it.from} to={it.to} count={it.count} />;
    case "label":
      return null;
  }
}

export function ConstructionView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ConstructionState;
  const steps = stepsOf(s);
  const step = Math.min(s.step, steps.length - 1);
  const now = steps[step] as Step;
  const frame = frameOf(extentOf(steps), { width, height: H }, 22);
  const shown = steps
    .slice(0, step + 1)
    .flatMap((st, i) => st.items.map((it) => ({ it, isNew: i === step && step > 0 })));
  const labels: LabelItem[] = shown.flatMap(({ it }, i) =>
    it.k === "label"
      ? [
          {
            id: `l${i}`,
            at: it.at,
            text: it.text,
            prefer: it.prefer,
            away: it.away,
            tone: it.tone,
            kind: it.small === true ? ("length" as const) : ("point" as const),
          },
        ]
      : [],
  );
  const segments = shown.flatMap(({ it }) =>
    it.k === "seg" || it.k === "ray" ? [[it.from, it.to] as [Pt, Pt]] : [],
  );
  const circles = shown.flatMap(({ it }) => (it.k === "circle" ? [{ c: it.c, r: it.r }] : []));
  const tool = s.showTool ? now.tool : undefined;
  return (
    <div class="ci ci-construction">
      <Stage
        label={`Construction, step ${step + 1} of ${steps.length}: ${now.caption.en}`}
        x={frame.x}
        y={frame.y}
        width={width}
        height={H}
        svg={{ class: "ci-svg" }}
      >
        <g data-part={ConstructionPart.Figure}>
          {shown.map(({ it, isNew }, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: steps only ever add items at the end
            <Piece key={`${step}-${i}`} it={it} isNew={isNew} />
          ))}
        </g>
        <Labels items={labels} segments={segments} circles={circles} />
        {tool?.k === "compass" && <Compass centre={tool.c} r={tool.r} angle={tool.angle} />}
        {tool?.k === "ruler" && <Ruler from={tool.from} to={tool.to} />}
      </Stage>
      <p class="ci-caption" data-part={ConstructionPart.Caption} aria-live="polite">
        {say(locale, now.caption)}
      </p>
      {s.canStep && (
        <StepBar
          step={step}
          count={steps.length}
          locale={locale}
          part={ConstructionPart.Steps}
          onNext={() => call(ConstructionAction.Next, {})}
          onBack={() => call(ConstructionAction.Back, {})}
          onAgain={() => call(ConstructionAction.Reset, {})}
        />
      )}
    </div>
  );
}
