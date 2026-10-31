import type { Locale } from "@chalk/content";
import { SymbolButton } from "@chalk/draw";
import type { PropView } from "@chalk/player";
import { type FramePixels, does, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { drawing } from "./layer-view";
import { Bus, Walker } from "./pictures";
import { Marks, type Point, Scene } from "./plane";
import { marksOn, unitOf } from "./plane-view";
import { walker } from "./scene/walker";
import { Direction, Roads, stepFrom } from "./walker";
import { WORDS, addressOf, num, pair, word } from "./words";

type WalkerView = PropView<typeof walker>;
const actions = walker.actions;

/** Where Riya stands, to the block: mid-glide, the block she is leaving. */
const blockOf = (s: WalkerView): Point =>
  s.isWalking ? (s.trail.at(-1) ?? s.walkFrom ?? s.at) : s.at;

/** What the walker's line says: where she is and, at the target, that she is there. */
function walkWords(s: WalkerView, locale: Locale): string {
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

/**
 * The longest the walker's line can be: what it says on arriving at the target, or standing at
 * the window's far corner. The line keeps this much room, so what is under it never moves.
 */
function longestWalkWords(s: WalkerView, locale: Locale): string {
  const w = s.window;
  const far = { x: Math.floor(w.xMax), y: Math.floor(w.yMax) };
  // A board that has a target, or can be given one, may say it has arrived: from the start.
  const canArrive = s.target !== null || s.canChooseTarget;
  const said = [
    walkWords({ ...s, at: far, isWalking: false }, locale),
    ...(canArrive ? [walkWords({ ...s, at: far, target: far, isWalking: false }, locale)] : []),
    ...(s.target !== null ? [walkWords({ ...s, at: s.target, isWalking: false }, locale)] : []),
  ];
  return said.reduce((a, b) => (b.length > a.length ? b : a), "");
}

/**
 * A city of crossing streets: where she may walk every line, the town has streets across as well
 * (behind the lines, as the town's own streets are).
 */
function StreetsAcross({ s, px }: { s: WalkerView; px: FramePixels }): JSX.Element | null {
  if (s.scene !== Scene.Town || s.roads !== Roads.Grid) return null;
  const w = s.window;
  const [x0] = px.toPx(w.xMin, 0);
  const [x1] = px.toPx(w.xMax, 0);
  const road = Math.max(6, Math.min(16, unitOf(px) * 0.32));
  return (
    <g class="cp-town">
      {marksOn(Marks.Counts, w.yMin, w.yMax, 1).map((y) => {
        const [, sy] = px.toPx(0, y);
        return (
          <line
            key={`a${y}`}
            class="cp-street"
            x1={x0}
            y1={sy}
            x2={x1}
            y2={sy}
            stroke-width={road * 0.7}
          />
        );
      })}
    </g>
  );
}

/** Riya's route so far and Riya where she stands now. */
function WalkerDraw({ s, px, locale }: { s: WalkerView; px: FramePixels; locale: Locale }) {
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

/** The walker layer's drawing: Riya and her route, her line under the plane, the arrows. */
export const walkerDrawing = drawing(walker, {
  back: ({ s, px }) => <StreetsAcross s={s} px={px} />,
  on: ({ s, px, locale }) => <WalkerDraw s={s} px={px} locale={locale} />,
  // Her line keeps room for the most it can say, from the start: no step moves the arrows.
  below: ({ s, locale }) =>
    !s.showWhere ? null : (
      <p class="cp-line cp-roomy">
        {s.trail.length > 0 ? (
          <span {...shows("whereWalker", blockOf(s), walkWords(s, locale))}>
            {walkWords(s, locale)}
          </span>
        ) : (
          <span />
        )}
        <span class="cp-room" aria-hidden="true">
          {longestWalkWords(s, locale)}
        </span>
      </p>
    ),
  controls: ({ s, locale }) =>
    !s.canStep || s.walkFrom === null ? null : (
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
    ),
});
