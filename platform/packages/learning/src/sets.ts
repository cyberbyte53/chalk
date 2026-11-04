/**
 * The set constructors (platform/docs/plans/teacher-view.md): what chooses a set of questions for a
 * learner, named in each `set served` entry (its version is the entry's commit). Today one: a
 * lesson's practice as built (`practiceOf`). Later, reviews made for each child from their state.
 */
export const SetBy = { LessonPractice: "lesson-practice" } as const;
export type SetBy = (typeof SetBy)[keyof typeof SetBy];
