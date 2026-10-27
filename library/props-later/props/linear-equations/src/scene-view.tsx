import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  LINEAR_PICTURE,
  LinearSceneKind,
  type LinearSceneState,
  describeLinearScene,
} from "./scene";
import { range } from "./words";

const W = LINEAR_PICTURE.width;
const H = LINEAR_PICTURE.height;

type Who = "riya" | "kabir" | "grandpa" | "mom";

/** A person (the same family as the other chapters): feet at (x, y), `s` the scale. */
function Person({
  who,
  x,
  y,
  s = 1,
  back = false,
  point,
  cheer = false,
}: {
  who: Who;
  x: number;
  y: number;
  s?: number;
  back?: boolean;
  /** One arm raised towards (dx, dy) from the shoulder. */
  point?: [number, number];
  /** Both arms up. */
  cheer?: boolean;
}): JSX.Element {
  const isChild = who === "kabir";
  const h = isChild ? 34 : 44;
  const headR = isChild ? 7.5 : 7;
  const bodyW = isChild ? 15 : 17;
  const neck = h - 2 * headR;
  const shirt = `lq-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="lq-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`lq-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {cheer && (
        <g class={`lq-arm ${shirt}-line`}>
          <line x1={bodyW / 2 - 3} y1={-neck + 5} x2={bodyW / 2 + 5} y2={-neck - 12} />
          <line x1={-bodyW / 2 + 3} y1={-neck + 5} x2={-bodyW / 2 - 5} y2={-neck - 12} />
        </g>
      )}
      {who === "riya" && (
        <path
          class="lq-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="lq-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="lq-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="lq-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -3 -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="lq-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="lq-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="lq-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="lq-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="lq-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="lq-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="lq-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

/* ---- small things ---- */

const FLAG_CLASSES = ["lq-flag-a", "lq-flag-b", "lq-flag-c", "lq-flag-d"] as const;

function Bunting({ y, from = 0, to = W }: { y: number; from?: number; to?: number }) {
  const n = Math.floor((to - from) / 18);
  return (
    <g>
      <path
        class="lq-string"
        d={`M${from} ${y} Q ${(from + to) / 2} ${y + 10} ${to} ${y}`}
        fill="none"
      />
      {range(n).map((i) => {
        const x = from + 9 + i * 18;
        const t = (x - from) / (to - from);
        const sag = y + 20 * t * (1 - t); // on the string's curve
        return (
          <path
            key={i}
            class={FLAG_CLASSES[i % 4]}
            d={`M${x - 6} ${sag} L${x + 6} ${sag} L${x} ${sag + 11} z`}
          />
        );
      })}
    </g>
  );
}

function Wheel({ cx, cy, r, far = false }: { cx: number; cy: number; r: number; far?: boolean }) {
  const cabins = range(8).map((i) => {
    const a = (i * Math.PI) / 4 + 0.2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
  return (
    <g class={far ? "lq-wheel is-far" : "lq-wheel"}>
      <line class="lq-wheel-leg" x1={cx} y1={cy} x2={cx - r * 0.55} y2={cy + r * 1.15} />
      <line class="lq-wheel-leg" x1={cx} y1={cy} x2={cx + r * 0.55} y2={cy + r * 1.15} />
      <circle class="lq-wheel-rim" cx={cx} cy={cy} r={r} />
      {cabins.map(([x, y]) => (
        <line key={`s${x}`} class="lq-wheel-spoke" x1={cx} y1={cy} x2={x} y2={y} />
      ))}
      {cabins.map(([x, y], i) => (
        <rect
          key={`c${x}`}
          class={FLAG_CLASSES[i % 4]}
          x={x - r * 0.11}
          y={y}
          width={r * 0.22}
          height={r * 0.16}
          rx={1.5}
        />
      ))}
      <circle class="lq-wheel-hub" cx={cx} cy={cy} r={Math.max(2, r * 0.07)} />
    </g>
  );
}

function Glass({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path class="lq-glass" d="M-4 -12 L4 -12 L3 0 L-3 0 z" />
      <path class="lq-lemonade" d="M-3.6 -8 L3.6 -8 L3 0 L-3 0 z" />
    </g>
  );
}

function Jug({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path class="lq-glass" d="M-7 -20 L6 -20 L8 0 L-8 0 z" />
      <path class="lq-lemonade" d="M-7.4 -13 L6.6 -13 L8 0 L-8 0 z" />
      <path class="lq-jug-handle" d="M7 -17 q 7 2 1 11" fill="none" />
      <circle class="lq-lemon" cx={-1} cy={-6} r={2.6} />
    </g>
  );
}

function Samosa({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path class="lq-samosa" transform={`translate(${x} ${y}) scale(${s})`} d="M-6 0 L6 0 L0 -9 z" />
  );
}

function CashBox({
  x,
  y,
  s = 1,
  isOpen = false,
}: { x: number; y: number; s?: number; isOpen?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {isOpen ? (
        <path class="lq-box-lid" d="M-20 -16 L20 -16 L24 -34 L-16 -34 z" />
      ) : (
        <rect class="lq-box-handle" x={-6} y={-21} width={12} height={4} rx={2} />
      )}
      <rect class="lq-box" x={-20} y={-17} width={40} height={17} rx={2} />
      <line class="lq-box-seam" x1={-20} y1={-12} x2={20} y2={-12} />
      {isOpen && (
        <g>
          <rect class="lq-note" x={-15} y={-20} width={12} height={6} rx={1} />
          <rect class="lq-note is-b" x={-1} y={-21} width={12} height={6} rx={1} />
        </g>
      )}
    </g>
  );
}

function PriceBoard({ x, y, items }: { x: number; y: number; items: [string, string][] }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line class="lq-pole" x1={0} y1={0} x2={0} y2={46} />
      <rect
        class="lq-board"
        x={-26}
        y={-14 - items.length * 14}
        width={52}
        height={14 + items.length * 14}
        rx={3}
      />
      {items.map(([icon, price], i) => (
        <g key={price} transform={`translate(0 ${-14 - items.length * 14 + 17 + i * 14})`}>
          {icon === "glass" ? <Glass x={-14} y={3} /> : <Samosa x={-14} y={3} s={0.7} />}
          <text class="lq-price" x={6} y={2}>
            {price}
          </text>
        </g>
      ))}
    </g>
  );
}

function Stars({ n = 14 }: { n?: number }) {
  return (
    <g>
      {range(n).map((i) => (
        <circle
          key={i}
          class="lq-star"
          cx={(i * 97 + 23) % W}
          cy={8 + ((i * 53) % 60)}
          r={i % 3 === 0 ? 1.4 : 0.9}
        />
      ))}
    </g>
  );
}

function Pencil({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect class="lq-pencil" x={-1.6} y={-14} width={3.2} height={12} />
      <path class="lq-pencil-tip" d="M-1.6 -2 L1.6 -2 L0 2 z" />
    </g>
  );
}

function Eraser({ x, y }: { x: number; y: number }) {
  return <rect class="lq-eraser" x={x - 3.5} y={y - 6} width={7} height={6} rx={1.2} />;
}

/* ---- the scenes ---- */

function MelaStall(): JSX.Element {
  return (
    <g>
      <rect class="lq-sky" x={0} y={0} width={W} height={124} />
      <Wheel cx={278} cy={66} r={36} far />
      <rect class="lq-ground" x={0} y={124} width={W} height={56} />
      <Bunting y={8} />
      {/* the stall's canopy and posts */}
      <line class="lq-post" x1={58} y1={44} x2={58} y2={150} />
      <line class="lq-post" x1={232} y1={44} x2={232} y2={150} />
      {range(8).map((i) => (
        <rect
          key={i}
          class={i % 2 === 0 ? "lq-awning-a" : "lq-awning-b"}
          x={50 + i * 24}
          y={30}
          width={24}
          height={16}
        />
      ))}
      {range(8).map((i) => (
        <path
          key={`s${i}`}
          class={i % 2 === 0 ? "lq-awning-a" : "lq-awning-b"}
          d={`M${50 + i * 24} 46 q 12 9 24 0 z`}
        />
      ))}
      <Person who="riya" x={108} y={126} s={1.1} />
      <Person who="kabir" x={196} y={126} s={1.15} />
      {/* the table */}
      <rect class="lq-cloth" x={54} y={112} width={182} height={40} rx={2} />
      {range(13).map((i) => (
        <path key={i} class="lq-cloth-edge" d={`M${54 + i * 14} 152 l 7 6 l 7 -6 z`} />
      ))}
      <Jug x={76} y={112} />
      <Glass x={96} y={112} />
      <Glass x={108} y={112} />
      <Glass x={120} y={112} />
      <rect class="lq-tray" x={140} y={108} width={46} height={4} rx={2} />
      <Samosa x={150} y={108} />
      <Samosa x={163} y={108} />
      <Samosa x={176} y={108} />
      <Samosa x={157} y={100} s={0.9} />
      <Samosa x={170} y={100} s={0.9} />
      <CashBox x={222} y={112} s={0.6} />
      <PriceBoard
        x={276}
        y={120}
        items={[
          ["glass", "₹10"],
          ["samosa", "₹15"],
        ]}
      />
    </g>
  );
}

function GiantWheelScene(): JSX.Element {
  return (
    <g>
      <rect class="lq-sky" x={0} y={0} width={W} height={142} />
      <rect class="lq-ground" x={0} y={142} width={W} height={38} />
      <Wheel cx={92} cy={74} r={56} />
      <rect class="lq-board" x={14} y={118} width={28} height={16} rx={3} />
      <text class="lq-price" x={28} y={130} text-anchor="middle">
        ₹3
      </text>
      {/* hoopla: prizes on pegs, a ring in the air */}
      <rect class="lq-cloth" x={196} y={120} width={110} height={24} rx={2} />
      {range(5).map((i) => (
        <g key={i}>
          <line class="lq-peg" x1={208 + i * 22} y1={120} x2={208 + i * 22} y2={110} />
          {i % 2 === 0 ? (
            <circle class={FLAG_CLASSES[i % 4]} cx={208 + i * 22} cy={106} r={5} />
          ) : (
            <rect
              class={FLAG_CLASSES[i % 4]}
              x={203 + i * 22}
              y={100}
              width={10}
              height={9}
              rx={1.5}
            />
          )}
        </g>
      ))}
      <rect class="lq-board" x={276} y={84} width={28} height={16} rx={3} />
      <text class="lq-price" x={290} y={96} text-anchor="middle">
        ₹4
      </text>
      <ellipse class="lq-ring" cx={214} cy={86} rx={8} ry={3.5} />
      <Person who="riya" x={150} y={170} />
      <g>
        <circle class="lq-coin" cx={162} cy={140} r={2.2} />
        <circle class="lq-coin" cx={165} cy={137} r={2.2} />
      </g>
      <Person who="kabir" x={182} y={170} point={[14, -18]} />
    </g>
  );
}

function TwoBills(): JSX.Element {
  const slip = (
    x: number,
    y: number,
    turn: number,
    pencils: number,
    erasers: number,
    total: string,
  ) => (
    <g transform={`translate(${x} ${y}) rotate(${turn})`}>
      <path
        class="lq-slip"
        d="M0 0 H112 V118 l -8 5 l -8 -5 l -8 5 l -8 -5 l -8 5 l -8 -5 l -8 5 l -8 -5 l -8 5 l -8 -5 l -8 5 l -8 -5 l -8 5 l -8 -5 Z"
      />
      <line class="lq-slip-rule" x1={10} y1={18} x2={102} y2={18} />
      {range(pencils).map((i) => (
        <Pencil key={`p${i}`} x={16 + i * 9} y={46} />
      ))}
      {range(erasers).map((i) => (
        <Eraser key={`e${i}`} x={16 + i * 12} y={72} />
      ))}
      <line class="lq-slip-rule" x1={10} y1={86} x2={102} y2={86} />
      <text class="lq-total" x={100} y={108} text-anchor="end">
        {total}
      </text>
    </g>
  );
  return (
    <g>
      <rect class="lq-wood" x={0} y={0} width={W} height={H} />
      {range(6).map((i) => (
        <line key={i} class="lq-wood-grain" x1={0} y1={18 + i * 30} x2={W} y2={22 + i * 30} />
      ))}
      {slip(30, 26, -4, 2, 3, "₹9")}
      {slip(176, 22, 3, 4, 6, "₹18")}
      <g transform="translate(150 160) rotate(-20)">
        <Pencil x={0} y={0} />
      </g>
    </g>
  );
}

function RailTracks(): JSX.Element {
  return (
    <g>
      <rect class="lq-sky" x={0} y={0} width={W} height={80} />
      {/* tents behind the fence */}
      {range(5).map((i) => (
        <path key={i} class={FLAG_CLASSES[i % 4]} d={`M${30 + i * 62} 76 l 22 -30 l 22 30 z`} />
      ))}
      <Wheel cx={300} cy={44} r={20} far />
      <rect class="lq-ground" x={0} y={78} width={W} height={102} />
      {range(17).map((i) => (
        <line key={i} class="lq-fence" x1={i * 20} y1={64} x2={i * 20} y2={84} />
      ))}
      <line class="lq-fence" x1={0} y1={70} x2={W} y2={70} />
      <line class="lq-fence" x1={0} y1={79} x2={W} y2={79} />
      <Person who="riya" x={60} y={92} s={0.85} />
      <Person who="kabir" x={84} y={92} s={0.85} />
      {/* the track from above: sleepers, then two straight rails the same distance apart */}
      <rect class="lq-gravel" x={0} y={104} width={W} height={62} />
      {range(21).map((i) => (
        <rect key={i} class="lq-sleeper" x={2 + i * 16} y={110} width={7} height={50} rx={1} />
      ))}
      <line class="lq-rail" x1={0} y1={120} x2={W} y2={120} />
      <line class="lq-rail" x1={0} y1={150} x2={W} y2={150} />
      {/* an engine coming in from the right, seen from above */}
      <rect class="lq-engine" x={252} y={110} width={80} height={50} rx={10} />
      <rect class="lq-engine-roof" x={262} y={118} width={60} height={34} rx={6} />
      <circle class="lq-lamp" cx={256} cy={135} r={3} />
    </g>
  );
}

function CashBoxLock(): JSX.Element {
  return (
    <g>
      <rect class="lq-dusk" x={0} y={0} width={W} height={124} />
      <Bunting y={6} />
      <rect class="lq-wood" x={0} y={124} width={W} height={56} />
      <g transform="translate(160 126)">
        <rect class="lq-box-handle" x={-14} y={-64} width={28} height={7} rx={3} />
        <rect class="lq-box" x={-52} y={-58} width={104} height={58} rx={4} />
        <line class="lq-box-seam" x1={-52} y1={-44} x2={52} y2={-44} />
        <rect class="lq-lock" x={-22} y={-36} width={44} height={26} rx={4} />
        <rect class="lq-dial" x={-17} y={-32} width={15} height={18} rx={2} />
        <rect class="lq-dial" x={2} y={-32} width={15} height={18} rx={2} />
        <text class="lq-dial-text" x={-9.5} y={-18} text-anchor="middle">
          ?
        </text>
        <text class="lq-dial-text" x={9.5} y={-18} text-anchor="middle">
          ?
        </text>
      </g>
      <Person who="kabir" x={70} y={168} point={[-4, -24]} />
      <Person who="riya" x={252} y={168} />
      <rect class="lq-notebook" x={258} y={128} width={14} height={18} rx={1.5} />
      <line class="lq-notebook-line" x1={261} y1={133} x2={269} y2={133} />
      <line class="lq-notebook-line" x1={261} y1={137} x2={269} y2={137} />
    </g>
  );
}

function BusTickets(): JSX.Element {
  return (
    <g>
      <rect class="lq-sky" x={0} y={0} width={W} height={142} />
      <rect class="lq-road" x={0} y={142} width={W} height={38} />
      <line class="lq-road-line" x1={0} y1={164} x2={W} y2={164} />
      {/* the bus */}
      <rect class="lq-bus" x={14} y={58} width={190} height={78} rx={10} />
      {range(5).map((i) => (
        <rect key={i} class="lq-window" x={24 + i * 30} y={68} width={24} height={26} rx={3} />
      ))}
      <rect class="lq-window" x={176} y={68} width={20} height={56} rx={3} />
      <rect class="lq-bus-stripe" x={14} y={104} width={160} height={6} />
      <circle class="lq-tyre" cx={50} cy={138} r={11} />
      <circle class="lq-tyre" cx={168} cy={138} r={11} />
      {/* the stop sign: near stop and far stop */}
      <line class="lq-pole" x1={232} y1={56} x2={232} y2={150} />
      <rect class="lq-board" x={210} y={40} width={44} height={22} rx={4} />
      <line class="lq-route" x1={218} y1={51} x2={246} y2={51} />
      <circle class="lq-flag-a" cx={222} cy={51} r={4} />
      <circle class="lq-flag-b" cx={244} cy={51} r={4} />
      <Person who="riya" x={268} y={160} point={[10, -10]} />
      {/* two tickets of one colour, three of the other, fanned in Riya's hand */}
      {[0, 1].map((i) => (
        <rect
          key={`a${i}`}
          class="lq-ticket is-a"
          x={276 + i * 3}
          y={120 - i * 2}
          width={9}
          height={12}
          rx={1}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <rect
          key={`b${i}`}
          class="lq-ticket is-b"
          x={284 + i * 3}
          y={124 - i * 2}
          width={9}
          height={12}
          rx={1}
        />
      ))}
      <Person who="kabir" x={300} y={160} />
    </g>
  );
}

function BoatRiver(): JSX.Element {
  return (
    <g>
      <rect class="lq-sky" x={0} y={0} width={W} height={70} />
      {range(7).map((i) => (
        <g key={i}>
          <line class="lq-trunk" x1={20 + i * 48} y1={74} x2={20 + i * 48} y2={58} />
          <circle class="lq-tree" cx={20 + i * 48} cy={52} r={11} />
        </g>
      ))}
      <rect class="lq-bank" x={0} y={66} width={W} height={12} />
      <rect class="lq-water" x={0} y={76} width={W} height={86} />
      {/* the stream flows to the right */}
      {[
        [30, 92],
        [110, 150],
        [250, 96],
        [262, 146],
        [40, 140],
        [190, 88],
      ].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <line class="lq-current" x1={x} y1={y} x2={(x as number) + 30} y2={y} />
          <path
            class="lq-current-head"
            d={`M${(x as number) + 30} ${(y as number) - 3} l 6 3 l -6 3 z`}
          />
        </g>
      ))}
      {/* ripples behind the boat: it is heading left, against the stream */}
      <path class="lq-wake" d="M222 122 q 10 -3 20 0 M228 130 q 10 -3 20 0" fill="none" />
      <g transform="translate(160 124)">
        <Person who="kabir" x={-36} y={2} s={0.8} />
        <Person who="grandpa" x={2} y={2} s={0.85} />
        <Person who="riya" x={38} y={2} s={0.8} />
        <line class="lq-oar" x1={-6} y1={-18} x2={-30} y2={10} />
        <line class="lq-oar" x1={10} y1={-18} x2={34} y2={10} />
        <path class="lq-hull" d="M-66 -6 L58 -6 Q 62 6 48 10 L-46 10 Q -58 6 -66 -6 z" />
      </g>
      <rect class="lq-ground" x={0} y={160} width={W} height={20} />
    </g>
  );
}

function MelaNight(): JSX.Element {
  return (
    <g>
      <rect class="lq-night" x={0} y={0} width={W} height={H} />
      <Stars />
      {[0, 1].map((k) => (
        <g key={k}>
          <path
            class="lq-string"
            d={`M${k * 160} ${18 + k * 6} Q ${k * 160 + 80} ${44 + k * 6} ${k * 160 + 160} ${18 + k * 6}`}
            fill="none"
          />
          {range(9).map((i) => {
            const t = (i + 0.5) / 9;
            const x = k * 160 + 160 * t;
            const y = 18 + k * 6 + 52 * t * (1 - t) + 2; // on the string's curve
            return (
              <g key={i}>
                <circle class="lq-bulb-glow" cx={x} cy={y} r={5} />
                <circle class={FLAG_CLASSES[i % 4]} cx={x} cy={y} r={2.2} />
              </g>
            );
          })}
        </g>
      ))}
      <Person who="grandpa" x={56} y={136} s={1.15} />
      <Person who="mom" x={100} y={136} s={1.15} />
      <Person who="riya" x={238} y={136} s={1.1} />
      <Person who="kabir" x={274} y={136} s={1.2} cheer />
      <rect class="lq-cloth" x={40} y={128} width={240} height={52} rx={3} />
      <CashBox x={160} y={128} s={1} isOpen />
      {range(3).map((i) => (
        <rect key={`n${i}`} class="lq-note" x={114} y={122 - i * 3} width={22} height={9} rx={1} />
      ))}
      {range(4).map((i) => (
        <rect
          key={`m${i}`}
          class="lq-note is-b"
          x={210}
          y={122 - i * 3}
          width={22}
          height={9}
          rx={1}
        />
      ))}
      {range(5).map((i) => (
        <circle key={`c${i}`} class="lq-coin" cx={150 + i * 5} cy={136 - (i % 2) * 2} r={2.6} />
      ))}
    </g>
  );
}

/** A story panel, drawn in its own 320 × 180 units and scaled to the width. */
export function LinearSceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as LinearSceneState;
  const id = useId();
  const k = width / W;
  const height = Math.round((width * H) / W);
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case LinearSceneKind.MelaStall:
        return <MelaStall />;
      case LinearSceneKind.GiantWheel:
        return <GiantWheelScene />;
      case LinearSceneKind.TwoBills:
        return <TwoBills />;
      case LinearSceneKind.RailTracks:
        return <RailTracks />;
      case LinearSceneKind.CashBoxLock:
        return <CashBoxLock />;
      case LinearSceneKind.BusTickets:
        return <BusTickets />;
      case LinearSceneKind.BoatRiver:
        return <BoatRiver />;
      case LinearSceneKind.MelaNight:
        return <MelaNight />;
    }
  })();
  return (
    <div class="lq" data-part="picture">
      <Stage
        label={describeLinearScene(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "lq-svg" }}
      >
        <clipPath id={`lq-${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12 / k} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#lq-${id}-frame)`}>
          {scene}
        </g>
      </Stage>
    </div>
  );
}
