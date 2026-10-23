import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Frame, Person } from "./draw";
import { ENV_PICTURE, EnvScene, EnvScenePart, type EnvSceneState, describeEnvScene } from "./scene";
import { WasteItem } from "./waste";
import { WasteIcon } from "./waste-icons";

const W = ENV_PICTURE.width;
const H = ENV_PICTURE.height;

function Sky() {
  return (
    <g>
      <rect class="evs-sky" x={0} y={0} width={W} height={H} />
      <circle class="evs-sun" cx={290} cy={26} r={13} />
    </g>
  );
}

function Terrace() {
  return (
    <g>
      <rect class="evs-roof" x={0} y={150} width={W} height={30} />
      <rect class="evs-parapet" x={0} y={122} width={W} height={28} />
    </g>
  );
}

function Room() {
  return (
    <g>
      <rect class="evs-wall" x={0} y={0} width={W} height={H} />
      <rect class="evs-floor" x={0} y={150} width={W} height={30} />
    </g>
  );
}

function Jar({ x, y, isCloudy, s = 1 }: { x: number; y: number; isCloudy: boolean; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect class="evs-lid" x={-12} y={-46} width={24} height={6} rx={2} />
      <rect class="evs-jar" x={-20} y={-40} width={40} height={42} rx={8} />
      <rect
        class={isCloudy ? "evs-water is-cloudy" : "evs-water"}
        x={-17}
        y={-30}
        width={34}
        height={29}
        rx={6}
      />
      {!isCloudy && (
        <g class="evs-weed">
          <path d="M-8 -1 q -4 -10 0 -22" />
          <path d="M8 -1 q 4 -12 0 -24" />
        </g>
      )}
      <ellipse class="evs-fish" cx={-2} cy={-14} rx={4} ry={2} />
      <ellipse class="evs-fish" cx={6} cy={-8} rx={4} ry={2} />
      {isCloudy && <ellipse class="evs-fish" cx={-6} cy={-6} rx={4} ry={2} />}
    </g>
  );
}

function Bin({ x, cls }: { x: number; cls: string }) {
  return <path class={cls} d={`M${x - 16} 120 L${x + 16} 120 L${x + 13} 156 L${x - 13} 156 Z`} />;
}

function Picture({ scene }: { scene: EnvScene }) {
  switch (scene) {
    case EnvScene.EcoClubNotice:
      return (
        <g>
          <Room />
          <rect class="evs-board" x={130} y={22} width={150} height={100} rx={4} />
          <rect class="evs-paper" x={146} y={32} width={118} height={80} rx={2} />
          <g transform="translate(180 92) scale(0.7)">
            <Jar x={0} y={0} isCloudy={false} />
          </g>
          <g transform="translate(232 86) scale(0.8)">
            <WasteIcon item={WasteItem.MilkPacket} />
          </g>
          {[44, 54].map((y) => (
            <line key={y} class="evs-writing" x1={156} y1={y} x2={254} y2={y} />
          ))}
          <Person who="riya" x={70} y={168} s={1.8} point={[34, -30]} />
          <Person who="kabir" x={110} y={168} s={1.8} />
        </g>
      );
    case EnvScene.TubPond:
      return (
        <g>
          <Sky />
          <Terrace />
          <ellipse class="evs-tub" cx={120} cy={146} rx={58} ry={16} />
          <ellipse class="evs-pond" cx={120} cy={142} rx={52} ry={11} />
          <path class="evs-weed-line" d="M96 142 q -4 -14 2 -24 M140 142 q 4 -16 -2 -26" />
          <Person who="grandpa" x={222} y={170} s={1.8} />
          <Person who="kabir" x={176} y={170} s={1.6} point={[-24, 4]} />
          <Jar x={146} y={170} isCloudy={false} s={0.7} />
        </g>
      );
    case EnvScene.CloudyJar:
      return (
        <g>
          <rect class="evs-dark" x={0} y={0} width={W} height={H} />
          <rect class="evs-shelf" x={90} y={128} width={140} height={6} />
          <Jar x={160} y={126} isCloudy={true} s={1.4} />
          <Person who="riya" x={262} y={176} s={1.7} />
          <path
            class="evs-stink"
            d="M150 56 q 6 -6 0 -12 q -6 -6 0 -12 M170 58 q 6 -6 0 -12 q -6 -6 0 -12"
          />
          <Person who="kabir" x={60} y={176} s={1.6} />
        </g>
      );
    case EnvScene.Sprayer:
      return (
        <g>
          <Sky />
          <rect class="evs-field" x={0} y={110} width={W} height={70} />
          {[20, 50, 80, 110, 140, 170].map((x) => (
            <path key={x} class="evs-crop" d={`M${x} 150 l 0 -22 M${x - 5} 136 l 5 -6 l 5 6`} />
          ))}
          <Person who="neighbour" x={110} y={150} s={1.4} point={[18, -4]} />
          <g class="evs-mist">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <circle key={i} cx={136 + i * 6} cy={118 + (i % 3) * 5} r={2} />
            ))}
          </g>
          <rect class="evs-parapet" x={200} y={120} width={120} height={60} />
          <Person who="grandpa" x={262} y={172} s={1.8} />
          <path class="evs-crop" d="M226 120 l 0 -16 M236 120 l 0 -20 M300 120 l 0 -18" />
        </g>
      );
    case EnvScene.OldFridge:
      return (
        <g>
          <Room />
          <rect class="evs-fridge is-old" x={60} y={60} width={56} height={96} rx={6} />
          <text class="evs-tag" x={88} y={100} text-anchor="middle">
            CFC
          </text>
          <rect class="evs-fridge" x={200} y={54} width={56} height={102} rx={6} />
          <rect class="evs-sticker" x={208} y={66} width={40} height={14} rx={3} />
          <text class="evs-tag is-small" x={228} y={76} text-anchor="middle">
            CFC-free
          </text>
          <Person who="mom" x={150} y={170} s={1.7} point={[24, -28]} />
        </g>
      );
    case EnvScene.GarbageHeap:
      return (
        <g>
          <Room />
          <Bin x={150} cls="evs-bin" />
          {(
            [
              [WasteItem.Peels, 132, 112],
              [WasteItem.MilkPacket, 160, 106],
              [WasteItem.Wrapper, 184, 118],
              [WasteItem.Paper, 112, 128],
              [WasteItem.Slipper, 190, 146],
              [WasteItem.TeaLeaves, 146, 96],
            ] as const
          ).map(([item, x, y]) => (
            <g key={item} transform={`translate(${x} ${y}) scale(0.8)`}>
              <WasteIcon item={item} />
            </g>
          ))}
          <Person who="kabir" x={250} y={170} s={1.8} />
        </g>
      );
    case EnvScene.BuryPit:
      return (
        <g>
          <Sky />
          <rect class="evs-soil" x={0} y={120} width={W} height={60} />
          <rect class="evs-pit" x={110} y={124} width={90} height={36} rx={6} />
          <g transform="translate(140 146) scale(0.6)">
            <WasteIcon item={WasteItem.Peels} />
          </g>
          <g transform="translate(170 148) scale(0.6)">
            <WasteIcon item={WasteItem.MilkPacket} />
          </g>
          <line class="evs-stick" x1={210} y1={124} x2={210} y2={92} />
          <Person who="grandpa" x={74} y={168} s={1.8} point={[30, 12]} />
          <Person who="kabir" x={250} y={170} s={1.6} point={[-22, 10]} />
        </g>
      );
    case EnvScene.TrainChai:
      return (
        <g>
          <rect class="evs-train" x={0} y={0} width={W} height={H} />
          {[30, 130, 230].map((x) => (
            <rect key={x} class="evs-window" x={x} y={24} width={70} height={48} rx={8} />
          ))}
          <rect class="evs-tray" x={150} y={110} width={70} height={8} rx={2} />
          <path class="evs-kulhad" d="M156 110 l 12 0 l -2 -12 l -8 0 Z" />
          <path class="evs-plastic" d="M176 110 l 10 0 l 2 -14 l -14 0 Z" />
          <path class="evs-paper-cup" d="M196 110 l 10 0 l 2 -14 l -14 0 Z" />
          <Person who="grandpa" x={70} y={170} s={1.8} point={[24, -6]} />
          <Person who="riya" x={110} y={170} s={1.6} />
          <Person who="neighbour" x={238} y={170} s={1.7} point={[-22, -18]} />
        </g>
      );
    case EnvScene.ClothBag:
      return (
        <g>
          <Sky />
          <rect class="evs-road" x={0} y={150} width={W} height={30} />
          <rect class="evs-stall" x={200} y={92} width={110} height={10} />
          {[214, 236, 258, 280].map((x, i) => (
            <circle
              key={x}
              class={i % 2 === 0 ? "evs-veg" : "evs-veg is-green"}
              cx={x}
              cy={88}
              r={7}
            />
          ))}
          <rect class="evs-stall-leg" x={206} y={102} width={6} height={48} />
          <rect class="evs-stall-leg" x={298} y={102} width={6} height={48} />
          <Person who="mom" x={110} y={170} s={1.8} />
          <path class="evs-bag" d="M124 130 l 18 0 l 2 22 l -22 0 Z M128 130 q 5 -10 10 0" />
          <Person who="riya" x={160} y={170} s={1.6} />
          <Person who="kabir" x={50} y={170} s={1.5} />
        </g>
      );
    case EnvScene.EnvironmentDay:
      return (
        <g>
          <Sky />
          <rect class="evs-ground" x={0} y={150} width={W} height={30} />
          <rect class="evs-banner" x={40} y={14} width={200} height={26} rx={4} />
          <rect class="evs-table" x={120} y={118} width={90} height={8} rx={2} />
          <Jar x={165} y={116} isCloudy={false} s={1.1} />
          <Bin x={250} cls="evs-bin is-green" />
          <Bin x={290} cls="evs-bin is-blue" />
          <Person who="grandpa" x={40} y={170} s={1.7} />
          <Person who="mom" x={70} y={170} s={1.7} />
          <Person who="riya" x={100} y={170} s={1.6} point={[24, -20]} />
          <Person who="kabir" x={226} y={170} s={1.6} point={[-24, -26]} />
        </g>
      );
  }
}

/** A story panel; nothing to tap. */
export function EnvironmentSceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as EnvSceneState;
  return (
    <div class="ev evs" data-part={EnvScenePart.Picture}>
      <Frame w={W} h={H} width={width} label={describeEnvScene(s)} cls="evs-svg">
        <Picture scene={s.scene} />
      </Frame>
    </div>
  );
}
