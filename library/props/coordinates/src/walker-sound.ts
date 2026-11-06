import { blocked, step } from "@chalk/sounds";
import type { PartSound } from "./part-sound";

/** Riya: a step as she moves, a bump when she can't. */
export const walkerSound: PartSound = { cues: { stepped: step, blocked } };
