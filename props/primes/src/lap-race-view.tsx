import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { lcm } from "./arithmetic";
import { LapRaceAction, type LapRaceState, crossings, nextMeeting } from "./lap-race";
import { SymbolButton } from "./ui";

/** Px: the track's size cap, the two lanes' gap, a runner's radius. */
const MAX_TRACK = 240;
const LANE_GAP = 26;
const RUNNER = 11;
/** Race minutes per second of watching. */
const MINUTES_PER_SECOND = 8;

/**
 * The clock while the race runs: it counts up from where it stopped, and when it reaches the next
 * minute both runners are at the start together it tells the prop, which stops it there.
 */
function useRaceClock(s: LapRaceState, onArrive: () => void): number {
  const [now, setNow] = useState(s.time);
  const arrive = useRef(onArrive);
  arrive.current = onArrive;
  const { time, isRunning, lapA, lapB } = s;
  useEffect(() => {
    setNow(time);
    if (!isRunning || typeof requestAnimationFrame === "undefined") return;
    const stop = nextMeeting({ time, lapA, lapB });
    const t0 = performance.now();
    let frame = 0;
    const step = (t: number) => {
      const value = time + ((t - t0) / 1000) * MINUTES_PER_SECOND;
      if (value >= stop) {
        setNow(stop);
        arrive.current();
        return;
      }
      setNow(value);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [time, isRunning, lapA, lapB]);
  return now;
}

/** Where on its lane a runner is at minute t: clockwise from the start line at the top. */
function spot(cx: number, cy: number, radius: number, lap: number, t: number) {
  const angle = -Math.PI / 2 + (2 * Math.PI * (t % lap)) / lap;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

/**
 * Both runners' logs on one time line: a column for every minute either is back at the start, so a
 * minute they share sits in the same column in both rows. Each chip is lap × k.
 */
function Logs({
  rows,
  shownTime,
  common,
}: {
  rows: readonly { name: string; lap: number; letter: string; tone: "a" | "b"; part: string }[];
  shownTime: number;
  /** Minutes both runners are at the start are ringed. */
  common: number;
}) {
  const now = Math.floor(shownTime + 1e-6);
  const minutes = [...new Set(rows.flatMap((r) => crossings(r.lap, now)))].sort((x, y) => x - y);
  const box = useRef<HTMLDivElement>(null);
  const columns = minutes.length;
  // Keep the newest minutes in view as the race runs on.
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll again each time a column is added
  useEffect(() => {
    const el = box.current;
    if (el !== null) el.scrollLeft = el.scrollWidth;
  }, [columns]);
  return (
    <div class="pr-race-logs" ref={box}>
      <div
        class="pr-race-grid"
        style={{ gridTemplateColumns: `48px repeat(${Math.max(1, columns)}, 32px)` }}
      >
        {rows.map((r) => (
          <div class={`pr-race-row is-${r.tone}`} data-part={r.part} key={r.part}>
            <span class="pr-race-name">
              {r.name}
              <small>
                {r.lap}
                {r.letter}
              </small>
            </span>
            {columns === 0 && <span class="pr-race-empty">–</span>}
            {minutes.map((m) =>
              m % r.lap === 0 ? (
                <span key={m} class={m % common === 0 ? "pr-race-chip is-met" : "pr-race-chip"}>
                  {m}
                  <small>
                    {r.letter} = {m / r.lap}
                  </small>
                </span>
              ) : (
                <span key={m} />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Two runners on a round track, Sonia on the outer lane and Ravi on the inner, both starting at the
 * start line at the top. Play runs the clock for both at once; each time a runner crosses the start,
 * that minute joins their log. The clock stops by itself when both are at the start together: the
 * start line lights up. Every minute in both logs (a common multiple) is ringed.
 */
export function LapRaceView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as LapRaceState & { isMet: boolean };
  const word = (w: { en: string; hi?: string }) => w[locale as "en" | "hi"] ?? w.en;
  const t = useRaceClock(s, () => call(LapRaceAction.Arrive));
  const isRunning = s.isRunning;
  const size = Math.min(width, MAX_TRACK);
  const cx = size / 2;
  const cy = size / 2;
  const outer = size / 2 - RUNNER - 4;
  const inner = outer - LANE_GAP;
  const a = spot(cx, cy, outer, s.lapA, t);
  const b = spot(cx, cy, inner, s.lapB, t);
  const common = lcm(s.lapA, s.lapB);
  const isAtStartTogether = s.isMet && !isRunning;
  const nameA = word(s.nameA);
  const nameB = word(s.nameB);
  return (
    <div class="pr-race">
      <svg
        class="pr-race-art"
        data-part="track"
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        role="img"
        aria-label={`${nameA} and ${nameB} on the track at minute ${s.time}`}
      >
        <circle class="pr-lane-ring" cx={cx} cy={cy} r={outer} />
        <circle class="pr-lane-ring" cx={cx} cy={cy} r={inner} />
        <line
          class={isAtStartTogether ? "pr-start is-met" : "pr-start"}
          x1={cx}
          y1={cy - outer - RUNNER - 2}
          x2={cx}
          y2={cy - inner + RUNNER + 2}
        />
        <text
          class="pr-clock"
          data-part="clock"
          x={cx}
          y={cy}
          text-anchor="middle"
          dominant-baseline="central"
        >
          {Math.floor(t + 1e-6)} min
        </text>
        <g class="pr-runner is-a">
          <circle cx={a.x} cy={a.y} r={RUNNER} />
          <text x={a.x} y={a.y} text-anchor="middle" dominant-baseline="central">
            {nameA.slice(0, 1)}
          </text>
        </g>
        <g class="pr-runner is-b">
          <circle cx={b.x} cy={b.y} r={RUNNER} />
          <text x={b.x} y={b.y} text-anchor="middle" dominant-baseline="central">
            {nameB.slice(0, 1)}
          </text>
        </g>
      </svg>
      <Logs
        rows={[
          { name: nameA, lap: s.lapA, letter: s.letterA, tone: "a", part: "logA" },
          { name: nameB, lap: s.lapB, letter: s.letterB, tone: "b", part: "logB" },
        ]}
        shownTime={t}
        common={common}
      />
      <div class="pr-controls">
        {isRunning ? (
          <SymbolButton
            symbol={word(s.pauseLabel)}
            label={word(s.pauseLabel)}
            isWide
            part="pause"
            onPress={() => call(LapRaceAction.Pause, { time: Math.floor(t) })}
          />
        ) : (
          <SymbolButton
            symbol={word(s.playLabel)}
            label={word(s.playLabel)}
            isWide
            part="play"
            onPress={() => call(LapRaceAction.Play)}
          />
        )}
        <SymbolButton
          symbol="↺"
          label="Start again"
          part="startAgain"
          isEnabled={s.time > 0 || isRunning}
          onPress={() => call(LapRaceAction.StartAgain)}
        />
      </div>
    </div>
  );
}
