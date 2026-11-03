import { SEP, joinPath, namesOf, segment } from "@chalk/prop";

const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

/**
 * Every part drawn in a prop's HTML, by its address under the prop: a `data-part` inside a group's
 * `data-child` is "<child>/<part>". What the drawn-equals-described checks compare against.
 */
export function partPaths(html: string): Set<string> {
  const out = new Set<string>();
  const stack: (string | undefined)[] = [];
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g)) {
    const [, closing, tag = "", attrs = "", selfClosing] = m;
    if (closing === "/") {
      stack.pop();
      continue;
    }
    const child = /\bdata-child="([^"]+)"/.exec(attrs)?.[1];
    const part = /\bdata-part="([^"]+)"/.exec(attrs)?.[1];
    if (part !== undefined)
      out.add(
        [...stack.filter((c): c is string => c !== undefined), unescapeHtml(part)]
          .map(segment)
          .join(SEP),
      );
    if (selfClosing !== "/" && !VOID.has(tag.toLowerCase()))
      stack.push(child === undefined ? undefined : unescapeHtml(child));
  }
  return out;
}

const unescapeHtml = (s: string) =>
  s
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");

/** The names of the groups (`data-child`) between `root` and `el`, outermost first. */
function childNamesBetween(root: Element, el: Element): string[] {
  const names: string[] = [];
  if (el === root) return names;
  for (let at = el.parentElement; at !== null && at !== root; at = at.parentElement) {
    const child = at.getAttribute("data-child");
    if (child !== null) names.unshift(child);
  }
  return names;
}

/** The same, from a live element: each [data-part] inside `root` by its address under it. */
export function partPathsIn(root: Element): Map<string, Element> {
  const out = new Map<string, Element>();
  for (const el of root.querySelectorAll("[data-part]")) {
    const path = [...childNamesBetween(root, el), el.getAttribute("data-part") ?? ""]
      .map(segment)
      .join(SEP);
    if (!out.has(path)) out.set(path, el);
  }
  return out;
}

/**
 * The element at an address on a board ("mirror", "mirror/objectArrow/object"): the piece, then
 * each group's child, then the part. Exact: a name matches only that name at that level. A child
 * can be drawn in several layers (a picture under, its taps over: each tagged with its name), so
 * every layer by that name is looked in. The one way anything finds a node on screen (pointing,
 * picks, comment pins, steps, tests).
 */
export function findNode(board: ParentNode, path: string): Element | undefined {
  const [piece, ...rest] = namesOf(path);
  if (piece === undefined) return undefined;
  const top = board.querySelector(`[data-piece="${CSS.escape(piece)}"]`);
  if (top === null) return undefined;
  // Only the nearest level counts: a child inside another child is not this one's.
  const direct = (scope: Element, selector: string) =>
    [...scope.querySelectorAll(selector)].filter((el) => childNamesBetween(scope, el).length === 0);
  let at: Element[] = [top];
  for (const [i, name] of rest.entries()) {
    const children = at.flatMap((scope) => direct(scope, `[data-child="${CSS.escape(name)}"]`));
    if (i === rest.length - 1) {
      const part = at.flatMap((scope) => direct(scope, `[data-part="${CSS.escape(name)}"]`))[0];
      return part ?? children[0];
    }
    if (children.length === 0) return undefined;
    at = children;
  }
  return top;
}

/** The address of the node an element is in (its part, the groups around it, its piece). */
export function addressOf(el: Element): string | undefined {
  const piece = el.closest("[data-piece]");
  const name = piece?.getAttribute("data-piece");
  if (piece == null || name == null) return undefined;
  let part: string | undefined;
  const children: string[] = [];
  for (let at: Element | null = el; at !== null && at !== piece; at = at.parentElement) {
    const isPart = at.getAttribute("data-part");
    if (isPart !== null && part === undefined && children.length === 0) part = isPart;
    const child = at.getAttribute("data-child");
    if (child !== null) children.unshift(child);
  }
  return joinPath(
    segment(name),
    ...[...children, ...(part === undefined ? [] : [part])].map(segment),
  );
}

/**
 * Writes each node's full address on it (`data-path`), so a tool outside the app finds any node
 * with one selector. Kept up to date as the board redraws. Returns a function that stops it.
 */
export function stampPaths(board: Element): () => void {
  const stamp = () => {
    const selector = "[data-piece], [data-child], [data-part]";
    for (const el of [
      ...(board.matches(selector) ? [board] : []),
      ...board.querySelectorAll(selector),
    ]) {
      const path = addressOf(el);
      if (path !== undefined && el.getAttribute("data-path") !== path)
        el.setAttribute("data-path", path);
    }
  };
  stamp();
  if (typeof MutationObserver === "undefined") return () => {};
  let isQueued = false;
  const observer = new MutationObserver(() => {
    if (isQueued) return;
    isQueued = true;
    queueMicrotask(() => {
      isQueued = false;
      stamp();
    });
  });
  observer.observe(board, {
    subtree: true,
    childList: true,
    attributeFilter: ["data-piece", "data-child", "data-part"],
  });
  return () => observer.disconnect();
}
