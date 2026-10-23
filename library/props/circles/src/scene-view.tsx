import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { type Words, say } from "./kit/geometry";
import {
  CIRCLES_PICTURE,
  CirclesSceneKind,
  type CirclesSceneState,
  describeCirclesScene,
} from "./scene";

const W = CIRCLES_PICTURE.width;
const H = CIRCLES_PICTURE.height;
const f = (n: number) => n.toFixed(1);

export const SCENE_WORDS = {
  fair: { en: "SCIENCE FAIR", hi: "विज्ञान मेला" },
  howCycle: { en: "HOW A CYCLE WORKS", hi: "साइकिल कैसे चलती है" },
} as const satisfies Record<string, Words>;

type Who = "riya" | "kabir" | "grandpa" | "mom";

/** A person (the same family as the other chapters): feet at (x, y), `s` the scale. */
function Person({
  who,
  x,
  y,
  s = 1,
  back = false,
  point,
}: {
  who: Who;
  x: number;
  y: number;
  s?: number;
  back?: boolean;
  point?: [number, number];
}): JSX.Element {
  const isChild = who === "kabir";
  const h = isChild ? 34 : 44;
  const headR = isChild ? 7.5 : 7;
  const bodyW = isChild ? 15 : 17;
  const neck = h - 2 * headR;
  const shirt = `cis-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="cis-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`cis-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="cis-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="cis-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="cis-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="cis-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -3 -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="cis-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="cis-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="cis-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="cis-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="cis-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="cis-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="cis-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

function Outside({ ground = 150 }: { ground?: number }): JSX.Element {
  return (
    <g>
      <rect class="cis-sky" x={0} y={0} width={W} height={ground} />
      <rect class="cis-road" x={0} y={ground} width={W} height={H - ground} />
    </g>
  );
}

function Indoor({ floor = 132 }: { floor?: number }): JSX.Element {
  return (
    <g>
      <rect class="cis-wall" x={0} y={0} width={W} height={floor} />
      <rect class="cis-floor" x={0} y={floor} width={W} height={H - floor} />
    </g>
  );
}

/** A wheel: tyre, rim and spokes, centre (cx, cy), turned by `turn` degrees. */
function Wheel({
  cx,
  cy,
  r,
  turn = 0,
  spokes = 12,
}: { cx: number; cy: number; r: number; turn?: number; spokes?: number }) {
  return (
    <g>
      <circle class="cis-tyre" cx={cx} cy={cy} r={r} />
      <circle class="cis-rim" cx={cx} cy={cy} r={r - 3} />
      {Array.from({ length: spokes }, (_, i) => {
        const a = ((turn + (i * 360) / spokes) * Math.PI) / 180;
        return (
          <line
            key={a}
            class="cis-spoke"
            x1={cx}
            y1={cy}
            x2={f(cx + (r - 3) * Math.cos(a))}
            y2={f(cy + (r - 3) * Math.sin(a))}
          />
        );
      })}
      <circle class="cis-hub" cx={cx} cy={cy} r={2.5} />
    </g>
  );
}

/** Kabir's cycle, wheels on the ground at y = g, centred on x; s scales it. */
function Cycle({ x, g, s = 1, turn = 0 }: { x: number; g: number; s?: number; turn?: number }) {
  const r = 22;
  return (
    <g transform={`translate(${x} ${g}) scale(${s})`}>
      <Wheel cx={-36} cy={-r} r={r} turn={turn} />
      <Wheel cx={36} cy={-r} r={r} turn={turn} />
      <path
        class="cis-frame"
        d={`M-36 ${-r} L-6 ${-r} L-14 -52 L28 -52 L-6 ${-r} M28 -52 L36 ${-r} M-36 ${-r} L-14 -52`}
      />
      <path class="cis-frame" d="M28 -52 L25 -62 M18 -64 L32 -62" />
      <path class="cis-seat" d="M-21 -56 h14 l-2 -3 h-10 z" />
      <circle class="cis-sprocket" cx={-6} cy={-r} r={6} />
      <path class="cis-chain" d={`M-6 ${-r - 6} L-36 ${-r - 2.5} M-6 ${-r + 6} L-36 ${-r + 2.5}`} />
    </g>
  );
}

function Label({
  x,
  y,
  text,
  small = false,
  anchor = "middle",
}: { x: number; y: number; text: string; small?: boolean; anchor?: string }) {
  return (
    <text class={`cis-label${small ? " is-small" : ""}`} x={x} y={y} text-anchor={anchor}>
      {text}
    </text>
  );
}

function FairNotice({ locale }: { locale: string }): JSX.Element {
  return (
    <g>
      <Indoor floor={140} />
      <rect class="cis-board" x={22} y={14} width={150} height={92} rx={4} />
      <rect class="cis-paper" x={30} y={20} width={134} height={80} rx={2} />
      <text class="cis-title" x={97} y={36} text-anchor="middle">
        {say(locale, SCENE_WORDS.fair)}
      </text>
      <circle class="cis-ink" cx={70} cy={70} r={14} />
      <circle class="cis-ink" cx={124} cy={70} r={14} />
      <path class="cis-ink" d="M70 70 L92 70 L84 52 L116 52 L124 70 M92 70 L116 52" />
      <line class="cis-line" x1={46} y1={92} x2={148} y2={92} />
      <Cycle x={250} g={150} s={0.95} />
      <Person who="kabir" x={182} y={164} />
      <Person who="riya" x={152} y={166} point={[-14, -14]} />
    </g>
  );
}

function WheelRoad(): JSX.Element {
  const cx = 150;
  const cy = 82;
  const r = 62;
  return (
    <g>
      <Outside ground={cy + r} />
      <Wheel cx={cx} cy={cy} r={r} spokes={16} turn={90} />
      <line class="cis-roadline" x1={20} y1={cy + r} x2={300} y2={cy + r} />
      <line class="cis-mark" x1={cx} y1={cy} x2={cx} y2={cy + r} />
      <path class="cis-right" d={`M${cx} ${cy + r - 9} h9 v9`} />
      <circle class="cis-touch" cx={cx} cy={cy + r} r={3.5} />
      <Label x={cx + 26} y={cy + r - 10} text="90°" />
      <Person who="kabir" x={258} y={170} point={[-26, 6]} />
    </g>
  );
}

function WellPulley(): JSX.Element {
  const px = 150;
  const py = 46;
  const pr = 16;
  return (
    <g>
      <Outside ground={140} />
      <path
        class="cis-wood"
        d={`M${px - 44} 128 L${px - 6} ${py} M${px + 44} 128 L${px + 6} ${py}`}
      />
      <line class="cis-wood" x1={px - 26} y1={py} x2={px + 26} y2={py} />
      <circle class="cis-pulley" cx={px} cy={py} r={pr} />
      <circle class="cis-hub" cx={px} cy={py} r={3} />
      <path class="cis-rope" d={`M${px - pr} ${py} A${pr} ${pr} 0 0 1 ${px + pr} ${py}`} />
      <line class="cis-rope" x1={px - pr} y1={py} x2={px - pr} y2={132} />
      <line class="cis-rope" x1={px + pr} y1={py} x2={px + 62} y2={112} />
      <rect class="cis-wellwall" x={px - 52} y={124} width={104} height={30} rx={3} />
      <rect class="cis-bucket" x={px - pr - 6} y={118} width={12} height={12} rx={2} />
      <Person who="grandpa" x={px + 74} y={160} s={1.1} point={[-12, -8]} />
    </g>
  );
}

function ChainSprockets(): JSX.Element {
  const a: [number, number, number] = [110, 84, 34];
  const b: [number, number, number] = [228, 84, 16];
  const d = b[0] - a[0];
  const k = (a[2] - b[2]) / d;
  const h = Math.sqrt(1 - k * k);
  // Outer common tangents of the two sprockets (the chain's straight runs).
  const t = (c: [number, number, number], sgn: number): [number, number] => [
    c[0] + c[2] * k,
    c[1] + sgn * c[2] * h,
  ];
  const [a1, a2, b1, b2] = [t(a, -1), t(a, 1), t(b, -1), t(b, 1)];
  return (
    <g>
      <Indoor floor={146} />
      <circle class="cis-sprocket-big" cx={a[0]} cy={a[1]} r={a[2]} />
      {Array.from({ length: 5 }, (_, i) => {
        const g = ((i * 72 + 18) * Math.PI) / 180;
        return (
          <line
            key={g}
            class="cis-spoke"
            x1={a[0]}
            y1={a[1]}
            x2={f(a[0] + 26 * Math.cos(g))}
            y2={f(a[1] + 26 * Math.sin(g))}
          />
        );
      })}
      <circle class="cis-sprocket-big" cx={b[0]} cy={b[1]} r={b[2]} />
      <path
        class="cis-chainloop"
        d={`M${f(a1[0])} ${f(a1[1])} L${f(b1[0])} ${f(b1[1])} A${b[2]} ${b[2]} 0 0 1 ${f(b2[0])} ${f(b2[1])} L${f(a2[0])} ${f(a2[1])} A${a[2]} ${a[2]} 0 1 1 ${f(a1[0])} ${f(a1[1])}`}
      />
      <circle class="cis-touch" cx={a1[0]} cy={a1[1]} r={3} />
      <circle class="cis-touch" cx={b1[0]} cy={b1[1]} r={3} />
      <Person who="kabir" x={286} y={170} point={[-20, -16]} />
    </g>
  );
}

function CompassBox(): JSX.Element {
  return (
    <g>
      <Indoor floor={150} />
      <rect class="cis-table" x={20} y={98} width={280} height={14} rx={3} />
      <rect
        class="cis-paper"
        x={70}
        y={70}
        width={150}
        height={30}
        rx={2}
        transform="skewX(-20) translate(30 0)"
      />
      <ellipse class="cis-ink" cx={150} cy={86} rx={30} ry={9} />
      <path class="cis-compass" d="M150 86 L160 46 L176 84 M160 46 L160 38" />
      <circle class="cis-hub" cx={160} cy={46} r={2.5} />
      <rect
        class="cis-ruler"
        x={196}
        y={82}
        width={78}
        height={9}
        rx={1}
        transform="rotate(-8 196 82)"
      />
      <rect class="cis-box" x={34} y={78} width={42} height={20} rx={3} />
      <Person who="riya" x={112} y={166} s={1.15} point={[38, -42]} />
    </g>
  );
}

function PosterDesk(): JSX.Element {
  return (
    <g>
      <Indoor floor={156} />
      <rect class="cis-paper" x={20} y={14} width={280} height={150} rx={3} />
      <path class="cis-ink" d="M50 120 L80 120 L72 102 Z M72 102 L94 102 L80 120 M94 102 L96 120" />
      <circle class="cis-ink" cx={50} cy={120} r={8} />
      <circle class="cis-ink" cx={96} cy={120} r={8} />
      <path
        class="cis-big"
        d="M140 140 L215 140 L195 95 Z M195 95 L250 95 L215 140 M250 95 L255 140"
      />
      <circle class="cis-big" cx={140} cy={140} r={20} />
      <circle class="cis-big" cx={255} cy={140} r={20} />
      <path class="cis-guide" d="M140 140 L240 160 M50 120 L140 140" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} class="cis-guide" d={`M${148 + i * 20} ${138 + i * 4} q 3 4 0 8`} />
      ))}
      <Label x={73} y={40} text="1 : 50" />
      <Label x={196} y={40} text="1 : 20" />
    </g>
  );
}

function WheelRoll(): JSX.Element {
  const g = 150;
  const r = 22;
  const x0 = 70;
  const x1 = x0 + 2 * Math.PI * r;
  return (
    <g>
      <Outside ground={g} />
      <line class="cis-chalk" x1={x0 + 36} y1={g + 2} x2={x0 + 36} y2={g + 18} />
      <line class="cis-chalk" x1={x1 + 36} y1={g + 2} x2={x1 + 36} y2={g + 18} />
      <path class="cis-dim" d={`M${x0 + 36} ${g + 12} H${x1 + 36}`} />
      <Label x={(x0 + x1) / 2 + 36} y={g + 26} text="2πr" small />
      <Cycle x={x1} g={g} />
      <circle class="cis-touch" cx={x1 + 36} cy={g} r={3} />
      <Person who="kabir" x={x1 - 2} y={g + 18} back />
    </g>
  );
}

function Mudguard(): JSX.Element {
  const cx = 130;
  const cy = 92;
  const r = 60;
  const arc = (from: number, to: number, rr: number) => {
    const p = (a: number) => [
      cx + rr * Math.cos((a * Math.PI) / 180),
      cy - rr * Math.sin((a * Math.PI) / 180),
    ];
    const [sx, sy] = p(from) as [number, number];
    const [ex, ey] = p(to) as [number, number];
    return { sx, sy, ex, ey };
  };
  const m = arc(20, 160, r + 6);
  const q = arc(-30, -80, r - 8);
  return (
    <g>
      <Outside ground={cy + r} />
      <path
        class="cis-sector"
        d={`M${cx} ${cy} L${f(m.sx)} ${f(m.sy)} A${r + 6} ${r + 6} 0 0 0 ${f(m.ex)} ${f(m.ey)} Z`}
      />
      <Wheel cx={cx} cy={cy} r={r} spokes={16} />
      <path
        class="cis-guard"
        d={`M${f(m.sx)} ${f(m.sy)} A${r + 6} ${r + 6} 0 0 0 ${f(m.ex)} ${f(m.ey)}`}
      />
      <path
        class="cis-reflector"
        d={`M${f(q.sx)} ${f(q.sy)} A${r - 8} ${r - 8} 0 0 1 ${f(q.ex)} ${f(q.ey)} Z`}
      />
      <path class="cis-protractor" d={`M${cx - 18} ${cy} A18 18 0 0 1 ${cx + 18} ${cy} Z`} />
      <Label x={cx} y={cy - 22} text="θ" />
      <Person who="riya" x={240} y={170} s={1.1} point={[-30, -20]} />
    </g>
  );
}

function PosterDesign({ locale }: { locale: string }): JSX.Element {
  const tile = (x: number, y: number) => (
    <g>
      <rect class="cis-shade" x={x} y={y} width={56} height={56} />
      {[
        [14, 14],
        [42, 14],
        [14, 42],
        [42, 42],
      ].map(([dx, dy]) => (
        <circle
          key={`${dx}-${dy}`}
          class="cis-hole"
          cx={x + (dx as number)}
          cy={y + (dy as number)}
          r={14}
        />
      ))}
    </g>
  );
  const petal = (x: number, y: number) => (
    <g>
      <rect class="cis-hole" x={x} y={y} width={56} height={56} />
      <path
        class="cis-shade"
        d={`M${x + 28} ${y + 28} A28 28 0 0 1 ${x} ${y} A28 28 0 0 1 ${x + 28} ${y + 28} A28 28 0 0 1 ${x + 56} ${y} A28 28 0 0 1 ${x + 28} ${y + 28} A28 28 0 0 1 ${x + 56} ${y + 56} A28 28 0 0 1 ${x + 28} ${y + 28} A28 28 0 0 1 ${x} ${y + 56} A28 28 0 0 1 ${x + 28} ${y + 28} Z`}
      />
      <rect class="cis-ink" x={x} y={y} width={56} height={56} />
    </g>
  );
  return (
    <g>
      <Indoor floor={150} />
      <rect class="cis-paper" x={24} y={14} width={200} height={124} rx={3} />
      {tile(40, 30)}
      {petal(122, 30)}
      <text class="cis-title" x={124} y={118} text-anchor="middle">
        {say(locale, SCENE_WORDS.howCycle)}
      </text>
      <Person who="kabir" x={250} y={166} point={[-20, -30]} />
      <Person who="riya" x={290} y={170} />
    </g>
  );
}

function FairDay({ locale }: { locale: string }): JSX.Element {
  return (
    <g>
      <Indoor floor={142} />
      <rect class="cis-stall" x={30} y={10} width={180} height={14} rx={2} />
      <rect class="cis-paper" x={52} y={30} width={136} height={70} rx={2} />
      <circle class="cis-ink" cx={86} cy={70} r={16} />
      <circle class="cis-ink" cx={154} cy={70} r={16} />
      <path class="cis-ink" d="M86 70 L112 70 L104 50 L144 50 L154 70 M112 70 L144 50" />
      <text class="cis-title" x={120} y={44} text-anchor="middle">
        {say(locale, SCENE_WORDS.howCycle)}
      </text>
      <Cycle x={124} g={150} s={0.9} />
      <Person who="riya" x={40} y={166} point={[16, -18]} />
      <Person who="kabir" x={204} y={164} />
      <Person who="mom" x={256} y={168} back />
      <Person who="grandpa" x={292} y={168} back />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          class={`cis-flag is-${(i % 3) + 1}`}
          d={`M${226 + i * 18} 8 l9 0 l-4.5 10 z`}
        />
      ))}
    </g>
  );
}

export function CirclesSceneView({ view, width, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as CirclesSceneState;
  const id = useId();
  const k = width / W;
  const height = Math.round((width * H) / W);
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case CirclesSceneKind.FairNotice:
        return <FairNotice locale={locale} />;
      case CirclesSceneKind.WheelRoad:
        return <WheelRoad />;
      case CirclesSceneKind.WellPulley:
        return <WellPulley />;
      case CirclesSceneKind.ChainSprockets:
        return <ChainSprockets />;
      case CirclesSceneKind.CompassBox:
        return <CompassBox />;
      case CirclesSceneKind.PosterDesk:
        return <PosterDesk />;
      case CirclesSceneKind.WheelRoll:
        return <WheelRoll />;
      case CirclesSceneKind.Mudguard:
        return <Mudguard />;
      case CirclesSceneKind.PosterDesign:
        return <PosterDesign locale={locale} />;
      case CirclesSceneKind.FairDay:
        return <FairDay locale={locale} />;
    }
  })();
  return (
    <div class="cis" data-part="picture">
      <Stage
        label={describeCirclesScene(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "cis-svg" }}
      >
        <clipPath id={`cis-${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12 / k} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#cis-${id}-frame)`}>
          {scene}
        </g>
      </Stage>
    </div>
  );
}
