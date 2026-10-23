import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { Appliance, ApplianceIcon } from "./appliances";
import { BulbSymbol, Person } from "./draw";
import {
  ElectricityScene,
  type ElectricitySceneState,
  SCENE_PICTURE,
  describeElectricityScene,
} from "./scene";

const W = SCENE_PICTURE.width;
const H = SCENE_PICTURE.height;

function Room({ dark = false }: { dark?: boolean }) {
  return (
    <g>
      <rect class={dark ? "el-sc-night" : "el-sc-wall"} x={0} y={0} width={W} height={H} />
      <rect class={dark ? "el-sc-floor-dark" : "el-sc-floor"} x={0} y={150} width={W} height={30} />
    </g>
  );
}

function Table({ x, w }: { x: number; w: number }) {
  return (
    <g class="el-sc-table">
      <rect x={x} y={118} width={w} height={7} rx={2} />
      <rect x={x + 6} y={125} width={5} height={30} />
      <rect x={x + w - 11} y={125} width={5} height={30} />
    </g>
  );
}

function Bill({
  x,
  y,
  amount,
  s = 1,
  good = false,
}: { x: number; y: number; amount: string; s?: number; good?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect class="el-sc-paper" x={-22} y={-30} width={44} height={56} rx={2} />
      {[-22, -16, -10].map((ly) => (
        <line key={ly} class="el-sc-ink" x1={-16} y1={ly} x2={16} y2={ly} />
      ))}
      <text class={good ? "el-sc-amount is-good" : "el-sc-amount"} x={0} y={8} text-anchor="middle">
        {amount}
      </text>
      <line class="el-sc-ink" x1={-16} y1={16} x2={8} y2={16} />
    </g>
  );
}

function BillShock() {
  return (
    <g>
      <Room />
      <rect class="el-sc-window" x={22} y={22} width={50} height={40} rx={3} />
      <Table x={96} w={140} />
      <Person who="mom" x={150} y={150} s={1.4} point={[14, -20]} />
      <Bill x={190} y={70} amount="₹3,240" s={1.05} />
      <Person who="riya" x={218} y={150} s={1.15} />
      <Person who="kabir" x={244} y={150} s={1.1} />
      <Person who="grandpa" x={56} y={150} s={1.25} />
      <g transform="translate(88 136)">
        <ApplianceIcon appliance={Appliance.Heater} on />
      </g>
    </g>
  );
}

function Torch({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} class="el-sc-torch">
      <rect x={-16} y={-5} width={26} height={10} rx={3} />
      <path d="M10 -8 L 18 -10 V 10 L 10 8 Z" />
      <rect class="el-sc-torch-switch" x={-6} y={-8} width={6} height={3} rx={1} />
    </g>
  );
}

function TorchDead() {
  return (
    <g>
      <Room dark />
      <rect class="el-sc-door" x={230} y={40} width={50} height={110} rx={2} />
      <Person who="kabir" x={140} y={150} s={1.5} point={[14, -6]} />
      <Torch x={176} y={108} />
      <text class="el-sc-mark" x={200} y={92}>
        ?
      </text>
      <g class="el-sc-cell">
        <rect x={90} y={144} width={22} height={9} rx={2} transform="rotate(-8 100 148)" />
        <rect x={60} y={146} width={22} height={9} rx={2} transform="rotate(12 70 150)" />
      </g>
    </g>
  );
}

function RoofTank() {
  return (
    <g>
      <rect class="el-sc-sky" x={0} y={0} width={W} height={H} />
      <rect class="el-sc-ground" x={0} y={154} width={W} height={26} />
      <rect class="el-sc-house" x={40} y={70} width={160} height={84} />
      <path class="el-sc-roof" d="M34 70 H 206 V 64 H 34 Z" />
      <rect class="el-sc-window" x={60} y={92} width={30} height={26} rx={2} />
      <rect class="el-sc-door" x={140} y={104} width={30} height={50} rx={2} />
      <g class="el-sc-tank">
        <rect x={150} y={30} width={40} height={30} rx={5} />
        <line x1={156} y1={60} x2={156} y2={64} />
        <line x1={184} y1={60} x2={184} y2={64} />
      </g>
      <path class="el-pipe" d="M190 50 H 214 V 132 H 246" style={{ strokeWidth: "6px" }} />
      <path
        class="el-pipe-water is-flowing"
        d="M190 50 H 214 V 132 H 246"
        style={{ strokeWidth: "3px" }}
      />
      <rect class="el-tap" x={244} y={126} width={14} height={10} rx={2} />
      <rect class="el-stream" x={254} y={136} width={3} height={8} />
      <path class="el-bucket" d="M244 142 H 268 L 265 156 H 247 Z" />
      <Person who="riya" x={290} y={156} s={1.1} point={[-12, -4]} />
    </g>
  );
}

function MessyWiring() {
  return (
    <g>
      <Room />
      <rect class="el-sc-board" x={30} y={30} width={110} height={80} rx={4} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} class="el-sc-switch" x={42 + i * 24} y={40} width={14} height={18} rx={2} />
      ))}
      <path class="el-sc-wire-red" d="M44 70 C 70 110 90 60 110 96 S 140 70 128 104" />
      <path class="el-sc-wire-dark" d="M50 100 C 80 64 96 108 120 74 S 60 80 84 104" />
      <path class="el-sc-wire-green" d="M60 66 C 40 90 100 100 132 80" />
      <Person who="kabir" x={176} y={150} s={1.3} point={[12, -2]} />
      <g transform="translate(206 112) rotate(-6)">
        <rect class="el-sc-paper" x={-18} y={-14} width={36} height={28} rx={2} />
        <path class="el-sc-scribble" d="M-12 -6 q 6 10 12 -2 t 10 6 q -8 6 -18 0 t 14 -4" />
      </g>
      <Person who="riya" x={272} y={150} s={1.2} point={[-10, -4]} />
      <g transform="translate(244 104) rotate(4)">
        <rect class="el-sc-paper" x={-18} y={-14} width={36} height={28} rx={2} />
        <path class="el-sc-diagram" d="M-12 -6 H 12 V 6 H -12 Z M-4 -9 V -3 M0 -11 V -1" />
      </g>
    </g>
  );
}

function FanRegulator() {
  return (
    <g>
      <Room />
      <line class="el-sc-rod" x1={130} y1={0} x2={130} y2={34} />
      <g transform="translate(130 42)">
        <g class="el-sc-fan">
          {[0, 120, 240].map((a) => (
            <ellipse
              key={a}
              class="el-sc-blade"
              cx={0}
              cy={-22}
              rx={4.5}
              ry={22}
              transform={`rotate(${a})`}
            />
          ))}
        </g>
        <circle class="el-sc-hub" r={7} />
      </g>
      <rect class="el-sc-board" x={230} y={70} width={44} height={56} rx={4} />
      <circle class="el-sc-knob" cx={252} cy={98} r={13} />
      <line class="el-sc-knob-mark" x1={252} y1={98} x2={262} y2={90} />
      <Person who="riya" x={214} y={150} s={1.3} point={[20, -16]} />
      <Person who="grandpa" x={96} y={150} s={1.25} />
    </g>
  );
}

function FairyLights() {
  const bulbs = Array.from({ length: 13 }, (_, i) => ({
    x: 34 + i * 20,
    y: 56 + 10 * Math.sin(i * 0.9),
  }));
  return (
    <g>
      <rect class="el-sc-night" x={0} y={0} width={W} height={H} />
      <rect class="el-sc-house-dark" x={20} y={50} width={280} height={104} />
      <path class="el-sc-roof" d="M14 50 H 306 V 44 H 14 Z" />
      <polyline class="el-sc-string" points={bulbs.map((b) => `${b.x},${b.y}`).join(" ")} />
      {bulbs.map((b) => (
        <g key={b.x} transform={`translate(${b.x} ${b.y + 4})`}>
          <BulbSymbol r={4} glow={0} isBroken={b.x === 34 + 7 * 20} />
        </g>
      ))}
      <g class="el-sc-ladder">
        <line x1={170} y1={154} x2={182} y2={80} />
        <line x1={190} y1={154} x2={200} y2={80} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={172 + i * 3} y1={140 - i * 18} x2={191 + i * 2.6} y2={140 - i * 18} />
        ))}
      </g>
      <Person who="grandpa" x={194} y={110} s={1} point={[0, -18]} />
      <Person who="kabir" x={260} y={160} s={1.1} point={[-10, -16]} />
      <rect class="el-sc-ground-dark" x={0} y={154} width={W} height={26} />
    </g>
  );
}

function FuseBlown() {
  return (
    <g>
      <Room dark />
      <g transform="translate(60 132)">
        <ApplianceIcon appliance={Appliance.Heater} on={false} />
      </g>
      <g transform="translate(110 110)">
        <ApplianceIcon appliance={Appliance.Iron} on={false} />
      </g>
      <g transform="translate(110 118)">
        <rect class="el-sc-table-dark" x={-18} y={4} width={36} height={4} />
      </g>
      <g transform="translate(272 70) scale(1.4)">
        <ApplianceIcon appliance={Appliance.Geyser} on={false} />
      </g>
      <Person who="grandpa" x={190} y={154} s={1.4} point={[12, -26]} />
      <g transform="translate(214 74)">
        <rect class="el-fuse-case" x={-14} y={-6} width={28} height={12} rx={4} />
        <line class="el-fuse-wire" x1={-11} y1={0} x2={-3} y2={0} />
        <line class="el-fuse-wire" x1={3} y1={0} x2={11} y2={0} />
        <circle class="el-fuse-blob" cx={-3} cy={0.5} r={1.5} />
        <circle class="el-fuse-blob" cx={3} cy={0.5} r={1.5} />
      </g>
      <Person who="riya" x={150} y={154} s={1.15} />
    </g>
  );
}

function MeterBox() {
  return (
    <g>
      <Room />
      <rect class="el-sc-door" x={30} y={30} width={60} height={120} rx={2} />
      <rect class="el-sc-board" x={124} y={30} width={80} height={86} rx={6} />
      <rect class="el-sc-display" x={134} y={44} width={60} height={20} rx={2} />
      <text class="el-sc-digits" x={164} y={59} text-anchor="middle">
        04172
      </text>
      <text class="el-sc-unit" x={164} y={76} text-anchor="middle">
        kW h
      </text>
      <circle class="el-lamp is-on" cx={146} cy={96} r={4} />
      <circle class="el-sc-screw" cx={184} cy={98} r={3} />
      <Person who="riya" x={244} y={150} s={1.35} point={[-18, -6]} />
      <g transform="translate(220 112) rotate(-10)">
        <rect class="el-sc-paper" x={-10} y={-12} width={20} height={24} rx={2} />
        <line class="el-sc-ink" x1={-6} y1={-5} x2={6} y2={-5} />
        <line class="el-sc-ink" x1={-6} y1={1} x2={6} y2={1} />
      </g>
    </g>
  );
}

function BillHalved() {
  return (
    <g>
      <Room />
      <rect class="el-sc-window" x={22} y={22} width={50} height={40} rx={3} />
      <Table x={96} w={140} />
      <Person who="mom" x={150} y={150} s={1.4} point={[14, -20]} />
      <Bill x={190} y={70} amount="₹1,650" s={1.05} good />
      <Person who="riya" x={218} y={150} s={1.15} point={[8, -18]} />
      <g transform="translate(232 98)">
        <ApplianceIcon appliance={Appliance.Led} on />
      </g>
      <Person who="kabir" x={268} y={150} s={1.1} point={[6, -24]} />
      <rect
        class="el-sc-bat"
        x={278}
        y={86}
        width={6}
        height={36}
        rx={2}
        transform="rotate(14 281 104)"
      />
      <Person who="grandpa" x={56} y={150} s={1.25} />
    </g>
  );
}

export function ElectricitySceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as ElectricitySceneState;
  const id = useId();
  const k = width / W;
  const height = Math.round((width * H) / W);
  const picture = ((): JSX.Element => {
    switch (s.scene) {
      case ElectricityScene.BillShock:
        return <BillShock />;
      case ElectricityScene.TorchDead:
        return <TorchDead />;
      case ElectricityScene.RoofTank:
        return <RoofTank />;
      case ElectricityScene.MessyWiring:
        return <MessyWiring />;
      case ElectricityScene.FanRegulator:
        return <FanRegulator />;
      case ElectricityScene.FairyLights:
        return <FairyLights />;
      case ElectricityScene.FuseBlown:
        return <FuseBlown />;
      case ElectricityScene.MeterBox:
        return <MeterBox />;
      case ElectricityScene.BillHalved:
        return <BillHalved />;
    }
  })();
  return (
    <div class="el-sc">
      <Stage
        label={describeElectricityScene(s.scene)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "el-svg" }}
      >
        <clipPath id={`el-sc-${id}`}>
          <rect x={0} y={0} width={W} height={H} rx={12} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#el-sc-${id})`} data-part="picture">
          {picture}
        </g>
      </Stage>
    </div>
  );
}
