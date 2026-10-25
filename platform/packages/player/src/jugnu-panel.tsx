import { Actor, type ItemRef, type Locale, MachineType } from "@chalk/content";
import { type Raise, bindRaise } from "@chalk/events";
import {
  type ChatMessage,
  type JugnuPlace,
  JugnuSession,
  type JugnuThink,
  type JugnuTurn,
  type PlayedCue,
} from "@chalk/jugnu";
import type { JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { Picked } from "./ask-about";
import { type BoardState, boardState } from "./headless";
import { JugnuFigure, JugnuMood } from "./jugnu-figure";
import { RichText } from "./rich-text-view";
import type { BoardRuntime } from "./runtime";
import { canSpeak, hush, speak, useSpeech } from "./speech";
import { t } from "./ui-text";

/** One line of the chat as the student saw it. */
export type ShownMessage = {
  from: "learner" | "jugnu" | "did" | "problem";
  text: string;
  /** The chips of what the student held to ask about. */
  about?: readonly string[];
};

/** A chat someone flagged: everything needed to look at it again, and replay it on the bench. */
export type JugnuFlag = {
  lessonId: string | null;
  boardId: number | null;
  /** The board's name, and the built item it was made from (none for a board made by hand). */
  board: string;
  item: ItemRef | null;
  place: JugnuPlace;
  /** The board when the chat started, and now. */
  stateAtStart: BoardState;
  state: BoardState;
  /** The chat as the model saw it. */
  chat: readonly ChatMessage[];
  shown: readonly ShownMessage[];
  note: string;
};

/** What the player needs to have Jugnu on its boards: where he thinks, and where a flag goes. */
export type JugnuLink = {
  /** Where one board's turns are thought through (the server, on its copy of the board). */
  think: (runtime: BoardRuntime, place: JugnuPlace) => JugnuThink;
  /** Keeps a chat someone wasn't happy with; leave out for no flag button. */
  flag?: (flag: JugnuFlag) => Promise<void>;
};

/** How long a pointed prop's glow holds before his next words. */
const POINT_MS = 700;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
/** Time to take in a line before the next appears: unhurried, but never long. */
const readingMs = (text: string) => Math.min(1400, 250 + text.length * 12);

export type JugnuPanelProps = {
  runtime: BoardRuntime;
  link: JugnuLink;
  place: JugnuPlace;
  lessonId: string | null;
  /** This board's permanent id: Jugnu's chats are logged against it. */
  boardId: number;
  raise: Raise;
  locale: Locale;
  /** Jugnu points at a prop, or a part of it: the board makes it glow. */
  onPoint: (prop: string, part: string | undefined) => void;
  /** The chat is open. The board opens it from Jugnu's button in its footer. */
  isOpen: boolean;
  /** What the student held on the board to ask about: chips in the box, sent with the next message. */
  about: readonly Picked[];
  onUnpick: (picked: Picked) => void;
  /** The picks went with a message. */
  onAsked: () => void;
  onClose: () => void;
  /** What Jugnu is doing, so his button in the footer can show it. */
  onMood: (mood: JugnuMood) => void;
  /** He did something to this prop on the board (so the board can bring it into view). */
  onAct?: ((prop: string) => void) | undefined;
  /** Sent as the learner's message each time its key changes (the banner's "Why was my answer wrong?"). */
  opening?: { text: string; key: number } | undefined;
};

/** The sheet's heights: down to its header, fitted to the latest exchange, or up over the board. */
const Sheet = { Low: "low", Fit: "fit", Full: "full" } as const;
type Sheet = (typeof Sheet)[keyof typeof Sheet];
/** Most of the screen a fitted sheet takes (as `.jugnu.is-fit` in jugnu.css: 50dvh). */
const FIT_SHARE = 0.5;
/** A finger moving less than this is a tap on the grip, not a drag. */
const TAP_SLOP_PX = 6;

/**
 * Show the latest exchange: scrolled to the end when it fits, else with the student's last message
 * at the top so his whole answer reads from its start. Older messages are a scroll up.
 */
function showLatest(box: HTMLElement | null): void {
  if (box === null) return;
  const asked = [...box.querySelectorAll<HTMLElement>(".jugnu-message.is-learner")].at(-1);
  const end = box.scrollHeight - box.clientHeight;
  const start =
    asked === undefined
      ? end
      : asked.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 12;
  box.scrollTop = Math.max(0, Math.min(start, end));
}

/**
 * Jugnu's chat for one board. He acts only when the learner asks or taps one of his options; after
 * answering he goes quiet and the panel shrinks so the board is theirs. Each turn is thought through elsewhere (the server, on its
 * copy of the board) and plays here at an easy pace: his words, a gentle glow on what he means, his
 * actions through the board's own door, options to tap. Each turn is logged as one event.
 */
export function JugnuPanel({
  runtime,
  link,
  place,
  lessonId,
  boardId,
  raise,
  locale,
  onPoint,
  onAct,
  isOpen,
  about,
  onUnpick,
  onAsked,
  onClose,
  onMood,
  opening,
}: JugnuPanelProps): JSX.Element | null {
  const [messages, setMessages] = useState<readonly ShownMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [options, setOptions] = useState<readonly string[]>([]);
  // How tall the sheet is: fitted to the latest exchange, dragged up to read the chat, or down to
  // the header and the input. While dragged, its height follows the finger (`dragged`).
  const [sheet, setSheet] = useState<Sheet>(Sheet.Fit);
  const [dragged, setDragged] = useState<number | undefined>(undefined);
  const section = useRef<HTMLElement>(null);
  /** Down to its header, the sheet comes back up when they type, pick or flag. */
  const unlow = () => setSheet((now) => (now === Sheet.Low ? Sheet.Fit : now));
  const [flagState, setFlagState] = useState<"closed" | "open" | "sending" | "sent" | "failed">(
    "closed",
  );
  const [flagNote, setFlagNote] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  // He speaks his lines aloud unless muted; remembered on this device.
  const [isVoiceOn, setIsVoiceOn] = useState(() => {
    try {
      return localStorage.getItem("jugnu-voice") !== "off";
    } catch {
      return true;
    }
  });
  const setVoice = (on: boolean) => {
    setIsVoiceOn(on);
    if (!on) hush();
    try {
      localStorage.setItem("jugnu-voice", on ? "on" : "off");
    } catch {}
  };
  // Read inside callbacks that outlive a render.
  const live = useRef({ onPoint, onAct, isVoiceOn });
  live.current = { onPoint, onAct, isVoiceOn };
  const say = (message: ShownMessage) => setMessages((m) => [...m, message]);

  // One session per board: the place object is rebuilt on every render, so key on its values.
  const { lessonTitle, boardNumber, boardCount, mode } = place;
  const { session, stateAtStart } = useMemo(() => {
    const where = {
      lessonTitle,
      boardNumber,
      boardCount,
      locale,
      ...(mode !== undefined ? { mode } : {}),
    };
    return {
      stateAtStart: boardState(runtime),
      session: new JugnuSession(runtime, undefined, where, {
        think: link.think(runtime, where),
        onEvent: async (event) => {
          // He is talking or acting on the board: the sheet comes back to its fitted height so
          // both his words and the board are in view.
          setSheet(Sheet.Fit);
          if (event.kind === "act") live.current.onAct?.(event.prop);
          if (event.kind === "say") {
            setMessages((m) => [...m, { from: "jugnu", text: event.text }]);
            if (live.current.isVoiceOn && canSpeak()) await speak(event.text, locale);
            else await sleep(readingMs(event.text));
            return;
          }
          if (event.kind === "point") {
            live.current.onPoint(event.prop, event.part);
            await sleep(POINT_MS);
            return;
          }
          if (event.kind === "ask") setOptions(event.options);
          // What he does on the board, the student sees on the board; the chat says nothing.
        },
      }),
    };
  }, [runtime, link, lessonTitle, boardNumber, boardCount, locale, mode]);
  useEffect(
    () => () => {
      session.close();
      hush();
    },
    [session],
  );

  // The phone's keyboard must not cover the chat. Android resizes the page for it (the viewport's
  // interactive-widget); where the keyboard only overlays the page (iOS), lift the chat above it.
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!isOpen || viewport === null) return;
    const lift = () => {
      const covered = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty("--keyboard-inset", `${Math.round(covered)}px`);
      showLatest(list.current);
    };
    lift();
    viewport.addEventListener("resize", lift);
    viewport.addEventListener("scroll", lift);
    return () => {
      viewport.removeEventListener("resize", lift);
      viewport.removeEventListener("scroll", lift);
      document.documentElement.style.removeProperty("--keyboard-inset");
    };
  }, [isOpen]);

  // Picked something to ask about: the box is ready for their question.
  useEffect(() => {
    if (isOpen && about.length > 0) {
      setSheet((now) => (now === Sheet.Low ? Sheet.Fit : now));
      input.current?.focus();
    }
  }, [isOpen, about.length]);

  // Keep the latest exchange in view: the chat always opens on it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on purpose when these change
  useEffect(() => showLatest(list.current), [messages, isThinking, options, isOpen, sheet]);

  const log = (
    input: { type: "ask"; text: string; about?: { prop: string; part?: string; text?: string }[] },
    turn: JugnuTurn,
  ) =>
    bindRaise<typeof MachineType.Jugnu>(raise, { type: MachineType.Jugnu, id: boardId })(
      Actor.Learner,
      input,
      {
        reply: turn.reply,
        steps: turn.events.filter((event) => event.kind !== "say"),
        model: turn.model,
      },
    );

  /** `asked`: what they typed or tapped, and what they held to ask about. */
  const runTurn = async (asked: { text: string; isOption: boolean; about: readonly Picked[] }) => {
    setIsThinking(true);
    unlow();
    setOptions([]);
    const refs = asked.about.map(({ label: _, ...ref }) => ref);
    try {
      const turn = asked.isOption
        ? await session.choose(asked.text)
        : await session.ask(asked.text, refs);
      log({ type: "ask", text: asked.text, ...(refs.length > 0 ? { about: refs } : {}) }, turn);
    } catch (error) {
      console.error("Jugnu:", error);
      // While we build, say exactly what failed (the server's own words).
      const detail = error instanceof Error ? error.message : String(error);
      say({ from: "problem", text: `${t(locale, "jugnuUnreachable")} (${detail.slice(0, 240)})` });
    } finally {
      setIsThinking(false);
    }
  };

  const ask = (text: string, isOption: boolean) => {
    const picked = isOption ? [] : about;
    // Holding something and sending nothing asks what it is.
    const said = text.trim() === "" && picked.length > 0 ? t(locale, "whatsThis") : text.trim();
    if (said === "" || isThinking) return;
    say({
      from: "learner",
      text: said,
      ...(picked.length > 0 ? { about: picked.map((p) => p.label) } : {}),
    });
    if (picked.length > 0) onAsked();
    void runTurn({ text: said, isOption, about: picked });
  };

  const send = (event: JSX.TargetedEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft;
    setDraft("");
    ask(text, false);
  };

  // The banner asked for them: send it as their message, once per key.
  const sentOpening = useRef(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: once per key
  useEffect(() => {
    if (opening === undefined || opening.key === sentOpening.current) return;
    sentOpening.current = opening.key;
    ask(opening.text, false);
  }, [opening?.key]);

  // Voice: what they say goes into the box, to check and send.
  const speech = useSpeech(locale, (heard) =>
    setDraft((d) => (d === "" ? heard : `${d} ${heard}`)),
  );

  const sendFlag = async () => {
    if (link.flag === undefined) return;
    setFlagState("sending");
    try {
      await link.flag({
        lessonId,
        boardId,
        board: runtime.board.name,
        item: runtime.board.item ?? null,
        place: {
          lessonTitle,
          boardNumber,
          boardCount,
          locale,
          ...(mode !== undefined ? { mode } : {}),
        },
        stateAtStart,
        state: boardState(runtime),
        chat: session.messages,
        shown: messages,
        note: flagNote.trim(),
      });
      setFlagState("sent");
      setFlagNote("");
    } catch (error) {
      console.error("Flag:", error);
      setFlagState("failed");
    }
  };

  // His face shows what he is doing: thinking, or listening to what's typed.
  const mood = isThinking
    ? JugnuMood.Thinking
    : draft.trim() !== "" || speech.isListening
      ? JugnuMood.Listening
      : JugnuMood.Neutral;
  useEffect(() => onMood(mood), [mood, onMood]);

  // The whole chat, opened on the latest exchange (showLatest); earlier turns are a scroll up.
  const lastAsked = messages.map((message) => message.from).lastIndexOf("learner");
  const isWaiting =
    isThinking && !messages.slice(lastAsked + 1).some((message) => message.from === "jugnu");
  const shown = messages;
  const hasChat = messages.some((message) => message.from === "jugnu");

  /**
   * Drag the grip: the sheet follows the finger, then settles at the nearest of its heights,
   * measured now (the header and input alone; the latest exchange, up to FIT_SHARE of the screen;
   * all the room above the footer). A tap without a drag opens it fully, or back to fitted.
   */
  const startDrag = (event: JSX.TargetedPointerEvent<HTMLDivElement>) => {
    const box = section.current;
    const messagesBox = list.current;
    if (box === null || messagesBox === null) return;
    const grip = event.currentTarget;
    grip.setPointerCapture(event.pointerId);
    const footer = box.parentElement?.querySelector<HTMLElement>(".board-footer");
    const room =
      (box.parentElement?.clientHeight ?? window.innerHeight) - (footer?.offsetHeight ?? 0);
    const chrome = box.offsetHeight - messagesBox.offsetHeight;
    const heights: Record<Sheet, number> = {
      [Sheet.Low]: chrome,
      [Sheet.Fit]: Math.min(chrome + messagesBox.scrollHeight, window.innerHeight * FIT_SHARE),
      [Sheet.Full]: room,
    };
    const startY = event.clientY;
    const startHeight = box.offsetHeight;
    let height = startHeight;
    const move = (e: PointerEvent) => {
      height = Math.min(room, Math.max(chrome, startHeight + startY - e.clientY));
      setDragged(height);
    };
    const end = (e: PointerEvent) => {
      grip.removeEventListener("pointermove", move);
      grip.removeEventListener("pointerup", end);
      grip.removeEventListener("pointercancel", end);
      setDragged(undefined);
      if (Math.abs(e.clientY - startY) < TAP_SLOP_PX) {
        setSheet((now) => (now === Sheet.Full ? Sheet.Fit : Sheet.Full));
        return;
      }
      const nearest = (Object.keys(heights) as Sheet[]).reduce((a, b) =>
        Math.abs(heights[a] - height) <= Math.abs(heights[b] - height) ? a : b,
      );
      setSheet(nearest);
    };
    grip.addEventListener("pointermove", move);
    grip.addEventListener("pointerup", end);
    grip.addEventListener("pointercancel", end);
  };

  // Closed, he lives on as his button in the board's footer; the session keeps running here.
  if (!isOpen) return null;

  return (
    <section
      ref={section}
      class={`jugnu is-${sheet}${dragged !== undefined ? " is-dragging" : ""}`}
      style={dragged !== undefined ? { height: `${dragged}px` } : undefined}
      aria-label={t(locale, "jugnu")}
      onFocusIn={unlow}
    >
      <div class="jugnu-grip" aria-hidden="true" onPointerDown={startDrag}>
        <span />
      </div>
      <header class="jugnu-header">
        <JugnuFigure mood={mood} size={44} />
        <strong>
          <button type="button" class="jugnu-title" onClick={unlow}>
            {t(locale, "jugnu")}
          </button>
        </strong>
        {canSpeak() && (
          <button
            type="button"
            class="jugnu-flag"
            aria-label={t(locale, isVoiceOn ? "voiceOff" : "voiceOn")}
            title={t(locale, isVoiceOn ? "voiceOff" : "voiceOn")}
            aria-pressed={isVoiceOn}
            onClick={() => setVoice(!isVoiceOn)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 8 H6 L10 4.5 V15.5 L6 12 H3 Z" />
              {isVoiceOn ? (
                <path d="M12.5 7.5 Q14.5 10 12.5 12.5 M14.5 5.5 Q18 10 14.5 14.5" />
              ) : (
                <path d="M13 8 L17 12 M17 8 L13 12" />
              )}
            </svg>
          </button>
        )}
        {link.flag !== undefined && hasChat && flagState === "closed" && (
          <button
            type="button"
            class="jugnu-flag"
            aria-label={t(locale, "flagChat")}
            title={t(locale, "flagChat")}
            onClick={() => {
              unlow();
              setFlagState("open");
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 18 V3 M5 3 H15 L12.5 7 L15 11 H5" />
            </svg>
          </button>
        )}
        <button
          type="button"
          class="jugnu-close"
          aria-label={t(locale, "closeJugnu")}
          onClick={onClose}
        >
          ×
        </button>
      </header>
      <div class="jugnu-messages" aria-live="polite" ref={list}>
        {shown.map((message, i) => (
          // Messages are only ever appended, so the index is a stable key.
          // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
          <p key={i} class={`jugnu-message is-${message.from}`}>
            {message.about?.map((label) => (
              <span key={label} class="jugnu-chip">
                {label}
              </span>
            ))}
            <RichText text={message.text} />
          </p>
        ))}
        {isWaiting && (
          <p class="jugnu-message is-thinking" aria-label={t(locale, "jugnuThinking")}>
            <span class="jugnu-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </p>
        )}
        {!isThinking && options.length > 0 && (
          <div class="jugnu-options">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                class="jugnu-option"
                onClick={() => ask(option, true)}
              >
                <RichText text={option} />
              </button>
            ))}
          </div>
        )}
        {flagState === "sent" && <p class="jugnu-message is-watching">{t(locale, "flagged")}</p>}
      </div>
      {flagState === "open" || flagState === "sending" || flagState === "failed" ? (
        <form
          class="jugnu-ask jugnu-flag-form"
          onSubmit={(event) => {
            event.preventDefault();
            void sendFlag();
          }}
        >
          <input
            type="text"
            value={flagNote}
            maxLength={1000}
            placeholder={t(locale, flagState === "failed" ? "flagFailed" : "flagNote")}
            aria-label={t(locale, "flagNote")}
            onInput={(event) => setFlagNote(event.currentTarget.value)}
          />
          <button type="button" class="is-quiet" onClick={() => setFlagState("closed")}>
            {t(locale, "flagCancel")}
          </button>
          <button type="submit" disabled={flagState === "sending"}>
            {t(locale, "flagSend")}
          </button>
        </form>
      ) : (
        <form class="jugnu-ask" onSubmit={send}>
          {about.length > 0 && (
            <div class="jugnu-about">
              {about.map((picked) => (
                <span
                  key={`${picked.prop}:${picked.part ?? ""}:${picked.text ?? ""}`}
                  class="jugnu-chip"
                >
                  {picked.label}
                  <button
                    type="button"
                    aria-label={t(locale, "unpick")}
                    onClick={() => onUnpick(picked)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <input
            ref={input}
            type="text"
            value={draft}
            placeholder={t(locale, speech.isListening ? "jugnuListening" : "jugnuPlaceholder")}
            aria-label={t(locale, "jugnuPlaceholder")}
            enterKeyHint="send"
            onInput={(event) => setDraft(event.currentTarget.value)}
          />
          {draft.trim() === "" && speech.isAvailable && (
            <button
              type="button"
              class={`jugnu-mic${speech.isListening ? " is-listening" : ""}`}
              aria-label={t(locale, "speak")}
              aria-pressed={speech.isListening}
              disabled={isThinking}
              onClick={speech.isListening ? speech.stop : speech.start}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                <rect x="8" y="2.5" width="6" height="11" rx="3" />
                <path d="M4.5 10.5 a6.5 6.5 0 0 0 13 0 M11 17 V20" />
              </svg>
            </button>
          )}
          {(draft.trim() !== "" || about.length > 0 || !speech.isAvailable) && (
            <button
              type="submit"
              disabled={isThinking || (draft.trim() === "" && about.length === 0)}
            >
              {t(locale, "send")}
            </button>
          )}
        </form>
      )}
    </section>
  );
}
