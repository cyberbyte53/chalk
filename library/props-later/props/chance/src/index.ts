import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { coin } from "./coin";
import { CoinView } from "./view";

export { CoinSignal, type CoinState, Face, coin as coinDef } from "./coin";
export { nextRandom } from "./random";

export const coinProp: PropModule = { def: asAnyProp(coin), View: CoinView };
