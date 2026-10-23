import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  cord: {
    prompt: t(
      "Why does the cord of an electric heater not glow while the heating element does?",
      "बिजली के हीटर का तार क्यों नहीं चमकता जबकि तापन तत्व चमकता है?",
    ),
    right: t(
      "The same current flows in both, but the element's resistance is much bigger, so it makes much more heat",
      "दोनों में वही धारा है, पर तत्व का प्रतिरोध कहीं बड़ा है, इसलिए वह कहीं ज़्यादा गर्मी बनाता है",
    ),
    wrong: [
      {
        label: t("The cord carries less current", "तार में कम धारा बहती है"),
        feedback: t(
          "They're in series: the same current. H = I²Rt depends on R.",
          "वे श्रेणीक्रम में हैं: वही धारा। H = I²Rt, R पर निर्भर है।",
        ),
      },
    ],
  },
  tungsten: {
    prompt: t(
      "Why is tungsten used almost only for bulb filaments?",
      "बल्ब के तंतु के लिए लगभग केवल टंगस्टन क्यों उपयोग होता है?",
    ),
    right: t("It has a very high melting point (3380 °C)", "इसका गलनांक बहुत ऊँचा (3380 °C) है"),
    wrong: [
      {
        label: t("It is the best conductor", "यह सबसे अच्छा चालक है"),
        feedback: t(
          "Silver and copper conduct better. The filament must glow hot without melting.",
          "चाँदी और ताँबा बेहतर चालक हैं। तंतु को पिघले बिना गर्म चमकना है।",
        ),
      },
    ],
  },
  gas: {
    prompt: t(
      "Why are bulbs filled with nitrogen and argon?",
      "बल्बों में नाइट्रोजन और आर्गन क्यों भरी जाती है?",
    ),
    right: t(
      "These inactive gases make the filament last longer",
      "ये निष्क्रिय गैसें तंतु को ज़्यादा टिकाऊ बनाती हैं",
    ),
    wrong: [
      {
        label: t("They make the light brighter", "वे रोशनी को तेज़ करती हैं"),
        feedback: t(
          "They're chemically inactive: they protect the hot filament.",
          "वे रासायनिक रूप से निष्क्रिय हैं: गर्म तंतु की रक्षा करती हैं।",
        ),
      },
    ],
  },
  fuseSeries: {
    prompt: t(
      "How is a fuse connected to the device it protects?",
      "फ़्यूज़ जिस युक्ति की रक्षा करता है, उससे कैसे जुड़ा होता है?",
    ),
    right: t("In series", "श्रेणीक्रम में"),
    wrong: [
      {
        label: t("In parallel", "पार्श्वक्रम में"),
        feedback: t(
          "To stop the current, the fuse must be in its path: melting it breaks the circuit.",
          "धारा रोकने के लिए फ़्यूज़ उसके रास्ते में होना चाहिए: उसका पिघलना परिपथ तोड़ता है।",
        ),
      },
    ],
  },
  ironFuse: {
    prompt: t(
      "A 1 kW iron works on 220 V. Which fuse should protect it?",
      "1 kW की इस्त्री 220 V पर चलती है। उसकी रक्षा के लिए कौन-सा फ़्यूज़ चाहिए?",
    ),
    right: t("5 A", "5 A"),
    wrong: [
      {
        label: t("1 A", "1 A"),
        feedback: t(
          "The iron draws about 4.5 A, so a 1 A fuse would melt at once.",
          "इस्त्री लगभग 4.5 A लेती है, इसलिए 1 A का फ़्यूज़ तुरंत पिघल जाएगा।",
        ),
      },
      {
        label: t("15 A", "15 A"),
        feedback: t(
          "Too high: it wouldn't melt until the current was dangerous. Choose just above 4.5 A.",
          "बहुत ज़्यादा: यह ख़तरनाक धारा तक नहीं पिघलेगा। 4.5 A से थोड़ा ऊपर चुनो।",
        ),
      },
    ],
  },
  seriesParallelHeat: {
    prompt: t(
      "Two identical wires are joined first in series, then in parallel, across the same supply. Heat in series : heat in parallel is…",
      "दो एक जैसे तार पहले श्रेणीक्रम में, फिर पार्श्वक्रम में, एक ही स्रोत पर जोड़े जाते हैं। श्रेणीक्रम में गर्मी : पार्श्वक्रम में गर्मी…",
    ),
    right: t("1 : 4", "1 : 4"),
    wrong: [
      {
        label: t("4 : 1", "4 : 1"),
        feedback: t(
          "Series makes 2R and parallel R/2. With the same V, H = V²t/R: the smaller R gives more heat.",
          "श्रेणीक्रम 2R और पार्श्वक्रम R/2 बनाता है। उसी V पर H = V²t/R: छोटा R ज़्यादा गर्मी देता है।",
        ),
      },
      {
        label: t("1 : 2", "1 : 2"),
        feedback: t(
          "The resistances are 2R and R/2, a factor of 4.",
          "प्रतिरोध 2R और R/2 हैं, 4 गुना का अंतर।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Uses of the heating effect: cords, filaments, fuses (NCERT 12.7; Exercises 4, 18a). */
export const fuseAndHeating = family({
  level: Level.Easy,
  tests: [Concept.HeatingEffect],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
