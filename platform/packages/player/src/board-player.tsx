import {
  Actor,
  type Board,
  type Locale,
  MachineType,
  QuestionStatus,
  type Submitted,
  SubmittedKind,
} from "@chalk/content";
import { type Raise, bindRaise } from "@chalk/events";
import type { JugnuPlace } from "@chalk/jugnu";
import {
  AnswerStatus,
  BOARD,
  BoardAction,
  BoardSignal,
  type CheckedPayload,
  PropRole,
  QuestionAction,
  QuestionSignal,
  type QuestionView,
  SAY,
} from "@chalk/prop";
import type { JSX } from "preact";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { type Picked, isSamePick, useHoldToAsk } from "./ask-about";
import { JugnuFigure, JugnuMood } from "./jugnu-figure";
import { type JugnuLink, JugnuPanel } from "./jugnu-panel";
import { Layout, type LayoutContext } from "./layout";
import { type AudioSource, type SpokenProp, useNarrator } from "./narration";
import { type PlayMode, PlayModeContext, modePolicy } from "./play-mode";
import type { PropRegistry } from "./prop-module";
import { propRecords } from "./records";
import type { BoardRuntime } from "./runtime";
import { t } from "./ui-text";
import { useBoardRuntime } from "./use-board-runtime";

/** The permanent id of a board or prop. Lessons are checked as published before they play. */
function permanentId(item: { name: string; id?: number | undefined }): number {
  if (item.id === undefined)
    throw new Error(`"${item.name}" has no permanent id; run publish-lesson`);
  return item.id;
}

/** How long Jugnu's pointing glow stays. */
const POINT_SECONDS = 5;

/** The props playing the question role: a board may ask any number of questions. */
function questionsOf(runtime: BoardRuntime): string[] {
  return runtime.propNames().filter((name) => runtime.getDef(name).role === PropRole.Question);
}

export type BoardPlayerProps = {
  board: Board;
  registry: PropRegistry;
  locale: Locale;
  /** Raises events in this board's place; the board binds it to its machines. */
  raise: Raise;
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
  raise,
  audio,
  onPass,
  onBack,
  wasPassed = false,
  jugnu: given,
  mode,
}: BoardPlayerProps): JSX.Element {
  const policy = mode === undefined ? undefined : modePolicy[mode];
  // A mode without Jugnu (a skill check) plays without him.
  const jugnu = policy?.hasJugnu === false ? undefined : given;
  const reportAudioFailure = useCallback(
    (prop: SpokenProp, reason: string) =>
      bindRaise<typeof MachineType.Line>(raise, { type: MachineType.Line, id: permanentId(prop) })(
        Actor.App,
        { type: "audioFailed", reason },
        { audio: "failed" },
      ),
    [raise],
  );
  const narrator = useNarrator(
    permanentId({ name: board.name, id: board.id }),
    locale,
    audio,
    reportAudioFailure,
  );
  const runtime = useBoardRuntime(board, registry, narrator.speak);
  const questions = useMemo(() => questionsOf(runtime), [runtime]);
  useEffect(() => {
    if (wasPassed) void runtime.call(BOARD, BoardAction.Pass, {}, Actor.App);
  }, [runtime, wasPassed]);

  // Commits become events: a question checked, Continue pressed.
  useEffect(
    () =>
      runtime.onSignal((record) => {
        if (record.prop === BOARD && record.signal === BoardSignal.Continued) {
          bindRaise<typeof MachineType.Board>(raise, {
            type: MachineType.Board,
            id: permanentId(board),
          })(
            record.actor,
            { type: "continue", props: propRecords(board, runtime) },
            { phase: "passed" },
          );
          onPass();
          return;
        }
        if (!questions.includes(record.prop) || record.signal !== QuestionSignal.Checked) return;
        setLastChecked(record.prop);
        const payload = record.payload as CheckedPayload;
        const submitted: Submitted =
          "optionId" in payload
            ? { kind: SubmittedKind.Choice, optionId: payload.optionId }
            : "optionIds" in payload
              ? { kind: SubmittedKind.Choices, optionIds: [...payload.optionIds] }
              : {
                  kind: SubmittedKind.Prop,
                  propId: permanentId({ name: payload.about, id: runtime.idOf(payload.about) }),
                  state: { ...runtime.getFields(payload.about) },
                };
        bindRaise<typeof MachineType.Question>(raise, {
          type: MachineType.Question,
          id: permanentId({ name: record.prop, id: runtime.idOf(record.prop) }),
        })(
          record.actor,
          { type: "check", submitted },
          {
            status:
              payload.status === AnswerStatus.Correct
                ? QuestionStatus.Correct
                : QuestionStatus.Wrong,
            attempts: payload.attempts,
            isGraded: runtime.getStored(record.prop).isGraded === true,
          },
        );
      }),
    [runtime, raise, board, questions, onPass],
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
    onRetryAudio: (name) => void runtime.call(name, SAY),
    pointed,
    picked: picks,
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
        {jugnu !== undefined && (
          <JugnuPanel
            runtime={runtime}
            link={jugnu.link}
            place={mode === undefined ? jugnu.place : { ...jugnu.place, mode }}
            lessonId={jugnu.lessonId}
            boardId={permanentId(board)}
            raise={raise}
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
