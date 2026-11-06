import type { Locale } from "@chalk/content";
import { LabelSide, Stage, useLabel } from "@chalk/draw";
import type { PropView, PropViewProps } from "@chalk/player";
import { does, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { useId, useRef } from "preact/hooks";
import {
  Attention,
  type Child,
  PER_ROW,
  type Standing,
  StandingKind,
  VISIT_WALK,
  chance,
  classroom,
  rowOf,
} from "./classroom";
import { ATTENTION_WORDS, STANDING_WORDS, WORDS, word } from "./words";

type View = PropView<typeof classroom>;
const actions = classroom.actions;

// The room is drawn in a box 360 wide (the stage scales it to the column).
const W = 360;
const H = 358;
/** The blackboard: its frame's outer box. */
const BOARD = { x: 14, y: 12, w: 286, h: 132 };
const FRAME = 7;
/** Where the lines are chalked: their left edge, how wide they may be, the first baseline, the gap. */
const LINE_X = 32;
const LINE_W = 252;
const FIRST_BASELINE = 46;
const LINE_GAP = 27;
const FONT = 14.5;
/** Where the floor meets the wall; the teacher stands on it. */
const FLOOR_Y = 178;
/** How much lower his body is, crouched. */
const CROUCH_DROP = 46;
/** Where the teacher stands when he isn't writing: beside the board. */
const TEACHER_HOME = 330;
/** A line's writing: he walks up for the first part, writes, and steps back for the last. */
const WALK_IN = 0.16;
const WALK_OUT = 0.88;
/** The rows of benches, front (by the board) to back: each row's seat line and how big it's drawn. */
const ROWS = [
  { y: 226, scale: 0.72 },
  { y: 288, scale: 0.86 },
  { y: 352, scale: 1 },
];
/** Across a row, each seat's place from the middle at full size: two benches, an aisle between. */
const SEATS = [-118, -48, 48, 118];

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const x = clamp(v);
  return x * x * (3 - 2 * x);
};
const mix = (a: number, b: number, f: number) => a + (b - a) * f;

const HairStyle = {
  Short: "short",
  Plaits: "plaits",
  Bun: "bun",
  Ponytail: "ponytail",
  Curly: "curly",
} as const;
type HairStyle = (typeof HairStyle)[keyof typeof HairStyle];
const STYLES: readonly HairStyle[] = [
  HairStyle.Short,
  HairStyle.Plaits,
  HairStyle.Short,
  HairStyle.Bun,
  HairStyle.Ponytail,
  HairStyle.Curly,
];
const SHIRTS = 6;
const RIBBONS = 3;

/** How a child looks, drawn from the seed: the same seed, the same class. */
type Looks = {
  hair: HairStyle;
  shirt: number;
  ribbon: number;
  headR: number;
  shoulder: number;
  nudge: number;
  /** Which way the head tilts when it drops, and which hand goes up: −1 left, 1 right. */
  tilt: number;
  side: number;
};

function looksOf(seed: number, i: number): Looks {
  const c = (n: number) => chance(seed, 1000 + i * 16 + n);
  return {
    hair: STYLES[Math.floor(c(0) * STYLES.length)] ?? HairStyle.Short,
    shirt: Math.floor(c(1) * SHIRTS),
    ribbon: Math.floor(c(2) * RIBBONS),
    headR: 12 + c(3) * 2.4,
    shoulder: 18 + c(4) * 4,
    nudge: (c(5) - 0.5) * 8,
    tilt: c(6) < 0.5 ? -1 : 1,
    side: c(7) < 0.5 ? -1 : 1,
  };
}

/** Where a child sits: their seat's middle, and how big they're drawn. */
function seatOf(i: number, count: number): { x: number; y: number; scale: number } {
  const rows = Math.ceil(count / PER_ROW);
  // Fewer rows: the class sits at the back rows' size, nearer the board.
  const row = ROWS[Math.min(ROWS.length - 1, rowOf(i) + (ROWS.length - rows))] ?? ROWS[0];
  const { y, scale } = row ?? { y: 226, scale: 0.72 };
  return { x: W / 2 + scale * (SEATS[i % PER_ROW] ?? 0), y, scale };
}

/** A chalk line's width, estimated from its letters, and the size it's written at to fit. */
function lineFit(text: string): { width: number; size: number } {
  const perLetter = /[ऀ-ॿ]/.test(text) ? 0.54 : 0.46;
  const natural = text.length * FONT * perLetter;
  if (natural <= LINE_W) return { width: natural, size: FONT };
  return { width: LINE_W, size: Math.max(11, (FONT * LINE_W) / natural) };
}

const baselineOf = (k: number) => FIRST_BASELINE + LINE_GAP * k;

/** The arm of a child: from the shoulder, swung from hanging down (0) to straight up (1). */
function Arm({ side, shoulder, h }: { side: number; shoulder: number; h: number }) {
  const sx = side * (shoulder - 6);
  const sy = -33;
  // Down is resting out on the desk (25°); up is a little out from straight up.
  const a = (mix(25, -84, h) * Math.PI) / 180;
  const upper = 25;
  const fore = 24;
  const ex = sx + side * upper * Math.cos(a);
  const ey = sy + upper * Math.sin(a);
  // The forearm bends a little in, hanging; straight, up.
  const b = a - (12 * (1 - h) * Math.PI) / 180;
  const hx = ex + side * fore * Math.cos(b);
  const hy = ey + fore * Math.sin(b);
  return (
    <g class="cl-arm">
      <line class="cl-sleeve" x1={sx} y1={sy} x2={ex} y2={ey} />
      <line class="cl-forearm" x1={ex} y1={ey} x2={hx} y2={hy} />
      <circle class="cl-skin" cx={hx} cy={hy} r={4.6} />
      {h > 0.9 && (
        <path
          class="cl-fingers"
          d={`M${hx - 3} ${hy - 3} l -1 -4 M${hx} ${hy - 4.5} l 0 -4.5 M${hx + 3} ${hy - 3} l 1 -4`}
        />
      )}
    </g>
  );
}

/** The back of a child's head: hair, ears, and what hangs behind it (drawn after the shirt). */
function HeadBack({ look }: { look: Looks }) {
  const r = look.headR;
  return (
    <g>
      <ellipse class="cl-skin" cx={-r} cy={2} rx={2.6} ry={3.6} />
      <ellipse class="cl-skin" cx={r} cy={2} rx={2.6} ry={3.6} />
      {look.hair === HairStyle.Curly ? (
        <path
          class="cl-hair"
          d={`M${-r} 3 ${Array.from({ length: 9 }, (_, k) => {
            const a = Math.PI + (k + 1) * (Math.PI / 9) - Math.PI / 18;
            const rr = r + 2.5;
            return `A 4 4 0 0 1 ${rr * Math.cos(a)} ${rr * Math.sin(a)}`;
          }).join(" ")} L ${r} 3 Q ${r} ${r + 2} 0 ${r + 1} Q ${-r} ${r + 2} ${-r} 3 Z`}
        />
      ) : (
        <circle class="cl-hair" r={r} />
      )}
      {/* A few chalk strokes for the hair's lie. */}
      <path
        class="cl-hair-lines"
        d={`M${-r * 0.5} ${-r * 0.7} q ${r * 0.3} ${r * 0.8} ${r * 0.1} ${r * 1.4} M${r * 0.15} ${-r * 0.9} q ${r * 0.2} ${r * 0.9} ${-r * 0.05} ${r * 1.6} M${r * 0.6} ${-r * 0.6} q ${-r * 0.05} ${r * 0.7} ${-r * 0.2} ${r * 1.2}`}
      />
      {look.hair === HairStyle.Bun && <circle class="cl-hair" cx={0} cy={-r * 0.95} r={r * 0.45} />}
    </g>
  );
}

/** What hangs down the back: plaits with their ribbons, or a ponytail. */
function HairDown({ look }: { look: Looks }) {
  const r = look.headR;
  if (look.hair === HairStyle.Plaits) {
    return (
      <g>
        {[-1, 1].map((d) => (
          <g key={d}>
            <path class="cl-plait" d={`M${d * r * 0.55} ${r * 0.5} q ${d * 3} 10 ${d * 1} 22`} />
            <circle
              class={`cl-ribbon is-${look.ribbon}`}
              cx={d * r * 0.55 + d}
              cy={r * 0.5 + 23}
              r={3.2}
            />
          </g>
        ))}
      </g>
    );
  }
  if (look.hair === HairStyle.Ponytail) {
    return (
      <g>
        <path class="cl-plait is-tail" d={`M0 ${r * 0.6} q 4 9 1 17`} />
        <circle class={`cl-ribbon is-${look.ribbon}`} cx={0} cy={r * 0.62} r={2.8} />
      </g>
    );
  }
  return null;
}

/** One child at a bench, seen from the back, at the origin (their seat's middle). */
function Pupil({ c, look, id }: { c: Child; look: Looks; id: string }) {
  const sh = look.shoulder;
  const r = look.headR;
  const headY = -33 - r + 2 + 8 * c.drop;
  const headTilt = look.tilt * 26 * c.drop;
  const head = `translate(${look.side * -1.5 * c.drop} ${headY}) rotate(${headTilt})`;
  return (
    <g>
      {c.glow > 0 && (
        <g opacity={c.glow}>
          <circle class="cl-halo" cx={0} cy={-44} r={46} fill={`url(#${id}-glow)`} />
          <g transform={`translate(${look.side * -19} -29) rotate(${look.side * 9})`}>
            <rect class="cl-slate" x={-13} y={-9} width={26} height={17} rx={2.5} />
            <path class="cl-slate-lines" d="M-7 -3 h 10 M-7 1 h 14" />
          </g>
        </g>
      )}
      <rect class="cl-skin" x={-3.5} y={-38} width={7} height={8} />
      <g transform={head} class="cl-head">
        <HeadBack look={look} />
        {c.glow > 0 && (
          <path
            class="cl-rim"
            opacity={c.glow}
            d={`M${-r * 0.8} ${-r * 0.6} A ${r} ${r} 0 0 1 ${r * 0.8} ${-r * 0.6}`}
          />
        )}
      </g>
      <path
        class={`cl-shirt is-${look.shirt}`}
        d={`M${-sh} 0 L ${-sh + 1} -24 Q ${-sh} -34 ${-sh + 9} -35 L ${sh - 9} -35 Q ${sh} -34 ${sh - 1} -24 L ${sh} 0 Z`}
      />
      <path
        class="cl-fold"
        d={`M-6 -35 Q 0 -30.5 6 -35 M${-sh * 0.45} -22 q 2 9 0 18 M${sh * 0.5} -20 q -2 8 0 16`}
      />
      <g transform={head}>
        <HairDown look={look} />
      </g>
      {c.hand > 0.02 && <Arm side={look.side} shoulder={sh} h={c.hand} />}
      {c.spark > 0.02 && (
        <g
          class="cl-spark"
          opacity={c.spark}
          transform={`translate(${look.side * (sh + 4)} -114) scale(${0.6 + 0.4 * c.spark})`}
        >
          <path
            class="cl-spark-rays"
            d="M-11 -4 l -5 -2 M11 -4 l 5 -2 M-9 6 l -5 2 M9 6 l 5 2 M0 -13 l 0 -5"
          />
          <text class="cl-bang" y={6} text-anchor="middle">
            !
          </text>
        </g>
      )}
      {c.hasQuestion && (
        <text
          class="cl-question"
          x={look.tilt * -14}
          y={-56}
          text-anchor="middle"
          style={{ animationDelay: `${(look.nudge + 4) * 0.12}s` }}
        >
          ?
        </text>
      )}
    </g>
  );
}

/** A row's two benches: a desk top before the children, and the bench they sit on. */
function Benches({ y, scale }: { y: number; scale: number }) {
  return (
    <g>
      {[-1, 1].map((d) => {
        const inner = W / 2 + d * scale * 22;
        const outer = W / 2 + d * scale * 146;
        const x0 = Math.min(inner, outer);
        const w = Math.abs(outer - inner);
        return (
          <g key={d}>
            <rect class="cl-desk" x={x0} y={y - 31 * scale} width={w} height={6 * scale} rx={1.5} />
            <line
              class="cl-desk-leg"
              x1={outer - d * 4 * scale}
              y1={y - 25 * scale}
              x2={outer - d * 4 * scale}
              y2={y - 4 * scale}
            />
            <rect
              class="cl-bench"
              x={x0 - 2}
              y={y - 2 * scale}
              width={w + 4}
              height={6 * scale}
              rx={1.5}
            />
          </g>
        );
      })}
    </g>
  );
}

/** The teacher, a young man, standing at the origin (his feet), facing the class or, writing, the board. */
function Teacher({
  isBack,
  hand,
  bob,
  stride,
  crouch = 0,
  hasChalk = true,
}: {
  isBack: boolean;
  /** Where his writing hand is, from his feet; or none (arms down). */
  hand: { x: number; y: number } | null;
  bob: number;
  /** −1 to 1: how far his legs are apart mid-step (0 standing). */
  stride: number;
  /** 0 standing, 1 crouched down beside a child. */
  crouch?: number;
  /** Whether his raised hand holds chalk (at the board) or reaches to a slate. */
  hasChalk?: boolean;
}) {
  const sx = 11;
  const sy = -92;
  let arm: JSX.Element | null = null;
  if (hand !== null) {
    // His right arm up at the board: a rolled sleeve to the elbow, then the bare forearm.
    const ex = mix(sx, hand.x, 0.5) + 6;
    const ey = mix(sy, hand.y, 0.5) + 4;
    arm = (
      <g class="cl-arm">
        <path class="cl-teacher-sleeve" d={`M${sx} ${sy} L ${ex} ${ey}`} />
        <path class="cl-forearm" d={`M${ex} ${ey} L ${hand.x} ${hand.y}`} />
        <circle class="cl-cuff" cx={ex} cy={ey} r={3.4} />
        <circle class="cl-skin" cx={hand.x} cy={hand.y} r={4} />
        {hasChalk && (
          <line class="cl-stick" x1={hand.x} y1={hand.y} x2={hand.x - 3} y2={hand.y - 6} />
        )}
      </g>
    );
  }
  const step = stride * 6;
  const c = clamp(crouch);
  // Crouched, his body is this much lower and his knees come up and out.
  const lower = CROUCH_DROP * c;
  const legs = [-1, 1].map((d) => {
    const hip = { x: d * mix(6.5, 9, c), y: -50 + lower };
    const knee = { x: d * mix(6.5, 17, c) + d * step * 0.5, y: mix(-26, -17, c) };
    const foot = { x: d * mix(6, 12, c) + d * step, y: -2 };
    return { d, hip, knee, foot };
  });
  return (
    <g transform={`translate(0 ${bob})`}>
      {/* Trousers, a leg each (bending into a crouch), and shoes. */}
      {legs.map(({ d, hip, knee, foot }) => (
        <g key={d}>
          <path
            class="cl-leg"
            d={`M${hip.x} ${hip.y} L ${knee.x} ${knee.y} L ${foot.x} ${foot.y}`}
          />
          <path class="cl-shoe" d={`M${foot.x - 4.5} ${foot.y - 1} h 9 q 1.5 3 -1 3 h -8 Z`} />
        </g>
      ))}
      <g transform={`translate(0 ${lower})`}>
        <path class="cl-trousers" d="M-13 -50 L 13 -50 L 11 -38 L -11 -38 Z" />
        <rect class="cl-skin" x={-3} y={-100} width={6} height={9} />
        {/* His shirt, tucked in at a belt. */}
        <path
          class="cl-teacher-shirt"
          d="M-13 -48 L -14 -84 Q -13 -93 -5 -94 L 5 -94 Q 13 -93 14 -84 L 13 -48 Z"
        />
        <path class="cl-belt" d="M-13 -49 L 13 -49" />
        {isBack ? (
          <path class="cl-shirt-seam" d="M-9 -84 Q 0 -80 9 -84 M0 -80 L 0 -52" />
        ) : (
          <g>
            <path class="cl-collar" d="M-5 -94 L 0 -87 L 5 -94" />
            <path class="cl-shirt-seam" d="M0 -87 L 0 -50" />
            <circle class="cl-button" cx={0} cy={-80} r={0.9} />
            <circle class="cl-button" cx={0} cy={-70} r={0.9} />
            <circle class="cl-button" cx={0} cy={-60} r={0.9} />
            <path class="cl-shirt-seam" d="M5 -84 h 5 v 5 h -5 Z" />
          </g>
        )}
        {/* Arms: rolled sleeves to the elbow, forearms bare; his right up at the board when writing. */}
        <path class="cl-teacher-sleeve" d="M-12 -88 L -15 -70" />
        <circle class="cl-cuff" cx={-15} cy={-70} r={3.4} />
        <path class="cl-forearm" d="M-15 -70 L -15 -52" />
        {hand === null && (
          <g>
            <path class="cl-teacher-sleeve" d="M12 -88 L 15 -70" />
            <circle class="cl-cuff" cx={15} cy={-70} r={3.4} />
            <path class="cl-forearm" d="M15 -70 L 15 -52" />
          </g>
        )}
        {isBack ? (
          <g>
            <ellipse class="cl-skin" cx={-9.3} cy={-106} rx={2} ry={3} />
            <ellipse class="cl-skin" cx={9.3} cy={-106} rx={2} ry={3} />
            <path
              class="cl-hair"
              d="M-9.5 -104 A 9.5 9.5 0 1 1 9.5 -104 Q 5 -100 0 -100 Q -5 -100 -9.5 -104 Z"
            />
            <path class="cl-hair-lines" d="M-4 -115 q 2 5 1 10 M3 -116 q 1 5 -1 10" />
          </g>
        ) : (
          <g>
            <ellipse class="cl-skin" cx={-9.3} cy={-107} rx={2} ry={3} />
            <ellipse class="cl-skin" cx={9.3} cy={-107} rx={2} ry={3} />
            <circle class="cl-face" cx={0} cy={-108} r={9.3} />
            {/* Short hair, a side parting with a little lift at the front. */}
            <path
              class="cl-hair"
              d="M-9.6 -107 Q -10.5 -118 -1 -119 Q 9 -120 10 -110 L 9.6 -106 Q 7 -112 2 -113 Q -4 -112 -6 -110 Q -8 -109 -9.6 -107 Z"
            />
            <circle class="cl-eye" cx={-3.4} cy={-106} r={1.1} />
            <circle class="cl-eye" cx={3.4} cy={-106} r={1.1} />
            <path class="cl-smile" d="M-3 -101.5 Q 0 -99 3 -101.5" />
          </g>
        )}
        {arm}
      </g>
    </g>
  );
}

/** A walk, `f` of the way along: three steps, his head bobbing, his legs apart mid-step. */
const walkOf = (f: number): { bob: number; stride: number } => ({
  bob: -Math.abs(Math.sin(f * Math.PI * 3)) * 2,
  stride: Math.sin(f * Math.PI * 3),
});

type TeacherNow = {
  x: number;
  /** His feet's height on the page: the floor by the board, or a row he has walked down to. */
  y: number;
  /** How big he is drawn: bigger the nearer he comes. */
  scale: number;
  /** −1: turned to face left (towards a child on his left), 1 as drawn. */
  facing: number;
  isBack: boolean;
  hand: { x: number; y: number } | null;
  bob: number;
  stride: number;
  crouch: number;
  isVisiting: boolean;
};

/** Where he walks along the front, in front of the first row. */
const FRONT_Y = 190;
const NEAREST_Y = ROWS[ROWS.length - 1]?.y ?? 352;
/** How big he is drawn at this height on the page: 1 by the board, larger nearer. */
const teacherScaleAt = (y: number) => 1 + (0.1 * (y - FLOOR_Y)) / (NEAREST_Y - FLOOR_Y);

/** Where he crouches beside a child: in the aisle by an inner seat, by the wall at an outer one. */
function besideOf(
  i: number,
  count: number,
  seed: number,
): { x: number; y: number; toward: number } {
  const at = seatOf(i, count);
  const look = looksOf(seed, i);
  const x = at.x + look.nudge * at.scale;
  const seat = i % PER_ROW;
  const isInner = seat === 1 || seat === 2;
  const away = seat < 2 ? (isInner ? 1 : -1) : isInner ? -1 : 1;
  // In the aisle he stands in its middle, clear of both benches.
  return { x: isInner ? W / 2 : x + away * 37 * at.scale, y: at.y + 4, toward: -away };
}

/** A point `f` of the way along a path of corners, by distance. */
function along(path: readonly { x: number; y: number }[], f: number): { x: number; y: number } {
  const legs = path.slice(1).map((b, k) => {
    const a = path[k] as { x: number; y: number };
    return Math.hypot(b.x - a.x, b.y - a.y);
  });
  const total = legs.reduce((sum, d) => sum + d, 0);
  let left = clamp(f) * total;
  for (let k = 0; k < legs.length; k++) {
    const d = legs[k] as number;
    const a = path[k] as { x: number; y: number };
    const b = path[k + 1] as { x: number; y: number };
    if (left <= d && d > 0) return { x: mix(a.x, b.x, left / d), y: mix(a.y, b.y, left / d) };
    left -= d;
  }
  return path.at(-1) ?? { x: 0, y: 0 };
}

/** Where he crouches when he has come to a child (or none: he is by the board). */
const restingAt = (s: View) => (s.visited === null ? null : besideOf(s.visited, s.count, s.seed));

/** Where the teacher is and what he's doing now: by the board, writing, walking to a child, or beside one. */
function teacherNow(s: View, locale: Locale): TeacherNow {
  const still = {
    x: TEACHER_HOME,
    y: FLOOR_Y,
    scale: 1,
    facing: 1,
    isBack: false,
    hand: null,
    bob: 0,
    stride: 0,
    crouch: 0,
    isVisiting: false,
  };
  if (s.visiting !== null) {
    const to = besideOf(s.visiting, s.count, s.seed);
    const rest = restingAt(s);
    const from = rest ?? { x: TEACHER_HOME, y: FLOOR_Y };
    const path = [from, { x: from.x, y: FRONT_Y }, { x: to.x, y: FRONT_Y }, to];
    const walked = clamp(s.visit / VISIT_WALK);
    const at = along(path, smooth(walked));
    const crouch = smooth((s.visit - VISIT_WALK) / 0.12);
    const isWalking = walked < 1;
    return {
      ...still,
      x: at.x,
      y: at.y,
      scale: teacherScaleAt(at.y),
      facing: isWalking ? 1 : to.toward,
      ...(isWalking ? walkOf(walked * 3) : { bob: 0, stride: 0 }),
      crouch,
      hand: crouch > 0.6 ? { x: 22, y: -70 } : null,
      isVisiting: true,
    };
  }
  const rest = restingAt(s);
  if (rest !== null && (s.lines.length === 0 || s.writing >= 1)) {
    return {
      ...still,
      x: rest.x,
      y: rest.y,
      scale: teacherScaleAt(rest.y),
      facing: rest.toward,
      crouch: 1,
      hand: { x: 22, y: -70 },
      isVisiting: true,
    };
  }
  const k = s.lines.length - 1;
  const line = s.lines[k];
  if (line === undefined || s.writing >= 1) return still;
  const p = s.writing;
  const { width, size } = lineFit(word(line, locale));
  const r = clamp((p - WALK_IN) / (WALK_OUT - WALK_IN));
  const tipX = LINE_X + r * width;
  const tipY = baselineOf(k) - size * 0.3 + Math.sin(r * 70) * 2.2;
  // He writes with his right hand, standing a little left of the chalk.
  const at = (x: number) => Math.max(26, x - 14);
  if (p < WALK_IN) {
    const f = smooth(p / WALK_IN);
    const x = mix(TEACHER_HOME, at(LINE_X), f);
    return { ...still, x, isBack: true, ...walkOf(f) };
  }
  if (p > WALK_OUT) {
    const f = smooth((p - WALK_OUT) / (1 - WALK_OUT));
    const x = mix(at(LINE_X + width), TEACHER_HOME, f);
    return { ...still, x, ...walkOf(f) };
  }
  const x = at(tipX);
  return { ...still, x, isBack: true, hand: { x: tipX - x, y: tipY - FLOOR_Y } };
}

/** The board's lines, each chalked left to right as far as it's written; the duster clears them. */
function Lines({ s, locale, id }: { s: View; locale: Locale; id: string }) {
  const last = s.lines.length - 1;
  const wipeX = BOARD.x + s.wiping * (BOARD.w + 30) - 15;
  return (
    <g class="cl-writing">
      {s.lines.map((line, k) => {
        const text = word(line, locale);
        const fit = lineFit(text);
        const y = baselineOf(k);
        const p =
          k === last && s.writing < 1 ? clamp((s.writing - WALK_IN) / (WALK_OUT - WALK_IN)) : 1;
        if (p <= 0) return null;
        const from = s.wiping > 0 ? wipeX : LINE_X - 6;
        const to = LINE_X + p * fit.width + 2;
        if (to <= from) return null;
        return (
          <g key={k}>
            <clipPath id={`${id}-line${k}`}>
              <rect x={from} y={y - fit.size - 6} width={to - from} height={fit.size + 14} />
            </clipPath>
            <text
              class="cl-chalk-text"
              x={LINE_X}
              y={y}
              textLength={fit.width}
              lengthAdjust="spacingAndGlyphs"
              style={{ fontSize: `${fit.size}px` }}
              clip-path={`url(#${id}-line${k})`}
            >
              {text}
            </text>
          </g>
        );
      })}
      {s.wiping > 0 && (
        <g>
          <rect
            class="cl-smear"
            x={BOARD.x + FRAME}
            y={FIRST_BASELINE - 24}
            width={Math.max(0, wipeX - BOARD.x - FRAME)}
            height={LINE_GAP * Math.max(1, s.lines.length) + 8}
          />
          <g
            transform={`translate(${wipeX} ${FIRST_BASELINE + LINE_GAP * 0.6 * Math.sin(s.wiping * 14)})`}
          >
            <rect class="cl-duster-felt" x={-15} y={-2} width={30} height={9} rx={2} />
            <rect class="cl-duster" x={-15} y={-9} width={30} height={9} rx={3} />
          </g>
        </g>
      )}
    </g>
  );
}

const TAG_CLASS: Record<StandingKind, string> = {
  [StandingKind.NeedsHelp]: "is-needs-help",
  [StandingKind.OnTrack]: "is-on-track",
  [StandingKind.Curious]: "is-curious",
};

/** Where a child's head tops out on the page, for their tag. */
function headTopOf(
  i: number,
  count: number,
  seed: number,
): { x: number; y: number; scale: number } {
  const at = seatOf(i, count);
  const look = looksOf(seed, i);
  return {
    x: at.x + look.nudge * at.scale,
    y: at.y - (48 + look.headR) * at.scale,
    scale: at.scale,
  };
}

/**
 * A child's standing over them: words for one who needs help or is curious (placed with the
 * picture's labels, clear of each other and of the children's heads), a small tick for one on track.
 */
function Tag({
  i,
  standing,
  shown,
  s,
  locale,
}: { i: number; standing: Standing; shown: number; s: View; locale: Locale }) {
  const ref = useRef<SVGTextElement>(null);
  const top = headTopOf(i, s.count, s.seed);
  // A curious child's hand (and its "!", above their words) is up on one side: if their words can't go above, the other side.
  const away = -looksOf(s.seed, i).side;
  const isWords = standing.kind !== StandingKind.OnTrack;
  useLabel(ref, () => ({
    own: ref.current?.previousElementSibling ?? null,
    prefer: LabelSide.Above,
    gap: 3,
    spots: [
      [top.x, top.y - 8, "middle"],
      ...(standing.kind === StandingKind.Curious
        ? ([[top.x + away * 6, top.y - 4, away > 0 ? "start" : "end"]] as const)
        : []),
      [top.x, top.y - 20, "middle"],
      [top.x - 8, top.y - 8, "end"],
      [top.x + 8, top.y - 8, "start"],
      [top.x, top.y - 32, "middle"],
    ],
    avoid: () => ({ what: ".cl-head, .cl-tag-tick, .cl-board", gap: 1 }),
  }));
  const words = word(standing.words ?? STANDING_WORDS[standing.kind], locale);
  const name = `standing:${i}`;
  if (!isWords) {
    return (
      <g
        class={`cl-tag-tick ${TAG_CLASS[standing.kind]}`}
        opacity={shown}
        transform={`translate(${top.x + 10 * top.scale} ${top.y + 2}) scale(${top.scale})`}
        {...shows(name, standing.kind, words)}
      >
        <circle r={6.5} />
        <path d="M-3 0 l 2.2 2.4 l 4 -5" />
      </g>
    );
  }
  return (
    <g class={`cl-tag ${TAG_CLASS[standing.kind]}`} opacity={shown}>
      <circle class="cl-tag-dot" cx={top.x} cy={top.y - 2} r={2.2} />
      <text
        ref={ref}
        x={top.x}
        y={top.y - 8}
        text-anchor="middle"
        {...shows(name, standing.kind, words)}
      >
        {words}
      </text>
    </g>
  );
}

/** The room: the blackboard, the teacher, the benches and the children, all in chalk. */
function Room({ s, locale }: { s: View; locale: Locale }) {
  const id = `cl${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const teacher = teacherNow(s, locale);
  const doing =
    s.visiting !== null
      ? "walking to a child"
      : s.visited !== null && !s.isWriting
        ? "beside a child"
        : s.isWriting
          ? "writing"
          : "facing the class";
  const doingWords =
    doing === "walking to a child"
      ? WORDS.walkingToChild
      : doing === "beside a child"
        ? WORDS.besideChild
        : s.isWriting
          ? WORDS.writing
          : WORDS.facing;
  const firstRowY = seatOf(0, s.count).y;
  /** The teacher, drawn among the rows by how near he is: before row `row + 1`, after row `row`. */
  const teacherAt = (row: number) => {
    const rowY = row < 0 ? Number.NEGATIVE_INFINITY : seatOf(row * PER_ROW, s.count).y;
    const nextY = seatOf((row + 1) * PER_ROW, s.count).y;
    const isLastRow = (row + 1) * PER_ROW >= s.count;
    const belongs = teacher.y >= rowY && (isLastRow || teacher.y < nextY);
    if (row < 0 ? teacher.y >= firstRowY : !belongs) return null;
    return (
      <g
        class="cl-teacher"
        transform={`translate(${teacher.x} ${teacher.y}) scale(${teacher.facing * teacher.scale} ${teacher.scale})`}
        {...shows("teacher", doing, word(doingWords, locale))}
      >
        <Teacher
          isBack={teacher.isBack}
          hand={teacher.hand}
          bob={teacher.bob}
          stride={teacher.stride}
          crouch={teacher.crouch}
          hasChalk={!teacher.isVisiting}
        />
      </g>
    );
  };
  const looks = Array.from({ length: s.count }, (_, i) => looksOf(s.seed, i));
  const rows = Math.ceil(s.count / PER_ROW);
  const warmth = s.count === 0 ? 0 : s.lit / s.count;
  const boardLines = s.lines.map((l) => word(l, locale));
  const boardWords =
    boardLines.length === 0 ? word(WORDS.cleanBoard, locale) : boardLines.join(" / ");
  return (
    <Stage
      label={word(WORDS.classroom, locale)}
      x={[0, W]}
      width={W}
      height={H}
      svg={{ class: "cl-room" }}
    >
      <defs>
        {/* A faint dust of old chalk, on the blackboard's surface only: nothing drawn is blurred. */}
        <filter id={`${id}-dust`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="2"
            seed="5"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -5 3.1"
            result="specks"
          />
          <feFlood class="cl-dust-colour" result="chalk" />
          <feComposite in="chalk" in2="specks" operator="in" />
        </filter>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" class="cl-glow-in" />
          <stop offset="55%" class="cl-glow-mid" />
          <stop offset="100%" class="cl-glow-out" />
        </radialGradient>
        <radialGradient id={`${id}-warm`} cx="50%" cy="78%" r="70%">
          <stop offset="0%" class="cl-glow-mid" />
          <stop offset="100%" class="cl-glow-out" />
        </radialGradient>
      </defs>

      {/* The wall and the floor: the dark of a slate, with old smudges. */}
      <rect class="cl-wall" x={0} y={0} width={W} height={FLOOR_Y} />
      <rect class="cl-floor" x={0} y={FLOOR_Y} width={W} height={H - FLOOR_Y} />

      <g class="cl-drawing">
        <path class="cl-smudge" d="M20 300 q 90 -30 180 6 t 150 -10" />
        <path class="cl-smudge" d="M0 196 q 120 18 220 -4 t 140 8" />
        <line class="cl-floor-line" x1={0} y1={FLOOR_Y} x2={W} y2={FLOOR_Y} />
        {[-1, 1].map((d) => (
          <line
            key={d}
            class="cl-floor-line is-faint"
            x1={W / 2 + d * 70}
            y1={FLOOR_Y}
            x2={W / 2 + d * 200}
            y2={H}
          />
        ))}

        {/* The blackboard in its wooden frame, a ledge with chalk and a duster under it. */}
        <rect class="cl-frame" x={BOARD.x} y={BOARD.y} width={BOARD.w} height={BOARD.h} rx={4} />
        <rect
          class="cl-board"
          x={BOARD.x + FRAME}
          y={BOARD.y + FRAME}
          width={BOARD.w - 2 * FRAME}
          height={BOARD.h - 2 * FRAME}
          rx={2}
          {...shows("board", boardLines, boardWords)}
        />
        <path class="cl-board-smudge" d="M40 70 q 60 -14 120 4 t 110 -6 M50 120 q 80 10 150 -6" />
        <rect
          class="cl-board-dust"
          x={BOARD.x + FRAME}
          y={BOARD.y + FRAME}
          width={BOARD.w - 2 * FRAME}
          height={BOARD.h - 2 * FRAME}
          filter={`url(#${id}-dust)`}
        />
        <rect
          class="cl-frame"
          x={BOARD.x - 4}
          y={BOARD.y + BOARD.h - 2}
          width={BOARD.w + 8}
          height={6}
          rx={2}
        />
        <line
          class="cl-stick"
          x1={BOARD.x + 40}
          y1={BOARD.y + BOARD.h - 3}
          x2={BOARD.x + 52}
          y2={BOARD.y + BOARD.h - 4}
        />
        <line
          class="cl-stick is-yellow"
          x1={BOARD.x + 60}
          y1={BOARD.y + BOARD.h - 3}
          x2={BOARD.x + 68}
          y2={BOARD.y + BOARD.h - 3}
        />
        {s.wiping === 0 && (
          <g transform={`translate(${BOARD.x + BOARD.w - 50} ${BOARD.y + BOARD.h - 9})`}>
            <rect class="cl-duster-felt" x={-14} y={2} width={28} height={5} rx={1.5} />
            <rect class="cl-duster" x={-14} y={-5} width={28} height={8} rx={3} />
          </g>
        )}
        <Lines s={s} locale={locale} id={id} />

        {teacherAt(-1)}

        {warmth > 0 && (
          <rect
            class="cl-warmth"
            x={0}
            y={FLOOR_Y - 40}
            width={W}
            height={H - FLOOR_Y + 40}
            fill={`url(#${id}-warm)`}
            opacity={warmth}
          />
        )}

        {/* The class, front row first, so the nearer rows are drawn over the farther. */}
        {Array.from({ length: rows }, (_, row) => {
          const first = row * PER_ROW;
          const seat = seatOf(first, s.count);
          return (
            <g key={row}>
              <Benches y={seat.y} scale={seat.scale} />
              {s.children.slice(first, first + PER_ROW).map((c, j) => {
                const i = first + j;
                const look = looks[i] as Looks;
                const at = seatOf(i, s.count);
                const canHelp =
                  c.attention === Attention.Lost ||
                  c.attention === Attention.Asking ||
                  c.attention === Attention.Stuck;
                const figure = (
                  <g
                    key="figure"
                    transform={`translate(${at.x + look.nudge * at.scale} ${at.y}) scale(${at.scale})`}
                    {...shows(
                      `child:${i}`,
                      c.attention,
                      word(ATTENTION_WORDS[c.attention], locale),
                    )}
                  >
                    <rect class="cl-hit" x={-26} y={-96} width={52} height={98} />
                    <Pupil c={c} look={look} id={id} />
                  </g>
                );
                return canHelp ? (
                  <g key={i} class="cl-pupil is-helpable" {...does(actions.help, { child: i }, i)}>
                    {figure}
                  </g>
                ) : (
                  <g key={i} class="cl-pupil">
                    {figure}
                  </g>
                );
              })}
              {teacherAt(row)}
            </g>
          );
        })}

        {/* Where each child stands, over them, once revealed. */}
        {s.children.map((c, i) => {
          const standing = s.standing[i];
          if (standing == null || c.tag <= 0) return null;
          return (
            <Tag key={`tag${i}`} i={i} standing={standing} shown={c.tag} s={s} locale={locale} />
          );
        })}
      </g>
    </Stage>
  );
}

/** A classroom, seen from the back, in chalk. */
export function ClassroomView({ view: s, locale }: PropViewProps<typeof classroom>): JSX.Element {
  return (
    <div class="cl">
      <Room s={s} locale={locale} />
    </div>
  );
}
