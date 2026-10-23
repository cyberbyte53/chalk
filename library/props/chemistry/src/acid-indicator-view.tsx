import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  INDICATORS,
  type IndicatorId,
  NATURE_WORDS,
  type Response,
  SUBSTANCES,
  type SubstanceId,
  natureOf,
  responseOf,
  responseWords,
  subscripted,
} from "./acid-data";
import { Chips, hueClass, phClass } from "./acid-draw";
import {
  IndicatorAction,
  type IndicatorState,
  describeIndicator,
  isSampleDone,
  latestTest,
  wasTested,
} from "./acid-indicator";
import { type Words, say } from "./words";

const W = 320;
const H = 168;
const GLASS_Y = 104;

const WORDS = {
  pick: { en: "Indicator in hand", hi: "हाथ में सूचक" },
  tap: { en: "Tap a glass to test it", hi: "जाँचने के लिए किसी काँच पर टैप करो" },
  sample: { en: "Sample", hi: "नमूना" },
  nature: { en: "So it is", hi: "तो यह है" },
  smell: { en: "smell", hi: "गंध" },
  noSmell: { en: "no smell", hi: "गंध नहीं" },
  wash: { en: "Wash the glasses", hi: "काँच धो दो" },
} as const satisfies Record<string, Words>;

/** Break a name into lines of about `n` characters. */
function lines(text: string, n: number): string[] {
  const out: string[] = [];
  for (const word of text.split(" ")) {
    const last = out[out.length - 1];
    if (last !== undefined && last.length + word.length + 1 <= n)
      out[out.length - 1] = `${last} ${word}`;
    else out.push(word);
  }
  return out.slice(0, 3);
}

/** The swatch class of a response (null for a smell). */
export function responseClass(r: Response): string | null {
  if (r.kind === "smell") return null;
  if (r.kind === "universal") return phClass(r.band);
  return hueClass(r.hue);
}

function Applied({
  x,
  indicator,
  sample,
  locale,
}: {
  x: number;
  indicator: IndicatorId;
  sample: SubstanceId;
  locale: string;
}): JSX.Element {
  const info = INDICATORS[indicator];
  const r = responseOf(indicator, SUBSTANCES[sample].pH);
  if (r.kind === "smell") {
    return (
      <g class="ai-smell">
        <path class="ai-nose" d={`M${x - 4} ${GLASS_Y - 52} q 6 10 2 18 q 6 2 8 -2`} />
        {r.isSmelt ? (
          <path
            class="ai-waves"
            d={`M${x - 10} ${GLASS_Y - 14} q 3 -5 0 -10 q -3 -5 0 -10 M${x + 8} ${GLASS_Y - 14} q 3 -5 0 -10 q -3 -5 0 -10`}
          />
        ) : (
          <path
            class="ai-cross"
            d={`M${x - 9} ${GLASS_Y - 30} l 18 14 M${x + 9} ${GLASS_Y - 30} l -18 14`}
          />
        )}
        <text class="ai-smell-word" x={x} y={GLASS_Y - 58} text-anchor="middle">
          {say(locale, r.isSmelt ? WORDS.smell : WORDS.noSmell)}
        </text>
      </g>
    );
  }
  const cls = responseClass(r) ?? "";
  if (info.form === "paper") {
    // A strip dipped into the sample: its own colour above, the answer where it is wet.
    const own = indicator === "universal" ? "ac-paper" : hueClass(info.own);
    return (
      <g class="ai-strip">
        <rect class={own} x={x - 5} y={GLASS_Y - 52} width={10} height={30} rx={1.5} />
        <rect class={`${cls} ai-wet`} x={x - 5} y={GLASS_Y - 26} width={10} height={20} rx={1.5} />
        <rect class="ai-strip-edge" x={x - 5} y={GLASS_Y - 52} width={10} height={46} rx={1.5} />
      </g>
    );
  }
  // A solution: a drop falls in and the liquid takes its colour.
  return (
    <g class="ai-drop">
      <path
        class={`${hueClass(info.own)} ai-dropper-tip`}
        d={`M${x} ${GLASS_Y - 34} q 4 6 0 9 q -4 -3 0 -9 z`}
      />
      <rect class="ai-dropper" x={x - 3} y={GLASS_Y - 62} width={6} height={22} rx={2} />
      <ellipse class="ai-bulb" cx={x} cy={GLASS_Y - 64} rx={5} ry={4} />
    </g>
  );
}

/** Watch-glasses of samples, the indicator chooser, and (optionally) Table 2.1. */
export function AcidIndicatorView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as IndicatorState;
  const k = width / W;
  const height = Math.round(H * k);
  const slot = W / s.samples.length;
  return (
    <div class="ai ac">
      <Stage
        label={describeIndicator(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "ai-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="ac-bg" x={0} y={0} width={W} height={H} rx={12} />
          <rect class="ac-table" x={0} y={GLASS_Y + 8} width={W} height={H - GLASS_Y - 8} />
          {s.samples.map((sample, i) => {
            const x = slot * (i + 0.5);
            const ind = latestTest(s, sample);
            const r = ind === null ? null : responseOf(ind, SUBSTANCES[sample].pH);
            const liquid =
              ind !== null && INDICATORS[ind].form === "solution" && r !== null
                ? (responseClass(r) ?? "ac-water")
                : "ac-water";
            const sub = SUBSTANCES[sample];
            const name =
              sub.formula !== undefined && slot < 70
                ? subscripted(sub.formula)
                : say(locale, sub.name);
            const nameLines = lines(name, Math.max(7, Math.floor(slot / 6.2)));
            const glassW = Math.min(44, slot - 8);
            const open = () => s.canTest && call(IndicatorAction.Test, { sample });
            return (
              <g
                key={sample}
                class={s.canTest ? "ai-sample is-tappable" : "ai-sample"}
                data-part={`sample-${sample}`}
                role={s.canTest ? "button" : undefined}
                tabIndex={s.canTest ? 0 : undefined}
                aria-label={say(locale, sub.name)}
                onClick={open}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open();
                  }
                }}
              >
                <rect class="ai-hit" x={x - slot / 2} y={0} width={slot} height={H} />
                <path
                  key={`${sample}-${ind ?? "none"}`}
                  class={`${liquid} ai-liquid`}
                  d={`M${x - glassW / 2 + 4} ${GLASS_Y - 4} q ${glassW / 2 - 4} 12 ${glassW - 8} 0 z`}
                />
                <path
                  class="ac-glass"
                  d={`M${x - glassW / 2} ${GLASS_Y - 8} q ${glassW / 2} 22 ${glassW} 0`}
                />
                {ind !== null && <Applied x={x} indicator={ind} sample={sample} locale={locale} />}
                {s.showNames &&
                  nameLines.map((line, j) => (
                    <text
                      key={line}
                      class="ai-name"
                      x={x}
                      y={GLASS_Y + 24 + j * 12}
                      text-anchor="middle"
                    >
                      {line}
                    </text>
                  ))}
                {s.showNature && isSampleDone(s, sample) && (
                  <text
                    class={`ai-nature is-${natureOf(sample)}`}
                    x={x}
                    y={H - 8}
                    text-anchor="middle"
                  >
                    {say(locale, NATURE_WORDS[natureOf(sample)])}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </Stage>
      {s.canTest && (
        <Chips
          options={s.indicators.map((id) => ({ id, words: INDICATORS[id].name }))}
          chosen={s.chosen}
          label={WORDS.pick}
          onChoose={(indicator) => call(IndicatorAction.Choose, { indicator })}
          locale={locale}
          part="indicators"
          swatch={(id) =>
            INDICATORS[id].form === "smell"
              ? null
              : id === "universal"
                ? phClass(7)
                : hueClass(INDICATORS[id].own)
          }
        />
      )}
      {s.canTest && <p class="ac-hint">{say(locale, WORDS.tap)}</p>}
      {s.showTable && (
        <div class="ac-table-wrap" data-part="table">
          <table class="ac-results">
            <thead>
              <tr>
                <th scope="col">{say(locale, WORDS.sample)}</th>
                {s.indicators.map((i) => (
                  <th scope="col" key={i}>
                    {say(locale, INDICATORS[i].name)}
                  </th>
                ))}
                {s.showNature && <th scope="col">{say(locale, WORDS.nature)}</th>}
              </tr>
            </thead>
            <tbody>
              {s.samples.map((sample) => (
                <tr key={sample}>
                  <th scope="row">{say(locale, SUBSTANCES[sample].name)}</th>
                  {s.indicators.map((i) => {
                    if (!wasTested(s, sample, i)) return <td key={i}>–</td>;
                    const r = responseOf(i, SUBSTANCES[sample].pH);
                    const cls = responseClass(r);
                    return (
                      <td key={i}>
                        {cls !== null && (
                          <svg class="ac-chip-dot" viewBox="0 0 10 10" aria-hidden="true">
                            <circle class={cls} cx={5} cy={5} r={4.5} />
                          </svg>
                        )}
                        {say(locale, responseWords(i, SUBSTANCES[sample].pH))}
                      </td>
                    );
                  })}
                  {s.showNature && (
                    <td class={`ai-nature-cell is-${natureOf(sample)}`}>
                      {isSampleDone(s, sample) ? say(locale, NATURE_WORDS[natureOf(sample)]) : "–"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
