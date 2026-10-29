import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { changesBetween, recordOf } from "./content/board-record";
import { changesUnder, changesWords, passUnder } from "./reviewed";

const LESSON = "class9-maths/geometry/a-lesson";

const ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: "t",
  GIT_AUTHOR_EMAIL: "t@t",
  GIT_COMMITTER_NAME: "t",
  GIT_COMMITTER_EMAIL: "t@t",
};
const SRC = "library/props/coords/src";
/** Each board's sheet is a host with walker and clues layers; the walker may be on, clues never. */
const LAYERS = { sheet: { prop: "plane", all: ["walker", "clues"], everOn: ["walker"] } };

/**
 * A repo with a prop package (a host `plane` built of walker and clues layers, and `text`) and a
 * lesson file, committed, and a built record and reach for each board given, as the build writes them.
 */
function repo(boards: Record<string, unknown>) {
  const root = mkdtempSync(join(tmpdir(), "chalk-reviewed-"));
  const put = (file: string, text: string) => {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  };
  put("library/catalogue.md", "`library/props/coords/plane`\n`library/props/coords/text`\n");
  put(
    "library/props/coords/package.json",
    JSON.stringify({
      name: "@t/coords",
      exports: { ".": "./src/index.ts", "./styles.css": "./src/styles.css" },
    }),
  );
  put(`${SRC}/index.ts`, 'export { plane } from "./plane";\nexport { text } from "./text";\n');
  put(
    `${SRC}/plane.ts`,
    'import { walkerView } from "./walker-view";\nimport { cluesView } from "./clues-view";\nexport const plane = [walkerView, cluesView];\n',
  );
  put(`${SRC}/walker-view.tsx`, "export const walkerView = () => 1;\n");
  put(`${SRC}/clues-view.tsx`, "export const cluesView = () => 1;\n");
  put(`${SRC}/text.ts`, 'export const text = () => "t";\n');
  put(`${SRC}/styles.css`, ".plane {}\n");
  put(`content/${LESSON}/overview.ts`, "export const overview = 1;\n");
  put("authoring/books/class9-maths/geometry/.keep", "");
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["add", "-A"], { cwd: root });
  execFileSync("git", ["commit", "-q", "-m", "start"], { cwd: root, env: ENV });
  build(root, boards);
  return root;
}
function build(root: string, boards: Record<string, unknown>) {
  const reach = { boards: {} as Record<string, unknown>, modules: {} };
  const dir = join(root, "build/review", LESSON);
  mkdirSync(dir, { recursive: true });
  for (const [key, board] of Object.entries(boards)) {
    writeFileSync(
      join(dir, `${key}.json`),
      JSON.stringify(recordOf(board as object, { text: "v1", plane: "v1" }, LAYERS)),
    );
    reach.boards[`${LESSON}/${key}`] = {
      module: `content/${LESSON}/overview.ts`,
      stack: [`content/${LESSON}/overview.ts:1`],
      pieces: { w1: { type: "text", stack: [] }, sheet: { type: "plane", stack: [] } },
    };
  }
  writeFileSync(join(root, "build/reach.json"), JSON.stringify(reach));
}
const edit = (root: string, file: string, text: string) => writeFileSync(join(root, file), text);

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

    build(root, { dot: board("Here is a dot", "none"), desk: board("A desk", "counts") });
    const words = changesWords(changesUnder(root, LESSON));
    expect(words).toContain(`${LESSON}/dot   changed since passed by reviewer`);
    expect(words).toContain("sheet › with › marks: counts → none");
    expect(words).toContain("1 unchanged since passed: desk");
  });

  it("names the function that changed, and keeps a rule's code as its source text", () => {
    const root = repo({ dot: board("Here is a dot", "counts") });
    passUnder(root, LESSON, "reviewer");
    // A comment or a layout change runs nothing new.
    edit(root, `${SRC}/text.ts`, '// the words\nexport const text = () =>\n  "t";\n');
    expect(changesUnder(root, LESSON)[0]?.status).toBe("unchanged");
    edit(root, `${SRC}/text.ts`, 'export const text = () => "u";\n');
    expect(changesUnder(root, LESSON)[0]).toMatchObject({
      status: "changed",
      content: [],
      code: [`${SRC}/text.ts#text`],
    });
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

  it("a layer's change reaches only boards that may have it on; the core's and styles, every board", () => {
    const root = repo({ town: board("A town", "counts") });
    passUnder(root, LESSON, "reviewer");
    // Clues: provably never on here.
    edit(root, `${SRC}/clues-view.tsx`, "export const cluesView = () => 2;\n");
    expect(changesUnder(root, LESSON)[0]?.status).toBe("unchanged");
    // The walker may be on.
    edit(root, `${SRC}/walker-view.tsx`, "export const walkerView = () => 2;\n");
    expect(changesUnder(root, LESSON)[0]).toMatchObject({
      code: [`${SRC}/walker-view.tsx#walkerView`],
    });
    execFileSync("git", ["commit", "-qam", "walker"], { cwd: root, env: ENV });
    passUnder(root, LESSON, "reviewer");
    edit(
      root,
      `${SRC}/plane.ts`,
      'import { walkerView } from "./walker-view";\nexport const plane = [walkerView];\n',
    );
    edit(root, `${SRC}/styles.css`, ".plane { color: red }\n");
    expect(changesUnder(root, LESSON)[0]).toMatchObject({
      code: [`${SRC}/plane.ts#plane`, `${SRC}/styles.css#`],
    });
  });

  it("counts a board as changed when its code can't be told", () => {
    const root = repo({ dot: board("Here is a dot", "counts") });
    passUnder(root, LESSON, "reviewer");
    writeFileSync(join(root, "build/reach.json"), JSON.stringify({ boards: {}, modules: {} }));
    expect(changesUnder(root, LESSON)[0]?.status).toBe("changed");
  });
});
