import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { NATURE_WORDS, subscripted } from "./acid-data";
import {
  ANIONS,
  type Anion,
  CATIONS,
  type Cation,
  SALTS,
  SaltFamilyAction,
  type SaltFamilyState,
  type SaltId,
  describeSaltFamily,
  saltName,
  saltNature,
} from "./salt-family";
import { type Words, say } from "./words";

const WORDS = {
  fromBase: { en: "from a base →", hi: "क्षारक से →" },
  fromAcid: { en: "from an acid ↓", hi: "अम्ल से ↓" },
  strong: { en: "strong", hi: "प्रबल" },
  weak: { en: "weak", hi: "दुर्बल" },
  acid: { en: "acid", hi: "अम्ल" },
  base: { en: "base", hi: "क्षारक" },
  tap: {
    en: "Tap a salt, or a row or column for a family",
    hi: "किसी लवण पर टैप करो, या परिवार के लिए किसी पंक्ति या स्तंभ पर",
  },
  because: {
    neutral: {
      en: "strong acid + strong base → neutral (pH 7)",
      hi: "प्रबल अम्ल + प्रबल क्षारक → उदासीन (pH 7)",
    },
    acidic: {
      en: "strong acid + weak base → acidic (pH below 7)",
      hi: "प्रबल अम्ल + दुर्बल क्षारक → अम्लीय (pH 7 से कम)",
    },
    basic: {
      en: "weak acid + strong base → basic (pH above 7)",
      hi: "दुर्बल अम्ल + प्रबल क्षारक → क्षारीय (pH 7 से अधिक)",
    },
  },
} as const;

const strength = (isStrong: boolean): Words => (isStrong ? WORDS.strong : WORDS.weak);

/** The salt grid (positive part × negative part) and a card for the salt tapped. */
export function SaltFamilyView({ view, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SaltFamilyState;
  const cations = [...new Set(s.salts.map((x) => SALTS[x].cation))] as Cation[];
  const anions = [...new Set(s.salts.map((x) => SALTS[x].anion))] as Anion[];
  const at = (c: Cation, a: Anion): SaltId | undefined =>
    s.salts.find((x) => SALTS[x].cation === c && SALTS[x].anion === a);
  const isLit = (x: SaltId) =>
    s.highlight !== null && (SALTS[x].cation === s.highlight || SALTS[x].anion === s.highlight);
  const picked = s.picked;
  return (
    <div class="sf ac" aria-label={describeSaltFamily(s)}>
      <div class="sf-scroll" data-part="grid">
        <table class="sf-grid">
          <thead>
            <tr>
              <th class="sf-corner" scope="col">
                <span>{say(locale, WORDS.fromAcid)}</span>
                <span>{say(locale, WORDS.fromBase)}</span>
              </th>
              {anions.map((a) => (
                <th key={a} scope="col">
                  <button
                    type="button"
                    class={s.highlight === a ? "sf-head is-lit" : "sf-head"}
                    disabled={!s.canHighlight}
                    onClick={() => call(SaltFamilyAction.Highlight, { ion: a })}
                  >
                    <span class="sf-ion">{ANIONS[a].ion}</span>
                    <span class="sf-ion-name">{say(locale, ANIONS[a].name)}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cations.map((c) => (
              <tr key={c}>
                <th scope="row">
                  <button
                    type="button"
                    class={s.highlight === c ? "sf-head is-lit" : "sf-head"}
                    disabled={!s.canHighlight}
                    onClick={() => call(SaltFamilyAction.Highlight, { ion: c })}
                  >
                    <span class="sf-ion">{CATIONS[c].ion}</span>
                    <span class="sf-ion-name">{say(locale, CATIONS[c].name)}</span>
                  </button>
                </th>
                {anions.map((a) => {
                  const salt = at(c, a);
                  if (salt === undefined) return <td key={a} class="sf-empty" />;
                  const cls = [
                    "sf-salt",
                    isLit(salt) ? "is-lit" : "",
                    picked === salt ? "is-picked" : "",
                  ].join(" ");
                  return (
                    <td key={a}>
                      <button
                        type="button"
                        class={cls}
                        disabled={!s.canPick}
                        aria-pressed={picked === salt}
                        onClick={() => call(SaltFamilyAction.Pick, { salt })}
                      >
                        {subscripted(SALTS[salt].formula)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(s.canPick || s.canHighlight) && picked === null && (
        <p class="ac-hint">{say(locale, WORDS.tap)}</p>
      )}
      {picked !== null && (
        <div class={`sf-card is-${s.showNature ? saltNature(picked) : "plain"}`} data-part="card">
          <p class="sf-card-title">
            <strong>{subscripted(SALTS[picked].formula)}</strong> {say(locale, saltName(picked))}
          </p>
          {s.showParents && (
            <p class="sf-parents">
              <span>
                {subscripted(ANIONS[SALTS[picked].anion].acid.formula)} (
                {say(locale, strength(ANIONS[SALTS[picked].anion].acid.isStrong))}{" "}
                {say(locale, WORDS.acid)})
              </span>
              <span> + </span>
              <span>
                {subscripted(CATIONS[SALTS[picked].cation].base.formula)} (
                {say(locale, strength(CATIONS[SALTS[picked].cation].base.isStrong))}{" "}
                {say(locale, WORDS.base)})
              </span>
            </p>
          )}
          {s.showNature && (
            <p class="sf-nature">
              <strong>{say(locale, NATURE_WORDS[saltNature(picked)])}</strong>:{" "}
              {say(locale, WORDS.because[saltNature(picked)])}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
