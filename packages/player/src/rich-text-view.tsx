import type { JSX } from "preact";
import { SpanKind, mathHtml, parseRich } from "./rich-text";

/**
 * Renders rich text: words, **bold**, *emphasis*, and maths typeset by KaTeX. Every learner-facing
 * string goes through this, so the lesson, the questions and Jugnu all look the same.
 */
export function RichText({ text }: { text: string }): JSX.Element {
  // The spans are a fixed split of `text`, so a span's index is a stable key for it.
  return (
    <>
      {parseRich(text).spans.map((span, i) => {
        switch (span.kind) {
          case SpanKind.Text:
            return span.text;
          case SpanKind.Bold:
            // biome-ignore lint/suspicious/noArrayIndexKey: spans are a fixed split of the text
            return <strong key={i}>{span.text}</strong>;
          case SpanKind.Emphasis:
            // biome-ignore lint/suspicious/noArrayIndexKey: spans are a fixed split of the text
            return <em key={i}>{span.text}</em>;
          case SpanKind.Math:
          case SpanKind.DisplayMath: {
            const isDisplay = span.kind === SpanKind.DisplayMath;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: spans are a fixed split of the text
              <span key={i} class={isDisplay ? "rich-display-math" : "rich-math"}>
                <span
                  // Trusted: KaTeX's own output for content that passed the build's maths check.
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX renders to HTML
                  dangerouslySetInnerHTML={{ __html: mathHtml(span.text, isDisplay) }}
                />
                {span.trailing}
              </span>
            );
          }
        }
      })}
    </>
  );
}
