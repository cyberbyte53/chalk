import type { Out } from "./define";

/**
 * Steps in order, with pauses between: `sequence(a, 2.5, b, 1, c)` is a now, b 2.5 s later, c 1 s
 * after b. Each pause is one "later" holding the rest.
 */
export function sequence(...steps: readonly (Out | number)[]): Out[] {
  const at = steps.findIndex((step) => typeof step === "number");
  if (at === -1) return steps as Out[];
  const seconds = steps[at] as number;
  return [
    ...(steps.slice(0, at) as Out[]),
    { kind: "later", seconds, outs: sequence(...steps.slice(at + 1)) },
  ];
}
