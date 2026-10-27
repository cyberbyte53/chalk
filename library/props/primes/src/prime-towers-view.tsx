import { NumberField, SymbolButton } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import { does, says, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { gcd, lcm } from "./arithmetic";
import {
  MAX_TOWERED,
  TowerShow,
  hcfLine,
  lcmLine,
  primeTowers,
  towerText,
  towersOf,
} from "./prime-towers";
import { Bead } from "./ui";

/** Px from one bead to the next up a tower, and below the first. */
const STEP = 34;
const FOOT = 4;

/** A tower of one prime's beads; beads above `litTo` are faded. */
function Tower({ prime, height, litTo }: { prime: number; height: number; litTo: number }) {
  return (
    <div class="pr-sbs-tower">
      {Array.from({ length: height }, (_, k) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: identical beads that never reorder
        <span key={k} class={k >= litTo ? "pr-tower-bead is-faded" : "pr-tower-bead"}>
          <Bead prime={prime} />
        </span>
      ))}
    </div>
  );
}

/** A level line across a prime's two towers: the HCF's at the shorter top, the LCM's at the taller. */
function Level({ at, name, tone }: { at: number; name: string; tone: "hcf" | "lcm" }) {
  return (
    <div class={`pr-sbs-level is-${tone}`} style={{ bottom: `${FOOT + at * STEP - 2}px` }}>
      <span>{name}</span>
    </div>
  );
}

/**
 * For each prime, the two numbers' towers side by side over one base line, the prime underneath.
 * HCF draws a line at the shorter tower's top (the height both reach), fading what's above it; LCM
 * draws one at the taller's top (the height that covers both); HCF × LCM draws both.
 */
export function PrimeTowersView({ view, call }: PropViewProps<typeof primeTowers>): JSX.Element {
  const s = view;
  const towers = towersOf(s.numberA, s.numberB);
  const isHcf = s.show === TowerShow.Hcf;
  const isLcm = s.show === TowerShow.Lcm;
  const isProduct = s.show === TowerShow.Product;
  const tallest = Math.max(1, ...towers.map((t) => Math.max(t.inA, t.inB)));
  const names: Record<TowerShow, string> = {
    apart: "Apart",
    hcf: "HCF",
    lcm: "LCM",
    product: "HCF × LCM",
  };
  const result = isHcf
    ? `HCF = ${hcfLine(s.numberA, s.numberB)}`
    : isLcm
      ? `LCM = ${lcmLine(s.numberA, s.numberB)}`
      : isProduct
        ? `HCF × LCM = ${gcd(s.numberA, s.numberB)} × ${lcm(s.numberA, s.numberB)} = ${s.numberA * s.numberB}`
        : null;
  return (
    <div class="pr-towers">
      {s.isEditable && (
        <div class="pr-steppers">
          <NumberField
            name="a"
            value={s.numberA}
            min={2}
            max={MAX_TOWERED}
            {...says(primeTowers.actions.setNumbers, "a")}
            onChange={(value) =>
              call(primeTowers.actions.setNumbers, { numberA: value, numberB: s.numberB })
            }
          />
          <NumberField
            name="b"
            value={s.numberB}
            min={2}
            max={MAX_TOWERED}
            {...says(primeTowers.actions.setNumbers, "b")}
            onChange={(value) =>
              call(primeTowers.actions.setNumbers, { numberA: s.numberA, numberB: value })
            }
          />
        </div>
      )}
      <div class="pr-sbs">
        {towers.map((t) => {
          const low = Math.min(t.inA, t.inB);
          const high = Math.max(t.inA, t.inB);
          return (
            <div
              class="pr-sbs-group"
              key={t.prime}
              {...shows(
                `tower:${t.prime}`,
                { prime: t.prime, inA: t.inA, inB: t.inB },
                towerText(t, s.numberA, s.numberB),
              )}
            >
              <div class="pr-sbs-stage" style={{ height: `${FOOT + tallest * STEP + 8}px` }}>
                <Tower prime={t.prime} height={t.inA} litTo={isHcf ? low : t.inA} />
                <Tower prime={t.prime} height={t.inB} litTo={isHcf ? low : t.inB} />
                {(isHcf || isProduct) && <Level at={low} name="HCF" tone="hcf" />}
                {(isLcm || isProduct) && <Level at={high} name="LCM" tone="lcm" />}
              </div>
              <div class="pr-sbs-tags">
                <span class="is-a">{s.numberA}</span>
                <span class="is-b">{s.numberB}</span>
              </div>
              <span class="pr-sbs-prime">{t.prime}</span>
            </div>
          );
        })}
      </div>
      {result !== null && (
        <p class="pr-equation is-done" {...shows("result", result)}>
          {result}
        </p>
      )}
      {s.choices.length > 0 && (
        <div class="pr-controls">
          {s.choices.map((c) => (
            <SymbolButton
              key={c}
              symbol={names[c]}
              label={`Show the ${names[c]}`}
              isWide
              isOn={s.show === c}
              {...does(primeTowers.actions.show, { show: c }, c)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
