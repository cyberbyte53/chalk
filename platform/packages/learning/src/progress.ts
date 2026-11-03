import {
  Actor,
  type BuildIndex,
  type ChalkEvent,
  builtBookSchema,
  builtChapterSchema,
  builtConceptSchema,
  isKind,
} from "@chalk/content";
import { z } from "zod";

/**
 * How far a learner is, worked out from their events and the course tree, nothing else
 * (docs/events.md). Events are facts about boards; progress is read per board, then rolled up to
 * concepts by the tree: a concept is learnt once every one of its pages has been passed (the
 * learner pressed Continue), and practised once every question of its first practice has a first
 * try. The same functions run on the phone (from its own events) and on the server (from its
 * index of board facts, kept as events arrive), so they always agree.
 */

/** The lessons the app plays for a concept: its pages, its practice, the rest of its bank. */
export const conceptLessonId = (conceptId: string): string => `concept/${conceptId}`;
export const practiceLessonId = (conceptId: string): string => `practice/${conceptId}`;
/** The rest of a concept's bank, for later practice; not counted in progress yet. */
export const bankLessonId = (conceptId: string): string => `bank/${conceptId}`;

/** Each question's first try, in the order they were answered. */
export const Mark = { Right: "right", Wrong: "wrong" } as const;
export type Mark = (typeof Mark)[keyof typeof Mark];

export const practiceScoreSchema = z.object({
  right: z.number().int(),
  of: z.number().int(),
  marks: z.array(z.nativeEnum(Mark)),
  /** When the last of its first tries was. */
  at: z.number(),
});
export type PracticeScore = z.infer<typeof practiceScoreSchema>;

export const conceptProgressSchema = z.object({
  /** Every one of its pages was passed. */
  isLearnt: z.boolean(),
  /** Its first practice, once every question in it has a first try; null until then. */
  practice: practiceScoreSchema.nullable(),
});
export type ConceptProgress = z.infer<typeof conceptProgressSchema>;

/** By concept id; a concept never touched isn't in it. */
export const progressSchema = z.record(z.string(), conceptProgressSchema);
export type Progress = z.infer<typeof progressSchema>;

/** What the author decided about a concept, by board id: its pages, and its first practice. */
export type ConceptPlan = {
  id: string;
  pages: readonly string[];
  practice: readonly string[];
};

/**
 * The questions a concept is practised on first: those testing it marked `firstTry`, in that
 * order, or every question testing it when none is marked.
 */
export function practiceOf<Q extends { tests: readonly string[]; firstTry?: number | undefined }>(
  questions: readonly Q[],
  conceptId: string,
): Q[] {
  const testing = questions.filter((q) => q.tests.includes(conceptId));
  const first = testing
    .filter((q) => q.firstTry !== undefined)
    .sort((a, b) => (a.firstTry ?? 0) - (b.firstTry ?? 0));
  return first.length === 0 ? testing : first;
}

/**
 * Every concept's plan, from the built course: `read` gives a node's built item by its path
 * (build/<path>.json, bundled on the phone, from disk on the server).
 */
export function conceptPlansOf(index: BuildIndex, read: (path: string) => unknown): ConceptPlan[] {
  return index.books.flatMap((bookRef) =>
    builtBookSchema.parse(read(bookRef.path)).chapters.flatMap((chapterRef) => {
      const chapter = builtChapterSchema.parse(read(chapterRef.path));
      return chapter.concepts.map((conceptRef) => {
        const concept = builtConceptSchema.parse(read(conceptRef.path));
        return {
          id: concept.id,
          pages: concept.overview.map((page) => page.id),
          practice: practiceOf(chapter.questions, concept.id).map((q) => q.id),
        };
      });
    }),
  );
}

/** One learner's facts about one board: passed (when, first), and its first graded check. */
export type BoardFact = {
  passedAt: number | null;
  first: { isRight: boolean; at: number } | null;
};
export type BoardFacts = ReadonlyMap<string, BoardFact>;

/**
 * The processor (docs/events.md): one learner's board facts from their events, in any order.
 * Passed is the learner's Continue; a first try is the earliest graded check.
 */
export function boardFactsFrom(events: readonly ChalkEvent[]): Map<string, BoardFact> {
  const facts = new Map<string, BoardFact>();
  const fact = (board: string): BoardFact => {
    const found = facts.get(board);
    if (found !== undefined) return found;
    const made: BoardFact = { passedAt: null, first: null };
    facts.set(board, made);
    return made;
  };
  for (const event of events) {
    if (!isKind(event, "signal") || event.actor !== Actor.Learner || event.board === null) continue;
    const { signal, payload } = event.payload;
    if (signal === "continued" && event.node === null) {
      const f = fact(event.board);
      if (f.passedAt === null || event.at < f.passedAt) f.passedAt = event.at;
    } else if (signal === "checked" && payload.isGraded === true) {
      const f = fact(event.board);
      if (f.first === null || event.at < f.first.at)
        f.first = { isRight: payload.status === "correct", at: event.at };
    }
  }
  return facts;
}

/** Two sets of board facts in one (the server's, and the phone's since): the earlier of each. */
export function mergeBoardFacts(a: BoardFacts, b: BoardFacts): Map<string, BoardFact> {
  const merged = new Map(a);
  for (const [board, theirs] of b) {
    const ours = merged.get(board);
    if (ours === undefined) {
      merged.set(board, theirs);
      continue;
    }
    const earlier = (x: number | null, y: number | null) =>
      x === null ? y : y === null ? x : Math.min(x, y);
    merged.set(board, {
      passedAt: earlier(ours.passedAt, theirs.passedAt),
      first:
        ours.first === null
          ? theirs.first
          : theirs.first === null || ours.first.at <= theirs.first.at
            ? ours.first
            : theirs.first,
    });
  }
  return merged;
}

/** Progress by concept, from board facts and the tree. */
export function progressFrom(facts: BoardFacts, plans: readonly ConceptPlan[]): Progress {
  const progress: Progress = {};
  for (const plan of plans) {
    const isLearnt =
      plan.pages.length > 0 && plan.pages.every((id) => (facts.get(id)?.passedAt ?? null) !== null);
    const firsts = plan.practice.map((id) => facts.get(id)?.first ?? null);
    const tries = firsts.filter((f): f is NonNullable<typeof f> => f !== null);
    const practice =
      plan.practice.length > 0 && tries.length === plan.practice.length
        ? scoreOf([...tries].sort((x, y) => x.at - y.at))
        : null;
    const isTouched =
      isLearnt ||
      tries.length > 0 ||
      plan.pages.some((id) => (facts.get(id)?.passedAt ?? null) !== null);
    if (isTouched) progress[plan.id] = { isLearnt, practice };
  }
  return progress;
}

function scoreOf(tries: readonly { isRight: boolean; at: number }[]): PracticeScore {
  const marks = tries.map((t) => (t.isRight ? Mark.Right : Mark.Wrong));
  return {
    right: marks.filter((m) => m === Mark.Right).length,
    of: marks.length,
    marks,
    at: Math.max(...tries.map((t) => t.at)),
  };
}

/** A concept is done once practised; one with no questions, once its pages are played. */
export const isConceptDone = (progress: ConceptProgress | undefined, hasPractice: boolean) =>
  progress !== undefined && (hasPractice ? progress.practice !== null : progress.isLearnt);

/**
 * Two views of the same learner's progress (the server's, and what this phone saw since): learnt
 * if either says so, and the later practice.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const merged: Progress = { ...a };
  for (const [id, theirs] of Object.entries(b)) {
    const ours = merged[id];
    if (ours === undefined) {
      merged[id] = theirs;
      continue;
    }
    const practice =
      ours.practice === null
        ? theirs.practice
        : theirs.practice === null || ours.practice.at >= theirs.practice.at
          ? ours.practice
          : theirs.practice;
    merged[id] = { isLearnt: ours.isLearnt || theirs.isLearnt, practice };
  }
  return merged;
}
