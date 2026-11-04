/** @jsxImportSource preact */
import type { Lesson, Locale } from "@chalk/content";
import type { EventBus } from "@chalk/events";
import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { BoardPlayer, type BoardPlayerProps } from "./board-player";
import { JugnuFigure, JugnuMood } from "./jugnu-figure";
import { PlayMode } from "./play-mode";
import type { PropRegistry } from "./prop-module";
import { RichText } from "./rich-text-view";
import type { BoardRuntime } from "./runtime";
import { SoundMenu, hasSounds, hearAgainOf } from "./sound/sound-menu";
import { t } from "./ui-text";

export type LessonPlayerProps = {
  lesson: Lesson;
  /** Every prop type the lesson may use, from the library. */
  registry: PropRegistry;
  locale: Locale;
  /** The app's event channel: each board records what happens on it. */
  bus: EventBus;
  /** The board to open on (an author jumping straight to it); the first board if left out. */
  startBoard?: number;
  /** How its questions are played (play-mode.ts): a lesson's pages by default. */
  mode?: PlayMode;
  /** Told the board on screen each time it changes (a dev tool reopening the lesson there). */
  onBoard?: (index: number) => void;
  onExit: () => void;
  /**
   * Called once the last board is passed. Given, the app shows
   * what comes next itself; left out, the player shows "Lesson complete".
   */
  onComplete?: () => void;
  /** Jugnu, live, on its boards played in a mode with him (board-player.tsx's askJugnu). */
  askJugnu?: BoardPlayerProps["askJugnu"];
};

/** Plays a lesson board by board. The same player runs every kind of lesson. */
export function LessonPlayer({
  lesson,
  registry,
  locale,
  bus,
  startBoard = 0,
  mode = PlayMode.Lesson,
  onBoard,
  onExit,
  onComplete,
  askJugnu,
}: LessonPlayerProps): JSX.Element {
  const [index, setIndex] = useState(startBoard);
  // The furthest board reached: every board before it has been passed.
  const [furthest, setFurthest] = useState(startBoard);
  const board = lesson.boards[index];
  // The board being played: the header's menu asks it to read its screen again.
  const [runtime, setRuntime] = useState<BoardRuntime | undefined>(undefined);
  const onBoardRef = useRef(onBoard);
  onBoardRef.current = onBoard;
  useEffect(() => onBoardRef.current?.(index), [index]);
  // Read when the lesson ends, so a new callback each render doesn't re-run the effect below.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const isDone = index >= lesson.boards.length;

  useEffect(() => {
    if (isDone) onCompleteRef.current?.();
  }, [isDone]);

  const back = () => setIndex(index - 1);
  const exit = onExit;

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
        {board !== undefined && (
          <SoundMenu
            locale={locale}
            hasSounds={hasSounds(board, registry)}
            onHearAgain={hearAgainOf(runtime)}
          />
        )}
      </header>
      {board === undefined && onComplete !== undefined ? null : board === undefined ? (
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
          record={bus.record}
          isInLesson
          onRuntime={setRuntime}
          onPass={() => {
            setIndex(index + 1);
            setFurthest(Math.max(furthest, index + 1));
          }}
          onBack={index === 0 ? undefined : back}
          wasPassed={index < furthest}
          mode={mode}
          askJugnu={askJugnu}
        />
      )}
    </div>
  );
}
