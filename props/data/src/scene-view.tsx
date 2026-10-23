import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { type Words, say } from "./numbers";
import {
  DATA_PICTURE,
  DataSceneKind,
  DataScenePart,
  type DataSceneState,
  describeDataScene,
} from "./scene";

const W = DATA_PICTURE.width;
const H = DATA_PICTURE.height;

const WORDS = {
  title: { en: "10B in Numbers", hi: "आँकड़ों में 10B" },
  prize: { en: "Win a prize!", hi: "इनाम जीतो!" },
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
  const shirt = `dts-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="dts-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`dts-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="dts-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="dts-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="dts-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="dts-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -3 -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="dts-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="dts-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="dts-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="dts-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="dts-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="dts-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="dts-specs">
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
      <rect class="dts-wall" x={0} y={0} width={W} height={150} />
      <rect class="dts-floor" x={0} y={150} width={W} height={30} />
    </g>
  );
}

function Outside({ ground = 150 }: { ground?: number }): JSX.Element {
  return (
    <g>
      <rect class="dts-sky" x={0} y={0} width={W} height={ground} />
      <rect class="dts-grass" x={0} y={ground} width={W} height={H - ground} />
    </g>
  );
}

function Board({ x, y, w, h }: { x: number; y: number; w: number; h: number }): JSX.Element {
  return <rect class="dts-paper" x={x} y={y} width={w} height={h} rx={3} />;
}

function Poster({ locale }: { locale: string }): JSX.Element {
  return (
    <g>
      <Room />
      <Board x={90} y={14} w={150} h={112} />
      <text class="dts-title" x={165} y={32} text-anchor="middle">
        {say(locale, WORDS.title)}
      </text>
      {[0, 1, 2].map((i) => (
        <rect key={i} class="dts-box" x={102 + i * 44} y={44} width={38} height={34} rx={3} />
      ))}
      <text class="dts-small" x={121} y={90} text-anchor="middle">
        x̄
      </text>
      <text class="dts-small" x={165} y={90} text-anchor="middle">
        Mo
      </text>
      <text class="dts-small" x={209} y={90} text-anchor="middle">
        Me
      </text>
      <rect class="dts-box" x={102} y={98} width={126} height={20} rx={3} />
      <Person who="riya" x={70} y={170} s={1.5} point={[24, -20]} />
      <Person who="kabir" x={274} y={170} s={1.45} point={[-18, -10]} />
    </g>
  );
}

function MarksSheet(): JSX.Element {
  const tally = [2, 3, 7, 6, 6, 6];
  return (
    <g>
      <Room />
      <rect class="dts-table" x={40} y={118} width={200} height={8} rx={2} />
      <rect class="dts-table-leg" x={50} y={126} width={6} height={26} />
      <rect class="dts-table-leg" x={224} y={126} width={6} height={26} />
      <g transform="rotate(-4 140 70)">
        <Board x={70} y={12} w={140} h={104} />
        {tally.map((t, i) => (
          <g key={`${10 + i * 15}`}>
            <text class="dts-small" x={80} y={30 + i * 15}>{`${10 + i * 15}–${25 + i * 15}`}</text>
            {Array.from({ length: t }, (_, k) => (
              <line
                // biome-ignore lint/suspicious/noArrayIndexKey: tally marks
                key={k}
                class="dts-tally"
                x1={130 + k * 6}
                x2={130 + k * 6}
                y1={22 + i * 15}
                y2={32 + i * 15}
              />
            ))}
          </g>
        ))}
      </g>
      <line class="dts-pencil" x1={196} y1={92} x2={214} y2={110} />
      <Person who="riya" x={234} y={166} s={1.4} point={[-20, -30]} />
      <Person who="grandpa" x={286} y={166} s={1.45} />
    </g>
  );
}

function Cricket(): JSX.Element {
  return (
    <g>
      <Outside ground={96} />
      <rect class="dts-pitch" x={40} y={120} width={200} height={22} rx={3} />
      {[0, 1, 2].map((i) => (
        <line key={i} class="dts-stump" x1={222 + i * 4} x2={222 + i * 4} y1={106} y2={130} />
      ))}
      <circle class="dts-ball" cx={170} cy={110} r={3.5} />
      <Person who="kabir" x={80} y={140} s={1.45} point={[22, -26]} />
      <rect class="dts-scoreboard" x={240} y={18} width={70} height={66} rx={3} />
      {["W", "1 2 3", "4 5"].map((t, i) => (
        <text key={t} class="dts-board-text" x={275} y={36 + i * 18} text-anchor="middle">
          {t}
        </text>
      ))}
      <Person who="riya" x={282} y={170} s={1.3} />
      <rect class="dts-notebook" x={292} y={130} width={14} height={11} rx={1.5} />
    </g>
  );
}

function House({ x, n }: { x: number; n: number }): JSX.Element {
  return (
    <g>
      <rect class="dts-house" x={x} y={70} width={52} height={70} />
      <path class="dts-roof" d={`M${x - 6} 72 L${x + 26} 46 L${x + 58} 72 Z`} />
      <rect class="dts-door" x={x + 19} y={108} width={14} height={32} rx={2} />
      <circle class="dts-bubble" cx={x + 26} cy={30} r={11} />
      <text class="dts-bubble-text" x={x + 26} y={35} text-anchor="middle">
        {n}
      </text>
    </g>
  );
}

function FamilySurvey(): JSX.Element {
  return (
    <g>
      <Outside ground={140} />
      <House x={14} n={3} />
      <House x={86} n={4} />
      <House x={158} n={2} />
      <House x={230} n={5} />
      <Person who="riya" x={196} y={172} s={1.35} point={[-8, -18]} />
      <rect class="dts-clipboard" x={176} y={136} width={12} height={16} rx={1.5} />
      <Person who="mom" x={110} y={142} s={1.1} />
    </g>
  );
}

function HeightQueue(): JSX.Element {
  const scales = [1.05, 1.15, 1.25, 1.35, 1.45, 1.55, 1.65];
  return (
    <g>
      <Outside ground={150} />
      <rect class="dts-chart" x={12} y={30} width={16} height={120} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} class="dts-chart-line" x1={12} x2={22} y1={40 + i * 20} y2={40 + i * 20} />
      ))}
      {scales.map((s, i) => (
        <Person
          key={s}
          who={i % 2 === 0 ? "kabir" : "riya"}
          x={50 + i * 30}
          y={168}
          s={s}
          back={i !== 3}
        />
      ))}
      <path class="dts-arrow" d="M140 34 v 18 m -5 -6 l5 6 l5 -6" />
      <Person who="grandpa" x={292} y={170} s={1.5} point={[-16, -26]} />
    </g>
  );
}

function CoinToss(): JSX.Element {
  return (
    <g>
      <Room />
      <rect class="dts-slate" x={190} y={20} width={118} height={74} rx={4} />
      <text class="dts-slate-text" x={200} y={44}>
        H ||||| ||
      </text>
      <text class="dts-slate-text" x={200} y={72}>
        T ||||| |
      </text>
      <ellipse class="dts-coin-fly" cx={110} cy={34} rx={9} ry={4} />
      <path class="dts-arc" d="M84 92 q 10 -60 26 -54" />
      <Person who="grandpa" x={80} y={170} s={1.5} point={[8, -30]} />
      <Person who="kabir" x={160} y={170} s={1.45} point={[-12, -26]} />
    </g>
  );
}

const STALL_COLOURS = ["dts-flag is-0", "dts-flag is-1", "dts-flag is-2", "dts-flag is-3"];

function GameStall({ locale }: { locale: string }): JSX.Element {
  return (
    <g>
      <Outside ground={150} />
      <rect class="dts-stall" x={30} y={30} width={220} height={120} rx={3} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          // biome-ignore lint/suspicious/noArrayIndexKey: awning stripes
          key={i}
          class={STALL_COLOURS[i % 2]}
          x={22 + i * 29.5}
          y={18}
          width={29.5}
          height={20}
        />
      ))}
      <rect class="dts-sign" x={92} y={44} width={96} height={18} rx={3} />
      <text class="dts-sign-text" x={140} y={57} text-anchor="middle">
        {say(locale, WORDS.prize)}
      </text>
      <g transform="translate(80 102)">
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            class={STALL_COLOURS[i]}
            d={`M0 0 L${24 * Math.cos((i * Math.PI) / 2)} ${24 * Math.sin((i * Math.PI) / 2)} A 24 24 0 0 1 ${
              24 * Math.cos(((i + 1) * Math.PI) / 2)
            } ${24 * Math.sin(((i + 1) * Math.PI) / 2)} Z`}
          />
        ))}
        <line class="dts-needle" x1={0} y1={0} x2={14} y2={-14} />
      </g>
      <rect class="dts-jar" x={150} y={80} width={50} height={52} rx={6} />
      {MARBLES.map(([x, y, c]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill={c} class="dts-marble" />
      ))}
      <Person who="kabir" x={226} y={150} s={1.3} point={[-14, -12]} />
      <Person who="riya" x={280} y={174} s={1.45} />
      <rect class="dts-notebook" x={290} y={130} width={14} height={11} rx={1.5} />
    </g>
  );
}

/** Marbles in the jar: the content's own red, blue and white. */
const MARBLES: [number, number, string][] = [
  [160, 126, "#d64545"],
  [171, 126, "#3b6fd4"],
  [182, 126, "#f4f4f2"],
  [193, 126, "#d64545"],
  [165, 116, "#3b6fd4"],
  [176, 116, "#d64545"],
  [187, 116, "#f4f4f2"],
  [170, 106, "#d64545"],
  [181, 106, "#3b6fd4"],
];

function Pips({ x, y, n, cls }: { x: number; y: number; n: number; cls: string }): JSX.Element {
  const at: Record<number, [number, number][]> = {
    3: [
      [-1, -1],
      [0, 0],
      [1, 1],
    ],
    5: [
      [-1, -1],
      [1, -1],
      [0, 0],
      [-1, 1],
      [1, 1],
    ],
  };
  return (
    <g>
      <rect class={cls} x={x - 14} y={y - 14} width={28} height={28} rx={5} />
      {(at[n] ?? []).map(([dx, dy]) => (
        <circle key={`${dx}${dy}`} class="dts-pip" cx={x + dx * 7} cy={y + dy * 7} r={2.4} />
      ))}
    </g>
  );
}

function DiceGame(): JSX.Element {
  return (
    <g>
      <Outside ground={120} />
      <rect class="dts-cloth" x={60} y={104} width={200} height={50} rx={4} />
      <Pips x={140} y={124} n={3} cls="dts-die" />
      <Pips x={180} y={128} n={5} cls="dts-die is-second" />
      <text class="dts-title" x={160} y={92} text-anchor="middle">
        3 + 5 = ?
      </text>
      <Person who="kabir" x={44} y={166} s={1.4} point={[24, -12]} />
      <Person who="mom" x={286} y={168} s={1.5} point={[-22, -10]} />
    </g>
  );
}

function CardTable(): JSX.Element {
  const suits = [
    ["♠", false],
    ["♥", true],
    ["♦", true],
    ["♣", false],
  ] as const;
  return (
    <g>
      <Room />
      <rect class="dts-cloth" x={20} y={96} width={220} height={58} rx={4} />
      {suits.map(([sym, red], r) =>
        Array.from({ length: 9 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fanned cards
          <g key={`${r}-${i}`}>
            <rect
              class="dts-card"
              x={30 + i * 22 + r * 3}
              y={100 + r * 13}
              width={18}
              height={24}
              rx={2}
            />
            <text
              class={`dts-card-text${red ? " is-red" : ""}`}
              x={39 + i * 22 + r * 3}
              y={112 + r * 13}
              text-anchor="middle"
            >
              {sym}
            </text>
          </g>
        )),
      )}
      <g transform="rotate(8 280 60)">
        <rect class="dts-card" x={266} y={40} width={28} height={38} rx={3} />
        <text class="dts-card-text" x={280} y={58} text-anchor="middle">
          A
        </text>
        <text class="dts-card-text" x={280} y={72} text-anchor="middle">
          ♠
        </text>
      </g>
      <Person who="grandpa" x={262} y={170} s={1.5} point={[14, -36]} />
      <Person who="riya" x={60} y={92} s={1.1} />
    </g>
  );
}

function Finale({ locale }: { locale: string }): JSX.Element {
  const bars = [2, 3, 7, 6, 6, 6];
  return (
    <g>
      <Room />
      <path class="dts-string" d="M0 10 Q 160 30 320 10" />
      {[20, 70, 120, 170, 220, 270].map((x, i) => (
        <path
          key={x}
          class={STALL_COLOURS[i % 4]}
          d={`M${x - 6} ${14 + 8 * Math.sin((x / 320) * Math.PI)} l6 10 l6 -10 z`}
        />
      ))}
      <Board x={70} y={30} w={180} h={96} />
      <text class="dts-title" x={160} y={46} text-anchor="middle">
        {say(locale, WORDS.title)}
      </text>
      {bars.map((b, i) => (
        <rect
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed bars
          key={i}
          class={`dts-hist${i === 2 ? " is-modal" : ""}`}
          x={82 + i * 10}
          y={116 - b * 8}
          width={10}
          height={b * 8}
        />
      ))}
      <path class="dts-ogive" d="M150 116 L160 112 L170 104 L180 90 L190 76 L200 66 L210 60" />
      {Array.from({ length: 36 }, (_, k) => (
        <rect
          // biome-ignore lint/suspicious/noArrayIndexKey: grid cells
          key={k}
          class={`dts-cell${(k % 6) + Math.floor(k / 6) === 6 ? " is-lit" : ""}`}
          x={216 + (k % 6) * 5}
          y={62 + Math.floor(k / 6) * 5}
          width={4.4}
          height={4.4}
        />
      ))}
      <Person who="riya" x={40} y={170} s={1.45} point={[12, -30]} />
      <Person who="kabir" x={140} y={172} s={1.35} point={[4, -30]} />
      <Person who="mom" x={236} y={172} s={1.45} />
      <Person who="grandpa" x={286} y={172} s={1.45} point={[-6, -30]} />
    </g>
  );
}

export function DataSceneView({ view, width, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as DataSceneState;
  const id = useId();
  const k = width / W;
  const height = Math.round((width * H) / W);
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case DataSceneKind.Poster:
        return <Poster locale={locale} />;
      case DataSceneKind.MarksSheet:
        return <MarksSheet />;
      case DataSceneKind.Cricket:
        return <Cricket />;
      case DataSceneKind.FamilySurvey:
        return <FamilySurvey />;
      case DataSceneKind.HeightQueue:
        return <HeightQueue />;
      case DataSceneKind.CoinToss:
        return <CoinToss />;
      case DataSceneKind.GameStall:
        return <GameStall locale={locale} />;
      case DataSceneKind.DiceGame:
        return <DiceGame />;
      case DataSceneKind.CardTable:
        return <CardTable />;
      case DataSceneKind.Finale:
        return <Finale locale={locale} />;
    }
  })();
  return (
    <div class="dts" data-part={DataScenePart.Picture}>
      <Stage
        label={describeDataScene(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "dts-svg" }}
      >
        <clipPath id={`dts-${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12 / k} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#dts-${id}-frame)`}>
          {scene}
        </g>
      </Stage>
    </div>
  );
}
