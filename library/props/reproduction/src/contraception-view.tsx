import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  type Category,
  ContraceptionAction,
  ContraceptionMethod,
  ContraceptionPart,
  type ContraceptionState,
  type ContraceptiveMethod,
  METHODS,
} from "./contraception";
import { type Words, say } from "./draw";

const NAMES: Readonly<Record<ContraceptiveMethod, Words>> = {
  condom: { en: "Condom", hi: "कंडोम" },
  pill: { en: "Oral pills", hi: "मुखीय गोलियाँ" },
  copperT: { en: "Loop / copper-T", hi: "लूप / कॉपर-T" },
  surgical: { en: "Surgical method", hi: "शल्य विधि" },
};

const CATEGORIES: Readonly<Record<Category, Words>> = {
  barrier: { en: "barrier", hi: "अवरोध" },
  hormonal: { en: "hormonal", hi: "हॉर्मोनी" },
  device: { en: "device in the uterus", hi: "गर्भाशय में युक्ति" },
  surgical: { en: "surgical", hi: "शल्य" },
};

const HOW: Readonly<Record<ContraceptiveMethod, Words>> = {
  condom: {
    en: "A covering (on the penis, or worn in the vagina) stops sperm reaching the egg.",
    hi: "एक आवरण (शिश्न पर, या योनि में) शुक्राणु को अंडाणु तक पहुँचने से रोकता है।",
  },
  pill: {
    en: "Changes the body's hormonal balance, so eggs are not released.",
    hi: "शरीर का हॉर्मोन संतुलन बदलती हैं, जिससे अंडाणु नहीं निकलते।",
  },
  copperT: {
    en: "A device placed in the uterus prevents pregnancy.",
    hi: "गर्भाशय में रखी गई युक्ति गर्भधारण रोकती है।",
  },
  surgical: {
    en: "Blocks the vas deferens (no sperm transfer) or the fallopian tube (the egg can't reach the uterus).",
    hi: "शुक्रवाहिनी (शुक्राणु नहीं पहुँचते) या फेलोपियन नलिका (अंडाणु गर्भाशय तक नहीं पहुँचता) को बंद करती है।",
  },
};

const DRAWBACK: Readonly<Record<ContraceptiveMethod, Words>> = {
  condom: { en: "Drawbacks: none given in the textbook.", hi: "कमियाँ: पाठ्यपुस्तक में नहीं दी गईं।" },
  pill: { en: "Can cause side effects.", hi: "दुष्प्रभाव हो सकते हैं।" },
  copperT: {
    en: "Can cause side effects from irritation of the uterus.",
    hi: "गर्भाशय में जलन से दुष्प्रभाव हो सकते हैं।",
  },
  surgical: {
    en: "Safe in the long run; surgery done badly can cause infections.",
    hi: "लंबे समय में सुरक्षित; ठीक से न हो तो शल्य क्रिया से संक्रमण हो सकता है।",
  },
};

const L = {
  tap: {
    en: "Tap a method to read how it works.",
    hi: "किसी विधि पर टैप करो और पढ़ो कि वह कैसे काम करती है।",
  },
  stdYes: {
    en: "Helps against many sexually transmitted diseases, to some extent.",
    hi: "कई यौन संचारित रोगों से कुछ हद तक बचाव करता है।",
  },
  stdNo: {
    en: "Does not protect against sexually transmitted diseases.",
    hi: "यौन संचारित रोगों से बचाव नहीं करता।",
  },
} as const satisfies Record<string, Words>;

export function ContraceptionChartView({ view, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ContraceptionState;
  const t = (w: Words) => say(locale, w);
  const sel = s.selected;
  return (
    <div class="rp cc">
      <div class="cc-cards" data-part={ContraceptionPart.Cards}>
        {Object.values(ContraceptionMethod).map((m) => (
          <button
            key={m}
            type="button"
            class={`cc-card cc-${METHODS[m].category}${sel === m ? " is-on" : ""}`}
            aria-pressed={sel === m}
            disabled={!s.canTap}
            onClick={() => call(ContraceptionAction.Tap, { method: m })}
          >
            <span class="cc-name">{t(NAMES[m])}</span>
            <span class="cc-cat">{t(CATEGORIES[METHODS[m].category])}</span>
          </button>
        ))}
      </div>
      <div class="cc-detail" data-part={ContraceptionPart.Detail} aria-live="polite">
        {sel === null ? (
          <p class="cc-hint">{t(L.tap)}</p>
        ) : (
          <div>
            <p class="cc-how">{t(HOW[sel])}</p>
            <p class="cc-drawback">{t(DRAWBACK[sel])}</p>
            {s.showStd && (
              <p class={METHODS[sel].protectsStd ? "cc-std is-yes" : "cc-std is-no"}>
                {t(METHODS[sel].protectsStd ? L.stdYes : L.stdNo)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
