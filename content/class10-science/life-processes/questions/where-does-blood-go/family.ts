import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = [
  "fromLungs",
  "leftAtrium",
  "leftVentricle",
  "fromBody",
  "rightAtrium",
  "rightVentricle",
  "fish",
] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  fromLungs: {
    prompt: {
      en: "Oxygen-rich blood from the lungs enters which chamber?",
      hi: "फेफड़ों से ऑक्सीजन-भरा रुधिर किस कक्ष में आता है?",
    },
    right: { en: "Left atrium", hi: "बायाँ आलिंद" },
    wrong: [
      { en: "Right atrium", hi: "दायाँ आलिंद" },
      { en: "Right ventricle", hi: "दायाँ निलय" },
    ],
    why: {
      en: "Blood from the lungs comes to the left atrium.",
      hi: "फेफड़ों का रुधिर बाएँ आलिंद में आता है।",
    },
  },
  leftAtrium: {
    prompt: {
      en: "When the left atrium contracts, blood goes to the…",
      hi: "बाएँ आलिंद के सिकुड़ने पर रुधिर कहाँ जाता है…",
    },
    right: { en: "Left ventricle", hi: "बायाँ निलय" },
    wrong: [
      { en: "The lungs directly", hi: "सीधे फेफड़े" },
      { en: "The right atrium", hi: "दायाँ अलिंद" },
    ],
    why: {
      en: "The left atrium passes blood down to the left ventricle.",
      hi: "बायाँ आलिंद रुधिर नीचे बाएँ निलय में भेजता है।",
    },
  },
  leftVentricle: {
    prompt: { en: "The left ventricle pumps blood to the…", hi: "बायाँ निलय रुधिर कहाँ पंप करता है…" },
    right: { en: "Body", hi: "शरीर" },
    wrong: [
      { en: "Lungs", hi: "फेफड़े" },
      { en: "Right atrium", hi: "दायाँ आलिंद" },
    ],
    why: {
      en: "The left ventricle sends oxygen-rich blood out to the body.",
      hi: "बायाँ निलय ऑक्सीजन-भरा रुधिर शरीर में भेजता है।",
    },
  },
  fromBody: {
    prompt: {
      en: "De-oxygenated blood from the body enters which chamber?",
      hi: "शरीर से ऑक्सीजन-रहित रुधिर किस कक्ष में आता है?",
    },
    right: { en: "Right atrium", hi: "दायाँ आलिंद" },
    wrong: [
      { en: "Left atrium", hi: "बायाँ आलिंद" },
      { en: "Left ventricle", hi: "बायाँ निलय" },
    ],
    why: {
      en: "Blood from the body returns to the right atrium.",
      hi: "शरीर का रुधिर दाएँ आलिंद में लौटता है।",
    },
  },
  rightAtrium: {
    prompt: {
      en: "When the right atrium contracts, blood goes to the…",
      hi: "दाएँ आलिंद के सिकुड़ने पर रुधिर कहाँ जाता है…",
    },
    right: { en: "Right ventricle", hi: "दायाँ निलय" },
    wrong: [
      { en: "The left ventricle", hi: "बायाँ निलय" },
      { en: "The whole body", hi: "पूरा शरीर" },
    ],
    why: {
      en: "The right atrium passes blood to the right ventricle.",
      hi: "दायाँ आलिंद रुधिर दाएँ निलय में भेजता है।",
    },
  },
  rightVentricle: {
    prompt: { en: "The right ventricle pumps blood to the…", hi: "दायाँ निलय रुधिर कहाँ पंप करता है…" },
    right: { en: "Lungs", hi: "फेफड़े" },
    wrong: [
      { en: "Body", hi: "शरीर" },
      { en: "Left atrium", hi: "बायाँ आलिंद" },
    ],
    why: {
      en: "The right ventricle pumps blood to the lungs to collect oxygen.",
      hi: "दायाँ निलय ऑक्सीजन लेने के लिए रुधिर फेफड़ों में पंप करता है।",
    },
  },
  fish: {
    prompt: {
      en: "How many times does blood pass through a fish's heart in one round of the body?",
      hi: "शरीर के एक चक्कर में मछली के हृदय से रुधिर कितनी बार गुज़रता है?",
    },
    right: { en: "Once", hi: "एक बार" },
    wrong: [
      { en: "Twice", hi: "दो बार" },
      { en: "Four times", hi: "चार बार" },
    ],
    why: {
      en: "A fish's two-chambered heart pumps blood to the gills and straight on to the body: single circulation.",
      hi: "मछली का दो कक्षों वाला हृदय रुधिर गलफड़ों तक और सीधे शरीर में भेजता है: एकल परिसंचरण।",
    },
  },
};

/** NCERT 6.4.1, Fig 6.11: where does the blood go next? */
export const whereDoesBloodGo = family({
  level: Level.Medium,
  tests: [Concept.HeartAndBlood],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
