import { type Progress, boardFactsFrom, isConceptDone, progressFrom } from "@chalk/api";
import type { ChalkEvent, Locale } from "@chalk/content";
import type { EventBus } from "@chalk/events";
import { preloadProps, propLibrary } from "@chalk/library";
import { LessonPlayer, PlayMode } from "@chalk/player";
import type { JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { ChapterGate } from "./chapter-gate";
import type { ChapterContent } from "./content-store";
import type { Course, CourseChapter } from "./course";
import { ChapterScreen, currentConcept } from "./course-screens";
import { toggleParam } from "./editor-link";
import { jugnuLink } from "./jugnu";
import { courses, plans } from "./lessons";
import { ChapterDoneScreen, ResultScreen } from "./practice-screens";

type Found = { course: Course; chapter: CourseChapter; number: number };

/** The chapter a path is in or under (a book, or every book: the first chapter). */
function chapterAt(path: string): Found | undefined {
  for (const course of courses)
    for (const [i, chapter] of course.chapters.entries())
      if (
        path === "" ||
        path === chapter.path ||
        path.startsWith(`${chapter.path}/`) ||
        chapter.path.startsWith(`${path}/`)
      )
        return { course, chapter, number: i + 1 };
  return undefined;
}

type Part = "pages" | "practice";
/** The app's screens inside a chapter (app.tsx), and the board a lesson opens at. */
type LessonScreen = { kind: "lesson"; concept: string; part: Part; start: number };
type Screen =
  | { kind: "chapter" }
  | LessonScreen
  | { kind: "result"; concept: string }
  | { kind: "chapterDone" };

/** Where in the chapter a path is: the board or lesson it names, else the chapter's path. */
function screenAt(path: string, content: ChapterContent): Screen {
  for (const [concept, lessons] of content)
    for (const part of ["pages", "practice"] as const) {
      const boards = lessons[part]?.boards ?? [];
      const at = boards.findIndex((b) => b.item?.path === path);
      if (at >= 0) return { kind: "lesson", concept, part, start: at };
      if (part === "pages" && boards.some((b) => b.item?.path.startsWith(`${path}/`)))
        return { kind: "lesson", concept, part, start: 0 };
    }
  return { kind: "chapter" };
}

/** The board played is part of the address (`&board=bus-stops`): a reload or the editor's buttons keep it. */
function keepBoardInAddress(path: string | undefined): void {
  if (path === undefined) return;
  const next = new URLSearchParams(window.location.search);
  next.set("board", path.split("/").at(-1) ?? path);
  const query = `?${next.toString().replace(/=(&|$)/g, "$1")}`;
  if (query !== window.location.search) history.replaceState(null, "", query);
}

const jugnu = jugnuLink();
const prepare = (chapter: CourseChapter): Promise<void> => preloadProps(chapter.props);

/**
 * Play as the app plays (`?dev&at=<address>&play`), in a phone's frame: the chapter's path, each
 * concept's pages then its practice in the app's own player and modes, its result, the chapter's
 * end. Opens at the board, lesson or chapter the path names. Progress is worked out from this
 * session's events as the app works out a learner's own; nothing is signed in or kept.
 */
export function PlayInApp({
  path,
  locale,
  bus,
  width = 390,
}: {
  path: string;
  locale: Locale;
  bus: EventBus;
  width?: number;
}): JSX.Element {
  const found = useMemo(() => chapterAt(path), [path]);
  const [screen, setScreen] = useState<Screen | null>(null);
  const [events, setEvents] = useState<readonly ChalkEvent[]>([]);
  useEffect(() => bus.subscribe((e) => setEvents((was) => [...was, e])), [bus]);
  const progress: Progress = useMemo(() => progressFrom(boardFactsFrom(events), plans), [events]);
  // The lesson being played and its board: ← / → open the board before or after it, fresh, as a
  // student meets it (an author's way round, which a student doesn't have).
  const here = useRef<{ now: LessonScreen; index: number; count: number } | undefined>(undefined);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).closest("input, textarea, select") !== null) return;
      // The preview's own keys: p leaves play (at this board), l switches the language.
      if (e.key === "p") return toggleParam("play");
      if (e.key === "l") return toggleParam("locale");
      const by = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      const at = here.current;
      if (by === 0 || at === undefined) return;
      const to = at.index + by;
      if (to < 0 || to >= at.count) return;
      e.preventDefault();
      setScreen({ ...at.now, start: to });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // A phone: its width, and a phone's height where the screen has room for it.
  const frame = {
    width: `${width}px`,
    height: `min(${Math.round(width * 2.16)}px, calc(100dvh - 24px))`,
  };
  if (found === undefined)
    return <div class="preview-empty">{`No chapter in a course has "${path}".`}</div>;
  const { course, chapter, number } = found;
  const toChapter = () =>
    setScreen({ kind: currentConcept(chapter, progress) === -1 ? "chapterDone" : "chapter" });

  return (
    <main class="play-app">
      <div class="play-phone" style={frame}>
        <ChapterGate chapter={chapter} locale={locale} prepare={prepare} onBack={() => {}}>
          {(content) => {
            const now = screen ?? screenAt(path, content);
            if (now.kind === "lesson") {
              const lessons = content.get(now.concept);
              const lesson = now.part === "pages" ? lessons?.pages : lessons?.practice;
              if (lessons !== undefined && lesson != null)
                return (
                  <LessonPlayer
                    key={`${lesson.id}-${locale}-${now.start}`}
                    lesson={lesson}
                    mode={now.part === "pages" ? PlayMode.Lesson : PlayMode.Guided}
                    registry={propLibrary}
                    locale={locale}
                    bus={bus}
                    jugnu={jugnu}
                    startBoard={now.start}
                    onBoard={(index) => {
                      here.current = { now, index, count: lesson.boards.length };
                      keepBoardInAddress(lesson.boards[index]?.item?.path);
                    }}
                    onExit={() => setScreen({ kind: "chapter" })}
                    onComplete={() => {
                      if (now.part === "pages" && lessons.practice !== null)
                        setScreen({ ...now, part: "practice", start: 0 });
                      else if (now.part === "practice")
                        setScreen({ kind: "result", concept: now.concept });
                      else toChapter();
                    }}
                  />
                );
            }
            if (now.kind === "result") {
              const concept = chapter.concepts.find((c) => c.id === now.concept);
              const score = progress[now.concept]?.practice;
              if (concept !== undefined && score != null)
                return (
                  <ResultScreen
                    concept={concept}
                    score={score}
                    locale={locale}
                    onAgain={() =>
                      setScreen({ kind: "lesson", concept: concept.id, part: "practice", start: 0 })
                    }
                    onNext={toChapter}
                  />
                );
            }
            if (now.kind === "chapterDone")
              return (
                <ChapterDoneScreen
                  chapter={chapter}
                  number={number}
                  courseTitle={course.title[locale]}
                  progress={progress}
                  locale={locale}
                  onDone={() => setScreen({ kind: "chapter" })}
                />
              );
            return (
              <ChapterScreen
                chapter={chapter}
                number={number}
                locale={locale}
                progress={progress}
                onConcept={(concept) => {
                  const mine = progress[concept];
                  const hasPractice = content.get(concept)?.practice != null;
                  // As the app: pages already played go straight on to practice.
                  const part: Part =
                    mine?.isLearnt && hasPractice && !isConceptDone(mine, true)
                      ? "practice"
                      : "pages";
                  setScreen({ kind: "lesson", concept, part, start: 0 });
                }}
                onBack={() => {}}
              />
            );
          }}
        </ChapterGate>
      </div>
    </main>
  );
}
