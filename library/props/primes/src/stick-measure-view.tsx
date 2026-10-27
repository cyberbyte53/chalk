import { type PropViewProps, does, says, useFitColumns } from "@chalk/player";
import type { JSX } from "preact";
import { type DivisionStep, euclidSteps } from "./arithmetic";
import {
  MAX_STICK,
  type StickMeasureState,
  fillStep,
  fitLines,
  pieceGap,
  stickMeasure,
  workingOf,
} from "./stick-measure";
import { NumberBox, SymbolButton } from "./ui";

/** Px: the sticks' thickness, the room for a length above or below, and the side margin. */
const BAR = 22;
const LABEL = 22;
const SIDE = 8;
/** Narrowest stretch, in px, that still gets its length written on it. */
const MIN_LABEL = 22;
/** Closest piece marks are drawn, in px; closer than this they'd be a smudge. */
const MIN_MARK = 4;

/** A length written over [x0, x1]: a line with end ticks and the value in the middle. */
function Length({
  x0,
  x1,
  y,
  text,
  tone,
}: { x0: number; x1: number; y: number; text: string; tone?: "left" | "short" }) {
  if (x1 - x0 < MIN_LABEL) return null;
  const mid = (x0 + x1) / 2;
  return (
    <g class={tone === undefined ? "pr-length" : `pr-length is-${tone}`}>
      <line x1={x0 + 1} y1={y} x2={x1 - 1} y2={y} />
      <line x1={x0 + 1} y1={y - 5} x2={x0 + 1} y2={y + 5} />
      <line x1={x1 - 1} y1={y - 5} x2={x1 - 1} y2={y + 5} />
      <text x={mid} y={y} dominant-baseline="central" text-anchor="middle">
        {text}
      </text>
    </g>
  );
}

/** Marks every `piece` along a stick from x0, and the stretch at its end that no piece fills. */
function PieceMarks({
  x0,
  length,
  piece,
  scale,
  y,
}: { x0: number; length: number; piece: number; scale: number; y: number }) {
  if (piece <= 0) return null;
  const whole = Math.floor(length / piece);
  const gap = pieceGap(length, piece);
  const marks = piece * scale >= MIN_MARK ? Array.from({ length: whole }, (_, k) => k + 1) : [];
  return (
    <g>
      {marks.map((k) =>
        k * piece === length ? null : (
          <line
            key={k}
            class="pr-piece-mark"
            x1={x0 + k * piece * scale}
            y1={y}
            x2={x0 + k * piece * scale}
            y2={y + BAR}
          />
        ),
      )}
      {gap > 0 && (
        <rect
          class="pr-piece-gap"
          x={x0 + whole * piece * scale}
          y={y}
          width={gap * scale}
          height={BAR}
        />
      )}
    </g>
  );
}

/** The pair in front of the learner: the long stick on top; the short one under it, alone or laid. */
function Sticks({
  step,
  isLaid,
  piece,
  width,
  names,
}: {
  step: DivisionStep;
  isLaid: boolean;
  piece: number;
  width: number;
  names: { long: string; short: string; left: string };
}) {
  const room = width - 2 * SIDE;
  const scale = room / step.a;
  const topY = LABEL;
  const lowY = topY + BAR + 10;
  const height = lowY + BAR + LABEL;
  const copies = isLaid ? step.q : 1;
  const laidEnd = SIDE + copies * step.b * scale;
  return (
    <svg
      class="pr-sticks-art"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={`Sticks of ${step.a} and ${step.b}`}
    >
      <Length x0={SIDE} x1={SIDE + room} y={LABEL / 2} text={names.long} />
      <rect class="pr-stick" x={SIDE} y={topY} width={room} height={BAR} />
      {isLaid && step.r > 0 && (
        <rect class="pr-stick-left" x={laidEnd} y={topY} width={step.r * scale} height={BAR} />
      )}
      <PieceMarks x0={SIDE} length={step.a} piece={piece} scale={scale} y={topY} />
      {Array.from({ length: copies }, (_, k) => {
        const x = SIDE + k * step.b * scale;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: identical copies that never reorder
          <g key={k}>
            <rect
              class={k % 2 === 0 ? "pr-stick is-short" : "pr-stick is-short is-alt"}
              x={x}
              y={lowY}
              width={step.b * scale}
              height={BAR}
            />
            <PieceMarks x0={x} length={step.b} piece={piece} scale={scale} y={lowY} />
            <Length
              x0={x}
              x1={x + step.b * scale}
              y={lowY + BAR + LABEL / 2}
              text={names.short}
              tone="short"
            />
          </g>
        );
      })}
      {isLaid && step.r > 0 && (
        <Length
          x0={laidEnd}
          x1={SIDE + room}
          y={lowY + BAR + LABEL / 2}
          text={names.left}
          tone="left"
        />
      )}
    </svg>
  );
}

/**
 * Euclid's method with two sticks: the longer on top, the shorter under it; Lay puts as many copies
 * of the shorter along the longer as fit and colours the leftover; Keep moves on to the shorter and
 * the leftover, drawn to fill the width again. The steps are written underneath.
 */
export function StickMeasureView({
  view,
  width,
  call,
  locale,
}: PropViewProps<typeof stickMeasure>): JSX.Element {
  const s = view;
  const steps = euclidSteps(s.stickA, s.stickB);
  const step = steps[s.rounds];
  const word = (w: { en: string; hi?: string }) => w[locale as "en" | "hi"] ?? w.en;
  const [fit, columns] = useFitColumns<HTMLDivElement>(
    s.pieceChoices.length,
    s.pieceChoices.join(" "),
  );
  const L = s.letters;
  const working = workingOf(s, locale);
  return (
    <div class="pr-sticks">
      {s.isEditable && (
        <div class="pr-steppers">
          <NumberBox
            name="a"
            value={s.stickA}
            min={1}
            max={MAX_STICK}
            part="a"
            {...says(stickMeasure.actions.setSticks)}
            onChange={(value) =>
              call(stickMeasure.actions.setSticks, { stickA: value, stickB: s.stickB })
            }
          />
          <NumberBox
            name="b"
            value={s.stickB}
            min={1}
            max={MAX_STICK}
            part="b"
            {...says(stickMeasure.actions.setSticks)}
            onChange={(value) =>
              call(stickMeasure.actions.setSticks, { stickA: s.stickA, stickB: value })
            }
          />
        </div>
      )}
      {step !== undefined && (
        <div data-part="sticks">
          <Sticks
            step={step}
            isLaid={s.isLaid}
            piece={s.piece}
            width={width}
            names={
              L === null ? { long: String(step.a), short: String(step.b), left: String(step.r) } : L
            }
          />
        </div>
      )}
      {s.pieceChoices.length > 0 && (
        <div ref={fit} class="pr-controls pr-tile-choices" style={{ "--columns": String(columns) }}>
          {s.pieceChoices.map((n) => (
            <SymbolButton
              key={n}
              symbol={String(n)}
              label={`Mark pieces of ${n}`}
              part={`piece-${n}`}
              isOn={s.piece === n}
              {...does(stickMeasure.actions.tryPiece, { length: s.piece === n ? 0 : n })}
            />
          ))}
        </div>
      )}
      {fitLines(s, locale).length > 0 && (
        <ul class="pr-fit" data-part="fit">
          {fitLines(s, locale).map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: one line per stick, in order
            <li key={i} class={line.fits ? "is-fit" : "is-gap"}>
              {line.text}
            </li>
          ))}
        </ul>
      )}
      {working.length > 0 && L === null && s.canLay && (
        <ol class="pr-working" data-part="working">
          {working.map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: one line per step, in order
            <li key={i} class={i === working.length - 1 ? "is-latest" : undefined}>
              {line}
            </li>
          ))}
        </ol>
      )}
      {s.canLay && step !== undefined && (
        <div class="pr-controls">
          {s.isLaid && step.r > 0 ? (
            <SymbolButton
              symbol={word(s.words.keep)}
              label={word(s.words.keep)}
              isWide
              part="keep"
              {...does(stickMeasure.actions.keep)}
            />
          ) : (
            <SymbolButton
              symbol={fillStep(word(s.words.lay), step)}
              label={fillStep(word(s.words.lay), step)}
              isWide
              part="lay"
              isEnabled={!s.isLaid}
              {...does(stickMeasure.actions.lay)}
            />
          )}
          <SymbolButton
            symbol="↺"
            label="Start again"
            part="startAgain"
            isEnabled={s.rounds > 0 || s.isLaid}
            {...does(stickMeasure.actions.startAgain)}
          />
        </div>
      )}
    </div>
  );
}
