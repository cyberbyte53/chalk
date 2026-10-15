import { Dec } from "@chalk/exact";
import { z } from "zod";

/**
 * An exact decimal in params.yaml, written as quoted text ("7.384"), handed to the family as a `Dec`.
 * Unquoted, YAML would read a float and drop trailing zeros (7.30 → 7.3), so a number is refused.
 */
const QUOTE_IT = 'write a decimal as quoted text, like "7.384"';

export const decimal = z
  .string({ invalid_type_error: QUOTE_IT })
  .regex(/^-?\d+(\.\d+)?$/, QUOTE_IT)
  .transform((text) => Dec.parse(text));

/** For a family that takes nothing: its params.yaml is `- params: {}`. */
export const noParams = z.object({}).strict();
