import { Actor, type Board, Locale } from "@chalk/content";
import type { RecordEvent } from "@chalk/events";
import { propLibrary } from "@chalk/library";
import {
  BoardPlayer,
  type BoardRuntime,
  BoardSpeedContext,
  JugnuFigure,
  JugnuMood,
  PlayMode,
} from "@chalk/player";
import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { shownAt } from "./preview-shell";

/**
 * `?dev&jugnu=<case>`: Jugnu on one of his stuck children (platform/docs/plans/jugnu.md), both
 * sides at once. Left, what she sees: her board at her state (her steps played again on the real
 * player: a board is deterministic), her question, his reply in his sheet, the part he points at
 * glowing. Right, what he did: what he was given, each thought, each try (the copy drawn after
 * it), his reply and what it cost. The run is the studio's (/dev-jugnu): the model's key stays there.
 */

type Step = { prop: string; action: string; args?: Record<string, unknown> };
type Case = { name: string; board: string; steps: Step[]; asks: string; about: string };
type Move =
  | { kind: "thought" | "words"; text: string }
  | { kind: "try"; steps: Step[]; from: "now" | "start"; saw: unknown };
type Run = {
  case: Case;
  model: string;
  given: { system: string; message: string };
  moves: Move[];
  reply: { words: string; glow: string | null };
  usage: { requests: number; ms: number; input: number; output: number };
};

const nothing: RecordEvent = () => 0;

/** A glow's name ("sheet/plane/namePart:OX") as the board's: its piece, and the part in it. */
function pointedOf(glow: string | null): { prop: string; part?: string } | undefined {
  if (glow === null || glow === "") return undefined;
  const [prop = "", ...rest] = decodeURIComponent(glow).split("/");
  return rest.length === 0 ? { prop } : { prop, part: rest.join("/") };
}

/** A board played to a moment: its steps done on the real player, the clock jumping. */
function BoardAt({
  path,
  steps,
  pointed,
  width,
}: {
  path: string;
  steps: readonly Step[];
  pointed?: { prop: string; part?: string } | undefined;
  width: number;
}): JSX.Element {
  const [board, setBoard] = useState<Board | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  useEffect(() => {
    void shownAt(path).then(
      (s) => setBoard(s.board),
      (e: unknown) => setProblem(String(e)),
    );
  }, [path]);
  const play = (runtime: BoardRuntime) => {
    void (async () => {
      runtime.settle();
      for (const step of steps) {
        await runtime.call(step.prop, step.action, step.args ?? {}, Actor.Learner);
        runtime.settle();
      }
    })();
  };
  if (problem !== null) return <div class="jg-empty">{problem}</div>;
  if (board === null) return <div class="jg-empty">Drawing…</div>;
  return (
    <div class="jg-phone" style={{ width: `${width}px` }}>
      <div class="lesson">
        <BoardSpeedContext.Provider value={Number.POSITIVE_INFINITY}>
          <BoardPlayer
            key={`${path}:${JSON.stringify(steps)}`}
            board={board}
            registry={propLibrary}
            locale={Locale.En}
            record={nothing}
            onPass={() => {}}
            mode={PlayMode.Guided}
            isSilent
            onRuntime={play}
            pointed={pointed}
          />
        </BoardSpeedContext.Provider>
      </div>
    </div>
  );
}

/** What she sees: her board, her question, his sheet, his glow. */
function HerSide({ one, run }: { one: Case; run: Run | null }): JSX.Element {
  return (
    <section class="jg-her">
      <h2>What she sees</h2>
      <div class="jg-phone-stack">
        <BoardAt
          path={one.board}
          steps={one.steps}
          pointed={run === null ? undefined : pointedOf(run.reply.glow)}
          width={360}
        />
        <div class="jg-ask">She asks: “{one.asks}”</div>
        {run !== null && (
          <div class="jg-sheet">
            <JugnuFigure mood={JugnuMood.Hint} size={54} />
            <p>{run.reply.words}</p>
          </div>
        )}
      </div>
    </section>
  );
}

/** What he did: given, thought, tried (each copy drawn), said. */
function HisSide({ one, run }: { one: Case; run: Run }): JSX.Element {
  return (
    <section class="jg-his">
      <h2>What Jugnu does</h2>
      <details>
        <summary>His instructions</summary>
        <pre>{run.given.system}</pre>
      </details>
      <details>
        <summary>What he was given ({run.given.message.length} characters)</summary>
        <pre>{run.given.message}</pre>
      </details>
      <ol class="jg-moves">
        {run.moves.map((move, i) =>
          move.kind === "try" ? (
            <li key={i} class="jg-try">
              <b>Tries on a copy</b> (from {move.from === "now" ? "where she is" : "the start"})
              <pre>{JSON.stringify(move.steps, null, 1)}</pre>
              <BoardAt
                path={one.board}
                steps={move.from === "now" ? [...one.steps, ...move.steps] : move.steps}
                width={280}
              />
              <b>What came back to him</b>
              <pre>{JSON.stringify(move.saw, null, 1)}</pre>
            </li>
          ) : (
            <li key={i} class={move.kind === "thought" ? "jg-thought" : "jg-words"}>
              <b>{move.kind === "thought" ? "Thinks" : "Writes"}</b>
              <p>{move.text}</p>
            </li>
          ),
        )}
      </ol>
      <div class="jg-reply">
        <b>His reply</b>
        <p>{run.reply.words}</p>
        <p class="jg-small">glows: {run.reply.glow ?? "nothing"}</p>
      </div>
      <p class="jg-small">
        {run.model}: {run.usage.requests} requests, {(run.usage.ms / 1000).toFixed(1)} s,{" "}
        {run.usage.input} tokens in, {run.usage.output} out
      </p>
    </section>
  );
}

export function JugnuPreview(): JSX.Element {
  const params = new URLSearchParams(window.location.search);
  const [cases, setCases] = useState<Case[]>([]);
  const [name, setName] = useState(params.get("jugnu") || "plot-swapped");
  const [run, setRun] = useState<Run | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  useEffect(() => {
    void fetch("/dev-jugnu")
      .then((r) => r.json() as Promise<{ cases?: Case[]; error?: string }>)
      .then((d) => (d.cases === undefined ? setProblem(d.error ?? "no cases") : setCases(d.cases)));
  }, []);
  const one = cases.find((c) => c.name === name);
  const choose = (next: string) => {
    setName(next);
    setRun(null);
    const url = new URL(window.location.href);
    url.searchParams.set("jugnu", next);
    window.history.replaceState(null, "", url);
  };
  const runIt = async () => {
    setIsRunning(true);
    setProblem(null);
    try {
      const answer = (await (await fetch(`/dev-jugnu?run=${encodeURIComponent(name)}`)).json()) as
        | Run
        | { error: string };
      if ("error" in answer) setProblem(answer.error);
      else setRun(answer);
    } finally {
      setIsRunning(false);
    }
  };
  return (
    <main class="jg">
      <header class="jg-head">
        <b>Jugnu</b>
        <select value={name} onChange={(e) => choose((e.target as HTMLSelectElement).value)}>
          {cases.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void runIt()}
          disabled={isRunning || one === undefined}
        >
          {isRunning ? "Jugnu is thinking…" : run === null ? "Run Jugnu" : "Run again"}
        </button>
        {one !== undefined && <span class="jg-small">A good nudge is about: {one.about}</span>}
      </header>
      {problem !== null && <div class="jg-problem">{problem}</div>}
      {one === undefined ? (
        <div class="jg-empty">Loading the cases…</div>
      ) : (
        <div class="jg-sides">
          <HerSide one={one} run={run} />
          {run === null ? (
            <section class="jg-his jg-empty">
              {isRunning
                ? "Jugnu is looking at her board…"
                : "Press Run Jugnu to see what he does."}
            </section>
          ) : (
            <HisSide one={one} run={run} />
          )}
        </div>
      )}
    </main>
  );
}
