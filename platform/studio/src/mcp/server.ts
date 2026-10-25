import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { boardName, listBoards, readSources } from "../boards";
import { type Filed, Kind, Status, latestReview, unanswered } from "../comments";
import { isBuildCurrent } from "../content/inputs";
import { findUp } from "../pronunciations";
import { type NodeShape, nodeSchema } from "./model-schema";
import { closeBrowser, previewBase, previewUrl, shoot } from "./preview";
import { type Content, type Extra, createServer, progressOf, result, serveStdio } from "./protocol";

/**
 * `chalk` MCP server: what an agent in any harness (Cursor, VS Code, Claude Code, Codex…) needs to
 * work on Chalk content that a file editor doesn't give it: eyes and hands on the real board,
 * what a change reaches, and the comments (read and answered through the dev server, their one
 * writer, which enforces their lifecycle). Start: platform/studio/node_modules/.bin/tsx
 * platform/studio/src/mcp/server.ts (the repo's .cursor/mcp.json, .vscode/mcp.json and .mcp.json
 * do this). Every tool reads the repo as it is on disk; boards come from build/.
 */

// From this file, not the working directory: editors start MCP servers from anywhere.
const root = dirname(findUp("pnpm-workspace.yaml", dirname(fileURLToPath(import.meta.url))));
const text = (t: string): Content => ({ type: "text", text: t });
const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;

/**
 * Run a command in the repo; resolves with its output and exit code (never throws). Stopped when
 * `signal` aborts (the client cancelled); `onLine` sees each line as it comes.
 */
function run(
  cmd: string,
  args: string[],
  {
    cwd = root,
    signal,
    onLine,
  }: { cwd?: string; signal?: AbortSignal; onLine?: (line: string) => void } = {},
): Promise<{ code: number; out: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, env: process.env, signal });
    let out = "";
    let partial = "";
    const take = (d: Buffer) => {
      out += d;
      if (onLine === undefined) return;
      const lines = (partial + d).split("\n");
      partial = lines.pop() ?? "";
      for (const line of lines) onLine(line);
    };
    child.stdout.on("data", take);
    child.stderr.on("data", take);
    child.on("close", (code) => resolve({ code: code ?? 1, out }));
    child.on("error", (e) =>
      resolve({ code: 1, out: e.name === "AbortError" ? "cancelled" : e.message }),
    );
  });
}

const studio = join(root, "platform", "studio");
const tsx = join(studio, "node_modules", ".bin", "tsx");
/** The content build, recording what each chapter reads so unchanged chapters are reused. */
const buildContent = (signal?: AbortSignal) =>
  run(
    tsx,
    [
      "--tsconfig",
      "../../tsconfig.base.json",
      "--import",
      "./src/content/record-imports.ts",
      "src/content/cli.ts",
      "build",
    ],
    { cwd: studio, signal },
  );

// ---- Comments, through the dev server (their one writer) ----

/** One change to the comments, as an agent; the dev server says what it did or why not. */
async function changeComments(
  change: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string; comment?: Filed }> {
  const base = await previewBase(root);
  const res = await fetch(new URL("/dev-review", base), {
    method: "POST",
    headers: { "content-type": "application/json", "x-chalk-actor": "agent" },
    body: JSON.stringify(change),
  });
  return (await res.json()) as { ok: boolean; error?: string; comment?: Filed };
}

async function allComments(): Promise<Filed[]> {
  const base = await previewBase(root);
  return (await (await fetch(new URL("/dev-review", base))).json()) as Filed[];
}

function commentLine(c: Filed): string {
  const where = [c.board ?? `${c.home} (plan)`, c.target, c.prop ? `prop ${c.prop}` : undefined]
    .filter(Boolean)
    .join(" · ");
  return [
    `• ${c.id} [${c.status}]${c.kind === Kind.Comment ? "" : ` ${c.kind}`}${c.causedBy ? ` caused by ${c.causedBy}` : ""}${c.from ? ` (from ${c.from})` : ""} ${where}`,
    `  source: ${c.source ?? "?"}${c.review ? `   review: ${c.review}` : ""}`,
    `  ${c.by}: “${c.text.replace(/\s+/g, " ").slice(0, 400)}”`,
    ...(c.quote ? [`  quote: ${c.quote.slice(0, 200)}`] : []),
    ...(c.plan ? [`  plan: ${c.plan.text.replace(/\s+/g, " ").slice(0, 300)}`] : []),
    ...c.thread.map((e) => `  ${e.by}: ${e.text.replace(/\s+/g, " ").slice(0, 300)}`),
    ...(c.changed?.length ? [`  changed: ${c.changed.join(", ")}`] : []),
  ].join("\n");
}

/** Prop types in the prop packages these files are in, from library/catalogue.md. */
function propTypesIn(files: readonly string[]): Set<string> {
  const catalogue = join(root, "library", "catalogue.md");
  const out = new Set<string>();
  if (!existsSync(catalogue)) return out;
  const packages = new Set(
    files
      .map((f) => /^library\/props\/([^/]+)/.exec(f)?.[1])
      .filter((n): n is string => n !== undefined),
  );
  if (packages.size === 0) return out;
  let current: string | undefined;
  for (const line of readFileSync(catalogue, "utf8").split("\n")) {
    const section = /^## `([^`]+)`/.exec(line);
    if (section) current = section[1];
    const row = /^\| `([^`]+)`/.exec(line);
    if (row?.[1] && current && packages.has(current)) out.add(row[1]);
  }
  return out;
}

/** The package folder a prop type is defined in (library/props/<name>), from the catalogue. */
function packageOfType(type: string): string | undefined {
  const catalogue = join(root, "library", "catalogue.md");
  if (!existsSync(catalogue)) return undefined;
  let current: string | undefined;
  for (const line of readFileSync(catalogue, "utf8").split("\n")) {
    const section = /^## `([^`]+)`/.exec(line);
    if (section) current = section[1];
    if (current !== undefined && line.startsWith(`| \`${type}\``))
      return `library/props/${current}`;
  }
  return undefined;
}

/** Every built board piece of these prop types, with where it was written. */
function placesOf(
  types: ReadonlySet<string>,
): { board: string; piece: string; type: string; site?: string }[] {
  const sources = readSources(root);
  const out: { board: string; piece: string; type: string; site?: string }[] = [];
  for (const b of listBoards(root)) {
    const where = sources[`${b.board}.json`];
    for (const [piece, type] of Object.entries(where?.props ?? {}))
      if (types.has(type))
        out.push({
          board: b.board,
          piece,
          type,
          ...(where?.pieces[piece] !== undefined ? { site: where.pieces[piece] } : {}),
        });
  }
  return out;
}

/**
 * Which chapters a set of files feeds, from what each chapter's last build recorded reading (the
 * content build's cache: platform/studio/src/content/build.ts). Exact for chapters built since
 * their files last changed; a chapter never built yet is listed as unknown.
 */
function chaptersReading(files: readonly string[]): { chapter: string; because: string[] }[] {
  const dir = join(root, "node_modules", ".cache", "chalk-content");
  if (!existsSync(dir)) return [];
  const wanted = files.map((f) => join(root, f));
  const out: { chapter: string; because: string[] }[] = [];
  for (const name of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
    const chapter = name.replace(/\.json$/, "").replace(/__/g, "/");
    let deps: string[] = [];
    try {
      deps = (JSON.parse(readFileSync(join(dir, name), "utf8")) as { deps?: string[] }).deps ?? [];
    } catch {
      continue;
    }
    const inside = (f: string) => f.startsWith(`${join(root, "content", chapter)}/`);
    const because = wanted.filter(
      (w) => inside(w) || deps.some((d) => d === w || d.startsWith(`${w}/`)),
    );
    if (because.length > 0)
      out.push({ chapter, because: because.map((b) => b.slice(root.length + 1)) });
  }
  return out.sort((a, b) => a.chapter.localeCompare(b.chapter));
}

const server = createServer();

/** Files inside one prop package that `file` reaches by relative imports, it included. */
function closureIn(dir: string, file: string, seen = new Set<string>()): Set<string> {
  if (seen.has(file) || !existsSync(file)) return seen;
  seen.add(file);
  const code = readFileSync(file, "utf8");
  for (const m of code.matchAll(/(?:from|import)\s*["'](\.{1,2}\/[^"']+)["']/g)) {
    const spec = resolve(dirname(file), m[1] ?? "");
    const next = [spec, `${spec}.ts`, `${spec}.tsx`, join(spec, "index.ts")].find(
      (f) => existsSync(f) && statSync(f).isFile() && f.startsWith(dir),
    );
    if (next !== undefined) closureIn(dir, next, seen);
  }
  return seen;
}

/** The prop types a file in a prop package reaches: those whose definition or view imports it. */
function propsReaching(file: string): Set<string> {
  const pkg = /^library\/props\/([^/]+)/.exec(file)?.[1];
  if (pkg === undefined) return new Set();
  const src = join(root, "library", "props", pkg, "src");
  const whole = join(root, file);
  if (!existsSync(whole) || statSync(whole).isDirectory() || file === `library/props/${pkg}`)
    return propTypesIn([file]);
  const out = new Set<string>();
  for (const name of readdirSync(src).filter((n) => /\.tsx?$/.test(n) && !n.includes(".test."))) {
    const def = join(src, name);
    const type = /\btype:\s*"([A-Za-z0-9]+)"/.exec(readFileSync(def, "utf8"))?.[1];
    if (type === undefined || !propTypesIn([file]).has(type)) continue;
    const view = def.replace(/\.tsx?$/, "-view.tsx");
    const reach = new Set([...closureIn(src, def), ...closureIn(src, view)]);
    if (reach.has(whole)) out.add(type);
  }
  return out;
}

/**
 * Where each of a prop's actions is written (file:line), from its package's source: the line that
 * keys it (`[NumberLineAction.ZoomIn]: on…(`, or `zoomIn: act(`), among the files its definition
 * reaches. An action written in more than one of them is left out: exact, or nothing.
 */
const actionSitesCache = new Map<string, Map<string, string>>();
function actionSites(type: string): Map<string, string> {
  const cached = actionSitesCache.get(type);
  if (cached !== undefined) return cached;
  const out = new Map<string, string>();
  actionSitesCache.set(type, out);
  const pkg = packageOfType(type);
  if (pkg === undefined) return out;
  const src = join(root, pkg, "src");
  if (!existsSync(src)) return out;
  const files = readdirSync(src)
    .filter((n) => /\.tsx?$/.test(n) && !n.includes(".test."))
    .map((n) => join(src, n));
  const defFile = files.find((f) =>
    new RegExp(`\\btype:\\s*"${type}"`).test(readFileSync(f, "utf8")),
  );
  if (defFile === undefined) return out;
  const reach = closureIn(src, defFile);
  // Name maps (`export const XAction = { ZoomIn: "zoomIn" }`) in the package, to read keys.
  const names = new Map<string, string>();
  for (const f of files)
    for (const m of readFileSync(f, "utf8").matchAll(/export const (\w+) = \{([^}]*)\}/g))
      for (const e of (m[2] ?? "").matchAll(/(\w+):\s*"([^"]+)"/g))
        names.set(`${m[1]}.${e[1]}`, e[2] ?? "");
  const found = new Map<string, string[]>();
  for (const f of reach) {
    readFileSync(f, "utf8")
      .split("\n")
      .forEach((line, i) => {
        const m = /^\s*(?:\[(\w+\.\w+)\]|(\w+)):\s*(?:act|on\w*)\(\{?\s*$/.exec(line);
        const action = m === null ? undefined : m[1] !== undefined ? names.get(m[1]) : m[2];
        if (action !== undefined)
          found.set(action, [...(found.get(action) ?? []), `${relative(root, f)}:${i + 1}`]);
      });
  }
  for (const [action, sites] of found) if (sites.length === 1) out.set(action, sites[0] as string);
  return out;
}

type Place = { board: string; piece: string; type: string; site?: string };

/** A board's lesson: "value-and-zeroes", or "questions/count-zeroes" for a question family. */
const lessonOf = (board: string) => {
  const [, , third, fourth] = board.split("/");
  return third === "questions" ? `questions/${fourth}` : (third ?? "?");
};

/** A tree of places: chapters, then lessons, then boards; opened as far as asked (or fully if small). */
function tree(places: readonly Place[], open: string | undefined): string[] {
  const out: string[] = [];
  const isSmall = places.length <= 30;
  const chapters = new Map<string, Place[]>();
  for (const p of places) {
    const chapter = p.board.split("/").slice(0, 2).join("/");
    chapters.set(chapter, [...(chapters.get(chapter) ?? []), p]);
  }
  for (const [chapter, inChapter] of chapters) {
    const lessons = new Map<string, Place[]>();
    for (const p of inChapter)
      lessons.set(lessonOf(p.board), [...(lessons.get(lessonOf(p.board)) ?? []), p]);
    out.push(
      `└─ ${chapter} — ${inChapter.length} board${inChapter.length === 1 ? "" : "s"}, ${lessons.size} lesson${lessons.size === 1 ? "" : "s"}`,
    );
    const isChapterOpen = isSmall || open === chapter || open?.startsWith(`${chapter}/`);
    if (!isChapterOpen) continue;
    for (const [lesson, inLesson] of lessons) {
      out.push(`   ├─ ${lesson} — ${inLesson.length} board${inLesson.length === 1 ? "" : "s"}`);
      if (!(isSmall || open === `${chapter}/${lesson}`)) continue;
      for (const p of inLesson)
        out.push(
          `   │   • ${p.board.slice(chapter.length + 1)} · ${p.piece} (${p.type}) → ${p.site ?? "?"}`,
        );
    }
  }
  if (!isSmall && open === undefined)
    out.push(
      `(${places.length} boards: open one branch with open: "<book/chapter>" or "<book/chapter/lesson>")`,
    );
  return out;
}

server.registerTool(
  "affected",
  {
    title: "What a change reaches",
    description:
      'What a change to shared code reaches, before you make it, as a tree you can open branch by branch. Give prop types (`props`: ["valueMachine"]) or files and folders: a prop package or a file in one (its props are found from what imports it), a content file (the boards written in it), or other code (the chapters whose last build read it). Each prop\'s tree: chapters → lessons → boards (piece, file:line). Small trees come back fully open; otherwise `open` a chapter or lesson. Use it before changing a prop, a pattern or shared code, then render_board the boards it lists.',
    inputSchema: {
      props: z.array(z.string()).optional().describe("Prop types, e.g. valueMachine."),
      files: z.array(z.string()).optional().describe("Files or folders, repo-relative."),
      open: z
        .string()
        .optional()
        .describe(
          "A branch to open: book/chapter, or book/chapter/lesson (questions/<family> for questions).",
        ),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ props, files, open }) => {
    if ((props?.length ?? 0) === 0 && (files?.length ?? 0) === 0)
      throw new Error("say what is changing: props (types) or files");
    const out: string[] = [];
    const sources = readSources(root);
    const types = new Set(props ?? []);
    for (const file of files ?? []) {
      const f = file.replace(/\/$/, "");
      if (f.startsWith("library/props/")) for (const t of propsReaching(f)) types.add(t);
      else if (f.startsWith("content/")) {
        const boards = Object.entries(sources)
          .filter(([, w]) =>
            [w.board, ...Object.values(w.pieces)].some(
              (site) =>
                site !== undefined && (site.replace(/:\d+$/, "") === f || site.startsWith(`${f}/`)),
            ),
          )
          .map(([b]) => b.replace(/\.json$/, ""));
        out.push(
          `${f} — ${boards.length} board${boards.length === 1 ? "" : "s"} written here`,
          ...boards.slice(0, 60).map((b) => `   • ${b}`),
          "",
        );
      } else {
        const hits = chaptersReading([f]);
        out.push(
          hits.length >= 25
            ? `${f} — read by every chapter's build (${hits.length}): every board can change`
            : `${f} — read by ${hits.length} chapter${hits.length === 1 ? "" : "s"}: ${hits.map((h) => h.chapter).join(", ") || "none (as of each chapter's last build)"}`,
          "",
        );
      }
    }
    for (const type of types) {
      const places = placesOf(new Set([type]));
      const chapters = new Set(places.map((p) => p.board.split("/").slice(0, 2).join("/")));
      out.push(
        `${type} (${packageOfType(type) ?? "?"}) — ${places.length} board${places.length === 1 ? "" : "s"} in ${chapters.size} chapter${chapters.size === 1 ? "" : "s"}`,
      );
      out.push(...(places.length === 0 ? ["   (no board places it)"] : tree(places, open)), "");
    }
    return result([text(out.join("\n").trim())]);
  },
);

const step = z.union([
  z
    .object({
      tap: z
        .string()
        .describe('A piece, or a part of one, by address: "machine" or "machine/plane/handle".'),
      text: z
        .string()
        .optional()
        .describe('Inside it, the button or option whose words include this: "−6", "Check".'),
    })
    .strict(),
  z
    .object({
      drag: z.string().describe('A piece or part to drag, by address: "graph/point".'),
      by: z.tuple([z.number(), z.number()]).describe("How far, in pixels: [right, down]."),
    })
    .strict(),
  z.object({ wait: z.number().int().min(0).max(10000).describe("Milliseconds.") }).strict(),
]);

const renderOutput = {
  boards: z.array(
    z.object({
      board: z.string(),
      source: z.string().optional(),
      isPassed: z.boolean().optional(),
      openQuestion: z.string().optional(),
      nodes: z.array(nodeSchema),
      layoutProblems: z.array(z.string()),
      pageErrors: z.array(z.string()),
    }),
  ),
  steps: z.array(
    z.object({
      step: z.string(),
      passed: z.boolean(),
      events: z.array(z.string()),
      changed: z.record(z.object({ was: z.unknown(), now: z.unknown() })),
      errors: z.array(z.string()),
    }),
  ),
  openAt: z.string(),
};

/** A value in a line of text: short JSON, words in English only. */
const brief = (v: unknown) => {
  const english = (x: unknown): unknown =>
    Array.isArray(x)
      ? x.map(english)
      : x !== null && typeof x === "object"
        ? "en" in x && typeof (x as { en: unknown }).en === "string"
          ? (x as { en: string }).en
          : Object.fromEntries(Object.entries(x).map(([k, y]) => [k, english(y)]))
        : x;
  const t = JSON.stringify(english(v));
  return t === undefined ? "—" : t.length > 120 ? `${t.slice(0, 117)}…` : t;
};

/** The snapshot of one board, as readable lines (the structured result has all of it). */
function modelText(nodes: readonly NodeShape[], indent = ""): string[] {
  const out: string[] = [];
  for (const p of nodes) {
    out.push(
      `${indent}${p.path} (${p.prop})${p.source ? ` → ${p.source}` : ""}${p.isShown ? "" : " [hidden]"}`,
      `${indent}  ${p.summary}`,
    );
    const fields = (r: Record<string, unknown>) =>
      Object.entries(r)
        .map(([k, v]) => `${k} ${brief(v)}`)
        .join(" · ");
    if (Object.keys(p.setup).length > 0) out.push(`${indent}  setup: ${fields(p.setup)}`);
    if (Object.keys(p.live).length > 0) out.push(`${indent}  live: ${fields(p.live)}`);
    for (const [field, b] of Object.entries(p.bound))
      out.push(`${indent}  bound: ${field} ${brief(b.value)} ← ${b.from.join(", ") || "?"}`);
    // A prop without its own description lists its fields as parts: already shown above.
    const own = (path: string) => path.slice(p.path.length + 1);
    const isFieldsOnly = p.parts.every(
      (e) => own(e.path) in p.setup || own(e.path) in p.live || own(e.path) === "canCheck",
    );
    for (const e of isFieldsOnly ? [] : p.parts)
      out.push(
        `${indent}  • ${e.path}${e.value !== undefined ? ` = ${brief(e.value)}` : ""}${e.words !== undefined ? ` “${e.words}”` : ""}${e.does !== undefined ? ` → ${[e.does].flat().join(", ")}` : ""}${e.drawnAt ? `  (${e.drawnAt})` : ""}`,
      );
    for (const c of p.can)
      out.push(
        `${indent}  can: ${c.action} ${brief(c.takes)} (${c.who.join(", ")})${c.via.length > 0 ? ` via ${c.via.join(", ")}` : ""}${c.routed ? " [routed]" : ""}${c.codeAt ? `  (${c.codeAt})` : ""}`,
      );
    if (p.noControlNow?.length) out.push(`${indent}  no control now: ${p.noControlNow.join(", ")}`);
    if (p.hidden !== undefined) out.push(`${indent}  hidden: ${brief(p.hidden)}`);
    for (const problem of p.problems) out.push(`${indent}  ⚠ ${problem}`);
    if (p.children !== undefined) out.push(...modelText(p.children, `${indent}  `));
  }
  return out;
}

/** Adds where each action is written (file:line) to a node and its children. */
function withSites(node: NodeShape): NodeShape {
  const sites = actionSites(node.prop);
  return {
    ...node,
    parts: node.parts.map((e) => (Array.isArray(e.does) ? { ...e, does: [...e.does] } : e)),
    can: node.can.map((c) => (sites.has(c.action) ? { ...c, codeAt: sites.get(c.action) } : c)),
    ...(node.children !== undefined ? { children: node.children.map(withSites) } : {}),
  };
}

server.registerTool(
  "render_board",
  {
    title: "See (and use) boards",
    description:
      "See boards exactly as a phone draws them (the app's own player, 390px wide), and use them the way a student does. `board` is a board name (build path without .json, e.g. class10-maths/real-numbers/division-lemma/overview/story) or a lesson for all its pages. Returns a PNG per board and its snapshot (structured; the same one Jugnu and tests read): every node by address (a placed prop and, inside a group, its children) with where it's placed (file:line), setup (fixed where placed), live values (what can change here) and bound values (worked out from others, with where from), each part on screen with its typed value, the words the screen shows, what it does and where it's drawn (file:line), what can be done to it (who: learner or lesson, the controls that reach it, routed or not, with limits and the action's file:line), and problems (drawn but not described, or the reverse); plus layout problems found by measuring and page errors. With `steps` (one board): taps and drags on the real page, in order (targets are addresses: piece/element id, e.g. machine/plane/handle), starting from a fresh board (`continue: true` keeps the last call's board as it was left); after each, the live values that changed, the events the app raised, whether the board was passed, and a picture (`shots`: last, each or none). The app's own player decides what happens; nothing is simulated. Rebuilds content first if anything changed. Use it after every content or prop change, and before saying something looks or works right.",
    inputSchema: {
      board: z.string().min(1).describe("A board (build path without .json) or a lesson."),
      steps: z.array(step).max(40).optional().describe("What a finger does, in order."),
      shots: z
        .enum(["last", "each", "none"])
        .optional()
        .describe("With steps: a picture after the last step (default), after each, or none."),
      continue: z
        .boolean()
        .optional()
        .describe("With steps: go on from the board as the last call left it."),
      locale: z.enum(["en", "hi"]).optional(),
      play: z
        .boolean()
        .optional()
        .describe(
          "Hidden pieces stay hidden until earned, as a student meets them. Default: true with steps, false without.",
        ),
      questions: z.boolean().optional().describe("For a lesson: its questions too."),
      rebuild: z
        .boolean()
        .optional()
        .describe("Rebuild content first if it changed (default true)."),
    },
    outputSchema: renderOutput,
    // Rebuilding writes build/, which is generated: nothing the person wrote changes.
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async (args, extra: Extra) => {
    const progress = progressOf(extra);
    const board = boardName(args.board);
    const notes: string[] = [];
    // Skipped when build/ is already the last good build of exactly what is on disk.
    if (args.rebuild !== false && args.continue !== true && !isBuildCurrent(root)) {
      await progress("building content");
      const built = await buildContent(extra.signal);
      if (built.code !== 0)
        notes.push(
          `build-content failed:\n${built.out
            .split("\n")
            .filter((l) => l.includes("✗") || l.startsWith("    "))
            .join("\n")}`,
        );
    }
    const steps = args.steps ?? [];
    const options = {
      locale: args.locale ?? ("en" as const),
      play: args.play ?? steps.length > 0,
      questions: args.questions === true,
    };
    await progress(steps.length > 0 ? "acting" : "drawing");
    const drawn = await shoot(
      root,
      board,
      options,
      steps.length > 0
        ? { steps, shots: args.shots ?? "last", isContinued: args.continue === true }
        : undefined,
    );
    const sources = readSources(root);
    const out: Content[] = [];
    const image = (png: Buffer): Content => ({
      type: "image",
      data: png.toString("base64"),
      mimeType: "image/png",
    });
    const boards: z.infer<typeof renderOutput.boards> = [];
    for (const s of drawn.shots) {
      const where = sources[`${s.board}.json`];
      const nodes = (s.model?.nodes ?? []).map((p) => ({
        ...withSites(p),
        ...(where?.pieces[p.path] !== undefined ? { source: where.pieces[p.path] } : {}),
      }));
      boards.push({
        board: s.board,
        ...(where?.board !== undefined ? { source: where.board } : {}),
        ...(s.model !== undefined
          ? {
              isPassed: s.model.isPassed,
              ...(s.model.openQuestion !== undefined ? { openQuestion: s.model.openQuestion } : {}),
            }
          : {}),
        nodes,
        layoutProblems: s.overflow,
        pageErrors: s.errors,
      });
    }
    for (const [i, b] of boards.entries()) {
      if (i >= 10) break;
      out.push(
        text(
          [
            `## ${b.board}`,
            `board → ${b.source ?? "?"}`,
            ...(b.nodes.length > 0
              ? modelText(b.nodes)
              : ["(no board model: is the dev preview up to date?)"]),
            b.layoutProblems.length > 0
              ? `Layout problems:\n${b.layoutProblems.join("\n")}`
              : "Layout problems: none",
            ...(b.pageErrors.length > 0 ? [`Page errors:\n${b.pageErrors.join("\n")}`] : []),
          ].join("\n"),
        ),
      );
      const png = drawn.shots[i]?.png;
      if (png !== undefined && png.length > 0) out.push(image(png));
    }
    const stepsDone = drawn.steps.map((r) => ({
      step: r.step,
      passed: r.passed,
      events: r.events,
      changed: r.changed ?? {},
      errors: r.errors,
    }));
    for (const [i, r] of drawn.steps.entries()) {
      out.push(
        text(
          [
            `${i + 1}. ${r.step}${r.passed ? "  ✓ board passed" : ""}`,
            ...Object.entries(r.changed ?? {}).map(
              ([k, v]) => `   ${k}: ${brief(v.was)} → ${brief(v.now)}`,
            ),
            ...r.events.map((e) => `   event: ${e}`),
            ...(r.events.length === 0 &&
            Object.keys(r.changed ?? {}).length === 0 &&
            r.errors.length === 0
              ? ["   (nothing changed)"]
              : []),
            ...r.errors.map((e) => `   ${e}`),
          ].join("\n"),
        ),
      );
      if (r.png !== undefined) out.push(image(r.png));
    }
    if (drawn.shots.length > 10)
      notes.push(`${drawn.shots.length - 10} more boards not shown; render them one by one.`);
    const openAt = await previewUrl(root, board, options);
    notes.push(`Open it yourself: ${openAt}`);
    return {
      content: [...out, text(notes.join("\n"))],
      structuredContent: { boards, steps: stepsDone, openAt },
    };
  },
);

server.registerTool(
  "comments",
  {
    title: "Read comments",
    description:
      'Read comments: the person\'s (from the preview), reviewers\' findings and regressions, and chat feedback filed as comments. `review: "latest"` is the review the person just handed over ("apply my review"); or filter by board prefix, prop, status, kind. `unanswered: true` lists what still needs your answer (not yet ready, closed or withdrawn). Each shows its board, target (an address: piece/part), source line, plan, thread and changed files.',
    inputSchema: {
      review: z.string().optional().describe('"latest", or a review id.'),
      board: z.string().optional().describe("A board, lesson or chapter path prefix."),
      prop: z.string().optional(),
      status: z
        .enum([Status.Open, Status.Planned, Status.Ready, Status.Closed, Status.Withdrawn])
        .optional(),
      kind: z.enum([Kind.Comment, Kind.Finding, Kind.Regression]).optional(),
      unanswered: z.boolean().optional(),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async (args) => {
    let found = await allComments();
    const review = args.review === "latest" ? latestReview(found) : args.review;
    if (args.review !== undefined && review === undefined)
      return result([text("No review has been handed over yet.")]);
    if (review !== undefined) found = found.filter((c) => c.review === review);
    if (args.board) found = found.filter((c) => (c.board ?? c.home).startsWith(args.board ?? ""));
    if (args.prop) found = found.filter((c) => c.prop === args.prop);
    if (args.status) found = found.filter((c) => c.status === args.status);
    if (args.kind) found = found.filter((c) => c.kind === args.kind);
    if (args.unanswered) found = unanswered(found) as Filed[];
    const head =
      review !== undefined
        ? `Review ${review}: ${found.length} comment${found.length === 1 ? "" : "s"}\n\n`
        : "";
    return result([
      text(
        found.length === 0
          ? `${head}No comments match.`
          : head + found.map(commentLine).join("\n\n"),
      ),
    ]);
  },
);

/** One answer to one comment (comment_update). */
const answer = z.object({
  id: z.string(),
  op: z
    .enum(["plan", "reply", "ready"])
    .describe(
      "plan: what you will do (after the person's go); reply: add to the thread; ready: done, with what you did",
    ),
  text: z.string().min(1),
});

server.registerTool(
  "comment_update",
  {
    title: "Answer comments",
    description:
      "Answer comments, one or many at once. plan: write what you will do on it (after the person approved the overall plan in chat), which makes it planned. reply: add to its thread. ready: say what you did; it becomes ready for the person (allowed only after a plan, and not while a regression it caused is open), and the files you changed are recorded from git. Only the person closes, withdraws or deletes.",
    inputSchema: {
      items: z.array(answer).min(1),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async ({ items }) => {
    const lines: string[] = [];
    for (const item of items) {
      const done = await changeComments({ op: item.op, id: item.id, text: item.text });
      lines.push(done.ok ? `✓ ${item.id} [${done.comment?.status}]` : `✗ ${done.error}`);
    }
    return result([text(lines.join("\n"))]);
  },
);

server.registerTool(
  "comment_add",
  {
    title: "File a comment",
    description:
      'File a comment on a board. A reviewer: kind finding (one per item: the principle and what a student would get wrong), or kind regression with causedBy (the comment whose change broke it). Feedback the person gave in chat: kind comment, from: chat, so the threads stay the complete record. target is an address: "piece" or "piece/part"; prop makes it about that prop wherever it is used.',
    inputSchema: {
      board: z.string().min(1),
      target: z.string().optional(),
      prop: z.string().optional(),
      kind: z.enum([Kind.Finding, Kind.Regression, Kind.Comment]),
      causedBy: z.string().optional(),
      from: z.literal("chat").optional(),
      by: z.string().optional().describe("e.g. reviewer"),
      text: z.string().min(1),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async (args) => {
    const on = boardName(args.board);
    const piece = args.target?.split("/")[0];
    const where = readSources(root)[`${on}.json`];
    const source = (piece && where?.pieces[piece]) || where?.board;
    const done = await changeComments({
      op: "add",
      comment: {
        board: on,
        ...(args.target ? { target: args.target } : {}),
        ...(args.prop ? { prop: args.prop } : {}),
        ...(source ? { source } : {}),
        kind: args.kind,
        ...(args.causedBy ? { causedBy: args.causedBy } : {}),
        ...(args.from ? { from: args.from, by: "you" } : {}),
        ...(args.by && !args.from ? { by: args.by } : {}),
        text: args.text,
      },
    });
    return result([text(done.ok ? `✓ ${done.comment?.id} on ${on}` : `✗ ${done.error}`)]);
  },
);

await serveStdio(server, closeBrowser);
