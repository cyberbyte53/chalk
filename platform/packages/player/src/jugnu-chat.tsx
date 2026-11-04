/** @jsxImportSource preact */
import type { Locale } from "@chalk/content";
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { type Chat, type ChatMessage, ChatState } from "./chat";
import { JugnuMood } from "./jugnu-figure";
import { t } from "./ui-text";

/**
 * The chat with Jugnu as the student meets it (platform/docs/plans/jugnu-chat.md), drawn in the
 * board's bottom bar so the board stays live above it and a glowed part stays in sight. One message
 * in front (his latest, with his choices); earlier ones a tap away. The student answers in words (a
 * tapped choice, or typed) or by the board, then Done. While they act on the board it is one line.
 * Live it is given callbacks; without them it is read-only (a run, seen as the student saw it).
 * His note and thinking are never here.
 */
export type JugnuChatProps = {
  locale: Locale;
  chat: Chat;
  /** One line (his question and Done), while the student acts on the board. */
  isOneLine?: boolean;
  /** The student says something: typed words or a tapped choice. */
  onSay?: (text: string, via: "typed" | "choice") => void;
  /** The student acted on the board and hands back. */
  onDone?: () => void;
  /** The student opens the full chat again from its one line. */
  onOpen?: () => void;
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
  if (chat.state === ChatState.Thinking) return JugnuMood.Thinking;
  if (chat.state === ChatState.HandedBack) return JugnuMood.Proud;
  return JugnuMood.Curious;
}

/**
 * The chat's sheet, under the bar's row (Jugnu's figure, the board's button): his latest message as
 * plain text, or the student's latest as a bubble with his typing dots after it; his choices; the
 * reply box. Only the latest exchange; earlier ones a tap away.
 */
export function JugnuChat({
  locale,
  chat,
  isOneLine = false,
  onSay,
  onDone,
  onOpen,
}: JugnuChatProps): JSX.Element | null {
  const [isEarlierShown, setEarlierShown] = useState(false);
  const [typed, setTyped] = useState("");
  if (chat.state === ChatState.Closed) return null;
  const isLive = onSay !== undefined;
  const last = chat.messages.at(-1);
  const his = [...chat.messages].reverse().find((m) => m.from === "jugnu");
  const isThinking = chat.state === ChatState.Thinking;
  const earlier = chat.messages.slice(0, Math.max(0, chat.messages.length - 1));

  if (isOneLine && his !== undefined && !isThinking)
    return (
      <div class="jugnu-sheet is-one-line">
        <button type="button" class="jugnu-line" onClick={onOpen} disabled={onOpen === undefined}>
          {his.text}
        </button>
        <button type="button" class="jugnu-pill" onClick={onDone} disabled={onDone === undefined}>
          {t(locale, "jugnuDone")}
        </button>
      </div>
    );

  return (
    <div class="jugnu-sheet">
      <span class="jugnu-handle" aria-hidden="true" />
      {earlier.length > 0 && (
        <button
          type="button"
          class="jugnu-earlier"
          onClick={() => setEarlierShown(!isEarlierShown)}
        >
          {t(locale, "jugnuEarlier")} ({earlier.length})
        </button>
      )}
      {isEarlierShown && (
        <ol class="jugnu-history">
          {earlier.map((m) => (
            <li key={m.seq} class={m.from === "jugnu" ? "is-his" : "is-theirs"}>
              {m.from === "student" && m.did.length > 0 && (
                <span class="jugnu-did">{didText(m.did)} · </span>
              )}
              {m.text}
            </li>
          ))}
        </ol>
      )}
      {last?.from === "student" ? (
        <div class="jugnu-theirs">
          {last.did.length > 0 && (
            <span class="jugnu-did">
              {t(locale, "jugnuDid")}: {didText(last.did)}
            </span>
          )}
          {last.text !== "" && <p>{last.text}</p>}
        </div>
      ) : (
        his !== undefined && <p class="jugnu-his">{his.text}</p>
      )}
      {isThinking && (
        <output class="jugnu-dots" aria-label={t(locale, "jugnuThinking")}>
          <i />
          <i />
          <i />
        </output>
      )}
      {last?.from === "jugnu" && his?.choices !== undefined && (
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
            placeholder={t(locale, "jugnuPlaceholder")}
            onInput={(e) => setTyped((e.target as HTMLInputElement).value)}
          />
          {isThinking ? (
            <span class="jugnu-stop" aria-hidden="true" />
          ) : typed.trim() !== "" ? (
            <button type="submit" class="jugnu-send" aria-label={t(locale, "jugnuSend")}>
              ↑
            </button>
          ) : (
            last?.from === "jugnu" && (
              <button type="button" class="jugnu-pill" onClick={onDone} disabled={!isLive}>
                {t(locale, "jugnuDone")}
              </button>
            )
          )}
        </form>
      )}
    </div>
  );
}
