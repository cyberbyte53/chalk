import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  FlowAction,
  type FlowState,
  METHOD_WORDS,
  Method,
  OreKind,
  describeFlow,
  methodOf,
  pathOf,
} from "./extraction-flow";
import { METAL_NAMES } from "./metal-data";
import { type Words, say } from "./words";

const W = 320;
const H = 210;

const WORDS = {
  next: { en: "Next step →", hi: "अगला चरण →" },
  again: { en: "↺ From the ore", hi: "↺ अयस्क से फिर" },
  sulphide: { en: "sulphide ore", hi: "सल्फ़ाइड अयस्क" },
  carbonate: { en: "carbonate ore", hi: "कार्बोनेट अयस्क" },
} as const satisfies Record<string, Words>;

/** Short names for the bands' methods. */
const BAND_LABEL: Record<Method, Words> = {
  electrolysis: { en: "electrolysis", hi: "विद्युत अपघटन" },
  carbon: { en: "carbon", hi: "कार्बन" },
  heatAlone: { en: "heat alone", hi: "केवल ताप" },
  native: { en: "found free", hi: "मुक्त" },
};

/** Fig 3.9: the series in four bands, each with its method. */
const BANDS: { metals: string[]; method: Method }[] = [
  { metals: ["K", "Na", "Ca", "Mg", "Al"], method: Method.Electrolysis },
  { metals: ["Zn", "Fe", "Pb"], method: Method.Carbon },
  { metals: ["Cu", "Hg"], method: Method.HeatAlone },
  { metals: ["Ag", "Au"], method: Method.Native },
];

function SeriesBands({ s, locale }: { s: FlowState; locale: string }) {
  const x = 8;
  const rowH = 13.4;
  let y = 14;
  const method = methodOf(s.metal);
  return (
    <g class="mn-bands" data-part="series">
      {BANDS.map((band) => {
        const top = y;
        const h = band.metals.length * rowH + 6;
        y += h + 4;
        return (
          <g key={band.method}>
            <rect
              class={band.method === method ? "mn-band is-on" : "mn-band"}
              x={x}
              y={top}
              width={92}
              height={h}
              rx={6}
            />
            {band.metals.map((m, i) => (
              <text
                key={m}
                class={m === s.metal ? "mn-band-metal is-on" : "mn-band-metal"}
                x={x + 8}
                y={top + 13 + i * rowH}
              >
                {m}
              </text>
            ))}
            <text class="mn-band-method" x={x + 30} y={top + h / 2 + 3}>
              {say(locale, BAND_LABEL[band.method])}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** The path from ore to refined metal as a chain of boxes, the step reached highlighted. */
export function ExtractionFlowView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as FlowState;
  const path = pathOf(s.metal, s.ore);
  const k = width / W;
  const height = Math.round(H * k);
  const left = s.showSeries ? 112 : 24;
  const boxW = W - left - 12;
  const gap = 5;
  const boxH = Math.min(24, (H - 16 - gap * (path.length - 1)) / path.length);
  const at = path[s.step];
  const isLast = s.step === path.length - 1;
  return (
    <div class="mn mn-xf">
      <Stage
        label={describeFlow(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "mn-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mn-bg" x={0} y={0} width={W} height={H} rx={12} />
          {s.showSeries && <SeriesBands s={s} locale={locale} />}
          <g data-part="path">
            {path.map((p, i) => {
              const y = 8 + i * (boxH + gap);
              const cls = i === s.step ? "mn-box is-on" : i < s.step ? "mn-box is-done" : "mn-box";
              return (
                <g key={p.name.en}>
                  {i > 0 && (
                    <path class="mn-box-arrow" d={`M${left + boxW / 2} ${y - gap} v ${gap - 1}`} />
                  )}
                  <rect class={cls} x={left} y={y} width={boxW} height={boxH} rx={6} />
                  <text
                    class="mn-box-text"
                    x={left + boxW / 2}
                    y={y + boxH / 2 + 4}
                    text-anchor="middle"
                  >
                    {say(locale, p.name)}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </Stage>
      {at !== undefined && (
        <div class="mn-detail" data-part="detail">
          <p class="mn-caption">{say(locale, at.detail)}</p>
          {at.equations.map((e) => (
            <p key={e} class="mn-equation">
              {e}
            </p>
          ))}
        </div>
      )}
      {s.metals.length > 1 && (
        <div class="mn-chips" data-part="metals">
          {s.metals.map((m) => (
            <button
              key={m}
              type="button"
              class={m === s.metal ? "mn-chip is-on" : "mn-chip"}
              aria-pressed={m === s.metal}
              title={say(locale, METAL_NAMES[m])}
              onClick={() => call(FlowAction.ChooseMetal, { metal: m })}
            >
              {m}
            </button>
          ))}
        </div>
      )}
      {methodOf(s.metal) === Method.Carbon && (
        <div class="mn-chips" data-part="ores">
          {[OreKind.Sulphide, OreKind.Carbonate].map((o) => (
            <button
              key={o}
              type="button"
              class={o === s.ore ? "mn-chip is-on" : "mn-chip"}
              aria-pressed={o === s.ore}
              onClick={() => call(FlowAction.ChooseOre, { ore: o })}
            >
              {say(locale, o === OreKind.Sulphide ? WORDS.sulphide : WORDS.carbonate)}
            </button>
          ))}
        </div>
      )}
      {s.canStep && (
        <div class="mn-row is-end">
          <button
            type="button"
            class="mn-button"
            data-part="next"
            onClick={() => call(FlowAction.Next, {})}
          >
            {say(locale, isLast ? WORDS.again : WORDS.next)}
          </button>
        </div>
      )}
    </div>
  );
}
