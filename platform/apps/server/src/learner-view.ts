import type { LearnerConcept, LearnerReply } from "@chalk/api";
import type { ConceptPlan } from "@chalk/learning";
import { and, desc, eq } from "drizzle-orm";
import type { Db } from "./db";
import { latestNoteByConcept } from "./notes";
import { attempts } from "./schema";
import { groupLearners } from "./store";

/** How many wrong tries a concept shows (the newest). */
const WRONG_SHOWN = 3;

/** A question's family: its folder (questions/<family>/<one>); a page is its own. */
export const familyOf = (board: string): string => {
  const parts = board.split("/");
  return parts.at(-3) === "questions" ? (parts.at(-2) ?? board) : (parts.at(-1) ?? board);
};

/**
 * A teacher's look at one learner of their group (platform/docs/plans/teacher-view.md): who they
 * are and their progress (as in the group), and, per concept, their wrong tries and Jugnu's latest
 * note. Reads only. Undefined if they aren't in the group now.
 */
export async function learnerView(
  db: Db,
  groupId: string,
  learnerId: string,
  plans: readonly ConceptPlan[],
): Promise<LearnerReply | undefined> {
  const learner = (await groupLearners(db, groupId, plans)).find((l) => l.id === learnerId);
  if (learner === undefined) return undefined;
  const wrongRows = await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.accountId, learnerId), eq(attempts.isRight, false)))
    .orderBy(desc(attempts.at));
  const notes = await latestNoteByConcept(db, learnerId, plans);
  const byConcept = new Map<string, LearnerConcept>();
  const conceptOf = (concept: string) => {
    let c = byConcept.get(concept);
    if (c === undefined) {
      c = { concept, wrong: [], note: notes.get(concept) ?? null };
      byConcept.set(concept, c);
    }
    return c;
  };
  for (const r of wrongRows)
    for (const concept of r.tests) {
      const c = conceptOf(concept);
      if (c.wrong.length < WRONG_SHOWN)
        c.wrong.push({
          board: r.board,
          family: familyOf(r.board),
          chosen: r.chosen,
          at: r.at.getTime(),
        });
    }
  for (const concept of notes.keys()) conceptOf(concept);
  // In the course's order.
  const order = plans.map((p) => p.id);
  const rank = (id: string) => (order.indexOf(id) < 0 ? order.length : order.indexOf(id));
  return {
    learner,
    concepts: [...byConcept.values()].sort((a, b) => rank(a.concept) - rank(b.concept)),
  };
}
