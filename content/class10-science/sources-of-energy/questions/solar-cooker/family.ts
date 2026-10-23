import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  black: {
    prompt: t(
      "Why is the inside of a solar cooker painted black?",
      "सौर कुकर का भीतरी भाग काला क्यों रंगा जाता है?",
    ),
    right: t("A black surface absorbs more heat", "काली सतह ज़्यादा ऊष्मा सोखती है"),
    wrong: [
      {
        label: t("A black surface reflects more heat", "काली सतह ज़्यादा ऊष्मा परावर्तित करती है"),
        feedback: t(
          "White and shiny surfaces reflect; black absorbs.",
          "सफ़ेद और चमकीली सतहें परावर्तित करती हैं; काली सोखती है।",
        ),
      },
      {
        label: t("Black paint keeps the box dust-free", "काला रंग डिब्बे को धूल-रहित रखता है"),
        feedback: t(
          "The colour matters for absorbing heat, not dust.",
          "रंग ऊष्मा सोखने के लिए है, धूल के लिए नहीं।",
        ),
      },
    ],
  },
  glass: {
    prompt: t(
      "What does the glass lid of a solar cooker do?",
      "सौर कुकर का काँच का ढक्कन क्या करता है?",
    ),
    right: t("Lets sunlight in and traps the heat", "धूप अंदर आने देता है और ऊष्मा रोकता है"),
    wrong: [
      {
        label: t("Blocks sunlight so the food doesn't burn", "धूप रोकता है ताकि खाना न जले"),
        feedback: t(
          "The glass lets sunlight in; without it the cooker never gets hot enough.",
          "काँच धूप अंदर आने देता है; उसके बिना कुकर पर्याप्त गर्म नहीं होता।",
        ),
      },
      {
        label: t("Makes the food cook by its own light", "खाने को अपने प्रकाश से पकाता है"),
        feedback: t(
          "Glass gives no light. It traps the heat (greenhouse effect).",
          "काँच प्रकाश नहीं देता। यह ऊष्मा रोकता है (ग्रीनहाउस प्रभाव)।",
        ),
      },
    ],
  },
  cloudy: {
    prompt: t(
      "A solar cooker is used on a cloudy day. What happens? (Exercise 1)",
      "बादल वाले दिन सौर कुकर उपयोग किया जाता है। क्या होता है? (अभ्यास 1)",
    ),
    right: t(
      "It works poorly, since little sunlight gets in",
      "यह ख़राब काम करता है, क्योंकि कम धूप पहुँचती है",
    ),
    wrong: [
      {
        label: t(
          "It works better, since clouds keep the heat in",
          "यह बेहतर काम करता है, क्योंकि बादल ऊष्मा रोकते हैं",
        ),
        feedback: t(
          "Clouds block sunlight, the cooker's only source of heat.",
          "बादल धूप रोकते हैं, जो कुकर की एकमात्र ऊष्मा है।",
        ),
      },
      {
        label: t(
          "It works the same, since it stores up sunlight",
          "यह वैसे ही काम करता है, क्योंकि यह धूप जमा रखता है",
        ),
        feedback: t(
          "A solar cooker stores no energy; it needs sunlight now.",
          "सौर कुकर ऊर्जा जमा नहीं करता; उसे अभी धूप चाहिए।",
        ),
      },
    ],
  },
  limit: {
    prompt: t(
      "What is a disadvantage of a box-type solar cooker? (Exercise 9)",
      "डिब्बानुमा सौर कुकर की एक हानि क्या है? (अभ्यास 9)",
    ),
    right: t(
      "It is slow and can't be used at night or on cloudy days",
      "यह धीमा है और रात या बादल वाले दिन उपयोग नहीं हो सकता",
    ),
    wrong: [
      {
        label: t(
          "It gives off smoke that fills the kitchen with soot",
          "यह धुआँ देता है जो रसोई को कालिख से भर देता है",
        ),
        feedback: t(
          "A solar cooker gives no smoke at all; that's an advantage.",
          "सौर कुकर बिल्कुल धुआँ नहीं देता; यह एक लाभ है।",
        ),
      },
      {
        label: t(
          "It needs a costly fuel that has to be bought every week",
          "इसे महँगा ईंधन चाहिए जो हर हफ़्ते ख़रीदना पड़ता है",
        ),
        feedback: t("Sunlight is free; no fuel is needed.", "धूप मुफ़्त है; कोई ईंधन नहीं चाहिए।"),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Solar heating and the solar cooker (NCERT 14.3.1; Exercises 1 and 9). */
export const solarCooker = family({
  level: Level.Easy,
  tests: [Concept.SolarEnergy],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
