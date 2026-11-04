import type { GotThere, LearnerReply } from "@chalk/api";
import type { ConceptPlan } from "@chalk/learning";
import type { SetKeeper } from "@chalk/studio/jugnu-sets";
import { desc, eq } from "drizzle-orm";
import type { Db } from "./db";
import { learnerUpdates } from "./schema";
import { groupLearners } from "./store";

/**
 * A teacher's look at one child of their group (platform/docs/plans/teacher-view.md, step 4): as
 * in the class, and their latest update (their last finished set's), each point with its evidence
 * as the teacher reads it, and Jugnu's reflections on that set. Read through the set keeper, as
 * the update was made. The evidence's tries are the attempts as worked out now (in that set's
 * openings); a cited question or reflection no longer found is left out. Judged points only: no
 * prompt, request or message. Undefined if they aren't in the group now.
 */
export async function learnerView(
  db: Db,
  keeper: SetKeeper,
  groupId: string,
  learnerId: string,
  plans: readonly ConceptPlan[],
): Promise<LearnerReply | undefined> {
  const learner = (await groupLearners(db, groupId, plans)).find((l) => l.id === learnerId);
  if (learner === undefined) return undefined;
  const [latest] = await db
    .select({
      set: learnerUpdates.set,
      finishedAt: learnerUpdates.setFinishedAt,
      points: learnerUpdates.points,
    })
    .from(learnerUpdates)
    .where(eq(learnerUpdates.accountId, learnerId))
    .orderBy(desc(learnerUpdates.setFinishedAt), desc(learnerUpdates.at))
    .limit(1);
  if (latest === undefined) return { learner, update: null };

  const set = await keeper.set(learnerId, latest.set);
  const openings = set?.openings ?? [];
  const tries = (await keeper.attempts(learnerId)).filter((a) => openings.includes(a.opening));
  const reflections = await keeper.reflectionsAt(learnerId, openings);
  const cited = [...new Set(latest.points.flatMap((p) => p.questions))].filter((b) =>
    set === undefined ? false : set.questions.some((q) => q.board === b),
  );
  const facts = new Map(
    (await keeper.questionFacts([...cited, ...reflections.map((r) => r.board)])).map((f) => [
      f.board,
      f,
    ]),
  );
  const reflectionIds = new Set(reflections.map((r) => r.id));
  return {
    learner,
    update: {
      finishedAt: latest.finishedAt.getTime(),
      points: latest.points.map((p) => ({
        text: p.text,
        questions: p.questions.flatMap((board) => {
          const f = facts.get(board);
          return f === undefined || !cited.includes(board)
            ? []
            : [
                {
                  board,
                  name: f.name,
                  concepts: f.concepts.map((c) => c.title),
                  level: f.level,
                  tries: tries
                    .filter((a) => a.board === board)
                    .sort((a, b) => a.at - b.at)
                    .map(({ isRight, chosen, helped }) => ({ isRight, chosen, helped })),
                },
              ];
        }),
        reflections: p.reflections.filter((r) => reflectionIds.has(r)),
      })),
      reflections: reflections.map((r) => ({
        id: r.id,
        board: r.board,
        name: facts.get(r.board)?.name ?? r.board,
        gotThere: r.gotThere as GotThere,
        points: r.points,
      })),
    },
  };
}
