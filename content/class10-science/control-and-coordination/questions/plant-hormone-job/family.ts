import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  AuxinBend: "auxinBend",
  AuxinWhere: "auxinWhere",
  Gibberellin: "gibberellin",
  Cytokinin: "cytokinin",
  Aba: "aba",
  PlantOne: "plantOne",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  auxinBend: {
    q: {
      en: "How does auxin make a shoot bend towards light?",
      hi: "ऑक्सिन प्ररोह को प्रकाश की ओर कैसे मोड़ता है?",
    },
    right: {
      en: "It collects on the shady side, where cells grow longer",
      hi: "यह छाया वाली ओर जमा होता है, जहाँ कोशिकाएँ लंबी होती हैं",
    },
    wrong: [
      {
        en: "It collects on the lit side, where cells grow longer",
        hi: "यह रोशनी वाली ओर जमा होता है, जहाँ कोशिकाएँ लंबी होती हैं",
      },
      { en: "It stops growth on the shady side", hi: "यह छाया वाली ओर वृद्धि रोकता है" },
    ],
    why: {
      en: "Auxin from the shoot tip diffuses to the shady side; longer cells there bend the shoot to the light.",
      hi: "प्ररोह के सिरे का ऑक्सिन छाया वाली ओर विसरित होता है; वहाँ की लंबी कोशिकाएँ प्ररोह को रोशनी की ओर मोड़ती हैं।",
    },
  },
  auxinWhere: {
    q: { en: "Where is auxin made?", hi: "ऑक्सिन कहाँ बनता है?" },
    right: { en: "At the shoot tip", hi: "प्ररोह के सिरे पर" },
    wrong: [
      { en: "In the root tips", hi: "जड़ के सिरों पर" },
      { en: "In the ripening fruits", hi: "पकते फलों में" },
    ],
    why: {
      en: "Auxin is made at the shoot tip and diffuses to where it acts.",
      hi: "ऑक्सिन प्ररोह के सिरे पर बनकर वहाँ तक विसरित होता है जहाँ काम करता है।",
    },
  },
  gibberellin: {
    q: {
      en: "Which hormone, like auxin, helps the stem grow?",
      hi: "कौन सा हॉर्मोन, ऑक्सिन की तरह, तने की वृद्धि में मदद करता है?",
    },
    right: { en: "Gibberellin", hi: "जिबरेलिन" },
    wrong: [
      { en: "Abscisic acid", hi: "एब्सिसिक अम्ल" },
      { en: "Insulin", hi: "इंसुलिन" },
    ],
    why: { en: "Gibberellins help the growth of the stem.", hi: "जिबरेलिन तने की वृद्धि में मदद करते हैं।" },
  },
  cytokinin: {
    q: {
      en: "Which hormone promotes cell division and is plentiful in fruits and seeds?",
      hi: "कौन सा हॉर्मोन कोशिका विभाजन को बढ़ावा देता है और फलों व बीजों में ज़्यादा होता है?",
    },
    right: { en: "Cytokinin", hi: "साइटोकाइनिन" },
    wrong: [
      { en: "Auxin", hi: "ऑक्सिन" },
      { en: "Abscisic acid", hi: "एब्सिसिक अम्ल" },
    ],
    why: {
      en: "Cytokinins promote cell division, so they're concentrated where cells divide fast.",
      hi: "साइटोकाइनिन कोशिका विभाजन बढ़ाते हैं, इसलिए वहाँ ज़्यादा होते हैं जहाँ कोशिकाएँ तेज़ी से बँटती हैं।",
    },
  },
  aba: {
    q: {
      en: "Which hormone inhibits growth, and causes leaves to wilt?",
      hi: "कौन सा हॉर्मोन वृद्धि रोकता है, और पत्तियाँ मुरझाता है?",
    },
    right: { en: "Abscisic acid", hi: "एब्सिसिक अम्ल" },
    wrong: [
      { en: "Gibberellin", hi: "जिबरेलिन" },
      { en: "Cytokinin", hi: "साइटोकाइनिन" },
    ],
    why: {
      en: "Plants need signals to stop growing too: abscisic acid is one.",
      hi: "पौधों को बढ़ना रोकने के संकेत भी चाहिए: एब्सिसिक अम्ल उनमें से एक है।",
    },
  },
  plantOne: {
    q: { en: "Which of these is a plant hormone?", hi: "इनमें से कौन सा पादप हॉर्मोन है?" },
    right: { en: "Cytokinin", hi: "साइटोकाइनिन" },
    wrong: [
      { en: "Thyroxin", hi: "थायरॉक्सिन" },
      { en: "Oestrogen", hi: "एस्ट्रोजन" },
    ],
    why: {
      en: "Thyroxin and oestrogen are animal hormones. Cytokinin is a plant hormone.",
      hi: "थायरॉक्सिन और एस्ट्रोजन जंतु हॉर्मोन हैं। साइटोकाइनिन पादप हॉर्मोन है।",
    },
  },
};

/** NCERT 7.2: plant hormones and what they do. */
export const plantHormoneJob = family({
  level: Level.Easy,
  tests: [Concept.PlantHormones],
  params: z.object({ case: z.nativeEnum(Case) }).strict(),
  build: ({ case: c }, b) => {
    const k = cases[c];
    const options: Option[] = [
      { id: "right", label: t(k.right.en, k.right.hi) },
      ...k.wrong.map((w, i) => ({ id: `w${i}`, label: t(w.en, w.hi), feedback: k.why })),
    ];
    const ask = choiceQuestion(b, {
      prompt: t(k.q.en, k.q.hi),
      options: settle(options, c.length * 7 + 3),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
