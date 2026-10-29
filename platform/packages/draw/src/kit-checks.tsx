/** @jsxImportSource preact */
import { readFileSync } from "node:fs";
import type { JSX } from "preact";
import { renderToString } from "preact-render-to-string";
import { expect } from "vitest";

/** Checks every kit module's test runs on its pieces (used only by tests). */

const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
/** A colour written on the element itself, even a named one, instead of through a kit class. */
const COLOR_ATTRIBUTE = /\s(fill|stroke|color|stop-color)="/;

const STYLES = readFileSync(new URL("./styles.css", import.meta.url), "utf8");

/** The kit's styles hold no raw colour, only the look's tokens. */
export function expectStylesUseTokens(): void {
  expect(STYLES.split("\n").filter((line) => RAW_COLOR.test(line))).toEqual([]);
}

/**
 * Renders a piece and checks it: something drawn, `data-part` on its root, no colour of its own,
 * and every kit-* class inside it styled in styles.css (a group's class names a piece and may
 * carry no style). Returns the markup.
 */
export function expectKitPiece(piece: JSX.Element, part: string): string {
  const html = renderToString(piece);
  expect(html.length).toBeGreaterThan(0);
  expect(html).toMatch(new RegExp(`^<[a-z]+[^>]*\\sdata-part="${part}"`));
  expect(html).not.toMatch(RAW_COLOR);
  expect(html).not.toMatch(COLOR_ATTRIBUTE);
  const classes = new Set(
    [...html.matchAll(/<([a-z]+)[^>]*\sclass="([^"]*)"/g)]
      .filter((m) => m[1] !== "g")
      .flatMap((m) => (m[2] ?? "").split(" ")),
  );
  const unstyled = [...classes].filter(
    (c) => c.startsWith("kit-") && !new RegExp(`\\.${c}(?![\\w-])`).test(STYLES),
  );
  expect(unstyled).toEqual([]);
  return html;
}
