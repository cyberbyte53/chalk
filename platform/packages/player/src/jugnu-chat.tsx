/** @jsxImportSource preact */
import type { Locale } from "@chalk/content";
import type { JSX } from "preact";
import { useLayoutEffect, useRef, useState } from "preact/hooks";
import { type Chat, type ChatMessage, ChatState } from "./chat";
import { JugnuMood } from "./jugnu-figure";
import { t } from "./ui-text";

/**
 * The chat with Jugnu as the student meets it (platform/docs/plans/jugnu-chat.md), drawn in the
 * board's bottom bar so the board stays live above it and a glowed part stays in sight. One message
 * in front (his latest, with his choices); earlier ones a tap away. The student answers in words (a
 * tapped choice, or typed; what they did on the board goes with their words). While they act on the
 * board it is one line.
 * Live it is given callbacks; without them it is read-only (a run, seen as the student saw it).
 * His note and thinking are never here.
 */
export type JugnuChatProps = {
  locale: Locale;
  chat: Chat;
  /** One line (his question), while the student acts on the board: a tap opens the chat. */
  isOneLine?: boolean;
  /** The student says something: typed words or a tapped choice. */
  onSay?: (text: string, via: "typed" | "choice") => void;
  /** The student opens the full chat again from its one line. */
  onOpen?: () => void;
  /** The reply box took focus (the keyboard is up): what he points at is kept in sight. */
  onReplyFocus?: () => void;
  /** The bar's figure, on a wrong answer: Get help (asks "Why is it wrong?" for them). */
  onGetHelp?: () => void;
  /** The bar's figure otherwise: open the chat to ask. */
  onAsk?: () => void;
  /** The bar's figure while the chat is open: close it (the student is done talking). */
  onClose?: () => void;
  /** He couldn't be reached: said in his place, in the chat. */
  problem?: string;
};

/** What the student did on the board, in a few words ("step right ×3, check"). */
function didText(did: Extract<ChatMessage, { from: "student" }>["did"]): string {
  const out: { text: string; times: number }[] = [];
  for (const d of did) {
    const args = Object.values(d.args).map(String).join(" ");
    const text = args === "" ? d.action : `${d.action} ${args}`;
    const last = out.at(-1);
    if (last?.text === text) last.times += 1;
    else out.push({ text, times: 1 });
  }
  return out.map((o) => (o.times > 1 ? `${o.text} ×${o.times}` : o.text)).join(", ");
}

/** Jugnu's face for where the chat stands: thinking while he types, proud at his hand-back. */
export function moodOf(chat: Chat): JugnuMood {
  if (chat.state === ChatState.Closed) return JugnuMood.Neutral;
  if (chat.state === ChatState.Thinking) return JugnuMood.Thinking;
  if (chat.state === ChatState.HandedBack) return JugnuMood.Proud;
  return JugnuMood.Curious;
}

/**
 * The chat's sheet, under the bar's row (Jugnu's figure, the board's button): the conversation as a
 * thread of bubbles in time, his on the left and the student's on the right, newest at the bottom
 * (the sheet opens scrolled there; earlier ones scroll up). What the student did on the board sits
 * in the thread as a small note before their words. His typing dots are his bubble; his choices sit
 * under his latest one; the reply box at the bottom. One line while they act on the board.
 */
export function JugnuChat({
  locale,
  chat,
  isOneLine = false,
  onSay,
  onOpen,
  onReplyFocus,
  problem,
}: JugnuChatProps): JSX.Element | null {
  const [typed, setTyped] = useState("");
  // While they type (the keyboard up), his choices fold away: the board stays seen.
  const [isTyping, setTyping] = useState(false);
  const thread = useRef<HTMLDivElement>(null);
  const isClosed = chat.state === ChatState.Closed;
  const isThinking = chat.state === ChatState.Thinking;
  // The newest is always in sight: the thread scrolled to its end as it grows.
  // biome-ignore lint/correctness/useExhaustiveDependencies: each is a way the thread grows
  useLayoutEffect(() => {
    const el = thread.current;
    if (el !== null) el.scrollTop = el.scrollHeight;
  }, [chat.messages.length, isThinking, problem, isOneLine, isClosed]);
  if (isClosed) return null;
  const isLive = onSay !== undefined;
  const last = chat.messages.at(-1);
  const his = [...chat.messages].reverse().find((m) => m.from === "jugnu");
  const words = (m: ChatMessage) =>
    m.from === "student" && m.via === "getHelp" ? t(locale, "whyWrong") : m.text;

  if (isOneLine && his !== undefined && !isThinking)
    return (
      <div class="jugnu-sheet is-one-line">
        <button type="button" class="jugnu-line" onClick={onOpen} disabled={onOpen === undefined}>
          {his.text}
        </button>
      </div>
    );

  return (
    <div class="jugnu-sheet">
      <span class="jugnu-handle" aria-hidden="true" />
      <div class="jugnu-thread" ref={thread}>
        {chat.messages.map((m) =>
          m.from === "jugnu" ? (
            <p key={m.seq} class="jugnu-bubble is-his">
              {m.text}
            </p>
          ) : (
            <div key={m.seq} class="jugnu-turn">
              {m.did.length > 0 && (
                <span class="jugnu-note">
                  {t(locale, "jugnuDid")}: {didText(m.did)}
                </span>
              )}
              {words(m) !== "" && <p class="jugnu-bubble is-theirs">{words(m)}</p>}
            </div>
          ),
        )}
        {problem !== undefined && <p class="jugnu-bubble is-his is-problem">{problem}</p>}
        {isThinking && problem === undefined && (
          <output class="jugnu-bubble is-his jugnu-dots" aria-label={t(locale, "jugnuThinking")}>
            <i />
            <i />
            <i />
          </output>
        )}
      </div>
      {last?.from === "jugnu" && his?.choices !== undefined && !isTyping && (
        <div class="jugnu-choices">
          {his.choices.map((c) => (
            <button
              key={c}
              type="button"
              class="jugnu-pill"
              disabled={!isLive}
              onClick={() => onSay?.(c, "choice")}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      {chat.state !== ChatState.HandedBack && (
        <form
          class="jugnu-composer"
          onSubmit={(e) => {
            e.preventDefault();
            if (typed.trim() === "") return;
            onSay?.(typed.trim(), "typed");
            setTyped("");
          }}
        >
          <input
            value={typed}
            disabled={!isLive || isThinking}
            onFocus={() => {
              setTyping(true);
              onReplyFocus?.();
            }}
            onBlur={() => setTyping(false)}
            placeholder={t(locale, "jugnuPlaceholder")}
            onInput={(e) => setTyped((e.target as HTMLInputElement).value)}
          />
          {isThinking ? (
            <span class="jugnu-stop" aria-hidden="true" />
          ) : typed.trim() !== "" ? (
            <button type="submit" class="jugnu-send" aria-label={t(locale, "jugnuSend")}>
              ↑
            </button>
          ) : null}
        </form>
      )}
    </div>
  );
}
