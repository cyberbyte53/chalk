import { type ChildProcess, execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import * as vscode from "vscode";

/**
 * Chalk in the editor (Cursor, VS Code): content seen as boards beside its code.
 *
 * - A preview panel shows whatever the open file or folder is, as the student sees it: a book's
 *   screen, a chapter's path, a lesson's boards, a question family's questions. It is the learner
 *   app's own `?dev&board=` page in a frame: the app's player draws everything; this draws nothing.
 * - The panel follows the editor: move the cursor in overview.ts and the piece written there is
 *   outlined; click a piece (Alt-click, or after "Pick") and the editor goes to its line.
 * - Pick a piece, then ask the agent about it (it goes to the chat with its board, line and words)
 *   or leave a comment (a file in the chapter's .comments/ folder; a prop's, for a pick on a prop).
 * - The Chalk tree (in the explorer): book → chapter → lesson, with open comments counted.
 *
 * It uses a dev server already running on :5173, or starts the learner app's (and the content
 * rebuild on save) itself.
 */

const PORT = 5173;
let root = "";
let base = `http://localhost:${PORT}/`;
let started: ChildProcess[] = [];
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

function startProcess(cmd: string, args: string[], cwd: string): ChildProcess {
  const child = spawn(cmd, args, { cwd, env: { ...process.env, FORCE_COLOR: "0" } });
  child.stdout?.on("data", (d) => log.append(String(d)));
  child.stderr?.on("data", (d) => log.append(String(d)));
  child.on("exit", (code) => log.appendLine(`[${cmd}] exited ${code}`));
  started.push(child);
  return child;
}

let serving: Promise<boolean> | undefined;
/** The dev server is up (ours or one already running), with content rebuilding on save. */
function ensureServer(): Promise<boolean> {
  serving ??= (async () => {
    if (await isUp(base)) return true;
    log.appendLine("Starting the learner app's dev server and the content rebuild…");
    const studio = join(root, "platform", "studio");
    startProcess(
      join(studio, "node_modules", ".bin", "tsx"),
      ["--tsconfig", "../../tsconfig.base.json", "src/content/cli.ts", "preview"],
      studio,
    );
    const app = join(root, "platform", "apps", "learner");
    startProcess(join(app, "node_modules", ".bin", "vite"), ["--port", String(PORT)], app);
    for (let i = 0; i < 90; i++) {
      if (await isUp(base)) return true;
      await new Promise((r) => setTimeout(r, 1000));
    }
    log.show(true);
    return false;
  })();
  return serving;
}

/** What the preview should show for a file or folder in content/ (a `?dev&…` query), or null. */
function queryFor(file: string): string | null {
  const path = rel(file);
  if (!path.startsWith("content/")) return null;
  const parts = path.slice("content/".length).split("/").filter(Boolean);
  let isDir = false;
  try {
    isDir = statSync(file).isDirectory();
  } catch {}
  const folders = isDir ? parts : parts.slice(0, -1);
  const [book, chapter, third, family] = folders;
  if (book === undefined || book === "taste" || book === "sources") return "board=";
  if (chapter === undefined) return `board=${book}`;
  if (third === undefined) return `board=${book}/${chapter}`;
  if (third === "questions")
    return family === undefined
      ? `board=${book}/${chapter}`
      : `source=content/${book}/${chapter}/questions/${family}`;
  if (third === ".comments" && !isDir) {
    const on = /^on:\s*"?([^"\n]+)"?$/m.exec(readFileSync(file, "utf8"))?.[1]?.trim();
    return on ? `board=${on}` : `board=${book}/${chapter}`;
  }
  if (third === "runs" || third === "source") return `board=${book}/${chapter}`;
  return `board=${book}/${chapter}/${third}&show=questions`;
}

function html(webview: vscode.Webview, query: string): string {
  const nonce = Math.random().toString(36).slice(2);
  const src = `${base}?dev&${query}`;
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src http://localhost:* http://127.0.0.1:*; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>
  html, body { height: 100%; margin: 0; padding: 0; background: var(--vscode-editor-background); color: var(--vscode-foreground); font: 12px var(--vscode-font-family); }
  body { display: flex; flex-direction: column; }
  .bar { display: flex; gap: 6px; align-items: center; padding: 6px 8px; border-bottom: 1px solid var(--vscode-panel-border); }
  .bar .where { flex: 1; opacity: .7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  button { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: 0; padding: 3px 8px; border-radius: 3px; cursor: pointer; font: inherit; }
  button.on { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
  iframe { flex: 1; border: 0; width: 100%; background: #fff; }
</style></head><body>
<div class="bar">
  <span class="where" id="where"></span>
  <button id="select" title="Pick a piece to comment on (key: c)">Pick</button>
  <button id="copy" class="on" style="display:none" title="Copy one line for the agent: apply this review (key: a)">Copy for agent</button>
  <button id="play" title="Play as a student first sees it (hidden pieces stay hidden)">Play</button>
  <button id="hindi" title="Hindi">हि</button>
  <button id="out" title="Open in Cursor\'s browser (design mode: ⌘⇧D, click a piece, ⌘L adds it to the chat)">↗</button>
</div>
<iframe id="frame" src="${src}"></iframe>
<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();
  const frame = document.getElementById("frame");
  const state = { query: ${JSON.stringify(query)}, play: false, hindi: false, picked: null };
  const urlOf = () => ${JSON.stringify(base)} + "?dev&" + state.query + (state.play ? "&play" : "") + (state.hindi ? "&locale=hi" : "");
  const where = document.getElementById("where");
  where.textContent = state.query.replace(/^(board|source)=/, "") || "all books";
  const toFrame = (m) => frame.contentWindow && frame.contentWindow.postMessage({ ...m, chalk: true }, "*");
  const reload = () => { frame.src = urlOf(); };
  document.getElementById("play").onclick = (e) => { state.play = !state.play; e.target.classList.toggle("on", state.play); reload(); };
  document.getElementById("hindi").onclick = (e) => { state.hindi = !state.hindi; e.target.classList.toggle("on", state.hindi); reload(); };
  document.getElementById("out").onclick = () => vscode.postMessage({ type: "external", url: urlOf() });
  const select = document.getElementById("select");
  const setSelecting = (on) => { select.classList.toggle("on", on); toFrame({ type: "select", on }); };
  select.onclick = () => setSelecting(!select.classList.contains("on"));
  const copy = document.getElementById("copy");
  copy.onclick = () => vscode.postMessage({ type: "copy" });
  // The same keys as inside the preview, when the panel's bar has focus.
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "a") vscode.postMessage({ type: "copy" });
    if (e.key === "c") setSelecting(!select.classList.contains("on"));
  });
  window.addEventListener("message", (e) => {
    const m = e.data || {};
    if (e.source === frame.contentWindow && m.chalk) {
      if (m.type === "selecting") { select.classList.toggle("on", !!m.on); return; }
      if (m.type === "toggle") { document.getElementById(m.what === "play" ? "play" : "hindi").click(); return; }
      if (m.type === "pick") select.classList.remove("on");
      if (m.follow !== undefined) { state.query = "board=" + m.follow; where.textContent = m.follow || "all books"; }
      vscode.postMessage(m);
      return;
    }
    // From the extension.
    if (m.type === "show") { state.query = m.query; where.textContent = m.query.replace(/^(board|source)=/, "") || "all books"; reload(); }
    else if (m.type === "pick") setSelecting(true);
    else if (m.type === "review") { copy.style.display = m.count > 0 ? "" : "none"; copy.textContent = "Copy for agent (" + m.count + ")"; }
    else toFrame(m);
  });
</script></body></html>`;
}

async function showPreview(target?: vscode.Uri): Promise<void> {
  const file = target?.fsPath ?? vscode.window.activeTextEditor?.document.uri.fsPath;
  const query = (file && queryFor(file)) ?? "board=";
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
    panel.webview.html = html(panel.webview, query);
    shown = query;
    isReady = false;
  } else if (query !== shown) {
    shown = query;
    isReady = false;
    void panel.webview.postMessage({ type: "show", query });
  }
  panel.reveal(vscode.ViewColumn.Beside, true);
}

async function openSite(site: string | undefined): Promise<void> {
  if (!site) return;
  const [file, line] = site.split(/:(?=\d+$)/);
  if (file === undefined) return;
  const doc = await vscode.workspace.openTextDocument(join(root, file));
  const at = new vscode.Position(Math.max(0, Number(line ?? 1) - 1), 0);
  const column =
    vscode.window.visibleTextEditors.find((e) => e.viewColumn !== panel?.viewColumn)?.viewColumn ??
    vscode.ViewColumn.One;
  const editor = await vscode.window.showTextDocument(doc, {
    viewColumn: column,
    preserveFocus: false,
  });
  editor.selection = new vscode.Selection(at, at);
  editor.revealRange(new vscode.Range(at, at), vscode.TextEditorRevealType.InCenter);
}

type Picked = {
  board?: string;
  piece?: string;
  /** The part of the prop picked (a slider, a stepper), when a part was. */
  part?: string;
  prop?: string;
  /** Set when the pick is a prop's (not the basics): the comment is filed with the prop. */
  propPackage?: string;
  site?: string;
  text?: string;
  note?: string;
};

// ---- Reviews: the comments made in one sitting, handed to an agent in one line ----

let state: vscode.Memento | undefined;
type Review = { id: string; files: string[] };
const REVIEW_KEY = "chalk.review";
const currentReview = (): Review | undefined => state?.get<Review>(REVIEW_KEY);

function git(...args: string[]): string {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function tellReview(): void {
  void panel?.webview.postMessage({ type: "review", count: currentReview()?.files.length ?? 0 });
}

/**
 * Writes content/reviews/<id>.md listing this sitting's comments, copies one line pointing at it,
 * and starts a new sitting. The agent reads the file (the apply-review skill), writes its plan
 * there, and works through the comments.
 */
async function copyReview(): Promise<void> {
  try {
    await writeReview();
  } catch (e) {
    void vscode.window.showErrorMessage(`Chalk: couldn't write the review: ${String(e)}`);
  }
}

/**
 * Where a comment of this sitting is now: where it was saved, or, if it moved (a board comment
 * made a prop comment), the file with its id in any comments folder; undefined if it is gone.
 */
function findComment(file: string): string | undefined {
  if (existsSync(join(root, file))) return file;
  const name = file.split("/").pop() ?? "";
  const folders = [
    ...readdirSync(join(root, "content"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .flatMap((book) =>
        readdirSync(join(root, "content", book.name), { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((chapter) => `content/${book.name}/${chapter.name}/.comments`),
      ),
    ...readdirSync(join(root, "library", "props"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => `library/props/${d.name}/.comments`),
  ];
  return folders.map((dir) => `${dir}/${name}`).find((f) => existsSync(join(root, f)));
}

async function writeReview(): Promise<void> {
  const saved = currentReview();
  const files = [
    ...new Set((saved?.files ?? []).map(findComment).filter((f): f is string => f !== undefined)),
  ];
  const review = saved === undefined ? undefined : { ...saved, files };
  if (review === undefined || review.files.length === 0) {
    void vscode.window.showInformationMessage(
      "Chalk: no new comments since the last copy. Pick a piece (c) to add one.",
    );
    return;
  }
  const lines = [
    "---",
    `id: ${review.id}`,
    "status: open",
    `createdAt: ${JSON.stringify(new Date().toISOString())}`,
    `commit: ${git("rev-parse", "HEAD") || "unknown"}`,
    "---",
    `# Review ${review.id}`,
    "",
    `${review.files.length} comment${review.files.length > 1 ? "s" : ""}, each a file with its board, piece, line and words:`,
    "",
    ...review.files.map((f) => {
      const text = readFileSync(join(root, f), "utf8");
      const on = /^on:\s*"?([^"\n]+)"?$/m.exec(text)?.[1] ?? "?";
      const body = text.split(/^---$/m)[2]?.trim().replace(/\s+/g, " ").slice(0, 120) ?? "";
      return `- [${f.split("/").pop()}](../../${f}) · \`${on}\` · ${body}`;
    }),
    "",
    "## Plan",
    "",
    "(The agent writes its plan here: chapter-wide changes first, then one line per board.)",
    "",
  ];
  const dir = join(root, "content", "reviews");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${review.id}.md`);
  writeFileSync(file, lines.join("\n"));
  // Short, and @path so editors that understand mentions attach the file; AGENTS.md says what to do.
  const line = `@${rel(file)} apply this review (${review.files.length} comment${review.files.length > 1 ? "s" : ""})`;
  await vscode.env.clipboard.writeText(line);
  await state?.update(REVIEW_KEY, undefined);
  tellReview();
  void vscode.window.showInformationMessage(
    `Chalk: copied. Paste it into the agent's chat (⌘V). ${rel(file)}`,
  );
}

/**
 * The comment box is the editor's own input (full keyboard: select all, copy, paste, undo).
 * Enter saves, Escape cancels.
 */
async function askForComment(p: Picked): Promise<void> {
  const what = p.propPackage
    ? `the ${p.prop} prop${p.part ? ` › ${p.part}` : ""} (everywhere it's used)`
    : p.piece
      ? `${p.piece}${p.part ? ` › ${p.part}` : ""}`
      : "the board";
  const where = `${what} · ${(p.site ?? p.board ?? "").replace(/^content\//, "")}`;
  const note = await vscode.window.showInputBox({
    title: `Comment on ${where}`,
    prompt: (p.text ?? "").slice(0, 140),
    placeHolder: "What's wrong, or what should change?",
    ignoreFocusOut: true,
  });
  if (note?.trim()) leaveComment({ ...p, note });
}

/**
 * A comment file in the chapter's .comments/ folder, or the prop's (library/props/<package>/.comments/)
 * when a prop or a part of one was picked (see platform/docs/comments.md).
 */
function leaveComment(p: Picked): void {
  const [book, chapter] = (p.board ?? "").split("/");
  if (!book || !chapter || !p.note?.trim()) {
    void vscode.window.showWarningMessage("Chalk: write the comment first.");
    return;
  }
  const id = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const now = new Date();
  const review =
    currentReview() ??
    ({
      id: now.toISOString().slice(0, 16).replace(/[-:]/g, "").replace("T", "-"),
      files: [],
    } as Review);
  const commit = git("rev-parse", "HEAD");
  const isDirty = git("status", "--porcelain", "--", "content", "library") !== "";
  const q = (s: string) => JSON.stringify(s);
  const lines = [
    "---",
    `id: ${id}`,
    "status: open",
    ...(p.propPackage && p.prop ? [`prop: ${q(p.prop)}`] : []),
    `on: ${q(p.board ?? "")}`,
    ...(p.piece ? [`piece: ${q(p.piece)}`] : []),
    ...(p.part ? [`part: ${q(p.part)}`] : []),
    ...(p.site ? [`source: ${q(p.site)}`] : []),
    `createdAt: ${q(now.toISOString())}`,
    `review: ${q(review.id)}`,
    ...(commit ? [`commit: ${commit}`] : []),
    ...(isDirty ? ["uncommitted: true"] : []),
    ...(p.text ? [`snapshot: ${q(p.text)}`] : []),
    "by: you",
    "---",
    p.note.trim(),
    "",
  ];
  // A prop's comment lives with the prop: it is about every board that places it.
  const dir = p.propPackage
    ? join(root, "library", "props", p.propPackage, ".comments")
    : join(root, "content", book, chapter, ".comments");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${id}.md`);
  writeFileSync(file, lines.join("\n"));
  void state?.update(REVIEW_KEY, { ...review, files: [...review.files, rel(file)] });
  setTimeout(tellReview, 0);
  void panel?.webview.postMessage({ type: "comments" });
  tree.refresh();
  if (isDirty)
    void vscode.window.showWarningMessage(
      "Chalk: comment saved, but content has uncommitted changes. Commit them so the comment points at fixed code.",
    );
}

/** A reply in the preview reopens a comment: it goes into this sitting's review again. */
function addToReview(file: string | undefined): void {
  if (file === undefined) return;
  const now = new Date();
  const review =
    currentReview() ??
    ({
      id: now.toISOString().slice(0, 16).replace(/[-:]/g, "").replace("T", "-"),
      files: [],
    } as Review);
  if (!review.files.includes(file))
    void state?.update(REVIEW_KEY, { ...review, files: [...review.files, file] });
  setTimeout(tellReview, 0);
  tree.refresh();
}

function onMessage(
  m: { type?: string; site?: string; url?: string; follow?: string; file?: string } & Picked,
): void {
  if (m.type === "ready") {
    isReady = true;
    revealCursor();
    tellReview();
  } else if (m.type === "open") void openSite(m.site);
  else if (m.type === "copy") void copyReview();
  else if (m.type === "pick") void askForComment(m);
  else if (m.type === "replied") addToReview(m.file);
  else if (m.type === "external" && m.url) void openInBrowser(m.url);
  // The preview went to another level by itself (a chapter or lesson was tapped).
  if (m.follow !== undefined) {
    shown =
      m.follow.split("/").length >= 3 ? `board=${m.follow}&show=questions` : `board=${m.follow}`;
  }
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

// ---- The tree: book → chapter → lesson ----

type Node = { label: string; path: string; kind: "book" | "chapter" | "lesson"; file: string };

const readJson = <T>(file: string): T | null => {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
};

function openComments(chapterDir: string): number {
  const dir = join(chapterDir, ".comments");
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter(
    (n) =>
      n.endsWith(".md") &&
      /^status:\s*(open|approved)\s*$/m.test(readFileSync(join(dir, n), "utf8")),
  ).length;
}

class ChalkTree implements vscode.TreeDataProvider<Node> {
  private readonly changed = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.changed.event;
  refresh(): void {
    this.changed.fire();
  }

  getTreeItem(node: Node): vscode.TreeItem {
    const item = new vscode.TreeItem(
      node.label,
      node.kind === "lesson"
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Collapsed,
    );
    item.resourceUri = vscode.Uri.file(node.file);
    item.tooltip = node.path;
    if (node.kind === "chapter") {
      const n = openComments(join(root, "content", node.path));
      if (n > 0) item.description = `${n} open`;
    }
    item.command = {
      command: "chalk.preview",
      title: "Preview",
      arguments: [vscode.Uri.file(node.file)],
    };
    item.contextValue = node.kind;
    return item;
  }

  getChildren(node?: Node): Node[] {
    const build = join(root, "build");
    type Ref = { path: string };
    const title = (json: { title?: { en?: string } } | null, fallback: string) =>
      json?.title?.en ?? fallback;
    if (node === undefined) {
      const index = readJson<{ books: Ref[] }>(join(build, "index.json"));
      return (index?.books ?? []).map((ref) => {
        const slug = dirname(ref.path);
        return {
          label: title(readJson(join(build, ref.path)), slug),
          path: slug,
          kind: "book",
          file: join(root, "content", slug, "build.yaml"),
        };
      });
    }
    if (node.kind === "book") {
      const book = readJson<{ chapters: Ref[] }>(join(build, node.path, "book.json"));
      return (book?.chapters ?? []).map((ref, i) => {
        const slug = dirname(ref.path);
        return {
          label: `${i + 1}. ${title(readJson(join(build, ref.path)), slug)}`,
          path: slug,
          kind: "chapter",
          file: join(
            root,
            "content",
            slug,
            existsSync(join(root, "content", slug, "plan.md")) ? "plan.md" : "build.yaml",
          ),
        };
      });
    }
    if (node.kind === "chapter") {
      const chapter = readJson<{ concepts: Ref[] }>(join(build, node.path, "chapter.json"));
      return (chapter?.concepts ?? []).map((ref) => {
        const slug = dirname(ref.path);
        return {
          label: title(readJson(join(build, ref.path)), slug),
          path: slug,
          kind: "lesson",
          file: join(root, "content", slug, "overview.ts"),
        };
      });
    }
    return [];
  }
}

const tree = new ChalkTree();

export function activate(context: vscode.ExtensionContext): void {
  const folder = vscode.workspace.workspaceFolders?.find((f) =>
    existsSync(join(f.uri.fsPath, "content", "build.yaml")),
  );
  if (folder === undefined) return;
  root = folder.uri.fsPath;
  base = vscode.workspace.getConfiguration("chalk").get<string>("previewUrl") ?? base;
  log = vscode.window.createOutputChannel("Chalk");
  state = context.workspaceState;

  let timer: NodeJS.Timeout | undefined;
  context.subscriptions.push(
    log,
    vscode.commands.registerCommand("chalk.preview", (uri?: vscode.Uri) => showPreview(uri)),
    vscode.commands.registerCommand("chalk.pick", async () => {
      await showPreview();
      void panel?.webview.postMessage({ type: "pick" });
    }),
    vscode.commands.registerCommand("chalk.refresh", () => tree.refresh()),
    vscode.commands.registerCommand("chalk.copyReview", () => copyReview()),
    vscode.window.registerTreeDataProvider("chalk.tree", tree),
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
      "{build/index.json,content/*/*/.comments/*.md,library/props/*/.comments/*.md}",
    ),
  );
  watcher.onDidChange(() => tree.refresh());
  watcher.onDidCreate(() => tree.refresh());
  watcher.onDidDelete(() => tree.refresh());
  context.subscriptions.push(watcher);
}

export function deactivate(): void {
  for (const child of started) child.kill();
  started = [];
}
