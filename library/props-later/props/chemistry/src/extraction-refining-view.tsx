import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  COPPER_SHARE,
  RefiningAction,
  type RefiningState,
  anodeLeft,
  cathodeGained,
  describeRefining,
} from "./extraction-refining";
import { type Words, range, say } from "./words";

const W = 320;
const H = 190;
const TANK = { left: 70, right: 250, top: 70, bottom: 172, surface: 82 } as const;
const ANODE_X = 112;
const CATHODE_X = 208;

const WORDS = {
  on: { en: "Switch on", hi: "स्विच चालू करो" },
  off: { en: "Switch off", hi: "स्विच बंद करो" },
  again: { en: "New anode", hi: "नया ऐनोड" },
  anode: { en: "impure copper (+)", hi: "अशुद्ध ताँबा (+)" },
  cathode: { en: "pure copper (−)", hi: "शुद्ध ताँबा (−)" },
  solution: { en: "acidified CuSO₄", hi: "अम्लीय CuSO₄" },
  mud: { en: "anode mud", hi: "ऐनोड पंक" },
} as const satisfies Record<string, Words>;

/** The tank, a thick impure anode that thins and a pure cathode that thickens, mud below. */
export function RefiningCellView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as RefiningState;
  const k = width / W;
  const height = Math.round(H * k);
  const anodeW =
    6 + 22 * (COPPER_SHARE * anodeLeft(s) + (1 - COPPER_SHARE) * (1 - s.progress * 0.8));
  const cathodeW = 4 + 22 * COPPER_SHARE * cathodeGained(s);
  const mudH = 8 * s.progress;
  const done = s.progress >= 1;
  return (
    <div class="mn mn-rc">
      <Stage
        label={describeRefining(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "mn-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mn-bg" x={0} y={0} width={W} height={H} rx={12} />
          <rect class="mn-battery" x={140} y={10} width={40} height={20} rx={3} />
          <text class="mn-small" x={160} y={24} text-anchor="middle">
            + −
          </text>
          <path class="mn-wire-lead" d={`M146 20 H ${ANODE_X} V ${TANK.top - 4}`} />
          <path class="mn-wire-lead" d={`M174 20 H ${CATHODE_X} V ${TANK.top - 4}`} />
          <rect
            class="mn-liquid is-blue"
            x={TANK.left + 2}
            y={TANK.surface}
            width={TANK.right - TANK.left - 4}
            height={TANK.bottom - TANK.surface}
            data-part="solution"
          />
          <g data-part="anode">
            <rect
              class="mn-metal-Cu mn-electrode-block"
              x={ANODE_X - anodeW / 2}
              y={TANK.top - 4}
              width={anodeW}
              height={80}
              rx={2}
            />
            {range(6).map((i) => (
              <circle
                key={i}
                class="mn-impurity"
                cx={ANODE_X - anodeW / 2 + 3 + ((i * 7) % Math.max(4, anodeW - 6))}
                cy={TANK.top + 8 + i * 11}
                r={1.4}
              />
            ))}
          </g>
          <rect
            class="mn-metal-Cu mn-electrode-block"
            x={CATHODE_X - cathodeW / 2}
            y={TANK.top - 4}
            width={cathodeW}
            height={80}
            rx={1.5}
            data-part="cathode"
          />
          {s.isOn && (
            <g class="mn-ions-flow">
              {range(8).map((i) => (
                <g
                  key={i}
                  class="mn-cu-ion"
                  style={
                    {
                      "--dx": `${CATHODE_X - ANODE_X - 20}px`,
                      animationDelay: `${(i * 0.3) % 2.4}s`,
                    } as JSX.CSSProperties
                  }
                >
                  <circle
                    cx={ANODE_X + 10}
                    cy={TANK.surface + 14 + i * 8}
                    r={3.2}
                    class="mn-ion is-plus"
                  />
                </g>
              ))}
            </g>
          )}
          {mudH > 0 && (
            <path
              class="mn-mud"
              data-part="mud"
              d={`M${ANODE_X - 22} ${TANK.bottom} q 22 ${-mudH * 2} 44 0 z`}
            />
          )}
          <path
            class="mn-glass-line"
            d={`M${TANK.left} ${TANK.top} V ${TANK.bottom} H ${TANK.right} V ${TANK.top}`}
          />
          {s.showLabels && (
            <g class="mn-labels">
              <text class="mn-small" x={ANODE_X} y={TANK.top - 10} text-anchor="end">
                {say(locale, WORDS.anode)}
              </text>
              <text class="mn-small" x={CATHODE_X + 4} y={TANK.top - 10}>
                {say(locale, WORDS.cathode)}
              </text>
              <text class="mn-small" x={TANK.right - 6} y={TANK.bottom - 6} text-anchor="end">
                {say(locale, WORDS.solution)}
              </text>
              {mudH > 0 && (
                <text class="mn-small" x={TANK.left - 4} y={TANK.bottom + 2} text-anchor="end">
                  {say(locale, WORDS.mud)}
                </text>
              )}
            </g>
          )}
        </g>
      </Stage>
      {s.canSwitch && (
        <div class="mn-row">
          <button
            type="button"
            class={s.isOn ? "mn-button is-on" : "mn-button is-again"}
            data-part="switch"
            aria-pressed={s.isOn}
            onClick={() =>
              done ? call(RefiningAction.Reset, {}) : call(RefiningAction.Switch, { on: !s.isOn })
            }
          >
            {say(locale, done ? WORDS.again : s.isOn ? WORDS.off : WORDS.on)}
          </button>
        </div>
      )}
    </div>
  );
}
