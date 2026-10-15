import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { collision } from "./model";
import { CollisionView } from "./view";

export {
  Block,
  CollisionAction,
  CollisionSignal,
  type CollisionState,
  afterCollision,
  collision as collisionDef,
  momentAt,
} from "./model";

export const collisionProp: PropModule = { def: asAnyProp(collision), View: CollisionView };
