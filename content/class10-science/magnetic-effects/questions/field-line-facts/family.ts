import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  outside: {
    prompt: t(
      "Outside a bar magnet, which way do the field lines run?",
      "छड़ चुंबक के बाहर क्षेत्र रेखाएँ किस ओर चलती हैं?",
    ),
    right: t("From the N pole to the S pole", "N ध्रुव से S ध्रुव की ओर"),
    wrong: [
      {
        label: t("From the S pole to the N pole", "S ध्रुव से N ध्रुव की ओर"),
        feedback: t(
          "That is inside the magnet. Outside, they go the way a compass's N end points: away from N.",
          "यह चुंबक के अंदर है। बाहर वे उस ओर चलती हैं जिधर दिक्सूचक का N सिरा इशारा करता है: N से दूर।",
        ),
      },
    ],
  },
  crowded: {
    prompt: t(
      "Where the field lines are crowded together, the field is…",
      "जहाँ क्षेत्र रेखाएँ पास-पास होती हैं, वहाँ क्षेत्र…",
    ),
    right: t("stronger", "अधिक प्रबल होता है"),
    wrong: [
      {
        label: t("weaker", "कमज़ोर होता है"),
        feedback: t(
          "Crowded lines mean a strong field: a magnet there feels a bigger force.",
          "घनी रेखाओं का अर्थ है प्रबल क्षेत्र: वहाँ रखा चुंबक अधिक बल महसूस करता है।",
        ),
      },
      {
        label: t("zero", "शून्य होता है"),
        feedback: t(
          "Where there are lines there is a field; crowded lines mean more of it.",
          "जहाँ रेखाएँ हैं वहाँ क्षेत्र है; घनी रेखाओं का अर्थ अधिक क्षेत्र।",
        ),
      },
    ],
  },
  cross: {
    prompt: t(
      "Why do two magnetic field lines never intersect?",
      "दो चुंबकीय क्षेत्र रेखाएँ कभी एक-दूसरे को क्यों नहीं काटतीं?",
    ),
    right: t(
      "At the crossing a compass would point in two directions at once, which is impossible",
      "काटने वाले बिंदु पर दिक्सूचक एक साथ दो दिशाएँ दिखाता, जो असंभव है",
    ),
    wrong: [
      {
        label: t("They repel each other", "वे एक-दूसरे को प्रतिकर्षित करती हैं"),
        feedback: t(
          "Field lines are a drawing of the field's direction, not objects. One point has only one field direction.",
          "क्षेत्र रेखाएँ क्षेत्र की दिशा का चित्र हैं, वस्तुएँ नहीं। एक बिंदु पर क्षेत्र की केवल एक दिशा होती है।",
        ),
      },
    ],
  },
  closed: {
    prompt: t("Magnetic field lines are…", "चुंबकीय क्षेत्र रेखाएँ…"),
    right: t("closed curves", "बंद वक्र होती हैं"),
    wrong: [
      {
        label: t("lines that start at N and end at S", "N से शुरू होकर S पर ख़त्म होने वाली रेखाएँ"),
        feedback: t(
          "They continue inside the magnet from S back to N, so they close up.",
          "वे चुंबक के अंदर S से वापस N तक चलती हैं, इसलिए बंद हो जाती हैं।",
        ),
      },
      {
        label: t("straight lines", "सीधी रेखाएँ"),
        feedback: t(
          "Round a bar magnet they curve from one pole to the other.",
          "छड़ चुंबक के चारों ओर वे एक ध्रुव से दूसरे तक मुड़ती हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Magnetic field lines (NCERT 13.1; in-text questions on field lines). */
export const fieldLineFacts = family({
  level: Level.Easy,
  tests: [Concept.MagneticFieldAndLines],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
