import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import {
  type Change,
  Label,
  MOVES,
  type NewThread,
  Role,
  Status,
  type Who,
  YOU,
  applyChange,
  fileOf,
  latestReview,
  readComments,
  sittingOf,
  standing,
  threadsOf,
} from "./comments";
import { migrateEntry } from "./comments-migrate";

const BOARD = "class10-maths/polynomials/value-and-zeroes/value";
const FIXER: Who = { name: "fixer", role: Role.Fixer };
const REVIEWER: Who = { name: "reviewer", role: Role.Reviewer };
const ASHA: Who = { name: "asha", role: Role.Teacher };

function repo(): string {
  const root = mkdtempSync(join(tmpdir(), "comments-"));
  mkdirSync(join(root, "content", "class10-maths", "polynomials"), { recursive: true });
  mkdirSync(join(root, "library", "props", "polynomials"), { recursive: true });
  writeFileSync(
    join(root, "library", "catalogue.md"),
    "## `polynomials` — `@chalk/prop-polynomials`\n\n### `valueMachine` · explainer\n\n`library/props/polynomials/valueMachine` · used in no chapter yet\n",
  );
  return root;
}

function apply(root: string, change: Change, who: Who) {
  const done = applyChange(root, change, who);
  if (!done.ok) throw new Error(done.error);
  return done;
}

function start(root: string, extra: Partial<NewThread> = {}, who: Who = YOU) {
  const done = apply(
    root,
    { op: "start", thread: { board: BOARD, target: "machine/put", text: "too small", ...extra } },
    who,
  );
  if (done.thread === undefined) throw new Error("no thread");
  return done.thread;
}

const write = (root: string, id: string, who: Who, text: string, status?: Status) =>
  applyChange(root, { op: "write", id, text, ...(status ? { status } : {}) }, who);

describe("threads", () => {
  it("files a board thread with its chapter and a prop thread with its prop, and reads them back", () => {
    const root = repo();
    const onBoard = start(root);
    const onProp = start(root, { prop: "valueMachine" });
    expect(onBoard.home).toBe("content/class10-maths/polynomials");
    expect(onProp.home).toBe("library/props/polynomials");
    expect(onBoard).toMatchObject({
      status: Status.Open,
      label: Label.Comment,
      by: "you",
      role: Role.Person,
      messages: [],
    });
    const read = readComments(root);
    expect(read.problems).toEqual([]);
    expect(read.threads.map((c) => c.id).sort()).toEqual([onBoard.id, onProp.id].sort());
  });

  it("moves only as each role may: the fixer plans and readies, only the person closes", () => {
    const root = repo();
    const t = start(root);
    expect(write(root, t.id, FIXER, "done", Status.Ready)).toMatchObject({ ok: false });
    expect(write(root, t.id, YOU, "bigger", Status.Planned)).toMatchObject({ ok: false });
    expect(write(root, t.id, REVIEWER, "bigger", Status.Planned)).toMatchObject({
      ok: false,
      error: expect.stringContaining("a reviewer can't move a thread from open to planned"),
    });
    expect(write(root, t.id, FIXER, "bigger", Status.Planned)).toMatchObject({
      thread: { status: Status.Planned },
    });
    // Revising the plan is another planned move.
    expect(write(root, t.id, FIXER, "44px", Status.Planned)).toMatchObject({ ok: true });
    expect(write(root, t.id, FIXER, "made it 44px", Status.Ready)).toMatchObject({
      thread: { status: Status.Ready },
    });
    expect(write(root, t.id, FIXER, "", Status.Closed)).toMatchObject({ ok: false });
    expect(write(root, t.id, REVIEWER, "", Status.Closed)).toMatchObject({ ok: false });
    // Anyone may just talk; the reviewer's words don't move it.
    expect(write(root, t.id, REVIEWER, "looks right")).toMatchObject({
      thread: { status: Status.Ready },
    });
    // The person's words send it back; the person closes.
    expect(write(root, t.id, YOU, "still small")).toMatchObject({
      thread: { status: Status.Open },
    });
    expect(write(root, t.id, YOU, "", Status.Closed)).toMatchObject({
      thread: { status: Status.Closed },
    });
    const messages = readComments(root).threads[0]?.messages ?? [];
    expect(messages.map((m) => [m.role, m.status ?? "-"])).toEqual([
      [Role.Fixer, Status.Planned],
      [Role.Fixer, Status.Planned],
      [Role.Fixer, Status.Ready],
      [Role.Reviewer, "-"],
      [Role.Person, Status.Open],
      [Role.Person, Status.Closed],
    ]);
  });

  it("lets a teacher reopen, close and withdraw only her own threads", () => {
    const root = repo();
    const hers = start(root, {}, ASHA);
    const mine = start(root);
    expect(write(root, hers.id, ASHA, "", Status.Withdrawn)).toMatchObject({ ok: true });
    expect(write(root, mine.id, ASHA, "", Status.Closed)).toMatchObject({ ok: false });
    // Her words on someone else's answered thread are just words: no reopening it.
    write(root, mine.id, FIXER, "x", Status.Planned);
    expect(write(root, mine.id, ASHA, "agree")).toMatchObject({
      thread: { status: Status.Planned },
    });
  });

  it("starts threads only with the labels each role may use", () => {
    const root = repo();
    expect(
      applyChange(
        root,
        { op: "start", thread: { board: BOARD, text: "x", label: Label.Finding } },
        YOU,
      ),
    ).toMatchObject({ ok: false });
    expect(start(root, { label: Label.Finding }, REVIEWER)).toMatchObject({
      by: "reviewer",
      role: Role.Reviewer,
    });
    expect(
      applyChange(root, { op: "start", thread: { board: BOARD, text: "x" } }, REVIEWER),
    ).toMatchObject({ ok: false });
    expect(
      applyChange(root, { op: "start", thread: { board: BOARD, text: "x" } }, FIXER),
    ).toMatchObject({
      ok: false,
      error: expect.stringContaining("from: chat"),
    });
    // What the person said in the fixer's chat is filed in their name.
    expect(start(root, { from: "chat" }, FIXER)).toMatchObject({
      by: "you",
      role: Role.Person,
      from: "chat",
    });
  });

  it("deletes only an untouched thread never handed over; otherwise it is withdrawn", () => {
    const root = repo();
    const untouched = start(root);
    expect(applyChange(root, { op: "delete", id: untouched.id }, YOU)).toEqual({ ok: true });
    const touched = start(root);
    write(root, touched.id, FIXER, "x", Status.Planned);
    expect(applyChange(root, { op: "delete", id: touched.id }, YOU)).toMatchObject({ ok: false });
    const handed = start(root);
    apply(root, { op: "handover" }, YOU);
    expect(applyChange(root, { op: "delete", id: handed.id }, YOU)).toMatchObject({
      ok: false,
      error: expect.stringContaining("handed over"),
    });
    expect(applyChange(root, { op: "delete", id: handed.id }, FIXER)).toMatchObject({ ok: false });
    expect(write(root, handed.id, YOU, "", Status.Withdrawn)).toMatchObject({
      thread: { status: Status.Withdrawn },
    });
  });

  it("holds a thread back from ready while a regression it caused is open", () => {
    const root = repo();
    const t = start(root);
    write(root, t.id, FIXER, "x", Status.Planned);
    expect(() => start(root, { label: Label.Regression }, REVIEWER)).toThrow(/about/);
    const broke = start(
      root,
      { target: "machine/out", label: Label.Regression, about: t.id },
      REVIEWER,
    );
    expect(write(root, t.id, FIXER, "done", Status.Ready)).toMatchObject({
      ok: false,
      error: expect.stringContaining(broke.id),
    });
    write(root, broke.id, FIXER, "fix", Status.Planned);
    write(root, broke.id, FIXER, "fixed", Status.Ready);
    expect(write(root, t.id, FIXER, "done", Status.Ready)).toMatchObject({ ok: true });
  });

  it("keeps what's wrong with a fix on its own thread: a regression is a break elsewhere", () => {
    const root = repo();
    const t = start(root);
    write(root, t.id, FIXER, "bigger", Status.Planned);
    // The same piece: refused, write on the thread.
    expect(
      applyChange(
        root,
        {
          op: "start",
          thread: {
            board: BOARD,
            target: "machine/put",
            label: Label.Regression,
            about: t.id,
            text: "still small",
          },
        },
        REVIEWER,
      ),
    ).toMatchObject({ ok: false, error: expect.stringContaining("write on that thread instead") });
    // Elsewhere: a regression.
    expect(
      start(root, { target: "machine/out", label: Label.Regression, about: t.id }, REVIEWER),
    ).toMatchObject({
      label: Label.Regression,
    });
  });

  it("holds a thread back from ready until the fixer answers the reviewer's words on it", () => {
    const root = repo();
    const t = start(root);
    write(root, t.id, FIXER, "bigger", Status.Planned);
    write(root, t.id, REVIEWER, "still clipped at 360");
    expect(write(root, t.id, FIXER, "done", Status.Ready)).toMatchObject({
      ok: false,
      error: expect.stringContaining("answer the reviewer first"),
    });
    write(root, t.id, FIXER, "it wrapped at 360; now two lines");
    expect(write(root, t.id, FIXER, "done", Status.Ready)).toMatchObject({ ok: true });
  });

  it("records the files changed since the plan, not deletions or comment files", () => {
    const root = repo();
    execFileSync("git", ["init", "-q"], { cwd: root });
    const old = join(root, "content", "class10-maths", "polynomials", "old.yaml");
    writeFileSync(old, "x\n");
    execFileSync("git", ["add", "."], { cwd: root });
    execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "x"], {
      cwd: root,
    });
    const t = start(root);
    write(root, t.id, FIXER, "x", Status.Planned);
    rmSync(old);
    writeFileSync(join(root, "library", "props", "polynomials", "view.tsx"), "y\n");
    expect(write(root, t.id, FIXER, "done", Status.Ready)).toMatchObject({
      thread: { changed: ["library/props/polynomials/view.tsx"] },
    });
  });

  it("reports an entry that doesn't fit, instead of skipping it, and refuses to write over it", () => {
    const root = repo();
    start(root);
    const file = join(root, "authoring", "books", "class10-maths", "polynomials", "comments.yaml");
    writeFileSync(file, `${readFileSync(file, "utf8")}- id: broken\n  status: maybe\n`);
    const read = readComments(root);
    expect(read.problems).toHaveLength(1);
    expect(read.problems[0]).toMatch(/comments.yaml #2/);
    expect(() => start(root)).toThrow(/fix the comments files first/);
  });

  it("has a status move for every status, and none for a reviewer", () => {
    expect(MOVES[Role.Reviewer]).toEqual([]);
    const reachable = new Set(Object.values(MOVES).flatMap((moves) => moves.map((m) => m.to)));
    expect([...reachable].sort()).toEqual(Object.values(Status).sort());
  });
});

describe("reviews", () => {
  it("hands a sitting over as authoring/reviews/<id>.yaml, listing its threads in order", () => {
    const root = repo();
    const a = start(root);
    const b = start(root, { prop: "valueMachine" });
    const done = apply(root, { op: "handover" }, YOU);
    expect(done).toMatchObject({ count: 2 });
    const id = done.review?.id ?? "";
    expect(id).toMatch(/^\d{8}-\d{4}$/);
    const file = parse(readFileSync(join(root, "authoring", "reviews", `${id}.yaml`), "utf8"));
    expect(file).toMatchObject({
      id,
      by: "you",
      role: Role.Person,
      threads: [
        { file: "authoring/books/class10-maths/polynomials/comments.yaml", id: a.id },
        { file: "authoring/props/polynomials/comments.yaml", id: b.id },
      ],
    });
    // The threads themselves know nothing of it.
    expect(readFileSync(join(root, fileOf(a.home)), "utf8")).not.toContain(id);
    const read = readComments(root);
    expect(read.problems).toEqual([]);
    expect(latestReview(read.reviews)?.id).toBe(id);
    expect(
      threadsOf(
        read.reviews[0] ?? { id, by: "you", role: Role.Person, at: "", threads: [] },
        read.threads,
      ).map((t) => t.id),
    ).toEqual([a.id, b.id]);
  });

  it("keeps one review while it isn't done: a reply and a new thread add to it", () => {
    const root = repo();
    const old = start(root);
    const first = apply(root, { op: "handover" }, YOU);
    expect(applyChange(root, { op: "handover" }, YOU)).toEqual({ ok: true, count: 0 });
    write(root, old.id, FIXER, "x", Status.Planned);
    write(root, old.id, FIXER, "done", Status.Ready);
    write(root, old.id, YOU, "still small");
    write(root, old.id, YOU, "and too low");
    const fresh = start(root);
    const second = apply(root, { op: "handover" }, YOU);
    expect(second.review?.id).toBe(first.review?.id);
    expect(second.review?.threads.map((t) => t.id)).toEqual([old.id, fresh.id]);
    write(root, fresh.id, YOU, "one more thing");
    expect(apply(root, { op: "handover" }, YOU).review?.added).toHaveLength(2);
    expect(readComments(root).reviews).toHaveLength(1);
  });

  it("starts a new review once the last one is done", () => {
    const root = repo();
    const old = start(root);
    const first = apply(root, { op: "handover" }, YOU);
    write(root, old.id, FIXER, "x", Status.Planned);
    write(root, old.id, FIXER, "done", Status.Ready);
    const fresh = start(root);
    const second = apply(root, { op: "handover" }, YOU);
    expect(second.review?.id).not.toBe(first.review?.id);
    expect(second.review?.threads.map((t) => t.id)).toEqual([fresh.id]);
    expect(readComments(root).reviews).toHaveLength(2);
  });

  it("says how to add a message to a thread already at that status", () => {
    const root = repo();
    const t = start(root);
    write(root, t.id, FIXER, "x", Status.Planned);
    expect(write(root, t.id, FIXER, "and this", Status.Planned)).toMatchObject({ ok: true });
    write(root, t.id, FIXER, "done", Status.Ready);
    expect(write(root, t.id, FIXER, "note", Status.Ready)).toMatchObject({
      ok: false,
      error: expect.stringContaining("leave the status out"),
    });
  });

  it("leaves out threads only closed or withdrawn in the sitting", () => {
    const root = repo();
    const t = start(root);
    apply(root, { op: "handover" }, YOU);
    write(root, t.id, YOU, "", Status.Closed);
    expect(sittingOf(readComments(root), YOU)).toEqual([]);
  });

  it("gives each participant their own sitting: a reviewer's pass is a review too", () => {
    const root = repo();
    const mine = start(root);
    const found = start(root, { label: Label.Finding }, REVIEWER);
    write(root, mine.id, REVIEWER, "the label is cut off at 360");
    const done = apply(root, { op: "handover" }, REVIEWER);
    expect(done.review).toMatchObject({ by: "reviewer", role: Role.Reviewer });
    expect(done.review?.threads.map((t) => t.id)).toEqual([found.id, mine.id]);
    // The person's sitting is untouched by it.
    expect(sittingOf(readComments(root), YOU).map((t) => t.id)).toEqual([mine.id]);
  });

  it("says how a review stands, from its threads", () => {
    const root = repo();
    const a = start(root);
    const b = start(root);
    apply(root, { op: "handover" }, YOU);
    write(root, a.id, FIXER, "x", Status.Planned);
    write(root, a.id, FIXER, "done", Status.Ready);
    const read = readComments(root);
    const review = read.reviews[0];
    if (review === undefined) throw new Error("no review");
    expect(standing(threadsOf(review, read.threads))).toEqual({
      text: "1 open, 1 ready",
      isDone: false,
    });
    write(root, b.id, YOU, "", Status.Withdrawn);
    const after = readComments(root);
    expect(standing(threadsOf(review, after.threads)).isDone).toBe(true);
  });

  it("reports a review that lists a thread that isn't there", () => {
    const root = repo();
    start(root);
    const done = apply(root, { op: "handover" }, YOU);
    const file = join(root, "authoring", "reviews", `${done.review?.id}.yaml`);
    writeFileSync(file, readFileSync(file, "utf8").replace(/id: c\w+/, "id: cgone"));
    expect(readComments(root).problems[0]).toMatch(/no thread cgone/);
  });
});

describe("moving over", () => {
  it("turns an old comment (kind, causedBy, plan, thread, review) into a thread with messages", () => {
    const thread = migrateEntry({
      id: "c1",
      kind: "regression",
      status: "ready",
      by: "reviewer",
      createdAt: "2026-10-26T16:00:00.000Z",
      board: BOARD,
      causedBy: "c0",
      review: "20261026-1600",
      text: "broke it",
      plan: { by: "agent", at: "2026-10-26T16:05:00.000Z", text: "undo" },
      thread: [
        { by: "you", at: "2026-10-26T16:01:00.000Z", text: "yes" },
        { by: "agent", at: "2026-10-26T16:10:00.000Z", text: "undone" },
      ],
    });
    expect(thread).toMatchObject({
      label: Label.Regression,
      about: "c0",
      by: "reviewer",
      role: Role.Reviewer,
      messages: [
        { by: "you", role: Role.Person, text: "yes" },
        { by: "fixer", role: Role.Fixer, text: "undo", status: Status.Planned },
        { by: "fixer", role: Role.Fixer, text: "undone", status: Status.Ready },
      ],
    });
    expect(thread).not.toHaveProperty("review");
  });
});
