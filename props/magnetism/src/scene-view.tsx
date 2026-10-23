import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { Person } from "./draw";
import {
  MagnetismScene,
  type MagnetismSceneState,
  SCENE_PICTURE,
  describeMagnetismScene,
} from "./scene";

const W = SCENE_PICTURE.width;
const H = SCENE_PICTURE.height;

function Room({ dark = false }: { dark?: boolean }) {
  return (
    <g>
      <rect class={dark ? "mg-sc-night" : "mg-sc-wall"} x={0} y={0} width={W} height={H} />
      <rect class={dark ? "mg-sc-floor-dark" : "mg-sc-floor"} x={0} y={150} width={W} height={30} />
    </g>
  );
}

function Table({ x, w, y = 118 }: { x: number; w: number; y?: number }) {
  return (
    <g class="mg-sc-table">
      <rect x={x} y={y} width={w} height={7} rx={2} />
      <rect x={x + 6} y={y + 7} width={5} height={150 - y - 5} />
      <rect x={x + w - 11} y={y + 7} width={5} height={150 - y - 5} />
    </g>
  );
}

function Candle({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle class="mg-sc-glow" r={34} />
      <rect class="mg-sc-candle" x={-4} y={-2} width={8} height={18} rx={1} />
      <path class="mg-sc-flame" d="M0 -14 C 5 -8 4 -3 0 -2 C -4 -3 -5 -8 0 -14 Z" />
    </g>
  );
}

function Torch({ x, y, isLit = false }: { x: number; y: number; isLit?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`} class="mg-sc-torch">
      {isLit && <path class="mg-sc-beam" d="M14 -6 L 120 -40 L 120 40 L 14 6 Z" />}
      <rect x={-16} y={-5} width={26} height={10} rx={3} />
      <path d="M10 -8 L 16 -9 V 9 L 10 8 Z" />
    </g>
  );
}

function PowerCutAgain() {
  return (
    <g>
      <Room dark />
      <rect class="mg-sc-window-night" x={24} y={24} width={52} height={42} rx={3} />
      <circle class="mg-sc-moon" cx={60} cy={38} r={6} />
      <Table x={110} w={110} />
      <Candle x={165} y={102} />
      <Torch x={196} y={113} />
      <Person who="grandpa" x={90} y={150} s={1.3} point={[-12, -16]} />
      <Person who="riya" x={240} y={150} s={1.15} />
      <Person who="kabir" x={268} y={150} s={1.1} />
      <Person who="mom" x={300} y={150} s={1.2} back />
      <g class="mg-sc-bubble">
        <rect x={20} y={74} width={64} height={30} rx={8} />
        <circle cx={44} cy={89} r={7} />
        <line x1={44} y1={89} x2={60} y2={89} />
        <circle cx={66} cy={89} r={4} />
      </g>
    </g>
  );
}

function Compass({ x, y, angle, r = 11 }: { x: number; y: number; angle: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} class="mg-compass">
      <circle class="mg-compass-case" r={r} />
      <g transform={`rotate(${angle})`}>
        <path class="mg-needle-n" d={`M0 ${-r + 2} L -3 0 L 3 0 Z`} />
        <path class="mg-needle-s" d={`M0 ${r - 2} L -3 0 L 3 0 Z`} />
      </g>
    </g>
  );
}

function CompassJumps() {
  return (
    <g>
      <Room />
      {/* Kabir's kit: a 4.5 V battery (three cells), a switch, and one long wire across the floor to a bulb. */}
      <g class="mg-sc-cell">
        <rect x={28} y={128} width={12} height={20} rx={2} />
        <rect x={42} y={128} width={12} height={20} rx={2} />
        <rect x={56} y={128} width={12} height={20} rx={2} />
      </g>
      <rect class="mg-sc-socket" x={74} y={140} width={14} height={8} rx={1} />
      <path class="mg-sc-cord" d="M68 144 H 74" />
      <path class="mg-sc-cord" d="M88 144 C 130 150 200 150 276 144" />
      <path class="mg-sc-cord" d="M34 128 C 34 100 120 92 200 94 C 250 95 284 104 284 132" />
      <circle class="mg-sc-glow" cx={282} cy={134} r={16} />
      <circle class="mg-sc-lamp" cx={282} cy={134} r={6} />
      <rect class="mg-sc-socket" x={276} y={140} width={12} height={8} rx={1} />
      <Compass x={168} y={140} angle={58} />
      <path class="mg-sc-swing" d="M156 122 a 14 14 0 0 1 22 -2" />
      <Person who="kabir" x={140} y={150} s={1.1} point={[16, 2]} />
      <Person who="riya" x={236} y={150} s={1.2} point={[-16, -10]} />
      <text class="mg-sc-mark" x={190} y={110}>
        !?
      </text>
    </g>
  );
}

function ScrapCrane() {
  return (
    <g>
      <rect class="mg-sc-sky" x={0} y={0} width={W} height={H} />
      <rect class="mg-sc-ground" x={0} y={150} width={W} height={30} />
      <g class="mg-sc-crane">
        <rect x={210} y={120} width={60} height={30} rx={4} />
        <line x1={240} y1={120} x2={170} y2={24} />
        <line x1={170} y1={24} x2={150} y2={24} />
        <line class="mg-sc-cable" x1={150} y1={24} x2={150} y2={60} />
      </g>
      <g class="mg-sc-disc">
        <ellipse cx={150} cy={66} rx={30} ry={8} />
        <rect x={120} y={60} width={60} height={6} />
      </g>
      <g class="mg-sc-car">
        <path d="M110 92 H 190 L 198 110 H 102 Z" />
        <rect x={98} y={104} width={104} height={16} rx={4} />
        <circle cx={118} cy={122} r={7} />
        <circle cx={182} cy={122} r={7} />
      </g>
      <g class="mg-sc-pull">
        <line x1={128} y1={76} x2={128} y2={88} />
        <line x1={150} y1={76} x2={150} y2={88} />
        <line x1={172} y1={76} x2={172} y2={88} />
      </g>
      <g class="mg-sc-scrap">
        <rect x={10} y={136} width={40} height={14} rx={2} />
        <rect x={22} y={126} width={22} height={10} rx={2} />
        <rect x={280} y={138} width={30} height={12} rx={2} />
      </g>
      <Person who="kabir" x={60} y={150} s={1.1} point={[14, -26]} />
      <Person who="grandpa" x={84} y={150} s={1.3} />
    </g>
  );
}

function MixerOpen() {
  return (
    <g>
      <Room />
      <Table x={70} w={190} />
      <rect class="mg-sc-paper" x={90} y={112} width={150} height={6} />
      <g class="mg-sc-mixer-motor" transform="translate(165 92)">
        <rect class="mg-sc-magnet" x={-40} y={-20} width={14} height={40} rx={6} />
        <rect class="mg-sc-magnet" x={26} y={-20} width={14} height={40} rx={6} />
        <rect class="mg-sc-core" x={-20} y={-14} width={40} height={28} rx={4} />
        <g class="mg-sc-copper">
          {[-14, -8, -2, 4, 10].map((x) => (
            <line key={x} x1={x} y1={-14} x2={x + 4} y2={14} />
          ))}
        </g>
        <rect class="mg-sc-brush" x={-6} y={18} width={5} height={7} />
        <rect class="mg-sc-brush" x={2} y={18} width={5} height={7} />
      </g>
      <g class="mg-sc-jar">
        <path d="M82 76 H 108 L 104 112 H 86 Z" />
      </g>
      <Person who="grandpa" x={44} y={150} s={1.35} point={[26, -14]} />
      <line class="mg-sc-screwdriver" x1={74} y1={104} x2={130} y2={92} />
      <Person who="riya" x={282} y={150} s={1.2} back />
    </g>
  );
}

function BicycleDynamo() {
  return (
    <g>
      <rect class="mg-sc-dusk" x={0} y={0} width={W} height={H} />
      <rect class="mg-sc-road" x={0} y={146} width={W} height={34} />
      <g class="mg-sc-cycle">
        <circle cx={110} cy={124} r={24} />
        <circle cx={210} cy={124} r={24} />
        <path d="M110 124 L 150 96 L 196 96 L 210 124 M150 96 L 160 124 L 110 124 M196 96 L 200 84" />
        <line x1={200} y1={84} x2={214} y2={82} />
      </g>
      <g class="mg-sc-dynamo">
        <rect x={214} y={96} width={8} height={16} rx={3} />
      </g>
      <path class="mg-sc-beam" d="M222 86 L 320 60 L 320 112 L 222 92 Z" />
      <circle class="mg-sc-lamp" cx={220} cy={89} r={4} />
      <Person who="kabir" x={152} y={112} s={1.15} point={[22, -8]} />
      <text class="mg-sc-mark" x={226} y={128}>
        ⟳
      </text>
    </g>
  );
}

function IronTingle() {
  return (
    <g>
      <Room />
      <g class="mg-sc-board">
        <rect x={110} y={108} width={130} height={8} rx={4} />
        <line x1={140} y1={116} x2={180} y2={150} />
        <line x1={210} y1={116} x2={170} y2={150} />
      </g>
      <g class="mg-sc-iron">
        <path d="M150 104 L 186 104 L 194 92 L 160 92 Z" />
        <path d="M164 92 Q 172 80 184 92" />
      </g>
      <path class="mg-sc-cord" d="M190 100 C 230 104 250 120 268 112" />
      <g class="mg-sc-plug">
        <rect x={266} y={104} width={14} height={14} rx={2} />
        <line x1={280} y1={108} x2={288} y2={106} />
        <line class="is-loose" x1={280} y1={115} x2={290} y2={124} />
      </g>
      <path class="mg-sc-zap" d="M138 92 l 6 -6 l -2 6 l 6 -6" />
      <Person who="mom" x={110} y={150} s={1.35} point={[-10, -20]} />
      <Person who="grandpa" x={290} y={150} s={1.3} point={[-8, -14]} />
    </g>
  );
}

function MeterBoard() {
  return (
    <g>
      <Room />
      <g class="mg-sc-board-panel">
        <rect x={120} y={24} width={110} height={110} rx={4} />
        <rect class="mg-sc-meter" x={134} y={36} width={40} height={30} rx={3} />
        <rect class="mg-sc-fusebox" x={186} y={36} width={32} height={30} rx={3} />
        <rect class="mg-sc-mainswitch" x={146} y={78} width={30} height={22} rx={3} />
      </g>
      <path class="mg-sc-wire-live" d="M150 100 C 150 120 140 130 120 140" />
      <path class="mg-sc-wire-neutral" d="M162 100 C 168 124 190 132 230 138" />
      <path class="mg-sc-wire-earth" d="M200 66 C 210 100 240 110 260 120" />
      <Person who="riya" x={86} y={150} s={1.25} point={[28, -26]} />
      <Person who="kabir" x={270} y={150} s={1.1} point={[-20, -24]} />
      <Torch x={252} y={106} isLit={false} />
    </g>
  );
}

function CrankTorch() {
  return (
    <g>
      <Room dark />
      <path class="mg-sc-beam is-wide" d="M170 96 L 320 40 L 320 150 L 170 104 Z" />
      <g class="mg-sc-crank-torch" transform="translate(150 100)">
        <rect x={-18} y={-8} width={30} height={16} rx={4} />
        <path d="M12 -10 L 20 -12 V 12 L 12 10 Z" />
        <circle class="mg-sc-lamp" cx={20} cy={0} r={5} />
        <line class="mg-sc-handle" x1={-8} y1={8} x2={-14} y2={22} />
        <circle class="mg-sc-handle-knob" cx={-14} cy={24} r={3} />
      </g>
      <Person who="kabir" x={120} y={150} s={1.15} point={[14, -14]} />
      <Person who="riya" x={196} y={150} s={1.2} />
      <Person who="mom" x={226} y={150} s={1.25} />
      <Person who="grandpa" x={262} y={150} s={1.3} point={[6, -24]} />
      <g class="mg-sc-sparkle">
        <path d="M284 84 l 3 7 l 7 3 l -7 3 l -3 7 l -3 -7 l -7 -3 l 7 -3 Z" />
        <path d="M300 112 l 2 4 l 4 2 l -4 2 l -2 4 l -2 -4 l -4 -2 l 4 -2 Z" />
      </g>
    </g>
  );
}

const SCENES: Readonly<Record<MagnetismScene, () => JSX.Element>> = {
  powerCutAgain: PowerCutAgain,
  compassJumps: CompassJumps,
  scrapCrane: ScrapCrane,
  mixerOpen: MixerOpen,
  bicycleDynamo: BicycleDynamo,
  ironTingle: IronTingle,
  meterBoard: MeterBoard,
  crankTorch: CrankTorch,
};

export function MagnetismSceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as MagnetismSceneState;
  const k = width / W;
  const Scene = SCENES[s.scene] ?? SCENES[MagnetismScene.PowerCutAgain];
  const clip = `mg-clip-${useId()}`;
  return (
    <div class="mg-sc">
      <Stage
        label={describeMagnetismScene(s.scene)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "mg-svg" }}
      >
        <g transform={`scale(${k})`} data-part="picture">
          <clipPath id={clip}>
            <rect x={0} y={0} width={W} height={H} rx={12} />
          </clipPath>
          <g clip-path={`url(#${clip})`}>
            <Scene />
          </g>
        </g>
      </Stage>
    </div>
  );
}
