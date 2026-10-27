import { Stage, useSpace } from "@chalk/draw";
import { type PropViewProps, useBoardTween, useFitColumns } from "@chalk/player";
import type { JSX } from "preact";
import { type DivisionStep, euclidSteps } from "./arithmetic";
import {
  MAX_SIDE,
  SquareCutterAction,
  type SquareCutterState,
  tileAlong,
  tileCover,
  zoomStep,
} from "./square-cutter";
import { NumberBox, SymbolButton } from "./ui";

type Box = { x: number; y: number; w: number; h: number };
type Cut = { squares: Box[]; rest: Box; round: number; side: number };

/** Tallest a drawing gets, in px, however thin the rectangle. */
const MAX_HEIGHT = 230;
/** How much room around the zoomed piece stays in view, as a multiple of its size. */
const ZOOM_ROOM = 1.6;
/** How long the zoom takes, in ms. */
/** How long the window takes to glide to the piece being cut, s (board time). */
const ZOOM_SECONDS = 0.45;

/**
 * The window around a piece: the piece with room on every side, shaped like the drawing's frame
 * (width / height = aspect) so zooming never changes the drawing's size, kept inside the floor.
 */
function roomAround(piece: Box, whole: Box, aspect: number): Box {
  let w = piece.w * ZOOM_ROOM;
  let h = piece.h * ZOOM_ROOM;
  if (w / h < aspect) w = h * aspect;
  else h = w / aspect;
  w = Math.min(whole.w, w);
  h = Math.min(whole.h, h);
  const cx = piece.x + piece.w / 2;
  const cy = piece.y + piece.h / 2;
  return {
    x: Math.min(Math.max(cx - w / 2, whole.x), whole.x + whole.w - w),
    y: Math.min(Math.max(cy - h / 2, whole.y), whole.y + whole.h - h),
    w,
    h,
  };
}

/** Where every round's squares sit inside the whole rectangle (long side across). */
function layout(long: number, short: number, steps: readonly DivisionStep[]): Cut[] {
  let rest: Box = { x: 0, y: 0, w: long, h: short };
  return steps.map((step, round) => {
    const across = rest.w >= rest.h;
    const side = step.b;
    const squares = Array.from({ length: step.q }, (_, j) =>
      across
        ? { x: rest.x + j * side, y: rest.y, w: side, h: side }
        : { x: rest.x, y: rest.y + j * side, w: side, h: side },
    );
    const cutFrom = rest;
    rest = across
      ? { x: rest.x + step.q * side, y: rest.y, w: rest.w - step.q * side, h: rest.h }
      : { x: rest.x, y: rest.y + step.q * side, w: rest.w, h: rest.h - step.q * side };
    return { squares, rest: cutFrom, round, side };
  });
}

function Rect({ box, class: className }: { box: Box; class: string }): JSX.Element {
  const { x, y } = useSpace();
  if (y === null) throw new Error("squareCutter draws on a two-dimensional stage");
  const left = x(box.x);
  const top = y(box.y + box.h);
  return (
    <rect
      class={className}
      x={left}
      y={top}
      width={Math.max(0.5, x(box.x + box.w) - left)}
      height={Math.max(0.5, y(box.y) - top)}
    />
  );
}

/** Most tiles a trial grid draws; past this only the uncovered gaps are drawn. */
const MAX_TILES = 600;

/** A trial tile grid over the whole floor, from one corner, with the parts it can't cover marked. */
function TileGrid({
  long,
  short,
  t,
  part,
}: { long: number; short: number; t: number; part?: string }) {
  const { along, across } = tileCover(long, short, t);
  const cols = along / t;
  const rows = across / t;
  const tiles: Box[] =
    cols * rows <= MAX_TILES
      ? Array.from({ length: cols * rows }, (_, k) => ({
          x: (k % cols) * t,
          y: Math.floor(k / cols) * t,
          w: t,
          h: t,
        }))
      : [];
  const gaps: Box[] = [];
  if (along < long) gaps.push({ x: along, y: 0, w: long - along, h: short });
  if (across < short) gaps.push({ x: 0, y: across, w: along, h: short - across });
  return (
    <g data-part={part}>
      {tiles.map((b) => (
        <Rect key={`${b.x}-${b.y}`} box={b} class="pr-tile" />
      ))}
      {gaps.map((b) => (
        <Rect key={`gap-${b.x}-${b.y}`} box={b} class="pr-gap" />
      ))}
    </g>
  );
}

/** Room either side of the drawing for the lengths written on it, in px. */
const RULE = 26;

/** The drawing's size in px for the whole floor; zooming keeps it. Room is left for the lengths. */
function frameOf(long: number, short: number, width: number): { w: number; h: number } {
  const room = width - 2 * RULE;
  const h = Math.min(MAX_HEIGHT, Math.max(40, (room * short) / long));
  return { w: Math.min(room, (h * long) / short), h };
}

/** A length marked along one edge: a line with end ticks over [from, to] px, its value in the middle. */
type Mark = { from: number; to: number; text: string; tone?: "gap" | "piece" };

/** The marks along one side of the drawing, dropping any that fall outside it. */
function Rule({
  side,
  marks,
  size,
}: { side: "top" | "bottom" | "left" | "right"; marks: readonly Mark[]; size: number }) {
  const isAcross = side === "top" || side === "bottom";
  return (
    <div class={`pr-rule is-${side}`} aria-hidden="true">
      {marks.map((m) => {
        const from = Math.max(0, m.from);
        const to = Math.min(size, m.to);
        if (to - from < 6) return null;
        const style = isAcross
          ? { left: `${from}px`, width: `${to - from}px` }
          : { top: `${from}px`, height: `${to - from}px` };
        return (
          <div
            key={`${m.text}-${m.from}`}
            class={m.tone === undefined ? "pr-mark" : `pr-mark is-${m.tone}`}
            style={style}
          >
            <span>{m.text}</span>
          </div>
        );
      })}
    </div>
  );
}

/** The rectangle (or a part of it) with the rounds cut so far. */
function Drawing({
  window,
  cuts,
  done,
  long,
  short,
  width,
  label,
  tile = 0,
  tilePart,
  fadeBelow = 0,
  marks,
}: {
  /** The lengths written round the drawing, in units of the floor. */
  marks: { top: UnitMark[]; bottom: UnitMark[]; left: UnitMark[]; right: UnitMark[] };
  /** Squares cut in rounds before this one are faded: context around a zoomed piece. */
  fadeBelow?: number;
  tile?: number;
  tilePart?: string;
  window: Box;
  cuts: readonly Cut[];
  done: number;
  long: number;
  short: number;
  width: number;
  label: string;
}): JSX.Element {
  // Always the whole floor's frame: a zoomed window has the frame's shape, so nothing jumps.
  const { w: drawWidth, h: height } = frameOf(long, short, width);
  const isFinished = done === cuts.length;
  // Floor units to px in the window as it is now (so the marks glide with the zoom).
  const px = (v: number) => ((v - window.x) / window.w) * drawWidth;
  const py = (v: number) => ((window.y + window.h - v) / window.h) * height;
  const across = (ms: readonly UnitMark[]) =>
    ms.map((m) => ({ ...m, from: px(m.from), to: px(m.to) }));
  const down = (ms: readonly UnitMark[]) =>
    ms.map((m) => ({ ...m, from: py(m.to), to: py(m.from) }));
  return (
    <div
      class="pr-ruled"
      data-part="sides"
      style={{ gridTemplateColumns: `${RULE}px ${drawWidth}px ${RULE}px` }}
    >
      <span />
      <Rule side="top" marks={across(marks.top)} size={drawWidth} />
      <span />
      <Rule side="left" marks={down(marks.left)} size={height} />
      <div style={{ width: `${drawWidth}px` }}>
        <Stage
          label={label}
          x={[window.x, window.x + window.w]}
          y={[window.y, window.y + window.h]}
          width={drawWidth}
          height={height}
        >
          <Rect box={{ x: 0, y: 0, w: long, h: short }} class="pr-sheet" />
          {cuts
            .slice(0, done)
            .map((cut) =>
              cut.squares.map((sq, j) => (
                <Rect
                  key={`${cut.round}-${j}`}
                  box={sq}
                  class={`${
                    isFinished && cut.round === cuts.length - 1
                      ? "pr-square is-last"
                      : `pr-square pr-round-${cut.round % 4}`
                  }${cut.round < fadeBelow ? " is-faded" : ""}`}
                />
              )),
            )}
          {!isFinished && cuts[done] !== undefined && (
            <Rect box={cuts[done].rest} class="pr-piece" />
          )}
          {tile > 0 && <TileGrid long={long} short={short} t={tile} part={tilePart} />}
        </Stage>
      </div>
      <Rule side="right" marks={down(marks.right)} size={height} />
      <span />
      <Rule side="bottom" marks={across(marks.bottom)} size={drawWidth} />
      <span />
    </div>
  );
}

/** A mark in floor units: from and to along the edge it is written on. */
type UnitMark = Mark;

/**
 * Euclid's algorithm as cutting squares. The whole rectangle with every round cut so far; when the
 * pieces get too small to see, the latest one again, magnified. The divisions a = bq + r are written
 * underneath, the latest in blue; ✂ cuts the next round, ↺ puts it back together.
 */
export function SquareCutterView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SquareCutterState & {
    steps: DivisionStep[];
    stepCount: number;
    hcf: number;
    isDone: boolean;
  };
  const long = Math.max(s.sideA, s.sideB);
  const short = Math.min(s.sideA, s.sideB);
  const all = layout(long, short, euclidSteps(long, short));
  const whole: Box = { x: 0, y: 0, w: long, h: short };
  const zoomAt = zoomStep(s);
  const zoomPiece = zoomAt === null ? undefined : all[zoomAt]?.rest;
  const isZoomed = zoomPiece !== undefined && !s.isZoomedOut;
  const frame = frameOf(long, short, width);
  // The window glides to the piece being cut, on the board's clock (the state is where it ends).
  const window = useBoardTween(
    isZoomed && zoomPiece !== undefined ? roomAround(zoomPiece, whole, frame.w / frame.h) : whole,
    ZOOM_SECONDS,
  );
  const [fit, columns] = useFitColumns<HTMLDivElement>(
    s.tileChoices.length,
    s.tileChoices.join(" "),
  );
  const word = (w: { en: string; hi?: string }) => w[locale as "en" | "hi"] ?? w.en;
  const L = s.letters;
  const name = (n: number, letter: keyof NonNullable<typeof L>) =>
    L === null ? String(n) : L[letter];
  const piece = s.cuts > 0 ? all[s.cuts]?.rest : undefined;
  const gap = s.tile > 0 ? tileAlong(long, s.tile).r : 0;
  const marks = {
    // The floor's sides on top and left; hidden while zoomed in, when they run far out of view.
    top: isZoomed ? [] : [{ from: 0, to: long, text: name(long, "long") }],
    left: isZoomed ? [] : [{ from: 0, to: short, text: name(short, "short") }],
    // Under the floor: one tile's side and the gap it leaves; or the piece still to cut.
    bottom:
      s.tile > 0
        ? [
            { from: 0, to: s.tile, text: name(s.tile, "tile") },
            ...(gap > 0
              ? [{ from: long - gap, to: long, text: name(gap, "gap"), tone: "gap" as const }]
              : []),
          ]
        : piece === undefined
          ? []
          : [
              {
                from: piece.x,
                to: piece.x + piece.w,
                text: L === null ? String(piece.w) : L.gap,
                tone: "piece" as const,
              },
            ],
    right:
      piece === undefined || s.tile > 0
        ? []
        : [
            {
              from: piece.y,
              to: piece.y + piece.h,
              text: L === null ? String(piece.h) : L.short,
              tone: "piece" as const,
            },
          ],
  };
  const cutLabel = word(s.cutLabel) ?? "Cut squares";
  return (
    <div class="pr-cutter">
      {s.isEditable && (
        <div class="pr-steppers">
          <NumberBox
            name="a"
            value={s.sideA}
            min={1}
            max={MAX_SIDE}
            part="a"
            onChange={(value) =>
              call(SquareCutterAction.SetSides, { sideA: value, sideB: s.sideB })
            }
          />
          <NumberBox
            name="b"
            value={s.sideB}
            min={1}
            max={MAX_SIDE}
            part="b"
            onChange={(value) =>
              call(SquareCutterAction.SetSides, { sideA: s.sideA, sideB: value })
            }
          />
        </div>
      )}
      <div class="pr-drawing" data-part="rectangle">
        <Drawing
          window={window}
          cuts={all}
          done={s.cuts}
          long={long}
          short={short}
          width={width}
          label={`A ${long} by ${short} rectangle, ${s.cuts} rounds of squares cut`}
          tile={s.tile}
          tilePart="tileGrid"
          fadeBelow={isZoomed && zoomAt !== null ? zoomAt : 0}
          marks={marks}
        />
      </div>
      {zoomPiece !== undefined && (
        <div class="pr-controls">
          <SymbolButton
            symbol={word(isZoomed ? s.words.showWhole : s.words.zoomIn)}
            label={word(isZoomed ? s.words.showWhole : s.words.zoomIn)}
            isWide
            part="zoom"
            onPress={() => call(SquareCutterAction.ToggleZoom)}
          />
        </div>
      )}
      {s.tile > 0 && L === null && (
        <ul class="pr-tile-working" data-part="tileWorking">
          {[long, short].map((side, i) => {
            const { q, r } = tileAlong(side, s.tile);
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: the two sides, in a fixed order
              <li key={i} class={r === 0 ? "is-fit" : "is-gap"}>
                {word(s.words.along).replace("{side}", String(side))} {side} = {s.tile} × {q} + {r},{" "}
                {r === 0 ? word(s.words.fits) : word(s.words.gap).replace("{r}", String(r))}
              </li>
            );
          })}
        </ul>
      )}
      {L === null && (
        <ol class="pr-working" data-part="working">
          {s.steps.map((step, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: identical items that never reorder
            <li key={i} class={i === s.steps.length - 1 ? "is-latest" : undefined}>
              {step.a} = {step.b} × {step.q} + {step.r}
            </li>
          ))}
        </ol>
      )}
      {s.tileChoices.length > 0 && (
        <div
          ref={fit}
          class="pr-controls pr-tile-choices"
          style={{ "--columns": String(columns) }}
          data-part="tiles"
        >
          {s.tileChoices.map((side) => (
            <SymbolButton
              key={side}
              symbol={`${side} × ${side}`}
              label={`Try a tile of side ${side}`}
              isOn={s.tile === side}
              onPress={() => call(SquareCutterAction.TryTile, { side: s.tile === side ? 0 : side })}
            />
          ))}
        </div>
      )}
      {s.canCut && (
        <div class="pr-controls">
          <SymbolButton
            symbol={cutLabel}
            label={cutLabel}
            isWide
            part="cut"
            isEnabled={!s.isDone}
            onPress={() => call(SquareCutterAction.Cut)}
          />
          <SymbolButton
            symbol="↺"
            label="Start again"
            part="startAgain"
            isEnabled={s.cuts > 0}
            onPress={() => call(SquareCutterAction.StartAgain)}
          />
        </div>
      )}
    </div>
  );
}
