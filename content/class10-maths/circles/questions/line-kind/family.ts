import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const items = {
  none: {
    prompt: t(
      "A line and a circle in the same plane have no common point. What is the line called?",
      "एक ही तल में एक रेखा और एक वृत्त का कोई साझा बिंदु नहीं है। रेखा को क्या कहते हैं?",
    ),
    right: t("A non-intersecting line", "अप्रतिच्छेदी रेखा"),
    wrong: [
      {
        label: t("A tangent to the circle", "वृत्त की स्पर्श रेखा"),
        why: t("A tangent touches the circle at one point.", "स्पर्श रेखा वृत्त को एक बिंदु पर छूती है।"),
      },
      {
        label: t("A secant of the circle", "वृत्त की छेदक रेखा"),
        why: t("A secant cuts the circle at two points.", "छेदक रेखा वृत्त को दो बिंदुओं पर काटती है।"),
      },
    ],
  },
  two: {
    prompt: t(
      "A line meets a circle at two points A and B. What is the line, and what is AB?",
      "एक रेखा वृत्त से दो बिंदुओं A और B पर मिलती है। रेखा क्या है, और AB क्या है?",
    ),
    right: t("A secant; AB is a chord", "छेदक; AB एक जीवा है"),
    wrong: [
      {
        label: t("A tangent; AB is a chord", "स्पर्श रेखा; AB एक जीवा है"),
        why: t("A tangent has only one common point.", "स्पर्श रेखा का केवल एक साझा बिंदु होता है।"),
      },
      {
        label: t("A secant; AB is a radius", "छेदक; AB एक त्रिज्या है"),
        why: t(
          "A radius runs from the centre. A segment joining two points of the circle is a chord.",
          "त्रिज्या केंद्र से चलती है। वृत्त के दो बिंदुओं को जोड़ने वाला रेखाखंड जीवा है।",
        ),
      },
    ],
  },
  one: {
    prompt: t(
      "A road touches a rolling wheel at just one point. In circle words, the road is …",
      "एक सड़क लुढ़कते पहिये को केवल एक बिंदु पर छूती है। वृत्त के शब्दों में सड़क है …",
    ),
    right: t("a tangent to the wheel", "पहिये की स्पर्श रेखा"),
    wrong: [
      {
        label: t("a secant of the wheel", "पहिये की छेदक रेखा"),
        why: t("A secant would cut the wheel twice.", "छेदक पहिये को दो बार काटती।"),
      },
      {
        label: t("a diameter of the wheel", "पहिये का व्यास"),
        why: t(
          "A diameter is a chord through the centre, inside the wheel. The road stays outside and touches.",
          "व्यास केंद्र से जाने वाली जीवा है, पहिये के अंदर। सड़क बाहर रहकर छूती है।",
        ),
      },
    ],
  },
  three: {
    prompt: t(
      "Can a straight line meet a circle at three points?",
      "क्या एक सीधी रेखा किसी वृत्त से तीन बिंदुओं पर मिल सकती है?",
    ),
    right: t("No, at most two", "नहीं, अधिक से अधिक दो"),
    wrong: [
      {
        label: t("Yes, if it passes through the centre", "हाँ, अगर वह केंद्र से जाए"),
        why: t(
          "Through the centre it's a diameter's line: still two points, one at each end.",
          "केंद्र से जाने पर वह व्यास की रेखा है: फिर भी दो बिंदु, हर सिरे पर एक।",
        ),
      },
      {
        label: t("Yes, if the circle is big", "हाँ, अगर वृत्त बड़ा हो"),
        why: t(
          "Size doesn't matter: a line and a circle share 0, 1 or 2 points.",
          "आकार से फ़र्क़ नहीं पड़ता: रेखा और वृत्त 0, 1 या 2 बिंदु साझा करते हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Name the line by how many points it shares with the circle (NCERT 10.1, Fig 10.1). */
export const lineKind = bankFamily(items, { level: Level.Easy, tests: [Concept.LinesAndCircles] });
