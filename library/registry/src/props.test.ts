import { readdirSync } from "node:fs";
import type { AnyProp } from "@chalk/prop/next";
import { describe, expect, it } from "vitest";
import { preloadProps, propDefs, propLibrary } from "./index";
import { propModules } from "./modules";

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

describe("how props sound", () => {
  // A sound view names its effects by signal, inside its piece ("walker.stepped"): each must be a
  // signal there is, or the effect is silently never heard.
  const signalAt = (def: AnyProp, path: string): boolean => {
    const names = path.split(".");
    const signal = names.pop() ?? "";
    let at: AnyProp | undefined = def;
    for (const name of names) at = at?.children?.[name];
    return at?.signals?.[signal] !== undefined;
  };

  it("says its effects at signals its prop has", () => {
    const wrong = Object.values(propLibrary).flatMap((module) =>
      Object.keys(module.sound?.effects ?? {})
        .filter((at) => !signalAt(module.def as unknown as AnyProp, at))
        .map((at) => `${module.def.type}: ${at}`),
    );
    expect(wrong).toEqual([]);
  });

  it("is the same in the app's library and in Node's", () => {
    for (const [type, module] of Object.entries(propModules))
      expect(propLibrary[type]?.sound, type).toBe(module.sound);
  });
});
