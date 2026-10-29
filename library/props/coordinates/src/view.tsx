import type { Locale } from "@chalk/content";
import { Stepper, SymbolButton } from "@chalk/draw";
import { FrameStage, type PropViewProps, useDrags, useFrame } from "@chalk/player";
import { type FramePixels, does, says, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { type Still, stillPossible } from "./clues";
import { coordinatePlane } from "./coordinate-plane";
import { Counter, PlacePicture, Walker } from "./pictures";
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
  unitOf,
} from "./plane-view";
import { Reading, snapped } from "./reading";
import { walkerAt } from "./walker";
import { WORDS, addressOf, num, pair, word } from "./words";

const actions = coordinatePlane.actions;
/** A tap that plots lands on the nearest quarter: the book's pairs go to 1.25. */
const PLOT_STEP = 0.25;

/** Where the walker is now, and where she ends, in units. */
function walkOf(s: PlaneView) {
  const now = walkerAt(s);
  const end = walkerAt({ ...s, walked: Math.abs(s.along) + Math.abs(s.up) });
  return { now, end };
}

/** What the walker's line says: where she is and, once there, whether it is the target. */
function walkWords(s: PlaneView, locale: Locale): string {
  const name = word(s.walkerName, locale);
  // Mid-walk, where she is is the last line she passed.
  const now = walkerAt({ ...s, walked: Math.floor(s.walked + 1e-9) });
  if (now === null) return "";
  const where = s.marks === "numbers" ? pair(now) : addressOf(s.axisNames, now, locale);
  if (s.isWalking) return `${name}: ${where}`;
  if (s.isArrived !== true || s.walked === 0) return `${name}: ${where}`;
  if (s.target === null) return `${name}: ${where}`;
  const isThere = now.x === s.target.x && now.y === s.target.y;
  const target = word(s.targetName, locale);
  if (locale === "hi")
    return isThere
      ? `${name} ${target} पहुँच गई! ${where}`
      : `${name}: ${where}। यह ${target} नहीं है।`;
  return isThere ? `${name} is at ${target}! ${where}` : `${name}: ${where}. That isn't ${target}.`;
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
              <text class="cp-place-label" y={size * 0.62 + 10} text-anchor="middle">
                {word(p.label, locale)}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Riya's route (the rest of it dashed) and Riya where she stands now. */
function WalkerDraw({ s, px, locale }: { s: PlaneView; px: FramePixels; locale: Locale }) {
  const from = s.walkFrom;
  const { now } = walkOf(s);
  if (from === null || now === null) return null;
  const corner = { x: from.x + s.along, y: from.y };
  const end = { x: corner.x, y: from.y + s.up };
  const line = (a: Point, b: Point) => {
    const [x1, y1] = px.toPx(a.x, a.y);
    const [x2, y2] = px.toPx(b.x, b.y);
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  };
  const route = `${line(from, corner)} ${line(corner, end).replace("M", "L")}`;
  const isPastCorner = s.walked > Math.abs(s.along);
  const done = isPastCorner
    ? `${line(from, corner)} ${line(corner, now).replace("M", "L")}`
    : line(from, now);
  const size = Math.max(24, Math.min(46, unitOf(px) * 0.7));
  const [x, y] = px.toPx(now.x, now.y);
  const [sx, sy] = px.toPx(from.x, from.y);
  const name = word(s.walkerName, locale);
  return (
    <g class="cp-walk">
      <circle class="cp-walk-start" cx={sx} cy={sy} r={5} />
      {(s.along !== 0 || s.up !== 0) && <path class="cp-route" d={route} />}
      {s.walked > 0 && <path class="cp-route-done" d={done} />}
      <g
        class="cp-walker"
        transform={`translate(${x}, ${y - size * 0.45})`}
        {...shows("walker", now, `${name} ${pair(now)}`)}
      >
        <Walker size={size} />
        <text class="cp-walker-name" y={-size * 0.95} text-anchor="middle">
          {name}
        </text>
      </g>
    </g>
  );
}

/** Where the hidden point could still be: a shaded region, a line, or one point. */
function StillDraw({ still, px }: { still: Still; px: FramePixels }): JSX.Element | null {
  if (still.kind === "anywhere" || still.kind === "nowhere") return null;
  if (still.kind === "point") {
    const [x, y] = px.toPx(still.x, still.y);
    return <circle class="cp-still-point" cx={x} cy={y} r={9} />;
  }
  const r = still.region;
  if (still.kind === "region") {
    const [x0, y0] = px.toPx(r.xMin, r.yMax);
    const [x1, y1] = px.toPx(r.xMax, r.yMin);
    return <rect class="cp-still-region" x={x0} y={y0} width={x1 - x0} height={y1 - y0} />;
  }
  const [a, b] =
    still.axis === "x"
      ? [px.toPx(still.value, r.yMin), px.toPx(still.value, r.yMax)]
      : [px.toPx(r.xMin, still.value), px.toPx(r.xMax, still.value)];
  return <line class="cp-still-line" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
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
  const xWords = signed ? `x = ${num(p.x)}` : num(Math.abs(p.x));
  const yWords = signed ? `y = ${num(p.y)}` : num(Math.abs(p.y));
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
  const total = Math.abs(s.along) + Math.abs(s.up);
  const from = s.walkFrom;
  return (
    <div class="cp">
      {hasPlaces && s.target !== null && (
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
        {hasClues && <StillDraw still={still} px={px} />}
        {isNaming && <PartTaps s={s} px={px} />}
        <AxesDraw s={s} px={px} locale={locale} canLight={hasPlaces} />
        <ApartHandle s={s} px={px} />
        <PlaneTap s={s} px={px} call={call} />
        {hasPlaces && <PlacesDraw s={s} px={px} locale={locale} />}
        {hasWalker && <WalkerDraw s={s} px={px} locale={locale} />}
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
      {hasWalker && s.walked > 0 && (
        <p
          class="cp-line"
          {...shows(
            "whereWalker",
            { along: s.along, up: s.up, walked: s.walked },
            walkWords(s, locale),
          )}
        >
          {walkWords(s, locale)}
        </p>
      )}
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
        {hasWalker && s.canSetSteps && from !== null && (
          <>
            <Stepper
              name="→"
              value={s.along}
              min={Math.max(-50, Math.ceil(s.window.xMin - from.x))}
              max={Math.min(50, Math.floor(s.window.xMax - from.x))}
              {...says(actions.setAlong)}
              onChange={(value) => call(actions.setAlong, { value })}
            />
            <Stepper
              name="↑"
              value={s.up}
              min={Math.max(-50, Math.ceil(s.window.yMin - from.y))}
              max={Math.min(50, Math.floor(s.window.yMax - from.y))}
              {...says(actions.setUp)}
              onChange={(value) => call(actions.setUp, { value })}
            />
            <SymbolButton
              symbol={word(WORDS.walk, locale)}
              label={word(WORDS.walk, locale)}
              isWide
              isEnabled={total > 0 && !s.isWalking && s.walked < total}
              {...does(actions.walk)}
            />
            <SymbolButton
              symbol="↺"
              label={word(WORDS.back, locale)}
              isEnabled={s.walked > 0}
              {...does(actions.backToStart)}
            />
          </>
        )}
        {hasPlaces && s.lit !== null && (
          <SymbolButton
            symbol={word(WORDS.clear, locale)}
            label={word(WORDS.clear, locale)}
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
        {hasClues && hiddenPoint !== null && !s.isHiddenShown && (
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
