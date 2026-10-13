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
import { JugnuPanel } from "./JugnuPanel";
import { Layout, type LayoutContext } from "./Layout";
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

/** The board's question, if it has one: the prop playing the question role. */
function questionOf(runtime: BoardRuntime): string | undefined {
  return runtime.propNames().find((name) => runtime.getDef(name).role === PropRole.Question);
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
  /** Jugnu's model; leave out to play without Jugnu. */
  jugnu?: { provider: LlmProvider; place: JugnuPlace } | undefined;
};

/**
 * Plays one board: its props, wired by its IS and WHEN rules. The player only adds the chrome every
 * board shares: Check for the board's question, the feedback bar, and Continue once the board passes.
 */
export function BoardPlayer({
  board,
  registry,
  locale,
  raise,
  audio,
  onPass,
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
  const question = useMemo(() => questionOf(runtime), [runtime]);

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
        if (record.prop !== question || record.signal !== QuestionSignal.Checked) return;
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
          },
        );
      }),
    [runtime, raise, board, question, onPass],
  );

  const isPassed = runtime.getView(BOARD).isPassed === true;
  const asked =
    question === undefined
      ? undefined
      : (runtime.getView(question) as unknown as QuestionView & { about?: string });
  // Check stays off until the learner has done something to check: picked an option, or moved the prop.
  const canCheck =
    asked?.canCheck === true && (asked.about === undefined || runtime.isTouched(asked.about));

  // What Jugnu is pointing at; the glow fades after a few seconds.
  const [pointed, setPointed] = useState<LayoutContext["pointed"]>(undefined);
  useEffect(() => {
    if (pointed === undefined) return;
    const timer = setTimeout(() => setPointed(undefined), POINT_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [pointed]);

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
      {asked !== undefined && asked.status !== AnswerStatus.Open && (
        <output
          class={
            asked.status === AnswerStatus.Correct ? "feedback is-correct" : "feedback is-wrong"
          }
        >
          <strong>
            {t(locale, asked.status === AnswerStatus.Correct ? "correct" : "notQuite")}
          </strong>
          {asked.feedback !== null && <span>{asked.feedback[locale]}</span>}
        </output>
      )}
      {/* Jugnu is on question boards only, for now. */}
      {jugnu !== undefined && question !== undefined && (
        <JugnuPanel
          runtime={runtime}
          provider={jugnu.provider}
          place={jugnu.place}
          boardId={permanentId(board)}
          raise={raise}
          locale={locale}
          onPoint={(prop, part) => setPointed({ prop, part })}
        />
      )}
      <footer class="board-footer">
        {isPassed ? (
          <button
            type="button"
            class="primary"
            onClick={() => void runtime.call(BOARD, BoardAction.Continue, {}, Actor.Learner)}
          >
            {t(locale, "continue")}
          </button>
        ) : (
          question !== undefined && (
            <button
              type="button"
              class="primary"
              disabled={!canCheck}
              onClick={() => void runtime.call(question, QuestionAction.Check, {}, Actor.Learner)}
            >
              {t(locale, asked?.status === AnswerStatus.Wrong ? "tryAgain" : "check")}
            </button>
          )
        )}
      </footer>
    </div>
  );
}
