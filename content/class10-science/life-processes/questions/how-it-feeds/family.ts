import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = [
  "tick",
  "breadMould",
  "lion",
  "tapeworm",
  "mushroom",
  "leech",
  "amoeba",
  "cuscuta",
] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  tick: {
    prompt: { en: "How does a tick feed?", hi: "किलनी भोजन कैसे लेती है?" },
    right: { en: "A parasite: feeds on a living host", hi: "परजीवी: जीवित परपोषी से भोजन लेता है" },
    wrong: [
      {
        en: "Breaks food down outside its body, then absorbs it",
        hi: "भोजन को शरीर के बाहर तोड़कर सोखता है",
      },
      { en: "Takes food in whole and breaks it down inside", hi: "भोजन पूरा अंदर लेकर अंदर तोड़ता है" },
    ],
    why: {
      en: "A tick sucks blood from a living animal without killing it: a parasite.",
      hi: "किलनी किसी जीवित जंतु को मारे बिना उसका ख़ून चूसती है: परजीवी।",
    },
  },
  breadMould: {
    prompt: { en: "How does bread mould feed?", hi: "डबलरोटी की फफूँद भोजन कैसे लेती है?" },
    right: {
      en: "Breaks food down outside its body, then absorbs it",
      hi: "भोजन को शरीर के बाहर तोड़कर सोखता है",
    },
    wrong: [
      { en: "A parasite: feeds on a living host", hi: "परजीवी: जीवित परपोषी से भोजन लेता है" },
      { en: "Takes food in whole and breaks it down inside", hi: "भोजन पूरा अंदर लेकर अंदर तोड़ता है" },
    ],
    why: {
      en: "Fungi like bread mould digest food outside their body and absorb it.",
      hi: "डबलरोटी की फफूँद जैसे कवक भोजन को शरीर के बाहर पचाकर सोखते हैं।",
    },
  },
  lion: {
    prompt: { en: "How does a lion feed?", hi: "शेर भोजन कैसे लेता है?" },
    right: {
      en: "Takes food in whole and breaks it down inside",
      hi: "भोजन पूरा अंदर लेकर अंदर तोड़ता है",
    },
    wrong: [
      { en: "A parasite: feeds on a living host", hi: "परजीवी: जीवित परपोषी से भोजन लेता है" },
      {
        en: "Breaks food down outside its body, then absorbs it",
        hi: "भोजन को शरीर के बाहर तोड़कर सोखता है",
      },
    ],
    why: {
      en: "A lion eats its food and digests it inside its body.",
      hi: "शेर भोजन खाकर शरीर के अंदर पचाता है।",
    },
  },
  tapeworm: {
    prompt: { en: "How does a tapeworm feed?", hi: "फ़ीताकृमि भोजन कैसे लेता है?" },
    right: { en: "A parasite: feeds on a living host", hi: "परजीवी: जीवित परपोषी से भोजन लेता है" },
    wrong: [
      {
        en: "Breaks food down outside its body, then absorbs it",
        hi: "भोजन को शरीर के बाहर तोड़कर सोखता है",
      },
      { en: "Takes food in whole and breaks it down inside", hi: "भोजन पूरा अंदर लेकर अंदर तोड़ता है" },
    ],
    why: {
      en: "A tapeworm lives inside its host and feeds on it without killing it.",
      hi: "फ़ीताकृमि परपोषी के अंदर रहकर उसे मारे बिना भोजन लेता है।",
    },
  },
  mushroom: {
    prompt: { en: "How does a mushroom feed?", hi: "मशरूम भोजन कैसे लेता है?" },
    right: {
      en: "Breaks food down outside its body, then absorbs it",
      hi: "भोजन को शरीर के बाहर तोड़कर सोखता है",
    },
    wrong: [
      { en: "A parasite: feeds on a living host", hi: "परजीवी: जीवित परपोषी से भोजन लेता है" },
      { en: "Takes food in whole and breaks it down inside", hi: "भोजन पूरा अंदर लेकर अंदर तोड़ता है" },
    ],
    why: {
      en: "Mushrooms are fungi: they break food down outside and absorb it.",
      hi: "मशरूम कवक हैं: वे भोजन बाहर तोड़कर सोखते हैं।",
    },
  },
  leech: {
    prompt: { en: "How does a leech feed?", hi: "जोंक भोजन कैसे लेती है?" },
    right: { en: "A parasite: feeds on a living host", hi: "परजीवी: जीवित परपोषी से भोजन लेता है" },
    wrong: [
      {
        en: "Breaks food down outside its body, then absorbs it",
        hi: "भोजन को शरीर के बाहर तोड़कर सोखता है",
      },
      { en: "Takes food in whole and breaks it down inside", hi: "भोजन पूरा अंदर लेकर अंदर तोड़ता है" },
    ],
    why: {
      en: "A leech sucks blood from a living host: a parasite.",
      hi: "जोंक जीवित परपोषी का ख़ून चूसती है: परजीवी।",
    },
  },
  amoeba: {
    prompt: { en: "How does Amoeba feed?", hi: "अमीबा भोजन कैसे लेता है?" },
    right: {
      en: "Takes food in whole and breaks it down inside",
      hi: "भोजन पूरा अंदर लेकर अंदर तोड़ता है",
    },
    wrong: [
      { en: "A parasite: feeds on a living host", hi: "परजीवी: जीवित परपोषी से भोजन लेता है" },
      {
        en: "Breaks food down outside its body, then absorbs it",
        hi: "भोजन को शरीर के बाहर तोड़कर सोखता है",
      },
    ],
    why: {
      en: "Amoeba engulfs food into a food vacuole and digests it inside.",
      hi: "अमीबा भोजन को खाद्य रिक्तिका में लेकर अंदर पचाता है।",
    },
  },
  cuscuta: {
    prompt: { en: "How does cuscuta (amar-bel) feed?", hi: "कस्कुटा (अमरबेल) भोजन कैसे लेती है?" },
    right: { en: "A parasite: feeds on a living host", hi: "परजीवी: जीवित परपोषी से भोजन लेता है" },
    wrong: [
      {
        en: "Breaks food down outside its body, then absorbs it",
        hi: "भोजन को शरीर के बाहर तोड़कर सोखता है",
      },
      { en: "Takes food in whole and breaks it down inside", hi: "भोजन पूरा अंदर लेकर अंदर तोड़ता है" },
    ],
    why: {
      en: "Cuscuta draws food from the living plant it wraps round.",
      hi: "कस्कुटा जिस जीवित पौधे पर लिपटती है उससे भोजन खींचती है।",
    },
  },
};

/** NCERT 6.2.2: which heterotrophic strategy does this organism use? */
export const howItFeeds = family({
  level: Level.Easy,
  tests: [Concept.HeterotrophicNutrition],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
