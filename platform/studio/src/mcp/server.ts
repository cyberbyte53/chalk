import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { boardName, listBoards, readSources } from "../boards";
import {
  type Comment,
  CommentStatus,
  chapterOf,
  listComments,
  newCommentId,
  writeComment,
} from "../comments";
import { findUp } from "../pronunciations";
import { previewUrl, shoot } from "./preview";
import { type Content, type Tool, serve } from "./protocol";

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

/** Run a command in the repo; resolves with its output and exit code (never throws). */
function run(cmd: string, args: string[], cwd = root): Promise<{ code: number; out: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, env: process.env });
    let out = "";
    child.stdout.on("data", (d) => {
      out += d;
    });
    child.stderr.on("data", (d) => {
      out += d;
    });
    child.on("close", (code) => resolve({ code: code ?? 1, out }));
    child.on("error", (e) => resolve({ code: 1, out: e.message }));
  });
}

const tsx = join(root, "platform", "studio", "node_modules", ".bin", "tsx");
const buildContent = () =>
  run(
    tsx,
    ["--tsconfig", "../../tsconfig.base.json", "src/content/cli.ts", "build"],
    join(root, "platform", "studio"),
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

const tools: Tool[] = [
  {
    name: "affected",
    description:
      "What a change reaches, before or after you make it. Give files or folders (library/props/circles, library/patterns/words.ts, platform/packages/player/src/runtime.ts), or nothing for everything changed since the last commit. For a prop package: every place its props are placed (board, piece, source line), grouped by chapter. For anything else: the chapters whose last build read it. Use it before changing a prop or a pattern, then render_board the boards it lists.",
    inputSchema: {
      type: "object",
      properties: { files: { type: "array", items: { type: "string" } } },
    },
    async run(args) {
      const given = Array.isArray(args.files) ? (args.files as unknown[]).map(String) : [];
      const files = given.length > 0 ? given : [...changedFiles(), ...changedOutsideContent()];
      if (files.length === 0) return [text("Nothing changed since the last commit.")];
      const out: string[] = [];
      // Props: the exact places each prop type is placed.
      const types = propTypesIn(files);
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
      // Everything (props included): chapters whose last build read the files.
      const hits = chaptersReading(files);
      if (hits.length > 0)
        out.push(
          `\nChapters whose build reads ${types.size > 0 ? "these files (also through patterns or other code)" : "them"}: ${hits.map((h) => h.chapter).join(", ")}`,
        );
      if (out.length === 0)
        out.push(
          `Nothing reads ${files.join(", ")} (as of each chapter's last build; run the check tool if content isn't built yet).`,
        );
      return [text(out.join("\n"))];
    },
  },
  {
    name: "render_board",
    description:
      "See boards exactly as a phone draws them (the app's own player, 390px wide). `board` is a board name (build path without .json, e.g. class10-maths/real-numbers/division-lemma/overview/story) or a lesson (class10-maths/real-numbers/division-lemma) for all its pages. Returns a PNG per board, where each piece was written (file:line), pieces drawn outside the phone, and page errors. Rebuilds content first unless rebuild=false. Use it after every content or prop change, and before saying something looks right.",
    inputSchema: {
      type: "object",
      properties: {
        board: { type: "string" },
        locale: { type: "string", enum: ["en", "hi"] },
        play: {
          type: "boolean",
          description: "Hidden pieces stay hidden (as a student first sees it).",
        },
        questions: { type: "boolean", description: "For a lesson: its questions too." },
        rebuild: { type: "boolean" },
      },
      required: ["board"],
    },
    async run(args) {
      const board = str(args.board);
      if (board === undefined) throw new Error("board is required");
      const notes: string[] = [];
      if (args.rebuild !== false) {
        const built = await buildContent();
        if (built.code !== 0)
          notes.push(
            `build-content failed:\n${built.out
              .split("\n")
              .filter((l) => l.includes("✗") || l.startsWith("    "))
              .join("\n")}`,
          );
      }
      const options = {
        locale: args.locale === "hi" ? ("hi" as const) : ("en" as const),
        play: args.play === true,
        questions: args.questions === true,
      };
      const shots = await shoot(root, boardName(board), options);
      const sources = readSources(root);
      const out: Content[] = [];
      for (const s of shots.slice(0, 10)) {
        const where = sources[`${s.board}.json`];
        const pieces = where
          ? Object.entries(where.pieces)
              .map(([p, site]) => `${p} → ${site}`)
              .join("\n")
          : "(no sources: run pnpm build-content)";
        out.push(
          text(
            [
              `## ${s.board}`,
              `board → ${where?.board ?? "?"}`,
              pieces,
              s.overflow.length > 0 ? `Overflow:\n${s.overflow.join("\n")}` : "Overflow: none",
              ...(s.errors.length > 0 ? [`Page errors:\n${s.errors.join("\n")}`] : []),
            ].join("\n"),
          ),
          { type: "image", data: s.png.toString("base64"), mimeType: "image/png" },
        );
      }
      if (shots.length > 10)
        notes.push(`${shots.length - 10} more boards not shown; render them one by one.`);
      notes.push(`Open it yourself: ${await previewUrl(root, boardName(board), options)}`);
      return [...out, text(notes.join("\n"))];
    },
  },
  {
    name: "boards",
    description:
      "List boards: every page and question of a chapter or lesson, with its name (for render_board and comments), where it was written, and its preview URL. `changed: true` lists only boards whose source files changed since the last commit — the ones to look at after editing.",
    inputSchema: {
      type: "object",
      properties: {
        under: { type: "string", description: "book/chapter or book/chapter/lesson" },
        changed: { type: "boolean" },
      },
    },
    async run(args) {
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
      if (boards.length === 0) return [text("No boards (is build/ there? run the check tool).")];
      const base = await previewUrl(root, "").catch(() => "");
      return [
        text(
          boards
            .slice(0, 300)
            .map((b) => `${b.kind === "page" ? "page" : "q   "} ${b.board}  ← ${b.source ?? "?"}`)
            .join("\n") + (base ? `\n\nPreview: ${base}<board>` : ""),
        ),
      ];
    },
  },
  {
    name: "comments",
    description:
      "Read the person's (and reviewers') comments: one file per comment in content/<book>/<chapter>/.comments/. Each names its board (`on`), piece, source line and status (open → proposed → approved → done, or declined). Filter by chapter/lesson/board prefix and status. Edit the files directly or use comment_update.",
    inputSchema: {
      type: "object",
      properties: {
        under: { type: "string" },
        status: {
          type: "string",
          description: "open, proposed, approved, done, declined; default: everything not done",
        },
      },
    },
    async run(args) {
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
      return [
        text(found.length === 0 ? "No comments matches." : found.map(commentLine).join("\n\n")),
      ];
    },
  },
  {
    name: "comment_update",
    description:
      "Answer a comments item: set its status, add a reply to its thread, and/or write a proposal ({summary, changes:[{before, after}]}). Status rules: write a proposal → proposed; only the person moves it to approved; after applying an approved change → done.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        status: { type: "string", enum: Object.values(CommentStatus) },
        reply: { type: "string" },
        proposal: { type: "object" },
        by: { type: "string", description: "Who is writing (default: agent)." },
      },
      required: ["id"],
    },
    async run(args) {
      const found = listComments(root).find((f) => f.id === str(args.id));
      if (found === undefined) throw new Error(`no comments ${String(args.id)}`);
      if (args.status === CommentStatus.Approved) throw new Error("only the person approves");
      const { file: _, ...fb } = found;
      if (str(args.reply))
        fb.thread.push({
          by: str(args.by) ?? "agent",
          at: new Date().toISOString(),
          text: String(args.reply),
        });
      if (args.proposal !== undefined) {
        fb.proposal = args.proposal;
        fb.status = CommentStatus.Proposed;
      }
      if (str(args.status)) fb.status = String(args.status);
      return [text(`✓ ${writeComment(root, fb)} [${fb.status}]`)];
    },
  },
  {
    name: "comment_add",
    description:
      "File a new comments item on a board (for reviewers: one finding per item, naming the principle and what a student would get wrong).",
    inputSchema: {
      type: "object",
      properties: {
        board: { type: "string" },
        piece: { type: "string" },
        text: { type: "string" },
        by: { type: "string", description: "e.g. reviewer" },
      },
      required: ["board", "text"],
    },
    async run(args) {
      const on = boardName(String(args.board));
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
        text: String(args.text),
      };
      return [text(`✓ ${writeComment(root, fb)}`)];
    },
  },
  {
    name: "find_prop",
    description:
      "Search the prop library (library/catalogue.md) before writing a new prop: what each prop shows, what a learner can do on it, which chapters use it.",
    inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
    async run(args) {
      const file = join(root, "library", "catalogue.md");
      if (!existsSync(file)) throw new Error("library/catalogue.md is missing; run pnpm catalogue");
      const words = String(args.query)
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 2);
      const rows = readFileSync(file, "utf8")
        .split("\n")
        .filter((l) => l.startsWith("| `"));
      const scored = rows
        .map((row) => ({
          row,
          score: words.filter((w) => new RegExp(`\\b${w}`, "i").test(row)).length,
        }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
      return [
        text(
          scored.length === 0
            ? "No prop matches; read library/catalogue.md."
            : scored.map((r) => r.row).join("\n"),
        ),
      ];
    },
  },
  {
    name: "check",
    description:
      "Run Chalk's checks. Default: build all content (every board built, witnesses played, questions checked) and report problems. full=true: the whole `pnpm check` (types, tests, boundaries, catalogue, lint) — run before calling work done.",
    inputSchema: { type: "object", properties: { full: { type: "boolean" } } },
    async run(args) {
      const result = args.full === true ? await run("pnpm", ["check"]) : await buildContent();
      const lines = result.out.split("\n");
      const tail = lines.filter((l) => /✗|✓|error|Error|problem|^\s{4}/.test(l)).slice(-80);
      return [text(`${result.code === 0 ? "✓ passed" : "✗ failed"}\n${tail.join("\n")}`)];
    },
  },
];

serve({ name: "chalk", version: "0.1.0" }, tools);
