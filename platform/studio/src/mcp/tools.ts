import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  contentAddress,
  contentPath,
  formatAddress,
  parseAddress,
  propAddress,
  shownAddress,
} from "@chalk/content/address";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { listBoards, readSources } from "../boards";
import {
  type Change,
  type Filed,
  MOVES,
  type Review,
  Role,
  Status,
  applyChange,
  isUnanswered,
  lastMove,
  latestReview,
  readComments,
  standing,
  threadsOf,
  waitsOn,
} from "../comments";
import { buildInputsKey, isBuildCurrent } from "../content/inputs";
import { findUp } from "../find-up";
import { pipelineLines, readChapters } from "../pipeline";
import { libraryText, usesOf } from "../prop-text";
import { DEPTHS, changesFrom, changesFromGit, describeReach, reachIndex } from "../reach";
import {
  type Shown,
  type VersionDiff,
  keepShown,
  passShown,
  shownDiffs,
  shownOf,
} from "../reach/shown";
import { changesUnder, changesWords, passUnder } from "../reviewed";
import { DEFAULT_LANE, type Step, previewBase, shoot, withNothingDrawing } from "./app-driver";
import { type Answer, check, drawShown, look, play, readReach, targetOf } from "./look";
import { compose } from "./picture";
import { type Content, type Extra, createServer, progressOf, result } from "./protocol";
import { typeSite } from "./sites";

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
  const shown = near.slice(0, 8).map((n) => contentAddress(n));
  return `No board or lesson "${contentAddress(board)}" in the build.${near.length > 0 ? ` Nearest: ${shown.join(", ")}${near.length > 8 ? ", …" : ""}.` : ""}`;
}

// ---- Comments, through the dev server (their one writer) ----

type Applied = {
  ok: boolean;
  error?: string;
  thread?: Filed;
  review?: Review;
  count?: number;
};

/** One change, as the caller's role: the writer (comments.ts) says what it did or why not. */
async function changeComments(who: Who, change: Record<string, unknown>): Promise<Applied> {
  return applyChange(root, change as Change, who);
}

async function readAll(): Promise<{ threads: Filed[]; reviews: Review[] }> {
  const { threads, reviews } = readComments(root);
  return { threads, reviews };
}

/** Words on one line, in full: never cut. */
const oneLine = (t: string) => t.replace(/\s+/g, " ");

/** Where a thread is, as an address: its board or prop, and what on it; a plan's thread by its home. */
export function threadAt(c: Filed): string {
  if (c.board !== undefined) return contentAddress(c.board, c.target);
  // A prop's thread is on the prop wherever it is used: its part comes after # (target is
  // "piece/part" as seen, the piece being whichever placed the prop).
  if (c.prop !== undefined)
    return shownAddress(propAddress(c.home.split("/").at(-1) ?? "", c.prop), c.target);
  // A thread on a planning file: the file (its words are under quote).
  return (c.source ?? c.home).replace(/:\d+(-\d+)?$/, "");
}

/** A write's result: the thread's status and whose turn it is now. */
function turnOf(t: Filed | undefined): string {
  if (t === undefined) return "";
  const on = waitsOn(t);
  return ` [${t.status}${on === undefined ? "" : `, ${on === "person" ? "the person's turn" : "the agent's turn"}`}]`;
}

/** Whose turn it is, in words. */
function turnWords(c: Filed): string {
  const on = waitsOn(c);
  return on === undefined ? "" : ` waits on the ${on} ·`;
}

function threadLine(c: Filed): string {
  const where = threadAt(c);
  const plan = lastMove(c, Status.Planned);
  return [
    `• ${c.id} [${c.status}]${turnWords(c)} ${c.by}${c.by === c.role ? "" : ` (${c.role})`}${c.from ? ` (from ${c.from})` : ""} ${where}`,
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
 * role uses (`SEES`, and in `comment` only the moves the writer's table allows it). The
 * MCP service (main.ts, http.ts) says who is calling from their token.
 */
/**
 * The tools for one connection. `lane` is the connection's own page for drawing boards
 * (app-driver.ts): connections draw at once.
 */
export function chalkMcp(who: Who, lane: string = DEFAULT_LANE): McpServer {
  const server = createServer();
  const ROLE = who.role;
  const NAME = who.name;
  /**
   * What this connection is shown: the tools its role uses, and in \`comment\` only the status moves
   * the writer's table (MOVES) allows its role. An agent can't pick what it never
   * sees; the writer still checks every call.
   */
  const SEES: Readonly<Record<Who["role"], readonly string[]>> = {
    // What changed: the fixer asks what an edit reaches (affected), the reviewer what changed since
    // it reviewed (changes), and only the reviewer passes (platform/docs/changes.md).
    [Role.Fixer]: ["show", "affected", "comments", "comment", "pipeline"],
    [Role.Reviewer]: ["show", "changes", "comments", "comment", "pipeline"],
  };
  const MY_MOVES = [...new Set(MOVES[ROLE].map((m) => m.to))] as Status[];

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
          'Every piece a change can make look or behave differently, down to `content/<book>/<chapter>/<lesson>/<board>#piece`, worked out from what the build recorded (every line of the author\'s code each piece was made through) and from who uses what in the code; nothing declared by hand. Ask before changing shared code, with what you plan to touch: `changes` takes files ("library/props/basics/src/views.tsx"), lines ("content/…/overview.ts:40-52") or one declaration ("content/…/kit.ts#sweetsQuestion", "library/props/basics/src/views.tsx#MultiChoiceView"); `props` takes props by address ("library/props/basics/choice"). After changing, `diff: true` reads what git says changed (since HEAD, or `diff: "<ref>"`). `depth` rolls it up: book, chapter (default), lesson, board or piece; `under` keeps to one branch ("content/class10-maths/real-numbers"). Then look at what it lists.',
        inputSchema: {
          changes: z
            .array(z.string())
            .optional()
            .describe("Files, file:from-to, or file#declaration, repo-relative."),
          props: z
            .array(z.string())
            .optional()
            .describe('Props, by address: "library/props/basics/multiChoice".'),
          diff: z
            .union([z.boolean(), z.string()])
            .optional()
            .describe("What git says changed: true (since HEAD), or a ref."),
          depth: z.enum(DEPTHS).optional().describe("How far down to list (default chapter)."),
          under: z
            .string()
            .optional()
            .describe('Only what is under this address: "content/class10-maths/real-numbers".'),
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
        const types = (props ?? []).map((p) => {
          const a = parseAddress(p);
          if (a.root !== "props")
            throw new Error(`"${p}" is not a prop; props are library/props/<package>/<type>`);
          return a.type;
        });
        const hits = [...reached.hits, ...index.ofTypes(types)];
        return result([
          text(
            describeReach(
              { ...reached, hits },
              depth ?? "chapter",
              under === undefined ? undefined : contentPath(under).path,
              named.length,
            ),
          ),
        ]);
      },
    ),
    "affected",
  );

  offer(
    server.registerTool(
      "pipeline",
      {
        title: "Where the chapters stand",
        description:
          "Every chapter's planning files and lessons: each file's state (draft, approved, changed since approved), its failing checks, what is to be checked again, why an approval can't be given yet, and which lessons wait on a self-review. `at` keeps to one book or chapter (\"authoring/books/class9-maths/coordinate-geometry\").",
        inputSchema: {
          at: z
            .string()
            .optional()
            .describe("A book or chapter: authoring/books/<book>[/<chapter>]."),
        },
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async ({ at }) => {
        const under = at?.replace(/\/$/, "");
        const chapters = readChapters(root).filter(
          (c) => under === undefined || c.dir === under || c.dir.startsWith(`${under}/`),
        );
        if (chapters.length === 0)
          return result([text(`No chapter with planning files${under ? ` under ${under}` : ""}.`)]);
        return result([text(pipelineLines(chapters).lines.join("\n"))]);
      },
    ),
    "pipeline",
  );

  /**
   * What a board shows now, every version (reach/shown.ts): the last drawing of it, if nothing
   * anything could read has changed since; else drawn again, and kept as the last.
   */
  const shownNow = async (board: string, inputs: string): Promise<Shown> => {
    const last = shownOf(root, "open", board);
    if (last !== undefined && last.inputs === inputs) return last;
    const now = await drawShown(root, board, lane);
    keepShown(root, "open", board, now);
    return now;
  };

  /** A version's two pictures, as passed and now (what differs in red), each arriving unshrunk. */
  const diffPictures = async (board: string, d: VersionDiff): Promise<Content[]> => {
    // Only what it reads differs: its pictures are the same.
    if (d.share === 0) return [];
    const name = board.split("/").at(-1) ?? board;
    const one = (png: Buffer, boxes: VersionDiff["pictures"]["boxes"], caption: string) => {
      const picture = {
        png,
        width: d.pictures.width,
        boxes: boxes.map((b) => ({ ...b, kind: "piece" as const })),
      };
      // Cut to the pieces that differ, when each is on this picture.
      const isThere = d.pieces.length > 0 && d.pieces.every((p) => boxes.some((b) => b.name === p));
      return compose(
        [{ picture, labels: "none", caption, ...(isThere ? { crop: d.pieces } : {}) }],
        { kind: "row" },
      );
    };
    const pngs = [
      ...(await one(
        d.pictures.passed,
        d.pictures.passedBoxes,
        `${name} · ${d.version} · as passed`,
      )),
      ...(await one(
        d.pictures.now,
        d.pictures.boxes,
        `${name} · ${d.version} · now (what differs in red)`,
      )),
    ];
    return pngs.map(
      (png) => ({ type: "image", data: png.toString("base64"), mimeType: "image/png" }) as Content,
    );
  };

  offer(
    server.registerTool(
      "changes",
      {
        title: "What changed since it was reviewed",
        description:
          "Every board at or under an address (a lesson, a chapter, its questions, one board) against what was reviewed: unchanged since passed (nothing to look at), changed (which pieces' setup, words or rules changed, and each function of the code it runs that changed, as file#name, with whether it ran in the review), new (never passed), or gone. A changed board is also drawn now in every version, as `show` draws it, against what it showed when passed: \"shows the same in every version\", or each version that differs (which pieces, how much), with its pictures as passed and now, cut to what differs (in red). Nothing is drawn for a board that hasn't changed. Start a review here: show and play only what changed. When a review is done and nothing is left open, `pass: true` records every board there as passed, as built now, by you, with what each showed (its last drawing in your review; a board you didn't show is drawn then).",
        inputSchema: {
          at: z
            .string()
            .describe(
              'A lesson, chapter or board: "content/class9-maths/coordinate-geometry/two-numbers-for-a-place".',
            ),
          pass: z
            .boolean()
            .optional()
            .describe("Record every board there as passed, as built now."),
        },
        annotations: { readOnlyHint: false, openWorldHint: false },
      },
      async ({ at, pass }, extra: Extra) => {
        const under = contentPath(at).path.replace(/\/$/, "");
        if (under.split("/").length < 2)
          return result([text("Give a chapter, a lesson or a board: content/<book>/<chapter>/…")]);
        const notes = await rebuildIfChanged(extra);
        const progress = progressOf(extra);
        const inputs = buildInputsKey(root);
        if (pass === true) {
          const boards = changesUnder(root, under).flatMap((c) =>
            c.status === "gone" ? [] : [c.board],
          );
          let drawn = 0;
          for (const [i, board] of boards.entries()) {
            const last = shownOf(root, "open", board);
            if (last !== undefined && last.inputs === inputs) continue;
            await progress(`drawing what it shows (${i + 1} of ${boards.length}): ${board}`);
            keepShown(root, "open", board, await drawShown(root, board, lane));
            drawn++;
          }
          for (const board of boards) passShown(root, board);
          const n = passUnder(root, under, NAME);
          return result([
            text(
              [
                `✓ ${n} board${n === 1 ? "" : "s"} passed by ${NAME}, as built now, with what each shows in every version${drawn > 0 ? ` (${drawn} not shown in the review, drawn now)` : ""}.`,
                ...notes,
              ].join("\n"),
            ),
          ]);
        }
        const changes = changesUnder(root, under);
        const images: Content[] = [];
        const seen = new Map<string, string[]>();
        const changed = changes.filter((c) => c.status === "changed");
        for (const [i, c] of changed.entries()) {
          const passed = shownOf(root, "passed", c.board);
          if (passed === undefined) {
            seen.set(c.board, ["shows: nothing kept from its review on this machine: show it"]);
            continue;
          }
          await progress(`drawing (${i + 1} of ${changed.length}): ${c.board}`);
          const diffs = shownDiffs(passed, await shownNow(c.board, inputs));
          if (diffs.length === 0) {
            seen.set(c.board, ["shows: the same in every version"]);
            continue;
          }
          seen.set(
            c.board,
            diffs.map(
              (d) =>
                `shows, ${d.version}: ${[
                  ...(d.read.length > 0 ? [`reads differently: ${d.read.join(", ")}`] : []),
                  ...(d.share > 0
                    ? [
                        `${d.share < 0.001 ? "under 0.1%" : `${(d.share * 100).toFixed(1)}%`} of it looks different${d.pieces.length > 0 ? `, in ${d.pieces.join(", ")}` : ""}`,
                      ]
                    : []),
                ].join("; ")}`,
            ),
          );
          for (const d of diffs) images.push(...(await diffPictures(c.board, d)));
        }
        return result([text([changesWords(changes, seen), ...notes].join("\n")), ...images]);
      },
    ),
    "changes",
  );

  const point = z.object({ x: z.number(), y: z.number().optional() }).strict();
  const during = z
    .string()
    .optional()
    .describe(
      'Done while this line is said (its name, as in the script: "fiveHouses"), not once the board has come to its end.',
    );
  const step = z.union([
    z
      .object({
        tap: z
          .string()
          .describe(
            'What to press, by name: a piece or one of its parts ("ask/check", "room/chooseTarget:5,3", "ask/select:oneEach"). Never by its words: a wrong name is an error listing the names there are.',
          ),
        at: point
          .optional()
          .describe(
            "A point in the prop's own units to tap, inside its frame: { x: -4, y: 2 } on a plane, { x: 1.5 } on a number line.",
          ),
        during,
      })
      .strict(),
    z
      .object({
        drag: z.string().describe('A piece or part to drag, by address: "graph/point".'),
        to: point.describe("Where to, in the prop's own units, inside its frame: { x: -4, y: 2 }."),
        during,
      })
      .strict(),
    z
      .object({
        call: z
          .string()
          .describe(
            "On a prop's own page: one of its actions, as a lesson would call it (zoomTo, walkBoth).",
          ),
        args: z.record(z.unknown()).optional().describe("Its arguments: { at: 2 }."),
        during,
      })
      .strict(),
  ]);
  type GivenStep = z.infer<typeof step>;

  /**
   * A prop's address, read for drawing: its page's name, and its steps aimed under its one piece
   * (the prop itself), so a step names a part as the prop's address does ("handle").
   */
  const onProp = (a: { pkg: string; type: string }) => {
    const under = (t: string) =>
      t === a.type || t.startsWith(`${a.type}/`) ? t : `${a.type}/${t}`;
    return {
      board: propAddress(a.pkg, a.type),
      steps: (given: readonly GivenStep[]): Step[] =>
        given.map((s) =>
          "tap" in s
            ? { ...s, tap: under(s.tap) }
            : "drag" in s
              ? { ...s, drag: under(s.drag) }
              : "call" in s
                ? {
                    call: s.call,
                    on: a.type,
                    ...(s.args ? { args: s.args } : {}),
                    ...(s.during === undefined ? {} : { during: s.during }),
                  }
                : s,
        ),
    };
  };
  const stateOf = (a: { state?: Record<string, unknown> }, isProp: boolean) => {
    if (a.state !== undefined && !isProp)
      throw new Error(
        "state is for a prop on its own page (library/props/…): a board sets its own",
      );
    return a.state === undefined ? {} : { state: a.state };
  };

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
      ...(a.images ?? []).map((png) => ({
        type: "image" as const,
        data: png.toString("base64"),
        mimeType: "image/png",
      })),
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
      "show",
      {
        title: "Show a board",
        description:
          "A board as the real learner app draws it in Chrome, from its start, after the steps if any: every call opens it afresh, so the same call always answers the same. Without steps, it plays on its own to its end (its lines said, its moves done) and is checked in English and Hindi on a small phone (360×640), a laptop column (640) and a projector (640×720), unless `locales`/`screens` ask for fewer: a picture of each version, ok or its problems, and what you pointed at. A board: one line per piece (type, line, its state where it isn't as it started) and its script. A piece or part (`…/<board>#game`, `…#game/plates`): just it, and everything about it: where it's written (path:line, every helper it went through, a question's params.yaml row), its setup (options in the order shown, each with its line), its state, values worked out from others, what can be done to it now (each action's line) and where each part is drawn. A lesson or a question family: thumbnails of its boards, and the boards with problems in any version. A chapter or a book: no pictures, a check of every board in every version, with progress (it can be cancelled). The library (`library/props/`, or one package): a line per prop: address, role, what it is for, how many boards use it. A prop on its own (`library/props/primes/stickMeasure`, from its defaults or `state`): as for a piece, then every board that uses it, the fields it sets, and what no board or only one uses. With `steps` (one board, or a prop on its own page): what a student does, in order, on one version (the phone in English unless one language and one screen are named): each step, unless `during` names a line, is done once the board has come to its end, and says what it set off and everything the student sees that changed (was → now, + appeared, − gone), what was said, and whether the board passed; then a picture before | after, cut to what changed (`full`, `shots`). A prop on its own page also takes `call` steps (its actions, as a lesson would). To go on from where a call left off, send its steps again with more. Rebuilds content first if anything changed. Use it after every content or prop change, before saying something looks right.",
        inputSchema: {
          at: z
            .string()
            .min(1)
            .describe(
              'An address: a piece ("content/<book>/<chapter>/<lesson>/<board>#piece", or #piece/part), a board, a lesson, a chapter or a book; the library ("library/props/"); or a prop on its own ("library/props/<package>/<type>", or #part).',
            ),
          steps: z
            .array(step)
            .min(1)
            .max(40)
            .optional()
            .describe("What a finger does, in order, from the board's start."),
          state: z
            .record(z.unknown())
            .optional()
            .describe(
              "A prop on its own: the fields it starts from, over its defaults ({ from: -5, to: 5 }).",
            ),
          locales: locales
            .optional()
            .describe('Languages: ["en"] for English only. Default both; with steps, en.'),
          screens: screens
            .optional()
            .describe(
              "Screens: the column's width (360 small phone, 640 laptop column) and the screen's height when it matters ({ width: 640, height: 720 }: a projector). Default the three check screens; with steps, the phone (360×640).",
            ),
          play: z
            .boolean()
            .optional()
            .describe(
              "Without steps: as a student meets it, pieces not earned yet hidden (steps always are).",
            ),
          labels: z
            .boolean()
            .optional()
            .describe("Name the pieces (or parts) on the picture. Default true."),
          shots: z
            .enum(["last", "each", "none"])
            .optional()
            .describe("With steps: before | after (default), after every step, or none."),
          full: z
            .boolean()
            .optional()
            .describe("With steps: whole boards in the picture, not cut to what changed."),
          frames: z
            .object({
              every: z.number().int().min(50).max(2000).optional(),
              most: z.number().int().min(1).max(24).optional(),
            })
            .strict()
            .optional()
            .describe(
              "With steps: watch the board move after each step, at real speed: a picture about every `every` ms (default 100), keeping the ones that differ, at most `most` (default 6), four to a row with each one's time; each step says `still after 1.2s` or `still changing at 3s`. For when the motion is the point (a walk, a glide).",
            ),
          speed: z
            .number()
            .min(1)
            .max(100)
            .optional()
            .describe(
              "By default the board's clock jumps: everything due (lines, which last their clips' length; glides; waits) is done at once, each at its own board time. A number runs it at that speed in real time instead (1: real time), for watching it; then a board is read once it has settled, at most 30s of board time.",
            ),
        },
        // Rebuilding writes build/, which is generated: nothing the person wrote changes.
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async (args, extra: Extra) => {
        const notes = await rebuildIfChanged(extra);
        const address = parseAddress(args.at);
        const given = stateOf(args, address.root === "props");
        if (args.steps !== undefined) {
          const { steps, locales, screens, at: _, play: __, ...rest } = args;
          if ((locales?.length ?? 1) > 1 || (screens?.length ?? 1) > 1)
            throw new Error(
              "Steps are done on one version: name one language and one screen, or none (the phone in English). What the board does is the same in every version; without steps, show checks how every version looks.",
            );
          const one = {
            ...rest,
            ...given,
            ...(locales?.[0] === undefined ? {} : { locale: locales[0] }),
            ...(screens?.[0] === undefined ? {} : { screen: screens[0] }),
          };
          if (address.root === "props") {
            if (address.part !== undefined)
              throw new Error("Steps act on the whole prop: its address without #part.");
            const prop = onProp(address);
            await progressOf(extra)("playing");
            return answer(
              await play(root, { ...one, board: prop.board, steps: prop.steps(steps) }, lane),
              notes,
            );
          }
          if (steps.some((s) => "call" in s))
            throw new Error(
              "call is for a prop on its own page (library/props/…); on a board the lesson calls actions",
            );
          const at = contentPath(args.at);
          const board = at.path;
          const all = listBoards(root);
          if (at.part !== undefined || !all.some((b) => b.board === board)) {
            const target = targetOf(board, all);
            throw new Error(
              target !== undefined
                ? "Steps act on one board: name a board, not a lesson, chapter or piece."
                : (unknownBoard(board) ?? `No board "${board}".`),
            );
          }
          await progressOf(extra)("playing");
          return answer(
            await play(
              root,
              { ...one, board, steps: steps.filter((s): s is Step => !("call" in s)) },
              lane,
            ),
            notes,
          );
        }
        if (address.root === "library") {
          // Props are read through the app, the one place their definitions are loaded.
          const d = await shoot(
            root,
            formatAddress(address),
            { pictures: "none", withProps: true },
            undefined,
            lane,
          );
          return answer(
            { text: libraryText(d.props ?? [], usesOf(readReach(root)), address.pkg) },
            notes,
          );
        }
        if (address.root === "props") {
          await progressOf(extra)("drawing");
          const prop = onProp(address);
          const target = {
            kind: "piece" as const,
            board: prop.board,
            address: address.part === undefined ? address.type : `${address.type}/${address.part}`,
          };
          return answer(
            await look(root, target, { ...args, ...given }, { sources: readSources(root) }, lane),
            notes,
          );
        }
        const all = listBoards(root);
        const at = contentPath(args.at);
        const target = targetOf(at.part === undefined ? at.path : `${at.path}#${at.part}`, all);
        if (target === undefined)
          throw new Error(unknownBoard(at.path) ?? `Nothing built at "${args.at}".`);
        const where = { sources: readSources(root) };
        if (target.kind === "many") {
          const a = await check(root, target, args, lane, progressOf(extra), extra.signal);
          return answer(a, notes);
        }
        await progressOf(extra)("drawing");
        return answer(await look(root, target, args, where, lane), notes);
      },
    ),
    "show",
  );

  offer(
    server.registerTool(
      "comments",
      {
        title: "Read comments",
        description:
          "Read threads: the person's (from the preview, the editor, or said in your chat), reviewers' and fixers' (questions, decisions, proposals). Each says whose turn it is. `review`: a review's id (\"apply review 20261026-1734\"), or \"latest\": exactly the threads it handed over, in order, with how it stands. Or filter by `at`: threads at or under an address (a chapter, a board, a prop). `unanswered: true`: only what waits on the agent. Each shows its address, source line, what it showed, its plan and every message.",
        inputSchema: {
          review: z.string().optional().describe('A review id, or "latest".'),
          at: z
            .string()
            .optional()
            .describe(
              'An address: threads at or under it ("content/class10-maths/real-numbers", "library/props/basics/choice"), or a planning file or folder ("authoring/books/class9-maths/coordinate-geometry/flow.md").',
            ),
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
        if (args.at?.startsWith("authoring/")) {
          // A planning file or folder: the threads written on it, by their source line.
          const prefix = args.at.replace(/\/$/, "");
          found = found.filter((c) => (c.source ?? "").startsWith(prefix));
        } else if (args.at !== undefined) {
          const prefix = formatAddress(parseAddress(args.at)).replace(/\/$/, "");
          found = found.filter((c) => {
            const at = threadAt(c);
            return at === prefix || at.startsWith(`${prefix}/`) || at.startsWith(`${prefix}#`);
          });
        }
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
    [Status.Withdrawn]: "withdrawn: take back a thread you started that became moot (say why)",
  };

  /**
   * Where a thread is, from an address: a board or something on it, a prop or a part of it, or a
   * planning file in authoring/books/ with the exact words it is about (`quote`). Says what's wrong
   * when it names none of these.
   */
  const placeOf = (
    at: string,
    quote: string | undefined,
  ):
    | { board?: string; target?: string; prop?: string; source?: string; quote?: string }
    | string => {
    const clean = at.trim();
    if (clean.startsWith("authoring/books/")) {
      const file = clean.split("#")[0] ?? clean;
      if (!/^authoring\/books\/[^/]+\/[^/]+\/.+/.test(file) || !existsSync(join(root, file)))
        return `no file ${file}`;
      if (quote === undefined || quote.trim() === "")
        return "a thread on a file quotes the words it is about (quote)";
      const lines = readFileSync(join(root, file), "utf8").split("\n");
      const first = quote.trim().split("\n")[0] ?? "";
      const line = lines.findIndex((l) => l.includes(first));
      if (line === -1) return `${file} doesn't have those words: quote them as written`;
      return { source: `${file}:${line + 1}`, quote: quote.trim() };
    }
    let a: ReturnType<typeof parseAddress>;
    try {
      a = parseAddress(clean);
    } catch (e) {
      return (e as Error).message;
    }
    if (a.root === "library")
      return "a thread is on a board, a prop or a planning file: give one's address, not the library's";
    if (a.root === "content") {
      const piece = a.part?.split("/")[0];
      const where = readSources(root)[a.path];
      const source = (piece && where?.pieces[piece]) || where?.board;
      return {
        board: a.path,
        ...(a.part ? { target: a.part } : {}),
        ...(source ? { source } : {}),
      };
    }
    // A prop's thread is written where the prop is defined.
    const source = typeSite(root, a.type);
    return {
      prop: a.type,
      ...(a.part ? { target: `${a.type}/${a.part}` } : {}),
      ...(source ? { source } : {}),
    };
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
      at: z
        .string()
        .optional()
        .describe(
          'Where, by address. A board or something on it ("content/…/<board>#piece/part"), a prop wherever it is used ("library/props/<package>/<type>", or #part), or a planning file ("authoring/books/<book>/<chapter>/flow.md", with quote). With id: re-point that thread here, its place being gone (the text says where it went and why).',
        ),
      quote: z
        .string()
        .optional()
        .describe("On a planning file: the exact words the thread is about, as written."),
      turn: z
        .enum(["person", "agent"])
        .optional()
        .describe(
          "Whose turn it is after this write, when not what the write says by itself: \"person\" for something only the person can decide (a taste call), \"agent\" for something an agent fixes. Left out: the person's words and a reviewer's are the agent's to answer; a fixer's question, reason or ready is the person's; a plan is the agent's.",
        ),
      ...(ROLE === Role.Fixer
        ? {
            from: z
              .literal("chat")
              .optional()
              .describe("A new thread: what the person said in your chat, filed in their name."),
          }
        : {}),
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
    at?: string;
    quote?: string;
    turn?: "person" | "agent";
    from?: "chat";
    plan?: string;
  };

  offer(
    server.registerTool(
      "comment",
      {
        title: "Write on threads",
        description: `Write on threads, or start them; one or many at once. With \`id\`: write on that thread${MY_MOVES.length > 0 ? ", maybe moving its status" : ""}. With \`at\` (no id): start a thread there. You write as a ${ROLE}${NAME === ROLE ? "" : ` (${NAME})`}: this tool offers only what a ${ROLE} may do, and the writer refuses anything else. When you finish a pass, \`handover: true\` hands what you started or wrote on as one review.`,
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
          if (item.id !== undefined && item.at !== undefined) {
            // Re-pointing a thread whose place is gone: the text says where it went and why.
            const place = placeOf(item.at, item.quote);
            if (typeof place === "string") {
              lines.push(`✗ ${place}`);
              continue;
            }
            const done = await changeComments(who, {
              op: "move",
              id: item.id,
              to: place,
              text: item.text,
            });
            if (!done.ok) {
              lines.push(`✗ ${done.error}`);
              continue;
            }
            lines.push(`✓ ${item.id} now at ${item.at.trim()}`);
            // The rest of the item still applies: its status move, or whose turn it is.
            if (item.status === undefined && item.turn === undefined) continue;
            const moved = await changeComments(who, {
              op: "write",
              id: item.id,
              text: "",
              ...(item.status ? { status: item.status } : {}),
              ...(item.turn ? { turn: item.turn } : {}),
            });
            lines.push(moved.ok ? `✓ ${item.id}${turnOf(moved.thread)}` : `✗ ${moved.error}`);
            continue;
          }
          if (item.id !== undefined) {
            const done = await changeComments(who, {
              op: "write",
              id: item.id,
              text: item.text,
              ...(item.status ? { status: item.status } : {}),
              ...(item.turn ? { turn: item.turn } : {}),
            });
            lines.push(done.ok ? `✓ ${item.id}${turnOf(done.thread)}` : `✗ ${done.error}`);
            continue;
          }
          if (item.at === undefined) {
            lines.push("✗ give the thread's id, or an address to start one at");
            continue;
          }
          const place = placeOf(item.at, item.quote);
          if (typeof place === "string") {
            lines.push(`✗ ${place}`);
            continue;
          }
          const on = item.at.trim();
          const done = await changeComments(who, {
            op: "start",
            thread: {
              ...place,
              ...(item.turn ? { turn: item.turn } : {}),
              ...(item.from ? { from: item.from } : {}),
              text: item.text,
            },
          });
          if (!done.ok || done.thread === undefined) {
            lines.push(`✗ ${done.error}`);
            continue;
          }
          if (item.plan === undefined) {
            lines.push(`✓ ${done.thread.id} on ${on}${turnOf(done.thread)}`);
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
