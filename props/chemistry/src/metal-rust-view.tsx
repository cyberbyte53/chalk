import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  COATING_WORDS,
  Coating,
  MAX_DAYS,
  RustAction,
  RustMode,
  type RustState,
  RustTube,
  RustWhere,
  describeRust,
  rustAmount,
  rustWhere,
  tubeRusts,
} from "./metal-rust";
import { type Words, range, say } from "./words";

const W = 320;
const H = 180;

const WORDS = {
  wait: { en: "Wait a day", hi: "एक दिन रुको" },
  again: { en: "↺ Fresh nails", hi: "↺ नई कीलें" },
  scratch: { en: "Scratch it", hi: "खरोंचो" },
  day: { en: "day", hi: "दिन" },
  oil: { en: "oil", hi: "तेल" },
  cacl2: { en: "CaCl₂", hi: "CaCl₂" },
  zincGoes: { en: "the zinc corrodes, not the iron", hi: "लोहे की जगह जस्ता संक्षारित होता है" },
} as const satisfies Record<string, Words>;

const TUBE_SHORT: Record<RustTube, Words> = {
  A: { en: "water + air", hi: "पानी + हवा" },
  B: { en: "no air", hi: "हवा नहीं" },
  C: { en: "no water", hi: "पानी नहीं" },
};

/** A nail standing upright with rust spots up to `amount` (0–1). */
function Nail({
  x,
  top,
  bottom,
  amount,
}: { x: number; top: number; bottom: number; amount: number }) {
  return (
    <g>
      <rect class="mn-nail" x={x - 2.5} y={top + 4} width={5} height={bottom - top - 8} rx={1} />
      <rect class="mn-nail" x={x - 6} y={top} width={12} height={4} rx={1} />
      <path
        class="mn-nail"
        d={`M${x - 2.5} ${bottom - 4} L ${x} ${bottom} L ${x + 2.5} ${bottom - 4} z`}
      />
      {amount > 0 && (
        <g class="mn-rust" style={{ opacity: 0.35 + 0.65 * amount } as JSX.CSSProperties}>
          {range(Math.ceil(6 * amount)).map((i) => (
            <circle
              key={i}
              cx={x - 2 + (i % 2) * 4}
              cy={top + 10 + i * ((bottom - top - 20) / 6)}
              r={2 + amount}
            />
          ))}
        </g>
      )}
    </g>
  );
}

function Tubes({ s, locale }: { s: RustState; locale: string }) {
  const amount = rustAmount(s.days);
  const xs: Record<RustTube, number> = { A: 70, B: 160, C: 250 };
  const top = 34;
  const bottom = 128;
  return (
    <g data-part="tubes">
      {Object.values(RustTube).map((t) => {
        const x = xs[t];
        return (
          <g key={t}>
            <rect class="mn-cork" x={x - 15} y={top - 10} width={30} height={12} rx={2} />
            {t === RustTube.A && (
              <rect class="mn-liquid is-water" x={x - 13} y={92} width={26} height={bottom - 92} />
            )}
            {t === RustTube.B && (
              <g>
                <rect
                  class="mn-liquid is-water"
                  x={x - 13}
                  y={64}
                  width={26}
                  height={bottom - 64}
                />
                <rect class="mn-liquid is-kerosene" x={x - 13} y={56} width={26} height={8} />
                {s.showLabels && (
                  <text class="mn-small" x={x + 18} y={62}>
                    {say(locale, WORDS.oil)}
                  </text>
                )}
              </g>
            )}
            {t === RustTube.C && (
              <g>
                {range(12).map((i) => (
                  <circle
                    key={i}
                    class="mn-granule"
                    cx={x - 9 + (i % 4) * 6}
                    cy={bottom - 6 - Math.floor(i / 4) * 5}
                    r={2.6}
                  />
                ))}
                {s.showLabels && (
                  <text class="mn-small" x={x + 20} y={bottom - 6}>
                    {say(locale, WORDS.cacl2)}
                  </text>
                )}
              </g>
            )}
            <Nail x={x - 4} top={42} bottom={bottom - 6} amount={tubeRusts(t) ? amount : 0} />
            <Nail x={x + 5} top={48} bottom={bottom - 4} amount={tubeRusts(t) ? amount : 0} />
            <path
              class="mn-glass-line"
              d={`M${x - 14} ${top} V ${bottom - 10} a 14 14 0 0 0 28 0 V ${top}`}
            />
            <text class="mn-title" x={x} y={bottom + 24} text-anchor="middle">
              {t}
            </text>
            {s.showLabels && (
              <text class="mn-tiny" x={x} y={bottom + 38} text-anchor="middle">
                {say(locale, TUBE_SHORT[t])}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

function Protected({ s }: { s: RustState }) {
  const where = rustWhere(s.coating, s.isScratched);
  const amount = rustAmount(s.days);
  const y = 90;
  const x0 = 60;
  const x1 = 260;
  const zincGoes = s.coating === Coating.Zinc && s.isScratched && amount > 0;
  return (
    <g data-part="nail">
      <rect class="mn-dish" x={30} y={128} width={260} height={18} rx={9} />
      <path class="mn-steam" d="M80 122 q 6 -8 0 -16 M160 122 q 6 -8 0 -16 M240 122 q 6 -8 0 -16" />
      <rect class="mn-nail" x={x0} y={y - 6} width={x1 - x0} height={12} rx={3} />
      <rect class="mn-nail" x={x0 - 10} y={y - 14} width={10} height={28} rx={2} />
      <path class="mn-nail" d={`M${x1} ${y - 6} L ${x1 + 20} ${y} L ${x1} ${y + 6} z`} />
      {s.coating !== Coating.None && (
        <rect
          class={`mn-coating is-${s.coating}`}
          x={x0 - 10}
          y={y - 14}
          width={x1 - x0 + 30}
          height={28}
          rx={4}
        />
      )}
      {s.isScratched && <path class="mn-scratch-line" d={`M150 ${y - 14} l 14 28`} />}
      {amount > 0 && where === RustWhere.All && (
        <g class="mn-rust" style={{ opacity: 0.35 + 0.65 * amount } as JSX.CSSProperties}>
          {range(Math.ceil(14 * amount)).map((i) => (
            <circle key={i} cx={x0 + 8 + i * 14} cy={y - 2 + (i % 3) * 3} r={3 + 2 * amount} />
          ))}
        </g>
      )}
      {amount > 0 && where === RustWhere.Scratch && (
        <g class="mn-rust" style={{ opacity: 0.4 + 0.6 * amount } as JSX.CSSProperties}>
          <circle cx={157} cy={y} r={4 + 4 * amount} />
          <circle cx={152} cy={y - 7} r={2 + 2 * amount} />
          <circle cx={162} cy={y + 7} r={2 + 2 * amount} />
        </g>
      )}
      {zincGoes && <circle class="mn-zinc-white" cx={157} cy={y} r={7} />}
    </g>
  );
}

/** Rust over the days: three tubes (conditions) or one coated nail (protect). */
export function RustLabView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as RustState;
  const k = width / W;
  const height = Math.round(H * k);
  const full = s.days >= MAX_DAYS;
  const zincGoes =
    s.mode === RustMode.Protect &&
    s.coating === Coating.Zinc &&
    s.isScratched &&
    rustAmount(s.days) > 0;
  return (
    <div class="mn mn-ru">
      <Stage
        label={describeRust(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "mn-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mn-bg" x={0} y={0} width={W} height={H} rx={12} />
          <text class="mn-title" x={W - 12} y={20} text-anchor="end" data-part="days">
            {say(locale, WORDS.day)} {s.days}
          </text>
          {s.mode === RustMode.Conditions ? <Tubes s={s} locale={locale} /> : <Protected s={s} />}
          {s.mode === RustMode.Protect && (
            <text class="mn-small" x={12} y={20}>
              {say(locale, COATING_WORDS[s.coating])}
            </text>
          )}
        </g>
      </Stage>
      {zincGoes && <p class="mn-result is-yes">{say(locale, WORDS.zincGoes)}</p>}
      {s.mode === RustMode.Protect && s.coatings.length > 1 && (
        <div class="mn-chips" data-part="coatings">
          {s.coatings.map((c) => (
            <button
              key={c}
              type="button"
              class={c === s.coating ? "mn-chip is-on" : "mn-chip"}
              aria-pressed={c === s.coating}
              onClick={() => call(RustAction.SetCoating, { coating: c })}
            >
              {say(locale, COATING_WORDS[c])}
            </button>
          ))}
        </div>
      )}
      <div class="mn-row">
        {s.mode === RustMode.Protect &&
          s.canScratch &&
          s.coating !== Coating.None &&
          !s.isScratched && (
            <button
              type="button"
              class="mn-button is-again"
              data-part="scratch"
              onClick={() => call(RustAction.Scratch, {})}
            >
              {say(locale, WORDS.scratch)}
            </button>
          )}
        <button
          type="button"
          class={full ? "mn-button is-again" : "mn-button"}
          data-part="wait"
          onClick={() => call(full ? RustAction.Reset : RustAction.Wait, {})}
        >
          {say(locale, full ? WORDS.again : WORDS.wait)}
        </button>
      </div>
    </div>
  );
}
