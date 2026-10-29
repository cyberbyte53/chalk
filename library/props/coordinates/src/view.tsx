import type { Locale } from "@chalk/content";
import { SymbolButton } from "@chalk/draw";
import { FrameStage, type PropViewProps, useDrags, useFrame } from "@chalk/player";
import { type FramePixels, does, says, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { type Still, stillPossible } from "./clues";
import { coordinatePlane } from "./coordinate-plane";
import { Bus, Counter, PlacePicture, Walker } from "./pictures";
import { type Point, isInWindow, planeFrame } from "./plane";
import {
  AxesDraw,
  GridDraw,
  NamedPointsDraw,
  PART_WORDS,
  PartTaps,
  type PlaneView,
  SceneDraw,
  canNameParts,
  isRisen,
  unitOf,
} from "./plane-view";
import { Reading, snapped } from "./reading";
import { Direction, stepFrom } from "./walker";
import { WORDS, addressOf, num, pair, word } from "./words";

const actions = coordinatePlane.actions;
/** A tap that plots lands on the nearest quarter: the book's pairs go to 1.25. */
const PLOT_STEP = 0.25;

/** Where Riya stands, to the block: mid-glide, the block she is leaving. */
const blockOf = (s: PlaneView): Point =>
  s.isWalking ? (s.trail.at(-1) ?? s.walkFrom ?? s.at) : s.at;

/** What the walker's line says: where she is and, at the target, that she is there. */
function walkWords(s: PlaneView, locale: Locale): string {
  const name = word(s.walkerName, locale);
  const now = blockOf(s);
  const from = s.walkFrom;
  // On a single line the start is a number like any other (the bus stand is 0).
  if (s.axes !== "horizontal" && from !== null && now.x === from.x && now.y === from.y)
    return locale === "hi" ? `${name}: शुरू की जगह पर` : `${name}: at the start`;
  // On a town's main road there is no house yet: only the street she is at.
  const isOnMainRoad = s.roads === "town" && from !== null && now.y === from.y;
  // Counted streets start at 1: a 0 means she is on a main road, so that part isn't said.
  const counted = [
    now.x === 0 ? "" : `${s.axisNames[0][locale]} ${now.x}`,
    now.y === 0 ? "" : `${s.axisNames[1][locale]} ${now.y}`,
  ]
    .filter(Boolean)
    .join(", ");
  const where =
    // On a single line (a number line), one number says where.
    s.axes === "horizontal"
      ? num(now.x)
      : s.marks === "numbers"
        ? pair(now)
        : isOnMainRoad
          ? `${s.axisNames[0][locale]} ${now.x}`
          : s.marks === "counts"
            ? counted
            : addressOf(s.axisNames, now, locale);
  const isThere = s.target !== null && now.x === s.target.x && now.y === s.target.y;
  if (!isThere || s.isWalking) return `${name}: ${where}`;
  const target = word(s.targetName, locale);
  return locale === "hi"
    ? `${name} ${target} पहुँच गई! ${where}`
    : `${name} is at ${target}! ${where}`;
}

/** The places, each a small picture; a tap makes one the target when the board allows it. */
function PlacesDraw({
  s,
  px,
  locale,
}: { s: PlaneView; px: FramePixels; locale: Locale }): JSX.Element {
  const size = Math.max(16, Math.min(34, unitOf(px) * 0.62));
  const isLit = (p: Point) => s.lit !== null && p[s.lit.axis] === s.lit.value;
  return (
    <g class="cp-places">
      {s.places.map((p) => {
        // A place stands on a line only once that line has risen (or as high as it has grown).
        const rise = s.rising;
        const isUp =
          p.y === 0 ||
          isRisen(s, p.x) ||
          (rise !== null && rise.at === p.x && p.y <= s.window.yMax * rise.height);
        if (!isUp) return null;
        const [x, y] = px.toPx(p.x, p.y);
        const isTarget = s.target !== null && s.target.x === p.x && s.target.y === p.y;
        const classes = ["cp-place", `is-${s.placeKind}`];
        if (isTarget) classes.push("is-target");
        if (isLit(p)) classes.push("is-lit");
        const key = `${p.x},${p.y}`;
        return (
          <g
            key={key}
            class={classes.join(" ")}
            transform={`translate(${x}, ${y})`}
            {...(s.canChooseTarget ? does(actions.chooseTarget, { x: p.x, y: p.y }, key) : {})}
          >
            <rect
              class="cp-hit"
              x={-size * 0.7}
              y={-size * 0.7}
              width={size * 1.4}
              height={size * 1.4}
            />
            {isTarget && <circle class="cp-target-halo" r={size * 0.8} />}
            <PlacePicture kind={s.placeKind} size={size} />
            {p.label !== undefined && (
              <text
                class="cp-place-label"
                // On the horizontal line, above: below it are the line's numbers.
                y={p.y === 0 ? -size * 0.62 - 4 : size * 0.62 + 10}
                text-anchor="middle"
              >
                {word(p.label, locale)}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Riya's route so far and Riya where she stands now. */
function WalkerDraw({ s, px, locale }: { s: PlaneView; px: FramePixels; locale: Locale }) {
  const from = s.walkFrom;
  if (from === null) return null;
  const path = [from, ...s.trail.slice(0, s.isWalking ? -1 : undefined), s.at]
    .map((p, i) => {
      const [x, y] = px.toPx(p.x, p.y);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  const size = Math.max(24, Math.min(46, unitOf(px) * 0.7));
  const [x, y] = px.toPx(s.at.x, s.at.y);
  const [sx, sy] = px.toPx(from.x, from.y);
  const name = word(s.walkerName, locale);
  const now = blockOf(s);
  return (
    <g class="cp-walk">
      <circle class="cp-walk-start" cx={sx} cy={sy} r={5} />
      {s.trail.length > 0 && <path class="cp-route-done" d={path} />}
      <g
        class="cp-walker"
        transform={`translate(${x}, ${y - size * 0.45})`}
        {...shows("walker", now, `${name} ${pair(now)}`)}
      >
        {s.walkerKind === "bus" ? <Bus size={size} /> : <Walker size={size} />}
        <text
          class="cp-walker-name"
          // Beside her, not above: above, her name would leave the map at the top row.
          x={x > px.width * 0.7 ? -size * 0.55 : size * 0.55}
          y={-size * 0.2}
          text-anchor={x > px.width * 0.7 ? "end" : "start"}
        >
          {name}
        </text>
      </g>
    </g>
  );
}

/** Where the hidden point could still be: a shaded region, a line, or one point. */
function StillDraw({
  s,
  still,
  px,
}: { s: PlaneView; still: Still; px: FramePixels }): JSX.Element | null {
  const w = s.window;
  const unit = s.unit === "" ? "" : `\u00a0${s.unit}`;
  // Each distance given, measured from its line: dashed, with its value.
  const given = s.given.flatMap((g) => {
    const c = s.clueChoices[g];
    return c === undefined ? [] : [c];
  });
  const measured = given.flatMap((c) => {
    const out: JSX.Element[] = [];
    if (c.x !== undefined) {
      const y = w.yMin + (w.yMax - w.yMin) * 0.85;
      const [x0, py] = px.toPx(0, y);
      const [x1] = px.toPx(c.x, y);
      out.push(
        <g key={`mx${c.x}`} class="cp-measure">
          <line x1={x0} y1={py} x2={x1} y2={py} />
          <text x={(x0 + x1) / 2} y={py - 6} text-anchor="middle">
            {`${num(c.x)}${unit}`}
          </text>
        </g>,
      );
    }
    if (c.y !== undefined) {
      const x = w.xMin + (w.xMax - w.xMin) * 0.85;
      const [px0, y0] = px.toPx(x, 0);
      const [, y1] = px.toPx(x, c.y);
      out.push(
        <g key={`my${c.y}`} class="cp-measure">
          <line x1={px0} y1={y0} x2={px0} y2={y1} />
          <text x={px0 + 6} y={(y0 + y1) / 2} dominant-baseline="central">
            {`${num(c.y)}${unit}`}
          </text>
        </g>,
      );
    }
    return out;
  });
  // Every line a distance alone leaves, the full length of the plane (a whole line of spots).
  const fullLines = given.flatMap((c) => {
    const out: JSX.Element[] = [];
    if (c.x !== undefined) {
      const [a, b] = [px.toPx(c.x, w.yMin), px.toPx(c.x, w.yMax)];
      out.push(
        <line key={`fx${c.x}`} class="cp-still-full" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />,
      );
    }
    if (c.y !== undefined) {
      const [a, b] = [px.toPx(w.xMin, c.y), px.toPx(w.xMax, c.y)];
      out.push(
        <line key={`fy${c.y}`} class="cp-still-full" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />,
      );
    }
    return out;
  });
  let shape: JSX.Element | null = null;
  if (still.kind === "point") {
    const [x, y] = px.toPx(still.x, still.y);
    shape = <circle class="cp-still-point" cx={x} cy={y} r={9} />;
  } else if (still.kind === "region") {
    const r = still.region;
    const [x0, y0] = px.toPx(r.xMin, r.yMax);
    const [x1, y1] = px.toPx(r.xMax, r.yMin);
    shape = <rect class="cp-still-region" x={x0} y={y0} width={x1 - x0} height={y1 - y0} />;
  } else if (still.kind === "line") {
    // Bold where the patch given before still allows it.
    const r = still.region;
    const [a, b] =
      still.axis === "x"
        ? [px.toPx(still.value, r.yMin), px.toPx(still.value, r.yMax)]
        : [px.toPx(r.xMin, still.value), px.toPx(r.xMax, still.value)];
    shape = <line class="cp-still-line" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
  }
  return (
    <g class="cp-still">
      {still.kind !== "point" && fullLines}
      {shape}
      {measured}
    </g>
  );
}

/** The point the learner drags, read off the axes as far as the board writes it. */
function ReadingDraw({ s, px }: { s: PlaneView; px: FramePixels }): JSX.Element | null {
  const drag = useDrags();
  const p = s.point;
  if (p === null) return null;
  const [x, y] = px.toPx(p.x, p.y);
  const [ax, base] = px.toPx(p.x, 0);
  const [vx, ay] = px.toPx(0, p.y);
  const stage = s.reading;
  const isHidden = s.isReadingHidden;
  const hasLines = stage !== Reading.None && !isHidden;
  const hasLengths = (stage === Reading.Distances || stage === Reading.Abscissa) && !isHidden;
  const signed = stage === Reading.Abscissa;
  const unit = s.unit === "" ? "" : `\u00a0${s.unit}`;
  const xWords = signed ? `x = ${num(p.x)}${unit}` : `${num(Math.abs(p.x))}${unit}`;
  const yWords = signed ? `y = ${num(p.y)}${unit}` : `${num(Math.abs(p.y))}${unit}`;
  const words = isHidden
    ? "?"
    : stage === Reading.Pair
      ? pair(p)
      : hasLengths
        ? `${xWords}, ${yWords}`
        : "";
  return (
    <g class="cp-reading">
      {hasLines && (
        <>
          <line class="cp-drop" x1={x} y1={y} x2={ax} y2={base} />
          <line class="cp-drop" x1={x} y1={y} x2={vx} y2={ay} />
        </>
      )}
      {hasLengths && p.y !== 0 && (
        <text class="cp-length" x={ax + 6} y={(y + base) / 2} dominant-baseline="central">
          {yWords}
        </text>
      )}
      {hasLengths && p.x !== 0 && (
        <text class="cp-length" x={(x + vx) / 2} y={ay - 8} text-anchor="middle">
          {xWords}
        </text>
      )}
      <g {...shows("point", isHidden ? null : p, words === "" ? undefined : words)}>
        <circle
          class="cp-point"
          {...drag({
            axis: "xy",
            at: p,
            place: (to) => snapped(s, to),
            move: actions.movePoint,
            step: s.pointStep,
            words: isHidden ? "?" : pair(p),
          })}
          cx={x}
          cy={y}
          r={10}
        />
        {(stage === Reading.Pair || isHidden) && (
          <text class="cp-pair" x={x + 14} y={y - 12}>
            {words}
          </text>
        )}
      </g>
    </g>
  );
}

/**
 * The vertical number line's zero, a handle the learner slides; let go where the two zeroes meet
 * and the lines are the axes.
 */
function ApartHandle({ s, px }: { s: PlaneView; px: FramePixels }): JSX.Element | null {
  const drag = useDrags();
  if (s.axes !== "both" || s.isCrossed === true) return null;
  const [x, y] = px.toPx(s.apart.x, s.apart.y);
  const w = s.window;
  return (
    <circle
      class="cp-apart"
      {...drag({
        axis: "xy",
        at: s.apart,
        place: (to) => ({
          x: Math.min(w.xMax, Math.max(w.xMin, Math.round(to.x))),
          y: Math.min(w.yMax, Math.max(w.yMin, Math.round(to.y))),
        }),
        move: actions.moveApart,
        step: 1,
        words: pair(s.apart),
      })}
      cx={x}
      cy={y}
      r={9}
    />
  );
}

/** The dots plotted so far, right or wrong, each with its swap when asked. */
function PlottedDraw({ s, px }: { s: PlaneView; px: FramePixels }): JSX.Element {
  return (
    <g class="cp-plotted">
      {s.plotted.map((d, i) => {
        // At a smaller scale a dot can fall off the plane: it isn't drawn there.
        if (!isInWindow(s.window, d)) return null;
        const [x, y] = px.toPx(d.x, d.y);
        const swap = { x: d.y, y: d.x };
        const isSwapShown = s.showSwaps && d.isRight && d.x !== d.y && isInWindow(s.window, swap);
        const [sx, sy] = px.toPx(swap.x, swap.y);
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: one dot per pair, in order
          <g key={i} class={`cp-dot${d.isRight ? " is-right" : " is-wrong"}`}>
            {isSwapShown && (
              <>
                <line class="cp-swap-line" x1={x} y1={y} x2={sx} y2={sy} />
                <circle class="cp-swap" cx={sx} cy={sy} r={5} />
                <text class="cp-swap-label" x={sx + 8} y={sy - 8}>
                  {pair(swap)}
                </text>
              </>
            )}
            <circle cx={x} cy={y} r={6} />
            <text x={x + 9} y={y - 9}>
              {pair(d)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Both players' counters on the board, side by side when they share a point. */
function CountersDraw({ s, px, locale }: { s: PlaneView; px: FramePixels; locale: Locale }) {
  const size = Math.max(14, Math.min(24, unitOf(px) * 0.6));
  return (
    <g class="cp-counters">
      {s.counters.map((c, i) => {
        const [x, y] = px.toPx(c.x, c.y);
        const other = s.counters[1 - i];
        const isShared = other !== undefined && other.x === c.x && other.y === c.y;
        const dx = isShared ? (i === 0 ? -size * 0.35 : size * 0.35) : 0;
        const name = s.playerNames[i] === undefined ? `${i + 1}` : word(s.playerNames[i], locale);
        return (
          <g
            // biome-ignore lint/suspicious/noArrayIndexKey: one counter per player
            key={i}
            transform={`translate(${x + dx}, ${y})`}
            {...shows(`counter${i + 1}`, c, `${name} ${pair(c)}`)}
          >
            <Counter size={size} initial={name.slice(0, 1)} tone={i === 0 ? "a" : "b"} />
          </g>
        );
      })}
    </g>
  );
}

/** A tap anywhere on the plane: plots the next pair, or hides the learner's own point. */
function PlaneTap({
  s,
  px,
  call,
}: {
  s: PlaneView;
  px: FramePixels;
  call: PropViewProps<typeof coordinatePlane>["call"];
}): JSX.Element | null {
  const frame = useFrame();
  const isPlotting = s.toPlot.length > 0 && s.plotted.length < s.toPlot.length;
  const isHiding = !isPlotting && s.canHide && s.clueChoices.length > 0;
  if (!isPlotting && !isHiding) return null;
  const w = s.window;
  const [x0, y0] = px.toPx(w.xMin, w.yMax);
  const [x1, y1] = px.toPx(w.xMax, w.yMin);
  const snap = (v: number, step: number) => Number((Math.round(v / step) * step).toFixed(6));
  return (
    <rect
      class="cp-plane-tap"
      {...says(isPlotting ? actions.plotAt : actions.hideAt)}
      x={x0}
      y={y0}
      width={x1 - x0}
      height={y1 - y0}
      onPointerDown={(e) =>
        frame?.drag(
          e,
          () => {},
          ([x, y]) => {
            const step = isPlotting ? PLOT_STEP : 1;
            const at = { x: snap(x, step), y: snap(y, step) };
            if (!isInWindow(w, at)) return;
            if (isPlotting) call(actions.plotAt, at);
            else call(actions.hideAt, at);
          },
        )
      }
    />
  );
}

/**
 * The coordinate plane: the core's lines and marks, and on them whatever layers the board turns on
 * (places, Riya's walk, clues, a point to read, pairs to plot, the dice game). Under it, the
 * controls of the layers that are on.
 */
export function CoordinatePlaneView({
  view: s,
  width,
  call,
  locale,
}: PropViewProps<typeof coordinatePlane>): JSX.Element {
  const px = planeFrame.pixels(s, width);
  const hasPlaces = s.places.length > 0;
  const hasWalker = s.walkFrom !== null;
  const hasClues = s.clueChoices.length > 0;
  const hasPlotting = s.toPlot.length > 0;
  const hasDice = s.counters.length > 0;
  const hasReading = s.point !== null;
  const isNaming = canNameParts(s) && !hasPlaces && !hasPlotting && !hasClues && !hasDice;
  const still = stillPossible(s, s.given);
  const hiddenPoint = s.hidden;
  const next = s.toPlot[s.plotted.length];
  const nextClue = s.clueChoices.findIndex((_, i) => !s.given.includes(i));
  const unshown = s.canShowPoints && s.points.some((p) => !p.isShown);
  const from = s.walkFrom;
  return (
    <div class="cp">
      {hasPlaces && s.showAddress && s.target !== null && (
        <p
          class="cp-line cp-address"
          {...shows(
            "target",
            s.target,
            `${word(s.targetName, locale)}: ${addressOf(s.axisNames, s.target, locale)}`,
          )}
        >
          <strong>{word(s.targetName, locale)}</strong>: {addressOf(s.axisNames, s.target, locale)}
        </p>
      )}
      {/* Room for the address before there is one, so the map doesn't move when it appears: an
          unseen copy of the longest address this board can show (its farthest place). */}
      {hasPlaces && s.showAddress && s.target === null && s.canChooseTarget && (
        <p class="cp-line cp-address is-room" aria-hidden="true">
          <strong>{word(s.targetName, locale)}</strong>:{" "}
          {addressOf(
            s.axisNames,
            s.places.reduce(
              (far, p) => (p.x + p.y > far.x + far.y ? p : far),
              s.places[0] ?? { x: 0, y: 0 },
            ),
            locale,
          )}
        </p>
      )}
      {hasPlotting && s.showTable && (
        <table class="cp-table" {...shows("table", s.toPlot)}>
          <tbody>
            <tr>
              <th>x</th>
              {s.toPlot.map((p, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: the table's columns, in order
                <td key={i} class={i === s.plotted.length ? "is-next" : undefined}>
                  {num(p.x)}
                </td>
              ))}
            </tr>
            <tr>
              <th>y</th>
              {s.toPlot.map((p, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: the table's columns, in order
                <td key={i} class={i === s.plotted.length ? "is-next" : undefined}>
                  {num(p.y)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
      <FrameStage px={px} label={planeFrame.label?.(s) ?? "A plane"} present={[""]} look="cp-frame">
        <SceneDraw s={s} px={px} />
        <GridDraw s={s} px={px} />
        {hasClues && <StillDraw s={s} still={still} px={px} />}
        {isNaming && <PartTaps s={s} px={px} />}
        <AxesDraw s={s} px={px} locale={locale} canLight={hasPlaces} />
        <ApartHandle s={s} px={px} />
        <PlaneTap s={s} px={px} call={call} />
        {hasPlaces && <PlacesDraw s={s} px={px} locale={locale} />}
        {hasWalker && <WalkerDraw s={s} px={px} locale={locale} />}
        {/* Over Riya, so the mark she has just made stays in view. */}
        <NamedPointsDraw s={s} px={px} />
        {hasPlotting && <PlottedDraw s={s} px={px} />}
        {hasClues && hiddenPoint !== null && s.isHiddenShown && (
          <circle
            class="cp-hidden"
            {...shows("hidden", hiddenPoint, pair(hiddenPoint))}
            cx={px.toPx(hiddenPoint.x, hiddenPoint.y)[0]}
            cy={px.toPx(hiddenPoint.x, hiddenPoint.y)[1]}
            r={7}
          />
        )}
        {hasDice && <CountersDraw s={s} px={px} locale={locale} />}
        {hasReading && <ReadingDraw s={s} px={px} />}
      </FrameStage>
      {s.named !== null && isNaming && (
        <p class="cp-line" {...shows("named", s.named, PART_WORDS[s.named][locale])}>
          {PART_WORDS[s.named][locale]}
        </p>
      )}
      {/* Riya's line keeps its room from the start, so her first step doesn't move the arrows. */}
      {hasWalker &&
        s.showWhere &&
        (s.trail.length > 0 ? (
          <p class="cp-line" {...shows("whereWalker", blockOf(s), walkWords(s, locale))}>
            {walkWords(s, locale)}
          </p>
        ) : (
          <p class="cp-line" aria-hidden="true">
            &nbsp;
          </p>
        ))}
      {hasPlotting && next !== undefined && (
        <p class="cp-line" {...shows("next", next, pair(next))}>
          {pair(next)}
        </p>
      )}
      {hasDice && (
        <p
          class="cp-line cp-dice"
          {...shows(
            "throw",
            s.lastThrow,
            s.lastThrow === null ? undefined : `${s.lastThrow.red}, ${s.lastThrow.green}`,
          )}
        >
          <span class="cp-die is-red">{s.lastThrow?.red ?? "–"}</span>
          <span class="cp-die is-green">{s.lastThrow?.green ?? "–"}</span>
          <span class="cp-turn">
            {s.winner !== null
              ? `${word(s.playerNames[s.winner] ?? s.walkerName, locale)} 🏁`
              : locale === "hi"
                ? `${word(s.playerNames[s.turn] ?? s.walkerName, locale)} की बारी`
                : `${word(s.playerNames[s.turn] ?? s.walkerName, locale)}'s turn`}
          </span>
        </p>
      )}
      <div class="cp-controls">
        {hasWalker && s.canStep && from !== null && (
          <div class="cp-pad">
            {(
              [
                [Direction.Up, "↑"],
                [Direction.Left, "←"],
                [Direction.Right, "→"],
                [Direction.Down, "↓"],
              ] as const
            )
              // On a single line (a number line) there is no up or down.
              .filter(
                ([direction]) =>
                  s.axes !== "horizontal" ||
                  direction === Direction.Left ||
                  direction === Direction.Right,
              )
              .map(([direction, symbol]) => (
                <span key={direction} class={`cp-pad-${direction}`}>
                  <SymbolButton
                    symbol={symbol}
                    label={word(WORDS[direction], locale)}
                    isEnabled={!s.isWalking && "to" in stepFrom(s, direction)}
                    {...does(actions.step, { direction }, direction)}
                  />
                </span>
              ))}
            <span class="cp-pad-back">
              <SymbolButton
                symbol={`↺ ${word(WORDS.back, locale)}`}
                isWide
                label={word(WORDS.back, locale)}
                isEnabled={s.trail.length > 0 && !s.isWalking}
                {...does(actions.backToStart)}
              />
            </span>
          </div>
        )}
        {hasPlaces && s.lit !== null && (
          <SymbolButton
            symbol={word(WORDS.lightsOff, locale)}
            label={word(WORDS.lightsOff, locale)}
            isWide
            {...does(actions.clearLight)}
          />
        )}
        {!(s.isCrossed === true) && s.axes === "both" && (
          <SymbolButton
            symbol={word(WORDS.bringTogether, locale)}
            label={word(WORDS.bringTogether, locale)}
            isWide
            {...does(actions.bringTogether)}
          />
        )}
        {isNaming && s.showDirections && s.quadrantsNamed < 4 && (
          <SymbolButton
            symbol={word(WORDS.nameQuadrants, locale)}
            label={word(WORDS.nameQuadrants, locale)}
            isWide
            {...does(actions.numberQuadrants)}
          />
        )}
        {unshown && (
          <SymbolButton
            symbol={word(WORDS.nextPoint, locale)}
            label={word(WORDS.nextPoint, locale)}
            isWide
            {...does(actions.showPoint, {})}
          />
        )}
        {hasReading && s.isReadingHidden && (
          <SymbolButton
            symbol={word(WORDS.show, locale)}
            label={word(WORDS.show, locale)}
            isWide
            {...does(actions.showReading)}
          />
        )}
        {hasClues &&
          s.clueChoices.map((c, i) =>
            // One clue at a time, in the lesson's order: those given, and the next.
            !s.given.includes(i) && i !== nextClue ? null : (
              <SymbolButton
                // biome-ignore lint/suspicious/noArrayIndexKey: the lesson's clues, in order
                key={i}
                symbol={word(c.words, locale)}
                label={word(c.words, locale)}
                isWide
                isOn={s.given.includes(i)}
                {...does(actions.giveClue, { clue: i }, i)}
              />
            ),
          )}
        {/* Where it is, only once every clue is given: before that it would give the answer away. */}
        {hasClues && hiddenPoint !== null && !s.isHiddenShown && nextClue === -1 && (
          <SymbolButton
            symbol={word(WORDS.showPoint, locale)}
            label={word(WORDS.showPoint, locale)}
            isWide
            {...does(actions.showHidden)}
          />
        )}
        {hasClues && s.given.length > 0 && (
          <SymbolButton
            symbol="↺"
            label={word(WORDS.clear, locale)}
            {...does(actions.clearClues)}
          />
        )}
        {hasPlotting &&
          s.scaleChoices.map((every, i) => (
            <SymbolButton
              // biome-ignore lint/suspicious/noArrayIndexKey: the scales offered, in order
              key={i}
              symbol={`${word(WORDS.scale, locale)} ${num(every)}`}
              label={`${word(WORDS.scale, locale)} ${num(every)}`}
              isWide
              isOn={s.tickEvery === every}
              {...does(actions.setScale, { every }, i)}
            />
          ))}
        {hasPlotting && s.plotted.length > 0 && (
          <SymbolButton
            symbol="↺"
            label={word(WORDS.clear, locale)}
            {...does(actions.clearPlotted)}
          />
        )}
        {hasDice && (
          <>
            <SymbolButton
              symbol={word(WORDS.throw, locale)}
              label={word(WORDS.throw, locale)}
              isWide
              isEnabled={s.winner === null}
              {...does(actions.throwDice)}
            />
            <SymbolButton
              symbol={word(WORDS.newGame, locale)}
              label={word(WORDS.newGame, locale)}
              isWide
              {...does(actions.startAgain)}
            />
          </>
        )}
      </div>
    </div>
  );
}
