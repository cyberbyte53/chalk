import { propAddress } from "@chalk/content/address";
import { full } from "@chalk/content/words";
import { PropRole, purposeOf } from "@chalk/prop";
import type { AnyProp } from "@chalk/prop/next";
import { ZodNullable, type ZodTypeAny } from "zod";
import { takes } from "./snapshot";

/**
 * A prop's page: everything about it a person or an agent needs to choose it and use it, read from
 * its definition (its contract: the code is the one writer) and from what the build recorded about
 * every board that places it. One generator for every place props are listed or shown: the chalk
 * MCP's `look` at library/props/ (a line each) and at a prop's address (its page), read through
 * the preview (`__chalkProps`), Studio's library, and library/catalogue.md. Nothing here is
 * written by hand.
 */
export type PropPage = {
  address: string;
  pkg: string;
  type: string;
  role: string;
  /** What it is for: the first sentence of its describe. */
  purpose: string;
  describe: string;
  fields: {
    name: string;
    takes: string;
    /** The field's own `.describe()`, when it has one. */
    meaning?: string;
    /** A board's rules feed it. */
    isInput: boolean;
    /** The actions that change it; none: a setting, fixed where a board places the prop. */
    changedBy: string[];
  }[];
  actions: { name: string; takes: string; describe: string; isByLearner: boolean }[];
  signals: string[];
  /**
   * A group's: the parts' signals it answers with another part's action (`places.targetChosen`).
   * A field is changed only by its own part's actions; these are what else sets those off.
   */
  answers: string[];
};

const ROLE_WORDS: Record<string, string> = {
  [PropRole.Explainer]: "explainer",
  [PropRole.Question]: "question",
  [PropRole.Page]: "page",
};

/** A schema's shape, in words: what `takes` says, written out. */
const shape = (schema: ZodTypeAny): string => {
  const t = takes(schema);
  return typeof t === "string" ? t : full(t);
};

/** A schema's fields, by name (a nullable object's too). */
const shapeOf = (schema: ZodTypeAny): Record<string, ZodTypeAny> | undefined => {
  const inner = schema instanceof ZodNullable ? schema.unwrap() : schema;
  return (inner as unknown as { shape?: Record<string, ZodTypeAny> }).shape;
};

/** What a page reads of a prop: its variables, needs, actions, signals, parts. */
type PageDef = {
  type: string;
  describe: string;
  role?: string;
  variables?: ZodTypeAny;
  needs?: ZodTypeAny;
  actions?: Readonly<
    Record<string, { payload: ZodTypeAny; describe?: string; isFromScreen: boolean }>
  >;
  signals?: Readonly<Record<string, unknown>>;
  children?: Readonly<Record<string, PageDef>>;
  hear?: Readonly<Record<string, unknown>>;
};

/**
 * A prop's fields: its variables (changed only by its own rules), its needs, its parts'. A part's
 * needs are its holder's to give (the prop's own wiring), so only the prop's own are listed: those
 * a board gives it.
 */
function sceneFields(def: PageDef, prefix: string): PropPage["fields"] {
  const own = Object.entries(shapeOf(def.variables ?? ({} as ZodTypeAny)) ?? {}).map(
    ([name, schema]) => ({
      name: `${prefix}${name}`,
      takes: shape(schema),
      ...(schema.description ? { meaning: schema.description } : {}),
      isInput: false,
      changedBy: [`${prefix}its own rules`],
    }),
  );
  const needs = Object.entries(
    (prefix === "" ? shapeOf(def.needs ?? ({} as ZodTypeAny)) : {}) ?? {},
  ).map(([name, schema]) => ({
    name: `${prefix}${name}`,
    takes: shape(schema),
    ...(schema.description ? { meaning: schema.description } : {}),
    isInput: true,
    changedBy: [],
  }));
  const parts = Object.entries(def.children ?? {}).flatMap(([name, child]) =>
    sceneFields(child, `${prefix}${name}.`),
  );
  return [...own, ...needs, ...parts];
}

function pageOf(pkg: string, def: PageDef): PropPage {
  const actions = (d: PageDef, prefix: string): PropPage["actions"] => [
    ...Object.entries(d.actions ?? {}).map(([name, a]) => {
      const args = takes(a.payload);
      const isNone = typeof args === "object" && args !== null && Object.keys(args).length === 0;
      return {
        name: `${prefix}${name}`,
        takes: isNone ? "" : typeof args === "string" ? args : full(args),
        describe: a.describe ?? name,
        isByLearner: a.isFromScreen,
      };
    }),
    ...Object.entries(d.children ?? {}).flatMap(([name, c]) => actions(c, `${prefix}${name}.`)),
  ];
  const signals = (d: PageDef, prefix: string): string[] => [
    ...Object.keys(d.signals ?? {}).map((s) => `${prefix}${s}`),
    ...Object.entries(d.children ?? {}).flatMap(([name, c]) => signals(c, `${prefix}${name}.`)),
  ];
  return {
    address: propAddress(pkg, def.type),
    pkg,
    type: def.type,
    role: ROLE_WORDS[def.role ?? ""] ?? String(def.role),
    purpose: purposeOf(def),
    describe: def.describe.trim().replace(/\s+/g, " "),
    fields: sceneFields(def, ""),
    actions: actions(def, ""),
    signals: signals(def, ""),
    answers: Object.keys(def.hear ?? {}),
  };
}

/** Every prop's page, package by package, in the order packages and props are declared. */
export function propPages(defsByPackage: ReadonlyMap<string, readonly AnyProp[]>): PropPage[] {
  return [...defsByPackage]
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([pkg, defs]) => defs.map((def) => pageOf(pkg, def as unknown as PageDef)));
}
