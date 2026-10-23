import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  four: {
    prompt: t(
      "How can resistors of 2 Ω, 3 Ω and 6 Ω be connected to give 4 Ω?",
      "2 Ω, 3 Ω और 6 Ω के प्रतिरोधकों को 4 Ω देने के लिए कैसे जोड़ा जाए?",
    ),
    right: t("3 Ω ∥ 6 Ω (= 2 Ω), in series with 2 Ω", "3 Ω ∥ 6 Ω (= 2 Ω), 2 Ω के साथ श्रेणीक्रम में"),
    wrong: [
      {
        label: t("2 Ω ∥ 6 Ω, in series with 3 Ω", "2 Ω ∥ 6 Ω, 3 Ω के साथ श्रेणीक्रम में"),
        feedback: t("2 ∥ 6 = 1.5 Ω, plus 3 Ω is 4.5 Ω.", "2 ∥ 6 = 1.5 Ω, और 3 Ω मिलाकर 4.5 Ω।"),
      },
      {
        label: t("All in parallel", "सब पार्श्वक्रम में"),
        feedback: t(
          "All in parallel: 1/2 + 1/3 + 1/6 = 1, so 1 Ω.",
          "सब पार्श्वक्रम में: 1/2 + 1/3 + 1/6 = 1, यानी 1 Ω।",
        ),
      },
    ],
  },
  one: {
    prompt: t(
      "How can resistors of 2 Ω, 3 Ω and 6 Ω be connected to give 1 Ω?",
      "2 Ω, 3 Ω और 6 Ω के प्रतिरोधकों को 1 Ω देने के लिए कैसे जोड़ा जाए?",
    ),
    right: t("All three in parallel", "तीनों पार्श्वक्रम में"),
    wrong: [
      {
        label: t("All three in series", "तीनों श्रेणीक्रम में"),
        feedback: t("In series they make 11 Ω.", "श्रेणीक्रम में वे 11 Ω बनाते हैं।"),
      },
    ],
  },
  nine: {
    prompt: t(
      "With three 6 Ω resistors, how do you make 9 Ω?",
      "6 Ω के तीन प्रतिरोधकों से 9 Ω कैसे बनाओगे?",
    ),
    right: t(
      "Two in parallel (3 Ω), in series with the third",
      "दो पार्श्वक्रम में (3 Ω), तीसरे के साथ श्रेणीक्रम में",
    ),
    wrong: [
      {
        label: t(
          "Two in series, in parallel with the third",
          "दो श्रेणीक्रम में, तीसरे के साथ पार्श्वक्रम में",
        ),
        feedback: t("12 ∥ 6 = 4 Ω.", "12 ∥ 6 = 4 Ω।"),
      },
    ],
  },
  fourOfSixes: {
    prompt: t(
      "With three 6 Ω resistors, how do you make 4 Ω?",
      "6 Ω के तीन प्रतिरोधकों से 4 Ω कैसे बनाओगे?",
    ),
    right: t(
      "Two in series (12 Ω), in parallel with the third",
      "दो श्रेणीक्रम में (12 Ω), तीसरे के साथ पार्श्वक्रम में",
    ),
    wrong: [
      {
        label: t("All three in parallel", "तीनों पार्श्वक्रम में"),
        feedback: t("Three 6 Ω in parallel make 2 Ω.", "6 Ω के तीन पार्श्वक्रम में 2 Ω बनाते हैं।"),
      },
    ],
  },
  highest: {
    prompt: t(
      "Coils of 4 Ω, 8 Ω, 12 Ω and 24 Ω. What is the highest total resistance you can get?",
      "4 Ω, 8 Ω, 12 Ω और 24 Ω की कुंडलियाँ। सबसे ज़्यादा कुल प्रतिरोध कितना पा सकते हो?",
    ),
    right: t("48 Ω, all in series", "48 Ω, सब श्रेणीक्रम में"),
    wrong: [
      {
        label: t("24 Ω, the largest one", "24 Ω, सबसे बड़ी"),
        feedback: t(
          "Joining more in series adds: 4 + 8 + 12 + 24.",
          "श्रेणीक्रम में और जोड़ने से जुड़ता है: 4 + 8 + 12 + 24।",
        ),
      },
    ],
  },
  lowest: {
    prompt: t(
      "Coils of 4 Ω, 8 Ω, 12 Ω and 24 Ω. What is the lowest total resistance you can get?",
      "4 Ω, 8 Ω, 12 Ω और 24 Ω की कुंडलियाँ। सबसे कम कुल प्रतिरोध कितना पा सकते हो?",
    ),
    right: t("2 Ω, all in parallel", "2 Ω, सब पार्श्वक्रम में"),
    wrong: [
      {
        label: t("4 Ω, the smallest one", "4 Ω, सबसे छोटी"),
        feedback: t(
          "Parallel goes below the smallest: 1/4 + 1/8 + 1/12 + 1/24 = 12/24, so 2 Ω.",
          "पार्श्वक्रम सबसे छोटे से भी नीचे जाता है: 1/4 + 1/8 + 1/12 + 1/24 = 12/24, यानी 2 Ω।",
        ),
      },
    ],
  },
  fifths: {
    prompt: t(
      "A wire of resistance R is cut into five equal parts, which are joined in parallel to give R′. What is R/R′?",
      "R प्रतिरोध के एक तार को पाँच बराबर भागों में काटकर पार्श्वक्रम में जोड़ा जाता है, जिससे R′ मिलता है। R/R′ कितना है?",
    ),
    right: t("25", "25"),
    wrong: [
      {
        label: t("5", "5"),
        feedback: t(
          "Each piece is R/5, and five of them in parallel make (R/5)/5 = R/25.",
          "हर टुकड़ा R/5 है, और उनमें से पाँच पार्श्वक्रम में (R/5)/5 = R/25 बनाते हैं।",
        ),
      },
      {
        label: t("1/25", "1/25"),
        feedback: t(
          "R′ is the smaller one, so R/R′ is bigger than 1.",
          "R′ छोटा है, इसलिए R/R′ 1 से बड़ा है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Combining resistors to reach a target (NCERT 12.6.2 in-text Q4, Q5; Exercises 1, 11). */
export const combineToTarget = family({
  level: Level.Hard,
  tests: [Concept.ResistorsInParallel],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
