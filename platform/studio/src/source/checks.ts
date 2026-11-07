import { Locale } from "@chalk/content";
import { place, runningWords } from "./boxes";
import { positionalIds } from "./ids";
import { lettersOnly } from "./letters";
import { numberKey, parseNumber, scanNumbers } from "./numbers";
import { CROPPED, type Item, ItemKind, type Term } from "./schema";
import { type PageText, pageText } from "./text-layer";

/**
 * The checks one language's extract must pass (platform/docs/plans/sources.md, "Checks"): ids are
 * positions, the reading agrees with the book's text layer, nothing numbered is missed, the terms are
 * real and every figure and table has its picture. Each returns its problems, one line each.
 */

/** Ids are the machine's: each item's is its position (ids.ts). */
export function checkIds(items: readonly Item[]): string[] {
  const want = positionalIds(items);
  const wrong = items.filter((item, i) => item.id !== want[i]);
  return wrong.length === 0
    ? []
    : [
        `${wrong.length} id${wrong.length === 1 ? " isn't its" : "s aren't their"} position (first: ${wrong[0]?.id}, which is ${want[items.indexOf(wrong[0] as Item)]}): run pnpm source again to number them`,
      ];
}

/**
 * The reading agrees with the book. A block's words are found, letters only, in its page's running
 * text (the page's words less the figures' and tables' captions and labels), or its page's and the
 * next's when it runs over. A figure's or table's number is on its page, and every word of the text
 * layer in its box is read: in its own text (labels set as text; drawn ones the text layer hasn't),
 * or in a block on the page the box takes in (text a figure sits beside).
 */
export function checkReading(items: readonly Item[], pages: readonly PageText[]): string[] {
  const problems: string[] = [];
  const running = new Map<number, string>();
  const text = (n: number) => {
    const p = pages[n - 1];
    if (p === undefined) return undefined;
    if (!running.has(n))
      running.set(
        n,
        lettersOnly(
          runningWords(p, items)
            .map((w) => w.text)
            .join(" "),
        ),
      );
    return running.get(n);
  };
  for (const item of items) {
    const page = pages[item.page - 1];
    const here = text(item.page);
    if (page === undefined || here === undefined) {
      problems.push(`${item.id}: page ${item.page} isn't in the book`);
      continue;
    }
    const all = lettersOnly(pageText(page)).toLowerCase();
    if (
      item.number !== undefined &&
      !all.includes(lettersOnly(item.number).replace(/^Q/, "").toLowerCase())
    )
      problems.push(`${item.id}: its number "${item.number}" isn't on page ${item.page}`);
    if (CROPPED.includes(item.kind)) {
      const labels = new Set(item.text.split(/[,;\s]+/).map(lettersOnly));
      const placed = place(item, page, items);
      if (placed === undefined) continue;
      if (item.number !== undefined && placed.caption.length === 0)
        problems.push(`${item.id}: no caption "${item.number}" near its box`);
      const unread = placed.own
        .filter((w) => !placed.caption.includes(w))
        .map((w) => lettersOnly(w.text))
        .filter((w) => w !== "" && !labels.has(w));
      if (unread.length > 0)
        problems.push(
          `${item.id}: the text layer has ${unread.map((w) => `"${w}"`).join(", ")} in its box; neither it nor a block reads it`,
        );
      continue;
    }
    const ours = lettersOnly(item.text);
    if (ours === "") {
      if (item.number === undefined) problems.push(`${item.id}: no text`);
      continue;
    }
    const withNext = `${here}${text(item.page + 1) ?? ""}`;
    if (!withNext.includes(ours))
      problems.push(`${item.id}: not found on page ${item.page}: ${whereItParts(ours, withNext)}`);
  }
  return problems;
}

/** Where a reading stops agreeing with the page: its longest start that is found, and what follows. */
function whereItParts(ours: string, page: string): string {
  let lo = 0;
  let hi = ours.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (page.includes(ours.slice(0, mid))) lo = mid;
    else hi = mid - 1;
  }
  const at = page.indexOf(ours.slice(0, lo));
  return lo === 0
    ? `its start "${ours.slice(0, 30)}" isn't there`
    : `agrees as far as "…${ours.slice(Math.max(0, lo - 30), lo)}", then reads "${ours.slice(lo, lo + 30)}" where the page has "${page.slice(at + lo, at + lo + 30)}"`;
}

/**
 * Nothing numbered is missed: every number the pages print after the language's own words is some
 * item's `number`; each item's number is the kind of item it is on; each kind's numbers are in order
 * and none twice.
 */
export function checkNumbers(
  lang: Locale,
  items: readonly Item[],
  pages: readonly PageText[],
): string[] {
  const problems: string[] = [];
  const ours = new Map<string, Item>();
  for (const item of items) {
    if (item.number === undefined) continue;
    const n = parseNumber(lang, item.number);
    if (n === undefined) {
      problems.push(`${item.id}: "${item.number}" isn't a number this checks (${lang})`);
      continue;
    }
    const isQuestion = n.kind === ItemKind.Question;
    if (n.kind !== item.kind)
      problems.push(`${item.id}: a ${item.kind} numbered as a ${n.kind} ("${item.number}")`);
    // A question's number is under its exercise: Q1 again in the next exercise.
    const key = isQuestion
      ? `${item.id.split(".").slice(0, -1).join(".")} ${numberKey(n)}`
      : numberKey(n);
    if (ours.has(key))
      problems.push(`${item.id}: "${item.number}" again (also ${ours.get(key)?.id})`);
    ours.set(key, item);
  }
  const printed = new Map<string, number>();
  for (const p of pages)
    for (const n of scanNumbers(lang, pageText(p)))
      if (!printed.has(numberKey(n))) printed.set(numberKey(n), p.page);
  for (const [key, page] of printed)
    if (!ours.has(key)) problems.push(`page ${page} prints ${key}; no item has it as its number`);
  // In order: each kind's numbers rise through the items.
  const last = new Map<string, number[]>();
  for (const item of items) {
    const n = item.number === undefined ? undefined : parseNumber(lang, item.number);
    if (n === undefined || n.kind === ItemKind.Question) continue;
    const digits = n.digits.split(".").map(Number);
    const before = last.get(n.kind);
    if (before !== undefined && !isAfter(digits, before))
      problems.push(`${item.id}: ${numberKey(n)} comes after ${n.kind} ${before.join(".")}`);
    last.set(n.kind, digits);
  }
  return problems;
}

const isAfter = (a: readonly number[], b: readonly number[]): boolean => {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const x = a[i] ?? -1;
    const y = b[i] ?? -1;
    if (x !== y) return x > y;
  }
  return false;
};

/** The terms are real: each names an item there is, and its words are in that item. */
export function checkTerms(terms: readonly Term[], items: readonly Item[]): string[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  return terms.flatMap((t) => {
    const item = byId.get(t.item);
    if (item === undefined) return [`term "${t.term}": no item ${t.item}`];
    return lettersOnly(item.text).toLowerCase().includes(lettersOnly(t.term).toLowerCase())
      ? []
      : [`term "${t.term}": not in ${t.item}'s words`];
  });
}

/** Every figure and table has its box and its picture (`figures/<id>.png`). */
export function checkFigures(items: readonly Item[], has: (id: string) => boolean): string[] {
  return items
    .filter((i) => CROPPED.includes(i.kind))
    .flatMap((i) => [
      ...(i.crop === undefined ? [`${i.id}: a ${i.kind} with no crop box`] : []),
      ...(has(i.id) ? [] : [`${i.id}: no figures/${i.id}.png (run pnpm source again)`]),
    ]);
}

/**
 * The numbered things of one language's book, by kind and digits (`figure 3.11`); a question's
 * under its exercise's (`question 3.2 1`). What languages are matched by.
 */
export function numberedKeys(lang: Locale, items: readonly Item[]): Map<string, Item> {
  const out = new Map<string, Item>();
  let exercise = "";
  for (const item of items) {
    const n = item.number === undefined ? undefined : parseNumber(lang, item.number);
    if (n === undefined) continue;
    if (n.kind === ItemKind.Exercise) exercise = n.digits;
    out.set(
      n.kind === ItemKind.Question ? `${numberKey(n)} of exercise ${exercise}` : numberKey(n),
      item,
    );
  }
  return out;
}

/**
 * The languages match: every numbered thing of the English book is in this one and the other way
 * round, or is in book.yaml's `unmatched` with why; and nothing is listed there that does match.
 */
export function checkMatch(
  lang: Locale,
  items: readonly Item[],
  english: readonly Item[],
  unmatched: Readonly<Record<string, string>>,
): string[] {
  const ours = numberedKeys(lang, items);
  const theirs = numberedKeys(Locale.En, english);
  const problems: string[] = [];
  for (const [key, item] of theirs)
    if (!ours.has(key) && unmatched[key] === undefined)
      problems.push(
        `the English book has ${key} (${item.id}) and this one doesn't: find it, or list it in book.yaml's unmatched with why`,
      );
  for (const [key, item] of ours)
    if (!theirs.has(key) && unmatched[key] === undefined)
      problems.push(
        `this book has ${key} (${item.id}) and the English one doesn't: list it in book.yaml's unmatched with why`,
      );
  for (const key of Object.keys(unmatched))
    if (ours.has(key) && theirs.has(key))
      problems.push(`book.yaml lists ${key} as unmatched, but both books have it`);
  return problems;
}
