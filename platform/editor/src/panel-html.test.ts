import { describe, expect, it } from "vitest";
import { panelHtml } from "./panel-html";

const BASE = "http://localhost:5173/";

/** The panel's inline script, as the webview gets it. */
function scriptOf(page: string): string {
  const found = /<script nonce="[^"]+">([\s\S]*?)<\/script>/.exec(page);
  if (found?.[1] === undefined) throw new Error("the panel has no script");
  return found[1];
}

/**
 * Runs the panel's script against a stand-in page: the elements it reads, the frame, and the window's
 * messages. Returns a way to send it a message as the extension does, and the frame.
 */
function runPanel(page: string) {
  const listeners: ((e: { data: unknown; source: unknown }) => void)[] = [];
  const frame = { src: "", contentWindow: {}, addEventListener: () => {} };
  const element = () => ({
    textContent: "",
    style: {},
    classList: { toggle: () => {}, remove: () => {}, contains: () => false },
    onclick: null,
  });
  const elements = new Map<string, unknown>([["frame", frame]]);
  const document = {
    getElementById: (id: string) => {
      if (!elements.has(id)) elements.set(id, element());
      return elements.get(id);
    },
    addEventListener: () => {},
  };
  const window = {
    addEventListener: (_: string, f: (typeof listeners)[number]) => listeners.push(f),
  };
  const acquireVsCodeApi = () => ({ postMessage: () => {} });
  new Function("document", "window", "acquireVsCodeApi", scriptOf(page))(
    document,
    window,
    acquireVsCodeApi,
  );
  return {
    frame,
    fromExtension: (data: unknown) => {
      for (const f of listeners) f({ data, source: null });
    },
    /** A message from the page in the frame (it went somewhere by itself). */
    fromFrame: (data: unknown) => {
      for (const f of listeners) f({ data, source: frame.contentWindow });
    },
    /** Clicks a button on the panel's bar. */
    click: (id: string) => {
      const button = elements.get(id) as { onclick: ((e: unknown) => void) | null } | undefined;
      button?.onclick?.({ target: element() });
    },
  };
}

describe("the preview panel's page", () => {
  const page = panelHtml(BASE, "at=library/props/primes/lapRace");
  it("opens on the address it was given", () => {
    expect(page).toContain(`<iframe id="frame" src="${BASE}?dev&at=library/props/primes/lapRace">`);
  });
  it("its script parses (a template string eats backslashes: one bad regex stops it all)", () => {
    expect(() => new Function(scriptOf(page))).not.toThrow();
  });
  it("a 'show' from the extension moves the frame, again and again", () => {
    const panel = runPanel(page);
    for (const query of [
      "at=library/props/coordinates/coordinatePlane",
      "at=content/class10-maths/real-numbers",
      "at=library/props/decimal/decimalExpansion",
    ]) {
      panel.fromExtension({ type: "show", query });
      expect(panel.frame.src).toBe(`${BASE}?dev&${query}`);
    }
  });
  it("a lesson the preview went to keeps its questions when the panel reloads (Play)", () => {
    const panel = runPanel(page);
    panel.fromFrame({
      chalk: true,
      type: "follow",
      follow: "class9-maths/coordinate-geometry/two-numbers-for-a-place",
    });
    panel.click("play");
    expect(panel.frame.src).toBe(
      `${BASE}?dev&at=content/class9-maths/coordinate-geometry/two-numbers-for-a-place&show=questions&play`,
    );
    panel.fromFrame({ chalk: true, type: "follow", follow: "class9-maths/coordinate-geometry" });
    panel.click("play");
    expect(panel.frame.src).toBe(`${BASE}?dev&at=content/class9-maths/coordinate-geometry`);
  });
});
