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
import type { JugnuPlace, LlmProvider } from "@chalk/jugnu";
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
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { JugnuFigure, JugnuMood } from "./jugnu-figure";
import { JugnuPanel } from "./jugnu-panel";
import { Layout, type LayoutContext } from "./layout";
import { type AudioSource, type SpokenProp, useNarrator } from "./narration";
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
  /** Jugnu's model; leave out to play without Jugnu. */
  jugnu?: { provider: LlmProvider; place: JugnuPlace } | undefined;
};

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
  jugnu,
}: BoardPlayerProps): JSX.Element {
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
        const payload = record.payload as CheckedPayload;
        const submitted: Submitted =
          "optionId" in payload
            ? { kind: SubmittedKind.Choice, optionId: payload.optionId }
            : {
                kind: SubmittedKind.Prop,
                propId: permanentId({ name: payload.about, id: runtime.idOf(payload.about) }),
                state: { ...runtime.getStored(payload.about) },
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

  // What Jugnu is pointing at; the glow fades after a few seconds.
  const [pointed, setPointed] = useState<LayoutContext["pointed"]>(undefined);
  useEffect(() => {
    if (pointed === undefined) return;
    const timer = setTimeout(() => setPointed(undefined), POINT_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [pointed]);

  // Jugnu's chat opens from his button in the footer; his mood shows on the button.
  const [isJugnuOpen, setIsJugnuOpen] = useState(false);
  const [jugnuMood, setJugnuMood] = useState<JugnuMood>(JugnuMood.Neutral);

  const context: LayoutContext = {
    locale,
    registry,
    runtime,
    audioFailed: narrator.failed,
    onRetryAudio: (name) => void runtime.call(name, SAY),
    pointed,
  };

  return (
    <div class="board">
      <main class="board-body">
        <Layout piece={board.root} context={context} />
      </main>
      {jugnu !== undefined && (
        <JugnuPanel
          runtime={runtime}
          provider={jugnu.provider}
          place={jugnu.place}
          boardId={permanentId(board)}
          raise={raise}
          locale={locale}
          onPoint={(prop, part) => setPointed({ prop, part })}
          isOpen={isJugnuOpen}
          onClose={() => setIsJugnuOpen(false)}
          onMood={setJugnuMood}
        />
      )}
      <footer class="board-footer">
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
        {isPassed && (
          <button
            type="button"
            class="primary"
            onClick={() => void runtime.call(BOARD, BoardAction.Continue, {}, Actor.Learner)}
          >
            {t(locale, "continue")}
          </button>
        )}
      </footer>
    </div>
  );
}
