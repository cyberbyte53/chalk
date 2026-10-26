import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Actor, Kind, Status, applyChange, latestReview, readComments } from "./comments";

const BOARD = "class10-maths/polynomials/value-and-zeroes/value";

function repo(): string {
  const root = mkdtempSync(join(tmpdir(), "comments-"));
  mkdirSync(join(root, "content", "class10-maths", "polynomials"), { recursive: true });
  mkdirSync(join(root, "library", "props", "polynomials"), { recursive: true });
  writeFileSync(
    join(root, "library", "catalogue.md"),
    "## `polynomials` — `@chalk/prop-polynomials`\n\n| Prop | Shows |\n|---|---|\n| `valueMachine` | a machine |\n",
  );
  return root;
}

function add(root: string, extra: Record<string, unknown> = {}, actor: Actor = Actor.Person) {
  const done = applyChange(
    root,
    { op: "add", comment: { board: BOARD, target: "machine/put", text: "too small", ...extra } },
    actor,
  );
  if (!done.ok || done.comment === undefined) throw new Error(done.ok ? "no comment" : done.error);
  return done.comment;
}

describe("comments", () => {
  it("files a board comment with its chapter and a prop comment with its prop, and reads them back", () => {
    const root = repo();
    const onBoard = add(root);
    const onProp = add(root, { prop: "valueMachine" });
    expect(onBoard.home).toBe("content/class10-maths/polynomials");
    expect(onProp.home).toBe("library/props/polynomials");
    expect(onBoard).toMatchObject({ status: Status.Open, kind: Kind.Comment, by: "you" });
    const read = readComments(root);
    expect(read.problems).toEqual([]);
    expect(read.comments.map((c) => c.id).sort()).toEqual([onBoard.id, onProp.id].sort());
    expect(readFileSync(join(root, onBoard.home, "comments.yaml"), "utf8")).toContain(
      "machine/put",
    );
  });

  it("follows the lifecycle: the agent plans and marks ready; only the person closes", () => {
    const root = repo();
    const c = add(root);
    const ready = applyChange(root, { op: "ready", id: c.id, text: "done" }, Actor.Agent);
    expect(ready).toMatchObject({ ok: false });
    expect(applyChange(root, { op: "plan", id: c.id, text: "bigger" }, Actor.Person)).toMatchObject(
      {
        ok: false,
      },
    );
    expect(applyChange(root, { op: "plan", id: c.id, text: "bigger" }, Actor.Agent)).toMatchObject({
      ok: true,
      comment: { status: Status.Planned, plan: { text: "bigger" } },
    });
    expect(
      applyChange(root, { op: "ready", id: c.id, text: "made it 44px" }, Actor.Agent),
    ).toMatchObject({
      ok: true,
      comment: { status: Status.Ready },
    });
    expect(applyChange(root, { op: "close", id: c.id }, Actor.Agent)).toMatchObject({ ok: false });
    // The person replying sends it back.
    expect(
      applyChange(root, { op: "reply", id: c.id, text: "still small" }, Actor.Person),
    ).toMatchObject({
      comment: { status: Status.Open },
    });
    expect(applyChange(root, { op: "close", id: c.id }, Actor.Person)).toMatchObject({
      comment: { status: Status.Closed },
    });
  });

  it("deletes only an untouched comment; one the agent acted on is withdrawn instead", () => {
    const root = repo();
    const untouched = add(root);
    expect(applyChange(root, { op: "delete", id: untouched.id }, Actor.Person)).toEqual({
      ok: true,
    });
    const touched = add(root);
    applyChange(root, { op: "plan", id: touched.id, text: "x" }, Actor.Agent);
    expect(applyChange(root, { op: "delete", id: touched.id }, Actor.Person)).toMatchObject({
      ok: false,
    });
    expect(applyChange(root, { op: "withdraw", id: touched.id }, Actor.Person)).toMatchObject({
      comment: { status: Status.Withdrawn },
    });
    expect(readComments(root).comments.map((c) => c.id)).toEqual([touched.id]);
  });

  it("holds a comment back from ready while a regression it caused is open", () => {
    const root = repo();
    const c = add(root);
    applyChange(root, { op: "plan", id: c.id, text: "x" }, Actor.Agent);
    expect(() => add(root, { kind: Kind.Regression }, Actor.Agent)).toThrow(/causedBy/);
    const broke = add(root, { kind: Kind.Regression, causedBy: c.id, by: "reviewer" }, Actor.Agent);
    expect(applyChange(root, { op: "ready", id: c.id, text: "done" }, Actor.Agent)).toMatchObject({
      ok: false,
      error: expect.stringContaining(broke.id),
    });
    applyChange(root, { op: "plan", id: broke.id, text: "fix" }, Actor.Agent);
    applyChange(root, { op: "ready", id: broke.id, text: "fixed" }, Actor.Agent);
    expect(applyChange(root, { op: "ready", id: c.id, text: "done" }, Actor.Agent)).toMatchObject({
      ok: true,
    });
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
    const c = add(root);
    applyChange(root, { op: "plan", id: c.id, text: "x" }, Actor.Agent);
    rmSync(old);
    writeFileSync(join(root, "library", "props", "polynomials", "view.tsx"), "y\n");
    const done = applyChange(root, { op: "ready", id: c.id, text: "done" }, Actor.Agent);
    expect(done).toMatchObject({
      comment: { changed: ["library/props/polynomials/view.tsx"] },
    });
  });

  it("lets an agent file findings and chat feedback, not comments in the person's name", () => {
    const root = repo();
    expect(() => add(root, {}, Actor.Agent)).toThrow(/finding/);
    expect(add(root, { kind: Kind.Finding }, Actor.Agent)).toMatchObject({
      kind: Kind.Finding,
      by: "agent",
    });
    expect(add(root, { from: "chat", by: "you" }, Actor.Agent)).toMatchObject({
      from: "chat",
      by: "you",
    });
    expect(() => add(root, { kind: Kind.Finding })).toThrow(/agents/);
  });

  it("hands the person's new comments over as one review", () => {
    const root = repo();
    const a = add(root);
    const b = add(root, { prop: "valueMachine" });
    const done = applyChange(root, { op: "handover" }, Actor.Person);
    expect(done).toMatchObject({ ok: true, count: 2 });
    const read = readComments(root).comments;
    expect(new Set(read.map((c) => c.review))).toEqual(new Set([done.ok ? done.review : "?"]));
    expect(latestReview(read)).toBe(done.ok ? done.review : "?");
    add(root);
    expect(applyChange(root, { op: "handover" }, Actor.Person)).toMatchObject({ count: 1 });
    expect([a.id, b.id]).toHaveLength(2);
  });

  it("reports an entry that doesn't fit, instead of skipping it, and refuses to write over it", () => {
    const root = repo();
    add(root);
    const file = join(root, "content", "class10-maths", "polynomials", "comments.yaml");
    writeFileSync(file, `${readFileSync(file, "utf8")}- id: broken\n  status: maybe\n`);
    const read = readComments(root);
    expect(read.problems).toHaveLength(1);
    expect(read.problems[0]).toMatch(/comments.yaml #2/);
    expect(() => add(root)).toThrow(/fix the comments files first/);
  });
});
