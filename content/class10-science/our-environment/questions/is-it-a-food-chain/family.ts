import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["goat", "pond", "forest", "web"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  goat: {
    prompt: { en: "Which is a food chain?", hi: "कौन-सी आहार श्रृंखला है?" },
    right: { en: "Grass → goat → human", hi: "घास → बकरी → मानव" },
    wrong: [
      { en: "Grass → wheat → mango", hi: "घास → गेहूँ → आम" },
      { en: "Goat → cow → elephant", hi: "बकरी → गाय → हाथी" },
    ],
    why: {
      en: "A chain starts with a producer and each organism eats the one before it.",
      hi: "श्रृंखला उत्पादक से शुरू होती है और हर जीव पिछले को खाता है।",
    },
  },
  pond: {
    prompt: { en: "Which is a pond food chain?", hi: "कौन-सी तालाब की आहार श्रृंखला है?" },
    right: { en: "Algae → small fish → big fish", hi: "शैवाल → छोटी मछली → बड़ी मछली" },
    wrong: [
      { en: "Big fish → small fish → algae", hi: "बड़ी मछली → छोटी मछली → शैवाल" },
      { en: "Small fish → algae → big fish", hi: "छोटी मछली → शैवाल → बड़ी मछली" },
    ],
    why: {
      en: "Arrows point from the food to the eater, starting from the producer.",
      hi: "तीर भोजन से खाने वाले की ओर जाते हैं, उत्पादक से शुरू होकर।",
    },
  },
  forest: {
    prompt: { en: "Which is NCERT's forest food chain?", hi: "NCERT की वन आहार श्रृंखला कौन-सी है?" },
    right: { en: "Plants → deer → lion", hi: "पौधे → हिरण → शेर" },
    wrong: [
      { en: "Deer → plants → lion", hi: "हिरण → पौधे → शेर" },
      { en: "Lion → deer → plants", hi: "शेर → हिरण → पौधे" },
    ],
    why: {
      en: "The producer comes first, then the herbivore, then the carnivore.",
      hi: "पहले उत्पादक, फिर शाकाहारी, फिर मांसाहारी।",
    },
  },
  web: {
    prompt: {
      en: "Many food chains joined together form a…",
      hi: "कई आहार श्रृंखलाएँ जुड़कर क्या बनाती हैं?",
    },
    right: { en: "Food web", hi: "आहार जाल" },
    wrong: [
      { en: "Trophic level", hi: "पोषी स्तर" },
      { en: "Food pyramid", hi: "आहार पिरामिड" },
    ],
    why: {
      en: "Branching, linked chains form a food web.",
      hi: "शाखाओं वाली, जुड़ी श्रृंखलाएँ आहार जाल बनाती हैं।",
    },
  },
};

/** NCERT Exercise 2 and Fig 15.1: telling a real food chain from a list of organisms. */
export const isItAFoodChain = family({
  level: Level.Medium,
  tests: [Concept.FoodChainsAndWebs],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
