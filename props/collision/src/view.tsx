import { Stage, scaleLinear, useSpace } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  Block,
  CollisionAction,
  type CollisionState,
  MASS,
  START,
  TRACK,
  VELOCITY,
  momentAt,
  widthOf,
} from "./model";

type View = CollisionState & {
  momentumBefore: number;
  momentumNow: number;
  energyBefore: number;
  energyNow: number;
  hasCollided: boolean;
};

const TRACK_HEIGHT = 170;
const GROUND = 140;
/** Pixels of arrow per m/s. */
const ARROW = 16;
const BOUNCES = [
  { bounce: 1, label: "Elastic" },
  { bounce: 0.5, label: "Partly" },
  { bounce: 0, label: "Sticky" },
] as const;

const fixed = (v: number, digits = 1): string => (Math.abs(v) < 0.005 ? 0 : v).toFixed(digits);

function Arrow({ x, y, v, tone }: { x: number; y: number; v: number; tone: string }): JSX.Element {
  if (Math.abs(v) < 0.01) {
    return (
      <text class={`cl-speed ${tone}`} x={x} y={y + 4}>
        at rest
      </text>
    );
  }
  const end = x + v * ARROW;
  const dir = Math.sign(v);
  return (
    <g class={`cl-arrow ${tone}`}>
      <line x1={x} y1={y} x2={end} y2={y} />
      <path d={`M${end + dir * 7} ${y} L${end - dir * 2} ${y - 6} L${end - dir * 2} ${y + 6} Z`} />
      <text class="cl-speed" x={(x + end) / 2} y={y - 10}>
        {fixed(v)} m/s
      </text>
    </g>
  );
}

function Track({ s, width }: { s: View; width: number }): JSX.Element {
  return (
    <Stage
      label="Two blocks on a track"
      x={[0, TRACK]}
      width={width}
      height={TRACK_HEIGHT}
      inset={{ left: 8, right: 8 }}
      svg={{ class: "cl-track" }}
    >
      <TrackDrawing s={s} />
    </Stage>
  );
}

function TrackDrawing({ s }: { s: View }): JSX.Element {
  const { x } = useSpace();
  const m = momentAt(s, s.time);
  const blocks = [
    { id: Block.A, mass: s.massA, at: m.positionA, v: m.speedA, tone: "is-a", lift: 0 },
    { id: Block.B, mass: s.massB, at: m.positionB, v: m.speedB, tone: "is-b", lift: 30 },
  ];
  return (
    <g>
      <line class="cl-ground" x1={x(0)} y1={GROUND} x2={x(TRACK)} y2={GROUND} />
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <g key={v}>
          <line class="cl-tick" x1={x(v)} y1={GROUND + 4} x2={x(v)} y2={GROUND + 10} />
          <text class="cl-metre" x={x(v)} y={GROUND + 24}>
            {v} m
          </text>
        </g>
      ))}
      {blocks.map((b) => {
        const w = x(widthOf(b.mass)) - x(0);
        const h = 22 + 12 * Math.sqrt(b.mass);
        const left = x(b.at) - w / 2;
        return (
          <g key={b.id} class={`cl-block ${b.tone}`}>
            <rect x={left} y={GROUND - 3 - h} width={w} height={h} rx={8} />
            <text class="cl-mass" x={x(b.at)} y={GROUND - 3 - h / 2 + 5}>
              {b.mass} kg
            </text>
            <Arrow x={x(b.at)} y={GROUND - 3 - h - 16 - b.lift} v={b.v} tone={b.tone} />
          </g>
        );
      })}
    </g>
  );
}

type Part = { value: number; tone: string };

/** A row of segments laid end to end from zero (left for negative, right for positive). */
function Row({
  label,
  parts,
  total,
  unit,
  x,
}: {
  label: string;
  parts: Part[];
  total: number;
  unit: string;
  x: (v: number) => number;
}): JSX.Element {
  let pos = 0;
  let neg = 0;
  return (
    <div class="cl-row">
      <span class="cl-row-label">{label}</span>
      <svg class="cl-bar" viewBox="0 0 200 18" preserveAspectRatio="none" aria-hidden="true">
        <line class="cl-zero" x1={x(0)} y1={0} x2={x(0)} y2={18} />
        {parts.map((p, i) => {
          const from = p.value >= 0 ? pos : neg + p.value;
          if (p.value >= 0) pos += p.value;
          else neg += p.value;
          return (
            <rect
              // biome-ignore lint/suspicious/noArrayIndexKey: segments never reorder
              key={i}
              class={`cl-seg ${p.tone}`}
              x={x(from)}
              y={2}
              width={Math.max(0, x(from + Math.abs(p.value)) - x(from))}
              height={14}
            />
          );
        })}
      </svg>
      <span class="cl-row-total">
        {fixed(total, 2)} {unit}
      </span>
    </div>
  );
}

function Ledger({ s }: { s: View }): JSX.Element {
  const m = momentAt(s, s.time);
  const pA0 = s.massA * s.velocityA;
  const pB0 = s.massB * s.velocityB;
  const reach = Math.max(
    1,
    Math.abs(pA0) + Math.abs(pB0),
    Math.abs(s.massA * m.speedA) + Math.abs(s.massB * m.speedB),
  );
  const p = scaleLinear().domain([-reach, reach]).range([0, 200]);
  const e = scaleLinear()
    .domain([0, Math.max(0.01, s.energyBefore)])
    .range([0, 200]);
  const kA = 0.5 * s.massA * m.speedA ** 2;
  const kB = 0.5 * s.massB * m.speedB ** 2;
  const lost = Math.max(0, s.energyBefore - s.energyNow);
  return (
    <div class="cl-ledger">
      <div class="cl-group">
        <div class="cl-group-title">Momentum, mass × velocity (kg·m/s)</div>
        <Row
          label="Before"
          parts={[
            { value: pA0, tone: "is-a" },
            { value: pB0, tone: "is-b" },
          ]}
          total={s.momentumBefore}
          unit=""
          x={p}
        />
        <Row
          label="Now"
          parts={[
            { value: s.massA * m.speedA, tone: "is-a" },
            { value: s.massB * m.speedB, tone: "is-b" },
          ]}
          total={s.momentumNow}
          unit=""
          x={p}
        />
      </div>
      <div class="cl-group">
        <div class="cl-group-title">Kinetic energy, ½mv² (J)</div>
        <Row
          label="Before"
          parts={[
            { value: 0.5 * s.massA * s.velocityA ** 2, tone: "is-a" },
            { value: 0.5 * s.massB * s.velocityB ** 2, tone: "is-b" },
          ]}
          total={s.energyBefore}
          unit=""
          x={e}
        />
        <Row
          label="Now"
          parts={[
            { value: kA, tone: "is-a" },
            { value: kB, tone: "is-b" },
            { value: lost, tone: "is-lost" },
          ]}
          total={s.energyNow}
          unit=""
          x={e}
        />
        {lost > 0.005 && (
          <div class="cl-lost-note">{fixed(lost, 2)} J turned into heat and sound in the crash</div>
        )}
      </div>
    </div>
  );
}

function Stepper({
  label,
  value,
  unit,
  onDown,
  onUp,
}: {
  label: string;
  value: string;
  unit: string;
  onDown: () => void;
  onUp: () => void;
}): JSX.Element {
  return (
    <div class="cl-stepper">
      <span class="cl-stepper-label">{label}</span>
      <button type="button" class="cl-step" aria-label={`Less ${label}`} onClick={onDown}>
        −
      </button>
      <span class="cl-stepper-value">
        {value} {unit}
      </span>
      <button type="button" class="cl-step" aria-label={`More ${label}`} onClick={onUp}>
        +
      </button>
    </div>
  );
}

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

function BlockControls({
  s,
  block,
  call,
}: { s: View; block: Block; call: PropViewProps["call"] }): JSX.Element {
  const mass = block === Block.A ? s.massA : s.massB;
  const velocity = block === Block.A ? s.velocityA : s.velocityB;
  const setMass = (d: number) =>
    call(CollisionAction.SetMass, { block, mass: clamp(mass + d * MASS.step, MASS.min, MASS.max) });
  const setVelocity = (d: number) =>
    call(CollisionAction.SetVelocity, {
      block,
      velocity: clamp(velocity + d * VELOCITY.step, VELOCITY.min, VELOCITY.max),
    });
  return (
    <div class={`cl-card ${block === Block.A ? "is-a" : "is-b"}`}>
      <div class="cl-card-title">Block {block.toUpperCase()}</div>
      <Stepper
        label="mass"
        value={String(mass)}
        unit="kg"
        onDown={() => setMass(-1)}
        onUp={() => setMass(1)}
      />
      <Stepper
        label="velocity"
        value={fixed(velocity)}
        unit="m/s"
        onDown={() => setVelocity(-1)}
        onUp={() => setVelocity(1)}
      />
    </div>
  );
}

/** The track, the momentum and energy ledger, and the controls. */
export function CollisionView({ view, width, call }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as View;
  const isAtStart = s.time === 0;
  return (
    <div class="cl">
      <Track s={s} width={width} />
      <div class="cl-time">
        <span>t = {s.time.toFixed(2)} s</span>
        <span>
          {s.hasCollided ? "after the collision" : isAtStart ? "ready" : "before the collision"}
        </span>
      </div>
      <div class="cl-play">
        <button
          type="button"
          class="cl-button is-main"
          onClick={() => call(s.isRunning ? CollisionAction.Pause : CollisionAction.Play)}
        >
          {s.isRunning ? "Pause" : isAtStart ? "Let go" : "Continue"}
        </button>
        <button
          type="button"
          class="cl-button"
          disabled={isAtStart}
          onClick={() => call(CollisionAction.Reset)}
        >
          Reset
        </button>
      </div>
      <Ledger s={s} />
      <div class="cl-cards">
        <BlockControls s={s} block={Block.A} call={call} />
        <BlockControls s={s} block={Block.B} call={call} />
      </div>
      <div class="cl-bounces">
        {BOUNCES.map((b) => (
          <button
            key={b.bounce}
            type="button"
            class={s.bounce === b.bounce ? "cl-chip is-on" : "cl-chip"}
            onClick={() => call(CollisionAction.SetBounce, { bounce: b.bounce })}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div class="cl-start-note">
        Blocks start at {START.a} m and {START.b} m. Right is positive.
      </div>
    </div>
  );
}
