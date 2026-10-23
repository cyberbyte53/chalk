import { z } from "zod";

/**
 * What Jugnu sends the phone at the end of a turn: his reply, as cues to play in order. He worked
 * it out on the server, on a copy of the board (trying things, undoing, calculating); only what he
 * kept is here. The phone plays each cue: words into the chat, a prop glowing, an action through
 * its own door as Jugnu, options to tap, or the board handed back.
 */
export const CueKind = {
  Say: "say",
  Point: "point",
  Act: "act",
  Ask: "ask",
} as const;
export type CueKind = (typeof CueKind)[keyof typeof CueKind];

/** Most options he may offer at once, and how long one may be. */
export const MAX_OPTIONS = 4;
export const OPTION_MAX = 80;

export const cueSchema = z.discriminatedUnion("kind", [
  /** Words in the chat. */
  z
    .object({ kind: z.literal(CueKind.Say), text: z.string().min(1) })
    .strict(),
  /** A prop, or one named part of it, glows gently while his words around it show. */
  z
    .object({
      kind: z.literal(CueKind.Point),
      prop: z.string().min(1),
      part: z.string().optional(),
    })
    .strict(),
  /** One of a prop's actions, run on the phone's board through the one door as Jugnu. */
  z
    .object({
      kind: z.literal(CueKind.Act),
      prop: z.string().min(1),
      action: z.string().min(1),
      args: z.record(z.string(), z.unknown()),
    })
    .strict(),
  /** A question with options to tap; the student's tap (or anything they type) is the next turn. */
  z
    .object({
      kind: z.literal(CueKind.Ask),
      question: z.string().min(1),
      options: z.array(z.string().min(1).max(OPTION_MAX)).min(2).max(MAX_OPTIONS),
    })
    .strict(),
]);
export type Cue = z.infer<typeof cueSchema>;

/**
 * Notes for Jugnu that the lesson writes on a board, in plain English: what the board is for, and
 * what each prop stands for on it ("line": "the student's guess for √2"). Optional; without them he
 * works it out from the props and rules.
 */
export const jugnuNotesSchema = z
  .object({
    purpose: z.string().min(1).optional(),
    props: z.record(z.string(), z.string().min(1)).optional(),
  })
  .strict();
export type JugnuNotes = z.infer<typeof jugnuNotesSchema>;

/** What starts one of Jugnu's turns: the student typed, or tapped one of his options. */
export const TurnInputKind = { Typed: "typed", Chose: "chose" } as const;
export type TurnInputKind = (typeof TurnInputKind)[keyof typeof TurnInputKind];

/**
 * Something the student held on the board to ask about: a prop, or one part of it (an element id
 * from its observation, the same names Jugnu points with), and the words where they held it, if any.
 */
export const aboutSchema = z
  .object({
    prop: z.string().min(1),
    part: z.string().min(1).optional(),
    text: z.string().min(1).max(200).optional(),
  })
  .strict();
export type About = z.infer<typeof aboutSchema>;

export const turnInputSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal(TurnInputKind.Typed),
      text: z.string().min(1).max(2000),
      /** What they picked on the board to ask about; their question is about these. */
      about: z.array(aboutSchema).max(8).optional(),
    })
    .strict(),
  z
    .object({ kind: z.literal(TurnInputKind.Chose), option: z.string().min(1).max(OPTION_MAX) })
    .strict(),
]);
export type TurnInput = z.infer<typeof turnInputSchema>;
