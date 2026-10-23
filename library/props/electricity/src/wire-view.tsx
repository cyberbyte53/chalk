import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  ALLOYS,
  BASE_AREA_M2,
  MATERIAL_ORDER,
  type Material,
  RESISTIVITY,
  WireAction,
  type WireSpec,
  type WireState,
  currentOf,
  describeWire,
  resistanceOf,
} from "./wire";
import {
  type Words,
  amps as ampsText,
  num,
  ohms as ohmsText,
  say,
  sig,
  superscript,
} from "./words";

const W = 320;
/** Pixels per unit of length l. */
const PER_L = 62;
const LEFT = 30;

export const MATERIAL_WORDS: Readonly<Record<Material, Words>> = {
  silver: { en: "Silver", hi: "चाँदी" },
  copper: { en: "Copper", hi: "ताँबा" },
  aluminium: { en: "Aluminium", hi: "ऐलुमिनियम" },
  tungsten: { en: "Tungsten", hi: "टंगस्टन" },
  nickel: { en: "Nickel", hi: "निकेल" },
  iron: { en: "Iron", hi: "लोहा" },
  chromium: { en: "Chromium", hi: "क्रोमियम" },
  mercury: { en: "Mercury", hi: "पारा" },
  manganese: { en: "Manganese", hi: "मैंगनीज़" },
  constantan: { en: "Constantan", hi: "कॉन्स्टेन्टन" },
  manganin: { en: "Manganin", hi: "मैंगनिन" },
  nichrome: { en: "Nichrome", hi: "नाइक्रोम" },
};

const WORDS = {
  ref: { en: "wire (1)", hi: "तार (1)" },
  now: { en: "this wire", hi: "यह तार" },
  longer: { en: "Longer", hi: "लंबा" },
  shorter: { en: "Shorter", hi: "छोटा" },
  thicker: { en: "Thicker", hi: "मोटा" },
  thinner: { en: "Thinner", hi: "पतला" },
  keep: { en: "Make this wire (1)", hi: "इसे तार (1) बनाओ" },
  compared: { en: "Compared with wire (1):", hi: "तार (1) की तुलना में:" },
  resistance: { en: "resistance", hi: "प्रतिरोध" },
  current: { en: "current", hi: "धारा" },
  material: { en: "Material", hi: "पदार्थ" },
  rho: { en: "Resistivity ρ (Ω m)", hi: "प्रतिरोधकता ρ (Ω m)" },
  metals: { en: "metals", hi: "धातुएँ" },
  alloys: { en: "alloys", hi: "मिश्रातु" },
  cell: { en: "one 1.5 V cell", hi: "एक 1.5 V सेल" },
} as const satisfies Record<string, Words>;

const lengthText = (m: number) => (m === 1 ? "l" : m === 0.5 ? "l/2" : `${num(m)}l`);
const areaText = (m: number) => (m === 1 ? "A" : m === 0.5 ? "A/2" : `${num(m)}A`);

/** ρ written as a × 10ⁿ. */
export function rhoText(rho: number): string {
  const exp = rho >= 1e-6 ? -6 : -8;
  return `${num(rho / 10 ** exp, 2)} × 10${superscript(exp)}`;
}

function WireBar({ w, y, faded }: { w: WireSpec; y: number; faded?: boolean }): JSX.Element {
  const len = w.length * PER_L;
  const thick = 3 + 4 * Math.sqrt(w.area);
  return (
    <g class={faded ? "el-wr-bar is-faded" : "el-wr-bar"}>
      <rect class="el-wr-clip" x={LEFT - 8} y={y - 6} width={8} height={12} rx={2} />
      <rect
        class={`el-wr-metal is-${w.material}`}
        x={LEFT}
        y={y - thick / 2}
        width={len}
        height={thick}
        rx={thick / 2}
      />
      <rect class="el-wr-clip" x={LEFT + len} y={y - 6} width={8} height={12} rx={2} />
    </g>
  );
}

export function WireView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as WireState;
  const k = width / W;
  const w: WireSpec = { material: s.material, length: s.length, area: s.area };
  const r = resistanceOf(w);
  const ref = s.reference;
  const H = ref === null ? 64 : 104;
  const y = ref === null ? 34 : 74;
  return (
    <div class="el-wr">
      <Stage
        label={describeWire(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "el-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="el-bg" x={0} y={0} width={W} height={H} rx={12} />
          {ref !== null && (
            <g data-part="reference">
              <text class="el-small" x={LEFT} y={16}>
                {say(locale, WORDS.ref)}: {say(locale, MATERIAL_WORDS[ref.material])},{" "}
                {lengthText(ref.length)}, {areaText(ref.area)}
              </text>
              <WireBar w={ref} y={32} faded />
            </g>
          )}
          <g data-part="wire">
            <text class="el-label" x={LEFT} y={y - 16}>
              {say(locale, WORDS.now)}: {say(locale, MATERIAL_WORDS[s.material])},{" "}
              {lengthText(s.length)}, {areaText(s.area)}
            </text>
            <WireBar w={w} y={y} />
          </g>
        </g>
      </Stage>
      <div class="el-readout" data-part="readout">
        {s.showFormula && (
          <span>
            R = ρl/A = {rhoText(RESISTIVITY[s.material])} Ω m × {num(s.length)} m ÷{" "}
            {sig(BASE_AREA_M2 * s.area, 3)} m²
          </span>
        )}
        <span class="el-readout-main">
          R = {ohmsText(r)}
          {s.showCurrent ? `   ·   I = 1.5 V ÷ R = ${ampsText(currentOf(w))}` : ""}
        </span>
        {ref !== null && (
          <span>
            {say(locale, WORDS.compared)} R × {sig(r / resistanceOf(ref), 3)}
            {s.showCurrent ? `, I × ${sig(currentOf(w) / currentOf(ref), 3)}` : ""}
          </span>
        )}
      </div>
      {(s.canSetLength || s.canSetArea) && (
        <div class="el-controls" data-part="controls">
          {s.canSetLength && (
            <>
              <button
                type="button"
                class="el-button"
                disabled={s.length <= 0.5}
                onClick={() => call(WireAction.SetLength, { length: s.length - 0.5 })}
              >
                {say(locale, WORDS.shorter)}
              </button>
              <button
                type="button"
                class="el-button"
                disabled={s.length >= 4}
                onClick={() => call(WireAction.SetLength, { length: s.length + 0.5 })}
              >
                {say(locale, WORDS.longer)}
              </button>
            </>
          )}
          {s.canSetArea && (
            <>
              <button
                type="button"
                class="el-button"
                disabled={s.area <= 0.5}
                onClick={() => call(WireAction.SetArea, { area: s.area - 0.5 })}
              >
                {say(locale, WORDS.thinner)}
              </button>
              <button
                type="button"
                class="el-button"
                disabled={s.area >= 4}
                onClick={() => call(WireAction.SetArea, { area: s.area + 0.5 })}
              >
                {say(locale, WORDS.thicker)}
              </button>
            </>
          )}
          {ref !== null && (
            <button
              type="button"
              class="el-button"
              onClick={() => call(WireAction.MarkReference, {})}
            >
              {say(locale, WORDS.keep)}
            </button>
          )}
        </div>
      )}
      {s.canSetMaterial && (
        <div class="el-choices">
          {MATERIAL_ORDER.map((m) => (
            <button
              key={m}
              type="button"
              class={s.material === m ? "el-chip is-on" : "el-chip"}
              aria-pressed={s.material === m}
              onClick={() => call(WireAction.SetMaterial, { material: m })}
            >
              {say(locale, MATERIAL_WORDS[m])}
            </button>
          ))}
        </div>
      )}
      {s.showTable && (
        <table class="el-table" data-part="table">
          <thead>
            <tr>
              <th>{say(locale, WORDS.material)}</th>
              <th>{say(locale, WORDS.rho)}</th>
            </tr>
          </thead>
          <tbody>
            {MATERIAL_ORDER.map((m) => (
              <tr key={m} class={m === s.material ? "is-current" : ""}>
                <td>
                  {say(locale, MATERIAL_WORDS[m])}
                  {ALLOYS.includes(m) ? ` (${say(locale, WORDS.alloys)})` : ""}
                </td>
                <td>{rhoText(RESISTIVITY[m])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
