import { PATH } from "@chalk/prop";

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
 * Every part drawn in a prop's HTML, as the description names it: a `data-part` inside a composite's
 * `data-child` is "<child> › <part>". What the drawn-equals-described checks compare against.
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
      out.add([...stack.filter((c): c is string => c !== undefined), part].join(PATH));
    if (selfClosing !== "/" && !VOID.has(tag.toLowerCase())) stack.push(child);
  }
  return out;
}

/** The same, from a live element: each [data-part] inside `root`, with the data-child names above it. */
export function partPathsIn(root: Element): Map<string, Element> {
  const out = new Map<string, Element>();
  for (const el of root.querySelectorAll("[data-part]")) {
    const names: string[] = [];
    for (let at = el.parentElement; at !== null && at !== root; at = at.parentElement) {
      const child = at.getAttribute("data-child");
      if (child !== null) names.unshift(child);
    }
    const path = [...names, el.getAttribute("data-part") ?? ""].join(PATH);
    if (!out.has(path)) out.set(path, el);
  }
  return out;
}
