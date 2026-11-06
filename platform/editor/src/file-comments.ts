import { join } from "node:path";
import * as vscode from "vscode";
import { type Thread, turnWords } from "./threads";

/**
 * Threads on a chapter's planning files and on every guide file (authoring/guide.md,
 * authoring/guide/…, and a book's or a chapter's guide.md and guide/…), shown in the files themselves (VS Code's comments), on the
 * words they are about: read, reply, close, or start one with the + in the margin. Everything is
 * read from and written through the dev server, the one writer (platform/docs/comments.md); this
 * only draws what it is given and sends what the person does.
 */

type Send = (change: Record<string, unknown>) => Promise<{ ok: boolean; error?: string }>;

/**
 * The files a thread can be on: the guide for every book (authoring/guide.md, authoring/guide/…), a
 * book's guide.md or guide/…, and any file in a chapter's folder (its planning files, its guide).
 * As platform/studio/src/comments.ts's fileHomeOf.
 */
const PLANNING =
  /^authoring\/(?:guide\.md|guide\/.+|books\/(?!guide\/)[^/]+\/(?:guide\.md|guide\/.+|(?!guide\/)[^/]+\/.+))$/;

/** The command an option's link runs: his answer, that option's label (extension.ts). */
export const ANSWER_COMMAND = "chalk.thread.answer";

/** Whose turn or where it stands, in words. */
function standing(t: Thread): string {
  const weight = t.weight === undefined ? "" : ` · ${t.weight}`;
  if (t.status === "open")
    return t.waitsOn === "person"
      ? t.options !== undefined
        ? "Your turn: pick an option, or reply in your words"
        : "Your turn"
      : `${turnWords(t)}${weight}`;
  if (t.status === "planned") return `Planned by the agent${weight}`;
  return t.waitsOn === "person" ? "Ready: close it, or reply" : `Ready · ${turnWords(t)}${weight}`;
}

/**
 * An agent's question: its words, then each option as a link that answers with its label (the
 * agent's pick first). The links are live only while it waits on the person; the reply box below
 * takes his own words.
 */
function askBody(t: Thread): vscode.MarkdownString {
  const isOpen = t.waitsOn === "person" && t.status === "open";
  const md = new vscode.MarkdownString(undefined, true);
  md.isTrusted = { enabledCommands: [ANSWER_COMMAND] };
  md.appendMarkdown(`${t.text}\n\n`);
  for (const [i, o] of (t.options ?? []).entries()) {
    const args = encodeURIComponent(JSON.stringify([t.id, o.label]));
    const label = `${o.label}${i === 0 ? " ★" : ""}`;
    md.appendMarkdown(
      isOpen
        ? `- [**$(check) ${label}**](command:${ANSWER_COMMAND}?${args}): ${o.why}\n`
        : `- **${label}**: ${o.why}\n`,
    );
  }
  return md;
}

/** The lines a thread is about: where its quote is now, else the lines it was started on. */
function rangeOf(doc: vscode.TextDocument, t: Thread): vscode.Range {
  const text = doc.getText();
  const at = t.quote === undefined ? -1 : text.indexOf(t.quote);
  if (at !== -1 && t.quote !== undefined)
    return new vscode.Range(doc.positionAt(at), doc.positionAt(at + t.quote.length));
  const m = /:(\d+)(?:-(\d+))?$/.exec(t.source ?? "");
  const from = Math.max(0, Math.min(doc.lineCount - 1, Number(m?.[1] ?? 1) - 1));
  const to = Math.max(from, Math.min(doc.lineCount - 1, Number(m?.[2] ?? m?.[1] ?? 1) - 1));
  return new vscode.Range(from, 0, to, doc.lineAt(to).text.length);
}

function commentOf(
  by: string,
  text: string | vscode.MarkdownString,
  label?: string,
): vscode.Comment {
  return {
    author: { name: by },
    body: typeof text === "string" ? new vscode.MarkdownString(text === "" ? "—" : text) : text,
    mode: vscode.CommentMode.Preview,
    ...(label === undefined ? {} : { label }),
  };
}

export class FileComments implements vscode.Disposable {
  private readonly controller = vscode.comments.createCommentController("chalk", "Chalk");
  /** What is drawn now, by thread id. */
  private readonly shown = new Map<string, vscode.CommentThread>();
  private readonly idOf = new WeakMap<vscode.CommentThread, string>();

  constructor(
    private readonly root: string,
    private readonly send: Send,
    private readonly refresh: () => void,
  ) {
    // The + in the margin on every planning and guide file.
    this.controller.commentingRangeProvider = {
      provideCommentingRanges: (doc) =>
        this.relOf(doc.uri) === undefined
          ? []
          : [new vscode.Range(0, 0, Math.max(0, doc.lineCount - 1), 0)],
    };
    this.controller.options = {
      prompt: "Comment on these lines",
      placeHolder: "What's wrong, or what should change? Or your answer.",
    };
  }

  /** A planning or guide file's path in the repo, if the file is one. */
  private relOf(uri: vscode.Uri): string | undefined {
    if (uri.scheme !== "file" || !uri.fsPath.startsWith(this.root)) return undefined;
    const rel = uri.fsPath
      .slice(this.root.length + 1)
      .split("\\")
      .join("/");
    return PLANNING.test(rel) && !rel.endsWith("comments.yaml") ? rel : undefined;
  }

  /** Draws the threads still talked about on the planning and guide files they are on. */
  async show(threads: readonly Thread[]): Promise<void> {
    const live = threads.filter(
      (t) =>
        t.board === undefined &&
        t.source !== undefined &&
        PLANNING.test(t.source.replace(/:\d+(-\d+)?$/, "")) &&
        (t.status === "open" || t.status === "planned" || t.status === "ready"),
    );
    for (const [id, drawn] of this.shown)
      if (!live.some((t) => t.id === id)) {
        drawn.dispose();
        this.shown.delete(id);
      }
    for (const t of live) {
      const file = (t.source ?? "").replace(/:\d+(-\d+)?$/, "");
      const uri = vscode.Uri.file(join(this.root, file));
      let doc: vscode.TextDocument;
      try {
        doc = await vscode.workspace.openTextDocument(uri);
      } catch {
        continue; // the file is gone: the threads check lists it
      }
      const comments = [
        commentOf(t.by, t.options === undefined ? t.text : askBody(t), t.weight),
        ...t.messages.map((m) =>
          commentOf(
            m.by,
            m.text,
            m.status === "planned" ? "plan" : m.status ? `→ ${m.status}` : undefined,
          ),
        ),
      ];
      const range = rangeOf(doc, t);
      const old = this.shown.get(t.id);
      const drawn = old ?? this.controller.createCommentThread(uri, range, comments);
      drawn.range = range;
      drawn.comments = comments;
      drawn.label = standing(t);
      drawn.contextValue = `chalk-${t.status}`;
      drawn.canReply = true;
      if (old === undefined)
        drawn.collapsibleState =
          t.waitsOn === "person"
            ? vscode.CommentThreadCollapsibleState.Expanded
            : vscode.CommentThreadCollapsibleState.Collapsed;
      this.idOf.set(drawn, t.id);
      this.shown.set(t.id, drawn);
    }
  }

  /** Opens the file a thread is on, with the words it is about selected and the thread unfolded. */
  async reveal(t: Thread): Promise<void> {
    const file = (t.source ?? "").replace(/:\d+(-\d+)?$/, "");
    try {
      const doc = await vscode.workspace.openTextDocument(join(this.root, file));
      const range = rangeOf(doc, t);
      const editor = await vscode.window.showTextDocument(doc, {
        selection: new vscode.Selection(range.start, range.end),
        preserveFocus: false,
      });
      editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
      const drawn = this.shown.get(t.id);
      if (drawn !== undefined)
        drawn.collapsibleState = vscode.CommentThreadCollapsibleState.Expanded;
    } catch (e) {
      void vscode.window.showErrorMessage(`Chalk: couldn't open ${file}: ${(e as Error).message}`);
    }
  }

  /** A reply on a thread, or a new thread from the +: sent, then everything is read again. */
  async reply(r: vscode.CommentReply): Promise<void> {
    const text = r.text.trim();
    if (text === "") return;
    const id = this.idOf.get(r.thread);
    let done: { ok: boolean; error?: string };
    if (id !== undefined) done = await this.send({ op: "write", id, text });
    else {
      const rel = this.relOf(r.thread.uri);
      const range = r.thread.range;
      if (rel === undefined || range === undefined) return;
      const doc = await vscode.workspace.openTextDocument(r.thread.uri);
      const lines = new vscode.Range(range.start.line, 0, range.end.line, Number.MAX_SAFE_INTEGER);
      const quote = doc.getText(range.isEmpty ? lines : range).trim();
      const from = range.start.line + 1;
      const to = range.end.line + 1;
      done = await this.send({
        op: "start",
        thread: { source: `${rel}:${from === to ? from : `${from}-${to}`}`, quote, text },
      });
      // The drawn thread comes back from the dev server; this draft goes.
      if (done.ok) r.thread.dispose();
    }
    if (!done.ok) void vscode.window.showErrorMessage(`Chalk: ${done.error}`);
    this.refresh();
  }

  /** Closes a thread (the person is satisfied). */
  async close(drawn: vscode.CommentThread): Promise<void> {
    const id = this.idOf.get(drawn);
    if (id === undefined) return drawn.dispose();
    const done = await this.send({ op: "write", id, text: "", status: "closed" });
    if (!done.ok) void vscode.window.showErrorMessage(`Chalk: ${done.error}`);
    this.refresh();
  }

  dispose(): void {
    this.controller.dispose();
  }
}
