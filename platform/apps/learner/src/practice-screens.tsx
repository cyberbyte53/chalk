import { Mark, type PracticeScore, type Progress } from "@chalk/api";
import type { Locale } from "@chalk/content";
import { JugnuFigure, JugnuMood, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { say } from "./app-text";
import type { CourseChapter, CourseConcept } from "./course";
import { courses } from "./lessons";

function Marks({ marks }: { marks: readonly Mark[] }): JSX.Element {
  return (
    <div class="marks" aria-hidden="true">
      {marks.map((mark, i) => (
        <i key={i} class={mark === Mark.Right ? "is-right" : "is-wrong"} />
      ))}
    </div>
  );
}

/** "1, 3 and 7" */
function listOf(numbers: readonly number[], locale: Locale): string {
  if (numbers.length < 2) return numbers.join("");
  const and = locale === "hi" ? " और " : " and ";
  return `${numbers.slice(0, -1).join(", ")}${and}${numbers.at(-1)}`;
}

/** After practice: the score, each question's first try, and what's worth another look. */
export function ResultScreen({
  concept,
  score,
  locale,
  onAgain,
  onNext,
}: {
  concept: CourseConcept;
  score: PracticeScore;
  locale: Locale;
  onAgain: () => void;
  onNext: () => void;
}): JSX.Element {
  const wrong = score.marks.flatMap((mark, i) => (mark === Mark.Wrong ? [i + 1] : []));
  const mood = wrong.length === 0 ? JugnuMood.Celebrate : JugnuMood.Proud;
  return (
    <div class="lesson page">
      <div class="page-body is-centred is-high">
        <JugnuFigure mood={mood} size={154} />
        <div class="kicker">{say(locale, "practiceOf", { concept: concept.title[locale] })}</div>
        <div class="score">
          {score.right}
          <span> / {score.of}</span>
        </div>
        <Marks marks={score.marks} />
        <div class="card is-flat">
          {wrong.length === 0 ? (
            <span class="name">{say(locale, "allRight")}</span>
          ) : (
            <>
              <span class="name">{say(locale, "worthAnotherLook")}</span>
              <span>{say(locale, "questionsToLook", { list: listOf(wrong, locale) })}</span>
            </>
          )}
        </div>
      </div>
      <div class="page-foot">
        {wrong.length > 0 && (
          <button type="button" class="second" onClick={onAgain}>
            {say(locale, "goOver")}
          </button>
        )}
        <button type="button" class="primary" onClick={onNext}>
          {say(locale, "nextConcept")}
        </button>
      </div>
    </div>
  );
}

/** Every concept in the chapter done: each one's practice score. */
export function ChapterDoneScreen({
  chapter,
  number,
  courseTitle,
  progress,
  locale,
  onDone,
}: {
  chapter: CourseChapter;
  number: number;
  courseTitle: string;
  progress: Progress;
  locale: Locale;
  onDone: () => void;
}): JSX.Element {
  return (
    <div class="lesson page">
      <div class="page-body is-centred is-high">
        <JugnuFigure mood={JugnuMood.Celebrate} size={165} />
        <div class="kicker">{say(locale, "chapterComplete", { n: number })}</div>
        <h1 class="page-title">
          <RichText text={chapter.title[locale]} />
        </h1>
        <div class="scores">
          {chapter.concepts.map((concept) => {
            const practice = progress[concept.id]?.practice ?? null;
            const share = practice === null || practice.of === 0 ? 1 : practice.right / practice.of;
            return (
              <div key={concept.id} class="scores-row">
                <span class="scores-name">
                  <RichText text={concept.title[locale]} />
                </span>
                <span class="bar">
                  <i
                    class={share >= 0.7 ? "is-right" : "is-so-so"}
                    style={{ width: `${share * 100}%` }}
                  />
                </span>
                <span class="scores-n">
                  {practice === null ? "✓" : `${practice.right}/${practice.of}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div class="page-foot">
        <button type="button" class="primary" onClick={onDone}>
          {say(locale, "backToCourse", { course: courseTitle })}
        </button>
      </div>
    </div>
  );
}

/** Development only (`?screens`): the result and chapter-end screens with made-up scores. */
export function ScreenSamples({ locale }: { locale: Locale }): JSX.Element | null {
  const chapter = courses[0]?.chapters[0];
  const concept = chapter?.concepts[0];
  if (chapter === undefined || concept === undefined) return null;
  const marks = [
    Mark.Right,
    Mark.Right,
    Mark.Wrong,
    Mark.Right,
    Mark.Right,
    Mark.Right,
    Mark.Wrong,
    Mark.Right,
  ];
  const score = { right: 6, of: 8, marks, at: 0 };
  const progress: Progress = Object.fromEntries(
    chapter.concepts.map((c, i) => [
      c.id,
      { isLearnt: true, practice: { ...score, right: 6 - i } },
    ]),
  );
  return (
    <div class="samples">
      <ResultScreen
        concept={concept}
        score={score}
        locale={locale}
        onAgain={() => {}}
        onNext={() => {}}
      />
      <ChapterDoneScreen
        chapter={chapter}
        number={1}
        courseTitle="Maths IX"
        progress={progress}
        locale={locale}
        onDone={() => {}}
      />
    </div>
  );
}
