import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Fact, askFact, factParams } from "../../kit";

const dispersion = t("Dispersion", "विक्षेपण");
const refraction = t("Atmospheric refraction", "वायुमंडलीय अपवर्तन");
const scattering = t("Scattering", "प्रकीर्णन");
const isDispersion = t(
  "Dispersion is white light splitting into colours (a prism, a raindrop).",
  "विक्षेपण सफ़ेद प्रकाश का रंगों में बँटना है (प्रिज़्म, बारिश की बूँद)।",
);
const isRefraction = t(
  "Atmospheric refraction is the air bending light (twinkling, the early Sun).",
  "वायुमंडलीय अपवर्तन हवा का प्रकाश मोड़ना है (टिमटिमाना, जल्दी दिखता सूरज)।",
);
const isScattering = t(
  "Scattering is particles sending light off in all directions (blue sky, red Sun, visible beams).",
  "प्रकीर्णन कणों का प्रकाश को हर दिशा में भेजना है (नीला आसमान, लाल सूरज, दिखती किरणें)।",
);

const facts = {
  rainbow: {
    prompt: t("Which effect makes a rainbow?", "इंद्रधनुष कौन-सा प्रभाव बनाता है?"),
    right: dispersion,
    wrong: [
      { label: refraction, feedback: isRefraction },
      { label: scattering, feedback: isScattering },
    ],
  },
  twinkle: {
    prompt: t("Which effect makes stars twinkle?", "तारों को कौन-सा प्रभाव टिमटिमाता है?"),
    right: refraction,
    wrong: [
      { label: dispersion, feedback: isDispersion },
      { label: scattering, feedback: isScattering },
    ],
  },
  blueSky: {
    prompt: t("Which effect makes the sky blue?", "आसमान को कौन-सा प्रभाव नीला बनाता है?"),
    right: scattering,
    wrong: [
      { label: dispersion, feedback: isDispersion },
      { label: refraction, feedback: isRefraction },
    ],
  },
  earlySun: {
    prompt: t(
      "Which effect lets us see the Sun 2 minutes before it rises?",
      "कौन-सा प्रभाव हमें सूरज उगने से 2 मिनट पहले दिखाता है?",
    ),
    right: refraction,
    wrong: [
      { label: scattering, feedback: isScattering },
      { label: dispersion, feedback: isDispersion },
    ],
  },
  redSun: {
    prompt: t(
      "Which effect makes the rising Sun look red?",
      "कौन-सा प्रभाव उगते सूरज को लाल दिखाता है?",
    ),
    right: scattering,
    wrong: [
      { label: refraction, feedback: isRefraction },
      { label: dispersion, feedback: isDispersion },
    ],
  },
  prismBand: {
    prompt: t(
      "Which effect gives the band of colours on a screen behind a glass prism?",
      "काँच के प्रिज़्म के पीछे के पर्दे पर रंगों की पट्टी कौन-सा प्रभाव देता है?",
    ),
    right: dispersion,
    wrong: [
      { label: scattering, feedback: isScattering },
      { label: refraction, feedback: isRefraction },
    ],
  },
} satisfies Record<string, Fact>;

/** Telling dispersion, atmospheric refraction and scattering apart. */
export const whichEffect = family({
  level: Level.Hard,
  tests: [Concept.DispersionAndRainbow, Concept.AtmosphericRefraction, Concept.ScatteringOfLight],
  params: factParams(facts),
  build: ({ item }, b) => askFact(b, facts[item], item),
});
