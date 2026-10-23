import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["second", "third", "fourth", "back", "sun"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  second: {
    prompt: {
      en: "Producers hold 50,000 kJ. About how much reaches the herbivores?",
      hi: "उत्पादकों में 50,000 kJ है। शाकाहारियों तक लगभग कितनी पहुँचती है?",
    },
    right: { en: "5,000 kJ", hi: "5,000 kJ" },
    wrong: [
      { en: "500 kJ", hi: "500 kJ" },
      { en: "45,000 kJ", hi: "45,000 kJ" },
    ],
    why: {
      en: "About 10% passes up one level: 10% of 50,000 is 5,000.",
      hi: "लगभग 10% एक स्तर ऊपर जाता है: 50,000 का 10% = 5,000।",
    },
  },
  third: {
    prompt: {
      en: "Producers hold 10,000 kJ. About how much reaches the third level?",
      hi: "उत्पादकों में 10,000 kJ है। तीसरे स्तर तक लगभग कितनी पहुँचती है?",
    },
    right: { en: "100 kJ", hi: "100 kJ" },
    wrong: [
      { en: "1,000 kJ", hi: "1,000 kJ" },
      { en: "10 kJ", hi: "10 kJ" },
    ],
    why: {
      en: "Two steps of 10%: 10,000 → 1,000 → 100.",
      hi: "10% के दो कदम: 10,000 → 1,000 → 100।",
    },
  },
  fourth: {
    prompt: {
      en: "Producers hold 1,00,000 kJ. About how much reaches the fourth level?",
      hi: "उत्पादकों में 1,00,000 kJ है। चौथे स्तर तक लगभग कितनी पहुँचती है?",
    },
    right: { en: "100 kJ", hi: "100 kJ" },
    wrong: [
      { en: "1,000 kJ", hi: "1,000 kJ" },
      { en: "10,000 kJ", hi: "10,000 kJ" },
    ],
    why: {
      en: "Three steps of 10%: 1,00,000 → 10,000 → 1,000 → 100.",
      hi: "10% के तीन कदम: 1,00,000 → 10,000 → 1,000 → 100।",
    },
  },
  back: {
    prompt: {
      en: "A lion gets 20 kJ from the deer it eats. About how much was in the plants the deer ate?",
      hi: "शेर को खाए गए हिरण से 20 kJ मिलती है। हिरण के खाए पौधों में लगभग कितनी थी?",
    },
    right: { en: "2,000 kJ", hi: "2,000 kJ" },
    wrong: [
      { en: "200 kJ", hi: "200 kJ" },
      { en: "40 kJ", hi: "40 kJ" },
    ],
    why: {
      en: "Going down, each level holds about 10 times more: 20 → 200 → 2,000.",
      hi: "नीचे जाने पर हर स्तर में लगभग 10 गुना ज़्यादा: 20 → 200 → 2,000।",
    },
  },
  sun: {
    prompt: {
      en: "Sunlight on some leaves carries 1,00,000 kJ. About how much becomes food energy?",
      hi: "कुछ पत्तियों पर पड़ते प्रकाश में 1,00,000 kJ है। लगभग कितनी भोजन ऊर्जा बनती है?",
    },
    right: { en: "1,000 kJ", hi: "1,000 kJ" },
    wrong: [
      { en: "10,000 kJ", hi: "10,000 kJ" },
      { en: "100 kJ", hi: "100 kJ" },
    ],
    why: {
      en: "Plants capture about 1% of sunlight: 1% of 1,00,000 is 1,000.",
      hi: "पौधे प्रकाश का लगभग 1% पकड़ते हैं: 1,00,000 का 1% = 1,000।",
    },
  },
};

/** NCERT 15.1.1: about 10% of the energy passes to the next level. */
export const tenPercentEnergy = family({
  level: Level.Medium,
  tests: [Concept.EnergyFlow],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
