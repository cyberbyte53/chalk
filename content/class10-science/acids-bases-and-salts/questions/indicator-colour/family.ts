import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  blueLitmusRed: {
    prompt: w(
      "A solution turns blue litmus red. It is:",
      "एक विलयन नीले लिटमस को लाल कर देता है। यह है:",
    ),
    right: w("Acidic", "अम्लीय"),
    wrong: [
      wrong(
        w("Basic", "क्षारकीय"),
        w(
          "Bases turn red litmus blue, not blue litmus red.",
          "क्षारक लाल लिटमस को नीला करते हैं, नीले को लाल नहीं।",
        ),
      ),
      wrong(
        w("Neutral", "उदासीन"),
        w("A neutral solution changes neither litmus.", "उदासीन विलयन किसी लिटमस को नहीं बदलता।"),
      ),
    ],
  },
  redLitmusBlue: {
    prompt: w(
      "A solution turns red litmus blue. It is:",
      "एक विलयन लाल लिटमस को नीला कर देता है। यह है:",
    ),
    right: w("Basic", "क्षारकीय"),
    wrong: [
      wrong(
        w("Acidic", "अम्लीय"),
        w(
          "Acids turn blue litmus red; this went the other way.",
          "अम्ल नीले लिटमस को लाल करते हैं; यह उल्टा हुआ।",
        ),
      ),
      wrong(
        w("Neutral", "उदासीन"),
        w("A neutral solution changes neither litmus.", "उदासीन विलयन किसी लिटमस को नहीं बदलता।"),
      ),
    ],
  },
  phenolphthaleinPink: {
    prompt: w(
      "Phenolphthalein turns pink in a solution. It is:",
      "एक विलयन में फ़िनॉल्फ़्थेलिन गुलाबी हो जाता है। यह है:",
    ),
    right: w("Basic", "क्षारकीय"),
    wrong: [
      wrong(
        w("Acidic", "अम्लीय"),
        w("Phenolphthalein stays colourless in acids.", "अम्लों में फ़िनॉल्फ़्थेलिन रंगहीन रहता है।"),
      ),
    ],
  },
  methylOrangeRed: {
    prompt: w(
      "Methyl orange turns red in a solution. It is:",
      "एक विलयन में मेथिल ऑरेंज लाल हो जाता है। यह है:",
    ),
    right: w("Acidic", "अम्लीय"),
    wrong: [
      wrong(
        w("Basic", "क्षारकीय"),
        w("In a base methyl orange is yellow.", "क्षारक में मेथिल ऑरेंज पीला होता है।"),
      ),
    ],
  },
  methylOrangeYellow: {
    prompt: w(
      "Methyl orange turns yellow in a solution. It is:",
      "एक विलयन में मेथिल ऑरेंज पीला हो जाता है। यह है:",
    ),
    right: w("Basic", "क्षारकीय"),
    wrong: [
      wrong(
        w("Acidic", "अम्लीय"),
        w("In an acid methyl orange is red.", "अम्ल में मेथिल ऑरेंज लाल होता है।"),
      ),
    ],
  },
  turmericBrown: {
    prompt: w(
      "A turmeric stain turns reddish brown when something is rubbed on it. That something is:",
      "हल्दी का दाग़ किसी चीज़ को रगड़ने पर लाल-भूरा हो जाता है। वह चीज़ है:",
    ),
    right: w("A base, like soap", "एक क्षारक, जैसे साबुन"),
    wrong: [
      wrong(
        w("An acid, like lemon juice", "एक अम्ल, जैसे नींबू का रस"),
        w("Turmeric stays yellow in acids.", "अम्लों में हल्दी पीली रहती है।"),
      ),
    ],
  },
  cabbageGreen: {
    prompt: w(
      "Red cabbage juice turns green in a solution. It is:",
      "एक विलयन में लाल पत्तागोभी का रस हरा हो जाता है। यह है:",
    ),
    right: w("Basic", "क्षारकीय"),
    wrong: [
      wrong(
        w("Acidic", "अम्लीय"),
        w("Red cabbage turns pink-red in acids.", "अम्लों में लाल पत्तागोभी गुलाबी-लाल होती है।"),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** Read an indicator's colour: acid, base or neutral? */
export const indicatorColour = family({
  level: Level.Easy,
  tests: [Concept.Indicators],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});
