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
import { DEFAULT_LANE, previewBase, withNothingDrawing } from "./app-driver";
import { type Answer, check, look, play, targetOf } from "./look";
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

/** Words on one line, in full: never cut. */
const oneLine = (t: string) => t.replace(/\s+/g, " ");

function threadLine(c: Filed): string {
  const where = [c.board ?? `${c.home} (plan)`, c.target, c.prop ? `prop ${c.prop}` : undefined]
    .filter(Boolean)
    .join(" · ");
  const plan = lastMove(c, Status.Planned);
  return [
    `• ${c.id} [${c.status}]${c.label === Label.Comment ? "" : ` ${c.label}`}${c.about ? ` about ${c.about}` : ""}${c.from ? ` (from ${c.from})` : ""} ${where}`,
    `  source: ${c.source ?? "?"}`,
    ...(c.snapshot ? [`  showed: ${oneLine(c.snapshot)}`] : []),
    `  ${c.by}: “${oneLine(c.text)}”`,
    ...(c.quote ? [`  quote: ${oneLine(c.quote)}`] : []),
    ...(plan ? [`  plan: ${oneLine(plan.text)}`] : []),
    ...c.messages.map(
      (m) => `  ${m.by}${m.status ? ` → ${m.status}` : ""}: ${oneLine(m.text) || "(no words)"}`,
    ),
    ...(c.changed?.length ? [`  changed: ${c.changed.join(", ")}`] : []),
  ].join("\n");
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
 * (app-driver.ts): its `continue` goes on from its own last board, and connections draw at once.
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
    [Role.Fixer]: ["look", "play", "affected", "comments", "comment"],
    [Role.Reviewer]: ["look", "play", "affected", "comments", "comment"],
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
          'Every piece a change can make look or behave differently, down to `book/chapter/lesson/page#piece`, worked out from what the build recorded (every line of the author\'s code each piece was made through) and from who uses what in the code; nothing declared by hand. Ask before changing shared code, with what you plan to touch: `changes` takes files ("library/props/basics/src/views.tsx"), lines ("content/…/overview.ts:40-52") or one declaration ("content/…/kit.ts#sweetsQuestion", "library/props/basics/src/views.tsx#MultiChoiceView"); `props` takes prop types. After changing, `diff: true` reads what git says changed (since HEAD, or `diff: "<ref>"`). `depth` rolls it up: book, chapter (default), lesson, board or piece; `under` keeps to one branch ("class10-maths/real-numbers"). Then look at what it lists.',
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

  /** Rebuilds content first when anything changed, never while a board is being drawn. */
  const rebuildIfChanged = async (extra: Extra): Promise<string[]> => {
    if (isBuildCurrent(root)) return [];
    await progressOf(extra)("building content");
    // Once for calls that ask together: the check is made again when it's this call's turn.
    const built = await withNothingDrawing(() =>
      isBuildCurrent(root) ? Promise.resolve(undefined) : buildContent(extra.signal),
    );
    if (built === undefined || built.code === 0) return [];
    return [
      `build-content failed:\n${built.out
        .split("\n")
        .filter((l) => l.includes("✗") || l.startsWith("    "))
        .join("\n")}`,
    ];
  };

  const answer = (a: Answer, notes: readonly string[]) => ({
    content: [
      text([a.text, ...notes].join("\n")),
      ...(a.image === undefined
        ? []
        : [{ type: "image" as const, data: a.image.toString("base64"), mimeType: "image/png" }]),
    ],
  });

  const locales = z
    .array(z.enum(["en", "hi"]))
    .min(1)
    .max(2);
  const width = z.number().int().min(320).max(640);
  const height = z.number().int().min(480).max(1200);
  const screens = z
    .array(z.object({ width, height: height.optional() }).strict())
    .min(1)
    .max(3);

  offer(
    server.registerTool(
      "look",
      {
        title: "Look at boards",
        description:
          "What a board looks like and whether anything is broken, drawn by the real learner app in Chrome. What you point at decides how much comes back. A piece or part (`<board>#game`, `<board>#game/plates`): a picture of just it, its parts named, ok or its problems, and everything about it: where it's written (full path:line, every helper it went through, a question's params.yaml row), its setup as the running app has it (options in the order shown, each with its line), its current state, values worked out from others, what can be done to it now (with each action's line) and where each part is drawn. A board (`class10-maths/real-numbers/division-lemma/story`): its picture with each piece named, ok or its problems, and one line per piece (type, full path:line, current state). A lesson or a question family: thumbnails of its boards, and only the boards with problems. A chapter or a book: no pictures, a check of every board (English and Hindi on a small phone, a laptop column and a projector by default): how many were drawn, how many are ok, and the problems; it reports progress and can be cancelled. `locales` and `screens` show versions side by side in one picture. `play: true` shows the board as a student meets it (pieces not earned yet hidden). `continue: true` looks at the board as your last `play` left it. `labels: false` gives the clean picture, exactly the student's screen. Rebuilds content first if anything changed. Use it after every content or prop change, before saying something looks right.",
        inputSchema: {
          at: z
            .string()
            .min(1)
            .describe(
              "A piece (<board>#piece or #piece/part), a board, a lesson, a chapter or a book.",
            ),
          locales: locales
            .optional()
            .describe('Languages, side by side: ["en", "hi"]. Default en.'),
          screens: screens
            .optional()
            .describe(
              "Screens, side by side: the column's width (360 small phone, 390 phone, 640 tablet or laptop column) and the screen's height when it matters (a projector: { width: 640, height: 720 }). Default a phone (390, 844 tall). A chapter check draws 360×640, 640, and 640×720.",
            ),
          play: z
            .boolean()
            .optional()
            .describe("As a student meets it: pieces not earned yet hidden."),
          continue: z.boolean().optional().describe("The board as your last `play` left it."),
          labels: z
            .boolean()
            .optional()
            .describe("Name the pieces (or parts) on the picture. Default true."),
          speed: z
            .number()
            .min(1)
            .max(100)
            .optional()
            .describe(
              "How fast the board's clock runs: waits, glides and timers end sooner, in the same order with the same values. Default 10; 1 for real time. Boards are read once they've settled (at most 30s of board time; what's still running then is named).",
            ),
        },
        // Rebuilding writes build/, which is generated: nothing the person wrote changes.
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async (args, extra: Extra) => {
        const notes = args.continue === true ? [] : await rebuildIfChanged(extra);
        const all = listBoards(root);
        const target = targetOf(boardName(args.at), all);
        if (target === undefined)
          throw new Error(
            unknownBoard(boardName(args.at).split("#")[0] ?? "") ??
              `Nothing built at "${args.at}".`,
          );
        const where = { sources: readSources(root) };
        if (target.kind === "many") {
          if (args.continue === true) throw new Error("continue looks at one board.");
          const a = await check(root, target, args, lane, progressOf(extra), extra.signal);
          return answer(a, notes);
        }
        await progressOf(extra)("drawing");
        return answer(await look(root, target, args, where, lane), notes);
      },
    ),
    "look",
  );

  offer(
    server.registerTool(
      "play",
      {
        title: "Play a board",
        description:
          'Use a board the way a student does, in the real learner app: taps and drags on the page, in order (targets by address: a piece, or piece/part, e.g. game/giveRound, qr with text "q = 5"). The app\'s own player decides what happens; nothing is simulated. Starts from a fresh board as a student meets it, unless `continue: true` goes on from where your last call left it (it fails, saying why, when that board isn\'t there). Returns one line per step: what it set off, everything the student sees that changed (each part was → now in full, + appeared, − gone, an input off → on, and hidden facts), signals, whether the board was passed, errors in full; then whether the board is passed. One picture: before | after, cut to the pieces that changed (`full: true` for the whole board; `shots: "each"` for a strip of every step, `"none"` for none).',
        inputSchema: {
          board: z.string().min(1).describe("A board (its path)."),
          steps: z.array(step).min(1).max(40).describe("What a finger does, in order."),
          continue: z
            .boolean()
            .optional()
            .describe("Go on from where your last call left this board."),
          shots: z
            .enum(["last", "each", "none"])
            .optional()
            .describe("Before | after (default), every step, or none."),
          full: z
            .boolean()
            .optional()
            .describe("Whole boards in the picture, not cut to what changed."),
          locale: z.enum(["en", "hi"]).optional(),
          width: width.optional().describe("Column width in px (default 390)."),
          height: height
            .optional()
            .describe("Screen height in px (default 844, a phone; a projector is 720)."),
          labels: z.boolean().optional().describe("Name the pieces on the picture. Default true."),
          speed: z
            .number()
            .min(1)
            .max(100)
            .optional()
            .describe(
              "How fast the board's clock runs: waits, glides and timers end sooner, in the same order with the same values. Default 10; 1 for real time. Boards are read once they've settled (at most 30s of board time; what's still running then is named).",
            ),
        },
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async (args, extra: Extra) => {
        const notes = args.continue === true ? [] : await rebuildIfChanged(extra);
        const board = boardName(args.board);
        const all = listBoards(root);
        if (!all.some((b) => b.board === board)) {
          const target = targetOf(board, all);
          throw new Error(
            target !== undefined
              ? "Steps act on one board: name a board, not a lesson, chapter or piece."
              : (unknownBoard(board) ?? `No board "${board}".`),
          );
        }
        await progressOf(extra)("playing");
        return answer(await play(root, { ...args, board }, lane), notes);
      },
    ),
    "play",
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
      ...(MY_MOVES.includes(Status.Planned)
        ? {
            plan: z
              .string()
              .optional()
              .describe(
                "A new thread: its plan, written on it at once (planned), when the person agreed to it in chat.",
              ),
          }
        : {}),
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
    plan?: string;
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
          const where = readSources(root)[on];
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
          if (!done.ok || done.thread === undefined) {
            lines.push(`✗ ${done.error}`);
            continue;
          }
          if (item.plan === undefined) {
            lines.push(`✓ ${done.thread.id} on ${on}`);
            continue;
          }
          const planned = await changeComments(who, {
            op: "write",
            id: done.thread.id,
            text: item.plan,
            status: Status.Planned,
          });
          lines.push(
            planned.ok
              ? `✓ ${done.thread.id} on ${on} [planned]`
              : `✓ ${done.thread.id} on ${on}, but its plan wasn't written: ${planned.error}`,
          );
        }
        if (handover) {
          const done = await changeComments(who, { op: "handover" });
          lines.push(
            !done.ok
              ? `✗ ${done.error}`
              : done.review
                ? done.review.added?.length
                  ? `✓ added to review ${done.review.id}, still in progress (${done.count} threads)`
                  : `✓ handed over review ${done.review.id} (${done.count} threads)`
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
