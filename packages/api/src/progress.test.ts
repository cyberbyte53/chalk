import {
  Actor,
  type ChalkEvent,
  EVENT_SCHEMA_VERSION,
  type EventEnvelope,
  LessonStatus,
  MachineType,
  QuestionStatus,
  SubmittedKind,
} from "@chalk/content";
import { describe, expect, it } from "vitest";
import {
  Mark,
  conceptLessonId,
  isConceptDone,
  mergeProgress,
  practiceLessonId,
  progressFrom,
} from "./progress";

/** Events of one app session, numbered in order, as the backbone would. */
function session(id: string) {
  let seq = 0;
  const envelope = (lessonId: string): EventEnvelope => ({
    id: `${id}-${seq}`,
    schemaVersion: EVENT_SCHEMA_VERSION,
    sessionId: id,
    seq: seq++,
    producedAt: 1000 + seq,
    actor: Actor.Learner,
    lessonId,
    contentVersion: null,
    boardId: null,
  });
  const lesson = (lessonId: string, type: "start" | "complete" | "leave"): ChalkEvent => ({
    envelope: envelope(lessonId),
    machine: { type: MachineType.Lesson, id: lessonId },
    input: { type },
    state: {
      status:
        type === "start"
          ? LessonStatus.Playing
          : type === "complete"
            ? LessonStatus.Completed
            : LessonStatus.Left,
      boardIndex: 0,
    },
  });
  const check = (
    lessonId: string,
    question: number,
    isRight: boolean,
    attempts = 1,
  ): ChalkEvent => ({
    envelope: envelope(lessonId),
    machine: { type: MachineType.Question, id: question },
    input: { type: "check", submitted: { kind: SubmittedKind.Choice, optionId: "a" } },
    state: {
      status: isRight ? QuestionStatus.Correct : QuestionStatus.Wrong,
      attempts,
      isGraded: true,
    },
  });
  return { lesson, check };
}

const C = "c1";

describe("progress", () => {
  it("scores a finished practice by each question's first try", () => {
    const s = session("s1");
    const p = practiceLessonId(C);
    const events = [
      s.lesson(conceptLessonId(C), "start"),
      s.lesson(conceptLessonId(C), "complete"),
      s.lesson(p, "start"),
      s.check(p, 2, true),
      s.check(p, 3, false),
      s.check(p, 3, true, 2),
      s.check(p, 4, true),
      s.lesson(p, "complete"),
    ];
    const progress = progressFrom(events);
    expect(progress[C]).toMatchObject({
      isLearnt: true,
      practice: { right: 2, of: 3, marks: [Mark.Right, Mark.Wrong, Mark.Right] },
    });
    expect(isConceptDone(progress[C], true)).toBe(true);
    // Order of arrival doesn't matter.
    expect(progressFrom([...events].reverse())).toEqual(progress);
  });

  it("ignores a practice left halfway, and keeps the latest finished one", () => {
    const p = practiceLessonId(C);
    const a = session("a");
    const left = [a.lesson(p, "start"), a.check(p, 2, false), a.lesson(p, "leave")];
    expect(progressFrom(left)[C]).toBeUndefined();
    expect(isConceptDone(progressFrom(left)[C], true)).toBe(false);

    const b = session("b");
    const done = [b.lesson(p, "start"), b.check(p, 2, false), b.lesson(p, "complete")];
    const c = session("c");
    const again = [c.lesson(p, "start"), c.check(p, 2, true), c.lesson(p, "complete")];
    // Session c's events come later in time.
    for (const e of again) e.envelope.producedAt += 10_000;
    expect(progressFrom([...left, ...done, ...again])[C]?.practice?.right).toBe(1);
  });

  it("counts a concept with no questions as done once its pages are played", () => {
    const s = session("s");
    const progress = progressFrom([s.lesson(conceptLessonId(C), "complete")]);
    expect(isConceptDone(progress[C], false)).toBe(true);
    expect(isConceptDone(progress[C], true)).toBe(false);
  });
});

describe("mergeProgress", () => {
  it("keeps learnt from either and the later practice", () => {
    const early = { right: 1, of: 2, marks: [Mark.Right, Mark.Wrong], at: 1 };
    const late = { right: 2, of: 2, marks: [Mark.Right, Mark.Right], at: 2 };
    expect(
      mergeProgress(
        { a: { isLearnt: true, practice: early }, b: { isLearnt: false, practice: null } },
        { a: { isLearnt: false, practice: late }, c: { isLearnt: true, practice: null } },
      ),
    ).toEqual({
      a: { isLearnt: true, practice: late },
      b: { isLearnt: false, practice: null },
      c: { isLearnt: true, practice: null },
    });
  });
});
