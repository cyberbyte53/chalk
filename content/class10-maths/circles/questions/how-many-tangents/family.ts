import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const items = {
  total: {
    prompt: t(
      "Exercise 10.1 Q1: how many tangents can a circle have?",
      "प्रश्नावली 10.1 प्र1: किसी वृत्त की कितनी स्पर्श रेखाएँ हो सकती हैं?",
    ),
    right: t("Infinitely many", "अनगिनत"),
    wrong: [
      {
        label: t("Exactly two", "ठीक दो"),
        why: t(
          "Two is the most parallel to one given line. There's one tangent at every point of the circle.",
          "दो अधिकतम वे हैं जो एक दी हुई रेखा के समांतर हों। वृत्त के हर बिंदु पर एक स्पर्श रेखा होती है।",
        ),
      },
      {
        label: t("Exactly one", "ठीक एक"),
        why: t(
          "One at each point, and a circle has infinitely many points.",
          "हर बिंदु पर एक, और वृत्त के अनगिनत बिंदु होते हैं।",
        ),
      },
    ],
  },
  atPoint: {
    prompt: t(
      "How many tangents can be drawn at one point of a circle?",
      "वृत्त के एक बिंदु पर कितनी स्पर्श रेखाएँ खींची जा सकती हैं?",
    ),
    right: t("Exactly one", "ठीक एक"),
    wrong: [
      {
        label: t("Exactly two", "ठीक दो"),
        why: t(
          "Turn a line about the point: only one position touches; every other one cuts again.",
          "बिंदु के चारों ओर रेखा घुमाओ: केवल एक स्थिति छूती है; बाक़ी हर एक फिर काटती है।",
        ),
      },
      {
        label: t("Infinitely many", "अनगिनत"),
        why: t(
          "A circle has infinitely many tangents in all, but only one at each point.",
          "वृत्त की कुल स्पर्श रेखाएँ अनगिनत हैं, पर हर बिंदु पर केवल एक।",
        ),
      },
    ],
  },
  parallel: {
    prompt: t(
      "Exercise 10.1 Q2 (iii): a circle can have … parallel tangents at the most.",
      "प्रश्नावली 10.1 प्र2 (iii): किसी वृत्त की अधिक से अधिक … समांतर स्पर्श रेखाएँ हो सकती हैं।",
    ),
    right: t("two", "दो"),
    wrong: [
      {
        label: t("one", "एक"),
        why: t(
          "Slide a line across the circle: it touches once on each side, two in all.",
          "रेखा को वृत्त के आर-पार खिसकाओ: वह हर ओर एक बार छूती है, कुल दो।",
        ),
      },
      {
        label: t("four", "चार"),
        why: t(
          "Lines parallel to each other share a direction, and only two of them touch the circle.",
          "आपस में समांतर रेखाओं की एक ही दिशा होती है, और उनमें से केवल दो वृत्त को छूती हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Counting tangents: in all, at a point, parallel to a line (Activities 1–2, Ex 10.1 Q1–2). */
export const howManyTangents = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.TangentAtAPoint],
});
