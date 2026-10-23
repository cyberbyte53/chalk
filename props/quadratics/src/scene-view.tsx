import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  QUADRATIC_PICTURE,
  QuadraticSceneKind,
  type QuadraticSceneState,
  describeQuadraticScene,
} from "./scene";

const W = QUADRATIC_PICTURE.width;
const H = QUADRATIC_PICTURE.height;

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
  const shirt = `qs-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="qs-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`qs-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="qs-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="qs-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="qs-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="qs-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -3 -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="qs-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="qs-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="qs-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="qs-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="qs-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="qs-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="qs-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

/** A little bottle rocket, nose at (x, y), tilted by `turn` degrees. */
function Rocket({ x, y, turn = 0, s = 1 }: { x: number; y: number; turn?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${s})`}>
      <path class="qs-rocket" d="M0 0 q 6 6 6 14 v 16 h -12 v -16 q 0 -8 6 -14 z" />
      <path class="qs-fin" d="M-6 22 l -6 10 h 6 z M6 22 l 6 10 h -6 z" />
      <circle class="qs-window" cx={0} cy={13} r={2.6} />
    </g>
  );
}

/** A row of little triangular flags hanging between two points. */
function Bunting({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const n = Math.floor((x2 - x1) / 16);
  return (
    <g>
      <path class="qs-string" d={`M${x1} ${y} q ${(x2 - x1) / 2} 14 ${x2 - x1} 0`} />
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        const px = x1 + t * (x2 - x1);
        const py = y + 14 * 2 * t * (1 - t) * 1.0;
        return (
          <path
            // biome-ignore lint/suspicious/noArrayIndexKey: flags are a fixed row
            key={i}
            class={`qs-flag is-${i % 3}`}
            d={`M${px - 5} ${py} h 10 l -5 9 z`}
          />
        );
      })}
    </g>
  );
}

function Ground({ y = 150 }: { y?: number }) {
  return <rect class="qs-grass" x={0} y={y} width={W} height={H - y} />;
}

function MelaNotice(): JSX.Element {
  return (
    <g>
      <rect class="qs-wall" x={0} y={0} width={W} height={H} />
      <rect class="qs-floor" x={0} y={150} width={W} height={30} />
      <rect class="qs-board" x={92} y={20} width={150} height={104} rx={4} />
      <rect
        class="qs-poster"
        x={104}
        y={28}
        width={86}
        height={88}
        rx={2}
        transform="rotate(-2 147 72)"
      />
      <Bunting x1={108} x2={186} y={36} />
      <text
        class="qs-poster-title"
        x={147}
        y={66}
        text-anchor="middle"
        transform="rotate(-2 147 72)"
      >
        MELA
      </text>
      <rect class="qs-poster-box" x={114} y={76} width={22} height={16} rx={1} />
      <rect class="qs-poster-box" x={140} y={76} width={22} height={16} rx={1} />
      <rect class="qs-poster-box is-ours" x={166} y={76} width={16} height={16} rx={1} />
      <rect
        class="qs-note"
        x={198}
        y={34}
        width={36}
        height={28}
        rx={2}
        transform="rotate(4 216 48)"
      />
      <Rocket x={216} y={70} s={0.8} />
      <Person who="riya" x={70} y={160} s={1.6} point={[18, -18]} />
      <rect class="qs-notebook" x={80} y={106} width={14} height={18} rx={1} />
      <Person who="kabir" x={274} y={160} s={1.5} point={[-26, -36]} />
    </g>
  );
}

function StallPlot(): JSX.Element {
  return (
    <g>
      <rect class="qs-sky" x={0} y={0} width={W} height={H} />
      <rect class="qs-school" x={20} y={20} width={180} height={50} rx={2} />
      {Array.from({ length: 6 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: windows in a row
        <rect key={i} class="qs-window-pane" x={32 + i * 28} y={32} width={16} height={14} rx={1} />
      ))}
      <Ground y={78} />
      {/* the plot chalked on the grass, seen at a slant */}
      <path class="qs-chalk" d="M60 104 L248 98 L278 150 L40 158 Z" />
      <text class="qs-chalk-label" x={160} y={172} text-anchor="middle">
        2x + 1
      </text>
      <text class="qs-chalk-label" x={62} y={134} text-anchor="middle">
        x
      </text>
      <text class="qs-area" x={158} y={132} text-anchor="middle">
        300 m²
      </text>
      <line class="qs-tape" x1={44} y1={160} x2={276} y2={152} />
      <Person who="kabir" x={292} y={154} s={1.4} point={[-14, 8]} />
      <Person who="riya" x={26} y={170} s={1.5} point={[16, 4]} />
    </g>
  );
}

function ToyStall(): JSX.Element {
  return (
    <g>
      <rect class="qs-wall" x={0} y={0} width={W} height={H} />
      <rect class="qs-floor" x={0} y={140} width={W} height={40} />
      <rect class="qs-table" x={40} y={96} width={200} height={14} rx={2} />
      <rect class="qs-table-front" x={46} y={110} width={188} height={40} />
      {Array.from({ length: 8 }, (_, i) => (
        <g
          // biome-ignore lint/suspicious/noArrayIndexKey: toys in a row
          key={i}
          transform={`translate(${58 + i * 23} ${96})`}
        >
          {i % 3 === 0 ? (
            <circle class="qs-toy is-0" cx={0} cy={-7} r={7} />
          ) : i % 3 === 1 ? (
            <rect class="qs-toy is-1" x={-6} y={-14} width={12} height={14} rx={2} />
          ) : (
            <path class="qs-toy is-2" d="M-7 0 l 7 -15 l 7 15 z" />
          )}
        </g>
      ))}
      <g transform="rotate(-8 132 70)">
        <rect class="qs-tag" x={112} y={56} width={40} height={24} rx={3} />
        <text class="qs-tag-text" x={132} y={73} text-anchor="middle">
          ₹ ?
        </text>
      </g>
      <Person who="riya" x={268} y={160} s={1.6} point={[-12, 6]} />
      <rect class="qs-notebook" x={252} y={112} width={16} height={20} rx={1} />
      <Person who="mom" x={22} y={160} s={1.5} point={[14, 2]} />
      <rect class="qs-money" x={34} y={124} width={14} height={8} rx={1} />
    </g>
  );
}

function GrandpaSlate(): JSX.Element {
  return (
    <g>
      <rect class="qs-wall" x={0} y={0} width={W} height={H} />
      <rect class="qs-floor" x={0} y={148} width={W} height={32} />
      <rect class="qs-pillar" x={10} y={0} width={14} height={148} />
      <rect class="qs-pillar" x={296} y={0} width={14} height={148} />
      {/* the slate on Grandpa's knees, with the tiles drawn in chalk */}
      <rect class="qs-slate-frame" x={96} y={52} width={124} height={86} rx={4} />
      <rect class="qs-slate" x={102} y={58} width={112} height={74} rx={2} />
      <g class="qs-chalk-lines">
        <rect x={116} y={66} width={44} height={44} />
        <rect x={160} y={66} width={10} height={44} />
        <rect x={116} y={110} width={44} height={10} />
        <rect class="is-dashed" x={160} y={110} width={10} height={10} />
      </g>
      <text class="qs-slate-text" x={138} y={92} text-anchor="middle">
        x²
      </text>
      <text class="qs-slate-text" x={196} y={96} text-anchor="middle">
        +?
      </text>
      <Person who="grandpa" x={70} y={164} s={1.6} point={[22, -26]} />
      <Person who="riya" x={252} y={160} s={1.5} />
      <Person who="kabir" x={280} y={164} s={1.4} />
    </g>
  );
}

function MarketRide(): JSX.Element {
  return (
    <g>
      <rect class="qs-sky" x={0} y={0} width={W} height={H} />
      <circle class="qs-sun" cx={272} cy={34} r={16} />
      <path class="qs-hill" d="M0 112 q 80 -40 160 0 q 80 -44 160 0 v 20 h -320 z" />
      <rect class="qs-grass" x={0} y={124} width={W} height={56} />
      <rect class="qs-road" x={0} y={140} width={W} height={18} />
      <line class="qs-road-line" x1={0} y1={149} x2={W} y2={149} />
      {/* the milestone */}
      <path class="qs-milestone" d="M262 140 v -26 q 10 -10 20 0 v 26 z" />
      <text class="qs-milestone-text" x={272} y={130} text-anchor="middle">
        12
      </text>
      <text class="qs-milestone-text is-small" x={272} y={137} text-anchor="middle">
        km
      </text>
      {/* the cycle */}
      <g transform="translate(120 0)">
        <circle class="qs-wheel" cx={0} cy={140} r={13} />
        <circle class="qs-wheel" cx={46} cy={140} r={13} />
        <path
          class="qs-frame"
          d="M0 140 L18 116 L40 116 L46 140 M18 116 L24 140 L40 116 M18 116 l -4 -8 M40 116 l 2 -10 h 6"
        />
        <rect class="qs-box" x={-14} y={100} width={22} height={16} rx={1} />
        <Person who="riya" x={24} y={126} s={1.25} point={[16, -6]} />
      </g>
      <path class="qs-speed" d="M80 112 h -24 M86 122 h -30 M80 132 h -22" />
    </g>
  );
}

function RocketLaunch(): JSX.Element {
  // The path h = 20t − 5t², drawn as a parabola over the ground from x = 70 to x = 270.
  const x0 = 70;
  const x1 = 270;
  const top = 26;
  const ground = 150;
  const at = (t: number) => {
    const x = x0 + (t / 4) * (x1 - x0);
    const h = 20 * t - 5 * t * t;
    return [x, ground - (h / 20) * (ground - top)] as const;
  };
  const pts = Array.from({ length: 33 }, (_, i) => at((i / 32) * 4));
  const d = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const [rx, ry] = at(1.2);
  const y15 = ground - (15 / 20) * (ground - top);
  return (
    <g>
      <rect class="qs-sky" x={0} y={0} width={W} height={H} />
      <Ground y={ground} />
      <path class="qs-arc" d={d} />
      <line class="qs-height" x1={20} y1={y15} x2={300} y2={y15} />
      <text class="qs-height-text" x={300} y={y15 - 4} text-anchor="end">
        15 m
      </text>
      <Rocket x={rx} y={ry} turn={22} s={0.9} />
      <path
        class="qs-spray"
        d={`M${rx - 6} ${ry + 30} q -6 8 -14 10 M${rx - 2} ${ry + 32} q -2 9 -9 14`}
      />
      {/* the launcher */}
      <path class="qs-launcher" d={`M${x0 - 8} ${ground} l 8 -16 l 8 16 z`} />
      <Person who="kabir" x={40} y={ground + 10} s={1.4} point={[18, -10]} />
      <Person who="riya" x={292} y={ground + 12} s={1.5} point={[-12, -10]} />
      <circle class="qs-stopwatch" cx={278} cy={ground - 22} r={5} />
    </g>
  );
}

function MelaDay(): JSX.Element {
  return (
    <g>
      <rect class="qs-sky" x={0} y={0} width={W} height={H} />
      <Ground y={126} />
      <Bunting x1={0} x2={W} y={10} />
      {/* the stall */}
      <rect class="qs-stall-roof" x={70} y={30} width={180} height={18} rx={2} />
      <rect class="qs-banner" x={120} y={33} width={80} height={12} rx={1} />
      <text class="qs-banner-text" x={160} y={43} text-anchor="middle">
        10B
      </text>
      <line class="qs-pole" x1={76} y1={48} x2={76} y2={128} />
      <line class="qs-pole" x1={244} y1={48} x2={244} y2={128} />
      <rect class="qs-table" x={80} y={102} width={160} height={10} rx={2} />
      <rect class="qs-table-front" x={86} y={112} width={148} height={20} />
      {Array.from({ length: 6 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: toys in a row
        <circle key={i} class={`qs-toy is-${i % 3}`} cx={98 + i * 25} cy={96} r={6} />
      ))}
      <Rocket x={286} y={18} turn={8} s={0.7} />
      <path class="qs-arc is-faint" d="M262 126 q 14 -90 30 -100" />
      <Person who="riya" x={140} y={100} s={1.2} />
      <Person who="mom" x={36} y={166} s={1.5} back />
      <Person who="grandpa" x={196} y={170} s={1.5} back />
      <Person who="kabir" x={284} y={170} s={1.4} back point={[4, -26]} />
      {[40, 70, 230, 255].map((x) => (
        <circle key={x} class="qs-crowd" cx={x} cy={150} r={7} />
      ))}
    </g>
  );
}

export function QuadraticSceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as QuadraticSceneState;
  const id = useId();
  const k = width / W;
  const height = Math.round((width * H) / W);
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case QuadraticSceneKind.MelaNotice:
        return <MelaNotice />;
      case QuadraticSceneKind.StallPlot:
        return <StallPlot />;
      case QuadraticSceneKind.ToyStall:
        return <ToyStall />;
      case QuadraticSceneKind.GrandpaSlate:
        return <GrandpaSlate />;
      case QuadraticSceneKind.MarketRide:
        return <MarketRide />;
      case QuadraticSceneKind.RocketLaunch:
        return <RocketLaunch />;
      case QuadraticSceneKind.MelaDay:
        return <MelaDay />;
    }
  })();
  return (
    <div class="qs" data-part="picture">
      <Stage
        label={describeQuadraticScene(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "qs-svg" }}
      >
        <clipPath id={`qs-${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12 / k} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#qs-${id}-frame)`}>
          {scene}
        </g>
      </Stage>
    </div>
  );
}
