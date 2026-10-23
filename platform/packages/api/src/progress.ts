import {
  type ChalkEvent,
  LessonStatus,
  MachineType,
  QuestionStatus,
  isEventFor,
} from "@chalk/content";
import { z } from "zod";

/**
 * How far a learner is, worked out from their events and nothing else (docs/events.md). The app
 * plays each concept as two lessons: its pages (`concept/<id>`), then practice on its questions
 * (`practice/<id>`). The same function runs on the phone (the result screen) and on the server
 * (the path, the teacher's view), so they always agree.
 */

const CONCEPT_PREFIX = "concept/";
const PRACTICE_PREFIX = "practice/";

export const conceptLessonId = (conceptId: string): string => `${CONCEPT_PREFIX}${conceptId}`;
export const practiceLessonId = (conceptId: string): string => `${PRACTICE_PREFIX}${conceptId}`;
/** The rest of a concept's bank, for later practice; not counted in progress yet. */
export const bankLessonId = (conceptId: string): string => `bank/${conceptId}`;

/** Each question's first try, in the order they were answered. */
export const Mark = { Right: "right", Wrong: "wrong" } as const;
export type Mark = (typeof Mark)[keyof typeof Mark];

export const practiceScoreSchema = z.object({
  right: z.number().int(),
  of: z.number().int(),
  marks: z.array(z.nativeEnum(Mark)),
  /** When the run was finished. */
  at: z.number(),
});
export type PracticeScore = z.infer<typeof practiceScoreSchema>;

export const conceptProgressSchema = z.object({
  /** Its pages were played to the end. */
  isLearnt: z.boolean(),
  /** The latest finished practice; null if none. */
  practice: practiceScoreSchema.nullable(),
});
export type ConceptProgress = z.infer<typeof conceptProgressSchema>;

/** By concept id; a concept never touched isn't in it. */
export const progressSchema = z.record(z.string(), conceptProgressSchema);
export type Progress = z.infer<typeof progressSchema>;

/** The score of one practice run: the first check of each question decides it. */
export function scoreRun(events: readonly ChalkEvent[], at: number): PracticeScore {
  const first = new Map<string, Mark>();
  for (const event of events) {
    if (!isEventFor(event, MachineType.Question) || !event.state.isGraded) continue;
    const key = String(event.machine.id);
    if (!first.has(key))
      first.set(key, event.state.status === QuestionStatus.Correct ? Mark.Right : Mark.Wrong);
  }
  const marks = [...first.values()];
  return { right: marks.filter((m) => m === Mark.Right).length, of: marks.length, marks, at };
}

/** Everyone's progress from their events, in any order: runs are put back in order by session. */
export function progressFrom(events: readonly ChalkEvent[]): Progress {
  const sorted = [...events].sort(
    (a, b) =>
      a.envelope.sessionId.localeCompare(b.envelope.sessionId) || a.envelope.seq - b.envelope.seq,
  );
  const progress: Progress = {};
  const entry = (conceptId: string): ConceptProgress => {
    const found = progress[conceptId];
    if (found !== undefined) return found;
    const made: ConceptProgress = { isLearnt: false, practice: null };
    progress[conceptId] = made;
    return made;
  };
  // The practice run under way in each session: its lesson and the events since it started.
  const runs = new Map<string, { lessonId: string; events: ChalkEvent[] }>();
  for (const event of sorted) {
    const { sessionId, lessonId } = event.envelope;
    if (lessonId === null) continue;
    const lesson = isEventFor(event, MachineType.Lesson) ? event : undefined;
    if (lessonId.startsWith(CONCEPT_PREFIX)) {
      if (lesson?.state.status === LessonStatus.Completed)
        entry(lessonId.slice(CONCEPT_PREFIX.length)).isLearnt = true;
      continue;
    }
    if (!lessonId.startsWith(PRACTICE_PREFIX)) continue;
    if (lesson?.input.type === "start") {
      runs.set(sessionId, { lessonId, events: [] });
      continue;
    }
    const run = runs.get(sessionId);
    if (run === undefined || run.lessonId !== lessonId) continue;
    run.events.push(event);
    if (lesson?.state.status === LessonStatus.Completed) {
      const score = scoreRun(run.events, event.envelope.producedAt);
      const concept = entry(lessonId.slice(PRACTICE_PREFIX.length));
      if (concept.practice === null || concept.practice.at <= score.at) concept.practice = score;
      runs.delete(sessionId);
    }
  }
  return progress;
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
