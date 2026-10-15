import { Color } from "./color.gen";

/** A colour content picks for itself, beyond the look's roles. */
export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
export const COLOR_ROLES: readonly Color[] = Object.values(Color);

export function isColorRole(value: string): value is Color {
  return (COLOR_ROLES as readonly string[]).includes(value);
}

/** The CSS value for a colour: a role becomes its variable (`var(--color-primary)`), a hex stays. */
export function cssColor(color: string): string {
  return isColorRole(color) ? `var(--color-${color})` : color;
}
