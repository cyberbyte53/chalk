import { step, win } from "@chalk/sounds";
import type { PartSound } from "./part-sound";

/** The dice game: a step as a counter moves, a fanfare when it's won (said: the words wait). */
export const diceSound: PartSound = { cues: { counterMoved: step, won: win }, inTurn: ["won"] };
