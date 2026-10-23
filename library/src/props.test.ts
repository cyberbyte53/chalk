import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { preloadProps, propDefs, propLibrary } from "./index";

// The app knows every prop by its definition up front and loads its drawing code later, per
// package. These checks keep the two halves in step: a package's `defs.ts` must list exactly the
// props its module registers, and every prop type must draw once its package is loaded.
const PROPS = new URL("../../props/", import.meta.url);
const names = readdirSync(PROPS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const isModule = (value: unknown): value is { def: { type: string }; View: unknown } =>
  typeof value === "object" && value !== null && "def" in value && "View" in value;

describe("prop packages, defs now and views later", () => {
  it.each(names)("%s: defs.ts lists exactly the props its module registers", async (name) => {
    const module = (await import(`@chalk/prop-${name}`)) as Record<string, unknown>;
    const { defs } = (await import(`@chalk/prop-${name}/defs`)) as {
      defs: readonly { type: string }[];
    };
    const registered = new Set<string>();
    for (const value of Object.values(module))
      for (const one of Array.isArray(value) ? value : [value])
        if (isModule(one)) registered.add(one.def.type);
    expect(new Set(defs.map((def) => def.type))).toEqual(registered);
  });

  it("every prop type is in the library, with its definition", () => {
    for (const [type, module] of Object.entries(propLibrary)) {
      expect(propDefs[type]).toBe(module.def);
    }
  });

  it("preloading a chapter's props loads each one's package", async () => {
    await expect(preloadProps(Object.keys(propLibrary))).resolves.toBeUndefined();
  });
});
