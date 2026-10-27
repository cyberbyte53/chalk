import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { boardName, listBoards, readSources } from "../boards";
import {
  ACTS,
  type Filed,
  Label,
  MOVES,
  type Review,
  Role,
  Status,
  isUnanswered,
  lastMove,
  latestReview,
  standing,
  threadsOf,
} from "../comments";
import { isBuildCurrent } from "../content/inputs";
import { findUp } from "../pronunciations";
import { DEPTHS, changesFrom, changesFromGit, describeReach, reachIndex } from "../reach";
import { type NodeShape, nodeSchema } from "./model-schema";
import { DEFAULT_LANE, previewBase, previewUrl, shoot, withNothingDrawing } from "./preview";
import { type Content, type Extra, createServer, progressOf, result } from "./protocol";

/**
 * `chalk` MCP server: what an agent in any harness (Cursor, VS Code, Claude Code, Codex…) needs to
 * work on Chalk content that a file editor doesn't give it: eyes and hands on the real board,
 * what a change reaches, and the comments (read and answered through the dev server, their one
 * writer, which checks what each role may do). Served at http://127.0.0.1:5174/mcp (main.ts,
 * http.ts), one endpoint for every agent, each identified by its token. Every tool reads the repo as it is on
 * disk; boards come from build/.
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

/**
 * Why `board` names no built board or lesson, with the nearest names; undefined when it does.
 * Said before drawing, so a typo isn't mistaken for a missing build.
 */
function unknownBoard(board: string): string | undefined {
  const all = listBoards(root).map((b) => b.board);
  if (all.length === 0) return undefined; // Nothing built yet: the page says what's wrong.
  if (all.some((b) => b === board || b.startsWith(`${board}/`))) return undefined;
  const parts = board.split("/");
  const last = parts.at(-1) ?? "";
  // Boards that share its last name, else what is under the longest part of it that exists.
  let near = all.filter((b) => b.split("/").at(-1) === last);
  for (let n = parts.length - 1; near.length === 0 && n > 0; n--) {
    const prefix = `${parts.slice(0, n).join("/")}/`;
    const under = all.filter((b) => b.startsWith(prefix));
    const lessons = [
      ...new Set(
        under.map((b) =>
          b
            .split("/")
            .slice(0, n + 1)
            .join("/"),
        ),
      ),
    ];
    near = lessons.length > 0 ? lessons : under;
  }
  return `No board or lesson "${board}" in the build.${near.length > 0 ? ` Nearest: ${near.slice(0, 8).join(", ")}${near.length > 8 ? ", …" : ""}.` : ""}`;
}

// ---- Comments, through the dev server (their one writer) ----

type Applied = {
  ok: boolean;
  error?: string;
  thread?: Filed;
  review?: Review;
  count?: number;
};

/** One change, as the caller's role; the dev server says what it did or why not. */
async function changeComments(who: Who, change: Record<string, unknown>): Promise<Applied> {
  const base = await previewBase(root);
  const res = await fetch(new URL("/dev-review", base), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-chalk-role": who.role,
      "x-chalk-name": who.name,
    },
    body: JSON.stringify(change),
  });
  return (await res.json()) as Applied;
}

async function readAll(): Promise<{ threads: Filed[]; reviews: Review[] }> {
  const base = await previewBase(root);
  return (await (await fetch(new URL("/dev-review", base))).json()) as {
    threads: Filed[];
    reviews: Review[];
  };
}

const oneLine = (t: string, n: number) => t.replace(/\s+/g, " ").slice(0, n);

function threadLine(c: Filed): string {
  const where = [c.board ?? `${c.home} (plan)`, c.target, c.prop ? `prop ${c.prop}` : undefined]
    .filter(Boolean)
    .join(" · ");
  const plan = lastMove(c, Status.Planned);
  return [
    `• ${c.id} [${c.status}]${c.label === Label.Comment ? "" : ` ${c.label}`}${c.about ? ` about ${c.about}` : ""}${c.from ? ` (from ${c.from})` : ""} ${where}`,
    `  source: ${c.source ?? "?"}`,
    ...(c.snapshot ? [`  showed: ${oneLine(c.snapshot, 200)}`] : []),
    `  ${c.by}: “${oneLine(c.text, 400)}”`,
    ...(c.quote ? [`  quote: ${c.quote.slice(0, 200)}`] : []),
    ...(plan ? [`  plan: ${oneLine(plan.text, 300)}`] : []),
    ...c.messages.map(
      (m) =>
        `  ${m.by}${m.status ? ` → ${m.status}` : ""}: ${oneLine(m.text, 300) || "(no words)"}`,
    ),
    ...(c.changed?.length ? [`  changed: ${c.changed.join(", ")}`] : []),
  ].join("\n");
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

/** Who is calling: an agent's role (fixer, reviewer) and its name in threads. */
export type Who = { role: typeof Role.Fixer | typeof Role.Reviewer; name: string };

/**
 * The chalk tools for one caller: a fresh MCP server per connection, showing only what the caller's
 * role uses (`SEES`, and in `comment` only the moves and labels the writer's tables allow it). The
 * MCP service (main.ts, http.ts) says who is calling from their token.
 */
/**
 * The tools for one connection. `lane` is the connection's own page for drawing boards
 * (preview.ts): its `continue` goes on from its own last board, and connections draw at once.
 */
export function chalkMcp(who: Who, lane: string = DEFAULT_LANE): McpServer {
  const server = createServer();
  const ROLE = who.role;
  const NAME = who.name;
  /**
   * What this connection is shown: the tools its role uses, and in \`comment\` only the status moves
   * and labels the writer's tables (MOVES, ACTS) allow its role. An agent can't pick what it never
   * sees; the writer still checks every call.
   */
  const SEES: Readonly<Record<Who["role"], readonly string[]>> = {
    [Role.Fixer]: ["render_board", "affected", "comments", "comment"],
    [Role.Reviewer]: ["render_board", "affected", "comments", "comment"],
  };
  const MY_MOVES = [...new Set(MOVES[ROLE].map((m) => m.to))] as Status[];
  const MY_LABELS = ACTS[ROLE].starts;

  /** Registers a tool, and lists it only when this role uses it (SEES). */
  const offer = (registered: { remove: () => void }, name: string) => {
    if (!SEES[ROLE].includes(name)) registered.remove();
  };

  offer(
    server.registerTool(
      "affected",
      {
        title: "What a change reaches",
        description:
          'Every piece a change can make look or behave differently, down to `book/chapter/lesson/page#piece`, worked out from what the build recorded (every line of the author\'s code each piece was made through) and from who uses what in the code; nothing declared by hand. Ask before changing shared code, with what you plan to touch: `changes` takes files ("library/props/basics/src/views.tsx"), lines ("content/…/overview.ts:40-52") or one declaration ("content/…/kit.ts#sweetsQuestion", "library/props/basics/src/views.tsx#MultiChoiceView"); `props` takes prop types. After changing, `diff: true` reads what git says changed (since HEAD, or `diff: "<ref>"`). `depth` rolls it up: book, chapter (default), lesson, board or piece; `under` keeps to one branch ("class10-maths/real-numbers"). Then render_board what it lists.',
        inputSchema: {
          changes: z
            .array(z.string())
            .optional()
            .describe("Files, file:from-to, or file#declaration, repo-relative."),
          props: z.array(z.string()).optional().describe("Prop types, e.g. multiChoice."),
          diff: z
            .union([z.boolean(), z.string()])
            .optional()
            .describe("What git says changed: true (since HEAD), or a ref."),
          depth: z.enum(DEPTHS).optional().describe("How far down to list (default chapter)."),
          under: z.string().optional().describe("Only paths under this one."),
        },
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async ({ changes, props, diff, depth, under }) => {
        if ((changes?.length ?? 0) === 0 && (props?.length ?? 0) === 0 && !diff)
          throw new Error("say what is changing: changes, props, or diff: true");
        const index = reachIndex(root);
        const named = [
          ...(diff ? changesFromGit(root, typeof diff === "string" ? diff : "HEAD") : []),
          ...changesFrom(index, changes ?? []),
        ];
        const reached = index.reach(named);
        const hits = [...reached.hits, ...index.ofTypes(props ?? [])];
        return result([
          text(describeReach({ ...reached, hits }, depth ?? "chapter", under, named.length)),
        ]);
      },
    ),
    "affected",
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
      if (p.noControlNow?.length)
        out.push(`${indent}  no control now: ${p.noControlNow.join(", ")}`);
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

  offer(
    server.registerTool(
      "render_board",
      {
        title: "See (and use) boards",
        description:
          "See boards exactly as a phone draws them (the app's own player, 390px wide), and use them the way a student does. `board` is a board name (its path, e.g. class10-maths/real-numbers/division-lemma/story) or a lesson for all its pages. Returns a PNG per board and its snapshot (structured; the same one Jugnu and tests read): every node by address (a placed prop and, inside a group, its children) with where it's placed (file:line), setup (fixed where placed), live values (what can change here) and bound values (worked out from others, with where from), each part on screen with its typed value, the words the screen shows, what it does and where it's drawn (file:line), what can be done to it (who: learner or lesson, the controls that reach it, routed or not, with limits and the action's file:line), and problems (drawn but not described, or the reverse); plus layout problems found by measuring and page errors. With `steps` (one board): taps and drags on the real page, in order (targets are addresses: piece/element id, e.g. machine/plane/handle), starting from a fresh board (`continue: true` keeps this connection's last board as it was left; each connection draws on its own page, so agents can render at the same time); after each, the live values that changed, the events the app recorded, whether the board was passed, and a picture (`shots`: last, each or none). The app's own player decides what happens; nothing is simulated. Rebuilds content first if anything changed. Use it after every content or prop change, and before saying something looks or works right.",
        inputSchema: {
          board: z.string().min(1).describe("A board (its path) or a lesson."),
          steps: z.array(step).max(40).optional().describe("What a finger does, in order."),
          shots: z
            .enum(["last", "each", "none"])
            .optional()
            .describe("With steps: a picture after the last step (default), after each, or none."),
          continue: z
            .boolean()
            .optional()
            .describe("With steps: go on from the board as this connection last left it."),
          locale: z.enum(["en", "hi"]).optional(),
          play: z
            .boolean()
            .optional()
            .describe(
              "Hidden pieces stay hidden until earned, as a student meets them. Default: true with steps, false without.",
            ),
          questions: z.boolean().optional().describe("For a lesson: its questions too."),
          width: z
            .number()
            .int()
            .min(320)
            .max(640)
            .optional()
            .describe(
              "The column's width in px: 390 (a phone) by default; 360 a small phone, 640 a tablet or laptop.",
            ),
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
        // Skipped when build/ is already the last good build of exactly what is on disk. Never
        // while a board is being drawn (the dev server reloads pages when build/ changes), and
        // once for calls that ask together: the check is made again when it's this call's turn.
        if (args.rebuild !== false && args.continue !== true && !isBuildCurrent(root)) {
          await progress("building content");
          const built = await withNothingDrawing(() =>
            isBuildCurrent(root) ? Promise.resolve(undefined) : buildContent(extra.signal),
          );
          if (built !== undefined && built.code !== 0)
            notes.push(
              `build-content failed:\n${built.out
                .split("\n")
                .filter((l) => l.includes("✗") || l.startsWith("    "))
                .join("\n")}`,
            );
        }
        const unknown = unknownBoard(board);
        if (unknown !== undefined) throw new Error(unknown);
        const steps = args.steps ?? [];
        const options = {
          locale: args.locale ?? ("en" as const),
          play: args.play ?? steps.length > 0,
          questions: args.questions === true,
          ...(args.width !== undefined ? { width: args.width } : {}),
        };
        await progress(steps.length > 0 ? "acting" : "drawing");
        const drawn = await shoot(
          root,
          board,
          options,
          steps.length > 0
            ? { steps, shots: args.shots ?? "last", isContinued: args.continue === true }
            : undefined,
          lane,
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
          const where = sources[s.board];
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
                  ...(s.model.openQuestion !== undefined
                    ? { openQuestion: s.model.openQuestion }
                    : {}),
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
    ),
    "render_board",
  );

  offer(
    server.registerTool(
      "comments",
      {
        title: "Read comments",
        description:
          'Read threads: the person\'s comments from the preview, reviewers\' findings and regressions, and chat feedback filed as comments. `review`: a review\'s id ("apply review 20261026-1734"), or "latest": exactly the threads it handed over, in order, with how it stands. Or filter by `board` (path prefix) or `prop`. `unanswered: true`: only what still waits on a fixer (open or planned). Each shows its board, target (an address: piece/part), source line, what it showed, its plan and every message.',
        inputSchema: {
          review: z.string().optional().describe('A review id, or "latest".'),
          board: z.string().optional().describe("A board, lesson or chapter path prefix."),
          prop: z.string().optional(),
          unanswered: z.boolean().optional(),
        },
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async (args) => {
        const { threads, reviews } = await readAll();
        const review =
          args.review === undefined
            ? undefined
            : args.review === "latest"
              ? latestReview(reviews)
              : reviews.find((r) => r.id === args.review);
        if (args.review !== undefined && review === undefined)
          return result([
            text(
              args.review === "latest"
                ? "No review has been handed over yet."
                : `No review ${args.review}. Reviews: ${reviews.map((r) => r.id).join(", ") || "none"}.`,
            ),
          ]);
        let found = review === undefined ? threads : threadsOf(review, threads);
        if (args.board)
          found = found.filter((c) => (c.board ?? c.home).startsWith(args.board ?? ""));
        if (args.prop) found = found.filter((c) => c.prop === args.prop);
        if (args.unanswered) found = found.filter(isUnanswered);
        const head =
          review !== undefined
            ? `Review ${review.id} by ${review.by} (${review.role}), ${review.threads.length} thread${review.threads.length === 1 ? "" : "s"}: ${standing(threadsOf(review, threads)).text}\n\n`
            : "";
        return result([
          text(
            found.length === 0
              ? `${head}No threads match.`
              : head + found.map(threadLine).join("\n\n"),
          ),
        ]);
      },
    ),
    "comments",
  );

  /** What each status move means, for the role that may make it. */
  const MOVE_WORDS: Record<Status, string> = {
    [Status.Planned]:
      "planned: what you will do, after the person's go in chat (again to revise it)",
    [Status.Ready]:
      "ready: what you did; needs a plan first, an answer to any reviewer's words on it, and no open regression it caused; the files you changed are recorded from git",
    [Status.Open]: "open: reopen it",
    [Status.Closed]: "closed: done",
    [Status.Withdrawn]: "withdrawn: take it back",
  };
  const LABEL_WORDS: Record<Label, string> = {
    [Label.Finding]:
      "finding: a new problem (the principle, and what a student would get wrong); about a thread already there, write on it instead",
    [Label.Regression]:
      "regression: what a thread's change broke elsewhere (with about); what's wrong with its own fix goes on that thread",
    [Label.Comment]: "comment: what the person said in your chat (with from: chat)",
  };

  /** One write, shaped for this role: on a thread by its id, or a new thread on a board. */
  const write = z
    .object({
      id: z.string().optional().describe("The thread to write on."),
      text: z
        .string()
        .describe(
          MY_MOVES.length > 0
            ? 'What you say. May be "" only with a status move.'
            : "What you say.",
        ),
      ...(MY_MOVES.length > 0
        ? {
            status: z
              .enum(MY_MOVES as [Status, ...Status[]])
              .optional()
              .describe(
                `On a thread: move it. ${MY_MOVES.map((m) => MOVE_WORDS[m]).join("; ")}. Leave it out to just talk.`,
              ),
          }
        : {}),
      board: z.string().optional().describe("A new thread: its board."),
      target: z.string().optional().describe('A new thread: "piece" or "piece/part" on the board.'),
      prop: z.string().optional().describe("A new thread about that prop wherever it is used."),
      label: z
        .enum(MY_LABELS as unknown as [Label, ...Label[]])
        .optional()
        .describe(`A new thread: ${MY_LABELS.map((l) => LABEL_WORDS[l]).join("; ")}.`),
      ...(MY_LABELS.includes(Label.Regression)
        ? {
            about: z
              .string()
              .optional()
              .describe("A regression: the thread whose change broke this."),
          }
        : {}),
      ...(MY_LABELS.includes(Label.Comment) ? { from: z.literal("chat").optional() } : {}),
    })
    .strict();
  type Write = {
    id?: string;
    text: string;
    status?: Status;
    board?: string;
    target?: string;
    prop?: string;
    label?: Label;
    about?: string;
    from?: "chat";
  };

  offer(
    server.registerTool(
      "comment",
      {
        title: "Write on threads",
        description: `Write on threads, or start them; one or many at once. With \`id\`: write on that thread${MY_MOVES.length > 0 ? ", maybe moving its status" : ""}. With \`board\` (no id): start a thread. You write as a ${ROLE}${NAME === ROLE ? "" : ` (${NAME})`}: this tool offers only what a ${ROLE} may do, and the writer refuses anything else. When you finish a pass, \`handover: true\` hands what you started or wrote on as one review.`,
        inputSchema: {
          items: z.array(write).default([]),
          handover: z.boolean().optional(),
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
      },
      async ({ items: given, handover }) => {
        const items = given as Write[];
        const lines: string[] = [];
        for (const item of items) {
          if (item.id !== undefined) {
            const done = await changeComments(who, {
              op: "write",
              id: item.id,
              text: item.text,
              ...(item.status ? { status: item.status } : {}),
            });
            lines.push(done.ok ? `✓ ${item.id} [${done.thread?.status}]` : `✗ ${done.error}`);
            continue;
          }
          if (item.board === undefined) {
            lines.push("✗ give the thread's id, or a board to start one on");
            continue;
          }
          const on = boardName(item.board);
          const piece = item.target?.split("/")[0];
          const where = readSources(root)[`${on}.json`];
          const source = (piece && where?.pieces[piece]) || where?.board;
          const done = await changeComments(who, {
            op: "start",
            thread: {
              board: on,
              ...(item.target ? { target: item.target } : {}),
              ...(item.prop ? { prop: item.prop } : {}),
              ...(source ? { source } : {}),
              ...(item.label ? { label: item.label } : {}),
              ...(item.about ? { about: item.about } : {}),
              ...(item.from ? { from: item.from } : {}),
              text: item.text,
            },
          });
          lines.push(done.ok ? `✓ ${done.thread?.id} on ${on}` : `✗ ${done.error}`);
        }
        if (handover) {
          const done = await changeComments(who, { op: "handover" });
          lines.push(
            !done.ok
              ? `✗ ${done.error}`
              : done.review
                ? `✓ handed over review ${done.review.id} (${done.count} threads)`
                : "Nothing to hand over: no thread started or written on since your last handover.",
          );
        }
        return result([text(lines.join("\n") || "Nothing to do.")]);
      },
    ),
    "comment",
  );

  return server;
}
