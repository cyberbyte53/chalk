import { appear } from "@chalk/sounds";
import type { PieceSound } from "./piece-sound";

/** Plotting: something appearing as a point lands. */
export const plottingSound: PieceSound = { cues: { plotted: appear } };
