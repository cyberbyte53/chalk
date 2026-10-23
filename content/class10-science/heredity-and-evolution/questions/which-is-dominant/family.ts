import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Height: "height",
  Shape: "shape",
  Flower: "flower",
  Colour: "colour",
  LightEyes: "lightEyes",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type Pair = { en: string; hi: string };
const cases: Record<
  Case,
  { story: Pair; options: [Pair, Pair, Pair]; right: 0 | 1 | 2; why: Pair }
> = {
  height: {
    story: {
      en: "A pure tall pea plant is crossed with a pure short one, and every F₁ plant is tall.",
      hi: "एक शुद्ध लंबे मटर के पौधे का शुद्ध बौने से संकरण होता है, और हर F₁ पौधा लंबा है।",
    },
    options: [
      { en: "Tall", hi: "लंबा" },
      { en: "Short", hi: "बौना" },
      { en: "Can't tell", hi: "कह नहीं सकते" },
    ],
    right: 0,
    why: {
      en: "Each F₁ plant has one copy of each, and only tallness shows: tall is dominant.",
      hi: "हर F₁ पौधे में दोनों की एक-एक प्रति है, और केवल लंबापन दिखता है: लंबा प्रभावी है।",
    },
  },
  shape: {
    story: {
      en: "Pure round-seeded plants crossed with pure wrinkled-seeded ones give only round seeds in F₁.",
      hi: "शुद्ध गोल बीज वाले पौधों का शुद्ध झुर्रीदार बीज वालों से संकरण करने पर F₁ में केवल गोल बीज आते हैं।",
    },
    options: [
      { en: "Round", hi: "गोल" },
      { en: "Wrinkled", hi: "झुर्रीदार" },
      { en: "Can't tell", hi: "कह नहीं सकते" },
    ],
    right: 0,
    why: {
      en: "With one copy of each, only round shows: round is dominant.",
      hi: "दोनों की एक-एक प्रति होने पर केवल गोल दिखता है: गोल प्रभावी है।",
    },
  },
  flower: {
    story: {
      en: "Pure violet-flowered plants crossed with pure white-flowered ones give F₁ plants that all have violet flowers. In F₂, a quarter have white flowers.",
      hi: "शुद्ध बैंगनी फूल वाले पौधों का शुद्ध सफ़ेद फूल वालों से संकरण करने पर सारे F₁ पौधों के फूल बैंगनी हैं। F₂ में एक चौथाई के फूल सफ़ेद हैं।",
    },
    options: [
      { en: "White", hi: "सफ़ेद" },
      { en: "Violet", hi: "बैंगनी" },
      { en: "Can't tell", hi: "कह नहीं सकते" },
    ],
    right: 1,
    why: {
      en: "Violet shows in F₁ with one copy; white hides and returns in a quarter of F₂: violet is dominant.",
      hi: "बैंगनी एक प्रति के साथ F₁ में दिखता है; सफ़ेद छिपकर F₂ के एक चौथाई में लौटता है: बैंगनी प्रभावी है।",
    },
  },
  colour: {
    story: {
      en: "Green-seeded plants crossed with yellow-seeded ones (both pure) give F₁ seeds that are all yellow.",
      hi: "हरे बीज वाले पौधों का पीले बीज वालों से (दोनों शुद्ध) संकरण करने पर सारे F₁ बीज पीले हैं।",
    },
    options: [
      { en: "Green", hi: "हरा" },
      { en: "Can't tell", hi: "कह नहीं सकते" },
      { en: "Yellow", hi: "पीला" },
    ],
    right: 2,
    why: {
      en: "Only yellow shows in F₁, where each seed has one copy of each: yellow is dominant.",
      hi: "F₁ में, जहाँ हर बीज में दोनों की एक-एक प्रति है, केवल पीला दिखता है: पीला प्रभावी है।",
    },
  },
  lightEyes: {
    story: {
      en: "A study found that children with light-coloured eyes are likely to have parents with light-coloured eyes.",
      hi: "एक अध्ययन में पाया गया कि हल्के रंग की आँखों वाले बच्चों के माता-पिता की आँखें भी अक्सर हल्के रंग की होती हैं।",
    },
    options: [
      { en: "Light eyes", hi: "हल्की आँखें" },
      { en: "Dark eyes", hi: "गहरी आँखें" },
      { en: "Can't tell", hi: "कह नहीं सकते" },
    ],
    right: 2,
    why: {
      en: '"Like parents, like children" happens whether the trait is dominant or recessive. We\'d need crosses of parents that differ, with counts.',
      hi: '"जैसे माता-पिता, वैसे बच्चे" लक्षण प्रभावी हो या अप्रभावी, दोनों में होता है। हमें अलग जनकों के संकरण और गिनती चाहिए।',
    },
  },
};

/** Which trait is dominant, from a cross's results (or: is there enough to tell?). NCERT 9.2, Ex 4. */
export const whichIsDominant = family({
  level: Level.Easy,
  tests: [Concept.MendelOneTrait],
  params: z.object({ case: z.nativeEnum(Case) }).strict(),
  build: ({ case: c }, b) => {
    const k = cases[c];
    const options: Option[] = k.options.map((o, i) =>
      i === k.right
        ? { id: "right", label: t(o.en, o.hi) }
        : { id: `o${i}`, label: t(o.en, o.hi), feedback: k.why },
    );
    const ask = choiceQuestion(b, {
      prompt: t(`${k.story.en} Which trait is dominant?`, `${k.story.hi} कौन सा लक्षण प्रभावी है?`),
      options: settle(options, c.length * 5 + 2),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
