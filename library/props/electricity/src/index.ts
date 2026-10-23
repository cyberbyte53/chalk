import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { electricityBill } from "./bill";
import { BillView } from "./bill-view";
import { chargeFlow } from "./charge";
import { ChargeView } from "./charge-view";
import { resistorCombo } from "./combo";
import { ComboView } from "./combo-view";
import { jouleHeating } from "./heating";
import { HeatingView } from "./heating-view";
import { ohmLab } from "./ohm";
import { OhmView } from "./ohm-view";
import { electricityScene } from "./scene";
import { ElectricitySceneView } from "./scene-view";
import { circuitSymbols } from "./symbols";
import { SymbolsView } from "./symbols-view";
import { waterTank } from "./tank";
import { TankView } from "./tank-view";
import { wireResistance } from "./wire";
import { WireView } from "./wire-view";

export { APPLIANCE_ORDER, APPLIANCE_WORDS, Appliance, WATTS } from "./appliances";
export {
  BillAction,
  BillDerived,
  BillPart,
  type BillRow,
  BillSignal,
  type BillState,
  HOUR_STEPS,
  costOf,
  electricityBill as electricityBillDef,
  monthUnitsOf,
  rowUnitsOf,
  rupees,
  unitsPerDayOf,
} from "./bill";
export {
  AMP_STEP,
  ChargeAction,
  ChargeDerived,
  ChargePart,
  ChargeShow,
  ChargeSignal,
  type ChargeState,
  ELECTRON_CHARGE,
  chargeFlow as chargeFlowDef,
  coulombsOf,
  electronsOf,
} from "./charge";
export {
  ComboAction,
  ComboDerived,
  type ComboItem,
  ComboMode,
  ComboPart,
  ComboSignal,
  type ComboState,
  MAIN,
  OHM_STEPS,
  PartKind,
  resistorCombo as resistorComboDef,
  solve as solveCombo,
} from "./combo";
export { CircuitSymbol } from "./draw";
export {
  CORD_OHMS,
  ELEMENT_OHMS,
  FUSE_APPLIANCES,
  FUSE_RATINGS,
  HeatAction,
  HeatDerived,
  HeatMode,
  HeatPart,
  HeatSignal,
  type HeatState,
  MAINS_VOLTS,
  heatOf,
  jouleHeating as jouleHeatingDef,
  lineCurrentOf,
} from "./heating";
export {
  AMMETER_MAX,
  CELL_VOLTS,
  GAP_OHMS,
  GapItem,
  OhmAction,
  OhmDerived,
  OhmMode,
  OhmPart,
  type OhmRow,
  OhmSignal,
  type OhmState,
  ohmLab as ohmLabDef,
  slopeOf,
} from "./ohm";
export {
  ElectricityScene,
  ElectricityScenePart,
  type ElectricitySceneState,
  electricityScene as electricitySceneDef,
} from "./scene";
export {
  SYMBOL_NAMES,
  SYMBOL_ORDER,
  SymbolsAction,
  SymbolsDerived,
  SymbolsMode,
  SymbolsSignal,
  type SymbolsState,
  circuitSymbols as circuitSymbolsDef,
} from "./symbols";
export {
  MAX_LEVEL,
  PIPE_OHMS,
  Pipe,
  TankAction,
  TankDerived,
  TankPart,
  TankSignal,
  type TankState,
  waterTank as waterTankDef,
} from "./tank";
export {
  BASE_AREA_M2,
  BASE_LENGTH_M,
  Material,
  RESISTIVITY,
  WireAction,
  WireDerived,
  WirePart,
  WireSignal,
  type WireSpec,
  type WireState,
  currentOf as wireCurrentOf,
  resistanceOf as wireResistanceOf,
  wireResistance as wireResistanceDef,
} from "./wire";

export const chargeFlowProp: PropModule = { def: asAnyProp(chargeFlow), View: ChargeView };
export const waterTankProp: PropModule = { def: asAnyProp(waterTank), View: TankView };
export const circuitSymbolsProp: PropModule = { def: asAnyProp(circuitSymbols), View: SymbolsView };
export const ohmLabProp: PropModule = { def: asAnyProp(ohmLab), View: OhmView };
export const wireResistanceProp: PropModule = { def: asAnyProp(wireResistance), View: WireView };
export const resistorComboProp: PropModule = { def: asAnyProp(resistorCombo), View: ComboView };
export const jouleHeatingProp: PropModule = { def: asAnyProp(jouleHeating), View: HeatingView };
export const electricityBillProp: PropModule = { def: asAnyProp(electricityBill), View: BillView };
export const electricitySceneProp: PropModule = {
  def: asAnyProp(electricityScene),
  View: ElectricitySceneView,
};

/** Every electricity prop, for the library. */
export const electricityProps: readonly PropModule[] = [
  chargeFlowProp,
  waterTankProp,
  circuitSymbolsProp,
  ohmLabProp,
  wireResistanceProp,
  resistorComboProp,
  jouleHeatingProp,
  electricityBillProp,
  electricitySceneProp,
];
