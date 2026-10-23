import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Adrenal: "adrenal",
  Thyroid: "thyroid",
  Insulin: "insulin",
  Growth: "growth",
  Testosterone: "testosterone",
  Oestrogen: "oestrogen",
  Releasing: "releasing",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  adrenal: {
    q: { en: "Adrenaline is secreted by the…", hi: "एड्रीनलिन स्रावित करती हैं…" },
    right: { en: "adrenal glands", hi: "अधिवृक्क ग्रंथियाँ" },
    wrong: [
      { en: "thyroid gland", hi: "थायरॉइड ग्रंथि" },
      { en: "pancreas", hi: "अग्न्याशय" },
    ],
    why: {
      en: "The adrenal glands release adrenaline straight into the blood.",
      hi: "अधिवृक्क ग्रंथियाँ एड्रीनलिन सीधे रुधिर में छोड़ती हैं।",
    },
  },
  thyroid: {
    q: { en: "Thyroxin is made by the…", hi: "थायरॉक्सिन बनाती है…" },
    right: { en: "thyroid gland", hi: "थायरॉइड ग्रंथि" },
    wrong: [
      { en: "pituitary gland", hi: "पीयूष ग्रंथि" },
      { en: "adrenal glands", hi: "अधिवृक्क ग्रंथियाँ" },
    ],
    why: {
      en: "The thyroid gland in the neck makes thyroxin, using iodine.",
      hi: "गर्दन की थायरॉइड ग्रंथि आयोडीन से थायरॉक्सिन बनाती है।",
    },
  },
  insulin: {
    q: { en: "Insulin is produced by the…", hi: "इंसुलिन बनाता है…" },
    right: { en: "pancreas", hi: "अग्न्याशय" },
    wrong: [
      { en: "adrenal glands", hi: "अधिवृक्क ग्रंथियाँ" },
      { en: "pituitary gland", hi: "पीयूष ग्रंथि" },
    ],
    why: {
      en: "The pancreas makes insulin, which regulates blood sugar.",
      hi: "अग्न्याशय इंसुलिन बनाता है, जो रुधिर शर्करा नियमित करता है।",
    },
  },
  growth: {
    q: { en: "Growth hormone is secreted by the…", hi: "वृद्धि हॉर्मोन स्रावित करती है…" },
    right: { en: "pituitary gland", hi: "पीयूष ग्रंथि" },
    wrong: [
      { en: "thyroid gland in the neck", hi: "गर्दन की अवटु ग्रंथि" },
      { en: "testes", hi: "वृषण" },
    ],
    why: {
      en: "Growth hormone from the pituitary regulates growth and development.",
      hi: "पीयूष ग्रंथि का वृद्धि हॉर्मोन वृद्धि और विकास नियमित करता है।",
    },
  },
  testosterone: {
    q: { en: "Testosterone is made by the…", hi: "टेस्टोस्टेरॉन बनाते हैं…" },
    right: { en: "testes", hi: "वृषण" },
    wrong: [
      { en: "ovaries", hi: "अंडाशय" },
      { en: "pancreas", hi: "अग्न्याशय" },
    ],
    why: {
      en: "Testosterone from the testes brings the changes of puberty in males.",
      hi: "वृषण का टेस्टोस्टेरॉन पुरुषों में यौवनारंभ के बदलाव लाता है।",
    },
  },
  oestrogen: {
    q: { en: "Oestrogen is made by the…", hi: "एस्ट्रोजन बनाते हैं…" },
    right: { en: "ovaries", hi: "अंडाशय" },
    wrong: [
      { en: "testes", hi: "वृषण" },
      { en: "thyroid gland", hi: "थायरॉइड ग्रंथि" },
    ],
    why: {
      en: "Oestrogen from the ovaries develops female sex organs and regulates the menstrual cycle.",
      hi: "अंडाशय का एस्ट्रोजन मादा लैंगिक अंगों का विकास करता है और ऋतुस्राव चक्र नियमित करता है।",
    },
  },
  releasing: {
    q: {
      en: "Releasing hormones, which make the pituitary release its hormones, come from the…",
      hi: "मोचक हॉर्मोन, जो पीयूष ग्रंथि से उसके हॉर्मोन छुड़वाते हैं, आते हैं…",
    },
    right: { en: "hypothalamus", hi: "हाइपोथैलेमस से" },
    wrong: [
      { en: "pancreas", hi: "अग्न्याशय से" },
      { en: "adrenal glands", hi: "अधिवृक्क ग्रंथियों से" },
    ],
    why: {
      en: "For example, when growth hormone is low, the hypothalamus releases growth hormone releasing factor.",
      hi: "जैसे, जब वृद्धि हॉर्मोन कम हो, तो हाइपोथैलेमस वृद्धि हॉर्मोन मोचक कारक छोड़ता है।",
    },
  },
};

/** NCERT 7.3, Fig. 7.7, Table 7.1: endocrine glands and their hormones. */
export const glandHormone = family({
  level: Level.Easy,
  tests: [Concept.HormonesInAnimals],
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
