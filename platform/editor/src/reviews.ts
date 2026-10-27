import * as vscode from "vscode";

/**
 * The Reviews view (Chalk sidebar): your sitting not handed over yet, then every review, newest
 * first, each with its threads and where it stands. Everything is read from and written through
 * the dev server (/dev-review), the one writer, as the person (platform/docs/comments.md).
 */

type Status = "open" | "planned" | "ready" | "closed" | "withdrawn";
type Message = { by: string; role: string; at: string; text: string; status?: Status };
export type Thread = {
  id: string;
  label: string;
  status: Status;
  by: string;
  createdAt: string;
  text: string;
  board?: string;
  target?: string;
  prop?: string;
  source?: string;
  snapshot?: string;
  changed?: string[];
  messages: Message[];
};
type Review = { id: string; by: string; role: string; at: string; threads: { id: string }[] };
type Read = { threads: Thread[]; reviews: Review[] };

type Item =
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

const isWaiting = (t: Thread) => t.status === "open" || t.status === "planned";

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
    ? `${(t.source ?? "plan").replace(/^content\//, "").replace(/:\d.*$/, "")}`
    : `${t.board.split("/").at(-1)}${t.target ? ` · ${t.target}` : ""}${t.prop ? ` · prop ${t.prop}` : ""}`;

const planOf = (t: Thread) => [...t.messages].reverse().find((m) => m.status === "planned");
const answerOf = (t: Thread) =>
  [...t.messages].reverse().find((m) => m.status === "ready" || (m.by !== t.by && !m.status));

function tooltip(t: Thread): vscode.MarkdownString {
  const md = new vscode.MarkdownString(undefined, true);
  md.appendMarkdown(`**${WORDS[t.status]}** · ${t.label} · ${t.board ?? t.source ?? ""}\n\n`);
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
      return [
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
    if (item.kind === "review")
      return item.threads.map(
        (thread) => ({ kind: "thread", thread, review: item.review.id }) as const,
      );
    return [];
  }

  getTreeItem(item: Item): vscode.TreeItem {
    if (item.kind === "sitting") {
      const t = new vscode.TreeItem(
        `Not handed over yet (${item.threads.length})`,
        vscode.TreeItemCollapsibleState.Expanded,
      );
      t.contextValue = "sitting";
      t.iconPath = new vscode.ThemeIcon("inbox");
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
    t.description = `${WORDS[thread.status]} · ${(latest?.text || thread.text).replace(/\s+/g, " ").slice(0, 80)}`;
    const [icon, color] = ICONS[thread.status];
    t.iconPath = new vscode.ThemeIcon(icon, color ? new vscode.ThemeColor(color) : undefined);
    t.tooltip = tooltip(thread);
    t.contextValue = `thread-${thread.status}`;
    t.command = { command: "chalk.thread.open", title: "Open", arguments: [item] };
    return t;
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

  static reviewOf(item: unknown): { review: Review; threads: Thread[] } | undefined {
    const i = item as Item | undefined;
    return i?.kind === "review" ? { review: i.review, threads: i.threads } : undefined;
  }
}
