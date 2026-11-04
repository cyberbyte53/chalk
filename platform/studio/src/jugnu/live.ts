import { existsSync } from "node:fs";
import { join } from "node:path";
import { PointKind, updatePointSchema } from "@chalk/learning";
import type { RuntimeState } from "@chalk/player";
import type { ModelMessage } from "ai";
import { z } from "zod";
import { type Request, runTurn } from "./agent";
import { type Step, restored } from "./cases";
import {
  type GotThere,
  type JugnuConversation,
  firstTurn,
  jugnuReflect,
  jugnuTurn,
  laterTurn,
} from "./jugnu";
import { type Provider, modelOf, settingsForChoice } from "./model";
import { type Prompt, Seat, committedJugnu, promptOf } from "./prompts";
import { lessonOf, root, seen } from "./sees";
import { type Judged, type UpdateInput, realEvidence } from "./sets";

/**
 * Jugnu, live (platform/docs/plans/jugnu-live.md, teacher-view.md): one turn for a student on a
 * real board. It keeps nothing: it is given the conversation so far (none, the first time) and
 * gives back the conversation as it now is, and what is new in it, for its keeper (the server's
 * database; the dev service's memory) to save. A conversation keeps what it started with: its
 * model, its prompt and its lesson, whatever is committed later. The board is restored from the
 * state the phone sends. The model's key stays here.
 */

export type LiveTurn = {
  /** The board's opening: his conversation is this opening's. */
  session: string;
  board: string;
  state: RuntimeState;
  /** What they did on the board since his last reply (or since it opened, the first time). */
  did: Step[];
  /** What they said: typed, a tapped choice, or Get help's "Why is it wrong?". */
  said: string;
};

export type LiveReply = {
  says: string;
  glow: string | null;
  choices: string[];
  isHandBack: boolean;
  model: string;
};

/** Where a conversation stands, to go on from (working state, not the record: overwritten each turn). */
export type LiveCursor = {
  /** His `reply` awaiting its answer, and what else it is owed. */
  awaiting: JugnuConversation["awaiting"];
  /** The board as the student saw it after his last reply (to tell him what changed). */
  lastSeen: unknown;
  /** Everything they did so far. */
  steps: Step[];
};

/** A conversation with Jugnu: what it runs on, its messages, and where it stands. */
export type LiveConversation = {
  model: { provider: Provider; id: string };
  prompt: Prompt;
  lesson: string;
  messages: ModelMessage[];
  cursor: LiveCursor;
};

export type LiveTurnDone = {
  reply: LiveReply;
  /** The conversation after this turn (to go on from). */
  conversation: LiveConversation;
  /** The messages this turn added, in order (for the record). */
  added: ModelMessage[];
  /** His requests this turn (their usage and timing, for the record). */
  requests: Request[];
  ms: number;
};

const lessons = new Map<string, string>();
// The repo's .env, on a laptop; on chalk1 the keys are already in the environment (compose).
const envFile = join(root, ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

/** A new conversation on a board: the committed Jugnu's model and prompt, the board's lesson. */
async function started(board: string): Promise<LiveConversation> {
  const committed = committedJugnu();
  let lesson = lessons.get(board);
  if (lesson === undefined) {
    lesson = await lessonOf(board);
    lessons.set(board, lesson);
  }
  return {
    model: { provider: committed.provider as Provider, id: committed.model },
    prompt: promptOf(Seat.Tutor, committed.prompt),
    lesson,
    messages: [],
    cursor: { awaiting: null, lastSeen: undefined, steps: [] },
  };
}

/** One turn of Jugnu's, on the conversation given (or a new one). */
export async function liveTurn(t: LiveTurn, given?: LiveConversation): Promise<LiveTurnDone> {
  const began = Date.now();
  const c = given ?? (await started(t.board));
  // Its own copies: what was given stays as it was.
  const conversation: JugnuConversation = {
    messages: [...c.messages],
    awaiting: c.cursor.awaiting,
  };
  const steps = [...c.cursor.steps, ...t.did];
  const board = await restored(t.board, t.state);
  try {
    const model = modelOf(settingsForChoice(c.model));
    const studentTurn =
      c.cursor.lastSeen === undefined
        ? firstTurn(board, steps, t.said)
        : laterTurn(board, c.cursor.lastSeen, { says: t.said, did: t.did });
    const before = conversation.messages.length;
    const his = await jugnuTurn({
      conversation,
      model,
      prompt: c.prompt,
      lesson: c.lesson,
      boardPath: t.board,
      board,
      studentTurn,
    });
    return {
      reply: {
        says: his.says,
        glow: his.glow,
        choices: his.choices,
        isHandBack: his.isHandBack,
        model: model.name,
      },
      conversation: {
        ...c,
        messages: conversation.messages,
        cursor: { awaiting: conversation.awaiting, lastSeen: seen(board), steps },
      },
      added: conversation.messages.slice(before),
      requests: his.requests,
      ms: Date.now() - began,
    };
  } finally {
    board.dispose();
  }
}

export type LiveReflectionDone = {
  points: string[];
  gotThere: GotThere;
  /** The reflect prompt it was asked with, and the model that answered. */
  prompt: Prompt;
  model: string;
  /** The messages the reflect step added to the conversation (for the record). */
  added: ModelMessage[];
  requests: Request[];
  ms: number;
};

/**
 * His reflection on a conversation that is over (teacher-view.md, layer 1): the same conversation
 * (its model, prompt and lesson) asked one more thing, by the committed reflect prompt.
 */
export async function liveReflect(c: LiveConversation, board: string): Promise<LiveReflectionDone> {
  const began = Date.now();
  const conversation: JugnuConversation = {
    messages: [...c.messages],
    awaiting: c.cursor.awaiting,
  };
  const before = conversation.messages.length;
  const model = modelOf(settingsForChoice(c.model));
  const reflectPrompt = promptOf(Seat.Reflect, committedJugnu().reflect);
  const his = await jugnuReflect({
    conversation,
    model,
    prompt: c.prompt,
    lesson: c.lesson,
    boardPath: board,
    reflectPrompt,
  });
  return {
    points: his.points,
    gotThere: his.gotThere,
    prompt: reflectPrompt,
    model: model.name,
    added: conversation.messages.slice(before),
    requests: his.requests,
    ms: Date.now() - began,
  };
}

/**
 * The learner update's judgement (teacher-view.md, step 3): the committed model, by the committed
 * update prompt, given the state before, the set and what happened; it answers by its `update`
 * tool. Its evidence is kept only where it names what it was given.
 */
export async function liveJudge(input: UpdateInput): Promise<Judged> {
  const committed = committedJugnu();
  const model = modelOf(
    settingsForChoice({ provider: committed.provider as Provider, id: committed.model }),
  );
  const prompt = promptOf(Seat.Update, committed.update);
  const messages: ModelMessage[] = [{ role: "user", content: JSON.stringify(input, null, 1) }];
  const his = await runTurn({
    model,
    instructions: [prompt.text],
    messages,
    tools: {
      update: {
        description:
          "What this set shows about them, for their teacher: each point one short sentence, how much it needs the teacher (kind), the mistake in a few words (or null), one next step for the teacher (or null), and the questions (board ids) and reflections (ids) it rests on.",
        input: z.object({
          points: z
            .array(
              z.object({
                text: z.string(),
                kind: z.nativeEnum(PointKind),
                mistake: z.string().nullable(),
                next: z.string().nullable(),
                questions: z.array(z.string()),
                reflections: z.array(z.string()),
              }),
            )
            .max(6),
        }),
      },
    },
    endsWith: "update",
  });
  // What the tool was called with, read as points (a malformed one is left out).
  const said = his.ended.kind === "tool" ? (his.ended.input as { points?: unknown[] }).points : [];
  const points = (said ?? []).flatMap((p) => {
    const parsed = updatePointSchema.safeParse(p);
    return parsed.success ? [parsed.data] : [];
  });
  return {
    points: realEvidence(
      points.filter((p) => p.text.trim() !== ""),
      input,
    ),
    prompt,
    model: model.name,
    requests: his.requests,
  };
}
