/** @jsxImportSource preact */
import { Actor, AppWhat, type Board, type Locale, propPieces } from "@chalk/content";
import { type RecordEvent, makeId } from "@chalk/events";
import type { JugnuPlace } from "@chalk/jugnu";
import {
  AnswerStatus,
  BOARD,
  BoardAction,
  BoardSignal,
  PropRole,
  QuestionAction,
  QuestionSignal,
  SAY,
  segment,
} from "@chalk/prop";
import type { JSX } from "preact";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { type Picked, isSamePick, useHoldToAsk } from "./ask-about";
import { isEffectsMuted, playEffect, setEffectsMuted } from "./effects";
import { JugnuFigure, JugnuMood } from "./jugnu-figure";
import { type JugnuLink, JugnuPanel } from "./jugnu-panel";
import { Layout, type LayoutContext } from "./layout";
import { type AudioSource, type SpokenProp, isMuted, setMuted, useNarrator } from "./narration";
import { type PlayMode, PlayModeContext, modePolicy } from "./play-mode";
import type { PropRegistry } from "./prop-module";
import { recordBoard } from "./recorder";
import { BoardRuntime } from "./runtime";
import type { LiveBoard } from "./scene-runtime";
import { t } from "./ui-text";
import { useBoardRuntime } from "./use-board-runtime";
import { useMadeWhenChanged, useWhenChanged } from "./when-changed";

/** How long Jugnu's pointing glow stays. */
const POINT_SECONDS = 5;

/** The props playing the question role: a board may ask any number of questions. */
function questionsOf(runtime: LiveBoard): string[] {
  return runtime.propNames().filter((name) => runtime.getDef(name).role === PropRole.Question);
}

export type BoardPlayerProps = {
  board: Board;
  registry: PropRegistry;
  locale: Locale;
  /** The app's event channel: the board records what happens on it (recorder.ts). */
  record: RecordEvent;
  /** Where each line's audio is; undefined when the lesson has no audio yet. */
  audio: AudioSource | undefined;
  onPass: () => void;
  /** Goes back a board; left out on the first board. */
  onBack?: (() => void) | undefined;
  /**
   * The learner has passed this board before (they came back to it). It opens fresh, so they can
   * play it again, with Continue already showing.
   */
  wasPassed?: boolean;
  /** Jugnu, and where this board sits for him; leave out to play without Jugnu. */
  jugnu?: { link: JugnuLink; place: JugnuPlace; lessonId: string | null } | undefined;
  /**
   * How the board is played (play-mode.ts): a banner under the board says right or wrong, with
   * Try again, Ask Jugnu or Continue as the mode allows. Left out (an author's review), each
   * question shows its own note under it instead.
   */
  mode?: PlayMode | undefined;
  /** Drawn as a picture of the board as it stands (a tool's): nothing passing shows on it. */
  isPicture?: boolean;
  /**
   * A tool's board: each line keeps its length on the board's clock, and nothing waits for real
   * sound. A student's board (the default) waits for each line's sound to end.
   */
  isTimed?: boolean;
  /** The board's runtime, once it runs: for a tool beside the board (a prop page's panel). */
  onRuntime?: ((runtime: LiveBoard) => void) | undefined;
};

/**
 * What Jugnu points at or acts on comes into view on the board (which scrolls on its own while the
 * chat is open).
 */
function bringIntoView(root: HTMLElement | null, prop: string): void {
  root
    ?.querySelector(`[data-piece="${CSS.escape(prop)}"]`)
    ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

/**
 * Plays one board: its props, wired by its IS and WHEN rules. Each question answers where it sits;
 * the player only adds the chrome every board shares: Jugnu, and Continue once the board passes.
 */
export function BoardPlayer({
  board,
  registry,
  locale,
  record,
  audio,
  onPass,
  onBack,
  wasPassed = false,
  jugnu: given,
  mode,
  onRuntime,
  isPicture = false,
  isTimed = false,
}: BoardPlayerProps): JSX.Element {
  const policy = mode === undefined ? undefined : modePolicy[mode];
  // A mode without Jugnu (a skill check) plays without him.
  const jugnu = policy?.hasJugnu === false || board.model !== undefined ? undefined : given;
  // Set once the recorder exists (the narrator is made first, and reports through it).
  const recorderRef = useRef<ReturnType<typeof recordBoard> | undefined>(undefined);
  const reportAudioFailure = useCallback(
    (prop: SpokenProp, reason: string) =>
      recorderRef.current?.app(AppWhat.AudioFailed, { reason }, segment(prop.name)),
    [],
  );
  const narrator = useNarrator(locale, audio, reportAudioFailure);
  // The board reads each line's length when it says it: from the narrator as it is then.
  const narratorRef = useRef(narrator);
  narratorRef.current = narrator;
  const runtime = useBoardRuntime(board, registry, narrator.speak, {
    locale,
    lineSeconds: (line) => narratorRef.current.seconds(line),
    isTimed,
    // A tool's board keeps its effects in the log only: nothing is played.
    ...(isTimed ? {} : { effect: playEffect }),
    hush: () => narratorRef.current.hush(),
  });
  // Jugnu runs on today's boards only, for now (scene-runtime.ts).
  const jugnuRuntime = runtime instanceof BoardRuntime ? runtime : undefined;
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
      }),
    [runtime, questions, onPass],
  );

  const isPassed = runtime.getView(BOARD).isPassed === true;

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
  // Something to send Jugnu as the learner, from the banner ("Why was my answer wrong?").
  const [opening, setOpening] = useState<{ text: string; key: number } | undefined>(undefined);
  const askJugnu = (text: string) => {
    setIsJugnuOpen(true);
    setOpening((now) => ({ text, key: (now?.key ?? 0) + 1 }));
  };

  // What Jugnu is pointing at; the glow fades after a few seconds.
  const [pointed, setPointed] = useState<LayoutContext["pointed"]>(undefined);
  useEffect(() => {
    if (pointed === undefined) return;
    bringIntoView(body.current, pointed.prop);
    const timer = setTimeout(() => setPointed(undefined), POINT_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [pointed]);

  // Jugnu's chat opens from his button in the footer; his mood shows on the button.
  const [isJugnuOpen, setIsJugnuOpen] = useState(false);
  const [jugnuMood, setJugnuMood] = useState<JugnuMood>(JugnuMood.Neutral);

  // Hold a thing on the board to ask Jugnu about it: it glows and "Ask Jugnu" appears beside it;
  // taps add more; the pill opens his chat with them as chips. `pill` is where it sits while
  // picking; once the chat is open the picks stay as chips until sent or removed.
  const body = useRef<HTMLElement>(null);
  const [picks, setPicks] = useState<readonly Picked[]>([]);
  const [pill, setPill] = useState<{ x: number; y: number } | undefined>(undefined);
  const toggle = (picked: Picked) =>
    setPicks((now) =>
      now.some((p) => isSamePick(p, picked))
        ? now.filter((p) => !isSamePick(p, picked))
        : [...now, picked],
    );
  useHoldToAsk(body, runtime, locale, jugnu !== undefined, {
    isPicking: pill !== undefined,
    onHold: (picked, at) => {
      setPicks((now) => (now.some((p) => isSamePick(p, picked)) ? now : [...now, picked]));
      if (!isJugnuOpen) setPill((now) => now ?? at);
    },
    onTap: (picked) => {
      if (picked === undefined) {
        setPicks([]);
        setPill(undefined);
        return;
      }
      toggle(picked);
    },
  });
  useEffect(() => {
    if (picks.length === 0) setPill(undefined);
  }, [picks]);
  useEffect(() => {
    if (isJugnuOpen) setPill(undefined);
  }, [isJugnuOpen]);

  const context: LayoutContext = {
    locale,
    registry,
    runtime,
    audioFailed: narrator.failed,
    onRetryAudio: (name) => void runtime.call(name, SAY, {}, Actor.Learner),
    pointed,
    picked: picks,
    isPicture,
  };

  const banner =
    policy === undefined || result === undefined || result === AnswerStatus.Open
      ? undefined
      : result;

  return (
    <PlayModeContext.Provider value={mode}>
      <div
        class={`board${isJugnuOpen ? " is-chatting" : ""}${banner !== undefined ? ` has-banner is-${banner}` : ""}`}
      >
        <main
          class={`board-body${pill !== undefined ? " is-picking" : ""}${isSettled ? " is-settled" : ""}`}
          ref={body}
          onPointerDownCapture={() => recorder.gesture(true)}
        >
          <Layout piece={board.root} context={context} />
          {pill !== undefined && (
            <button
              type="button"
              class="ask-pill"
              data-ask-pill=""
              style={{ left: `${pill.x}px`, top: `${pill.y}px` }}
              onClick={() => setIsJugnuOpen(true)}
            >
              <span aria-hidden="true">✦</span> {t(locale, "askJugnu")}
              {picks.length > 1 && <span class="ask-pill-count">{picks.length}</span>}
            </button>
          )}
        </main>
        {jugnu !== undefined && jugnuRuntime !== undefined && (
          <JugnuPanel
            runtime={jugnuRuntime}
            link={jugnu.link}
            place={mode === undefined ? jugnu.place : { ...jugnu.place, mode }}
            lessonId={jugnu.lessonId}
            recorder={recorder}
            locale={locale}
            onPoint={(prop, part) => setPointed({ prop, part })}
            onAct={(prop) => bringIntoView(body.current, prop)}
            isOpen={isJugnuOpen}
            about={picks}
            onUnpick={(picked) => setPicks((now) => now.filter((p) => !isSamePick(p, picked)))}
            onAsked={() => setPicks([])}
            onClose={() => {
              setIsJugnuOpen(false);
              setPicks([]);
            }}
            onMood={setJugnuMood}
            opening={opening}
          />
        )}
        <footer class={`board-footer${banner !== undefined ? ` has-banner is-${banner}` : ""}`}>
          {policy !== undefined && banner !== undefined && (
            <div class="board-banner">
              <strong>
                {banner === AnswerStatus.Correct
                  ? t(locale, "rightBanner")
                  : t(locale, policy.wrongWord)}
              </strong>
              {jugnu !== undefined && banner === AnswerStatus.Wrong && (
                <button
                  type="button"
                  class="banner-help"
                  onClick={() => askJugnu(t(locale, "whyWrong"))}
                >
                  {t(locale, "askJugnu")}
                </button>
              )}
              {jugnu !== undefined && banner === AnswerStatus.Correct && policy.hasWhy && (
                <button
                  type="button"
                  class="banner-help"
                  onClick={() => askJugnu(t(locale, "whyRight"))}
                >
                  {t(locale, "why")}
                </button>
              )}
            </div>
          )}
          {onBack !== undefined && (
            <button type="button" class="back" aria-label={t(locale, "back")} onClick={onBack}>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M11 3 L5 9 L11 15" />
              </svg>
            </button>
          )}
          {audio !== undefined && (
            <button
              type="button"
              class="back mute"
              aria-label={t(locale, isMuted.value ? "unmute" : "mute")}
              aria-pressed={isMuted.value}
              onClick={() => setMuted(!isMuted.value)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <path class="speaker" d="M3 8 H6 L10 4.5 V15.5 L6 12 H3 Z" />
                {isMuted.value ? (
                  <path d="M13 7.5 L17.5 12 M17.5 7.5 L13 12" />
                ) : (
                  <path d="M13 7 Q15 10 13 13 M15.5 5 Q19 10 15.5 15" />
                )}
              </svg>
            </button>
          )}
          {hasEffects(board, registry) && !isTimed && (
            <button
              type="button"
              class="back mute"
              aria-label={t(locale, isEffectsMuted.value ? "soundsOn" : "soundsOff")}
              aria-pressed={isEffectsMuted.value}
              onClick={() => setEffectsMuted(!isEffectsMuted.value)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <path class="speaker" d="M8 14.5 V5 L15 3.5 V13" />
                <circle cx="6" cy="14.5" r="2" />
                <circle cx="13" cy="13" r="2" />
                {isEffectsMuted.value && <path d="M3 3 L17 17" />}
              </svg>
            </button>
          )}
          {jugnu !== undefined && (
            <button
              type="button"
              class={isJugnuOpen ? "jugnu-button is-open" : "jugnu-button"}
              aria-label={t(locale, "askJugnu")}
              aria-expanded={isJugnuOpen}
              onClick={() => setIsJugnuOpen(!isJugnuOpen)}
            >
              <JugnuFigure mood={jugnuMood} size={44} />
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
          ) : (
            isPassed && (
              <button
                type="button"
                class="primary"
                onClick={() => void runtime.call(BOARD, BoardAction.Continue, {}, Actor.Learner)}
              >
                {t(locale, "continue")}
              </button>
            )
          )}
        </footer>
      </div>
    </PlayModeContext.Provider>
  );
}

/** Whether a board can sound an effect: one of its lesson's, or one of its pieces' own. */
function hasEffects(board: Board, registry: PropRegistry): boolean {
  if (board.model === undefined) return false;
  if (Object.values(board.model.effects ?? {}).some((effect) => effect !== null)) return true;
  return propPieces(board.root).some(
    (piece) => Object.keys(registry[piece.prop]?.sound?.effects ?? {}).length > 0,
  );
}
