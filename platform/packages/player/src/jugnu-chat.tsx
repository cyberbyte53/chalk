/** @jsxImportSource preact */
import type { Locale } from "@chalk/content";
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { type Chat, type ChatMessage, ChatState } from "./chat";
import { JugnuFigure, JugnuMood } from "./jugnu-figure";
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
  const his = [...chat.messages].reverse().find((m) => m.from === "jugnu");
  const lastTheirs = chat.messages.at(-1)?.from === "student" ? chat.messages.at(-1) : undefined;
  const earlier = chat.messages.slice(0, his === undefined ? 0 : chat.messages.indexOf(his));
  const isThinking = chat.state === ChatState.Thinking;

  if (isOneLine && his !== undefined && !isThinking)
    return (
      <div class="jugnu-chat is-one-line">
        <button type="button" class="jugnu-line" onClick={onOpen} disabled={onOpen === undefined}>
          <JugnuFigure mood={JugnuMood.Hint} size={22} />
          <span>{his.text}</span>
        </button>
        <button type="button" class="jugnu-done" onClick={onDone} disabled={onDone === undefined}>
          {t(locale, "jugnuDone")}
        </button>
      </div>
    );

  return (
    <div class={`jugnu-chat${isThinking ? " is-thinking" : ""}`}>
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
      {his !== undefined && (
        <div class="jugnu-message">
          <JugnuFigure mood={JugnuMood.Hint} size={32} />
          <p>{his.text}</p>
        </div>
      )}
      {lastTheirs !== undefined && lastTheirs.from === "student" ? (
        <div class="jugnu-theirs">
          {lastTheirs.did.length > 0 && (
            <span class="jugnu-did">
              {t(locale, "jugnuDid")}: {didText(lastTheirs.did)}
            </span>
          )}
          {lastTheirs.text !== "" && <p>{lastTheirs.text}</p>}
        </div>
      ) : (
        his?.choices !== undefined &&
        chat.state === ChatState.Open && (
          <div class="jugnu-choices">
            {his.choices.map((c) => (
              <button key={c} type="button" disabled={!isLive} onClick={() => onSay?.(c, "choice")}>
                {c}
              </button>
            ))}
          </div>
        )
      )}
      {isThinking && <p class="jugnu-thinking">{t(locale, "jugnuThinking")}</p>}
      {isLive && chat.state === ChatState.Open && (
        <form
          class="jugnu-reply"
          onSubmit={(e) => {
            e.preventDefault();
            if (typed.trim() === "") return;
            onSay?.(typed.trim(), "typed");
            setTyped("");
          }}
        >
          <input
            value={typed}
            placeholder={t(locale, "jugnuReply")}
            onInput={(e) => setTyped((e.target as HTMLInputElement).value)}
          />
          <button type="submit">{t(locale, "jugnuSend")}</button>
          <button type="button" onClick={onDone}>
            {t(locale, "jugnuDone")}
          </button>
        </form>
      )}
    </div>
  );
}
