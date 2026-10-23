import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = [
  "ribsLift",
  "diaphragmFlat",
  "chestSmaller",
  "airSucked",
  "ribsDown",
  "diaphragmDome",
] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  ribsLift: {
    prompt: {
      en: "The ribs lift. Breathing in or out?",
      hi: "पसलियाँ ऊपर उठती हैं। साँस अंदर या बाहर?",
    },
    right: { en: "Breathing in", hi: "साँस अंदर लेना" },
    wrong: [{ en: "Breathing out", hi: "साँस बाहर छोड़ना" }],
    why: {
      en: "Lifting the ribs makes the chest bigger, so air is sucked in.",
      hi: "पसलियाँ उठने से छाती बड़ी होती है, इसलिए हवा अंदर खिंचती है।",
    },
  },
  diaphragmFlat: {
    prompt: {
      en: "The diaphragm flattens. Breathing in or out?",
      hi: "डायाफ़्राम चपटा होता है। साँस अंदर या बाहर?",
    },
    right: { en: "Breathing in", hi: "साँस अंदर लेना" },
    wrong: [{ en: "Breathing out", hi: "साँस बाहर छोड़ना" }],
    why: {
      en: "A flattened diaphragm enlarges the chest cavity: breathing in.",
      hi: "चपटा डायाफ़्राम छाती की गुहा बड़ी करता है: साँस अंदर।",
    },
  },
  chestSmaller: {
    prompt: {
      en: "The chest cavity gets smaller. Breathing in or out?",
      hi: "छाती की गुहा छोटी होती है। साँस अंदर या बाहर?",
    },
    right: { en: "Breathing out", hi: "साँस बाहर छोड़ना" },
    wrong: [{ en: "Breathing in", hi: "साँस अंदर लेना" }],
    why: { en: "A smaller chest pushes air out.", hi: "छोटी छाती हवा को बाहर धकेलती है।" },
  },
  airSucked: {
    prompt: {
      en: "Air is sucked into the lungs and fills the alveoli. Breathing in or out?",
      hi: "हवा फेफड़ों में खिंचकर कूपिकाओं को भरती है। साँस अंदर या बाहर?",
    },
    right: { en: "Breathing in", hi: "साँस अंदर लेना" },
    wrong: [{ en: "Breathing out", hi: "साँस बाहर छोड़ना" }],
    why: { en: "Air rushes in when the chest expands.", hi: "छाती फैलने पर हवा अंदर आती है।" },
  },
  ribsDown: {
    prompt: {
      en: "The ribs come down. Breathing in or out?",
      hi: "पसलियाँ नीचे आती हैं। साँस अंदर या बाहर?",
    },
    right: { en: "Breathing out", hi: "साँस बाहर छोड़ना" },
    wrong: [{ en: "Breathing in", hi: "साँस अंदर लेना" }],
    why: {
      en: "Lowering the ribs makes the chest smaller, pushing air out.",
      hi: "पसलियाँ नीचे आने से छाती छोटी होती है, हवा बाहर निकलती है।",
    },
  },
  diaphragmDome: {
    prompt: {
      en: "The diaphragm domes up again. Breathing in or out?",
      hi: "डायाफ़्राम फिर गुंबद जैसा ऊपर उठता है। साँस अंदर या बाहर?",
    },
    right: { en: "Breathing out", hi: "साँस बाहर छोड़ना" },
    wrong: [{ en: "Breathing in", hi: "साँस अंदर लेना" }],
    why: {
      en: "When the diaphragm domes up, the chest gets smaller and air goes out.",
      hi: "डायाफ़्राम ऊपर उठने पर छाती छोटी होती है और हवा बाहर जाती है।",
    },
  },
};

/** NCERT 6.3: is this happening while breathing in or breathing out? */
export const inOrOut = family({
  level: Level.Easy,
  tests: [Concept.Breathing],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
