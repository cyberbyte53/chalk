import { appear } from "@chalk/sounds";
import type { PieceSound } from "./piece-sound";

/** The plane: something appearing as a street rises. */
export const planeSound: PieceSound = { cues: { risen: appear } };
