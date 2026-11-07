import { readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { isMap, parseDocument, visit } from "yaml";
import { buildExtract } from "./check";
import type { Extract } from "./files";
import { SourceFile, pageFileName } from "./schema";

/**
 * `pnpm source <book>/<chapter> <lang> --tidy`: what a tool's improvement left in the agents' page
 * files, removed, and only what the build itself says can go: a reading the tool now gives exactly
 * ("now matches the tool, drop it"), an answer to an issue that is no longer raised, a note on a cause
 * no override gives any more. Nothing the agents decided is lost: what the tool now gives is the same
 * text, and a later change of the tool is caught by the check of what changed. Run until nothing more
 * goes, since dropping a reading can leave its answer or note to drop.
 */

/** What tidying removed. */
export type Tidied = { readings: number; answers: number; notes: number };

const STALE_ANSWER = /^pages\/(page-\d+\.yaml): an answer to "([^"]+)", which isn't an issue$/;
const STALE_NOTE = /^pages\/(page-\d+\.yaml): a note on "([^"]+)", which no override here gives$/;

export function tidy(x: Extract): Tidied {
  const done: Tidied = { readings: 0, answers: 0, notes: 0 };
  for (let round = 0; round < 5; round += 1) {
    const b = buildExtract(x);
    const edits = new Map<
      string,
      { readings: Set<string>; answers: Set<string>; notes: Set<string> }
    >();
    const of = (file: string) => {
      const e = edits.get(file) ?? { readings: new Set(), answers: new Set(), notes: new Set() };
      edits.set(file, e);
      return e;
    };
    for (const i of b.issues)
      if (i.id.startsWith("matches ")) of(pageFileName(i.page)).readings.add(i.id.slice(8));
    for (const p of b.problems) {
      const answer = STALE_ANSWER.exec(p);
      if (answer?.[1] !== undefined && answer[2] !== undefined)
        of(answer[1]).answers.add(answer[2]);
      const note = STALE_NOTE.exec(p);
      if (note?.[1] !== undefined && note[2] !== undefined) of(note[1]).notes.add(note[2]);
    }
    if (edits.size === 0) break;
    for (const [file, e] of edits) {
      const path = join(x.dir, SourceFile.Pages, file);
      const doc = parseDocument(readFileSync(path, "utf8"));
      visit(doc, {
        Pair(_, pair) {
          const key = String((pair.key as { value?: unknown } | null)?.value);
          if (key !== "read" || !isMap(pair.value)) return;
          const before = pair.value.items.length;
          pair.value.items = pair.value.items.filter(
            (r) => !e.readings.has(String((r.key as { value?: unknown }).value)),
          );
          done.readings += before - pair.value.items.length;
          if (pair.value.items.length === 0) return visit.REMOVE;
        },
      });
      for (const [field, ids, count] of [
        ["answers", e.answers, "answers"],
        ["notes", e.notes, "notes"],
      ] as const) {
        for (const id of ids) if (doc.deleteIn([field, id])) done[count] += 1;
        const left = doc.get(field) as { items?: unknown[] } | undefined;
        if (left?.items?.length === 0) doc.delete(field);
      }
      writeFileSync(path, doc.toString({ lineWidth: 0 }));
    }
  }
  return done;
}

/** A line saying what tidying removed, from where. */
export const tidiedLine = (root: string, x: Extract, t: Tidied): string =>
  `${relative(root, join(x.dir, SourceFile.Pages))}: tidied ${t.readings} reading${t.readings === 1 ? "" : "s"} the tools now give, ${t.answers} answer${t.answers === 1 ? "" : "s"} and ${t.notes} note${t.notes === 1 ? "" : "s"} left with nothing to answer`;
