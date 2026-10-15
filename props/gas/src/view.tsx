import { CROWD_THRESHOLD, Dot, Dots, OnTop, Stage, useSpace } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import { GasAction, type GasState, positions } from "./model";

const ASPECT = 0.7;
const COUNTS = [100, 1000, 3000, 5000] as const;

/** Frames a second, from the time between the view's last few draws (a meter, not state). */
function useFrameMeter(): number {
  const times = useRef<number[]>([]);
  const now = performance.now();
  times.current.push(now);
  while (times.current.length > 0 && (times.current[0] ?? now) < now - 1000) times.current.shift();
  return times.current.length;
}

function Walls(): JSX.Element {
  const { width, height } = useSpace();
  return <rect class="gas-walls" x={0} y={0} width={width} height={height} rx={16} />;
}

/** The box of gas, a frame meter, and the controls. Dots picks SVG or a WebGL crowd by itself. */
export function GasView({ view, width, call }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as GasState;
  const fps = useFrameMeter();
  const p = positions(s, ASPECT);
  // The first particle is the one to follow: drawn on its own, so it stays SVG and stands out.
  const crowd = p.subarray(2);
  return (
    <div class="gas">
      <Stage
        label={`A box of ${s.count} gas particles`}
        x={[0, 1]}
        y={[0, 1]}
        width={width}
        height={width * ASPECT}
      >
        <Walls />
        <Dots points={crowd} r={2.6} />
        <OnTop>
          <Dot at={p[0] ?? 0} y={p[1] ?? 0} r={6} color="secondary" />
        </OnTop>
      </Stage>
      <div class="gas-meter">
        <span>{s.isRunning ? `${fps} frames/s` : "stopped"}</span>
        <span>
          {s.count} particles · {s.count - 1 > CROWD_THRESHOLD ? "crowd" : "SVG"} · T×
          {s.temperature}
        </span>
      </div>
      <div class="gas-controls">
        <button
          type="button"
          class="gas-button is-main"
          onClick={() => call(s.isRunning ? GasAction.Stop : GasAction.Start)}
        >
          {s.isRunning ? "Stop" : "Start"}
        </button>
        <button type="button" class="gas-button" onClick={() => call(GasAction.Cool)}>
          Colder
        </button>
        <button type="button" class="gas-button" onClick={() => call(GasAction.Heat)}>
          Hotter
        </button>
      </div>
      <div class="gas-controls">
        {COUNTS.map((count) => (
          <button
            key={count}
            type="button"
            class={count === s.count ? "gas-chip is-on" : "gas-chip"}
            onClick={() => call(GasAction.SetCount, { count })}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  );
}
