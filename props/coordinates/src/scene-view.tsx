import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import { type Words, say } from "@chalk/prop-circles/kit";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  COORDINATES_PICTURE,
  CoordinatesSceneKind,
  type CoordinatesSceneState,
  describeCoordinatesScene,
} from "./scene";

const W = COORDINATES_PICTURE.width;
const H = COORDINATES_PICTURE.height;

export const COORDINATES_SCENE_WORDS = {
  gate: { en: "gate", hi: "गेट" },
  banyan: { en: "banyan", hi: "बरगद" },
  swing: { en: "swing", hi: "झूला" },
  slide: { en: "slide", hi: "फिसलपट्टी" },
  clue: { en: "CLUE", hi: "सुराग" },
  mulch: { en: "MULCH", hi: "खाद" },
  part: { en: "1 part", hi: "1 भाग" },
  parts: { en: "2 parts", hi: "2 भाग" },
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
  const shirt = `cos-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="cos-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`cos-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="cos-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="cos-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="cos-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="cos-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -3 -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="cos-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="cos-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="cos-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="cos-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="cos-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="cos-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="cos-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

function Grass(): JSX.Element {
  return <rect class="cos-grass" x={0} y={0} width={W} height={H} />;
}

function Indoor({ floor = 132 }: { floor?: number }): JSX.Element {
  return (
    <g>
      <rect class="cos-wall" x={0} y={0} width={W} height={floor} />
      <rect class="cos-floor" x={0} y={floor} width={W} height={H - floor} />
    </g>
  );
}

function Label({
  x,
  y,
  text,
  small = false,
  anchor = "middle",
}: { x: number; y: number; text: string; small?: boolean; anchor?: string }) {
  return (
    <text class={`cos-label${small ? " is-small" : ""}`} x={x} y={y} text-anchor={anchor}>
      {text}
    </text>
  );
}

/** A tree seen from above or the side: a round crown on a short trunk. */
function Tree({ x, y, r = 18 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <rect class="cos-trunk" x={x - 3} y={y} width={6} height={r * 0.7} rx={2} />
      <circle class="cos-crown" cx={x} cy={y - r * 0.3} r={r} />
      <circle class="cos-crown-light" cx={x - r * 0.35} cy={y - r * 0.6} r={r * 0.45} />
    </g>
  );
}

/** A small flag on a pole, its foot at (x, y). */
function Flag({ x, y, tone = 1 }: { x: number; y: number; tone?: 1 | 2 | 3 }) {
  return (
    <g>
      <line class="cos-pole" x1={x} y1={y} x2={x} y2={y - 18} />
      <path class={`cos-flag is-${tone}`} d={`M${x} ${y - 18} l11 3.5 l-11 3.5 z`} />
    </g>
  );
}

function ParkMap({ locale }: { locale: string }): JSX.Element {
  const ox = 160;
  const oy = 122;
  const k = 9;
  const dot = (gx: number, gy: number) => [ox + gx * k, oy - gy * k] as const;
  const [sx, sy] = dot(6, 5);
  const [lx, ly] = dot(-4, 3);
  const [bx, by] = dot(8, 9);
  return (
    <g>
      <Indoor floor={140} />
      <rect class="cos-table" x={40} y={128} width={240} height={14} rx={3} />
      <rect class="cos-paper" x={78} y={18} width={164} height={116} rx={2} />
      {Array.from({ length: 19 }, (_, i) => (
        <line
          key={79 + i * k}
          class="cos-gridline"
          x1={79 + i * k}
          y1={19}
          x2={79 + i * k}
          y2={133}
        />
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <line
          key={133 - i * k}
          class="cos-gridline"
          x1={79}
          y1={133 - i * k}
          x2={241}
          y2={133 - i * k}
        />
      ))}
      <line class="cos-axis" x1={80} y1={oy} x2={240} y2={oy} />
      <line class="cos-axis" x1={ox} y1={132} x2={ox} y2={20} />
      <circle class="cos-origin" cx={ox} cy={oy} r={3} />
      <Label x={ox - 6} y={oy + 10} text="O" small anchor="end" />
      <circle class="cos-dot is-1" cx={sx} cy={sy} r={3.2} />
      <circle class="cos-dot is-2" cx={lx} cy={ly} r={3.2} />
      <circle class="cos-dot is-3" cx={bx} cy={by} r={3.2} />
      <Label
        x={sx + 5}
        y={sy - 4}
        text={say(locale, COORDINATES_SCENE_WORDS.swing)}
        small
        anchor="start"
      />
      <Label
        x={lx - 5}
        y={ly - 4}
        text={say(locale, COORDINATES_SCENE_WORDS.slide)}
        small
        anchor="end"
      />
      <Label
        x={bx - 5}
        y={by - 4}
        text={say(locale, COORDINATES_SCENE_WORDS.banyan)}
        small
        anchor="end"
      />
      <Person who="grandpa" x={44} y={164} point={[18, -8]} />
      <Person who="riya" x={270} y={164} point={[-16, -10]} />
      <Person who="kabir" x={300} y={164} />
      <g>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            class="cos-card"
            x={252 + i * 3}
            y={118 - i * 3}
            width={22}
            height={14}
            rx={2}
          />
        ))}
      </g>
    </g>
  );
}

function CrowFlies({ locale }: { locale: string }): JSX.Element {
  const gx = 40;
  const gy = 160;
  const tx = 268;
  const ty = 62;
  return (
    <g>
      <Grass />
      <rect class="cos-wallstrip" x={0} y={166} width={W} height={14} />
      <rect class="cos-gate" x={gx - 10} y={163} width={20} height={8} rx={2} />
      <Label x={gx} y={153} text={say(locale, COORDINATES_SCENE_WORDS.gate)} small />
      <Tree x={tx} y={ty} r={20} />
      <path class="cos-steps" d={`M${gx} ${gy} L${tx} ${gy} L${tx} ${ty + 16}`} />
      <Label x={(gx + tx) / 2} y={gy - 6} text="36 m" small />
      <Label x={tx + 8} y={(gy + ty) / 2 + 20} text="15 m" small anchor="start" />
      <line class="cos-crowline" x1={gx} y1={gy} x2={tx - 6} y2={ty + 14} />
      <Label x={(gx + tx) / 2 - 12} y={(gy + ty) / 2 + 2} text="?" />
      <path class="cos-crow" d="M150 96 q8 -8 14 0 q6 -8 14 0 q-7 -2 -14 3 q-7 -5 -14 -3 z" />
      <Person who="kabir" x={tx - 22} y={gy - 4} s={0.8} />
      <Person who="riya" x={gx + 22} y={gy - 4} s={0.8} point={[14, -14]} />
    </g>
  );
}

function ClueStones({ locale }: { locale: string }): JSX.Element {
  const stones: [number, number][] = [
    [70, 150],
    [150, 110],
    [203, 83.5],
  ];
  return (
    <g>
      <Grass />
      <line class="cos-crowline" x1={40} y1={165} x2={260} y2={55} />
      {stones.map(([x, y], i) => (
        <g key={x}>
          <ellipse class="cos-stone" cx={x} cy={y} rx={12} ry={7} />
          <text class="cos-label is-small" x={x} y={y + 3.5} text-anchor="middle">
            {i + 1}
          </text>
        </g>
      ))}
      <Label x={110} y={20} text={say(locale, COORDINATES_SCENE_WORDS.clue)} />
      <Person who="kabir" x={230} y={110} point={[-14, 6]} />
      <Person who="riya" x={70} y={100} />
      <rect class="cos-paper" x={84} y={56} width={22} height={16} rx={1} />
    </g>
  );
}

function HalfwayClue({ locale }: { locale: string }): JSX.Element {
  const ax = 40;
  const ay = 160;
  const bx = 268;
  const by = 66;
  const fx = ax + (bx - ax) / 3;
  const fy = ay + (by - ay) / 3;
  return (
    <g>
      <Grass />
      <line class="cos-path" x1={ax} y1={ay} x2={bx} y2={by} />
      {[1, 2].map((i) => (
        <circle
          key={i}
          class="cos-tick"
          cx={ax + ((bx - ax) * i) / 3}
          cy={ay + ((by - ay) * i) / 3}
          r={2.5}
        />
      ))}
      <rect class="cos-gate" x={ax - 10} y={ay + 2} width={20} height={8} rx={2} />
      <Label x={ax} y={ay + 18} text={say(locale, COORDINATES_SCENE_WORDS.gate)} small />
      <Tree x={bx} y={by - 8} r={20} />
      <Flag x={fx} y={fy} tone={2} />
      <Label
        x={(ax + fx) / 2 + 8}
        y={(ay + fy) / 2 + 14}
        text={say(locale, COORDINATES_SCENE_WORDS.part)}
        small
      />
      <Label
        x={(fx + bx) / 2 + 10}
        y={(fy + by) / 2 + 16}
        text={say(locale, COORDINATES_SCENE_WORDS.parts)}
        small
      />
      <Person who="kabir" x={fx - 18} y={fy + 10} point={[14, -6]} />
    </g>
  );
}

function FlowerBed(): JSX.Element {
  const a: [number, number] = [70, 140];
  const b: [number, number] = [200, 140];
  const c: [number, number] = [250, 70];
  const d: [number, number] = [120, 70];
  return (
    <g>
      <Grass />
      <path
        class="cos-bed"
        d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]} L${d[0]} ${d[1]} Z`}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} class="cos-flower" cx={110 + i * 22} cy={110 - (i % 2) * 14} r={4} />
      ))}
      <Flag x={a[0]} y={a[1]} tone={1} />
      <Flag x={b[0]} y={b[1]} tone={1} />
      <Flag x={c[0]} y={c[1]} tone={1} />
      <text class="cos-question" x={d[0]} y={d[1] - 4} text-anchor="middle">
        ?
      </text>
      <Person who="riya" x={30} y={170} point={[14, -10]} />
      <Person who="kabir" x={290} y={170} />
      <rect class="cos-card" x={296} y={128} width={16} height={11} rx={1.5} />
    </g>
  );
}

function HerbPatch({ locale }: { locale: string }): JSX.Element {
  const p = [
    [80, 150],
    [230, 128],
    [140, 60],
  ] as const;
  return (
    <g>
      <Grass />
      <path
        class="cos-soil"
        d={`M${p[0][0]} ${p[0][1]} L${p[1][0]} ${p[1][1]} L${p[2][0]} ${p[2][1]} Z`}
      />
      <path
        class="cos-string"
        d={`M${p[0][0]} ${p[0][1]} L${p[1][0]} ${p[1][1]} L${p[2][0]} ${p[2][1]} Z`}
      />
      {p.map(([x, y]) => (
        <rect key={x} class="cos-peg" x={x - 2} y={y - 10} width={4} height={12} rx={1} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          class="cos-leaf"
          d={`M${125 + i * 16} ${120 - (i % 2) * 12} q4 -10 8 0 q-4 4 -8 0 z`}
        />
      ))}
      <rect class="cos-bag" x={250} y={140} width={30} height={26} rx={4} />
      <Label x={265} y={157} text={say(locale, COORDINATES_SCENE_WORDS.mulch)} small />
      <Person who="mom" x={210} y={172} s={0.95} point={[-14, -4]} />
      <Person who="kabir" x={40} y={110} />
      <rect class="cos-paper" x={52} y={78} width={20} height={14} rx={1} />
    </g>
  );
}

function HuntDay(): JSX.Element {
  return (
    <g>
      <Grass />
      <path class="cos-crowline" d="M70 70 L250 60 L170 150 Z" />
      <Tree x={250} y={52} r={16} />
      <rect class="cos-swing" x={58} y={50} width={24} height={24} rx={2} />
      <path class="cos-slide" d="M160 150 l20 -14 l14 0 l-6 14 z" />
      <rect class="cos-chest" x={150} y={84} width={28} height={18} rx={3} />
      <rect class="cos-chest-lid" x={148} y={78} width={32} height={8} rx={3} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} class="cos-sparkle" cx={146 + i * 12} cy={70 - (i % 2) * 6} r={1.8} />
      ))}
      <Person who="riya" x={110} y={128} s={0.9} />
      <Person who="kabir" x={216} y={124} s={0.9} />
      <Person who="mom" x={24} y={172} back />
      <Person who="grandpa" x={296} y={172} back />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          class={`cos-flag is-${(i % 3) + 1}`}
          d={`M${100 + i * 26} 8 l10 0 l-5 10 z`}
        />
      ))}
    </g>
  );
}

export function CoordinatesSceneView({ view, width, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as CoordinatesSceneState;
  const id = useId();
  const k = width / W;
  const height = Math.round((width * H) / W);
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case CoordinatesSceneKind.ParkMap:
        return <ParkMap locale={locale} />;
      case CoordinatesSceneKind.CrowFlies:
        return <CrowFlies locale={locale} />;
      case CoordinatesSceneKind.ClueStones:
        return <ClueStones locale={locale} />;
      case CoordinatesSceneKind.HalfwayClue:
        return <HalfwayClue locale={locale} />;
      case CoordinatesSceneKind.FlowerBed:
        return <FlowerBed />;
      case CoordinatesSceneKind.HerbPatch:
        return <HerbPatch locale={locale} />;
      case CoordinatesSceneKind.HuntDay:
        return <HuntDay />;
    }
  })();
  return (
    <div class="cos" data-part="picture">
      <Stage
        label={describeCoordinatesScene(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "cos-svg" }}
      >
        <clipPath id={`cos-${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12 / k} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#cos-${id}-frame)`}>
          {scene}
        </g>
      </Stage>
    </div>
  );
}
