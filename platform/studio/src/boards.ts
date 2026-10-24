import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Boards as tools see them: a board is named by its build path without `.json`
 * (`class10-maths/real-numbers/division-lemma/overview/story`), the same name the preview takes
 * (`?dev&board=…`) and feedback files point at. Read from build/ (run `pnpm build-content` first).
 */

type Ref = { id: string; version: string; path: string; tests?: string[]; firstTry?: number };
export type Sources = Record<string, { board?: string; pieces: Record<string, string> }>;

const readJson = <T>(file: string): T | null => {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
};
const dirsIn = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [];

export const boardName = (path: string): string => path.replace(/\.json$/, "");

export function readSources(root: string): Sources {
  return readJson<Sources>(join(root, "build", "sources.json")) ?? {};
}

/** Where a board (and optionally one of its pieces) was written: `content/…/overview.ts:42`. */
export function siteOf(root: string, board: string, piece?: string | null): string | undefined {
  const where = readSources(root)[`${boardName(board)}.json`];
  if (where === undefined) return undefined;
  return (piece ? where.pieces[piece] : undefined) ?? where.board;
}

export type BoardEntry = {
  /** The board's name: its build path without .json. */
  board: string;
  /** `<book>/<chapter>/<lesson>` (questions: the lesson they test first). */
  lesson: string;
  kind: "page" | "question";
  version: string;
  source?: string;
};

/** Every built board, lesson by lesson: pages in order, then the questions testing that lesson. */
export function listBoards(root: string): BoardEntry[] {
  const build = join(root, "build");
  const sources = readSources(root);
  const out: BoardEntry[] = [];
  for (const book of dirsIn(build))
    for (const chapter of dirsIn(join(build, book))) {
      const chapterJson = readJson<{ concepts: Ref[]; questions: Ref[] }>(
        join(build, book, chapter, "chapter.json"),
      );
      if (chapterJson === null) continue;
      for (const ref of chapterJson.concepts) {
        const concept = readJson<{ id: string; overview: Ref[] }>(join(build, ref.path));
        if (concept === null) continue;
        const lesson = ref.path.replace(/\/concept\.json$/, "");
        for (const page of concept.overview)
          out.push({
            board: boardName(page.path),
            lesson,
            kind: "page",
            version: page.version,
            ...(sources[page.path]?.board ? { source: sources[page.path]?.board } : {}),
          });
        for (const q of chapterJson.questions.filter((q) => q.tests?.[0] === concept.id))
          out.push({
            board: boardName(q.path),
            lesson,
            kind: "question",
            version: q.version,
            ...(sources[q.path]?.board ? { source: sources[q.path]?.board } : {}),
          });
      }
    }
  return out;
}

/**
 * The board a player lesson id and index name (`concept/<id>` board 2), as the app numbers them:
 * pages in order; practice = questions marked firstTry (in that order), else all testing it; bank =
 * the rest. Returns null when build/ doesn't have it.
 */
export function findBoard(root: string, lessonId: string, boardIndex: number): string | null {
  const [kind, conceptId] = lessonId.split("/");
  if (conceptId === undefined) return null;
  const build = join(root, "build");
  for (const book of dirsIn(build))
    for (const chapter of dirsIn(join(build, book))) {
      const chapterJson = readJson<{ concepts: Ref[]; questions: Ref[] }>(
        join(build, book, chapter, "chapter.json"),
      );
      const ref = chapterJson?.concepts.find((c) => c.id === conceptId);
      if (chapterJson === null || ref === undefined) continue;
      if (kind === "concept") {
        const concept = readJson<{ overview: Ref[] }>(join(build, ref.path));
        const page = concept?.overview[boardIndex];
        return page === undefined ? null : boardName(page.path);
      }
      const testing = chapterJson.questions.filter((q) => q.tests?.includes(conceptId));
      const first = testing
        .filter((q) => q.firstTry !== undefined)
        .sort((a, b) => (a.firstTry ?? 0) - (b.firstTry ?? 0));
      const list =
        kind === "practice"
          ? first.length === 0
            ? testing
            : first
          : first.length === 0
            ? []
            : testing.filter((q) => q.firstTry === undefined);
      const q = list[boardIndex];
      return q === undefined ? null : boardName(q.path);
    }
  return null;
}
