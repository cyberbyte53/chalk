import type { GotThere, LearnerReply } from "@chalk/api";
import type { ConceptPlan } from "@chalk/learning";
import type { SetKeeper } from "@chalk/studio/jugnu-sets";
import { desc, eq } from "drizzle-orm";
import type { Db } from "./db";
import { learnerUpdates } from "./schema";
import { groupLearners } from "./store";

/**
 * A teacher's look at one child of their group (platform/docs/plans/teacher-view.md): as in the
 * class (their latest update, each point with its evidence), and Jugnu's reflections on that set's
 * conversations, read through the set keeper as the update was made. Judged points only: no
 * prompt, request or message. Undefined if they aren't in the group now.
 */
export async function learnerView(
  db: Db,
  keeper: SetKeeper,
  groupId: string,
  learnerId: string,
  plans: readonly ConceptPlan[],
): Promise<LearnerReply | undefined> {
  const learner = (await groupLearners(db, groupId, plans, keeper.questionFacts)).find(
    (l) => l.id === learnerId,
  );
  if (learner === undefined) return undefined;
  const [latest] = await db
    .select({ set: learnerUpdates.set })
    .from(learnerUpdates)
    .where(eq(learnerUpdates.accountId, learnerId))
    .orderBy(desc(learnerUpdates.setFinishedAt), desc(learnerUpdates.at))
    .limit(1);
  if (latest === undefined) return { learner, reflections: [] };
  const set = await keeper.set(learnerId, latest.set);
  const reflections = await keeper.reflectionsAt(learnerId, set?.openings ?? []);
  const facts = new Map(
    (await keeper.questionFacts(reflections.map((r) => r.board))).map((f) => [f.board, f]),
  );
  return {
    learner,
    reflections: reflections.map((r) => ({
      id: r.id,
      board: r.board,
      name: facts.get(r.board)?.name ?? r.board,
      gotThere: r.gotThere as GotThere,
      points: r.points,
    })),
  };
}
