import { createHash } from "node:crypto";
import { and, asc, count, eq, isNull, lt } from "drizzle-orm";
import type { Db } from "./db";
import {
  ConversationEnd,
  type GotThere,
  TurnKind,
  jugnuConversations,
  jugnuMessages,
  jugnuReflections,
  jugnuTurns,
  texts,
} from "./schema";

/**
 * Jugnu's side of each conversation, kept (platform/docs/plans/teacher-view.md, raw): a
 * conversation is found by its account and board opening while it hasn't ended; each turn appends
 * its turn and messages and moves the cursor; ending is once. Everything here is the server's own:
 * nothing of it is ever sent to the phone.
 */

/** A conversation as Jugnu is given it to go on (the studio's LiveConversation). */
export type KeptConversation = {
  model: { provider: string; id: string };
  prompt: { seat: string; name: string; hash: string; text: string };
  lesson: string;
  messages: unknown[];
  cursor: unknown;
};

/** Where a turn happened: the board's opening, its id and version, and the build. */
export type TurnPlace = {
  accountId: string;
  opening: string;
  board: string;
  version: string;
  commit: string;
};

/** What a turn of Jugnu's gives back to keep. */
export type TurnDone = {
  conversation: KeptConversation;
  added: unknown[];
  requests: unknown[];
  ms: number;
};

const sha = (words: string) => createHash("sha256").update(words).digest("hex");

/** The conversation going on at this opening (not ended), with all it needs to go on. */
export async function openConversation(
  db: Db,
  place: TurnPlace,
): Promise<{ id: string; kept: KeptConversation } | undefined> {
  const [row] = await db
    .select()
    .from(jugnuConversations)
    .where(
      and(
        eq(jugnuConversations.accountId, place.accountId),
        eq(jugnuConversations.opening, place.opening),
        eq(jugnuConversations.board, place.board),
        isNull(jugnuConversations.endedAt),
      ),
    )
    .limit(1);
  if (row === undefined) return undefined;
  return { id: row.id, kept: await keptOf(db, row) };
}

/** A conversation by its id (ended or not), to reflect on: what it needs to go on, and its place. */
export async function conversationById(
  db: Db,
  id: string,
): Promise<{ kept: KeptConversation; endedAt: Date | null } | undefined> {
  const [row] = await db.select().from(jugnuConversations).where(eq(jugnuConversations.id, id));
  return row === undefined ? undefined : { kept: await keptOf(db, row), endedAt: row.endedAt };
}

async function keptOf(
  db: Db,
  row: typeof jugnuConversations.$inferSelect,
): Promise<KeptConversation> {
  const textOf = async (hash: string) =>
    (await db.select().from(texts).where(eq(texts.hash, hash)))[0]?.text ?? "";
  const messages = await db
    .select({ message: jugnuMessages.message })
    .from(jugnuMessages)
    .where(eq(jugnuMessages.conversationId, row.id))
    .orderBy(asc(jugnuMessages.n));
  return {
    model: { provider: row.provider, id: row.model },
    prompt: {
      seat: "tutor",
      name: row.promptName,
      hash: row.promptHash,
      text: await textOf(row.promptText),
    },
    lesson: await textOf(row.lessonText),
    messages: messages.map((m) => m.message),
    cursor: row.cursor,
  };
}

/** Appends a turn's messages to a conversation, as turn n (the next): its id. */
async function appendTurn(
  tx: Parameters<Parameters<Db["transaction"]>[0]>[0],
  conversationId: string,
  kind: TurnKind,
  done: { added: unknown[]; requests: unknown[]; ms: number },
  from: number,
  at: Date,
): Promise<string> {
  const [turns] = await tx
    .select({ n: count() })
    .from(jugnuTurns)
    .where(eq(jugnuTurns.conversationId, conversationId));
  const [turn] = await tx
    .insert(jugnuTurns)
    .values({
      conversationId,
      n: turns?.n ?? 0,
      kind,
      at,
      ms: Math.round(done.ms),
      requests: done.requests,
    })
    .returning({ id: jugnuTurns.id });
  if (turn === undefined) throw new Error("Couldn't keep the turn");
  if (done.added.length > 0)
    await tx
      .insert(jugnuMessages)
      .values(
        done.added.map((message, i) => ({ conversationId, n: from + i, turnId: turn.id, message })),
      );
  return turn.id;
}

/** Keeps a turn: the conversation (new, or the one going on), the turn, its messages, the cursor. */
export async function keepTurn(
  db: Db,
  place: TurnPlace,
  going: string | undefined,
  done: TurnDone,
  now: number,
): Promise<{ conversation: string; turn: string }> {
  const at = new Date(now);
  return db.transaction(async (tx) => {
    let id = going;
    if (id === undefined) {
      const { prompt, lesson, model } = done.conversation;
      const promptText = sha(prompt.text);
      const lessonText = sha(lesson);
      await tx
        .insert(texts)
        .values([
          { hash: promptText, text: prompt.text },
          { hash: lessonText, text: lesson },
        ])
        .onConflictDoNothing();
      const [made] = await tx
        .insert(jugnuConversations)
        .values({
          ...place,
          provider: model.provider,
          model: model.id,
          promptName: prompt.name,
          promptHash: prompt.hash,
          promptText,
          lessonText,
          startedAt: at,
          lastTurnAt: at,
        })
        .returning({ id: jugnuConversations.id });
      if (made === undefined) throw new Error("Couldn't keep the conversation");
      id = made.id;
    }
    const conversationId = id;
    // The messages before this turn's are those already kept: this turn's follow them.
    const from = done.conversation.messages.length - done.added.length;
    const turn = await appendTurn(tx, conversationId, TurnKind.Reply, done, from, at);
    await tx
      .update(jugnuConversations)
      .set({ lastTurnAt: at, cursor: done.conversation.cursor })
      .where(eq(jugnuConversations.id, conversationId));
    return { conversation: conversationId, turn };
  });
}

/**
 * Ends a conversation, once: true if this ended it (false if it had already ended). Its cursor
 * stays until he has reflected on it.
 */
export async function endConversation(
  db: Db,
  id: string,
  by: ConversationEnd,
  now: number,
): Promise<boolean> {
  const ended = await db
    .update(jugnuConversations)
    .set({ endedAt: new Date(now), endedBy: by })
    .where(and(eq(jugnuConversations.id, id), isNull(jugnuConversations.endedAt)))
    .returning({ id: jugnuConversations.id });
  return ended.length > 0;
}

/** Ends every conversation with no turn since `before`; their ids. */
export async function endQuiet(db: Db, before: number, now: number): Promise<string[]> {
  const ended = await db
    .update(jugnuConversations)
    .set({ endedAt: new Date(now), endedBy: ConversationEnd.Quiet })
    .where(
      and(isNull(jugnuConversations.endedAt), lt(jugnuConversations.lastTurnAt, new Date(before))),
    )
    .returning({ id: jugnuConversations.id });
  return ended.map((r) => r.id);
}

/** What a reflect step gives back to keep. */
export type ReflectionDone = {
  points: string[];
  gotThere: GotThere;
  prompt: { name: string; hash: string; text: string };
  model: string;
  added: unknown[];
  requests: unknown[];
  ms: number;
};

/** Whether a conversation has been reflected on. */
export async function hasReflection(db: Db, conversationId: string): Promise<boolean> {
  const [r] = await db
    .select({ id: jugnuReflections.id })
    .from(jugnuReflections)
    .where(eq(jugnuReflections.conversationId, conversationId))
    .limit(1);
  return r !== undefined;
}

/**
 * Keeps his reflection on an ended conversation: the reflect turn and its messages appended to the
 * conversation's record, the reflection with what made it, and the cursor dropped (nothing goes on
 * from it now). Its id.
 */
export async function keepReflection(
  db: Db,
  conversationId: string,
  messagesBefore: number,
  done: ReflectionDone,
  now: number,
): Promise<string> {
  const at = new Date(now);
  return db.transaction(async (tx) => {
    const promptText = sha(done.prompt.text);
    await tx
      .insert(texts)
      .values({ hash: promptText, text: done.prompt.text })
      .onConflictDoNothing();
    const turnId = await appendTurn(tx, conversationId, TurnKind.Reflect, done, messagesBefore, at);
    const [made] = await tx
      .insert(jugnuReflections)
      .values({
        conversationId,
        turnId,
        at,
        promptName: done.prompt.name,
        promptHash: done.prompt.hash,
        promptText,
        model: done.model,
        points: done.points,
        gotThere: done.gotThere,
      })
      .returning({ id: jugnuReflections.id });
    await tx
      .update(jugnuConversations)
      .set({ cursor: null })
      .where(eq(jugnuConversations.id, conversationId));
    if (made === undefined) throw new Error("Couldn't keep the reflection");
    return made.id;
  });
}
