import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  TRIG_PICTURE,
  TrigSceneKind,
  TrigScenePart,
  type TrigSceneState,
  describeTrigScene,
} from "./scene";

const W = TRIG_PICTURE.width;
const H = TRIG_PICTURE.height;

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
  const shirt = `trs-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="trs-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`trs-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="trs-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="trs-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="trs-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="trs-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -3 -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="trs-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="trs-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="trs-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="trs-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="trs-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="trs-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="trs-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

function Outside({
  ground = 150,
  sunset = false,
}: { ground?: number; sunset?: boolean }): JSX.Element {
  return (
    <g>
      <rect class={sunset ? "trs-sunset" : "trs-sky"} x={0} y={0} width={W} height={ground} />
      <rect class="trs-grass" x={0} y={ground} width={W} height={H - ground} />
    </g>
  );
}

/** The fort's watch-tower: foot at (x, ground), top at y = top. */
function Tower({
  x,
  ground,
  top,
  w = 34,
}: { x: number; ground: number; top: number; w?: number }): JSX.Element {
  const merlons = 4;
  const mw = w / (2 * merlons - 1);
  return (
    <g>
      <path
        class="trs-stone"
        d={`M${x - w / 2 - 4} ${ground} L${x - w / 2} ${top} L${x + w / 2} ${top} L${x + w / 2 + 4} ${ground} Z`}
      />
      {Array.from({ length: merlons }, (_, i) => (
        <rect
          key={`m${x - w / 2 + i * 2 * mw}`}
          class="trs-stone"
          x={x - w / 2 + i * 2 * mw}
          y={top - 6}
          width={mw}
          height={6}
        />
      ))}
      <rect class="trs-window" x={x - 3} y={top + 14} width={6} height={10} rx={3} />
      <rect class="trs-window" x={x - 3} y={(top + ground) / 2} width={6} height={10} rx={3} />
    </g>
  );
}

/** The fort wall along the hill top. */
function Wall({
  x1,
  x2,
  y,
  h = 26,
}: { x1: number; x2: number; y: number; h?: number }): JSX.Element {
  const n = Math.floor((x2 - x1) / 14);
  return (
    <g>
      <rect class="trs-stone" x={x1} y={y - h} width={x2 - x1} height={h} />
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={`w${x1 + i * 14}`}
          class="trs-stone"
          x={x1 + i * 14 + 2}
          y={y - h - 5}
          width={7}
          height={5}
        />
      ))}
    </g>
  );
}

function Kite({
  x,
  y,
  s = 1,
  tone = 1,
}: { x: number; y: number; s?: number; tone?: 1 | 2 | 3 | 4 }): JSX.Element {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path class={`trs-kite is-${tone}`} d="M0 -9 L7 0 L0 9 L-7 0 Z" />
      <line class="trs-kite-spine" x1={0} y1={-9} x2={0} y2={9} />
      <path class="trs-tail" d="M0 9 q 4 5 0 9 q -4 4 1 8" />
    </g>
  );
}

function Temple({ x, ground }: { x: number; ground: number }): JSX.Element {
  return (
    <g>
      <rect class="trs-temple" x={x - 16} y={ground - 22} width={32} height={22} />
      <path
        class="trs-temple-top"
        d={`M${x - 14} ${ground - 22} Q ${x} ${ground - 58} ${x + 14} ${ground - 22} Z`}
      />
      <line class="trs-pole" x1={x} y1={ground - 50} x2={x} y2={ground - 68} />
      <path class="trs-pennant" d={`M${x} ${ground - 68} l14 4 l-14 4 Z`} />
      <rect class="trs-door" x={x - 5} y={ground - 12} width={10} height={12} rx={5} />
    </g>
  );
}

/** Grandpa's clinometer, big: protractor, straw along the edge, plumb with a nut. */
function ClinoBig({
  x,
  y,
  r,
  tilt = 0,
}: { x: number; y: number; r: number; tilt?: number }): JSX.Element {
  return (
    <g transform={`translate(${x} ${y}) rotate(${-tilt})`}>
      <path class="trs-protractor" d={`M${-r} 0 A${r} ${r} 0 0 0 ${r} 0 Z`} />
      {Array.from({ length: 19 }, (_, i) => {
        const a = (i * Math.PI) / 18;
        const long = i % 3 === 0;
        return (
          <line
            key={`t${i * 10}`}
            class="trs-tick"
            x1={Math.cos(a) * r * (long ? 0.78 : 0.88)}
            y1={Math.sin(a) * r * (long ? 0.78 : 0.88)}
            x2={Math.cos(a) * r}
            y2={Math.sin(a) * r}
          />
        );
      })}
      <rect class="trs-straw" x={-r - 4} y={-4} width={2 * r + 8} height={4} rx={2} />
      <g transform={`rotate(${tilt})`}>
        <line class="trs-thread" x1={0} y1={0} x2={0} y2={r * 1.2} />
        <circle class="trs-nut" cx={0} cy={r * 1.2 + 3} r={3.5} />
      </g>
    </g>
  );
}

function FortHill(): JSX.Element {
  return (
    <g>
      <Outside ground={160} />
      <path class="trs-hill" d="M0 160 Q 90 70 190 78 Q 270 84 320 130 L320 180 L0 180 Z" />
      <Wall x1={110} x2={250} y={86} h={20} />
      <Tower x={196} ground={70} top={22} w={30} />
      <Kite x={70} y={32} tone={1} />
      <Kite x={262} y={24} tone={2} s={0.8} />
      <Kite x={128} y={18} tone={3} s={0.7} />
      <path class="trs-string" d="M70 58 Q 62 110 58 140" />
      <Person who="grandpa" x={34} y={172} s={1.05} />
      <Person who="riya" x={58} y={172} />
      <Person who="kabir" x={82} y={172} point={[10, -22]} />
    </g>
  );
}

function ClinometerScene(): JSX.Element {
  return (
    <g>
      <rect class="trs-room" x={0} y={0} width={W} height={H} />
      <rect class="trs-table" x={0} y={132} width={W} height={48} />
      <ClinoBig x={176} y={70} r={46} tilt={0} />
      <text class="trs-mark" x={176} y={136} text-anchor="middle">
        90°
      </text>
      <Person who="grandpa" x={100} y={170} s={1.3} point={[24, -16]} />
      <Person who="riya" x={252} y={172} s={1.1} />
      <Person who="kabir" x={282} y={172} s={1.1} />
    </g>
  );
}

function LadderCourtyard(): JSX.Element {
  return (
    <g>
      <Outside ground={150} />
      <rect class="trs-stone" x={196} y={20} width={124} height={130} />
      <g class="trs-ladder">
        <line x1={108} y1={150} x2={192} y2={44} />
        <line x1={118} y1={150} x2={200} y2={48} />
        {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((k) => (
          <line key={k} x1={108 + 84 * k} y1={150 - 106 * k} x2={118 + 82 * k} y2={150 - 102 * k} />
        ))}
      </g>
      <line class="trs-tape" x1={113} y1={156} x2={196} y2={156} />
      <path class="trs-right" d="M186 150 v-10 h10" />
      <Person who="riya" x={86} y={172} point={[12, -10]} />
      <Person who="kabir" x={140} y={172} point={[-8, -18]} />
    </g>
  );
}

function RatioCard(): JSX.Element {
  const cols = ["0°", "30°", "45°", "60°", "90°"];
  const rows = [
    ["sin", "0", "½", "1/√2", "√3/2", "1"],
    ["cos", "1", "√3/2", "1/√2", "½", "0"],
    ["tan", "0", "1/√3", "1", "√3", "—"],
  ];
  const x0 = 70;
  const y0 = 30;
  const cw = 34;
  const rh = 24;
  return (
    <g>
      <rect class="trs-room" x={0} y={0} width={W} height={H} />
      <rect
        class="trs-card"
        x={x0 - 8}
        y={y0 - 8}
        width={cw * 6 + 16}
        height={rh * 4 + 16}
        rx={6}
      />
      {cols.map((c, i) => (
        <text
          key={c}
          class="trs-cell is-head"
          x={x0 + cw * (i + 1.5)}
          y={y0 + 14}
          text-anchor="middle"
        >
          {c}
        </text>
      ))}
      {rows.map((r, j) => (
        <g key={r[0]}>
          {r.map((v, i) => (
            <text
              key={`${r[0]}${i}`}
              class={`trs-cell${i === 0 ? " is-head" : ""}`}
              x={x0 + cw * (i + 0.5)}
              y={y0 + rh * (j + 1) + 14}
              text-anchor="middle"
            >
              {v}
            </text>
          ))}
        </g>
      ))}
      <line class="trs-rule" x1={x0} y1={y0 + rh} x2={x0 + cw * 6} y2={y0 + rh} />
      <line class="trs-rule" x1={x0 + cw} y1={y0} x2={x0 + cw} y2={y0 + rh * 4} />
      <Person who="riya" x={40} y={176} s={1.1} point={[18, -30]} />
      <Person who="kabir" x={292} y={176} s={1.1} />
    </g>
  );
}

function TowerSighting(): JSX.Element {
  return (
    <g>
      <Outside ground={150} />
      <Tower x={262} ground={150} top={34} w={36} />
      <line class="trs-level" x1={64} y1={116} x2={262} y2={116} />
      <line class="trs-sight" x1={64} y1={116} x2={262} y2={30} />
      <path class="trs-angle" d="M104 116 A 40 40 0 0 0 100.7 100.4" />
      <Person who="kabir" x={58} y={150} s={1.1} point={[12, -2]} />
      <ClinoBig x={74} y={115} r={7} tilt={23} />
      <Person who="riya" x={24} y={172} />
      <rect class="trs-notebook" x={30} y={132} width={14} height={11} rx={1.5} />
    </g>
  );
}

function KiteFlying(): JSX.Element {
  return (
    <g>
      <Outside ground={150} />
      <Tower x={290} ground={150} top={40} w={30} />
      <line class="trs-level" x1={56} y1={40} x2={276} y2={40} />
      <line class="trs-string" x1={84} y1={124} x2={232} y2={40} />
      <Kite x={234} y={40} tone={4} s={1.2} />
      <Person who="kabir" x={76} y={150} s={1.1} point={[8, -14]} />
      <Person who="grandpa" x={40} y={172} s={1.1} point={[10, -8]} />
      <circle class="trs-spool" cx={54} cy={140} r={5} />
    </g>
  );
}

function TempleAcrossRiver(): JSX.Element {
  return (
    <g>
      <rect class="trs-sky" x={0} y={0} width={W} height={H} />
      <rect class="trs-stone" x={0} y={48} width={90} height={132} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} class="trs-stone" x={i * 15 + 2} y={42} width={8} height={6} />
      ))}
      <rect class="trs-grass" x={90} y={150} width={60} height={30} />
      <rect class="trs-river" x={150} y={150} width={110} height={30} />
      <path
        class="trs-wave"
        d="M160 162 q 6 -4 12 0 t 12 0 M200 170 q 6 -4 12 0 t 12 0 M230 160 q 6 -4 12 0 t 12 0"
      />
      <rect class="trs-grass" x={260} y={150} width={60} height={30} />
      <Temple x={290} ground={150} />
      <line class="trs-level" x1={64} y1={30} x2={300} y2={30} />
      <line class="trs-sight" x1={64} y1={30} x2={286} y2={146} />
      <path class="trs-angle" d="M108 30 A 44 44 0 0 1 103 50.4" />
      <Person who="riya" x={58} y={48} point={[12, -4]} />
    </g>
  );
}

function BalloonDrift(): JSX.Element {
  return (
    <g>
      <Outside ground={156} />
      <path class="trs-hill" d="M180 156 Q 250 120 320 136 L320 156 Z" />
      <line class="trs-level" x1={40} y1={34} x2={300} y2={34} />
      <line class="trs-sight is-faint" x1={60} y1={140} x2={120} y2={34} />
      <line class="trs-sight" x1={60} y1={140} x2={244} y2={34} />
      <g opacity={0.45}>
        <Balloon x={120} y={34} />
      </g>
      <Balloon x={244} y={34} />
      <path class="trs-wind" d="M150 22 h40 m-6 -4 l6 4 l-6 4" />
      <Person who="kabir" x={54} y={156} s={1.1} point={[8, -12]} />
    </g>
  );
}

function Balloon({ x, y }: { x: number; y: number }): JSX.Element {
  return (
    <g>
      <path
        class="trs-balloon"
        d={`M${x} ${y + 8} C ${x - 22} ${y - 6} ${x - 16} ${y - 32} ${x} ${y - 32} C ${x + 16} ${y - 32} ${x + 22} ${y - 6} ${x} ${y + 8} Z`}
      />
      <path
        class="trs-balloon-band"
        d={`M${x - 14} ${y - 14} Q ${x} ${y - 8} ${x + 14} ${y - 14}`}
      />
      <line class="trs-pole" x1={x - 4} y1={y + 6} x2={x - 3} y2={y + 12} />
      <line class="trs-pole" x1={x + 4} y1={y + 6} x2={x + 3} y2={y + 12} />
      <rect class="trs-basket" x={x - 5} y={y + 12} width={10} height={7} rx={1} />
    </g>
  );
}

function SankrantiSunset(): JSX.Element {
  return (
    <g>
      <Outside ground={150} sunset />
      <circle class="trs-sun" cx={240} cy={130} r={26} />
      <path class="trs-hill" d="M0 150 Q 110 112 220 128 Q 280 136 320 150 Z" />
      <Tower x={150} ground={124} top={62} w={24} />
      <Kite x={92} y={20} tone={4} s={1.1} />
      <Kite x={40} y={58} tone={1} s={0.7} />
      <Kite x={200} y={44} tone={2} s={0.8} />
      <Kite x={276} y={30} tone={3} s={0.7} />
      <path class="trs-string" d="M92 46 Q 98 110 110 146" />
      <Person who="mom" x={160} y={174} s={1.05} back />
      <Person who="grandpa" x={186} y={174} s={1.05} back />
      <Person who="riya" x={214} y={174} back point={[6, -24]} />
      <Person who="kabir" x={114} y={174} back point={[-4, -26]} />
    </g>
  );
}

export function TrigSceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as TrigSceneState;
  const id = useId();
  const k = width / W;
  const height = Math.round((width * H) / W);
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case TrigSceneKind.FortHill:
        return <FortHill />;
      case TrigSceneKind.Clinometer:
        return <ClinometerScene />;
      case TrigSceneKind.LadderCourtyard:
        return <LadderCourtyard />;
      case TrigSceneKind.RatioCard:
        return <RatioCard />;
      case TrigSceneKind.TowerSighting:
        return <TowerSighting />;
      case TrigSceneKind.KiteFlying:
        return <KiteFlying />;
      case TrigSceneKind.TempleAcrossRiver:
        return <TempleAcrossRiver />;
      case TrigSceneKind.BalloonDrift:
        return <BalloonDrift />;
      case TrigSceneKind.SankrantiSunset:
        return <SankrantiSunset />;
    }
  })();
  return (
    <div class="trs" data-part={TrigScenePart.Picture}>
      <Stage
        label={describeTrigScene(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "trs-svg" }}
      >
        <clipPath id={`trs-${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12 / k} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#trs-${id}-frame)`}>
          {scene}
        </g>
      </Stage>
    </div>
  );
}
