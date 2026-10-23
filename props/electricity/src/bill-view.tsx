import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { APPLIANCE_WORDS, Appliance, ApplianceIcon, WATTS } from "./appliances";
import {
  BillAction,
  type BillState,
  HOUR_STEPS,
  biggestOf,
  costOf,
  describeBill,
  monthUnitsOf,
  rowUnitsOf,
  rupees,
  unitsPerDayOf,
} from "./bill";
import { type Words, num, say } from "./words";

const WORDS = {
  hours: { en: "h a day", hi: "घंटे रोज़" },
  units: { en: "units a day", hi: "यूनिट रोज़" },
  perDay: { en: "Units a day", hi: "रोज़ की यूनिट" },
  month: { en: "units in", hi: "यूनिट," },
  days: { en: "days", hi: "दिन में" },
  bill: { en: "Bill", hi: "बिल" },
  perUnit: { en: "a unit", hi: "प्रति यूनिट" },
  toLed: { en: "Swap for LED", hi: "LED लगाओ" },
  toBulb: { en: "Back to bulb", hi: "वापस बल्ब" },
  biggest: { en: "biggest user", hi: "सबसे ज़्यादा खपत" },
  meter: { en: "meter", hi: "मीटर" },
} as const satisfies Record<string, Words>;

function step(values: readonly number[], value: number, by: 1 | -1): number | undefined {
  const i = values.indexOf(value);
  if (i >= 0) return values[i + by];
  return by > 0 ? values.find((v) => v > value) : values.filter((v) => v < value).pop();
}

export function BillView({ view, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as BillState;
  const big = biggestOf(s);
  const maxUnits = Math.max(0.001, ...s.rows.map(rowUnitsOf));
  const units = monthUnitsOf(s);
  return (
    <div class="el-bill" aria-label={describeBill(s)}>
      <div class="el-bill-meter" data-part="meter">
        <span class="el-bill-meter-label">kW h · {say(locale, WORDS.meter)}</span>
        <span class="el-bill-digits">{String(Math.round(units)).padStart(5, "0")}</span>
      </div>
      <ul class="el-bill-rows" data-part="table">
        {s.rows.map((r, i) => {
          const u = rowUnitsOf(r);
          const isBulb = r.appliance === Appliance.Bulb || r.appliance === Appliance.Led;
          const hDown = step(HOUR_STEPS, r.hours, -1);
          const hUp = step(HOUR_STEPS, r.hours, 1);
          return (
            <li
              key={r.appliance}
              class={big === r.appliance ? "el-bill-row is-big" : "el-bill-row"}
              data-part={`row${i}`}
            >
              <svg
                class="el-bill-icon"
                viewBox="-20 -20 40 40"
                width={40}
                height={40}
                aria-hidden="true"
              >
                <ApplianceIcon appliance={r.appliance} on={u > 0} />
              </svg>
              <div class="el-bill-main">
                <span class="el-bill-name">
                  {r.count} × {say(locale, APPLIANCE_WORDS[r.appliance])}{" "}
                  <span class="el-bill-watts">({WATTS[r.appliance]} W)</span>
                  {big === r.appliance && (
                    <span class="el-bill-flag"> · {say(locale, WORDS.biggest)}</span>
                  )}
                </span>
                {s.showWorking && (
                  <span class="el-bill-working">
                    {r.count} × {WATTS[r.appliance]} W × {num(r.hours)} h = {num(u * 1000, 0)} W h ={" "}
                    {num(u, 2)} kW h
                  </span>
                )}
                {s.showBars && (
                  <span class="el-bill-bar">
                    <span class="el-bill-bar-fill" style={{ width: `${(100 * u) / maxUnits}%` }} />
                  </span>
                )}
                {(s.canEdit || (s.canSwap && isBulb)) && (
                  <span class="el-bill-edit">
                    {s.canEdit && (
                      <span class="el-stepper">
                        <button
                          type="button"
                          class="el-button is-small"
                          aria-label="−"
                          disabled={hDown === undefined}
                          onClick={() => call(BillAction.SetHours, { index: i, hours: hDown })}
                        >
                          −
                        </button>
                        <span class="el-stepper-value">
                          {num(r.hours)} {say(locale, WORDS.hours)}
                        </span>
                        <button
                          type="button"
                          class="el-button is-small"
                          aria-label="+"
                          disabled={hUp === undefined}
                          onClick={() => call(BillAction.SetHours, { index: i, hours: hUp })}
                        >
                          +
                        </button>
                      </span>
                    )}
                    {s.canSwap && isBulb && (
                      <button
                        type="button"
                        class="el-button is-small"
                        onClick={() => call(BillAction.Swap, { index: i })}
                      >
                        {say(locale, r.appliance === Appliance.Bulb ? WORDS.toLed : WORDS.toBulb)}
                      </button>
                    )}
                  </span>
                )}
              </div>
              <span class="el-bill-units">
                {num(u, 2)}
                <span class="el-bill-unit-word"> {say(locale, WORDS.units)}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <div class="el-readout" data-part="total">
        <span>
          {say(locale, WORDS.perDay)}: {num(unitsPerDayOf(s), 2)} kW h
        </span>
        <span>
          {num(unitsPerDayOf(s), 2)} × {s.days} = {num(units, 1)} {say(locale, WORDS.month)}{" "}
          {s.days} {say(locale, WORDS.days)}
        </span>
        <span class="el-readout-main">
          {say(locale, WORDS.bill)}: {num(units, 1)} × {rupees(s.rate)} {say(locale, WORDS.perUnit)}{" "}
          = {rupees(costOf(s))}
        </span>
      </div>
    </div>
  );
}
