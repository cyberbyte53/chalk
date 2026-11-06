import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { sendKeys } from "./editor-link";
import { type Thread, isAsking } from "./threads";

/**
 * An agent's question (`ask`, platform/docs/comments.md): its options as buttons, the agent's pick
 * first, each with why, and a box for his own answer. A button sends that option's label as his
 * reply, through the one writer like any reply; once answered, the option he picked stays marked.
 */
export function ThreadOptions({
  thread: t,
  act,
}: {
  thread: Thread;
  act: (change: Record<string, unknown>) => Promise<boolean>;
}): JSX.Element | null {
  const [own, setOwn] = useState("");
  if (t.options === undefined) return null;
  const isOpen = isAsking(t);
  const answer = (text: string) => act({ op: "write", id: t.id, text });
  const said = [...t.messages].reverse().find((m) => m.role === "person" && m.text.trim() !== "");
  const picked = t.options.find((o) => o.label === said?.text.trim());
  const sendOwn = async () => {
    if (own.trim() !== "" && (await answer(own.trim()))) setOwn("");
  };
  return (
    <div class="thread-options">
      {t.options.map((o, i) => (
        <button
          type="button"
          key={o.label}
          class={`thread-option${o === picked ? " is-picked" : ""}`}
          disabled={!isOpen}
          title={i === 0 ? "The agent's pick" : undefined}
          onClick={() => void answer(o.label)}
        >
          <b>{`${o.label}${i === 0 ? " ★" : ""}`}</b>
          <span>{o.why}</span>
        </button>
      ))}
      {isOpen && (
        <form
          class="thread-option-own"
          onSubmit={(e) => {
            e.preventDefault();
            void sendOwn();
          }}
        >
          <textarea
            value={own}
            placeholder="Or your own answer…"
            onInput={(e) => setOwn((e.target as HTMLTextAreaElement).value)}
            onKeyDown={sendKeys(
              () => void sendOwn(),
              () => (document.activeElement as HTMLElement | null)?.blur(),
            )}
          />
          <button type="submit" disabled={own.trim() === ""}>
            Answer
          </button>
        </form>
      )}
    </div>
  );
}
