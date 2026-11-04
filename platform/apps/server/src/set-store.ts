import { createHash } from "node:crypto";
import { type SetKeeper, questionFactsFrom } from "@chalk/studio/jugnu-sets";
import { and, desc, eq, inArray, max, notExists, sql } from "drizzle-orm";
import type { Db } from "./db";
import {
  events,
  attempts,
  jugnuConversations,
  jugnuReflections,
  learnerUpdates,
  mastery,
  texts,
} from "./schema";
import { attemptOf } from "./store";

/**
 * The server's keeper of sets and learner updates (studio's sets.ts): a set is read from its
 * stored events (`set served`, `set finished`, and its boards' `open` naming it), never from
 * times; its update is kept in `learner_updates`, its numbers in `mastery`.
 */
export function dbSetKeeper(db: Db, contentDir: string | undefined): SetKeeper {
  const setEvents = (what: string) =>
    and(eq(events.kind, "set"), sql`${events.payload}->>'what' = ${what}`);
  return {
    toUpdate: async (promptHash) =>
      (
        await db
          .select({ account: events.accountId, set: sql<string>`${events.payload}->>'set'` })
          .from(events)
          .where(
            and(
              setEvents("finished"),
              notExists(
                db
                  .select({ id: learnerUpdates.id })
                  .from(learnerUpdates)
                  .where(
                    and(
                      eq(learnerUpdates.accountId, events.accountId),
                      eq(learnerUpdates.set, sql`${events.payload}->>'set'`),
                      eq(learnerUpdates.promptHash, promptHash),
                    ),
                  ),
              ),
            ),
          )
      ).map((r) => ({ account: r.account, set: r.set })),
    set: async (account, set) => {
      const rows = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.accountId, account),
            eq(events.kind, "set"),
            sql`${events.payload}->>'set' = ${set}`,
          ),
        );
      const served = rows.find((r) => (r.payload as { what?: string }).what === "served");
      const finished = rows.find((r) => (r.payload as { what?: string }).what === "finished");
      if (served === undefined || finished === undefined) return undefined;
      const p = served.payload as { by: string; questions: { board: string; version: string }[] };
      const openings = await db
        .selectDistinct({ opening: events.opening })
        .from(events)
        .where(
          and(
            eq(events.accountId, account),
            eq(events.kind, "open"),
            sql`${events.payload}->>'set' = ${set}`,
          ),
        );
      return {
        id: set,
        by: p.by,
        questions: p.questions,
        finishedAt: finished.at.getTime(),
        openings: openings.flatMap((o) => (o.opening === null ? [] : [o.opening])),
      };
    },
    lastFinishedAt: async (account) => {
      const [last] = await db
        .select({ at: max(events.at) })
        .from(events)
        .where(and(eq(events.accountId, account), setEvents("finished")));
      return last?.at === null || last?.at === undefined ? undefined : new Date(last.at).getTime();
    },
    attempts: async (account) =>
      (await db.select().from(attempts).where(eq(attempts.accountId, account))).map(attemptOf),
    reflectionsAt: async (account, openings) =>
      openings.length === 0
        ? []
        : (
            await db
              // The latest on each conversation (judging again adds one).
              .selectDistinctOn([jugnuReflections.conversationId], {
                id: jugnuReflections.id,
                board: jugnuConversations.board,
                points: jugnuReflections.points,
                gotThere: jugnuReflections.gotThere,
              })
              .from(jugnuReflections)
              .innerJoin(
                jugnuConversations,
                eq(jugnuConversations.id, jugnuReflections.conversationId),
              )
              .where(
                and(
                  eq(jugnuConversations.accountId, account),
                  inArray(jugnuConversations.opening, [...openings]),
                ),
              )
              .orderBy(jugnuReflections.conversationId, desc(jugnuReflections.at))
          ).map(({ id, board, points, gotThere }) => ({ id, board, points, gotThere })),
    questionFacts: async (boards) =>
      contentDir === undefined
        ? boards.map((board) => ({ board, name: board, concepts: [], level: null }))
        : questionFactsFrom(contentDir, boards),
    lastPoints: async (account) => {
      const [last] = await db
        .select({ points: learnerUpdates.points })
        .from(learnerUpdates)
        .where(eq(learnerUpdates.accountId, account))
        .orderBy(desc(learnerUpdates.setFinishedAt), desc(learnerUpdates.at))
        .limit(1);
      return last?.points ?? [];
    },
    keepMastery: async (account, rows) => {
      await db.transaction(async (tx) => {
        await tx.delete(mastery).where(eq(mastery.accountId, account));
        if (rows.length > 0)
          await tx
            .insert(mastery)
            .values(rows.map((m) => ({ ...m, accountId: account, lastAt: new Date(m.lastAt) })));
      });
    },
    keepUpdate: async ({ account, set, finishedAt, at, judged }) => {
      const promptText = createHash("sha256").update(judged.prompt.text).digest("hex");
      return db.transaction(async (tx) => {
        await tx
          .insert(texts)
          .values({ hash: promptText, text: judged.prompt.text })
          .onConflictDoNothing();
        const [made] = await tx
          .insert(learnerUpdates)
          .values({
            accountId: account,
            set,
            setFinishedAt: new Date(finishedAt),
            at: new Date(at),
            promptName: judged.prompt.name,
            promptHash: judged.prompt.hash,
            promptText,
            model: judged.model,
            points: judged.points,
            requests: judged.requests,
          })
          .onConflictDoNothing()
          .returning({ id: learnerUpdates.id });
        return made?.id ?? "";
      });
    },
  };
}
