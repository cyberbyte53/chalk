import { describe, expect, it } from "vitest";
import type { BuiltPage } from "./build";
import { StructureEdit, structureEdits } from "./feedback";
import type { PageFile } from "./schema";

/** A page of one line of six words, L1.1 to L1.6. */
const words = {
  words: new Map([1, 2, 3, 4, 5, 6].map((n) => [`L1.${n}`, {}])),
} as unknown as BuiltPage["words"];
const draft = (...blocks: [string, string][]): PageFile =>
  ({ page: 1, blocks: blocks.map(([kind, w]) => ({ kind, words: w })) }) as unknown as PageFile;
const decided = (...blocks: [string, string[]][]) =>
  ({ blocks: blocks.map(([kind, ids]) => ({ kind, ids })) }) as unknown as Pick<
    BuiltPage,
    "blocks"
  >;
const ids = (...ns: number[]) => ns.map((n) => `L1.${n}`);

describe("structureEdits", () => {
  const edits = (d: PageFile, b: Pick<BuiltPage, "blocks">) =>
    structureEdits(d, { ...b, words }).map((e) => e.edit);

  it("sees nothing when the blocks are the draft's", () => {
    expect(edits(draft(["text", "L1.1-3"]), decided(["text", ids(1, 2, 3)]))).toEqual([]);
  });
  it("finds a kind changed", () => {
    expect(edits(draft(["text", "L1.1-3"]), decided(["box", ids(1, 2, 3)]))).toEqual([
      StructureEdit.Kind,
    ]);
  });
  it("finds a merge", () => {
    expect(
      edits(draft(["text", "L1.1-2"], ["text", "L1.3-4"]), decided(["text", ids(1, 2, 3, 4)])),
    ).toEqual([StructureEdit.Merge]);
  });
  it("finds a split", () => {
    expect(
      edits(draft(["text", "L1.1-4"]), decided(["text", ids(1, 2)], ["text", ids(3, 4)])),
    ).toEqual([StructureEdit.Split, StructureEdit.Split]);
  });
  it("finds words moved between blocks", () => {
    expect(
      edits(draft(["text", "L1.1-2"], ["text", "L1.3-4"]), decided(["text", ids(1, 2, 3)])),
    ).toEqual([StructureEdit.Moved]);
  });
  it("finds a block the draft hadn't", () => {
    expect(edits(draft(["text", "L1.1-2"]), decided(["figure", ids(5, 6)]))).toEqual([
      StructureEdit.Added,
    ]);
  });
});
