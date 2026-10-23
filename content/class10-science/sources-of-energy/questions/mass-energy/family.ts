import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  formula: {
    prompt: t(
      "Einstein's equation for the energy released when mass Δm is lost is…",
      "द्रव्यमान Δm के लुप्त होने पर निकली ऊर्जा का आइंस्टाइन का समीकरण है…",
    ),
    right: t("E = Δm c²", "E = Δm c²"),
    wrong: [
      {
        label: t("E = Δm c", "E = Δm c"),
        feedback: t("The speed of light is squared.", "प्रकाश की चाल का वर्ग होता है।"),
      },
      {
        label: t("E = Δm / c²", "E = Δm / c²"),
        feedback: t(
          "It's multiplied by c², which is why the energy is so huge.",
          "c² से गुणा होता है, इसीलिए ऊर्जा इतनी विशाल है।",
        ),
      },
    ],
  },
  mev: {
    prompt: t(
      "1 atomic mass unit of mass, turned fully into energy, gives about…",
      "1 परमाणु द्रव्यमान इकाई का द्रव्यमान पूरा ऊर्जा बने तो लगभग मिलती है…",
    ),
    right: t("931 MeV", "931 MeV"),
    wrong: [
      {
        label: t("9.31 MeV", "9.31 MeV"),
        feedback: t("NCERT gives 931 MeV for 1 u.", "NCERT 1 u के लिए 931 MeV देती है।"),
      },
      {
        label: t("93 100 MeV", "93 100 MeV"),
        feedback: t("Too large: 1 u ≈ 931 MeV.", "बहुत बड़ा: 1 u ≈ 931 MeV।"),
      },
    ],
  },
  half: {
    prompt: t(
      "In a fission, 0.5 u of mass is lost. About how much energy is released?",
      "एक विखंडन में 0.5 u द्रव्यमान लुप्त होता है। लगभग कितनी ऊर्जा निकलती है?",
    ),
    right: t("466 MeV", "466 MeV"),
    wrong: [
      {
        label: t("931 MeV", "931 MeV"),
        feedback: t(
          "That's for 1 u. Half of it: 0.5 × 931 ≈ 466 MeV.",
          "वह 1 u के लिए है। आधा: 0.5 × 931 ≈ 466 MeV।",
        ),
      },
      {
        label: t("1862 MeV", "1862 MeV"),
        feedback: t(
          "That doubles. Multiply: 0.5 × 931 ≈ 466 MeV.",
          "यह दुगुना है। गुणा करो: 0.5 × 931 ≈ 466 MeV।",
        ),
      },
    ],
  },
  compare: {
    prompt: t(
      "Why does fission give so much more energy than burning the same mass of coal?",
      "विखंडन उतने ही द्रव्यमान के कोयले को जलाने से बहुत ज़्यादा ऊर्जा क्यों देता है?",
    ),
    right: t(
      "A little mass itself turns into a huge energy",
      "थोड़ा-सा द्रव्यमान ख़ुद विशाल ऊर्जा बन जाता है",
    ),
    wrong: [
      {
        label: t(
          "Uranium burns at a far higher temperature than coal",
          "यूरेनियम कोयले से बहुत ऊँचे ताप पर जलता है",
        ),
        feedback: t(
          "Uranium isn't burnt. Mass is converted: E = Δm c².",
          "यूरेनियम जलता नहीं। द्रव्यमान बदलता है: E = Δm c²।",
        ),
      },
      {
        label: t(
          "Coal has very little carbon in it compared to uranium",
          "यूरेनियम की तुलना में कोयले में बहुत कम कार्बन है",
        ),
        feedback: t(
          "Uranium has no carbon. Fission converts mass into energy.",
          "यूरेनियम में कार्बन नहीं। विखंडन द्रव्यमान को ऊर्जा में बदलता है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Mass turned into energy in fission (NCERT 14.3.4). */
export const massEnergy = family({
  level: Level.Easy,
  tests: [Concept.NuclearEnergy],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
