import { type Box, type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Lateral inversion, front on: Riya stands in front of a big mirror, a word on her T-shirt. In the
 * mirror she is drawn flipped left to right, so the word reads backwards and her raised right hand
 * is the image's left. Printing the word backwards (the ambulance trick) makes the reflection read
 * the right way.
 */

export const LateralWord = { Riya: "RIYA", Ambulance: "AMBULANCE" } as const;
export type LateralWord = (typeof LateralWord)[keyof typeof LateralWord];

export const Hand = { Right: "right", Left: "left", None: "none" } as const;
export type Hand = (typeof Hand)[keyof typeof Hand];

export const Writing = { Normal: "normal", Mirrored: "mirrored" } as const;
export type Writing = (typeof Writing)[keyof typeof Writing];

export const Reads = { Backwards: "backwards", Correctly: "correctly" } as const;
export type Reads = (typeof Reads)[keyof typeof Reads];

export const LateralMirrorAction = {
  SetWord: "setWord",
  Raise: "raise",
  SetWriting: "setWriting",
} as const;
export const LateralMirrorSignal = { Changed: "changed" } as const;
export const LateralMirrorDerived = {
  ReflectionReads: "reflectionReads",
  ReflectionRaises: "reflectionRaises",
} as const;
export const LateralMirrorPart = {
  Riya: "riya",
  Mirror: "mirror",
  Reflection: "reflection",
  Controls: "controls",
} as const;

/** The picture's own size; the view scales it to the width it is given. */
export const LM_PICTURE = { width: 320, height: 180 } as const;
/** Where Riya and her reflection stand (their middle, in picture units), and the mirror's frame. */
export const LM_LAYOUT = {
  riyaX: 88,
  imageX: 240,
  feetY: 170,
  mirror: { x: 168, y: 10, width: 144, height: 162 },
} as const;
/** How tall the controls under the picture are, px (for locate). */
export const LM_CONTROLS_HEIGHT = 92;

const lateralMirrorState = z
  .object({
    word: z.nativeEnum(LateralWord),
    /** Which of Riya's own hands is raised. */
    raised: z.nativeEnum(Hand),
    /** How the word is printed on the T-shirt: normally, or back to front. */
    writing: z.nativeEnum(Writing),
  })
  .strict();
export type LateralMirrorState = z.infer<typeof lateralMirrorState>;

/** How the word reads in the mirror: a mirror swaps left and right, so normal print reads backwards. */
export function reflectionReads(s: Pick<LateralMirrorState, "writing">): Reads {
  return s.writing === Writing.Normal ? Reads.Backwards : Reads.Correctly;
}

/** Which hand the image raises, from its own point of view: the other one. */
export function reflectionRaises(s: Pick<LateralMirrorState, "raised">): Hand {
  return s.raised === Hand.Right ? Hand.Left : s.raised === Hand.Left ? Hand.Right : Hand.None;
}

/** The word as it is printed on the T-shirt (back to front when mirrored). */
export function printed(s: Pick<LateralMirrorState, "word" | "writing">): string {
  return s.writing === Writing.Normal ? s.word : [...s.word].reverse().join("");
}

/** The word as it looks in the mirror. */
export function seenInMirror(s: Pick<LateralMirrorState, "word" | "writing">): string {
  return s.writing === Writing.Normal ? [...s.word].reverse().join("") : s.word;
}

const handWords: Record<Hand, string> = {
  [Hand.Right]: "her right hand raised",
  [Hand.Left]: "her left hand raised",
  [Hand.None]: "both hands down",
};

const act = actionsFor<LateralMirrorState>();
const changed = (next: LateralMirrorState) => ({
  signal: LateralMirrorSignal.Changed,
  payload: { word: next.word, raised: next.raised, writing: next.writing },
});

export const lateralMirror = defineProp({
  type: "lateralMirror",
  describe:
    "Lateral inversion: Riya stands in front of a big mirror with a word on her T-shirt and can raise a hand. Her reflection is flipped left to right: the word reads backwards and a raised right hand is the image's left. The word can be printed back to front (the ambulance trick), so that the reflection reads correctly.",
  state: lateralMirrorState,
  defaults: { word: LateralWord.Riya, raised: Hand.None, writing: Writing.Normal },
  inputs: [],
  derived: {
    [LateralMirrorDerived.ReflectionReads]: {
      describe: "How the word on the T-shirt reads in the mirror: backwards or correctly",
      compute: (s) => reflectionReads(s),
    },
    [LateralMirrorDerived.ReflectionRaises]: {
      describe:
        "Which hand the image raises, from the image's own point of view (left, right or none)",
      compute: (s) => reflectionRaises(s),
    },
  },
  actions: {
    [LateralMirrorAction.SetWord]: act({
      describe: "Put a word on Riya's T-shirt (RIYA or AMBULANCE)",
      byLearner: true,
      args: z.object({ word: z.nativeEnum(LateralWord) }).strict(),
      run: (s, a) => set({ word: a.word }, changed({ ...s, word: a.word })),
    }),
    [LateralMirrorAction.Raise]: act({
      describe: "Riya raises her right or left hand (her own), or puts both down",
      byLearner: true,
      args: z.object({ hand: z.nativeEnum(Hand) }).strict(),
      run: (s, a) => set({ raised: a.hand }, changed({ ...s, raised: a.hand })),
    }),
    [LateralMirrorAction.SetWriting]: act({
      describe:
        "Print the word normally, or back to front (mirrored) so that it reads correctly in the mirror",
      byLearner: true,
      args: z.object({ writing: z.nativeEnum(Writing) }).strict(),
      run: (s, a) => set({ writing: a.writing }, changed({ ...s, writing: a.writing })),
    }),
  },
  signals: {
    [LateralMirrorSignal.Changed]: {
      describe:
        "The learner changed the word, the hand or the printing; the payload is the new state",
    },
  },
  observe: (s) => {
    const image = reflectionRaises(s);
    const elements: Element[] = [
      {
        id: LateralMirrorPart.Riya,
        value: `Riya, facing the mirror, ${handWords[s.raised]}; her T-shirt says ${printed(s)}${s.writing === Writing.Mirrored ? " (printed back to front)" : ""}`,
      },
      { id: LateralMirrorPart.Mirror, value: "a big plane mirror, upright" },
      {
        id: LateralMirrorPart.Reflection,
        value: `her image, flipped left to right: the word reads ${seenInMirror(s)} (${reflectionReads(s)})${image === Hand.None ? "" : `, and the image raises its ${image} hand`}`,
      },
      {
        id: LateralMirrorPart.Controls,
        value: "buttons to change the word, raise a hand and print the word back to front",
      },
    ];
    const summary = `Riya in front of a mirror with ${s.word} on her T-shirt${s.writing === Writing.Mirrored ? " printed back to front" : ""}, ${handWords[s.raised]}; in the mirror the word reads ${reflectionReads(s)}${image === Hand.None ? "" : ` and the image raises its ${image} hand`}`;
    return { summary, elements };
  },
  parts: () => [
    LateralMirrorPart.Riya,
    LateralMirrorPart.Mirror,
    LateralMirrorPart.Reflection,
    LateralMirrorPart.Controls,
  ],
  locate: (_s, part, width): Box | undefined => {
    const k = width / LM_PICTURE.width;
    const height = Math.round(LM_PICTURE.height * k);
    const figure = (x: number): Box => ({
      x: (x - 40) * k,
      y: 20 * k,
      width: 80 * k,
      height: (LM_LAYOUT.feetY - 16) * k,
    });
    if (part === LateralMirrorPart.Riya) return figure(LM_LAYOUT.riyaX);
    if (part === LateralMirrorPart.Reflection) return figure(LM_LAYOUT.imageX);
    if (part === LateralMirrorPart.Mirror) {
      const m = LM_LAYOUT.mirror;
      return { x: m.x * k, y: m.y * k, width: m.width * k, height: m.height * k };
    }
    if (part === LateralMirrorPart.Controls)
      return { x: 0, y: height, width, height: LM_CONTROLS_HEIGHT };
    return undefined;
  },
});
