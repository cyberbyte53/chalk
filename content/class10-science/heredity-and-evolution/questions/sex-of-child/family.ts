import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  XSperm: "xSperm",
  YSperm: "ySperm",
  Decides: "decides",
  Mother: "mother",
  Chance: "chance",
  Reptile: "reptile",
  Pairs: "pairs",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  xSperm: {
    q: {
      en: "An egg is fertilised by a sperm carrying an X chromosome. The baby will be…",
      hi: "एक अंडे को X गुणसूत्र वाला शुक्राणु निषेचित करता है। बच्चा होगा…",
    },
    right: { en: "a girl (XX)", hi: "लड़की (XX)" },
    wrong: [
      { en: "a boy (XY)", hi: "लड़का (XY)" },
      { en: "either, it depends on the mother", hi: "कोई भी, यह माँ पर निर्भर है" },
    ],
    why: {
      en: "The egg always carries X. X from the egg plus X from the sperm is XX: a girl.",
      hi: "अंडे में हमेशा X होता है। अंडे का X और शुक्राणु का X मिलकर XX: लड़की।",
    },
  },
  ySperm: {
    q: {
      en: "An egg is fertilised by a sperm carrying a Y chromosome. The baby will be…",
      hi: "एक अंडे को Y गुणसूत्र वाला शुक्राणु निषेचित करता है। बच्चा होगा…",
    },
    right: { en: "a boy (XY)", hi: "लड़का (XY)" },
    wrong: [
      { en: "a girl (XX)", hi: "लड़की (XX)" },
      { en: "YY", hi: "YY" },
    ],
    why: {
      en: "The egg brings X and the sperm brings Y: XY, a boy. No one is YY, since every egg is X.",
      hi: "अंडा X लाता है और शुक्राणु Y: XY, लड़का। कोई YY नहीं होता, क्योंकि हर अंडा X है।",
    },
  },
  decides: {
    q: {
      en: "In human beings, the sex of the child is decided by…",
      hi: "मनुष्यों में बच्चे का लिंग तय होता है…",
    },
    right: {
      en: "whether the father's sperm carries X or Y",
      hi: "इससे कि पिता का शुक्राणु X लिए है या Y",
    },
    wrong: [
      { en: "the X chromosomes from the mother", hi: "माँ से आए X गुणसूत्र" },
      { en: "the temperature during the pregnancy", hi: "गर्भावस्था के दौरान का तापमान" },
    ],
    why: {
      en: "Every egg is X, so the difference comes from the sperm: X gives a girl, Y a boy. Temperature decides sex only in some reptiles.",
      hi: "हर अंडा X है, इसलिए फ़र्क शुक्राणु से आता है: X से लड़की, Y से लड़का। तापमान केवल कुछ सरीसृपों में लिंग तय करता है।",
    },
  },
  mother: {
    q: {
      en: "Which sex chromosome can a mother pass to her child?",
      hi: "माँ अपने बच्चे को कौन सा लिंग गुणसूत्र दे सकती है?",
    },
    right: { en: "Only X", hi: "केवल X" },
    wrong: [
      { en: "X or Y", hi: "X या Y" },
      { en: "Only Y", hi: "केवल Y" },
    ],
    why: {
      en: "A woman is XX, so every egg she makes carries an X.",
      hi: "स्त्री XX है, इसलिए उसका बनाया हर अंडा X लिए होता है।",
    },
  },
  chance: {
    q: {
      en: "A couple has two daughters. What is the chance that their next child is a son?",
      hi: "एक दंपती की दो बेटियाँ हैं। अगले बच्चे के बेटा होने का संयोग क्या है?",
    },
    right: { en: "One half", hi: "आधा" },
    wrong: [
      { en: "Certain: a son is due", hi: "पक्का: अब बेटे की बारी है" },
      { en: "One quarter", hi: "एक चौथाई" },
    ],
    why: {
      en: "Half of the father's sperm carry Y, and each child is a fresh chance, whatever came before.",
      hi: "पिता के आधे शुक्राणु Y लिए होते हैं, और हर बच्चा नया संयोग है, पहले चाहे कुछ भी हुआ हो।",
    },
  },
  reptile: {
    q: {
      en: "In some reptiles, the sex of the young is decided by…",
      hi: "कुछ सरीसृपों में संतान का लिंग तय होता है…",
    },
    right: {
      en: "the temperature at which the eggs are kept",
      hi: "अंडों को रखे जाने का तापमान",
    },
    wrong: [
      { en: "X and Y chromosomes, as in humans", hi: "मनुष्यों की तरह X और Y गुणसूत्रों से" },
      { en: "the mother choosing before the eggs are laid", hi: "अंडे देने से पहले माँ का चुनाव" },
    ],
    why: {
      en: "Some species rely on environmental cues: in a few reptiles, egg temperature decides the sex.",
      hi: "कुछ स्पीशीज़ परिवेश के संकेतों पर निर्भर हैं: कुछ सरीसृपों में अंडे का तापमान लिंग तय करता है।",
    },
  },
  pairs: {
    q: {
      en: "How many pairs of chromosomes in a human cell are not sex chromosomes?",
      hi: "मनुष्य की कोशिका में गुणसूत्रों की कितनी जोड़ियाँ लिंग गुणसूत्र नहीं हैं?",
    },
    right: { en: "22", hi: "22" },
    wrong: [
      { en: "23", hi: "23" },
      { en: "46", hi: "46" },
    ],
    why: {
      en: "Humans have 23 pairs (46 chromosomes): 22 matched pairs plus one pair of sex chromosomes.",
      hi: "मनुष्यों में 23 जोड़ियाँ (46 गुणसूत्र) हैं: 22 मिलान वाली जोड़ियाँ और एक जोड़ी लिंग गुणसूत्र।",
    },
  },
};

/** NCERT 9.2.4: sex determination. */
export const sexOfChild = family({
  level: Level.Easy,
  tests: [Concept.SexDetermination],
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
