import type { Board } from "@chalk/content";
import { JugnuFigure, chatOf } from "@chalk/player";
import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { BoardAt, type EventEntryLike, type Step } from "./board-at";
import { shownAt } from "./preview-shell";

/**
 * `?dev&jugnu=<experiment>`: Jugnu's experiments (platform/docs/plans/jugnu.md), each a back and
 * forth between Jugnu and a simulated child on one real board, kept by the studio (/dev-jugnu) and
 * opened here turn by turn. Left, what she sees: each line said, his choices, her board at that
 * moment (her steps played again on the real player: a board is deterministic) with his glow.
 * Right, what is behind it: each side's thinking, his diagnosis and tries on copies, what she did,
 * and exactly what each was given. New experiments run from here too; the model's key stays there.
 */

/** The preview's board for a path: from the tree as it is now. */
const boardOf = async (path: string): Promise<Board> => (await shownAt(path)).board;

type Case = {
  name: string;
  board: string;
  steps: Step[];
  asks: string;
  about: string;
  next?: string;
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
  /** The run as the phone's event channel would record it (docs/events.md). */
  events?: EventEntryLike[];
  extras?: Record<number, RunExtra>;
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

/** A glow's name ("sheet/plane/namePart:OX") as the board's: its piece, and the part in it. */
function pointedOf(glow: string | null): { prop: string; part?: string } | undefined {
  if (glow === null || glow === "") return undefined;
  const [prop = "", ...rest] = glow.split("/");
  return rest.length === 0 ? { prop } : { prop, part: rest.join("/") };
}

const stepText = (steps: readonly Step[]) =>
  steps
    .map((x) => `${x.prop}.${x.action}${x.args ? ` ${JSON.stringify(x.args)}` : ""}`)
    .join(" → ");

/** Long text shortened for a glance; the whole is a tap away. */
const short = (text: string, most = 160) =>
  text.length <= most ? text : `${text.slice(0, most).trimEnd()}…`;

/** What a run knows beyond its events, by an event's seq (studio jugnu/dialogue.ts RunExtra). */
type RunExtra = {
  jugnu?: {
    note: string;
    thinking: string[];
    given: string;
    tries: { steps: Step[]; from: "now" | "start"; saw: unknown }[];
    isHandBack: boolean;
    isGlowOnList: boolean;
  };
  student?: {
    says: string;
    thinking: string[];
    given: string;
    isLeaving?: boolean;
    isAlone?: boolean;
  };
};

/** A moment on the timeline: an event worth a mark, or the student's words after one. */
type Moment = {
  seq: number;
  opening: string;
  kind: "act" | "checked" | "jugnu" | "said";
  /** Who it is from: the colour of its mark. */
  who: "student" | "jugnu" | "board";
  label: string;
  /** For a check: right or not. */
  isRight?: boolean;
};

/** The moments of a run, in order: acts, checks, Jugnu's turns, the student's words. */
function momentsOf(events: readonly EventEntryLike[], extras: Record<number, RunExtra>): Moment[] {
  const out: Moment[] = [];
  for (const [seq, e] of events.entries()) {
    const opening = e.opening ?? "";
    const p = e.payload as Record<string, unknown>;
    if (e.kind === "cause" && (e.actor === "learner" || e.actor === "jugnu") && "action" in p)
      out.push({
        seq,
        opening,
        kind: "act",
        who: e.actor === "jugnu" ? "jugnu" : "student",
        label: `${String(p.action)}${Object.keys((p.args as object) ?? {}).length > 0 ? ` ${JSON.stringify(p.args)}` : ""}`,
      });
    else if (e.kind === "signal" && p.signal === "checked") {
      const status = (p.payload as { status?: string } | undefined)?.status;
      out.push({
        seq,
        opening,
        kind: "checked",
        who: "board",
        label: `checked: ${status}`,
        isRight: status === "correct",
      });
    } else if (e.kind === "jugnu")
      out.push({ seq, opening, kind: "jugnu", who: "jugnu", label: String(p.reply ?? "") });
    const said = extras[seq]?.student;
    if (said !== undefined)
      out.push({ seq, opening, kind: "said", who: "student", label: said.says });
  }
  return out;
}

/** One run, read in time (platform/docs/plans/jugnu-timeline.md): little at a glance, the rest when asked. */
function Experiment({ run }: { run: Dialogue }): JSX.Element {
  const events = run.events ?? [];
  const extras = run.extras ?? {};
  const moments = momentsOf(events, extras);
  const [at, setAt] = useState(Math.max(0, moments.length - 1));
  const [openTry, setOpenTry] = useState<number | null>(null);
  // A run still going grows: follow its end unless a moment was chosen.
  const [isFollowing, setIsFollowing] = useState(true);
  useEffect(() => {
    if (isFollowing) setAt(Math.max(0, moments.length - 1));
  }, [moments.length, isFollowing]);
  if (run.events === undefined)
    return (
      <section class="jg-run">
        <p class="jg-empty">
          This run was kept before runs were recorded as events, so it isn't shown here.
        </p>
      </section>
    );
  const m = moments[Math.min(at, moments.length - 1)];
  const choose = (i: number) => {
    setAt(i);
    setOpenTry(null);
    setIsFollowing(i === moments.length - 1);
  };
  const jugnuTurns = moments.filter((x) => x.kind === "jugnu");
  const handBackAt = jugnuTurns.findIndex((x) => extras[x.seq]?.jugnu?.isHandBack === true);
  const ending =
    run.isFinished === false
      ? "still going…"
      : run.error !== undefined
        ? `it broke: ${run.error}`
        : run.isRight
          ? "their question right"
          : run.isLeft === true
            ? "the student left"
            : "not solved";
  // The board at this moment: its opening's events up to the moment.
  const opening = m?.opening ?? "1";
  const path = opening === "2" && run.case.next !== undefined ? run.case.next : run.case.board;
  const upTo = events.filter((e, seq) => e.opening === opening && seq <= (m?.seq ?? -1));
  // The line said last (as the student sees it on the board), and Jugnu's glow while he says it.
  const lastLine = [...moments.slice(0, at + 1)]
    .reverse()
    .find((x) => x.kind === "jugnu" || x.kind === "said");
  const jugnuEvent = lastLine?.kind === "jugnu" ? events[lastLine.seq] : undefined;
  const glow = (
    jugnuEvent?.payload as { steps?: { kind: string; part?: string }[] } | undefined
  )?.steps?.find((st) => st.kind === "glow")?.part;
  const his = m === undefined ? undefined : extras[m.seq]?.jugnu;
  // The chat as the student saw it at this moment (worked out from the events alone), and one line
  // while they were acting on the board after his last message.
  const chat = chatOf(upTo as never);
  const isActing = m?.kind === "act" && chat.messages.at(-1)?.from === "jugnu";
  // His note over the whole run, turn by turn: how his understanding of the student moved.
  const notes = moments.flatMap((x) => {
    const note = x.kind === "jugnu" ? extras[x.seq]?.jugnu?.note : undefined;
    return note === undefined ? [] : [{ seq: x.seq, note }];
  });
  const theirs = m?.kind === "said" ? extras[m.seq]?.student : undefined;
  return (
    <section class="jg-run">
      <p class="jg-story">
        <b>{ending}</b>
        {" · "}
        {handBackAt === -1
          ? "no hand-back"
          : `handed back at Jugnu's turn ${handBackAt + 1} of ${jugnuTurns.length}`}
        {run.transfer == null
          ? ""
          : run.transfer.isRight
            ? " · next one alone: right"
            : " · next one alone: wrong"}
        {" · "}
        {jugnuTurns.length} turns of Jugnu · {(run.usage.ms / 1000).toFixed(0)} s
      </p>
      <p class="jg-small">
        {run.case.name} · student {run.student.name} · Jugnu {run.models.jugnu}
        {run.prompts ? ` (${run.prompts.tutor.name})` : ""} · student {run.models.student}
        {run.prompts ? ` (${run.prompts.student.name})` : ""}
        {run.note !== "" ? ` · ${run.note}` : ""}
      </p>
      <div class="jg-timeline">
        {moments.map((x, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${x.who}: ${short(x.label, 120)}`}
            class={`jg-mark is-${x.who}${x.kind === "checked" ? (x.isRight ? " is-right" : " is-wrong") : ""}${x.kind === "jugnu" || x.kind === "said" ? " is-words" : ""}${i === at ? " is-at" : ""}`}
            title={`${x.who}: ${short(x.label, 120)}`}
            onClick={() => choose(i)}
          />
        ))}
      </div>
      {run.isBoardChanged === true && (
        <p class="jg-problem">Its board has been rebuilt since: drawn as it is now.</p>
      )}
      <div class="jg-moment">
        <div class="jg-seen">
          {m !== undefined && (
            <BoardAt
              // Another board is another drawing: nothing of the last one carries over.
              key={path}
              path={path}
              load={boardOf}
              events={upTo}
              pointed={glow === undefined ? undefined : pointedOf(glow)}
              chat={opening === "1" ? { chat, isOneLine: isActing } : undefined}
              width={320}
            />
          )}
        </div>
        <div class="jg-why">
          <p class="jg-small">
            Moment {at + 1} of {moments.length}
            {m === undefined ? "" : ` · ${m.who}: ${short(m.label, 90)}`}
            {opening === "2" ? " · the next question, alone" : ""}
          </p>
          {his !== undefined && (
            <>
              <p class="jg-diag">
                <b>His note:</b> {short(his.note)}
              </p>
              {his.thinking.length > 0 && (
                <details>
                  <summary>His thinking</summary>
                  {his.thinking.map((t, i) => (
                    <p key={i} class="jg-thought">
                      {t}
                    </p>
                  ))}
                </details>
              )}
              {his.tries.map((t, i) => (
                <details
                  key={i}
                  open={openTry === i}
                  onToggle={(e) => setOpenTry((e.target as HTMLDetailsElement).open ? i : null)}
                >
                  <summary>Tried on a copy: {short(stepText(t.steps), 80)}</summary>
                  {openTry === i && (
                    <BoardAt
                      key={`${path}:try`}
                      path={path}
                      load={boardOf}
                      events={t.from === "now" ? upTo.filter((_, k) => k < upTo.length - 1) : []}
                      steps={t.steps}
                      width={260}
                    />
                  )}
                </details>
              ))}
              <details>
                <summary>What he was given</summary>
                <pre>{his.given}</pre>
              </details>
            </>
          )}
          <details class="jg-notes" open>
            <summary>Behind the scenes: his note, turn by turn</summary>
            <ol>
              {notes.map((n) => (
                <li key={n.seq} class={n.seq === lastLine?.seq ? "is-now" : ""}>
                  {short(n.note, 200)}
                </li>
              ))}
            </ol>
          </details>
          {theirs !== undefined && (
            <>
              {theirs.thinking.length > 0 && (
                <details>
                  <summary>Their thinking</summary>
                  {theirs.thinking.map((t, i) => (
                    <p key={i} class="jg-thought">
                      {t}
                    </p>
                  ))}
                </details>
              )}
              <details>
                <summary>What they were given</summary>
                <pre>{theirs.given}</pre>
              </details>
            </>
          )}
        </div>
      </div>
      <details>
        <summary>
          Instructions
          {run.prompts
            ? ` · tutor/${run.prompts.tutor.name} (${run.prompts.tutor.hash}) · student/${run.prompts.student.name} (${run.prompts.student.hash})`
            : ""}
        </summary>
        <p class="jg-small">Jugnu's</p>
        <pre>{run.instructions.jugnu}</pre>
        <p class="jg-small">The student's (believes, hidden from Jugnu: {run.student.believes})</p>
        <pre>{run.instructions.student}</pre>
        {run.lesson !== undefined && (
          <>
            <p class="jg-small">The lesson, as Jugnu was given it</p>
            <pre>{run.lesson}</pre>
          </>
        )}
      </details>
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
