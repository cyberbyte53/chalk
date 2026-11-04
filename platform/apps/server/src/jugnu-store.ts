import { createHash } from "node:crypto";
import { and, asc, count, eq, isNull, lt } from "drizzle-orm";
import type { Db } from "./db";
import { ConversationEnd, jugnuConversations, jugnuMessages, jugnuTurns, texts } from "./schema";

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
  const textOf = async (hash: string) =>
    (await db.select().from(texts).where(eq(texts.hash, hash)))[0]?.text ?? "";
  const messages = await db
    .select({ message: jugnuMessages.message })
    .from(jugnuMessages)
    .where(eq(jugnuMessages.conversationId, row.id))
    .orderBy(asc(jugnuMessages.n));
  return {
    id: row.id,
    kept: {
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
    },
  };
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
    const [turns] = await tx
      .select({ n: count() })
      .from(jugnuTurns)
      .where(eq(jugnuTurns.conversationId, conversationId));
    const [turn] = await tx
      .insert(jugnuTurns)
      .values({
        conversationId,
        n: turns?.n ?? 0,
        at,
        ms: Math.round(done.ms),
        requests: done.requests,
      })
      .returning({ id: jugnuTurns.id });
    if (turn === undefined) throw new Error("Couldn't keep the turn");
    // The messages before this turn's are those already kept: this turn's follow them.
    const from = done.conversation.messages.length - done.added.length;
    if (done.added.length > 0)
      await tx.insert(jugnuMessages).values(
        done.added.map((message, i) => ({
          conversationId,
          n: from + i,
          turnId: turn.id,
          message,
        })),
      );
    await tx
      .update(jugnuConversations)
      .set({ lastTurnAt: at, cursor: done.conversation.cursor })
      .where(eq(jugnuConversations.id, conversationId));
    return { conversation: conversationId, turn: turn.id };
  });
}

/** Ends a conversation, once: true if this ended it (false if it had already ended). */
export async function endConversation(
  db: Db,
  id: string,
  by: ConversationEnd,
  now: number,
): Promise<boolean> {
  const ended = await db
    .update(jugnuConversations)
    .set({ endedAt: new Date(now), endedBy: by, cursor: null })
    .where(and(eq(jugnuConversations.id, id), isNull(jugnuConversations.endedAt)))
    .returning({ id: jugnuConversations.id });
  return ended.length > 0;
}

/** Ends every conversation with no turn since `before`; their ids. */
export async function endQuiet(db: Db, before: number, now: number): Promise<string[]> {
  const ended = await db
    .update(jugnuConversations)
    .set({ endedAt: new Date(now), endedBy: ConversationEnd.Quiet, cursor: null })
    .where(
      and(isNull(jugnuConversations.endedAt), lt(jugnuConversations.lastTurnAt, new Date(before))),
    )
    .returning({ id: jugnuConversations.id });
  return ended.map((r) => r.id);
}
