import type { LlmProvider } from "@chalk/jugnu";
import { z } from "zod";
import type { EvalCase } from "./cases";

/** A stronger model's verdict on one reply: what a script can't check. */
export const verdictSchema = z.object({
  /** Every maths or science statement in the reply is true. */
  isCorrect: z.boolean(),
  /** The reply (or what it did on the board) hands the student the answer to the board's question. */
  givesAnswerAway: z.boolean(),
  /** 1 (just tells) to 5 (one good guiding step that gets the student thinking). */
  guidance: z.number().int().min(1).max(5),
  /** 1 (cold or preachy) to 5 (warm, encouraging, natural for a 14-year-old). */
  warmth: z.number().int().min(1).max(5),
  /** 1 (broken or stiff) to 5 (natural, like a good teacher in that language). */
  language: z.number().int().min(1).max(5),
  /** One sentence: the biggest problem, or what was good. */
  note: z.string(),
});
export type Verdict = z.infer<typeof verdictSchema>;

const VERDICT_JSON_SCHEMA = {
  type: "object",
  properties: {
    isCorrect: { type: "boolean" },
    givesAnswerAway: { type: "boolean" },
    guidance: { type: "integer", minimum: 1, maximum: 5 },
    warmth: { type: "integer", minimum: 1, maximum: 5 },
    language: { type: "integer", minimum: 1, maximum: 5 },
    note: { type: "string" },
  },
  required: ["isCorrect", "givesAnswerAway", "guidance", "warmth", "language", "note"],
} as const;

/** Asks the judge model to grade one conversation. Returns undefined if its answer can't be read. */
export async function judge(
  judgeModel: LlmProvider,
  testCase: EvalCase,
  board: string,
  conversation: string,
): Promise<Verdict | undefined> {
  const content = [
    "You are grading an AI tutor called Jugnu, who helps Indian school students (classes 8 to 10) on an interactive lesson board. He can act on the board, point at things, use a calculator, and hand the board back to the student.",
    "Jugnu must guide the student to think, giving the least help that works, and never hand over the answer to the board's question: not in words, not by elimination, and not by putting the board into the answer. He must be correct, short, warm, and reply in the student's language. After real effort from the student he may walk through it more directly, but the student still makes the final move.",
    "",
    "The board when the student first asked (JSON; fields under notOnScreen are hidden from the student):",
    board,
    "",
    `The conversation (student's language: ${testCase.locale === "hi" ? "Hindi" : "English"}):`,
    conversation,
    "",
    `What good help does here: ${testCase.good}`,
    "",
    "Grade Jugnu over the whole conversation. Reply with JSON only, with these fields: isCorrect (every maths/science statement is true), givesAnswerAway (his words or board actions hand the student the answer), guidance 1-5, warmth 1-5, language 1-5, note (one sentence).",
  ].join("\n");
  const text = await judgeModel.complete({
    messages: [{ role: "user", content }],
    schema: VERDICT_JSON_SCHEMA,
  });
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) return undefined;
  try {
    const parsed = verdictSchema.safeParse(JSON.parse(text.slice(start, end + 1)));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

// ---- whole conversations ----

export const HelpRung = {
  None: "none",
  Ask: "ask",
  Hint: "hint",
  Point: "point",
  Show: "show",
  Tell: "tell",
} as const;
export type HelpRung = (typeof HelpRung)[keyof typeof HelpRung];

/** The judge's read of one whole conversation with a simulated student. */
export const conversationVerdictSchema = z.object({
  /** Jugnu (in words or on the board) handed over the answer to the board's question. */
  gaveAnswerAway: z.boolean(),
  /** Every maths or science statement Jugnu made is true. */
  isCorrect: z.boolean(),
  /** The student's final explanation shows the right understanding, not just the answer. */
  isMisconceptionFixed: z.boolean(),
  /** The student did the reasoning and the final move themselves. */
  didStudentDoTheWork: z.boolean(),
  /** The most help Jugnu gave in any turn, on the ladder ask < hint < point < show < tell. */
  highestRung: z.nativeEnum(HelpRung),
  /** Jugnu said more than the moment needed. */
  isTooMuchTalk: z.boolean(),
  /** Jugnu used the board (pointing, showing, handing back) where it helped, and not where it didn't. */
  boardUse: z.number().int().min(1).max(5),
  /** Would a 14-year-old feel helped, not lectured or stonewalled? */
  experience: z.number().int().min(1).max(5),
  /** One or two sentences: the biggest problem, or what was good. */
  note: z.string(),
});
export type ConversationVerdict = z.infer<typeof conversationVerdictSchema>;

const CONVERSATION_JSON_SCHEMA = {
  type: "object",
  properties: {
    gaveAnswerAway: { type: "boolean" },
    isCorrect: { type: "boolean" },
    isMisconceptionFixed: { type: "boolean" },
    didStudentDoTheWork: { type: "boolean" },
    highestRung: { type: "string", enum: Object.values(HelpRung) },
    isTooMuchTalk: { type: "boolean" },
    boardUse: { type: "integer", minimum: 1, maximum: 5 },
    experience: { type: "integer", minimum: 1, maximum: 5 },
    note: { type: "string" },
  },
  required: [
    "gaveAnswerAway",
    "isCorrect",
    "isMisconceptionFixed",
    "didStudentDoTheWork",
    "highestRung",
    "isTooMuchTalk",
    "boardUse",
    "experience",
    "note",
  ],
} as const;

/** Asks the judge to grade a whole conversation. Undefined if its answer can't be read. */
export async function judgeConversation(
  judgeModel: LlmProvider,
  input: {
    student: { belief: string; understanding: string; locale: string };
    withJugnu: boolean;
    board: string;
    conversation: string;
    outcome: string;
    explanation: string;
  },
): Promise<ConversationVerdict | undefined> {
  const content = [
    "You are grading a learning session in an app for Indian school students (classes 8 to 10). A student (played by an AI, with a set misconception) works on a question board.",
    input.withJugnu
      ? "Jugnu is the app's AI tutor. He should help the student reason their own way to the answer with the least help that works (ask < hint < point at something < show on the board < tell, walking through it only after real effort), never hand over the answer to the board's question in words, by elimination or by putting the board into the answer, answer genuine questions directly, use the board where it helps, and say little: one or two short sentences, one idea at a time, in the student's language."
      : "There is no tutor in this session (a baseline): judge the student's outcome; for the Jugnu-only fields answer as if he did nothing (gaveAnswerAway false, isCorrect true, highestRung none, isTooMuchTalk false, boardUse 3).",
    "",
    "The board at the start (JSON; the student can't see fields under notOnScreen, nor the rules):",
    input.board,
    "",
    `The student's misconception at the start: ${input.student.belief}`,
    `The right understanding: ${input.student.understanding}`,
    "",
    "The session:",
    input.conversation,
    "",
    `How it ended: ${input.outcome}`,
    `The student's explanation afterwards, in their own words: ${input.explanation || "(none)"}`,
    "",
    "Grade it. Reply with JSON only, with these fields: gaveAnswerAway, isCorrect (all of Jugnu's maths/science true), isMisconceptionFixed (the explanation shows the right understanding), didStudentDoTheWork, highestRung (none|ask|hint|point|show|tell), isTooMuchTalk, boardUse 1-5, experience 1-5 (would a 14-year-old feel helped, not lectured or stonewalled), note (one or two sentences).",
  ].join("\n");
  const text = await judgeModel.complete({
    messages: [{ role: "user", content }],
    schema: CONVERSATION_JSON_SCHEMA,
  });
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) return undefined;
  try {
    const parsed = conversationVerdictSchema.safeParse(JSON.parse(text.slice(start, end + 1)));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}
