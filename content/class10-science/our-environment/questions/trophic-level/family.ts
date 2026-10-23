import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["grasshopper", "snake", "zooplankton", "autotroph", "frog"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  grasshopper: {
    prompt: {
      en: "In grass → grasshopper → frog → snake, the grasshopper is at level…",
      hi: "घास → टिड्डा → मेंढक → साँप में, टिड्डा किस स्तर पर है?",
    },
    right: { en: "2", hi: "2" },
    wrong: [
      { en: "1", hi: "1" },
      { en: "3", hi: "3" },
    ],
    why: {
      en: "Grass is level 1; the herbivore that eats it is level 2.",
      hi: "घास स्तर 1 है; उसे खाने वाला शाकाहारी स्तर 2 है।",
    },
  },
  snake: {
    prompt: {
      en: "In grass → grasshopper → frog → snake, the snake is a…",
      hi: "घास → टिड्डा → मेंढक → साँप में, साँप क्या है?",
    },
    right: { en: "Tertiary consumer", hi: "तृतीयक उपभोक्ता" },
    wrong: [
      { en: "Primary consumer", hi: "प्राथमिक उपभोक्ता" },
      { en: "Secondary consumer", hi: "द्वितीयक उपभोक्ता" },
    ],
    why: {
      en: "The fourth level, large carnivores, are tertiary consumers.",
      hi: "चौथा स्तर, बड़े मांसाहारी, तृतीयक उपभोक्ता हैं।",
    },
  },
  zooplankton: {
    prompt: {
      en: "In phytoplankton → zooplankton → fish, zooplankton are…",
      hi: "पादप प्लवक → जंतु प्लवक → मछली में, जंतु प्लवक क्या हैं?",
    },
    right: { en: "Primary consumers", hi: "प्राथमिक उपभोक्ता" },
    wrong: [
      { en: "Producers", hi: "उत्पादक" },
      { en: "Secondary consumers", hi: "द्वितीयक उपभोक्ता" },
    ],
    why: {
      en: "They eat the producers (phytoplankton), so they are herbivores: primary consumers.",
      hi: "वे उत्पादकों (पादप प्लवक) को खाते हैं, इसलिए शाकाहारी हैं: प्राथमिक उपभोक्ता।",
    },
  },
  autotroph: {
    prompt: {
      en: "Which trophic level do autotrophs occupy?",
      hi: "स्वपोषी किस पोषी स्तर पर होते हैं?",
    },
    right: { en: "The first", hi: "पहले" },
    wrong: [
      { en: "The second", hi: "दूसरे" },
      { en: "The top", hi: "सबसे ऊपर" },
    ],
    why: {
      en: "Autotrophs make their own food: they are the producers, the first level.",
      hi: "स्वपोषी अपना भोजन बनाते हैं: वे उत्पादक हैं, पहला स्तर।",
    },
  },
  frog: {
    prompt: {
      en: "In grass → grasshopper → frog → snake, the frog is a…",
      hi: "घास → टिड्डा → मेंढक → साँप में, मेंढक क्या है?",
    },
    right: { en: "Secondary consumer", hi: "द्वितीयक उपभोक्ता" },
    wrong: [
      { en: "Primary consumer", hi: "प्राथमिक उपभोक्ता" },
      { en: "Tertiary consumer", hi: "तृतीयक उपभोक्ता" },
    ],
    why: {
      en: "It eats a herbivore, so it is a small carnivore at level 3: a secondary consumer.",
      hi: "यह शाकाहारी को खाता है, इसलिए स्तर 3 का छोटा मांसाहारी है: द्वितीयक उपभोक्ता।",
    },
  },
};

/** NCERT 15.1.1: trophic levels in the chains of Fig 15.1. */
export const trophicLevel = family({
  level: Level.Medium,
  tests: [Concept.FoodChainsAndWebs],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
