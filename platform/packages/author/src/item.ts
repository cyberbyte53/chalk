import { type Board, type BuiltPage, type BuiltQuestion, Kind, propPieces } from "@chalk/content";
import { PropRole } from "@chalk/prop";
import type { BuiltBoard } from "./board";
import { isFamily } from "./family";
import { ContentFile } from "./manifest";
import { type Page, isPage } from "./page";

/**
 * Chapters ship as code: a built page or question names the module that makes its board (its
 * overview.ts, or its family.ts with its params row), and every copy of the board, in the build,
 * on the phone and on the server, is made from that module by the functions here. Rules stay
 * typed functions; nothing is turned into data and back.
 */

/** A built item whose board is made from code. */
export type BoardItem = BuiltPage | BuiltQuestion;

/** The module that makes the item's board, under content/: "class10-maths/…/overview.ts". */
export function moduleOf(item: BoardItem): string {
  return item.kind === Kind.Page
    ? `${item.source.path}/${item.source.file}`
    : `${item.source.path}/${ContentFile.Family}`;
}

/** What one prop type is, as far as making a board needs: whether it is a question. */
export type RoleOf = (type: string) => string | undefined;

/** The item's board as its author wrote it (and its witnesses), from its module. Throws if the
 * module doesn't make it (a page no longer there, params its family won't take). */
export function builtOf(item: BoardItem, module: Readonly<Record<string, unknown>>): BuiltBoard {
  if (item.kind === Kind.Page) {
    const pages = module.overview;
    if (!Array.isArray(pages) || !pages.every(isPage))
      throw new Error(`${moduleOf(item)} should export \`overview\`: an array of page(...)`);
    const page = (pages as Page[]).find((p) => p.key === item.key);
    if (page === undefined) throw new Error(`${moduleOf(item)} has no page "${item.key}"`);
    return page.build();
  }
  const families = Object.values(module).filter(isFamily);
  const family = families[0];
  if (family === undefined || families.length > 1)
    throw new Error(`${moduleOf(item)} should export exactly one family(...)`);
  const params = family.params.safeParse(item.params);
  if (!params.success)
    throw new Error(
      `${moduleOf(item)}: ${params.error.issues.map((i) => `params.${i.path.join(".")}: ${i.message}`).join("; ")}`,
    );
  const path = item.source.path;
  return family.build(params.data, path.slice(path.lastIndexOf("/") + 1));
}

/**
 * The item's board as it is played: its questions told what they are about and whether they count (a bank question is graded on the concepts it
 * tests; a page's are about its concept, ungraded), and where it was made from (`path`: its file
 * under build/, so a copy elsewhere can be made again).
 */
export function finishBoard(
  item: BoardItem,
  built: BuiltBoard,
  roleOf: RoleOf,
  path: string,
): Board {
  const board: Board = {
    ...built.board,
    root: structuredClone(built.board.root),
    item: { id: item.id, path, version: item.version },
  };
  const tag =
    item.kind === Kind.Page
      ? { concepts: [item.concept], isGraded: false }
      : { concepts: [...item.tests], isGraded: true };
  for (const piece of propPieces(board.root))
    if (roleOf(piece.prop) === PropRole.Question)
      piece.with = { ...piece.with, concepts: [...tag.concepts], isGraded: tag.isGraded };
  return board;
}

/** The item's board, made from its module: the one way any copy of it is made. */
export function boardOf(
  item: BoardItem,
  module: Readonly<Record<string, unknown>>,
  roleOf: RoleOf,
  path: string,
): Board {
  return finishBoard(item, builtOf(item, module), roleOf, path);
}

/** Where each item's module is loaded from: content/modules.gen.ts, by module path. */
export type ContentModules = Readonly<
  Record<string, () => Promise<Readonly<Record<string, unknown>>>>
>;

/** Loads the item's module and makes its board. */
export async function loadBoard(
  modules: ContentModules,
  item: BoardItem,
  roleOf: RoleOf,
  path: string,
): Promise<Board> {
  const load = modules[moduleOf(item)];
  if (load === undefined)
    throw new Error(`${moduleOf(item)} isn't in content/modules.gen.ts; run pnpm build-content`);
  return boardOf(item, await load(), roleOf, path);
}
