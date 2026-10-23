import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { Person, Turbine } from "./draw";
import { EnergyScene, type EnergySceneState, SCENE_PICTURE, describeEnergyScene } from "./scene";
import { range } from "./words";

const W = SCENE_PICTURE.width;
const H = SCENE_PICTURE.height;
const GROUND = 150;

type Time = "day" | "dusk" | "night";

function Backdrop({ time, hills = true }: { time: Time; hills?: boolean }) {
  return (
    <g>
      <rect class={`en-sc-sky is-${time}`} x={0} y={0} width={W} height={H} />
      {hills && (
        <path
          class={time === "night" ? "en-sc-hills is-night" : "en-sc-hills"}
          d="M0 110 Q 50 70 100 100 T 200 90 T 320 96 V 180 H 0 Z"
        />
      )}
      <rect
        class={time === "night" ? "en-sc-ground is-night" : "en-sc-ground"}
        x={0}
        y={GROUND}
        width={W}
        height={H - GROUND}
      />
    </g>
  );
}

function House({
  x,
  y = GROUND,
  s = 1,
  isLit = false,
}: { x: number; y?: number; s?: number; isLit?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path class="en-house" d="M-18 0 V -20 L 0 -34 L 18 -20 V 0 Z" />
      <rect
        class={isLit ? "en-window is-lit" : "en-window"}
        x={-6}
        y={-16}
        width={12}
        height={10}
      />
    </g>
  );
}

function Tree({ x, y = GROUND, s = 1 }: { x: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect class="en-sc-trunk" x={-3} y={-26} width={6} height={26} />
      <circle class="en-sc-leaves" cx={0} cy={-34} r={15} />
    </g>
  );
}

function VillageArrival() {
  return (
    <g>
      <Backdrop time="dusk" />
      <House x={60} y={112} s={0.9} />
      <House x={110} y={104} s={0.8} isLit />
      <House x={240} y={110} s={0.9} />
      <House x={280} y={118} s={0.8} />
      <path class="en-sc-path" d="M140 180 Q 160 150 200 130" />
      <Person who="grandpa" x={150} y={170} s={1.1} point={[-26, -14]} />
      <Person who="mom" x={176} y={166} />
      <Person who="riya" x={200} y={164} s={0.95} />
      <Person who="kabir" x={222} y={164} s={0.95} />
      <rect class="en-sc-bag" x={184} y={152} width={10} height={8} rx={2} />
    </g>
  );
}

function SmokyChulha() {
  return (
    <g>
      <rect class="en-sc-wall" x={0} y={0} width={W} height={H} />
      <rect class="en-sc-floor" x={0} y={GROUND} width={W} height={H - GROUND} />
      {range(4).map((i) => (
        <circle
          key={i}
          class="en-sc-dungcake"
          cx={230 + (i % 2) * 22}
          cy={40 + Math.floor(i / 2) * 22}
          r={9}
        />
      ))}
      <path class="en-sc-chulha" d="M70 150 V 120 Q 110 106 150 120 V 150 Z" />
      <path class="en-flame" d="M96 120 q 6 -16 12 0 q 6 -16 12 0 z" />
      {range(5).map((i) => (
        <circle key={i} class="en-sc-smoke" cx={104 + i * 14} cy={92 - i * 14} r={12 + i * 3} />
      ))}
      <Person who="mom" x={190} y={170} point={[-14, -10]} />
      <Person who="riya" x={240} y={170} s={0.95} />
    </g>
  );
}

function PowerLine() {
  return (
    <g>
      <Backdrop time="day" />
      <path
        class="en-sc-tower"
        d="M70 150 L 82 40 L 94 150 M 76 70 H 88 M 74 100 H 90 M 62 50 H 102"
      />
      <path class="en-sc-wire" d="M62 50 Q 160 70 320 56" />
      <path class="en-sc-wire" d="M102 50 Q 200 74 320 64" />
      <rect class="en-sc-plant" x={250} y={88} width={40} height={14} />
      <rect class="en-sc-plant" x={256} y={66} width={6} height={22} />
      <rect class="en-sc-plant" x={274} y={70} width={6} height={18} />
      <circle class="en-sc-smoke" cx={259} cy={58} r={6} />
      <circle class="en-sc-smoke" cx={277} cy={62} r={5} />
      <Person who="kabir" x={150} y={170} s={1.1} point={[22, -26]} />
      <Person who="riya" x={180} y={170} />
    </g>
  );
}

function DamTrip() {
  return (
    <g>
      <Backdrop time="day" />
      <rect class="en-sc-water" x={0} y={80} width={170} height={70} />
      <path class="en-sc-temple" d="M80 80 L 90 62 L 100 80 Z" />
      <path class="en-concrete" d="M170 56 L 190 56 L 214 150 L 170 150 Z" />
      <path class="en-sc-gush" d="M214 140 Q 240 140 252 150" />
      <Person who="grandpa" x={256} y={170} point={[-30, -30]} />
      <Person who="riya" x={284} y={170} s={0.95} />
    </g>
  );
}

function CowShed() {
  return (
    <g>
      <Backdrop time="day" hills={false} />
      <path class="en-sc-shed" d="M10 150 V 70 L 150 50 V 150 Z" />
      {range(3).map((i) => (
        <g key={i} transform={`translate(${36 + i * 40} 132)`}>
          <ellipse class="en-sc-cow" cx={0} cy={0} rx={16} ry={9} />
          <circle class="en-sc-cow" cx={16} cy={-6} r={6} />
          <rect class="en-sc-cow" x={-12} y={6} width={3} height={12} />
          <rect class="en-sc-cow" x={8} y={6} width={3} height={12} />
        </g>
      ))}
      <ellipse class="en-sc-dung" cx={170} cy={150} rx={16} ry={6} />
      {range(6).map((i) => (
        <circle
          key={i}
          class="en-sc-dungcake"
          cx={200 + (i % 3) * 20}
          cy={70 + Math.floor(i / 3) * 20}
          r={8}
        />
      ))}
      <Person who="kabir" x={250} y={172} s={0.95} point={[-6, -18]} />
      <Person who="riya" x={286} y={172} point={[-10, 4]} />
    </g>
  );
}

function WindyRidge() {
  return (
    <g>
      <Backdrop time="day" />
      {range(4).map((i) => (
        <path key={i} class="en-sc-gust" d={`M${10 + i * 6} ${30 + i * 16} q 30 -6 60 0 t 60 0`} />
      ))}
      <line class="en-sc-pole" x1={240} y1={150} x2={240} y2={70} />
      <path class="en-sc-flag" d="M240 72 L 276 78 L 240 86 Z" />
      <line class="en-tower" x1={120} y1={150} x2={120} y2={86} />
      <Turbine x={120} y={84} r={18} isTurning blades={8} />
      <rect class="en-sc-well" x={104} y={140} width={32} height={10} />
      <Person who="kabir" x={190} y={170} s={1.05} point={[-2, -22]} />
      <Person who="grandpa" x={286} y={170} />
    </g>
  );
}

function SchoolRoof() {
  return (
    <g>
      <rect class="en-sc-sky is-day" x={0} y={0} width={W} height={H} />
      <circle class="en-sun" cx={40} cy={30} r={16} />
      <rect class="en-sc-school" x={60} y={86} width={220} height={94} />
      <rect class="en-sc-roof" x={54} y={80} width={232} height={8} />
      <rect class="en-window" x={90} y={118} width={44} height={30} />
      <circle class="en-sc-lamp" cx={112} cy={136} r={4} />
      <rect class="en-window" x={206} y={118} width={44} height={30} />
      <Person who="riya" x={150} y={80} point={[2, -16]} />
      <Person who="kabir" x={180} y={80} s={0.95} point={[-4, -18]} />
    </g>
  );
}

function HotSpring() {
  return (
    <g>
      <Backdrop time="day" />
      <ellipse class="en-sc-pool" cx={150} cy={150} rx={80} ry={14} />
      <path class="en-sc-rock" d="M60 152 q 10 -14 22 -2 M 210 150 q 14 -16 26 0" />
      {range(4).map((i) => (
        <path key={i} class="en-sc-steam" d={`M${110 + i * 26} 140 q -8 -20 0 -40 q 8 -20 0 -40`} />
      ))}
      <Person who="kabir" x={230} y={170} s={0.95} point={[-22, -2]} />
      <Person who="mom" x={266} y={170} />
    </g>
  );
}

function RadioNews() {
  return (
    <g>
      <rect class="en-sc-sky is-night" x={0} y={0} width={W} height={H} />
      <rect class="en-sc-floor" x={0} y={GROUND} width={W} height={H - GROUND} />
      <rect class="en-sc-pillar" x={20} y={20} width={10} height={130} />
      <rect class="en-sc-pillar" x={290} y={20} width={10} height={130} />
      <rect class="en-sc-table" x={120} y={118} width={84} height={6} />
      <rect class="en-sc-table" x={128} y={124} width={5} height={26} />
      <rect class="en-sc-table" x={191} y={124} width={5} height={26} />
      <rect class="en-sc-radio" x={140} y={96} width={44} height={22} rx={4} />
      <circle class="en-sc-dial" cx={172} cy={107} r={6} />
      {range(3).map((i) => (
        <path key={i} class="en-sc-sound" d={`M${190 + i * 7} 98 q 6 9 0 18`} />
      ))}
      <Person who="grandpa" x={100} y={170} point={[18, -8]} />
      <Person who="riya" x={230} y={170} s={0.95} back={false} />
      <Person who="kabir" x={256} y={170} s={0.9} />
    </g>
  );
}

function Panchayat() {
  return (
    <g>
      <Backdrop time="day" hills={false} />
      <Tree x={160} y={110} s={2.2} />
      <rect class="en-sc-durrie" x={20} y={150} width={280} height={14} rx={3} />
      {range(6).map((i) => (
        <Person
          key={i}
          who={i % 2 === 0 ? "grandpa" : "mom"}
          x={36 + i * 26}
          y={164}
          s={0.6}
          back
        />
      ))}
      <Person who="riya" x={232} y={160} point={[14, -18]} />
      <rect class="en-sc-chart" x={248} y={100} width={46} height={34} rx={2} />
      <path class="en-sc-chart-line" d="M254 126 L 266 116 L 276 120 L 288 106" />
      <Person who="kabir" x={212} y={160} s={0.9} />
    </g>
  );
}

function SchoolLit() {
  return (
    <g>
      <Backdrop time="night" />
      <rect class="en-sc-school" x={70} y={90} width={180} height={60} />
      <path class="en-sc-panel" d="M84 90 L 100 74 H 156 L 140 90 Z" />
      <rect class="en-window is-lit" x={100} y={108} width={46} height={28} />
      <rect class="en-window is-lit" x={176} y={108} width={46} height={28} />
      <circle class="en-glow" cx={123} cy={122} r={30} style={{ opacity: 0.4 }} />
      <circle class="en-glow" cx={199} cy={122} r={30} style={{ opacity: 0.4 }} />
      <Person who="grandpa" x={36} y={172} s={0.95} back />
      <Person who="mom" x={270} y={172} s={0.95} back />
      <Person who="riya" x={290} y={172} s={0.9} back />
      <Person who="kabir" x={54} y={172} s={0.85} back />
    </g>
  );
}

const SCENES: Readonly<Record<EnergyScene, () => JSX.Element>> = {
  villageArrival: VillageArrival,
  smokyChulha: SmokyChulha,
  powerLine: PowerLine,
  damTrip: DamTrip,
  cowShed: CowShed,
  windyRidge: WindyRidge,
  schoolRoof: SchoolRoof,
  hotSpring: HotSpring,
  radioNews: RadioNews,
  panchayat: Panchayat,
  schoolLit: SchoolLit,
};

export function EnergySceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as EnergySceneState;
  const k = width / W;
  const Scene = SCENES[s.scene] ?? SCENES[EnergyScene.VillageArrival];
  const clip = `en-sc-${useId()}`;
  return (
    <div class="en-sc">
      <Stage
        label={describeEnergyScene(s.scene)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "en-svg" }}
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
