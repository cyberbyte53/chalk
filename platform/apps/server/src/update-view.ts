import type { QuestionSeen, UpdateSeen } from "@chalk/api";
import { type Attempt, PointKind } from "@chalk/learning";
import type { QuestionFacts } from "@chalk/studio/jugnu-sets";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { attemptOf } from "./attempt-rows";
import type { Db } from "./db";
import { events, attempts, learnerUpdates } from "./schema";

/** What the build says of each question (the set keeper's `questionFacts`). */
export type FactsOf = (boards: readonly string[]) => Promise<QuestionFacts[]>;

/**
 * Each learner's latest update (their last finished set's, then the last judged) as the teacher
 * reads it (platform/docs/plans/teacher-view.md): each point with the questions it cites, and
 * their tries at each in that set (the attempts as worked out now, in that set's openings); and,
 * when it has no point that needs the teacher, the one the update before had (they got past it).
 * A few queries for them all, never one per learner. A cited question no longer found is left out.
 */
export async function updatesSeen(
  db: Db,
  accountIds: readonly string[],
  factsOf: FactsOf,
): Promise<Map<string, UpdateSeen>> {
  if (accountIds.length === 0) return new Map();
  const rows = await db
    .select({
      accountId: learnerUpdates.accountId,
      set: learnerUpdates.set,
      finishedAt: learnerUpdates.setFinishedAt,
      points: learnerUpdates.points,
    })
    .from(learnerUpdates)
    .where(inArray(learnerUpdates.accountId, [...accountIds]))
    .orderBy(learnerUpdates.accountId, desc(learnerUpdates.setFinishedAt), desc(learnerUpdates.at));
  // Per learner: the latest, and the latest of an earlier set (a set judged again is one set).
  const latest = new Map<string, (typeof rows)[number]>();
  const before = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    const last = latest.get(row.accountId);
    if (last === undefined) latest.set(row.accountId, row);
    else if (last.set !== row.set && !before.has(row.accountId)) before.set(row.accountId, row);
  }
  if (latest.size === 0) return new Map();

  // The latest sets' openings, then the tries made on them.
  const sets = [...latest.values()].map((u) => u.set);
  const openingRows = await db
    .selectDistinct({
      accountId: events.accountId,
      opening: events.opening,
      set: sql<string>`${events.payload}->>'set'`,
    })
    .from(events)
    .where(
      and(
        inArray(events.accountId, [...latest.keys()]),
        eq(events.kind, "open"),
        inArray(sql`${events.payload}->>'set'`, sets),
      ),
    );
  const openingsOf = new Map<string, Set<string>>();
  for (const r of openingRows) {
    if (r.opening === null || latest.get(r.accountId)?.set !== r.set) continue;
    const mine = openingsOf.get(r.accountId) ?? new Set();
    mine.add(r.opening);
    openingsOf.set(r.accountId, mine);
  }
  const allOpenings = [...openingsOf.values()].flatMap((o) => [...o]);
  const triesOf = new Map<string, Attempt[]>();
  if (allOpenings.length > 0)
    for (const row of await db
      .select()
      .from(attempts)
      .where(
        and(
          inArray(attempts.accountId, [...latest.keys()]),
          inArray(attempts.opening, allOpenings),
        ),
      )) {
      if (!openingsOf.get(row.accountId)?.has(row.opening)) continue;
      triesOf.set(row.accountId, [...(triesOf.get(row.accountId) ?? []), attemptOf(row)]);
    }

  const cited = [
    ...new Set([...latest.values()].flatMap((u) => u.points.flatMap((p) => p.questions))),
  ];
  const facts = new Map((await factsOf(cited)).map((f) => [f.board, f]));
  const seen = new Map<string, UpdateSeen>();
  for (const [accountId, u] of latest) {
    const mine = triesOf.get(accountId) ?? [];
    const question = (board: string): QuestionSeen[] => {
      const f = facts.get(board);
      return f === undefined
        ? []
        : [
            {
              board,
              path: f.path,
              name: f.name,
              concepts: f.concepts.map((c) => c.title),
              level: f.level,
              tries: mine
                .filter((a) => a.board === board)
                .sort((a, b) => a.at - b.at)
                .map(({ opening, version, at, isRight, chosen, helped }) => ({
                  opening,
                  version,
                  at,
                  isRight,
                  chosen,
                  helped,
                })),
            },
          ];
    };
    const needsYou = (points: typeof u.points) =>
      points.find((p) => p.kind === PointKind.NeedsYou)?.text ?? null;
    seen.set(accountId, {
      finishedAt: u.finishedAt.getTime(),
      points: u.points.map((p) => ({
        text: p.text,
        kind: p.kind,
        mistake: p.mistake,
        next: p.next,
        questions: p.questions.flatMap(question),
      })),
      wasNeedsYou:
        needsYou(u.points) === null ? needsYou(before.get(accountId)?.points ?? []) : null,
    });
  }
  return seen;
}
