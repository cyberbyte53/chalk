import { Actor, type Locale, MachineType } from "@chalk/content";
import { type Raise, bindRaise } from "@chalk/events";
import {
  type JugnuEvent,
  type JugnuPlace,
  JugnuSession,
  type JugnuTurn,
  type LlmProvider,
} from "@chalk/jugnu";
import type { JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { BoardRuntime } from "./runtime";
import { t } from "./ui-text";

type Message =
  | { from: "learner"; text: string }
  | { from: "jugnu"; text: string }
  /** Something he did on the board, shown as a small line under his words. */
  | { from: "did"; text: string }
  | { from: "problem"; text: string };

/** After the student's last move on a prop Jugnu is watching, wait this long before he looks. */
const SETTLE_MS = 1500;

export type JugnuPanelProps = {
  runtime: BoardRuntime;
  provider: LlmProvider;
  place: JugnuPlace;
  /** This board's permanent id: Jugnu's chats are logged against it. */
  boardId: number;
  raise: Raise;
  locale: Locale;
  /** Jugnu points at a prop, or a part of it: the board makes it glow. */
  onPoint: (prop: string, part: string | undefined) => void;
};

/** What the chat shows for one thing he did; undefined for what the student needn't see. */
function didText(event: JugnuEvent): string | undefined {
  if (event.kind === "act" && event.refused === undefined)
    return `✦ ${event.prop} · ${event.action}`;
  return undefined;
}

/**
 * Jugnu's chat for one board. He acts only when the learner asks, or when they make the move he
 * handed back for, and only through the board's own actions (see @chalk/jugnu). What he says and
 * does shows as it happens; each turn is logged as one event.
 */
export function JugnuPanel({
  runtime,
  provider,
  place,
  boardId,
  raise,
  locale,
  onPoint,
}: JugnuPanelProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<readonly Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [watching, setWatching] = useState<readonly string[]>([]);
  // Small while the board is the student's, so they can see it and act; big again on a tap.
  const [isPeek, setIsPeek] = useState(false);
  const listEnd = useRef<HTMLDivElement>(null);
  // Read inside callbacks that outlive a render.
  const live = useRef({ isOpen, isThinking, onPoint });
  live.current = { isOpen, isThinking, onPoint };

  // One session per board: the place object is rebuilt on every render, so key on its values.
  const { lessonTitle, boardNumber, boardCount } = place;
  const session = useMemo(
    () =>
      new JugnuSession(
        runtime,
        provider,
        { lessonTitle, boardNumber, boardCount, locale },
        {
          onEvent: (event) => {
            if (event.kind === "say") {
              setMessages((m) => [...m, { from: "jugnu", text: event.text }]);
              return;
            }
            if (event.kind === "point" && event.refused === undefined)
              live.current.onPoint(event.prop, event.part);
            const text = didText(event);
            if (text !== undefined) setMessages((m) => [...m, { from: "did", text }]);
          },
        },
      ),
    [runtime, provider, lessonTitle, boardNumber, boardCount, locale],
  );
  useEffect(() => () => session.close(), [session]);

  // Keep the newest message in view whenever one arrives (the list itself isn't read here).
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on purpose when these change
  useEffect(() => listEnd.current?.scrollIntoView({ block: "end" }), [messages, isThinking]);

  const log = (
    input: { type: "ask"; text: string } | { type: "moved"; props: string[] },
    turn: JugnuTurn,
  ) =>
    bindRaise<typeof MachineType.Jugnu>(raise, { type: MachineType.Jugnu, id: boardId })(
      Actor.Learner,
      input,
      {
        reply: turn.reply,
        steps: turn.events.filter((event) => event.kind !== "say"),
        watching: turn.watching,
        model: turn.model,
      },
    );

  const runTurn = async (asked: string | undefined) => {
    const moved = [...session.watchedProps];
    setIsThinking(true);
    setIsPeek(false);
    setWatching([]);
    try {
      const turn = asked === undefined ? await session.continue() : await session.ask(asked);
      if (turn.isFallback) setMessages((m) => [...m, { from: "jugnu", text: turn.reply }]);
      setWatching(turn.watching);
      setIsPeek(turn.watching.length > 0);
      log(
        asked === undefined ? { type: "moved", props: moved } : { type: "ask", text: asked },
        turn,
      );
    } catch (error) {
      console.error("Jugnu:", error);
      // While we build, say exactly what failed (the model server's own words).
      const detail = error instanceof Error ? error.message : String(error);
      setMessages((m) => [
        ...m,
        { from: "problem", text: `${t(locale, "jugnuUnreachable")} (${detail.slice(0, 240)})` },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // He handed the board back: once the student's move settles, he looks and goes on.
  // runTurn is rebuilt each render but only reads the session, refs and stable setters.
  // biome-ignore lint/correctness/useExhaustiveDependencies: subscribe once per session
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = session.onStudentMove(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (live.current.isOpen && !live.current.isThinking) void runTurn(undefined);
      }, SETTLE_MS);
    });
    return () => {
      stop();
      clearTimeout(timer);
    };
  }, [session]);

  const send = (event: JSX.TargetedEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (text === "" || isThinking) return;
    setDraft("");
    setMessages((m) => [...m, { from: "learner", text }]);
    void runTurn(text);
  };

  // In peek, only his last words show above "your turn".
  const lastWords = [...messages].reverse().find((message) => message.from === "jugnu");
  const shown = isPeek ? (lastWords === undefined ? [] : [lastWords]) : messages;

  if (!isOpen) {
    return (
      <button type="button" class="jugnu-open" onClick={() => setIsOpen(true)}>
        <span class="jugnu-glow" aria-hidden="true" />
        {t(locale, "askJugnu")}
      </button>
    );
  }

  return (
    <section
      class={`jugnu${isPeek ? " is-peek" : ""}`}
      aria-label={t(locale, "jugnu")}
      onFocusIn={() => setIsPeek(false)}
    >
      <header class="jugnu-header">
        <span class="jugnu-glow" aria-hidden="true" />
        <strong>
          <button type="button" class="jugnu-title" onClick={() => setIsPeek(false)}>
            {t(locale, "jugnu")}
          </button>
        </strong>
        <button
          type="button"
          class="jugnu-close"
          aria-label={t(locale, "closeJugnu")}
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>
      </header>
      <div class="jugnu-messages" aria-live="polite">
        {!isPeek && <p class="jugnu-message is-jugnu">{t(locale, "jugnuHello")}</p>}
        {shown.map((message, i) => (
          // Messages are only ever appended, so the index is a stable key.
          // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
          <p key={i} class={`jugnu-message is-${message.from}`}>
            {message.text}
          </p>
        ))}
        {isThinking && <p class="jugnu-message is-thinking">{t(locale, "jugnuThinking")}</p>}
        {!isThinking && watching.length > 0 && (
          <p class="jugnu-message is-watching">{t(locale, "jugnuWatching")}</p>
        )}
        <div ref={listEnd} />
      </div>
      <form class="jugnu-ask" onSubmit={send}>
        <input
          type="text"
          value={draft}
          placeholder={t(locale, "jugnuPlaceholder")}
          aria-label={t(locale, "jugnuPlaceholder")}
          onInput={(event) => setDraft(event.currentTarget.value)}
        />
        <button type="submit" disabled={isThinking || draft.trim() === ""}>
          {t(locale, "send")}
        </button>
      </form>
    </section>
  );
}
