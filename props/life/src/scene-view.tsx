import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Frame, Person } from "./draw";
import {
  LIFE_PICTURE,
  LifeScene,
  LifeScenePart,
  type LifeSceneState,
  describeLifeScene,
} from "./scene";

const W = LIFE_PICTURE.width;
const H = LIFE_PICTURE.height;

function Sky({ isHot = false }: { isHot?: boolean }) {
  return (
    <g>
      <rect class={isHot ? "lps-sky-hot" : "lps-sky"} x={0} y={0} width={W} height={H} />
      <circle class="lps-sun" cx={284} cy={30} r={isHot ? 20 : 14} />
      {isHot &&
        [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              class="lps-ray"
              x1={284 + 26 * Math.cos(a)}
              y1={30 + 26 * Math.sin(a)}
              x2={284 + 34 * Math.cos(a)}
              y2={30 + 34 * Math.sin(a)}
            />
          );
        })}
    </g>
  );
}

function Track() {
  return (
    <g>
      <rect class="lps-grass" x={0} y={120} width={W} height={60} />
      <path class="lps-track" d="M0 140 L320 140 L320 176 L0 176 Z" />
      <line class="lps-lane" x1={0} y1={152} x2={W} y2={152} />
      <line class="lps-lane" x1={0} y1={164} x2={W} y2={164} />
    </g>
  );
}

function Room() {
  return (
    <g>
      <rect class="lps-wall" x={0} y={0} width={W} height={H} />
      <rect class="lps-floor" x={0} y={150} width={W} height={30} />
    </g>
  );
}

function Terrace() {
  return (
    <g>
      <rect class="lps-roof" x={0} y={150} width={W} height={30} />
      <rect class="lps-parapet" x={0} y={118} width={W} height={32} />
    </g>
  );
}

function Table({ x, w }: { x: number; w: number }) {
  return (
    <g>
      <rect class="lps-table" x={x} y={122} width={w} height={8} rx={2} />
      <rect class="lps-table-leg" x={x + 6} y={130} width={5} height={36} />
      <rect class="lps-table-leg" x={x + w - 11} y={130} width={5} height={36} />
    </g>
  );
}

function Pot({ x, y }: { x: number; y: number }) {
  return (
    <path
      class="lps-pot"
      d={`M${x - 16} ${y} L${x + 16} ${y} L${x + 12} ${y + 22} L${x - 12} ${y + 22} Z`}
    />
  );
}

function Pain({ x, y }: { x: number; y: number }) {
  return (
    <path
      class="lps-pain"
      d={`M${x} ${y} l 6 -4 l -2 7 l 7 -3 M${x - 2} ${y + 10} l -6 3 l 5 2 l -6 4`}
    />
  );
}

function Picture({ scene }: { scene: LifeScene }) {
  switch (scene) {
    case LifeScene.SignUp:
      return (
        <g>
          <Room />
          <rect class="lps-board" x={130} y={22} width={150} height={100} rx={4} />
          <rect class="lps-paper" x={150} y={34} width={110} height={78} rx={2} />
          <text class="lps-title" x={205} y={52} text-anchor="middle">
            1500 m
          </text>
          {[66, 78, 90, 102].map((y) => (
            <line key={y} class="lps-writing" x1={160} y1={y} x2={y === 102 ? 210 : 250} y2={y} />
          ))}
          <Person who="riya" x={70} y={168} s={1.8} />
          <Person who="kabir" x={120} y={168} s={1.9} point={[30, -36]} />
        </g>
      );
    case LifeScene.FirstRun:
      return (
        <g>
          <rect class="lps-dawn" x={0} y={0} width={W} height={H} />
          <circle class="lps-sun" cx={60} cy={110} r={18} />
          <Track />
          <Person who="kabir" x={150} y={170} s={1.9} isTired />
          <Person who="riya" x={232} y={170} s={1.8} point={[-22, 6]} />
          <circle class="lps-watch" cx={202} cy={136} r={5} />
        </g>
      );
    case LifeScene.Cramp:
      return (
        <g>
          <Sky />
          <Track />
          <Person who="kabir" x={150} y={170} s={1.9} isTired />
          <Pain x={162} y={146} />
          <Person who="riya" x={210} y={170} s={1.6} point={[-24, 10]} />
        </g>
      );
    case LifeScene.Breakfast:
      return (
        <g>
          <Room />
          <Table x={90} w={150} />
          <ellipse class="lps-plate" cx={150} cy={118} rx={24} ry={6} />
          <ellipse class="lps-paratha" cx={150} cy={114} rx={16} ry={4} />
          <path class="lps-bowl" d="M186 112 Q 196 126 206 112 Z" />
          <path class="lps-banana" d="M216 116 Q 226 124 236 112" />
          <Person who="mom" x={66} y={168} s={1.8} point={[30, -2]} />
          <Person who="kabir" x={150} y={168} s={1.7} />
          <Person who="grandpa" x={274} y={168} s={1.8} />
          <rect class="lps-paper" x={258} y={112} width={30} height={20} rx={1} />
        </g>
      );
    case LifeScene.MoneyPlant:
      return (
        <g>
          <Sky />
          <Terrace />
          <Pot x={130} y={128} />
          <line class="lps-stick" x1={130} y1={128} x2={130} y2={40} />
          {[
            [118, 112, -1],
            [142, 98, 1],
            [118, 82, -1],
            [142, 66, 1],
            [120, 50, -1],
          ].map(([x, y, side]) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${side} 1)`}>
              <path class="lps-leaf-cream" d="M0 0 C -14 -10 -16 6 0 12 C 16 6 14 -10 0 0 Z" />
              <path class="lps-leaf" d="M0 2 C -8 -4 -9 5 0 9 C 7 5 6 -3 0 2 Z" />
            </g>
          ))}
          <Person who="grandpa" x={210} y={168} s={1.9} point={[-40, -24]} />
        </g>
      );
    case LifeScene.AmarBel:
      return (
        <g>
          <Sky />
          <rect class="lps-grass" x={0} y={140} width={W} height={40} />
          <rect class="lps-post" x={14} y={60} width={14} height={90} />
          <path
            class="lps-hedge"
            d="M30 146 C 30 90 70 80 90 96 C 110 70 150 74 160 96 C 180 76 220 82 224 146 Z"
          />
          <path
            class="lps-amarbel"
            d="M40 140 C 60 100 80 120 96 96 C 110 76 130 110 150 92 C 170 76 190 112 210 104 M50 120 C 80 90 120 130 160 110 C 180 100 200 130 216 120"
          />
          <Person who="kabir" x={262} y={170} s={1.9} point={[-44, -10]} />
        </g>
      );
    case LifeScene.LimeWaterStraw:
      return (
        <g>
          <Room />
          <Table x={60} w={200} />
          <path class="lps-glass-fill" d="M150 120 L174 120 L172 92 L152 92 Z" />
          <path class="lps-glass" d="M148 120 L176 120 L178 76 L146 76 Z" />
          <path class="lps-straw" d="M164 104 L150 52 L138 52" />
          {[0, 1, 2].map((i) => (
            <circle key={i} class="lps-bubble" cx={160 + i * 3} cy={110 - i * 6} r={2} />
          ))}
          <Person who="kabir" x={118} y={168} s={1.8} />
          <Person who="riya" x={222} y={168} s={1.8} />
        </g>
      );
    case LifeScene.Pulse:
      return (
        <g>
          <Sky />
          <Track />
          <Person who="kabir" x={130} y={170} s={1.9} isTired point={[20, 8]} />
          <Person who="riya" x={196} y={170} s={1.8} point={[-26, 4]} />
          <path
            class="lps-heart"
            d="M160 60 c -6 -8 -18 -2 -10 8 l 10 10 l 10 -10 c 8 -10 -4 -16 -10 -8 z"
          />
        </g>
      );
    case LifeScene.WiltingPeas:
      return (
        <g>
          <Sky isHot />
          <Terrace />
          <rect class="lps-bed" x={14} y={140} width={200} height={10} rx={3} />
          {[34, 64, 94, 124, 154, 184].map((x) => (
            <g key={x}>
              <path class="lps-stem" d={`M${x} 140 C ${x} 110 ${x + 4} 96 ${x + 16} 104`} />
              <path
                class="lps-droop"
                d={`M${x + 2} 118 q -10 6 -12 16 M${x + 6} 104 q 10 4 10 16`}
              />
            </g>
          ))}
          <Person who="grandpa" x={262} y={168} s={1.9} point={[-18, 6]} />
          <path class="lps-can" d="M232 120 l 14 0 l 0 14 l -14 0 z M232 124 l -12 -8" />
        </g>
      );
    case LifeScene.HotDay:
      return (
        <g>
          <Sky isHot />
          <rect class="lps-grass" x={0} y={140} width={W} height={40} />
          <Person who="kabir" x={150} y={170} s={2.1} isTired point={[2, -24]} />
          <rect
            class="lps-bottle"
            x={162}
            y={62}
            width={10}
            height={24}
            rx={3}
            transform="rotate(-30 167 74)"
          />
          <path
            class="lps-heat"
            d="M40 60 q 6 -8 0 -16 q -6 -8 0 -16 M70 70 q 6 -8 0 -16 q -6 -8 0 -16 M230 80 q 6 -8 0 -16 q -6 -8 0 -16"
          />
        </g>
      );
    default:
      return (
        <g>
          <Sky />
          <Track />
          <line class="lps-post-line" x1={196} y1={100} x2={196} y2={176} />
          <line class="lps-post-line" x1={236} y1={100} x2={236} y2={176} />
          <path class="lps-tape" d="M196 124 Q 182 128 168 122 M236 124 Q 250 128 262 120" />
          <Person who="kabir" x={176} y={172} s={2} point={[8, -30]} />
          <Person who="riya" x={50} y={140} s={1.4} point={[6, -22]} />
          <Person who="mom" x={80} y={140} s={1.5} point={[6, -22]} />
          <Person who="grandpa" x={110} y={140} s={1.5} point={[8, -20]} />
          <text class="lps-title" x={216} y={40} text-anchor="middle">
            1500 m
          </text>
        </g>
      );
  }
}

/** A story panel; nothing to tap. */
export function LifeSceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as LifeSceneState;
  return (
    <div class="lp lps" data-part={LifeScenePart.Picture}>
      <Frame w={W} h={H} width={width} label={describeLifeScene(s)} cls="lps-svg">
        <Picture scene={s.scene} />
      </Frame>
    </div>
  );
}
