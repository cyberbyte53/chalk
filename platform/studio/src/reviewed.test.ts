import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { changesBetween, recordOf } from "./content/board-record";
import { addRan } from "./reach/ran";
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
  // What draws every board: the player, and the app's stylesheet.
  put(
    "platform/packages/player/src/board-player.tsx",
    'import { frame } from "./frame";\nexport function BoardPlayer() {\n  return frame();\n}\n',
  );
  put("platform/packages/player/src/lesson-player.tsx", "export function LessonPlayer() {}\n");
  put("platform/packages/player/src/frame.ts", "export const frame = () => 1;\n");
  put("platform/apps/learner/src/app.css", ".board {}\n");
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
    writeFileSync(join(dir, `${key}.json`), JSON.stringify(recordOf(board as object)));
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
    expect(words).toContain('  sheet: marks "counts" → "none"');
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
      code: [{ node: `${SRC}/text.ts#text` }],
    });
    expect(changesBetween({ do: "ƒ () => 1" }, { do: "ƒ () => 2" })).toEqual([
      { at: "do", was: "ƒ () => 1", now: "ƒ () => 2" },
    ]);
  });

  it("keeps a board's own content, not its props' definitions copied into it (they are code)", () => {
    const withScene = (describe: string, hear: string, hidden = ["fixed"]) => ({
      ...board("Here is a dot", "counts"),
      model: {
        scene: {
          children: { sheet: { describe } },
          variables: { x: 1 },
          hear: { [hear]: 1 },
          start: { hidden },
        },
      },
    });
    const root = repo({ dot: withScene("A plane.", "sheet.pinned") });
    passUnder(root, LESSON, "reviewer");
    const kept = readFileSync(
      join(root, "authoring/books/class9-maths/geometry/reviewed.yaml"),
      "utf8",
    );
    expect(kept).not.toContain("A plane.");
    build(root, { dot: withScene("A plane, changed.", "sheet.pinned") });
    expect(changesUnder(root, LESSON)[0]?.status).toBe("unchanged");
    build(root, { dot: withScene("A plane.", "sheet.moved") });
    expect(changesUnder(root, LESSON)[0]).toMatchObject({ status: "changed" });
    expect(changesWords(changesUnder(root, LESSON))).toContain("hear.sheet.moved nothing → 1");
    // What the board starts as is its own too.
    build(root, { dot: withScene("A plane.", "sheet.pinned", ["fixed", "yours"]) });
    expect(changesWords(changesUnder(root, LESSON))).toContain("rules: start.hidden");
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

  it("any of a prop's code reaches every board placing it: a layer's, the core's, its styles", () => {
    const root = repo({ town: board("A town", "counts") });
    passUnder(root, LESSON, "reviewer");
    edit(root, `${SRC}/clues-view.tsx`, "export const cluesView = () => 2;\n");
    expect(changesUnder(root, LESSON)[0]).toMatchObject({
      code: [{ node: `${SRC}/clues-view.tsx#cluesView` }],
    });
    execFileSync("git", ["commit", "-qam", "clues"], { cwd: root, env: ENV });
    passUnder(root, LESSON, "reviewer");
    edit(
      root,
      `${SRC}/plane.ts`,
      'import { walkerView } from "./walker-view";\nexport const plane = [walkerView];\n',
    );
    edit(root, `${SRC}/styles.css`, ".plane { color: red }\n");
    expect(changesUnder(root, LESSON)[0]).toMatchObject({
      code: [{ node: `${SRC}/plane.ts#plane` }, { node: `${SRC}/styles.css#` }],
    });
  });

  it("what draws every board reaches every board: the player's code, the app's stylesheets", () => {
    const root = repo({ town: board("A town", "counts"), dot: board("Here is a dot", "counts") });
    passUnder(root, LESSON, "reviewer");
    edit(root, "platform/packages/player/src/frame.ts", "export const frame = () => 2;\n");
    edit(root, "platform/apps/learner/src/app.css", ".board { color: red }\n");
    const changes = changesUnder(root, LESSON);
    expect(changes).toHaveLength(2);
    for (const c of changes)
      expect(c).toMatchObject({
        status: "changed",
        code: expect.arrayContaining([
          { node: "platform/apps/learner/src/app.css#" },
          { node: "platform/packages/player/src/frame.ts#frame" },
        ]),
      });
  });

  it("counts a board as changed when its code can't be told", () => {
    const root = repo({ dot: board("Here is a dot", "counts") });
    passUnder(root, LESSON, "reviewer");
    writeFileSync(join(root, "build/reach.json"), JSON.stringify({ boards: {}, modules: {} }));
    expect(changesUnder(root, LESSON)[0]?.status).toBe("changed");
  });

  it("says whether a change's lines ran in the review, when this machine saw it", () => {
    const root = repo({ town: board("A town", "counts") });
    edit(
      root,
      `${SRC}/text.ts`,
      'export const text = () => {\n  if (Math.PI > 4) return "never";\n  return "t";\n};\n',
    );
    execFileSync("git", ["commit", "-qam", "text"], { cwd: root, env: ENV });
    // The review played it: lines 1 and 3 ran, not 2 (its branch never taken).
    addRan(root, `${LESSON}/town`, {
      [`${SRC}/text.ts`]: [
        [1, 1],
        [3, 4],
      ],
    });
    passUnder(root, LESSON, "reviewer");
    edit(
      root,
      `${SRC}/text.ts`,
      'export const text = () => {\n  if (Math.PI > 4) return "not ever";\n  return "t";\n};\n',
    );
    expect(changesUnder(root, LESSON)[0]).toMatchObject({
      code: [{ node: `${SRC}/text.ts#text`, inReview: "didn't run" }],
    });
    edit(
      root,
      `${SRC}/text.ts`,
      'export const text = () => {\n  if (Math.PI > 4) return "never";\n  return "u";\n};\n',
    );
    expect(changesUnder(root, LESSON)[0]).toMatchObject({
      code: [{ node: `${SRC}/text.ts#text`, inReview: "ran" }],
    });
    // Passed again without being played here: nothing is known, so no hint.
    passUnder(root, LESSON, "reviewer");
    edit(root, `${SRC}/text.ts`, 'export const text = () => "v";\n');
    expect(changesUnder(root, LESSON)[0]).toMatchObject({
      code: [{ node: `${SRC}/text.ts#text` }],
    });
    const [change] = changesUnder(root, LESSON);
    expect(change?.status === "changed" && change.code[0]?.inReview).toBe(undefined);
  });
});
