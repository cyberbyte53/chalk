import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import type { BoardReach } from "../content/build";
import { boardCode } from "./board-code";
import { codeGraph } from "./graph";

/**
 * A prop made of parts (as the coordinate plane is): a board's code is the prop's own and the
 * parts it uses, never the lists of them. So adding a part leaves every board that doesn't use
 * it with the same fingerprint (platform/docs/plans/adding-pieces.md), and an edit to a part
 * reaches only the boards that use it.
 */
const HOME = "library/props/host";
const src = (f: string) => `${HOME}/src/${f}`;
const part = (name: string, n = 1) => ({
  [src(`${name}.ts`)]:
    `export const ${name} = { n: ${n} };\nexport const ${name}Part = { prop: ${name} };\n`,
  [src(`${name}-view.tsx`)]:
    `import { ${name} } from "./${name}";\nexport const ${name}Drawing = () => ${name}.n;\n`,
  [src(`${name}.css`)]: `.h-${name} { color: red; }\n`,
});
const lists = (names: readonly string[]) => ({
  [src("parts.ts")]:
    `${names.map((n) => `import { ${n}Part } from "./${n}";`).join("\n")}\nexport const PARTS = { ${names.map((n) => `${n}: ${n}Part`).join(", ")} };\n`,
  [src("drawings.ts")]:
    `${names.map((n) => `import { ${n}Drawing } from "./${n}-view";`).join("\n")}\nexport const DRAWINGS = { ${names.map((n) => `${n}: ${n}Drawing`).join(", ")} };\n`,
  [src("styles.css")]: ["base", ...names].map((n) => `@import "./${n}.css";`).join("\n"),
  [src("index.ts")]:
    `export { host } from "./host";\n${names.map((n) => `export { ${n} } from "./${n}";`).join("\n")}\n`,
});
const base = {
  [`${HOME}/package.json`]: JSON.stringify({
    name: "@t/host",
    exports: { ".": "./src/index.ts", "./styles.css": "./src/styles.css" },
    chalk: {
      parts: "src/parts.ts",
      registries: ["src/parts.ts", "src/drawings.ts", "src/index.ts", "src/styles.css"],
    },
  }),
  [src("host.ts")]:
    `import { PARTS } from "./parts";\nimport { DRAWINGS } from "./drawings";\nexport const host = () => [Object.keys(PARTS), DRAWINGS];\n`,
  [src("base.css")]: ".h { color: blue; }\n",
};

function digest(files: Record<string, string>, parts: readonly string[]): string | undefined {
  const root = mkdtempSync(join(tmpdir(), "chalk-parts-"));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  const reach: BoardReach = {
    module: "content/b/c/l/overview.ts",
    pieces: { town: { type: "host", stack: [], parts } },
  };
  return boardCode(codeGraph(root), reach, new Map([["host", HOME]]))?.digest;
}

describe("a board's code, of a prop made of parts", () => {
  const two = { ...base, ...part("walker"), ...part("places"), ...lists(["walker", "places"]) };
  const usesWalker = digest(two, ["walker"]);

  it("is the same after a part is added that it doesn't use", () => {
    const three = {
      ...base,
      ...part("walker"),
      ...part("places"),
      ...part("parabola"),
      ...lists(["walker", "places", "parabola"]),
    };
    expect(usesWalker).toBeDefined();
    expect(digest(three, ["walker"])).toBe(usesWalker);
  });

  it("changes when a part it uses changes, not one it doesn't", () => {
    expect(digest({ ...two, ...part("walker", 2) }, ["walker"])).not.toBe(usesWalker);
    expect(digest({ ...two, ...part("places", 2) }, ["walker"])).toBe(usesWalker);
    expect(digest({ ...two, ...part("places", 2) }, ["walker", "places"])).not.toBe(
      digest(two, ["walker", "places"]),
    );
  });

  it("changes when the prop's own code or stylesheet changes", () => {
    expect(
      digest({ ...two, [src("host.ts")]: `${base[src("host.ts")]}export const more = 1;\n` }, [
        "walker",
      ]),
    ).toBe(usesWalker);
    expect(
      digest(
        {
          ...two,
          [src("host.ts")]: base[src("host.ts")]?.replace("Object.keys(PARTS)", "PARTS") ?? "",
        },
        ["walker"],
      ),
    ).not.toBe(usesWalker);
    expect(digest({ ...two, [src("base.css")]: ".h { color: green; }\n" }, ["walker"])).not.toBe(
      usesWalker,
    );
  });
});
