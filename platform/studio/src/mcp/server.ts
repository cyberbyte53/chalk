import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { boardName, listBoards, readSources } from "../boards";
import {
  type Comment,
  CommentStatus,
  chapterOf,
  listComments,
  newCommentId,
  writeComment,
} from "../comments";
import { isBuildCurrent } from "../content/inputs";
import { findUp } from "../pronunciations";
import { closeBrowser, previewUrl, shoot } from "./preview";
import { type Content, type Extra, createServer, progressOf, result, serveStdio } from "./protocol";

/**
 * `chalk` MCP server: what an agent in any harness (Cursor, VS Code, Claude Code, Codex…) needs to
 * work on Chalk content that a file editor doesn't give it — eyes on the rendered board, the
 * comments files, the prop library, and the checks. Start: platform/studio/node_modules/.bin/tsx
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

/** Files changed in content/ since the last commit (edited, added, untracked). */
function changedFiles(): Set<string> {
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
  try {
    return new Set([
      ...git("diff", "--name-only", "HEAD", "--", "content"),
      ...git("ls-files", "--others", "--exclude-standard", "--", "content"),
    ]);
  } catch {
    return new Set();
  }
}

/** Files changed outside content/ since the last commit (props, patterns, platform). */
function changedOutsideContent(): string[] {
  try {
    return execFileSync("git", ["diff", "--name-only", "HEAD", "--", "library", "platform"], {
      cwd: root,
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

const fileOf = (site: string) => site.replace(/:\d+$/, "");

function commentLine(f: Comment & { file: string }): string {
  const last = f.thread.at(-1);
  return [
    `• ${f.id} [${f.status}] ${f.on ?? `${f.chapter} plan`}${f.piece ? ` · ${f.piece}` : ""}`,
    `  source: ${f.source ?? "?"}   file: ${f.file}`,
    `  “${f.text.replace(/\s+/g, " ").slice(0, 300)}”`,
    ...(f.quote ? [`  quote: ${String(f.quote).slice(0, 200)}`] : []),
    ...(last ? [`  last (${last.by}): ${last.text.replace(/\s+/g, " ").slice(0, 200)}`] : []),
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
  type Piece = { name?: string; prop?: string; children?: Piece[] };
  for (const b of listBoards(root)) {
    let item: { board?: { root?: Piece } };
    try {
      item = JSON.parse(readFileSync(join(root, "build", `${b.board}.json`), "utf8"));
    } catch {
      continue;
    }
    const walk = (piece: Piece | undefined): void => {
      if (piece === undefined) return;
      if (piece.prop !== undefined && types.has(piece.prop) && piece.name !== undefined)
        out.push({
          board: b.board,
          piece: piece.name,
          type: piece.prop,
          ...(sources[`${b.board}.json`]?.pieces[piece.name]
            ? { site: sources[`${b.board}.json`]?.pieces[piece.name] }
            : {}),
        });
      for (const child of piece.children ?? []) walk(child);
    };
    walk(item.board?.root);
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

server.registerTool(
  "affected",
  {
    title: "What a change reaches",
    description:
      "What a change reaches, before or after you make it. Give files or folders (library/props/circles, library/patterns/words.ts, platform/packages/player/src/runtime.ts), or nothing for everything changed since the last commit. For a prop package, or just the prop types in `props` (e.g. valueMachine): every place they are placed (board, piece, source line), grouped by chapter. For anything else: the chapters whose last build read it. Use it before changing a prop or a pattern, then render_board the boards it lists.",
    inputSchema: {
      files: z.array(z.string()).optional().describe("Files or folders, repo-relative."),
      props: z
        .array(z.string())
        .optional()
        .describe("Only these prop types (e.g. valueMachine), not every prop in a package."),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async (args) => {
    const given = args.files ?? [];
    const only = args.props === undefined ? null : new Set(args.props);
    const named =
      only === null ? [] : [...only].map((t) => packageOfType(t)).filter((f) => f !== undefined);
    const files =
      given.length > 0 || named.length > 0
        ? [...given, ...named]
        : [...changedFiles(), ...changedOutsideContent()];
    if (files.length === 0) return result([text("Nothing changed since the last commit.")]);
    const out: string[] = [];
    // Props: the exact places each prop type is placed.
    const types = new Set([...propTypesIn(files)].filter((t) => only === null || only.has(t)));
    if (types.size > 0) {
      const places = placesOf(types);
      out.push(
        `${[...types].map((t) => `\`${t}\``).join(", ")}: ${places.length} place${places.length === 1 ? "" : "s"}${places.length === 0 ? " (no board places them)" : ""}`,
      );
      const byChapter = new Map<string, typeof places>();
      for (const p of places) {
        const chapter = p.board.split("/").slice(0, 2).join("/");
        byChapter.set(chapter, [...(byChapter.get(chapter) ?? []), p]);
      }
      for (const [chapter, list] of byChapter) {
        out.push(`\n${chapter} (${list.length})`);
        for (const p of list.slice(0, 40))
          out.push(
            `  • ${p.board.slice(chapter.length + 1)} · \`${p.piece}\` (${p.type}) → ${p.site ?? "?"}`,
          );
        if (list.length > 40)
          out.push(`  … ${list.length - 40} more: boards { under: "${chapter}" }`);
      }
    }
    // Anything else: chapters whose last build read it. Not for prop packages, whose places are
    // listed above: every build reads every package through the prop registry, so that list
    // would be every chapter.
    const other = files.filter((f) => !/^library\/props\/[^/]+/.test(f));
    const hits = other.length > 0 ? chaptersReading(other) : [];
    if (hits.length > 0)
      out.push(
        `\nChapters whose build reads ${other.join(", ")}: ${hits.map((h) => h.chapter).join(", ")}`,
      );
    if (out.length === 0)
      out.push(
        `Nothing reads ${files.join(", ")} (as of each chapter's last build; run the check tool if content isn't built yet).`,
      );
    return result([text(out.join("\n"))]);
  },
);

const step = z.union([
  z
    .object({
      tap: z.string().describe('A piece, or a part of one: "machine" or "machine › put".'),
      text: z
        .string()
        .optional()
        .describe('Inside it, the button or option whose words include this: "−6", "Check".'),
    })
    .strict(),
  z
    .object({
      drag: z.string().describe('A piece or part to drag: "graph › point".'),
      by: z.tuple([z.number(), z.number()]).describe("How far, in pixels: [right, down]."),
    })
    .strict(),
  z.object({ wait: z.number().int().min(0).max(10000).describe("Milliseconds.") }).strict(),
]);

server.registerTool(
  "render_board",
  {
    title: "See (and use) boards",
    description:
      "See boards exactly as a phone draws them (the app's own player, 390px wide), and use them the way a student does. `board` is a board name (build path without .json, e.g. class10-maths/real-numbers/division-lemma/overview/story) or a lesson for all its pages. Returns a PNG per board, where each piece was written (file:line), each piece's parts (what steps can name), layout problems found by measuring (maths past the edge, text out of a button, overlaps), and page errors. With `steps` (one board): taps and drags on the real page, in order, starting from a fresh board (`continue: true` keeps the last call's board as it was left); after each, the events the app raised and whether the board was passed, and a picture (`shots`: last, each or none). The app's own player decides what happens; nothing is simulated. Rebuilds content first if anything changed. Use it after every content or prop change, and before saying something looks or works right.",
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
    for (const s of drawn.shots.slice(0, 10)) {
      const where = sources[`${s.board}.json`];
      const pieces = where
        ? Object.entries(where.pieces)
            .map(
              ([p, site]) =>
                `${p} → ${site}${s.parts[p] ? `  parts: ${s.parts[p].join(", ")}` : ""}`,
            )
            .join("\n")
        : "(no sources: run pnpm build-content)";
      out.push(
        text(
          [
            `## ${s.board}`,
            `board → ${where?.board ?? "?"}`,
            pieces,
            s.overflow.length > 0
              ? `Layout problems:\n${s.overflow.join("\n")}`
              : "Layout problems: none",
            ...(s.errors.length > 0 ? [`Page errors:\n${s.errors.join("\n")}`] : []),
          ].join("\n"),
        ),
      );
      if (s.png.length > 0) out.push(image(s.png));
    }
    for (const [i, r] of drawn.steps.entries()) {
      out.push(
        text(
          [
            `${i + 1}. ${r.step}${r.passed ? "  ✓ board passed" : ""}`,
            ...r.events.map((e) => `   event: ${e}`),
            ...(r.events.length === 0 && r.errors.length === 0 ? ["   (no event)"] : []),
            ...r.errors.map((e) => `   ${e}`),
          ].join("\n"),
        ),
      );
      if (r.png !== undefined) out.push(image(r.png));
    }
    if (drawn.shots.length > 10)
      notes.push(`${drawn.shots.length - 10} more boards not shown; render them one by one.`);
    notes.push(`Open it yourself: ${await previewUrl(root, board, options)}`);
    return result([...out, text(notes.join("\n"))]);
  },
);

server.registerTool(
  "boards",
  {
    title: "List boards",
    description:
      "List boards: every page and question of a chapter or lesson, with its name (for render_board and comments), where it was written, and its preview URL. `changed: true` lists only boards whose source files changed since the last commit — the ones to look at after editing.",
    inputSchema: {
      under: z.string().optional().describe("book/chapter or book/chapter/lesson"),
      changed: z.boolean().optional(),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async (args) => {
    const under = str(args.under);
    let boards = listBoards(root).filter(
      (b) => under === undefined || b.board.startsWith(under) || b.lesson.startsWith(under),
    );
    if (args.changed === true) {
      const changed = changedFiles();
      const sources = readSources(root);
      boards = boards.filter((b) => {
        const where = sources[`${b.board}.json`];
        const files = [where?.board, ...Object.values(where?.pieces ?? {})]
          .filter((s): s is string => s !== undefined)
          .map(fileOf);
        return files.some((f) => changed.has(f));
      });
    }
    if (boards.length === 0)
      return result([text("No boards (is build/ there? run the check tool).")]);
    const base = await previewUrl(root, "").catch(() => "");
    return result([
      text(
        boards
          .slice(0, 300)
          .map((b) => `${b.kind === "page" ? "page" : "q   "} ${b.board}  ← ${b.source ?? "?"}`)
          .join("\n") + (base ? `\n\nPreview: ${base}<board>` : ""),
      ),
    ]);
  },
);

server.registerTool(
  "comments",
  {
    title: "Read comments",
    description:
      "Read the person's (and reviewers') comments: one file per comment in content/<book>/<chapter>/.comments/, or library/props/<package>/.comments/ for a comment on a prop (it names the `prop` and the `part` picked, and applies wherever the prop is used: see `affected`). Each names its board (`on`), piece, source line and status (open → proposed → approved → done, or declined). Filter by chapter/lesson/board prefix and status. Edit the files directly or use comment_update.",
    inputSchema: {
      under: z.string().optional(),
      status: z
        .enum([
          CommentStatus.Open,
          CommentStatus.Proposed,
          CommentStatus.Approved,
          CommentStatus.Done,
          CommentStatus.Declined,
        ])
        .optional()
        .describe("Default: everything not done or declined."),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async (args) => {
    const under = str(args.under);
    const status = str(args.status);
    const found = listComments(root).filter(
      (f) =>
        (under === undefined ||
          f.chapter.startsWith(under) ||
          (f.on ?? "").startsWith(under) ||
          under.startsWith(f.chapter)) &&
        (status === undefined
          ? f.status !== CommentStatus.Done && f.status !== CommentStatus.Declined
          : f.status === status),
    );
    return result([
      text(found.length === 0 ? "No comments matches." : found.map(commentLine).join("\n\n")),
    ]);
  },
);

/** One answer to one comment (comment_update). */
const commentChange = z.object({
  id: z.string(),
  status: z
    .enum([CommentStatus.Open, CommentStatus.Proposed, CommentStatus.Done, CommentStatus.Declined])
    .optional()
    .describe("Only the person approves, so approved is not one of these."),
  reply: z.string().optional(),
  proposal: z
    .object({
      summary: z.string(),
      changes: z.array(z.object({ before: z.string(), after: z.string() })).optional(),
    })
    .passthrough()
    .optional(),
  by: z.string().optional().describe("Who is writing (default: agent)."),
});

server.registerTool(
  "comment_update",
  {
    title: "Answer comments",
    description:
      "Answer comments: set a status, add a reply to the thread, and/or write a proposal ({summary, changes:[{before, after}]}). One comment (id, …) or several at once (items: [{id, …}, …]). Status rules: write a proposal → proposed; only the person moves it to approved; after applying an approved change → done.",
    inputSchema: {
      ...commentChange.partial({ id: true }).shape,
      items: z.array(commentChange).optional().describe("Several comments at once."),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async ({ items, ...one }) => {
    const all = items ?? (one.id !== undefined ? [{ ...one, id: one.id }] : []);
    if (all.length === 0) throw new Error("give id, or items: [{id, …}]");
    const comments = listComments(root);
    const lines = all.map((item) => {
      const found = comments.find((f) => f.id === item.id);
      if (found === undefined) return `✗ no comment ${item.id}`;
      const { file: _, ...fb } = found;
      if (str(item.reply))
        fb.thread.push({
          by: str(item.by) ?? "agent",
          at: new Date().toISOString(),
          text: String(item.reply),
        });
      if (item.proposal !== undefined) {
        fb.proposal = item.proposal;
        fb.status = CommentStatus.Proposed;
      }
      if (item.status !== undefined) fb.status = item.status;
      return `✓ ${writeComment(root, fb)} [${fb.status}]`;
    });
    return result([text(lines.join("\n"))]);
  },
);

server.registerTool(
  "comment_add",
  {
    title: "File a comment",
    description:
      "File a new comments item on a board (for reviewers: one finding per item, naming the principle and what a student would get wrong).",
    inputSchema: {
      board: z.string().min(1),
      piece: z.string().optional(),
      text: z.string().min(1),
      by: z.string().optional().describe("e.g. reviewer"),
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
    const piece = str(args.piece);
    const where = readSources(root)[`${on}.json`];
    const chapter = chapterOf({ on });
    if (chapter === undefined) throw new Error(`can't tell the chapter of ${on}`);
    const fb: Comment = {
      id: newCommentId(),
      status: CommentStatus.Open,
      chapter,
      on,
      ...(piece ? { piece } : {}),
      ...((piece && where?.pieces[piece]) || where?.board
        ? { source: (piece && where?.pieces[piece]) || where?.board }
        : {}),
      by: str(args.by) ?? "agent",
      createdAt: new Date().toISOString(),
      thread: [],
      text: args.text,
    };
    return result([text(`✓ ${writeComment(root, fb)}`)]);
  },
);

server.registerTool(
  "check",
  {
    title: "Run the checks",
    description:
      "Run Chalk's checks. Default: build all content (every board built, witnesses played, questions checked) and report problems. full=true: the whole `pnpm check` (types, tests, boundaries, catalogue, lint) — run before calling work done.",
    inputSchema: { full: z.boolean().optional() },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async (args, extra: Extra) => {
    const progress = progressOf(extra);
    if (args.full !== true && isBuildCurrent(root))
      return result([text("✓ passed: nothing changed since the last build that passed")]);
    await progress(args.full === true ? "running pnpm check" : "building content");
    const ran =
      args.full === true
        ? await run("pnpm", ["check"], {
            signal: extra.signal,
            // Each step of pnpm check (typecheck, tests, …) as it starts.
            onLine: (line) => {
              const step = /^▸ (.+)$/.exec(line.trim())?.[1];
              if (step !== undefined) void progress(step);
            },
          })
        : await buildContent(extra.signal);
    const lines = ran.out.split("\n");
    const tail = lines.filter((l) => /✗|✓|error|Error|problem|^\s{4}/.test(l)).slice(-80);
    return result([text(`${ran.code === 0 ? "✓ passed" : "✗ failed"}\n${tail.join("\n")}`)]);
  },
);

await serveStdio(server, closeBrowser);
