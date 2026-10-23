import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  ALLOY_WORDS,
  AlloyMetal,
  CARATS,
  CaratAction,
  type CaratState,
  describeCarat,
  goldPercent,
  hardnessOf,
} from "./metal-carat";
import { type Words, range, say } from "./words";

const W = 320;
const H = 150;

const WORDS = {
  carat: { en: "carat", hi: "कैरेट" },
  gold: { en: "gold", hi: "सोना" },
  soft: { en: "soft", hi: "नरम" },
  hard: { en: "hard", hi: "कठोर" },
} as const satisfies Record<string, Words>;

/** 24 squares, the gold ones first; a hardness bar below. */
export function GoldCaratView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as CaratState;
  const k = width / W;
  const height = Math.round(H * k);
  const size = 22;
  const gap = 3;
  const cols = 8;
  const left = (W - (cols * size + (cols - 1) * gap)) / 2;
  const top = 34;
  const hard = hardnessOf(s.carat);
  return (
    <div class="mn mn-gc">
      <Stage
        label={describeCarat(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "mn-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mn-bg" x={0} y={0} width={W} height={H} rx={12} />
          <text class="mn-title" x={12} y={22}>
            {s.carat} {say(locale, WORDS.carat)}
          </text>
          <text class="mn-small" x={W - 12} y={22} text-anchor="end">
            {s.carat === 24
              ? `24 ${say(locale, WORDS.gold)} · 100%`
              : `${s.carat} ${say(locale, WORDS.gold)} + ${24 - s.carat} ${say(locale, ALLOY_WORDS[s.other])} · ${goldPercent(s.carat)}%`}
          </text>
          <g data-part="grid">
            {range(24).map((i) => (
              <rect
                key={i}
                class={i < s.carat ? "mn-part is-gold" : `mn-part is-${s.other}`}
                x={left + (i % cols) * (size + gap)}
                y={top + Math.floor(i / cols) * (size + gap)}
                width={size}
                height={size}
                rx={4}
              />
            ))}
          </g>
          <g data-part="hardness">
            <text class="mn-small" x={left} y={H - 14} text-anchor="end" dx={-6}>
              {say(locale, WORDS.soft)}
            </text>
            <rect class="mn-meter" x={left} y={H - 24} width={W - 2 * left} height={10} rx={5} />
            <rect
              class="mn-meter-fill"
              x={left}
              y={H - 24}
              width={(W - 2 * left) * hard}
              height={10}
              rx={5}
            />
            <text class="mn-small" x={W - left + 6} y={H - 14}>
              {say(locale, WORDS.hard)}
            </text>
          </g>
        </g>
      </Stage>
      {s.canChoose && (
        <div class="mn-chips" data-part="carats">
          {CARATS.map((c) => (
            <button
              key={c}
              type="button"
              class={c === s.carat ? "mn-chip is-on" : "mn-chip"}
              aria-pressed={c === s.carat}
              onClick={() => call(CaratAction.SetCarat, { carat: c })}
            >
              {c} {say(locale, WORDS.carat)}
            </button>
          ))}
        </div>
      )}
      {s.canChoose && (
        <div class="mn-chips" data-part="metals">
          {Object.values(AlloyMetal).map((m) => (
            <button
              key={m}
              type="button"
              class={m === s.other ? "mn-chip is-on" : "mn-chip"}
              aria-pressed={m === s.other}
              onClick={() => call(CaratAction.SetMetal, { other: m })}
            >
              + {say(locale, ALLOY_WORDS[m])}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
