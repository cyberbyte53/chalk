import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  split: {
    prompt: t(
      "In an electric motor, the split ring acts as…",
      "विद्युत मोटर में विभक्त वलय काम करता है…",
    ),
    right: t(
      "a commutator, reversing the current every half turn",
      "दिक्परिवर्तक, जो हर आधे चक्कर पर धारा पलटता है",
    ),
    wrong: [
      {
        label: t(
          "a brush, cutting the current every half turn",
          "ब्रश, जो हर आधे चक्कर पर धारा काटता है",
        ),
        feedback: t(
          "The brushes are the fixed contacts X and Y. The split ring turns with the coil and reverses the current.",
          "ब्रश स्थिर संपर्क X और Y हैं। विभक्त वलय कुंडली के साथ घूमता है और धारा उलटता है।",
        ),
      },
      {
        label: t(
          "the magnet, flipping its poles every half turn",
          "चुंबक, जो हर आधे चक्कर पर ध्रुव पलटता है",
        ),
        feedback: t(
          "The magnets are the poles N and S around the coil.",
          "चुंबक कुंडली के चारों ओर के N और S ध्रुव हैं।",
        ),
      },
    ],
  },
  brushes: {
    prompt: t("What do the brushes X and Y in a motor do?", "मोटर में ब्रश X और Y क्या करते हैं?"),
    right: t(
      "Carry current from the battery into the turning coil and back",
      "बैटरी से धारा घूमती कुंडली तक ले जाते हैं और वापस",
    ),
    wrong: [
      {
        label: t("Clean the split ring", "विभक्त वलय साफ़ करते हैं"),
        feedback: t(
          "They're conducting contacts, not cleaners.",
          "वे चालक संपर्क हैं, सफ़ाई करने वाले नहीं।",
        ),
      },
    ],
  },
  armature: {
    prompt: t(
      "The soft iron core together with the coil wound on it is called…",
      "नरम लोहे का क्रोड और उस पर लपेटी कुंडली मिलकर कहलाते हैं…",
    ),
    right: t("the armature", "आर्मेचर"),
    wrong: [
      {
        label: t("the commutator", "दिक्परिवर्तक"),
        feedback: t("The commutator is the split ring.", "दिक्परिवर्तक विभक्त वलय है।"),
      },
      {
        label: t("the brush", "ब्रश"),
        feedback: t("Brushes are the fixed contacts.", "ब्रश स्थिर संपर्क हैं।"),
      },
    ],
  },
  commercial: {
    prompt: t(
      "Which is NOT used to make a commercial motor more powerful?",
      "व्यावसायिक मोटर को अधिक शक्तिशाली बनाने के लिए इनमें से क्या उपयोग नहीं होता?",
    ),
    right: t("Plain slip rings instead of a split ring", "विभक्त वलय की जगह सादे सर्पी वलय"),
    wrong: [
      {
        label: t("An electromagnet instead of a permanent magnet", "स्थायी चुंबक की जगह विद्युत चुंबक"),
        feedback: t(
          "That is used: it gives a stronger field.",
          "यह उपयोग होता है: इससे प्रबल क्षेत्र मिलता है।",
        ),
      },
      {
        label: t("Many turns of wire on a soft iron core", "नरम लोहे के क्रोड पर तार के अनेक फेरे"),
        feedback: t("That is used: more turns, more force.", "यह उपयोग होता है: अधिक फेरे, अधिक बल।"),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** The parts of an electric motor (NCERT 13.4; in-text Q3; Exercise 11). */
export const motorParts = family({
  level: Level.Easy,
  tests: [Concept.ElectricMotor],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
