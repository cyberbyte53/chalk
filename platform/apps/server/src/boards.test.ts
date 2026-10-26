import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { NoSuchBoard, contentBoards } from "./boards";

const PATH = "class9-maths/number-systems/rational-numbers/numbers-you-know";
const VERSION = "0123456789abcdef";
const ID = "aaaaaaaaaaaaaaaa";

/** A build/ holding one page, pointing at its real module. */
function buildDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "chalk-build-"));
  mkdirSync(dirname(join(dir, `${PATH}.json`)), { recursive: true });
  writeFileSync(
    join(dir, `${PATH}.json`),
    JSON.stringify({
      kind: "page",
      path: PATH,
      id: ID,
      version: VERSION,
      source: {
        path: "class9-maths/number-systems/rational-numbers",
        file: "overview.ts",
        row: 0,
      },
      concept: "bbbbbbbbbbbbbbbb",
      key: "numbers-you-know",
      props: {},
    }),
  );
  return dir;
}

describe("the server's boards", () => {
  it("are made from the content's code, as the app makes them", async () => {
    const boards = contentBoards(buildDir());
    const board = await boards({ id: ID, path: PATH, version: VERSION });
    expect(board.name).toBe("numbersYouKnow");
    expect(board.item).toEqual({ id: ID, path: PATH, version: VERSION });
  });

  it("refuses another version, a missing item and a path outside build/", async () => {
    const boards = contentBoards(buildDir());
    await expect(boards({ id: ID, path: PATH, version: "ffffffffffffffff" })).rejects.toThrow(
      NoSuchBoard,
    );
    await expect(boards({ id: ID, path: "a/b/missing", version: VERSION })).rejects.toThrow(
      NoSuchBoard,
    );
    await expect(boards({ id: ID, path: "../etc/passwd", version: VERSION })).rejects.toThrow(
      NoSuchBoard,
    );
  });
});
