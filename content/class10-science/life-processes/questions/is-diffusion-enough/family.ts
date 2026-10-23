import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["amoeba", "human", "bacterium", "cow", "paramoecium", "fish"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  amoeba: {
    prompt: {
      en: "Can diffusion alone supply oxygen to every cell of an Amoeba?",
      hi: "क्या अकेला विसरण अमीबा की हर कोशिका को ऑक्सीजन पहुँचा सकता है?",
    },
    right: { en: "Yes", hi: "हाँ" },
    wrong: [{ en: "No", hi: "नहीं" }],
    why: {
      en: "Amoeba is a single cell whose whole surface touches the water, so diffusion is enough.",
      hi: "अमीबा एक ही कोशिका है जिसकी पूरी सतह पानी को छूती है, इसलिए विसरण काफ़ी है।",
    },
  },
  human: {
    prompt: {
      en: "Can diffusion alone supply oxygen to every cell of a human?",
      hi: "क्या अकेला विसरण मनुष्य की हर कोशिका को ऑक्सीजन पहुँचा सकता है?",
    },
    right: { en: "No", hi: "नहीं" },
    wrong: [{ en: "Yes", hi: "हाँ" }],
    why: {
      en: "Most of our cells are deep inside, far from the surface. Diffusion is too slow; we need lungs and blood.",
      hi: "हमारी ज़्यादातर कोशिकाएँ अंदर गहरी हैं, सतह से दूर। विसरण बहुत धीमा है; हमें फेफड़े और रुधिर चाहिए।",
    },
  },
  bacterium: {
    prompt: {
      en: "Can diffusion alone supply oxygen to a single bacterium?",
      hi: "क्या अकेला विसरण एक जीवाणु को ऑक्सीजन पहुँचा सकता है?",
    },
    right: { en: "Yes", hi: "हाँ" },
    wrong: [{ en: "No", hi: "नहीं" }],
    why: {
      en: "A bacterium is one tiny cell in direct contact with its surroundings.",
      hi: "जीवाणु एक नन्ही कोशिका है जो सीधे अपने परिवेश के संपर्क में है।",
    },
  },
  cow: {
    prompt: {
      en: "Can diffusion alone supply oxygen to every cell of a cow?",
      hi: "क्या अकेला विसरण गाय की हर कोशिका को ऑक्सीजन पहुँचा सकता है?",
    },
    right: { en: "No", hi: "नहीं" },
    wrong: [{ en: "Yes", hi: "हाँ" }],
    why: {
      en: "A cow's inner cells are far from any surface; it needs a breathing and transport system.",
      hi: "गाय की अंदर की कोशिकाएँ किसी भी सतह से दूर हैं; उसे श्वसन और परिवहन तंत्र चाहिए।",
    },
  },
  paramoecium: {
    prompt: {
      en: "Can diffusion alone supply oxygen to a Paramoecium?",
      hi: "क्या अकेला विसरण पैरामीशियम को ऑक्सीजन पहुँचा सकता है?",
    },
    right: { en: "Yes", hi: "हाँ" },
    wrong: [{ en: "No", hi: "नहीं" }],
    why: {
      en: "Paramoecium is a single cell; its surface touches the water all round.",
      hi: "पैरामीशियम एक कोशिका है; उसकी सतह चारों ओर पानी को छूती है।",
    },
  },
  fish: {
    prompt: {
      en: "Can diffusion alone supply oxygen to every cell of a fish?",
      hi: "क्या अकेला विसरण मछली की हर कोशिका को ऑक्सीजन पहुँचा सकता है?",
    },
    right: { en: "No", hi: "नहीं" },
    wrong: [{ en: "Yes", hi: "हाँ" }],
    why: {
      en: "A fish is many cells thick; it takes oxygen in at its gills and its blood carries it round.",
      hi: "मछली कई कोशिकाएँ मोटी है; वह गलफड़ों से ऑक्सीजन लेती है और रुधिर उसे घुमाता है।",
    },
  },
};

/** NCERT 6.1, in-text Q1: is diffusion alone enough to bring oxygen to every cell of this organism? */
export const isDiffusionEnough = family({
  level: Level.Easy,
  tests: [Concept.WhatAreLifeProcesses],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
