import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  Mark,
  PropertyAction,
  type PropertySample,
  type PropertyState,
  PropertyTest,
  SAMPLES,
  TESTS,
  TEST_ORDER,
  describeProperty,
  outcomeOf,
  tableOf,
} from "./metal-properties";
import { type Words, say } from "./words";

const W = 320;
const H = 170;
const FLOOR = 150;

const WORDS = {
  try: { en: "Try it", hi: "करके देखो" },
  again: { en: "Try again", hi: "फिर से" },
  sample: { en: "Sample", hi: "नमूना" },
  test: { en: "Test", hi: "परीक्षण" },
  metal: { en: "metal", hi: "धातु" },
  nonMetal: { en: "non-metal", hi: "अधातु" },
  table: { en: "What we found", hi: "हमने क्या पाया" },
  ding: { en: "ding!", hi: "टन्न!" },
  thud: { en: "thud", hi: "धप्प" },
  unsafe: { en: "not heated", hi: "गरम नहीं किया" },
} as const satisfies Record<string, Words>;

const MARK_TEXT: Record<Mark, string> = { yes: "✓", no: "✗", partly: "~" };

const isMetalLike = (s: PropertySample) => SAMPLES[s].isMetal;

/** The sample as it sits on the bench, centred on (x, y): a bar of metal, lumps, a rod, a gem. */
function Sample({
  sample,
  x,
  y,
  w = 70,
  h = 14,
}: { sample: PropertySample; x: number; y: number; w?: number; h?: number }): JSX.Element {
  const cls = `mn-s mn-s-${sample}`;
  if (sample === "diamond")
    return (
      <path
        class={cls}
        d={`M${x - 12} ${y - 4} l 6 -8 h 12 l 6 8 l -12 14 z M${x - 12} ${y - 4} h 24`}
      />
    );
  if (sample === "coal" || sample === "sulphur" || sample === "iodine")
    return (
      <g class={cls}>
        <path d={`M${x - 26} ${y + 6} q -4 -12 8 -14 q 10 -6 16 4 q 8 2 4 10 z`} />
        <path d={`M${x + 2} ${y + 6} q -2 -10 10 -10 q 12 0 12 10 z`} />
      </g>
    );
  return <rect class={cls} x={x - w / 2} y={y - h / 2} width={w} height={h} rx={3} />;
}

function Sparkles({ x, y, n }: { x: number; y: number; n: number }) {
  const at = [
    [-26, -14],
    [6, -18],
    [26, -10],
    [-8, -22],
  ].slice(0, n);
  return (
    <g class="mn-sparkle mn-after">
      {at.map(([dx = 0, dy = 0]) => (
        <path
          key={`${dx}`}
          d={`M${x + dx} ${y + dy - 6} l 1.6 4.4 l 4.4 1.6 l -4.4 1.6 l -1.6 4.4 l -1.6 -4.4 l -4.4 -1.6 l 4.4 -1.6 z`}
        />
      ))}
    </g>
  );
}

function Crumbs({ x, y, sample }: { x: number; y: number; sample: PropertySample }) {
  const bits = [-30, -18, -8, 4, 14, 26, 36];
  return (
    <g class={`mn-s mn-s-${sample} mn-after`}>
      {bits.map((dx, i) => (
        <rect
          key={dx}
          x={x + dx - 3}
          y={y + 2 - (i % 3) * 2}
          width={5 + (i % 2) * 3}
          height={4 + (i % 3)}
          rx={1}
        />
      ))}
    </g>
  );
}

/** The test's tool and, once tried, what happened, drawn over the bench. */
function Scene({ s }: { s: PropertyState }): JSX.Element {
  const o = outcomeOf(s.sample, s.test);
  const done = s.isTried;
  const cx = 160;
  const cy = FLOOR - 9;
  switch (s.test) {
    case PropertyTest.Lustre: {
      const shine = o.mark === Mark.Yes ? 4 : o.mark === Mark.Partly ? 2 : 0;
      return (
        <g>
          <Sample sample={s.sample} x={cx} y={cy} />
          {!done && (
            <g class="mn-tool">
              <rect x={cx + 6} y={cy - 26} width={36} height={12} rx={2} class="mn-sandpaper" />
              <path class="mn-hand" d={`M${cx + 18} ${cy - 26} q 8 -14 22 -10 l -4 10 z`} />
            </g>
          )}
          {done && shine > 0 && <Sparkles x={cx} y={cy} n={shine} />}
          {done && shine === 0 && (
            <rect class="mn-dull mn-after" x={cx - 35} y={cy - 7} width={70} height={14} rx={3} />
          )}
        </g>
      );
    }
    case PropertyTest.Hardness: {
      const knife = (
        <g class="mn-tool">
          <path class="mn-blade" d={`M${cx - 40} ${cy - 30} l 52 0 l -8 8 l -44 0 z`} />
          <rect class="mn-handle" x={cx + 12} y={cy - 32} width={30} height={10} rx={3} />
        </g>
      );
      if (!done)
        return (
          <g>
            <Sample sample={s.sample} x={cx} y={cy} />
            {knife}
          </g>
        );
      if (o.mark === Mark.No && s.sample !== "sodium" && s.sample !== "graphite")
        return <Crumbs x={cx} y={cy} sample={s.sample} />;
      if (s.sample === "sodium" || s.sample === "graphite")
        return (
          <g class="mn-after">
            <Sample sample={s.sample} x={cx - 22} y={cy} w={36} />
            <Sample sample={s.sample} x={cx + 22} y={cy} w={36} />
            <path class="mn-blade" d={`M${cx - 3} ${cy - 38} l 6 0 l -2 28 l -2 0 z`} />
          </g>
        );
      return (
        <g>
          <Sample sample={s.sample} x={cx} y={cy} />
          <path
            class={o.mark === Mark.Partly ? "mn-groove mn-after" : "mn-scratch mn-after"}
            d={`M${cx - 24} ${cy - 2} q 24 ${o.mark === Mark.Partly ? 6 : 2} 48 0`}
          />
          {s.sample === "diamond" && (
            <path class="mn-scratch mn-after" d={`M${cx - 30} ${cy - 26} l 40 0`} />
          )}
        </g>
      );
    }
    case PropertyTest.Malleability: {
      const hammer = (
        <g class="mn-tool">
          <rect class="mn-handle" x={cx + 8} y={cy - 54} width={6} height={36} rx={2} />
          <rect class="mn-hammer" x={cx - 6} y={cy - 26} width={34} height={14} rx={3} />
        </g>
      );
      if (!done)
        return (
          <g>
            <rect class="mn-anvil" x={cx - 50} y={cy + 7} width={100} height={2} />
            <Sample sample={s.sample} x={cx} y={cy} />
            {hammer}
          </g>
        );
      if (o.mark === Mark.No) return <Crumbs x={cx} y={cy} sample={s.sample} />;
      return (
        <g class="mn-after">
          <Sample
            sample={s.sample}
            x={cx}
            y={cy + (o.mark === Mark.Yes ? 4 : 2)}
            w={o.mark === Mark.Yes ? 150 : 96}
            h={o.mark === Mark.Yes ? 4 : 9}
          />
          {o.mark === Mark.Partly && s.sample === "zinc" && (
            <path class="mn-crack" d={`M${cx + 20} ${cy - 2} l 4 4 l -3 3 l 4 3`} />
          )}
        </g>
      );
    }
    case PropertyTest.Ductility: {
      if (!done)
        return (
          <g>
            <Sample sample={s.sample} x={cx} y={cy} w={50} />
            <g class="mn-tool">
              <rect class="mn-clamp" x={cx - 44} y={cy - 12} width={14} height={24} rx={2} />
              <rect class="mn-clamp" x={cx + 30} y={cy - 12} width={14} height={24} rx={2} />
              <path class="mn-pull" d={`M${cx - 56} ${cy} h -18 M${cx + 56} ${cy} h 18`} />
            </g>
          </g>
        );
      if (o.mark === Mark.No)
        return s.sample === "sodium" ? (
          <g class="mn-after">
            <path class={`mn-s mn-s-${s.sample}`} d={`M${cx - 40} ${cy + 6} q 40 -14 80 0 z`} />
          </g>
        ) : (
          <Crumbs x={cx} y={cy} sample={s.sample} />
        );
      const long = o.mark === Mark.Yes;
      return (
        <g class="mn-after">
          <path
            class={`mn-wire mn-wire-${s.sample}`}
            d={
              long
                ? `M${cx - 130} ${cy} h 60 c 10 -20 30 -20 30 0 s 20 20 30 0 s 20 -20 30 0 s 20 20 30 0 h 60`
                : `M${cx - 60} ${cy} h 50 m 14 0 h 50`
            }
          />
        </g>
      );
    }
    case PropertyTest.Heat: {
      const rodY = cy - 26;
      const pinDown = done && o.mark === Mark.Yes && o.isUnsafe !== true;
      const tilt = done && o.mark === Mark.Partly;
      const brittle = !isMetalLike(s.sample) && s.sample !== "graphite" && s.sample !== "diamond";
      return (
        <g>
          <rect class="mn-stand" x={cx - 90} y={rodY - 4} width={8} height={FLOOR - rodY + 4} />
          <rect class="mn-clamp" x={cx - 94} y={rodY - 8} width={16} height={12} rx={2} />
          {brittle ? (
            <Sample sample={s.sample} x={cx - 10} y={rodY + 2} />
          ) : (
            <rect
              class={`mn-s mn-s-${s.sample}`}
              x={cx - 84}
              y={rodY - 2}
              width={150}
              height={5}
              rx={2}
            />
          )}
          {o.isUnsafe !== true && (
            <path class="mn-flame" d={`M${cx - 70} ${FLOOR - 24} q 9 -14 0 -26 q 14 10 9 26 z`} />
          )}
          {o.isUnsafe !== true && (
            <rect class="mn-lamp" x={cx - 78} y={FLOOR - 24} width={16} height={24} rx={3} />
          )}
          {!brittle && (
            <g>
              {!pinDown && <circle class="mn-wax" cx={cx + 56} cy={rodY + 5} r={4} />}
              {pinDown ? (
                <g class="mn-pin mn-after">
                  <line x1={cx + 46} y1={FLOOR - 2} x2={cx + 70} y2={FLOOR - 2} />
                  <circle class="mn-wax" cx={cx + 46} cy={FLOOR - 3} r={2.5} />
                </g>
              ) : (
                <g
                  class={tilt ? "mn-pin is-tilted" : "mn-pin"}
                  style={{ transformOrigin: `${cx + 56}px ${rodY + 6}px` } as JSX.CSSProperties}
                >
                  <line x1={cx + 56} y1={rodY + 6} x2={cx + 56} y2={rodY + 30} />
                </g>
              )}
            </g>
          )}
          {done && brittle && (
            <path
              class="mn-vapour mn-after"
              d={`M${cx - 20} ${rodY - 8} q 10 -16 0 -30 q 14 10 6 30`}
            />
          )}
        </g>
      );
    }
    case PropertyTest.Electricity: {
      const glow = done && o.mark === Mark.Yes;
      return (
        <g>
          <rect class="mn-battery" x={34} y={FLOOR - 30} width={40} height={24} rx={3} />
          <text class="mn-small" x={54} y={FLOOR - 14} text-anchor="middle">
            + −
          </text>
          <path class="mn-wire-lead" d={`M74 ${FLOOR - 18} H ${cx - 40}`} />
          <path class="mn-wire-lead" d={`M${cx + 40} ${FLOOR - 18} H 262 V 60`} />
          <path class="mn-wire-lead" d="M54 120 V 60 H 236" />
          {glow && <circle class="mn-glow mn-after" cx={250} cy={52} r={22} />}
          <circle class={glow ? "mn-bulb is-on" : "mn-bulb"} cx={250} cy={52} r={11} />
          <rect class="mn-bulb-base" x={244} y={62} width={12} height={8} rx={1} />
          <Sample sample={s.sample} x={cx} y={FLOOR - 18} w={80} h={10} />
          <circle class="mn-clip" cx={cx - 40} cy={FLOOR - 18} r={3} />
          <circle class="mn-clip" cx={cx + 40} cy={FLOOR - 18} r={3} />
          <text class="mn-small" x={cx - 40} y={FLOOR - 26} text-anchor="middle">
            A
          </text>
          <text class="mn-small" x={cx + 40} y={FLOOR - 26} text-anchor="middle">
            B
          </text>
        </g>
      );
    }
    case PropertyTest.Sonority:
      return (
        <g>
          <Sample sample={s.sample} x={cx} y={done ? cy : cy - 50} />
          {!done && <path class="mn-pull" d={`M${cx} ${cy - 36} v 18`} />}
          {done && o.mark === Mark.Yes && (
            <g class="mn-ring mn-after">
              <path d={`M${cx - 46} ${cy - 18} q -10 12 0 24`} />
              <path d={`M${cx - 56} ${cy - 24} q -14 18 0 36`} />
              <path d={`M${cx + 46} ${cy - 18} q 10 12 0 24`} />
              <path d={`M${cx + 56} ${cy - 24} q 14 18 0 36`} />
            </g>
          )}
        </g>
      );
  }
}

/** The bench, the result in words, chips to pick a sample and a test, and the results table. */
export function PropertyTesterView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as PropertyState;
  const k = width / W;
  const height = Math.round(H * k);
  const o = outcomeOf(s.sample, s.test);
  const info = SAMPLES[s.sample];
  const test = TESTS[s.test];
  const rows = tableOf(s);
  const testsShown = TEST_ORDER.filter((t) => s.tests.includes(t));
  const soundWord =
    s.test === PropertyTest.Sonority && s.isTried
      ? say(locale, o.mark === Mark.Yes ? WORDS.ding : WORDS.thud)
      : null;
  return (
    <div class="mn mn-pt">
      <Stage
        label={describeProperty(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "mn-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mn-bg" x={0} y={0} width={W} height={H} rx={12} />
          <rect class="mn-bench" x={0} y={FLOOR} width={W} height={H - FLOOR} />
          <text class="mn-title" x={12} y={20}>
            {say(locale, info.name)}
          </text>
          <text class="mn-small" x={12} y={34}>
            {say(locale, info.isMetal ? WORDS.metal : WORDS.nonMetal)}
          </text>
          <g key={`${s.sample}-${s.test}-${s.isTried}`} data-part="bench">
            <Scene s={s} />
          </g>
          {soundWord !== null && (
            <text class="mn-sound mn-after" x={W - 16} y={30} text-anchor="end">
              {soundWord}
            </text>
          )}
        </g>
      </Stage>
      <p class="mn-how">
        {say(locale, test.how)}
        {s.showProperty && <span class="mn-prop-name"> · {say(locale, test.property)}</span>}
      </p>
      {s.isTried && (
        <p class={`mn-result is-${o.mark}`} data-part="result">
          {say(locale, o.seen)}
        </p>
      )}
      {s.canChoose && s.samples.length > 1 && (
        <div class="mn-chips" data-part="samples" aria-label={say(locale, WORDS.sample)}>
          {s.samples.map((x) => (
            <button
              key={x}
              type="button"
              class={x === s.sample ? "mn-chip is-on" : "mn-chip"}
              aria-pressed={x === s.sample}
              onClick={() => call(PropertyAction.ChooseSample, { sample: x })}
            >
              {say(locale, SAMPLES[x].name)}
            </button>
          ))}
        </div>
      )}
      {s.canChoose && testsShown.length > 1 && (
        <div class="mn-chips" data-part="tests" aria-label={say(locale, WORDS.test)}>
          {testsShown.map((t) => (
            <button
              key={t}
              type="button"
              class={t === s.test ? "mn-chip is-on" : "mn-chip"}
              aria-pressed={t === s.test}
              onClick={() => call(PropertyAction.ChooseTest, { test: t })}
            >
              {say(locale, TESTS[t].name)}
            </button>
          ))}
        </div>
      )}
      <div class="mn-row">
        <button
          type="button"
          class={s.isTried ? "mn-button is-again" : "mn-button"}
          data-part="try"
          onClick={() => call(PropertyAction.Try, {})}
        >
          {say(locale, s.isTried ? WORDS.again : WORDS.try)}
        </button>
      </div>
      {s.showTable && rows.length > 0 && (
        <div class="mn-table-wrap" data-part="table">
          <table class="mn-table">
            <caption>{say(locale, WORDS.table)}</caption>
            <thead>
              <tr>
                <th />
                {testsShown.map((t) => (
                  <th key={t} scope="col">
                    {say(locale, TESTS[t].name)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.sample}>
                  <th scope="row">
                    {SAMPLES[row.sample].symbol === "C"
                      ? say(locale, SAMPLES[row.sample].name).split(" ")[0]
                      : SAMPLES[row.sample].symbol}
                  </th>
                  {testsShown.map((t) => {
                    const m = row.marks[TEST_ORDER.indexOf(t)] ?? null;
                    return (
                      <td key={t} class={m === null ? "" : `is-${m}`}>
                        {m === null ? "" : MARK_TEXT[m]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
