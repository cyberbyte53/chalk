import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { COLOUR_WORDS, type Colour, Experiment, outcomesOf, probabilityOf } from "./chance";
import { Bag, Coin, Die, Spinner } from "./chance-pictures";
import {
  RunAction,
  RunPart,
  type RunState,
  empiricalOf,
  setupOf,
  theoreticalOf,
} from "./chance-run";
import { type Words, fracText, numText, say } from "./numbers";
import { Button } from "./ui";

const WORDS = {
  trials: { en: "Trials", hi: "प्रयास" },
  times: { en: "times", hi: "बार" },
  happened: { en: "happened", hi: "हुआ" },
  experimental: { en: "Experimental", hi: "प्रायोगिक" },
  theoretical: { en: "Theoretical", hi: "सैद्धांतिक" },
  reset: { en: "Clear", hi: "साफ़ करो" },
  run: { en: "Run", hi: "चलाओ" },
  fraction: { en: "fraction", hi: "भिन्न" },
  notYet: { en: "Press a button to start", hi: "शुरू करने के लिए बटन दबाओ" },
} as const satisfies Record<string, Words>;

/** The picture of the experiment, with the last outcome showing. */
function Picture({ s, width, locale }: { s: RunState; width: number; locale: string }) {
  const cx = width / 2;
  const y = 44;
  const faceOf = (pos: string | undefined) =>
    pos === undefined ? null : (s.faces[Number(pos) - 1] ?? null);
  switch (s.kind) {
    case Experiment.Coin:
      return <Coin x={cx} y={y} r={26} face={s.last} />;
    case Experiment.TwoCoins:
      return (
        <>
          <Coin x={cx - 34} y={y} r={24} face={s.last?.[0] ?? null} />
          <Coin x={cx + 34} y={y} r={24} face={s.last?.[1] ?? null} />
        </>
      );
    case Experiment.Die:
      return <Die x={cx} y={y} s={48} value={faceOf(s.last ?? undefined)} />;
    case Experiment.TwoDice: {
      const [a, b] = s.last === null ? [undefined, undefined] : s.last.split("-");
      return (
        <>
          <Die x={cx - 32} y={y} s={44} value={faceOf(a)} />
          <Die x={cx + 32} y={y} s={44} value={faceOf(b)} tone={1} />
        </>
      );
    }
    case Experiment.Bag:
      return <Bag x={cx - 60} y={8} w={96} h={66} marbles={s.marbles} pick={s.last} />;
    case Experiment.Spinner:
      return (
        <Spinner
          x={cx}
          y={y}
          r={38}
          labels={s.sectors.map((w) => say(locale, w))}
          at={s.last === null ? null : Number(s.last)}
        />
      );
    case Experiment.Cards:
      return null;
  }
}

export function ChanceRunView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as RunState;
  const setup = setupOf(s);
  const p = probabilityOf(setup, s.favourable);
  const theory = theoreticalOf(s);
  const emp = empiricalOf(s);
  const lastLabel = outcomesOf(setup).find((o) => o.id === s.last);
  const graphH = 150;
  const pad = { left: 34, right: 12, top: 10, bottom: 24 };
  const maxN = Math.max(10, s.history[s.history.length - 1]?.[0] ?? 10);
  // A log scale for trials, so the first few tosses and the thousandth both show.
  const lx = (n: number) =>
    pad.left + (Math.log10(Math.max(1, n)) / Math.log10(maxN)) * (width - pad.left - pad.right);
  const ly = (f: number) => graphH - pad.bottom - f * (graphH - pad.top - pad.bottom);
  const ticks = [1, 10, 100, 1000, 10000, 100000].filter((t) => t <= maxN);
  const line = s.history
    .map(([n, f], i) => `${i === 0 ? "M" : "L"}${lx(n).toFixed(1)} ${ly(f).toFixed(1)}`)
    .join(" ");
  const label =
    s.kind === Experiment.Bag && s.last !== null
      ? say(locale, COLOUR_WORDS[s.last as Colour])
      : s.kind === Experiment.Spinner && s.last !== null
        ? say(locale, s.sectors[Number(s.last)] ?? { en: "", hi: "" })
        : (lastLabel?.label ?? "");
  return (
    <div class="dt-run">
      <Stage
        label="The experiment"
        x={[0, width]}
        width={width}
        height={92}
        svg={{ class: "dt-svg" }}
      >
        <g data-part={RunPart.Picture}>
          <Picture s={s} width={width} locale={locale} />
        </g>
      </Stage>
      <p class="dt-note">{s.last === null ? say(locale, WORDS.notYet) : label}</p>
      <div class="dt-counts" data-part={RunPart.Counts}>
        <span>
          {say(locale, WORDS.trials)}: <b>{s.trials}</b>
        </span>
        <span>
          {say(locale, s.eventLabel)}: <b>{s.hits}</b>
        </span>
        <span>
          {say(locale, WORDS.experimental)}:{" "}
          <b>{s.trials === 0 ? "–" : `${s.hits}/${s.trials} ≈ ${numText(emp, 3)}`}</b>
        </span>
        {s.showTheory && (
          <span class="is-theory">
            {say(locale, WORDS.theoretical)}: <b>{`${fracText(p)} ≈ ${numText(theory, 3)}`}</b>
          </span>
        )}
      </div>
      <Stage
        label="Fraction against trials"
        x={[0, width]}
        width={width}
        height={graphH}
        svg={{ class: "dt-svg" }}
      >
        <g class="dt-axes" data-part={RunPart.Graph}>
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <g key={f}>
              <line class="dt-grid" x1={pad.left} x2={width - pad.right} y1={ly(f)} y2={ly(f)} />
              <text class="dt-tick" x={pad.left - 4} y={ly(f) + 4} text-anchor="end">
                {numText(f)}
              </text>
            </g>
          ))}
          {ticks.map((t) => (
            <text
              key={t}
              class="dt-tick"
              x={lx(t)}
              y={graphH - pad.bottom + 14}
              text-anchor="middle"
            >
              {t >= 1000 ? `${t / 1000}k` : t}
            </text>
          ))}
          <line class="dt-axis" x1={pad.left} x2={width - pad.right} y1={ly(0)} y2={ly(0)} />
          <line class="dt-axis" x1={pad.left} x2={pad.left} y1={ly(1)} y2={ly(0)} />
          {s.showTheory && (
            <line
              class="dt-theory"
              x1={pad.left}
              x2={width - pad.right}
              y1={ly(theory)}
              y2={ly(theory)}
            />
          )}
          {s.history.length > 1 && <path class="dt-curve is-run" d={line} />}
          {s.history.map(([n, f]) => (
            <circle key={n} class="dt-point is-run" cx={lx(n)} cy={ly(f)} r={2.5} />
          ))}
        </g>
      </Stage>
      {s.canRun && (
        <div class="dt-controls">
          {s.batches.map((b) => (
            <Button
              key={b}
              isWide
              label={`${say(locale, WORDS.run)} ${b} ${say(locale, WORDS.times)}`}
              part={RunPart.Run}
              onPress={() => call(RunAction.Run, { times: b })}
            >
              {`×${b}`}
            </Button>
          ))}
          {s.trials > 0 && (
            <Button
              isWide
              label={say(locale, WORDS.reset)}
              part={RunPart.Reset}
              onPress={() => call(RunAction.Reset, {})}
            >
              {say(locale, WORDS.reset)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
