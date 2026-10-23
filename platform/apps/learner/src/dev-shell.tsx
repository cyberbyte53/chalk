import { type ChalkEvent, Locale } from "@chalk/content";
import type { EventBus } from "@chalk/events";
import { propLibrary } from "@chalk/library";
import { LessonPlayer, PlayMode, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { CourseScreen } from "./course-screens";
import { type PlayableLesson, findLesson, otherLessons } from "./dev-lessons";
import { devJugnuLink } from "./jugnu";
import { courses } from "./lessons";
import { settings } from "./settings";

/**
 * How a lesson plays here: `?mode=` (lesson, guided, skillCheck, review) if given, else a concept's
 * pages as a lesson and its practice or bank as guided practice.
 */
function modeFor(lessonId: string): PlayMode {
  const asked = new URLSearchParams(window.location.search).get("mode");
  const modes = Object.values(PlayMode) as string[];
  if (asked !== null && modes.includes(asked)) return asked as PlayMode;
  return /^(practice|bank)\//.test(lessonId) ? PlayMode.Guided : PlayMode.Lesson;
}

/**
 * Which model Jugnu runs on: `?model=<id>`, else the last one picked, else the first. Switching
 * restarts the lesson on the same board, so the same question can be tried on each model.
 */
const MODEL_KEY = "dev-jugnu-model";
function modelFromUrl(): string | undefined {
  const asked = new URLSearchParams(window.location.search).get("model");
  let kept: string | null = null;
  try {
    kept = window.localStorage.getItem(MODEL_KEY);
  } catch {}
  const ids = settings.jugnu.devModels.map((m) => m.id);
  return [asked, kept].find((id) => id !== null && ids.includes(id)) ?? ids[0];
}

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
function jumpFromUrl(): { lesson: string | null; board: number; locale: Locale } {
  const params = new URLSearchParams(window.location.search);
  return {
    lesson: params.get("lesson"),
    board: Math.max(0, Number(params.get("board") ?? 0) || 0),
    locale: params.get("locale") === Locale.Hi ? Locale.Hi : Locale.En,
  };
}

type Screen = { kind: "home" } | { kind: "course"; course: number };

/**
 * Development only (`?dev`): every lesson, a course's chapters, and the events as they happen.
 * Events go on the app's backbone like anywhere else (and are uploaded when signed in).
 */
export function DevShell({ bus }: { bus: EventBus }): JSX.Element {
  const [jump] = useState(jumpFromUrl);
  const [locale, setLocale] = useState<Locale>(jump.locale);
  const [playing, setPlaying] = useState<PlayableLesson | undefined>(undefined);
  // Lessons in no book, fetched once the list is shown; a book's lessons come with its chapter.
  const [others, setOthers] = useState<readonly PlayableLesson[]>([]);
  useEffect(() => {
    void otherLessons().then(setOthers);
    if (jump.lesson === null) return;
    void findLesson(jump.lesson).then((found) => {
      setBoardNow(jump.board);
      setPlaying(found);
      if (new URLSearchParams(window.location.search).has("katexcheck"))
        window.setTimeout(() => void import("./katex-check").then((m) => m.runKatexCheck()), 2500);
    });
  }, [jump]);
  const [events, setEvents] = useState<readonly ChalkEvent[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [modelId, setModelId] = useState(modelFromUrl);
  const jugnu = useMemo(
    () => devJugnuLink(settings.jugnu.devModels.find((m) => m.id === modelId)),
    [modelId],
  );
  // The board on screen, so a model switch restarts there.
  const [boardNow, setBoardNow] = useState(0);
  const pickModel = (id: string) => {
    setModelId(id);
    try {
      window.localStorage.setItem(MODEL_KEY, id);
    } catch {}
    const params = new URLSearchParams(window.location.search);
    params.set("model", id);
    window.history.replaceState(null, "", `?${params.toString().replace(/=(?=&|$)/g, "")}`);
  };
  // Where the learner is outside a lesson: the list, a book, or one of its chapters.
  const [screen, setScreen] = useState<Screen>({ kind: "home" });
  const course = screen.kind === "home" ? undefined : courses[screen.course];

  // The dev log is just one subscriber; the uploader will subscribe the same way.
  useEffect(() => bus.subscribe((event) => setEvents((prev) => [...prev, event])), [bus]);

  return (
    <>
      {playing === undefined && screen.kind !== "home" && course !== undefined ? (
        <CourseScreen
          course={course}
          locale={locale}
          onChapter={() => {}}
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
            {others.map((entry) => (
              <li key={entry.lesson.id}>
                <button
                  type="button"
                  onClick={() => {
                    setBoardNow(0);
                    setPlaying(entry);
                  }}
                >
                  <RichText text={entry.lesson.title[locale]} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <LessonPlayer
          key={`${playing.lesson.id}-${locale}-${modelId ?? ""}`}
          lesson={playing.lesson}
          mode={modeFor(playing.lesson.id)}
          audio={playing.audio}
          registry={propLibrary}
          locale={locale}
          bus={bus}
          jugnu={jugnu}
          startBoard={boardNow}
          onBoard={setBoardNow}
          onExit={() => setPlaying(undefined)}
        />
      )}
      {settings.jugnu.devModels.length > 0 && (
        <select
          class="dev-model"
          aria-label="Jugnu's model"
          value={modelId}
          onChange={(e) => pickModel((e.target as HTMLSelectElement).value)}
        >
          {settings.jugnu.devModels.map((m) => (
            <option key={m.id} value={m.id}>
              {`Jugnu: ${m.id}`}
            </option>
          ))}
        </select>
      )}
      <button type="button" class="log-toggle" onClick={() => setIsLogOpen(!isLogOpen)}>
        events {events.length}
      </button>
      {isLogOpen && <pre class="log">{events.slice(-40).map(formatEvent).join("\n")}</pre>}
    </>
  );
}
