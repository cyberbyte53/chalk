import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  type Change,
  MOVES,
  type NewThread,
  Role,
  Status,
  Weight,
  type Who,
  YOU,
  applyChange,
  fileHomeOf,
  homeOf,
  pickedOption,
  readComments,
  waitsOn,
} from "./comments";
import { goneThreads } from "./thread-places";

const BOARD = "class10-maths/polynomials/value-and-zeroes/value";
const FIXER: Who = { name: "fixer", role: Role.Fixer };
const REVIEWER: Who = { name: "reviewer", role: Role.Reviewer };

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
  // A reviewer's finding says how much it weighs.
  const weight =
    who.role === Role.Reviewer && extra.options === undefined ? Weight.Must : undefined;
  const done = apply(
    root,
    {
      op: "start",
      thread: {
        board: BOARD,
        target: "machine/put",
        text: "too small",
        ...(weight ? { weight } : {}),
        ...extra,
      },
    },
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
      by: "you",
      role: Role.Person,
      messages: [],
    });
    const read = readComments(root);
    expect(read.problems).toEqual([]);
    expect(read.threads.map((c) => c.id).sort()).toEqual([onBoard.id, onProp.id].sort());
  });

  it("files a thread on a book or chapter screen: a lesson's with its chapter, a book's with the book", () => {
    const root = repo();
    const onLesson = start(root, {
      board: "class10-maths/polynomials/zeroes",
      target: "art",
      source: "content/class10-maths/polynomials/zeroes/art.tsx:1",
    });
    const onBook = start(root, {
      board: "class10-maths",
      target: "title",
      source: "content/class10-maths/build.yaml:1",
    });
    expect(onLesson.home).toBe("content/class10-maths/polynomials");
    expect(onBook.home).toBe("content/class10-maths");
    expect(
      readFileSync(join(root, "authoring/books/class10-maths/comments.yaml"), "utf8"),
    ).toContain("title");
    const read = readComments(root);
    expect(read.problems).toEqual([]);
    expect(read.threads.map((c) => c.id)).toEqual(expect.arrayContaining([onLesson.id, onBook.id]));
  });

  it("moves only as each role may: the fixer plans and readies, the person closes what he opened", () => {
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

  it("lets anyone start a thread, and says whose turn it is", () => {
    const root = repo();
    // The person's comment and a reviewer's finding wait on the agent.
    const comment = start(root);
    const finding = start(root, {}, REVIEWER);
    expect(waitsOn(comment)).toBe(Role.Fixer);
    expect(waitsOn(finding)).toBe(Role.Fixer);
    // The fixer's question waits on the person; their answer gives it back to the agent.
    const question = start(root, { text: "keep the summary?" }, FIXER);
    expect(question).toMatchObject({ by: "fixer", role: Role.Fixer });
    expect(waitsOn(question)).toBe(Role.Person);
    const answered = write(root, question.id, YOU, "yes, at each lesson's end");
    if (!answered.ok || answered.thread === undefined) throw new Error("not written");
    expect(waitsOn(answered.thread)).toBe(Role.Fixer);
    // The fixer's reason, without a move, is for the person.
    const reason = write(root, comment.id, FIXER, "it is already 44px");
    if (!reason.ok || reason.thread === undefined) throw new Error("not written");
    expect(waitsOn(reason.thread)).toBe(Role.Person);
    // Planned is the fixer's, ready its opener's (here the fixer's own question), closed no one's.
    write(root, question.id, FIXER, "will add it", Status.Planned);
    expect(waitsOn(readComments(root).threads.find((t) => t.id === question.id) as never)).toBe(
      Role.Fixer,
    );
    write(root, question.id, FIXER, "added", Status.Ready);
    expect(waitsOn(readComments(root).threads.find((t) => t.id === question.id) as never)).toBe(
      Role.Fixer,
    );
    write(root, question.id, FIXER, "", Status.Closed);
    expect(waitsOn(readComments(root).threads.find((t) => t.id === question.id) as never)).toBe(
      undefined,
    );
    // The turn is kept on the thread: every view reads that one field.
    const kept = readComments(root).threads.find((t) => t.id === comment.id);
    expect(kept?.turn).toBe(Role.Person);
  });

  it("lets the writer say whose turn it is: a reviewer's taste call is the person's", () => {
    const root = repo();
    const taste = start(root, { text: "taste: the ring or no ring?", turn: Role.Person }, REVIEWER);
    expect(waitsOn(taste)).toBe(Role.Person);
    // A write can hand it on as well, whatever the write would say by itself.
    const handed = applyChange(
      root,
      { op: "write", id: taste.id, text: "this one is mechanical after all", turn: Role.Fixer },
      REVIEWER,
    );
    expect(handed).toMatchObject({ thread: { turn: Role.Fixer } });
  });

  it("works out once the turn of a thread written before turns were kept, and drops about", () => {
    const root = repo();
    const t = start(root);
    const file = join(root, "authoring/books/class10-maths/polynomials/comments.yaml");
    const old = readFileSync(file, "utf8")
      .replace(/^ {2}turn: \w+\n/m, "")
      .replace(/^ {2}text:/m, "  about: cmvzzz\n  text:");
    writeFileSync(file, old);
    const read = readComments(root);
    expect(read.problems).toEqual([]);
    expect(read.threads.find((x) => x.id === t.id)).toMatchObject({ turn: Role.Fixer });
    expect(read.threads.find((x) => x.id === t.id)).not.toHaveProperty("about");
  });

  it("files what the person said in a fixer's chat in their name; only a fixer does", () => {
    const root = repo();
    expect(start(root, { from: "chat" }, FIXER)).toMatchObject({
      by: "you",
      role: Role.Person,
      from: "chat",
    });
    expect(
      applyChange(
        root,
        { op: "start", thread: { board: BOARD, text: "x", from: "chat", weight: Weight.Must } },
        REVIEWER,
      ),
    ).toMatchObject({ ok: false });
  });

  it("lets an agent withdraw a thread of its own that became moot, and no one else's", () => {
    const root = repo();
    const question = start(root, {}, FIXER);
    const comment = start(root);
    expect(write(root, comment.id, FIXER, "", Status.Withdrawn)).toMatchObject({ ok: false });
    expect(write(root, question.id, REVIEWER, "", Status.Withdrawn)).toMatchObject({ ok: false });
    expect(write(root, question.id, FIXER, "settled in chat", Status.Withdrawn)).toMatchObject({
      thread: { status: Status.Withdrawn },
    });
  });

  it("deletes only an untouched thread of the person's; otherwise it is withdrawn", () => {
    const root = repo();
    const untouched = start(root);
    expect(applyChange(root, { op: "delete", id: untouched.id }, FIXER)).toMatchObject({
      ok: false,
    });
    expect(applyChange(root, { op: "delete", id: untouched.id }, YOU)).toEqual({ ok: true });
    const touched = start(root);
    write(root, touched.id, FIXER, "x", Status.Planned);
    expect(applyChange(root, { op: "delete", id: touched.id }, YOU)).toMatchObject({
      ok: false,
      error: expect.stringContaining("withdraw it instead"),
    });
    expect(write(root, touched.id, YOU, "", Status.Withdrawn)).toMatchObject({
      thread: { status: Status.Withdrawn },
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

  it("a fix sent back after it was ready is planned again and made ready again", () => {
    const root = repo();
    const t = start(root);
    write(root, t.id, FIXER, "bigger", Status.Planned);
    write(root, t.id, FIXER, "done", Status.Ready);
    // "Fix holds", handed to the person: not the agent's turn, so nothing to plan again.
    write(root, t.id, REVIEWER, "holds");
    // The reviewer's "not yet": the agent's turn.
    write(root, t.id, REVIEWER, "still clipped at 360");
    expect(write(root, t.id, FIXER, "wrap it at 360", Status.Planned)).toMatchObject({
      thread: { status: Status.Planned },
    });
    expect(write(root, t.id, FIXER, "wrapped", Status.Ready)).toMatchObject({
      thread: { status: Status.Ready, turn: Role.Person },
    });
  });

  it("a ready fix the person's turn is on isn't planned again by the fixer", () => {
    const root = repo();
    const t = start(root);
    write(root, t.id, FIXER, "bigger", Status.Planned);
    write(root, t.id, FIXER, "done", Status.Ready);
    expect(write(root, t.id, FIXER, "again", Status.Planned)).toMatchObject({ ok: false });
  });

  it("a closed thread says it is closed, and by whom", () => {
    const root = repo();
    const t = start(root);
    write(root, t.id, YOU, "fine", Status.Closed);
    expect(write(root, t.id, FIXER, "done", Status.Ready)).toMatchObject({
      ok: false,
      error: expect.stringMatching(/it was closed by you on \d{4}-\d\d-\d\d: nothing to do/),
    });
  });

  it("records the files changed since the plan, a file taken away too, not comment files", () => {
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
      thread: {
        changed: [
          "content/class10-maths/polynomials/old.yaml",
          "library/props/polynomials/view.tsx",
        ],
      },
    });
  });

  it("records a fix's files when it was committed before it was ready, and a second fix its own", () => {
    const root = repo();
    const commit = (message: string) => {
      execFileSync("git", ["add", "."], { cwd: root });
      execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", message], {
        cwd: root,
      });
    };
    execFileSync("git", ["init", "-q"], { cwd: root });
    const view = join(root, "library", "props", "polynomials", "view.tsx");
    const words = join(root, "library", "props", "polynomials", "words.ts");
    writeFileSync(view, "a\n");
    writeFileSync(words, "a\n");
    commit("start");
    const t = start(root);
    write(root, t.id, FIXER, "bigger", Status.Planned);
    writeFileSync(view, "b\n");
    commit("the fix");
    expect(write(root, t.id, FIXER, "done", Status.Ready)).toMatchObject({
      thread: { changed: ["library/props/polynomials/view.tsx"] },
    });
    write(root, t.id, REVIEWER, "the words are wrong now");
    write(root, t.id, FIXER, "fix the words", Status.Planned);
    writeFileSync(words, "b\n");
    commit("the second fix");
    expect(write(root, t.id, FIXER, "done again", Status.Ready)).toMatchObject({
      thread: { changed: ["library/props/polynomials/words.ts"] },
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

  it("has a status move for every status; a reviewer only withdraws and closes its own", () => {
    expect(MOVES[Role.Reviewer].map((m) => [m.to, m.own])).toEqual([
      [Status.Withdrawn, true],
      [Status.Closed, true],
    ]);
    const reachable = new Set(Object.values(MOVES).flatMap((moves) => moves.map((m) => m.to)));
    expect([...reachable].sort()).toEqual(Object.values(Status).sort());
  });
});

describe("weight", () => {
  it("is required on a reviewer's finding, and kept on it", () => {
    const root = repo();
    expect(
      applyChange(root, { op: "start", thread: { board: BOARD, text: "clipped" } }, REVIEWER),
    ).toMatchObject({ ok: false, error: expect.stringContaining("weight: must") });
    const consider = start(root, { weight: Weight.Consider, text: "a softer colour?" }, REVIEWER);
    expect(consider.weight).toBe(Weight.Consider);
    expect(readComments(root).threads.find((t) => t.id === consider.id)?.weight).toBe(
      Weight.Consider,
    );
    // Not asked of the person or a fixer.
    expect(start(root).weight).toBeUndefined();
    expect(start(root, {}, FIXER).weight).toBeUndefined();
  });

  it("a consider the fixer leaves is its word to the reviewer, who closes it", () => {
    const root = repo();
    const t = start(root, { weight: Weight.Consider }, REVIEWER);
    const left = write(root, t.id, FIXER, "left it: the book draws it this way");
    expect(left).toMatchObject({ thread: { status: Status.Open, turn: Role.Reviewer } });
    expect(write(root, t.id, REVIEWER, "", Status.Closed)).toMatchObject({
      thread: { status: Status.Closed },
    });
  });
});

describe("whoever opened a thread closes it", () => {
  /** A thread `opener` started, planned and made ready by the fixer. */
  const readied = (root: string, opener: Who) => {
    const t = start(root, {}, opener);
    write(root, t.id, FIXER, "bigger", Status.Planned);
    const done = write(root, t.id, FIXER, "made it 44px", Status.Ready);
    if (!done.ok || done.thread === undefined) throw new Error(done.ok ? "no thread" : done.error);
    return done.thread;
  };

  it("sends a ready thread back to its opener's role", () => {
    const root = repo();
    expect(readied(root, YOU).turn).toBe(Role.Person);
    expect(readied(root, REVIEWER).turn).toBe(Role.Reviewer);
    expect(readied(root, FIXER).turn).toBe(Role.Fixer);
    // Filed from chat, it is the person's.
    const chat = start(root, { from: "chat" }, FIXER);
    write(root, chat.id, FIXER, "x", Status.Planned);
    expect(write(root, chat.id, FIXER, "done", Status.Ready)).toMatchObject({
      thread: { turn: Role.Person },
    });
  });

  it("the reviewer closes its own finding once ready, or sends it back to the fixer", () => {
    const root = repo();
    const t = readied(root, REVIEWER);
    expect(write(root, t.id, FIXER, "", Status.Closed)).toMatchObject({ ok: false });
    // Not yet: the fixer's turn again, and the reviewer can't close it while it is.
    expect(write(root, t.id, REVIEWER, "still clipped at 360")).toMatchObject({
      thread: { status: Status.Ready, turn: Role.Fixer },
    });
    expect(write(root, t.id, REVIEWER, "", Status.Closed)).toMatchObject({ ok: false });
    write(root, t.id, FIXER, "wrap it", Status.Planned);
    write(root, t.id, FIXER, "wrapped", Status.Ready);
    expect(write(root, t.id, REVIEWER, "holds", Status.Closed)).toMatchObject({
      thread: { status: Status.Closed },
    });
  });

  it("the fixer closes its own thread on its turn; nobody else's but the person's", () => {
    const root = repo();
    const question = start(root, { text: "keep the summary?" }, FIXER);
    // Not before the person has answered it.
    expect(write(root, question.id, FIXER, "", Status.Closed)).toMatchObject({ ok: false });
    write(root, question.id, YOU, "no");
    expect(write(root, question.id, REVIEWER, "", Status.Closed)).toMatchObject({ ok: false });
    expect(write(root, question.id, FIXER, "dropped it", Status.Closed)).toMatchObject({
      thread: { status: Status.Closed },
    });
    // A ready thread of the person's: only he closes it.
    const comment = readied(root, YOU);
    expect(write(root, comment.id, FIXER, "", Status.Closed)).toMatchObject({ ok: false });
    expect(write(root, comment.id, REVIEWER, "", Status.Closed)).toMatchObject({ ok: false });
    expect(write(root, comment.id, YOU, "", Status.Closed)).toMatchObject({ ok: true });
  });

  it("the person closes any thread, whoever opened it and whoever's turn it is", () => {
    const root = repo();
    for (const opener of [FIXER, REVIEWER]) {
      const t = start(root, {}, opener);
      expect(write(root, t.id, YOU, "", Status.Closed)).toMatchObject({
        thread: { status: Status.Closed },
      });
    }
    const ready = readied(root, REVIEWER);
    expect(write(root, ready.id, YOU, "", Status.Closed)).toMatchObject({ ok: true });
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
});

describe("ask", () => {
  const OPTIONS = [
    { label: "Keep the ring", why: "it shows where the point is" },
    { label: "Drop it", why: "less on the screen" },
  ];

  it("starts a thread with options, always on the person's turn, without a weight", () => {
    const root = repo();
    for (const who of [FIXER, REVIEWER]) {
      const t = start(root, { text: "the ring?", options: OPTIONS, turn: Role.Fixer }, who);
      expect(t).toMatchObject({ options: OPTIONS, turn: Role.Person, status: Status.Open });
      expect(t.weight).toBeUndefined();
    }
    expect(readComments(root).problems).toEqual([]);
  });

  it("takes two to four options, each with its own label", () => {
    const root = repo();
    const ask = (options: { label: string; why: string }[]) =>
      applyChange(root, { op: "start", thread: { board: BOARD, text: "?", options } }, FIXER);
    expect(ask(OPTIONS.slice(0, 1))).toMatchObject({ ok: false });
    expect(
      ask([...OPTIONS, ...OPTIONS.map((o) => ({ ...o, label: `${o.label}!` }))]),
    ).toMatchObject({ ok: true });
    expect(
      ask(
        [...OPTIONS, ...OPTIONS, { label: "c", why: "c" }].map((o, i) => ({ ...o, label: `${i}` })),
      ),
    ).toMatchObject({ ok: false });
    expect(ask([OPTIONS[0], OPTIONS[0]] as never)).toMatchObject({
      ok: false,
      error: expect.stringContaining("its own label"),
    });
  });

  it("is answered by a label (or his own words), which goes back to the fixer", () => {
    const root = repo();
    const t = start(root, { text: "the ring?", options: OPTIONS }, FIXER);
    const answered = write(root, t.id, YOU, "Drop it");
    if (!answered.ok || answered.thread === undefined) throw new Error("not written");
    expect(answered.thread).toMatchObject({ status: Status.Open, turn: Role.Fixer });
    expect(pickedOption(answered.thread)).toEqual(OPTIONS[1]);
    const own = write(root, t.id, YOU, "keep it, but thinner");
    if (!own.ok || own.thread === undefined) throw new Error("not written");
    expect(pickedOption(own.thread)).toBeUndefined();
  });

  it("can be about a whole planning file, with no words quoted", () => {
    const root = repo();
    const plan = "authoring/books/class10-maths/polynomials/plan.md";
    mkdirSync(join(root, "authoring/books/class10-maths/polynomials"), { recursive: true });
    writeFileSync(join(root, plan), "# Plan\n");
    const t = apply(
      root,
      {
        op: "start",
        thread: { source: `${plan}:1`, text: "two lessons or three?", options: OPTIONS },
      },
      FIXER,
    ).thread;
    expect(t).toMatchObject({ home: "content/class10-maths/polynomials", turn: Role.Person });
    expect(t?.quote).toBeUndefined();
    expect(t?.board).toBeUndefined();
  });
});

describe("threads on guide files", () => {
  const BOOK = "authoring/books/class10-maths";
  const FILES: [file: string, home: string, comments: string][] = [
    ["authoring/guide.md", "authoring", "authoring/comments.yaml"],
    ["authoring/guide/examples.md", "authoring", "authoring/comments.yaml"],
    [`${BOOK}/guide.md`, "content/class10-maths", `${BOOK}/comments.yaml`],
    [`${BOOK}/guide/x.md`, "content/class10-maths", `${BOOK}/comments.yaml`],
    [
      `${BOOK}/polynomials/plan.md`,
      "content/class10-maths/polynomials",
      `${BOOK}/polynomials/comments.yaml`,
    ],
  ];

  function guided(): string {
    const root = repo();
    for (const [file] of FILES) {
      mkdirSync(join(root, file, ".."), { recursive: true });
      writeFileSync(join(root, file), "# A guide\n\nSay only what is different here.\n");
    }
    return root;
  }

  it("files each in its home, from its path, and reads it back", () => {
    const root = guided();
    const started = FILES.map(([file, home, comments]) => {
      const t = start(root, {
        board: undefined,
        target: undefined,
        source: `${file}:3`,
        quote: "only what is different",
        text: `on ${file}`,
      });
      expect(t.home, file).toBe(home);
      expect(readFileSync(join(root, comments), "utf8"), file).toContain(`on ${file}`);
      return t;
    });
    const read = readComments(root);
    expect(read.problems).toEqual([]);
    for (const t of started)
      expect(read.threads.find((x) => x.id === t.id)).toMatchObject({
        home: t.home,
        source: t.source,
        quote: "only what is different",
      });
  });

  it("never takes a guide folder for a book or a chapter", () => {
    const root = guided();
    // Not a thread list: read as a chapter's or a book's, it would be a problem.
    writeFileSync(join(root, BOOK, "guide", "comments.yaml"), "not: a list\n");
    mkdirSync(join(root, "authoring/books/guide"), { recursive: true });
    writeFileSync(join(root, "authoring/books/guide/comments.yaml"), "not: a list\n");
    expect(readComments(root).problems).toEqual([]);
    expect(fileHomeOf(`${BOOK}/guide/x.md:1`)).toBe("content/class10-maths");
    expect(fileHomeOf("authoring/books/guide/x/plan.md")).toBeUndefined();
    expect(fileHomeOf(`${BOOK}/notes.md`)).toBeUndefined();
    expect(
      homeOf(root, { board: "class10-maths/guide/x", source: "content/class10-maths/guide/x:1" }),
    ).toBe(undefined);
  });
});

describe("the threads kept in the repo", () => {
  it("still read, with no weight or options on the old ones", () => {
    const root = join(__dirname, "..", "..", "..");
    const read = readComments(root);
    expect(read.problems).toEqual([]);
    const chapter = read.threads.filter(
      (t) => t.home === "content/class9-maths/coordinate-geometry",
    );
    expect(chapter.length).toBeGreaterThan(0);
    expect(chapter.some((t) => t.status === Status.Closed)).toBe(true);
  });
});

describe("threads whose place is gone", () => {
  const reach = (pieces: string[]) => ({
    boards: {
      [BOARD]: { module: "m", pieces: Object.fromEntries(pieces.map((p) => [p, { stack: [] }])) },
    },
    modules: {},
  });

  it("on a book or chapter screen: there while the node is built and has what it is at", () => {
    const root = repo();
    const lesson = "class10-maths/polynomials/zeroes";
    const onTitle = start(root, { board: lesson, target: "title" });
    const onArt = start(root, { board: lesson, target: "art" });
    const gone = () => goneThreads(root, readComments(root).threads, reach([]));
    expect(gone()).toEqual([
      `${onTitle.id} [open]: ${lesson} is no longer built`,
      `${onArt.id} [open]: ${lesson} is no longer built`,
    ]);
    mkdirSync(join(root, "build", lesson), { recursive: true });
    writeFileSync(join(root, "build", `${lesson}.json`), "{}");
    expect(gone()).toEqual([`${onArt.id} [open]: ${lesson} has no art now`]);
    mkdirSync(join(root, "content", lesson), { recursive: true });
    writeFileSync(join(root, "content", lesson, "art.tsx"), "");
    expect(gone()).toEqual([]);
  });

  it("are listed while open, until re-pointed by a fixer saying where they went", () => {
    const root = repo();
    const t = start(root);
    expect(goneThreads(root, readComments(root).threads, reach(["machine"]))).toEqual([]);
    expect(goneThreads(root, readComments(root).threads, reach(["dial"]))).toEqual([
      `${t.id} [open]: ${BOARD} has no piece machine now`,
    ]);
    expect(
      applyChange(
        root,
        { op: "move", id: t.id, to: { board: BOARD, target: "dial" }, text: "" },
        FIXER,
      ),
    ).toMatchObject({ ok: false });
    expect(
      applyChange(
        root,
        { op: "move", id: t.id, to: { board: BOARD, target: "dial" }, text: "x" },
        REVIEWER,
      ),
    ).toMatchObject({ ok: false });
    const moved = apply(
      root,
      {
        op: "move",
        id: t.id,
        to: { board: BOARD, target: "dial" },
        text: "the machine is the dial now",
      },
      FIXER,
    ).thread;
    expect(moved?.target).toBe("dial");
    expect(moved?.messages.at(-1)?.text).toBe(
      `moved from content/${BOARD}#machine/put to content/${BOARD}#dial: the machine is the dial now`,
    );
    expect(goneThreads(root, readComments(root).threads, reach(["dial"]))).toEqual([]);
  });

  it("are history once answered", () => {
    const root = repo();
    const t = start(root);
    write(root, t.id, FIXER, "gone with the old board", Status.Planned);
    write(root, t.id, FIXER, "removed: the board is text now", Status.Ready);
    expect(goneThreads(root, readComments(root).threads, reach([]))).toEqual([]);
  });
});
