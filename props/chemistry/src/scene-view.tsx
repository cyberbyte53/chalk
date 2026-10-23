import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  CHEMISTRY_PICTURE,
  ChemistrySceneKind,
  type ChemistrySceneState,
  describeChemistryScene,
} from "./scene";
import { range } from "./words";

const W = CHEMISTRY_PICTURE.width;
const H = CHEMISTRY_PICTURE.height;

type Who = "riya" | "kabir" | "grandpa" | "mom";

/** A person (the same family as the light chapter): feet at (x, y), `s` the scale. */
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
  const shirt = `cs-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="cs-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`cs-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="cs-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="cs-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="cs-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="cs-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -3 -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="cs-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="cs-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="cs-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="cs-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="cs-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="cs-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="cs-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

/** A clay diya at (x, y), lit or not. */
function Diya({
  x,
  y,
  s = 1,
  lit = true,
  green = false,
}: { x: number; y: number; s?: number; lit?: boolean; green?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {lit && <circle class="cs-diya-glow" cx={0} cy={-9} r={9} />}
      {lit && <path class="cs-diya-flame" d="M0 -14 q 4 5 2 8 q -2 2 -4 0 q -2 -3 2 -8 z" />}
      <path
        class={green ? "cs-diya is-copper" : "cs-diya"}
        d="M-9 -4 q 9 9 18 0 l -2 -2 q -7 3 -14 0 z"
      />
      {green && <path class="cs-patina" d="M-6 -2 q 3 2 5 0 M2 -1 q 2 1 4 -1" />}
    </g>
  );
}

function Spark({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g class="cs-sparks">
      {range(10).map((i) => {
        const a = (i / 10) * Math.PI * 2 + 0.3;
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * r * 0.35}
            y1={y + Math.sin(a) * r * 0.35}
            x2={x + Math.cos(a) * r}
            y2={y + Math.sin(a) * r}
          />
        );
      })}
    </g>
  );
}

function Floor({ y = 150 }: { y?: number }) {
  return <rect class="cs-floor" x={0} y={y} width={W} height={H - y} />;
}

function DiwaliList(): JSX.Element {
  return (
    <g>
      <rect class="cs-wall" x={0} y={0} width={W} height={H} />
      <Floor y={158} />
      <rect class="cs-fridge" x={150} y={18} width={84} height={140} rx={8} />
      <line class="cs-fridge-line" x1={150} y1={70} x2={234} y2={70} />
      <rect class="cs-handle" x={224} y={34} width={4} height={22} rx={2} />
      <rect class="cs-handle" x={224} y={82} width={4} height={30} rx={2} />
      {/* the list: an icon per errand, then a scribble */}
      <g transform="rotate(-3 186 92)">
        <rect class="cs-paper" x={160} y={34} width={52} height={110} rx={2} />
        <circle class="cs-magnet" cx={186} cy={36} r={3.5} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect class="cs-tick-box" x={165} y={48 + i * 19} width={7} height={7} rx={1} />
            <line
              class="cs-scribble"
              x1={176}
              y1={52 + i * 19}
              x2={206 - (i % 2) * 8}
              y2={52 + i * 19}
            />
          </g>
        ))}
        <rect class="cs-icon-lime" x={196} y={45} width={10} height={7} rx={1} />
        <path class="cs-icon-rust" d="M197 64 v8 m4 -8 v8 m4 -8 v8" />
        <circle class="cs-icon-silver" cx={201} cy={88} r={3.5} />
        <path class="cs-icon-chips" d="M196 104 h10 l -1 8 h-8 z" />
        <path
          class="cs-icon-spark"
          d="M201 123 l 2 3 l 3 -1 l -2 3 l 2 3 l -3 -1 l -2 3 l -1 -3 l -3 1 l 2 -3 l -2 -3 l 3 1 z"
        />
      </g>
      <Person who="riya" x={92} y={160} s={1.7} point={[30, -26]} />
      <Person who="kabir" x={128} y={160} s={1.6} />
      <Diya x={40} y={60} s={1.1} lit={false} />
      <rect class="cs-shelf" x={18} y={60} width={50} height={4} rx={1} />
    </g>
  );
}

function Whitewash(): JSX.Element {
  return (
    <g>
      <rect class="cs-wall-old" x={0} y={0} width={W} height={150} />
      <rect class="cs-wall-white" x={0} y={0} width={176} height={150} />
      <path class="cs-wet-edge" d="M176 0 q -6 30 2 60 q 6 30 -4 60 q -3 18 2 30" />
      <Floor y={150} />
      {/* Riya on a stool with a long brush */}
      <rect class="cs-stool" x={112} y={128} width={34} height={6} rx={2} />
      <line class="cs-stool-leg" x1={116} y1={134} x2={114} y2={150} />
      <line class="cs-stool-leg" x1={142} y1={134} x2={144} y2={150} />
      <Person who="riya" x={128} y={128} s={1.6} point={[22, -30]} />
      <line class="cs-brush-stick" x1={140} y1={78} x2={168} y2={36} />
      <rect
        class="cs-brush"
        x={164}
        y={26}
        width={14}
        height={10}
        rx={2}
        transform="rotate(-34 171 31)"
      />
      {/* the bucket of lime and water, fizzing */}
      <path class="cs-bucket" d="M232 112 h50 l -5 40 h-40 z" />
      <ellipse class="cs-lime-milk" cx={257} cy={113} rx={24} ry={5} />
      {[0, 1, 2].map((i) => (
        <path key={i} class="cs-steam" d={`M${246 + i * 10} 104 q -6 -10 0 -18 q 6 -8 0 -16`} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} class="cs-fizz" cx={244 + i * 9} cy={110 - (i % 2) * 3} r={1.8} />
      ))}
      <Person who="kabir" x={300} y={156} s={1.4} />
      <path class="cs-heat-lines" d="M284 92 q 3 -4 0 -8 M291 96 q 3 -4 0 -8" />
    </g>
  );
}

function RustyGate(): JSX.Element {
  return (
    <g>
      <rect class="cs-sky" x={0} y={0} width={W} height={H} />
      <rect class="cs-ground" x={0} y={150} width={W} height={30} />
      <rect class="cs-pillar" x={40} y={30} width={22} height={120} />
      <rect class="cs-pillar" x={240} y={30} width={22} height={120} />
      <g class="cs-gate">
        <line x1={62} y1={50} x2={240} y2={50} />
        <line x1={62} y1={136} x2={240} y2={136} />
        {range(9).map((i) => (
          <line key={i} x1={74 + i * 19.5} y1={42} x2={74 + i * 19.5} y2={144} />
        ))}
      </g>
      <g class="cs-rust">
        {[
          [80, 70, 5],
          [94, 110, 4],
          [132, 60, 6],
          [152, 126, 5],
          [170, 88, 4],
          [210, 70, 6],
          [228, 120, 5],
          [114, 136, 7],
          [190, 50, 6],
        ].map(([x, y, r]) => (
          <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={(r as number) * 0.8} ry={r} />
        ))}
      </g>
      <g class="cs-flakes">
        {[118, 146, 196].map((x) => (
          <rect key={x} x={x} y={152 + (x % 5)} width={3} height={2} rx={0.5} />
        ))}
      </g>
      <Person who="grandpa" x={286} y={160} s={1.5} point={[-14, 4]} />
      <rect class="cs-paint-tin" x={266} y={132} width={14} height={14} rx={2} />
    </g>
  );
}

function TarnishedSilver(): JSX.Element {
  return (
    <g>
      <rect class="cs-wall" x={0} y={0} width={W} height={H} />
      <Person who="mom" x={286} y={130} s={1.5} />
      <rect class="cs-table" x={0} y={110} width={W} height={70} />
      <ellipse class="cs-cloth" cx={150} cy={138} rx={120} ry={26} />
      {/* two anklets: silver chains with black patches */}
      {[90, 150].map((cx) => (
        <g key={cx}>
          <ellipse class="cs-anklet" cx={cx} cy={138} rx={24} ry={10} />
          <path
            class="cs-tarnish"
            d={`M${cx - 20} ${134} q 6 -5 12 -4 M${cx + 6} ${147} q 8 -1 14 -6`}
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              class="cs-bell"
              cx={cx - 18 + i * 9}
              cy={148 - Math.abs(i - 2) * 2}
              r={1.8}
            />
          ))}
        </g>
      ))}
      <Diya x={214} y={142} s={1.6} lit={false} green />
      <Diya x={246} y={136} s={1.4} lit={false} green />
    </g>
  );
}

function NamkeenStale(): JSX.Element {
  return (
    <g>
      <rect class="cs-wall" x={0} y={0} width={W} height={H} />
      <rect class="cs-table" x={0} y={130} width={W} height={50} />
      {/* an open jar, stale */}
      <path class="cs-jar" d="M60 70 h60 v60 q 0 8 -8 8 h-44 q -8 0 -8 -8 z" />
      <rect
        class="cs-jar-lid"
        x={112}
        y={52}
        width={34}
        height={8}
        rx={3}
        transform="rotate(28 129 56)"
      />
      {range(16).map((i) => (
        <circle
          key={i}
          class="cs-namkeen"
          cx={68 + (i % 8) * 6.6}
          cy={126 - Math.floor(i / 8) * 7 - (i % 3)}
          r={3}
        />
      ))}
      <path
        class="cs-smell"
        d="M76 64 q -6 -8 0 -16 q 6 -8 0 -16 M96 62 q -6 -8 0 -16 q 6 -8 0 -16"
      />
      {/* a sealed chips packet, puffed with nitrogen */}
      <path
        class="cs-packet"
        d="M196 46 q 40 -10 80 0 l -4 10 q 8 40 0 70 l 4 10 q -40 10 -80 0 l 4 -10 q -8 -30 0 -70 z"
      />
      <path class="cs-packet-band" d="M202 80 q 34 -6 68 0 v14 q -34 6 -68 0 z" />
      <path
        class="cs-crimp"
        d="M198 50 l 4 -4 l 4 4 l 4 -4 l 4 4 l 4 -4 l 4 4 M198 128 l 4 4 l 4 -4 l 4 4 l 4 -4 l 4 4 l 4 -4"
      />
      <text class="cs-n2" x={236} y={72} text-anchor="middle">
        N₂
      </text>
    </g>
  );
}

function SparklerNight({ clip }: { clip: string }): JSX.Element {
  return (
    <g>
      <rect class="cs-night" x={0} y={0} width={W} height={H} />
      <circle class="cs-star" cx={40} cy={24} r={1.4} />
      <circle class="cs-star" cx={270} cy={40} r={1.4} />
      <circle class="cs-star" cx={210} cy={18} r={1.1} />
      <rect class="cs-parapet" x={0} y={136} width={W} height={44} />
      <clipPath id={clip}>
        <rect x={0} y={0} width={W} height={H} />
      </clipPath>
      <radialGradient id={`${clip}-glow`}>
        <stop class="cs-glow-in" offset="0" />
        <stop class="cs-glow-mid" offset="0.35" />
        <stop class="cs-glow-out" offset="1" />
      </radialGradient>
      <g clip-path={`url(#${clip})`}>
        <circle cx={204} cy={58} r={52} fill={`url(#${clip}-glow)`} />
        <circle class="cs-spark-core" cx={204} cy={58} r={9} />
        <Spark x={204} y={58} r={34} />
      </g>
      <line class="cs-sparkler-wire" x1={204} y1={58} x2={168} y2={104} />
      <Person who="riya" x={150} y={156} s={1.8} point={[16, -22]} />
    </g>
  );
}

function DiwaliNight(): JSX.Element {
  return (
    <g>
      <rect class="cs-night" x={0} y={0} width={W} height={H} />
      {/* the house: shiny white walls */}
      <path class="cs-roof" d="M50 54 L160 14 L270 54 Z" />
      <rect class="cs-house" x={62} y={54} width={196} height={96} />
      <path class="cs-shine" d="M76 62 l 20 0 M76 68 l 12 0 M232 62 l 16 0" />
      <rect class="cs-door" x={140} y={92} width={40} height={58} rx={3} />
      <rect class="cs-window" x={84} y={74} width={34} height={28} rx={2} />
      <rect class="cs-window" x={202} y={74} width={34} height={28} rx={2} />
      {/* the gate, freshly painted */}
      <g class="cs-gate-new">
        <line x1={6} y1={128} x2={50} y2={128} />
        {[10, 20, 30, 40].map((x) => (
          <line key={x} x1={x} y1={118} x2={x} y2={156} />
        ))}
      </g>
      <rect class="cs-ground-night" x={0} y={150} width={W} height={30} />
      {/* diyas along the edge */}
      {[70, 96, 122, 198, 224, 250].map((x) => (
        <Diya key={x} x={x} y={152} />
      ))}
      {/* rangoli */}
      <g class="cs-rangoli">
        <circle cx={160} cy={166} r={11} />
        <circle cx={160} cy={166} r={6} />
        <circle cx={160} cy={166} r={2} />
      </g>
      <Person who="grandpa" x={286} y={170} s={1.2} />
      <Person who="mom" x={304} y={170} s={1.2} />
      <Person who="kabir" x={30} y={172} s={1.2} point={[8, -16]} />
      <circle class="cs-spark-glow" cx={44} cy={128} r={10} />
      <Spark x={44} y={128} r={9} />
    </g>
  );
}

/** A story panel, drawn in its own 320 × 180 units and scaled to the width. */
export function ChemistrySceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as ChemistrySceneState;
  const id = useId();
  const k = width / W;
  const height = Math.round((width * H) / W);
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case ChemistrySceneKind.DiwaliList:
        return <DiwaliList />;
      case ChemistrySceneKind.Whitewash:
        return <Whitewash />;
      case ChemistrySceneKind.RustyGate:
        return <RustyGate />;
      case ChemistrySceneKind.TarnishedSilver:
        return <TarnishedSilver />;
      case ChemistrySceneKind.NamkeenStale:
        return <NamkeenStale />;
      case ChemistrySceneKind.Sparkler:
        return <SparklerNight clip={`cs-${id}-spark`} />;
      case ChemistrySceneKind.DiwaliNight:
        return <DiwaliNight />;
    }
  })();
  return (
    <div class="cs" data-part="picture">
      <Stage
        label={describeChemistryScene(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "cs-svg" }}
      >
        <clipPath id={`cs-${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12 / k} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#cs-${id}-frame)`}>
          {scene}
        </g>
      </Stage>
    </div>
  );
}
