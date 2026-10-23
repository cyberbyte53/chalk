import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { electricityBill } from "./bill";
import { chargeFlow } from "./charge";
import { resistorCombo } from "./combo";
import { jouleHeating } from "./heating";
import { ohmLab } from "./ohm";
import { electricityScene } from "./scene";
import { circuitSymbols } from "./symbols";
import { waterTank } from "./tank";
import { wireResistance } from "./wire";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-electricity")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(chargeFlow),
  asAnyProp(waterTank),
  asAnyProp(circuitSymbols),
  asAnyProp(ohmLab),
  asAnyProp(wireResistance),
  asAnyProp(resistorCombo),
  asAnyProp(jouleHeating),
  asAnyProp(electricityBill),
  asAnyProp(electricityScene),
];
