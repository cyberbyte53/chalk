import { family, t } from "@chalk/author";
import { Level, type Localized } from "@chalk/content";
import { type Option, choice } from "@chalk/patterns";
import { bagOf, euclidSteps } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** The stories, by key. Each asks for the largest number that divides both: the HCF. */
const Story = {
  Army: "army",
  Sweets: "sweets",
  Rope: "rope",
  Tiles: "tiles",
  Teams: "teams",
} as const;
type Story = (typeof Story)[keyof typeof Story];

type Spec = { text: Localized; numbers: readonly [number, number]; unit: Localized };

const STORIES: Record<Story, Spec> = {
  [Story.Army]: {
    text: t(
      "An army contingent of 616 members is to march behind an army band of 32 members in a parade. The two groups are to march in the same number of columns. What is the maximum number of columns in which they can march?",
      "परेड में 616 सदस्यों की एक सैन्य टुकड़ी को 32 सदस्यों के सैन्य बैंड के पीछे चलना है। दोनों समूह बराबर स्तंभों में चलेंगे। अधिकतम कितने स्तंभों में वे चल सकते हैं?",
    ),
    numbers: [616, 32],
    unit: t("columns", "स्तंभ"),
  },
  [Story.Sweets]: {
    text: t(
      "A sweet seller has 480 kaju barfis and 168 badam barfis. She stacks them so that each stack has the same number of barfis, of one kind, taking up the least area of the tray. How many barfis go in each stack?",
      "एक मिठाई वाली के पास 480 काजू बर्फ़ी और 168 बादाम बर्फ़ी हैं। वह इन्हें ऐसे ढेरों में रखती है कि हर ढेर में एक ही तरह की और बराबर बर्फ़ियाँ हों, और ट्रे में सबसे कम जगह घिरे। हर ढेर में कितनी बर्फ़ियाँ?",
    ),
    numbers: [480, 168],
    unit: t("barfis", "बर्फ़ियाँ"),
  },
  [Story.Rope]: {
    text: t(
      "Two ropes are 96 m and 72 m long. They are cut into pieces all of the same length, as long as possible, with nothing left over. How long is each piece?",
      "दो रस्सियाँ 96 m और 72 m लंबी हैं। उन्हें एक जैसी लंबाई के टुकड़ों में काटना है, जितने लंबे हो सकें, बिना कुछ बचे। हर टुकड़ा कितना लंबा होगा?",
    ),
    numbers: [96, 72],
    unit: t("m", "m"),
  },
  [Story.Tiles]: {
    text: t(
      "A room is 360 cm by 280 cm. What is the side of the largest square tile that covers the floor exactly, with no tile cut?",
      "एक कमरा 360 cm × 280 cm है। सबसे बड़ी वर्गाकार टाइल की भुजा क्या है जो फ़र्श को पूरा ढके, बिना किसी टाइल को काटे?",
    ),
    numbers: [360, 280],
    unit: t("cm", "cm"),
  },
  [Story.Teams]: {
    text: t(
      "A school has 84 students in Class 9 and 60 in Class 10. They are split into teams of the same size, each team from one class, as large as possible. How many students are in each team?",
      "एक विद्यालय में कक्षा 9 में 84 और कक्षा 10 में 60 विद्यार्थी हैं। उन्हें बराबर आकार की टोलियों में बाँटना है, हर टोली एक ही कक्षा की, जितनी बड़ी हो सके। हर टोली में कितने विद्यार्थी?",
    ),
    numbers: [84, 60],
    unit: t("students", "विद्यार्थी"),
  },
};

/** An HCF word problem (NCERT Example 2, Ex 1.1 Q3 and kin): spot the HCF, then find it. */
export const hcfStory = family({
  level: Level.Medium,
  tests: [Concept.EuclidAlgorithm],
  params: z
    .object({
      story: z.enum([Story.Army, Story.Sweets, Story.Rope, Story.Tiles, Story.Teams]),
    })
    .strict(),
  build: ({ story }, b) => {
    const spec = STORIES[story];
    const [big, small] = [Math.max(...spec.numbers), Math.min(...spec.numbers)];
    const steps = euclidSteps(big, small);
    const first = steps[0];
    const hcf = steps.at(-1)?.b;
    if (first === undefined || hcf === undefined) throw new Error("no division to do");
    const label = (n: number) => t(`${n} ${spec.unit.en}`, `${n} ${spec.unit.hi ?? spec.unit.en}`);
    const wrong: Option[] = [];
    const used = new Set([hcf]);
    const offer = (value: number, feedback: Localized) => {
      if (used.has(value) || value <= 0 || wrong.length >= 3) return;
      used.add(value);
      wrong.push({ id: `n${value}`, label: label(value), feedback });
    };
    if (first.r > 0) {
      offer(
        first.r,
        t(
          r`${first.r} is the first remainder: $${big} = ${small} \times ${first.q} + ${first.r}$. The answer is the largest number that divides both ${big} and ${small}: keep dividing.`,
          r`${first.r} पहला शेषफल है: $${big} = ${small} \times ${first.q} + ${first.r}$। उत्तर वह सबसे बड़ी संख्या है जो ${big} और ${small} दोनों को विभाजित करे: भाग देते रहो।`,
        ),
      );
    }
    offer(
      small,
      t(
        r`${small} doesn't divide ${big}: $${big} = ${small} \times ${first.q} + ${first.r}$.`,
        r`${small}, ${big} को विभाजित नहीं करता: $${big} = ${small} \times ${first.q} + ${first.r}$।`,
      ),
    );
    const smallestPrime = Number(Object.keys(bagOf(hcf))[0] ?? 1);
    if (hcf > 1) {
      offer(
        hcf / smallestPrime,
        t(
          `${hcf / smallestPrime} divides both, but it isn't the largest that does.`,
          `${hcf / smallestPrime} दोनों को विभाजित करता है, पर ऐसा सबसे बड़ा नहीं है।`,
        ),
      );
    }
    offer(
      hcf * 2,
      t(
        `${hcf * 2} doesn't divide both ${big} and ${small}.`,
        `${hcf * 2}, ${big} और ${small} दोनों को विभाजित नहीं करता।`,
      ),
    );
    const ask = choice(b, {
      prompt: spec.text,
      right: label(hcf),
      wrong: Object.fromEntries(wrong.map(({ id, ...o }) => [id, o])),
    });
    return [ask];
  },
});
