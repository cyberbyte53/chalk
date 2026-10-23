import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Pair = {
  ArmForeleg: "armForeleg",
  BirdBatWing: "birdBatWing",
  ButterflyBatWing: "butterflyBatWing",
  ArmFlipper: "armFlipper",
  TeethTusks: "teethTusks",
  PotatoRunner: "potatoRunner",
} as const;
type Pair = (typeof Pair)[keyof typeof Pair];

type L = { en: string; hi: string };
const pairs: Record<Pair, { what: L; homologous: boolean; why: L }> = {
  armForeleg: {
    what: { en: "a human arm and a dog's foreleg", hi: "मनुष्य की बाँह और कुत्ते की अगली टाँग" },
    homologous: true,
    why: {
      en: "The same bones in the same plan (upper arm, forearm, wrist, fingers), used for different jobs.",
      hi: "उसी क्रम में वही हड्डियाँ (ऊपरी बाँह, अग्रबाहु, कलाई, उँगलियाँ), अलग कामों के लिए।",
    },
  },
  birdBatWing: {
    what: {
      en: "the wing of a bird and the wing of a bat (as wings)",
      hi: "पक्षी का पंख और चमगादड़ का पंख (पंख के रूप में)",
    },
    homologous: false,
    why: {
      en: "Both fly, but a bat's wing is skin between long fingers and a bird's is feathers along the arm: the same job, a different design.",
      hi: "दोनों उड़ते हैं, पर चमगादड़ का पंख लंबी उँगलियों के बीच त्वचा है और पक्षी का बाँह पर पंख: वही काम, अलग बनावट।",
    },
  },
  butterflyBatWing: {
    what: {
      en: "the wing of a butterfly and the wing of a bat",
      hi: "तितली का पंख और चमगादड़ का पंख",
    },
    homologous: false,
    why: {
      en: "A butterfly's wing has no bones at all. The same job (flying), a completely different origin.",
      hi: "तितली के पंख में कोई हड्डी नहीं। वही काम (उड़ना), बिल्कुल अलग उत्पत्ति।",
    },
  },
  armFlipper: {
    what: { en: "a human arm and a whale's flipper", hi: "मनुष्य की बाँह और व्हेल का फ़्लिपर" },
    homologous: true,
    why: {
      en: "The flipper hides the same arm and finger bones, changed for swimming.",
      hi: "फ़्लिपर में वही बाँह और उँगलियों की हड्डियाँ छिपी हैं, तैरने के लिए बदली हुई।",
    },
  },
  teethTusks: {
    what: { en: "our teeth and an elephant's tusks", hi: "हमारे दाँत और हाथी के दाँत (टस्क)" },
    homologous: true,
    why: {
      en: "Tusks are teeth, grown very long: the same basic structure, a different use.",
      hi: "हाथी के टस्क दाँत ही हैं, बहुत लंबे बढ़े हुए: वही मूल बनावट, अलग उपयोग।",
    },
  },
  potatoRunner: {
    what: { en: "a potato and the runners of grass", hi: "आलू और घास के उपरिभूस्तारी" },
    homologous: true,
    why: {
      en: "Both are stems: one swollen to store food, one creeping along the ground.",
      hi: "दोनों तने हैं: एक भोजन जमा करने को फूला हुआ, एक ज़मीन पर रेंगता हुआ।",
    },
  },
};

/** NCERT 9.5.1, Ex 2 and Ex 6: homologous (same plan, different job) or analogous (same job, different design)? */
export const homologousOrAnalogous = family({
  level: Level.Medium,
  tests: [Concept.EvolutionAndClassification],
  params: z.object({ pair: z.nativeEnum(Pair) }).strict(),
  build: ({ pair }, b) => {
    const k = pairs[pair];
    const options: Option[] = [
      k.homologous
        ? { id: "right", label: t("Homologous", "समजात") }
        : { id: "homologous", label: t("Homologous", "समजात"), feedback: k.why },
      k.homologous
        ? { id: "analogous", label: t("Analogous", "समरूप"), feedback: k.why }
        : { id: "right", label: t("Analogous", "समरूप") },
    ];
    const ask = choiceQuestion(b, {
      prompt: t(
        `Are ${k.what.en} homologous or analogous organs?`,
        `${k.what.hi}: समजात अंग हैं या समरूप?`,
      ),
      options: settle(options, pair.length * 4 + 3),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
