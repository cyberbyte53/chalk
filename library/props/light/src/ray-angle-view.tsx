import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { HATCH, type Px, type RayAngleState, figureOf } from "./ray-angle";

const RAD = Math.PI / 180;
/** The right-angle box's side, px. */
const BOX = 9;

const at = (o: Px, r: number, deg: number): Px => [
  o[0] + r * Math.cos(deg * RAD),
  o[1] + r * Math.sin(deg * RAD),
];

function Ray({ from, to }: { from: Px; to: Px }): JSX.Element {
  const x = from[0] + (to[0] - from[0]) * 0.55;
  const y = from[1] + (to[1] - from[1]) * 0.55;
  const angle = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
  return (
    <g class="ra-ray">
      <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} />
      <path d="M-7 -5 L5 0 L-7 5 Z" transform={`translate(${x} ${y}) rotate(${angle})`} />
    </g>
  );
}

/** The mirror, the normal, the rays and the marked angles: a static textbook figure. */
export function RayAngleView({ view, width }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as RayAngleState;
  const f = figureOf(s, width);
  const { o, mirrorY } = f;
  const ticks = Math.ceil(width / 12);
  const said = f.arcs.map((a) => `${a.text === "?" ? "an unknown angle" : a.text}`).join(", ");
  return (
    <div class="ra">
      <svg
        class="ra-svg"
        viewBox={`0 0 ${width} ${f.height}`}
        width="100%"
        role="img"
        aria-label={`A ray reflecting off a plane mirror; marked: ${said || "nothing"}`}
      >
        <rect class="ra-bg" x={0} y={0} width={width} height={f.height} rx={12} />
        <g class="ra-mirror">
          <line x1={6} y1={mirrorY} x2={width - 6} y2={mirrorY} />
          {Array.from({ length: ticks }, (_, k) => {
            const x = 10 + k * 12;
            return x > width - 8 ? null : (
              <line
                key={x}
                class="ra-hatch"
                x1={x}
                y1={mirrorY + 2}
                x2={x - 7}
                y2={mirrorY + HATCH}
              />
            );
          })}
        </g>
        <line class="ra-normal" x1={o[0]} y1={o[1]} x2={f.normalTop[0]} y2={f.normalTop[1]} />
        <path
          class="ra-square"
          d={`M${o[0] + f.boxSide * BOX} ${o[1]} L${o[0] + f.boxSide * BOX} ${o[1] - BOX} L${o[0]} ${o[1] - BOX}`}
        />
        {f.arcs.map((a) => {
          const p0 = at(o, a.r, a.a0);
          const p1 = at(o, a.r, a.a1);
          const large = a.a1 - a.a0 > 180 ? 1 : 0;
          return (
            <path
              key={a.id}
              class={`ra-arc is-${a.id}`}
              d={`M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A${a.r} ${a.r} 0 ${large} 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`}
            />
          );
        })}
        <Ray from={f.start} to={o} />
        {s.showReflected && <Ray from={o} to={f.end} />}
        <circle class="ra-point" cx={o[0]} cy={o[1]} r={3.5} />
        {f.arcs.map((a) => (
          <text
            key={a.id}
            class={a.text === "?" ? "ra-label is-ask" : "ra-label"}
            x={a.label.x + a.label.width / 2}
            y={a.label.y + a.label.height / 2 + 5}
            text-anchor="middle"
            data-part={a.id}
          >
            {a.text}
          </text>
        ))}
      </svg>
    </div>
  );
}
