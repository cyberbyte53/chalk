import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Gene: "gene",
  Control: "control",
  Short: "short",
  Pieces: "pieces",
  Equal: "equal",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  gene: {
    q: { en: "A gene is…", hi: "जीन है…" },
    right: {
      en: "a section of DNA that provides information for one protein",
      hi: "DNA का वह हिस्सा जो एक प्रोटीन की जानकारी देता है",
    },
    wrong: [
      { en: "a whole chromosome", hi: "एक पूरा गुणसूत्र" },
      { en: "a protein that makes the body grow taller", hi: "शरीर को लंबा बढ़ाने वाला एक प्रोटीन" },
    ],
    why: {
      en: "A chromosome is a long piece of DNA with many genes on it; a gene is one section, carrying the information for one protein.",
      hi: "गुणसूत्र DNA का लंबा टुकड़ा है जिस पर कई जीन हैं; जीन उसका एक हिस्सा है, जिसमें एक प्रोटीन की जानकारी है।",
    },
  },
  control: {
    q: {
      en: "How do genes control traits like plant height?",
      hi: "जीन पौधे की ऊँचाई जैसे लक्षणों को कैसे नियंत्रित करते हैं?",
    },
    right: {
      en: "Through the proteins (like enzymes) they code for",
      hi: "उन प्रोटीनों (जैसे एंज़ाइम) के ज़रिए जिनकी जानकारी उनमें है",
    },
    wrong: [
      {
        en: "By telling the plant how tall to grow in words",
        hi: "पौधे को शब्दों में बताकर कि कितना बढ़ना है",
      },
      { en: "By changing with the weather", hi: "मौसम के साथ बदलकर" },
    ],
    why: {
      en: "A gene makes a protein. For height: gene → enzyme → amount of growth hormone → height.",
      hi: "जीन एक प्रोटीन बनाता है। ऊँचाई के लिए: जीन → एंज़ाइम → वृद्धि हॉर्मोन की मात्रा → ऊँचाई।",
    },
  },
  short: {
    q: {
      en: "A change in a gene makes an enzyme work less efficiently. In a tt pea plant, the result is…",
      hi: "जीन में एक बदलाव से एक एंज़ाइम कम कुशलता से काम करता है। tt मटर के पौधे में परिणाम है…",
    },
    right: {
      en: "less growth hormone, so a short plant",
      hi: "कम वृद्धि हॉर्मोन, इसलिए बौना पौधा",
    },
    wrong: [
      { en: "more growth hormone, so a tall plant", hi: "ज़्यादा वृद्धि हॉर्मोन, इसलिए लंबा पौधा" },
      { en: "no change at all", hi: "कोई बदलाव नहीं" },
    ],
    why: {
      en: "The enzyme helps make the growth hormone. A weaker enzyme means less hormone and less growth.",
      hi: "एंज़ाइम वृद्धि हॉर्मोन बनाने में मदद करता है। कमज़ोर एंज़ाइम यानी कम हॉर्मोन और कम वृद्धि।",
    },
  },
  pieces: {
    q: {
      en: "Why can seed shape and seed colour be inherited independently?",
      hi: "बीज का आकार और बीज का रंग स्वतंत्र रूप से वंशानुगत क्यों हो सकते हैं?",
    },
    right: {
      en: "Their genes sit on separate chromosomes that sort independently",
      hi: "उनके जीन अलग गुणसूत्रों पर हैं जो स्वतंत्र रूप से बँटते हैं",
    },
    wrong: [
      {
        en: "A germ cell takes one parent's whole set of genes together",
        hi: "एक जनन कोशिका एक जनक का पूरा जीन समूह एक साथ लेती है",
      },
      {
        en: "Colour genes are only in the seeds, shape genes in the pods",
        hi: "रंग के जीन केवल बीजों में, आकार के जीन फलियों में हैं",
      },
    ],
    why: {
      en: "If a whole set went together, R and y would stay linked. Because the set is in separate pieces (chromosomes), each is shuffled on its own.",
      hi: "अगर पूरा सेट साथ जाता, तो R और y जुड़े रहते। चूँकि सेट अलग टुकड़ों (गुणसूत्रों) में है, हर एक अपने आप फेंटा जाता है।",
    },
  },
  equal: {
    q: {
      en: "How is the equal genetic contribution of the male and female parents ensured in the child?",
      hi: "बच्चे में नर और मादा जनक का बराबर आनुवंशिक योगदान कैसे सुनिश्चित होता है?",
    },
    right: {
      en: "Each germ cell has one of every pair; one from each parent fuse",
      hi: "हर जनन कोशिका में हर जोड़े का एक; हर जनक से एक मिलती है",
    },
    wrong: [
      {
        en: "The mother gives more, because the baby grows in her body",
        hi: "माँ ज़्यादा देती है, क्योंकि बच्चा उसके शरीर में बढ़ता है",
      },
      {
        en: "The father gives all the genes; the mother gives food",
        hi: "पिता सभी जीन देता है; माँ भोजन देती है",
      },
    ],
    why: {
      en: "Egg and sperm each carry one full set (one of each pair), so the zygote's pairs are half from each parent.",
      hi: "अंडा और शुक्राणु दोनों एक पूरा सेट (हर जोड़ी से एक) लाते हैं, इसलिए युग्मनज की जोड़ियाँ आधी-आधी हर जनक से हैं।",
    },
  },
};

/** 9.2.3: what a gene is, how it controls a trait, and how chromosomes make inheritance work. */
export const whatGenesDo = family({
  level: Level.Medium,
  tests: [Concept.HowTraitsAreExpressed],
  params: z.object({ case: z.nativeEnum(Case) }).strict(),
  build: ({ case: c }, b) => {
    const k = cases[c];
    const options: Option[] = [
      { id: "right", label: t(k.right.en, k.right.hi) },
      ...k.wrong.map((w, i) => ({ id: `w${i}`, label: t(w.en, w.hi), feedback: k.why })),
    ];
    const ask = choiceQuestion(b, {
      prompt: t(k.q.en, k.q.hi),
      options: settle(options, c.length * 13 + 4),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
