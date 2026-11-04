import { Actor, type Board, Locale } from "@chalk/content";
import type { RecordEvent } from "@chalk/events";
import { propLibrary } from "@chalk/library";
import {
  BoardPlayer,
  type BoardRuntime,
  BoardSpeedContext,
  type JugnuChatProps,
  PlayMode,
  replay,
} from "@chalk/player";
import type { JSX } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

/** A step of a try played on top of the recorded events. */
export type Step = { prop: string; action: string; args?: Record<string, unknown> };

/** An event as replay reads it (docs/events.md: the envelope's parts it needs). */
export type EventEntryLike = {
  kind: string;
  actor: string;
  opening: string | null;
  node: string | null;
  payload: unknown;
};

const nothing: RecordEvent = () => -1;

/**
 * A board drawn at a past moment, by the real player: its recorded events played again (boards
 * are deterministic), then any steps of a try. Jugnu's experiments draw each moment with it, and
 * the teacher each try of a child's. Best effort: today's build replays an old try's events.
 */
export function BoardAt({
  path,
  load,
  events,
  steps = [],
  pointed,
  chat,
  width,
  locale = Locale.En,
  isPicture = false,
  onProblem,
  onDrawn,
}: {
  path: string;
  /** The board, as this screen gets it (the preview's tree, or the app's content). */
  load: (path: string) => Promise<Board>;
  events: readonly EventEntryLike[];
  steps?: readonly Step[];
  pointed?: { prop: string; part?: string } | undefined;
  /** The chat as it stood then, drawn in the board's bar exactly as the student saw it. */
  chat?: Omit<JugnuChatProps, "locale"> | undefined;
  width: number;
  locale?: Locale;
  /** Drawn as a picture (a snapshot among others): it scrolls nothing. */
  isPicture?: boolean;
  /** It couldn't be drawn; without it, the problem is shown in its place. */
  onProblem?: (problem: string) => void;
  /** Its events (and steps) are played: the board is as it was then. */
  onDrawn?: (runtime: BoardRuntime) => void;
}): JSX.Element {
  const [board, setBoard] = useState<Board | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  // The latest of the callbacks: a board is fetched once for its path, however often drawn.
  const given = useRef({ load, onProblem, onDrawn });
  given.current = { load, onProblem, onDrawn };
  const fail = useCallback((e: unknown) => {
    setProblem(String(e));
    given.current.onProblem?.(String(e));
  }, []);
  useEffect(() => {
    void given.current.load(path).then(setBoard, fail);
  }, [path, fail]);
  const causes = events.filter((e) => e.kind === "cause");
  const play = (runtime: BoardRuntime) => {
    void (async () => {
      runtime.settle();
      await replay(runtime, events as never, path);
      for (const step of steps) {
        await runtime.call(step.prop, step.action, step.args ?? {}, Actor.Learner);
        runtime.settle();
      }
      given.current.onDrawn?.(runtime);
    })().catch(fail);
  };
  if (problem !== null) return onProblem ? <div /> : <div class="jg-empty">{problem}</div>;
  if (board === null) return <div class="jg-empty">…</div>;
  return (
    <div class="jg-phone" style={{ width: `${width}px` }}>
      <div class="lesson">
        <BoardSpeedContext.Provider value={Number.POSITIVE_INFINITY}>
          <BoardPlayer
            // Drawn again only when an act is passed (a reply or a message doesn't move the board).
            key={`${path}:${causes.length}:${JSON.stringify(steps)}`}
            board={board}
            registry={propLibrary}
            locale={locale}
            record={nothing}
            onPass={() => {}}
            mode={PlayMode.Guided}
            isSilent
            isPicture={isPicture}
            onRuntime={play}
            pointed={pointed}
            chat={chat}
          />
        </BoardSpeedContext.Provider>
      </div>
    </div>
  );
}
