import { propAddress } from "@chalk/content/address";
import { full } from "@chalk/content/words";
import { type AnyPropDef, BOARD, PropRole, groupOf, purposeOf } from "@chalk/prop";
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

/** The fields of a stored schema: a part's under its name, by path ("walker.walkFrom"). */
const shapeOf = (schema: ZodTypeAny): Record<string, ZodTypeAny> | undefined => {
  const inner = schema instanceof ZodNullable ? schema.unwrap() : schema;
  return (inner as unknown as { shape?: Record<string, ZodTypeAny> }).shape;
};

/**
 * A prop's fields, each with the actions that change it. A group's parts' fields are listed part
 * by part ("walker.walkFrom", changed by "walker.step"), each changed by its own part's actions.
 */
function fieldsOf(
  def: AnyPropDef,
  stateShape: Record<string, ZodTypeAny>,
  inputs: ReadonlySet<string>,
  prefix: string,
): PropPage["fields"] {
  const parts = groupOf(def)?.children ?? {};
  return Object.entries(stateShape).flatMap(([name, schema]) => {
    const part = parts[name] as AnyPropDef | undefined;
    const sub = part === undefined ? undefined : shapeOf(schema);
    if (part !== undefined && sub !== undefined)
      return fieldsOf(part, sub, new Set(part.inputs ?? []), `${prefix}${name}.`);
    return [
      {
        name: `${prefix}${name}`,
        takes: shape(schema),
        ...(schema.description ? { meaning: schema.description } : {}),
        isInput: inputs.has(name),
        changedBy: Object.entries(def.actions)
          .filter(([, a]) => (a as { changes?: readonly string[] }).changes?.includes(name))
          .map(([n]) => `${prefix}${n}`),
      },
    ];
  });
}

/** A prop on the event model (it has a `start`): its variables, needs, actions, signals. */
type SceneDef = {
  type: string;
  describe: string;
  role?: string;
  variables?: ZodTypeAny;
  needs?: ZodTypeAny;
  actions?: Readonly<
    Record<string, { payload: ZodTypeAny; describe?: string; isFromScreen: boolean }>
  >;
  signals?: Readonly<Record<string, unknown>>;
  children?: Readonly<Record<string, SceneDef>>;
  hear?: Readonly<Record<string, unknown>>;
};
const isSceneDef = (def: unknown): def is SceneDef =>
  typeof def === "object" && def !== null && "start" in def;

/** A scene prop's fields: its variables (changed only by its own rules), its needs, its parts'. */
function sceneFields(def: SceneDef, prefix: string): PropPage["fields"] {
  const own = Object.entries(shapeOf(def.variables ?? ({} as ZodTypeAny)) ?? {}).map(
    ([name, schema]) => ({
      name: `${prefix}${name}`,
      takes: shape(schema),
      ...(schema.description ? { meaning: schema.description } : {}),
      isInput: false,
      changedBy: [`${prefix}its own rules`],
    }),
  );
  const needs = Object.entries(shapeOf(def.needs ?? ({} as ZodTypeAny)) ?? {}).map(
    ([name, schema]) => ({
      name: `${prefix}${name}`,
      takes: shape(schema),
      ...(schema.description ? { meaning: schema.description } : {}),
      isInput: true,
      changedBy: [],
    }),
  );
  const parts = Object.entries(def.children ?? {}).flatMap(([name, child]) =>
    sceneFields(child, `${prefix}${name}.`),
  );
  return [...own, ...needs, ...parts];
}

function scenePage(pkg: string, def: SceneDef): PropPage {
  const actions = (d: SceneDef, prefix: string): PropPage["actions"] => [
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
  const signals = (d: SceneDef, prefix: string): string[] => [
    ...Object.keys(d.signals ?? {}).map((s) => `${prefix}${s}`),
    ...Object.entries(d.children ?? {}).flatMap(([name, c]) => signals(c, `${prefix}${name}.`)),
  ];
  return {
    address: propAddress(pkg, def.type),
    pkg,
    type: def.type,
    role: ROLE_WORDS[def.role ?? ""] ?? String(def.role),
    purpose: purposeOf(def as unknown as AnyPropDef),
    describe: def.describe.trim().replace(/\s+/g, " "),
    fields: sceneFields(def, ""),
    actions: actions(def, ""),
    signals: signals(def, ""),
    answers: Object.keys(def.hear ?? {}),
  };
}

/** Every prop's page, package by package, in the order packages and props are declared. */
export function propPages(defsByPackage: ReadonlyMap<string, readonly AnyPropDef[]>): PropPage[] {
  const out: PropPage[] = [];
  for (const [pkg, defs] of [...defsByPackage].sort(([a], [b]) => a.localeCompare(b)))
    for (const def of defs) {
      if (def.type === BOARD) continue;
      if (isSceneDef(def)) {
        out.push(scenePage(pkg, def));
        continue;
      }
      const stateShape =
        (def.state as unknown as { shape?: Record<string, ZodTypeAny> }).shape ?? {};
      const inputs = new Set(def.inputs ?? []);
      const actions = Object.entries(def.actions) as [
        string,
        { describe: string; args: ZodTypeAny; changes?: readonly string[]; byLearner?: boolean },
      ][];
      out.push({
        address: propAddress(pkg, def.type),
        pkg,
        type: def.type,
        role: ROLE_WORDS[def.role] ?? String(def.role),
        purpose: purposeOf(def),
        describe: def.describe.trim().replace(/\s+/g, " "),
        fields: fieldsOf(def, stateShape, inputs, ""),
        actions: actions.map(([name, a]) => {
          const args = takes(a.args);
          const isNone =
            args === null ||
            args === undefined ||
            (typeof args === "object" && Object.keys(args).length === 0);
          return {
            name,
            takes: isNone ? "" : typeof args === "string" ? args : full(args),
            describe: a.describe,
            isByLearner: a.byLearner === true,
          };
        }),
        signals: Object.keys(def.signals ?? {}),
        answers: [...(groupOf(def)?.answers ?? [])],
      });
    }
  return out;
}
