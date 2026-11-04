import { Actor } from "@chalk/content";
import type { BoardRuntime } from "@chalk/player";
import type { ModelMessage, ToolResultPart } from "ai";
import { z } from "zod";
import { type Request, type ToolSpec, log, runTurn } from "./agent";
import { type Step, played, restored } from "./cases";
import type { Model } from "./model";
import type { Prompt } from "./prompts";
import { changes, checkFound, seen } from "./sees";

/**
 * Jugnu, the one there is (platform/docs/plans/jugnu-sandbox.md, "One Jugnu"): what production's
 * server and the sandbox both call. Given his conversation so far, the student's board and what the
 * student just said or did, he takes his turn: he may try steps on copies of the board, and ends by
 * calling `reply`. He knows nothing of simulations; whoever is in the student's seat is driven by
 * the caller. His conversation is only ever appended to (it is his memory, and what caching keeps).
 */

/** His whole time with one student, as it stands: the messages, and his reply awaiting its answer. */
export type JugnuConversation = {
  messages: ModelMessage[];
  /** His last `reply` (its call), with any results owed for other calls of that response. */
  awaiting: { id: string; name: string; owed: ToolResultPart[] } | null;
};

export const newConversation = (): JugnuConversation => ({ messages: [], awaiting: null });

/** A try on a copy: the steps, from where, and what it showed. */
export type JugnuTry = { steps: Step[]; from: "now" | "start"; saw: unknown };

/** One turn of his: what he said and pointed at, his note, whether he hands back, and how he got there. */
export type JugnuReply = {
  says: string;
  glow: string | null;
  /** What he believes about the student now (never shown to them). */
  note: string;
  /** He thinks they have understood: they do the next question alone. */
  isHandBack: boolean;
  /** Exactly what he was given this turn. */
  given: string;
  thinking: string[];
  tries: JugnuTry[];
  requests: Request[];
};

const stepsSchema = z.array(
  z.object({ prop: z.string(), action: z.string(), args: z.record(z.unknown()).optional() }),
);

/** Every part's address on a board as the student sees it: what a glow may name. */
export const partsOf = (board: BoardRuntime): { part: string; value?: unknown }[] =>
  (seen(board) as { pieces: { parts: { part: string; value?: unknown }[] }[] }).pieces.flatMap(
    (p) => p.parts,
  );

/** What the student brings at the start: their board, what they did on it, their question. */
export const firstTurn = (board: BoardRuntime, steps: readonly Step[], asks: string): string =>
  [
    `Her board, as she sees it now:\n${JSON.stringify(seen(board), null, 1)}`,
    `What she has done on it, in order: ${JSON.stringify(steps)}`,
    `What her board's check found (she doesn't see it): ${JSON.stringify(checkFound(board))}`,
    `Your talk so far:\nShe: ${asks}`,
    "Your turn.",
  ].join("\n\n");

/**
 * What the student brings after one of his replies: what they said, what they did on their board
 * and what it changed, what their check found if they checked, and their board as it now is.
 */
export const laterTurn = (
  board: BoardRuntime,
  before: unknown,
  turn: { says: string; did: readonly Step[] },
): string =>
  [
    `She says: ${turn.says}`,
    turn.did.length === 0
      ? "She did nothing on her board."
      : `She did on her board, in order: ${JSON.stringify(turn.did)}\nWhat it changed: ${JSON.stringify(changes(before, seen(board)))}`,
    ...(turn.did.some((d) => d.action === "check")
      ? [`What her board's check found (she doesn't see it): ${JSON.stringify(checkFound(board))}`]
      : []),
    `Her board, as she sees it now:\n${JSON.stringify(seen(board), null, 1)}`,
  ].join("\n\n");

/** Where a copy stands: each part showing a value, by its address; and the bar. */
const standing = (view: unknown) => {
  const v = view as { pieces: { parts: { part: string; value?: unknown }[] }[]; bar: unknown };
  return {
    parts: Object.fromEntries(
      v.pieces.flatMap((p) => p.parts.filter((x) => "value" in x).map((x) => [x.part, x.value])),
    ),
    bar: v.bar,
  };
};

/**
 * His `try`: stateless. Each call makes a new copy of the board as it is now (or as it starts),
 * plays the steps in order, says where the copy ends up and what changed, and throws it away.
 */
export function tryOn(
  boardPath: string,
  /** The board's state, or how to read it when a try is made. */
  state: unknown,
  /** Where tries are recorded, or how to find the current turn's record. */
  tries: JugnuTry[] | (() => JugnuTry[]),
): ToolSpec {
  const stateNow = () => (typeof state === "function" ? (state as () => unknown)() : state);
  const record = () => (typeof tries === "function" ? tries() : tries);
  return {
    description:
      'Tries steps on a copy of her board, never on her board. Each try makes a NEW copy of her board as it is now (or, with from: "start", as the board starts), plays your steps on it in order, tells you where the copy ends up and what changed, then throws the copy away. Nothing carries over between tries: to see further, send all the steps again, in one try. Steps are what a finger does: {prop, action, args}.',
    input: z.object({ steps: stepsSchema, from: z.enum(["now", "start"]).optional() }),
    run: async (input) => {
      const { steps, from } = input as { steps?: Step[]; from?: "now" | "start" };
      log(`Jugnu tries: ${JSON.stringify(steps)}`);
      const copy =
        from === "start"
          ? await played(boardPath, [])
          : await restored(boardPath, stateNow() as never);
      const before = seen(copy);
      const done: Step[] = [];
      try {
        for (const step of steps ?? []) {
          await copy.call(step.prop, step.action, step.args ?? {}, Actor.Learner);
          copy.settle();
          done.push(step);
        }
      } catch (error) {
        copy.dispose();
        return `Step ${done.length + 1} can't be done: ${error instanceof Error ? error.message : String(error)}`;
      }
      const after = seen(copy);
      copy.dispose();
      const saw = {
        played: `${done.length} step${done.length === 1 ? "" : "s"}, on a new copy of her board ${from === "start" ? "as it starts" : "as it is now"}`,
        endsAt: standing(after),
        changed: changes(before, after),
        questions: (after as { questions: unknown }).questions,
      };
      record().push({ steps: done, from: from === "start" ? "start" : "now", saw });
      return JSON.stringify(saw);
    },
  };
}

/** His `reply`: his one message to the student; calling it ends his turn. */
export const REPLY_TOOL: ToolSpec = {
  description:
    "Speak to her: your words, the one part of her board to light up while you say them (its address as listed in her board's parts), your note (what you believe about her now; she never sees it), and whether you hand back (she has understood and does the next question alone). This ends your turn.",
  input: z.object({
    says: z.string(),
    glow: z.string().nullable().optional(),
    note: z.string(),
    isHandBack: z.boolean().optional(),
  }),
};

/**
 * One turn of Jugnu's. The student's turn (`firstTurn` at the start, `laterTurn` after) joins his
 * conversation, as the answer to his awaiting reply; he thinks, may try, and replies.
 */
export async function jugnuTurn(o: {
  conversation: JugnuConversation;
  model: Model;
  prompt: Prompt;
  /** The lesson as its boards teach it (lessonOf): the same for the whole conversation. */
  lesson: string;
  boardPath: string;
  /** The student's board as it is now. */
  board: BoardRuntime;
  studentTurn: string;
  onRequest?: (r: Request) => void;
}): Promise<JugnuReply> {
  const c = o.conversation;
  if (c.awaiting === null) c.messages.push({ role: "user", content: o.studentTurn });
  else
    c.messages.push({
      role: "tool",
      content: [
        ...c.awaiting.owed,
        {
          type: "tool-result",
          toolCallId: c.awaiting.id,
          toolName: c.awaiting.name,
          output: { type: "text", value: o.studentTurn },
        },
      ],
    });
  const tries: JugnuTry[] = [];
  const his = await runTurn({
    model: o.model,
    instructions: [o.prompt.text, `The lesson, as its boards teach it:\n\n${o.lesson}`],
    messages: c.messages,
    tools: {
      reply: REPLY_TOOL,
      try: tryOn(o.boardPath, () => JSON.parse(JSON.stringify(o.board.state())), tries),
    },
    endsWith: "reply",
    ...(o.onRequest === undefined ? {} : { onRequest: o.onRequest }),
  });
  // Plain words with no reply are his message; the student's next turn then comes as a message.
  c.awaiting =
    his.ended.kind === "tool" ? { id: his.ended.id, name: his.ended.name, owed: his.owed } : null;
  const r = (his.ended.kind === "tool" ? his.ended.input : { says: his.ended.text }) as {
    says?: string;
    glow?: string | null;
    note?: string;
    isHandBack?: boolean;
  };
  return {
    says: String(r.says ?? ""),
    glow: typeof r.glow === "string" && r.glow !== "" ? r.glow : null,
    note: String(r.note ?? ""),
    isHandBack: r.isHandBack === true,
    given: o.studentTurn,
    thinking: his.requests.flatMap((q) => q.thinking),
    tries,
    requests: his.requests,
  };
}
