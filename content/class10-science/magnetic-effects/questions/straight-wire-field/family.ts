import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  shape: {
    prompt: t(
      "The field lines round a long straight current-carrying wire are…",
      "लंबे सीधे धारावाही तार के चारों ओर क्षेत्र रेखाएँ…",
    ),
    right: t("concentric circles centred on the wire", "तार पर केंद्रित संकेंद्री वृत्त होती हैं"),
    wrong: [
      {
        label: t("radial lines from the wire", "तार से निकलती त्रिज्य रेखाएँ"),
        feedback: t(
          "The filings curl round the wire in circles.",
          "बुरादा तार के चारों ओर वृत्तों में घूमता है।",
        ),
      },
      {
        label: t("straight lines parallel to the wire", "तार के समांतर सीधी रेखाएँ"),
        feedback: t("The field never points along the wire.", "क्षेत्र कभी तार के साथ-साथ नहीं होता।"),
      },
    ],
  },
  current: {
    prompt: t(
      "The current in a wire is increased. At a fixed point near it, the field…",
      "एक तार में धारा बढ़ाई जाती है। उसके पास एक निश्चित बिंदु पर क्षेत्र…",
    ),
    right: t("increases", "बढ़ता है"),
    wrong: [
      {
        label: t("decreases", "घटता है"),
        feedback: t(
          "More current, more field: the compass deflects more.",
          "अधिक धारा, अधिक क्षेत्र: दिक्सूचक अधिक विक्षेपित होता है।",
        ),
      },
      {
        label: t("stays the same", "वैसा ही रहता है"),
        feedback: t("The deflection grows with the current.", "विक्षेप धारा के साथ बढ़ता है।"),
      },
    ],
  },
  distance: {
    prompt: t(
      "A compass is moved farther from a current-carrying wire. Its deflection…",
      "एक दिक्सूचक धारावाही तार से दूर ले जाया जाता है। उसका विक्षेप…",
    ),
    right: t("decreases", "घटता है"),
    wrong: [
      {
        label: t("increases", "बढ़ता है"),
        feedback: t(
          "The field of a wire weakens with distance.",
          "तार का क्षेत्र दूरी के साथ कमज़ोर होता है।",
        ),
      },
    ],
  },
  reverse: {
    prompt: t(
      "The current in a wire is reversed. The field round it…",
      "एक तार में धारा उलटी कर दी जाती है। उसके चारों ओर क्षेत्र…",
    ),
    right: t("reverses its direction", "अपनी दिशा उलट देता है"),
    wrong: [
      {
        label: t("disappears completely", "पूरी तरह ग़ायब हो जाता है"),
        feedback: t(
          "There is still a current, so there is still a field, but it now circles the other way.",
          "अब भी धारा है, इसलिए क्षेत्र है, पर अब वह उलटी ओर घूमता है।",
        ),
      },
      {
        label: t("stays exactly the same", "बिल्कुल वैसा ही रहता है"),
        feedback: t(
          "Watch the compass: it swings the other way.",
          "दिक्सूचक देखो: वह उलटी ओर घूमता है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** The field of a current in a straight wire (NCERT 13.2.1; Exercise 1). */
export const straightWireField = family({
  level: Level.Easy,
  tests: [Concept.FieldOfAStraightWire],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
