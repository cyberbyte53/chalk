import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import * as vscode from "vscode";
import { FileComments } from "./file-comments";
import { panelHtml } from "./panel-html";
import {
  type PlanningFile,
  addSource,
  isApprovable,
  planningFileOf,
  readAll,
  readOne,
  setApproval,
  showProblems,
  stateDetail,
  stateWords,
} from "./planning";
import { type ReviewItem, ReviewsTree } from "./reviews";

/**
 * Chalk in the editor (Cursor, VS Code): content seen as boards beside its code.
 *
 * - A preview panel shows whatever the open file or folder is, as the student sees it: a book's
 *   screen, a chapter's path, a lesson's boards, a question family's questions. It is the learner
 *   app's own `?dev&at=` page in a frame: the app's player draws everything; this draws nothing.
 * - The panel follows the editor: move the cursor in overview.ts and the piece written there is
 *   outlined; click a piece (Alt-click, or after "Pick") and the editor goes to its line.
 * - Pick a piece, then ask the agent about it (it goes to the chat with its board, line and words)
 *   or leave a comment (sent to the dev server, which files it under authoring/: the chapter's comments.yaml, or
 *   the prop's for a pick on a prop).
 * - The Chalk tree (in the explorer): book → chapter → its planning files (with their state; approve,
 *   take back) and its lessons, with open comments counted. A planning file's failing checks are
 *   problems on its lines; select words in one to comment on them (planning.ts).
 *
 * It uses a dev server already running on :5173, or starts the learner app's (and the content
 * rebuild on save) itself.
 */

/** The one dev server (it runs the content rebuild too); see platform/apps/learner/vite.config.ts. */
const PORT = Number(process.env.CHALK_DEV_PORT ?? 5173);
let root = "";
let base = `http://localhost:${PORT}/`;
let log: vscode.OutputChannel;
let panel: vscode.WebviewPanel | undefined;
let shown = "";
let isReady = false;

const rel = (file: string) => relative(root, file).split(sep).join("/");

async function isUp(url: string): Promise<boolean> {
  try {
    const res = await fetch(new URL("/content/index.json", url), {
      signal: AbortSignal.timeout(1200),
    });
    return res.ok;
  } catch {
    return false;
  }
}

let starting: Promise<boolean> | undefined;
/**
 * The dev server is up. If not, the studio service is made sure of, the one way it is started
 * (platform/studio/start.mjs, run with the editor's own Node), and it starts the dev server: one
 * start path for everything, whoever asks first (this editor, an agent, `pnpm dev`). If it can't
 * come up, its log's last lines are in the Chalk output.
 */
async function ensureServer(): Promise<boolean> {
  if (await isUp(base)) return true;
  starting ??= (async () => {
    log.appendLine("Starting the studio service (it starts the dev server)…");
    const starter = spawn(
      process.execPath,
      [join(root, "platform", "studio", "start.mjs"), "--app"],
      {
        cwd: root,
        env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
      },
    );
    starter.stdout?.on("data", (d) => log.append(String(d)));
    starter.stderr?.on("data", (d) => log.append(String(d)));
    for (let i = 0; i < 90; i++) {
      if (await isUp(base)) return true;
      await new Promise((r) => setTimeout(r, 1000));
    }
    log.show(true);
    return false;
  })();
  const ok = await starting;
  starting = undefined;
  return ok;
}

/** What the preview should show for a file or folder in content/ (a `?dev&…` query), or null. */
function queryFor(file: string): string | null {
  const path = rel(file);
  // A review file shows its boards with its threads; the folder, every review.
  if (path === "authoring/reviews" || path === "authoring/reviews/") return "reviews";
  const review = /^authoring\/reviews\/([^/]+)\.yaml$/.exec(path);
  if (review?.[1] !== undefined) return `review=${review[1]}`;
  if (!path.startsWith("content/")) return null;
  const parts = path.slice("content/".length).split("/").filter(Boolean);
  let isDir = false;
  try {
    isDir = statSync(file).isDirectory();
  } catch {}
  const folders = isDir ? parts : parts.slice(0, -1);
  const [book, chapter, third, family] = folders;
  if (book === undefined) return "at=content/";
  if (chapter === undefined) return `at=content/${book}`;
  if (third === undefined) return `at=content/${book}/${chapter}`;
  if (third === "questions")
    return family === undefined
      ? `at=content/${book}/${chapter}`
      : `source=content/${book}/${chapter}/questions/${family}`;
  return `at=content/${book}/${chapter}/${third}&show=questions`;
}

async function showPreview(target?: vscode.Uri): Promise<void> {
  const file = target?.fsPath ?? vscode.window.activeTextEditor?.document.uri.fsPath;
  await showQuery((file && queryFor(file)) ?? "at=content/");
}

/** A place to outline once the preview has drawn: a source line (content/…:42). */
let pendingReveal: { file: string; line: number } | undefined;

/** Shows a preview query (`at=content/…`, `activity…`); `reveal` outlines the piece written at that line. */
async function showQuery(query: string, reveal?: string): Promise<void> {
  if (reveal !== undefined) {
    const [file, line] = reveal.split(/:(?=\d+$)/);
    if (file !== undefined) pendingReveal = { file, line: Number(line ?? 1) };
  }
  if (!(await ensureServer())) {
    void vscode.window.showErrorMessage(
      "Chalk: the dev server didn't start. See the Chalk output; or run `pnpm dev` and try again.",
    );
    return;
  }
  if (panel === undefined) {
    panel = vscode.window.createWebviewPanel(
      "chalk.preview",
      "Chalk",
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.onDidDispose(() => {
      panel = undefined;
      shown = "";
    });
    panel.webview.onDidReceiveMessage(onMessage);
    panel.webview.html = panelHtml(base, query);
    shown = query;
    isReady = false;
  } else if (query !== shown) {
    shown = query;
    isReady = false;
    void panel.webview.postMessage({ type: "show", query });
  } else if (pendingReveal !== undefined && isReady) {
    void panel.webview.postMessage({ type: "reveal", ...pendingReveal });
    pendingReveal = undefined;
  }
  panel.reveal(vscode.ViewColumn.Beside, true);
}

async function openSite(site: string | undefined): Promise<void> {
  if (!site) return;
  const [file, line] = site.split(/:(?=\d+$)/);
  if (file === undefined) return;
  try {
    const doc = await vscode.workspace.openTextDocument(join(root, file));
    const at = new vscode.Position(Math.max(0, Number(line ?? 1) - 1), 0);
    // Beside the panel: in a text editor's column if one shows, else a new column next to it.
    const column =
      vscode.window.visibleTextEditors.find(
        (e) => e.viewColumn !== undefined && e.viewColumn !== panel?.viewColumn,
      )?.viewColumn ?? vscode.ViewColumn.Beside;
    const editor = await vscode.window.showTextDocument(doc, {
      viewColumn: column,
      preserveFocus: false,
    });
    editor.selection = new vscode.Selection(at, at);
    editor.revealRange(new vscode.Range(at, at), vscode.TextEditorRevealType.InCenter);
  } catch (e) {
    void vscode.window.showErrorMessage(`Chalk: couldn't open ${site}: ${(e as Error).message}`);
  }
}

type Picked = {
  board?: string;
  piece?: string;
  /** The part of the prop picked (a slider, a stepper), when a part was. */
  part?: string;
  prop?: string;
  /** Set when the pick is a prop's (not the basics). */
  propPackage?: string;
  /** What the comment is about: the board it was seen on, or the prop wherever it is used. */
  scope?: "board" | "prop";
  site?: string;
  text?: string;
  note?: string;
};

// ---- Comments: written only by the dev server (platform/studio/src/comments.ts) ----

/** Sends one change to the dev server, the comments' one writer. Says why, if it was refused. */
async function changeComments(change: Record<string, unknown>): Promise<{
  ok: boolean;
  error?: string;
  count?: number;
  review?: { id: string };
}> {
  if (!(await ensureServer())) return { ok: false, error: "the dev server isn't running" };
  try {
    const res = await fetch(new URL("dev-review", base), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(change),
    });
    return (await res.json()) as { ok: boolean; error?: string };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** How many threads are in your sitting, not yet handed to an agent (the panel's button shows it). */
async function tellReview(): Promise<void> {
  let count = 0;
  try {
    const res = await fetch(new URL("dev-review?sitting", base));
    count = ((await res.json()) as unknown[]).length;
  } catch {}
  void panel?.webview.postMessage({ type: "review", count });
}

/**
 * Hands your sitting to an agent: every thread you started or replied to since your last handover.
 * The dev server writes it as reviews/<id>.yaml, and one line naming it is copied for the agent's
 * chat; the agent reads it with the chalk `comments` tool (review: <id>).
 */
async function copyReview(): Promise<void> {
  const done = await changeComments({ op: "handover" });
  if (!done.ok) {
    void vscode.window.showErrorMessage(`Chalk: couldn't hand the review over: ${done.error}`);
    return;
  }
  if (!done.count) {
    void vscode.window.showInformationMessage(
      "Chalk: nothing new since your last handover. Pick a piece (c) to comment, or reply on a thread.",
    );
    return;
  }
  await vscode.env.clipboard.writeText(
    `apply review ${done.review?.id ?? "latest"} (${done.count} thread${done.count > 1 ? "s" : ""})`,
  );
  void tellReview();
  void reviews.refresh();
  void vscode.window.showInformationMessage(
    "Chalk: copied. Paste it into the agent's chat (⌘V); plan mode is a good place to start.",
  );
}

/**
 * The comment box is the editor's own input (full keyboard: select all, copy, paste, undo).
 * Enter saves, Escape cancels.
 */
async function askForComment(p: Picked): Promise<void> {
  const what = p.propPackage
    ? `the ${p.prop} prop${p.part ? `/${p.part}` : ""} (everywhere it's used)`
    : p.piece
      ? `${p.piece}${p.part ? `/${p.part}` : ""}`
      : "the board";
  const where = `${what} · ${(p.site ?? p.board ?? "").replace(/^content\//, "")}`;
  const note = await vscode.window.showInputBox({
    title: `Comment on ${where}`,
    prompt: (p.text ?? "").slice(0, 140),
    placeHolder: "What's wrong, or what should change?",
    ignoreFocusOut: true,
  });
  if (note?.trim()) await leaveComment({ ...p, note, scope: p.propPackage ? "prop" : "board" });
}

/**
 * Files the comment through the dev server: on the board, or on the prop wherever it is used when
 * the person said so (a prop's own page is only the prop). A prop's thread keeps the board it was
 * seen on, when it was seen on one.
 */
async function leaveComment(p: Picked): Promise<void> {
  const target = p.piece ? (p.part ? `${p.piece}/${p.part}` : p.piece) : undefined;
  const isPropPage = (p.board ?? "").startsWith("library/props/");
  const isProp = p.scope === "prop" && p.prop !== undefined;
  const done = await changeComments({
    op: "start",
    thread: {
      ...(isPropPage ? {} : { board: p.board }),
      ...(target ? { target } : {}),
      ...(isProp ? { prop: p.prop } : {}),
      ...(p.site ? { source: p.site } : {}),
      ...(p.text ? { snapshot: p.text } : {}),
      text: p.note?.trim() ?? "",
    },
  });
  if (!done.ok) {
    void vscode.window.showErrorMessage(`Chalk: the comment wasn't saved: ${done.error}`);
    return;
  }
  void tellReview();
  tree.refresh();
}

function onMessage(
  m: { type?: string; site?: string; url?: string; query?: string; file?: string } & Picked,
): void {
  if (m.type === "ready") {
    isReady = true;
    if (pendingReveal !== undefined) {
      void panel?.webview.postMessage({ type: "reveal", ...pendingReveal });
      pendingReveal = undefined;
    } else revealCursor();
    void tellReview();
  } else if (m.type === "open") void openSite(m.site);
  else if (m.type === "copy") void copyReview();
  else if (m.type === "copyText" && typeof (m as { text?: unknown }).text === "string") {
    void vscode.env.clipboard.writeText((m as { text: string }).text);
    void vscode.window.showInformationMessage("Chalk: copied. Paste it into the agent's chat.");
  } else if (m.type === "clipboard" && typeof (m as { text?: unknown }).text === "string") {
    // Copy and cut in the preview's text boxes: the editor keeps those keys from the iframe.
    void vscode.env.clipboard.writeText((m as { text: string }).text);
  } else if (m.type === "paste")
    void vscode.env.clipboard
      .readText()
      .then((text) => panel?.webview.postMessage({ type: "pasted", text }));
  // A comment written next to the piece in the preview.
  else if (m.type === "comment" && typeof (m as { note?: unknown }).note === "string")
    void leaveComment(m);
  // A pick with nowhere to write in the preview (an older page): ask here.
  else if (m.type === "pick") void askForComment(m);
  else if (m.type === "external" && m.url) void openInBrowser(m.url);
  // Where the page is now, as it says: the one address there is.
  if (m.type === "at" && typeof m.query === "string") shown = m.query;
}

/**
 * The editor's own browser if it has one (Cursor's browser, where design mode can pick a piece and
 * add it to the agent's chat with its attributes and a screenshot), else the system browser.
 */
async function openInBrowser(url: string): Promise<void> {
  const commands = await vscode.commands.getCommands(true);
  if (commands.includes("simpleBrowser.show")) {
    try {
      await vscode.commands.executeCommand("simpleBrowser.show", url);
      return;
    } catch {}
  }
  await vscode.env.openExternal(vscode.Uri.parse(url));
}

/** Outline, in the preview, the piece written at the cursor. */
function revealCursor(): void {
  const editor = vscode.window.activeTextEditor;
  if (panel === undefined || !isReady || editor === undefined) return;
  const file = rel(editor.document.uri.fsPath);
  if (!file.startsWith("content/")) return;
  void panel.webview.postMessage({ type: "reveal", file, line: editor.selection.active.line + 1 });
}

// ---- The tree: book → chapter → its planning files and lessons ----

type Node = {
  label: string;
  path: string;
  kind:
    | "reviews"
    | "book"
    | "chapter"
    | "planning"
    | "planfile"
    | "lesson"
    | "questions"
    | "family"
    | "content"
    | "props"
    | "package"
    | "prop";
  /** A lesson changed since a reviewer last looked: why. */
  toReview?: string;
  /** A prop's line under its name: its role and the chapters that place it; a package's, how many props. */
  description?: string;
  file: string;
  /** A planning file's state, as the dev server reads it. */
  plan?: PlanningFile;
};

const readJson = <T>(file: string): T | null => {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
};

const dirsIn = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir).filter((n) => !n.startsWith(".") && statSync(join(dir, n)).isDirectory())
    : [];

/** A chapter's threads not yet settled, as the dev server gives them: how many are whose turn. */
function openComments(chapter: string): { yours: number; agents: number } {
  const on = (t: { board?: string; source?: string }) =>
    (t.board ?? "").startsWith(`${chapter}/`) ||
    (t.source ?? "").startsWith(`authoring/books/${chapter}/`) ||
    (t.source ?? "").startsWith(`content/${chapter}/`);
  const mine = reviews.allThreads.filter(on);
  return {
    yours: mine.filter((t) => t.waitsOn === "person").length,
    agents: mine.filter((t) => t.waitsOn === "agent").length,
  };
}

/** Anything in the Chalk tree: the content and its planning, or the reviews (reviews.ts). */
type Element = Node | ReviewItem;
const isReview = (e: Element): e is ReviewItem =>
  e.kind === "yours" ||
  e.kind === "past" ||
  e.kind === "sitting" ||
  e.kind === "review" ||
  e.kind === "thread";

/**
 * The one Chalk tree: Reviews at the top (your threads not handed over, then each review), then
 * book → chapter → its planning files and lessons.
 */
/**
 * Every prop, as the catalogue lists them (`pnpm catalogue` writes it from the definitions): a
 * line per prop, `### \`type\` · role` then its address and the chapters that place it.
 */
function propsIn(catalogue: string): Node[] {
  let text: string;
  try {
    text = readFileSync(catalogue, "utf8");
  } catch {
    return [];
  }
  const out: Node[] = [];
  let pkg = "";
  let type = "";
  let role = "";
  for (const line of text.split("\n")) {
    const p = /^## `([^`]+)`/.exec(line);
    if (p?.[1] !== undefined) pkg = p[1];
    const t = /^### `([^`]+)` · (\S+)/.exec(line);
    if (t?.[1] !== undefined) [type, role] = [t[1], t[2] ?? ""];
    const a = /^`(library\/props\/[^`]+)` · (.*)$/.exec(line);
    if (a?.[1] !== undefined && type !== "")
      out.push({
        label: type,
        path: a[1],
        kind: "prop",
        // The package it is in (the folder it is listed under).
        file: pkg,
        description: `${role} · ${a[2] ?? ""}`,
      });
  }
  return out;
}

class ChalkTree implements vscode.TreeDataProvider<Element> {
  private readonly changed = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.changed.event;
  constructor(private readonly reviews: ReviewsTree) {
    reviews.onDidChangeTreeData(() => this.changed.fire());
  }
  refresh(): void {
    this.changed.fire();
  }

  getTreeItem(element: Element): vscode.TreeItem {
    if (isReview(element)) return this.reviews.getTreeItem(element);
    const node = element;
    if (node.kind === "reviews") {
      const item = new vscode.TreeItem("Reviews", vscode.TreeItemCollapsibleState.Expanded);
      item.iconPath = new vscode.ThemeIcon("comment-discussion");
      item.description = this.reviews.summary;
      item.contextValue = "reviews";
      return item;
    }
    if (node.kind === "content") {
      const item = new vscode.TreeItem("Content", vscode.TreeItemCollapsibleState.Expanded);
      item.iconPath = new vscode.ThemeIcon("book");
      item.tooltip = "Every book: its chapters, their planning files and lessons";
      item.contextValue = "content";
      return item;
    }
    if (node.kind === "props") {
      const item = new vscode.TreeItem("Props", vscode.TreeItemCollapsibleState.Collapsed);
      item.iconPath = new vscode.ThemeIcon("extensions");
      item.tooltip = "Every prop in library/props, each on its own page";
      item.contextValue = "props";
      return item;
    }
    if (node.kind === "package") {
      const item = new vscode.TreeItem(node.label, vscode.TreeItemCollapsibleState.Collapsed);
      item.iconPath = vscode.ThemeIcon.Folder;
      item.description = node.description;
      item.tooltip = `library/props/${node.path}`;
      item.contextValue = "package";
      return item;
    }
    if (node.kind === "prop") {
      const item = new vscode.TreeItem(node.label, vscode.TreeItemCollapsibleState.None);
      item.iconPath = new vscode.ThemeIcon("symbol-misc");
      item.description = node.description;
      item.tooltip = `${node.path}\n${node.description ?? ""}`;
      item.contextValue = "prop";
      item.command = { command: "chalk.prop.open", title: "Open", arguments: [node.path] };
      return item;
    }
    const isLeaf = node.kind === "lesson" || node.kind === "planfile" || node.kind === "family";
    const item = new vscode.TreeItem(
      node.label,
      isLeaf ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed,
    );
    item.tooltip = node.path;
    if (node.kind === "chapter") {
      const n = openComments(node.path);
      item.description = [
        n.yours > 0 ? `${n.yours} your turn` : "",
        n.agents > 0 ? `${n.agents} agent's turn` : "",
      ]
        .filter(Boolean)
        .join(" · ");
    }
    if (node.kind === "planfile" && node.plan !== undefined) {
      const f = node.plan;
      item.description = stateWords(f);
      item.tooltip = [f.file, stateDetail(f)].filter(Boolean).join("\n\n");
      item.iconPath = new vscode.ThemeIcon(
        f.status === "missing"
          ? "circle-outline"
          : f.problems.length > 0 || f.recheck.length > 0 || f.status === "changed"
            ? "warning"
            : f.status === "approved"
              ? "pass-filled"
              : "circle-large-outline",
      );
      item.contextValue = `planfile-${f.status}${isApprovable(f) ? "-approvable" : ""}`;
      if (f.status !== "missing")
        item.command = {
          command: "vscode.open",
          title: "Open",
          arguments: [vscode.Uri.file(node.file)],
        };
      return item;
    }
    if (node.kind === "planning") {
      item.iconPath = new vscode.ThemeIcon("checklist");
      item.contextValue = "planning";
      return item;
    }
    if (node.kind === "questions") {
      item.iconPath = new vscode.ThemeIcon("question");
      item.contextValue = "questions";
      return item;
    }
    item.resourceUri = vscode.Uri.file(node.file);
    if (node.description !== undefined) item.description = node.description;
    if (node.toReview !== undefined) {
      item.description = "to self-review";
      item.tooltip = `${node.path}\n\nTo self-review before you see it: ${node.toReview}.`;
      item.iconPath = new vscode.ThemeIcon("warning");
    }
    item.command = {
      command: "chalk.preview",
      title: "Preview",
      arguments: [vscode.Uri.file(node.file)],
    };
    item.contextValue = node.kind;
    return item;
  }

  async getChildren(element?: Element): Promise<Element[]> {
    if (element !== undefined && isReview(element)) return this.reviews.getChildren(element);
    if (element?.kind === "reviews") return this.reviews.getChildren(undefined);
    if (element?.kind === "props" || element?.kind === "package") {
      const all = propsIn(join(root, "library", "catalogue.md"));
      // Props: a folder per package; a package: its props.
      if (element.kind === "package") return all.filter((p) => p.file === element.path);
      return [...new Set(all.map((p) => p.file))].map(
        (pkg): Node => ({
          label: pkg,
          path: pkg,
          kind: "package",
          file: "",
          description: ((n) => `${n} ${n === 1 ? "prop" : "props"}`)(
            all.filter((p) => p.file === pkg).length,
          ),
        }),
      );
    }
    const node = element;
    const build = join(root, "build");
    const authoring = join(root, "authoring", "books");
    type Ref = { path: string };
    const title = (json: { title?: { en?: string } } | null, fallback: string) =>
      json?.title?.en ?? fallback;
    if (node === undefined) {
      // Three sections: the threads, the books, the props.
      return [
        { label: "Reviews", path: "", kind: "reviews", file: "" },
        { label: "Content", path: "content", kind: "content", file: "" },
        { label: "Props", path: "library/props", kind: "props", file: "" },
      ];
    }
    if (node.kind === "content") {
      // Books built, and books being planned.
      const index = readJson<{ books: Ref[] }>(join(build, "index.json"));
      const books = [
        ...new Set([...(index?.books ?? []).map((r) => r.path), ...dirsIn(authoring)]),
      ];
      return [
        ...books.map(
          (slug): Node => ({
            label: title(readJson(join(build, `${slug}.json`)), slug),
            path: slug,
            kind: "book",
            file: join(root, "content", slug, "build.yaml"),
          }),
        ),
      ];
    }
    if (node.kind === "book") {
      const book = readJson<{ chapters: Ref[] }>(join(build, `${node.path}.json`));
      const chapters = [
        ...new Set([
          ...(book?.chapters ?? []).map((r) => r.path),
          ...dirsIn(join(authoring, node.path)).map((c) => `${node.path}/${c}`),
        ]),
      ];
      return chapters.map((slug, i) => ({
        label: `${i + 1}. ${title(readJson(join(build, `${slug}.json`)), slug.split("/").at(-1) ?? slug)}`,
        path: slug,
        kind: "chapter",
        file: join(root, "content", slug, "build.yaml"),
      }));
    }
    if (node.kind === "chapter") {
      const chapter = readJson<{ concepts: Ref[] }>(join(build, `${node.path}.json`));
      const planning: Node = {
        label: "Planning",
        path: node.path,
        kind: "planning",
        file: join(authoring, node.path),
      };
      // Which lessons wait on a self-review (a lesson changed since a reviewer last looked).
      const [book = "", name = ""] = node.path.split("/");
      const lessons = await readOne(base, book, name)
        .then((c) => c.lessons ?? [])
        .catch(() => []);
      // The chapter's question bank: a family per folder under questions/.
      const families = dirsIn(join(root, "content", node.path, "questions"));
      const questions: Node[] =
        families.length === 0
          ? []
          : [
              {
                label: "Questions",
                path: `${node.path}/questions`,
                kind: "questions",
                file: join(root, "content", node.path, "questions"),
                description: `${families.length} ${families.length === 1 ? "family" : "families"}`,
              },
            ];
      return [
        planning,
        ...(chapter?.concepts ?? []).map((ref): Node => {
          const slug = ref.path;
          const state = lessons.find((l) => slug.endsWith(`/${l.slug}`));
          return {
            label: title(readJson(join(build, `${ref.path}.json`)), slug),
            path: slug,
            kind: "lesson",
            file: join(root, "content", slug, "overview.ts"),
            ...(state?.isToSelfReview === true ? { toReview: state.why ?? "" } : {}),
          };
        }),
        ...questions,
      ];
    }
    if (node.kind === "questions") {
      // Each family: its questions in the preview, as many as its params give.
      return dirsIn(node.file).map((family): Node => {
        const built = readJson<{ questions?: unknown[] }>(
          join(build, `${node.path}/${family}.json`),
        );
        const n = built?.questions?.length;
        return {
          label: family,
          path: `${node.path}/${family}`,
          kind: "family",
          file: join(node.file, family, "family.ts"),
          ...(n === undefined ? {} : { description: `${n} ${n === 1 ? "question" : "questions"}` }),
        };
      });
    }
    if (node.kind === "planning") {
      if (!(await ensureServer())) return [];
      const [book = "", chapter = ""] = node.path.split("/");
      try {
        const c = await readOne(base, book, chapter);
        return c.files.map((f, i) => ({
          label: `${i + 1}. ${f.file.replace(/^source\//, "")}`,
          path: `${node.path}/${f.file}`,
          kind: "planfile",
          file: join(root, c.dir, f.file),
          plan: f,
        }));
      } catch (e) {
        log.appendLine(`Chalk: the planning files of ${node.path} couldn't be read: ${String(e)}`);
        return [];
      }
    }
    return [];
  }
}

const reviews = new ReviewsTree(() => base);
const tree = new ChalkTree(reviews);

/** The planning files' failing checks, as problems on their lines (planning.ts). */
const problems = vscode.languages.createDiagnosticCollection("chalk");
async function refreshProblems(): Promise<void> {
  try {
    showProblems(root, await readAll(base), problems);
  } catch {
    // The dev server isn't up yet: shown once it is.
  }
}

/**
 * The person approves a planning file (the tree's item, or the file open in the editor), or takes
 * the approval back.
 */
async function approveFile(node: Node | undefined, isApproved: boolean): Promise<void> {
  const file = node?.file ?? vscode.window.activeTextEditor?.document.uri.fsPath;
  const where = file === undefined ? undefined : planningFileOf(root, file);
  if (file === undefined || where === undefined) {
    void vscode.window.showInformationMessage(
      "Chalk: open a chapter's planning file, or pick one in the Chalk tree.",
    );
    return;
  }
  if (!(await ensureServer())) return;
  const c = await readOne(base, where.book, where.chapter);
  const f = c.files.find((x) => x.file === where.name);
  if (f === undefined) {
    void vscode.window.showInformationMessage(`Chalk: ${where.name} isn't a planning file.`);
    return;
  }
  if (
    await setApproval(base, { book: where.book, chapter: where.chapter, step: f.step }, isApproved)
  )
    void vscode.window.showInformationMessage(
      `Chalk: ${f.file} ${isApproved ? "approved" : "is a draft again"}.`,
    );
  tree.refresh();
  void refreshProblems();
}
/** Writes on a thread as you, then redraws what shows threads. Says why, if it was refused. */
async function writeThread(id: string, text: string, status?: string): Promise<boolean> {
  const done = await changeComments({ op: "write", id, text, ...(status ? { status } : {}) });
  if (!done.ok) void vscode.window.showErrorMessage(`Chalk: ${done.error}`);
  void reviews.refresh();
  void tellReview();
  return done.ok;
}

/** The Reviews view's commands: open, reply, close, withdraw a thread; copy or close a review. */
function reviewCommands(fileComments: FileComments): vscode.Disposable[] {
  const thread = ReviewsTree.threadOf;
  return [
    vscode.commands.registerCommand("chalk.thread.open", async (item: unknown) => {
      const t = thread(item);
      if (t === undefined) return;
      // A thread on a planning file: the file, at its words.
      if (t.board === undefined && t.source?.startsWith("authoring/books/"))
        return fileComments.reveal(t);
      // The thread on its review's page (or your sitting's), opened at it.
      await showQuery(`review=${ReviewsTree.reviewIdOf(item) ?? "sitting"}&thread=${t.id}`);
    }),
    vscode.commands.registerCommand("chalk.thread.board", async (item: unknown) => {
      const t = thread(item);
      if (t?.board !== undefined) await showQuery(`at=content/${t.board}`, t.source);
    }),
    vscode.commands.registerCommand("chalk.review.open", async (item: unknown) => {
      await showQuery(`review=${ReviewsTree.pageOf(item)}`);
    }),
    vscode.commands.registerCommand("chalk.thread.source", (item: unknown) =>
      openSite(thread(item)?.source),
    ),
    vscode.commands.registerCommand("chalk.thread.reply", async (item: unknown) => {
      const t = thread(item);
      if (t === undefined) return;
      const text = await vscode.window.showInputBox({
        title: `Reply on ${t.board ?? t.source ?? t.id}`,
        prompt: t.text.slice(0, 140),
        placeHolder:
          t.status === "ready" || t.status === "planned"
            ? "What's still wrong? (sends it back to the agent)"
            : "Add to this thread",
        ignoreFocusOut: true,
      });
      if (text?.trim()) await writeThread(t.id, text.trim());
    }),
    vscode.commands.registerCommand("chalk.thread.close", async (item: unknown) => {
      const t = thread(item);
      if (t !== undefined) await writeThread(t.id, "", "closed");
    }),
    vscode.commands.registerCommand("chalk.thread.withdraw", async (item: unknown) => {
      const t = thread(item);
      if (t !== undefined) await writeThread(t.id, "", "withdrawn");
    }),
    vscode.commands.registerCommand("chalk.review.copy", async (item: unknown) => {
      const r = ReviewsTree.reviewOf(item);
      if (r === undefined) return;
      const n = r.review.threads.length;
      await vscode.env.clipboard.writeText(
        `apply review ${r.review.id} (${n} thread${n === 1 ? "" : "s"})`,
      );
      void vscode.window.showInformationMessage("Chalk: copied. Paste it into the agent's chat.");
    }),
    vscode.commands.registerCommand("chalk.review.closeReady", async (item: unknown) => {
      const r = ReviewsTree.reviewOf(item);
      if (r === undefined) return;
      const ready = r.threads.filter((t) => t.status === "ready");
      let closed = 0;
      for (const t of ready) if (await writeThread(t.id, "", "closed")) closed++;
      void vscode.window.showInformationMessage(
        `Chalk: closed ${closed} of ${ready.length} ready thread${ready.length === 1 ? "" : "s"} in ${r.review.id}.`,
      );
    }),
    vscode.commands.registerCommand("chalk.review.activity", async (item: unknown) => {
      const r = ReviewsTree.reviewOf(item);
      await showQuery(r === undefined ? "activity" : `activity&review=${r.review.id}`);
    }),
  ];
}

/** The Chalk tree, with a note in it when the dev server isn't answering. */
function chalkView(): vscode.Disposable {
  const view = vscode.window.createTreeView("chalk.tree", { treeDataProvider: tree });
  const note = reviews.onDidChangeTreeData(() => {
    view.message = reviews.message;
  });
  // Read once the dev server is up (the preview or the agent starts it).
  void ensureServer().then(() => reviews.refresh());
  return vscode.Disposable.from(view, note);
}

export function activate(context: vscode.ExtensionContext): void {
  const folder = vscode.workspace.workspaceFolders?.find((f) =>
    existsSync(join(f.uri.fsPath, "content", "build.yaml")),
  );
  if (folder === undefined) return;
  root = folder.uri.fsPath;
  base = vscode.workspace.getConfiguration("chalk").get<string>("previewUrl") ?? base;
  log = vscode.window.createOutputChannel("Chalk");
  // Agents in this window (Cursor's, Claude Code's) connect to the chalk MCP service.

  let timer: NodeJS.Timeout | undefined;
  // Threads on planning files, in the files themselves.
  const fileComments = new FileComments(root, changeComments, () => {
    void reviews.refresh();
    void tellReview();
  });
  context.subscriptions.push(
    log,
    vscode.commands.registerCommand("chalk.preview", (uri?: vscode.Uri) => showPreview(uri)),
    vscode.commands.registerCommand("chalk.pick", async () => {
      await showPreview();
      void panel?.webview.postMessage({ type: "pick" });
    }),
    // A prop: its own page in the preview, the same page as `?dev&at=library/props/…`.
    vscode.commands.registerCommand("chalk.prop.open", (address: string) =>
      showQuery(`at=${address}`),
    ),
    vscode.commands.registerCommand("chalk.refresh", () => {
      tree.refresh();
      void reviews.refresh();
      void refreshProblems();
    }),
    vscode.commands.registerCommand("chalk.planning.approve", (node?: Node) =>
      approveFile(node, true),
    ),
    vscode.commands.registerCommand("chalk.planning.takeBack", (node?: Node) =>
      approveFile(node, false),
    ),
    fileComments,
    vscode.commands.registerCommand("chalk.fileComment.reply", (r: vscode.CommentReply) =>
      fileComments.reply(r),
    ),
    vscode.commands.registerCommand("chalk.fileComment.close", (t: vscode.CommentThread) =>
      fileComments.close(t),
    ),
    reviews.onDidChangeTreeData(() => void fileComments.show(reviews.allThreads)),
    vscode.commands.registerCommand("chalk.addSource", async () => {
      await addSource(root);
      tree.refresh();
    }),
    problems,
    vscode.commands.registerCommand("chalk.copyReview", () => copyReview()),
    chalkView(),
    ...reviewCommands(fileComments),
    // The preview follows the file you're in, and the line your cursor is on.
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (panel === undefined || editor === undefined) return;
      const query = queryFor(editor.document.uri.fsPath);
      if (query !== null && query !== shown) void showPreview(editor.document.uri);
    }),
    vscode.window.onDidChangeTextEditorSelection(() => {
      clearTimeout(timer);
      timer = setTimeout(revealCursor, 200);
    }),
  );
  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(
      folder,
      "{build/index.json,library/catalogue.md,authoring/books/**,authoring/props/*/comments.yaml,authoring/reviews/*.yaml}",
    ),
  );
  // A thread or a review changed (a reply in the preview, an agent's answer): the tree's counts
  // and the panel's "Copy for agent (n)" follow.
  const refresh = () => {
    tree.refresh();
    void tellReview();
    void reviews.refresh();
    void refreshProblems();
  };
  void ensureServer().then(() => refreshProblems());
  watcher.onDidChange(refresh);
  watcher.onDidCreate(refresh);
  watcher.onDidDelete(refresh);
  context.subscriptions.push(watcher);
}

/** Nothing to stop: the studio service and the dev server outlive the editor (start.mjs). */
export function deactivate(): void {}

/** Before new code takes over (loader.ts): the preview panel isn't a subscription, so close it. */
export function unload(): void {
  panel?.dispose();
  panel = undefined;
}
