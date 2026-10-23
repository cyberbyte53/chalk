import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import type { Bag } from "./arithmetic";
import { BagCompareAction, type BagCompareState, BagShow, MAX_COMPARED } from "./bag-compare";
import { Bead, NumberBox, SymbolButton } from "./ui";

/** Each number's column, by its name in the book's formulas. */
const COLUMN = ["a", "b", "c"] as const;

type Derived = {
  bags: Bag[];
  primes: number[];
  hcf: number;
  lcm: number;
  hcfBag: string;
  lcmBag: string;
  product: number;
  hcfTimesLcm: number;
};

/** A row's beads for one number, with the ones the HCF (or LCM) takes ringed. */
function Cell({
  prime,
  count,
  taken,
}: { prime: number; count: number; taken: number }): JSX.Element {
  return (
    <div class="pr-cell">
      {count === 0 && <span class="pr-zero">·</span>}
      {Array.from({ length: count }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: identical items that never reorder
        <Bead key={i} prime={prime} isMarked={i < taken} />
      ))}
    </div>
  );
}

/**
 * The numbers' bags side by side, one row per prime, so each row can be compared. HCF rings, in each
 * row, as many beads as the fewest any number has, and collects them in its own column; LCM rings
 * the most. With the product shown, two numbers' beads are counted against HCF's and LCM's.
 */
export function BagCompareView({ view, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as BagCompareState & Derived;
  const isHcf = s.show === BagShow.Hcf;
  const isLcm = s.show === BagShow.Lcm;
  const isProduct = s.show === BagShow.Product && s.numbers.length === 2;
  const countOf = (bag: Bag | undefined, p: number) => bag?.[p] ?? 0;
  const least = (p: number) => Math.min(...s.bags.map((b) => countOf(b, p)));
  const most = (p: number) => Math.max(...s.bags.map((b) => countOf(b, p)));
  const hcfName = s.names.hcf[locale] ?? s.names.hcf.en ?? "HCF";
  const lcmName = s.names.lcm[locale] ?? s.names.lcm.en ?? "LCM";
  const resultName = isHcf ? hcfName : lcmName;
  const columns = s.numbers.length + (isHcf || isLcm ? 1 : 0) + (isProduct ? 2 : 0);
  return (
    <div class="pr-compare" style={{ "--columns": String(columns) }}>
      <div class="pr-table">
        <div class="pr-table-row is-head">
          <span class="pr-prime-head" />
          {s.numbers.map((n, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: identical items that never reorder
            <span key={i} class="pr-number-head">
              {n}
            </span>
          ))}
          {(isHcf || isLcm) && <span class="pr-number-head is-result">{resultName}</span>}
          {isProduct && (
            <>
              <span class="pr-number-head is-result">{hcfName}</span>
              <span class="pr-number-head is-result">{lcmName}</span>
            </>
          )}
        </div>
        {s.primes.map((p) => {
          const taken = isHcf ? least(p) : isLcm ? most(p) : 0;
          return (
            <div class="pr-table-row" key={p} data-part={`row:${p}`}>
              <span class="pr-prime-head">
                <Bead prime={p} />
              </span>
              {s.bags.map((bag, i) => (
                <Cell
                  key={COLUMN[i]}
                  prime={p}
                  count={countOf(bag, p)}
                  taken={isHcf ? least(p) : isLcm && countOf(bag, p) === most(p) ? most(p) : 0}
                />
              ))}
              {(isHcf || isLcm) && <Cell prime={p} count={taken} taken={0} />}
              {isProduct && (
                <>
                  <Cell prime={p} count={least(p)} taken={0} />
                  <Cell prime={p} count={most(p)} taken={0} />
                </>
              )}
            </div>
          );
        })}
        <div class="pr-table-row is-foot">
          <span class="pr-prime-head" />
          {s.numbers.map((n, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: identical items that never reorder
            <span key={i} class="pr-number-foot">
              {n}
            </span>
          ))}
          {(isHcf || isLcm) && (
            <span class="pr-number-foot is-result">{isHcf ? s.hcf : s.lcm}</span>
          )}
          {isProduct && (
            <>
              <span class="pr-number-foot is-result">{s.hcf}</span>
              <span class="pr-number-foot is-result">{s.lcm}</span>
            </>
          )}
        </div>
      </div>
      <p
        class="pr-equation"
        aria-live="polite"
        data-part={s.show === BagShow.Apart ? undefined : "equation"}
      >
        {isHcf && `${hcfName} = ${s.hcfBag} = ${s.hcf}`}
        {isLcm && `${lcmName} = ${s.lcmBag} = ${s.lcm}`}
        {isProduct && `${s.hcf} × ${s.lcm} = ${s.hcfTimesLcm} = ${s.numbers.join(" × ")}`}
      </p>
      <div class="pr-controls">
        <SymbolButton
          symbol={s.numbers.join(", ")}
          label="Show the numbers apart"
          isWide
          part="show:apart"
          isOn={s.show === BagShow.Apart}
          onPress={() => call(BagCompareAction.Show, { show: BagShow.Apart })}
        />
        <SymbolButton
          symbol={hcfName}
          label={hcfName}
          isWide
          part="show:hcf"
          isOn={isHcf}
          onPress={() => call(BagCompareAction.Show, { show: BagShow.Hcf })}
        />
        <SymbolButton
          symbol={lcmName}
          label={lcmName}
          isWide
          part="show:lcm"
          isOn={isLcm}
          onPress={() => call(BagCompareAction.Show, { show: BagShow.Lcm })}
        />
        {s.numbers.length === 2 && (
          <SymbolButton
            symbol={`${hcfName} × ${lcmName}`}
            label={`${hcfName} × ${lcmName}`}
            isWide
            part="show:product"
            isOn={isProduct}
            onPress={() => call(BagCompareAction.Show, { show: BagShow.Product })}
          />
        )}
      </div>
      {s.isEditable && (
        <div class="pr-controls">
          {s.numbers.map((n, i) => (
            <NumberBox
              key={COLUMN[i]}
              name={COLUMN[i] ?? "n"}
              value={n}
              min={2}
              max={MAX_COMPARED}
              part={COLUMN[i] ?? "n"}
              onChange={(value) =>
                call(BagCompareAction.SetNumbers, {
                  numbers: s.numbers.map((m, j) => (j === i ? value : m)),
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
