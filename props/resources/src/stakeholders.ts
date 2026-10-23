import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * NCERT 16.2: who has a stake in a forest. Map mode puts the forest in the middle and the four
 * stakeholders around it; tapping one shows what they need or get, how much they depend on the
 * forest, and whether they have a stake in one forest lasting. Cases mode steps through NCERT's
 * stories: the Bishnois and Amrita Devi, the Great Himalayan National Park's meadows, Chipko,
 * and Arabari.
 */

export const StakeMode = { Map: "map", Cases: "cases" } as const;
export type StakeMode = (typeof StakeMode)[keyof typeof StakeMode];

export const Stakeholder = {
  Local: "local",
  Department: "department",
  Industry: "industry",
  Enthusiast: "enthusiast",
} as const;
export type Stakeholder = (typeof Stakeholder)[keyof typeof Stakeholder];
export const STAKEHOLDERS: readonly Stakeholder[] = Object.values(Stakeholder);

export const Dependence = { High: "high", Some: "some", None: "none" } as const;
export type Dependence = (typeof Dependence)[keyof typeof Dependence];

type W = { en: string; hi: string };

export const STAKE_FACTS: Readonly<
  Record<Stakeholder, { name: W; needs: W; dependence: Dependence; longStake: boolean }>
> = {
  local: {
    name: { en: "People who live in or around the forest", hi: "जंगल में या उसके पास रहने वाले लोग" },
    needs: {
      en: "firewood, small timber, thatch, bamboo, fruits, nuts, medicines, fodder for cattle",
      hi: "जलावन, छोटी लकड़ी, छप्पर, बाँस, फल, मेवे, दवाइयाँ, पशुओं का चारा",
    },
    dependence: Dependence.High,
    longStake: true,
  },
  department: {
    name: { en: "The Forest Department", hi: "वन विभाग" },
    needs: {
      en: "owns the land and controls the forest's resources; plantations bring it revenue",
      hi: "ज़मीन का मालिक, जंगल के संसाधनों पर नियंत्रण; बागान से आय",
    },
    dependence: Dependence.Some,
    longStake: true,
  },
  industry: {
    name: { en: "Industrialists", hi: "उद्योगपति" },
    needs: {
      en: "raw material: timber, paper, lac, tendu leaves, sports goods; cheap and in bulk",
      hi: "कच्चा माल: लकड़ी, कागज़, लाख, तेंदू पत्ते, खेल का सामान; सस्ता और बहुत सारा",
    },
    dependence: Dependence.None,
    longStake: false,
  },
  enthusiast: {
    name: { en: "Wildlife and nature enthusiasts", hi: "वन्यजीव और प्रकृति प्रेमी" },
    needs: {
      en: "to conserve nature as it is; now the whole of biodiversity, not just big animals",
      hi: "प्रकृति को जैसी है वैसी बचाना; अब बड़े जानवर ही नहीं, पूरी जैव विविधता",
    },
    dependence: Dependence.None,
    longStake: true,
  },
};

export const ForestCase = {
  Bishnoi: "bishnoi",
  Himalayan: "himalayan",
  Chipko: "chipko",
  Arabari: "arabari",
} as const;
export type ForestCase = (typeof ForestCase)[keyof typeof ForestCase];
export const FOREST_CASES: readonly ForestCase[] = Object.values(ForestCase);

/** Each case as NCERT tells it, a few steps each. */
export const CASE_STEPS: Readonly<Record<ForestCase, readonly W[]>> = {
  bishnoi: [
    {
      en: "The Bishnoi community of western Rajasthan, on the edge of the Thar desert, hold it a religious duty to protect plants and animals.",
      hi: "पश्चिमी राजस्थान में थार रेगिस्तान के किनारे बसा बिश्नोई समुदाय पेड़-पौधों और जीवों की रक्षा को धार्मिक कर्तव्य मानता है।",
    },
    {
      en: "In 1731, in Khejrali village near Jodhpur, Amrita Devi Bishnoi and 363 others gave their lives to protect khejri trees.",
      hi: "1731 में जोधपुर के पास खेजड़ली गाँव में अमृता देवी बिश्नोई और 363 अन्य लोगों ने खेजड़ी के पेड़ बचाने के लिए जान दे दी।",
    },
    {
      en: "The Government of India now gives the Amrita Devi Bishnoi National Award for Wildlife Conservation in her memory.",
      hi: "उनकी याद में भारत सरकार अब 'अमृता देवी बिश्नोई राष्ट्रीय वन्यजीव संरक्षण पुरस्कार' देती है।",
    },
  ],
  himalayan: [
    {
      en: "Every summer, shepherds took their sheep up to graze the alpine meadows that are now inside the Great Himalayan National Park.",
      hi: "हर गर्मी चरवाहे अपनी भेड़ों को उन ऊँचे घास के मैदानों में चराने ले जाते थे जो अब ग्रेट हिमालयन नेशनल पार्क के अंदर हैं।",
    },
    {
      en: "When the park was made, grazing was stopped.",
      hi: "पार्क बनने पर चराई बंद कर दी गई।",
    },
    {
      en: "Without grazing, the grass grows very tall, then falls over and stops fresh growth. Keeping people out by force doesn't work in the long run.",
      hi: "चराई के बिना घास बहुत लंबी होकर गिर जाती है और नई घास को उगने नहीं देती। लोगों को ज़बरदस्ती बाहर रखना लंबे समय तक नहीं चलता।",
    },
  ],
  chipko: [
    {
      en: "Early 1970s, Reni village in Garhwal: a logging contractor was allowed to fell trees in the forest near the village.",
      hi: "1970 के दशक की शुरुआत, गढ़वाल का रेणी गाँव: एक ठेकेदार को गाँव के पास के जंगल में पेड़ काटने की अनुमति मिली।",
    },
    {
      en: "While the men were away, the women of the village reached the forest and hugged the tree trunks. The workers could not cut them.",
      hi: "जब आदमी गाँव से बाहर थे, गाँव की औरतें जंगल पहुँचीं और पेड़ों के तनों से लिपट गईं। मज़दूर पेड़ नहीं काट पाए।",
    },
    {
      en: "The contractor withdrew. Felling destroys a tree for ever; villagers only lop branches and pluck leaves, so the forest grows back. The movement spread.",
      hi: "ठेकेदार लौट गया। काटने से पेड़ हमेशा के लिए ख़त्म हो जाता है; गाँव वाले केवल डालियाँ छाँटते और पत्ते तोड़ते हैं, इसलिए जंगल फिर उग आता है। आंदोलन फैल गया।",
    },
  ],
  arabari: [
    {
      en: "1972, West Bengal: policing had failed to revive degraded sal forests, and villagers and forest officials kept clashing.",
      hi: "1972, पश्चिम बंगाल: पहरे से ख़राब हो चुके साल के जंगल नहीं सुधरे, और गाँव वालों और वन अधिकारियों में झगड़े होते रहे।",
    },
    {
      en: "In the Arabari range, forest officer A.K. Banerjee brought the villagers in to protect 1,272 hectares of badly degraded sal forest.",
      hi: "अराबाड़ी क्षेत्र में वन अधिकारी ए.के. बनर्जी ने 1,272 हेक्टेयर बुरी तरह ख़राब साल के जंगल की रक्षा में गाँव वालों को साथ लिया।",
    },
    {
      en: "In return: jobs in planting and harvesting, 25% of the final harvest, and fuelwood and fodder for a small fee.",
      hi: "बदले में: पौधे लगाने और कटाई का काम, अंतिम उपज का 25%, और थोड़े शुल्क पर जलावन और चारा।",
    },
    {
      en: "By 1983 the forest had recovered: once worthless, it was now worth Rs 12.5 crores.",
      hi: "1983 तक जंगल फिर से हरा हो गया: पहले बेकार, अब उसकी क़ीमत 12.5 करोड़ रुपये थी।",
    },
  ],
};

export const StakeAction = {
  Pick: "pick",
  SetCase: "setCase",
  Next: "next",
  Reset: "reset",
} as const;
export const StakeSignal = { Picked: "picked", Stepped: "stepped", CaseDone: "caseDone" } as const;
export const StakeDerived = {
  Dependence: "dependence",
  HasLongStake: "hasLongStake",
  StepCount: "stepCount",
  IsDone: "isDone",
} as const;
export const StakePart = {
  Forest: "forest",
  Stakeholders: "stakeholders",
  Story: "story",
} as const;

const stakeState = z
  .object({
    mode: z.nativeEnum(StakeMode),
    selected: z.nativeEnum(Stakeholder).nullable(),
    case: z.nativeEnum(ForestCase),
    step: z.number().int().min(0).max(3),
    /** The cases offered as buttons (cases mode). */
    cases: z.array(z.nativeEnum(ForestCase)).min(1).max(4),
    showNeeds: z.boolean(),
    canTap: z.boolean(),
    canStep: z.boolean(),
    canPickCase: z.boolean(),
  })
  .strict();
export type StakeState = z.infer<typeof stakeState>;

export const stepCountOf = (c: ForestCase): number => CASE_STEPS[c].length;

export function describeStakeholders(s: StakeState): string {
  if (s.mode === StakeMode.Cases) {
    const line = CASE_STEPS[s.case][s.step]?.en ?? "";
    return `Forest story: ${s.case}, step ${s.step + 1} of ${stepCountOf(s.case)}. ${line}`;
  }
  const list = STAKEHOLDERS.map((x) => STAKE_FACTS[x].name.en).join("; ");
  if (s.selected === null) return `A forest and its four stakeholders: ${list}. None is selected.`;
  const f = STAKE_FACTS[s.selected];
  return `A forest and its four stakeholders: ${list}. Selected: ${f.name.en}. They need or get: ${f.needs.en}. Dependence on the forest: ${f.dependence}; ${f.longStake ? "a stake" : "no stake"} in this one forest lasting.`;
}

const act = actionsFor<StakeState>();

export const stakeholders = defineProp({
  type: "forestStakeholders",
  describe:
    "NCERT 16.2's forest stakeholders. Map mode: the forest with its four stakeholders (people living in or around it, the Forest Department, industrialists, wildlife and nature enthusiasts); tap one to see what they need or get, how much they depend on the forest, and whether they have a stake in one forest lasting. Cases mode: NCERT's stories stepped through (the Bishnois and Amrita Devi, the Himalayan park meadows, Chipko, Arabari).",
  state: stakeState,
  defaults: {
    mode: StakeMode.Map,
    selected: null,
    case: ForestCase.Chipko,
    step: 0,
    cases: [...FOREST_CASES],
    showNeeds: true,
    canTap: true,
    canStep: true,
    canPickCase: true,
  },
  inputs: ["mode", "cases", "showNeeds", "canTap", "canStep", "canPickCase"],
  invariant: (s) => {
    if (s.step >= stepCountOf(s.case)) return "step is past the end of the story";
    if (!s.cases.includes(s.case)) return "the case shown must be one of the cases offered";
    return undefined;
  },
  derived: {
    [StakeDerived.Dependence]: {
      describe:
        "How much the selected stakeholder depends on the forest: high, some, none; or null",
      compute: (s) => (s.selected === null ? null : STAKE_FACTS[s.selected].dependence),
    },
    [StakeDerived.HasLongStake]: {
      describe: "Whether the selected stakeholder needs this one forest to last, or null",
      compute: (s) => (s.selected === null ? null : STAKE_FACTS[s.selected].longStake),
    },
    [StakeDerived.StepCount]: {
      describe: "How many steps the current story has",
      compute: (s) => stepCountOf(s.case),
    },
    [StakeDerived.IsDone]: {
      describe: "Whether the current story has reached its last step",
      compute: (s) => s.step === stepCountOf(s.case) - 1,
    },
  },
  actions: {
    [StakeAction.Pick]: act({
      describe: "Tap one stakeholder",
      byLearner: true,
      args: z.object({ who: z.nativeEnum(Stakeholder) }).strict(),
      run: (_s, a) =>
        set(
          { selected: a.who },
          {
            signal: StakeSignal.Picked,
            payload: {
              who: a.who,
              dependence: STAKE_FACTS[a.who].dependence,
              longStake: STAKE_FACTS[a.who].longStake,
            },
          },
        ),
    }),
    [StakeAction.SetCase]: act({
      describe: "Start one forest story from the beginning",
      byLearner: true,
      args: z.object({ case: z.nativeEnum(ForestCase) }).strict(),
      run: (s, a) => (s.cases.includes(a.case) ? set({ case: a.case, step: 0 }) : set({})),
    }),
    [StakeAction.Next]: act({
      describe: "Go to the next step of the story",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const last = stepCountOf(s.case) - 1;
        if (s.step >= last) return set({});
        const step = s.step + 1;
        const emit: Emit[] = [{ signal: StakeSignal.Stepped, payload: { case: s.case, step } }];
        if (step === last) emit.push({ signal: StakeSignal.CaseDone, payload: { case: s.case } });
        return set({ step }, ...emit);
      },
    }),
    [StakeAction.Reset]: act({
      describe: "Back to the first step; nobody selected",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0, selected: null }),
    }),
  },
  signals: {
    [StakeSignal.Picked]: {
      describe: "A stakeholder was tapped; the payload has their dependence and long stake",
    },
    [StakeSignal.Stepped]: { describe: "The story moved on a step" },
    [StakeSignal.CaseDone]: { describe: "A story reached its last step", isCommit: true },
  },
  observe: (s) => ({
    summary: describeStakeholders(s),
    elements:
      s.mode === StakeMode.Cases
        ? [{ id: StakePart.Story, value: CASE_STEPS[s.case][s.step]?.en }]
        : [{ id: StakePart.Forest }, { id: StakePart.Stakeholders, value: s.selected }],
  }),
  parts: (s) =>
    s.mode === StakeMode.Cases ? [StakePart.Story] : [StakePart.Forest, StakePart.Stakeholders],
});
