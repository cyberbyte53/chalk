import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  half: {
    prompt: t(
      "A coil is rotated in a magnetic field. The induced current changes direction once in each…",
      "एक कुंडली चुंबकीय क्षेत्र में घुमाई जाती है। प्रेरित धारा हर … में एक बार दिशा बदलती है।",
    ),
    right: t("half revolution", "आधे चक्कर"),
    wrong: [
      {
        label: t("one revolution", "एक चक्कर"),
        feedback: t(
          "After half a turn the arms have swapped, so the current reverses.",
          "आधे चक्कर के बाद भुजाएँ जगह बदल लेती हैं, इसलिए धारा उलटती है।",
        ),
      },
      {
        label: t("one-fourth revolution", "एक-चौथाई चक्कर"),
        feedback: t(
          "At a quarter turn the current is momentarily zero; it reverses at the half turn.",
          "चौथाई चक्कर पर धारा पल भर शून्य होती है; वह आधे चक्कर पर उलटती है।",
        ),
      },
    ],
  },
  difference: {
    prompt: t(
      "The essential difference between an AC and a DC generator is that…",
      "AC और DC जनित्र में मूल अंतर यह है कि…",
    ),
    right: t(
      "the AC generator has slip rings, the DC generator a commutator",
      "AC जनित्र में सर्पी वलय, DC जनित्र में दिक्परिवर्तक होता है",
    ),
    wrong: [
      {
        label: t(
          "the AC generator has an electromagnet, the DC one a bar magnet",
          "AC जनित्र में विद्युत चुंबक, DC में छड़ चुंबक होता है",
        ),
        feedback: t("Either can use either kind of magnet.", "दोनों में कोई भी चुंबक लग सकता है।"),
      },
      {
        label: t("the AC generator gives a higher voltage", "AC जनित्र अधिक वोल्टेज देता है"),
        feedback: t("The voltage doesn't decide AC or DC.", "वोल्टेज AC या DC तय नहीं करता।"),
      },
    ],
  },
  sources: {
    prompt: t("Which of these is a source of direct current?", "इनमें से कौन दिष्ट धारा का स्रोत है?"),
    right: t("A dry cell", "शुष्क सेल"),
    wrong: [
      {
        label: t("A power station's generator", "बिजलीघर का जनित्र"),
        feedback: t("Power stations produce AC.", "बिजलीघर AC बनाते हैं।"),
      },
      {
        label: t("A wall socket at home", "घर का दीवार सॉकेट"),
        feedback: t("Homes get AC from the mains.", "घरों को मेन्स से AC मिलती है।"),
      },
    ],
  },
  india: {
    prompt: t("In India, the frequency of the AC supply is…", "भारत में AC आपूर्ति की आवृत्ति है…"),
    right: t("50 Hz", "50 Hz"),
    wrong: [
      {
        label: t("100 Hz", "100 Hz"),
        feedback: t(
          "The current reverses every 1/100 s, which is 50 full cycles a second.",
          "धारा हर 1/100 s में उलटती है, यानी एक सेकंड में 50 पूरे चक्र।",
        ),
      },
      {
        label: t("220 Hz", "220 Hz"),
        feedback: t(
          "220 is the voltage in volts, not the frequency.",
          "220 वोल्ट में वोल्टेज है, आवृत्ति नहीं।",
        ),
      },
    ],
  },
  whyAc: {
    prompt: t(
      "An important advantage of AC over DC is that…",
      "DC की तुलना में AC का एक बड़ा लाभ है कि…",
    ),
    right: t(
      "it can be sent over long distances without much loss of energy",
      "इसे बिना अधिक ऊर्जा हानि के लंबी दूरी तक भेजा जा सकता है",
    ),
    wrong: [
      {
        label: t("it never changes direction", "यह कभी दिशा नहीं बदलती"),
        feedback: t(
          "That describes DC. AC reverses periodically.",
          "यह DC का वर्णन है। AC समय-समय पर उलटती है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Alternating and direct current (NCERT 13.6; in-text Q2–Q4; Exercise 4). */
export const acOrDc = family({
  level: Level.Easy,
  tests: [Concept.ElectricGenerator],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
