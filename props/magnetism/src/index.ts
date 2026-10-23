import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { magneticField } from "./field-prop";
import { FieldView } from "./field-view";
import { generator } from "./generator";
import { GeneratorView } from "./generator-view";
import { induction } from "./induction";
import { InductionView } from "./induction-view";
import { motor } from "./motor";
import { MotorView } from "./motor-view";
import { forceOnRod } from "./rod";
import { RodView } from "./rod-view";
import { handRule } from "./rule";
import { RuleView } from "./rule-view";
import { magnetismScene } from "./scene";
import { MagnetismSceneView } from "./scene-view";
import { homeWiring } from "./wiring";
import { WiringView } from "./wiring-view";

export {
  MAGNET,
  SOLENOID,
  Source,
  X_MAX,
  Y_MAX,
  angleOf,
  fieldAt,
  headingOf,
  traceLine,
  wiresOf,
} from "./field";
export {
  FieldAction,
  FieldDerived,
  FieldPart,
  FieldSignal,
  type FieldState,
  MAX_CURRENT,
  MAX_TURNS,
  describeField,
  magneticField as magneticFieldDef,
  needleAngleOf,
  northEndOf,
  strengthAt,
} from "./field-prop";
export {
  Carrier,
  ROLES,
  Rule,
  RuleAction,
  RuleDerived,
  RulePart,
  RuleSignal,
  type RuleState,
  answerOf,
  describeRule,
  handRule as handRuleDef,
} from "./rule";
export { DIRS, DIR_SHORT, DIR_WORDS, Dir, crossDir, opposite } from "./space";
export {
  MAX_ROD_CURRENT,
  RodAction,
  RodDerived,
  RodPart,
  RodSignal,
  type RodState,
  describeRod,
  forceOf,
  forceOnRod as forceOnRodDef,
  pushOf,
  swingOf,
} from "./rod";
export {
  MotorAction,
  MotorDerived,
  MotorPart,
  MotorSignal,
  type MotorState,
  brushXOf,
  currentInAB,
  describeMotor,
  forceOnAB,
  motor as motorDef,
  spinOf,
} from "./motor";
export {
  InductionAction,
  InductionDerived,
  InductionMode,
  InductionPart,
  InductionSignal,
  type InductionState,
  Mover,
  Place,
  describeInduction,
  induction as inductionDef,
  kickFor,
  kickForKey,
} from "./induction";
export {
  GeneratorAction,
  GeneratorDerived,
  GeneratorPart,
  GeneratorSignal,
  type GeneratorState,
  Rings,
  armCurrentOf,
  currentInABOf,
  describeGenerator,
  generator as generatorDef,
  outputOf,
  outsideFlowOf,
} from "./generator";
export {
  APPLIANCES_ON,
  Appliance,
  CIRCUIT_OF,
  Circuit,
  Fault,
  MAINS_VOLTS,
  OVEN_WATTS,
  RATING,
  WATTS,
  WiringAction,
  WiringDerived,
  WiringPart,
  WiringSignal,
  type WiringState,
  currentOf,
  demandOf,
  describeWiring,
  homeWiring as homeWiringDef,
  isBodyLiveOf,
  isShockOf,
} from "./wiring";
export {
  MagnetismScene,
  MagnetismScenePart,
  type MagnetismSceneState,
  describeMagnetismScene,
  magnetismScene as magnetismSceneDef,
} from "./scene";

export const magneticFieldProp: PropModule = { def: asAnyProp(magneticField), View: FieldView };
export const handRuleProp: PropModule = { def: asAnyProp(handRule), View: RuleView };
export const forceOnRodProp: PropModule = { def: asAnyProp(forceOnRod), View: RodView };
export const motorProp: PropModule = { def: asAnyProp(motor), View: MotorView };
export const inductionProp: PropModule = { def: asAnyProp(induction), View: InductionView };
export const generatorProp: PropModule = { def: asAnyProp(generator), View: GeneratorView };
export const homeWiringProp: PropModule = { def: asAnyProp(homeWiring), View: WiringView };
export const magnetismSceneProp: PropModule = {
  def: asAnyProp(magnetismScene),
  View: MagnetismSceneView,
};

/** Every prop in this package. */
export const magnetismProps: readonly PropModule[] = [
  magneticFieldProp,
  handRuleProp,
  forceOnRodProp,
  motorProp,
  inductionProp,
  generatorProp,
  homeWiringProp,
  magnetismSceneProp,
];
