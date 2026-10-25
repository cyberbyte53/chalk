/**
 * Studio's runner: starts one agent run at a time on a chapter, in this repo, with the coding
 * harness installed on the machine (Claude Code by default: `claude -p`), and streams what it says
 * back to the page. The agent does the work through the skills in `.agents/skills/`; Studio only
 * picks the step, writes the prompt, starts the process and shows its transcript. Nothing here
 * knows how a lesson is built.
 *
 * Settings (env): CHALK_AGENT_CMD (default `claude`), CHALK_AGENT_ARGS (extra args, split on
 * spaces). Logs go to tmp/studio-runs/<stamp>-<book>-<chapter>-<step>.jsonl (gitignored).
 */
import { type ChildProcess, spawn } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { type ChapterRow, PlanStatus } from "./dev-studio";

export const Step = {
  Plan: "plan-chapter",
  ApplyReview: "apply-review",
  Props: "build-props",
  Lesson: "build-lesson",
  SelfReview: "self-review",
} as const;
export type Step = (typeof Step)[keyof typeof Step];
export const steps: readonly Step[] = Object.values(Step);

export type Next = { step: Step; reason: string; lesson?: string } | null;

/** What the pipeline says should happen next for a chapter, from its files. */
export function nextStep(row: ChapterRow): Next {
  if (row.status === PlanStatus.Queued || row.status === PlanStatus.None)
    return row.source === null
      ? null
      : { step: Step.Plan, reason: "a source is dropped and there is no plan" };
  if (row.openComments > 0)
    return {
      step: Step.ApplyReview,
      reason: `${row.openComments} open comment${row.openComments > 1 ? "s" : ""}`,
    };
  if (row.status === PlanStatus.Draft) return null; // the plan waits for the person
  const written = row.lessons.filter((l) => l.isWritten).map((l) => l.slug);
  const planned = row.plannedLessons;
  if (written.length === 0 && !row.runNames.some((n) => n.endsWith("-props.md")))
    return { step: Step.Props, reason: "the plan is approved and nothing is built" };
  const missing = planned.find((slug) => !written.includes(slug));
  if (missing !== undefined)
    return {
      step: Step.Lesson,
      reason:
        written.length === 0
          ? "props are built; the first lesson calibrates the rest"
          : `${written.length} of ${planned.length} lessons built`,
      lesson: missing,
    };
  if (row.status !== PlanStatus.Built)
    return { step: Step.SelfReview, reason: "every lesson exists; review before the screen" };
  return null;
}

/** The prompt handed to the harness: the skill, the place, the specifics. */
export function promptFor(book: string, chapter: string, step: Step, lesson?: string): string {
  const place = `content/${book}/${chapter}`;
  const lines = [
    `Use the \`${step}\` skill on \`${place}\`.`,
    lesson !== undefined ? `The lesson to build is \`${lesson}\`.` : "",
    step === Step.ApplyReview
      ? "Handle this chapter's open comments (the comments tool); see platform/docs/comments.md."
      : "",
    "Work only in this repo. Run the checks the skill names. Write the run note in the chapter's runs/.",
    "End with a short summary for the person: what changed, what passed, what needs their decision.",
  ];
  return lines.filter((l) => l !== "").join("\n");
}

export type RunState = {
  id: string;
  book: string;
  chapter: string;
  step: Step;
  lesson?: string;
  startedAt: string;
  endedAt: string | null;
  exitCode: number | null;
  /** The transcript as short lines: what the agent said, which tools it used, the result. */
  lines: string[];
  log: string;
};

let current: { state: RunState; child: ChildProcess } | null = null;
const recent: RunState[] = [];

const stamp = () => new Date().toISOString().replace(/[-:]/g, "").slice(0, 15).replace("T", "-");

/** One line of Claude Code's stream-json, as a sentence for the page. */
function lineOf(event: Record<string, unknown>): string[] {
  const out: string[] = [];
  const type = event.type;
  if (type === "assistant" || type === "user") {
    const message = event.message as { content?: unknown } | undefined;
    const content = Array.isArray(message?.content) ? message.content : [];
    for (const part of content as Record<string, unknown>[]) {
      if (part.type === "text" && typeof part.text === "string" && part.text.trim() !== "") {
        // Tool results and skill bodies come back as user turns; the page shows only the agent's own words.
        if (type === "assistant") out.push(part.text.trim());
      }
      if (part.type === "tool_use") {
        const input = (part.input ?? {}) as Record<string, unknown>;
        const what =
          typeof input.command === "string"
            ? input.command
            : typeof input.file_path === "string"
              ? input.file_path
              : typeof input.pattern === "string"
                ? input.pattern
                : "";
        out.push(`→ ${String(part.name)} ${what}`.trim());
      }
    }
  } else if (type === "result") {
    const text = typeof event.result === "string" ? event.result : "";
    out.push(
      `■ ${event.subtype === "success" ? "done" : String(event.subtype)}${text ? `: ${text}` : ""}`,
    );
  }
  return out;
}

export function startRun(
  root: string,
  run: { book: string; chapter: string; step: Step; lesson?: string },
): RunState {
  if (current !== null && current.state.endedAt === null)
    throw new Error(
      `a run is already going: ${current.state.book}/${current.state.chapter} ${current.state.step}`,
    );
  const dir = join(root, "tmp", "studio-runs");
  mkdirSync(dir, { recursive: true });
  const id = `${stamp()}-${run.book}-${run.chapter}-${run.step}`;
  const log = join(dir, `${id}.jsonl`);
  const cmd = process.env.CHALK_AGENT_CMD ?? "claude";
  const extra = (process.env.CHALK_AGENT_ARGS ?? "").split(" ").filter((a) => a !== "");
  const args = [
    "-p",
    promptFor(run.book, run.chapter, run.step, run.lesson),
    "--output-format",
    "stream-json",
    "--verbose",
    "--permission-mode",
    "acceptEdits",
    "--allowedTools",
    "Read,Edit,Write,MultiEdit,Glob,Grep,Skill,Bash(pnpm:*),Bash(npx:*),Bash(git:*),Bash(ls:*),Bash(cat:*),Bash(mkdir:*),Bash(pdftotext:*)",
    ...extra,
  ];
  const state: RunState = {
    id,
    ...run,
    startedAt: new Date().toISOString(),
    endedAt: null,
    exitCode: null,
    lines: [`$ ${cmd} -p "<${run.step} on ${run.book}/${run.chapter}>" …`],
    log: `tmp/studio-runs/${id}.jsonl`,
  };
  const child = spawn(cmd, args, {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let buffer = "";
  child.stdout?.on("data", (chunk: Buffer) => {
    buffer += chunk.toString();
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      if (part.trim() === "") continue;
      appendFileSync(log, `${part}\n`);
      try {
        state.lines.push(...lineOf(JSON.parse(part) as Record<string, unknown>));
      } catch {
        state.lines.push(part);
      }
    }
  });
  child.stderr?.on("data", (chunk: Buffer) => {
    const text = chunk.toString().trim();
    if (text !== "") state.lines.push(`! ${text}`);
  });
  child.on("error", (e) => {
    state.lines.push(`! could not start ${cmd}: ${e.message}`);
    state.endedAt = new Date().toISOString();
    state.exitCode = -1;
  });
  child.on("close", (code) => {
    state.endedAt = new Date().toISOString();
    state.exitCode = code;
    recent.unshift(state);
    recent.splice(10);
  });
  current = { state, child };
  return state;
}

export function stopRun(): RunState | null {
  if (current === null || current.state.endedAt !== null) return null;
  current.child.kill("SIGTERM");
  current.state.lines.push("! stopped by the person");
  return current.state;
}

/** The run going now (or the last one), plus the ones before it this session. */
export function runs(): { current: RunState | null; recent: RunState[] } {
  return { current: current?.state ?? null, recent };
}

export const runsDirExists = (root: string) => existsSync(join(root, "tmp", "studio-runs"));
