import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["hairs", "rings", "alveoli", "haemoglobin", "residual", "cilia", "gills"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  hairs: {
    prompt: {
      en: "What do the fine hairs and mucus in the nostrils do?",
      hi: "नासाद्वारों के महीन बाल और श्लेष्मा क्या करते हैं?",
    },
    right: { en: "Filter the air we breathe in", hi: "साँस की हवा को छानते हैं" },
    wrong: [
      { en: "Warm the blood in the nose", hi: "नाक में रक्त को गर्म करते हैं" },
      { en: "Absorb oxygen into the blood", hi: "रक्त में ऑक्सीजन सोखते हैं" },
    ],
    why: {
      en: "Hairs and mucus lining the nasal passage filter the incoming air.",
      hi: "नासा मार्ग के बाल और श्लेष्मा आती हवा को छानते हैं।",
    },
  },
  rings: {
    prompt: {
      en: "Why are there rings of cartilage in the throat?",
      hi: "गले में उपास्थि के छल्ले क्यों होते हैं?",
    },
    right: { en: "So the air-passage doesn't collapse", hi: "ताकि वायु-मार्ग पिचके नहीं" },
    wrong: [
      { en: "To filter dust out of the air", hi: "हवा से धूल छानने के लिए" },
      { en: "To pump air into the lungs", hi: "फेफड़ों में हवा पंप करने के लिए" },
    ],
    why: {
      en: "Rings of cartilage keep the air-passage open.",
      hi: "उपास्थि के छल्ले वायु मार्ग को खुला रखते हैं।",
    },
  },
  alveoli: {
    prompt: {
      en: "Where does oxygen pass from the air into the blood?",
      hi: "ऑक्सीजन हवा से रुधिर में कहाँ जाती है?",
    },
    right: { en: "Alveoli", hi: "कूपिकाएँ" },
    wrong: [
      { en: "Nostrils", hi: "नासाद्वार" },
      { en: "Diaphragm", hi: "डायाफ़्राम" },
    ],
    why: {
      en: "The alveoli, wrapped in capillaries, are where gases are exchanged.",
      hi: "केशिकाओं से घिरी कूपिकाएँ वह जगह हैं जहाँ गैसें बदलती हैं।",
    },
  },
  haemoglobin: {
    prompt: {
      en: "Which pigment carries oxygen in our blood?",
      hi: "हमारे रुधिर में कौन-सा वर्णक ऑक्सीजन ले जाता है?",
    },
    right: { en: "Haemoglobin", hi: "हीमोग्लोबिन" },
    wrong: [
      { en: "Chlorophyll", hi: "क्लोरोफ़िल" },
      { en: "Bile", hi: "पित्त" },
    ],
    why: {
      en: "Haemoglobin in the red blood corpuscles carries oxygen.",
      hi: "लाल रुधिर कणिकाओं का हीमोग्लोबिन ऑक्सीजन ले जाता है।",
    },
  },
  residual: {
    prompt: {
      en: "Why do the lungs always keep some air (the residual volume)?",
      hi: "फेफड़ों में हमेशा कुछ हवा (अवशिष्ट आयतन) क्यों रहती है?",
    },
    right: {
      en: "So there's time to take in oxygen and give out CO₂",
      hi: "ताकि ऑक्सीजन लेने और CO₂ छोड़ने का समय मिले",
    },
    wrong: [
      { en: "To keep the lungs warm on cold days", hi: "ठंडे दिनों में फेफड़ों को गर्म रखने के लिए" },
      { en: "So the body can float when swimming", hi: "ताकि तैरते समय शरीर उतरा सके" },
    ],
    why: {
      en: "Residual air gives enough time for gas exchange.",
      hi: "बची हुई हवा गैस विनिमय के लिए पर्याप्त समय देती है।",
    },
  },
  cilia: {
    prompt: {
      en: "What does smoking destroy in the upper air passages?",
      hi: "धूम्रपान ऊपरी वायु मार्ग में क्या नष्ट करता है?",
    },
    right: { en: "The cilia that sweep out germs", hi: "रोगाणु बाहर करने वाले पक्ष्माभ" },
    wrong: [
      { en: "The cartilage rings of the windpipe", hi: "श्वासनली के उपास्थि वलय" },
      { en: "The diaphragm below the lungs", hi: "फेफड़ों के नीचे का डायाफ्राम" },
    ],
    why: {
      en: "Smoking destroys the cilia, letting germs, dust and smoke into the lungs.",
      hi: "धूम्रपान पक्ष्माभों को नष्ट करता है, जिससे रोगाणु, धूल और धुआँ फेफड़ों में पहुँचते हैं।",
    },
  },
  gills: {
    prompt: { en: "How does a fish get oxygen?", hi: "मछली ऑक्सीजन कैसे पाती है?" },
    right: {
      en: "From oxygen dissolved in water, at gills",
      hi: "पानी में घुली ऑक्सीजन से, गलफड़ों पर",
    },
    wrong: [
      { en: "By gulping air at the surface", hi: "सतह पर हवा निगलकर" },
      { en: "By photosynthesis in its scales", hi: "अपने शल्कों में प्रकाश संश्लेषण से" },
    ],
    why: {
      en: "Fish force water past their gills, where blood takes up dissolved oxygen.",
      hi: "मछलियाँ पानी को गलफड़ों पर से धकेलती हैं, जहाँ रुधिर घुली ऑक्सीजन लेता है।",
    },
  },
};

/** NCERT 6.3: the job of each part of the breathing system. */
export const breathingParts = family({
  level: Level.Easy,
  tests: [Concept.Breathing],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
