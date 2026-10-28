import * as vscode from "vscode";

/**
 * The Reviews view (Chalk sidebar): what waits on you (an agent's question, decision or proposal, a
 * fix ready to check), your sitting not handed over yet, then every review, newest first, each with its threads and where it stands. Everything is read from and written through
 * the dev server (/dev-review), the one writer, as the person (platform/docs/comments.md).
 */

type Status = "open" | "planned" | "ready" | "closed" | "withdrawn";
type Message = { by: string; role: string; at: string; text: string; status?: Status };
export type Thread = {
  id: string;
  status: Status;
  /** Whose turn it is, as the dev server works it out. */
  waitsOn: "agent" | "person" | null;
  by: string;
  role: string;
  about?: string;
  createdAt: string;
  text: string;
  board?: string;
  target?: string;
  prop?: string;
  source?: string;
  /** On a planning file: the exact words it is about. */
  quote?: string;
  snapshot?: string;
  changed?: string[];
  messages: Message[];
};
type Review = { id: string; by: string; role: string; at: string; threads: { id: string }[] };
type Read = { threads: Thread[]; reviews: Review[] };

export type ReviewItem = Item;

type Item =
  | { kind: "yours"; threads: Thread[] }
  | { kind: "sitting"; threads: Thread[] }
  | { kind: "review"; review: Review; threads: Thread[]; isLatest: boolean }
  | { kind: "thread"; thread: Thread; review?: string };

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
  ready: "ready for you",
  closed: "closed",
  withdrawn: "withdrawn",
};

const isWaiting = (t: Thread) => t.waitsOn === "agent";
const isYours = (t: Thread) => t.waitsOn === "person";

/** "1 open, 3 ready", from the threads as they are now. */
function standing(threads: readonly Thread[]): string {
  const order: Status[] = ["open", "planned", "ready", "closed", "withdrawn"];
  const counts = new Map<Status, number>();
  for (const t of threads) counts.set(t.status, (counts.get(t.status) ?? 0) + 1);
  return order
    .filter((s) => counts.has(s))
    .map((s) => `${counts.get(s)} ${s}`)
    .join(", ");
}

const where = (t: Thread) =>
  t.board === undefined
    ? // A planning file: its chapter and name (coordinate-geometry · outline.yaml).
      (t.source ?? "plan")
        .replace(/:\d.*$/, "")
        .replace(/^authoring\/books\/[^/]+\/([^/]+)\/(?:source\/)?/, "$1 · ")
    : `${t.board.split("/").at(-1)}${t.target ? ` · ${t.target}` : ""}${t.prop ? ` · prop ${t.prop}` : ""}`;

const planOf = (t: Thread) => [...t.messages].reverse().find((m) => m.status === "planned");
const answerOf = (t: Thread) =>
  [...t.messages].reverse().find((m) => m.status === "ready" || (m.by !== t.by && !m.status));

function tooltip(t: Thread): vscode.MarkdownString {
  const md = new vscode.MarkdownString(undefined, true);
  const who = t.role === "person" ? "" : ` · ${t.by === t.role ? t.role : `${t.by} (${t.role})`}`;
  const turn = isYours(t) ? " · your turn" : "";
  const broke = t.about ? ` · broken by ${t.about}'s change` : "";
  md.appendMarkdown(
    `**${WORDS[t.status]}**${turn}${who}${broke} · ${t.board ?? t.source ?? ""}\n\n`,
  );
  md.appendMarkdown(`**${t.by}:** ${t.text}\n\n`);
  const plan = planOf(t);
  if (plan) md.appendMarkdown(`**Plan (${plan.by}):** ${plan.text}\n\n`);
  for (const m of t.messages.filter((x) => x.status !== "planned"))
    md.appendMarkdown(`**${m.by}${m.status ? ` → ${m.status}` : ""}:** ${m.text || "—"}\n\n`);
  if (t.changed?.length) md.appendMarkdown(`*Changed:* ${t.changed.join(", ")}\n\n`);
  if (t.source) md.appendMarkdown(`*Source:* \`${t.source}\``);
  return md;
}

export class ReviewsTree implements vscode.TreeDataProvider<Item> {
  private readonly changed = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.changed.event;
  private read: Read = { threads: [], reviews: [] };
  private sitting: Thread[] = [];
  private problem: string | null = null;

  constructor(private readonly base: () => string) {}

  /** Reads everything again from the dev server, then redraws. */
  async refresh(): Promise<void> {
    try {
      const [all, sitting] = await Promise.all([
        fetch(new URL("dev-review", this.base())).then((r) => r.json() as Promise<Read>),
        fetch(new URL("dev-review?sitting", this.base())).then(
          (r) => r.json() as Promise<Thread[]>,
        ),
      ]);
      this.read = { threads: all.threads ?? [], reviews: all.reviews ?? [] };
      this.sitting = sitting;
      this.problem = null;
    } catch {
      this.problem = "The dev server isn't answering: open the preview to start it.";
    }
    this.changed.fire();
  }

  /** A review's threads, in its order, as they are now. */
  threadsOf(review: Review): Thread[] {
    return review.threads.flatMap((x) => this.read.threads.find((t) => t.id === x.id) ?? []);
  }

  getChildren(item?: Item): Item[] {
    if (item === undefined) {
      const reviews = [...this.read.reviews].reverse();
      const yours = this.read.threads.filter(isYours);
      return [
        ...(yours.length > 0 ? [{ kind: "yours", threads: yours } as const] : []),
        ...(this.sitting.length > 0 ? [{ kind: "sitting", threads: this.sitting } as const] : []),
        ...reviews.map(
          (review, i) =>
            ({
              kind: "review",
              review,
              threads: this.threadsOf(review),
              isLatest: i === 0,
            }) as const,
        ),
      ];
    }
    if (item.kind === "sitting")
      return item.threads.map((thread) => ({ kind: "thread", thread }) as const);
    // Opened on the preview's page of what waits on you.
    if (item.kind === "yours")
      return item.threads.map((thread) => ({ kind: "thread", thread, review: "yours" }) as const);
    if (item.kind === "review")
      return item.threads.map(
        (thread) => ({ kind: "thread", thread, review: item.review.id }) as const,
      );
    return [];
  }

  getTreeItem(item: Item): vscode.TreeItem {
    if (item.kind === "yours") {
      const t = new vscode.TreeItem(
        `Waiting on you (${item.threads.length})`,
        vscode.TreeItemCollapsibleState.Expanded,
      );
      t.iconPath = new vscode.ThemeIcon("bell", new vscode.ThemeColor("charts.yellow"));
      t.command = { command: "chalk.review.open", title: "Open", arguments: [item] };
      t.tooltip =
        "An agent's question, decision or proposal to answer, or a fix ready to check: reply on it (it goes back to the agent) or close it.";
      return t;
    }
    if (item.kind === "sitting") {
      const t = new vscode.TreeItem(
        `Not handed over yet (${item.threads.length})`,
        vscode.TreeItemCollapsibleState.Expanded,
      );
      t.contextValue = "sitting";
      t.iconPath = new vscode.ThemeIcon("inbox");
      t.command = { command: "chalk.review.open", title: "Open", arguments: [item] };
      t.tooltip =
        "Threads you started or replied to since your last handover. Copy for agent hands them over.";
      return t;
    }
    if (item.kind === "review") {
      const { review, threads } = item;
      const isDone = threads.every((x) => !isWaiting(x) && x.status !== "ready");
      const t = new vscode.TreeItem(
        review.id,
        item.isLatest && !isDone
          ? vscode.TreeItemCollapsibleState.Expanded
          : vscode.TreeItemCollapsibleState.Collapsed,
      );
      t.description = `${review.by} · ${standing(threads)}`;
      t.command = { command: "chalk.review.open", title: "Open", arguments: [item] };
      t.contextValue = threads.some((x) => x.status === "ready") ? "review-ready" : "review";
      t.iconPath = new vscode.ThemeIcon(
        isDone ? "check-all" : threads.some(isWaiting) ? "sync" : "eye",
      );
      t.tooltip = `Review ${review.id}, handed over by ${review.by} (${review.role}) at ${new Date(review.at).toLocaleString()}: ${standing(threads)}`;
      return t;
    }
    const { thread } = item;
    const t = new vscode.TreeItem(where(thread), vscode.TreeItemCollapsibleState.None);
    const latest = answerOf(thread) ?? planOf(thread);
    t.description = `${isYours(thread) && thread.status === "open" ? "your turn" : WORDS[thread.status]} · ${(latest?.text || thread.text).replace(/\s+/g, " ").slice(0, 80)}`;
    const [icon, color] = ICONS[thread.status];
    t.iconPath = new vscode.ThemeIcon(icon, color ? new vscode.ThemeColor(color) : undefined);
    t.tooltip = tooltip(thread);
    t.contextValue = `thread-${thread.status}`;
    t.command = { command: "chalk.thread.open", title: "Open", arguments: [item] };
    return t;
  }

  /** Where the reviews stand, in a few words: for the Reviews entry at the top of the Chalk tree. */
  get summary(): string {
    const waiting = this.read.threads.filter(isWaiting).length;
    const yours = this.read.threads.filter(isYours).length;
    return [
      yours > 0 ? `${yours} waiting on you` : "",
      this.sitting.length > 0 ? `${this.sitting.length} not handed over` : "",
      waiting > 0 ? `${waiting} with the agent` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  /** Every thread, as last read. */
  get allThreads(): readonly Thread[] {
    return this.read.threads;
  }

  /** Shown when the dev server didn't answer. */
  get message(): string | undefined {
    return this.problem ?? undefined;
  }

  /** The thread an item (or the command's argument) is about. */
  static threadOf(item: unknown): Thread | undefined {
    const i = item as Item | undefined;
    return i?.kind === "thread" ? i.thread : undefined;
  }

  /** The review a thread item was listed under ("yours": what waits on you; undefined: your sitting). */
  static reviewIdOf(item: unknown): string | undefined {
    const i = item as Item | undefined;
    return i?.kind === "thread" ? i.review : undefined;
  }

  static reviewOf(item: unknown): { review: Review; threads: Thread[] } | undefined {
    const i = item as Item | undefined;
    return i?.kind === "review" ? { review: i.review, threads: i.threads } : undefined;
  }

  /** The preview's page a group opens: what waits on you, or your sitting. */
  static pageOf(item: unknown): string {
    const i = item as Item | undefined;
    return i?.kind === "review" ? i.review.id : i?.kind === "yours" ? "yours" : "sitting";
  }
}
