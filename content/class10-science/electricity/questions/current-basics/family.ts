import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  circuit: {
    prompt: t("What does an electric circuit mean?", "विद्युत परिपथ का क्या अर्थ है?"),
    right: t(
      "A continuous, closed path along which a current flows",
      "एक लगातार, बंद रास्ता जिस पर धारा बहती है",
    ),
    wrong: [
      {
        label: t("Any wire joined to a cell", "सेल से जुड़ा कोई भी तार"),
        feedback: t(
          "A wire with a loose end has a gap: no current. The path must be closed.",
          "ढीले सिरे वाले तार में खाली जगह है: कोई धारा नहीं। रास्ता बंद होना चाहिए।",
        ),
      },
      {
        label: t("The cell inside a torch", "टॉर्च के अंदर का सेल"),
        feedback: t(
          "The cell is one part. The circuit is the whole closed path, cell included.",
          "सेल एक भाग है। परिपथ पूरा बंद रास्ता है, सेल समेत।",
        ),
      },
    ],
  },
  ampere: {
    prompt: t("Define the unit of current.", "धारा के मात्रक की परिभाषा दो।"),
    right: t(
      "1 ampere is 1 coulomb of charge flowing past a point each second",
      "1 ऐम्पियर यानी हर सेकंड किसी बिंदु से 1 कूलॉम आवेश का बहना",
    ),
    wrong: [
      {
        label: t("1 ampere is 1 joule per coulomb", "1 ऐम्पियर यानी 1 जूल प्रति कूलॉम"),
        feedback: t(
          "Joules per coulomb is the volt, the unit of potential difference.",
          "जूल प्रति कूलॉम वोल्ट है, विभवांतर का मात्रक।",
        ),
      },
      {
        label: t("1 ampere is the charge of one electron", "1 ऐम्पियर यानी एक इलेक्ट्रॉन का आवेश"),
        feedback: t(
          "Charge is measured in coulombs. Current is charge per second.",
          "आवेश कूलॉम में मापा जाता है। धारा प्रति सेकंड आवेश है।",
        ),
      },
    ],
  },
  direction: {
    prompt: t(
      "In a circuit, which way is the conventional current taken to flow?",
      "परिपथ में परंपरागत धारा किस दिशा में बहती मानी जाती है?",
    ),
    right: t(
      "From the + terminal round to the − terminal, opposite to the electrons",
      "+ सिरे से घूमकर − सिरे तक, इलेक्ट्रॉनों के उलटी",
    ),
    wrong: [
      {
        label: t("The same way as the electrons", "इलेक्ट्रॉनों की दिशा में"),
        feedback: t(
          "Electrons are negative; current was defined as positive charge flowing, so it's the opposite way.",
          "इलेक्ट्रॉन ऋणात्मक हैं; धारा को धनावेश का प्रवाह माना गया, इसलिए वह उलटी दिशा में है।",
        ),
      },
    ],
  },
  milli: {
    prompt: t("How many amperes is 250 mA?", "250 mA कितने ऐम्पियर है?"),
    right: t("0.25 A", "0.25 A"),
    wrong: [
      {
        label: t("2.5 A", "2.5 A"),
        feedback: t("1 mA = 10⁻³ A, so divide by 1000.", "1 mA = 10⁻³ A, इसलिए 1000 से भाग दो।"),
      },
      {
        label: t("250 000 A", "250 000 A"),
        feedback: t(
          "A milliampere is a thousandth of an ampere, not a thousand.",
          "मिलीऐम्पियर ऐम्पियर का हज़ारवाँ भाग है, हज़ार गुना नहीं।",
        ),
      },
    ],
  },
  consumed: {
    prompt: t(
      "Charge flows from a cell, through a bulb, and back to the cell. Is any charge used up in the bulb?",
      "आवेश सेल से बल्ब से होकर वापस सेल तक बहता है। क्या बल्ब में कोई आवेश ख़र्च होता है?",
    ),
    right: t("No: all of it comes back round", "नहीं: सारा घूमकर वापस आता है"),
    wrong: [
      {
        label: t("Yes: that's what makes the light", "हाँ: इसी से रोशनी बनती है"),
        feedback: t(
          "The current is the same all round the loop. The bulb uses energy, not charge.",
          "धारा पूरे लूप में एक जैसी है। बल्ब ऊर्जा लेता है, आवेश नहीं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** What a current and a circuit are: NCERT 12.1's ideas and in-text questions. */
export const currentBasics = family({
  level: Level.Easy,
  tests: [Concept.CurrentAndCircuit],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
