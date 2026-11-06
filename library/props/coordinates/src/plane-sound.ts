import { appear } from "@chalk/sounds";
import type { PartSound } from "./part-sound";

/** The plane: something appearing as a street rises. */
export const planeSound: PartSound = { cues: { risen: appear } };
