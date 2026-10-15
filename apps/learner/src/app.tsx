import { type ChalkEvent, Locale } from "@chalk/content";
import { createEventBus } from "@chalk/events";
import { propLibrary } from "@chalk/library";
import { LessonPlayer, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { ChapterScreen, CourseScreen } from "./course-screens";
import { jugnuProvider } from "./jugnu";
import { type PlayableLesson, courses, lessons } from "./lessons";

/** One event backbone for the whole app session. */
const bus = createEventBus();
/** Jugnu's model, chosen in vite.config.ts; undefined plays without Jugnu. */
const jugnu = jugnuProvider();

function formatEvent({ envelope: e, machine, input, state }: ChalkEvent): string {
  return [
    String(e.seq).padStart(3),
    new Date(e.producedAt).toISOString().slice(11, 19),
    e.actor.padEnd(7),
    `${machine.type}/${machine.id}`.padEnd(28),
    JSON.stringify(input),
    "→",
    JSON.stringify(state),
  ].join(" ");
}

/**
 * `?lesson=<id>&board=<n>&locale=hi` opens a lesson straight at a board (n from 0), for authors
 * checking one board without playing everything before it.
 */
function jumpFromUrl(): { lesson: PlayableLesson | undefined; board: number; locale: Locale } {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("lesson");
  return {
    lesson: id === null ? undefined : lessons.find((entry) => entry.lesson.id === id),
    board: Math.max(0, Number(params.get("board") ?? 0) || 0),
    locale: params.get("locale") === Locale.Hi ? Locale.Hi : Locale.En,
  };
}

type Screen =
  | { kind: "home" }
  | { kind: "course"; course: number }
  | { kind: "chapter"; course: number; chapter: number };

/** Dev shell: pick a lesson, play it, and watch the events it emits. */
export function App(): JSX.Element {
  const [jump] = useState(jumpFromUrl);
  const [locale, setLocale] = useState<Locale>(jump.locale);
  const [playing, setPlaying] = useState<PlayableLesson | undefined>(jump.lesson);
  const [events, setEvents] = useState<readonly ChalkEvent[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  // Where the learner is outside a lesson: the list, a book, or one of its chapters.
  const [screen, setScreen] = useState<Screen>({ kind: "home" });
  const course = screen.kind === "home" ? undefined : courses[screen.course];
  const chapter = screen.kind === "chapter" ? course?.chapters[screen.chapter] : undefined;
  const play = (lessonId: string) =>
    setPlaying(lessons.find((entry) => entry.lesson.id === lessonId));

  // The dev log is just one subscriber; the uploader will subscribe the same way.
  useEffect(() => bus.subscribe((event) => setEvents((prev) => [...prev, event])), []);

  return (
    <>
      {playing === undefined && screen.kind === "chapter" && chapter !== undefined ? (
        <ChapterScreen
          chapter={chapter}
          number={screen.chapter + 1}
          locale={locale}
          onConcept={play}
          onBack={() => setScreen({ kind: "course", course: screen.course })}
        />
      ) : playing === undefined && screen.kind !== "home" && course !== undefined ? (
        <CourseScreen
          course={course}
          locale={locale}
          onChapter={(i) => setScreen({ kind: "chapter", course: screen.course, chapter: i })}
          onBack={() => setScreen({ kind: "home" })}
        />
      ) : playing === undefined ? (
        <div class="lesson home">
          <header class="home-header">
            <h1>Chalk</h1>
            <button
              type="button"
              class="locale"
              onClick={() => setLocale(locale === Locale.En ? Locale.Hi : Locale.En)}
            >
              {locale === Locale.En ? "हिंदी" : "English"}
            </button>
          </header>
          {courses.length > 0 && <h2 class="home-section">Courses</h2>}
          <ul class="lesson-list">
            {courses.map((c, i) => (
              <li key={c.title.en}>
                <button type="button" onClick={() => setScreen({ kind: "course", course: i })}>
                  <RichText text={c.title[locale]} />
                </button>
              </li>
            ))}
          </ul>
          <h2 class="home-section">All lessons</h2>
          <ul class="lesson-list">
            {lessons.map((entry) => (
              <li key={entry.lesson.id}>
                <button type="button" onClick={() => setPlaying(entry)}>
                  <RichText text={entry.lesson.title[locale]} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <LessonPlayer
          key={`${playing.lesson.id}-${locale}`}
          lesson={playing.lesson}
          audio={playing.audio}
          registry={propLibrary}
          locale={locale}
          bus={bus}
          jugnu={jugnu}
          startBoard={playing === jump.lesson ? jump.board : 0}
          onExit={() => setPlaying(undefined)}
        />
      )}
      <button type="button" class="log-toggle" onClick={() => setIsLogOpen(!isLogOpen)}>
        events {events.length}
      </button>
      {isLogOpen && <pre class="log">{events.slice(-40).map(formatEvent).join("\n")}</pre>}
    </>
  );
}
