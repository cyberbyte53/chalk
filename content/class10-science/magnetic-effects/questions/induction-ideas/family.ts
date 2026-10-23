import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  what: {
    prompt: t("Electromagnetic induction is…", "विद्युत चुंबकीय प्रेरण है…"),
    right: t(
      "inducing a current in a coil with a changing magnetic field",
      "बदलते चुंबकीय क्षेत्र से कुंडली में धारा प्रेरित करना",
    ),
    wrong: [
      {
        label: t(
          "making a magnetic field around a coil with a current",
          "धारा से कुंडली के चारों ओर चुंबकीय क्षेत्र बनाना",
        ),
        feedback: t(
          "That's the magnetic effect of a current, the reverse idea.",
          "यह धारा का चुंबकीय प्रभाव है, उलटा विचार।",
        ),
      },
      {
        label: t(
          "charging a body by rubbing it with a magnet",
          "चुंबक से रगड़कर किसी वस्तु को आवेशित करना",
        ),
        feedback: t("Charging is static electricity.", "आवेशित करना स्थिर विद्युत है।"),
      },
    ],
  },
  rule: {
    prompt: t(
      "Which rule gives the direction of the current induced in a coil rotating in a magnetic field?",
      "चुंबकीय क्षेत्र में घूमती कुंडली में प्रेरित धारा की दिशा कौन-सा नियम बताता है?",
    ),
    right: t("Fleming's right-hand rule", "फ़्लेमिंग का दक्षिण-हस्त नियम"),
    wrong: [
      {
        label: t("Fleming's left-hand rule", "फ़्लेमिंग का वामहस्त नियम"),
        feedback: t(
          "The left hand gives the force on a current (motors).",
          "बायाँ हाथ धारा पर बल बताता है (मोटर)।",
        ),
      },
      {
        label: t("The right-hand thumb rule", "दक्षिण-हस्त अंगुष्ठ नियम"),
        feedback: t("That gives the field round a wire.", "वह तार के चारों ओर क्षेत्र बताता है।"),
      },
    ],
  },
  fingers: {
    prompt: t(
      "In Fleming's right-hand rule, the middle finger shows…",
      "फ़्लेमिंग के दक्षिण-हस्त नियम में मध्यमा दिखाती है…",
    ),
    right: t("the induced current", "प्रेरित धारा"),
    wrong: [
      {
        label: t("the magnetic field", "चुंबकीय क्षेत्र"),
        feedback: t("The forefinger shows the field.", "तर्जनी क्षेत्र दिखाती है।"),
      },
      {
        label: t("the coil's motion", "कुंडली की गति"),
        feedback: t("The thumb shows the motion.", "अँगूठा गति दिखाता है।"),
      },
    ],
  },
  direction: {
    prompt: t(
      "A wire moves up the page in a field pointing to the right. The induced current is…",
      "एक तार दाईं ओर वाले क्षेत्र में पृष्ठ पर ऊपर चलता है। प्रेरित धारा है…",
    ),
    right: t("into the page", "पृष्ठ के अंदर"),
    wrong: [
      {
        label: t("out of the page", "पृष्ठ से बाहर"),
        feedback: t(
          "Use the right hand: forefinger right, thumb up, middle finger into the page.",
          "दायाँ हाथ लो: तर्जनी दाएँ, अँगूठा ऊपर, मध्यमा पृष्ठ के अंदर।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Electromagnetic induction and Fleming's right-hand rule (NCERT 13.5; Exercises 2, 15(iii)). */
export const inductionIdeas = family({
  level: Level.Medium,
  tests: [Concept.ElectromagneticInduction],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
