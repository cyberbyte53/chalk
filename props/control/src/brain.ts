import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./draw";

/**
 * The human brain from the side (NCERT 7.1.2, Fig. 7.3): tap a part to read its job. The parts are
 * grouped into the fore-brain (cerebrum, hypothalamus), mid-brain and hind-brain (pons, cerebellum,
 * medulla); the pituitary gland hangs below, and the spinal cord runs down from the medulla. In ask
 * mode an everyday action is shown and the learner taps the part in charge of it.
 */

export const BrainRegion = {
  Cerebrum: "cerebrum",
  Hypothalamus: "hypothalamus",
  Pituitary: "pituitary",
  MidBrain: "midBrain",
  Pons: "pons",
  Cerebellum: "cerebellum",
  Medulla: "medulla",
  SpinalCord: "spinalCord",
} as const;
export type BrainRegion = (typeof BrainRegion)[keyof typeof BrainRegion];

export const Division = {
  Fore: "fore",
  Mid: "mid",
  Hind: "hind",
  Gland: "gland",
  Cord: "cord",
} as const;
export type Division = (typeof Division)[keyof typeof Division];

export const DIVISION_OF: Readonly<Record<BrainRegion, Division>> = {
  [BrainRegion.Cerebrum]: Division.Fore,
  [BrainRegion.Hypothalamus]: Division.Fore,
  [BrainRegion.Pituitary]: Division.Gland,
  [BrainRegion.MidBrain]: Division.Mid,
  [BrainRegion.Pons]: Division.Hind,
  [BrainRegion.Cerebellum]: Division.Hind,
  [BrainRegion.Medulla]: Division.Hind,
  [BrainRegion.SpinalCord]: Division.Cord,
};

export const REGION_WORDS: Readonly<Record<BrainRegion, { name: Words; job: Words }>> = {
  [BrainRegion.Cerebrum]: {
    name: { en: "Cerebrum (fore-brain)", hi: "प्रमस्तिष्क (अग्रमस्तिष्क)" },
    job: {
      en: "The main thinking part. Separate areas receive messages for sight, hearing, smell and so on; association areas put them together with what is already stored; motor areas then send orders to voluntary muscles.",
      hi: "सोचने वाला मुख्य भाग। अलग-अलग क्षेत्र देखने, सुनने, सूँघने आदि के संदेश पाते हैं; संगठन क्षेत्र उन्हें पहले से याद बातों के साथ जोड़ते हैं; फिर प्रेरक क्षेत्र ऐच्छिक पेशियों को आदेश भेजते हैं।",
    },
  },
  [BrainRegion.Hypothalamus]: {
    name: { en: "Hypothalamus (fore-brain)", hi: "हाइपोथैलेमस (अग्रमस्तिष्क)" },
    job: {
      en: "A small part of the fore-brain. It holds the centre for hunger, which tells you when you have eaten enough, and it releases hormones that make the pituitary release its own.",
      hi: "अग्रमस्तिष्क का एक छोटा भाग। इसमें भूख का केंद्र है, जो बताता है कि पेट भर गया, और यह ऐसे हॉर्मोन छोड़ता है जो पीयूष ग्रंथि से उसके हॉर्मोन छुड़वाते हैं।",
    },
  },
  [BrainRegion.Pituitary]: {
    name: { en: "Pituitary gland", hi: "पीयूष ग्रंथि" },
    job: {
      en: "Not a thinking part: a gland hanging under the brain. It releases hormones into the blood, such as growth hormone.",
      hi: "सोचने वाला भाग नहीं: मस्तिष्क के नीचे लटकी एक ग्रंथि। यह रुधिर में हॉर्मोन छोड़ती है, जैसे वृद्धि हॉर्मोन।",
    },
  },
  [BrainRegion.MidBrain]: {
    name: { en: "Mid-brain", hi: "मध्यमस्तिष्क" },
    job: {
      en: "With the hind-brain, it controls many involuntary actions: things the body does without your thinking about them.",
      hi: "पश्चमस्तिष्क के साथ मिलकर यह कई अनैच्छिक क्रियाएँ नियंत्रित करता है: ऐसे काम जो शरीर तुम्हारे सोचे बिना करता है।",
    },
  },
  [BrainRegion.Pons]: {
    name: { en: "Pons (hind-brain)", hi: "पोन्स (पश्चमस्तिष्क)" },
    job: {
      en: "Part of the hind-brain. With the mid-brain and medulla it helps control involuntary actions.",
      hi: "पश्चमस्तिष्क का भाग। मध्यमस्तिष्क और मेडुला के साथ यह अनैच्छिक क्रियाओं के नियंत्रण में मदद करता है।",
    },
  },
  [BrainRegion.Cerebellum]: {
    name: { en: "Cerebellum (hind-brain)", hi: "अनुमस्तिष्क (पश्चमस्तिष्क)" },
    job: {
      en: "Makes voluntary actions precise, and keeps the body's posture and balance: walking in a straight line, riding a bicycle, picking up a pencil.",
      hi: "ऐच्छिक क्रियाओं को सटीक बनाता है, और शरीर की मुद्रा और संतुलन बनाए रखता है: सीधी रेखा में चलना, साइकिल चलाना, पेंसिल उठाना।",
    },
  },
  [BrainRegion.Medulla]: {
    name: { en: "Medulla (hind-brain)", hi: "मेडुला (पश्चमस्तिष्क)" },
    job: {
      en: "Controls involuntary actions such as blood pressure, salivation (mouth watering) and vomiting.",
      hi: "रक्तचाप, लार आना और उल्टी जैसी अनैच्छिक क्रियाओं को नियंत्रित करता है।",
    },
  },
  [BrainRegion.SpinalCord]: {
    name: { en: "Spinal cord", hi: "मेरुरज्जु" },
    job: {
      en: "Carries messages between the brain and the body, and is where reflex arcs are made. With the brain it forms the central nervous system.",
      hi: "मस्तिष्क और शरीर के बीच संदेश ले जाता है, और यहीं प्रतिवर्ती चाप बनते हैं। मस्तिष्क के साथ यह केंद्रीय तंत्रिका तंत्र बनाता है।",
    },
  },
};

export const DIVISION_WORDS: Readonly<Record<Division, Words>> = {
  [Division.Fore]: { en: "fore-brain", hi: "अग्रमस्तिष्क" },
  [Division.Mid]: { en: "mid-brain", hi: "मध्यमस्तिष्क" },
  [Division.Hind]: { en: "hind-brain", hi: "पश्चमस्तिष्क" },
  [Division.Gland]: { en: "a gland", hi: "एक ग्रंथि" },
  [Division.Cord]: { en: "spinal cord", hi: "मेरुरज्जु" },
};

/** Everyday actions for ask mode, each with the parts that count as the right answer. */
export const BrainTask = {
  RideBicycle: "rideBicycle",
  WalkStraight: "walkStraight",
  PickPencil: "pickPencil",
  SolveSum: "solveSum",
  SmellIncense: "smellIncense",
  MouthWaters: "mouthWaters",
  Vomit: "vomit",
  BloodPressure: "bloodPressure",
  FeelFull: "feelFull",
  PullFromFlame: "pullFromFlame",
} as const;
export type BrainTask = (typeof BrainTask)[keyof typeof BrainTask];

export const TASKS: Readonly<Record<BrainTask, { words: Words; answer: readonly BrainRegion[] }>> =
  {
    [BrainTask.RideBicycle]: {
      words: { en: "Riding a bicycle without falling", hi: "बिना गिरे साइकिल चलाना" },
      answer: [BrainRegion.Cerebellum],
    },
    [BrainTask.WalkStraight]: {
      words: { en: "Walking in a straight line", hi: "सीधी रेखा में चलना" },
      answer: [BrainRegion.Cerebellum],
    },
    [BrainTask.PickPencil]: {
      words: { en: "Picking up a pencil exactly", hi: "पेंसिल को ठीक-ठीक उठाना" },
      answer: [BrainRegion.Cerebellum],
    },
    [BrainTask.SolveSum]: {
      words: { en: "Working out a sum", hi: "कोई सवाल हल करना" },
      answer: [BrainRegion.Cerebrum],
    },
    [BrainTask.SmellIncense]: {
      words: { en: "Knowing that smell is an agarbatti", hi: "पहचानना कि यह अगरबत्ती की गंध है" },
      answer: [BrainRegion.Cerebrum],
    },
    [BrainTask.MouthWaters]: {
      words: { en: "Your mouth watering at the smell of food", hi: "खाने की गंध से मुँह में पानी आना" },
      answer: [BrainRegion.Medulla],
    },
    [BrainTask.Vomit]: {
      words: { en: "Vomiting", hi: "उल्टी होना" },
      answer: [BrainRegion.Medulla],
    },
    [BrainTask.BloodPressure]: {
      words: { en: "Keeping your blood pressure steady", hi: "रक्तचाप को स्थिर रखना" },
      answer: [BrainRegion.Medulla],
    },
    [BrainTask.FeelFull]: {
      words: { en: "Feeling that you have eaten enough", hi: "महसूस करना कि पेट भर गया" },
      answer: [BrainRegion.Hypothalamus],
    },
    [BrainTask.PullFromFlame]: {
      words: { en: "Pulling your hand back from a flame", hi: "लौ से हाथ झट से हटाना" },
      answer: [BrainRegion.SpinalCord],
    },
  };

export const BrainAction = { Tap: "tap", Ask: "ask", Clear: "clear" } as const;
export const BrainSignal = { Picked: "picked", Answered: "answered" } as const;
export const BrainDerived = { Division: "division", IsRight: "isRight" } as const;
export const BrainPart = { Map: "map", Card: "card" } as const;

const brainState = z
  .object({
    /** The part tapped last, or null. */
    selected: z.nativeEnum(BrainRegion).nullable(),
    /** Ask mode: the everyday action whose part the learner must tap, or null (explore mode). */
    ask: z.nativeEnum(BrainTask).nullable(),
    showNames: z.boolean(),
    /** Colour the parts by fore-, mid- and hind-brain. */
    showDivisions: z.boolean(),
    canTap: z.boolean(),
  })
  .strict();
export type BrainState = z.infer<typeof brainState>;

export function isRightPart(task: BrainTask, region: BrainRegion): boolean {
  return TASKS[task].answer.includes(region);
}

export function describeBrain(s: BrainState): string {
  const picked =
    s.selected === null
      ? "Nothing tapped yet."
      : `Tapped: ${REGION_WORDS[s.selected].name.en}: ${REGION_WORDS[s.selected].job.en}`;
  const ask =
    s.ask === null
      ? ""
      : ` Question: which part is in charge of "${TASKS[s.ask].words.en}"?${s.selected === null ? "" : isRightPart(s.ask, s.selected) ? " The tapped part is right." : " The tapped part is not the one in charge."}`;
  return `The human brain seen from the side, front to the left: the big cerebrum on top, the small hypothalamus under it with the pituitary gland hanging below, the mid-brain, the pons, the striped cerebellum at the back and the medulla leading down into the spinal cord. ${picked}${ask}`;
}

const act = actionsFor<BrainState>();

export const brainMap = defineProp({
  type: "brainMap",
  describe:
    "The human brain from the side (NCERT Fig. 7.3) with its parts: cerebrum and hypothalamus (fore-brain), mid-brain, pons, cerebellum and medulla (hind-brain), the pituitary gland and the spinal cord. Tapping a part shows its name, which division it belongs to and its job. In ask mode an everyday action (riding a bicycle, mouth watering, solving a sum, feeling full, pulling a hand from a flame) is shown and the learner taps the part in charge.",
  state: brainState,
  defaults: {
    selected: null,
    ask: null,
    showNames: true,
    showDivisions: true,
    canTap: true,
  },
  inputs: ["ask", "showNames", "showDivisions", "canTap"],
  derived: {
    [BrainDerived.Division]: {
      describe: "The division of the tapped part: fore, mid, hind, gland or cord; null if none",
      compute: (s) => (s.selected === null ? null : DIVISION_OF[s.selected]),
    },
    [BrainDerived.IsRight]: {
      describe: "Ask mode: whether the tapped part is the one in charge; null if nothing to judge",
      compute: (s) =>
        s.ask === null || s.selected === null ? null : isRightPart(s.ask, s.selected),
    },
  },
  actions: {
    [BrainAction.Tap]: act({
      describe: "Tap a part of the brain to read about it (in ask mode, this is the answer)",
      byLearner: true,
      args: z.object({ region: z.nativeEnum(BrainRegion) }).strict(),
      run: (s, a) => {
        if (s.ask === null)
          return set(
            { selected: a.region },
            { signal: BrainSignal.Picked, payload: { region: a.region } },
          );
        return set(
          { selected: a.region },
          {
            signal: BrainSignal.Answered,
            payload: { region: a.region, isRight: isRightPart(s.ask, a.region), task: s.ask },
          },
        );
      },
    }),
    [BrainAction.Ask]: act({
      describe: "Show an everyday action and ask which part is in charge (null: explore mode)",
      args: z.object({ task: z.nativeEnum(BrainTask).nullable() }).strict(),
      run: (_s, a) => set({ ask: a.task, selected: null }),
    }),
    [BrainAction.Clear]: act({
      describe: "Clear the tapped part",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ selected: null }),
    }),
  },
  signals: {
    [BrainSignal.Picked]: { describe: "A part was tapped in explore mode; `region` is which" },
    [BrainSignal.Answered]: {
      describe: "Ask mode: a part was tapped; `isRight` says whether it is in charge of `task`",
    },
  },
  observe: (s) => ({
    summary: describeBrain(s),
    elements: [{ id: BrainPart.Map, value: describeBrain(s) }],
  }),
  parts: () => [BrainPart.Map, BrainPart.Card, ...Object.values(BrainRegion)],
});
