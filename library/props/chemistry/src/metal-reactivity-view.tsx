import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { METAL_NAMES, type MetalElement, REACTIVITY_SERIES, metalColourClass } from "./metal-data";
import {
  type LabMetal,
  REAGENT_NAMES,
  ReactivityAction,
  type ReactivityState,
  Reagent,
  type SolutionColour,
  describeReactivity,
  reactionOf,
} from "./metal-reactivity";
import { type Words, range, say } from "./words";

const W = 320;
const H = 180;
const FLOOR = 164;

const WORDS = {
  start: { en: "Put it in", hi: "डालो" },
  startFlame: { en: "Heat it", hi: "गरम करो" },
  again: { en: "Take it out", hi: "बाहर निकालो" },
  notDone: { en: "not done", hi: "नहीं करते" },
  series: { en: "Reactivity", hi: "अभिक्रियाशीलता" },
  most: { en: "most", hi: "सबसे अधिक" },
  least: { en: "least", hi: "सबसे कम" },
  metal: { en: "Metal", hi: "धातु" },
  into: { en: "Into", hi: "किसमें" },
} as const satisfies Record<string, Words>;

const colourClass = (c: SolutionColour | null) => `mn-liquid is-${c ?? "water"}`;

function Bubbles({ x, y, top, n }: { x: number; y: number; top: number; n: number }) {
  return (
    <g class="mn-bubbles">
      {range(n).map((i) => (
        <circle
          key={i}
          class="mn-bubble"
          cx={x - 8 + ((i * 7) % 17)}
          cy={y}
          r={1.4 + (i % 3) * 0.5}
          style={
            {
              "--rise": `${-(y - top)}px`,
              animationDelay: `${(i * 0.37) % 1.6}s`,
              animationDuration: `${n > 10 ? 0.9 : n > 5 ? 1.4 : 2.2}s`,
            } as JSX.CSSProperties
          }
        />
      ))}
    </g>
  );
}

function Flame({
  x,
  y,
  s = 1,
  cls = "mn-flame",
}: { x: number; y: number; s?: number; cls?: string }) {
  return (
    <path
      class={cls}
      d={`M${x} ${y} q ${9 * s} ${-12 * s} 0 ${-26 * s} q ${15 * s} ${10 * s} ${8 * s} ${26 * s} z`}
    />
  );
}

function Burner({ x }: { x: number }) {
  return (
    <g>
      <Flame x={x - 4} y={FLOOR - 26} s={0.8} />
      <rect class="mn-lamp" x={x - 12} y={FLOOR - 26} width={24} height={26} rx={4} />
    </g>
  );
}

function Thermometer({ x, rise }: { x: number; rise: number }) {
  const top = 46;
  const bottom = 136;
  const level = bottom - 22 - rise * 14;
  return (
    <g data-part="thermometer">
      <rect class="mn-thermo" x={x - 3} y={top} width={6} height={bottom - top} rx={3} />
      <rect
        class="mn-thermo-fill"
        x={x - 1.5}
        y={level}
        width={3}
        height={bottom - level}
        style={{ transition: "y 2s ease, height 2s ease" } as JSX.CSSProperties}
      />
      <circle class="mn-thermo-bulb" cx={x} cy={bottom + 2} r={5} />
    </g>
  );
}

/** The apparatus for this reagent, with the metal, and what happens once started. */
function Apparatus({ s, cx }: { s: ReactivityState; cx: number }): JSX.Element {
  const o = reactionOf(s.metal, s.reagent);
  const started = s.isStarted && o.intensity !== null;
  const n = started ? ([0, 3, 6, 12, 18][o.intensity ?? 0] ?? 0) : 0;
  const metal = metalColourClass(s.metal as MetalElement);
  if (s.reagent === Reagent.Air) {
    const y = 108;
    return (
      <g>
        <Burner x={cx} />
        <path
          class="mn-tongs"
          d={`M${cx + 70} ${y - 20} L ${cx + 8} ${y - 2} M${cx + 70} ${y - 12} L ${cx + 8} ${y + 2}`}
        />
        <rect class={`mn-strip ${metal}`} x={cx - 26} y={y - 3} width={36} height={6} rx={1.5} />
        {started && o.coat !== null && (
          <rect
            class={`mn-coat is-${o.coat} mn-after-slow`}
            x={cx - 26}
            y={y - 3}
            width={36}
            height={6}
            rx={1.5}
          />
        )}
        {started && o.isOnFire && (
          <g class="mn-after">
            <circle
              class={s.metal === "Mg" ? "mn-dazzle" : "mn-glow"}
              cx={cx - 10}
              cy={y}
              r={s.metal === "Mg" ? 30 : 20}
            />
            <Flame x={cx - 12} y={y - 2} s={1.1} cls="mn-flame is-burning" />
          </g>
        )}
        {started && s.metal === "Fe" && (
          <g class="mn-sparks mn-after">
            {range(7).map((i) => (
              <circle key={i} cx={cx - 14 + i * 5} cy={y - 18 - (i % 3) * 7} r={1.4} />
            ))}
          </g>
        )}
      </g>
    );
  }
  if (s.reagent === Reagent.Steam) {
    const y = 92;
    return (
      <g>
        <rect class="mn-glass" x={cx - 70} y={y - 9} width={130} height={18} rx={9} />
        <path
          class="mn-steam"
          d={`M${cx - 96} ${y} h 24 M${cx - 96} ${y - 5} q 6 -4 12 0 t 12 0`}
        />
        <rect class={`mn-strip ${metal}`} x={cx - 24} y={y - 4} width={40} height={8} rx={2} />
        <Burner x={cx - 4} />
        {started && o.givesHydrogen && (
          <g class="mn-after">
            <path class="mn-gas-out" d={`M${cx + 60} ${y} h 30`} />
            <text class="mn-small" x={cx + 76} y={y - 8} text-anchor="middle">
              H₂
            </text>
          </g>
        )}
      </g>
    );
  }
  const isBeaker = s.reagent === Reagent.ColdWater || s.reagent === Reagent.HotWater;
  if (isBeaker) {
    const left = cx - 52;
    const right = cx + 52;
    const top = 58;
    const surface = 76;
    const bottom = FLOOR - (s.reagent === Reagent.HotWater ? 30 : 4);
    const floats = started && o.floats;
    const pieceY = floats || (started && o.isOnFire) ? surface - 3 : bottom - 8;
    return (
      <g>
        {s.reagent === Reagent.HotWater && (
          <g>
            <rect class="mn-stand" x={left - 4} y={bottom} width={right - left + 8} height={3} />
            <Burner x={cx} />
          </g>
        )}
        <rect
          class="mn-liquid is-water"
          x={left + 2}
          y={surface}
          width={right - left - 4}
          height={bottom - surface}
        />
        {s.reagent === Reagent.HotWater && (
          <path
            class="mn-steam"
            d={`M${cx - 20} ${surface - 6} q 6 -8 0 -16 M${cx + 12} ${surface - 6} q 6 -8 0 -16`}
          />
        )}
        {started && n > 0 && <Bubbles x={cx} y={bottom - 6} top={surface + 2} n={n} />}
        <g
          class="mn-piece"
          style={{ transform: `translate(${cx - 8}px, ${pieceY}px)` } as JSX.CSSProperties}
        >
          <rect class={`mn-strip ${metal}`} x={0} y={0} width={16} height={7} rx={2} />
        </g>
        {started && o.isOnFire && (
          <g class="mn-after">
            <circle class="mn-glow" cx={cx} cy={surface - 8} r={18} />
            <Flame x={cx - 2} y={surface - 4} s={1} cls="mn-flame is-burning" />
          </g>
        )}
        <path class="mn-glass-line" d={`M${left} ${top} V ${bottom} H ${right} V ${top}`} />
      </g>
    );
  }
  // A test tube of acid or of a salt solution.
  const tx = cx - 8;
  const tubeTop = 42;
  const tubeBottom = 140;
  const surface = 66;
  const liquid =
    s.reagent === Reagent.DiluteAcid
      ? null
      : started && o.colourAfter !== null
        ? o.colourAfter
        : o.colourBefore;
  return (
    <g>
      <rect
        class={liquid === null ? "mn-liquid is-water" : colourClass(liquid)}
        x={tx - 13}
        y={surface}
        width={26}
        height={tubeBottom - surface}
        style={{ transition: "fill 3s ease" } as JSX.CSSProperties}
      />
      {started && n > 0 && <Bubbles x={tx} y={tubeBottom - 22} top={surface + 2} n={n} />}
      <rect class={`mn-strip ${metal}`} x={tx - 5} y={surface + 20} width={10} height={50} rx={2} />
      {started && o.deposit !== null && (
        <rect
          class={`mn-coat-metal ${metalColourClass(o.deposit)} mn-after-slow`}
          x={tx - 6.5}
          y={surface + 30}
          width={13}
          height={40}
          rx={3}
        />
      )}
      <path
        class="mn-glass-line"
        d={`M${tx - 14} ${tubeTop} V ${tubeBottom - 12} a 14 14 0 0 0 28 0 V ${tubeTop}`}
      />
      {s.showThermometer && <Thermometer x={tx + 30} rise={started ? (o.intensity ?? 0) : 0} />}
    </g>
  );
}

function Series({ s, x }: { s: ReactivityState; x: number }) {
  const rows: (MetalElement | "H")[] = [...REACTIVITY_SERIES];
  rows.splice(rows.indexOf("Cu"), 0, "H");
  const top = 18;
  const step = 11.4;
  return (
    <g class="mn-series" data-part="series">
      <rect class="mn-series-bg" x={x} y={6} width={W - x - 6} height={H - 12} rx={8} />
      {rows.map((m, i) => (
        <g key={m}>
          {m === s.metal && (
            <rect
              class="mn-series-on"
              x={x + 4}
              y={top + i * step - 8.5}
              width={W - x - 14}
              height={11}
              rx={4}
            />
          )}
          <text
            class={
              m === "H" ? "mn-series-h" : m === s.metal ? "mn-series-name is-on" : "mn-series-name"
            }
            x={x + 10}
            y={top + i * step}
          >
            {m === "H" ? "[H]" : m}
          </text>
        </g>
      ))}
      <path
        class="mn-series-arrow"
        d={`M${W - 18} ${top - 4} V ${top + (rows.length - 1) * step}`}
      />
    </g>
  );
}

/** The bench: pick a metal and what it goes into, start, watch; optionally the series beside it. */
export function ReactivityLabView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ReactivityState;
  const k = width / W;
  const height = Math.round(H * k);
  const o = reactionOf(s.metal, s.reagent);
  const cx = s.showSeries ? 112 : 160;
  const notDone = s.isStarted && o.intensity === null;
  return (
    <div class="mn mn-rl">
      <Stage
        label={describeReactivity(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "mn-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mn-bg" x={0} y={0} width={W} height={H} rx={12} />
          <rect class="mn-bench" x={0} y={FLOOR} width={W} height={H - FLOOR} />
          <text class="mn-title" x={12} y={20}>
            {say(locale, METAL_NAMES[s.metal])}
          </text>
          <text class="mn-small" x={12} y={34}>
            {say(locale, REAGENT_NAMES[s.reagent])}
          </text>
          <g key={`${s.metal}-${s.reagent}-${s.isStarted}`} data-part="apparatus">
            <Apparatus s={s} cx={cx} />
          </g>
          {notDone && (
            <g class="mn-after">
              <rect class="mn-stop" x={cx - 44} y={H / 2 - 16} width={88} height={26} rx={13} />
              <text class="mn-stop-text" x={cx} y={H / 2 + 2} text-anchor="middle">
                ✋ {say(locale, WORDS.notDone)}
              </text>
            </g>
          )}
          {s.showSeries && <Series s={s} x={226} />}
        </g>
      </Stage>
      {s.isStarted && (
        <p class={notDone ? "mn-result is-no" : "mn-result"} data-part="seen">
          {say(locale, o.seen)}
        </p>
      )}
      {s.isStarted && s.showEquation && o.equation !== null && (
        <p class="mn-equation" data-part="equation">
          {o.equation}
        </p>
      )}
      {s.canChoose && s.metals.length > 1 && (
        <div class="mn-chips" data-part="metals" aria-label={say(locale, WORDS.metal)}>
          {s.metals.map((m: LabMetal) => (
            <button
              key={m}
              type="button"
              class={m === s.metal ? "mn-chip is-on" : "mn-chip"}
              aria-pressed={m === s.metal}
              title={say(locale, METAL_NAMES[m])}
              onClick={() => call(ReactivityAction.ChooseMetal, { metal: m })}
            >
              {m}
            </button>
          ))}
        </div>
      )}
      {s.canChoose && s.reagents.length > 1 && (
        <div class="mn-chips" data-part="reagents" aria-label={say(locale, WORDS.into)}>
          {s.reagents.map((r) => (
            <button
              key={r}
              type="button"
              class={r === s.reagent ? "mn-chip is-on" : "mn-chip"}
              aria-pressed={r === s.reagent}
              onClick={() => call(ReactivityAction.ChooseReagent, { reagent: r })}
            >
              {say(locale, REAGENT_NAMES[r])}
            </button>
          ))}
        </div>
      )}
      <div class="mn-row">
        <button
          type="button"
          class={s.isStarted ? "mn-button is-again" : "mn-button"}
          data-part="start"
          onClick={() => call(s.isStarted ? ReactivityAction.Reset : ReactivityAction.Start, {})}
        >
          {say(
            locale,
            s.isStarted ? WORDS.again : s.reagent === Reagent.Air ? WORDS.startFlame : WORDS.start,
          )}
        </button>
      </div>
    </div>
  );
}
