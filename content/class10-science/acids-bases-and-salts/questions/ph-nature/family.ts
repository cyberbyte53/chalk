import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  ph1: {
    prompt: w("A solution has pH 1. It is:", "एक विलयन का pH 1 है। यह है:"),
    right: w("Strongly acidic", "प्रबल अम्लीय"),
    wrong: [
      wrong(
        w("Weakly acidic", "दुर्बल अम्लीय"),
        w(
          "The further below 7, the stronger the acid. 1 is near the bottom.",
          "7 से जितना नीचे, अम्ल उतना प्रबल। 1 सबसे नीचे के पास है।",
        ),
      ),
      wrong(w("Strongly basic", "प्रबल क्षारकीय"), w("Below 7 is acidic.", "7 से नीचे अम्लीय है।")),
    ],
  },
  ph4: {
    prompt: w("A solution has pH 4. It is:", "एक विलयन का pH 4 है। यह है:"),
    right: w("Weakly acidic", "दुर्बल अम्लीय"),
    wrong: [
      wrong(w("Neutral", "उदासीन"), w("Neutral is exactly 7.", "उदासीन ठीक 7 है।")),
      wrong(
        w("Strongly acidic", "प्रबल अम्लीय"),
        w("Strongly acidic is near 0–2.", "प्रबल अम्लीय 0–2 के पास होता है।"),
      ),
    ],
  },
  ph7: {
    prompt: w("A solution has pH 7. It is:", "एक विलयन का pH 7 है। यह है:"),
    right: w("Neutral", "उदासीन"),
    wrong: [
      wrong(
        w("Weakly basic", "दुर्बल क्षारकीय"),
        w("Basic starts above 7.", "क्षारकीय 7 से ऊपर शुरू होता है।"),
      ),
    ],
  },
  ph9: {
    prompt: w("A solution has pH 9. It is:", "एक विलयन का pH 9 है। यह है:"),
    right: w("Weakly basic", "दुर्बल क्षारकीय"),
    wrong: [
      wrong(
        w("Strongly basic", "प्रबल क्षारकीय"),
        w("Strongly basic is near 13–14.", "प्रबल क्षारकीय 13–14 के पास होता है।"),
      ),
      wrong(w("Acidic", "अम्लीय"), w("Above 7 is basic.", "7 से ऊपर क्षारकीय है।")),
    ],
  },
  ph11: {
    prompt: w("A solution has pH 11. It is:", "एक विलयन का pH 11 है। यह है:"),
    right: w("Strongly basic", "प्रबल क्षारकीय"),
    wrong: [
      wrong(
        w("Weakly acidic", "दुर्बल अम्लीय"),
        w("Above 7 is basic, and 11 is well above.", "7 से ऊपर क्षारकीय है, और 11 काफ़ी ऊपर है।"),
      ),
    ],
  },
  redLitmusBlue: {
    prompt: w(
      "A solution turns red litmus blue. Its pH is likely to be:",
      "एक विलयन लाल लिटमस को नीला करता है। इसका pH संभवतः है:",
    ),
    right: w("10", "10"),
    wrong: [
      wrong(
        w("4", "4"),
        w(
          "Turning red litmus blue means a base: pH above 7.",
          "लाल लिटमस को नीला करना मतलब क्षारक: pH 7 से ऊपर।",
        ),
      ),
      wrong(
        w("5", "5"),
        w("That's acidic. A base is above 7.", "वह अम्लीय है। क्षारक 7 से ऊपर होता है।"),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** What does a pH value tell you? */
export const phNature = family({
  level: Level.Easy,
  tests: [Concept.PhScale],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});
