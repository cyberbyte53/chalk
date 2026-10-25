/**
 * Addresses. A board is a tree (board → piece → child → … → part) and every node has one address,
 * written one way everywhere: its names from the piece down, joined by "/" ("mirror/objectArrow/
 * object"). Descriptions, the screen (`data-path`), steps, comments, Jugnu's pointing and error
 * messages all use it. Members (fields, actions, signals) are separate keys, never more syntax.
 *
 * A name taken from data can hold a "/" (a mark labelled "1/2"): inside an address it is written
 * "%2F" (and "%" as "%25"), as in a URL, so an address always splits back into its names.
 */

export const SEP = "/";

/** One name as it is written inside an address. */
export function segment(name: string): string {
  return name.replaceAll("%", "%25").replaceAll(SEP, "%2F");
}

/** An address from names (each written as a segment). */
export function pathOf(...names: readonly string[]): string {
  return names.map(segment).join(SEP);
}

/** Joins addresses (or segments) already written as addresses. */
export function joinPath(...paths: readonly string[]): string {
  return paths.filter((p) => p !== "").join(SEP);
}

/** The names an address is made of. */
export function namesOf(path: string): string[] {
  if (path === "") return [];
  return path
    .split(SEP)
    .map((s) => s.replaceAll("%2F", SEP).replaceAll("%2f", SEP).replaceAll("%25", "%"));
}
