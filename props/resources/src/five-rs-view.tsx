import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { type Words, say } from "./draw";
import {
  DEED_WORDS,
  FiveRAction,
  FiveRPart,
  type FiveRsState,
  R_MEANING,
  R_OF,
  R_WORDS,
  describeFiveRs,
  nextOf,
  rightOf,
} from "./five-rs";

const WORDS = {
  next: { en: "Which R is this?", hi: "यह कौन-सा R है?" },
  done: { en: "All sorted", hi: "सब छँट गए" },
  right: { en: "right", hi: "सही" },
  again: { en: "Sort again", hi: "फिर से छाँटो" },
  was: { en: "it shows", hi: "यह है" },
} as const satisfies Record<string, Words>;

/** Everyday actions into the five R's: the card on top, a bin button per R, then what went where. */
export function FiveRsView({ view, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as FiveRsState;
  const next = nextOf(s);
  const right = rightOf(s);
  return (
    <section class="rs rs-five" aria-label={describeFiveRs(s)}>
      <div class={`rs-five-card${next === null ? " is-done" : ""}`} data-part={FiveRPart.Card}>
        {next === null ? (
          <>
            <span class="rs-five-ask">{say(locale, WORDS.done)}</span>
            <strong class={right === s.deeds.length ? "is-good" : "is-bad"}>
              {`${right} / ${s.deeds.length} ${say(locale, WORDS.right)}`}
            </strong>
          </>
        ) : (
          <>
            <span class="rs-five-ask">{say(locale, WORDS.next)}</span>
            <strong>{say(locale, DEED_WORDS[next])}</strong>
          </>
        )}
      </div>
      <div class="rs-five-bins" data-part={FiveRPart.Bins}>
        {s.bins.map((r) => {
          const count = s.placed.filter((p) => p.r === r).length;
          return (
            <button
              key={r}
              type="button"
              class="rs-five-bin"
              disabled={!s.canSort || next === null}
              onClick={() => call(FiveRAction.Put, { r })}
            >
              <span class="rs-five-name">{say(locale, R_WORDS[r])}</span>
              {s.showMeaning && <span class="rs-five-meaning">{say(locale, R_MEANING[r])}</span>}
              <span class="rs-five-count" aria-hidden="true">
                {count > 0 ? `${count}` : ""}
              </span>
            </button>
          );
        })}
      </div>
      {s.placed.length > 0 && (
        <ul class="rs-five-placed">
          {s.placed.map((p) => {
            const isRight = R_OF[p.deed] === p.r;
            return (
              <li key={p.deed} class={s.showFeedback ? (isRight ? "is-good" : "is-bad") : ""}>
                <span class="rs-five-mark" aria-hidden="true">
                  {s.showFeedback ? (isRight ? "✓" : "✗") : "•"}
                </span>
                <span>
                  {`${say(locale, DEED_WORDS[p.deed])} → ${say(locale, R_WORDS[p.r])}`}
                  {s.showFeedback && !isRight
                    ? ` (${say(locale, WORDS.was)} ${say(locale, R_WORDS[R_OF[p.deed]])})`
                    : ""}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {next === null && s.canSort && (
        <div class="rs-controls">
          <button type="button" class="rs-button" onClick={() => call(FiveRAction.Reset, {})}>
            {say(locale, WORDS.again)}
          </button>
        </div>
      )}
    </section>
  );
}
