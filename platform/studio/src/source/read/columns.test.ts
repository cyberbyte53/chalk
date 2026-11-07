import { describe, expect, it } from "vitest";
import { numberPage, splitColumns } from "./lines";
import type { Word } from "./pages";

/** A word `[text, x0, x1]` on line `row` (lines 16 points apart, 12 tall). */
const at = (row: number, ...parts: [string, number, number][]): Word[] =>
  parts.map(([text, x0, x1]) => ({ text, x0, x1, y0: 100 + row * 16, y1: 112 + row * 16 }));
const page = (...rows: Word[][]) =>
  numberPage({ page: 1, width: 600, height: 800, words: rows.flat() });
const texts = (lines: readonly Word[][]) => lines.map((l) => l.map((w) => w.text).join(" "));

describe("a line across two columns", () => {
  const body = (row: number, text: string) => at(row, [text, 60, 320]);
  const side = (row: number, text: string) => at(row, [text, 390, 560]);
  it("becomes two lines, the left part in the line's place, numbered again", () => {
    const p = page(
      body(0, "b0"),
      side(1, "s1"),
      body(2, "b2"),
      side(3, "s3"),
      at(4, ["end", 60, 320], ["of", 330, 340], ["Note", 390, 560]),
      body(5, "b5"),
      side(6, "s6"),
    );
    expect(texts(p.lines)[4]).toBe("end of Note");
    const split = splitColumns(p);
    expect(texts(split.lines)).toEqual(["b0", "s1", "b2", "s3", "end of", "Note", "b5", "s6"]);
    expect(split.words.get("L6.1")?.text).toBe("Note");
    expect(split.words.get("L7.1")?.text).toBe("b5");
  });
  it("splits by what the page's lines say, however wide the gutter and wherever it is", () => {
    const narrow = (row: number) => at(row, ["left", 60, 250]);
    const right = (row: number) => at(row, ["right", 280, 500]);
    const p = page(
      narrow(0),
      right(1),
      narrow(2),
      right(3),
      at(4, ["a", 60, 250], ["b", 280, 500]),
    );
    expect(texts(splitColumns(p).lines).slice(-2)).toEqual(["a", "b"]);
  });
  it("keeps a wide space that lines run across", () => {
    const p = page(
      at(0, ["runs", 60, 500]),
      at(1, ["over", 60, 500]),
      at(2, ["You", 60, 100], ["have", 130, 300]),
      at(3, ["runs", 60, 500]),
      at(4, ["over", 60, 500]),
    );
    expect(splitColumns(p).lines).toHaveLength(5);
  });
  it("keeps a table's row, whose neighbours are all in parts", () => {
    const row = (r: number) => at(r, ["cell", 60, 200], ["cell", 300, 440]);
    const p = page(row(0), row(1), row(2), row(3), row(4));
    expect(splitColumns(p).lines).toHaveLength(5);
  });
  it("keeps a list's number with its item: too narrow for a column", () => {
    const item = (r: number) => at(r, [`${r}.`, 60, 70], ["item", 100, 500]);
    const p = page(
      at(0, ["1.", 60, 70]),
      at(1, ["2.", 60, 70]),
      item(2),
      at(3, ["goes on", 100, 500]),
      at(4, ["goes on", 100, 500]),
    );
    expect(splitColumns(p).lines).toHaveLength(5);
  });
  it("keeps a running head's page number: no column stands under it", () => {
    const p = page(at(0, ["Chapter", 60, 120], ["13", 500, 520]), at(5, ["text", 60, 500]));
    expect(splitColumns(p).lines).toHaveLength(2);
  });
});
