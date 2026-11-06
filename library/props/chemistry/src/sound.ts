import type { SoundView } from "@chalk/player";
import { appear, right, step } from "@chalk/sounds";

/**
 * How the equation sounds (platform/docs/sound.md): a molecule appearing as it is counted, a step
 * as the atoms land across the arrow, and "right" when it balances. Its model knows nothing of sound.
 */
export const equationBalanceSound: SoundView = {
  cues: {
    counted: appear,
    balanced: right,
    regrouped: step,
  },
  inTurn: ["balanced"],
};
