import type { JoinedGroup, MeReply } from "@chalk/api";
import type { Locale } from "@chalk/content";
import { type Progress, isConceptDone } from "@chalk/learning";
import { RichText } from "@chalk/player";
import type { JSX } from "preact";
import { LocaleToggle } from "./account-screens";
import { say } from "./app-text";
import type { Course, CourseConcept } from "./course";
import { ArtView, currentConcept } from "./course-screens";

/** Where to carry on in a course: the first chapter with a concept not done, and that concept. */
export function nextUp(
  course: Course,
  progress: Progress,
): { chapter: number; concept: CourseConcept } | undefined {
  for (const [i, chapter] of course.chapters.entries()) {
    const at = currentConcept(chapter, progress);
    const concept = chapter.concepts[at];
    if (concept !== undefined) return { chapter: i, concept };
  }
  return undefined;
}

/** The share of a course's concepts that are done, 0 to 1. */
function courseDone(course: Course, progress: Progress): number {
  const all = course.chapters.flatMap((chapter) => chapter.concepts);
  if (all.length === 0) return 0;
  return all.filter((c) => isConceptDone(progress[c.id], c.hasPractice)).length / all.length;
}

/** A learner's home: carry on where they were, their courses (one per teacher), add a teacher. */
export function HomeScreen({
  me,
  courses,
  progress,
  locale,
  onLocale,
  onCourse,
  onConcept,
  onAddTeacher,
  onSignOut,
}: {
  me: MeReply;
  courses: readonly Course[];
  progress: Progress;
  locale: Locale;
  onLocale: (locale: Locale) => void;
  onCourse: (course: Course) => void;
  onConcept: (course: Course, chapter: number, conceptId: string) => void;
  onAddTeacher: () => void;
  onSignOut: () => void;
}): JSX.Element {
  // One course per group joined, in the order joined; a course from two teachers shows once.
  const mine: { course: Course; group: JoinedGroup }[] = [];
  for (const group of me.joined) {
    const course = courses.find((c) => c.id === group.courseId);
    if (course !== undefined && !mine.some((m) => m.course.id === course.id))
      mine.push({ course, group });
  }
  const first = mine[0];
  const next = first === undefined ? undefined : nextUp(first.course, progress);
  const firstName = me.account.name.split(" ")[0] ?? me.account.name;

  return (
    <div class="lesson page">
      <div class="page-top is-between">
        <div class="hello">{say(locale, "hi", { name: firstName })}</div>
        <LocaleToggle locale={locale} onLocale={onLocale} />
      </div>
      <div class="page-body">
        {first !== undefined && next !== undefined && (
          <button
            type="button"
            class="card"
            onClick={() => onConcept(first.course, next.chapter, next.concept.id)}
          >
            <ArtView art={next.concept.art} />
            <span class="small">
              <RichText text={first.course.title[locale]} />
              {" · "}
              <RichText text={first.course.chapters[next.chapter]?.title[locale] ?? ""} />
            </span>
            <span class="name">
              <RichText text={next.concept.title[locale]} />
            </span>
            <span class="card-row">
              <span class="bar">
                <i style={{ width: `${courseDone(first.course, progress) * 100}%` }} />
              </span>
              <span class="primary is-small">
                {say(locale, progress[next.concept.id] === undefined ? "start" : "continue")}
              </span>
            </span>
          </button>
        )}
        {mine.length === 0 ? (
          <button type="button" class="card" onClick={onAddTeacher}>
            <span class="name">{say(locale, "addTeacherTitle")}</span>
            <span class="lead">{say(locale, "noTeacherYet")}</span>
          </button>
        ) : (
          <>
            <h2 class="page-section">{say(locale, "yourCourses")}</h2>
            {mine.map(({ course, group }) => {
              const done = courseDone(course, progress);
              return (
                <button key={course.id} type="button" class="card" onClick={() => onCourse(course)}>
                  <span class="name">
                    <RichText text={course.title[locale]} />
                  </span>
                  <span class="small">
                    {group.teacherName}
                    {done === 0 ? ` · ${say(locale, "notStarted")}` : ""}
                  </span>
                  <span class="bar">
                    <i style={{ width: `${done * 100}%` }} />
                  </span>
                </button>
              );
            })}
          </>
        )}
        <button type="button" class="link" onClick={onAddTeacher}>
          {say(locale, "addTeacher")}
        </button>
      </div>
      <div class="page-foot">
        <button type="button" class="link is-quiet" onClick={onSignOut}>
          {say(locale, "signOut")}
        </button>
      </div>
    </div>
  );
}
