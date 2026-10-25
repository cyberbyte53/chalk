import { options } from "preact";

/**
 * Dev only: puts on every drawn part (`data-part`) where its drawing is written, as
 * `data-code="library/props/…/view.tsx:42"`, from the source the dev JSX compiler records on each
 * element. When a shared piece draws the part for a prop (a stepper button from a kit), the line is
 * the prop's own call to it. So an agent pointing at a part knows the line to change.
 */
type DevVNode = {
  type: unknown;
  props: Record<string, unknown>;
  __source?: { fileName: string; lineNumber: number };
  /** Preact's parent vnode and DOM node (mangled names). */
  __?: DevVNode | null;
  __e?: Element | null;
};

let isOn = false;

export function stampCodePaths(): void {
  if (isOn) return;
  isOn = true;
  const where = (v: DevVNode) => {
    const file = v.__source?.fileName;
    // Repo-relative: from library/, platform/ or content/ on.
    const rel = file?.replace(/^.*?\/(library|platform|content)\//, "$1/");
    return rel === undefined ? undefined : `${rel}:${v.__source?.lineNumber}`;
  };
  const isShared = (file: string) =>
    !file.includes("library/props/") || /\/kit[/.]|\/blocks\/src\//.test(file);
  const previous = options.diffed;
  options.diffed = (vnode) => {
    previous?.(vnode);
    const v = vnode as unknown as DevVNode;
    if (typeof v.type !== "string") return;
    const part = v.props["data-part"];
    const dom = v.__e;
    if (typeof part !== "string" || dom == null) return;
    // The nearest line in a prop's own code: this element's, or the call that drew it.
    let at: DevVNode | null | undefined = v;
    let found = where(v);
    while (at != null) {
      const here = where(at);
      if (here !== undefined && !isShared(here)) {
        found = here;
        break;
      }
      at = at.__;
    }
    if (found !== undefined) dom.setAttribute("data-code", found);
  };
}
