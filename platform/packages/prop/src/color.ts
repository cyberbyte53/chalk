import { COLOR_ROLES, HEX_COLOR } from "@chalk/look";
import { z } from "zod";

/**
 * A colour a prop can be drawn in: a role of the look (`Color.Primary`, so it follows the app's
 * theme) or any `#rrggbb` (a colour of the content's own, like the blue of ℕ). The view turns it
 * into CSS with `cssColor` and derives its tint and edge from it.
 */
export const colorSchema = z
  .string()
  .refine((value) => HEX_COLOR.test(value) || (COLOR_ROLES as readonly string[]).includes(value), {
    message: `a colour is #rrggbb or one of the look's roles: ${COLOR_ROLES.join(", ")}`,
  });
