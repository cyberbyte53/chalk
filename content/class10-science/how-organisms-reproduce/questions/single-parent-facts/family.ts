import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = [
  "binaryVsMultiple",
  "leishmania",
  "cellByCell",
  "notReproduction",
  "development",
] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  binaryVsMultiple: {
    prompt: {
      en: "How does binary fission differ from multiple fission?",
      hi: "द्विखंडन, बहुखंडन से कैसे भिन्न है?",
    },
    right: {
      en: "Binary gives two cells; multiple gives many at once",
      hi: "द्विखंडन दो कोशिकाएँ देता है; बहुखंडन एक साथ कई",
    },
    wrong: [
      {
        en: "Binary fission needs two parents; multiple needs one",
        hi: "द्विखंडन में दो जनक चाहिए; बहुखंडन में एक",
      },
      {
        en: "Multiple fission happens only in plants, binary in animals",
        hi: "बहुखंडन केवल पौधों में, द्विखंडन जंतुओं में होता है",
      },
    ],
    why: {
      en: "Both are done by one cell; the difference is two daughter cells or many at the same time.",
      hi: "दोनों एक कोशिका करती है; अंतर है दो संतति कोशिकाएँ या एक साथ कई।",
    },
  },
  leishmania: {
    prompt: {
      en: "What is special about binary fission in Leishmania?",
      hi: "लीशमैनिया के द्विखंडन में क्या ख़ास है?",
    },
    right: {
      en: "It splits in a definite plane, set by its whip-like structure",
      hi: "यह अपनी चाबुक जैसी संरचना से तय एक निश्चित तल में बँटता है",
    },
    wrong: [
      { en: "It can split in any plane at random", hi: "यह किसी भी तल में बेतरतीब बँट सकता है" },
      {
        en: "It splits into many small daughter cells at the same moment",
        hi: "यह एक ही क्षण में कई छोटी संतति कोशिकाओं में बँटता है",
      },
    ],
    why: {
      en: "Leishmania is more organised than Amoeba: it divides in a definite orientation in relation to its whip-like structure.",
      hi: "लीशमैनिया अमीबा से ज़्यादा व्यवस्थित है: यह चाबुक जैसी संरचना के सापेक्ष निश्चित दिशा में बँटता है।",
    },
  },
  cellByCell: {
    prompt: {
      en: "Why can't most multicellular organisms reproduce by simply dividing cell by cell?",
      hi: "ज़्यादातर बहुकोशिकीय जीव बस कोशिका-दर-कोशिका बँटकर जनन क्यों नहीं कर सकते?",
    },
    right: {
      en: "Their cells form organs that must sit in definite places",
      hi: "इनकी कोशिकाएँ ऐसे अंग बनाती हैं जिन्हें निश्चित जगह होना चाहिए",
    },
    wrong: [
      {
        en: "Their cells cannot divide at all once the body is fully grown",
        hi: "शरीर पूरा बढ़ जाने के बाद इनकी कोशिकाएँ बिल्कुल नहीं बँट सकतीं",
      },
      {
        en: "Their cells have too little DNA to copy",
        hi: "इनकी कोशिकाओं में प्रतिलिपि के लिए बहुत कम DNA होता है",
      },
    ],
    why: {
      en: "In such an organised body, cell-by-cell division would be impractical; reproduction becomes the job of a specific cell type.",
      hi: "ऐसे व्यवस्थित शरीर में कोशिका-दर-कोशिका विभाजन अव्यावहारिक होगा; जनन एक ख़ास तरह की कोशिका का काम बन जाता है।",
    },
  },
  notReproduction: {
    prompt: {
      en: "Why is regeneration not the same as reproduction?",
      hi: "पुनर्जनन, जनन जैसा क्यों नहीं है?",
    },
    right: {
      en: "Organisms don't normally rely on being cut to reproduce",
      hi: "जीव जनन के लिए सामान्यतः कटने पर निर्भर नहीं रहते",
    },
    wrong: [
      { en: "Regeneration makes no new cells at all", hi: "पुनरुद्भवन में कोई नई कोशिका नहीं बनती" },
      {
        en: "Regeneration always needs two parents, like sexual reproduction",
        hi: "पुनरुद्भवन में लैंगिक जनन की तरह हमेशा दो जनक चाहिए",
      },
    ],
    why: {
      en: "Regeneration happens when an organism is cut or broken; normal reproduction doesn't rely on that.",
      hi: "पुनर्जनन तब होता है जब जीव कट या टूट जाए; सामान्य जनन इस पर निर्भर नहीं करता।",
    },
  },
  development: {
    prompt: {
      en: "In regeneration, the organised sequence in which cells change into different tissues is called:",
      hi: "पुनर्जनन में कोशिकाओं के अलग ऊतकों में बदलने का व्यवस्थित क्रम कहलाता है:",
    },
    right: { en: "Development", hi: "परिवर्धन" },
    wrong: [
      { en: "Pollination", hi: "परागण" },
      { en: "Fertilisation", hi: "निषेचन" },
    ],
    why: {
      en: "Specialised cells multiply into a mass, and cells then change into tissues in an organised sequence called development.",
      hi: "विशिष्ट कोशिकाएँ गुणन करके समूह बनाती हैं, फिर कोशिकाएँ परिवर्धन नाम के व्यवस्थित क्रम में ऊतकों में बदलती हैं।",
    },
  },
};

/** NCERT 8.2.1–8.2.4 and in-text questions: binary vs multiple fission, why complex organisms can't regenerate or split cell by cell, regeneration is not reproduction. */
export const singleParentFacts = family({
  level: Level.Medium,
  tests: [Concept.SingleCellModes],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
