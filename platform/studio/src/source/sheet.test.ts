import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PNG } from "pngjs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ObjectKind } from "./objects";
import { type NumberedPage, type Word, numberPage } from "./read";
import { ItemKind, type PageFile, Tool } from "./schema";
import { Maker, SheetMode, type SheetPage, renderSheet, sheetHtml } from "./sheet";
import type { WordSuggestion } from "./suggest";

function pageOf(rows: readonly (readonly [number, number, string])[]): NumberedPage {
  const words: Word[] = rows.flatMap(([x, y, text]) => {
    let at = x;
    return text.split(" ").map((t) => {
      const w = { text: t, x0: at, y0: y, x1: at + 6 * t.length, y1: y + 12 };
      at = w.x1 + 3;
      return w;
    });
  });
  return numberPage({ page: 3, width: 300, height: 400, words });
}

let dir = "";
let image = "";
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "sheet-"));
  image = join(dir, "page.png");
  const png = new PNG({ width: 4, height: 4 });
  writeFileSync(image, PNG.sync.write(png));
});
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

const page = pageOf([
  [20, 20, "Head"],
  [20, 40, "the विस््थथापन word"],
  [20, 60, "broken कार््य here"],
  [20, 100, "Fig. 1"],
]);
const file: PageFile = {
  page: 3,
  furniture: "L1",
  blocks: [
    { kind: ItemKind.Text, words: "L2-L3" },
    { kind: ItemKind.Figure, number: "L4", words: "L4" },
  ],
};
const repaired: WordSuggestion = {
  ids: ["L2.2"],
  range: "L2.2",
  pdf: ["विस््थथापन"],
  by: Tool.HindiRepair,
  reading: "विस्थापन",
};
const left: WordSuggestion = {
  ids: ["L3.2"],
  range: "L3.2",
  pdf: ["कार््य"],
  by: Tool.HindiRepair,
  left: "several real readings",
};
const sheet = (over: Partial<SheetPage> = {}): string =>
  sheetHtml({
    mode: SheetMode.Suggestions,
    page,
    file,
    image,
    suggestions: [repaired, left],
    ...over,
  });

describe("sheetHtml", () => {
  it("numbers each block the same on both sides", () => {
    const html = sheet();
    expect(html.match(/class="out[^"]*" data-b="1"/g)).toHaveLength(1);
    expect(html.match(/class="block" data-b="1"/g)).toHaveLength(1);
    expect(html).toMatch(/class="out[^"]*" data-b="2"/);
    expect(html).toMatch(/class="block" data-b="2"/);
  });
  it("shows the suggested reading in place of the PDF's letters, and nothing to tell it apart", () => {
    const html = sheet();
    expect(html).toContain("the विस्थापन word");
    expect(html).not.toContain("विस््थथापन");
    expect(html).not.toMatch(/class="by-/);
  });
  it("shows a place a tool left as empty, marked as such, without its broken letters", () => {
    const html = sheet();
    expect(html).toContain('class="none"');
    expect(html).toContain("no reading");
    expect(html).not.toContain("कार््य");
  });
  it("marks a figure with no box as empty, and a figure with one with its crop", () => {
    expect(sheet()).toContain("no drawing found");
    const boxed = sheet({
      file: {
        ...file,
        blocks: [{ kind: ItemKind.Figure, number: "L4", words: "L4", box: [10, 90, 100, 130] }],
      },
    });
    expect(boxed).not.toContain("no drawing found");
    expect(boxed).toContain('class="crop"');
    expect(boxed).toContain("out drawn");
  });
  it("reads a label cited as words, and one typed as it is", () => {
    expect(sheet()).toContain('<span class="label">Fig. 1</span>');
    const typed = sheet({
      file: { ...file, blocks: [{ kind: ItemKind.Section, number: "7.1", words: "L4" }] },
    });
    expect(typed).toContain('<span class="label">7.1</span>');
  });
  it("draws a table's grid from its rules, and an empty place when it has none", () => {
    const table = pageOf([
      [30, 30, "a"],
      [130, 30, "b"],
      [30, 70, "c"],
      [130, 70, "d"],
    ]);
    const blocks = [
      {
        kind: ItemKind.Table,
        words: "L1-L2",
        box: [20, 20, 220, 100] as [number, number, number, number],
      },
    ];
    const rule = (r: [number, number, number, number]) => ({
      kind: ObjectKind.Path,
      box: r,
      rules: [r],
    });
    const ruled = sheetHtml({
      mode: SheetMode.Suggestions,
      page: table,
      file: { page: 3, blocks },
      image,
      objects: [
        rule([20, 20, 220, 20]),
        rule([20, 60, 220, 60]),
        rule([20, 100, 220, 100]),
        rule([20, 20, 20, 100]),
        rule([120, 20, 120, 100]),
        rule([220, 20, 220, 100]),
      ],
    });
    expect(ruled).toContain("<td>a</td><td>b</td>");
    const bare = sheetHtml({
      mode: SheetMode.Suggestions,
      page: table,
      file: { page: 3, blocks },
      image,
    });
    expect(bare).toContain("no grid");
  });
  it("colours by maker only among decisions: the agent's reading over a tool's, the tool's, the PDF's", () => {
    const decided: PageFile = {
      page: 3,
      blocks: [
        {
          kind: ItemKind.Text,
          words: "L2-L3",
          read: { "L3.2": "कार्य" },
        },
        { kind: ItemKind.Figure, number: "L4", words: "L4", box: [10, 90, 100, 130] },
      ],
    };
    const html = sheet({
      mode: SheetMode.Decisions,
      file: decided,
      built: new Map([[1, { box: [12, 92, 98, 128], boxBy: Maker.Tool }]]),
    });
    expect(html).toContain('<span class="by-tool">विस्थापन</span>');
    expect(html).toContain('<span class="by-agent">कार्य</span>');
    expect(html).toContain('class="note by-tool">box: a tool');
    expect(html).toContain(`${12 * 1.25}px`);
  });
  it("hides the words' numbers from the person's view", () => {
    expect(sheet()).toContain('class="ln"');
    const person = sheet({ ids: false });
    expect(person).not.toContain('class="ln"');
    expect(person).not.toContain('class="num"');
  });
  it("lights a block on both sides when hovered, as a page", () => {
    expect(sheet()).toContain("mouseover");
    expect(sheet()).toContain("<!DOCTYPE html>");
  });
});

const hasBrowser = process.env.CI !== "true";

describe("a sheet photographed", () => {
  it.skipIf(!hasBrowser)(
    "shows a page image over 2 MiB (a full page 1 photo), which Chrome drops from a custom property",
    async () => {
      // Noise doesn't compress: 900 × 900 RGBA is about 3.2 MB, over 4 MB as base64.
      const big = new PNG({ width: 900, height: 900 });
      for (let i = 0; i < big.data.length; i += 4) {
        const v = Math.floor(Math.random() * 128);
        big.data.set([v, (v * 7) % 128, (v * 13) % 128, 255], i);
      }
      const photo = join(dir, "big.png");
      writeFileSync(photo, PNG.sync.write(big));
      expect(readFileSync(photo).toString("base64").length).toBeGreaterThan(2 * 1024 * 1024);
      const out = join(dir, "big.sheet.png");
      await renderSheet(sheet({ image: photo, ids: false }), out);
      const shot = PNG.sync.read(readFileSync(out));
      // A point inside the page, away from every outline: dark, as the noise is, not the page's white.
      const at = (shot.width * 40 + 360) * 4;
      expect(shot.data[at]).toBeLessThan(140);
    },
    60_000,
  );
});
