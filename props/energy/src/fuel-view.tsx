import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  CHECKS,
  type Check,
  FUEL_FACTS,
  FuelAction,
  FuelPart,
  type FuelState,
  Place,
  type Smoke,
  checksOf,
  describeFuels,
  passedOf,
} from "./fuel";
import { type Words, say } from "./words";

const W = 320;
const ROW = 26;
const TOP = 22;
const BAR_X = 116;
const BAR_W = 150;

const WORDS = {
  heat: { en: "heat per gram (kJ/g)", hi: "प्रति ग्राम ऊष्मा (kJ/g)" },
  smoke: { en: "smoke", hi: "धुआँ" },
  tap: { en: "Tap a fuel to see its card", hi: "किसी ईंधन पर टैप करो" },
  village: { en: "In a village", hi: "गाँव में" },
  city: { en: "In a city", hi: "शहर में" },
  passes: { en: "passes", hi: "पास" },
  of4: { en: "of the 4 checks", hi: "/ 4 जाँचें" },
  kjg: { en: "kJ/g", hi: "kJ/g" },
} as const satisfies Record<string, Words>;

const CHECK_WORDS: Readonly<Record<Check, { yes: Words; no: Words }>> = {
  heat: {
    yes: { en: "Lots of heat per gram", hi: "प्रति ग्राम बहुत ऊष्मा" },
    no: { en: "Little heat per gram", hi: "प्रति ग्राम कम ऊष्मा" },
  },
  get: {
    yes: { en: "Easy to get here", hi: "यहाँ आसानी से मिलता है" },
    no: { en: "Hard to get here", hi: "यहाँ मुश्किल से मिलता है" },
  },
  store: {
    yes: { en: "Easy to store and carry", hi: "रखना और ले जाना आसान" },
    no: { en: "Hard to store and carry", hi: "रखना और ले जाना कठिन" },
  },
  cheap: {
    yes: { en: "Cheap", hi: "सस्ता" },
    no: { en: "Costly", hi: "महँगा" },
  },
};

const SMOKE_WORDS: Readonly<Record<Smoke, Words>> = {
  lots: { en: "lots of smoke", hi: "बहुत धुआँ" },
  some: { en: "some smoke", hi: "कुछ धुआँ" },
  little: { en: "little smoke", hi: "थोड़ा धुआँ" },
  none: { en: "no smoke", hi: "धुआँ नहीं" },
};
const SMOKE_PUFFS: Readonly<Record<Smoke, number>> = { lots: 3, some: 2, little: 1, none: 0 };
const PUFF_IDS = ["p1", "p2", "p3"] as const;

export function FuelView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as FuelState;
  const k = width / W;
  const H = TOP + s.fuels.length * ROW + 8;
  const max = Math.max(...s.fuels.map((f) => FUEL_FACTS[f].heat));
  const picked = s.picked;
  return (
    <div class="en-fu">
      <Stage
        label={describeFuels(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "en-svg" }}
      >
        <g transform={`scale(${k})`} data-part={FuelPart.Chart}>
          <rect class="en-bg" x={0} y={0} width={W} height={H} rx={12} />
          <text class="en-small" x={BAR_X} y={15}>
            {say(locale, WORDS.heat)}
          </text>
          {s.showSmoke && (
            <text class="en-tiny" x={W - 8} y={15} text-anchor="end">
              {say(locale, WORDS.smoke)}
            </text>
          )}
          {s.fuels.map((f, i) => {
            const facts = FUEL_FACTS[f];
            const y = TOP + i * ROW;
            const len = (facts.heat / max) * BAR_W;
            const isPicked = picked === f;
            return (
              <g
                key={f}
                class={`en-fuel-row${isPicked ? " is-picked" : ""}${s.canPick ? " is-tappable" : ""}`}
                role={s.canPick ? "button" : undefined}
                tabIndex={s.canPick ? 0 : undefined}
                aria-pressed={s.canPick ? isPicked : undefined}
                aria-label={s.canPick ? say(locale, facts.name) : undefined}
                onClick={s.canPick ? () => call(FuelAction.Pick, { fuel: f }) : undefined}
                onKeyDown={
                  s.canPick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          call(FuelAction.Pick, { fuel: f });
                        }
                      }
                    : undefined
                }
              >
                <rect class="en-row-hit" x={4} y={y} width={W - 8} height={ROW - 4} rx={6} />
                <text class="en-label" x={BAR_X - 6} y={y + 15} text-anchor="end">
                  {say(locale, facts.name)}
                </text>
                <rect
                  class="en-bar"
                  x={BAR_X}
                  y={y + 4}
                  width={Math.max(2, len)}
                  height={ROW - 12}
                  rx={3}
                />
                <text class="en-tiny is-strong" x={BAR_X + len + 4} y={y + 15}>
                  {facts.heat}
                </text>
                {s.showSmoke &&
                  PUFF_IDS.slice(0, SMOKE_PUFFS[facts.smoke]).map((id, j) => (
                    <circle key={id} class="en-puff" cx={W - 14 - j * 9} cy={y + 11} r={3.6} />
                  ))}
              </g>
            );
          })}
        </g>
      </Stage>
      {picked === null ? (
        s.canPick && <p class="en-hint">{say(locale, WORDS.tap)}</p>
      ) : (
        <div class="en-card" data-part={FuelPart.Card}>
          <div class="en-card-head">
            <strong>{say(locale, FUEL_FACTS[picked].name)}</strong>
            <span>
              {FUEL_FACTS[picked].heat} {WORDS.kjg.en} ·{" "}
              {say(locale, SMOKE_WORDS[FUEL_FACTS[picked].smoke])}
            </span>
          </div>
          {s.showChecks && (
            <>
              <ul class="en-checks">
                {CHECKS.map((c) => {
                  const ok = checksOf(picked, s.place)[c];
                  return (
                    <li key={c} class={ok ? "is-yes" : "is-no"}>
                      <span aria-hidden="true">{ok ? "✓" : "✗"}</span>{" "}
                      {say(locale, ok ? CHECK_WORDS[c].yes : CHECK_WORDS[c].no)}
                    </li>
                  );
                })}
              </ul>
              <div class="en-card-foot">
                {say(locale, WORDS.passes)} {passedOf(picked, s.place)} {say(locale, WORDS.of4)}
              </div>
            </>
          )}
        </div>
      )}
      {s.canSetPlace && (
        <div class="en-controls" data-part={FuelPart.Controls}>
          {[Place.Village, Place.City].map((p) => (
            <button
              key={p}
              type="button"
              class={s.place === p ? "en-chip is-on" : "en-chip"}
              aria-pressed={s.place === p}
              onClick={() => call(FuelAction.SetPlace, { place: p })}
            >
              {say(locale, p === Place.Village ? WORDS.village : WORDS.city)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
