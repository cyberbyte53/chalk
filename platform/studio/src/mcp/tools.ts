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
import { isBuildCurrent } from "../content/inputs";
import { pipelineLines, readChapters } from "../pipeline";
import { findUp } from "../pronunciations";
import { libraryText, usesOf } from "../prop-text";
import { DEPTHS, changesFrom, changesFromGit, describeReach, reachIndex } from "../reach";
import {
  REVIEW_SCREEN,
  comparePictures,
  dropPassedPicture,
  keepPassedPicture,
  passedPicture,
} from "../reach/pictures";
import { type BoardChange, changesUnder, changesWords, passUnder } from "../reviewed";
import { DEFAULT_LANE, type Step, previewBase, shoot, withNothingDrawing } from "./app-driver";
import { type Answer, CHECK_SCREENS, check, look, play, readReach, targetOf } from "./look";
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
 * (app-driver.ts): its `continue` goes on from its own last board, and connections draw at once.
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
    [Role.Fixer]: ["look", "play", "affected", "comments", "comment", "pipeline", "changes"],
    [Role.Reviewer]: ["look", "play", "affected", "comments", "comment", "pipeline", "changes"],
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
   * A board drawn whole on the review's screen (pictures.ts), with where each piece is: its picture
   * as passed, or now. Undefined when it can't be drawn.
   */
  const reviewPicture = async (board: string) => {
    try {
      const d = await shoot(
        root,
        board,
        { locale: REVIEW_SCREEN.locale, width: REVIEW_SCREEN.width, pictures: "full" },
        undefined,
        lane,
      );
      const shot = d.shots[0];
      if (shot === undefined) return undefined;
      return {
        png: shot.png,
        boxes: shot.boxes.filter((b) => b.kind === "piece"),
        // A PNG's width is at byte 16; the picture is at device pixels, the boxes at CSS pixels.
        scale: shot.png.readUInt32BE(16) / shot.width,
      };
    } catch {
      return undefined;
    }
  };

  offer(
    server.registerTool(
      "changes",
      {
        title: "What changed since it was reviewed",
        description:
          "Every board at or under an address (a lesson, a chapter, its questions, one board) against what was reviewed: unchanged since passed (nothing to look at), changed (exactly which pieces' setup, words or rules changed, and each function of the code it runs that changed, as file#name), new (never passed), or gone. Each board passed on this machine is also drawn now beside its picture as passed (whole, a phone, English): what differs, how much, in which pieces, marked in red; a board that looks different is changed even when its content and code are the same. Start a review here: look and play only what changed. When a review is done and nothing is left open, `pass: true` records every board there as passed, as built now, by you, and keeps its picture.",
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
        if (pass === true) {
          const n = passUnder(root, under, NAME);
          // Each board's picture as passed, for the next review to set beside it.
          const boards = changesUnder(root, under).flatMap((c) =>
            c.status === "unchanged" ? [c.board] : [],
          );
          let kept = 0;
          for (const [i, board] of boards.entries()) {
            await progress(`keeping its picture (${i + 1} of ${boards.length}): ${board}`);
            const png = await reviewPicture(board);
            if (png === undefined) dropPassedPicture(root, board);
            else {
              keepPassedPicture(root, board, png.png);
              kept++;
            }
          }
          return result([
            text(
              [
                `✓ ${n} board${n === 1 ? "" : "s"} passed by ${NAME}, as built now; ${kept} picture${kept === 1 ? "" : "s"} kept to set beside the next review's.`,
                ...notes,
              ].join("\n"),
            ),
          ]);
        }
        const changes = changesUnder(root, under);
        const images: Content[] = [];
        // Each passed board drawn now, beside its picture as passed: what changed to the eye. The
        // unchanged ones too: code and content can be the same while what it draws with (the
        // player, its styles) changed, and then the picture is what shows it.
        const seen = new Map<string, string>();
        const looked = changes.filter((c) => c.status === "changed" || c.status === "unchanged");
        for (const [i, c] of looked.entries()) {
          await progress(`drawing (${i + 1} of ${looked.length}): ${c.board}`);
          const passed = passedPicture(root, c.board);
          if (passed === undefined) {
            if (c.status === "changed")
              seen.set(c.board, "none kept from its review on this machine");
            continue;
          }
          const now = await reviewPicture(c.board);
          if (now === undefined) {
            seen.set(c.board, "couldn't be drawn now");
            continue;
          }
          const diff = comparePictures(passed, now.png, now.boxes, now.scale);
          if (diff.isSame) {
            if (c.status === "changed") seen.set(c.board, "the same as passed");
            continue;
          }
          seen.set(
            c.board,
            `${(diff.share * 100).toFixed(1)}% differs${diff.pieces.length > 0 ? `, in ${diff.pieces.join(", ")}` : ""} (as passed | now, what differs in red)${c.status === "unchanged" ? ": its content and known code are the same, so what changed is something it draws with that isn't counted as its code (the player, its styles)" : ""}`,
          );
          images.push({
            type: "image",
            data: diff.image.toString("base64"),
            mimeType: "image/png",
          } as Content);
        }
        // A board that looks different is changed, whatever else says it isn't.
        const marked = changes.map(
          (c): BoardChange =>
            c.status === "unchanged" && seen.has(c.board)
              ? { board: c.board, status: "changed", passed: c.passed, content: [], code: [] }
              : c,
        );
        const lines = [
          changesWords(marked),
          ...[...seen].map(([board, words]) => `${board}   picture: ${words}`),
        ];
        return result([text([...lines, ...notes].join("\n")), ...images]);
      },
    ),
    "changes",
  );

  const point = z.object({ x: z.number(), y: z.number().optional() }).strict();
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
      })
      .strict(),
    z
      .object({
        drag: z.string().describe('A piece or part to drag, by address: "graph/point".'),
        by: z
          .tuple([z.number(), z.number()])
          .optional()
          .describe("How far, in pixels: [right, down]."),
        to: point
          .optional()
          .describe("Where to, in the prop's own units, inside its frame: { x: -4, y: 2 }."),
      })
      .strict()
      .refine((s) => (s.by === undefined) !== (s.to === undefined), {
        message:
          "a drag says where to: `to` (in the prop's units) or `by` (in pixels), one of them",
      }),
    z.object({ wait: z.number().int().min(0).max(10000).describe("Milliseconds.") }).strict(),
    z
      .object({
        call: z
          .string()
          .describe(
            "On a prop's own page: one of its actions, as a lesson would call it (zoomTo, walkBoth).",
          ),
        args: z.record(z.unknown()).optional().describe("Its arguments: { at: 2 }."),
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
                ? { call: s.call, on: a.type, ...(s.args ? { args: s.args } : {}) }
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
          "What a board looks like and whether anything is broken, drawn by the real learner app in Chrome. What you point at decides how much comes back. A piece or part (`content/…/<board>#game`, `…#game/plates`): a picture of just it, its parts named, ok or its problems, and everything about it: where it's written (full path:line, every helper it went through, a question's params.yaml row), its setup as the running app has it (options in the order shown, each with its line), its current state, values worked out from others, what can be done to it now (with each action's line) and where each part is drawn. The library (`library/props/`, or one package, `library/props/basics`): a line per prop, its address, role, what it is for, and how many boards use it. A prop on its own (`library/props/primes/stickMeasure`, from its defaults or `state`): everything about it, as for a piece, then what it is for, every board that uses it with the fields it sets, the inputs it feeds and the actions it calls, and what no board or only one board uses. A board (`content/class10-maths/real-numbers/division-lemma/story`): its picture with each piece named, ok or its problems, and one line per piece (type, full path:line, current state). A lesson or a question family: thumbnails of its boards, and only the boards with problems. A chapter or a book: no pictures, a check of every board (English and Hindi on a small phone, a laptop column and a projector by default): how many were drawn, how many are ok, and the problems; it reports progress and can be cancelled. `locales` and `screens` show versions side by side in one picture. `play: true` shows the board as a student meets it (pieces not earned yet hidden). `continue: true` looks at the board as your last `play` left it. `labels: false` gives the clean picture, exactly the student's screen. Rebuilds content first if anything changed. Use it after every content or prop change, before saying something looks right.",
        inputSchema: {
          at: z
            .string()
            .min(1)
            .describe(
              'An address: a piece ("content/<book>/<chapter>/<lesson>/<board>#piece", or #piece/part), a board, a lesson, a chapter or a book; or a prop on its own ("library/props/<package>/<type>", or #part).',
            ),
          state: z
            .record(z.unknown())
            .optional()
            .describe(
              "A prop on its own: the fields it starts from, over its defaults ({ from: -5, to: 5 }).",
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
        const address = parseAddress(args.at);
        const given = stateOf(args, address.root === "props");
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
            [],
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
            [],
          );
        }
        const all = listBoards(root);
        const at = contentPath(args.at);
        const target = targetOf(at.part === undefined ? at.path : `${at.path}#${at.part}`, all);
        if (target === undefined)
          throw new Error(unknownBoard(at.path) ?? `Nothing built at "${args.at}".`);
        const where = { sources: readSources(root) };
        if (target.kind === "many") {
          if (args.continue === true) throw new Error("continue looks at one board.");
          // A chapter is checked on the platform's screens, unless screens are asked for.
          const screens = args.screens ?? [...CHECK_SCREENS];
          const a = await check(
            root,
            target,
            { ...args, screens },
            lane,
            progressOf(extra),
            extra.signal,
          );
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
          'Use a board the way a student does, in the real learner app: taps and drags on the page, in order. A prop on its own page (`library/props/<package>/<type>`) takes the same steps, its parts named as in its address ("handle"), and `call` steps that do its actions as a lesson would (targets by address: a piece, or piece/part, e.g. game/giveRound, qr with text "q = 5"). The app\'s own player decides what happens; nothing is simulated. Starts from a fresh board as a student meets it, unless `continue: true` goes on from where your last call left it (it fails, saying why, when that board isn\'t there). Returns one line per step: what it set off, everything the student sees that changed (each part was → now in full, + appeared, − gone, an input off → on, and hidden facts), signals, whether the board was passed, errors in full; then whether the board is passed. One picture: before | after, cut to the pieces that changed (`full: true` for the whole board; `shots: "each"` for a strip of every step, `"none"` for none).',
        inputSchema: {
          at: z
            .string()
            .min(1)
            .describe(
              'A board, by address ("content/class10-maths/real-numbers/division-lemma/story"), or a prop on its own ("library/props/primes/stickMeasure").',
            ),
          state: z
            .record(z.unknown())
            .optional()
            .describe("A prop on its own: the fields it starts from, over its defaults."),
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
          frames: z
            .object({
              every: z.number().int().min(50).max(2000).optional(),
              most: z.number().int().min(1).max(24).optional(),
            })
            .strict()
            .optional()
            .describe(
              "Watch the board move after each step, at real speed: a picture about every `every` ms (default 100), keeping the ones that differ, at most `most` (default 6); the frames come back in order, four to a row, with each frame's time, and each step says `still after 1.2s` or `still changing at 3s`. Ask for it when the motion is the point (a walk, a glide), or something should stay still; the default is the settled board only.",
            ),
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
        const address = parseAddress(args.at);
        const given = stateOf(args, address.root === "props");
        if (address.root === "props") {
          if (address.part !== undefined)
            throw new Error("Steps act on the whole prop: its address without #part.");
          const prop = onProp(address);
          await progressOf(extra)("playing");
          const { at: _, steps, ...rest } = args;
          return answer(
            await play(
              root,
              { ...rest, ...given, board: prop.board, steps: prop.steps(steps) },
              lane,
            ),
            [],
          );
        }
        if (args.steps.some((s) => "call" in s))
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
        const { at: _, steps, ...rest } = args;
        return answer(
          await play(
            root,
            { ...rest, board, steps: steps.filter((s): s is Step => !("call" in s)) },
            lane,
          ),
          notes,
        );
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
