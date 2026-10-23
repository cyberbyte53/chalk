import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  sting: {
    prompt: w(
      "A bee sting leaves an acid. What gives relief?",
      "मधुमक्खी का डंक एक अम्ल छोड़ता है। राहत क्या देता है?",
    ),
    right: w("Baking soda, a mild base", "खाने का सोडा, एक हल्का क्षारक"),
    wrong: [
      wrong(
        w("Vinegar", "सिरका"),
        w("Vinegar is an acid; the sting needs a base.", "सिरका अम्ल है; डंक को क्षारक चाहिए।"),
      ),
    ],
  },
  stomach: {
    prompt: w(
      "Excess stomach acid causes indigestion. The remedy is:",
      "पेट का अतिरिक्त अम्ल अपच करता है। इलाज है:",
    ),
    right: w("An antacid such as milk of magnesia", "मिल्क ऑफ़ मैग्नीशिया जैसा प्रतिअम्ल"),
    wrong: [
      wrong(w("Lemon juice", "नींबू का रस"), w("Lemon adds more acid.", "नींबू और अम्ल डालता है।")),
    ],
  },
  teeth: {
    prompt: w(
      "Tooth enamel starts to corrode when the mouth's pH falls below:",
      "दाँतों का इनेमल तब संक्षारित होने लगता है जब मुँह का pH गिरकर हो जाए:",
    ),
    right: w("5.5", "5.5"),
    wrong: [
      wrong(
        w("7.5", "7.5"),
        w(
          "7.5 is slightly basic and safe. Decay starts below 5.5.",
          "7.5 थोड़ा क्षारकीय और सुरक्षित है। सड़न 5.5 से नीचे शुरू होती है।",
        ),
      ),
    ],
  },
  acidRain: {
    prompt: w(
      "Rain is called acid rain when its pH is less than:",
      "वर्षा को अम्लीय वर्षा तब कहते हैं जब उसका pH कम हो:",
    ),
    right: w("5.6", "5.6"),
    wrong: [
      wrong(
        w("7", "7"),
        w(
          "Rain is naturally a little below 7. Acid rain is below 5.6.",
          "वर्षा स्वाभाविक रूप से 7 से थोड़ी नीचे होती है। अम्लीय वर्षा 5.6 से नीचे।",
        ),
      ),
    ],
  },
  body: {
    prompt: w("Our body works within the pH range:", "हमारा शरीर किस pH दायरे में काम करता है:"),
    right: w("7.0 to 7.8", "7.0 से 7.8"),
    wrong: [
      wrong(
        w("1 to 3", "1 से 3"),
        w("That's the stomach's acid, not the body overall.", "वह पेट का अम्ल है, पूरा शरीर नहीं।"),
      ),
    ],
  },
  soil: {
    prompt: w(
      "A farmer adds quick lime to his field. His soil was:",
      "एक किसान अपने खेत में बिना बुझा चूना डालता है। उसकी मिट्टी थी:",
    ),
    right: w("Too acidic", "बहुत अम्लीय"),
    wrong: [
      wrong(
        w("Too basic", "बहुत क्षारकीय"),
        w("Lime is a base: it fixes acidic soil.", "चूना क्षारक है: यह अम्लीय मिट्टी ठीक करता है।"),
      ),
    ],
  },
  curd: {
    prompt: w(
      "Fresh milk has pH 6. As it turns into curd, its pH:",
      "ताज़े दूध का pH 6 है। दही बनते हुए इसका pH:",
    ),
    right: w("Falls: lactic acid forms", "गिरता है: लैक्टिक अम्ल बनता है"),
    wrong: [
      wrong(
        w("Rises", "बढ़ता है"),
        w("Curd is sourer: more acid, lower pH.", "दही ज़्यादा खट्टा है: ज़्यादा अम्ल, कम pH।"),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** pH in living things: what's happening, and what helps? */
export const phRemedy = family({
  level: Level.Easy,
  tests: [Concept.PhInEverydayLife],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});
