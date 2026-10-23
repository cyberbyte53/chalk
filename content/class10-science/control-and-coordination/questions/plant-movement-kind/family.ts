import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  TouchMeNot: "touchMeNot",
  Water: "water",
  Message: "message",
  Tendril: "tendril",
  Legs: "legs",
  Speed: "speed",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  touchMeNot: {
    q: {
      en: "The leaves of a touch-me-not fold when touched. This movement…",
      hi: "छुई-मुई की पत्तियाँ छूने पर सिमट जाती हैं। यह गति…",
    },
    right: { en: "involves no growth", hi: "में वृद्धि नहीं होती" },
    wrong: [
      { en: "is caused by growth", hi: "वृद्धि से होती है" },
      { en: "needs muscles", hi: "को पेशियाँ चाहिए" },
    ],
    why: {
      en: "It's very quick and involves no growth: cells change shape by changing their water.",
      hi: "यह बहुत तेज़ है और इसमें वृद्धि नहीं होती: कोशिकाएँ पानी बदलकर आकार बदलती हैं।",
    },
  },
  water: {
    q: {
      en: "How do the cells of a sensitive plant change shape?",
      hi: "संवेदी पौधे की कोशिकाएँ आकार कैसे बदलती हैं?",
    },
    right: { en: "By changing the amount of water in them", hi: "अपने अंदर पानी की मात्रा बदलकर" },
    wrong: [
      { en: "With special muscle proteins, like ours", hi: "हमारी तरह विशेष पेशी प्रोटीन से" },
      { en: "By growing new cells very quickly", hi: "बहुत तेज़ी से नई कोशिकाएँ बनाकर" },
    ],
    why: {
      en: "Plant cells swell or shrink by gaining or losing water.",
      hi: "पादप कोशिकाएँ पानी पाकर या खोकर फूलती या सिकुड़ती हैं।",
    },
  },
  message: {
    q: {
      en: "How does a sensitive plant pass on the message that it has been touched?",
      hi: "संवेदी पौधा छुए जाने का संदेश कैसे आगे पहुँचाता है?",
    },
    right: {
      en: "Electrically and chemically, cell to cell, with no special tissue",
      hi: "विद्युत-रासायनिक रूप से, कोशिका से कोशिका, बिना विशेष ऊतक",
    },
    wrong: [
      {
        en: "Along thin nerves in the stem, just like ours",
        hi: "तने की पतली तंत्रिकाओं से, बिल्कुल हमारी तरह",
      },
      {
        en: "It doesn't pass it on: only the touched leaflet moves",
        hi: "यह संदेश आगे नहीं भेजता: केवल छुआ गया पत्रक हिलता है",
      },
    ],
    why: {
      en: "The part that moves is not where it was touched, so the information travels from cell to cell.",
      hi: "जो हिस्सा हिलता है वह छुई गई जगह नहीं है, इसलिए सूचना कोशिका से कोशिका तक जाती है।",
    },
  },
  tendril: {
    q: {
      en: "Why does a pea tendril coil round a stick it touches?",
      hi: "मटर का प्रतान जिस डंडी को छूता है उसके चारों ओर क्यों लिपटता है?",
    },
    right: {
      en: "The part touching grows slower than the far side",
      hi: "छूने वाला भाग दूर वाले भाग से धीमा बढ़ता है",
    },
    wrong: [
      {
        en: "The part touching grows faster than the far side",
        hi: "छूने वाला भाग दूर वाले भाग से तेज़ बढ़ता है",
      },
      {
        en: "Tiny muscles inside the tendril pull it round",
        hi: "प्रतान के भीतर नन्ही पेशियाँ उसे घुमा देती हैं",
      },
    ],
    why: {
      en: "Uneven growth makes the tendril circle round and cling to the support.",
      hi: "असमान वृद्धि से प्रतान सहारे के चारों ओर घूमकर उससे लिपट जाता है।",
    },
  },
  legs: {
    q: {
      en: "How is the movement of a sensitive plant different from the movement of our legs?",
      hi: "संवेदी पौधे की गति हमारे पैरों की गति से कैसे अलग है?",
    },
    right: {
      en: "The plant uses water in cells; our legs use nerves and muscles",
      hi: "पौधा कोशिकाओं के पानी से; हमारी टाँगें तंत्रिका और पेशियों से",
    },
    wrong: [
      {
        en: "Both use nerves and muscles, the plant's are just smaller",
        hi: "दोनों तंत्रिका और पेशी से, पौधे की बस छोटी हैं",
      },
      {
        en: "Both are slow growth movements, only in different places",
        hi: "दोनों धीमी वृद्धि गतियाँ हैं, बस अलग जगहों पर",
      },
    ],
    why: {
      en: "Plants have no nervous or muscle tissue.",
      hi: "पौधों में तंत्रिका या पेशी ऊतक नहीं होते।",
    },
  },
  speed: {
    q: { en: "Which plant movement is the fastest?", hi: "पौधों की कौन सी गति सबसे तेज़ है?" },
    right: { en: "A touch-me-not folding", hi: "छुई-मुई का सिमटना" },
    wrong: [
      { en: "A shoot bending towards light", hi: "प्ररोह का प्रकाश की ओर मुड़ना" },
      { en: "A root growing towards water", hi: "जड़ का पानी की ओर बढ़ना" },
    ],
    why: {
      en: "The sensitive plant responds in moments; growth movements take days.",
      hi: "संवेदी पौधा पल भर में अनुक्रिया करता है; वृद्धि वाली गतियाँ दिनों लेती हैं।",
    },
  },
};

/** NCERT 7.2.1–7.2.2: movement with and without growth. */
export const plantMovementKind = family({
  level: Level.Easy,
  tests: [Concept.HowPlantsMove],
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
