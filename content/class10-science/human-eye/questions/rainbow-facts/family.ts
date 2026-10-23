import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Fact, askFact, factParams } from "../../kit";

const facts = {
  where: {
    prompt: t("In which direction is a rainbow always formed?", "इंद्रधनुष हमेशा किस दिशा में बनता है?"),
    right: t("Opposite the Sun", "सूरज के विपरीत"),
    wrong: [
      {
        label: t("Towards the Sun", "सूरज की ओर"),
        feedback: t(
          "The light reflects inside each drop and comes back out, so you see the rainbow with the Sun behind you.",
          "प्रकाश हर बूँद के अंदर परावर्तित होकर वापस निकलता है, इसलिए इंद्रधनुष तब दिखता है जब सूरज तुम्हारे पीछे हो।",
        ),
      },
      {
        label: t("Anywhere in the sky", "आसमान में कहीं भी"),
        feedback: t("It always appears opposite the Sun.", "यह हमेशा सूरज के विपरीत दिखता है।"),
      },
    ],
  },
  what: {
    prompt: t("What makes a rainbow?", "इंद्रधनुष किससे बनता है?"),
    right: t(
      "Dispersion of sunlight by tiny water droplets in the air",
      "हवा में पानी की नन्ही बूँदों द्वारा धूप का विक्षेपण",
    ),
    wrong: [
      {
        label: t(
          "Scattering of sunlight by the air molecules high in the sky",
          "आसमान में ऊपर हवा के अणुओं द्वारा सूर्य के प्रकाश का प्रकीर्णन",
        ),
        feedback: t(
          "Scattering by air makes the sky blue. A rainbow is sunlight split by raindrops.",
          "हवा का प्रकीर्णन आसमान को नीला बनाता है। इंद्रधनुष बूँदों द्वारा बँटी धूप है।",
        ),
      },
      {
        label: t("Reflection of sunlight from the clouds", "बादलों से सूर्य के प्रकाश का परावर्तन"),
        feedback: t(
          "Clouds look white. The colours come from drops splitting the light like prisms.",
          "बादल सफ़ेद दिखते हैं। रंग प्रिज़्म की तरह प्रकाश बाँटती बूँदों से आते हैं।",
        ),
      },
    ],
  },
  steps: {
    prompt: t(
      "Inside a raindrop, what happens to sunlight, in order?",
      "बारिश की बूँद के अंदर धूप के साथ क्रम से क्या होता है?",
    ),
    right: t(
      "Refraction and dispersion, internal reflection, refraction again",
      "अपवर्तन और विक्षेपण, आंतरिक परावर्तन, फिर अपवर्तन",
    ),
    wrong: [
      {
        label: t(
          "Reflection off the drop's surface, then scattering by the air",
          "बूँद की सतह से परावर्तन, फिर हवा द्वारा प्रकीर्णन",
        ),
        feedback: t(
          "The light refracts going in (splitting into colours), reflects off the back, and refracts coming out.",
          "प्रकाश अंदर जाते समय अपवर्तित होता है (रंगों में बँटता है), पिछले हिस्से से परावर्तित होता है, और बाहर आते समय अपवर्तित होता है।",
        ),
      },
      {
        label: t(
          "Only one refraction, as light enters the drop",
          "केवल एक अपवर्तन, जब प्रकाश बूँद में घुसता है",
        ),
        feedback: t(
          "If it only refracted once it would carry on away from you. The internal reflection sends it back.",
          "अगर यह केवल एक बार अपवर्तित होता तो तुमसे दूर चला जाता। आंतरिक परावर्तन इसे वापस भेजता है।",
        ),
      },
    ],
  },
  fountain: {
    prompt: t(
      "You want to see a rainbow in the spray of a garden hose on a sunny morning. Where should you stand?",
      "धूप भरी सुबह बगीचे के पाइप की फुहार में इंद्रधनुष देखना है। कहाँ खड़े हो?",
    ),
    right: t(
      "With the Sun behind you, facing the spray",
      "सूरज को पीठ के पीछे रखकर, फुहार की ओर मुँह करके",
    ),
    wrong: [
      {
        label: t("Facing the Sun, through the spray", "फुहार के पार सूरज की ओर मुँह करके"),
        feedback: t("A rainbow is always opposite the Sun.", "इंद्रधनुष हमेशा सूरज के विपरीत होता है।"),
      },
    ],
  },
  whiteLight: {
    prompt: t("What does NCERT mean by 'white light'?", "एनसीईआरटी 'सफ़ेद प्रकाश' से क्या मतलब रखती है?"),
    right: t("Any light that gives a spectrum like sunlight's", "कोई भी प्रकाश जो धूप जैसा स्पेक्ट्रम दे"),
    wrong: [
      {
        label: t("Light of one colour, white", "एक रंग, सफ़ेद, का प्रकाश"),
        feedback: t(
          "White isn't one colour: it's all seven together.",
          "सफ़ेद एक रंग नहीं है: यह सातों एक साथ हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Fact>;

/** How raindrops make a rainbow, and where to look for one (NCERT 11.4). */
export const rainbowFacts = family({
  level: Level.Medium,
  tests: [Concept.DispersionAndRainbow],
  params: factParams(facts),
  build: ({ item }, b) => askFact(b, facts[item], item),
});
