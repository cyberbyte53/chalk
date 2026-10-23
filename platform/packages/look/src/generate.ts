/**
 * Turns tokens.json (W3C design tokens) into what code uses: CSS variables for every screen and
 * prop, and the `Color` names content picks from. Both outputs are committed; a test fails when
 * either is stale.
 */

const HEADER = "Generated from tokens.json by `pnpm --filter @chalk/look generate`. Do not edit.";
const GENERIC_FONTS = new Set(["serif", "sans-serif", "monospace", "system-ui", "cursive"]);
/** The group content may name a colour from; the others (brand) are the app's own. */
const CONTENT_GROUP = "color";

type TokenValue = string | number | string[];
type Token = { name: string; value: TokenValue };
type Group = { name: string; tokens: Token[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTokenValue(value: unknown): value is TokenValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    (Array.isArray(value) && value.every((item) => typeof item === "string"))
  );
}

/** The groups of tokens.json, in file order; keys starting with `$` are notes, not tokens. */
export function readGroups(json: unknown): Group[] {
  if (!isRecord(json)) throw new Error("tokens.json: the top level must be an object");
  return Object.entries(json)
    .filter(([name]) => !name.startsWith("$"))
    .map(([name, body]) => {
      if (!isRecord(body)) throw new Error(`tokens.json: ${name} must be a group of tokens`);
      const tokens = Object.entries(body)
        .filter(([key]) => !key.startsWith("$"))
        .map(([key, token]) => {
          const value = isRecord(token) ? token.$value : undefined;
          if (!isTokenValue(value)) throw new Error(`tokens.json: ${name}.${key} has no $value`);
          return { name: key, value };
        });
      return { name, tokens };
    });
}

function cssValue(value: TokenValue, known: Set<string>, where: string): string {
  if (Array.isArray(value)) {
    return value.map((font) => (GENERIC_FONTS.has(font) ? font : `"${font}"`)).join(", ");
  }
  if (typeof value === "number") return String(value);
  const ref = /^\{([a-z-]+)\.([a-z0-9-]+)\}$/.exec(value);
  if (ref === null) return value;
  const target = `${ref[1]}-${ref[2]}`;
  if (!known.has(target))
    throw new Error(`tokens.json: ${where} refers to ${value}, which is missing`);
  return `var(--${target})`;
}

/** `:root` with one CSS variable per token: `--color-primary`, `--font-body`, `--text-title`. */
export function generateCss(json: unknown): string {
  const groups = readGroups(json);
  const known = new Set(groups.flatMap((g) => g.tokens.map((t) => `${g.name}-${t.name}`)));
  const lines = groups.flatMap((group) =>
    group.tokens.map(
      (t) => `  --${group.name}-${t.name}: ${cssValue(t.value, known, `${group.name}.${t.name}`)};`,
    ),
  );
  return `/* ${HEADER} */\n:root {\n${lines.join("\n")}\n}\n`;
}

function pascal(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** The `Color` names (`Color.Primary` is `"primary"`), one per token of the colour group. */
export function generateTs(json: unknown): string {
  const group = readGroups(json).find((g) => g.name === CONTENT_GROUP);
  if (group === undefined) throw new Error(`tokens.json: no ${CONTENT_GROUP} group`);
  const entries = group.tokens.map((t) => `  ${pascal(t.name)}: "${t.name}",`);
  return [
    `// ${HEADER}`,
    "",
    "/** A colour of the look, by its role. A colour field takes one of these or any `#rrggbb`. */",
    "export const Color = {",
    ...entries,
    "} as const;",
    "export type Color = (typeof Color)[keyof typeof Color];",
    "",
  ].join("\n");
}
