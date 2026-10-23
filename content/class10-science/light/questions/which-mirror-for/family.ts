import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Use = {
  Headlight: "headlight",
  RearView: "rearView",
  Shaving: "shaving",
  SolarFurnace: "solarFurnace",
  Dentist: "dentist",
  Shop: "shop",
} as const;
type Use = (typeof Use)[keyof typeof Use];
type Mirror = "concave" | "convex" | "plane";

const uses: Record<
  Use,
  { en: string; hi: string; mirror: Mirror; why: { en: string; hi: string } }
> = {
  headlight: {
    en: "the reflector behind a car's headlight bulb",
    hi: "कार की हेडलाइट के बल्ब के पीछे का परावर्तक",
    mirror: "concave",
    why: {
      en: "The bulb sits at F of a concave mirror, so its light leaves as a strong parallel beam.",
      hi: "बल्ब अवतल दर्पण के F पर होता है, इसलिए उसका प्रकाश तेज़ समानांतर किरण-पुंज बनकर निकलता है।",
    },
  },
  rearView: {
    en: "a vehicle's side (rear-view) mirror",
    hi: "गाड़ी का साइड (पीछे देखने वाला) दर्पण",
    mirror: "convex",
    why: {
      en: "A convex mirror always gives an erect image and shows a much wider area.",
      hi: "उत्तल दर्पण हमेशा सीधा प्रतिबिंब देता है और बहुत बड़ा क्षेत्र दिखाता है।",
    },
  },
  shaving: {
    en: "a shaving mirror that shows the face large and upright",
    hi: "शेविंग दर्पण जो चेहरा बड़ा और सीधा दिखाता है",
    mirror: "concave",
    why: {
      en: "With the face closer than F, a concave mirror gives a virtual, erect, enlarged image.",
      hi: "चेहरा F से पास हो तो अवतल दर्पण आभासी, सीधा, बड़ा प्रतिबिंब देता है।",
    },
  },
  solarFurnace: {
    en: "a solar furnace that gets very hot",
    hi: "सौर भट्टी जो बहुत गर्म हो जाती है",
    mirror: "concave",
    why: {
      en: "A concave mirror brings the Sun's parallel rays together at F.",
      hi: "अवतल दर्पण सूरज की समानांतर किरणों को F पर इकट्ठा करता है।",
    },
  },
  dentist: {
    en: "a dentist's mirror for seeing a tooth enlarged",
    hi: "दाँत को बड़ा देखने के लिए दंत चिकित्सक का दर्पण",
    mirror: "concave",
    why: {
      en: "With the tooth closer than F, a concave mirror shows it enlarged and the right way up.",
      hi: "दाँत F से पास हो तो अवतल दर्पण उसे बड़ा और सीधा दिखाता है।",
    },
  },
  shop: {
    en: "a mirror in a shop's corner that shows every aisle at once",
    hi: "दुकान के कोने का दर्पण जो हर गलियारा एक साथ दिखाता है",
    mirror: "convex",
    why: {
      en: "A convex mirror bulges outwards, so it takes in a wide area and shows it small and erect.",
      hi: "उत्तल दर्पण बाहर उभरा होता है, इसलिए वह बड़ा क्षेत्र समेटकर छोटा और सीधा दिखाता है।",
    },
  },
};

const names: Record<Mirror, { en: string; hi: string }> = {
  concave: { en: "Concave", hi: "अवतल" },
  convex: { en: "Convex", hi: "उत्तल" },
  plane: { en: "Plane", hi: "समतल" },
};

/** NCERT Ex 8 and the uses of mirrors: which mirror does each job, and why. */
export const whichMirrorFor = family({
  level: Level.Easy,
  tests: [Concept.ConvexMirrorCases],
  params: z.object({ use: z.nativeEnum(Use) }).strict(),
  build: ({ use }, b) => {
    const u = uses[use];
    const options: Option[] = (["concave", "convex", "plane"] as Mirror[]).map((m) =>
      m === u.mirror
        ? { id: "right", label: t(names[m].en, names[m].hi) }
        : { id: m, label: t(names[m].en, names[m].hi), feedback: u.why },
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        `Which kind of mirror is used as ${u.en}?`,
        `${u.hi} के रूप में किस तरह का दर्पण लगता है?`,
      ),
      options: settle(options, use.length * 5 + 1),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
