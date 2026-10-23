import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  needle: {
    prompt: t("A compass needle is…", "दिक्सूचक की सुई…"),
    right: t("a small magnet", "एक छोटा चुंबक है"),
    wrong: [
      {
        label: t("a piece of copper", "ताँबे का टुकड़ा है"),
        feedback: t(
          "Copper isn't magnetic. The needle turns because it is a magnet itself.",
          "ताँबा चुंबकीय नहीं है। सुई इसलिए घूमती है क्योंकि वह ख़ुद चुंबक है।",
        ),
      },
    ],
  },
  deflect: {
    prompt: t(
      "Why does a compass needle get deflected near a bar magnet?",
      "छड़ चुंबक के पास दिक्सूचक की सुई क्यों विक्षेपित होती है?",
    ),
    right: t(
      "The magnet's field pushes and pulls the needle's poles",
      "चुंबक का क्षेत्र सुई के ध्रुवों को धकेलता और खींचता है",
    ),
    wrong: [
      {
        label: t("The magnet heats the needle", "चुंबक सुई को गर्म करता है"),
        feedback: t(
          "Heat plays no part. The needle is a magnet in the bar magnet's field.",
          "गर्मी की कोई भूमिका नहीं। सुई छड़ चुंबक के क्षेत्र में एक चुंबक है।",
        ),
      },
    ],
  },
  nearN: {
    prompt: t(
      "A compass is placed near the N pole of a bar magnet. Its north end points…",
      "दिक्सूचक छड़ चुंबक के N ध्रुव के पास रखा है। उसका उत्तर सिरा इशारा करता है…",
    ),
    right: t("away from the magnet's N pole", "चुंबक के N ध्रुव से दूर"),
    wrong: [
      {
        label: t("towards the magnet's N pole", "चुंबक के N ध्रुव की ओर"),
        feedback: t(
          "Like poles repel, so the needle's N end is pushed away.",
          "सजातीय ध्रुव प्रतिकर्षित करते हैं, इसलिए सुई का N सिरा दूर धकेला जाता है।",
        ),
      },
    ],
  },
  direction: {
    prompt: t(
      "The direction of the magnetic field at a point is the direction…",
      "किसी बिंदु पर चुंबकीय क्षेत्र की दिशा वह दिशा है…",
    ),
    right: t(
      "in which a compass's north pole placed there would move",
      "जिसमें वहाँ रखे दिक्सूचक का उत्तर ध्रुव चलेगा",
    ),
    wrong: [
      {
        label: t("in which its south pole would move", "जिसमें उसका दक्षिण ध्रुव चलेगा"),
        feedback: t(
          "By convention it's the north pole's direction.",
          "परिपाटी से यह उत्तर ध्रुव की दिशा है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Compass needles and magnetic poles (NCERT 13.1, Activity 13.3; in-text Q1). */
export const compassAndPoles = family({
  level: Level.Easy,
  tests: [Concept.MagneticFieldAndLines],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
