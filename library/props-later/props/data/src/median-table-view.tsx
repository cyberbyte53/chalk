import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  CfKind,
  Given,
  MEDIAN_STEPS,
  MedianAction,
  MedianPart,
  type MedianState,
  cfOf,
  lastMedianStep,
} from "./median-table";
import { type Words, isRounded, numText, say } from "./numbers";
import { classText, medianIndex, medianOf, medianParts, medianWorking, rowAt } from "./stats";
import { Stepper, Working } from "./ui";

const WORDS = {
  total: { en: "Total", hi: "योग" },
  median: { en: "Median", hi: "माध्यक" },
  medianClass: { en: "median class", hi: "माध्यक वर्ग" },
  tap: {
    en: "Tap the median class: the first cf more than n/2",
    hi: "माध्यक वर्ग पर टैप करो: पहला cf जो n/2 से अधिक हो",
  },
  notThis: {
    en: "Not that one: whose cf first passes n/2?",
    hi: "यह नहीं: किसका cf सबसे पहले n/2 से आगे जाता है?",
  },
  lessThan: { en: "less than", hi: "से कम" },
  moreThan: { en: "at least", hi: "कम से कम" },
} as const satisfies Record<string, Words>;

export function MedianTableView({ view, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as MedianState;
  const cf = cfOf(s);
  const i = medianIndex(s.rows);
  const p = medianParts(s.rows);
  const median = medianOf(s.rows);
  const showF = s.given === Given.Frequencies || s.step >= 1;
  const showCf = s.given === Given.Cumulative || s.step >= 1;
  const tappable = s.canPick && s.step === 1;
  const isWrong = s.picked !== null && s.picked !== i && s.step === 1;
  const last = lastMedianStep(s);
  const cfHead = s.cfKind === CfKind.MoreThan ? `cf (${say(locale, WORDS.moreThan)})` : "cf";
  return (
    <div class="dt-median">
      <table class="dt-table" data-part={MedianPart.Table}>
        <thead>
          <tr>
            <th>{say(locale, s.classHeading)}</th>
            <th>
              <span class="dt-sub">{say(locale, s.freqHeading)}</span> f
            </th>
            <th>{cfHead}</th>
          </tr>
        </thead>
        <tbody>
          {s.rows.map((r, k) => {
            const isMedian = s.step >= 2 && k === i;
            const isBefore = s.step >= 3 && k === i - 1;
            return (
              <tr
                // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional
                key={k}
                class={`${isMedian ? "is-median" : ""}${isBefore ? " is-before" : ""}${tappable ? " is-tappable" : ""}${
                  s.picked === k && k !== i ? " is-wrong" : ""
                }`}
                tabIndex={tappable ? 0 : undefined}
                role={tappable ? "button" : undefined}
                onClick={tappable ? () => call(MedianAction.Pick, { index: k }) : undefined}
                onKeyDown={
                  tappable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ")
                          call(MedianAction.Pick, { index: k });
                      }
                    : undefined
                }
              >
                <td>{classText(r, locale)}</td>
                <td class={s.given === Given.Cumulative && s.step >= 1 ? "is-new" : ""}>
                  {showF ? r.f : ""}
                </td>
                <td class={s.given === Given.Frequencies && s.step >= 1 ? "is-new" : ""}>
                  {showCf ? cf[k] : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>{say(locale, WORDS.total)}</td>
            <td>{showF ? `n = ${p.n}` : ""}</td>
            <td />
          </tr>
        </tfoot>
      </table>
      {tappable && (
        <p class={`dt-note${isWrong ? " is-wrong" : ""}`}>
          {say(locale, isWrong ? WORDS.notThis : WORDS.tap)}
        </p>
      )}
      {s.step >= 2 && (
        <p class="dt-note" data-part={MedianPart.Half}>
          {`n = ${p.n},  n/2 = ${numText(p.n / 2)}  →  ${say(locale, WORDS.medianClass)}: ${classText(
            rowAt(s.rows, i),
            locale,
          )}`}
        </p>
      )}
      {s.step >= 3 && (
        <p class="dt-given" data-part={MedianPart.Working}>
          {`l = ${numText(p.l)},  cf = ${p.cf},  f = ${p.f},  h = ${numText(p.h)}`}
        </p>
      )}
      {s.step === MEDIAN_STEPS && (
        <>
          <Working lines={medianWorking(s.rows)} />
          <p class="dt-verdict" data-part={MedianPart.Result}>
            {`${say(locale, WORDS.median)} ${isRounded(median) ? "≈" : "="} ${numText(median)}`}
          </p>
        </>
      )}
      {s.canStep && last > 0 && (
        <Stepper
          locale={locale}
          step={s.step}
          last={tappable && s.picked !== i ? 1 : last}
          nextPart={MedianPart.Next}
          backPart={MedianPart.Back}
          onNext={() => call(MedianAction.Next, {})}
          onBack={() => call(MedianAction.Back, {})}
        />
      )}
    </div>
  );
}
