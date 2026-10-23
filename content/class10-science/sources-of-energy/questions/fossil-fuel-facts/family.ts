import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  formed: {
    prompt: t(
      "How were fossil fuels like coal and petroleum formed?",
      "कोयला और पेट्रोलियम जैसे जीवाश्म ईंधन कैसे बने?",
    ),
    right: t(
      "From remains of living things buried for millions of years",
      "लाखों वर्षों तक दबे जीवों के अवशेषों से",
    ),
    wrong: [
      {
        label: t(
          "From rocks melted by volcanoes during the last thousand years",
          "पिछले हज़ार वर्षों में ज्वालामुखियों से पिघली चट्टानों से",
        ),
        feedback: t(
          "Fossil fuels come from ancient plants and animals, over millions of years.",
          "जीवाश्म ईंधन प्राचीन पौधों और जंतुओं से, लाखों वर्षों में बने।",
        ),
      },
      {
        label: t(
          "From seawater dried by the Sun on beaches over many summers",
          "कई गर्मियों में समुद्र तटों पर धूप से सूखे समुद्री पानी से",
        ),
        feedback: t(
          "Drying seawater gives salt, not fuel.",
          "समुद्री पानी सूखने से नमक बनता है, ईंधन नहीं।",
        ),
      },
    ],
  },
  gases: {
    prompt: t(
      "Burning fossil fuels releases oxides of carbon, nitrogen and sulphur. What do these cause?",
      "जीवाश्म ईंधन जलने से कार्बन, नाइट्रोजन और सल्फ़र के ऑक्साइड निकलते हैं। इनसे क्या होता है?",
    ),
    right: t("Acid rain and the greenhouse effect", "अम्ल वर्षा और ग्रीनहाउस प्रभाव"),
    wrong: [
      {
        label: t("Rainbows and much cooler summer nights", "इंद्रधनुष और बहुत ठंडी गर्मी की रातें"),
        feedback: t("These gases are acidic and trap heat.", "ये गैसें अम्लीय हैं और ऊष्मा रोकती हैं।"),
      },
      {
        label: t("Clean air and more ozone overhead", "साफ़ हवा और ऊपर ज़्यादा ओज़ोन"),
        feedback: t(
          "They pollute the air; that is the problem with fossil fuels.",
          "ये हवा प्रदूषित करती हैं; यही जीवाश्म ईंधन की समस्या है।",
        ),
      },
    ],
  },
  differ: {
    prompt: t(
      "How do fossil fuels differ from the Sun as a source of energy? (Exercise 4)",
      "ऊर्जा स्रोत के रूप में जीवाश्म ईंधन सूर्य से कैसे अलग हैं? (अभ्यास 4)",
    ),
    right: t(
      "Fossil fuels are limited and pollute; sunlight keeps coming and is clean to use",
      "जीवाश्म ईंधन सीमित और प्रदूषक हैं; धूप आती रहती है और उपयोग में साफ़ है",
    ),
    wrong: [
      {
        label: t(
          "Fossil fuels are renewable and clean; the Sun will run out within a few centuries",
          "जीवाश्म ईंधन नवीकरणीय और साफ़ हैं; सूर्य कुछ शताब्दियों में ख़त्म हो जाएगा",
        ),
        feedback: t(
          "It's the other way round: fossil fuels are exhaustible, the Sun lasts billions of years.",
          "बात उलटी है: जीवाश्म ईंधन समाप्य हैं, सूर्य अरबों वर्ष चलेगा।",
        ),
      },
      {
        label: t(
          "Both are exactly the same, since all energy on earth comes from the Sun anyway",
          "दोनों बिल्कुल एक जैसे हैं, क्योंकि पृथ्वी की सारी ऊर्जा वैसे भी सूर्य से आती है",
        ),
        feedback: t(
          "Fossil fuels are ancient stored sunlight, but they are limited and polluting.",
          "जीवाश्म ईंधन प्राचीन संचित धूप हैं, पर वे सीमित और प्रदूषक हैं।",
        ),
      },
    ],
  },
  reduce: {
    prompt: t(
      "How can the pollution from burning fossil fuels be reduced?",
      "जीवाश्म ईंधन जलाने का प्रदूषण कैसे घटाया जा सकता है?",
    ),
    right: t(
      "By burning fuel more efficiently and trapping harmful gases",
      "ईंधन को अधिक दक्षता से जलाकर और हानिकारक गैसें रोककर",
    ),
    wrong: [
      {
        label: t(
          "By burning the fuel in a smaller space with the windows shut tightly",
          "ईंधन को छोटी जगह में खिड़कियाँ कसकर बंद करके जलाकर",
        ),
        feedback: t(
          "That traps smoke indoors; it doesn't reduce pollution.",
          "इससे धुआँ अंदर फँसता है; प्रदूषण नहीं घटता।",
        ),
      },
      {
        label: t(
          "By adding extra sulphur to the fuel so that it burns more quickly",
          "ईंधन में अतिरिक्त सल्फ़र मिलाकर ताकि वह जल्दी जले",
        ),
        feedback: t(
          "Sulphur makes sulphur oxides, a cause of acid rain.",
          "सल्फ़र से सल्फ़र ऑक्साइड बनते हैं, जो अम्ल वर्षा का कारण हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Fossil fuels and the pollution they cause (NCERT 14.2.1; Exercise 4). */
export const fossilFuelFacts = family({
  level: Level.Easy,
  tests: [Concept.FossilFuelsAndThermalPower],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
