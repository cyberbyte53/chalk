import type { ComponentChildren, JSX } from "preact";
import { useLayoutEffect, useRef, useState } from "preact/hooks";
import { SpanKind, mathHtml, parseRich } from "./rich-text";

/**
 * Safari 26 lays out KaTeX's stacks (braces with labels, tables, fractions) wrongly because of the
 * table-cell spacer KaTeX adds for older browsers (`.vlist-s`): labels fall onto the line and the
 * rest rises. Once per page, a hidden test formula is measured; if its "=" isn't level with the
 * number before it, `katex-vlist-fix` on <html> turns the spacer into plain text (rich-text.css).
 * Other browsers lay it out right and are left alone.
 */
let isChecked = false;
function checkStacking(): void {
  if (isChecked || typeof document === "undefined") return;
  isChecked = true;
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;width:600px";
  probe.innerHTML = mathHtml("\\underbrace{20}_{\\text{sweets}} = 6", true);
  document.body.append(probe);
  const rel = probe.querySelector(".mrel");
  const digits = [...probe.querySelectorAll(".mord")].find((el) =>
    /^\d+$/.test(el.textContent ?? ""),
  );
  if (rel !== null && digits !== undefined) {
    const a = digits.getBoundingClientRect();
    const b = rel.getBoundingClientRect();
    if (Math.abs(a.top + a.height / 2 - (b.top + b.height / 2)) > 6)
      document.documentElement.classList.add("katex-vlist-fix");
  }
  probe.remove();
}

/**
 * A display formula. It lays out like any block and is never clipped; only when it is wider than the
 * board does it become a box that scrolls sideways (which, by CSS's rules, clips vertically, so it
 * gets room above and below). Measured after layout and again whenever the board's width changes.
 */
function DisplayMath({
  html,
  trailing,
}: { html: string; trailing: ComponentChildren }): JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);
  const [isWide, setIsWide] = useState(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: measured again when the formula changes
  useLayoutEffect(() => {
    checkStacking();
    const el = ref.current;
    if (el === null) return;
    const measure = () => {
      const formula = el.querySelector<HTMLElement>(".katex-display");
      if (formula === null) return;
      setIsWide(formula.scrollWidth > el.clientWidth + 1);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    return () => watch.disconnect();
  }, [html]);
  return (
    <span ref={ref} class={isWide ? "rich-display-math is-wide" : "rich-display-math"}>
      <span
        // Trusted: KaTeX's own output for content that passed the build's maths check.
        // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX renders to HTML
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {trailing}
    </span>
  );
}

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
          case SpanKind.DisplayMath:
            return (
              <DisplayMath
                // biome-ignore lint/suspicious/noArrayIndexKey: spans are a fixed split of the text
                key={i}
                html={mathHtml(span.text, true)}
                trailing={span.trailing}
              />
            );
          case SpanKind.Math:
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: spans are a fixed split of the text
              <span key={i} class="rich-math">
                <span
                  // Trusted: KaTeX's own output for content that passed the build's maths check.
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX renders to HTML
                  dangerouslySetInnerHTML={{ __html: mathHtml(span.text, false) }}
                />
                {span.trailing}
              </span>
            );
        }
      })}
    </>
  );
}
