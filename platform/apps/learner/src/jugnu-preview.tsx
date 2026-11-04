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
 * `?dev&jugnu=<experiment>`: Jugnu's experiments (platform/docs/plans/jugnu.md), each a back and
 * forth between Jugnu and a simulated child on one real board, kept by the studio (/dev-jugnu) and
 * opened here turn by turn. Left, what she sees: each line said, his choices, her board at that
 * moment (her steps played again on the real player: a board is deterministic) with his glow.
 * Right, what is behind it: each side's thinking, his diagnosis and tries on copies, what she did,
 * and exactly what each was given. New experiments run from here too; the model's key stays there.
 */

type Step = { prop: string; action: string; args?: Record<string, unknown> };
type Case = {
  name: string;
  board: string;
  steps: Step[];
  asks: string;
  about: string;
  students?: { name: string; believes: string }[];
};
type JugnuTurn = {
  who: "jugnu";
  given: string;
  thinking: string[];
  tries: { steps: Step[]; from: "now" | "start"; saw: unknown }[];
  diagnosis: string;
  says: string;
  choices: string[];
  glow: string | null;
  isGlowOnList?: boolean;
};
type HerTurn = {
  who: "her";
  given: string;
  thinking: string[];
  did: Step[];
  says: string;
  stepsSoFar: Step[];
  isRight: boolean;
  isLeaving?: boolean;
  transfer?: { board: string };
};
type Dialogue = {
  id: string;
  note: string;
  case: Case;
  student: { name: string; believes: string };
  models: { jugnu: string; student: string };
  instructions: { jugnu: string; student: string };
  /** Which prompt each seat ran: its file's name and the hash of its words. */
  prompts?: { tutor: { name: string; hash: string }; student: { name: string; hash: string } };
  error?: string;
  boardVersion?: string;
  isBoardChanged?: boolean;
  lesson?: string;
  turns: (JugnuTurn | HerTurn)[];
  isRight: boolean;
  transfer?: { board: string; isRight: boolean } | null;
  isLeft?: boolean;
  /** False while it is still going (it is kept after every turn). */
  isFinished?: boolean;
  usage: { ms: number; input: number; output: number };
};
/** A seat as the page chooses it: which model, which prompt (keys stay on the server). */
type SeatChoice = { provider: string; id: string; prompt: string };
type SeatOptions = {
  models: { provider: string; id: string }[];
  prompts: { tutor: string[]; student: string[] };
  defaults: { tutor: SeatChoice; student: SeatChoice };
};

/** One seat's picker: its model among those the server can run, and its prompt's version. */
function SeatPicker({
  label,
  options,
  prompts,
  value,
  onChange,
}: {
  label: string;
  options: SeatOptions["models"];
  prompts: string[];
  value: SeatChoice;
  onChange: (next: SeatChoice) => void;
}): JSX.Element {
  return (
    <span class="jg-seat">
      <b>{label}</b>
      <select
        value={`${value.provider}/${value.id}`}
        onChange={(e) => {
          const [provider = "", ...id] = (e.target as HTMLSelectElement).value.split("/");
          onChange({ ...value, provider, id: id.join("/") });
        }}
      >
        {options.map((m) => (
          <option key={`${m.provider}/${m.id}`} value={`${m.provider}/${m.id}`}>
            {m.provider}/{m.id}
          </option>
        ))}
      </select>
      <select
        value={value.prompt}
        onChange={(e) => onChange({ ...value, prompt: (e.target as HTMLSelectElement).value })}
      >
        {prompts.map((p) => (
          <option key={p} value={p}>
            prompt: {p}
          </option>
        ))}
      </select>
    </span>
  );
}

type Listed = {
  id: string;
  board: string;
  note: string;
  isRight: boolean;
  isFinished: boolean;
  isBoardChanged: boolean;
  turns: number;
};

const nothing: RecordEvent = () => 0;

/** A glow's name ("sheet/plane/namePart:OX") as the board's: its piece, and the part in it. */
function pointedOf(glow: string | null): { prop: string; part?: string } | undefined {
  if (glow === null || glow === "") return undefined;
  const [prop = "", ...rest] = glow.split("/");
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

const stepText = (steps: readonly Step[]) =>
  steps
    .map((x) => `${x.prop}.${x.action}${x.args ? ` ${JSON.stringify(x.args)}` : ""}`)
    .join(" → ");

/** One turn: what she sees on the left, what is behind it on the right. */
function Turn({
  one,
  turn,
  stepsNow,
  n,
}: {
  one: Case;
  turn: JugnuTurn | HerTurn;
  stepsNow: readonly Step[];
  n: number;
}): JSX.Element {
  const isJugnu = turn.who === "jugnu";
  const showsBoard = isJugnu || turn.did.length > 0;
  return (
    <div class="jg-row">
      <div class="jg-seen">
        <div class={isJugnu ? "jg-sheet" : "jg-ask"}>
          {isJugnu && <JugnuFigure mood={JugnuMood.Hint} size={40} />}
          <p>
            <b>
              {n}. {isJugnu ? "Jugnu" : "She"}:
            </b>{" "}
            {turn.says}
          </p>
        </div>
        {isJugnu && turn.choices.length > 0 && (
          <div class="jg-choices">
            {turn.choices.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        )}
        {!isJugnu && turn.transfer !== undefined && (
          <p class="jg-diag">
            <b>Alone, the next question</b> (Jugnu gone): {turn.isRight ? "right ✓" : "wrong ✗"}
          </p>
        )}
        {!isJugnu && turn.isLeaving === true && <p class="jg-problem">She leaves.</p>}
        {!isJugnu && turn.did.length > 0 && (
          <p class="jg-small">
            <b>She does on her board:</b> {stepText(turn.did)}
            {turn.isRight ? " ✓ right" : ""}
          </p>
        )}
        {showsBoard && (
          <BoardAt
            path={!isJugnu && turn.transfer !== undefined ? turn.transfer.board : one.board}
            steps={stepsNow}
            pointed={isJugnu ? pointedOf(turn.glow) : undefined}
            width={300}
          />
        )}
        {isJugnu && (
          <p class={turn.isGlowOnList === false ? "jg-problem" : "jg-small"}>
            glows: {turn.glow ?? "nothing"}
            {turn.isGlowOnList === false ? " (not a part on her board: nothing glows)" : ""}
          </p>
        )}
      </div>
      <div class="jg-why">
        {isJugnu && (
          <p class="jg-diag">
            <b>His diagnosis:</b> {turn.diagnosis}
          </p>
        )}
        {turn.thinking.map((t, i) => (
          <p key={i} class="jg-thought">
            <b>{isJugnu ? "He thinks" : "She thinks"}</b> {t}
          </p>
        ))}
        {isJugnu && turn.tries.length === 0 && <p class="jg-small">He tried nothing on a copy.</p>}
        {isJugnu &&
          turn.tries.map((t, i) => (
            <details key={i} class="jg-try">
              <summary>
                Tries on a copy (from {t.from === "now" ? "where she is" : "the start"}):{" "}
                {stepText(t.steps)}
              </summary>
              <BoardAt
                path={one.board}
                steps={t.from === "now" ? [...stepsNow, ...t.steps] : t.steps}
                width={260}
              />
              <pre>{JSON.stringify(t.saw, null, 1)}</pre>
            </details>
          ))}
        {turn.given !== "" && (
          <details>
            <summary>
              What {isJugnu ? "he" : "she"} was given ({turn.given.length} characters)
            </summary>
            <pre>{turn.given}</pre>
          </details>
        )}
      </div>
    </div>
  );
}

/** One experiment, turn by turn. */
function Experiment({ run }: { run: Dialogue }): JSX.Element {
  let steps: readonly Step[] = run.case.steps;
  return (
    <section class="jg-run">
      <div class="jg-about">
        <p>
          <b>{run.case.name}</b> · child <b>{run.student.name}</b> · {run.models.jugnu} /{" "}
          {run.models.student} · {(run.usage.ms / 1000).toFixed(1)} s, {run.usage.input} in,{" "}
          {run.usage.output} out ·{" "}
          <b>
            {run.isFinished === false
              ? "still going…"
              : run.isRight
                ? "her question right"
                : run.isLeft === true
                  ? "she left"
                  : "not solved"}
            {run.transfer == null
              ? ""
              : run.transfer.isRight
                ? " · the next one alone: right"
                : " · the next one alone: wrong"}
          </b>
        </p>
        <p>
          <b>She believes</b> (hidden from Jugnu): {run.student.believes}
        </p>
        {run.error !== undefined && <p class="jg-problem">It broke: {run.error}</p>}
        {run.isBoardChanged === true && (
          <p class="jg-problem">
            Its board has been rebuilt since this run: the boards below are drawn as the board is
            now, so they may not be what the student saw.
          </p>
        )}
        {run.note !== "" && (
          <p>
            <b>This experiment:</b> {run.note}
          </p>
        )}
        <details>
          <summary>
            Jugnu's instructions
            {run.prompts === undefined
              ? ""
              : ` · tutor/${run.prompts.tutor.name} (${run.prompts.tutor.hash})`}
          </summary>
          <pre>{run.instructions.jugnu}</pre>
        </details>
        {run.lesson !== undefined && (
          <details>
            <summary>The lesson, as Jugnu was given it ({run.lesson.length} characters)</summary>
            <pre>{run.lesson}</pre>
          </details>
        )}
        <details>
          <summary>
            The child's instructions
            {run.prompts === undefined
              ? ""
              : ` · student/${run.prompts.student.name} (${run.prompts.student.hash})`}
          </summary>
          <pre>{run.instructions.student}</pre>
        </details>
      </div>
      {run.turns.map((turn, i) => {
        if (turn.who === "her") steps = turn.stepsSoFar;
        return <Turn key={i} one={run.case} turn={turn} stepsNow={steps} n={i + 1} />;
      })}
    </section>
  );
}

export function JugnuPreview(): JSX.Element {
  const params = new URLSearchParams(window.location.search);
  const [cases, setCases] = useState<Case[]>([]);
  const [runs, setRuns] = useState<Listed[]>([]);
  const [id, setId] = useState(params.get("jugnu") ?? "");
  const [run, setRun] = useState<Dialogue | null>(null);
  const [caseName, setCaseName] = useState("plot-swapped");
  const [studentName, setStudentName] = useState("up-first");
  const [note, setNote] = useState("");
  const [seatOptions, setSeatOptions] = useState<SeatOptions | null>(null);
  const [seats, setSeats] = useState<{ tutor: SeatChoice; student: SeatChoice } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const load = async (): Promise<Listed[]> => {
    const d = (await (await fetch("/dev-jugnu")).json()) as {
      cases?: Case[];
      runs?: Listed[];
      seats?: SeatOptions;
      error?: string;
    };
    if (d.seats !== undefined) {
      const options = d.seats;
      setSeatOptions(options);
      setSeats((now) => now ?? options.defaults);
    }
    if (d.cases === undefined) {
      setProblem(d.error ?? "no cases");
      return [];
    }
    setCases(d.cases);
    setRuns(d.runs ?? []);
    return d.runs ?? [];
  };
  // The list once; the newest experiment opens when the page names none it knows.
  // biome-ignore lint/correctness/useExhaustiveDependencies: once, on opening the page
  useEffect(() => {
    void load().then((listed) =>
      setId((now) => (listed.some((r) => r.id === now) ? now : (listed[0]?.id ?? now))),
    );
  }, []);
  useEffect(() => {
    if (id === "") return;
    const url = new URL(window.location.href);
    url.searchParams.set("jugnu", id);
    window.history.replaceState(null, "", url);
    setRun(null);
    void fetch(`/dev-jugnu?show=${encodeURIComponent(id)}`)
      .then((r) => r.json() as Promise<Dialogue | { error: string }>)
      .then((d) => ("turns" in d ? setRun(d) : setProblem(d.error)));
  }, [id]);
  // A run still going is read again every few seconds, so it is watched as it goes.
  useEffect(() => {
    if (run === null || run.isFinished !== false) return;
    const timer = setTimeout(() => {
      void fetch(`/dev-jugnu?show=${encodeURIComponent(run.id)}`)
        .then((r) => r.json() as Promise<Dialogue | { error: string }>)
        .then((d) => ("turns" in d ? setRun(d) : setProblem(d.error)));
    }, 3000);
    return () => clearTimeout(timer);
  }, [run]);
  const students = cases.find((c) => c.name === caseName)?.students ?? [];
  const runIt = async () => {
    setIsRunning(true);
    setProblem(null);
    try {
      // The run starts and is kept at once; it then goes on by itself, followed here by its id.
      const answer = (await (
        await fetch("/dev-jugnu", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ case: caseName, student: studentName, note, seats }),
        })
      ).json()) as { id: string } | { error: string };
      if ("error" in answer) setProblem(answer.error);
      else {
        await load();
        setId(answer.id);
      }
    } finally {
      setIsRunning(false);
    }
  };
  return (
    <main class="jg">
      <header class="jg-head">
        <b>Jugnu</b>
        <select value={id} onChange={(e) => setId((e.target as HTMLSelectElement).value)}>
          {runs.map((r) => (
            <option key={r.id} value={r.id}>
              {r.isFinished ? (r.isRight ? "✓" : "✗") : "…"} {r.id}
              {r.isBoardChanged ? " (board changed since)" : ""}
            </option>
          ))}
        </select>
        <span class="jg-small">New:</span>
        <select
          value={caseName}
          onChange={(e) => setCaseName((e.target as HTMLSelectElement).value)}
        >
          {cases
            .filter((c) => (c.students ?? []).length > 0)
            .map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
        </select>
        <select
          value={studentName}
          onChange={(e) => setStudentName((e.target as HTMLSelectElement).value)}
        >
          {students.map((x) => (
            <option key={x.name} value={x.name}>
              {x.name}
            </option>
          ))}
        </select>
        {seatOptions !== null && seats !== null && (
          <>
            <SeatPicker
              label="Jugnu"
              options={seatOptions.models}
              prompts={seatOptions.prompts.tutor}
              value={seats.tutor}
              onChange={(tutor) => setSeats({ ...seats, tutor })}
            />
            <SeatPicker
              label="Student"
              options={seatOptions.models}
              prompts={seatOptions.prompts.student}
              value={seats.student}
              onChange={(student) => setSeats({ ...seats, student })}
            />
          </>
        )}
        <input
          placeholder="What this experiment changes"
          value={note}
          onInput={(e) => setNote((e.target as HTMLInputElement).value)}
        />
        <button type="button" onClick={() => void runIt()} disabled={isRunning}>
          {isRunning ? "Starting…" : "Run"}
        </button>
      </header>
      {problem !== null && <div class="jg-problem">{problem}</div>}
      {run === null ? (
        <div class="jg-empty">{runs.length === 0 ? "No experiments yet." : "Opening…"}</div>
      ) : (
        <Experiment run={run} />
      )}
    </main>
  );
}
