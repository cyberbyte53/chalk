import { appear } from "@chalk/sounds";
import type { PartSound } from "./part-sound";

/** Plotting: something appearing as a point lands. */
export const plottingSound: PartSound = { cues: { plotted: appear } };
