import { existsSync } from "node:fs";
import { join } from "node:path";
import type { RuntimeState } from "@chalk/player";
import { generateText } from "ai";
import { type Step, restored } from "./cases";
import { type JugnuConversation, firstTurn, jugnuTurn, laterTurn, newConversation } from "./jugnu";
import { modelOf, settingsForChoice } from "./model";
import { Seat, committedJugnu, promptOf } from "./prompts";
import { lessonOf, root, seen } from "./sees";

/**
 * Jugnu, live (platform/docs/plans/jugnu-live.md): one turn for a student on a real board, as a
 * phone (or the preview) asks it. The browser keeps the board and its events; it sends the board's
 * path, its state now (once settled), what the student did since his last reply (as steps), and what
 * they said. Here: the committed Jugnu (prompts/jugnu.yaml), his conversation kept per session, the
 * board restored from its state, his turn (jugnu.ts) and his reply. The model's key stays here.
 * The dev service serves it now; chalk1's server calls the same function behind sign-in.
 */

export type LiveTurn = {
  /** One student's time on one opening of a board. */
  session: string;
  board: string;
  state: RuntimeState;
  /** What they did on the board since his last reply (or since it opened, the first time). */
  did: Step[];
  /** What they said: typed, a tapped choice, "" for Done, or Get help's "Why is it wrong?". */
  said: string;
};

export type LiveReply = {
  says: string;
  glow: string | null;
  choices: string[];
  isHandBack: boolean;
  model: string;
};

type Session = {
  conversation: JugnuConversation;
  /** The board as the student saw it after his last reply (to tell him what changed). */
  lastSeen: unknown;
  /** Everything they did so far (the first turn tells him). */
  steps: Step[];
  isBusy: boolean;
  at: number;
  /** The conversation as plain lines (what they did and said, what he said): its note is written from it. */
  talk: string[];
  /** His working belief after his last turn (for the note's writer to weigh, not to copy). */
  lastNote: string;
};

const sessions = new Map<string, Session>();
const lessons = new Map<string, string>();
const HOUR = 60 * 60 * 1000;
// The repo's .env, on a laptop; on chalk1 the keys are already in the environment (compose).
const envFile = join(root, ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

/** One turn of the committed Jugnu for a live student. */
export async function liveTurn(t: LiveTurn): Promise<LiveReply> {
  for (const [key, s] of sessions) if (Date.now() - s.at > HOUR) sessions.delete(key);
  const session = sessions.get(t.session) ?? {
    conversation: newConversation(),
    lastSeen: undefined,
    steps: [],
    isBusy: false,
    at: Date.now(),
    talk: [],
    lastNote: "",
  };
  if (session.isBusy) throw new Error("Jugnu is still answering the last message");
  session.isBusy = true;
  session.at = Date.now();
  sessions.set(t.session, session);
  let board: Awaited<ReturnType<typeof restored>> | undefined;
  try {
    board = await restored(t.board, t.state);
    const committed = committedJugnu();
    const model = modelOf(
      settingsForChoice({ provider: committed.provider as never, id: committed.model }),
    );
    const prompt = promptOf(Seat.Tutor, committed.prompt);
    let lesson = lessons.get(t.board);
    if (lesson === undefined) {
      lesson = await lessonOf(t.board);
      lessons.set(t.board, lesson);
    }
    session.steps.push(...t.did);
    const studentTurn =
      session.lastSeen === undefined
        ? firstTurn(board, session.steps, t.said)
        : laterTurn(board, session.lastSeen, { says: t.said, did: t.did });
    const his = await jugnuTurn({
      conversation: session.conversation,
      model,
      prompt,
      lesson,
      boardPath: t.board,
      board,
      studentTurn,
    });
    session.lastSeen = seen(board);
    for (const s of t.did) session.talk.push(`Child did on the board: ${stepText(s)}`);
    if (t.said !== "") session.talk.push(`Child: ${t.said}`);
    session.talk.push(`Jugnu: ${his.says}`);
    session.lastNote = his.note;
    return {
      says: his.says,
      glow: his.glow,
      choices: his.choices,
      isHandBack: his.isHandBack,
      model: model.name,
    };
  } finally {
    session.isBusy = false;
    board?.dispose();
  }
}

const stepText = (s: Step): string =>
  `${s.action} on ${s.prop}${s.args === undefined ? "" : ` ${JSON.stringify(s.args)}`}`;

/**
 * Ends a conversation (platform/docs/plans/teacher-view.md): its note for the teacher, written once
 * from the whole of it (what the child isn't good at yet, and whether they got there), by the
 * committed notes prompt and model. Undefined when he never answered, or it is already ended.
 */
export async function endConversation(key: string): Promise<string | undefined> {
  const session = sessions.get(key);
  sessions.delete(key);
  if (session === undefined || !session.talk.some((l) => l.startsWith("Jugnu: "))) return undefined;
  const committed = committedJugnu();
  const model = modelOf(
    settingsForChoice({ provider: committed.provider as never, id: committed.model }),
  );
  const r = await generateText({
    model: model.model,
    instructions: model.instructions([promptOf(Seat.Notes, committed.notes).text]),
    messages: [
      {
        role: "user",
        content: `${session.talk.join("\n")}\n\n(Jugnu's own last working note: ${session.lastNote || "none"})`,
      },
    ],
    maxRetries: 1,
    providerOptions: model.options,
  });
  const text = r.text.trim();
  return text === "" ? undefined : text;
}
