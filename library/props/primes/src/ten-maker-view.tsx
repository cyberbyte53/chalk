import { type PropViewProps, does, says } from "@chalk/player";
import type { JSX } from "preact";
import { bagOf, primesIn } from "./arithmetic";
import {
  MAX_TERM,
  TenMakerAction,
  type TenMakerState,
  TenStage,
  tensOf,
  workingOf,
} from "./ten-maker";
import { Bead, NumberBox, SymbolButton } from "./ui";

/** One bead's place in a column: still there, crossed out by cancelling, or added to make a ten. */
const Kind = { Live: "live", Crossed: "crossed", Added: "added" } as const;
type Kind = (typeof Kind)[keyof typeof Kind];

/** A column's beads, nearest the bar first: what's left, then what's added, then what's crossed out. */
function columnOf(live: number, added: number, crossed: number): Kind[] {
  return [
    ...Array.from({ length: live }, () => Kind.Live),
    ...Array.from({ length: added }, () => Kind.Added),
    ...Array.from({ length: crossed }, () => Kind.Crossed),
  ];
}

function BeadAt({ prime, kind, isStuck }: { prime: number; kind: Kind; isStuck?: boolean }) {
  return (
    <span class={`pr-tm-bead is-${kind}`}>
      <Bead prime={prime} isGhost={kind === Kind.Added} isMarked={isStuck === true} />
    </span>
  );
}

/**
 * One side of the bar: the 2 and 5 columns side by side, level by level (a level holding a 2 and a
 * 5 is a ten once paired), then any other prime's column. `isBelow` hangs the beads from the bar.
 */
function Side({
  cols,
  others,
  isBelow,
  pairedLevels,
  stuck,
}: {
  cols: { two: Kind[]; five: Kind[] };
  others: { prime: number; beads: Kind[] }[];
  isBelow: boolean;
  /** Levels (from the bar) where a live or added 2 and 5 are linked into a ten. */
  pairedLevels: number;
  stuck: readonly number[];
}) {
  const levels = Math.max(cols.two.length, cols.five.length);
  return (
    <div class={`pr-tm-side ${isBelow ? "is-below" : "is-above"}`}>
      <div class="pr-tm-pair">
        {Array.from({ length: levels }, (_, k) => {
          const two = cols.two[k];
          const five = cols.five[k];
          const isTen = k < pairedLevels;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: one row per level, in order
            <div key={k} class={isTen ? "pr-tm-level is-ten" : "pr-tm-level"}>
              <span class="pr-tm-cell">{two !== undefined && <BeadAt prime={2} kind={two} />}</span>
              <span class="pr-tm-cell">
                {five !== undefined && <BeadAt prime={5} kind={five} />}
              </span>
              {isTen && <span class="pr-tm-ten">10</span>}
            </div>
          );
        })}
      </div>
      {others.map((o) => (
        <div class="pr-tm-col" key={o.prime}>
          {o.beads.map((kind, k) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: identical beads that never reorder
            <span key={k} class="pr-tm-cell">
              <BeadAt
                prime={o.prime}
                kind={kind}
                isStuck={kind === Kind.Live && stuck.includes(o.prime)}
              />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * The fraction as prime beads: the numerator's above the bar, the denominator's hanging below, 2s
 * and 5s side by side. Cancel crosses out what top and bottom share; Pair links each 2 below with
 * a 5 into a ten; Add brings the missing partners in, hollow, above and below alike. The working is
 * written under it, a line per step, and one button offers the next step.
 */
export function TenMakerView({ view, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as TenMakerState;
  const word = (w: { en: string; hi?: string }) => w[locale as "en" | "hi"] ?? w.en;
  const t = tensOf(s.numerator, s.denominator);
  const isCancelled = s.stage !== TenStage.Given;
  const isPaired = s.stage === TenStage.Paired || s.stage === TenStage.ToppedUp;
  const isTopped = s.stage === TenStage.ToppedUp;
  const top = bagOf(s.numerator);
  const bottom = bagOf(s.denominator);
  const lowTop = bagOf(t.low.numerator);
  const lowBottom = bagOf(t.low.denominator);
  const addedOf = (p: number) =>
    isTopped && t.missing === p ? t.places - (p === 2 ? t.twos : t.fives) : 0;
  const sideOf = (bag: typeof top, low: typeof top) => {
    const column = (p: number) => {
      const all = bag[p] ?? 0;
      const live = isCancelled ? (low[p] ?? 0) : all;
      return columnOf(live, addedOf(p), all - live);
    };
    return { two: column(2), five: column(5), column };
  };
  const above = sideOf(top, lowTop);
  const below = sideOf(bottom, lowBottom);
  const otherPrimes = [...new Set([...primesIn(top), ...primesIn(bottom)])]
    .filter((p) => p !== 2 && p !== 5)
    .sort((x, y) => x - y);
  const stuck = isPaired ? primesIn(t.others) : [];
  const pairedLevels = isTopped ? t.places : isPaired ? Math.min(t.twos, t.fives) : 0;
  const shownTop = isTopped
    ? t.low.numerator * t.multiplier
    : isCancelled
      ? t.low.numerator
      : s.numerator;
  const shownBottom = isTopped ? 10 ** t.places : isCancelled ? t.low.denominator : s.denominator;
  const working = workingOf(s);
  return (
    <div class="pr-tm">
      {s.isEditable && (
        <div class="pr-steppers">
          <NumberBox
            name="p"
            value={s.numerator}
            min={0}
            max={MAX_TERM}
            part="p"
            {...says(TenMakerAction.SetFraction)}
            onChange={(value) =>
              call(TenMakerAction.SetFraction, { numerator: value, denominator: s.denominator })
            }
          />
          <NumberBox
            name="q"
            value={s.denominator}
            min={1}
            max={MAX_TERM}
            part="q"
            {...says(TenMakerAction.SetFraction)}
            onChange={(value) =>
              call(TenMakerAction.SetFraction, { numerator: s.numerator, denominator: value })
            }
          />
        </div>
      )}
      <div class="pr-tm-frac" data-part="beads">
        <span class="pr-tm-num is-top">{shownTop}</span>
        <Side
          cols={above}
          others={otherPrimes.map((p) => ({ prime: p, beads: above.column(p) }))}
          isBelow={false}
          pairedLevels={0}
          stuck={[]}
        />
        <span class="pr-tm-bar" />
        <span class="pr-tm-num is-bottom">{shownBottom}</span>
        <Side
          cols={below}
          others={otherPrimes.map((p) => ({ prime: p, beads: below.column(p) }))}
          isBelow
          pairedLevels={pairedLevels}
          stuck={stuck}
        />
      </div>
      <ol class="pr-working" data-part="working">
        {working.map((line, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: one line per step, in order
          <li key={i} class={i === working.length - 1 ? "is-latest" : undefined}>
            {line}
          </li>
        ))}
      </ol>
      {stuck.length > 0 && (
        <p class="pr-ten-note is-stuck">{`${stuck.join(", ")}: no partner to make a ten`}</p>
      )}
      <div class="pr-controls">
        {s.stage === TenStage.Given && (
          <SymbolButton
            symbol={word(s.cancelLabel)}
            label={word(s.cancelLabel)}
            isWide
            part="cancel"
            {...does(TenMakerAction.Cancel)}
          />
        )}
        {s.stage === TenStage.Cancelled && (
          <SymbolButton
            symbol={word(s.pairLabel)}
            label={word(s.pairLabel)}
            isWide
            part="pair"
            {...does(TenMakerAction.Pair)}
          />
        )}
        {s.stage === TenStage.Paired && (
          <SymbolButton
            symbol={word(s.topUpLabel).replace("{p}", String(t.missing ?? 5))}
            label={word(s.topUpLabel).replace("{p}", String(t.missing ?? 5))}
            isWide
            part="topUp"
            isEnabled={t.canEnd}
            {...does(TenMakerAction.TopUp)}
          />
        )}
        <SymbolButton
          symbol="↺"
          label="Start again"
          part="startAgain"
          isEnabled={s.stage !== TenStage.Given}
          {...does(TenMakerAction.StartAgain)}
        />
      </div>
    </div>
  );
}
