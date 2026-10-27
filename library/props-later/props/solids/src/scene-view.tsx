import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  SOLIDS_PICTURE,
  SolidsSceneKind,
  type SolidsSceneState,
  describeSolidsScene,
} from "./scene";

const W = SOLIDS_PICTURE.width;
const H = SOLIDS_PICTURE.height;

type Who = "riya" | "kabir" | "grandpa" | "mom";

/** A person (the same family as the other chapters): feet at (x, y), `s` the scale. */
function Person({
  who,
  x,
  y,
  s = 1,
  point,
}: {
  who: Who;
  x: number;
  y: number;
  s?: number;
  point?: [number, number];
}): JSX.Element {
  const isChild = who === "kabir";
  const h = isChild ? 34 : 44;
  const headR = isChild ? 7.5 : 7;
  const bodyW = isChild ? 15 : 17;
  const neck = h - 2 * headR;
  const shirt = `sos-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="sos-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`sos-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="sos-hair"
          d={`M${-headR + 1} ${headY - 2} q -6 6 -5 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="sos-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="sos-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="sos-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -3 -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="sos-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="sos-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          <rect class="sos-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
        </g>
      )}
      <g class="sos-face">
        <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
        <circle cx={2.6} cy={headY + 0.5} r={0.9} />
        <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
      </g>
      {who === "grandpa" && (
        <g class="sos-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

function Room(): JSX.Element {
  return (
    <g>
      <rect class="sos-wall" x={0} y={0} width={W} height={150} />
      <rect class="sos-floor" x={0} y={150} width={W} height={30} />
    </g>
  );
}

function Outside({ ground = 150 }: { ground?: number }): JSX.Element {
  return (
    <g>
      <rect class="sos-sky" x={0} y={0} width={W} height={ground} />
      <rect class="sos-ground" x={0} y={ground} width={W} height={H - ground} />
    </g>
  );
}

/** A stall: awning and table, the table top at y = 118. */
function StallFrame(): JSX.Element {
  return (
    <g>
      <rect class="sos-post" x={34} y={20} width={5} height={130} />
      <rect class="sos-post" x={281} y={20} width={5} height={130} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path
          key={i}
          class={`sos-awning ${i % 2 === 0 ? "is-a" : "is-b"}`}
          d={`M${26 + i * 38.3} 14 h38.3 v14 q -19 8 -38.3 0 z`}
        />
      ))}
      <rect class="sos-table" x={40} y={118} width={240} height={10} rx={2} />
      <rect class="sos-cloth" x={44} y={128} width={232} height={22} />
    </g>
  );
}

/** A cylinder drawn flat: body x..x+w, base at y, height h. */
function Can({
  x,
  y,
  w,
  h,
  cls,
}: { x: number; y: number; w: number; h: number; cls: string }): JSX.Element {
  const ry = w * 0.16;
  return (
    <g>
      <path class={cls} d={`M${x} ${y - h} V${y} a ${w / 2} ${ry} 0 0 0 ${w} 0 V${y - h} Z`} />
      <ellipse class={`${cls} sos-top`} cx={x + w / 2} cy={y - h} rx={w / 2} ry={ry} />
    </g>
  );
}

/** A lattu: a hemisphere (bowl down) with a cone on top, tip at (x, y - size). */
function Lattu({
  x,
  y,
  s = 1,
  cls = "sos-wood",
}: { x: number; y: number; s?: number; cls?: string }): JSX.Element {
  const r = 7 * s;
  return (
    <g>
      <path class={cls} d={`M${x - r} ${y - r} a ${r} ${r} 0 0 0 ${2 * r} 0 Z`} />
      <path
        class={`${cls} is-cone`}
        d={`M${x - r} ${y - r} L${x} ${y - r - 13 * s} L${x + r} ${y - r} Z`}
      />
      <line class="sos-stick" x1={x} y1={y} x2={x} y2={y + 3 * s} />
    </g>
  );
}

/** A toy rocket: a cylinder with a wider cone on top. */
function Rocket({
  x,
  y,
  s = 1,
  isPainted = true,
}: { x: number; y: number; s?: number; isPainted?: boolean }): JSX.Element {
  const w = 10 * s;
  return (
    <g>
      <rect
        class={isPainted ? "sos-yellow" : "sos-wood"}
        x={x - w / 2}
        y={y - 40 * s}
        width={w}
        height={40 * s}
        rx={1}
      />
      <path
        class={isPainted ? "sos-orange" : "sos-wood is-cone"}
        d={`M${x - 8 * s} ${y - 40 * s} L${x} ${y - 56 * s} L${x + 8 * s} ${y - 40 * s} Z`}
      />
    </g>
  );
}

/** An ice-cream cone (apex down) with a round scoop. */
function Kulfi({ x, y, s = 1 }: { x: number; y: number; s?: number }): JSX.Element {
  const r = 6 * s;
  return (
    <g>
      <path class="sos-wafer" d={`M${x - r} ${y - 20 * s} L${x} ${y} L${x + r} ${y - 20 * s} Z`} />
      <path class="sos-cream" d={`M${x - r} ${y - 20 * s} a ${r} ${r} 0 0 1 ${2 * r} 0 Z`} />
    </g>
  );
}

/** A glass (frustum outline), with a raised dome in the bottom. */
function Glass({
  x,
  y,
  s = 1,
  fill = 0.7,
}: { x: number; y: number; s?: number; fill?: number }): JSX.Element {
  const top = 9 * s;
  const bot = 7 * s;
  const h = 30 * s;
  const fy = y - h * fill;
  const at = (yy: number) => bot + ((top - bot) * (y - yy)) / h;
  return (
    <g>
      <path
        class="sos-juice"
        d={`M${x - at(fy)} ${fy} L${x - bot} ${y} H${x + bot} L${x + at(fy)} ${fy} Z`}
      />
      <path
        class="sos-glass-base"
        d={`M${x - bot} ${y} a ${bot} ${bot * 0.9} 0 0 1 ${2 * bot} 0 Z`}
      />
      <path
        class="sos-glass"
        d={`M${x - top} ${y - h} L${x - bot} ${y} H${x + bot} L${x + top} ${y - h}`}
      />
    </g>
  );
}

/** A frustum shape: wide end `wTop` at the top or bottom. */
function Frustum({
  x,
  y,
  wTop,
  wBottom,
  h,
  cls,
}: {
  x: number;
  y: number;
  wTop: number;
  wBottom: number;
  h: number;
  cls: string;
}): JSX.Element {
  return (
    <g>
      <path
        class={cls}
        d={`M${x - wTop / 2} ${y - h} L${x - wBottom / 2} ${y} a ${wBottom / 2} ${wBottom * 0.14} 0 0 0 ${wBottom} 0 L${x + wTop / 2} ${y - h} Z`}
      />
      <ellipse class={`${cls} sos-top`} cx={x} cy={y - h} rx={wTop / 2} ry={wTop * 0.14} />
    </g>
  );
}

function Stall(): JSX.Element {
  return (
    <g>
      <Outside />
      <StallFrame />
      <rect class="sos-notebook" x={98} y={104} width={14} height={11} rx={1.5} />
      <Person who="grandpa" x={250} y={150} s={1.3} />
      <Person who="mom" x={210} y={150} s={1.3} />
      <Person who="riya" x={110} y={170} s={1.4} point={[-6, 8]} />
      <Person who="kabir" x={160} y={172} s={1.4} point={[16, -14]} />
    </g>
  );
}

function Workshop(): JSX.Element {
  return (
    <g>
      <Room />
      <rect class="sos-shelf" x={20} y={40} width={120} height={5} />
      {[0, 1, 2, 3].map((i) => (
        <Lattu key={i} x={38 + i * 28} y={36} s={0.9} />
      ))}
      <rect class="sos-table" x={30} y={110} width={190} height={9} rx={2} />
      <rect class="sos-table-leg" x={38} y={119} width={6} height={31} />
      <rect class="sos-table-leg" x={206} y={119} width={6} height={31} />
      <rect class="sos-wood" x={150} y={88} width={22} height={22} />
      <path class="sos-wood is-cone" d="M153 88 a 8 8 0 0 1 16 0 Z" />
      {[0, 1, 2].map((i) => (
        <Lattu key={i} x={70 + i * 24} y={108} />
      ))}
      <Person who="grandpa" x={250} y={160} s={1.45} point={[-22, -4]} />
      <Can x={190} y={108} w={10} h={10} cls="sos-orange" />
      <Person who="kabir" x={196} y={170} s={1.3} point={[-8, -22]} />
    </g>
  );
}

function RocketPaint(): JSX.Element {
  return (
    <g>
      <Room />
      <rect class="sos-paper" x={80} y={146} width={120} height={14} rx={2} />
      <Rocket x={140} y={150} s={1.6} />
      <Can x={90} y={156} w={16} h={14} cls="sos-orange" />
      <Can x={174} y={156} w={16} h={14} cls="sos-yellow" />
      <line class="sos-brush" x1={176} y1={110} x2={150} y2={92} />
      <Person who="kabir" x={214} y={172} s={1.45} point={[-20, -20]} />
    </g>
  );
}

function Kitchen(): JSX.Element {
  return (
    <g>
      <Room />
      <rect class="sos-counter" x={20} y={118} width={280} height={32} />
      <path class="sos-bowl" d="M84 98 a 52 22 0 0 0 104 0 Z" />
      <ellipse class="sos-syrup" cx={136} cy={98} rx={52} ry={9} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          class="sos-jamun"
          x={98 + i * 15}
          y={92 + (i % 2) * 3}
          width={13}
          height={7}
          rx={3.5}
        />
      ))}
      <line class="sos-spoon" x1={176} y1={60} x2={160} y2={96} />
      <Person who="mom" x={214} y={150} s={1.45} point={[-26, -18]} />
      <Person who="riya" x={58} y={172} s={1.35} point={[18, -16]} />
    </g>
  );
}

function KulfiCan(): JSX.Element {
  return (
    <g>
      <Outside />
      <rect class="sos-table" x={40} y={118} width={200} height={9} rx={2} />
      <rect class="sos-table-leg" x={48} y={127} width={6} height={23} />
      <rect class="sos-table-leg" x={226} y={127} width={6} height={23} />
      <Can x={56} y={116} w={40} h={52} cls="sos-tin" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Kulfi key={i} x={120 + i * 20} y={116} />
      ))}
      <Person who="kabir" x={140} y={172} s={1.35} point={[-14, -22]} />
      <Person who="riya" x={262} y={170} s={1.4} point={[-10, -20]} />
    </g>
  );
}

function JuiceGlasses(): JSX.Element {
  return (
    <g>
      <Outside />
      <StallFrame />
      {[0, 1, 2, 3, 4].map((i) => (
        <Glass key={i} x={70 + i * 30} y={117} fill={i === 4 ? 0.2 : 0.75} />
      ))}
      <path class="sos-jug" d="M218 82 h22 v34 h-22 z M240 88 q 9 4 0 14" />
      <path class="sos-pour" d="M218 84 q -10 6 -12 18" />
      <Person who="riya" x={252} y={172} s={1.4} point={[-20, -26]} />
    </g>
  );
}

function Jaggery(): JSX.Element {
  return (
    <g>
      <Outside ground={140} />
      <ellipse class="sos-pan" cx={74} cy={128} rx={48} ry={11} />
      <ellipse class="sos-molasses" cx={74} cy={126} rx={40} ry={7} />
      <path class="sos-fire" d="M50 140 l6 -8 l6 8 l6 -10 l6 10 l6 -8 l6 8 z" />
      <Frustum x={150} y={150} wTop={34} wBottom={22} h={30} cls="sos-tin" />
      {[0, 1, 2].map((i) => (
        <Frustum key={i} x={196 + i * 26} y={164} wTop={20} wBottom={16} h={11} cls="sos-mould" />
      ))}
      <Person who="grandpa" x={120} y={168} s={1.4} point={[18, -18]} />
      <Person who="mom" x={292} y={168} s={1.4} point={[-14, -14]} />
    </g>
  );
}

function StallDay(): JSX.Element {
  return (
    <g>
      <Outside />
      <StallFrame />
      <Lattu x={66} y={116} />
      <Lattu x={86} y={116} />
      <Rocket x={110} y={117} s={0.8} />
      <Kulfi x={140} y={117} />
      <Kulfi x={156} y={117} />
      <Glass x={190} y={117} s={0.8} />
      <Glass x={212} y={117} s={0.8} />
      <Lattu x={244} y={116} />
      <Person who="grandpa" x={98} y={110} s={1.15} />
      <Person who="mom" x={228} y={110} s={1.15} />
      <Person who="riya" x={120} y={176} s={1.4} point={[10, -24]} />
      <Person who="kabir" x={194} y={178} s={1.4} point={[-10, -24]} />
      <circle class="sos-crowd" cx={20} cy={160} r={14} />
      <circle class="sos-crowd" cx={300} cy={162} r={15} />
      <circle class="sos-crowd" cx={276} cy={170} r={11} />
    </g>
  );
}

export function SolidsSceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as SolidsSceneState;
  const id = useId();
  const k = width / W;
  const height = Math.round((width * H) / W);
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case SolidsSceneKind.Stall:
        return <Stall />;
      case SolidsSceneKind.Workshop:
        return <Workshop />;
      case SolidsSceneKind.RocketPaint:
        return <RocketPaint />;
      case SolidsSceneKind.Kitchen:
        return <Kitchen />;
      case SolidsSceneKind.KulfiCan:
        return <KulfiCan />;
      case SolidsSceneKind.JuiceGlasses:
        return <JuiceGlasses />;
      case SolidsSceneKind.Jaggery:
        return <Jaggery />;
      case SolidsSceneKind.StallDay:
        return <StallDay />;
    }
  })();
  return (
    <div class="sos" data-part="picture">
      <Stage
        label={describeSolidsScene(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "sos-svg" }}
      >
        <clipPath id={`sos-${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12 / k} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#sos-${id}-frame)`}>
          {scene}
        </g>
      </Stage>
    </div>
  );
}
