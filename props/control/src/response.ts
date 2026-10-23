import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./draw";

/**
 * Hormones at work (NCERT 7.3), in two modes.
 *
 * Adrenaline: a scare makes the adrenal glands release adrenaline into the blood; the heart beats
 * faster, breathing speeds up, and blood is sent away from the digestive system and skin to the
 * skeletal muscles, so the body is ready to fight or run. Calming down undoes it.
 *
 * Blood sugar: eating raises the blood sugar; the pancreas detects it and releases more insulin,
 * which brings the sugar back down; as the sugar falls, insulin is reduced: a feedback mechanism.
 * With the pancreas not making insulin (diabetes), the sugar stays high. Sugar here is on a
 * relative scale (the normal band is 4 to 7), not mg/dL.
 */

export const ResponseMode = { Adrenaline: "adrenaline", BloodSugar: "bloodSugar" } as const;
export type ResponseMode = (typeof ResponseMode)[keyof typeof ResponseMode];

export const SUGAR = { min: 0, max: 12, rest: 5, low: 4, high: 7, meal: 4 } as const;
export const MAX_INSULIN = 3;
export const HISTORY = 12;

export const ResponseAction = {
  Scare: "scare",
  Calm: "calm",
  Eat: "eat",
  Wait: "wait",
  SetPancreas: "setPancreas",
  Reset: "reset",
} as const;
export const ResponseSignal = {
  Scared: "scared",
  Calmed: "calmed",
  Ate: "ate",
  Waited: "waited",
} as const;
export const ResponseDerived = {
  HeartRate: "heartRate",
  BloodToMuscles: "bloodToMuscles",
  IsHigh: "isHigh",
  IsNormal: "isNormal",
} as const;
export const ResponsePart = {
  Body: "body",
  Graph: "graph",
  Pancreas: "pancreas",
  Buttons: "buttons",
} as const;

const responseState = z
  .object({
    mode: z.nativeEnum(ResponseMode),
    /** Adrenaline: whether the person has had a scare (adrenaline in the blood). */
    isScared: z.boolean(),
    /** Blood sugar, on a relative scale from 0 to 12 (normal 4–7). */
    sugar: z.number().min(SUGAR.min).max(SUGAR.max),
    /** How much insulin the pancreas is releasing now, 0–3. */
    insulin: z.number().int().min(0).max(MAX_INSULIN),
    /** The last readings of blood sugar, oldest first. */
    history: z.array(z.number().min(SUGAR.min).max(SUGAR.max)).min(1).max(HISTORY),
    /** Whether the pancreas makes insulin (false: diabetes). */
    hasInsulin: z.boolean(),
    canAct: z.boolean(),
    canSetPancreas: z.boolean(),
  })
  .strict();
export type ResponseState = z.infer<typeof responseState>;

const round1 = (x: number): number => Math.round(x * 10) / 10;
const push = (history: readonly number[], v: number): number[] => [...history, v].slice(-HISTORY);

/** One step of time: the pancreas responds to the sugar it detects, and insulin acts on it. */
export function afterWait(s: Pick<ResponseState, "sugar" | "insulin" | "hasInsulin">): {
  sugar: number;
  insulin: number;
} {
  if (!s.hasInsulin) return { sugar: round1(Math.max(SUGAR.rest, s.sugar - 0.3)), insulin: 0 };
  const insulin =
    s.sugar > SUGAR.rest + 0.5 ? Math.min(MAX_INSULIN, s.insulin + 1) : Math.max(0, s.insulin - 1);
  const sugar = round1(Math.max(SUGAR.rest, s.sugar - insulin * 1.2));
  return { sugar, insulin };
}

export function isHigh(sugar: number): boolean {
  return sugar > SUGAR.high;
}
export function isNormal(sugar: number): boolean {
  return sugar >= SUGAR.low && sugar <= SUGAR.high;
}

export function responseCaption(s: ResponseState): Words {
  if (s.mode === ResponseMode.Adrenaline)
    return s.isScared
      ? {
          en: "Adrenaline is in the blood. The heart beats faster, breathing speeds up, and blood is sent from the stomach and skin to the muscles: ready to fight or run.",
          hi: "रुधिर में एड्रिनलिन है। हृदय तेज़ धड़कता है, साँस तेज़ होती है, और रुधिर पेट और त्वचा से पेशियों की ओर भेजा जाता है: लड़ने या भागने को तैयार।",
        }
      : {
          en: "Calm. Tap 'A scare!' and watch what changes all over the body at once.",
          hi: "शांत। 'अचानक डर!' दबाओ और देखो पूरे शरीर में एक साथ क्या बदलता है।",
        };
  if (!s.hasInsulin && isHigh(s.sugar))
    return {
      en: "The pancreas is not making insulin, so nothing brings the sugar down. It stays high: this is diabetes.",
      hi: "अग्न्याशय इंसुलिन नहीं बना रहा, इसलिए शर्करा को कुछ भी नीचे नहीं लाता। यह ऊँची बनी रहती है: यही मधुमेह है।",
    };
  if (isHigh(s.sugar))
    return {
      en: "Blood sugar is high. The pancreas detects it and releases more insulin. Tap 'Wait' to let time pass.",
      hi: "रुधिर में शर्करा ऊँची है। अग्न्याशय इसे पहचानकर अधिक इंसुलिन छोड़ता है। समय बीतने देने के लिए 'रुको' दबाओ।",
    };
  if (s.insulin > 0)
    return {
      en: "Insulin has brought the sugar back to normal. As the sugar falls, the pancreas cuts the insulin down: feedback.",
      hi: "इंसुलिन ने शर्करा को सामान्य कर दिया। शर्करा घटने पर अग्न्याशय इंसुलिन कम कर देता है: पुनर्भरण (फ़ीडबैक)।",
    };
  return {
    en: "Blood sugar is normal and little insulin is needed. Tap 'Eat' to have a meal.",
    hi: "रुधिर में शर्करा सामान्य है और थोड़ा ही इंसुलिन चाहिए। भोजन करने के लिए 'खाओ' दबाओ।",
  };
}

export function describeResponse(s: ResponseState): string {
  if (s.mode === ResponseMode.Adrenaline)
    return `A person with the heart, lungs, stomach and leg muscles marked. ${responseCaption(s).en}`;
  return `A graph of blood sugar over time with the normal band from ${SUGAR.low} to ${SUGAR.high} marked, and the pancreas releasing insulin. Sugar now ${s.sugar}, insulin ${s.insulin} of ${MAX_INSULIN}; the pancreas ${s.hasInsulin ? "makes" : "does not make"} insulin. ${responseCaption(s).en}`;
}

const act = actionsFor<ResponseState>();

export const hormoneResponse = defineProp({
  type: "hormoneResponse",
  describe:
    "Hormones at work, two modes. Adrenaline: a scare makes the heart beat faster, breathing speed up and blood go from the stomach and skin to the muscles (fight or run); calm undoes it. Blood sugar: eat and the sugar rises; the pancreas releases more insulin, the sugar falls back into the normal band, and insulin is cut down again (feedback). Turning the pancreas's insulin off (diabetes) leaves the sugar high. The sugar scale is relative (normal 4–7), not mg/dL.",
  state: responseState,
  defaults: {
    mode: ResponseMode.Adrenaline,
    isScared: false,
    sugar: SUGAR.rest,
    insulin: 0,
    history: [SUGAR.rest],
    hasInsulin: true,
    canAct: true,
    canSetPancreas: false,
  },
  inputs: ["mode", "hasInsulin", "canAct", "canSetPancreas"],
  derived: {
    [ResponseDerived.HeartRate]: {
      describe: "Adrenaline mode: the heartbeat, normal or fast",
      compute: (s) => (s.isScared ? "fast" : "normal"),
    },
    [ResponseDerived.BloodToMuscles]: {
      describe: "Adrenaline mode: blood flow to the skeletal muscles, normal or more",
      compute: (s) => (s.isScared ? "more" : "normal"),
    },
    [ResponseDerived.IsHigh]: {
      describe: "Blood sugar mode: whether the sugar is above the normal band",
      compute: (s) => isHigh(s.sugar),
    },
    [ResponseDerived.IsNormal]: {
      describe: "Blood sugar mode: whether the sugar is inside the normal band",
      compute: (s) => isNormal(s.sugar),
    },
  },
  actions: {
    [ResponseAction.Scare]: act({
      describe: "Adrenaline mode: a sudden scare; adrenaline is released",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        s.isScared
          ? set({})
          : set({ isScared: true }, { signal: ResponseSignal.Scared, payload: {} }),
    }),
    [ResponseAction.Calm]: act({
      describe: "Adrenaline mode: the danger has passed; the body calms down",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        s.isScared
          ? set({ isScared: false }, { signal: ResponseSignal.Calmed, payload: {} })
          : set({}),
    }),
    [ResponseAction.Eat]: act({
      describe: "Blood sugar mode: eat a meal; blood sugar rises",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const sugar = round1(Math.min(SUGAR.max, s.sugar + SUGAR.meal));
        return set(
          { sugar, history: push(s.history, sugar) },
          { signal: ResponseSignal.Ate, payload: { sugar } },
        );
      },
    }),
    [ResponseAction.Wait]: act({
      describe:
        "Blood sugar mode: let some time pass; the pancreas adjusts insulin and insulin acts on the sugar",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const next = afterWait(s);
        return set(
          { ...next, history: push(s.history, next.sugar) },
          {
            signal: ResponseSignal.Waited,
            payload: { ...next, isNormal: isNormal(next.sugar) },
          },
        );
      },
    }),
    [ResponseAction.SetPancreas]: act({
      describe: "Blood sugar mode: whether the pancreas makes insulin (off: diabetes)",
      byLearner: true,
      args: z.object({ hasInsulin: z.boolean() }).strict(),
      run: (s, a) => set({ hasInsulin: a.hasInsulin, insulin: a.hasInsulin ? s.insulin : 0 }),
    }),
    [ResponseAction.Reset]: act({
      describe: "Start again: calm, sugar normal, no extra insulin",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isScared: false, sugar: SUGAR.rest, insulin: 0, history: [SUGAR.rest] }),
    }),
  },
  signals: {
    [ResponseSignal.Scared]: { describe: "Adrenaline was released after a scare" },
    [ResponseSignal.Calmed]: { describe: "The body calmed down" },
    [ResponseSignal.Ate]: { describe: "A meal was eaten; `sugar` is the new level" },
    [ResponseSignal.Waited]: {
      describe: "Time passed; `sugar`, `insulin` and `isNormal` give the new state",
    },
  },
  observe: (s) => ({
    summary: describeResponse(s),
    elements: [
      {
        id: s.mode === ResponseMode.Adrenaline ? ResponsePart.Body : ResponsePart.Graph,
        value: describeResponse(s),
      },
    ],
  }),
  parts: (s) =>
    s.mode === ResponseMode.Adrenaline
      ? [ResponsePart.Body, ResponsePart.Buttons]
      : [ResponsePart.Graph, ResponsePart.Pancreas, ResponsePart.Buttons],
});
