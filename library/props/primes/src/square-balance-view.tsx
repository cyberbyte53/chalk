import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { type Bag, primesIn } from "./arithmetic";
import {
  MAX_ROOT,
  MAX_SIDE_NUMBER,
  SquareBalanceAction,
  type SquareBalanceState,
} from "./square-balance";
import { Bead, Stepper } from "./ui";

/** One pan's bag, a row per prime, each row's count beside it: even counts plain, odd ones marked. */
function Pan({
  bag,
  primes,
  marked,
  label,
}: {
  bag: Bag;
  /** Every prime either pan holds, so both pans have the same rows (0 when this pan has none). */
  primes: readonly number[];
  marked: readonly number[];
  label: string;
}): JSX.Element {
  return (
    <div class="pr-pan-bag" role="img" aria-label={label}>
      {primes.map((p) => {
        const count = bag[p] ?? 0;
        return (
          <div key={p} class={`pr-bag-row${marked.includes(p) ? " is-odd" : ""}`}>
            <span class="pr-row-beads">
              {Array.from({ length: count }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: identical items that never reorder
                <Bead key={i} prime={p} isMarked={marked.includes(p)} />
              ))}
            </span>
            <span class="pr-count">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The balance: a² on the left pan, n × b² on the right, each as its bag of primes with every row's
 * count. The beam tips towards the heavier side. The primes the right pan holds an odd number of are
 * ringed on both pans: the left can't match them, because a square's every count is even.
 */
export function SquareBalanceView({ view, call }: PropViewProps): JSX.Element {
  const s = view as unknown as SquareBalanceState & {
    left: number;
    right: number;
    leftBag: Bag;
    rightBag: Bag;
    isBalanced: boolean;
    oddOnRight: number[];
    leftText: string;
    rightText: string;
  };
  const primes = primesIn({ ...s.leftBag, ...s.rightBag });
  const tilt = s.isBalanced ? 0 : s.left > s.right ? -6 : 6;
  return (
    <div class={`pr-balance${s.isBalanced ? " is-balanced" : ""}`}>
      <svg
        viewBox="0 0 300 70"
        width="100%"
        role="img"
        aria-label={`${s.left} against ${s.right}`}
        data-part="beam"
      >
        <path class="pr-stand" d="M150,62 L140,70 L160,70 Z M150,24 L150,62" />
        <g transform={`rotate(${tilt} 150 24)`}>
          <line class="pr-beam" x1={30} y1={24} x2={270} y2={24} />
          <circle class="pr-pivot" cx={150} cy={24} r={5} />
          <path class="pr-hanger" d="M30,24 L18,52 L42,52 Z M270,24 L258,52 L282,52 Z" />
        </g>
      </svg>
      <div class="pr-pans">
        <div class="pr-pan" data-part="leftPan">
          <p class="pr-pan-head">
            a² = {s.a}² = <strong>{s.left}</strong>
          </p>
          <Pan
            bag={s.leftBag}
            primes={primes}
            marked={s.oddOnRight}
            label={`a squared: ${s.leftText}`}
          />
        </div>
        <div class="pr-pan-sign" aria-hidden="true">
          {s.isBalanced ? "=" : s.left > s.right ? ">" : "<"}
        </div>
        <div class="pr-pan" data-part="rightPan">
          <p class="pr-pan-head">
            {s.root} × b² = {s.root} × {s.b}² = <strong>{s.right}</strong>
          </p>
          <Pan
            bag={s.rightBag}
            primes={primes}
            marked={s.oddOnRight}
            label={`${s.root} times b squared: ${s.rightText}`}
          />
        </div>
      </div>
      <div class="pr-steppers">
        <Stepper
          name="a"
          value={s.a}
          min={1}
          max={MAX_SIDE_NUMBER}
          part="a"
          onChange={(a) => call(SquareBalanceAction.SetA, { a })}
        />
        <Stepper
          name="b"
          value={s.b}
          min={1}
          max={MAX_SIDE_NUMBER}
          part="b"
          onChange={(b) => call(SquareBalanceAction.SetB, { b })}
        />
        <Stepper
          name="n"
          value={s.root}
          min={2}
          max={MAX_ROOT}
          part="n"
          onChange={(root) => call(SquareBalanceAction.SetRoot, { root })}
        />
      </div>
    </div>
  );
}
