import { blocked, step } from "@chalk/sounds";
import type { PieceSound } from "./piece-sound";

/** Riya: a step as she moves, a bump when she can't. */
export const walkerSound: PieceSound = { cues: { stepped: step, blocked } };
