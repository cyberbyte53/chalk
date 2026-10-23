import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  state: {
    prompt: t(
      "In Fleming's left-hand rule, the first finger points along the field and the second finger along the current. The thumb gives…",
      "फ़्लेमिंग के वामहस्त नियम में तर्जनी क्षेत्र की और मध्यमा धारा की दिशा में होती है। अँगूठा बताता है…",
    ),
    right: t("the force on the conductor", "चालक पर बल"),
    wrong: [
      {
        label: t("the induced current", "प्रेरित धारा"),
        feedback: t(
          "That's the right-hand rule's job. The left-hand thumb gives the force (motion).",
          "यह दक्षिण-हस्त नियम का काम है। बाएँ हाथ का अँगूठा बल (गति) बताता है।",
        ),
      },
    ],
  },
  activity: {
    prompt: t(
      "In Activity 13.7 the field is upward and the current in the rod flows from B to A. The rod moved left. If the current is reversed, the rod moves…",
      "क्रियाकलाप 13.7 में क्षेत्र ऊपर है और छड़ में धारा B से A बहती है। छड़ बाईं ओर गई। धारा उलटने पर छड़ जाती है…",
    ),
    right: t("to the right", "दाईं ओर"),
    wrong: [
      {
        label: t("to the left again", "फिर बाईं ओर"),
        feedback: t("Reversing the current reverses the force.", "धारा उलटने से बल उलटता है।"),
      },
      {
        label: t("upward", "ऊपर"),
        feedback: t(
          "The force is at right angles to the field, so it can't be up along it.",
          "बल क्षेत्र के लंबवत है, इसलिए उसके साथ ऊपर नहीं हो सकता।",
        ),
      },
    ],
  },
  electron: {
    prompt: t(
      "An electron moves to the right across a field pointing up the page. The force on it is…",
      "एक इलेक्ट्रॉन पृष्ठ पर ऊपर की ओर वाले क्षेत्र में दाईं ओर चलता है। उस पर बल है…",
    ),
    right: t("into the page", "पृष्ठ के अंदर"),
    wrong: [
      {
        label: t("out of the page", "पृष्ठ से बाहर"),
        feedback: t(
          "That's for a current to the right. An electron moving right is a current to the left.",
          "यह दाईं ओर की धारा के लिए है। दाईं ओर चलता इलेक्ट्रॉन बाईं ओर की धारा है।",
        ),
      },
      {
        label: t("to the left", "बाईं ओर"),
        feedback: t("The force is at right angles to the motion.", "बल गति के लंबवत होता है।"),
      },
    ],
  },
  alpha: {
    prompt: t(
      "An alpha particle (positive) moving west is deflected north by a magnetic field. The field points…",
      "पश्चिम की ओर चलता एक ऐल्फ़ा कण (धनावेशित) चुंबकीय क्षेत्र से उत्तर की ओर मुड़ता है। क्षेत्र है…",
    ),
    right: t("upward", "ऊपर की ओर"),
    wrong: [
      {
        label: t("downward", "नीचे की ओर"),
        feedback: t(
          "Second finger west, thumb north: the first finger points up.",
          "मध्यमा पश्चिम, अँगूठा उत्तर: तर्जनी ऊपर इशारा करती है।",
        ),
      },
      {
        label: t("towards east", "पूर्व की ओर"),
        feedback: t(
          "The field must be at right angles to the motion, which is east–west.",
          "क्षेत्र गति के लंबवत होना चाहिए, जो पूर्व-पश्चिम है।",
        ),
      },
      {
        label: t("towards south", "दक्षिण की ओर"),
        feedback: t(
          "The field is at right angles to the force too, which is north–south.",
          "क्षेत्र बल के भी लंबवत है, जो उत्तर-दक्षिण है।",
        ),
      },
    ],
  },
  beam: {
    prompt: t(
      "You sit with your back to a wall. An electron beam moving from the back wall to the front wall is deflected to your right. The field is…",
      "तुम एक दीवार की ओर पीठ करके बैठे हो। पीछे की दीवार से सामने की दीवार की ओर जाता इलेक्ट्रॉन पुंज तुम्हारी दाईं ओर मुड़ता है। क्षेत्र है…",
    ),
    right: t("vertically downward", "ऊर्ध्वाधर नीचे"),
    wrong: [
      {
        label: t("vertically upward", "ऊर्ध्वाधर ऊपर"),
        feedback: t(
          "The beam moves forward, so the current points backward. That gives a downward field.",
          "पुंज आगे चलता है, इसलिए धारा पीछे की ओर है। इससे क्षेत्र नीचे आता है।",
        ),
      },
      {
        label: t("towards the front wall", "सामने की दीवार की ओर"),
        feedback: t(
          "The field must be at right angles to the beam's motion.",
          "क्षेत्र पुंज की गति के लंबवत होना चाहिए।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Fleming's left-hand rule (NCERT 13.3; Example 13.2; in-text Q3; Exercises 10, 15(ii)). */
export const forceDirection = family({
  level: Level.Medium,
  tests: [Concept.ForceOnACurrent],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
