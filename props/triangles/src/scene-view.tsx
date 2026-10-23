import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  TRIANGLES_PICTURE,
  TrianglesSceneKind,
  type TrianglesSceneState,
  describeTrianglesScene,
} from "./scene";

const W = TRIANGLES_PICTURE.width;
const H = TRIANGLES_PICTURE.height;

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
  const shirt = `tgs-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="tgs-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`tgs-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="tgs-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="tgs-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="tgs-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="tgs-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -3 -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="tgs-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="tgs-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="tgs-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="tgs-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="tgs-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="tgs-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="tgs-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

function Outside({
  ground = 150,
  night = false,
}: { ground?: number; night?: boolean }): JSX.Element {
  return (
    <g>
      <rect class={night ? "tgs-night" : "tgs-sky"} x={0} y={0} width={W} height={ground} />
      <rect
        class={night ? "tgs-ground-night" : "tgs-grass"}
        x={0}
        y={ground}
        width={W}
        height={H - ground}
      />
    </g>
  );
}

/** The colony water tank: a drum on four legs, feet at (x, ground), top at y = top. */
function Tank({
  x,
  ground,
  top,
  w = 46,
  lit = false,
}: { x: number; ground: number; top: number; w?: number; lit?: boolean }): JSX.Element {
  const drum = (ground - top) * 0.28;
  const legTop = top + drum;
  const h = ground - legTop;
  return (
    <g>
      <path
        class="tgs-leg"
        d={`M${x - w * 0.42} ${ground} L${x - w * 0.3} ${legTop} M${x + w * 0.42} ${ground} L${x + w * 0.3} ${legTop} M${x - w * 0.14} ${ground} L${x - w * 0.1} ${legTop} M${x + w * 0.14} ${ground} L${x + w * 0.1} ${legTop}`}
      />
      <path
        class="tgs-brace"
        d={`M${x - w * 0.39} ${ground - h * 0.33} L${x + w * 0.39} ${ground - h * 0.33} M${x - w * 0.35} ${ground - h * 0.66} L${x + w * 0.35} ${ground - h * 0.66} M${x - w * 0.39} ${ground - h * 0.33} L${x + w * 0.35} ${ground - h * 0.66}`}
      />
      <rect class="tgs-drum" x={x - w / 2} y={top} width={w} height={drum} rx={4} />
      <path
        class="tgs-roof"
        d={`M${x - w / 2} ${top + 2} Q ${x} ${top - 8} ${x + w / 2} ${top + 2} Z`}
      />
      {lit &&
        Array.from({ length: 7 }, (_, i) => (
          <circle
            key={`d${(x - w / 2 + 4 + (i * (w - 8)) / 6).toFixed(1)}`}
            class="tgs-bulb-on"
            cx={x - w / 2 + 4 + (i * (w - 8)) / 6}
            cy={top + drum - 3}
            r={2.2}
          />
        ))}
    </g>
  );
}

/** The gate pillar with a lamp on top. */
function Pillar({
  x,
  ground,
  h,
  lit = false,
}: { x: number; ground: number; h: number; lit?: boolean }): JSX.Element {
  return (
    <g>
      <rect class="tgs-pillar" x={x - 8} y={ground - h} width={16} height={h} />
      <rect class="tgs-pillar-cap" x={x - 10} y={ground - h - 4} width={20} height={5} rx={1} />
      {lit && <circle class="tgs-glow" cx={x} cy={ground - h - 11} r={11} />}
      <circle class={lit ? "tgs-bulb-on" : "tgs-bulb-off"} cx={x} cy={ground - h - 10} r={5} />
    </g>
  );
}

/** A string of lights from p to q, sagging a little. */
function LightString({
  p,
  q,
  n = 12,
  on = true,
}: { p: [number, number]; q: [number, number]; n?: number; on?: boolean }): JSX.Element {
  const sag = 6;
  const pt = (t: number): [number, number] => [
    p[0] + (q[0] - p[0]) * t,
    p[1] + (q[1] - p[1]) * t + sag * 4 * t * (1 - t),
  ];
  return (
    <g>
      <path
        class="tgs-wire"
        d={`M${p[0]} ${p[1]} Q ${(p[0] + q[0]) / 2} ${(p[1] + q[1]) / 2 + 2 * sag} ${q[0]} ${q[1]}`}
      />
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = pt((i + 0.5) / n);
        return (
          <circle
            key={`b${x.toFixed(1)}`}
            class={on ? "tgs-bulb-on" : "tgs-bulb-off"}
            cx={x}
            cy={y + 2}
            r={2}
          />
        );
      })}
    </g>
  );
}

function NoticeBoard(): JSX.Element {
  return (
    <g>
      <Outside />
      <Tank x={262} ground={150} top={18} w={52} />
      <rect class="tgs-post" x={52} y={86} width={5} height={64} />
      <rect class="tgs-post" x={150} y={86} width={5} height={64} />
      <rect class="tgs-board" x={34} y={24} width={140} height={74} rx={4} />
      <rect class="tgs-paper" x={42} y={30} width={124} height={62} rx={2} />
      <text class="tgs-title" x={104} y={46} text-anchor="middle">
        26 · I · 2026
      </text>
      <path class="tgs-tank-mini" d="M58 84 L60 64 M74 84 L72 64 M56 64 h20 v-8 h-20 z" />
      <path class="tgs-wire" d="M66 56 Q 100 74 132 80" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} class="tgs-bulb-on" cx={74 + i * 11} cy={61 + i * 3.6} r={1.8} />
      ))}
      <rect class="tgs-pillar" x={134} y={70} width={8} height={16} />
      <line class="tgs-line" x1={96} y1={54} x2={160} y2={54} />
      <line class="tgs-line" x1={110} y1={62} x2={160} y2={62} />
      <Person who="riya" x={88} y={168} s={1.2} back />
      <Person who="kabir" x={122} y={168} s={1.2} back />
    </g>
  );
}

function WaterTank(): JSX.Element {
  return (
    <g>
      <Outside />
      <Tank x={170} ground={150} top={10} w={62} />
      <path
        class="tgs-ladder"
        d="M190 150 L190 52 M198 150 L198 52 M190 140 h8 M190 128 h8 M190 116 h8 M190 104 h8 M190 92 h8 M190 80 h8 M190 68 h8 M190 56 h8"
      />
      <rect class="tgs-lock" x={188} y={118} width={12} height={9} rx={2} />
      <Person who="kabir" x={110} y={166} s={1.25} point={[10, -30]} />
      <Person who="grandpa" x={252} y={166} s={1.25} point={[-14, -14]} />
    </g>
  );
}

function Print({
  x,
  y,
  w,
  h,
  stretch = 1,
}: { x: number; y: number; w: number; h: number; stretch?: number }): JSX.Element {
  const cx = x + w / 2;
  const tw = w * 0.22 * stretch;
  return (
    <g>
      <rect class="tgs-print" x={x} y={y} width={w} height={h} rx={1.5} />
      <rect class="tgs-print-sky" x={x + 2} y={y + 2} width={w - 4} height={h - 4} />
      <path
        class="tgs-tank-mini"
        d={`M${cx - tw / 2} ${y + h - 3} L${cx - tw / 3} ${y + h * 0.45} M${cx + tw / 2} ${y + h - 3} L${cx + tw / 3} ${y + h * 0.45} M${cx - tw * 0.55} ${y + h * 0.45} h${tw * 1.1} v${-h * 0.2} h${-tw * 1.1} z`}
      />
    </g>
  );
}

function PhotoShop(): JSX.Element {
  return (
    <g>
      <rect class="tgs-wall" x={0} y={0} width={W} height={150} />
      <rect class="tgs-floor" x={0} y={150} width={W} height={30} />
      <rect class="tgs-counter" x={20} y={108} width={190} height={42} />
      <Print x={32} y={88} w={24} h={18} />
      <Print x={66} y={76} w={40} h={30} />
      <Print x={118} y={58} w={64} h={48} />
      <Print x={226} y={46} w={70} h={34} stretch={2} />
      <text class="tgs-mark is-ok" x={110} y={50} text-anchor="middle">
        ✓ ✓ ✓
      </text>
      <text class="tgs-mark is-bad" x={261} y={40} text-anchor="middle">
        ✗
      </text>
      <Person who="riya" x={262} y={168} s={1.25} point={[-6, -34]} />
    </g>
  );
}

function StickShadow(): JSX.Element {
  return (
    <g>
      <Outside ground={140} />
      <circle class="tgs-sun" cx={22} cy={20} r={12} />
      <Tank x={150} ground={140} top={22} w={40} />
      <path class="tgs-shadow" d="M132 140 L168 140 L292 152 L262 152 Z" />
      <line class="tgs-ray" x1={34} y1={28} x2={290} y2={150} />
      <line class="tgs-stick" x1={58} y1={140} x2={58} y2={112} />
      <path class="tgs-shadow" d="M56 140 L60 140 L88 146 L84 146 Z" />
      <Person who="riya" x={46} y={156} s={1.1} point={[8, -10]} />
      <line class="tgs-tape" x1={168} y1={146} x2={276} y2={150} />
      <Person who="kabir" x={238} y={170} s={1.1} point={[-10, -16]} />
    </g>
  );
}

function StreetLamp(): JSX.Element {
  return (
    <g>
      <Outside ground={140} night />
      <rect class="tgs-post" x={38} y={30} width={5} height={110} />
      <path class="tgs-post-arm" d="M40 32 q 6 -8 18 -4" fill="none" />
      <circle class="tgs-glow" cx={58} cy={32} r={16} />
      <circle class="tgs-bulb-on" cx={58} cy={32} r={5} />
      <path class="tgs-light" d="M58 32 L20 140 L300 140 Z" />
      <path class="tgs-shadow" d="M156 140 L162 140 L236 146 L226 146 Z" />
      <Person who="kabir" x={158} y={141} s={1.25} />
      <Person who="riya" x={112} y={150} s={1.15} point={[12, -10]} />
    </g>
  );
}

function LadderPillar(): JSX.Element {
  return (
    <g>
      <Outside />
      <Pillar x={236} ground={150} h={96} />
      <path class="tgs-ladder" d="M168 150 L226 60 M180 150 L234 66" />
      {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((t) => (
        <line
          key={t}
          class="tgs-rung"
          x1={168 + 58 * t}
          y1={150 - 90 * t}
          x2={180 + 54 * t}
          y2={150 - 84 * t}
        />
      ))}
      <path class="tgs-measure" d="M170 160 L236 160 M170 156 v8 M236 156 v8" />
      <Person who="kabir" x={150} y={168} s={1.2} point={[16, -12]} />
      <Person who="grandpa" x={92} y={168} s={1.25} point={[16, -24]} />
    </g>
  );
}

function WireToTank(): JSX.Element {
  return (
    <g>
      <rect class="tgs-plan" x={0} y={0} width={W} height={H} />
      <line class="tgs-plan-ground" x1={20} y1={156} x2={300} y2={156} />
      <Tank x={58} ground={156} top={18} w={40} />
      <Pillar x={262} ground={156} h={28} />
      <path class="tgs-tri" d="M58 22 L262 128 L58 128 Z" />
      <LightString p={[58, 22]} q={[262, 120]} n={14} />
      <path class="tgs-dim" d="M58 128 L262 128" />
      <text class="tgs-label" x={44} y={82} text-anchor="end">
        12 m
      </text>
      <text class="tgs-label" x={160} y={142} text-anchor="middle">
        16 m
      </text>
      <text class="tgs-label is-ask" x={170} y={64} text-anchor="middle">
        ? m
      </text>
      <text class="tgs-label is-small" x={92} y={30}>
        15 m
      </text>
      <text class="tgs-label is-small" x={274} y={146}>
        3 m
      </text>
      <path class="tgs-right" d="M58 118 h10 v10" />
    </g>
  );
}

function RepublicNight(): JSX.Element {
  return (
    <g>
      <Outside ground={150} night />
      {[
        [30, 20],
        [90, 12],
        [200, 18],
        [300, 30],
        [140, 34],
      ].map(([x, y]) => (
        <circle key={`${x}`} class="tgs-star" cx={x} cy={y} r={1.2} />
      ))}
      <Tank x={78} ground={150} top={22} w={48} lit />
      <Pillar x={262} ground={150} h={30} lit />
      <LightString p={[78, 26]} q={[262, 112]} n={18} />
      <line class="tgs-flagpole" x1={170} y1={150} x2={170} y2={52} />
      <rect class="tgs-flag is-1" x={171} y={54} width={30} height={7} />
      <rect class="tgs-flag is-2" x={171} y={61} width={30} height={7} />
      <rect class="tgs-flag is-3" x={171} y={68} width={30} height={7} />
      <circle class="tgs-chakra" cx={186} cy={64.5} r={2.3} />
      <Person who="mom" x={120} y={170} s={1.15} back />
      <Person who="grandpa" x={146} y={170} s={1.2} back />
      <Person who="riya" x={204} y={170} s={1.1} back point={[6, -26]} />
      <Person who="kabir" x={228} y={170} s={1.1} back point={[8, -24]} />
    </g>
  );
}

export function TrianglesSceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as TrianglesSceneState;
  const id = useId();
  const k = width / W;
  const height = Math.round((width * H) / W);
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case TrianglesSceneKind.NoticeBoard:
        return <NoticeBoard />;
      case TrianglesSceneKind.WaterTank:
        return <WaterTank />;
      case TrianglesSceneKind.PhotoShop:
        return <PhotoShop />;
      case TrianglesSceneKind.StickShadow:
        return <StickShadow />;
      case TrianglesSceneKind.StreetLamp:
        return <StreetLamp />;
      case TrianglesSceneKind.LadderPillar:
        return <LadderPillar />;
      case TrianglesSceneKind.WireToTank:
        return <WireToTank />;
      case TrianglesSceneKind.RepublicNight:
        return <RepublicNight />;
    }
  })();
  return (
    <div class="tgs" data-part="picture">
      <Stage
        label={describeTrianglesScene(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "tgs-svg" }}
      >
        <clipPath id={`tgs-${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12 / k} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#tgs-${id}-frame)`}>
          {scene}
        </g>
      </Stage>
    </div>
  );
}
