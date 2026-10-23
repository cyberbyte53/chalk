import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  order: {
    prompt: t(
      "In a thermal power plant, what is the right order?",
      "तापीय विद्युत संयंत्र में सही क्रम क्या है?",
    ),
    right: t(
      "Fuel heats water → steam turns turbine → generator",
      "ईंधन पानी गर्म करे → भाप टरबाइन घुमाए → जनित्र",
    ),
    wrong: [
      {
        label: t(
          "Generator heats water → steam turns fuel → turbine",
          "जनित्र पानी गर्म करे → भाप ईंधन घुमाए → टरबाइन",
        ),
        feedback: t(
          "The fuel is burnt first; the generator comes last.",
          "पहले ईंधन जलता है; जनित्र अंत में आता है।",
        ),
      },
      {
        label: t(
          "Turbine burns fuel → generator heats water → steam",
          "टरबाइन ईंधन जलाए → जनित्र पानी गर्म करे → भाप",
        ),
        feedback: t(
          "Burning heats water; the steam then turns the turbine.",
          "जलने से पानी गर्म होता है; फिर भाप टरबाइन घुमाती है।",
        ),
      },
    ],
  },
  thermal: {
    prompt: t("Why is it called a thermal power plant?", "इसे तापीय विद्युत संयंत्र क्यों कहते हैं?"),
    right: t(
      "Fuel is burnt to make heat, which is turned into electricity",
      "ईंधन जलाकर ऊष्मा बनती है, जो बिजली में बदलती है",
    ),
    wrong: [
      {
        label: t(
          "It is built only in hot places where the air is warm all year",
          "यह केवल गर्म जगहों पर बनता है जहाँ साल भर हवा गर्म रहती है",
        ),
        feedback: t(
          '"Thermal" refers to heat from burning fuel, not the weather.',
          '"तापीय" जलते ईंधन की ऊष्मा को कहते हैं, मौसम को नहीं।',
        ),
      },
      {
        label: t(
          "It stores heat in batteries to sell to homes at night",
          "यह ऊष्मा को बैटरियों में भरकर रात में घरों को बेचता है",
        ),
        feedback: t(
          "It makes electricity continuously; it doesn't sell stored heat.",
          "यह लगातार बिजली बनाता है; जमा ऊष्मा नहीं बेचता।",
        ),
      },
    ],
  },
  coalfield: {
    prompt: t(
      "Why are many thermal plants set up near coal or oil fields?",
      "कई तापीय संयंत्र कोयला या तेल क्षेत्रों के पास क्यों लगाए जाते हैं?",
    ),
    right: t(
      "Sending power by wire is easier than carrying coal far",
      "तार से विद्युत भेजना कोयला दूर ढोने से आसान है",
    ),
    wrong: [
      {
        label: t(
          "Coal near a mine burns hotter than coal carried far away",
          "खदान के पास का कोयला दूर ले गए कोयले से ज़्यादा गर्म जलता है",
        ),
        feedback: t(
          "Coal burns the same anywhere. Transport is the reason.",
          "कोयला कहीं भी एक जैसा जलता है। कारण ढुलाई है।",
        ),
      },
      {
        label: t(
          "Coal fields have no people, so the smoke harms no one there",
          "कोयला क्षेत्रों में लोग नहीं रहते, इसलिए धुआँ किसी को हानि नहीं करता",
        ),
        feedback: t(
          "People do live there. The reason is cheaper transmission.",
          "वहाँ लोग रहते हैं। कारण सस्ता संचरण है।",
        ),
      },
    ],
  },
  forms: {
    prompt: t("In a thermal plant, the energy changes are…", "तापीय संयंत्र में ऊर्जा परिवर्तन हैं…"),
    right: t("chemical → heat → kinetic → electrical", "रासायनिक → ऊष्मा → गतिज → विद्युत"),
    wrong: [
      {
        label: t("electrical → heat → chemical → kinetic", "विद्युत → ऊष्मा → रासायनिक → गतिज"),
        feedback: t(
          "Electrical energy is the output, so it comes last.",
          "विद्युत ऊर्जा निर्गत है, इसलिए अंत में आती है।",
        ),
      },
      {
        label: t("nuclear → light → kinetic → electrical", "नाभिकीय → प्रकाश → गतिज → विद्युत"),
        feedback: t(
          "Coal holds chemical energy; burning gives heat.",
          "कोयले में रासायनिक ऊर्जा है; जलने से ऊष्मा मिलती है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** How a thermal power plant works (NCERT 14.2.2). */
export const powerPlantChain = family({
  level: Level.Easy,
  tests: [Concept.FossilFuelsAndThermalPower],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
