import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { subscript } from "./chem";
import { Button, Controls, type Words, say } from "./draw";
import {
  GENERAL,
  SeriesAction,
  SeriesPart,
  type SeriesState,
  describeSeries,
  firstOf,
  rowsOf,
} from "./series";

const WORDS = {
  name: { en: "Name", hi: "नाम" },
  formula: { en: "Formula", hi: "सूत्र" },
  mass: { en: "Mass", hi: "द्रव्यमान" },
  boils: { en: "Boils at", hi: "क्वथनांक" },
  general: { en: "General formula", hi: "सामान्य सूत्र" },
  step: { en: "+ CH₂ · + 14 u", hi: "+ CH₂ · + 14 u" },
  grow: { en: "Add the next one", hi: "अगला जोड़ो" },
  tap: {
    en: "Tap a row to compare it with the one above.",
    hi: "किसी पंक्ति पर टैप करो, ऊपर वाली से तुलना के लिए।",
  },
  alkanes: { en: "alkanes", hi: "ऐल्केन" },
  alkenes: { en: "alkenes", hi: "ऐल्कीन" },
  alkynes: { en: "alkynes", hi: "ऐल्काइन" },
  alcohols: { en: "alcohols", hi: "ऐल्कोहॉल" },
  acids: { en: "carboxylic acids", hi: "कार्बोक्सिलिक अम्ल" },
} as const satisfies Record<string, Words>;

/** The general formula with sub- and superscript-free subscripts: CₙH₂ₙ₊₂. */
function general(g: string): string {
  return g
    .replace(/n−1/g, "ₙ₋₁")
    .replace(/2n\+2/g, "₂ₙ₊₂")
    .replace(/2n−2/g, "₂ₙ₋₂")
    .replace(/2n\+1/g, "₂ₙ₊₁")
    .replace(/2n−1/g, "₂ₙ₋₁")
    .replace(/2n/g, "₂ₙ")
    .replace(/Cn/g, "Cₙ");
}

export function HomologousSeriesView({ view, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SeriesState;
  const rows = rowsOf(s.series, s.upTo);
  const boils = rows.map((r) => r.boiling ?? 0);
  const lo = Math.min(...boils.filter((b) => b > 0)) - 40;
  const hi = Math.max(...boils) || 1;
  return (
    <div class="cb cb-series" role="img" aria-label={describeSeries(s)}>
      {s.choices.length > 0 && (
        <Controls>
          {s.choices.map((c) => (
            <Button
              key={c}
              part={SeriesPart.Series}
              label={say(locale, WORDS[c])}
              isOn={c === s.series}
              onClick={() => call(SeriesAction.Pick, { series: c })}
            />
          ))}
        </Controls>
      )}
      <div class="cb-ladder" data-part={SeriesPart.Table}>
        {rows.map((r, i) => {
          const isOn = s.highlight === r.n || s.highlight === r.n + 1;
          return (
            <div key={r.n}>
              {s.showStep && i > 0 && (
                <div class={`cb-step${s.highlight === r.n ? " is-on" : ""}`}>{WORDS.step.en}</div>
              )}
              <button
                type="button"
                class={`cb-rung${isOn ? " is-on" : ""}`}
                data-part={SeriesPart.Row}
                onClick={() => call(SeriesAction.Highlight, { n: r.n })}
                disabled={r.n === firstOf(s.series)}
              >
                <span class="cb-rung-formula">{subscript(r.formula)}</span>
                <span class="cb-rung-name">{say(locale, r.name)}</span>
                {s.showMass && <span class="cb-rung-mass">{`${r.mass} u`}</span>}
                {s.showBoiling && r.boiling !== null && (
                  <span class="cb-rung-bp">
                    <span
                      class="cb-rung-bar"
                      style={{ width: `${Math.round((78 * (r.boiling - lo)) / (hi - lo))}%` }}
                    />
                    <span class="cb-rung-k">{`${r.boiling} K`}</span>
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
      {s.showGeneral && (
        <p class="cb-caption">{`${say(locale, WORDS.general)}: ${general(GENERAL[s.series])}`}</p>
      )}
      {!s.showGeneral && rows.length > 1 && s.showStep && (
        <p class="cb-hint">{say(locale, WORDS.tap)}</p>
      )}
      {s.canGrow && s.upTo < 6 && (
        <Controls>
          <Button
            part={SeriesPart.Grow}
            label={say(locale, WORDS.grow)}
            onClick={() => call(SeriesAction.Grow, {})}
          />
        </Controls>
      )}
    </div>
  );
}
