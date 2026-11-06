import * as vscode from "vscode";

/**
 * The threads still open, in the Chalk tree (its Threads section): what waits on you (an agent's
 * question, a fix ready to check), then what waits on an agent. Every thread is read from and
 * written through the dev server (/dev-review), the one writer, as the person
 * (platform/docs/comments.md); `allThreads` is what the rest of the editor reads them from.
 */

type Status = "open" | "planned" | "ready" | "closed" | "withdrawn";
type Message = { by: string; role: string; at: string; text: string; status?: Status };
/** Whose turn a thread is: a role's (the person, the fixer, the reviewer), or no one's. */
type Turn = "person" | "fixer" | "reviewer";
export type Thread = {
  id: string;
  status: Status;
  /** Whose turn it is, as the thread keeps it. */
  waitsOn: Turn | null;
  by: string;
  role: string;
  createdAt: string;
  text: string;
  board?: string;
  target?: string;
  prop?: string;
  source?: string;
  /** On a planning file: the exact words it is about. */
  quote?: string;
  snapshot?: string;
  /** A reviewer's finding: must, or consider. */
  weight?: "must" | "consider";
  /** An agent's question (ask): the answers it offers, its pick first. */
  options?: { label: string; why: string }[];
  changed?: string[];
  messages: Message[];
};

export type ThreadItem =
  /** Threads not yet settled, by whose turn: the person's, or an agent's (the fixer's or the reviewer's). */
  | { kind: "yours"; threads: Thread[]; turn: "person" | "agents" }
  | { kind: "thread"; thread: Thread };

const ICONS: Record<Status, [string, string | undefined]> = {
  open: ["circle-large-outline", "charts.yellow"],
  planned: ["clock", "charts.blue"],
  ready: ["pass", "charts.green"],
  closed: ["pass-filled", "disabledForeground"],
  withdrawn: ["circle-slash", "disabledForeground"],
};
const WORDS: Record<Status, string> = {
  open: "waiting",
  planned: "planned",
  ready: "ready",
  closed: "closed",
  withdrawn: "withdrawn",
};

const isYours = (t: Thread) => t.waitsOn === "person";
const isAgents = (t: Thread) => t.waitsOn === "fixer" || t.waitsOn === "reviewer";

/** Whose turn, in a few words. */
export const turnWords = (t: Thread): string =>
  t.waitsOn === "person"
    ? t.options !== undefined
      ? "your turn: asked"
      : "your turn"
    : t.waitsOn === "reviewer"
      ? "reviewer's turn"
      : t.waitsOn === "fixer"
        ? "agent's turn"
        : WORDS[t.status];

const where = (t: Thread) =>
  t.board === undefined
    ? // A chapter's planning file: its chapter and name (coordinate-geometry · plan.md); a guide
      // file: its full path (authoring/guide/examples.md).
      (t.source ?? "plan")
        .replace(/:\d.*$/, "")
        .replace(/^authoring\/books\/[^/]+\/(?!guide\/)([^/]+)\/(?:source\/)?/, "$1 · ")
    : `${t.board.split("/").at(-1)}${t.target ? ` · ${t.target}` : ""}${t.prop ? ` · prop ${t.prop}` : ""}`;

const planOf = (t: Thread) => [...t.messages].reverse().find((m) => m.status === "planned");
const answerOf = (t: Thread) =>
  [...t.messages].reverse().find((m) => m.status === "ready" || (m.by !== t.by && !m.status));

function tooltip(t: Thread): vscode.MarkdownString {
  const md = new vscode.MarkdownString(undefined, true);
  const who = t.role === "person" ? "" : ` · ${t.by === t.role ? t.role : `${t.by} (${t.role})`}`;
  const weight = t.weight ? ` · ${t.weight}` : "";
  md.appendMarkdown(
    `**${WORDS[t.status]}** · ${turnWords(t)}${weight}${who} · ${t.board ?? t.source ?? ""}\n\n`,
  );
  md.appendMarkdown(`**${t.by}:** ${t.text}\n\n`);
  for (const [i, o] of (t.options ?? []).entries())
    md.appendMarkdown(`${i + 1}. **${o.label}**: ${o.why}\n`);
  if (t.options) md.appendMarkdown("\n");
  const plan = planOf(t);
  if (plan) md.appendMarkdown(`**Plan (${plan.by}):** ${plan.text}\n\n`);
  for (const m of t.messages.filter((x) => x.status !== "planned"))
    md.appendMarkdown(`**${m.by}${m.status ? ` → ${m.status}` : ""}:** ${m.text || "—"}\n\n`);
  if (t.changed?.length) md.appendMarkdown(`*Changed:* ${t.changed.join(", ")}\n\n`);
  if (t.source) md.appendMarkdown(`*Source:* \`${t.source}\``);
  return md;
}

export class ThreadsTree implements vscode.TreeDataProvider<ThreadItem> {
  private readonly changed = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.changed.event;
  private threads: Thread[] = [];
  private problem: string | null = null;

  constructor(private readonly base: () => string) {}

  /** Reads every thread again from the dev server, then redraws. */
  async refresh(): Promise<void> {
    try {
      const all = (await fetch(new URL("dev-review", this.base())).then((r) => r.json())) as {
        threads?: Thread[];
      };
      this.threads = all.threads ?? [];
      this.problem = null;
    } catch {
      this.problem = "The dev server isn't answering: open the preview to start it.";
    }
    this.changed.fire();
  }

  getChildren(item?: ThreadItem): ThreadItem[] {
    if (item === undefined) {
      const yours = this.threads.filter(isYours);
      const agents = this.threads.filter(isAgents);
      return [
        ...(yours.length > 0 ? [{ kind: "yours", threads: yours, turn: "person" } as const] : []),
        ...(agents.length > 0 ? [{ kind: "yours", threads: agents, turn: "agents" } as const] : []),
      ];
    }
    if (item.kind === "yours")
      return item.threads.map((thread) => ({ kind: "thread", thread }) as const);
    return [];
  }

  getTreeItem(item: ThreadItem): vscode.TreeItem {
    if (item.kind === "yours") {
      const isMine = item.turn === "person";
      const t = new vscode.TreeItem(
        `${isMine ? "Your turn" : "Agents' turn"} (${item.threads.length})`,
        isMine
          ? vscode.TreeItemCollapsibleState.Expanded
          : vscode.TreeItemCollapsibleState.Collapsed,
      );
      t.iconPath = isMine
        ? new vscode.ThemeIcon("bell", new vscode.ThemeColor("charts.yellow"))
        : new vscode.ThemeIcon("sync");
      t.command = { command: "chalk.threads.open", title: "Open", arguments: [] };
      // Your turn with fixes ready to check: a button closes them all (open questions stay).
      if (isMine && item.threads.some((x) => x.status === "ready")) t.contextValue = "yours-ready";
      t.tooltip = isMine
        ? "An agent's question to answer (its options are buttons on the thread), or a fix ready to check: reply on it (it goes back to the agent) or close it."
        : "Threads the fixer is answering or fixing, or a reviewer is checking.";
      return t;
    }
    const { thread } = item;
    const t = new vscode.TreeItem(where(thread), vscode.TreeItemCollapsibleState.None);
    const latest = answerOf(thread) ?? planOf(thread);
    t.description = `${turnWords(thread)}${thread.weight ? ` · ${thread.weight}` : ""} · ${(latest?.text || thread.text).replace(/\s+/g, " ").slice(0, 80)}`;
    const [icon, color] = ICONS[thread.status];
    t.iconPath = new vscode.ThemeIcon(
      thread.options !== undefined && isYours(thread) ? "question" : icon,
      color ? new vscode.ThemeColor(color) : undefined,
    );
    t.tooltip = tooltip(thread);
    t.contextValue = `thread-${thread.status}`;
    t.command = { command: "chalk.thread.open", title: "Open", arguments: [item] };
    return t;
  }

  /** Where the threads stand, in a few words: for the Threads entry at the top of the Chalk tree. */
  get summary(): string {
    const agents = this.threads.filter(isAgents).length;
    const yours = this.threads.filter(isYours).length;
    return [yours > 0 ? `${yours} your turn` : "", agents > 0 ? `${agents} with the agents` : ""]
      .filter(Boolean)
      .join(" · ");
  }

  /** Every thread, as last read. */
  get allThreads(): readonly Thread[] {
    return this.threads;
  }

  /** Shown when the dev server didn't answer. */
  get message(): string | undefined {
    return this.problem ?? undefined;
  }

  /** The thread an item (or the command's argument) is about. */
  static threadOf(item: unknown): Thread | undefined {
    const i = item as ThreadItem | undefined;
    return i?.kind === "thread" ? i.thread : undefined;
  }

  /** The threads "Close all ready" acts on: your turn's. */
  static readyOf(item: unknown): Thread[] | undefined {
    const i = item as ThreadItem | undefined;
    return i?.kind === "yours" && i.turn === "person" ? i.threads : undefined;
  }
}
