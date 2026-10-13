import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { surdTiles } from "./model";
import { SurdTilesView } from "./view";

export const surdTilesProp: PropModule = { def: asAnyProp(surdTiles), View: SurdTilesView };
export { surdTiles as surdTilesDef, type SurdTilesState } from "./model";
