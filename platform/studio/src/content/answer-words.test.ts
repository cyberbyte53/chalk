import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type { EventEntry } from "@chalk/content";
import { recordBoard } from "@chalk/player";
import { describe, expect, it } from "vitest";
import { findUp } from "../find-up";
import { played } from "../jugnu/cases";

const root = dirname(findUp("pnpm-workspace.yaml", import.meta.dirname));
const FAMILY = "class9-maths/coordinate-geometry/questions/plot-the-point";

/** The family's board for these params, by its built file. */
function boardFor(params: Record<string, unknown>): string {
  const dir = join(root, "build", FAMILY);
  const file = readdirSync(dir).find(
    (f) =>
      JSON.stringify(JSON.parse(readFileSync(join(dir, f), "utf8")).params) ===
      JSON.stringify(params),
  );
  if (file === undefined) throw new Error(`no ${FAMILY} board for ${JSON.stringify(params)}`);
  return `${FAMILY}/${file.replace(/\.json$/, "")}`;
}

/** What each check on the board told it was answered. */
async function answersAfter(board: string, x: number, y: number): Promise<unknown[]> {
  const events: EventEntry[] = [];
  const runtime = await played(
    board,
    [
      { prop: "sheet", action: "reading.movePoint", args: { x, y } },
      { prop: "ask", action: "check" },
    ],
    (r) => recordBoard(r, (e) => events.push(e) - 1, "test"),
  );
  runtime.dispose();
  return events.flatMap((e) =>
    e.kind === "signal" && e.payload.signal === "checked"
      ? [(e.payload.payload as { answer?: unknown }).answer]
      : [],
  );
}

// A goal's try is recorded in the words the learner saw on the board, never a piece's name.
describe("what a check on a real board says was answered", () => {
  const board = boardFor({ x: -2, y: 4 });
  it("its witness: the pair asked for, as the board writes it", async () => {
    expect(await answersAfter(board, -2, 4)).toEqual([{ en: "(−2, 4)", hi: "(−2, 4)" }]);
  });
  it("a note's wrong state: the pair the dot is at", async () => {
    expect(await answersAfter(board, 4, -2)).toEqual([{ en: "(4, −2)", hi: "(4, −2)" }]);
  });
});
