import { type BuildIndex, Level, builtBookSchema, builtChapterSchema } from "@chalk/content";
import { z } from "zod";

/**
 * What a question version tests and how hard it is. An answer records only which question, at
 * which version (the board and its version); this says the rest. A version is a hash of the built
 * question, whose `tests` and `level` are in it, so a row never changes: change either and it is
 * a new version. The server keeps every version it has served; the phone, those it has bundled.
 */
export const questionVersionSchema = z.object({
  board: z.string(),
  version: z.string(),
  tests: z.array(z.string()),
  level: z.nativeEnum(Level),
});
export type QuestionVersion = z.infer<typeof questionVersionSchema>;

/** Every bank question of the built course, at its version now. */
export function questionVersionsOf(
  index: BuildIndex,
  read: (path: string) => unknown,
): QuestionVersion[] {
  return index.books.flatMap((bookRef) =>
    builtBookSchema
      .parse(read(bookRef.path))
      .chapters.flatMap((chapterRef) =>
        builtChapterSchema
          .parse(read(chapterRef.path))
          .questions.map(({ id, version, tests, level }) => ({ board: id, version, tests, level })),
      ),
  );
}

/** Finds a question version: exactly, else (the phone, after a build it doesn't have) any of it. */
export type Catalogue = (board: string, version: string | null) => QuestionVersion | undefined;

export function catalogueOf(versions: readonly QuestionVersion[]): Catalogue {
  const exact = new Map(versions.map((v) => [`${v.board} ${v.version}`, v]));
  const anyOf = new Map(versions.map((v) => [v.board, v]));
  return (board, version) => exact.get(`${board} ${version}`) ?? anyOf.get(board);
}
