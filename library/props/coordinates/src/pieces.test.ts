import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DRAWINGS } from "./drawings";
import { PIECES } from "./pieces";
import { SOUNDS } from "./sounds";

/**
 * The lists (pieces.ts, drawings.ts, sounds.ts, styles.css) are left out of a board's code
 * fingerprint: a board counts only the files of the pieces it uses, found by name
 * (`<name>.ts`, `<name>-view.tsx`, `<name>-sound.ts`, `<name>.css`). These keep that true: each line
 * names its piece's own entry from its piece's own file, and every piece starts off.
 */
const here = import.meta.dirname;
const names = Object.keys(PIECES);

describe("the coordinate plane's pieces", () => {
  it.each(names)("%s: its entry, drawing and sound are its own files'", async (name) => {
    const model = await import(`./${name}.ts`);
    expect(PIECES[name as keyof typeof PIECES]).toBe(model[`${name}Piece`]);
    const view = await import(`./${name}-view.tsx`);
    expect(DRAWINGS[name as keyof typeof DRAWINGS]).toBe(view[`${name}Drawing`]);
    if (SOUNDS[name] !== undefined) {
      const sound = await import(`./${name}-sound.ts`);
      expect(SOUNDS[name]).toBe(sound[`${name}Sound`]);
    }
  });

  it.each(names)("%s starts off", (name) => {
    const entry = PIECES[name as keyof typeof PIECES];
    expect(entry.prop.type).toBe(name);
    expect(entry.isOn(entry.prop.start as never)).toBe(false);
  });

  it("sounds only for pieces", () => {
    for (const name of Object.keys(SOUNDS)) expect(names).toContain(name);
  });

  it("the stylesheet only gathers the plane's and the pieces' own, in order", () => {
    const lines = readFileSync(join(here, "styles.css"), "utf8").trim().split("\n");
    for (const line of lines) {
      const file = /^@import "\.\/([a-z-]+)\.css";$/.exec(line)?.[1];
      expect(file, line).toBeDefined();
      expect(existsSync(join(here, `${file}.css`))).toBe(true);
    }
  });
});
