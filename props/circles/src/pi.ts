import { z } from "zod";
import { numText } from "./kit/geometry";

/** Which value of π a sum uses: NCERT's 22/7 (the default), 3.14, or the true value. */
export const PiValue = { Sevenths: "22/7", Decimal: "3.14", Exact: "exact" } as const;
export type PiValue = (typeof PiValue)[keyof typeof PiValue];
export const piValue = z.nativeEnum(PiValue);

export const piOf = (p: PiValue): number =>
  p === PiValue.Sevenths ? 22 / 7 : p === PiValue.Decimal ? 3.14 : Math.PI;

/** How the π is written in a working line: "22/7", "3.14" or "π". */
export const piText = (p: PiValue): string => (p === PiValue.Exact ? "π" : p);

/** An area or length rounded the way the book does (two decimals at most). */
export const amount = (x: number): string => numText(Math.round(x * 100) / 100);
