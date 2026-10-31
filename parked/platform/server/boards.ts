import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadBoard } from "@chalk/author";
import {
  type Board,
  type ItemRef,
  Kind,
  builtFile,
  builtPageSchema,
  builtQuestionSchema,
} from "@chalk/content";
import { modules } from "@chalk/content-source/modules";
import { propDefs } from "@chalk/library";

/** A board the server can't make: no such item, or not the version the phone has. */
export class NoSuchBoard extends Error {}

/** A node's path in the course tree: its file is build/<path>.json, nothing outside build/. */
const ITEM_PATH = /^[a-z0-9-]+(\/[a-z0-9-]+)+$/;

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
      json = JSON.parse(await readFile(join(contentDir, builtFile(item.path)), "utf8"));
    } catch {
      throw new NoSuchBoard(`no item ${item.path}`);
    }
    const built =
      (json as { kind?: unknown }).kind === Kind.Page
        ? builtPageSchema.parse(json)
        : builtQuestionSchema.parse(json);
    if (built.path !== item.path || built.id !== item.id)
      throw new NoSuchBoard(`${item.path} is item ${built.id}, not ${item.id}`);
    if (built.version !== item.version)
      throw new NoSuchBoard(`${item.path} is at ${built.version}, not ${item.version}`);
    return loadBoard(modules, built, (type) => propDefs[type]?.role);
  };
}
