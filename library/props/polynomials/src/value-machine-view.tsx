import { type PropViewProps, RichText } from "@chalk/player";
import { Coordinates, Line, Mafs, Point } from "mafs";
import type { JSX } from "preact";
import { clean, degreeOf, polyTex, trim, valueAt } from "./poly";
import { Stepper, SymbolButton } from "./ui";
import {
  ValueMachineAction,
  type ValueMachineState,
  machineNumber,
  workingTex,
} from "./value-machine";
import { planeBox } from "./zero-plane";

const DOT = "var(--color-primary)";
const ZERO = "var(--color-secondary)";
const MARK = "var(--color-on-surface-variant)";

/**
 * The machine: p(x) on top, then x (− and + to nudge), the substitution written out, and a grid.
 * x is a handle on the grid's x-axis: drag it (or touch the grid anywhere) and the working follows;
 * let go and the number goes in, leaving a dot at (x, p(x)). Dots on the x-axis (zeroes) are marked.
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
  const x = s.input ?? 0;
  const isHeld = s.input !== null && !s.tried.includes(s.input);
  const [handleX, axisY] = box.toPixel(x, 0);
  const handleY = Math.min(box.height, Math.max(0, axisY));
  const toX = (e: PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return xMin + ((e.clientX - r.left) / r.width) * (xMax - xMin);
  };
  const isDragging = (e: PointerEvent) =>
    (e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId) ?? false;
  return (
    <div class="pp-machine">
      <p class="pp-equation" data-part="rule">
        <RichText text={`$${s.name}(${s.variable}) = ${polyTex(p, s.variable)}$`} />
      </p>
      <Stepper
        name={s.variable}
        value={x}
        shown={machineNumber(x).text}
        step={s.step}
        min={s.min}
        max={s.max}
        part="input"
        onChange={(to) => call(ValueMachineAction.Put, { x: to })}
      />
      <p class="pp-working" data-part="working">
        {s.input === null ? (
          <span class="pp-working-empty">…</span>
        ) : (
          <Working
            tex={workingTex(p, s.input, s.name, s.variable)}
            isSplit={degreeOf(trim(p)) >= 3}
          />
        )}
      </p>
      <div
        class="pp-mafs pp-dial"
        style={{ height: `${box.height}px` }}
        data-part="dots"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          call(ValueMachineAction.Move, { x: toX(e) });
        }}
        onPointerMove={(e) => {
          if (isDragging(e)) call(ValueMachineAction.Move, { x: toX(e) });
        }}
        onPointerUp={(e) => {
          if (isDragging(e)) call(ValueMachineAction.Put, { x: toX(e) });
        }}
      >
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
              labels: (v) => (v !== 0 && v > xMin && v < xMax ? String(v) : ""),
            }}
            yAxis={{
              lines: yStep,
              labels: (v) => (v !== 0 && v > yMin && v < yMax ? String(v) : ""),
            }}
          />
          {s.tried.filter(inside).map((t) => (
            <Point
              key={t}
              x={t}
              y={at(t)}
              color={Math.abs(at(t)) < 1e-9 ? ZERO : DOT}
              opacity={t === s.input ? 1 : 0.55}
            />
          ))}
          {s.input !== null && (
            <Line.Segment
              point1={[x, 0]}
              point2={[x, Math.min(yMax, Math.max(yMin, at(x)))]}
              style="dashed"
              color={MARK}
            />
          )}
          {isHeld && inside(x) && <Point x={x} y={at(x)} color={MARK} />}
        </Mafs>
        <div
          class="pp-handle"
          role="slider"
          tabIndex={0}
          aria-label={s.variable}
          aria-valuemin={s.min}
          aria-valuemax={s.max}
          aria-valuenow={x}
          aria-valuetext={`${s.variable} = ${machineNumber(x).text}`}
          data-part="handle"
          style={{ left: `${handleX}px`, top: `${handleY}px` }}
          onKeyDown={(e) => {
            const by = e.key === "ArrowLeft" ? -s.step : e.key === "ArrowRight" ? s.step : 0;
            if (by === 0) return;
            e.preventDefault();
            call(ValueMachineAction.Put, { x: x + by });
          }}
        >
          <span class="pp-handle-label">{machineNumber(x).text}</span>
        </div>
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

/** The working on one line, or with the value on a line of its own (a cubic's is too long for one). */
function Working({ tex, isSplit }: { tex: string; isSplit: boolean }): JSX.Element {
  const at = tex.lastIndexOf(" = ");
  if (!isSplit || at < 0) return <RichText text={`$${tex}$`} />;
  return (
    <>
      <RichText text={`$${tex.slice(0, at)}$`} />
      <span class="pp-working-value">
        <RichText text={`$${tex.slice(at + 1)}$`} />
      </span>
    </>
  );
}
