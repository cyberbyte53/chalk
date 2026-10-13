import { Actor } from "@chalk/content";
import type { HeardAction, HeardSignal, JugnuBoard } from "./board";

/** Who did something, in the words Jugnu reads. */
const WHO: Record<string, string> = {
  [Actor.Learner]: "student",
  [Actor.Lesson]: "lesson",
  [Actor.Jugnu]: "you",
  [Actor.App]: "app",
};

type Entry = {
  who: string;
  /** "prop.action" or "prop.signal". */
  what: string;
  kind: "did" | "signal" | "refused";
  detail: unknown;
  /** How many times in a row (a drag is many moves). */
  count: number;
};

/** How many entries Jugnu keeps (newest kept). */
const LIMIT = 60;

/**
 * Everything that happens on the board, in order, as Jugnu reads it: every action asked of it (by
 * the student, the lesson or him) and every signal. A run of the same thing (a drag, a timer's
 * ticks) is kept as one entry with its last values and a count.
 */
export class BoardHistory {
  private readonly entries: Entry[] = [];
  private readonly stop: (() => void)[];

  constructor(board: JugnuBoard) {
    this.stop = [
      board.onAction((action) => this.onAction(action)),
      board.onSignal((signal) => this.onSignal(signal)),
    ];
  }

  private onAction(action: HeardAction): void {
    // A student's refused action is a drag past the end or a tap on something off: not news.
    if (action.refused !== undefined && action.actor !== Actor.Jugnu) return;
    const who = WHO[action.actor] ?? action.actor;
    const what = `${action.prop}.${action.action}`;
    if (action.refused !== undefined)
      this.add({ who, what, kind: "refused", detail: action.refused, count: 1 });
    else this.add({ who, what, kind: "did", detail: action.args, count: 1 });
  }

  private onSignal(signal: HeardSignal): void {
    this.add({
      who: WHO[signal.actor] ?? signal.actor,
      what: `${signal.prop}.${signal.signal}`,
      kind: "signal",
      detail: signal.payload,
      count: 1,
    });
  }

  private add(entry: Entry): void {
    const last = this.entries.at(-1);
    if (
      last !== undefined &&
      last.who === entry.who &&
      last.what === entry.what &&
      last.kind === entry.kind
    ) {
      last.count++;
      last.detail = entry.detail;
      return;
    }
    this.entries.push(entry);
    if (this.entries.length > LIMIT) this.entries.shift();
  }

  /** Lines like `student: line.moveMarker {"to":1.7} (×12)`, oldest first. */
  lines(): string[] {
    return this.entries.map((entry) => {
      const detail =
        entry.kind === "refused"
          ? ` refused: ${String(entry.detail)}`
          : isEmpty(entry.detail)
            ? ""
            : ` ${JSON.stringify(entry.detail)}`;
      const signal = entry.kind === "signal" ? " (signal)" : "";
      const times = entry.count > 1 ? ` (×${entry.count})` : "";
      return `${entry.who}: ${entry.what}${signal}${detail}${times}`;
    });
  }

  close(): void {
    for (const stop of this.stop) stop();
  }
}

function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value as object).length === 0)
  );
}
