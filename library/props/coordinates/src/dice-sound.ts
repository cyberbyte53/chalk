import { step, win } from "@chalk/sounds";
import type { PieceSound } from "./piece-sound";

/** The dice game: a step as a counter moves, a fanfare when it's won (said: the words wait). */
export const diceSound: PieceSound = { cues: { counterMoved: step, won: win }, inTurn: ["won"] };
