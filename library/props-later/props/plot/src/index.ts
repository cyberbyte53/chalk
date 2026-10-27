import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { graph } from "./graph";
import { GraphView } from "./view";

export { type GraphState, MAX_POINTS, graph as graphDef } from "./graph";

export const graphProp: PropModule = { def: asAnyProp(graph), View: GraphView };
