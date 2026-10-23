import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { atmosphere } from "./atmosphere";
import { AtmosphereView } from "./atmosphere-view";
import { eyeModel } from "./eye-model";
import { EyeModelView } from "./eye-model-view";
import { prism } from "./prism";
import { PrismView } from "./prism-view";
import { scattering } from "./scattering";
import { ScatteringView } from "./scattering-view";
import { eyeScene } from "./scene";
import { EyeSceneView } from "./scene-view";

export {
  CORRECTION_LIMIT,
  CORRECTION_STEP,
  DEFECTS,
  EyeAction,
  EyeDefect,
  EyeDerived,
  EyePart,
  EyeSignal,
  type EyeState,
  Light,
  Muscles,
  OBJECT_STOPS,
  describeEye,
  eyeFor,
  eyeModel as eyeModelDef,
  farOf,
  focusOf,
  musclesOf,
  nearOf,
} from "./eye-model";
export {
  INCIDENCE_MAX,
  INCIDENCE_MIN,
  INCIDENCE_STEP,
  PRISM_ANGLE,
  PrismAction,
  PrismDerived,
  PrismMode,
  PrismPart,
  PrismSignal,
  type PrismState,
  RAY_INDEX,
  anglesOf as prismAnglesOf,
  describePrism,
  prism as prismDef,
} from "./prism";
export {
  ATMOSPHERE_STEPS,
  AtmosphereAction,
  AtmosphereDerived,
  AtmosphereKind,
  AtmospherePart,
  AtmosphereSignal,
  type AtmosphereState,
  SkySource,
  atmosphere as atmosphereDef,
  describeAtmosphere,
} from "./atmosphere";
export {
  SUN_HEIGHTS,
  ScatterAction,
  ScatterDerived,
  ScatterKind,
  ScatterPart,
  ScatterSignal,
  type ScatterState,
  SkyColour,
  TyndallPlace,
  describeScatter,
  scattering as scatteringDef,
} from "./scattering";
export {
  EYE_PICTURE,
  EyeSceneKind,
  EyeScenePart,
  type EyeSceneState,
  describeEyeScene,
  eyeScene as eyeSceneDef,
} from "./scene";
export * from "./optics";

export const eyeModelProp: PropModule = { def: asAnyProp(eyeModel), View: EyeModelView };
export const prismProp: PropModule = { def: asAnyProp(prism), View: PrismView };
export const atmosphereProp: PropModule = { def: asAnyProp(atmosphere), View: AtmosphereView };
export const scatteringProp: PropModule = { def: asAnyProp(scattering), View: ScatteringView };
export const eyeSceneProp: PropModule = { def: asAnyProp(eyeScene), View: EyeSceneView };

/** Every prop of the eye chapter, for the library. */
export const eyeProps: readonly PropModule[] = [
  eyeModelProp,
  prismProp,
  atmosphereProp,
  scatteringProp,
  eyeSceneProp,
];
