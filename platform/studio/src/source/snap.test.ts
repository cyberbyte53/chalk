import { describe, expect, it } from "vitest";
import { type DrawnObject, ObjectKind, type PageObjects, withoutRepeats } from "./objects";
import type { Word } from "./read";
import type { Box } from "./schema";
import { SnapIssue, TableIssue, snap, tableCells } from "./snap";

const image = (box: Box): DrawnObject => ({ kind: ObjectKind.Image, box, rules: [] });
const line = (r: Box): DrawnObject => ({ kind: ObjectKind.Path, box: r, rules: [r] });
const word = (text: string, x0: number, y0: number): Word => ({
  text,
  x0,
  y0,
  x1: x0 + 6 * text.length,
  y1: y0 + 10,
});

describe("snap", () => {
  it("is the objects' box with the words inside the rough box", () => {
    const s = snap(
      [90, 90, 310, 320],
      [image([100, 100, 300, 280])],
      [word("Fig. 1", 150, 300), word("body", 150, 400)],
    );
    expect(s.box).toEqual([100, 100, 300, 310]);
    expect(s.words.map((w) => w.text)).toEqual(["Fig. 1"]);
    expect(s.issues).toEqual([]);
  });
  it("takes in an object crossing the rough box's edge, and raises an issue", () => {
    const s = snap([100, 100, 250, 330], [image([100, 100, 300, 280])], []);
    expect(s.box).toEqual([100, 100, 300, 280]);
    expect(s.issues.map((i) => i.kind)).toEqual([SnapIssue.Crosses]);
  });
  it("raises none when what sticks out shows nothing (a photo's white margin)", () => {
    const s = snap([100, 100, 250, 330], [image([100, 100, 300, 280])], [], { shows: () => false });
    expect(s.issues).toEqual([]);
  });
  it("leaves out a panel the figure sits on, and a neighbour reaching in", () => {
    const s = snap(
      [100, 100, 300, 300],
      [image([120, 120, 280, 280]), image([50, 50, 500, 500]), line([290, 50, 290, 600])],
      [],
    );
    expect(s.box).toEqual([120, 120, 280, 280]);
    expect(s.issues).toEqual([]);
  });
  it("keeps a photo filling its rough box, the box drawn a few points inside it", () => {
    const photo = image([100, 100, 300, 250]);
    const s = snap([104, 104, 296, 246], [photo], []);
    expect(s.objects).toEqual([photo]);
    expect(s.box).toEqual([100, 100, 300, 250]);
    expect(s.issues.map((i) => i.kind)).toEqual([SnapIssue.Crosses]);
  });
  it("keeps a photo cut a tenth short on every side, and says it is cut off", () => {
    const s = snap([120, 115, 280, 235], [image([100, 100, 300, 250])], []);
    expect(s.box).toEqual([100, 100, 300, 250]);
    expect(s.issues.map((i) => i.kind)).toEqual([SnapIssue.Crosses]);
  });
  it("leaves out a panel surrounding the box with room to spare, though it is most of the box", () => {
    const s = snap(
      [100, 100, 300, 300],
      [image([120, 120, 280, 280]), image([40, 60, 360, 340])],
      [],
    );
    expect(s.box).toEqual([120, 120, 280, 280]);
    expect(s.issues).toEqual([]);
  });
  it("leaves out a panel just around the box that holds another block's words", () => {
    const s = snap(
      [100, 100, 300, 300],
      [image([120, 120, 280, 280]), image([90, 70, 305, 310])],
      [],
      { others: [word("What if", 100, 78)] },
    );
    expect(s.box).toEqual([120, 120, 280, 280]);
    expect(s.issues).toEqual([]);
  });
  it("says when nothing is drawn in the rough box", () => {
    const s = snap([0, 0, 50, 50], [], [word("A", 10, 10)]);
    expect(s.issues.map((i) => i.kind)).toEqual([SnapIssue.NoObjects]);
  });
});

describe("tableCells", () => {
  // A 3×3 grid, its first row one cell across all columns, an underline in the middle cell.
  const hs = [100, 120, 140, 160].map((y) => line([0, y, 300, y]));
  const vs = [0, 100, 200, 300].map((x) => line([x, x === 0 || x === 300 ? 100 : 120, x, 160]));
  const words = [
    word("Title", 120, 105),
    word("a", 10, 125),
    word("b", 110, 122),
    word("b2", 110, 130),
    word("c", 210, 125),
    word("d", 10, 145),
    word("Table 1", 10, 80),
  ];
  const underline = line([110, 133, 130, 133]);
  it("reads the cells, a merged one once, a cell's lines as one", () => {
    const t = tableCells([0, 75, 300, 160], [...hs, ...vs, underline], words);
    expect([t.rows, t.columns]).toEqual([3, 3]);
    expect(t.cells.map((c) => `${c.row},${c.column} ${c.rows}×${c.columns} ${c.text}`)).toEqual([
      "0,0 1×3 Title",
      "1,0 1×1 a",
      "1,1 1×1 b b2",
      "1,2 1×1 c",
      "2,0 1×1 d",
      "2,1 1×1 ",
      "2,2 1×1 ",
    ]);
    expect(t.outside.map((w) => w.text)).toEqual(["Table 1"]);
  });
  it("gives no cells for a table without rules, and an issue", () => {
    const t = tableCells([0, 75, 300, 160], [], words);
    expect(t.cells).toEqual([]);
    expect(t.issues.map((i) => i.kind)).toEqual([TableIssue.NoRules]);
  });
});

describe("withoutRepeats", () => {
  it("leaves out what is at the same place on many pages", () => {
    const logo = image([10, 10, 40, 40]);
    const pages: PageObjects[] = [1, 2, 3, 4].map((page) => ({
      page,
      width: 600,
      height: 800,
      objects:
        page === 2 ? [logo, image([100, 100, 200, 200])] : [{ ...logo, box: [10.5, 10, 40, 40.5] }],
    }));
    expect(withoutRepeats(pages).map((p) => p.objects.length)).toEqual([0, 1, 0, 0]);
  });
});
