import { type ChildProcess, execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import * as vscode from "vscode";
import { ReviewsTree } from "./reviews";

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
 * - The Chalk tree (in the explorer): book → chapter → lesson, with open comments counted.
 *
 * It uses a dev server already running on :5173, or starts the learner app's (and the content
 * rebuild on save) itself.
 */

/** The one dev server (it runs the content rebuild too); see platform/apps/learner/vite.config.ts. */
const PORT = Number(process.env.CHALK_DEV_PORT ?? 5173);
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

/** The chalk MCP service agents connect to (platform/studio/src/mcp/main.ts). */
const MCP_HEALTH = "http://127.0.0.1:5174/health";

/** Starts the chalk MCP service for this repo's agents, unless one is already running. */
async function ensureMcp(): Promise<void> {
  try {
    if ((await fetch(MCP_HEALTH, { signal: AbortSignal.timeout(1200) })).ok) return;
  } catch {}
  log.appendLine("Starting the chalk MCP service for agents (127.0.0.1:5174/mcp)…");
  const studio = join(root, "platform", "studio");
  startProcess(
    join(studio, "node_modules", ".bin", "tsx"),
    ["watch", "--clear-screen=false", "--tsconfig", "../../tsconfig.base.json", "src/mcp/main.ts"],
    studio,
  );
}

let starting: Promise<boolean> | undefined;
/**
 * The one dev server is up: the one already running (started by the chalk MCP tools, `pnpm dev`,
 * or another window), else one started here. It runs the content rebuild itself.
 */
async function ensureServer(): Promise<boolean> {
  if (await isUp(base)) return true;
  starting ??= (async () => {
    log.appendLine("Starting the dev server (it rebuilds content on save)…");
    const app = join(root, "platform", "apps", "learner");
    startProcess(join(app, "node_modules", ".bin", "vite"), [], app);
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
  <button id="play" title="Play it as the app does: one board at a time, Continue, practice, results (key: p)">Play</button>
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
  where.textContent = state.query.replace(/^(board|source|review)=/, "") || "all books";
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
      if (m.follow !== undefined) { state.query = "at=content/" + m.follow; where.textContent = m.follow || "all books"; }
      vscode.postMessage(m);
      return;
    }
    // From the extension.
    if (m.type === "show") { state.query = m.query; where.textContent = m.query.replace(/^(at=content\/|source=|review=)/, "") || "all books"; reload(); }
    else if (m.type === "pick") setSelecting(true);
    else if (m.type === "review") { copy.style.display = m.count > 0 ? "" : "none"; copy.textContent = "Copy for agent (" + m.count + ")"; }
    else toFrame(m);
  });
</script></body></html>`;
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
    panel.webview.html = html(panel.webview, query);
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
  m: { type?: string; site?: string; url?: string; follow?: string; file?: string } & Picked,
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
  // The preview went to another level by itself (a chapter or lesson was tapped).
  if (m.follow !== undefined) {
    shown =
      m.follow.split("/").length >= 3
        ? `at=content/${m.follow}&show=questions`
        : `at=content/${m.follow}`;
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

/** Comments on a chapter still waiting on the agent (open or planned), from its comments file. */
function openComments(chapter: string): number {
  const file = join(root, "authoring", "books", chapter, "comments.yaml");
  if (!existsSync(file)) return 0;
  return (readFileSync(file, "utf8").match(/^ {2}status: (open|planned)$/gm) ?? []).length;
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
      const n = openComments(node.path);
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
        const slug = ref.path;
        return {
          label: title(readJson(join(build, `${ref.path}.json`)), slug),
          path: slug,
          kind: "book",
          file: join(root, "content", slug, "build.yaml"),
        };
      });
    }
    if (node.kind === "book") {
      const book = readJson<{ chapters: Ref[] }>(join(build, `${node.path}.json`));
      return (book?.chapters ?? []).map((ref, i) => {
        const slug = ref.path;
        return {
          label: `${i + 1}. ${title(readJson(join(build, `${ref.path}.json`)), slug)}`,
          path: slug,
          kind: "chapter",
          file: existsSync(join(root, "authoring", "books", slug, "plan.md"))
            ? join(root, "authoring", "books", slug, "plan.md")
            : join(root, "content", slug, "build.yaml"),
        };
      });
    }
    if (node.kind === "chapter") {
      const chapter = readJson<{ concepts: Ref[] }>(join(build, `${node.path}.json`));
      return (chapter?.concepts ?? []).map((ref) => {
        const slug = ref.path;
        return {
          label: title(readJson(join(build, `${ref.path}.json`)), slug),
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
const reviews = new ReviewsTree(() => base);

/** Writes on a thread as you, then redraws what shows threads. Says why, if it was refused. */
async function writeThread(id: string, text: string, status?: string): Promise<boolean> {
  const done = await changeComments({ op: "write", id, text, ...(status ? { status } : {}) });
  if (!done.ok) void vscode.window.showErrorMessage(`Chalk: ${done.error}`);
  void reviews.refresh();
  void tellReview();
  return done.ok;
}

/** The Reviews view's commands: open, reply, close, withdraw a thread; copy or close a review. */
function reviewCommands(): vscode.Disposable[] {
  const thread = ReviewsTree.threadOf;
  return [
    vscode.commands.registerCommand("chalk.reviews.refresh", () => reviews.refresh()),
    vscode.commands.registerCommand("chalk.thread.open", async (item: unknown) => {
      const t = thread(item);
      if (t === undefined) return;
      // The thread on its review's page (or your sitting's), opened at it.
      await showQuery(`review=${ReviewsTree.reviewIdOf(item) ?? "sitting"}&thread=${t.id}`);
    }),
    vscode.commands.registerCommand("chalk.thread.board", async (item: unknown) => {
      const t = thread(item);
      if (t?.board !== undefined) await showQuery(`at=content/${t.board}`, t.source);
    }),
    vscode.commands.registerCommand("chalk.review.open", async (item: unknown) => {
      const r = ReviewsTree.reviewOf(item);
      await showQuery(`review=${r?.review.id ?? "sitting"}`);
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

/** The Reviews view, with a note in it when the dev server isn't answering. */
function reviewsView(): vscode.Disposable {
  const view = vscode.window.createTreeView("chalk.reviews", { treeDataProvider: reviews });
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
  void ensureMcp();

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
    reviewsView(),
    ...reviewCommands(),
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
      "{build/index.json,authoring/books/*/*/comments.yaml,authoring/props/*/comments.yaml,authoring/reviews/*.yaml}",
    ),
  );
  // A thread or a review changed (a reply in the preview, an agent's answer): the tree's counts
  // and the panel's "Copy for agent (n)" follow.
  const refresh = () => {
    tree.refresh();
    void tellReview();
    void reviews.refresh();
  };
  watcher.onDidChange(refresh);
  watcher.onDidCreate(refresh);
  watcher.onDidDelete(refresh);
  context.subscriptions.push(watcher);
}

export function deactivate(): void {
  for (const child of started) child.kill();
  started = [];
}
