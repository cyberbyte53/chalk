/** @jsxImportSource preact */
import { Actor, AppWhat, type Board, type Locale } from "@chalk/content";
import { type RecordEvent, makeId } from "@chalk/events";
import {
  AnswerStatus,
  BOARD,
  BoardAction,
  BoardSignal,
  CheckedBy,
  PropRole,
  QuestionAction,
  QuestionSignal,
  segment,
} from "@chalk/prop";
import type { JSX } from "preact";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { Layout, type LayoutContext } from "./layout";
import { type PlayMode, PlayModeContext, modePolicy } from "./play-mode";
import type { PropRegistry } from "./prop-module";
import { recordBoard } from "./recorder";
import type { BoardRuntime } from "./runtime";
import { useBoardSound } from "./sound/board-sound";
import { isAudible, playSound } from "./sound/engine";
import { SoundMenu, hasSounds, hearAgainOf } from "./sound/sound-menu";
import { type ClipStore, type SpokenProp, useVoice } from "./sound/voice";
import { t } from "./ui-text";
import { useBoardRuntime } from "./use-board-runtime";
import { useMadeWhenChanged, useWhenChanged } from "./when-changed";

/** The props playing the question role: a board may ask any number of questions. */
function questionsOf(runtime: BoardRuntime): string[] {
  return runtime.propNames().filter((name) => runtime.getDef(name).role === PropRole.Question);
}

export type BoardPlayerProps = {
  board: Board;
  registry: PropRegistry;
  locale: Locale;
  /** The app's event channel: the board records what happens on it (recorder.ts). */
  record: RecordEvent;
  onPass: () => void;
  /** Goes back a board; left out on the first board. */
  onBack?: (() => void) | undefined;
  /**
   * The learner has passed this board before (they came back to it). It opens fresh, so they can
   * play it again, with Continue already showing.
   */
  wasPassed?: boolean;
  /**
   * How the board is played (play-mode.ts): a banner under the board says right or wrong, with
   * Try again or Continue as the mode allows. Left out (an author's review), each
   * question shows its own note under it instead.
   */
  mode?: PlayMode | undefined;
  /** Drawn as a picture of the board as it stands (a tool's): nothing passing shows on it. */
  isPicture?: boolean;
  /**
   * Nothing heard (a tool's board, one of several on a review screen): each line keeps its length
   * on the board's clock, and nothing plays. A student's board (the default) is heard: each line
   * ends when its sound does.
   */
  isSilent?: boolean;
  /** Its menu is the lesson's (in the lesson's header, lesson-player.tsx), not its own. */
  isInLesson?: boolean;
  /** The board's runtime, once it runs: for a tool beside the board (a prop page's panel). */
  onRuntime?: ((runtime: BoardRuntime) => void) | undefined;
};

/**
 * Plays one board: its props, wired by its IS and WHEN rules. Each question answers where it sits;
 * the player only adds the chrome every board shares: the sound menu, and Continue once the board passes.
 */
/**
 * A board, played: on a student's phone, in the preview and in the editor's panel alike. It finds
 * its own sound (board-sound.ts) and starts once that is known.
 */
export function BoardPlayer(props: BoardPlayerProps): JSX.Element {
  const sound = useBoardSound(props.board);
  // A board that sounds starts once the page may sound: a browser allows it from the first touch,
  // which a student gives in reaching a board (opening a lesson, Continue). One opened without it
  // (a link, a refresh) is shown held, its clock not started; the first touch on it starts it (and
  // does nothing else), so its opening is heard from the start.
  const [isHeld, setHeld] = useState(() => props.isSilent !== true && !isAudible());
  // A first key starts it too (a keyboard's first touch).
  useEffect(() => {
    if (!isHeld) return;
    const start = () => setHeld(false);
    window.addEventListener("keydown", start, { once: true });
    return () => window.removeEventListener("keydown", start);
  }, [isHeld]);
  if (!sound.isReady) return <div class="board" aria-busy="true" />;
  return (
    <BoardPlay
      {...props}
      audio={sound.source}
      isHeld={isHeld}
      onFirstTouch={() => setHeld(false)}
    />
  );
}

function BoardPlay({
  board,
  registry,
  locale,
  record,
  audio,
  onPass,
  onBack,
  wasPassed = false,
  mode,
  onRuntime,
  isPicture = false,
  isInLesson = false,
  isSilent = false,
  isHeld,
  onFirstTouch,
}: BoardPlayerProps & {
  audio: ClipStore | undefined;
  /** Shown, its clock not started, until the first touch on it (BoardPlayer). */
  isHeld: boolean;
  onFirstTouch: () => void;
}): JSX.Element {
  const policy = mode === undefined ? undefined : modePolicy[mode];
  // Set once the recorder exists (the voice is made first, and reports through it).
  const recorderRef = useRef<ReturnType<typeof recordBoard> | undefined>(undefined);
  const reportAudioFailure = useCallback(
    (prop: SpokenProp, reason: string) =>
      recorderRef.current?.app(AppWhat.AudioFailed, { reason }, segment(prop.name)),
    [],
  );
  const voice = useVoice(locale, audio, reportAudioFailure);
  // The board reads each line's length when it says it: from the voice as it is then.
  const voiceRef = useRef(voice);
  voiceRef.current = voice;
  const runtime = useBoardRuntime(board, registry, voice.speak, {
    locale,
    lineSeconds: (line) => voiceRef.current.seconds(line),
    isSilent,
    isHeld,
    playSound,
    hush: () => voiceRef.current.hush(),
  });
  useWhenChanged([runtime], () => onRuntime?.(runtime));
  // Everything that happens on the board is recorded; it opens before its first signal.
  const recorder = useMadeWhenChanged([runtime, record], () => {
    const made = recordBoard(runtime, record, makeId());
    made.open({
      locale,
      wasPassed,
      hasAudio: audio !== undefined,
      ...(mode !== undefined ? { mode } : {}),
    });
    recorderRef.current = made;
    return made;
  });
  useEffect(() => () => recorder.close(), [recorder]);
  // A drag is one entry: the board tells its recorder when a pointer is down on it.
  useEffect(() => {
    const up = () => recorder.gesture(false);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [recorder]);

  const questions = useMemo(() => questionsOf(runtime), [runtime]);
  const body = useRef<HTMLElement>(null);
  const bar = useRef<HTMLElement>(null);
  // Brings a piece into sight above the bar once it is drawn: no further than it must.
  const inSight = useCallback((piece: string) => {
    requestAnimationFrame(() => {
      const el = body.current?.querySelector<HTMLElement>(`[data-piece="${CSS.escape(piece)}"]`);
      if (el === null || el === undefined) return;
      el.style.scrollMarginBottom = `${(bar.current?.offsetHeight ?? 0) + 12}px`;
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }, []);
  useEffect(() => {
    if (wasPassed) void runtime.call(BOARD, BoardAction.Pass, {}, Actor.App);
  }, [runtime, wasPassed]);

  // What the chrome answers: a question checked (the banner), Continue pressed (the next board).
  useEffect(
    () =>
      runtime.onSignal((signal) => {
        if (signal.prop === BOARD && signal.signal === BoardSignal.Continued) {
          onPass();
          return;
        }
        if (questions.includes(signal.prop) && signal.signal === QuestionSignal.Checked)
          setLastChecked(signal.prop);
        // What the child's own act brings, and the answer they just checked, are kept in sight
        // above the bar: a box shown below the fold, or an answer under the banner.
        if (signal.actor !== Actor.Learner) return;
        if (signal.prop === BOARD && signal.signal === BoardSignal.Shown)
          inSight(String(signal.payload.name));
        else if (questions.includes(signal.prop) && signal.signal === QuestionSignal.Checked)
          inSight(signal.prop);
      }),
    [runtime, questions, onPass, inSight],
  );

  const isPassed = runtime.getView(BOARD).isPassed === true;
  // The question the bar's Check is for: the first on the board checked with it, not yet right.
  const toCheck = questions.find(
    (name) =>
      runtime.getDef(name).checkedBy === CheckedBy.Bar &&
      runtime.getView(name).status !== AnswerStatus.Correct,
  );

  // The question checked last, for the banner: its result shows until the learner answers again.
  const [lastChecked, setLastChecked] = useState<string | undefined>(undefined);
  const result =
    lastChecked === undefined
      ? AnswerStatus.Open
      : (runtime.getView(lastChecked).status as AnswerStatus | undefined);
  // A mode without retries (a skill check): a wrong answer is final, the board is done.
  const isSettled = policy?.canRetry === false && result === AnswerStatus.Wrong;
  useEffect(() => {
    if (isSettled && !isPassed) void runtime.call(BOARD, BoardAction.Pass, {}, Actor.App);
  }, [runtime, isSettled, isPassed]);

  const context: LayoutContext = {
    locale,
    registry,
    runtime,
    audioFailed: voice.failed,
    // Through the board: said in its turn, never over the line being said.
    onRetryAudio: (name) => void runtime.call(BOARD, "say", { line: name }, Actor.Learner),
    isPicture,
  };

  const banner =
    policy === undefined || result === undefined || result === AnswerStatus.Open
      ? undefined
      : result;

  return (
    <PlayModeContext.Provider value={mode}>
      <div
        class={`board${banner !== undefined ? ` has-banner is-${banner}` : ""}${isHeld ? " is-held" : ""}`}
      >
        {/* The first touch starts the board, and only that: what it lands on isn't pressed. */}
        {isHeld && (
          <div
            class="board-hold"
            aria-hidden="true"
            onClick={onFirstTouch}
            onKeyDown={onFirstTouch}
          />
        )}
        <main
          class={`board-body${isSettled ? " is-settled" : ""}`}
          ref={body}
          onPointerDownCapture={() => recorder.gesture(true)}
        >
          {!isPicture && !isSilent && !isInLesson && (
            <SoundMenu
              locale={locale}
              hasSounds={hasSounds(board, registry)}
              onHearAgain={hearAgainOf(runtime)}
            />
          )}
          <Layout piece={board.root} context={context} />
        </main>
        <footer
          ref={bar}
          class={`board-footer${banner !== undefined ? ` has-banner is-${banner}` : ""}`}
        >
          {policy !== undefined && banner !== undefined && (
            <div class="board-banner">
              <strong>
                {banner === AnswerStatus.Correct
                  ? t(locale, "rightBanner")
                  : t(locale, policy.wrongWord)}
              </strong>
            </div>
          )}
          {onBack !== undefined && (
            <button type="button" class="back" aria-label={t(locale, "back")} onClick={onBack}>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M11 3 L5 9 L11 15" />
              </svg>
            </button>
          )}
          {policy?.canRetry === true &&
          banner === AnswerStatus.Wrong &&
          lastChecked !== undefined ? (
            <button
              type="button"
              class="primary is-retry"
              onClick={() =>
                void runtime.call(lastChecked, QuestionAction.Retry, {}, Actor.Learner)
              }
            >
              {t(locale, "tryAgain")}
            </button>
          ) : isPassed ? (
            <button
              type="button"
              class="primary"
              onClick={() => void runtime.call(BOARD, BoardAction.Continue, {}, Actor.Learner)}
            >
              {t(locale, "continue")}
            </button>
          ) : (
            toCheck !== undefined && (
              // The question's own Check, drawn in the bar: tagged as its part, so tools press it
              // by name ("ask/check") as a finger does.
              <span class="bar-part" data-piece={toCheck}>
                <button
                  type="button"
                  class="primary"
                  data-part={QuestionAction.Check}
                  data-does={QuestionAction.Check}
                  onClick={() =>
                    void runtime.call(toCheck, QuestionAction.Check, {}, Actor.Learner)
                  }
                >
                  {t(locale, "check")}
                </button>
              </span>
            )
          )}
        </footer>
      </div>
    </PlayModeContext.Provider>
  );
}

/** A quiet board's voice: nothing said. */
