import { type PropViewProps, RichText } from "@chalk/player";
import { Coordinates, Mafs, Point } from "mafs";
import type { JSX } from "preact";
import { clean, polyTex, valueAt } from "./poly";
import { Stepper, SymbolButton } from "./ui";
import { ValueMachineAction, type ValueMachineState, workingTex } from "./value-machine";
import { planeBox } from "./zero-plane";

const DOT = "var(--color-primary)";
const ZERO = "var(--color-secondary)";

/**
 * The machine: p(x) on top, a stepper to put a number in, the substitution written out, and a
 * grid where every number put in leaves a dot. Dots on the x-axis (zeroes) are marked and labelled.
 */
export function ValueMachineView({ view, width, call }: PropViewProps): JSX.Element {
  const s = view as unknown as ValueMachineState;
  const p = s.coefficients;
  const box = planeBox(s, width);
  const { xMin, xMax, yMin, yMax } = s.window;
  const at = (x: number) => clean(valueAt(p, x));
  const xStep = xMax - xMin > 12 ? 2 : 1;
  const yStep = yMax - yMin > 40 ? 10 : yMax - yMin > 16 ? 2 : 1;
  const inside = (x: number) => {
    const y = at(x);
    return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
  };
  return (
    <div class="pp-machine">
      <p class="pp-equation" data-part="rule">
        <RichText text={`$${s.name}(${s.variable}) = ${polyTex(p, s.variable)}$`} />
      </p>
      <div class="pp-controls">
        <Stepper
          name={s.variable}
          value={s.input ?? 0}
          step={s.step}
          min={s.min}
          max={s.max}
          part="input"
          onChange={(x) => call(ValueMachineAction.Put, { x })}
        />
        <SymbolButton
          symbol="→"
          label="Put it in"
          part="put"
          onPress={() => call(ValueMachineAction.Put, { x: s.input ?? 0 })}
        />
      </div>
      <p class="pp-working" data-part="working">
        {s.input === null ? (
          <span class="pp-working-empty">…</span>
        ) : (
          <RichText text={`$${workingTex(p, s.input, s.name, s.variable)}$`} />
        )}
      </p>
      <div class="pp-mafs" style={{ height: `${box.height}px` }} data-part="dots">
        <Mafs
          width={box.width}
          height={box.height}
          viewBox={{ x: [xMin, xMax], y: [yMin, yMax], padding: 0 }}
          preserveAspectRatio={false}
          pan={false}
          zoom={false}
        >
          <Coordinates.Cartesian
            xAxis={{
              lines: xStep,
              labels: (x) => (x !== 0 && x > xMin && x < xMax ? String(x) : ""),
            }}
            yAxis={{
              lines: yStep,
              labels: (y) => (y !== 0 && y > yMin && y < yMax ? String(y) : ""),
            }}
          />
          {s.tried.filter(inside).map((x) => {
            const isZero = Math.abs(at(x)) < 1e-9;
            return (
              <Point
                key={x}
                x={x}
                y={at(x)}
                color={isZero ? ZERO : DOT}
                opacity={x === s.input ? 1 : 0.55}
              />
            );
          })}
        </Mafs>
      </div>
      <SymbolButton
        symbol="↺"
        label="Clear the dots"
        part="startAgain"
        isEnabled={s.tried.length > 0}
        onPress={() => call(ValueMachineAction.StartAgain, {})}
      />
    </div>
  );
}
