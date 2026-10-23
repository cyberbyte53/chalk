import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  THERMIT_EQUATION_WORDS,
  ThermitAction,
  type ThermitState,
  describeThermit,
} from "./extraction-thermit";
import { type Words, range, say } from "./words";

const W = 320;
const H = 170;
const RAIL_Y = 130;
const GAP = { left: 150, right: 170 } as const;

const WORDS = {
  ignite: { en: "Light it", hi: "जलाओ" },
  again: { en: "↺ Again", hi: "↺ फिर से" },
  rail: { en: "rail", hi: "पटरी" },
  mixture: { en: "Fe₂O₃ + Al", hi: "Fe₂O₃ + Al" },
  molten: { en: "molten iron", hi: "पिघला लोहा" },
} as const satisfies Record<string, Words>;

/** A rail in profile: head, web, foot, between x0 and x1. */
function Rail({ x0, x1 }: { x0: number; x1: number }) {
  return (
    <g class="mn-rail">
      <rect x={x0} y={RAIL_Y - 18} width={x1 - x0} height={7} rx={2} />
      <rect x={x0} y={RAIL_Y - 11} width={x1 - x0} height={10} />
      <rect x={x0} y={RAIL_Y - 1} width={x1 - x0} height={6} rx={1} />
    </g>
  );
}

/** Two rails with a gap, a crucible above; lit, molten iron runs down and fills the gap. */
export function ThermitWeldView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ThermitState;
  const k = width / W;
  const height = Math.round(H * k);
  const cx = (GAP.left + GAP.right) / 2;
  return (
    <div class="mn mn-tw">
      <Stage
        label={describeThermit(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "mn-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mn-bg" x={0} y={0} width={W} height={H} rx={12} />
          <rect class="mn-ground" x={0} y={RAIL_Y + 5} width={W} height={H - RAIL_Y - 5} />
          <g data-part="rails">
            <Rail x0={16} x1={GAP.left} />
            <Rail x0={GAP.right} x1={W - 16} />
            <text class="mn-small" x={40} y={RAIL_Y + 22}>
              {say(locale, WORDS.rail)}
            </text>
          </g>
          <g key={String(s.isIgnited)} data-part="crucible">
            <path class="mn-crucible" d={`M${cx - 26} 34 h 52 l -12 40 h -28 z`} />
            <path class="mn-mixture" d={`M${cx - 22} 40 h 44 l -9 30 h -26 z`} />
            {!s.isIgnited && (
              <text class="mn-small" x={cx + 34} y={56}>
                {say(locale, WORDS.mixture)}
              </text>
            )}
            {s.isIgnited && (
              <g>
                <circle class="mn-dazzle mn-after" cx={cx} cy={50} r={40} />
                <g class="mn-sparks mn-after">
                  {range(12).map((i) => (
                    <circle
                      key={i}
                      cx={cx - 40 + ((i * 29) % 80)}
                      cy={20 + ((i * 17) % 30)}
                      r={1.6}
                    />
                  ))}
                </g>
                <rect
                  class="mn-molten mn-pour"
                  x={cx - 4}
                  y={74}
                  width={8}
                  height={RAIL_Y - 74 - 18}
                />
                <rect
                  class="mn-molten mn-fill"
                  x={GAP.left - 2}
                  y={RAIL_Y - 20}
                  width={GAP.right - GAP.left + 4}
                  height={26}
                  rx={2}
                />
                <text class="mn-small mn-after-slow" x={GAP.right + 8} y={RAIL_Y - 26}>
                  {say(locale, WORDS.molten)}
                </text>
              </g>
            )}
          </g>
        </g>
      </Stage>
      {s.showEquation && (
        <p class="mn-equation" data-part="equation">
          {say(locale, THERMIT_EQUATION_WORDS)}
        </p>
      )}
      {s.canIgnite && (
        <div class="mn-row">
          <button
            type="button"
            class={s.isIgnited ? "mn-button is-again" : "mn-button"}
            data-part="ignite"
            onClick={() => call(s.isIgnited ? ThermitAction.Reset : ThermitAction.Ignite, {})}
          >
            {say(locale, s.isIgnited ? WORDS.again : WORDS.ignite)}
          </button>
        </div>
      )}
    </div>
  );
}
