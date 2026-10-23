import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["refuse", "reduce", "reuse", "repurpose", "recycle"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  refuse: {
    prompt: {
      en: "Saying no to a plastic bag at the shop is…",
      hi: "दुकान पर प्लास्टिक की थैली को मना करना…",
    },
    right: { en: "Refuse", hi: "मना करना (Refuse)" },
    wrong: [
      { en: "Recycle", hi: "पुनर्चक्रण (Recycle)" },
      { en: "Repurpose", hi: "नया उपयोग (Repurpose)" },
    ],
    why: {
      en: "Saying no to what you don't need is Refuse.",
      hi: "जो ज़रूरी नहीं उसे मना करना Refuse है।",
    },
  },
  reduce: {
    prompt: {
      en: "Switching off fans and lights you aren't using is…",
      hi: "बेकार चल रहे पंखे और बत्तियाँ बंद करना…",
    },
    right: { en: "Reduce", hi: "कम करना (Reduce)" },
    wrong: [
      { en: "Reuse", hi: "दोबारा इस्तेमाल (Reuse)" },
      { en: "Repurpose", hi: "नया उपयोग (Repurpose)" },
    ],
    why: { en: "Using less is Reduce.", hi: "कम इस्तेमाल करना Reduce है।" },
  },
  reuse: {
    prompt: {
      en: "Washing a jam jar and storing dal in it is…",
      hi: "जैम की बोतल धोकर उसमें दाल रखना…",
    },
    right: { en: "Reuse", hi: "दोबारा इस्तेमाल (Reuse)" },
    wrong: [
      { en: "Recycle", hi: "पुनर्चक्रण (Recycle)" },
      { en: "Refuse", hi: "मना करना (Refuse)" },
    ],
    why: {
      en: "Using a thing again, as it is, is Reuse.",
      hi: "किसी चीज़ को वैसा ही फिर इस्तेमाल करना Reuse है।",
    },
  },
  repurpose: {
    prompt: { en: "Planting a money plant in a cracked cup is…", hi: "टूटे कप में मनी प्लांट लगाना…" },
    right: { en: "Repurpose", hi: "नया उपयोग (Repurpose)" },
    wrong: [
      { en: "Reduce", hi: "कम करना (Reduce)" },
      { en: "Recycle", hi: "पुनर्चक्रण (Recycle)" },
    ],
    why: {
      en: "Using a thing for a different job is Repurpose.",
      hi: "किसी चीज़ को दूसरे काम में लेना Repurpose है।",
    },
  },
  recycle: {
    prompt: {
      en: "Sending old newspapers to be made into new paper is…",
      hi: "पुराने अख़बार नया कागज़ बनाने भेजना…",
    },
    right: { en: "Recycle", hi: "पुनर्चक्रण (Recycle)" },
    wrong: [
      { en: "Reuse", hi: "दोबारा इस्तेमाल (Reuse)" },
      { en: "Repurpose", hi: "नया उपयोग (Repurpose)" },
    ],
    why: {
      en: "Making new things from old material is Recycle.",
      hi: "पुराने पदार्थ से नई चीज़ बनाना Recycle है।",
    },
  },
};

/** NCERT 16.1, the five R's: which R is each action? */
export const whichR = family({
  level: Level.Easy,
  tests: [Concept.OneEarthOneFamily],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
