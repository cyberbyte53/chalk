import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { type Words, differences, generalText, numText, say, signedText, sub } from "./ap";
import { barScale, texToPlain } from "./plot";
import {
  SequenceAction,
  SequencePart,
  type SequenceState,
  Verdict,
  nextTerms,
  valuesOf,
  verdictOf,
} from "./sequence";
import { Button, Nudger } from "./ui";

const WORDS = {
  reveal: { en: "Check the next difference", hi: "अगला अंतर जाँचो" },
  revealFirst: { en: "Check the first difference", hi: "पहला अंतर जाँचो" },
  isAP: { en: "Same difference every time: an AP", hi: "हर बार वही अंतर: एक AP" },
  notAP: {
    en: "This difference is not the same: not an AP",
    hi: "यह अंतर वैसा नहीं है: AP नहीं",
  },
  next: { en: "next", hi: "अगले" },
} as const satisfies Record<string, Words>;

const PAD = { left: 8, right: 8 };
const CHIP_ROW = 16;
const PLOT_TOP = 58;
const PLOT_H = 128;

/** A term's label before any thinning: its TeX made plain, or the number. */
function textOfRaw(s: SequenceState, all: readonly number[], i: number): string {
  return s.labels !== null && i < s.labels.length
    ? texToPlain(s.labels[i] as string)
    : numText(all[i] as number);
}

export function SequenceView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SequenceState;
  const values = valuesOf(s);
  const diffs = differences(values);
  const verdict = verdictOf(s);
  const ahead = verdict === Verdict.IsAP ? nextTerms(s).slice(0, s.showNext) : [];
  const all = [...values, ...ahead];
  const tail = s.isEndless ? 0.7 : 0;
  const slots = all.length + tail;
  const slotW = (width - PAD.left - PAD.right) / slots;
  const barW = Math.max(8, Math.min(slotW * 0.62, 46));
  const cx = (i: number) => PAD.left + slotW * (i + 0.5);
  const bottom = PLOT_TOP + PLOT_H;
  const scale = barScale(all, PLOT_TOP + 16, bottom - 16);
  const baseY = scale.y(scale.base);
  const zeroY = scale.isBroken ? null : scale.y(0);
  const labelRow = bottom + 18;
  const generalRow = labelRow + 18;
  const height = Math.round((s.showGeneral ? generalRow : labelRow) + 12);
  const small = slotW < 34;
  const brk = diffs.findIndex((x) => Math.abs(x - (diffs[0] as number)) >= 1e-9);
  // On a crowded row, label every other bar (or fewer) and stagger the difference chips.
  const widest = Math.max(...all.map((_, i) => textOfRaw(s, all, i).length));
  const every = Math.max(1, Math.ceil((widest * (small ? 6.4 : 7.6) + 4) / slotW));
  const chipText = Math.max(...diffs.map((x) => signedText(x).length)) * (small ? 6.2 : 7.4) + 12;
  const stagger = chipText > slotW - 2;
  const chipW = stagger
    ? Math.min(chipText, slotW * 1.8)
    : Math.max(Math.min(36, slotW - 2), chipText);
  const textOf = (i: number) =>
    s.labels !== null && i < s.labels.length
      ? texToPlain(s.labels[i] as string)
      : numText(all[i] as number);
  return (
    <div class="ap-seq">
      <Stage
        label={`The list ${values.map(numText).join(", ")}`}
        x={[0, width]}
        width={width}
        height={height}
        svg={{ class: "ap-svg" }}
      >
        {zeroY !== null && (
          <line class="ap-zero" x1={PAD.left} y1={zeroY} x2={width - PAD.right} y2={zeroY} />
        )}
        {scale.isBroken && (
          <g class="ap-break">
            <line x1={PAD.left} y1={baseY} x2={width - PAD.right} y2={baseY} />
            <path d={`M${PAD.left + 2} ${baseY - 4} l 5 8 M${PAD.left + 8} ${baseY - 4} l 5 8`} />
          </g>
        )}
        <g data-part={SequencePart.Bars}>
          {all.map((v, i) => {
            const y = scale.y(v);
            const isAhead = i >= values.length;
            const up = v >= scale.base;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: terms are positional
              <g key={i} class={isAhead ? "ap-term is-ahead" : "ap-term"}>
                <rect
                  class="ap-bar"
                  x={cx(i) - barW / 2}
                  y={Math.min(y, baseY)}
                  width={barW}
                  height={Math.max(2, Math.abs(baseY - y))}
                  rx={3}
                />
                {((i % every === 0 && all.length - 1 - i >= every) ||
                  i === all.length - 1 ||
                  isAhead) && (
                  <text
                    class={small ? "ap-value is-small" : "ap-value"}
                    x={cx(i)}
                    y={up ? Math.min(y, baseY) - 5 : Math.max(y, baseY) + 13}
                    text-anchor="middle"
                  >
                    {textOf(i)}
                  </text>
                )}
                <text class="ap-index" x={cx(i)} y={labelRow} text-anchor="middle">
                  {isAhead ? "" : `a${sub(i + 1)}`}
                </text>
                {s.showGeneral && !isAhead && (
                  <text
                    class={small ? "ap-general is-small" : "ap-general"}
                    x={cx(i)}
                    y={generalRow}
                    text-anchor="middle"
                  >
                    {generalText(i + 1)}
                  </text>
                )}
              </g>
            );
          })}
          {s.isEndless && (
            <text
              class="ap-dots"
              x={PAD.left + slotW * (all.length + tail / 2)}
              y={baseY - 6}
              text-anchor="middle"
            >
              …
            </text>
          )}
          {ahead.length > 0 && (
            <text
              class="ap-next-label"
              x={cx(values.length)}
              y={CHIP_ROW + 4}
              text-anchor="middle"
              data-part={SequencePart.Next}
            >
              {say(locale, WORDS.next)} →
            </text>
          )}
        </g>
        <g data-part={SequencePart.Differences}>
          {diffs.slice(0, s.shown).map((x, i) => {
            const isOff = brk >= 0 && i === brk;
            const cls = isOff ? "is-off" : verdict === Verdict.IsAP ? "is-on" : "";
            const x1 = cx(i);
            const x2 = cx(i + 1);
            const mid = (x1 + x2) / 2;
            const row = CHIP_ROW + (stagger && i % 2 === 1 ? 20 : 0);
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: differences are positional
              <g key={i} class={`ap-diff ${cls}`}>
                <path
                  class="ap-hop"
                  d={`M${x1 + 4} ${PLOT_TOP + 2} Q ${mid} ${CHIP_ROW + 14} ${x2 - 4} ${PLOT_TOP + 2}`}
                />
                <path class="ap-hop-head" d={`M${x2 - 4} ${PLOT_TOP + 2} l -6 -3 l 2 6 z`} />
                <rect
                  class="ap-chip"
                  x={mid - chipW / 2}
                  y={row - 11}
                  width={chipW}
                  height={20}
                  rx={10}
                />
                <text
                  class={small ? "ap-chip-text is-small" : "ap-chip-text"}
                  x={mid}
                  y={row + 4}
                  text-anchor="middle"
                >
                  {signedText(x)}
                </text>
              </g>
            );
          })}
        </g>
      </Stage>
      <div class="ap-controls">
        {s.canSetA && s.values === null && (
          <Nudger
            name="a"
            value={numText(s.a)}
            part={SequencePart.StepA}
            onNudge={(by) => call(SequenceAction.NudgeA, { by })}
          />
        )}
        {s.canSetD && s.values === null && (
          <Nudger
            name="d"
            value={numText(s.d)}
            part={SequencePart.StepD}
            onNudge={(by) => call(SequenceAction.NudgeD, { by })}
          />
        )}
        {s.canReveal && verdict === Verdict.Unknown && (
          <Button
            isWide
            label={say(locale, s.shown === 0 ? WORDS.revealFirst : WORDS.reveal)}
            part={SequencePart.Reveal}
            onPress={() => call(SequenceAction.Reveal, {})}
          >
            {say(locale, s.shown === 0 ? WORDS.revealFirst : WORDS.reveal)}
          </Button>
        )}
      </div>
      {verdict !== Verdict.Unknown && (
        <p
          class={verdict === Verdict.IsAP ? "ap-verdict is-on" : "ap-verdict is-off"}
          data-part={SequencePart.Verdict}
        >
          {verdict === Verdict.IsAP
            ? `${say(locale, WORDS.isAP)}, d = ${numText(diffs[0] ?? 0)}`
            : say(locale, WORDS.notAP)}
        </p>
      )}
    </div>
  );
}
