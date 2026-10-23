import { column, family, space, t } from "@chalk/author";
import { Level, type Localized } from "@chalk/content";
import { choiceQuestion, settle } from "@chalk/patterns";
import { gcd, lcm } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** The stories, by key: what is asked, the numbers, and whether it is the HCF or the LCM. */
const Story = {
  Sweets: "sweets",
  Bells: "bells",
  Rope: "rope",
  Buses: "buses",
  Tiles: "tiles",
  Lights: "lights",
  Runners: "runners",
} as const;
type Story = (typeof Story)[keyof typeof Story];

type Spec = { text: Localized; numbers: readonly number[]; isHcf: boolean };

const STORIES: Record<Story, Spec> = {
  [Story.Sweets]: {
    text: t(
      "A sweet seller has 420 kaju barfis and 130 badam barfis. She stacks them in piles of the same number, one kind per pile, as few piles as possible. How many barfis in each pile?",
      "एक मिठाई वाली के पास 420 काजू बर्फ़ी और 130 बादाम बर्फ़ी हैं। वह इन्हें बराबर संख्या के ढेरों में रखती है, हर ढेर में एक ही तरह की, और ढेर जितने कम हो सकें। हर ढेर में कितनी बर्फ़ी?",
    ),
    numbers: [420, 130],
    isHcf: true,
  },
  [Story.Bells]: {
    text: t(
      "Two bells ring every 9 minutes and every 12 minutes. They ring together now. After how many minutes do they next ring together?",
      "दो घंटियाँ हर 9 और हर 12 मिनट पर बजती हैं। अभी वे साथ बजीं। कितने मिनट बाद वे फिर साथ बजेंगी?",
    ),
    numbers: [9, 12],
    isHcf: false,
  },
  [Story.Rope]: {
    text: t(
      "Two ropes are 96 m and 72 m long. They are cut into pieces all of the same length, as long as possible, with nothing left over. How long is each piece?",
      "दो रस्सियाँ 96 m और 72 m लंबी हैं। उन्हें एक जैसी लंबाई के टुकड़ों में काटना है, जितने लंबे हो सकें, बिना कुछ बचे। हर टुकड़ा कितना लंबा होगा?",
    ),
    numbers: [96, 72],
    isHcf: true,
  },
  [Story.Buses]: {
    text: t(
      "Buses on one route leave every 15 minutes and on another every 20 minutes. Both leave the depot at 7:00. After how many minutes do both leave together again?",
      "एक रूट की बसें हर 15 मिनट पर और दूसरे की हर 20 मिनट पर निकलती हैं। दोनों 7:00 बजे डिपो से निकलीं। कितने मिनट बाद दोनों फिर साथ निकलेंगी?",
    ),
    numbers: [15, 20],
    isHcf: false,
  },
  [Story.Tiles]: {
    text: t(
      "A room is 360 cm by 280 cm. What is the side of the largest square tile that covers the floor exactly, with no tile cut?",
      "एक कमरा 360 cm × 280 cm है। सबसे बड़ी वर्गाकार टाइल की भुजा क्या है जो फ़र्श को पूरा ढके, बिना किसी टाइल को काटे?",
    ),
    numbers: [360, 280],
    isHcf: true,
  },
  [Story.Lights]: {
    text: t(
      "Three lights flash every 6, 8 and 10 seconds. They flash together now. After how many seconds do they next flash together?",
      "तीन बत्तियाँ हर 6, 8 और 10 सेकंड पर चमकती हैं। अभी वे साथ चमकीं। कितने सेकंड बाद वे फिर साथ चमकेंगी?",
    ),
    numbers: [6, 8, 10],
    isHcf: false,
  },
  [Story.Runners]: {
    text: t(
      "There is a circular path around a sports field. Sonia takes 18 minutes to drive one round of the field, while Ravi takes 12 minutes for the same. Suppose they both start at the same point and at the same time, and go in the same direction. After how many minutes will they meet again at the starting point?",
      "एक खेल के मैदान के चारों ओर एक वृत्ताकार रास्ता है। सोनिया को मैदान का एक चक्कर लगाने में 18 मिनट लगते हैं, जबकि रवि को 12 मिनट। मान लो दोनों एक ही जगह से, एक ही समय, एक ही दिशा में चलते हैं। कितने मिनट बाद वे फिर से शुरुआत की जगह पर मिलेंगे?",
    ),
    numbers: [18, 12],
    isHcf: false,
  },
};

/** A word problem: is it the HCF or the LCM, and what is it? */
export const hcfOrLcmStory = family({
  level: Level.Medium,
  tests: [Concept.HcfAndLcm],
  params: z.object({ story: z.nativeEnum(Story) }).strict(),
  build: ({ story }, b) => {
    const spec = STORIES[story];
    const h = spec.numbers.reduce((g, n) => gcd(g, n));
    const l = spec.numbers.reduce((m, n) => lcm(m, n));
    const right = spec.isHcf ? h : l;
    const wrong = spec.isHcf ? l : h;
    const ask = choiceQuestion(b, {
      prompt: spec.text,
      options: settle(
        [
          { id: "right", label: t(`${right}`, `${right}`) },
          {
            id: "other",
            label: t(`${wrong}`, `${wrong}`),
            feedback: spec.isHcf
              ? t(
                  "That is the LCM. Here things are shared into equal groups, as big as possible, with nothing left over: that is the HCF.",
                  "यह LCM है। यहाँ चीज़ों को बराबर समूहों में बाँटना है, जितने बड़े हो सकें, बिना कुछ बचे: यह HCF है।",
                )
              : t(
                  "That is the HCF. Here things repeat and must happen together: that is a common multiple, the LCM.",
                  "यह HCF है। यहाँ चीज़ें दोहराती हैं और उन्हें साथ होना है: यह साझा गुणज है, LCM।",
                ),
          },
        ],
        spec.numbers.reduce((sum, n) => sum + n, 0),
      ),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
