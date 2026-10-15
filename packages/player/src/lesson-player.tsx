import {
  Actor,
  type Lesson,
  LessonStatus,
  type Locale,
  MachineType,
  assertPublished,
} from "@chalk/content";
import { type EventBus, bindRaise } from "@chalk/events";
import type { LlmProvider } from "@chalk/jugnu";
import type { JSX } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { BoardPlayer } from "./board-player";
import { JugnuFigure, JugnuMood } from "./jugnu-figure";
import type { AudioSource } from "./narration";
import type { PropRegistry } from "./prop-module";
import { RichText } from "./rich-text-view";
import { t } from "./ui-text";

export type LessonPlayerProps = {
  lesson: Lesson;
  /** Every prop type the lesson may use, from the library. */
  registry: PropRegistry;
  locale: Locale;
  /** The app's event backbone; the player only ever raises events on it. */
  bus: EventBus;
  /** Where each line's audio is (from publish); leave out for a silent lesson. */
  audio?: AudioSource;
  /** Jugnu's model (see @chalk/jugnu); leave out to play without Jugnu. */
  jugnu?: LlmProvider;
  /** The board to open on (an author jumping straight to it); the first board if left out. */
  startBoard?: number;
  onExit: () => void;
};

/** Plays a lesson board by board. The same player runs every kind of lesson. */
export function LessonPlayer({
  lesson,
  registry,
  locale,
  bus,
  audio,
  jugnu,
  startBoard = 0,
  onExit,
}: LessonPlayerProps): JSX.Element {
  useMemo(() => assertPublished(lesson), [lesson]);
  const [index, setIndex] = useState(startBoard);
  // The furthest board reached: every board before it has been passed.
  const [furthest, setFurthest] = useState(startBoard);
  const board = lesson.boards[index];
  const isDone = index >= lesson.boards.length;

  const raise = useMemo(
    () =>
      bus.raiserFor({
        lessonId: lesson.id,
        contentVersion: lesson.version,
        boardId: board?.id ?? null,
      }),
    [bus, board?.id, lesson.id, lesson.version],
  );
  const raiseLessonEvent = useMemo(
    () => bindRaise<typeof MachineType.Lesson>(raise, { type: MachineType.Lesson, id: lesson.id }),
    [raise, lesson.id],
  );

  useEffect(() => {
    if (index === 0) {
      raiseLessonEvent(
        Actor.App,
        { type: "start" },
        { status: LessonStatus.Playing, boardIndex: 0 },
      );
    }
    if (isDone) {
      raiseLessonEvent(
        Actor.App,
        { type: "complete" },
        { status: LessonStatus.Completed, boardIndex: index },
      );
    }
  }, [index, isDone, raiseLessonEvent]);

  const back = () => {
    raiseLessonEvent(
      Actor.Learner,
      { type: "back" },
      { status: LessonStatus.Playing, boardIndex: index - 1 },
    );
    setIndex(index - 1);
  };

  const exit = () => {
    if (!isDone)
      raiseLessonEvent(
        Actor.Learner,
        { type: "leave" },
        { status: LessonStatus.Left, boardIndex: index },
      );
    onExit();
  };

  return (
    <div class="lesson">
      <header class="lesson-header">
        <button type="button" class="icon" aria-label={t(locale, "close")} onClick={exit}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 3 L13 13 M13 3 L3 13" />
          </svg>
        </button>
        <div class="progress" aria-hidden="true">
          <div
            class="progress-done"
            style={{
              width: `${(Math.min(index + 1, lesson.boards.length) / lesson.boards.length) * 100}%`,
            }}
          />
        </div>
        <span class="sr-only">{`${Math.min(index + 1, lesson.boards.length)} / ${lesson.boards.length}`}</span>
      </header>
      {board === undefined ? (
        <div class="lesson-complete">
          <JugnuFigure mood={JugnuMood.Celebrate} size={150} />
          <h2>{t(locale, "lessonComplete")}</h2>
          <p>
            <RichText text={lesson.title[locale]} />
          </p>
          <button type="button" class="primary" onClick={onExit}>
            {t(locale, "backToLessons")}
          </button>
        </div>
      ) : (
        <BoardPlayer
          key={board.name}
          board={board}
          registry={registry}
          locale={locale}
          raise={raise}
          audio={audio}
          onPass={() => {
            setIndex(index + 1);
            setFurthest(Math.max(furthest, index + 1));
          }}
          onBack={index === 0 ? undefined : back}
          wasPassed={index < furthest}
          jugnu={
            jugnu === undefined
              ? undefined
              : {
                  provider: jugnu,
                  place: {
                    lessonTitle: lesson.title[locale],
                    boardNumber: index + 1,
                    boardCount: lesson.boards.length,
                    locale,
                  },
                }
          }
        />
      )}
    </div>
  );
}
