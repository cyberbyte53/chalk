import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const items = {
  angle: {
    prompt: t(
      "What is the angle between the tangent at P and the radius OP?",
      "P पर स्पर्श रेखा और त्रिज्या OP के बीच का कोण क्या है?",
    ),
    right: t("90°", "90°"),
    wrong: [
      {
        label: t("45°", "45°"),
        why: t(
          "By Theorem 10.1 the tangent is perpendicular to the radius.",
          "प्रमेय 10.1 से स्पर्श रेखा त्रिज्या पर लंब है।",
        ),
      },
      {
        label: t("180°", "180°"),
        why: t(
          "180° would put them on one straight line. The radius meets the tangent at a right angle.",
          "180° पर वे एक सीधी रेखा में होते। त्रिज्या स्पर्श रेखा से समकोण पर मिलती है।",
        ),
      },
    ],
  },
  q5: {
    prompt: t(
      "Exercise 10.2 Q5: the perpendicular to a tangent at its point of contact always passes through …",
      "प्रश्नावली 10.2 प्र5: स्पर्श बिंदु पर स्पर्श रेखा पर खींचा गया लंब हमेशा … से होकर जाता है।",
    ),
    right: t("the centre of the circle", "वृत्त का केंद्र"),
    wrong: [
      {
        label: t("the end of a diameter", "किसी व्यास का सिरा"),
        why: t(
          "It runs along the radius to the point of contact, so it passes through the centre (and then the opposite end).",
          "यह स्पर्श बिंदु तक त्रिज्या के साथ जाता है, इसलिए केंद्र से होकर जाता है (और फिर विपरीत सिरे से)।",
        ),
      },
      {
        label: t("the midpoint of the tangent", "स्पर्श रेखा का मध्य-बिंदु"),
        why: t(
          "A tangent line has no midpoint, and the perpendicular leaves it at the point of contact.",
          "स्पर्श रेखा का कोई मध्य-बिंदु नहीं होता, और लंब उसे स्पर्श बिंदु पर छोड़ देता है।",
        ),
      },
    ],
  },
  normal: {
    prompt: t(
      "The line containing the radius through the point of contact is called the …",
      "स्पर्श बिंदु से जाने वाली त्रिज्या जिस रेखा पर है, उसे कहते हैं …",
    ),
    right: t("normal", "अभिलंब"),
    wrong: [
      {
        label: t("secant", "छेदक"),
        why: t(
          "It does cut the circle twice, but its special name at the point of contact is the normal.",
          "यह वृत्त को दो बार काटती तो है, पर स्पर्श बिंदु पर इसका विशेष नाम अभिलंब है।",
        ),
      },
      {
        label: t("tangent", "स्पर्श रेखा"),
        why: t(
          "The tangent is perpendicular to it, not along it.",
          "स्पर्श रेखा इस पर लंब है, इसके साथ नहीं।",
        ),
      },
    ],
  },
  shortest: {
    prompt: t(
      "In the proof of Theorem 10.1, why is OP perpendicular to the tangent XY?",
      "प्रमेय 10.1 की उपपत्ति में OP, स्पर्श रेखा XY पर लंब क्यों है?",
    ),
    right: t("OP is the shortest distance from O to XY", "OP, O से XY तक की सबसे छोटी दूरी है"),
    wrong: [
      {
        label: t("OP is the longest distance from O to XY", "OP, O से XY तक की सबसे लंबी दूरी है"),
        why: t(
          "Every other OQ is longer than OP, so OP is the shortest, and the shortest is the perpendicular.",
          "हर दूसरा OQ, OP से लंबा है, इसलिए OP सबसे छोटा है, और सबसे छोटा ही लंब होता है।",
        ),
      },
      {
        label: t("OP is the same length as every OQ", "OP हर OQ के बराबर लंबा है"),
        why: t(
          "Each other Q is outside the circle, so OQ > OP. They're not equal.",
          "हर दूसरा Q वृत्त के बाहर है, इसलिए OQ > OP। वे बराबर नहीं हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Theorem 10.1 and its remarks: the right angle, the normal, why the proof works. */
export const radiusAndTangent = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.TangentPerpendicularRadius],
});
