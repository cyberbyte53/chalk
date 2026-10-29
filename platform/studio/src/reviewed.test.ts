import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { changesBetween, recordOf } from "./content/board-record";
import { changesUnder, changesWords, passUnder } from "./reviewed";

const LESSON = "class9-maths/geometry/a-lesson";

/** A repo with a built board record for each board given (as the build writes them). */
function repo(boards: Record<string, unknown>, props: Record<string, string> = { text: "v1" }) {
  const root = mkdtempSync(join(tmpdir(), "chalk-reviewed-"));
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["commit", "-q", "--allow-empty", "-m", "start"], {
    cwd: root,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "t",
      GIT_AUTHOR_EMAIL: "t@t",
      GIT_COMMITTER_NAME: "t",
      GIT_COMMITTER_EMAIL: "t@t",
    },
  });
  mkdirSync(join(root, "authoring/books/class9-maths/geometry"), { recursive: true });
  build(root, boards, props);
  return root;
}
function build(root: string, boards: Record<string, unknown>, props: Record<string, string>) {
  for (const [key, board] of Object.entries(boards)) {
    const dir = join(root, "build/review", LESSON);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${key}.json`), JSON.stringify(recordOf(board as object, props)));
  }
}

const board = (words: string, marks: string) => ({
  name: "dot",
  root: {
    kind: "group",
    name: "board",
    children: [
      { kind: "prop", name: "w1", prop: "text", with: { text: { en: words } } },
      { kind: "prop", name: "sheet", prop: "plane", with: { marks } },
    ],
  },
  when: [{ on: "sheet.pinned", do: () => "show fixed" }],
});

describe("what changed since a board was passed", () => {
  it("says new, then unchanged once passed, then exactly which pieces changed", () => {
    const root = repo({ dot: board("Here is a dot", "counts"), desk: board("A desk", "counts") });
    expect(changesUnder(root, LESSON).map((c) => c.status)).toEqual(["new", "new"]);
    expect(passUnder(root, LESSON, "reviewer")).toBe(2);
    expect(changesUnder(root, LESSON).map((c) => c.status)).toEqual(["unchanged", "unchanged"]);

    build(root, { dot: board("Here is a dot", "none") }, { text: "v1" });
    const words = changesWords(changesUnder(root, LESSON));
    expect(words).toContain(`${LESSON}/dot   changed since passed by reviewer`);
    expect(words).toContain("sheet › with › marks: counts → none");
    expect(words).toContain("1 unchanged since passed: desk");
  });

  it("names a prop whose code changed, and keeps a rule's code as its source text", () => {
    const root = repo({ dot: board("Here is a dot", "counts") });
    passUnder(root, LESSON, "reviewer");
    build(root, { dot: board("Here is a dot", "counts") }, { text: "v2" });
    const [change] = changesUnder(root, LESSON);
    expect(change).toMatchObject({ status: "changed", content: [], props: [{ type: "text" }] });
    expect(changesBetween({ do: "ƒ () => 1" }, { do: "ƒ () => 2" })).toEqual([
      { at: "do", was: "ƒ () => 1", now: "ƒ () => 2" },
    ]);
  });

  it("names pieces by their names, so one moving in its list isn't every later one changing", () => {
    const was = [
      { name: "a", v: 1 },
      { name: "b", v: 2 },
    ];
    const now = [
      { name: "b", v: 2 },
      { name: "a", v: 1 },
    ];
    expect(changesBetween(was, now)).toEqual([]);
  });

  it("a host prop's change reaches only boards with the changed layer on (or any, for its core)", () => {
    const root = repo({});
    // The prop's home (from the catalogue) and its files, committed.
    mkdirSync(join(root, "library"), { recursive: true });
    writeFileSync(join(root, "library/catalogue.md"), "`library/props/coords/plane`\n");
    const src = join(root, "library/props/coords/src");
    mkdirSync(src, { recursive: true });
    for (const f of ["walker-view.tsx", "clues-view.tsx", "plane.ts"])
      writeFileSync(join(src, f), "// v1\n");
    const env = {
      ...process.env,
      GIT_AUTHOR_NAME: "t",
      GIT_AUTHOR_EMAIL: "t@t",
      GIT_COMMITTER_NAME: "t",
      GIT_COMMITTER_EMAIL: "t@t",
    };
    execFileSync("git", ["add", "-A"], { cwd: root });
    execFileSync("git", ["commit", "-q", "-m", "prop"], { cwd: root, env });
    const layers = { town: { prop: "plane", all: ["walker", "clues"], on: ["walker"] } };
    const write = (version: string) => {
      const dir = join(root, "build/review", LESSON);
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, "town.json"),
        JSON.stringify(recordOf(board("A town", "counts"), { plane: version }, layers)),
      );
    };
    write("v1");
    passUnder(root, LESSON, "reviewer");
    // A layer this board doesn't have: nothing to look at.
    writeFileSync(join(src, "clues-view.tsx"), "// v2\n");
    write("v2");
    expect(changesUnder(root, LESSON)[0]?.status).toBe("unchanged");
    // One it has: changed, naming the file.
    writeFileSync(join(src, "walker-view.tsx"), "// v2\n");
    write("v3");
    expect(changesUnder(root, LESSON)[0]).toMatchObject({
      status: "changed",
      props: [
        {
          type: "plane",
          files: [
            "library/props/coords/src/clues-view.tsx",
            "library/props/coords/src/walker-view.tsx",
          ],
        },
      ],
    });
  });

  it("a host's core reaches every board that places it", () => {
    const root = repo({});
    mkdirSync(join(root, "library"), { recursive: true });
    writeFileSync(join(root, "library/catalogue.md"), "`library/props/coords/plane`\n");
    const src = join(root, "library/props/coords/src");
    mkdirSync(src, { recursive: true });
    writeFileSync(join(src, "plane.ts"), "// v1\n");
    const env = {
      ...process.env,
      GIT_AUTHOR_NAME: "t",
      GIT_AUTHOR_EMAIL: "t@t",
      GIT_COMMITTER_NAME: "t",
      GIT_COMMITTER_EMAIL: "t@t",
    };
    execFileSync("git", ["add", "-A"], { cwd: root });
    execFileSync("git", ["commit", "-q", "-m", "prop"], { cwd: root, env });
    const layers = { town: { prop: "plane", all: ["walker", "clues"], on: [] } };
    const dir = join(root, "build/review", LESSON);
    mkdirSync(dir, { recursive: true });
    const write = (v: string) =>
      writeFileSync(
        join(dir, "town.json"),
        JSON.stringify(recordOf(board("A town", "counts"), { plane: v }, layers)),
      );
    write("v1");
    passUnder(root, LESSON, "reviewer");
    writeFileSync(join(src, "plane.ts"), "// v2\n");
    write("v2");
    expect(changesUnder(root, LESSON)[0]?.status).toBe("changed");
  });
});
