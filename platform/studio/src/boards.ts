import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Boards as tools see them: a board is named by its path in the course tree
 * (`class10-maths/real-numbers/division-lemma/story`), the same name the preview takes
 * (`?dev&board=…`), comments point at and events carry (as its id). Its file is `build/<path>.json`.
 * Read from build/ (run `pnpm build-content` first). Plain files only, no workspace imports: the
 * learner's vite.config.ts loads this in Node before anything is compiled.
 */

type Ref = { id: string; version: string; path: string };
/** build/sources.json: per built item, where its board and pieces were written, and each prop's type. */
export type Sources = Record<
  string,
  { board?: string; pieces: Record<string, string>; props: Record<string, string> }
>;

const readJson = <T>(file: string): T | null => {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
};
export const boardName = (path: string): string => path.replace(/\.json$/, "");

export function readSources(root: string): Sources {
  return readJson<Sources>(join(root, "build", "sources.json")) ?? {};
}

export type BoardEntry = {
  /** The board's name: its path in the course tree. */
  board: string;
  /** `<book>/<chapter>/<lesson>` (questions: the lesson they test first). */
  lesson: string;
  kind: "page" | "question";
  version: string;
  source?: string;
};

type BankItem = Ref & { tests?: string[]; firstTry?: number };

/** A built item by its path in the course tree (`build/<path>.json`), or null. */
function readItem<T>(root: string, path: string): T | null {
  return readJson<T>(join(root, "build", `${path}.json`));
}

/** Every built chapter, in course order (from build/index.json down). */
function chapters(root: string): { concepts: Ref[]; questions: BankItem[] }[] {
  const index = readJson<{ books: Ref[] }>(join(root, "build", "index.json"));
  return (index?.books ?? []).flatMap((bookRef) =>
    (readItem<{ chapters: Ref[] }>(root, bookRef.path)?.chapters ?? []).flatMap((ref) => {
      const chapter = readItem<{ concepts: Ref[]; questions: BankItem[] }>(root, ref.path);
      return chapter === null ? [] : [chapter];
    }),
  );
}

/** Every built board, lesson by lesson: pages in order, then the questions testing that lesson. */
export function listBoards(root: string): BoardEntry[] {
  const sources = readSources(root);
  const out: BoardEntry[] = [];
  const entry = (ref: Ref, lesson: string, kind: BoardEntry["kind"]): BoardEntry => {
    const where = sources[ref.path]?.board;
    return {
      board: ref.path,
      lesson,
      kind,
      version: ref.version,
      ...(where !== undefined ? { source: where } : {}),
    };
  };
  for (const chapter of chapters(root))
    for (const ref of chapter.concepts) {
      const concept = readItem<{ id: string; overview: Ref[] }>(root, ref.path);
      if (concept === null) continue;
      for (const page of concept.overview) out.push(entry(page, ref.path, "page"));
      for (const q of chapter.questions.filter((q) => q.tests?.[0] === concept.id))
        out.push(entry(q, ref.path, "question"));
    }
  return out;
}
