import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Deeper: "deeper",
  WhatFossil: "whatFossil",
  Isotopes: "isotopes",
  Closest: "closest",
  Cousins: "cousins",
  Nucleus: "nucleus",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  deeper: {
    q: {
      en: "Digging into rock, we find shells deep down, a dinosaur skull higher up, and horse-like bones near the surface. Which are the oldest?",
      hi: "चट्टान में खोदने पर गहराई में सीपियाँ, ऊपर डायनासोर की खोपड़ी, और सतह के पास घोड़े जैसी हड्डियाँ मिलती हैं। सबसे पुरानी कौन सी हैं?",
    },
    right: { en: "The shells", hi: "सीपियाँ" },
    wrong: [
      { en: "The horse-like bones", hi: "घोड़े जैसी हड्डियाँ" },
      { en: "We can't tell from the layers", hi: "परतों से कह नहीं सकते" },
    ],
    why: {
      en: "Layers build up one on another, so the deeper the layer, the older the fossil.",
      hi: "परतें एक के ऊपर एक जमती हैं, इसलिए जितनी गहरी परत, उतना पुराना जीवाश्म।",
    },
  },
  whatFossil: {
    q: { en: "Which of these is a fossil?", hi: "इनमें से कौन जीवाश्म है?" },
    right: {
      en: "The impression of an insect in hardened mud",
      hi: "कठोर हुई मिट्टी में एक कीट की छाप",
    },
    wrong: [
      { en: "A dead insect that has fully rotted away", hi: "पूरी तरह सड़ चुका एक मरा कीट" },
      { en: "A river pebble shaped like a beetle", hi: "भृंग जैसे आकार का नदी का एक कंकड़" },
    ],
    why: {
      en: "A fossil is a preserved trace of a living organism. A rotted body leaves nothing; a beetle-shaped pebble was never alive.",
      hi: "जीवाश्म किसी जीव का संरक्षित निशान है। सड़ा शरीर कुछ नहीं छोड़ता; भृंग जैसा कंकड़ कभी जीवित नहीं था।",
    },
  },
  isotopes: {
    q: {
      en: "Besides the depth of the layer, how else can a fossil's age be found?",
      hi: "परत की गहराई के अलावा जीवाश्म की उम्र और कैसे पता की जा सकती है?",
    },
    right: {
      en: "From the ratios of isotopes in the fossil",
      hi: "जीवाश्म में समस्थानिकों के अनुपात से",
    },
    wrong: [
      { en: "From its colour: darker fossils are older", hi: "इसके रंग से: गहरे जीवाश्म पुराने होते हैं" },
      {
        en: "From how heavy it is compared with its size",
        hi: "अपने आकार की तुलना में यह कितना भारी है, उससे",
      },
    ],
    why: {
      en: "NCERT names two ways: relative (deeper is older) and the ratios of different isotopes of the same element.",
      hi: "NCERT दो तरीक़े बताता है: सापेक्ष (गहरा तो पुराना) और एक ही तत्व के अलग समस्थानिकों का अनुपात।",
    },
  },
  closest: {
    q: {
      en: "In evolutionary terms, we have more in common with…",
      hi: "जैव विकास की दृष्टि से हमारी ज़्यादा समानता है…",
    },
    right: { en: "a schoolboy in China", hi: "चीन के एक स्कूली लड़के से" },
    wrong: [
      { en: "a chimpanzee", hi: "एक चिंपैंज़ी" },
      { en: "a spider, an animal with legs", hi: "एक मकड़ी, टाँगों वाला एक जंतु" },
    ],
    why: {
      en: "Every human is the same species as us, with a far more recent common ancestor than any chimpanzee or spider.",
      hi: "हर मनुष्य हमारी ही स्पीशीज़ है, जिसका साझा पूर्वज किसी चिंपैंज़ी या मकड़ी से कहीं हाल का है।",
    },
  },
  cousins: {
    q: {
      en: "A girl and her brother share their parents; she and her cousin share only grandparents. So…",
      hi: "एक लड़की और उसके भाई के माता-पिता साझे हैं; उसके और उसके चचेरे भाई के केवल दादा-दादी। तो…",
    },
    right: {
      en: "she is more closely related to her brother",
      hi: "वह अपने भाई से ज़्यादा क़रीबी संबंधित है",
    },
    wrong: [
      { en: "she is equally related to both", hi: "वह दोनों से बराबर संबंधित है" },
      { en: "she is more closely related to her cousin", hi: "वह अपने चचेरे भाई से ज़्यादा क़रीबी है" },
    ],
    why: {
      en: "The more recent the common ancestor, the closer the relationship: parents are one generation back, grandparents two.",
      hi: "साझा पूर्वज जितना हाल का, संबंध उतना क़रीबी: माता-पिता एक पीढ़ी पीछे हैं, दादा-दादी दो।",
    },
  },
  nucleus: {
    q: {
      en: "Which characteristic divides living things at a more basic level?",
      hi: "कौन सी विशेषता जीवों को ज़्यादा मूल स्तर पर बाँटती है?",
    },
    right: { en: "Whether their cells have a nucleus", hi: "उनकी कोशिकाओं में केंद्रक है या नहीं" },
    wrong: [
      { en: "Whether they have four limbs", hi: "उनके चार अंग हैं या नहीं" },
      { en: "Whether their skeleton is inside or outside", hi: "उनका कंकाल अंदर है या बाहर" },
    ],
    why: {
      en: "Having a nucleus or not splits nearly all life (bacteria vs the rest); limbs and skeletons only split animals.",
      hi: "केंद्रक होना या न होना लगभग सारे जीवन को बाँटता है (जीवाणु और बाकी); अंग और कंकाल केवल जंतुओं को बाँटते हैं।",
    },
  },
};

/** NCERT 9.5 and 9.5.2: relatedness, classification, and fossils. */
export const fossilsAndRelatives = family({
  level: Level.Easy,
  tests: [Concept.EvolutionAndClassification],
  params: z.object({ case: z.nativeEnum(Case) }).strict(),
  build: ({ case: c }, b) => {
    const k = cases[c];
    const options: Option[] = [
      { id: "right", label: t(k.right.en, k.right.hi) },
      ...k.wrong.map((w, i) => ({ id: `w${i}`, label: t(w.en, w.hi), feedback: k.why })),
    ];
    const ask = choiceQuestion(b, {
      prompt: t(k.q.en, k.q.hi),
      options: settle(options, c.length * 11 + 5),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
