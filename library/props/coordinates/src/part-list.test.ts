import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DRAWINGS } from "./drawings";
import { PARTS } from "./parts";
import { SOUNDS } from "./sounds";

/**
 * The lists (parts.ts, drawings.ts, sounds.ts, styles.css) are left out of a board's code
 * fingerprint: a board counts only the files of the parts it uses, found by name
 * (`<name>.ts`, `<name>-view.tsx`, `<name>-sound.ts`, `<name>.css`). These keep that true: each line
 * names its part's own entry from its part's own file, and every part starts off.
 */
const here = import.meta.dirname;
const names = Object.keys(PARTS);

describe("the coordinate plane's parts", () => {
  it.each(names)("%s: its entry, drawing and sound are its own files'", async (name) => {
    const model = await import(`./${name}.ts`);
    expect(PARTS[name as keyof typeof PARTS]).toBe(model[`${name}Part`]);
    const view = await import(`./${name}-view.tsx`);
    expect(DRAWINGS[name as keyof typeof DRAWINGS]).toBe(view[`${name}Drawing`]);
    if (SOUNDS[name] !== undefined) {
      const sound = await import(`./${name}-sound.ts`);
      expect(SOUNDS[name]).toBe(sound[`${name}Sound`]);
    }
  });

  it.each(names)("%s starts off", (name) => {
    const entry = PARTS[name as keyof typeof PARTS];
    expect(entry.prop.type).toBe(name);
    expect(entry.isOn(entry.prop.start as never)).toBe(false);
  });

  it("sounds only for parts", () => {
    for (const name of Object.keys(SOUNDS)) expect(names).toContain(name);
  });

  it("the stylesheet only gathers the plane's and the parts' own, in order", () => {
    const lines = readFileSync(join(here, "styles.css"), "utf8").trim().split("\n");
    for (const line of lines) {
      const file = /^@import "\.\/([a-z-]+)\.css";$/.exec(line)?.[1];
      expect(file, line).toBeDefined();
      expect(existsSync(join(here, `${file}.css`))).toBe(true);
    }
  });
});
