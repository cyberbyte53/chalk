import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Frame, Person } from "./draw";
import { Jar, Leaf, Pot, Roots, Sprout } from "./plants";
import {
  REPRODUCTION_PICTURE,
  ReproductionScene,
  ReproductionScenePart,
  type ReproductionSceneState,
  describeReproductionScene,
} from "./scene";

const W = REPRODUCTION_PICTURE.width;
const H = REPRODUCTION_PICTURE.height;

function Room() {
  return (
    <g>
      <rect class="rps-wall" x={0} y={0} width={W} height={H} />
      <rect class="rps-floor" x={0} y={150} width={W} height={30} />
    </g>
  );
}

function Terrace() {
  return (
    <g>
      <rect class="rps-sky" x={0} y={0} width={W} height={H} />
      <circle class="rps-sun" cx={286} cy={28} r={14} />
      <rect class="rps-parapet" x={0} y={118} width={W} height={32} />
      <rect class="rps-roof" x={0} y={150} width={W} height={30} />
    </g>
  );
}

function Table({ x, w, y = 122 }: { x: number; w: number; y?: number }) {
  return (
    <g>
      <rect class="rps-table" x={x} y={y} width={w} height={8} rx={2} />
      <rect class="rps-table-leg" x={x + 6} y={y + 8} width={5} height={160 - y} />
      <rect class="rps-table-leg" x={x + w - 11} y={y + 8} width={5} height={160 - y} />
    </g>
  );
}

function PeaPlant({ x }: { x: number }) {
  return (
    <g>
      <path class="rps-vine" d={`M${x} 150 C ${x - 6} 120 ${x + 8} 96 ${x} 64`} />
      <Leaf x={x - 2} y={128} a={-150} len={14} />
      <Leaf x={x + 2} y={108} a={-30} len={14} />
      <Leaf x={x - 2} y={88} a={-150} len={12} />
      <g class="rps-pea-flower">
        <circle cx={x + 8} cy={76} r={5} />
        <circle cx={x + 12} cy={72} r={3} class="rps-pea-flower-in" />
      </g>
      <g class="rps-pea-flower">
        <circle cx={x - 8} cy={98} r={5} />
        <circle cx={x - 12} cy={94} r={3} class="rps-pea-flower-in" />
      </g>
    </g>
  );
}

function Picture({ scene }: { scene: ReproductionScene }): JSX.Element {
  switch (scene) {
    case ReproductionScene.GreenSunday:
      return (
        <g>
          <Room />
          <rect class="rps-board" x={150} y={18} width={140} height={104} rx={4} />
          <rect class="rps-paper" x={164} y={28} width={112} height={84} rx={2} />
          <rect class="rps-banner" x={164} y={28} width={112} height={18} rx={2} />
          <Pot x={220} y={78} w={30} />
          <Sprout x={220} y={74} h={22} />
          <Person who="grandpa" x={120} y={168} s={1.9} point={[21, -16]} />
          <Person who="riya" x={52} y={168} s={1.7} />
          <Person who="kabir" x={86} y={168} s={1.7} />
        </g>
      );
    case ReproductionScene.YeastTube:
      return (
        <g>
          <Room />
          <Table x={60} w={200} />
          <ellipse class="rps-bowl" cx={110} cy={116} rx={20} ry={8} />
          <rect class="rps-tube" x={196} y={70} width={14} height={48} rx={7} />
          <rect class="rps-tube-fill" x={198} y={92} width={10} height={24} rx={5} />
          <rect class="rps-cotton" x={195} y={64} width={16} height={9} rx={4} />
          <Person who="riya" x={240} y={168} s={1.9} point={[-23, -15]} />
        </g>
      );
    case ReproductionScene.PondJar:
      return (
        <g>
          <rect class="rps-sky" x={0} y={0} width={W} height={H} />
          <rect class="rps-grass" x={0} y={110} width={W} height={70} />
          <ellipse class="rps-pond" cx={90} cy={150} rx={90} ry={24} />
          <rect class="rps-jar-green" x={188} y={84} width={26} height={32} rx={4} />
          <path
            class="rps-jar"
            d="M186 82 L186 114 Q 186 118 190 118 L210 118 Q 214 118 214 114 L214 82"
          />
          <path class="rps-strand" d="M192 96 q 6 -4 10 2 t 8 0 M194 108 q 6 -4 10 2 t 6 0" />
          <Person who="kabir" x={240} y={170} s={2} point={[-17, -23]} />
        </g>
      );
    case ReproductionScene.MouldyBread:
      return (
        <g>
          <Room />
          <Table x={40} w={200} />
          <ellipse class="rps-plate" cx={140} cy={118} rx={46} ry={9} />
          <path class="rps-bread" d="M108 116 Q 104 84 126 82 Q 140 74 154 82 Q 176 84 172 116 Z" />
          {[
            [124, 100],
            [146, 94],
            [156, 108],
            [134, 110],
          ].map(([x, y]) => (
            <circle key={`${x}`} class="rps-mould" cx={x} cy={y} r={6} />
          ))}
          <circle class="rps-lens" cx={196} cy={92} r={14} />
          <line class="rps-handle" x1={206} y1={102} x2={222} y2={120} />
          <Person who="riya" x={262} y={168} s={1.9} point={[-27, 0]} />
        </g>
      );
    case ReproductionScene.PotatoTray:
      return (
        <g>
          <Terrace />
          <rect class="rps-tray" x={70} y={140} width={120} height={14} rx={3} />
          <rect class="rps-cotton-bed" x={74} y={136} width={112} height={6} rx={3} />
          {[92, 124, 156].map((x) => (
            <path
              key={x}
              class="rps-potato"
              d={`M${x - 12} 138 Q ${x - 13} 122 ${x} 121 Q ${x + 13} 122 ${x + 12} 138 Z`}
            />
          ))}
          <Person who="grandpa" x={226} y={168} s={1.7} point={[-28, 8]} />
          <Person who="kabir" x={40} y={168} s={1.7} />
        </g>
      );
    case ReproductionScene.MoneyPlantJars:
      return (
        <g>
          <Room />
          <rect class="rps-window" x={40} y={14} width={180} height={92} rx={4} />
          <line class="rps-window-bar" x1={130} y1={14} x2={130} y2={106} />
          <rect class="rps-sill" x={30} y={106} width={200} height={8} />
          {[70, 130, 190].map((x, i) => (
            <g key={x}>
              <Jar x={x} y={106} w={30} h={40} />
              <line class="pl-stem" x1={x} y1={60} x2={x} y2={100} />
              <Leaf x={x} y={72} a={-30} len={16} />
              {i === 0 && <Roots x={x} y={100} len={8} />}
            </g>
          ))}
          <Person who="kabir" x={266} y={168} s={1.9} point={[-28, -22]} />
        </g>
      );
    case ReproductionScene.RoseGraft:
      return (
        <g>
          <Terrace />
          <Pot x={150} y={124} w={46} />
          <line class="pl-stem is-thick" x1={150} y1={120} x2={150} y2={84} />
          <line class="pl-stem" x1={150} y1={84} x2={150} y2={50} />
          <rect class="pl-tie" x={145} y={80} width={10} height={9} rx={2} />
          <Leaf x={150} y={62} a={-30} len={16} />
          <Leaf x={150} y={72} a={-150} len={16} />
          <g class="pl-rose">
            <circle cx={150} cy={46} r={7} />
          </g>
          <Person who="grandpa" x={210} y={168} s={1.9} point={[-30, -17]} />
          <Person who="riya" x={90} y={168} s={1.8} point={[15, 2]} />
        </g>
      );
    case ReproductionScene.BeeOnPeas:
      return (
        <g>
          <Terrace />
          <line class="rps-frame" x1={60} y1={150} x2={60} y2={50} />
          <line class="rps-frame" x1={200} y1={150} x2={200} y2={50} />
          <line class="rps-frame" x1={60} y1={56} x2={200} y2={56} />
          {[80, 116, 152, 184].map((x) => (
            <PeaPlant key={x} x={x} />
          ))}
          <g class="fl-bee" transform="translate(132 66)">
            <ellipse cx={0} cy={0} rx={7} ry={5} />
            <line x1={-2} y1={-5} x2={-2} y2={5} />
            <line x1={2} y1={-5} x2={2} y2={5} />
            <ellipse class="fl-wing" cx={-1} cy={-8} rx={4} ry={3} />
            <ellipse class="fl-wing" cx={4} cy={-8} rx={4} ry={3} />
          </g>
          <Person who="kabir" x={256} y={168} s={1.9} point={[-30, -16]} />
        </g>
      );
    case ReproductionScene.ChanaSprouts:
      return (
        <g>
          <Room />
          <Table x={70} w={170} />
          <ellipse class="rps-plate" cx={156} cy={118} rx={44} ry={9} />
          {(
            [
              [130, 113],
              [142, 113],
              [154, 113],
              [166, 113],
              [178, 113],
              [136, 108],
              [160, 108],
            ] as const
          ).map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle class="rps-chana" cx={x} cy={y} r={5} />
              <path class="rps-sprout" d={`M${x + 3} ${y - 3} q 4 -2 5 -7`} />
            </g>
          ))}
          <path class="rps-cloth" d="M174 104 Q 196 92 214 100 L218 116 Q 200 110 180 116 Z" />
          <Person who="mom" x={250} y={168} s={1.9} point={[-24, -9]} />
          <Person who="kabir" x={70} y={168} s={1.7} point={[24, -16]} />
        </g>
      );
    case ReproductionScene.HealthClass:
      return (
        <g>
          <rect class="rps-wall" x={0} y={0} width={W} height={H} />
          <rect class="rps-blackboard" x={70} y={14} width={200} height={78} rx={3} />
          <path
            class="rps-chalk"
            d="M150 70 q 20 -40 40 0 M170 70 L170 40 M186 34 a 6 6 0 1 0 0.1 0"
          />
          <line class="rps-chalk" x1={90} y1={34} x2={130} y2={34} />
          <line class="rps-chalk" x1={90} y1={46} x2={124} y2={46} />
          <line class="rps-chalk" x1={210} y1={34} x2={250} y2={34} />
          <line class="rps-chalk" x1={210} y1={46} x2={246} y2={46} />
          <Person who="teacher" x={56} y={120} s={1.7} point={[24, -12]} />
          <rect class="rps-desk" x={0} y={146} width={W} height={34} />
          {[70, 140, 210, 280].map((x, i) => (
            <Person key={x} who={i % 2 === 0 ? "student" : "riya"} x={x} y={176} s={1.4} back />
          ))}
        </g>
      );
    case ReproductionScene.PlantSale:
      return (
        <g>
          <rect class="rps-sky" x={0} y={0} width={W} height={H} />
          <rect class="rps-grass" x={0} y={130} width={W} height={50} />
          <rect class="rps-bunting" x={0} y={10} width={W} height={4} />
          {[20, 60, 100, 140, 180, 220, 260, 300].map((x) => (
            <path key={x} class="rps-flag" d={`M${x} 14 l 10 0 l -5 10 z`} />
          ))}
          <Person who="grandpa" x={110} y={112} s={1.6} />
          <Person who="riya" x={160} y={112} s={1.5} />
          <Person who="kabir" x={204} y={112} s={1.5} />
          <Table x={40} w={240} y={110} />
          {[60, 92, 124, 156, 188, 220, 252].map((x, i) => (
            <g key={x}>
              <Pot x={x} y={100} w={22} />
              {i % 3 === 2 ? (
                <g class="pl-rose">
                  <line class="pl-stem" x1={x} y1={98} x2={x} y2={82} />
                  <circle cx={x} cy={80} r={5} />
                </g>
              ) : (
                <Sprout x={x} y={97} h={16} />
              )}
            </g>
          ))}
          <Person who="mom" x={290} y={172} s={1.6} point={[-24, -18]} />
          <Person who="student" x={30} y={172} s={1.6} point={[13, -18]} />
        </g>
      );
    case ReproductionScene.SavingSeeds:
      return (
        <g>
          <rect class="rps-dusk" x={0} y={0} width={W} height={H} />
          <rect class="rps-parapet" x={0} y={118} width={W} height={32} />
          <rect class="rps-roof" x={0} y={150} width={W} height={30} />
          {[30, 52, 74].map((x) => (
            <path key={x} class="rps-vine" d={`M${x} 118 C ${x - 6} 90 ${x + 8} 66 ${x} 30`} />
          ))}
          <path class="rps-pod" d="M100 100 q 14 -10 28 0 q -14 6 -28 0 z" />
          <path class="rps-pod" d="M104 112 q 14 -10 28 0 q -14 6 -28 0 z" />
          <rect class="rps-seedjar" x={206} y={88} width={24} height={30} rx={4} />
          {(
            [
              [212, 110],
              [218, 110],
              [224, 110],
              [215, 104],
              [221, 104],
            ] as const
          ).map(([x, y]) => (
            <circle key={`${x}-${y}`} class="rps-seed" cx={x} cy={y} r={3} />
          ))}
          <Person who="grandpa" x={150} y={168} s={1.9} point={[-16, -10]} />
          <Person who="kabir" x={240} y={168} s={1.8} point={[-14, -20]} />
        </g>
      );
  }
}

export function ReproductionSceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as ReproductionSceneState;
  return (
    <div class="rp rs" data-part={ReproductionScenePart.Picture}>
      <Frame w={W} h={H} width={width} label={describeReproductionScene(s)} cls="rps-svg">
        <Picture scene={s.scene} />
      </Frame>
    </div>
  );
}
