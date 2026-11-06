import { type PropModule, propModule } from "@chalk/player";
import { sounds } from "./defs";
import { peaCross } from "./pea-cross";
import { PeaCrossView } from "./pea-cross-view";

export { Gene, type Genes, countOf, genesWord, isTallOf, punnettOf } from "./pea-cross";
export { peaCross };

export const peaCrossProp = propModule(peaCross, PeaCrossView, sounds[peaCross.type]);

/** Every prop in this package, for the library. */
export const heredityProps: readonly PropModule[] = [peaCrossProp];
