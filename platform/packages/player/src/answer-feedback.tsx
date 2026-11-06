/** @jsxImportSource preact */
import { type Locale, shownOf } from "@chalk/content";
import { AnswerStatus, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { usePlayMode } from "./play-mode";
import { RichText } from "./rich-text-view";
import { t } from "./ui-text";

/**
 * "That's it!" or "Not quite." and the note, right under a question once it is checked: only when
 * the board plays without a mode (an author's review). In a mode the banner under the board says
 * right or wrong, and the note is never shown (see play-mode.ts).
 */
export function AnswerFeedback({
  status,
  feedback,
  locale,
}: {
  status: AnswerStatus;
  /** The note, by language (a question's `feedback`). */
  feedback: Readonly<Record<string, string>> | null;
  locale: Locale;
}): JSX.Element | null {
  const mode = usePlayMode();
  if (mode !== undefined || status === AnswerStatus.Open) return null;
  const isCorrect = status === AnswerStatus.Correct;
  return (
    <output
      class={isCorrect ? "feedback is-correct" : "feedback is-wrong"}
      {...shows("result", { status, note: shownOf(feedback?.[locale] ?? "") || null })}
    >
      <strong>{t(locale, isCorrect ? "correct" : "notQuite")}</strong>
      {feedback !== null && (
        <span>
          <RichText text={feedback[locale] ?? ""} />
        </span>
      )}
    </output>
  );
}
