import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
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
  Role,
  Status,
  Weight,
  applyChange,
  fileHomeOf,
  isUnanswered,
  readComments,
  waitsOn,
} from "../comments";
import { buildInputsKey, isBuildCurrent } from "../content/inputs";
import { findUp } from "../find-up";
import { pipelineLines, readChapters } from "../pipeline";
import { libraryText, usesOf } from "../prop-text";
import { DEPTHS, changesFrom, changesFromGit, describeReach, reachIndex } from "../reach";
import {
  type Played,
  type VersionDiff,
  keepPlayed,
  keepPlays,
  playAnswer,
  playDiff,
  playsOf,
  shownDiffs,
  shownOf,
} from "../reach/shown";
import { changesUnder, changesWords, passUnder } from "../reviewed";
import {
  DEFAULT_LANE,
  type Step,
  previewBase,
  shoot,
  timed,
  withNothingDrawing,
} from "./app-driver";
import {
  type Answer,
  type PlayDrawn,
  check,
  drawShown,
  look,
  play,
  playLines,
  readReach,
  targetOf,
} from "./look";
import { compose } from "./picture";
import { type Content, type Extra, createServer, progressOf, result } from "./protocol";
import { typeSite } from "./sites";
import { settledHere, threadAt, threadsAnswer } from "./threads-text";

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

type Applied = { ok: boolean; error?: string; thread?: Filed };

/** How many plays are played again at once (changes); CHALK_PLAY_PAGES to measure another. */
/**
 * What a `changes` answer's pictures may cost the agent reading it, in tokens: the answer must
 * arrive whole, words first. Seen: 201 pictures (39.5 MB) closed the connection; 12 large ones
 * (4.8 MB) passed an agent's 25,000-token limit, and all but one were cut off.
 */
const CHANGES_PICTURE_TOKENS = 12_000;

/**
 * A picture's cost to the model reading it, from its size: its long side is brought to 1,568 px at
 * most, then about one token for each 750 pixels.
 */
function pictureTokens(png: Buffer): number {
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const fit = Math.min(1, 1568 / Math.max(width, height));
  return Math.ceil((width * fit * (height * fit)) / 750);
}

const PLAY_PAGES = Number(process.env.CHALK_PLAY_PAGES ?? 3);

/** One change, as the caller's role: the writer (comments.ts) says what it did or why not. */
async function changeComments(who: Who, change: Record<string, unknown>): Promise<Applied> {
  return applyChange(root, change as Change, who);
}

async function readAll(): Promise<{ threads: Filed[] }> {
  return { threads: readComments(root).threads };
}

/** A write's result: the thread's status and whose turn it is now (a role's). */
function turnOf(t: Filed | undefined): string {
  if (t === undefined) return "";
  const on = waitsOn(t);
  return ` [${t.status}${on === undefined ? "" : `, the ${on}'s turn`}]`;
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
/** Where an answer's pictures go. */
type Pictures = "inline" | "files" | "none";
/** Pictures an answer carries inline at most: more, and an answer is cut off by the client. */
const MAX_INLINE = 6;
/** How many written pictures are kept (.chalk-shots/, ignored by git): the oldest go first. */
const KEEP_SHOTS = 200;

/** Writes a picture to .chalk-shots/, keeping the newest KEEP_SHOTS; gives its path. */
function writeShot(root: string, png: Buffer): string {
  const dir = join(root, ".chalk-shots");
  mkdirSync(dir, { recursive: true });
  const old = readdirSync(dir).sort();
  for (const name of old.slice(0, Math.max(0, old.length - KEEP_SHOTS + 1)))
    rmSync(join(dir, name));
  const path = join(
    dir,
    `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 6)}.png`,
  );
  writeFileSync(path, png);
  return path;
}

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
    [Role.Fixer]: ["show", "affected", "comments", "comment", "ask", "pipeline"],
    [Role.Reviewer]: ["show", "changes", "comments", "comment", "ask", "pipeline"],
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
          "Every chapter's planning files (plan.md, boards.md) and lessons: each file's state (plan.md: draft, approved, changed since approved), its failing checks, what is to be checked again, why the plan's approval can't be given yet, which lessons wait on a self-review, and how many of each lesson's boards and families are built and reviewed. `at` keeps to one book or chapter (\"authoring/books/class9-maths/coordinate-geometry\").",
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

  /** A reviewer's play, asked again: the same steps, on the same version. */
  const playArgsOf = (board: string, p: Played) => ({
    board,
    steps: p.steps as Step[],
    ...(p.locale === undefined ? {} : { locale: p.locale as "en" | "hi" }),
    ...(p.screen === undefined ? {} : { screen: p.screen }),
  });

  /** What a reviewer's play did then, said in today's words (an older play: as it was kept). */
  const thenLines = (board: string, p: Played) =>
    p.drawn === undefined
      ? p.answer
      : playLines(playArgsOf(board, p), p.drawn as PlayDrawn).join("\n");

  /** A play whose first step didn't run when it was made (a part that wasn't there): it showed nothing. */
  const isStale = (p: Played) => /^1\. .*didn't run/m.test(p.answer);

  /** A play done again now: what it did, or why it couldn't be done at all. */
  type Again = { lines: string } | { failed: string };

  /**
   * Each board's reviewer plays, done again as built now: all together, on PLAY_PAGES pages,
   * whatever board they are on, as the reviewer asked them (the drawing engine's cache answers a
   * play nothing it is made from changed under). One that can't be done says why; the rest go on.
   */
  const playsNow = async (boards: readonly string[]): Promise<Map<string, Again[]>> => {
    const out = new Map<string, Again[]>();
    const todo: { board: string; p: Played; i: number }[] = [];
    for (const board of boards) {
      const kept = playsOf(root, board).filter((p) => !isStale(p));
      out.set(board, new Array<Again>(kept.length));
      for (const [i, p] of kept.entries()) todo.push({ board, p, i });
    }
    let next = 0;
    const worker = async (k: number) => {
      for (let j = next++; j < todo.length; j = next++) {
        const { board, p, i } = todo[j] as (typeof todo)[number];
        const on = k === 0 ? lane : `${lane}:v:${k}`;
        let again: Again;
        try {
          const a = await play(root, playArgsOf(board, p), on);
          again = {
            lines:
              a.played === undefined
                ? playAnswer(a.text)
                : playLines(playArgsOf(board, p), a.played).join("\n"),
          };
        } catch (error) {
          again = {
            failed: error instanceof Error ? (error.message.split("\n")[0] ?? "") : String(error),
          };
        }
        (out.get(board) as Again[])[i] = again;
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(PLAY_PAGES, todo.length) }, (_, k) => worker(k)),
    );
    return out;
  };

  /**
   * How a play does now against then: undefined when every step does the same; else the first step
   * that differs, as then and now, led by "couldn't redo" when a step now fails that ran then.
   */
  const playNow = (
    p: Played,
    then: string,
    again: Again | undefined,
  ): { line: string; isUndoable: boolean } | undefined => {
    const undoable = (why: string) => ({
      line: `couldn't redo this play: ${playWords(p)}: ${why}`,
      isUndoable: true,
    });
    if (again === undefined) return undoable("not played");
    if ("failed" in again) return undoable(again.failed);
    // A refused step lists the parts there are; their order isn't what the play did.
    const sorted = (text: string) =>
      text.replace(
        /\(parts: ([^)]*)\)/g,
        (_, list: string) => `(parts: ${list.split(", ").sort().join(", ")})`,
      );
    const differs = playDiff(sorted(then), sorted(again.lines));
    if (differs === undefined) return undefined;
    const failsNow = (text: string) =>
      new Set(
        text
          .split("\n")
          .map((l) => /^(\d+)\. .*→ didn't run$/.exec(l)?.[1])
          .filter((n): n is string => n !== undefined),
      );
    const ranThen = failsNow(then);
    const failing = [...failsNow(again.lines)].find((n) => !ranThen.has(n));
    if (failing !== undefined) {
      const lines = again.lines.split("\n");
      const at = lines.findIndex((l) => l.startsWith(`${failing}. `));
      const why = lines
        .slice(at + 1)
        .filter((l) => l.trimStart().startsWith("✗"))
        .map((l) => l.trim())[0];
      // Why it stopped is the difference: what it did before that step is not worth reading.
      return undoable(`step ${failing}${why === undefined ? " didn't run" : `: ${why}`}`);
    }
    return {
      line: `plays differently: ${playWords(p)}\n${differs.replace(/^/gm, "    ")}`,
      isUndoable: false,
    };
  };

  /** A play in a line: its steps as asked. */
  const playWords = (p: Played) =>
    `${(p.steps as Step[]).map((s) => ("tap" in s ? `tap ${s.tap}` : "drag" in s ? `drag ${s.drag}` : "call")).join(", ")}${p.locale === undefined ? "" : ` (${p.locale})`}`;

  /** A version's two pictures, as passed and now (what differs in red), each arriving unshrunk. */
  const diffPictures = async (board: string, d: VersionDiff): Promise<Buffer[]> => {
    // Only what it reads differs (or one side wasn't drawn): no pictures to put side by side.
    const pictures = d.pictures;
    if (d.share === 0 || pictures === undefined) return [];
    const name = board.split("/").at(-1) ?? board;
    const one = (png: Buffer, boxes: typeof pictures.boxes, caption: string) => {
      const picture = {
        png,
        width: pictures.width,
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
        pictures.passed,
        pictures.passedBoxes,
        `${name} · ${d.version} · as seen in the review`,
      )),
      ...(await one(
        pictures.now,
        pictures.boxes,
        `${name} · ${d.version} · now (what differs in red)`,
      )),
    ];
    return pngs;
  };

  offer(
    server.registerTool(
      "changes",
      {
        title: "What changed since it was reviewed",
        description:
          "Every board at or under an address (a lesson, a chapter, its questions, one board) against what was reviewed: unchanged since passed (nothing to look at), changed (which pieces' setup, words or rules changed, and each function of the code it runs that changed, as file#name, with whether it ran in the review), new (never passed), or gone. A changed board, or a new one a reviewer has seen, is also drawn now in every version, as `show` draws it, against what a reviewer last saw of it (a reviewer's `show` without steps, kept as it is drawn): \"shows the same in every version\", or each version that differs (which pieces, how much; a version drawn on one side only), with its pictures as seen and now, cut to what differs (in red); and a reviewer's plays on it (each `show` with steps, kept as it is made) done again, each step that now answers differently said as then and now, a step that can't be done now as \"couldn't redo\". Nothing is drawn for a board that hasn't changed. Start a review here: show and play only what changed. When a review is done and nothing is left open, `pass: true` records every board there as passed (approved), as built now, by you. What you saw is kept as you show and play, whether or not you pass.",
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
          // A pass takes the boards as they are now: a kept play that can't be done on them now
          // (a part since gone) is no longer part of what was seen, and goes.
          const boards = changesUnder(root, under)
            .filter((c) => c.status !== "gone")
            .map((c) => c.board)
            .filter((b) => playsOf(root, b).some((p) => !isStale(p)));
          await progress("playing the review's plays again");
          const playedNow = await playsNow(boards);
          let dropped = 0;
          for (const board of boards) {
            // Those whose first step didn't run even then go too: they never showed anything.
            const all = playsOf(root, board);
            const kept = all.filter((p) => !isStale(p));
            const again = playedNow.get(board) ?? [];
            const keep = kept.filter(
              (p, i) => playNow(p, thenLines(board, p), again[i])?.isUndoable !== true,
            );
            dropped += all.length - keep.length;
            if (keep.length !== all.length) keepPlays(root, board, keep);
          }
          const n = passUnder(root, under, NAME);
          return result([
            text(
              [
                `✓ ${n} board${n === 1 ? "" : "s"} passed by ${NAME}, as built now.`,
                ...(dropped === 0
                  ? []
                  : [
                      `${dropped} kept play${dropped === 1 ? "" : "s"} that can't be done on the board now let go: not checked again.`,
                    ]),
                ...notes,
              ].join("\n"),
            ),
          ]);
        }
        const changes = changesUnder(root, under);
        const images: Content[] = [];
        const leftOut: string[] = [];
        let spent = 0;
        const seen = new Map<string, string[]>();
        // Every board changed since passed, or never passed, that a reviewer has seen (the old
        // side), against the board now (the new side): drawn, or the engine's cache answering.
        const changed = changes.filter((c) => c.status === "changed" || c.status === "new");
        const toCompare = changed.filter((c) => shownOf(root, c.board) !== undefined);
        await progress(`drawing ${toCompare.length} board${toCompare.length === 1 ? "" : "s"}`);
        const now = await drawShown(
          root,
          toCompare.map((c) => c.board),
          lane,
        );
        await progress("playing the review's plays again");
        const playedNow = await timed("changes: replay plays", () =>
          playsNow(toCompare.map((c) => c.board)),
        );
        for (const c of changed) {
          // What a reviewer last saw of it: its drawing (shown without steps) and its plays.
          const passed = shownOf(root, c.board);
          const drawnNow = now.get(c.board);
          if (passed === undefined || drawnNow === undefined) {
            seen.set(c.board, ["shows: no reviewer has shown it on this machine yet: show it"]);
            continue;
          }
          const diffs = await timed("changes: compare pictures", async () =>
            shownDiffs(passed, drawnNow),
          );
          // A reviewer's plays on it, done again: the first step of each that does differently.
          const plays: string[] = [];
          const kept = playsOf(root, c.board).filter((p) => !isStale(p));
          const again = playedNow.get(c.board) ?? [];
          for (const [i, p] of kept.entries()) {
            const now = playNow(p, thenLines(c.board, p), again[i]);
            if (now !== undefined) plays.push(now.line);
          }
          const playLine =
            kept.length === 0
              ? []
              : plays.length === 0
                ? [
                    `plays the same: the review's ${kept.length} play${kept.length === 1 ? "" : "s"}`,
                  ]
                : plays;
          if (diffs.length === 0) {
            seen.set(c.board, ["shows: the same in every version", ...playLine]);
            continue;
          }
          seen.set(c.board, [
            ...diffs.map((d) =>
              d.missing !== undefined
                ? `shows, ${d.version}: ${d.missing.side === "now" ? `couldn't draw it now${d.missing.why === undefined ? "" : `: ${d.missing.why}`}` : "not seen in the review (show it)"}`
                : `shows, ${d.version}: ${[
                    ...(d.read.length > 0 ? [`reads differently: ${d.read.join(", ")}`] : []),
                    ...(d.newFields !== undefined
                      ? [`new fields, not there then: ${d.newFields.join(", ")}`]
                      : []),
                    ...(d.share > 0
                      ? [
                          `${d.share < 0.001 ? "under 0.1%" : `${(d.share * 100).toFixed(1)}%`} of it looks different${d.pieces.length > 0 ? `, in ${d.pieces.join(", ")}` : ""}`,
                        ]
                      : []),
                  ].join("; ")}`,
            ),
            ...playLine,
          ]);
          // The pictures of what looks different, while the answer stays small enough to arrive
          // whole: past the budget, a board's differences are said in words, its pictures a `show`
          // away. (A board that only reads differently has no pictures to leave out.)
          // One version pictured (the first that looks different, as passed and now): the rest are
          // said in words above, and a `show` of that version brings its pictures.
          const first = diffs.find((d) => d.share > 0);
          const pngs = first === undefined ? [] : await diffPictures(c.board, first);
          const cost = pngs.reduce((sum, png) => sum + pictureTokens(png), 0);
          if (pngs.length === 0) continue;
          if (spent + cost > CHANGES_PICTURE_TOKENS) {
            leftOut.push(c.board);
            continue;
          }
          spent += cost;
          for (const png of pngs)
            images.push({ type: "image", data: png.toString("base64"), mimeType: "image/png" });
        }
        const cut =
          leftOut.length === 0
            ? []
            : [
                `Pictures left out, to keep the answer whole: ${leftOut.length} more board${leftOut.length === 1 ? "" : "s"} look different, said above; show each to see it: ${leftOut.map((b) => contentAddress(b)).join(", ")}`,
              ];
        return result([
          text([changesWords(changes, seen), ...cut, ...notes].join("\n")),
          ...images,
        ]);
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
        repeat: z
          .number()
          .int()
          .min(1)
          .max(20)
          .optional()
          .describe("Tap it this many times, each played to its end (→ three blocks: repeat 3)."),
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
    const built = await timed("build content", () =>
      withNothingDrawing(() =>
        isBuildCurrent(root) ? Promise.resolve(undefined) : buildContent(extra.signal),
      ),
    );
    if (built === undefined || built.code === 0) return [];
    return [
      `build-content failed:\n${built.out
        .split("\n")
        .filter((l) => l.includes("✗") || l.startsWith("    "))
        .join("\n")}`,
    ];
  };

  /**
   * An answer: its words, then its pictures, inline (at most MAX_INLINE: the rest are written to
   * files, said in the answer, never left out unsaid), all to files, or none.
   */
  const answer = (a: Answer, notes: readonly string[], pictures: Pictures = "inline") => {
    const images = a.images ?? [];
    const inline = pictures === "inline" ? images.slice(0, MAX_INLINE) : [];
    const written = (
      pictures === "files" ? images : pictures === "inline" ? images.slice(MAX_INLINE) : []
    ).map((png) => writeShot(root, png));
    const said = [
      ...(written.length === 0
        ? []
        : [
            `${written.length} picture${written.length === 1 ? "" : "s"} written to files (Read opens one):`,
            ...written.map((path) => `  ${path}`),
          ]),
      ...(pictures === "none" && images.length > 0
        ? [`${images.length} picture${images.length === 1 ? "" : "s"} left out (pictures: "none").`]
        : []),
    ];
    return {
      content: [
        text([a.text, ...notes, ...said].join("\n")),
        ...inline.map((png) => ({
          type: "image" as const,
          data: png.toString("base64"),
          mimeType: "image/png",
        })),
      ],
    };
  };

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
          "A board as the real learner app draws it in Chrome, from its start, after the steps if any: every call opens it afresh, so the same call always answers the same. Without steps, it plays on its own to its end (its lines said, its moves done) and is checked in English and Hindi on a small phone (360×640), a laptop column (640) and a projector (640×720), unless `locales`/`screens` ask for fewer: a picture of each version, ok or its problems, and what you pointed at. A board: one line per piece (type, line, its state where it isn't as it started) and its script. A piece or part (`…/<board>#game`, `…#game/plates`): just it, and everything about it: where it's written (path:line, every helper it went through, a question's params.yaml row), its setup (options in the order shown, each with its line), its state, values worked out from others, what can be done to it now (each action's line) and where each part is drawn. A lesson or a question family: in words, its boards (each drawn alone in every version) and the boards with problems in any version; no pictures: show a board on its own to see it. A chapter or a book: no pictures, a check of every board in every version, with progress (it can be cancelled). The library (`library/props/`, or one package): a line per prop: address, role, what it is for, how many boards use it. A prop on its own (`library/props/primes/stickMeasure`, from its defaults or `state`): as for a piece, then every board that uses it, the fields it sets, and what no board or only one uses. With `steps` (one board, or a prop on its own page): what a student does, in order, on one version (the phone in English unless one language and one screen are named): each step, unless `during` names a line, is done once the board has come to its end, and says what it set off and everything the student sees that changed (was → now, + appeared, − gone), what was said, and whether the board passed; then a picture before | after, cut to what changed (`full`, `shots`). A prop on its own page also takes `call` steps (its actions, as a lesson would). To go on from where a call left off, send its steps again with more. Rebuilds content first if anything changed. Use it after every content or prop change, before saying something looks right.",
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
          plays: z
            .array(z.array(step).min(1).max(40))
            .min(1)
            .max(200)
            .optional()
            .describe(
              "Many plays on one board at once (a sweep: Riya to every square, each scale), each from the board's start, a few side by side: only the plays with a problem (a step that couldn't be taken, layout problems at the end) come back, each with its steps. No pictures.",
            ),
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
          pictures: z
            .enum(["inline", "files", "none"])
            .optional()
            .describe(
              `Where pictures go: in the answer (default; more than ${MAX_INLINE} and the rest are written to files), all written to files (paths in the answer, opened one at a time), or none.`,
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
        const say = (a: Answer, n: readonly string[]) => answer(a, n, args.pictures);
        const address = parseAddress(args.at);
        const given = stateOf(args, address.root === "props");
        // A tap repeated is that tap that many times.
        const unrepeat = (list: readonly GivenStep[]): GivenStep[] =>
          list.flatMap((s) => {
            if (!("tap" in s) || s.repeat === undefined) return [s];
            const { repeat, ...one } = s;
            return Array.from({ length: repeat }, () => one);
          });
        if (args.plays !== undefined) {
          const at = contentPath(args.at);
          if (at.part !== undefined || !listBoards(root).some((b) => b.board === at.path))
            throw new Error("Plays act on one board: name a board.");
          const plays = args.plays.map(unrepeat);
          const bad: string[] = [];
          let next = 0;
          const worker = async (k: number) => {
            for (let i = next++; i < plays.length && !extra.signal.aborted; i = next++) {
              const steps = (plays[i] ?? []).filter((s) => !("call" in s)) as Step[];
              const played = await play(
                root,
                {
                  board: at.path,
                  steps,
                  shots: "none",
                  ...(args.locales?.[0] === undefined ? {} : { locale: args.locales[0] }),
                },
                `${lane}:plays:${k}`,
              );
              const lines = played.text.split("\n");
              const wrong = lines.filter((l) => l.includes("✗")).map((l) => l.trim());
              const from = lines.findIndex((l) => l.startsWith("problems now"));
              const problems =
                from < 0 ? [] : lines.slice(from + 1).filter((l) => l.startsWith("  "));
              if (wrong.length > 0 || problems.length > 0)
                bad.push(
                  `play ${i + 1}: ${steps.map((s) => ("tap" in s ? s.tap.split("/").at(-1) : "drag" in s ? `${s.drag.split("/").at(-1)}→(${s.to.x}, ${s.to.y ?? ""})` : "")).join(", ")}`,
                  ...wrong.map((w) => `  ${w}`),
                  ...problems.map((p) => `  ${p.trim()}`),
                );
              await progressOf(extra)(`played ${i + 1} of ${plays.length}`);
            }
          };
          await Promise.all([0, 1, 2].map(worker));
          const badCount = bad.filter((l) => l.startsWith("play ")).length;
          return say(
            {
              text: [
                `${args.at}: ${plays.length} plays · ${plays.length - badCount} ok · ${badCount} with problems`,
                ...bad,
              ].join("\n"),
            },
            notes,
          );
        }
        if (args.steps !== undefined) {
          const { steps: asked, plays: _p, locales, screens, at: _, play: __, ...rest } = args;
          const steps = unrepeat(asked);
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
            return say(
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
          const onBoard: Step[] = steps.filter((s) => !("call" in s)) as Step[];
          const played = await play(
            root,
            { ...one, board, steps: onBoard, isSeen: ROLE === Role.Reviewer },
            lane,
          );
          // A reviewer's play on the jumping clock is what it saw: kept for `changes` to play again
          // once the board changes (reach/shown.ts). A fixer's isn't: it would hide a change.
          // A play whose first step didn't run (a part that isn't there) shows nothing: not kept.
          const playedAnswer = playAnswer(played.text);
          if (
            ROLE === Role.Reviewer &&
            args.speed === undefined &&
            args.frames === undefined &&
            !/^1\. .*didn't run/m.test(playedAnswer)
          )
            keepPlayed(root, board, {
              steps: onBoard,
              ...(one.locale === undefined ? {} : { locale: one.locale }),
              ...(one.screen === undefined ? {} : { screen: one.screen }),
              answer: playedAnswer,
              ...(played.played === undefined ? {} : { drawn: played.played }),
              inputs: buildInputsKey(root),
            });
          return say(played, notes);
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
          return say(
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
          return say(
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
          // A book or chapter: its screen too (titles, art, each lesson's circle, the first card),
          // as a child meets it, so its art and names are looked at with its boards.
          if (at.part === undefined && at.path !== "" && at.path.split("/").length <= 2) {
            const drawn = await shoot(root, at.path, { pictures: "full" }, undefined, lane);
            const screen = drawn.shots[0];
            if (screen !== undefined)
              return say(
                {
                  ...a,
                  text: `${a.text}\n\nIts screen, as a child meets it (each lesson's art: pnpm art, or tap its circle in the preview):`,
                  images: [...(a.images ?? []), screen.png],
                },
                notes,
              );
          }
          return say(a, notes);
        }
        await progressOf(extra)("drawing");
        return say(
          await look(root, target, { ...args, isSeen: ROLE === Role.Reviewer }, where, lane),
          notes,
        );
      },
    ),
    "show",
  );

  offer(
    server.registerTool(
      "comments",
      {
        title: "Read comments",
        description: `Read threads: the person's (from the preview, the editor, or said in your chat), reviewers' findings (each with its weight: must or consider) and agents' questions (an ask has options; the person's answer is a reply, often an option's label). Each says whose turn it is: the person's, the fixer's or the reviewer's. Filter by \`at\`: threads at or under an address (a chapter, a board, a prop, a planning file, a guide file or folder). The threads still open (open, planned, ready) come in full: address, source line, what it showed, every message (a plan is its planned message); settled ones (closed, withdrawn) are counted, \`closed: true\` to read them too. \`id\`: one thread in full, settled or not. \`unanswered: true\`: only what waits on you (a ${ROLE}).`,
        inputSchema: {
          at: z
            .string()
            .optional()
            .describe(
              'An address: threads at or under it ("content/class10-maths/real-numbers", "library/props/basics/choice"), or a file or folder under authoring/: a planning file ("authoring/books/class9-maths/coordinate-geometry/plan.md"), a guide file or folder ("authoring/guide.md", "authoring/guide", "authoring/books/class9-maths/guide.md").',
            ),
          unanswered: z
            .boolean()
            .optional()
            .describe(`Only the threads on your turn (a ${ROLE}'s).`),
          closed: z
            .boolean()
            .optional()
            .describe("Settled threads (closed, withdrawn) in full too: what was decided."),
          id: z.string().optional().describe("One thread, in full, settled or not."),
        },
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async (args) => {
        const { threads } = await readAll();
        let found = threads;
        if (args.at?.startsWith("authoring/")) {
          // A file or folder under authoring/ (planning, guide): the threads written on it, by their source line.
          const prefix = args.at.replace(/\/$/, "");
          found = found.filter((c) => (c.source ?? "").startsWith(prefix));
        } else if (args.at !== undefined) {
          const prefix = formatAddress(parseAddress(args.at)).replace(/\/$/, "");
          found = found.filter((c) => {
            const at = threadAt(c);
            return at === prefix || at.startsWith(`${prefix}/`) || at.startsWith(`${prefix}#`);
          });
        }
        if (args.unanswered) found = found.filter((t) => isUnanswered(t, ROLE));
        return result([text(threadsAnswer(threads, found, args))]);
      },
    ),
    "comments",
  );

  /** What each status move means, for the role that may make it. */
  const MOVE_WORDS: Record<Status, string> = {
    [Status.Planned]:
      "planned: what you will do, after the person's go in chat (again to revise it)",
    [Status.Ready]:
      "ready: what you did; needs a plan first and an answer to any reviewer's words on it; the files changed since its plan are recorded",
    [Status.Open]: "open: reopen it",
    [Status.Closed]:
      "closed: done, on a thread you opened once it is back on your turn (its fix holds, its question is answered and acted on)",
    [Status.Withdrawn]: "withdrawn: take back a thread you started that became moot (say why)",
  };

  /**
   * Where a thread is, from an address: a board or something on it, a prop or a part of it, or a
   * file under authoring/ (a guide file, or a chapter's planning file) with the exact words it is
   * about (`quote`). Says what's wrong when it names none of these.
   */
  const placeOf = (
    at: string,
    quote: string | undefined,
    isWholeFile = false,
  ):
    | { board?: string; target?: string; prop?: string; source?: string; quote?: string }
    | string => {
    const clean = at.trim();
    if (clean.startsWith("authoring/")) {
      const file = clean.split("#")[0] ?? clean;
      if (fileHomeOf(file) === undefined)
        return `${file}: a thread on a file is on a guide file (authoring/guide.md, authoring/guide/…, a book's guide.md or guide/…) or a chapter's file (authoring/books/<book>/<chapter>/…)`;
      if (!existsSync(join(root, file)) || !statSync(join(root, file)).isFile())
        return `no file ${file}`;
      if (quote === undefined || quote.trim() === "") {
        if (isWholeFile) return { source: `${file}:1` };
        return "a thread on a file quotes the words it is about (quote)";
      }
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
      return "a thread is on a board, a prop, a planning file or a guide file: give one's address, not the library's";
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
          'Where, by address. A board or something on it ("content/…/<board>#piece/part"), a prop wherever it is used ("library/props/<package>/<type>", or #part), or a file under authoring/ with quote: a planning file ("authoring/books/<book>/<chapter>/plan.md") or a guide file ("authoring/guide.md", "authoring/guide/examples.md", "authoring/books/<book>/guide.md" or guide/…). With id: re-point that thread here, its place being gone (the text says where it went and why).',
        ),
      quote: z
        .string()
        .optional()
        .describe("On a planning or guide file: the exact words the thread is about, as written."),
      turn: z
        .nativeEnum(Role)
        .optional()
        .describe(
          "Whose turn it is after this write, when not what the write says by itself (a question for the person: use `ask`). Left out: the person's words and a reviewer's are the fixer's to answer; a plan is the fixer's; ready goes back to whoever opened the thread; a fixer's words are the reviewer's on a reviewer's finding, else the person's.",
        ),
      ...(ROLE === Role.Reviewer
        ? {
            weight: z
              .nativeEnum(Weight)
              .optional()
              .describe(
                "A new finding: how much it weighs (required). must: the fixer fixes it; consider: the fixer decides, and says what it did.",
              ),
          }
        : {}),
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
    turn?: Role;
    weight?: Weight;
    from?: "chat";
    plan?: string;
  };

  offer(
    server.registerTool(
      "comment",
      {
        title: "Write on threads",
        description: `Write on threads, or start them; one or many at once. With \`id\`: write on that thread${MY_MOVES.length > 0 ? ", maybe moving its status" : ""}. With \`at\` (no id): start a thread there${ROLE === Role.Reviewer ? " (a finding, with its weight)" : ""}. Whoever opened a thread closes it, once it is back on their turn; the person may close any. A question for the person is \`ask\`, not a thread here. You write as a ${ROLE}${NAME === ROLE ? "" : ` (${NAME})`}: this tool offers only what a ${ROLE} may do, and the writer refuses anything else.`,
        inputSchema: {
          items: z.array(write).default([]),
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
      },
      async ({ items: given }) => {
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
              ...(item.weight ? { weight: item.weight } : {}),
              ...(item.from ? { from: item.from } : {}),
              text: item.text,
            },
          });
          if (!done.ok || done.thread === undefined) {
            lines.push(`✗ ${done.error}`);
            continue;
          }
          // What was settled on the same thing before: said now, when it may be raised again.
          const settled = settledHere((await readAll()).threads, done.thread);
          if (item.plan === undefined) {
            lines.push(`✓ ${done.thread.id} on ${on}${turnOf(done.thread)}`, ...settled);
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
            ...settled,
          );
        }
        return result([text(lines.join("\n") || "Nothing to do.")]);
      },
    ),
    "comment",
  );

  offer(
    server.registerTool(
      "ask",
      {
        title: "Ask the person",
        description:
          "When you are stuck or at a real decision, ask the person here, never in prose: a question with two to four options in order of recommendation (the first is your pick), each with a short label and why, pinned where it applies. It starts a thread with the options, on the person's turn; the editor shows them as buttons and a box for his own words. His answer is a reply on it (an option's label, or his words), and it comes back to the fixer's turn: read it with `comments` (`unanswered: true`). Concise: he reads the question, the labels and the whys, nothing else.",
        inputSchema: {
          question: z.string().min(1).describe("The question, in a sentence or two."),
          options: z
            .array(
              z
                .object({
                  label: z.string().min(1).describe("The answer, in a few words: what he clicks."),
                  why: z.string().min(1).describe("Why, or what follows from it, in a line."),
                })
                .strict(),
            )
            .min(2)
            .max(4)
            .describe("Two to four, your recommendation first."),
          at: z
            .string()
            .describe(
              'Where it applies, by address: a board or a piece ("content/…/<board>#piece"), a prop ("library/props/<package>/<type>"), or a file under authoring/: a planning file ("authoring/books/<book>/<chapter>/plan.md") or a guide file ("authoring/guide.md", "authoring/guide/…", "authoring/books/<book>/guide.md" or guide/…), with quote for its words, without for the whole file.',
            ),
          quote: z
            .string()
            .optional()
            .describe(
              "On a planning or guide file: the exact words it is about. Left out: the whole file.",
            ),
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
      },
      async ({ question, options, at, quote }) => {
        const place = placeOf(at, quote, true);
        if (typeof place === "string") return result([text(`✗ ${place}`)]);
        const done = await changeComments(who, {
          op: "start",
          thread: { ...place, text: question, options },
        });
        if (!done.ok || done.thread === undefined) return result([text(`✗ ${done.error}`)]);
        return result([
          text(
            `✓ asked: ${done.thread.id} on ${at.trim()}${turnOf(done.thread)}. His answer comes back as a reply on it.`,
          ),
        ]);
      },
    ),
    "ask",
  );

  return server;
}
