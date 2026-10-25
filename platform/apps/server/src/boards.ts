import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadBoard } from "@chalk/author";
import {
  type Board,
  type ItemRef,
  Kind,
  builtPageSchema,
  builtQuestionSchema,
} from "@chalk/content";
import { modules } from "@chalk/content-source/modules";
import { propDefs } from "@chalk/library";

/** A board the server can't make: no such item, or not the version the phone has. */
export class NoSuchBoard extends Error {}

/** A built item's path: a .json file inside build/, nothing outside it. */
const ITEM_PATH = /^[a-z0-9-]+(\/[a-z0-9-]+)+\.json$/;

/**
 * The server's boards: made from the same code the app makes them from (chapters ship as code),
 * the built item read from build/ to know which module and which params. The version must be the
 * phone's (the app and the server are built from one commit; an old app on a phone is refused).
 */
export function contentBoards(contentDir: string): (item: ItemRef) => Promise<Board> {
  return async (item) => {
    if (!ITEM_PATH.test(item.path)) throw new NoSuchBoard(`no item ${item.path}`);
    let json: unknown;
    try {
      json = JSON.parse(await readFile(join(contentDir, item.path), "utf8"));
    } catch {
      throw new NoSuchBoard(`no item ${item.path}`);
    }
    const built =
      (json as { kind?: unknown }).kind === Kind.Page
        ? builtPageSchema.parse(json)
        : builtQuestionSchema.parse(json);
    if (built.version !== item.version)
      throw new NoSuchBoard(`${item.path} is at ${built.version}, not ${item.version}`);
    return loadBoard(modules, built, (type) => propDefs[type]?.role, item.path);
  };
}
