import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { toneOf } from "./arithmetic";
import { BeadPairAction, type BeadPairState, hcfText, lcmText, rowOf } from "./bead-pair";
import { SymbolButton } from "./ui";

/** A bead the learner can tap to pair, or a paired one (drawn joined to its partner). */
function TapBead({
  prime,
  isPaired,
  onTap,
}: { prime: number; isPaired: boolean; onTap: () => void }): JSX.Element {
  const classes = ["pr-bead", `pr-${toneOf(prime)}`];
  if (prime >= 100) classes.push("is-long");
  if (isPaired) {
    classes.push("is-paired");
    return <span class={classes.join(" ")}>{prime}</span>;
  }
  return (
    <button
      type="button"
      class={`${classes.join(" ")} is-tappable`}
      aria-label={`Pair a ${prime}`}
      onClick={onTap}
    >
      {prime}
    </button>
  );
}

/**
 * Two rows of beads, one per number. Tapping a bead pairs it with the same prime in the other row:
 * the pair moves to the front of both rows, joined by a line. Once every pair is made, the HCF (one
 * bead of each pair) and the LCM (one of each pair and all the rest) are written underneath.
 */
export function BeadPairView({ view, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as BeadPairState & { isDone: boolean };
  const word = (w: { en: string; hi?: string }) => w[locale as "en" | "hi"] ?? w.en;
  const rowA = rowOf(s.numberA, s.pairs);
  const rowB = rowOf(s.numberB, s.pairs);
  const pair = (prime: number) => call(BeadPairAction.Pair, { prime });
  return (
    <div class="pr-pairing">
      <div class="pr-pair-grid">
        <span class="pr-pair-name">{s.numberA}</span>
        <div class="pr-pair-row" data-part="rowA">
          {rowA.map((b, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: beads in a fixed order
            <TapBead key={i} prime={b.prime} isPaired={b.isPaired} onTap={() => pair(b.prime)} />
          ))}
        </div>
        <span />
        <div class="pr-pair-links" aria-hidden="true">
          {s.pairs.map((p, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: one link per pair, in order
            <span key={i} class={`pr-pair-link pr-${toneOf(p)}`} />
          ))}
        </div>
        <span class="pr-pair-name">{s.numberB}</span>
        <div class="pr-pair-row" data-part="rowB">
          {rowB.map((b, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: beads in a fixed order
            <TapBead key={i} prime={b.prime} isPaired={b.isPaired} onTap={() => pair(b.prime)} />
          ))}
        </div>
      </div>
      {s.isDone && s.showResult && (
        <div class="pr-pair-result">
          <p class="pr-equation" data-part="hcf">
            {word(s.hcfLabel)} = {hcfText(s)}
          </p>
          <p class="pr-equation" data-part="lcm">
            {word(s.lcmLabel)} = {lcmText(s)}
          </p>
        </div>
      )}
      <div class="pr-controls">
        <SymbolButton
          symbol="↺"
          label="Undo every pair"
          part="startAgain"
          isEnabled={s.pairs.length > 0}
          onPress={() => call(BeadPairAction.StartAgain)}
        />
      </div>
    </div>
  );
}
