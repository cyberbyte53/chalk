import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Reach: "reach",
  Reset: "reset",
  ChemicalGood: "chemicalGood",
  PlantHow: "plantHow",
  AnimalHow: "animalHow",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  reach: {
    q: {
      en: "One limit of electrical impulses is that they…",
      hi: "विद्युत आवेगों की एक सीमा यह है कि वे…",
    },
    right: {
      en: "reach only cells joined by nervous tissue",
      hi: "केवल तंत्रिका ऊतक से जुड़ी कोशिकाओं तक पहुँचते हैं",
    },
    wrong: [
      { en: "are too slow to save us from danger", hi: "हमें खतरे से बचाने के लिए बहुत धीमे हैं" },
      {
        en: "can reach every cell, even far from nerves",
        hi: "नसों से दूर भी, हर कोशिका तक पहुँच सकते हैं",
      },
    ],
    why: {
      en: "Impulses are fast but limited to connected cells; chemicals can reach every cell.",
      hi: "आवेग तेज़ हैं पर जुड़ी कोशिकाओं तक सीमित; रसायन हर कोशिका तक पहुँच सकते हैं।",
    },
  },
  reset: {
    q: {
      en: "After a cell sends an electrical impulse, it…",
      hi: "कोई कोशिका विद्युत आवेग भेजने के बाद…",
    },
    right: {
      en: "needs time to reset before it can send another",
      hi: "दूसरा भेजने से पहले फिर से तैयार होने में समय लेती है",
    },
    wrong: [
      {
        en: "can send another at once, again and again forever",
        hi: "तुरंत दूसरा भेज सकती है, बार-बार हमेशा",
      },
      { en: "dies", hi: "मर जाती है" },
    ],
    why: {
      en: "Cells cannot keep making and sending impulses all the time.",
      hi: "कोशिकाएँ लगातार आवेग बनाकर नहीं भेज सकतीं।",
    },
  },
  chemicalGood: {
    q: {
      en: "What is the advantage of chemical messages over electrical ones?",
      hi: "विद्युत संदेशों की तुलना में रासायनिक संदेशों का क्या फ़ायदा है?",
    },
    right: {
      en: "They reach all cells and act steadily",
      hi: "वे सभी कोशिकाओं तक पहुँचकर लगातार काम करते हैं",
    },
    wrong: [
      { en: "They are faster than any nerve impulse", hi: "वे किसी भी तंत्रिका आवेग से तेज़ हैं" },
      {
        en: "They travel only along nerves, so they're precise",
        hi: "वे केवल तंत्रिकाओं से जाते हैं, इसलिए सटीक हैं",
      },
    ],
    why: {
      en: "Chemical messages are slower but reach every cell, nerves or not, steadily and persistently.",
      hi: "रासायनिक संदेश धीमे हैं पर हर कोशिका तक, तंत्रिका हो या न हो, लगातार पहुँचते हैं।",
    },
  },
  plantHow: {
    q: {
      en: "How does chemical coordination occur in plants?",
      hi: "पौधों में रासायनिक समन्वय कैसे होता है?",
    },
    right: {
      en: "Hormones made in one part diffuse to where they act",
      hi: "एक भाग में बने हॉर्मोन विसरित होकर वहाँ पहुँचते हैं जहाँ काम करते हैं",
    },
    wrong: [
      { en: "Through a simple nervous system in the stem", hi: "तने के एक सरल तंत्रिका तंत्र से" },
      { en: "Through a blood-like sap pumped round the plant", hi: "पौधे में पंप होते रक्त जैसे रस से" },
    ],
    why: {
      en: "Plant hormones are made away from where they act and simply diffuse there.",
      hi: "पादप हॉर्मोन काम की जगह से दूर बनते हैं और बस वहाँ तक विसरित हो जाते हैं।",
    },
  },
  animalHow: {
    q: {
      en: "How does chemical coordination take place in animals?",
      hi: "जंतुओं में रासायनिक समन्वय कैसे होता है?",
    },
    right: {
      en: "Endocrine glands release hormones into the blood",
      hi: "अंतःस्रावी ग्रंथियाँ रक्त में हॉर्मोन छोड़ती हैं",
    },
    wrong: [
      {
        en: "Hormones diffuse slowly from cell to cell only, as in plants",
        hi: "पौधों की तरह हॉर्मोन केवल कोशिका से कोशिका धीरे विसरित होते हैं",
      },
      {
        en: "Along neurons, as electrical impulses to each organ",
        hi: "न्यूरॉनों से, हर अंग तक विद्युत आवेग के रूप में",
      },
    ],
    why: {
      en: "In animals, hormones are secreted directly into the blood.",
      hi: "जंतुओं में हॉर्मोन सीधे रुधिर में स्रावित होते हैं।",
    },
  },
};

/** NCERT 7.2: why living things also use chemical messages. */
export const whyChemicalSignals = family({
  level: Level.Easy,
  tests: [Concept.PlantHormones, Concept.HormonesInAnimals],
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
