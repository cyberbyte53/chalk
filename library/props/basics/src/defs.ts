import type { AnyProp } from "@chalk/prop";
import { choice, goal, text } from "./props";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards and check answers). The views load with a chapter (`import("@chalk/prop-basics")`).
 */
export const defs: readonly AnyProp[] = [text, choice, goal];
