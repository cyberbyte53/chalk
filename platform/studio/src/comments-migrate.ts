import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { parse, stringify } from "yaml";
import { COMMENTS_FILE, type Comment, Kind, Status, commentSchema, homeOf } from "./comments";
import { findUp } from "./pronunciations";

/**
 * One-off: moves comments from the old one-file-per-comment folders (<chapter or prop>/.comments/
 * <id>.md) into comments.yaml files, in the new shape, then moves the old folders to
 * _to_delete/old-comments/. `tsx src/comments-migrate.ts` (add --dry to only report).
 */

const root = dirname(findUp("pnpm-workspace.yaml", process.cwd()));
const isDry = process.argv.includes("--dry");

const FRONT = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
const oldStatus: Record<string, Status> = {
  open: Status.Open,
  question: Status.Open,
  proposed: Status.Planned,
  approved: Status.Planned,
  done: Status.Ready,
  declined: Status.Withdrawn,
};

function convert(file: string): Comment {
  const match = FRONT.exec(readFileSync(file, "utf8").replace(/\r\n/g, "\n"));
  if (match === null) throw new Error(`${file}: no front matter`);
  const m = (parse(match[1] ?? "") ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v !== "" ? v : undefined);
  const createdAt = str(m.createdAt) ?? new Date(0).toISOString();
  const thread = (Array.isArray(m.thread) ? m.thread : []).map((e: Record<string, unknown>) => ({
    by: str(e.by) ?? "agent",
    at: str(e.at) ?? createdAt,
    text: String(e.text ?? ""),
  }));
  const proposal = m.proposal as { summary?: string } | undefined;
  const status = oldStatus[String(m.status)] ?? Status.Open;
  const by = str(m.by) ?? "you";
  const piece = str(m.piece);
  const part = str(m.part);
  const board = str(m.on);
  const c = {
    id: String(m.id),
    kind: by === "reviewer" ? Kind.Finding : Kind.Comment,
    status,
    by,
    createdAt,
    ...(board !== undefined && board !== "plan" ? { board } : {}),
    ...(piece !== undefined ? { target: part ? `${piece} › ${part}` : piece } : {}),
    ...(str(m.prop) ? { prop: str(m.prop) } : {}),
    ...(str(m.source) ? { source: str(m.source) } : {}),
    ...(str(m.snapshot) ? { snapshot: str(m.snapshot) } : {}),
    ...(str(m.commit) ? { commit: str(m.commit) } : {}),
    ...(str(m.review) ? { review: str(m.review) } : {}),
    ...(str(m.quote) ? { quote: str(m.quote) } : {}),
    text: (match[2] ?? "").trim(),
    ...(proposal?.summary && status !== Status.Open
      ? { plan: { by: "agent", at: thread.at(-1)?.at ?? createdAt, text: proposal.summary } }
      : {}),
    thread,
  };
  return commentSchema.parse(c);
}

const byHome = new Map<string, Comment[]>();
const oldDirs: string[] = [];
const scan = (base: string) => {
  if (!existsSync(base) || !statSync(base).isDirectory()) return;
  for (const name of readdirSync(base)) {
    if (name === "node_modules") continue;
    const dir = join(base, name);
    const comments = join(dir, ".comments");
    if (existsSync(comments)) {
      oldDirs.push(comments);
      for (const f of readdirSync(comments).filter((n) => n.endsWith(".md"))) {
        const c = convert(join(comments, f));
        const home = homeOf(root, c) ?? dir.slice(root.length + 1);
        byHome.set(home, [...(byHome.get(home) ?? []), c]);
      }
    }
  }
};
for (const book of readdirSync(join(root, "content"))) scan(join(root, "content", book));
scan(join(root, "library", "props"));

for (const [home, list] of byHome) {
  const file = join(root, home, COMMENTS_FILE);
  const existing = existsSync(file) ? ((parse(readFileSync(file, "utf8")) ?? []) as Comment[]) : [];
  const ids = new Set(existing.map((c) => c.id));
  const all = [...existing, ...list.filter((c) => !ids.has(c.id))].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  console.log(`${home}/${COMMENTS_FILE}: ${list.length} moved (${all.length} in all)`);
  if (isDry) continue;
  writeFileSync(
    file,
    `# Comments, written only by the Chalk dev server (platform/studio/src/comments.ts). Don't edit by hand.\n${stringify(all, { lineWidth: 100 })}`,
  );
}
if (!isDry)
  for (const dir of oldDirs) {
    const to = join(root, "_to_delete", "old-comments", dir.slice(root.length + 1));
    mkdirSync(dirname(to), { recursive: true });
    renameSync(dir, to);
  }
console.log(
  `${[...byHome.values()].flat().length} comments; old folders ${isDry ? "would move" : "moved"} to _to_delete/old-comments/`,
);
