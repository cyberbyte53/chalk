import type { AnyProp } from "@chalk/prop";
import { sceneChoice, sceneGoal, sceneText } from "./scene";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards and check answers). The views load with a chapter (`import("@chalk/prop-basics")`).
 */
export const defs: readonly AnyProp[] = [sceneText, sceneChoice, sceneGoal];
