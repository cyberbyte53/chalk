import type { LearnerNote } from "@chalk/api";
import type { ConceptPlan } from "@chalk/learning";
import { and, desc, eq, inArray } from "drizzle-orm";
import type { Db } from "./db";
import { jugnuNotes, questionVersions } from "./schema";

/**
 * Jugnu's notes on learners (platform/docs/plans/teacher-view.md): one per conversation, kept when
 * it ends, read by the teacher's view. A note's concepts are worked out when it is read: a question's from
 * the catalogue (the version it was on), a page's from the concept it is in.
 */

export type NewNote = {
  accountId: string;
  board: string;
  version: string;
  at: number;
  text: string;
};

/** Keeps a note (an empty one says nothing, and isn't kept). */
export async function saveNote(db: Db, note: NewNote): Promise<void> {
  if (note.text.trim() === "") return;
  await db.insert(jugnuNotes).values({ ...note, text: note.text.trim(), at: new Date(note.at) });
}

/** Each learner's newest note. */
export async function newestNoteOfEach(
  db: Db,
  accountIds: readonly string[],
): Promise<Map<string, LearnerNote>> {
  if (accountIds.length === 0) return new Map();
  const rows = await db
    .select()
    .from(jugnuNotes)
    .where(inArray(jugnuNotes.accountId, [...accountIds]))
    .orderBy(desc(jugnuNotes.at));
  const newest = new Map<string, LearnerNote>();
  for (const r of rows)
    if (!newest.has(r.accountId))
      newest.set(r.accountId, { text: r.text, board: r.board, at: r.at.getTime() });
  return newest;
}

/** One learner's latest note on each concept. */
export async function latestNoteByConcept(
  db: Db,
  accountId: string,
  plans: readonly ConceptPlan[],
): Promise<Map<string, LearnerNote>> {
  const rows = await db
    .select({
      text: jugnuNotes.text,
      board: jugnuNotes.board,
      at: jugnuNotes.at,
      tests: questionVersions.tests,
    })
    .from(jugnuNotes)
    .leftJoin(
      questionVersions,
      and(
        eq(questionVersions.board, jugnuNotes.board),
        eq(questionVersions.version, jugnuNotes.version),
      ),
    )
    .where(eq(jugnuNotes.accountId, accountId))
    .orderBy(desc(jugnuNotes.at));
  const latest = new Map<string, LearnerNote>();
  for (const r of rows) {
    const concepts = r.tests ?? plans.filter((p) => p.pages.includes(r.board)).map((p) => p.id);
    for (const concept of concepts)
      if (!latest.has(concept))
        latest.set(concept, { text: r.text, board: r.board, at: r.at.getTime() });
  }
  return latest;
}
