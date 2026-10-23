import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["field", "pond", "least", "top"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  field: {
    prompt: {
      en: "In soil → wheat → goat → human, who holds the most pesticide per body?",
      hi: "मिट्टी → गेहूँ → बकरी → मानव में, हर शरीर में सबसे ज़्यादा कीटनाशक किसमें है?",
    },
    right: { en: "Human", hi: "मानव" },
    wrong: [
      { en: "Goat", hi: "बकरी" },
      { en: "Wheat", hi: "गेहूँ" },
    ],
    why: {
      en: "It builds up at each level, so the top of the chain has the most.",
      hi: "यह हर स्तर पर जमा होता है, इसलिए श्रृंखला के शीर्ष में सबसे ज़्यादा।",
    },
  },
  pond: {
    prompt: {
      en: "In water → plants → small fish → big fish, who holds the most?",
      hi: "पानी → पौधे → छोटी मछली → बड़ी मछली में, सबसे ज़्यादा किसमें?",
    },
    right: { en: "Big fish", hi: "बड़ी मछली" },
    wrong: [
      { en: "Small fish", hi: "छोटी मछली" },
      { en: "Water plants", hi: "जलीय पौधे" },
    ],
    why: {
      en: "The highest level collects the chemical from all the levels below.",
      hi: "सबसे ऊँचा स्तर नीचे के सभी स्तरों से रसायन जमा करता है।",
    },
  },
  least: {
    prompt: {
      en: "In a sprayed field's chain, which level holds the least per body?",
      hi: "छिड़के खेत की श्रृंखला में, हर शरीर में सबसे कम किसमें?",
    },
    right: { en: "The crop plants", hi: "फ़सल के पौधे" },
    wrong: [
      { en: "The top carnivores", hi: "शीर्ष मांसाहारी" },
      { en: "The herbivores", hi: "शाकाहारी" },
    ],
    why: {
      en: "The concentration rises at every step, so the first living level has the least.",
      hi: "हर कदम पर सांद्रता बढ़ती है, इसलिए पहले जीवित स्तर में सबसे कम।",
    },
  },
  top: {
    prompt: {
      en: "Why do humans usually get the highest dose?",
      hi: "मनुष्यों को आमतौर पर सबसे ज़्यादा मात्रा क्यों मिलती है?",
    },
    right: { en: "We are at the top of chains", hi: "हम श्रृंखलाओं के शीर्ष पर हैं" },
    wrong: [
      { en: "We drink more water", hi: "हम ज़्यादा पानी पीते हैं" },
      { en: "We breathe in the spray", hi: "हम छिड़काव साँस में लेते हैं" },
    ],
    why: {
      en: "Humans occupy the top level in any food chain, where it builds up most.",
      hi: "मनुष्य किसी भी आहार श्रृंखला के शीर्ष पर हैं, जहाँ यह सबसे ज़्यादा जमा होता है।",
    },
  },
};

/** NCERT 15.1.1 and Exercise 6: which level holds the most of a magnified chemical. */
export const whereMostPesticide = family({
  level: Level.Medium,
  tests: [Concept.BiologicalMagnification, Concept.EnergyFlow],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
