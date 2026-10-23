import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { Cone, type Extent, type Frame, Hemisphere, Look, fit } from "./draw";
import {
  type Piece,
  type Recast,
  RecastAction,
  RecastPart,
  type RecastState,
  RecastStep,
  answerOf,
  recastOf,
  solvedTo,
  volumeAfter,
  volumeBefore,
  volumeOfPiece,
} from "./recast";
import { SolidShape, extentOf } from "./shapes";
import {
  type Dims,
  type Words,
  alignedTex,
  answerTex,
  eqTex,
  formulasOf,
  numTex,
  say,
  unitTex,
} from "./solids";
import { Button } from "./ui";

const WORDS = {
  next: { en: "Next", hi: "आगे" },
  again: { en: "Start again", hi: "फिर से" },
  before: { en: "Before", hi: "पहले" },
  after: { en: "After", hi: "बाद में" },
} as const satisfies Record<string, Words>;

const FILL: Dims = { l: 1, b: 1, h: 1, a: 1, r: 1, r1: 2, r2: 1 };
const full = (d: Partial<Dims>): Dims => ({ ...FILL, ...d });

/** A cone (apex down) with a hemisphere on it: an ice-cream cone, drawn as one. */
const isScoop = (pieces: Piece[]) =>
  pieces.length === 2 && pieces[0]?.solid === "cone" && pieces[1]?.solid === "hemisphere";

function extentOfPieces(pieces: Piece[]): Extent {
  if (isScoop(pieces)) {
    const cone = full(pieces[0]?.dims ?? {});
    return { y0: 0, y1: cone.h + cone.r, r: cone.r };
  }
  return extentOf(pieces[0]?.solid ?? "cube", full(pieces[0]?.dims ?? {}));
}

/** Frames for several pieces side by side in a box, all at one scale (so sizes compare). */
function frames(extents: Extent[], x0: number, w: number, height: number): Frame[] {
  const pad = 16;
  const between = 14;
  const fs = extents.map((e) => fit([e], 1e6, height, 20, 25, pad));
  const across = extents.reduce((sum, e) => sum + 2 * e.r, 0);
  const room = w - 2 * pad - between * (extents.length - 1);
  const k = Math.min(room / across, ...fs.map((f) => f.k));
  const used = across * k + between * (extents.length - 1);
  let x = x0 + (w - used) / 2;
  return fs.map((f, i) => {
    const e = extents[i] as Extent;
    const cx = x + k * e.r;
    x += 2 * k * e.r + between;
    return { ...f, k, cx, baseY: height - pad - k * e.r * f.sin + k * e.y0 * f.cos };
  });
}

function PieceShape({
  f,
  pieces,
  look,
  unit,
  showValues,
}: {
  f: Frame;
  pieces: Piece[];
  look: Look;
  unit: string;
  showValues: boolean;
}): JSX.Element {
  if (isScoop(pieces)) {
    const c = full(pieces[0]?.dims ?? {});
    return (
      <g>
        <Cone f={f} yBase={c.h} yApex={0} r={c.r} look={look} tone={3} hasBase={false} />
        <Hemisphere f={f} yFlat={c.h} r={c.r} isUp look={look} tone={2} />
      </g>
    );
  }
  const p = pieces[0] as Piece;
  return (
    <SolidShape
      f={f}
      solid={p.solid}
      d={full(p.dims)}
      look={p.sign === -1 ? Look.Ghost : look}
      tone={p.sign === -1 ? 4 : 1}
      labels={{ show: p.sign !== -1, values: showValues, unit }}
    />
  );
}

/** The worked lines up to the step. */
export function linesOf(r: Recast, step: number): string[] {
  const lines: string[] = [];
  const many = r.from.length > 1;
  for (const p of r.from) {
    const share = p.share === undefined ? "" : `${numTex(p.share)} \\times `;
    const sign = p.sign === -1 ? "-\\," : "";
    lines.push(
      `${sign}${share}${formulasOf(p.solid).volume} ${answerTex(Math.abs(volumeOfPiece(p, r.pi)), r.pi, r.unit, 3)}`,
    );
  }
  const v = volumeBefore(r);
  if (many) lines.push(`V_{\\text{before}} ${answerTex(v, r.pi, r.unit, 3)}`);
  if (step < RecastStep.After) return lines;
  const formula = r.to.map((p) => formulasOf(p.solid).volume).join(" + ");
  if (r.unknown.kind === "count") {
    lines.push(`V_{\\text{one}} = ${formula} ${answerTex(volumeAfter(r, 1), r.pi, r.unit, 3)}`);
    lines.push("n \\times V_{\\text{one}} = V_{\\text{before}}");
  } else {
    lines.push(`${formula} = V_{\\text{before}}`);
  }
  if (step < RecastStep.Solved) return lines;
  const x = answerOf(r);
  if (r.unknown.kind === "count") lines.push(`n = ${numTex(x, 0)}`);
  else {
    const places = x < 1 ? 4 : 2;
    lines.push(`${r.unknown.name} ${eqTex(x, places)} ${numTex(x, places)}${unitTex(r.unit, 1)}`);
  }
  return lines;
}

export function RecastPicture({
  r,
  step,
  width,
  height,
}: {
  r: Recast;
  step: number;
  width: number;
  height: number;
}): JSX.Element {
  const gap = 34;
  const half = (width - gap) / 2;
  const left = frames(
    r.from.map((p) => extentOfPieces([p])),
    0,
    half,
    height,
  );
  const to = step >= RecastStep.After ? solvedTo(r) : r.to;
  const [right] = frames([extentOfPieces(to)], half + gap, half, height);
  const melted = step >= RecastStep.Melted;
  const count =
    r.unknown.kind === "count" ? (step === RecastStep.Solved ? `× ${answerOf(r)}` : "× ?") : "";
  return (
    <Stage label={r.name.en} x={[0, width]} width={width} height={height} svg={{ class: "so-svg" }}>
      <g class={`so-before${melted ? " is-melted" : ""}`} data-part={RecastPart.Before}>
        {r.from.map((p, i) => (
          <PieceShape
            // biome-ignore lint/suspicious/noArrayIndexKey: the pieces are positional
            key={i}
            f={left[i] as Frame}
            pieces={[p]}
            look={melted ? Look.Ghost : Look.Solid}
            unit={r.unit}
            showValues
          />
        ))}
      </g>
      <path
        class="so-arrow"
        d={`M ${Math.round(half + 6)} ${Math.round(height - 30)} H ${Math.round(half + gap - 6)} m -7 -6 l 7 6 l -7 6`}
      />
      {step >= RecastStep.After && right && (
        <g class="so-after is-filling" data-part={RecastPart.After}>
          <PieceShape
            f={right}
            pieces={to}
            look={Look.Solid}
            unit={r.unit}
            showValues={step === RecastStep.Solved}
          />
          {count !== "" && (
            <text class="so-count" x={Math.round(width - 6)} y={22} text-anchor="end">
              {count}
            </text>
          )}
        </g>
      )}
    </Stage>
  );
}

export function RecastView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as RecastState;
  const r = recastOf(s.kind);
  const height = Math.round(Math.min(220, width * 0.58));
  const lines = linesOf(r, s.step);
  return (
    <div class="so-recast">
      <div class="so-caption">
        <span>{say(locale, WORDS.before)}</span>
        <span class="so-verb">{say(locale, r.verb)}</span>
        <span>{say(locale, WORDS.after)}</span>
      </div>
      <RecastPicture r={r} step={s.step} width={width} height={height} />
      {s.showLines && (
        <div class="so-lines" data-part={RecastPart.Lines}>
          <RichText text={alignedTex(lines)} />
        </div>
      )}
      {s.canStep && (
        <div class="so-controls">
          {s.step > 0 && (
            <Button
              isWide
              part={RecastPart.Back}
              label={say(locale, WORDS.again)}
              onPress={() => call(RecastAction.Back, {})}
            >
              {say(locale, WORDS.again)}
            </Button>
          )}
          {s.step < RecastStep.Solved && (
            <Button
              isWide
              part={RecastPart.Step}
              label={say(locale, WORDS.next)}
              onPress={() => call(RecastAction.Step, {})}
            >
              {say(locale, WORDS.next)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
