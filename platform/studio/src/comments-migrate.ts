import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parse, stringify } from "yaml";
import {
  COMMENTS_FILE,
  Label,
  type Message,
  REVIEWS_DIR,
  type Review,
  Role,
  Status,
  type Thread,
  fileOf,
  readComments,
  reviewSchema,
  threadSchema,
} from "./comments";
import { findUp } from "./pronunciations";

/**
 * One-off: moves comments files from the shape before threads and reviews (kind, causedBy, plan,
 * thread, a `review` stamp on each comment) to today's (label, about, messages, reviews/<id>.yaml).
 * Entries already in today's shape are left as they are. `tsx src/comments-migrate.ts` (add --dry
 * to only report).
 */

type Old = {
  id: string;
  kind?: string;
  status: string;
  by: string;
  createdAt: string;
  causedBy?: string;
  review?: string;
  plan?: { by: string; at: string; text: string };
  thread?: { by: string; at: string; text: string }[];
  [key: string]: unknown;
};

const roleOf = (by: string, kind?: string): Role =>
  by === "you"
    ? Role.Person
    : by === "reviewer" || kind === Label.Finding
      ? Role.Reviewer
      : Role.Fixer;
const nameOf = (by: string, role: Role) => (by === "agent" ? role : by);

/** One old comment in today's shape. */
export function migrateEntry(old: Old): Thread {
  if (threadSchema.safeParse(old).success) return threadSchema.parse(old);
  const { kind, causedBy, review: _, plan, thread, by, ...rest } = old;
  const role = roleOf(by, kind);
  const messages: Message[] = [];
  if (plan !== undefined)
    messages.push({
      by: nameOf(plan.by, Role.Fixer),
      role: Role.Fixer,
      at: plan.at,
      text: plan.text,
      status: Status.Planned,
    });
  for (const e of thread ?? []) {
    const r = roleOf(e.by);
    messages.push({ by: nameOf(e.by, r), role: r, at: e.at, text: e.text });
  }
  messages.sort((a, b) => a.at.localeCompare(b.at));
  // The agent's last word on a thread it finished is what moved it to ready.
  if (old.status === Status.Ready || old.status === Status.Closed) {
    const answer = [...messages]
      .reverse()
      .find((m) => m.role === Role.Fixer && m.status === undefined);
    if (answer !== undefined) answer.status = Status.Ready;
  }
  return threadSchema.parse({
    ...rest,
    label: kind ?? Label.Comment,
    by: nameOf(by, role),
    role,
    ...(causedBy !== undefined ? { about: causedBy } : {}),
    messages,
  });
}

/** A review's time from its id (20261026-1734 → 2026-10-26T17:34:00.000Z). */
const timeOf = (id: string): string =>
  `${id.slice(0, 4)}-${id.slice(4, 6)}-${id.slice(6, 8)}T${id.slice(9, 11)}:${id.slice(11, 13)}:00.000Z`;

if (process.argv[1]?.endsWith("comments-migrate.ts")) {
  const root = dirname(findUp("pnpm-workspace.yaml", process.cwd()));
  const isDry = process.argv.includes("--dry");
  const files = [
    ...readdirSync(join(root, "content"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .flatMap((book) =>
        readdirSync(join(root, "content", book.name), { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((chapter) => `content/${book.name}/${chapter.name}`),
      ),
    ...readdirSync(join(root, "library", "props"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => `library/props/${d.name}`),
  ].filter((home) => existsSync(join(root, home, COMMENTS_FILE)));

  const reviews = new Map<string, Review>();
  for (const home of files) {
    const path = join(root, home, COMMENTS_FILE);
    const olds = (parse(readFileSync(path, "utf8")) ?? []) as Old[];
    const threads = olds.map(migrateEntry);
    for (const old of olds) {
      if (old.review === undefined) continue;
      const r = reviews.get(old.review) ?? {
        id: old.review,
        by: "you",
        role: Role.Person,
        at: timeOf(old.review),
        threads: [],
      };
      r.threads.push({ file: fileOf(home), id: old.id });
      reviews.set(old.review, r);
    }
    console.log(`${fileOf(home)}: ${threads.length} threads`);
    if (!isDry)
      writeFileSync(
        path,
        `# Written only through platform/studio/src/comments.ts (the dev server, the chalk MCP). Don't edit by hand.\n${stringify(threads, { lineWidth: 100 })}`,
      );
  }
  for (const r of reviews.values()) {
    const review = reviewSchema.parse(r);
    const file = join(root, REVIEWS_DIR, `${review.id}.yaml`);
    console.log(`${REVIEWS_DIR}/${review.id}.yaml: ${review.threads.length} threads`);
    if (isDry || existsSync(file)) continue;
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(
      file,
      `# Written only through platform/studio/src/comments.ts (the dev server, the chalk MCP). Don't edit by hand.\n${stringify(review, { lineWidth: 100 })}`,
    );
  }
  if (!isDry) {
    const { problems } = readComments(root);
    console.log(problems.length === 0 ? "✓ every file reads back" : problems.join("\n"));
    if (problems.length > 0) process.exitCode = 1;
  }
}
