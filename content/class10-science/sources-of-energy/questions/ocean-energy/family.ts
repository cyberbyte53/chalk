import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  tides: {
    prompt: t("Tides rise and fall mainly because of…", "ज्वार-भाटा मुख्यतः किसके कारण आता है?"),
    right: t("the Moon's pull on the spinning earth", "घूमती पृथ्वी पर चंद्रमा का खिंचाव"),
    wrong: [
      {
        label: t(
          "the Sun's heat warming the sea's surface",
          "सूर्य की ऊष्मा से समुद्र की सतह का गर्म होना",
        ),
        feedback: t(
          "That's behind ocean thermal energy. Tides come from the Moon's pull.",
          "वह महासागरीय तापीय ऊर्जा के पीछे है। ज्वार चंद्रमा के खिंचाव से आते हैं।",
        ),
      },
      {
        label: t("strong winds blowing over the open sea", "खुले समुद्र पर तेज़ हवाओं का चलना"),
        feedback: t(
          "Winds make waves. Tides come from the Moon.",
          "हवाएँ लहरें बनाती हैं। ज्वार चंद्रमा से आते हैं।",
        ),
      },
    ],
  },
  tidalLimit: {
    prompt: t(
      "What is a limitation of tidal energy? (Exercise 6b)",
      "ज्वारीय ऊर्जा की एक सीमा क्या है? (अभ्यास 6b)",
    ),
    right: t(
      "Only a few sites are suitable for building tidal dams",
      "ज्वारीय बाँध बनाने लायक़ जगहें बहुत कम हैं",
    ),
    wrong: [
      {
        label: t(
          "Tides stop completely during the monsoon months every year",
          "हर साल मानसून के महीनों में ज्वार पूरी तरह रुक जाते हैं",
        ),
        feedback: t(
          "Tides rise and fall all year; the problem is the few suitable sites.",
          "ज्वार साल भर आते हैं; समस्या उपयुक्त जगहों की कमी है।",
        ),
      },
      {
        label: t(
          "Tidal dams burn coal to keep the sea water level very high",
          "ज्वारीय बाँध समुद्र का स्तर ऊँचा रखने के लिए कोयला जलाते हैं",
        ),
        feedback: t(
          "Nothing is burnt; the Moon raises the water.",
          "कुछ नहीं जलता; चंद्रमा पानी उठाता है।",
        ),
      },
    ],
  },
  waveLimit: {
    prompt: t(
      "Wave energy is practical only where…  (Exercise 6c)",
      "तरंग ऊर्जा व्यावहारिक केवल वहाँ है जहाँ… (अभ्यास 6c)",
    ),
    right: t("waves near the shore are very strong", "तट के पास लहरें बहुत तेज़ हों"),
    wrong: [
      {
        label: t("the sea near the shore is very calm", "तट के पास समुद्र बहुत शांत हो"),
        feedback: t(
          "Calm water has little wave energy to trap.",
          "शांत पानी में पकड़ने लायक़ तरंग ऊर्जा कम होती है।",
        ),
      },
      {
        label: t("the water near the shore is very deep", "तट के पास पानी बहुत गहरा हो"),
        feedback: t(
          "Depth matters for OTEC; wave energy needs strong waves.",
          "गहराई OTEC के लिए मायने रखती है; तरंग ऊर्जा को तेज़ लहरें चाहिए।",
        ),
      },
    ],
  },
  otec: {
    prompt: t(
      "An OTEC plant works only if the surface water is hotter than the deep water by at least…",
      "OTEC संयंत्र तभी काम करता है जब सतह का पानी गहरे पानी से कम से कम कितना गर्म हो?",
    ),
    right: t("20 °C", "20 °C"),
    wrong: [
      {
        label: t("2 °C", "2 °C"),
        feedback: t(
          "Far too small a difference. NCERT says 20 °C or more.",
          "यह अंतर बहुत छोटा है। NCERT 20 °C या अधिक कहती है।",
        ),
      },
      {
        label: t("200 °C", "200 °C"),
        feedback: t(
          "The sea never differs that much. 20 °C is enough.",
          "समुद्र में इतना अंतर कभी नहीं होता। 20 °C काफ़ी है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Tidal, wave and ocean thermal energy (NCERT 14.3.2; Exercise 6b, 6c). */
export const oceanEnergy = family({
  level: Level.Easy,
  tests: [Concept.SeaAndGeothermal],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
