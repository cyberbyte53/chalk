import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Reach } from "../content/build";
import { codeGraph } from "./graph";
import { ReachIndex, changesFrom, parseDiff, rollUp } from "./index";

/** A small repo: a player, one prop package with two props in one views file, a lesson and a kit. */
function repo(): string {
  const root = mkdtempSync(join(tmpdir(), "chalk-reach-"));
  const put = (path: string, text: string) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  put(
    "platform/packages/player/package.json",
    JSON.stringify({ name: "@chalk/player", exports: { ".": "./src/index.ts" } }),
  );
  put(
    "platform/packages/player/src/index.ts",
    'export { BoardPlayer } from "./board-player";\nexport { leaf } from "./leaf";\n',
  );
  put(
    "platform/packages/player/src/leaf.ts",
    "export function leaf(x: number) {\n  return x;\n}\n",
  );
  put(
    "platform/packages/player/src/board-player.tsx",
    'import { frame } from "./frame";\nexport function BoardPlayer() {\n  return frame();\n}\n',
  );
  put("platform/packages/player/src/frame.ts", "export function frame() {\n  return 1;\n}\n");
  put(
    "library/props/shapes/package.json",
    JSON.stringify({ name: "@chalk/prop-shapes", exports: { ".": "./src/index.ts" } }),
  );
  put(
    "library/props/shapes/src/defs.ts",
    'export const dot = { type: "dot" };\nexport const bar = { type: "bar" };\n',
  );
  put(
    "library/props/shapes/src/views.tsx",
    [
      'import { leaf } from "@chalk/player";',
      "// a comment",
      "function shared() {",
      "  return 2;",
      "}",
      "export function DotView() {",
      "  return shared();",
      "}",
      "export function BarView() {",
      "  return leaf(3);",
      "}",
      "",
    ].join("\n"),
  );
  put(
    "library/props/shapes/src/index.ts",
    [
      'import { bar, dot } from "./defs";',
      'import { BarView, DotView } from "./views";',
      "export const dotProp = { def: asAnyProp(dot), View: DotView };",
      "export const barProp = { def: asAnyProp(bar), View: BarView };",
      "",
    ].join("\n"),
  );
  put(
    "content/b/c/kit.ts",
    [
      "export function twoDots(b: any) {",
      "  const n = 2;",
      '  return b.prop(dot, "d", { n });',
      "}",
      "export const unused = 1;",
      "",
    ].join("\n"),
  );
  put(
    "content/b/c/l/overview.ts",
    [
      'import { twoDots } from "../kit";',
      "const label = 'hi';",
      'export const one = page("one", (b) => {',
      "  const x = 1;",
      '  b.prop(bar, "a", { x });',
      '  b.prop(bar, "b", { label });',
      "  twoDots(b);",
      "  return [];",
      "});",
      'export const two = page("two", (b) => {',
      '  b.prop(bar, "c", {});',
      "  return [];",
      "});",
      "",
    ].join("\n"),
  );
  put("content/b/c/questions/q/params.yaml", "- n: 1\n- n: 2\n");
  return root;
}

const L = "content/b/c/l/overview.ts";
const built: Reach = {
  modules: { [L]: ["content/b/c/kit.ts"] },
  boards: {
    "b/c/l/one": {
      module: L,
      stack: [`${L}:3`],
      pieces: {
        a: { type: "bar", stack: [`${L}:5`] },
        b: { type: "bar", stack: [`${L}:6`] },
        d: { type: "dot", stack: ["content/b/c/kit.ts:3", `${L}:7`] },
      },
    },
    "b/c/l/two": {
      module: L,
      stack: [`${L}:10`],
      pieces: { c: { type: "bar", stack: [`${L}:11`] } },
    },
    "b/c/questions/q/r1": {
      module: "content/b/c/questions/q/family.ts",
      rows: "content/b/c/questions/q/params.yaml:1-1",
      pieces: { q: { type: "dot", stack: [] } },
    },
    "b/c/questions/q/r2": {
      module: "content/b/c/questions/q/family.ts",
      rows: "content/b/c/questions/q/params.yaml:2-2",
      pieces: { q: { type: "dot", stack: [] } },
    },
  },
};

const root = repo();
const index = new ReachIndex(root, built, codeGraph(root));
const reached = (...specs: string[]) =>
  index
    .reach(changesFrom(index, specs))
    .hits.map((h) => `${h.board}#${h.piece}`)
    .sort();

describe("what a change reaches", () => {
  it("a piece's own call: that piece", () => {
    expect(reached(`${L}:5`)).toEqual(["b/c/l/one#a"]);
  });

  it("a top-level value: the pieces whose calls use it", () => {
    expect(reached(`${L}:2`)).toEqual(["b/c/l/one#b"]);
  });

  it("a kit's function: every piece made through it, wherever", () => {
    expect(reached("content/b/c/kit.ts#twoDots")).toEqual(["b/c/l/one#d"]);
    expect(reached("content/b/c/kit.ts:2")).toEqual(["b/c/l/one#d"]);
  });

  it("code nothing uses: nothing", () => {
    expect(reached("content/b/c/kit.ts#unused")).toEqual([]);
  });

  it("a page's own code between its pieces: the whole board, not the next page", () => {
    expect(reached(`${L}:4`)).toEqual(["b/c/l/one#a", "b/c/l/one#b", "b/c/l/one#d"]);
  });

  it("a prop's view: that prop's pieces only, though its views share a file", () => {
    expect(reached("library/props/shapes/src/views.tsx#DotView")).toEqual([
      "b/c/l/one#d",
      "b/c/questions/q/r1#q",
      "b/c/questions/q/r2#q",
    ]);
    expect(reached("library/props/shapes/src/views.tsx#BarView")).toEqual([
      "b/c/l/one#a",
      "b/c/l/one#b",
      "b/c/l/two#c",
    ]);
  });

  it("code a view uses, through a package's index", () => {
    expect(reached("library/props/shapes/src/views.tsx#shared")).toHaveLength(3);
    expect(reached("platform/packages/player/src/leaf.ts")).toEqual([
      "b/c/l/one#a",
      "b/c/l/one#b",
      "b/c/l/two#c",
    ]);
  });

  it("code that draws every board: everything", () => {
    const r = index.reach(changesFrom(index, ["platform/packages/player/src/frame.ts"]));
    expect(r.everything).toBeDefined();
    expect(r.hits).toHaveLength(6);
  });

  it("a comment: nothing", () => {
    expect(reached("library/props/shapes/src/views.tsx:2")).toEqual([]);
  });

  it("a question's row: that question", () => {
    expect(reached("content/b/c/questions/q/params.yaml:2")).toEqual(["b/c/questions/q/r2#q"]);
  });

  it("rolls up to any depth", () => {
    const hits = index.reach(changesFrom(index, ["platform/packages/player/src/frame.ts"])).hits;
    expect(rollUp(hits, "lesson").map((r) => [r.path, r.pieces, r.boards])).toEqual([
      ["b/c/l", 4, 2],
      ["b/c/questions/q", 2, 2],
    ]);
    expect(rollUp(hits, "chapter")).toEqual([{ path: "b/c", pieces: 6, boards: 4 }]);
  });
});

describe("reading git's changes", () => {
  it("takes each file's lines as it is now and as it was", () => {
    const diff = [
      "diff --git a/content/x.ts b/content/x.ts",
      "index 1..2 100644",
      "--- a/content/x.ts",
      "+++ b/content/x.ts",
      "@@ -3,2 +3,0 @@",
      "--- a removed line that looks like a header",
      "-y",
      "@@ -10 +8,3 @@",
      "diff --git a/content/gone.ts b/content/gone.ts",
      "--- a/content/gone.ts",
      "+++ /dev/null",
      "@@ -1,4 +0,0 @@",
    ].join("\n");
    expect(parseDiff(diff)).toEqual([
      {
        file: "content/x.ts",
        lines: [
          [3, 4],
          [8, 10],
        ],
        was: [
          [3, 4],
          [10, 10],
        ],
      },
      { file: "content/gone.ts", isGone: true },
    ]);
  });
});
