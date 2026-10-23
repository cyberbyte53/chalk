import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  BIN_NAMES,
  Bin,
  SOURCE_NAMES,
  SorterAction,
  SorterPart,
  type SorterState,
  binOf,
  describeSorter,
  isAllRightOf,
  isRightPlace,
} from "./sorter";
import { type Words, say } from "./words";

const WORDS = {
  pick: { en: "Tap a source, then a bin", hi: "किसी स्रोत पर, फिर किसी डिब्बे पर टैप करो" },
  nowBin: { en: "Now tap a bin", hi: "अब किसी डिब्बे पर टैप करो" },
  clear: { en: "Take all out", hi: "सब निकालो" },
  allRight: { en: "All sorted right!", hi: "सब सही छाँटे!" },
  empty: { en: "nothing yet", hi: "अभी कुछ नहीं" },
} as const satisfies Record<string, Words>;

export function SorterView({ view, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as SorterState;
  const tray = s.sources.filter((src) => binOf(s, src) === null);
  const names = BIN_NAMES[s.by];
  const chip = (source: (typeof s.sources)[number]) => {
    const bin = binOf(s, source);
    const mark = bin !== null && s.showMarks ? (isRightPlace(s.by, source, bin) ? "✓" : "✗") : null;
    const cls = [
      "en-chip",
      s.selected === source ? "is-on" : "",
      mark === "✓" ? "is-right" : mark === "✗" ? "is-wrong" : "",
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <button
        key={source}
        type="button"
        class={cls}
        disabled={!s.canSort}
        aria-pressed={s.selected === source}
        onClick={() => call(SorterAction.Select, { source })}
      >
        {mark !== null && <span aria-hidden="true">{mark} </span>}
        {say(locale, SOURCE_NAMES[source])}
      </button>
    );
  };
  const binBox = (bin: Bin) => {
    const inside = s.placed.filter((p) => p.bin === bin).map((p) => p.source);
    return (
      <div
        class={s.selected !== null ? "en-bin is-ready" : "en-bin"}
        data-part={bin === Bin.Yes ? SorterPart.Yes : SorterPart.No}
      >
        <button
          type="button"
          class="en-bin-head"
          disabled={!s.canSort || s.selected === null}
          onClick={() => call(SorterAction.Place, { bin })}
        >
          {say(locale, names[bin])}
        </button>
        <div class="en-bin-body">
          {inside.length === 0 ? (
            <span class="en-note">{say(locale, WORDS.empty)}</span>
          ) : (
            inside.map((src) => chip(src))
          )}
        </div>
      </div>
    );
  };
  return (
    <section class="en-so" aria-label={describeSorter(s)}>
      <div class="en-tray" data-part={SorterPart.Tray}>
        {tray.map((src) => chip(src))}
      </div>
      {s.canSort && (
        <p class="en-hint">
          {isAllRightOf(s) && s.showMarks
            ? say(locale, WORDS.allRight)
            : say(locale, s.selected === null ? WORDS.pick : WORDS.nowBin)}
        </p>
      )}
      <div class="en-bins">
        {binBox(Bin.Yes)}
        {binBox(Bin.No)}
      </div>
      {s.canSort && s.placed.length > 0 && (
        <div class="en-controls" data-part={SorterPart.Controls}>
          <button type="button" class="en-button" onClick={() => call(SorterAction.Clear, {})}>
            {say(locale, WORDS.clear)}
          </button>
        </div>
      )}
    </section>
  );
}
