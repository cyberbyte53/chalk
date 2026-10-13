import { readFileSync } from "node:fs";
import { type Lesson, lessonSchema, walkPieces } from "@chalk/content";
import { propDefs } from "@chalk/library";
import { describe, expect, it } from "vitest";
import { loadReadings } from "./pronunciations";
import { publishLesson } from "./publish";

const published: Lesson = lessonSchema.parse(
  JSON.parse(
    readFileSync(new URL("../evals/boards/lessons/where-is-root-2.json", import.meta.url), "utf8"),
  ),
);
const readings = loadReadings(
  new URL("../../content/pronunciations.json", import.meta.url).pathname,
);
const clone = (): Lesson => structuredClone(published);
const publish = (draft: Lesson, previous: Lesson | null = published) => {
  const result = publishLesson(draft, previous, propDefs, readings);
  if (!result.isOk)
    throw new Error(result.problems.map((p) => `${p.where}: ${p.message}`).join("\n"));
  return result;
};

describe("publishLesson", () => {
  it("changes nothing when nothing changed", () => {
    const result = publish(clone());
    expect(result.notes).toEqual([]);
    expect(result.lesson.version).toBe(published.version);
  });

  it("gives a new board the next id, wherever it is inserted, and bumps the version", () => {
    const draft = clone();
    const extra = structuredClone(draft.boards[0]);
    if (extra === undefined) throw new Error("no board");
    extra.name = "between-again";
    extra.id = undefined;
    extra.nextPieceId = undefined;
    for (const piece of walkPieces(extra.root)) piece.id = undefined;
    draft.boards.splice(1, 0, extra); // insert in the middle
    const result = publish(draft);
    expect(result.lesson.boards.map((b) => b.id)).toEqual([1, 5, 2, 3, 4]);
    expect(result.lesson.nextBoardId).toBe(6);
    expect(result.lesson.version).toBe("0.2.1");
    expect(walkPieces(result.lesson.boards[1]?.root ?? extra.root).map((p) => p.id)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });

  it("retires the id of a deleted board for good", () => {
    const draft = clone();
    draft.boards.splice(2, 1); // delete "zoom" (board 3)
    const result = publish(draft);
    expect(result.lesson.retiredBoardIds).toEqual([3]);
    expect(result.notes).toContain('retired board 3 ("zoom")');
  });

  it("refuses to hand a retired id back out", () => {
    const draft = clone();
    draft.retiredBoardIds = [3];
    expect(publishLesson(draft, published, propDefs, readings).isOk).toBe(false);
  });

  it("retires the id of a deleted piece and never reuses it", () => {
    const draft = clone();
    const board = draft.boards[0];
    if (board === undefined || !("children" in board.root)) throw new Error("bad fixture");
    board.root.children = board.root.children.filter((p) => p.name !== "rest"); // piece 6
    board.root.children.push({
      name: "newNote",
      kind: "prop",
      prop: "text",
      with: { text: { en: "Hi", hi: "नमस्ते" } },
    });
    const result = publish(draft);
    const out = result.lesson.boards[0];
    expect(out?.retiredPieceIds).toEqual([6]);
    expect(walkPieces(out?.root ?? board.root).find((p) => p.name === "newNote")?.id).toBe(7);
  });

  it("renaming keeps the id", () => {
    const draft = clone();
    const board = draft.boards[1];
    if (board === undefined) throw new Error("no board");
    board.name = "guess-where";
    const result = publish(draft);
    expect(result.lesson.boards[1]?.id).toBe(2);
  });
});
