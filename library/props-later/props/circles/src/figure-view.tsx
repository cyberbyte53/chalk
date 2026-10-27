import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  FigureAction,
  FigurePart,
  type FigurePathCmd,
  type FigureState,
  describeFigure,
  figureStepCountOf,
  placeOf,
} from "./figure";
import { StepBar } from "./kit/controls";
import { frameOf } from "./kit/frame";
import { type Pt, say } from "./kit/geometry";
import { type PathCmd, PathShape } from "./kit/path";
import {
  AngleMark,
  ArcShape,
  CircleShape,
  EqualTicks,
  type LabelItem,
  Labels,
  ParallelMarks,
  PointDot,
  Region,
  RightMark,
  Seg,
} from "./kit/pieces";

/** The view of a geoFigure: the figure up to the current step, its caption, and the stepper. */
export function FigureView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as FigureState;
  const count = figureStepCountOf(s);
  const step = Math.min(s.step, count - 1);
  const H = s.height;
  const isShown = (from: number | undefined) => (from ?? 0) <= step;
  const isNew = (from: number | undefined) => step > 0 && (from ?? 0) === step;
  const at = (p: Parameters<typeof placeOf>[1]): Pt => placeOf(s, p);
  const cmdsOf = (cmds: readonly FigurePathCmd[]): PathCmd[] =>
    cmds.map((c) =>
      c.k === "Z"
        ? c
        : c.k === "A"
          ? { k: "A", c: at(c.c), r: c.r, from: c.from, to: c.to, cw: c.cw }
          : { k: c.k, p: at(c.p) },
    );

  // Fit every point, circle and arc, shown or not, so the figure never jumps.
  const extent: Pt[] = s.points.map((p) => p.at);
  const arcPoints = (c: Pt, r: number, from: number, to: number, cw?: boolean) => {
    let sweep = cw === true ? from - to : to - from;
    sweep = ((sweep % 360) + 360) % 360 || 360;
    for (let k = 0; k <= 12; k++) {
      const a = ((from + ((cw === true ? -1 : 1) * sweep * k) / 12) * Math.PI) / 180;
      extent.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
    }
  };
  for (const i of s.items) {
    if (i.kind === "circle") {
      const c = at(i.c);
      extent.push([c[0] - i.r, c[1] - i.r], [c[0] + i.r, c[1] + i.r]);
    } else if (i.kind === "arc") arcPoints(at(i.c), i.r, i.from, i.to);
    else if (i.kind === "path")
      for (const c of i.cmds) if (c.k === "A") arcPoints(at(c.c), c.r, c.from, c.to, c.cw);
  }
  const frame = frameOf(extent, { width, height: H }, 26);

  const shown = s.items.filter((i) => isShown(i.step));
  const segments: [Pt, Pt][] = shown.flatMap((i) =>
    i.kind === "seg" ? [[at(i.a), at(i.b)] as [Pt, Pt]] : [],
  );
  const circles = shown.flatMap((i) => (i.kind === "circle" ? [{ c: at(i.c), r: i.r }] : []));
  const visiblePoints = s.points.filter((p) => isShown(p.step));
  const centre: Pt =
    visiblePoints.length === 0
      ? [0, 0]
      : [
          visiblePoints.reduce((t, p) => t + p.at[0], 0) / visiblePoints.length,
          visiblePoints.reduce((t, p) => t + p.at[1], 0) / visiblePoints.length,
        ];
  const labels: LabelItem[] = [
    ...visiblePoints
      .filter((p) => p.isUnnamed !== true && p.isHidden !== true)
      .map(
        (p): LabelItem => ({
          id: `p-${p.name}`,
          at: p.at,
          text: p.name,
          kind: "point",
          away: centre,
          prefer: p.prefer,
        }),
      ),
    ...shown.flatMap((i, n): LabelItem[] =>
      i.kind === "note"
        ? [
            {
              id: `n${n}`,
              at: at(i.at),
              text: i.text,
              kind: "length",
              tone: i.tone,
              prefer: i.prefer,
            },
          ]
        : [],
    ),
  ];

  const caption = s.captions[step];
  const fills = shown.filter((i) => i.kind === "poly" || i.kind === "path");
  const lines = shown.filter((i) => i.kind !== "poly" && i.kind !== "path" && i.kind !== "note");
  return (
    <div class="ci ci-figure">
      <Stage
        label={describeFigure(s)}
        x={frame.x}
        y={frame.y}
        width={width}
        height={H}
        svg={{ class: "ci-svg" }}
      >
        <g data-part={FigurePart.Figure}>
          {fills.map((i, n) =>
            i.kind === "poly" ? (
              <Region
                // biome-ignore lint/suspicious/noArrayIndexKey: the items are a fixed list
                key={`f${n}`}
                points={i.pts.map(at)}
                tone={i.tone ?? "accent"}
              />
            ) : i.kind === "path" ? (
              <PathShape
                // biome-ignore lint/suspicious/noArrayIndexKey: the items are a fixed list
                key={`f${n}`}
                cmds={cmdsOf(i.cmds)}
                tone={i.tone ?? "accent"}
                isEvenOdd
                isOutlined={i.isOutlined}
              />
            ) : null,
          )}
          {lines.map((i, n) => {
            const k = `i${n}`;
            switch (i.kind) {
              case "seg":
                return (
                  <Seg
                    key={k}
                    from={at(i.a)}
                    to={at(i.b)}
                    tone={i.tone ?? "main"}
                    dashed={i.dashed}
                    isNew={isNew(i.step)}
                  />
                );
              case "circle":
                return (
                  <CircleShape
                    key={k}
                    centre={at(i.c)}
                    r={i.r}
                    tone={i.tone ?? "main"}
                    dashed={i.dashed}
                    isNew={isNew(i.step)}
                  />
                );
              case "arc":
                return (
                  <ArcShape
                    key={k}
                    centre={at(i.c)}
                    r={i.r}
                    from={i.from}
                    to={i.to}
                    tone={i.tone ?? "main"}
                    isNew={isNew(i.step)}
                  />
                );
              case "right":
                return <RightMark key={k} vertex={at(i.at)} p={at(i.p)} q={at(i.q)} />;
              case "angle":
                return (
                  <AngleMark
                    key={k}
                    vertex={at(i.at)}
                    p={at(i.p)}
                    q={at(i.q)}
                    label={i.label}
                    count={i.count}
                    tone={i.tone}
                  />
                );
              case "ticks":
                return <EqualTicks key={k} from={at(i.a)} to={at(i.b)} count={i.count} />;
              case "parallel":
                return <ParallelMarks key={k} from={at(i.a)} to={at(i.b)} count={i.count} />;
              default:
                return null;
            }
          })}
          {visiblePoints
            .filter((p) => p.isHidden !== true)
            .map((p) => (
              <PointDot key={p.name} at={p.at} isNew={isNew(p.step)} />
            ))}
        </g>
        <Labels items={labels} segments={segments} circles={circles} />
      </Stage>
      {caption !== undefined && caption.en !== "" && (
        <div class="ci-working" data-part={FigurePart.Caption} aria-live="polite">
          <p>{say(locale, caption)}</p>
        </div>
      )}
      {s.canStep && count > 1 && (
        <StepBar
          step={step}
          count={count}
          locale={locale}
          part={FigurePart.Steps}
          onNext={() => call(FigureAction.Next, {})}
          onBack={() => call(FigureAction.Back, {})}
          onAgain={() => call(FigureAction.Reset, {})}
        />
      )}
    </div>
  );
}
