import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Adrenaline: "adrenaline",
  Iodine: "iodine",
  Goitre: "goitre",
  Dwarfism: "dwarfism",
  Diabetes: "diabetes",
  Feedback: "feedback",
  Puberty: "puberty",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  adrenaline: {
    q: {
      en: "When adrenaline is secreted into the blood…",
      hi: "जब रुधिर में एड्रीनलिन स्रावित होता है…",
    },
    right: {
      en: "the heart beats faster and blood goes to the muscles",
      hi: "हृदय तेज़ धड़कता है और रक्त पेशियों में जाता है",
    },
    wrong: [
      {
        en: "the heart slows down so the body can stay calm",
        hi: "हृदय धीमा हो जाता है ताकि शरीर शांत रहे",
      },
      {
        en: "more blood goes to the stomach to digest food quickly",
        hi: "भोजन जल्दी पचाने के लिए आमाशय में अधिक रक्त जाता है",
      },
    ],
    why: {
      en: "Adrenaline prepares the body to fight or run: faster heart and breathing, blood diverted from the gut and skin to the muscles.",
      hi: "एड्रीनलिन शरीर को लड़ने या भागने के लिए तैयार करता है: तेज़ दिल और साँस, आहार नाल और त्वचा से पेशियों की ओर रुधिर।",
    },
  },
  iodine: {
    q: { en: "Why is iodised salt advised?", hi: "आयोडीन युक्त नमक की सलाह क्यों दी जाती है?" },
    right: {
      en: "Iodine is needed for thyroxin; too little causes goitre",
      hi: "थायरॉक्सिन के लिए आयोडीन चाहिए; कमी से गॉयटर होता है",
    },
    wrong: [
      {
        en: "Iodine makes bones and teeth stronger as we grow",
        hi: "आयोडीन बढ़ते समय हड्डियाँ और दाँत मज़बूत करता है",
      },
      {
        en: "Iodine helps the pancreas lower blood sugar",
        hi: "आयोडीन अग्न्याशय को रक्त शर्करा घटाने में मदद करता है",
      },
    ],
    why: {
      en: "Iodine is essential for the thyroid to make thyroxin.",
      hi: "थायरॉइड को थायरॉक्सिन बनाने के लिए आयोडीन ज़रूरी है।",
    },
  },
  goitre: {
    q: { en: "A swollen neck can be a symptom of…", hi: "सूजी हुई गर्दन किसका लक्षण हो सकती है…" },
    right: { en: "goitre, from too little iodine", hi: "गॉयटर, आयोडीन की कमी से" },
    wrong: [
      { en: "diabetes, from too little insulin", hi: "मधुमेह, इंसुलिन की कमी से" },
      { en: "dwarfism, from too little growth hormone", hi: "बौनापन, वृद्धि हॉर्मोन की कमी से" },
    ],
    why: {
      en: "The thyroid is in the neck; without iodine it can swell, as in goitre.",
      hi: "थायरॉइड गर्दन में है; आयोडीन के बिना वह सूज सकती है, जैसे घेंघा में।",
    },
  },
  dwarfism: {
    q: {
      en: "A deficiency of growth hormone in childhood leads to…",
      hi: "बचपन में वृद्धि हॉर्मोन की कमी से होता है…",
    },
    right: { en: "dwarfism", hi: "बौनापन" },
    wrong: [
      { en: "goitre", hi: "घेंघा" },
      { en: "diabetes", hi: "मधुमेह" },
    ],
    why: {
      en: "Growth hormone from the pituitary regulates growth; too little in childhood causes dwarfism.",
      hi: "पीयूष ग्रंथि का वृद्धि हॉर्मोन वृद्धि नियमित करता है; बचपन में कमी से बौनापन होता है।",
    },
  },
  diabetes: {
    q: {
      en: "Why are some diabetes patients given insulin injections?",
      hi: "कुछ मधुमेह रोगियों को इंसुलिन के इंजेक्शन क्यों दिए जाते हैं?",
    },
    right: {
      en: "Their pancreas makes too little insulin, so sugar stays high",
      hi: "इनका अग्न्याशय कम इंसुलिन बनाता है, इसलिए शर्करा ऊँची रहती है",
    },
    wrong: [
      {
        en: "To raise their blood sugar when it drops too low",
        hi: "रक्त शर्करा बहुत गिरने पर उसे बढ़ाने के लिए",
      },
      {
        en: "To help them grow taller, like growth hormone",
        hi: "वृद्धि हॉर्मोन की तरह उन्हें लंबा बढ़ाने के लिए",
      },
    ],
    why: {
      en: "Insulin lowers blood sugar; without enough of it, sugar rises and causes harm.",
      hi: "इंसुलिन रुधिर शर्करा घटाता है; इसकी कमी से शर्करा बढ़कर नुक़सान करती है।",
    },
  },
  feedback: {
    q: {
      en: "Blood sugar rises after a meal. By feedback, the pancreas…",
      hi: "खाने के बाद रुधिर शर्करा बढ़ती है। पुनर्भरण से अग्न्याशय…",
    },
    right: {
      en: "makes more insulin, then less as sugar falls",
      hi: "अधिक इंसुलिन बनाता है, फिर शर्करा घटने पर कम",
    },
    wrong: [
      {
        en: "makes less insulin so the sugar can be stored",
        hi: "कम इंसुलिन बनाता है ताकि शर्करा जमा हो सके",
      },
      { en: "stops working until the sugar is used up", hi: "शर्करा खर्च होने तक काम बंद कर देता है" },
    ],
    why: {
      en: "Feedback keeps hormones precise: high sugar → more insulin; falling sugar → less insulin.",
      hi: "पुनर्भरण हॉर्मोनों को सटीक रखता है: ज़्यादा शर्करा → ज़्यादा इंसुलिन; गिरती शर्करा → कम इंसुलिन।",
    },
  },
  puberty: {
    q: {
      en: "The changes of puberty at around 10–12 years are due to…",
      hi: "लगभग 10–12 साल की उम्र में यौवनारंभ के बदलाव होते हैं…",
    },
    right: {
      en: "testosterone in males and oestrogen in females",
      hi: "पुरुषों में टेस्टोस्टेरॉन और स्त्रियों में एस्ट्रोजन से",
    },
    wrong: [
      {
        en: "insulin rising steadily in both boys and girls",
        hi: "लड़कों और लड़कियों दोनों में लगातार बढ़ता इंसुलिन",
      },
      { en: "adrenaline in boys and girls alike", hi: "लड़कों और लड़कियों दोनों में एड्रीनलीन" },
    ],
    why: {
      en: "Testosterone from the testes and oestrogen from the ovaries bring the changes of puberty.",
      hi: "वृषण का टेस्टोस्टेरॉन और अंडाशय का एस्ट्रोजन यौवनारंभ के बदलाव लाते हैं।",
    },
  },
};

/** NCERT 7.3: what animal hormones do, and feedback. */
export const hormoneEffect = family({
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
