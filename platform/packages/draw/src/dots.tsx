/** @jsxImportSource preact */
import { cssColor } from "@chalk/look";
import type { JSX } from "preact";
import { createPortal } from "preact/compat";
import { useLayoutEffect, useRef, useState } from "preact/hooks";
import { Dot } from "./pieces";
import { type Space, toPixels, useSpace } from "./stage";

/** How a collection is drawn. The collection decides; the prop never does. */
export const DrawMode = { Svg: "svg", WebGl: "webgl", Canvas: "canvas" } as const;
export type DrawMode = (typeof DrawMode)[keyof typeof DrawMode];

/**
 * Up to this many items, each is its own SVG element: crisp, styled, tappable. Above it, plain
 * items are painted as a crowd. From the draw bench (docs/drawing.md); change it here only.
 */
export const CROWD_THRESHOLD = 200;
/** Browsers allow 8 to 16 WebGL contexts a page; crowds beyond this paint with canvas 2D. */
export const MAX_WEBGL_CONTEXTS = 8;

/**
 * How a collection of `count` items is drawn. Items with colours of their own stay SVG (a crowd is
 * one colour); a crowd uses WebGL when it can, canvas 2D when it can't.
 */
export function chooseMode(count: number, hasOwnColors: boolean, canUseWebGl: boolean): DrawMode {
  if (count <= CROWD_THRESHOLD || hasOwnColors) return DrawMode.Svg;
  return canUseWebGl ? DrawMode.WebGl : DrawMode.Canvas;
}

let liveWebGlContexts = 0;
let hasWarned = false;

function warnSlow(count: number): void {
  if (hasWarned) return;
  hasWarned = true;
  console.warn(`Dots: ${count} dots with colours of their own stay SVG and may be slow.`);
}
let webGlSupport: boolean | undefined;

function canUseWebGl(): boolean {
  if (typeof document === "undefined") return false;
  if (webGlSupport === undefined) {
    const probe = document.createElement("canvas");
    webGlSupport = probe.getContext("webgl") !== null;
  }
  return webGlSupport && liveWebGlContexts < MAX_WEBGL_CONTEXTS;
}

export type DotsProps = {
  /** x, y of each dot, one after another: [x0, y0, x1, y1, …], in the stage's units. */
  points: ArrayLike<number>;
  r?: number;
  /** One colour for all (a look role or a hex). */
  color?: string;
  /** A colour for each dot, when they differ; keeps the collection SVG. */
  colors?: readonly (string | undefined)[];
  class?: string;
};

/** Many dots: SVG while they are few, a WebGL (or canvas) crowd when they are many. */
export function Dots({ points, r = 4, color, colors, class: extra }: DotsProps): JSX.Element {
  const space = useSpace();
  const count = Math.floor(points.length / 2);
  const hasOwnColors = colors?.some((c) => c !== undefined) ?? false;
  // Checked once: a crowd that later loses WebGL falls back by itself (Crowd, below).
  const [webGlOk] = useState(canUseWebGl);
  const mode = chooseMode(count, hasOwnColors, webGlOk);
  if (mode === DrawMode.Svg) {
    if (count > CROWD_THRESHOLD) warnSlow(count);
    const dots: JSX.Element[] = [];
    for (let i = 0; i < count; i++) {
      dots.push(
        <Dot
          key={i}
          at={points[i * 2] ?? 0}
          y={points[i * 2 + 1] ?? 0}
          r={r}
          color={colors?.[i] ?? color}
          class={extra}
        />,
      );
    }
    return <g class="draw-dots">{dots}</g>;
  }
  return (
    <Crowd
      space={space}
      points={points}
      count={count}
      r={r}
      color={color}
      startWithWebGl={mode === DrawMode.WebGl}
    />
  );
}

/** A colour as rgb numbers (0 to 1), read from the page so a look role resolves to the theme. */
function resolveColor(el: HTMLElement, color: string | undefined): [number, number, number] {
  el.style.color = color === undefined ? "var(--color-primary)" : cssColor(color);
  const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(getComputedStyle(el).color);
  return match === null
    ? [0, 0, 0]
    : [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];
}

type CrowdProps = {
  space: Space;
  points: ArrayLike<number>;
  count: number;
  r: number;
  color: string | undefined;
  startWithWebGl: boolean;
};

/** Paints a crowd on a canvas in the stage's top layer: the dot is made once, then only placed. */
function Crowd({ space, points, count, r, color, startWithWebGl }: CrowdProps): JSX.Element | null {
  const [mode, setMode] = useState<DrawMode>(startWithWebGl ? DrawMode.WebGl : DrawMode.Canvas);
  // The canvas lives in the stage's top layer, which exists only after the stage mounts: keep the
  // element in state so the painter is made as soon as it appears.
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const painter = useRef<Painter | null>(null);

  // A painter per canvas: WebGL, or canvas 2D if WebGL fails or is lost. Made before the first
  // paint below (layout effects run in order), so even a crowd that never moves shows.
  useLayoutEffect(() => {
    const el = canvas;
    if (el === null) return;
    const made =
      mode === DrawMode.WebGl
        ? webGlPainter(el, () => setMode(DrawMode.Canvas))
        : canvasPainter(el);
    if (made === null) {
      setMode(DrawMode.Canvas);
      return;
    }
    painter.current = made;
    return () => {
      made.dispose();
      painter.current = null;
    };
  }, [mode, canvas]);

  // Every render paints the dots where they are now.
  useLayoutEffect(() => {
    const el = canvas;
    const paint = painter.current;
    if (el === null || paint === null) return;
    const ratio = (el.clientWidth / space.width) * (window.devicePixelRatio || 1);
    const w = Math.round(space.width * ratio);
    const h = Math.round(space.height * ratio);
    if (el.width !== w || el.height !== h) {
      el.width = w;
      el.height = h;
    }
    const pixels = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const [px, py] = toPixels(space, points[i * 2] ?? 0, points[i * 2 + 1] ?? 0);
      pixels[i * 2] = px;
      pixels[i * 2 + 1] = py;
    }
    paint.paint(pixels, count, { r, ratio, color: resolveColor(el, color), space });
  });

  if (space.overlay === null) return null;
  return createPortal(
    <canvas key={mode} ref={setCanvas} class="draw-crowd" data-mode={mode} />,
    space.overlay,
  );
}

type PaintOptions = { r: number; ratio: number; color: [number, number, number]; space: Space };
type Painter = {
  paint: (pixels: Float32Array, count: number, o: PaintOptions) => void;
  dispose: () => void;
};

function canvasPainter(el: HTMLCanvasElement): Painter | null {
  const ctx = el.getContext("2d");
  if (ctx === null) return null;
  let sprite: HTMLCanvasElement | null = null;
  let spriteKey = "";
  return {
    paint(pixels, count, { r, ratio, color }) {
      const size = Math.ceil(r * 2 * ratio) + 2;
      const key = `${size}-${color.join(",")}`;
      if (sprite === null || key !== spriteKey) {
        // The dot, drawn once; after this it is only stamped.
        sprite = document.createElement("canvas");
        sprite.width = size;
        sprite.height = size;
        const s = sprite.getContext("2d");
        if (s !== null) {
          s.fillStyle = `rgb(${color.map((c) => Math.round(c * 255)).join(",")})`;
          s.beginPath();
          s.arc(size / 2, size / 2, r * ratio, 0, Math.PI * 2);
          s.fill();
        }
        spriteKey = key;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
      for (let i = 0; i < count; i++) {
        ctx.drawImage(
          sprite,
          (pixels[i * 2] ?? 0) * ratio - size / 2,
          (pixels[i * 2 + 1] ?? 0) * ratio - size / 2,
        );
      }
    },
    dispose() {},
  };
}

const VERTEX = `attribute vec2 p; uniform vec2 size; uniform float d;
void main(){ vec2 c = p / size * 2.0 - 1.0; gl_Position = vec4(c.x, -c.y, 0, 1); gl_PointSize = d; }`;
const FRAGMENT = `precision mediump float; uniform vec3 color;
void main(){ float a = smoothstep(0.5, 0.42, length(gl_PointCoord - 0.5)); gl_FragColor = vec4(color * a, a); }`;

function webGlPainter(el: HTMLCanvasElement, onLost: () => void): Painter | null {
  const gl = el.getContext("webgl", { premultipliedAlpha: true, antialias: true });
  if (gl === null) return null;
  const program = gl.createProgram();
  if (program === null) return null;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, FRAGMENT],
  ] as const) {
    const shader = gl.createShader(type);
    if (shader === null) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const where = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(where);
  gl.vertexAttribPointer(where, 2, gl.FLOAT, false, 0, 0);
  const size = gl.getUniformLocation(program, "size");
  const diameter = gl.getUniformLocation(program, "d");
  const colour = gl.getUniformLocation(program, "color");
  // The phone may take the GPU back (another app, low memory): paint with canvas 2D instead.
  const lost = (event: Event) => {
    event.preventDefault();
    onLost();
  };
  el.addEventListener("webglcontextlost", lost);
  liveWebGlContexts++;
  return {
    paint(pixels, count, { r, ratio, color, space }) {
      gl.viewport(0, 0, el.width, el.height);
      gl.uniform2f(size, space.width, space.height);
      gl.uniform1f(diameter, r * 2 * ratio);
      gl.uniform3f(colour, color[0], color[1], color[2]);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bufferData(gl.ARRAY_BUFFER, pixels, gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.POINTS, 0, count);
    },
    dispose() {
      el.removeEventListener("webglcontextlost", lost);
      liveWebGlContexts--;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
