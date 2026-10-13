import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { exponentRoutes } from "./model";
import { ExponentRoutesView } from "./view";

export const exponentRoutesProp: PropModule = {
  def: asAnyProp(exponentRoutes),
  View: ExponentRoutesView,
};
export {
  exponentRoutes as exponentRoutesDef,
  ExponentRoutesPart,
  ExponentRoutesSignal,
  type ExponentRoutesState,
  Route,
} from "./model";
