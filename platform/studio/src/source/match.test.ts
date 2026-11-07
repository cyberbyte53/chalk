import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse, stringify } from "yaml";
import { checkMatches, matchChapter, matchItems } from "./match";
import { type Item, ItemKind } from "./schema";

const english: Item[] = [
  { id: "1", kind: ItemKind.Section, page: 1, number: "7.1", text: "7.1 Work" },
  { id: "1.1", kind: ItemKind.Figure, page: 1, number: "Fig. 7.1", text: "Fig. 7.1" },
  { id: "1.2", kind: ItemKind.Exercise, page: 2, title: "Exercises", text: "Exercises" },
  { id: "1.2.1", kind: ItemKind.Question, page: 2, number: "1.", text: "1. Why?" },
];
const hindi: Item[] = [
  { id: "1", kind: ItemKind.Section, page: 1, number: "7.1", text: "7.1 कार्य" },
  { id: "1.1", kind: ItemKind.Figure, page: 1, number: "चित्र ७.१", text: "चित्र ७.१" },
  { id: "1.2", kind: ItemKind.Exercise, page: 2, title: "अभ्यास", text: "अभ्यास" },
  { id: "1.2.1", kind: ItemKind.Question, page: 2, number: "1.", text: "1. क्यों?" },
];

describe("matching pairs numbered things by kind and digits", () => {
  it("pairs them, not by words, a question by its number and which exercise it is in", () => {
    const { pairs, issues } = matchItems(english, hindi);
    expect(issues).toEqual([]);
    expect(pairs).toEqual([
      { key: "section 7.1", en: "1", hi: "1" },
      { key: "figure 7.1", en: "1.1", hi: "1.1" },
      { key: "question 1 of exercise 1", en: "1.2.1", hi: "1.2.1" },
    ]);
  });
  it("raises what one book has and the other doesn't", () => {
    const { issues } = matchItems(
      [
        ...english.filter((i) => i.kind !== ItemKind.Figure),
        { id: "1.2.2", kind: ItemKind.Question, page: 2, number: "2.", text: "2. How?" },
      ],
      hindi,
    );
    expect(issues.map((i) => i.id)).toEqual([
      "only en question 2 of exercise 1",
      "only hi figure 7.1",
    ]);
  });
});

describe("match.yaml", () => {
  function chapter(en: readonly Item[], hi: readonly Item[]) {
    const root = mkdtempSync(join(tmpdir(), "chalk-match-"));
    const source = join(root, "authoring/books/b/c/source");
    for (const [lang, items] of [
      ["en", en],
      ["hi", hi],
    ] as const) {
      mkdirSync(join(source, lang), { recursive: true });
      writeFileSync(join(source, lang, "book.yaml"), "reader: text\n");
      writeFileSync(join(source, lang, "items.yaml"), stringify(items));
    }
    return { root, file: join(source, "match.yaml") };
  }
  it("holds the pairs and the answers; an unanswered difference fails until it is answered", () => {
    const { root, file } = chapter(english, hindi.slice(0, 3));
    const first = matchChapter(root, "b", "c");
    expect(first.problems[0]).toMatch(/only en question 1 of exercise 1/);
    expect(checkMatches(root)[0]?.problems[0]).toMatch(/only en question 1 of exercise 1/);
    const written = parse(readFileSync(file, "utf8")) as { pairs: unknown[] };
    writeFileSync(
      file,
      stringify({
        ...written,
        answers: { "only en question 1 of exercise 1": "not in that book" },
      }),
    );
    expect(matchChapter(root, "b", "c").problems).toEqual([]);
    expect(checkMatches(root)[0]).toMatchObject({ pairs: 2, answered: 1, problems: [] });
  });
  it("an answer to no issue, or pairs the items no longer build, can't be meant", () => {
    const { root, file } = chapter(english, hindi);
    matchChapter(root, "b", "c");
    writeFileSync(
      file,
      stringify({
        pairs: [{ key: "figure 9", en: "1", hi: "1" }],
        answers: { "only en x": "why" },
      }),
    );
    const { problems } = checkMatches(root)[0] ?? { problems: [] };
    expect(problems.join("\n")).toMatch(/answers "only en x", which isn't an issue/);
    expect(problems.join("\n")).toMatch(/aren't what the items build/);
  });
  it("needs both books", () => {
    const root = mkdtempSync(join(tmpdir(), "chalk-match-"));
    expect(matchChapter(root, "b", "c").problems.join()).toMatch(/extract it first/);
  });
});
