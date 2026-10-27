import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { lateralMirror } from "./lateral-mirror";
import { LateralMirrorView } from "./lateral-mirror-view";
import { lens } from "./lens";
import { LensView } from "./lens-view";
import { mirrorImage } from "./mirror-image";
import { MirrorImageView } from "./mirror-image-view";
import { planeMirror } from "./plane-mirror";
import { PlaneMirrorView } from "./plane-mirror-view";
import { rayAngle } from "./ray-angle";
import { RayAngleView } from "./ray-angle-view";
import { refraction } from "./refraction";
import { RefractionView } from "./refraction-view";
import { lightScene } from "./scene";
import { LightSceneView } from "./scene-view";
import { sphericalMirror } from "./spherical-mirror";
import { SphericalMirrorView } from "./spherical-mirror-view";

export {
  LIT_WITHIN,
  LABEL_ORDER as PLANE_MIRROR_LABELS,
  LABEL_WORDS as PLANE_MIRROR_LABEL_WORDS,
  PlaneMirrorAction,
  PlaneMirrorDerived,
  PlaneMirrorLabel,
  PlaneMirrorPart,
  PlaneMirrorSignal,
  type PlaneMirrorState,
  ROOM,
  TORCH_HEIGHT,
  incidenceOf,
  planeMirror as planeMirrorDef,
  reflectedX,
  strikeToLight,
} from "./plane-mirror";

export {
  APERTURE,
  BEAM_RAYS,
  FOCAL,
  HEIGHT,
  MARK_WITHIN,
  RULER_STEP,
  SHARP_WITHIN,
  MirrorKind,
  Place,
  Ray,
  SphericalMirrorAction,
  SphericalMirrorDerived,
  SphericalMirrorPart,
  SphericalMirrorSignal,
  type SphericalMirrorState,
  beamHeights,
  blurAt,
  describeImage,
  imageOf,
  isImageShown,
  isMarkOnImage,
  isSharpAt,
  markOf,
  markStart,
  placeOf,
  rayPath,
  readoutOf,
  rulerTicks,
  screenHalf,
  signedCm,
  signedF,
  sphericalMirror as sphericalMirrorDef,
} from "./spherical-mirror";

export const planeMirrorProp: PropModule = { def: asAnyProp(planeMirror), View: PlaneMirrorView };
export const sphericalMirrorProp: PropModule = {
  def: asAnyProp(sphericalMirror),
  View: SphericalMirrorView,
};

export {
  LENS_FOCAL,
  LENS_HEIGHT,
  LensAction,
  LensCover,
  LensObjectStyle,
  LensDerived,
  LensKind,
  LensPart,
  LensPlace,
  LensRay,
  LensSignal,
  type LensState,
  describeLensImage,
  lensImageOf,
  lensPlaceOf,
  lensRayPath,
  powerOf,
  lens as lensDef,
} from "./lens";

export {
  MirrorImageAction,
  MirrorImageDerived,
  MirrorImagePart,
  MirrorImageSignal,
  type MirrorImageState,
  anglesOf,
  mirrorImage as mirrorImageDef,
  raysOf as mirrorImageRaysOf,
} from "./mirror-image";

export const lensProp: PropModule = { def: asAnyProp(lens), View: LensView };
export const mirrorImageProp: PropModule = { def: asAnyProp(mirrorImage), View: MirrorImageView };

export {
  MEDIA,
  MEDIA_ORDER,
  Medium,
  RefractionAction,
  RefractionDerived,
  RefractionMode,
  RefractionPart,
  RefractionSignal,
  type RefractionState,
  coinPath,
  refraction as refractionDef,
  refractionAngle,
  speedIn,
  speedText,
} from "./refraction";

export const refractionProp: PropModule = { def: asAnyProp(refraction), View: RefractionView };

export {
  type LightSceneState,
  SceneAction,
  SceneDerived,
  SceneKind,
  ScenePart,
  SceneSignal,
  NEXT,
  SEE_TORCH,
  STEPS,
  describeScene,
  isSceneLit,
  lightScene as lightSceneDef,
} from "./scene";

export const lightSceneProp: PropModule = { def: asAnyProp(lightScene), View: LightSceneView };

export { AngleLabel, RayAnglePart, type RayAngleState, rayAngle as rayAngleDef } from "./ray-angle";
export const rayAngleProp: PropModule = { def: asAnyProp(rayAngle), View: RayAngleView };

export {
  Hand,
  LateralMirrorAction,
  LateralMirrorDerived,
  LateralMirrorPart,
  LateralMirrorSignal,
  type LateralMirrorState,
  LateralWord,
  Reads,
  Writing,
  lateralMirror as lateralMirrorDef,
} from "./lateral-mirror";
export const lateralMirrorProp: PropModule = {
  def: asAnyProp(lateralMirror),
  View: LateralMirrorView,
};
