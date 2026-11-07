import { describe, expect, it } from "vitest";
import {
  type PageStyles,
  type StyleRun,
  draftFurniture,
  draftPage,
  draftPages,
  stylesFromXml,
} from "./draft";
import { ObjectKind, type PageObjects } from "./objects";
import { expand, rangesOf } from "./ranges";
import { type NumberedPage, type Word, numberPage } from "./read";
import { type Box, ItemKind, type PageFile, pageFileSchema } from "./schema";

const LEADING = 14;

/** Lines as a page: each `[x, y, text]`, its words one after another, 6 points a letter. */
function pageOf(rows: readonly (readonly [number, number, string])[], n = 1): NumberedPage {
  const words: Word[] = rows.flatMap(([x, y, text]) => {
    let at = x;
    return text.split(" ").map((t) => {
      const w = { text: t, x0: at, y0: y, x1: at + 6 * t.length, y1: y + 12 };
      at = w.x1 + 3;
      return w;
    });
  });
  return numberPage({ page: n, width: 600, height: 800, words });
}

const body = (x: number, y: number, n = 16) =>
  [x, y, Array.from({ length: n }, (_, i) => `word${i + 1}`).join(" ")] as const;

const styled = (box: Box, over: Partial<StyleRun> = {}): StyleRun => ({
  box,
  size: 11,
  bold: false,
  colour: "#000",
  ...over,
});

/** What the blocks hold, word by word, for a short assertion. */
function blockTexts(page: NumberedPage, file: PageFile): string[] {
  return file.blocks.map((b) =>
    expand(b.words, page.words)
      .map((id) => page.words.get(id)?.text)
      .join(" "),
  );
}

describe("rangesOf", () => {
  const page = pageOf([
    [50, 50, "a b c"],
    [50, 70, "d e"],
    [50, 90, "f g h"],
  ]);
  it("writes whole lines, parts and runs over lines as `expand` reads them", () => {
    const cases = [
      ["L1.1", "L1.2", "L1.3"],
      ["L1.2", "L1.3"],
      ["L1.2", "L1.3", "L2.1", "L2.2", "L3.1"],
      ["L2.1", "L2.2", "L1.1"],
    ];
    for (const ids of cases) expect(expand(rangesOf(page, ids), page.words)).toEqual(ids);
    expect(rangesOf(page, cases[0] ?? [])).toBe("L1");
    expect(rangesOf(page, cases[2] ?? [])).toBe("L1.2-L3.1");
  });
});

describe("draftPage", () => {
  it("parts paragraphs at an indent and at a gap, and keeps a paragraph's lines together", () => {
    const page = pageOf([
      body(68, 100),
      body(50, 114),
      body(50, 128),
      body(68, 142),
      body(50, 156),
      body(50, 190),
    ]);
    const file = draftPage(page);
    expect(file.blocks.map((b) => b.words)).toEqual(["L1-L3", "L4-L5", "L6"]);
    expect(file.blocks.map((b) => b.kind)).toEqual([ItemKind.Text, ItemKind.Text, ItemKind.Text]);
    expect(() => pageFileSchema.parse(file)).not.toThrow();
  });

  it("gives a formula set on its own line a block of its own", () => {
    const page = pageOf([body(50, 100), [200, 114, "a = b"], body(50, 128)]);
    expect(draftPage(page).blocks.map((b) => b.words)).toEqual(["L1", "L2", "L3"]);
  });

  it("reads a section from its number and font, a heading from its font alone", () => {
    const page = pageOf([
      [50, 100, "7.1 Work done"],
      body(50, 120),
      [50, 150, "Mitosis"],
      body(50, 170),
    ]);
    const styles: PageStyles = {
      page: 1,
      runs: [
        styled([50, 100, 300, 112], { bold: true, size: 13 }),
        styled([50, 120, 600, 132]),
        styled([50, 150, 300, 162], { bold: true, size: 13 }),
        styled([50, 170, 600, 182]),
      ],
    };
    const file = draftPage(page, undefined, { styles });
    expect(file.blocks.map((b) => b.kind)).toEqual([
      ItemKind.Section,
      ItemKind.Text,
      ItemKind.Heading,
      ItemKind.Text,
    ]);
    expect(file.blocks[0]?.number).toBe("L1.1");
    expect(file.blocks[2]?.title).toBe("L3");
  });

  it("doesn't read a section from digits at a line's start in the body's font", () => {
    const page = pageOf([body(50, 100), [50, 114, "7.5 newtons of force act here"]]);
    expect(draftPage(page).blocks.every((b) => b.kind === ItemKind.Text)).toBe(true);
  });

  it("reads an exercise from a short heading before a list from 1, each line of it a question", () => {
    const page = pageOf([
      [50, 100, "EXERCISE 3.1"],
      [50, 120, "1. How will you describe it"],
      [68, 134, "and say why"],
      [50, 148, "2. Find the rest"],
    ]);
    const styles: PageStyles = {
      page: 1,
      runs: [styled([50, 100, 300, 112], { bold: true }), styled([50, 120, 600, 160])],
    };
    const file = draftPage(page, undefined, { styles });
    expect(file.blocks.map((b) => b.kind)).toEqual([
      ItemKind.Exercise,
      ItemKind.Question,
      ItemKind.Question,
    ]);
    expect(file.blocks[0]?.number).toBe("L1.2");
    expect(file.blocks[1]?.number).toBe("L2.1");
    expect(file.blocks[1]?.words).toBe("L2-L3");
  });

  it("keeps a question's parts in it, their lines hanging under their words", () => {
    const page = pageOf([
      [50, 100, "5. Find these"],
      [68, 114, "(i) the first of them"],
      [86, 128, "going on"],
      [68, 142, "(ii) the second"],
    ]);
    expect(draftPage(page).blocks.map((b) => b.words)).toEqual(["L1-L4"]);
  });

  it("keeps a list numbered from 1 outside an exercise as one block, with what brings it in", () => {
    const page = pageOf([
      [50, 100, "Do this:"],
      [50, 114, "1. Take a ruler"],
      [50, 128, "2. Place the ruler"],
    ]);
    const file = draftPage(page);
    expect(file.blocks.map((b) => b.words)).toEqual(["L1-L3"]);
    expect(file.blocks[0]?.kind).toBe(ItemKind.Text);
  });

  it("takes a numbered line with nothing before it for a question from the page before", () => {
    const page = pageOf([[50, 100, "14. What is this"]]);
    expect(draftPage(page).blocks[0]?.kind).toBe(ItemKind.Question);
  });

  it("puts a side column's blocks after the body's", () => {
    const side = (y: number) => [40, y, "side words here"] as const;
    const page = pageOf([
      side(100),
      body(200, 100),
      side(114),
      body(200, 114),
      side(128),
      body(200, 128),
    ]);
    const texts = blockTexts(page, draftPage(page));
    expect(texts).toHaveLength(2);
    expect(texts[0]).toMatch(/^word1/);
    expect(texts[1]).toMatch(/^side/);
  });

  it("takes a caption with the drawing beside it and the labels on it", () => {
    const page = pageOf([
      body(50, 100),
      [120, 150, "axis"],
      [120, 300, "Fig. 7.4: A graph"],
      body(50, 330),
    ]);
    const objects: PageObjects = {
      page: 1,
      width: 600,
      height: 800,
      objects: [{ kind: ObjectKind.Image, box: [100, 130, 300, 290], rules: [] }],
    };
    const file = draftPage(page, objects);
    const figure = file.blocks.find((b) => b.kind === ItemKind.Figure);
    expect(figure?.words).toBe("L2-L3");
    expect(figure?.number).toBe("L3.1-2");
    expect(figure?.box).toEqual([100, 130, 300, 312]);
  });

  it("leaves a caption with no drawing beside it without a box", () => {
    const page = pageOf([[120, 300, "Fig. 7.4: A graph"]]);
    const figure = draftPage(page).blocks[0];
    expect(figure?.kind).toBe(ItemKind.Figure);
    expect(figure?.box).toBeUndefined();
  });

  it("doesn't take a sentence starting with a mention of a figure for a caption", () => {
    const page = pageOf([
      [50, 100, "Fig. 7.4 shows how the force and the work done by it change as it moves along"],
      body(50, 114),
    ]);
    expect(draftPage(page).blocks.map((b) => b.kind)).toEqual([ItemKind.Text]);
  });

  it("finds the caption whatever the book's language, even in a broken text layer", () => {
    for (const name of ["चित्र", "आकृति", "चि�त्र", "Figure"]) {
      const page = pageOf([[120, 300, `${name} 3.2`]]);
      expect(draftPage(page).blocks[0]?.kind).toBe(ItemKind.Figure);
    }
  });

  it("makes what is on a drawn panel one block", () => {
    const page = pageOf([
      [50, 90, "Think It Over"],
      body(50, 110, 8),
      [68, 124, "and another paragraph of it here"],
      body(50, 300),
    ]);
    const objects: PageObjects = {
      page: 1,
      width: 600,
      height: 800,
      objects: [{ kind: ObjectKind.Path, box: [40, 100, 560, 150], rules: [] }],
    };
    expect(draftPage(page, objects).blocks.map((b) => b.words)).toEqual(["L4", "L1-L3"]);
  });

  it("leaves the words proposed as furniture out", () => {
    const page = pageOf([[50, 50, "Running head"], body(50, 100)]);
    const file = draftPage(page, undefined, { furniture: ["L1.1", "L1.2"] });
    expect(file.furniture).toBe("L1");
    expect(file.blocks.map((b) => b.words)).toEqual(["L2"]);
  });

  it("uses every word once", () => {
    const page = pageOf([
      [50, 50, "Head"],
      [50, 100, "7.1 Work"],
      body(50, 120),
      [40, 200, "aside"],
      [50, 300, "Fig. 2 A thing"],
      [50, 330, "1. Question"],
    ]);
    const file = draftPage(page);
    const used = file.blocks.flatMap((b) => expand(b.words, page.words));
    expect(new Set(used).size).toBe(used.length);
    expect(used.length).toBe(page.words.size);
  });
});

describe("draftFurniture", () => {
  const pages = [1, 2, 3, 4].map((n) =>
    pageOf([[50, 40, `Chapter head ${n}`], [300, 760, String(50 + n)], body(50, 100 + 40 * n)], n),
  );
  it("proposes what repeats at one place, digits aside, and nothing else", () => {
    const f = draftFurniture(pages);
    expect(f.get(1)).toEqual(["L1.1", "L1.2", "L1.3", "L2.1"]);
    expect(f.get(4)).toEqual(["L1.1", "L1.2", "L1.3", "L2.1"]);
  });
  it("proposes none from too few pages", () => {
    expect(draftFurniture(pages.slice(0, 2)).size).toBe(0);
  });
});

describe("draftPages", () => {
  it("joins a sentence over a page's end, and leaves one that ends alone", () => {
    const first = pageOf([[50, 100, "this sentence goes"]], 1);
    const second = pageOf([[50, 100, "on and it ends."]], 2);
    const third = pageOf([[50, 100, "A new one here."]], 3);
    const [a, b, c] = draftPages([first, second, third]);
    expect(a?.blocks[0]?.continues).toBe(true);
    expect(b?.blocks[0]?.continued).toBe(true);
    expect(b?.blocks[0]?.continues).toBeUndefined();
    expect(c?.blocks[0]?.continued).toBeUndefined();
  });
  it("carries an exercise over a page", () => {
    const styles: PageStyles[] = [
      { page: 1, runs: [styled([50, 100, 300, 112], { bold: true }), styled([50, 120, 600, 132])] },
      { page: 2, runs: [styled([50, 100, 600, 112])] },
    ];
    const first = pageOf(
      [
        [50, 100, "Exercises"],
        [50, 120, "1. One thing"],
      ],
      1,
    );
    const second = pageOf([[50, 100, "1. Again from one"]], 2);
    const files = draftPages([first, second], undefined, styles);
    expect(files[1]?.blocks[0]?.kind).toBe(ItemKind.Question);
  });
});

describe("stylesFromXml", () => {
  it("reads each run's font, a font kept from the page that declares it", () => {
    const xml = `<pdf2xml>
<page number="1" position="absolute" top="0" left="0" height="800" width="600">
  <fontspec id="0" size="11" family="ABC+Times" color="#000000"/>
  <fontspec id="1" size="13" family="ABC+Times-Bold" color="#b52b33"/>
<text top="10" left="20" width="30" height="12" font="0">plain &amp; <i>simple</i></text>
<text top="30" left="20" width="30" height="14" font="1">Head</text>
<text top="50" left="20" width="30" height="12" font="0"><b>term</b></text>
<text top="70" left="20" width="30" height="12" font="0"> </text>
</page>
<page number="2" position="absolute" top="0" left="0" height="800" width="600">
<text top="10" left="20" width="30" height="14" font="1">Next</text>
</page></pdf2xml>`;
    const [one, two] = stylesFromXml(xml);
    expect(one?.page).toBe(1);
    expect(one?.runs).toHaveLength(3);
    expect(one?.runs[0]).toEqual({
      box: [20, 10, 50, 22],
      size: 11,
      bold: false,
      colour: "#000000",
    });
    expect(one?.runs[1]?.bold).toBe(true);
    expect(one?.runs[2]?.bold).toBe(true);
    expect(two?.page).toBe(2);
    expect(two?.runs[0]?.size).toBe(13);
  });
});
