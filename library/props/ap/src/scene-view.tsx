import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { AP_PICTURE, ApSceneKind, type ApSceneState, describeApScene } from "./scene";

const W = AP_PICTURE.width;
const H = AP_PICTURE.height;

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
  const shirt = `aps-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="aps-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`aps-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="aps-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="aps-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="aps-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="aps-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -3 -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="aps-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="aps-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="aps-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="aps-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="aps-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="aps-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="aps-specs">
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
      <rect class="aps-wall" x={0} y={0} width={W} height={150} />
      <rect class="aps-floor" x={0} y={150} width={W} height={30} />
    </g>
  );
}

function Outside({ ground = 150 }: { ground?: number }): JSX.Element {
  return (
    <g>
      <rect class="aps-sky" x={0} y={0} width={W} height={ground} />
      <rect class="aps-grass" x={0} y={ground} width={W} height={H - ground} />
    </g>
  );
}

/** A cycle, its rear wheel centred at (x, y). */
function Cycle({ x, y, s = 1 }: { x: number; y: number; s?: number }): JSX.Element {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle class="aps-wheel" cx={0} cy={0} r={13} />
      <circle class="aps-wheel" cx={44} cy={0} r={13} />
      <path
        class="aps-frame"
        d="M0 0 L16 -20 L36 -20 L44 0 M16 -20 L22 0 L0 0 M22 0 L36 -20 M14 -26 h8 M36 -20 l-2 -8 h6"
      />
    </g>
  );
}

function MoneyBox(): JSX.Element {
  const bars = [100, 105, 110, 115, 120, 125];
  return (
    <g>
      <Room />
      {/* the weekly chart on the wall */}
      <rect class="aps-paper" x={176} y={18} width={124} height={86} rx={3} />
      {bars.map((b, i) => (
        <rect
          key={b}
          class="aps-chart-bar"
          x={188 + i * 18}
          y={96 - (b - 70) * 1.3}
          width={12}
          height={(b - 70) * 1.3}
          rx={1.5}
        />
      ))}
      <text class="aps-chart-label" x={238} y={30} text-anchor="middle">
        +5 +5 +5 +5 +5
      </text>
      <rect class="aps-table" x={30} y={110} width={150} height={8} rx={2} />
      <rect class="aps-table-leg" x={40} y={118} width={6} height={32} />
      <rect class="aps-table-leg" x={164} y={118} width={6} height={32} />
      {/* the tin */}
      <rect class="aps-tin" x={92} y={86} width={30} height={24} rx={3} />
      <rect class="aps-tin-lid" x={90} y={83} width={34} height={5} rx={2} />
      <rect class="aps-slot" x={101} y={84.5} width={12} height={2} rx={1} />
      <rect
        class="aps-note"
        x={102}
        y={66}
        width={12}
        height={14}
        rx={1.5}
        transform="rotate(8 108 73)"
      />
      <Person who="kabir" x={140} y={150} s={1.4} point={[-24, -14]} />
      <Person who="riya" x={250} y={164} s={1.3} />
      <rect class="aps-notebook" x={262} y={120} width={14} height={11} rx={1.5} />
    </g>
  );
}

function CycleShop(): JSX.Element {
  return (
    <g>
      <Outside ground={152} />
      <rect class="aps-shop" x={20} y={18} width={280} height={134} rx={4} />
      <rect class="aps-awning" x={14} y={10} width={292} height={16} rx={3} />
      <rect class="aps-window" x={40} y={40} width={170} height={96} rx={4} />
      <Cycle x={78} y={118} s={1.4} />
      <g transform="rotate(-6 176 64)">
        <rect class="aps-tag" x={150} y={52} width={52} height={22} rx={4} />
        <text class="aps-tag-text" x={176} y={67} text-anchor="middle">
          ₹4,000
        </text>
      </g>
      <rect class="aps-door" x={230} y={58} width={50} height={94} rx={3} />
      <Person who="kabir" x={198} y={176} s={1.5} back point={[-14, -22]} />
      <Person who="mom" x={262} y={178} s={1.55} back />
      <rect class="aps-bag" x={274} y={140} width={14} height={18} rx={3} />
    </g>
  );
}

function GrandpaLadder(): JSX.Element {
  const rungs = 8;
  const bottom = 150;
  const top = 22;
  const gap = (bottom - top) / rungs;
  return (
    <g>
      <rect class="aps-wall" x={0} y={0} width={W} height={150} />
      <rect class="aps-floor" x={0} y={150} width={W} height={30} />
      {/* rails converge upward: each rung 2 cm shorter */}
      <line class="aps-rail" x1={90} y1={bottom + 4} x2={128} y2={top - 6} />
      <line class="aps-rail" x1={200} y1={bottom + 4} x2={162} y2={top - 6} />
      {Array.from({ length: rungs }, (_, i) => {
        const y = bottom - (i + 0.5) * gap;
        const t = (bottom + 4 - y) / (bottom + 4 - (top - 6));
        const xl = 90 + t * 38;
        const xr = 200 - t * 38;
        return <line key={y} class="aps-rung" x1={xl} y1={y} x2={xr} y2={y} />;
      })}
      <text class="aps-measure" x={145} y={bottom + 0} text-anchor="middle">
        45 cm
      </text>
      <text class="aps-measure" x={145} y={top + 8} text-anchor="middle">
        31 cm
      </text>
      <Person who="grandpa" x={230} y={168} s={1.5} point={[-18, -8]} />
      <Person who="kabir" x={52} y={170} s={1.4} point={[16, -24]} />
    </g>
  );
}

function FlowerBed(): JSX.Element {
  const rows = [9, 8, 7, 6, 5];
  return (
    <g>
      <Outside ground={74} />
      <rect class="aps-soil" x={28} y={86} width={228} height={86} rx={6} />
      {rows.map((count, r) => {
        const y = 164 - r * 17;
        return Array.from({ length: count }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed rows, drawn once
          <g key={`${r}-${i}`} transform={`translate(${46 + r * 11 + i * 22} ${y})`}>
            <line class="aps-stem" x1={0} y1={0} x2={0} y2={-8} />
            <circle class="aps-rose" cx={0} cy={-10} r={4.2} />
          </g>
        ));
      })}
      <Person who="mom" x={286} y={160} s={1.5} point={[-16, 4]} />
      <path class="aps-water" d="M262 126 q -8 8 -14 18" />
      <Person who="riya" x={262} y={72} s={1.1} />
    </g>
  );
}

function GaussSlate(): JSX.Element {
  return (
    <g>
      <rect class="aps-wall" x={0} y={0} width={W} height={150} />
      <rect class="aps-floor" x={0} y={150} width={W} height={30} />
      <rect class="aps-slate-frame" x={60} y={14} width={200} height={104} rx={6} />
      <rect class="aps-slate" x={66} y={20} width={188} height={92} rx={3} />
      <text class="aps-slate-text" x={160} y={42} text-anchor="middle">
        1 + 2 + 3 + … + 99 + 100
      </text>
      <text class="aps-slate-text" x={160} y={62} text-anchor="middle">
        100 + 99 + 98 + … + 2 + 1
      </text>
      <line class="aps-slate-line" x1={84} y1={70} x2={236} y2={70} />
      <text class="aps-slate-text" x={160} y={88} text-anchor="middle">
        101 + 101 + … + 101
      </text>
      <ellipse class="aps-circle" cx={160} cy={103} rx={30} ry={8} />
      <text class="aps-slate-text is-answer" x={160} y={107} text-anchor="middle">
        5050
      </text>
      <Person who="grandpa" x={36} y={170} s={1.5} point={[18, -24]} />
      <Person who="kabir" x={286} y={170} s={1.45} />
    </g>
  );
}

function TreeDrive(): JSX.Element {
  return (
    <g>
      <Outside ground={70} />
      <rect class="aps-school" x={196} y={22} width={110} height={48} rx={2} />
      <path class="aps-school-roof" d="M190 24 L251 6 L312 24 Z" />
      {[1, 2, 3, 4, 5].map((count, r) => {
        const y = 92 + r * 17;
        return Array.from({ length: count }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed rows, drawn once
          <g key={`${r}-${i}`} transform={`translate(${30 + i * 26} ${y})`}>
            <line class="aps-stem" x1={0} y1={0} x2={0} y2={-9} />
            <circle class="aps-leaf" cx={0} cy={-11} r={5} />
          </g>
        ));
      })}
      <Person who="riya" x={224} y={170} s={1.4} point={[-14, 10]} />
      <line class="aps-spade" x1={206} y1={138} x2={196} y2={168} />
      <Person who="kabir" x={274} y={172} s={1.35} point={[-12, -6]} />
      <path class="aps-can" d="M254 140 h12 v10 h-12 z M254 142 l-8 -4" />
    </g>
  );
}

function PotatoRace(): JSX.Element {
  const start = 34;
  const first = 74;
  const gap = 24;
  return (
    <g>
      <Outside ground={92} />
      <line class="aps-track" x1={12} y1={136} x2={310} y2={136} />
      <path class="aps-bucket" d={`M${start - 10} 118 h20 l-3 18 h-14 z`} />
      {Array.from({ length: 10 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: potatoes in a line
        <ellipse key={i} class="aps-potato" cx={first + i * gap} cy={133} rx={5} ry={3.5} />
      ))}
      <path class="aps-measure-line" d={`M${start} 150 V 156 H ${first} V 150`} />
      <text class="aps-measure" x={(start + first) / 2} y={168} text-anchor="middle">
        5 m
      </text>
      <path class="aps-measure-line" d={`M${first} 150 V 156 H ${first + gap} V 150`} />
      <text class="aps-measure" x={first + gap / 2} y={168} text-anchor="middle">
        3 m
      </text>
      <Person who="riya" x={120} y={128} s={1.25} point={[-16, 4]} />
      <ellipse class="aps-potato" cx={100} cy={110} rx={4} ry={3} />
      <Person who="kabir" x={270} y={92} s={1.05} point={[6, -18]} />
    </g>
  );
}

function LogStack(): JSX.Element {
  const r = 9;
  const rows = [8, 7, 6, 5, 4, 3];
  return (
    <g>
      <Outside ground={150} />
      <path class="aps-hill" d="M0 150 Q 80 100 170 150 Z" />
      {rows.map((count, k) =>
        Array.from({ length: count }, (_, i) => (
          <circle
            key={`${44 + k * r + i * 2 * r} ${k}`}
            class="aps-log"
            cx={44 + k * r + i * 2 * r}
            cy={150 - r - k * r * 1.72}
            r={r}
          />
        )),
      )}
      <Person who="grandpa" x={250} y={166} s={1.55} point={[-20, -4]} />
    </g>
  );
}

function CycleDay(): JSX.Element {
  return (
    <g>
      <Outside ground={140} />
      <path class="aps-string" d="M0 20 Q 160 50 320 20" />
      {[20, 60, 100, 140, 180, 220, 260, 300].map((x, i) => (
        <path
          key={x}
          class={`aps-flag is-${i % 3}`}
          d={`M${x - 7} ${22 + 14 * Math.sin((x / 320) * Math.PI) + 4} l7 12 l7 -12 z`}
        />
      ))}
      <rect class="aps-tin" x={30} y={128} width={22} height={18} rx={3} />
      <rect
        class="aps-tin-lid"
        x={52}
        y={140}
        width={20}
        height={4}
        rx={2}
        transform="rotate(20 62 142)"
      />
      <Cycle x={136} y={150} s={1.3} />
      <Person who="kabir" x={166} y={132} s={1.3} point={[18, -2]} />
      <Person who="riya" x={92} y={168} s={1.35} point={[10, -26]} />
      <Person who="mom" x={256} y={170} s={1.45} point={[-8, -28]} />
      <Person who="grandpa" x={292} y={170} s={1.45} />
    </g>
  );
}

export function ApSceneView({ view, width }: PropViewProps): JSX.Element {
  const s = view as unknown as ApSceneState;
  const id = useId();
  const k = width / W;
  const height = Math.round((width * H) / W);
  const scene = ((): JSX.Element => {
    switch (s.scene) {
      case ApSceneKind.MoneyBox:
        return <MoneyBox />;
      case ApSceneKind.CycleShop:
        return <CycleShop />;
      case ApSceneKind.GrandpaLadder:
        return <GrandpaLadder />;
      case ApSceneKind.FlowerBed:
        return <FlowerBed />;
      case ApSceneKind.GaussSlate:
        return <GaussSlate />;
      case ApSceneKind.TreeDrive:
        return <TreeDrive />;
      case ApSceneKind.PotatoRace:
        return <PotatoRace />;
      case ApSceneKind.LogStack:
        return <LogStack />;
      case ApSceneKind.CycleDay:
        return <CycleDay />;
    }
  })();
  return (
    <div class="aps" data-part="picture">
      <Stage
        label={describeApScene(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "aps-svg" }}
      >
        <clipPath id={`aps-${id}-frame`}>
          <rect x={0} y={0} width={W} height={H} rx={12 / k} />
        </clipPath>
        <g transform={`scale(${k})`} clip-path={`url(#aps-${id}-frame)`}>
          {scene}
        </g>
      </Stage>
    </div>
  );
}
