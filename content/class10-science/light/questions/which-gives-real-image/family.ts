import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

type L = ReturnType<typeof t>;
type Item = { prompt: L; right: L; wrong: { label: L; feedback: L }[] };

const items: Record<string, Item> = {
  alwaysSmall: {
    prompt: t(
      "Wherever the object is, a lens always gives a virtual, erect, diminished image. Which lens is it?",
      "वस्तु चाहे जहाँ हो, एक लेंस हमेशा आभासी, सीधा, छोटा प्रतिबिंब देता है। वह कौन-सा लेंस है?",
    ),
    right: t("A concave lens", "अवतल लेंस"),
    wrong: [
      {
        label: t("A convex lens", "उत्तल लेंस"),
        feedback: t(
          "A convex lens gives real, inverted images whenever the object is beyond F₁.",
          "उत्तल लेंस वास्तविक, उल्टे प्रतिबिंब देता है जब भी वस्तु F₁ से परे हो।",
        ),
      },
      {
        label: t("Either lens", "कोई भी लेंस"),
        feedback: t(
          "Only a lens that always spreads light apart can never form a real image.",
          "केवल वही लेंस कभी वास्तविक प्रतिबिंब नहीं बनाता जो प्रकाश को हमेशा फैलाता है।",
        ),
      },
    ],
  },
  screen: {
    prompt: t(
      "You want to catch the image of a candle on a screen. Which lens can do it?",
      "तुम्हें मोमबत्ती का प्रतिबिंब पर्दे पर लेना है। कौन-सा लेंस यह कर सकता है?",
    ),
    right: t("A convex lens, with the candle beyond F₁", "उत्तल लेंस, मोमबत्ती F₁ से परे हो"),
    wrong: [
      {
        label: t("A concave lens, with the candle far away", "अवतल लेंस, मोमबत्ती दूर हो"),
        feedback: t(
          "A concave lens's rays always spread apart, so they never meet on a screen.",
          "अवतल लेंस की किरणें हमेशा फैलती हैं, इसलिए पर्दे पर कभी नहीं मिलतीं।",
        ),
      },
      {
        label: t("A convex lens, with the candle inside F₁", "उत्तल लेंस, मोमबत्ती F₁ के अंदर हो"),
        feedback: t(
          "Inside F₁ the image is virtual: a magnifying glass, not a screen image.",
          "F₁ के अंदर प्रतिबिंब आभासी होता है: आवर्धक काँच, पर्दे वाला प्रतिबिंब नहीं।",
        ),
      },
    ],
  },
  far: {
    prompt: t(
      "A candle is moved farther and farther from a concave lens. Where does its image go?",
      "एक मोमबत्ती को अवतल लेंस से दूर, और दूर ले जाते हैं। उसका प्रतिबिंब कहाँ जाता है?",
    ),
    right: t("Towards F₁, getting smaller", "F₁ की ओर, छोटा होता हुआ"),
    wrong: [
      {
        label: t("Towards O, getting larger", "O की ओर, बड़ा होता हुआ"),
        feedback: t(
          "Farther objects give smaller images, and a very distant object's image is at F₁.",
          "दूर की वस्तुएँ छोटे प्रतिबिंब देती हैं, और बहुत दूर की वस्तु का प्रतिबिंब F₁ पर होता है।",
        ),
      },
      {
        label: t("To the other side of the lens", "लेंस की दूसरी ओर"),
        feedback: t(
          "A concave lens's image is always on the object's side, between F₁ and O.",
          "अवतल लेंस का प्रतिबिंब हमेशा वस्तु वाली ओर, F₁ और O के बीच होता है।",
        ),
      },
    ],
  },
  partner: {
    prompt: t(
      "Which mirror forms images like a concave lens: always virtual, erect and diminished?",
      "कौन-सा दर्पण अवतल लेंस जैसे प्रतिबिंब बनाता है: हमेशा आभासी, सीधे और छोटे?",
    ),
    right: t("A convex mirror", "उत्तल दर्पण"),
    wrong: [
      {
        label: t("A concave mirror", "अवतल दर्पण"),
        feedback: t(
          "A concave mirror brings light together, like a convex lens. It makes real images.",
          "अवतल दर्पण प्रकाश को इकट्ठा करता है, उत्तल लेंस की तरह। वह वास्तविक प्रतिबिंब बनाता है।",
        ),
      },
      {
        label: t("A plane mirror", "समतल दर्पण"),
        feedback: t(
          "A plane mirror's image is the same size, not diminished.",
          "समतल दर्पण का प्रतिबिंब बराबर आकार का होता है, छोटा नहीं।",
        ),
      },
    ],
  },
  magnifier: {
    prompt: t(
      "Which can show a small object enlarged and the right way up?",
      "कौन छोटी वस्तु को बड़ा और सीधा दिखा सकता है?",
    ),
    right: t("A convex lens, with the object inside F₁", "उत्तल लेंस, वस्तु F₁ के अंदर हो"),
    wrong: [
      {
        label: t("A concave lens, with the object close", "अवतल लेंस, वस्तु पास हो"),
        feedback: t(
          "A concave lens always makes images smaller.",
          "अवतल लेंस हमेशा प्रतिबिंब छोटा बनाता है।",
        ),
      },
      {
        label: t("A convex lens, with the object beyond 2F₁", "उत्तल लेंस, वस्तु 2F₁ से परे हो"),
        feedback: t(
          "Beyond 2F₁ the image is real, inverted and smaller.",
          "2F₁ से परे प्रतिबिंब वास्तविक, उल्टा और छोटा होता है।",
        ),
      },
    ],
  },
};

const asks = Object.keys(items) as [string, ...string[]];

/** Which mirrors and lenses can or can't make real images (NCERT Table 10.5, Activity 10.13). */
export const whichGivesRealImage = family({
  level: Level.Easy,
  tests: [Concept.ConcaveLensCases],
  params: z.object({ ask: z.enum(asks) }).strict(),
  build: ({ ask }, b) => {
    const item = items[ask] as Item;
    const options: Option[] = [
      { id: "right", label: item.right },
      ...item.wrong.map((w, i) => ({ id: `w${i}`, label: w.label, feedback: w.feedback })),
    ];
    const q = choiceQuestion(b, {
      prompt: item.prompt,
      options: settle(options, ask.length * 17),
      answer: "right",
    });
    return column([q, space()]);
  },
});
