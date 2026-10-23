import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

type W = { en: string; hi: string };

const PROPERTIES = {
  lustre: {
    name: { en: "Metallic lustre", hi: "धात्विक चमक" },
    seen: {
      en: "A dull copper sheet shines again after it is rubbed with sandpaper.",
      hi: "फीकी ताँबे की चादर रेगमाल से रगड़ने पर फिर चमकने लगती है।",
    },
  },
  malleable: {
    name: { en: "Malleability", hi: "आघातवर्धनीयता" },
    seen: {
      en: "Gold is beaten into a foil so thin that light passes through it.",
      hi: "सोने को पीटकर इतना पतला वर्क बनाया जाता है कि उसमें से रोशनी आर-पार हो जाती है।",
    },
  },
  ductile: {
    name: { en: "Ductility", hi: "तन्यता" },
    seen: {
      en: "About 2 km of wire can be drawn from 1 g of gold.",
      hi: "1 g सोने से लगभग 2 km लंबा तार खींचा जा सकता है।",
    },
  },
  sonorous: {
    name: { en: "Sonority", hi: "ध्वानिकता" },
    seen: { en: "The school bell rings when it is struck.", hi: "स्कूल की घंटी मारने पर बजती है।" },
  },
  heat: {
    name: { en: "Conducting heat", hi: "ऊष्मा का चालन" },
    seen: {
      en: "The handle end of a metal spoon in hot tea soon gets hot too.",
      hi: "गर्म चाय में रखी धातु की चम्मच का पकड़ने वाला सिरा भी जल्दी गर्म हो जाता है।",
    },
  },
  electricity: {
    name: { en: "Conducting electricity", hi: "विद्युत का चालन" },
    seen: {
      en: "The bulb glows when an aluminium strip completes the circuit.",
      hi: "ऐलुमिनियम की पट्टी परिपथ पूरा करती है तो बल्ब जलता है।",
    },
  },
} as const satisfies Record<string, { name: W; seen: W }>;
type Property = keyof typeof PROPERTIES;
const ORDER = Object.keys(PROPERTIES) as Property[];

/** Which property of metals does an everyday observation show? */
export const propertyName = family({
  level: Level.Easy,
  tests: [Concept.PhysicalProperties],
  params: z.object({ property: z.enum(ORDER as [Property, ...Property[]]) }).strict(),
  build: ({ property }, b) => {
    const p = PROPERTIES[property];
    const others = ORDER.filter((o) => o !== property).slice(0, 3);
    const ask = pickOne(b, {
      prompt: t(
        `${p.seen.en} Which property of metals is this?`,
        `${p.seen.hi} यह धातुओं का कौन-सा गुण है?`,
      ),
      right: t(p.name.en, p.name.hi),
      wrong: others.map((o) => ({
        label: t(PROPERTIES[o].name.en, PROPERTIES[o].name.hi),
        why: t(
          `${PROPERTIES[o].name.en} would be: ${PROPERTIES[o].seen.en}`,
          `${PROPERTIES[o].name.hi} यह होता: ${PROPERTIES[o].seen.hi}`,
        ),
      })),
      seed: seedOf(property),
    });
    return column([ask, space()]);
  },
});
