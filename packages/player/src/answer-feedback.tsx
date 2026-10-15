import type { Locale } from "@chalk/content";
import { AnswerStatus } from "@chalk/prop";
import type { JSX } from "preact";
import { RichText } from "./rich-text-view";
import { t } from "./ui-text";

/** "That's it!" or "Not quite." and the note, right under a question once it is checked. */
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
  if (status === AnswerStatus.Open) return null;
  const isCorrect = status === AnswerStatus.Correct;
  return (
    <output class={isCorrect ? "feedback is-correct" : "feedback is-wrong"}>
      <strong>{t(locale, isCorrect ? "correct" : "notQuite")}</strong>
      {feedback !== null && (
        <span>
          <RichText text={feedback[locale] ?? ""} />
        </span>
      )}
    </output>
  );
}
