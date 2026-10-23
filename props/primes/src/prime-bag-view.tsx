import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { type Bag, bagOf, primesIn } from "./arithmetic";
import { MAX_BASE, MAX_POWER, PrimeBagAction, type PrimeBagState } from "./prime-bag";
import { LONGEST } from "./seen";
import { BagRows, Bead, NumberBox, sup } from "./ui";

/** Digits beyond which the middle of a huge power is folded away. */

function shortened(digits: string): JSX.Element {
  const body =
    digits.length > LONGEST
      ? `${digits.slice(0, 8)}…${digits.slice(-10, -1)}`
      : digits.slice(0, -1);
  return (
    <span class="pr-value">
      {body}
      <span class="pr-last-digit">{digits.slice(-1)}</span>
    </span>
  );
}

/**
 * A number's bag of primes. With a power, the bag of n is drawn k times over, copy by copy, so it is
 * plain that nᵏ can only hold the primes n holds. The last digit of the value is picked out.
 */
export function PrimeBagView({ view, call }: PropViewProps): JSX.Element {
  const s = view as unknown as PrimeBagState & { bag: Bag; bagText: string; valueText: string };
  const own = bagOf(s.base);
  const copies = s.isPowerShown ? s.power : 1;
  const beads = primesIn(own).flatMap((prime) =>
    Array.from({ length: own[prime] ?? 0 }, (_, i) => ({ prime, id: `${prime}:${i}` })),
  );
  const name = s.isPowerShown ? `${s.base}${sup(s.power)}` : `${s.base}`;
  return (
    <div class="pr-bagprop">
      <p class="pr-headline" data-part="value">
        {name} = {shortened(s.valueText)}
      </p>
      {copies === 1 ? (
        <BagRows bag={s.bag} label={`${name} = ${s.bagText}`} part="beads" />
      ) : (
        <div class="pr-copies" role="img" aria-label={`${name} = ${s.bagText}`} data-part="beads">
          {Array.from({ length: copies }, (_, k) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: identical items that never reorder
            <div class="pr-copy" key={k}>
              {beads.map((bead) => (
                <Bead key={bead.id} prime={bead.prime} />
              ))}
            </div>
          ))}
        </div>
      )}
      <p class="pr-equation" data-part="equation">
        {name} = {s.bagText}
      </p>
      <div class="pr-controls">
        {s.isBaseEditable && (
          <NumberBox
            name="n"
            value={s.base}
            min={1}
            max={MAX_BASE}
            part="n"
            onChange={(base) => call(PrimeBagAction.SetBase, { base })}
          />
        )}
        {s.isPowerShown && (
          <label class="pr-slider" data-part="k">
            <span class="pr-name">
              {s.powerName} = {s.power}
            </span>
            <input
              type="range"
              min={1}
              max={MAX_POWER}
              value={s.power}
              aria-label={`Power ${s.powerName}`}
              onInput={(event) =>
                call(PrimeBagAction.SetPower, {
                  power: Number((event.target as HTMLInputElement).value),
                })
              }
            />
          </label>
        )}
      </div>
    </div>
  );
}
