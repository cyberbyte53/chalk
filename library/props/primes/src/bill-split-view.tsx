import { type PropViewProps, useFitColumns } from "@chalk/player";
import type { JSX } from "preact";
import { BillSplitAction, type BillSplitState, shareOf } from "./bill-split";
import { SymbolButton } from "./ui";

/** At least `count` digits after the point, the repeating block written out again as needed. */
function digitsOf(share: { once: string; repeats: string }, count: number): string {
  let digits = share.once;
  while (digits.length < count) digits += share.repeats;
  return digits;
}

/**
 * The ₹ note, a button per group size, and the shares tried so far in order of size: each written
 * out (a repeating one to a few places and …), marked "ends" or "never ends".
 */
export function BillSplitView({ view, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as BillSplitState;
  const word = (w: { en: string; hi?: string }) => w[locale as "en" | "hi"] ?? w.en;
  const [fit, columns] = useFitColumns<HTMLDivElement>(s.sizes.length, s.sizes.join(" "));
  return (
    <div class="pr-bill">
      <div class="pr-bill-note" aria-label={`A bill of ₹${s.amount}`}>
        ₹{s.amount}
      </div>
      <div ref={fit} class="pr-controls pr-tile-choices" style={{ "--columns": String(columns) }}>
        {s.sizes.map((n) => (
          <SymbolButton
            key={n}
            symbol={String(n)}
            label={`Share among ${n}`}
            part={`size-${n}`}
            isOn={s.chosen === n}
            onPress={() => call(BillSplitAction.Split, { n })}
          />
        ))}
      </div>
      {s.tried.length > 0 && (
        <ul class="pr-bill-list" data-part="shares">
          {s.tried.map((n) => {
            const share = shareOf(s.amount, n);
            const ends = share.repeats === "";
            // Money is written to two places when it ends: ₹12.50, ₹25.00.
            const once = ends ? share.once.padEnd(2, "0") : share.once;
            return (
              <li
                key={n}
                class={`${ends ? "is-ends" : "is-repeats"}${n === s.chosen ? " is-latest" : ""}`}
              >
                <span class="pr-bill-n">{word(s.words.friends).replace("{n}", String(n))}</span>
                <span class="pr-bill-share">
                  ₹{share.whole}.{ends ? once : digitsOf(share, 4)}
                  {!ends && "…"}
                </span>
                <span class="pr-bill-tag">{word(ends ? s.words.ends : s.words.repeats)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
