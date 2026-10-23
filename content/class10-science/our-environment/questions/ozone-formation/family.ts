import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["split", "join", "where", "when"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  split: {
    prompt: {
      en: "What splits O₂ into free oxygen atoms high up?",
      hi: "ऊपर O₂ को मुक्त ऑक्सीजन परमाणुओं में कौन तोड़ता है?",
    },
    right: { en: "UV radiation", hi: "UV विकिरण" },
    wrong: [
      { en: "Lightning", hi: "बिजली" },
      { en: "CFC gas", hi: "CFC गैस" },
    ],
    why: {
      en: "High-energy UV radiation splits some O₂ molecules apart.",
      hi: "उच्च ऊर्जा वाला UV विकिरण कुछ O₂ अणुओं को तोड़ता है।",
    },
  },
  join: {
    prompt: {
      en: "A free O atom joins with what to make ozone?",
      hi: "ओज़ोन बनाने के लिए मुक्त O परमाणु किससे जुड़ता है?",
    },
    right: { en: "An O₂ molecule", hi: "एक O₂ अणु" },
    wrong: [
      { en: "Another O atom", hi: "दूसरा O परमाणु" },
      { en: "A water molecule", hi: "पानी का अणु" },
    ],
    why: { en: "O + O₂ → O₃.", hi: "O + O₂ → O₃।" },
  },
  where: {
    prompt: { en: "Where does ozone do its useful job?", hi: "ओज़ोन अपना उपयोगी काम कहाँ करती है?" },
    right: { en: "High in the atmosphere", hi: "वायुमंडल में बहुत ऊपर" },
    wrong: [
      { en: "Near the ground", hi: "ज़मीन के पास" },
      { en: "Inside the oceans", hi: "महासागरों के अंदर" },
    ],
    why: {
      en: "At higher levels of the atmosphere it shields the surface from UV.",
      hi: "वायुमंडल के ऊपरी भाग में यह सतह को UV से बचाती है।",
    },
  },
  when: {
    prompt: {
      en: "When did ozone levels begin to drop sharply?",
      hi: "ओज़ोन का स्तर तेज़ी से कब घटने लगा?",
    },
    right: { en: "In the 1980s", hi: "1980 के दशक में" },
    wrong: [
      { en: "In the 1880s", hi: "1880 के दशक में" },
      { en: "In the 2010s", hi: "2010 के दशक में" },
    ],
    why: {
      en: "NCERT: the amount of ozone began to drop sharply in the 1980s.",
      hi: "NCERT: ओज़ोन की मात्रा 1980 के दशक में तेज़ी से घटने लगी।",
    },
  },
};

/** NCERT 15.2.1: UV splits O₂ into O atoms, and O + O₂ gives O₃. */
export const ozoneFormation = family({
  level: Level.Hard,
  tests: [Concept.OzoneLayer],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
