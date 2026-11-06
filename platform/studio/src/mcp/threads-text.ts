import { contentAddress, propAddress, shownAddress } from "@chalk/content/address";
import { type Filed, Role, Status, pickedOption, waitsOn } from "../comments";

/**
 * Threads in words, as `comments` answers: the open ones in full (what an agent has to act on or
 * check), the settled ones counted (what was decided: read when asked for, or one by its id).
 */

/** Words on one line, in full: never cut. */
const oneLine = (t: string) => t.replace(/\s+/g, " ");

/** Where a thread is, as an address: its board or prop, and what on it; a plan's thread by its home. */
export function threadAt(c: Filed): string {
  if (c.board !== undefined) return contentAddress(c.board, c.target);
  // A prop's thread is on the prop wherever it is used: its part comes after # (target is
  // "piece/part" as seen, the piece being whichever placed the prop).
  if (c.prop !== undefined)
    return shownAddress(propAddress(c.home.split("/").at(-1) ?? "", c.prop), c.target);
  // A thread on a planning file: the file (its words are under quote).
  return (c.source ?? c.home).replace(/:\d+(-\d+)?$/, "");
}

/** Whose turn it is, in words. */
function turnWords(c: Filed): string {
  const on = waitsOn(c);
  return on === undefined ? "" : ` waits on the ${on} ·`;
}

/** One thread in full: where, what it showed, every message (a plan is its planned message). */
export function threadLine(c: Filed): string {
  return [
    `• ${c.id} [${c.status}${c.weight ? `, ${c.weight}` : ""}]${turnWords(c)} ${c.by}${c.by === c.role ? "" : ` (${c.role})`}${c.from ? ` (from ${c.from})` : ""} ${threadAt(c)}`,
    `  source: ${c.source ?? "?"}`,
    ...(c.snapshot ? [`  showed: ${oneLine(c.snapshot)}`] : []),
    `  ${c.by}${c.options ? " asks" : ""}: “${oneLine(c.text)}”`,
    ...(c.options ?? []).map((o, i) => `  option ${i + 1}: ${o.label}: ${oneLine(o.why)}`),
    ...(c.quote ? [`  quote: ${oneLine(c.quote)}`] : []),
    ...c.messages.map(
      (m) => `  ${m.by}${m.status ? ` → ${m.status}` : ""}: ${oneLine(m.text) || "(no words)"}`,
    ),
    // An ask he has answered: the option he picked, or none (his own words are in his reply).
    ...(c.options !== undefined && c.messages.some((m) => m.role === Role.Person)
      ? [`  picked: ${pickedOption(c)?.label ?? "none of the options: his own answer"}`]
      : []),
    ...(c.changed?.length ? [`  changed: ${changedWords(c.changed)}`] : []),
  ].join("\n");
}

/**
 * The files a thread's change touched, as a reviewer checks it: the source files by name, and the
 * voice clips (made from the words, one file per line said) only counted.
 */
export function changedWords(files: readonly string[]): string {
  const isClip = (f: string) => /\/sound\/[^/]+\.(m4a|wav)$/.test(f);
  const clips = files.filter(isClip).length;
  const named = files.filter((f) => !isClip(f));
  return [
    ...named,
    ...(clips > 0 ? [`and ${clips} voice clip${clips === 1 ? "" : "s"}`] : []),
  ].join(", ");
}

const isSettled = (c: Filed) => c.status === Status.Closed || c.status === Status.Withdrawn;

/**
 * The answer: one thread by `id`; else the open threads found, in full, and how many settled ones
 * there are too (all of them in full with `closed`). `head` comes first.
 */
export function threadsAnswer(
  all: readonly Filed[],
  found: readonly Filed[],
  args: { id?: string; closed?: boolean },
  head = "",
): string {
  if (args.id !== undefined) {
    const one = all.find((c) => c.id === args.id);
    return one === undefined ? `No thread ${args.id}.` : threadLine(one);
  }
  const shown = args.closed === true ? found : found.filter((c) => !isSettled(c));
  const settled = found.filter(isSettled);
  const closed = settled.filter((c) => c.status === Status.Closed).length;
  const withdrawn = settled.length - closed;
  const counted =
    args.closed === true || settled.length === 0
      ? ""
      : `\n\n${[closed > 0 ? `${closed} closed` : "", withdrawn > 0 ? `${withdrawn} withdrawn` : ""].filter(Boolean).join(" and ")} here, settled: \`closed: true\` to read them, or one by \`id\`.`;
  const body =
    shown.length === 0
      ? `No ${args.closed === true ? "" : "open "}threads match.`
      : shown.map(threadLine).join("\n\n");
  return `${head}${body}${counted}`;
}

/** How many settled threads a new one is told of, at most: the latest. */
const SETTLED_TOLD = 3;

/**
 * What was settled where a new thread starts: the closed threads on the same thing (the same
 * board and target, or the same prop and target), latest first, each with its last words. Told
 * when a point is about to be raised again, not read by everyone up front.
 */
export function settledHere(all: readonly Filed[], t: Filed): string[] {
  const same = (c: Filed) =>
    c.id !== t.id &&
    c.status === Status.Closed &&
    c.board === t.board &&
    c.prop === t.prop &&
    (c.target ?? "") === (t.target ?? "") &&
    (c.board !== undefined || c.prop !== undefined || c.source === t.source);
  return all
    .filter(same)
    .sort((a, b) => lastAt(b).localeCompare(lastAt(a)))
    .slice(0, SETTLED_TOLD)
    .map((c) => {
      const last = c.messages.at(-1);
      const words = oneLine(last?.text ?? c.text);
      return `  settled here before: ${c.id}, closed${last ? ` (last, ${last.by})` : ""}: "${words.length > 160 ? `${words.slice(0, 157)}…` : words}"`;
    });
}

const lastAt = (c: Filed) => c.messages.at(-1)?.at ?? c.createdAt;
