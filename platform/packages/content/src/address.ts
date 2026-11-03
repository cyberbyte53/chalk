/**
 * Addresses: how a person, an agent and a thread name a thing, by where it lives. Two roots, the
 * real folders:
 *
 *   content/<book>/<chapter>/<lesson>/<board>#piece/part     a board, or something on it
 *   content/<book>/<chapter>                                  anything above a board
 *   content/<book>/<chapter>/<lesson>#art                     what a book or chapter screen draws of it
 *   content/                                                  every book
 *   library/props/<package>/<type>#part                       a prop, or a part of it
 *   library/props/<package>, library/props/                   a package's props, every prop
 *
 * Below `content/` is the board's name in the course (what the build, the app and events use); the
 * root is only in the address. An address without a root is refused, so which kind of thing it
 * names is never guessed.
 */

export const CONTENT_ROOT = "content/";

/**
 * What the book and chapter screens draw of a node above a board, by the built field it shows: its
 * title, its glyph (a lesson's circle on the chapter's path), its art. The node itself is its tile
 * or its card. A thread on one is at `content/<node>#<part>`.
 */
export const NodePart = { Title: "title", Glyph: "glyph", Art: "art" } as const;
export type NodePart = (typeof NodePart)[keyof typeof NodePart];

/**
 * Whether a node path (below `content/`) is a book, chapter or lesson rather than a board: a board
 * is always at least four deep (book/chapter/lesson/board, or a question's
 * book/chapter/questions/family/id).
 */
export function isAboveBoard(path: string): boolean {
  return path !== "" && path.split("/").length <= 3;
}

/**
 * The screen a book, chapter or lesson's thing is drawn on: a lesson's circle, name and card are on
 * its chapter's path; a chapter's tile (its art) on its book's screen, its title on its own; a
 * book's on its own.
 */
export function screenOf(path: string, part: string | undefined): string {
  const up = path.split("/").slice(0, -1).join("/");
  const depth = path.split("/").length;
  if (depth === 3) return up;
  if (depth === 2 && part === NodePart.Art) return up;
  return path;
}
export const PROPS_ROOT = "library/props/";

export type Address =
  | {
      root: "content";
      /** The course path: a board's name, or a lesson, chapter or book above it. */
      path: string;
      /** What on the board: "piece" or "piece/part". */
      part?: string;
    }
  | {
      /** The library: every prop, or one package's. */
      root: "library";
      pkg?: string;
    }
  | {
      root: "props";
      /** The package folder under library/props. */
      pkg: string;
      /** The prop's type. */
      type: string;
      /** What on the prop: "part" or "child/part". */
      part?: string;
    };

const ROOTS = `${CONTENT_ROOT} or ${PROPS_ROOT}`;

/** An address, read; throws saying what's wrong. */
export function parseAddress(text: string): Address {
  const clean = text.trim().replace(/\.json$/, "");
  const hash = clean.indexOf("#");
  const where = (hash === -1 ? clean : clean.slice(0, hash)).replace(/\/$/, "");
  const part = hash === -1 ? undefined : clean.slice(hash + 1);
  if (part === "") throw new Error(`"${text}": nothing after #`);
  const withPart = <A extends Address>(a: A): A => (part === undefined ? a : { ...a, part });
  if (`${where}/`.startsWith(CONTENT_ROOT)) {
    // "content/" alone is every book.
    const path = `${where}/`.slice(CONTENT_ROOT.length).replace(/\/$/, "");
    if (path === "" && part !== undefined) throw new Error(`"${text}": a board before #`);
    return withPart({ root: "content", path });
  }
  if (`${where}/`.startsWith(PROPS_ROOT)) {
    const [pkg, type, ...rest] = `${where}/`.slice(PROPS_ROOT.length).split("/").filter(Boolean);
    if (type === undefined && rest.length === 0) {
      if (part !== undefined) throw new Error(`"${text}": a prop before #`);
      return pkg === undefined ? { root: "library" } : { root: "library", pkg };
    }
    if (!pkg || !type || rest.length > 0)
      throw new Error(
        `"${text}": a prop is ${PROPS_ROOT}<package>/<type>, e.g. ${PROPS_ROOT}basics/choice`,
      );
    return withPart({ root: "props", pkg, type });
  }
  throw new Error(
    `"${text}": an address starts with ${ROOTS} (${CONTENT_ROOT}class10-maths/real-numbers/…, ${PROPS_ROOT}basics/choice)`,
  );
}

/** A content address, read; throws when it names a prop or has no root. */
export function contentPath(text: string): { path: string; part?: string } {
  const a = parseAddress(text);
  if (a.root !== "content")
    throw new Error(
      `"${text}" is in the library; this takes a board, lesson, chapter or book under ${CONTENT_ROOT}`,
    );
  return a.part === undefined ? { path: a.path } : { path: a.path, part: a.part };
}

/** The address of a course path (a board's name, or above), and maybe something on it. */
export const contentAddress = (path: string, part?: string): string =>
  `${CONTENT_ROOT}${path}${part === undefined ? "" : `#${part}`}`;

/** The address of a prop, and maybe a part of it. */
export const propAddress = (pkg: string, type: string, part?: string): string =>
  `${PROPS_ROOT}${pkg}/${type}${part === undefined ? "" : `#${part}`}`;

/** Any address, written. */
export function formatAddress(a: Address): string {
  if (a.root === "content") return contentAddress(a.path, a.part);
  if (a.root === "library") return `${PROPS_ROOT}${a.pkg === undefined ? "" : a.pkg}`;
  return propAddress(a.pkg, a.type, a.part);
}

/**
 * The preview's query for an address (`at=…`), kept readable: only what a query can't hold as is
 * (`#`, `&`, `%`, spaces) is escaped.
 */
export const previewQuery = (address: string): string =>
  `at=${address.replace(/[%#& ]/g, (c) => encodeURIComponent(c))}`;

/**
 * The address of a board a page shows, and maybe something on it (`part`, an address on the board:
 * "piece/part"). A board's name is a course path; a prop on its own page is named by its address
 * already, and its one piece is the prop itself, so its parts come straight after `#`.
 */
export function shownAddress(name: string, part?: string): string {
  if (!name.startsWith(PROPS_ROOT)) return contentAddress(name, part);
  const under = part?.split("/").slice(1).join("/");
  return under === undefined || under === "" ? name : `${name}#${under}`;
}
