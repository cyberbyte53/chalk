import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { Bangle, MetalPerson } from "./metal-draw";
import {
  METAL_PICTURE,
  MetalSceneKind,
  type MetalSceneState,
  describeMetalScene,
} from "./metal-scene";
import { range } from "./words";

const W = METAL_PICTURE.width;
const H = METAL_PICTURE.height;

function Room({ floor = 150 }: { floor?: number }) {
  return (
    <g>
      <rect class="mn-wall" x={0} y={0} width={W} height={floor} />
      <rect class="mn-floor" x={0} y={floor} width={W} height={H - floor} />
    </g>
  );
}

function GoldsmithAtDoor() {
  return (
    <g>
      <rect class="mn-outside" x={0} y={0} width={W} height={H} />
      <rect class="mn-floor" x={0} y={156} width={W} height={24} />
      {/* the doorway */}
      <rect class="mn-door-frame" x={170} y={20} width={110} height={136} />
      <rect class="mn-door-in" x={178} y={28} width={94} height={128} />
      <rect class="mn-door-leaf" x={262} y={28} width={16} height={128} />
      <MetalPerson who="mom" x={214} y={156} s={2} />
      <MetalPerson who="kabir" x={250} y={156} s={1.5} />
      {/* the stranger with his bowl and a bangle held up */}
      <MetalPerson who="stranger" x={110} y={156} s={2.05} point={[18, -26]} />
      <rect class="mn-bag" x={64} y={112} width={24} height={30} rx={4} />
      <path class="mn-bowl" d="M120 118 q 14 14 28 0 z" />
      <path class="mn-fume" d="M128 112 q -4 -8 2 -14 M138 112 q 4 -8 -2 -16" />
      <Bangle x={140} y={60} r={10} />
      <g class="mn-glints">
        <path d="M152 48 l 2 -6 l 2 6 l 6 2 l -6 2 l -2 6 l -2 -6 l -6 -2 z" />
      </g>
    </g>
  );
}

function LighterBangles() {
  return (
    <g>
      <Room floor={160} />
      <rect class="mn-counter" x={0} y={112} width={W} height={10} />
      <rect class="mn-counter-front" x={0} y={122} width={W} height={38} />
      {/* the scale */}
      <rect class="mn-scale" x={66} y={92} width={84} height={20} rx={4} />
      <rect class="mn-scale-top" x={60} y={86} width={96} height={8} rx={3} />
      <rect class="mn-scale-screen" x={84} y={98} width={48} height={11} rx={2} />
      <text class="mn-scale-digits" x={108} y={107} text-anchor="middle">
        41 g
      </text>
      <Bangle x={96} y={82} r={12} />
      <Bangle x={120} y={80} r={12} />
      {/* the old receipt */}
      <g transform="rotate(6 196 92)">
        <rect class="mn-receipt" x={172} y={66} width={46} height={44} rx={2} />
        <line class="mn-scribble" x1={178} y1={76} x2={210} y2={76} />
        <line class="mn-scribble" x1={178} y1={84} x2={202} y2={84} />
        <text class="mn-receipt-text" x={195} y={102} text-anchor="middle">
          48 g
        </text>
      </g>
      <MetalPerson who="riya" x={270} y={160} s={2} point={[-26, -10]} />
    </g>
  );
}

function CaseFile() {
  return (
    <g>
      <Room floor={160} />
      <rect class="mn-desk" x={30} y={104} width={260} height={10} rx={2} />
      <rect class="mn-desk-leg" x={40} y={114} width={8} height={46} />
      <rect class="mn-desk-leg" x={272} y={114} width={8} height={46} />
      {/* lamp */}
      <path class="mn-lamp-arm" d="M262 104 V 52 L 236 40" />
      <path class="mn-lamp-shade" d="M222 36 l 22 -6 l 6 16 z" />
      <path class="mn-lamp-light" d="M226 44 L 170 104 H 270 z" />
      {/* the notebook */}
      <rect class="mn-notebook" x={118} y={80} width={70} height={24} rx={2} />
      <line class="mn-spine" x1={153} y1={80} x2={153} y2={104} />
      <text class="mn-question" x={135} y={98} text-anchor="middle">
        ?
      </text>
      {range(3).map((i) => (
        <g key={i}>
          <rect class="mn-tick-box" x={158} y={84 + i * 6} width={4} height={4} />
          <line class="mn-scribble" x1={165} y1={86 + i * 6} x2={182} y2={86 + i * 6} />
        </g>
      ))}
      <path class="mn-tick" d="M158.5 86 l 1.5 1.5 l 3 -3.5" />
      {/* magnifier and the bangles */}
      <circle class="mn-loupe" cx={208} cy={94} r={8} />
      <line class="mn-loupe-handle" x1={214} y1={100} x2={224} y2={104} />
      <Bangle x={92} y={98} r={10} />
      <MetalPerson who="riya" x={70} y={160} s={2} point={[26, -18]} />
      <MetalPerson who="kabir" x={250} y={160} s={1.8} point={[-20, -16]} />
    </g>
  );
}

function KitchenPans() {
  return (
    <g>
      <Room floor={160} />
      <rect class="mn-counter" x={0} y={110} width={W} height={10} />
      <rect class="mn-counter-front" x={0} y={120} width={W} height={40} />
      <rect class="mn-stove" x={30} y={100} width={190} height={10} rx={3} />
      {/* iron tawa, aluminium kadhai, copper-bottomed pot */}
      <ellipse class="mn-metal-Fe" cx={64} cy={98} rx={28} ry={4} />
      <path class="mn-metal-Al" d="M96 86 q 30 22 60 0 z" />
      <rect class="mn-metal-Al" x={172} y={70} width={40} height={28} rx={3} />
      <rect class="mn-metal-Cu" x={172} y={90} width={40} height={8} rx={2} />
      {[0, 1, 2].map((i) => (
        <path key={i} class="mn-steam-line" d={`M${180 + i * 10} 66 q -5 -8 0 -16`} />
      ))}
      <MetalPerson who="mom" x={128} y={160} s={2} point={[14, -20]} />
      <MetalPerson who="kabir" x={268} y={160} s={1.7} point={[-14, -12]} />
      <ellipse class="mn-metal-steel" cx={244} cy={120} rx={14} ry={3} />
      <g class="mn-ring-lines">
        <path d="M228 108 q -6 -6 0 -12" />
        <path d="M222 110 q -9 -9 0 -18" />
      </g>
    </g>
  );
}

function IronPillar() {
  return (
    <g>
      <rect class="mn-sky" x={0} y={0} width={W} height={H} />
      <rect class="mn-ground" x={0} y={150} width={W} height={30} />
      {/* the minar, faint, behind */}
      <path class="mn-minar" d="M246 150 L 254 10 h 14 L 276 150 z" />
      {[40, 70, 100].map((y) => (
        <rect key={y} class="mn-minar-band" x={250} y={y} width={22} height={4} />
      ))}
      {/* the pillar */}
      <rect class="mn-pillar" x={120} y={30} width={18} height={120} rx={2} />
      <rect class="mn-pillar" x={114} y={24} width={30} height={10} rx={3} />
      <rect class="mn-pillar" x={116} y={16} width={26} height={8} rx={4} />
      <rect class="mn-railing" x={96} y={136} width={66} height={14} rx={2} />
      <MetalPerson who="riya" x={60} y={160} s={1.9} point={[20, -30]} />
      <MetalPerson who="kabir" x={190} y={160} s={1.7} />
    </g>
  );
}

function RailwayWeld({ clip }: { clip: string }) {
  return (
    <g>
      <rect class="mn-sky" x={0} y={0} width={W} height={H} />
      <rect class="mn-ground" x={0} y={120} width={W} height={60} />
      {/* sleepers and two rails, a gap in the near one */}
      {range(8).map((i) => (
        <rect key={i} class="mn-sleeper" x={10 + i * 40} y={128} width={24} height={30} rx={2} />
      ))}
      <rect class="mn-rail-top" x={0} y={134} width={150} height={6} />
      <rect class="mn-rail-top" x={166} y={134} width={W - 166} height={6} />
      <rect class="mn-rail-top" x={0} y={150} width={W} height={6} />
      <clipPath id={clip}>
        <rect x={0} y={0} width={W} height={134} />
      </clipPath>
      <circle class="mn-dazzle" cx={158} cy={110} r={44} clip-path={`url(#${clip})`} />
      <path class="mn-crucible" d="M140 90 h 36 l -8 26 h -20 z" />
      <rect class="mn-molten" x={155} y={116} width={6} height={22} />
      {range(10).map((i) => (
        <circle
          key={i}
          class="mn-spark"
          cx={128 + ((i * 23) % 62)}
          cy={70 + ((i * 13) % 34)}
          r={1.5}
        />
      ))}
      {/* the fence, and Grandpa and Kabir behind it */}
      <path
        class="mn-fence"
        d="M226 70 V 122 M246 70 V 122 M266 70 V 122 M286 70 V 122 M220 80 H 300 M220 104 H 300"
      />
      <MetalPerson who="grandpa" x={256} y={118} s={1.6} />
      <MetalPerson who="kabir" x={286} y={118} s={1.3} point={[-12, -16]} />
    </g>
  );
}

function Jeweller() {
  return (
    <g>
      <Room floor={160} />
      <rect class="mn-shelf" x={30} y={30} width={260} height={6} />
      {range(5).map((i) => (
        <Bangle key={i} x={60 + i * 50} y={26} r={8} />
      ))}
      <MetalPerson who="jeweller" x={110} y={112} s={1.9} point={[20, 6]} />
      <rect class="mn-counter" x={20} y={108} width={280} height={10} />
      <rect class="mn-counter-front" x={20} y={118} width={280} height={42} />
      {/* balance */}
      <path class="mn-balance" d="M150 108 V 76 M128 80 H 172" />
      <path class="mn-balance-pan" d="M122 92 q 6 6 12 0 z M166 92 q 6 6 12 0 z" />
      <path class="mn-balance" d="M128 80 l -6 12 M128 80 l 6 12 M172 80 l -6 12 M172 80 l 6 12" />
      {/* hallmarked bangle */}
      <Bangle x={206} y={100} r={12} />
      <rect class="mn-hallmark" x={196} y={84} width={22} height={9} rx={2} />
      <text class="mn-hallmark-text" x={207} y={91} text-anchor="middle">
        916
      </text>
      <MetalPerson who="mom" x={258} y={160} s={2} />
      <MetalPerson who="riya" x={292} y={160} s={1.8} />
    </g>
  );
}

function CaseClosed() {
  return (
    <g>
      <Room floor={160} />
      <rect class="mn-window" x={30} y={20} width={60} height={46} rx={3} />
      <rect class="mn-sofa" x={40} y={126} width={240} height={26} rx={10} />
      <MetalPerson who="grandpa" x={80} y={140} s={1.9} />
      <MetalPerson who="mom" x={130} y={140} s={1.9} point={[14, -8]} />
      <Bangle x={160} y={104} r={7} />
      <MetalPerson who="riya" x={190} y={140} s={1.8} />
      <MetalPerson who="kabir" x={236} y={140} s={1.6} point={[10, -26]} />
      <rect class="mn-sofa-front" x={34} y={136} width={252} height={24} rx={10} />
      {/* the notebook held up, a big tick */}
      <rect class="mn-notebook" x={238} y={40} width={40} height={30} rx={2} />
      <path class="mn-big-tick" d="M246 56 l 7 7 l 16 -18" />
    </g>
  );
}

/** A story panel, drawn in its own 320 × 180 units and scaled to the width. */
export function MetalSceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as MetalSceneState;
  const id = useId();
  const k = width / W;
  const height = Math.round((width * H) / W);
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case MetalSceneKind.GoldsmithAtDoor:
        return <GoldsmithAtDoor />;
      case MetalSceneKind.LighterBangles:
        return <LighterBangles />;
      case MetalSceneKind.CaseFile:
        return <CaseFile />;
      case MetalSceneKind.KitchenPans:
        return <KitchenPans />;
      case MetalSceneKind.IronPillar:
        return <IronPillar />;
      case MetalSceneKind.RailwayWeld:
        return <RailwayWeld clip={`mn-${id}-weld`} />;
      case MetalSceneKind.Jeweller:
        return <Jeweller />;
      case MetalSceneKind.CaseClosed:
        return <CaseClosed />;
    }
  })();
  return (
    <div class="mn mn-ms" data-part="picture">
      <Stage
        label={describeMetalScene(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "mn-svg" }}
      >
        <clipPath id={`mn-${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12 / k} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#mn-${id}-frame)`}>
          {scene}
        </g>
      </Stage>
    </div>
  );
}
