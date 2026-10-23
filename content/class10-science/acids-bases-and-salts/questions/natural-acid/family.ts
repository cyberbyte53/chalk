import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  vinegar: {
    prompt: w("The acid in vinegar is:", "सिरके में अम्ल है:"),
    right: w("Acetic acid", "ऐसीटिक अम्ल"),
    wrong: [
      wrong(
        w("Citric acid", "साइट्रिक अम्ल"),
        w("Citric acid is in lemons and oranges.", "साइट्रिक अम्ल नींबू और संतरे में है।"),
      ),
    ],
  },
  lemon: {
    prompt: w("The acid in lemon is:", "नींबू में अम्ल है:"),
    right: w("Citric acid", "साइट्रिक अम्ल"),
    wrong: [
      wrong(w("Lactic acid", "लैक्टिक अम्ल"), w("Lactic acid is in curd.", "लैक्टिक अम्ल दही में है।")),
    ],
  },
  tamarind: {
    prompt: w("The acid in tamarind is:", "इमली में अम्ल है:"),
    right: w("Tartaric acid", "टार्टरिक अम्ल"),
    wrong: [
      wrong(
        w("Oxalic acid", "ऑक्सैलिक अम्ल"),
        w("Oxalic acid is in tomato.", "ऑक्सैलिक अम्ल टमाटर में है।"),
      ),
    ],
  },
  tomato: {
    prompt: w("The acid in tomato is:", "टमाटर में अम्ल है:"),
    right: w("Oxalic acid", "ऑक्सैलिक अम्ल"),
    wrong: [
      wrong(
        w("Tartaric acid", "टार्टरिक अम्ल"),
        w("Tartaric acid is in tamarind.", "टार्टरिक अम्ल इमली में है।"),
      ),
    ],
  },
  curd: {
    prompt: w("The acid in curd (sour milk) is:", "दही (खट्टे दूध) में अम्ल है:"),
    right: w("Lactic acid", "लैक्टिक अम्ल"),
    wrong: [
      wrong(w("Acetic acid", "ऐसीटिक अम्ल"), w("Acetic acid is vinegar.", "ऐसीटिक अम्ल सिरके में है।")),
    ],
  },
  ant: {
    prompt: w("An ant sting or a nettle sting contains:", "चींटी या बिच्छू बूटी के डंक में है:"),
    right: w("Methanoic acid", "मेथेनॉइक अम्ल"),
    wrong: [
      wrong(
        w("Citric acid", "साइट्रिक अम्ल"),
        w("Citric acid is in citrus fruits.", "साइट्रिक अम्ल खट्टे फलों में है।"),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** Which acid is in it? */
export const naturalAcid = family({
  level: Level.Easy,
  tests: [Concept.PhInEverydayLife],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});
