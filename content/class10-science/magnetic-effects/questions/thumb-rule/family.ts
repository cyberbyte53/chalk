import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  state: {
    prompt: t(
      "In the right-hand thumb rule, the thumb points along…",
      "दक्षिण-हस्त अंगुष्ठ नियम में अँगूठा किसकी दिशा में होता है?",
    ),
    right: t(
      "the current, and the fingers curl along the field",
      "धारा की, और उँगलियाँ क्षेत्र की दिशा में मुड़ती हैं",
    ),
    wrong: [
      {
        label: t("the field, and the fingers along the current", "क्षेत्र की, और उँगलियाँ धारा की"),
        feedback: t(
          "It's the other way: thumb along the current, fingers round the wire along the field.",
          "उलटा है: अँगूठा धारा की दिशा में, उँगलियाँ तार के चारों ओर क्षेत्र की दिशा में।",
        ),
      },
    ],
  },
  below: {
    prompt: t(
      "A power line carries a current from east to west. What is the field's direction directly below it?",
      "एक बिजली की लाइन में धारा पूर्व से पश्चिम बहती है। उसके ठीक नीचे क्षेत्र की दिशा क्या है?",
    ),
    right: t("South", "दक्षिण"),
    wrong: [
      {
        label: t("North", "उत्तर"),
        feedback: t(
          "North is directly above it. Thumb west: below the line the fingers point south.",
          "उत्तर ठीक ऊपर है। अँगूठा पश्चिम: लाइन के नीचे उँगलियाँ दक्षिण की ओर हैं।",
        ),
      },
      {
        label: t("West", "पश्चिम"),
        feedback: t(
          "The field circles the wire; it never points along it.",
          "क्षेत्र तार के चारों ओर घूमता है; उसके साथ-साथ नहीं।",
        ),
      },
    ],
  },
  page: {
    prompt: t(
      "Current flows out of the page in a wire. Seen from above, the field lines go round…",
      "एक तार में धारा पृष्ठ से बाहर आती है। ऊपर से देखने पर क्षेत्र रेखाएँ घूमती हैं…",
    ),
    right: t("anticlockwise", "वामावर्त"),
    wrong: [
      {
        label: t("clockwise", "दक्षिणावर्त"),
        feedback: t(
          "Thumb towards you, out of the page: your fingers curl anticlockwise.",
          "अँगूठा तुम्हारी ओर, पृष्ठ से बाहर: उँगलियाँ वामावर्त मुड़ती हैं।",
        ),
      },
    ],
  },
  corkscrew: {
    prompt: t("The right-hand thumb rule is also called…", "दक्षिण-हस्त अंगुष्ठ नियम को यह भी कहते हैं…"),
    right: t("Maxwell's corkscrew rule", "मैक्सवेल का कॉर्कस्क्रू नियम"),
    wrong: [
      {
        label: t("Fleming's left-hand rule", "फ़्लेमिंग का वामहस्त नियम"),
        feedback: t(
          "Fleming's left-hand rule gives the force on a current, a different question.",
          "फ़्लेमिंग का वामहस्त नियम धारा पर बल बताता है, एक अलग प्रश्न।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** The right-hand thumb rule (NCERT 13.2.2; Example 13.1; Exercise 15(i)). */
export const thumbRule = family({
  level: Level.Medium,
  tests: [Concept.FieldOfAStraightWire],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
