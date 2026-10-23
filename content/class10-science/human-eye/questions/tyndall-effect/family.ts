import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Fact, askFact, factParams } from "../../kit";

const yes = t(
  "Yes: particles scatter the light into your eyes",
  "हाँ: कण प्रकाश को तुम्हारी आँखों में बिखेरते हैं",
);
const no = t(
  "No: nothing scatters its light towards you",
  "नहीं: कुछ भी उसका प्रकाश तुम्हारी ओर नहीं बिखेरता",
);

const facts = {
  smokyRoom: {
    prompt: t(
      "A thin sunbeam enters a smoky room through a hole. Is its path visible from the side?",
      "धुएँ भरे कमरे में एक छेद से धूप की पतली किरण आती है। क्या उसका रास्ता बग़ल से दिखता है?",
    ),
    right: yes,
    wrong: [
      {
        label: no,
        feedback: t(
          "Smoke particles scatter the light: that's the Tyndall effect.",
          "धुएँ के कण प्रकाश बिखेरते हैं: यही टिंडल प्रभाव है।",
        ),
      },
    ],
  },
  saltWater: {
    prompt: t(
      "A torch beam passes through a glass of clear salt water (a true solution). Is its path visible from the side?",
      "टॉर्च की किरण साफ़ नमक के पानी (वास्तविक विलयन) के गिलास से गुज़रती है। क्या उसका रास्ता बग़ल से दिखता है?",
    ),
    right: no,
    wrong: [
      {
        label: yes,
        feedback: t(
          "In a true solution the particles are too small to scatter the beam visibly.",
          "वास्तविक विलयन में कण इतने छोटे हैं कि किरण को दिखने लायक़ नहीं बिखेरते।",
        ),
      },
    ],
  },
  forest: {
    prompt: t(
      "Sunlight streams through the canopy of a misty forest in visible beams. What scatters it?",
      "धुंध भरे जंगल की छत से धूप दिखती किरणों में आती है। उसे क्या बिखेरता है?",
    ),
    right: t("Tiny water droplets in the mist", "धुंध में पानी की नन्ही बूँदें"),
    wrong: [
      {
        label: t("The leaves", "पत्तियाँ"),
        feedback: t(
          "Leaves block light; they don't make beams in the air visible. The mist droplets do.",
          "पत्तियाँ प्रकाश रोकती हैं; वे हवा में किरणों को दिखने लायक़ नहीं बनातीं। धुंध की बूँदें बनाती हैं।",
        ),
      },
    ],
  },
  size: {
    prompt: t(
      "Very fine particles mainly scatter which light?",
      "बहुत बारीक कण मुख्यतः कौन-सा प्रकाश बिखेरते हैं?",
    ),
    right: t("Blue", "नीला"),
    wrong: [
      {
        label: t("Red", "लाल"),
        feedback: t(
          "Red, with the longest wavelength, is scattered least by fine particles.",
          "लाल, सबसे लंबी तरंगदैर्घ्य वाला, बारीक कणों से सबसे कम बिखरता है।",
        ),
      },
      {
        label: t("White", "सफ़ेद"),
        feedback: t(
          "Large particles scatter white. Very fine ones pick out blue.",
          "बड़े कण सफ़ेद बिखेरते हैं। बहुत बारीक कण नीला चुनते हैं।",
        ),
      },
    ],
  },
  clouds: {
    prompt: t(
      "Clouds are made of water droplets much larger than air molecules. What colour do they look?",
      "बादल हवा के अणुओं से कहीं बड़ी पानी की बूँदों से बने होते हैं। वे किस रंग के दिखते हैं?",
    ),
    right: t("White: large particles scatter all colours", "सफ़ेद: बड़े कण सब रंग बिखेरते हैं"),
    wrong: [
      {
        label: t("Blue, like the sky", "नीले, आसमान की तरह"),
        feedback: t(
          "Only very fine particles pick out blue. Large ones scatter every colour, which looks white.",
          "केवल बहुत बारीक कण नीला चुनते हैं। बड़े कण हर रंग बिखेरते हैं, जो सफ़ेद दिखता है।",
        ),
      },
    ],
  },
  hypo: {
    prompt: t(
      "In NCERT's hypo-tank activity, what colour is seen from the sides of the tank as sulphur particles form?",
      "एनसीईआरटी की हाइपो-टैंक क्रियाकलाप में सल्फ़र के कण बनते समय टैंक की बगलों से कौन-सा रंग दिखता है?",
    ),
    right: t("Blue", "नीला"),
    wrong: [
      {
        label: t("Red", "लाल"),
        feedback: t(
          "Red is what comes straight through to the screen. Sideways you see the scattered blue.",
          "लाल वह है जो सीधा पर्दे तक आता है। बग़ल से बिखरा नीला दिखता है।",
        ),
      },
    ],
  },
} satisfies Record<string, Fact>;

/** Scattering by particles and the Tyndall effect (NCERT 11.6.1, Activity 11.3). */
export const tyndallEffect = family({
  level: Level.Easy,
  tests: [Concept.ScatteringOfLight],
  params: factParams(facts),
  build: ({ item }, b) => askFact(b, facts[item], item),
});
