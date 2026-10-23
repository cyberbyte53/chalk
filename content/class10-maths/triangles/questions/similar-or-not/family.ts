import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const word = {
  similar: t("similar", "समरूप"),
  congruent: t("congruent", "सर्वांगसम"),
  unequal: t("unequal", "असमान"),
};

/** Exercise 6.1 Q1–Q3 and the photo print: which figures are similar. */
const items = {
  circles: {
    prompt: t("Fill the blank: all circles are ___.", "रिक्त स्थान भरो: सभी वृत्त ___ होते हैं।"),
    right: word.similar,
    wrong: [
      {
        label: word.congruent,
        why: t(
          "Congruent needs the same size too; circles of different radii aren't.",
          "सर्वांगसम के लिए आकार भी समान चाहिए; अलग त्रिज्या के वृत्त नहीं होते।",
        ),
      },
      {
        label: word.unequal,
        why: t(
          "Every circle is an enlargement of every other, so they are all similar.",
          "हर वृत्त दूसरे का बड़ा या छोटा रूप है, इसलिए सभी समरूप हैं।",
        ),
      },
    ],
  },
  squares: {
    prompt: t("Fill the blank: all squares are ___.", "रिक्त स्थान भरो: सभी वर्ग ___ होते हैं।"),
    right: word.similar,
    wrong: [
      {
        label: word.congruent,
        why: t(
          "A 2 cm square and a 5 cm square aren't the same size, so not congruent. Same shape, though.",
          "2 cm और 5 cm के वर्ग एक माप के नहीं, तो सर्वांगसम नहीं। पर आकार एक ही है।",
        ),
      },
      {
        label: word.unequal,
        why: t(
          "All angles are 90° and all sides are in one ratio, so every two squares are similar.",
          "सभी कोण 90° हैं और सभी भुजाएँ एक अनुपात में, तो कोई भी दो वर्ग समरूप हैं।",
        ),
      },
    ],
  },
  equilateral: {
    prompt: t(
      "Fill the blank: all ___ triangles are similar.",
      "रिक्त स्थान भरो: सभी ___ त्रिभुज समरूप होते हैं।",
    ),
    right: t("equilateral", "समबाहु"),
    wrong: [
      {
        label: t("isosceles", "समद्विबाहु"),
        why: t(
          "Isosceles triangles can have any top angle, so their shapes differ.",
          "समद्विबाहु त्रिभुजों का शीर्ष कोण कुछ भी हो सकता है, तो आकार अलग होते हैं।",
        ),
      },
      {
        label: t("right-angled", "समकोण"),
        why: t(
          "One right angle isn't enough: the other two angles can differ.",
          "एक समकोण काफ़ी नहीं: बाक़ी दो कोण अलग हो सकते हैं।",
        ),
      },
    ],
  },
  polygons: {
    prompt: t(
      "Two polygons with the same number of sides are similar if their angles are equal and their sides are ___.",
      "समान भुजाओं वाले दो बहुभुज समरूप होते हैं यदि उनके कोण बराबर हों और भुजाएँ ___ हों।",
    ),
    right: t("in one ratio", "एक अनुपात में"),
    wrong: [
      {
        label: t("all equal", "सब बराबर"),
        why: t(
          "Equal sides would make them congruent; similar needs only one ratio.",
          "बराबर भुजाएँ उन्हें सर्वांगसम बनातीं; समरूप के लिए बस एक अनुपात चाहिए।",
        ),
      },
      {
        label: t("all parallel", "सब समांतर"),
        why: t(
          "Parallel sides aren't required. The sides must be proportional.",
          "समांतर भुजाएँ ज़रूरी नहीं। भुजाएँ समानुपाती होनी चाहिए।",
        ),
      },
    ],
  },
  rhombus: {
    prompt: t(
      "A square and a rhombus both have sides of 4 cm. Are they similar?",
      "एक वर्ग और एक समचतुर्भुज दोनों की भुजाएँ 4 cm हैं। क्या वे समरूप हैं?",
    ),
    right: t("Only if the rhombus has right angles", "केवल तब जब समचतुर्भुज के कोण समकोण हों"),
    wrong: [
      {
        label: t("Yes, always: the sides are in one ratio", "हाँ, हमेशा: भुजाएँ एक अनुपात में हैं"),
        why: t(
          "Sides in one ratio isn't enough for quadrilaterals: the angles must match too.",
          "चतुर्भुजों के लिए भुजाओं का एक अनुपात काफ़ी नहीं: कोण भी मिलने चाहिए।",
        ),
      },
      {
        label: t("No, never: they are different shapes", "नहीं, कभी नहीं: वे अलग आकार हैं"),
        why: t(
          "A rhombus with 90° angles is a square, so then they are similar.",
          "90° कोणों वाला समचतुर्भुज वर्ग ही है, तब वे समरूप हैं।",
        ),
      },
    ],
  },
  print: {
    prompt: t(
      "A 10 cm × 15 cm photo is printed bigger. Which print is similar to it?",
      "10 cm × 15 cm की एक फ़ोटो बड़ी छापी जाती है। कौन-सा प्रिंट उसके समरूप है?",
    ),
    right: t("20 cm × 30 cm", "20 cm × 30 cm"),
    wrong: [
      {
        label: t("20 cm × 25 cm", "20 cm × 25 cm"),
        why: t(
          "That adds 10 cm to each side. Similar means multiplying both by the same number.",
          "यह हर भुजा में 10 cm जोड़ता है। समरूप का मतलब है दोनों को एक ही संख्या से गुणा करना।",
        ),
      },
      {
        label: t("15 cm × 20 cm", "15 cm × 20 cm"),
        why: t(
          "That adds 5 cm to each. 15 ÷ 10 = 1.5 but 20 ÷ 15 ≈ 1.33: not one ratio.",
          "यह हर एक में 5 cm जोड़ता है। 15 ÷ 10 = 1.5 पर 20 ÷ 15 ≈ 1.33: एक अनुपात नहीं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Decide which figures are similar. */
export const similarOrNot = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.SimilarFigures],
});
