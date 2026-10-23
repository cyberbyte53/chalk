import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = [
  "amoeba",
  "plasmodium",
  "spirogyra",
  "hydra",
  "rhizopus",
  "bryophyllum",
  "planaria",
] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  amoeba: {
    prompt: {
      en: "Amoeba splits into two equal halves in any plane. This is:",
      hi: "अमीबा किसी भी तल में दो बराबर हिस्सों में बँटता है। यह है:",
    },
    right: { en: "Binary fission", hi: "द्विखंडन" },
    wrong: [
      { en: "Multiple fission", hi: "बहुखंडन" },
      { en: "Budding", hi: "मुकुलन" },
      { en: "Fragmentation", hi: "खंडन" },
    ],
    why: {
      en: "One cell splitting into two equal halves is binary fission.",
      hi: "एक कोशिका का दो बराबर हिस्सों में बँटना द्विखंडन है।",
    },
  },
  plasmodium: {
    prompt: {
      en: "The malaria parasite Plasmodium divides into many daughter cells at once. This is:",
      hi: "मलेरिया परजीवी प्लाज़्मोडियम एक साथ कई संतति कोशिकाओं में बँटता है। यह है:",
    },
    right: { en: "Multiple fission", hi: "बहुखंडन" },
    wrong: [
      { en: "Binary fission", hi: "द्विखंडन" },
      { en: "Regeneration", hi: "पुनर्जनन" },
      { en: "Spore formation", hi: "बीजाणु निर्माण" },
    ],
    why: {
      en: "Dividing into many daughter cells simultaneously is multiple fission.",
      hi: "एक साथ कई संतति कोशिकाओं में बँटना बहुखंडन है।",
    },
  },
  spirogyra: {
    prompt: {
      en: "A mature Spirogyra filament breaks into pieces, each growing into a new filament. This is:",
      hi: "परिपक्व स्पाइरोगाइरा का तंतु टुकड़ों में टूटता है, हर टुकड़ा नए तंतु में बढ़ता है। यह है:",
    },
    right: { en: "Fragmentation", hi: "खंडन" },
    wrong: [
      { en: "Budding", hi: "मुकुलन" },
      { en: "Binary fission", hi: "द्विखंडन" },
      { en: "Vegetative propagation", hi: "कायिक प्रवर्धन" },
    ],
    why: {
      en: "A simple many-celled body breaking into fragments that grow into new individuals is fragmentation.",
      hi: "सरल बहुकोशिकीय शरीर का टुकड़ों में टूटकर नए जीव बनना खंडन है।",
    },
  },
  hydra: {
    prompt: {
      en: "A small outgrowth forms on a Hydra, grows into a tiny Hydra and detaches. This is:",
      hi: "हाइड्रा पर एक छोटा उभार बनता है, नन्हे हाइड्रा में बढ़कर अलग हो जाता है। यह है:",
    },
    right: { en: "Budding", hi: "मुकुलन" },
    wrong: [
      { en: "Regeneration", hi: "पुनर्जनन" },
      { en: "Fragmentation", hi: "खंडन" },
      { en: "Multiple fission", hi: "बहुखंडन" },
    ],
    why: {
      en: "An outgrowth from repeated cell division at one spot that becomes a new individual is a bud: budding.",
      hi: "एक जगह बार-बार कोशिका विभाजन से बना उभार जो नया जीव बनता है, मुकुल है: मुकुलन।",
    },
  },
  rhizopus: {
    prompt: {
      en: "Bread mould makes tiny blobs on stalks that release thick-walled cells. This is:",
      hi: "ब्रेड की फफूँद डंठलों पर नन्ही गोलियाँ बनाती है जो मोटी दीवार वाली कोशिकाएँ छोड़ती हैं। यह है:",
    },
    right: { en: "Spore formation", hi: "बीजाणु निर्माण" },
    wrong: [
      { en: "Budding", hi: "मुकुलन" },
      { en: "Fragmentation", hi: "खंडन" },
      { en: "Regeneration", hi: "पुनर्जनन" },
    ],
    why: {
      en: "The blobs are sporangia releasing spores: spore formation.",
      hi: "गोलियाँ बीजाणुधानियाँ हैं जो बीजाणु छोड़ती हैं: बीजाणु निर्माण।",
    },
  },
  bryophyllum: {
    prompt: {
      en: "Buds along the edge of a Bryophyllum leaf drop to the soil and grow into plants. This is:",
      hi: "ब्रायोफ़िलम की पत्ती के किनारे की कलियाँ मिट्टी पर गिरकर पौधे बनती हैं। यह है:",
    },
    right: { en: "Vegetative propagation", hi: "कायिक प्रवर्धन" },
    wrong: [
      { en: "Spore formation", hi: "बीजाणु निर्माण" },
      { en: "Pollination", hi: "परागण" },
      { en: "Binary fission", hi: "द्विखंडन" },
    ],
    why: {
      en: "A leaf (a vegetative part) giving rise to new plants is vegetative propagation.",
      hi: "पत्ती (एक कायिक भाग) से नए पौधे बनना कायिक प्रवर्धन है।",
    },
  },
  planaria: {
    prompt: {
      en: "A Planaria cut into pieces regrows each piece into a whole worm. This is:",
      hi: "प्लेनेरिया को टुकड़ों में काटने पर हर टुकड़ा पूरा कृमि बन जाता है। यह है:",
    },
    right: { en: "Regeneration", hi: "पुनर्जनन" },
    wrong: [
      { en: "Budding", hi: "मुकुलन" },
      { en: "Multiple fission", hi: "बहुखंडन" },
      { en: "Spore formation", hi: "बीजाणु निर्माण" },
    ],
    why: {
      en: "Pieces of a cut organism growing into complete organisms is regeneration.",
      hi: "कटे जीव के टुकड़ों का पूरे जीव बनना पुनर्जनन है।",
    },
  },
};

/** NCERT 8.2: name the mode of asexual reproduction used by an organism (fission, budding, fragmentation, regeneration, spores, vegetative propagation). */
export const nameTheMode = family({
  level: Level.Easy,
  tests: [Concept.SingleCellModes, Concept.PlantsFromParts],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
