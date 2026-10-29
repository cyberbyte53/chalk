import { type ShownTags, shows, tagsOf } from "@chalk/prop";
import type { JSX } from "preact";
import { type Bag, primesIn, toneOf } from "./arithmetic";

/** One prime factor: a bead with the prime on it, in its prime's colour. */
export function Bead({
  prime,
  isGhost = false,
  isMarked = false,
}: {
  prime: number;
  /** Drawn hollow: a bead that would have to be added. */
  isGhost?: boolean;
  /** Ringed: the bead the page is talking about. */
  isMarked?: boolean;
}): JSX.Element {
  const classes = ["pr-bead", `pr-${toneOf(prime)}`];
  if (isGhost) classes.push("is-ghost");
  if (isMarked) classes.push("is-marked");
  if (prime >= 100) classes.push("is-long");
  return <span class={classes.join(" ")}>{prime}</span>;
}

/**
 * A bag as towers on a prime axis: primes left to right, smallest first, each a stack of its beads
 * with the prime under it. Height is the power, the same picture as prime-towers. Each tower shows
 * how many of its prime there are (`prime:2`); the bag says what it shows as a whole (`tags`).
 */
export function BagTowers({
  bag,
  label,
  ...tags
}: { bag: Bag; label: string } & ShownTags): JSX.Element {
  const primes = primesIn(bag);
  return (
    <div class="pr-btowers" role="img" aria-label={label} {...tagsOf(tags)}>
      {primes.length === 0 && <span class="pr-empty">1</span>}
      {primes.map((p) => (
        <div class="pr-btower" key={p} {...shows(`prime:${p}`, bag[p] ?? 0)}>
          <div class="pr-btower-stack">
            {Array.from({ length: bag[p] ?? 0 }, (_, i) => (
              <Bead key={i} prime={p} />
            ))}
          </div>
          <span class="pr-btower-prime">{p}</span>
        </div>
      ))}
    </div>
  );
}

export { sup } from "./seen";
