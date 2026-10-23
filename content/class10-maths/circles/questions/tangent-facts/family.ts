import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const items = {
  secant: {
    prompt: t(
      "A secant through P turns until its second point Q runs into P. What does it become?",
      "P से जाने वाली छेदक रेखा तब तक घूमती है जब तक उसका दूसरा बिंदु Q, P में न मिल जाए। वह क्या बन जाती है?",
    ),
    right: t("The tangent at P", "P पर स्पर्श रेखा"),
    wrong: [
      {
        label: t("The diameter through P", "P से जाने वाला व्यास"),
        why: t(
          "The diameter cuts the circle at P and at the opposite end. When the two points coincide, the line only touches: a tangent.",
          "व्यास वृत्त को P पर और विपरीत सिरे पर काटता है। जब दोनों बिंदु मिल जाएँ तो रेखा बस छूती है: स्पर्श रेखा।",
        ),
      },
      {
        label: t("A non-intersecting line", "एक अप्रतिच्छेदी रेखा"),
        why: t(
          "It still passes through P, so it shares that point. It becomes the tangent at P.",
          "वह अब भी P से जाती है, इसलिए वह बिंदु साझा करती है। वह P पर स्पर्श रेखा बनती है।",
        ),
      },
    ],
  },
  contact: {
    prompt: t(
      "Exercise 10.1 Q2 (iv): the common point of a tangent and the circle is called the …",
      "प्रश्नावली 10.1 प्र2 (iv): स्पर्श रेखा और वृत्त के साझा बिंदु को कहते हैं …",
    ),
    right: t("point of contact", "स्पर्श बिंदु"),
    wrong: [
      {
        label: t("point of secant", "छेदन बिंदु"),
        why: t(
          "A secant has two points. The single touching point is the point of contact.",
          "छेदक के दो बिंदु होते हैं। अकेला छूने वाला बिंदु स्पर्श बिंदु है।",
        ),
      },
      {
        label: t("centre of the circle", "वृत्त का केंद्र"),
        why: t(
          "The centre is inside; a tangent never reaches it.",
          "केंद्र अंदर है; स्पर्श रेखा उस तक कभी नहीं पहुँचती।",
        ),
      },
    ],
  },
  meets: {
    prompt: t(
      "Exercise 10.1 Q2 (i): a tangent to a circle intersects it in … point(s).",
      "प्रश्नावली 10.1 प्र2 (i): वृत्त की स्पर्श रेखा उसे … बिंदु(ओं) पर काटती है।",
    ),
    right: t("one", "एक"),
    wrong: [
      {
        label: t("two", "दो"),
        why: t("Two points make it a secant.", "दो बिंदु हों तो वह छेदक है।"),
      },
      {
        label: t("no", "शून्य"),
        why: t(
          "No common point means non-intersecting. A tangent touches once.",
          "कोई साझा बिंदु न होना अप्रतिच्छेदी है। स्पर्श रेखा एक बार छूती है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** What a tangent is: the limit of a secant, its point of contact (10.2, Ex 10.1 Q2). */
export const tangentFacts = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.TangentAtAPoint],
});
