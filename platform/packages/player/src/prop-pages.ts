import { propAddress } from "@chalk/content/address";
import { full } from "@chalk/content/words";
import { type AnyPropDef, BOARD, PropRole, purposeOf } from "@chalk/prop";
import type { ZodTypeAny } from "zod";
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

/** Every prop's page, package by package, in the order packages and props are declared. */
export function propPages(defsByPackage: ReadonlyMap<string, readonly AnyPropDef[]>): PropPage[] {
  const out: PropPage[] = [];
  for (const [pkg, defs] of [...defsByPackage].sort(([a], [b]) => a.localeCompare(b)))
    for (const def of defs) {
      if (def.type === BOARD) continue;
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
        fields: Object.entries(stateShape).map(([name, schema]) => ({
          name,
          takes: shape(schema),
          ...(schema.description ? { meaning: schema.description } : {}),
          isInput: inputs.has(name),
          changedBy: actions.filter(([, a]) => a.changes?.includes(name)).map(([n]) => n),
        })),
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
      });
    }
  return out;
}
