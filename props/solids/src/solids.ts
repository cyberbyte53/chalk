/**
 * The maths of the chapter: the basic solids' surface areas and volumes (Class IX), the frustum of a
 * cone (13.5), and the value of π a question asks for. Pure functions; the props and their tests use
 * them.
 */

/** Words a prop shows itself, in both languages. */
export type Words = { readonly en: string; readonly hi: string };
export const say = (locale: string, w: Words): string => (locale === "hi" ? w.hi : w.en);

/** The value of π a question uses: 22/7, 3.14, or kept as π (an answer "in terms of π"). */
export const Pi = { Sevenths: "22/7", Hundredths: "3.14", Symbol: "pi" } as const;
export type Pi = (typeof Pi)[keyof typeof Pi];

export function piValue(pi: Pi): number {
  return pi === Pi.Sevenths ? 22 / 7 : pi === Pi.Hundredths ? 3.14 : Math.PI;
}

/** π as TeX the way the question writes it. */
export function piTex(pi: Pi): string {
  return pi === Pi.Sevenths ? "\\frac{22}{7}" : pi === Pi.Hundredths ? "3.14" : "\\pi";
}

/** Rounds away floating dust: 0.30000000000000004 → 0.3, −0 → 0. */
export function clean(x: number): number {
  const r = Math.round(x * 1e9) / 1e9;
  return Object.is(r, -0) ? 0 : r;
}

/** A number for reading: at most `places` decimals, no trailing zeros, Indian grouping above 9999. */
export function numText(x: number, places = 2): string {
  const f = 10 ** places;
  const r = clean(Math.round(x * f) / f);
  const [whole, frac] = Math.abs(r).toString().split(".");
  const w = whole ?? "0";
  // Indian grouping: 12,34,567
  const grouped =
    w.length <= 4 ? w : `${w.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${w.slice(-3)}`;
  return `${r < 0 ? "−" : ""}${grouped}${frac === undefined ? "" : `.${frac}`}`;
}

/** A length, area or volume with its unit: "12 cm", "39.6 cm²", "48,510 cm³". */
export function withUnit(x: number, unit: string, power: 1 | 2 | 3 = 1, places = 2): string {
  const sup = power === 2 ? "²" : power === 3 ? "³" : "";
  return unit === "" ? numText(x, places) : `${numText(x, places)} ${unit}${sup}`;
}

/** The seven solids of the chapter. */
export const Solid = {
  Cuboid: "cuboid",
  Cube: "cube",
  Cylinder: "cylinder",
  Cone: "cone",
  Sphere: "sphere",
  Hemisphere: "hemisphere",
  Frustum: "frustum",
} as const;
export type Solid = (typeof Solid)[keyof typeof Solid];

/**
 * A solid's measurements. Which fields count depends on the solid: a cuboid uses l, b, h; a cube
 * uses a; a cylinder and a cone use r, h; a sphere and a hemisphere use r; a frustum uses r1, r2, h.
 */
export type Dims = {
  l: number;
  b: number;
  h: number;
  a: number;
  r: number;
  r1: number;
  r2: number;
};

/** The slant height of a cone: l = √(r² + h²). */
export const slantOfCone = (r: number, h: number): number => Math.sqrt(r * r + h * h);

/** The slant height of a frustum: l = √(h² + (r₁ − r₂)²). */
export const slantOfFrustum = (r1: number, r2: number, h: number): number =>
  Math.sqrt(h * h + (r1 - r2) ** 2);

/** The three numbers the chapter asks for: curved (or lateral) area, total area, volume. */
export type Measures = { curved: number; total: number; volume: number; slant: number | null };

/** A solid's curved surface area (lateral for a cuboid or cube), total surface area and volume. */
export function measuresOf(solid: Solid, d: Dims, pi: number): Measures {
  switch (solid) {
    case Solid.Cuboid:
      return {
        curved: 2 * d.h * (d.l + d.b),
        total: 2 * (d.l * d.b + d.b * d.h + d.h * d.l),
        volume: d.l * d.b * d.h,
        slant: null,
      };
    case Solid.Cube:
      return { curved: 4 * d.a * d.a, total: 6 * d.a * d.a, volume: d.a ** 3, slant: null };
    case Solid.Cylinder:
      return {
        curved: 2 * pi * d.r * d.h,
        total: 2 * pi * d.r * (d.r + d.h),
        volume: pi * d.r * d.r * d.h,
        slant: null,
      };
    case Solid.Cone: {
      const l = slantOfCone(d.r, d.h);
      return {
        curved: pi * d.r * l,
        total: pi * d.r * (l + d.r),
        volume: (pi * d.r * d.r * d.h) / 3,
        slant: l,
      };
    }
    case Solid.Sphere:
      return {
        curved: 4 * pi * d.r * d.r,
        total: 4 * pi * d.r * d.r,
        volume: (4 / 3) * pi * d.r ** 3,
        slant: null,
      };
    case Solid.Hemisphere:
      return {
        curved: 2 * pi * d.r * d.r,
        total: 3 * pi * d.r * d.r,
        volume: (2 / 3) * pi * d.r ** 3,
        slant: null,
      };
    case Solid.Frustum: {
      const l = slantOfFrustum(d.r1, d.r2, d.h);
      return {
        curved: pi * (d.r1 + d.r2) * l,
        total: pi * (d.r1 + d.r2) * l + pi * (d.r1 * d.r1 + d.r2 * d.r2),
        volume: (pi * d.h * (d.r1 * d.r1 + d.r2 * d.r2 + d.r1 * d.r2)) / 3,
        slant: l,
      };
    }
  }
}

/** The formulas as TeX, in NCERT's letters. */
export function formulasOf(solid: Solid): { curved: string; total: string; volume: string } {
  switch (solid) {
    case Solid.Cuboid:
      return { curved: "2h(l + b)", total: "2(lb + bh + hl)", volume: "lbh" };
    case Solid.Cube:
      return { curved: "4a^2", total: "6a^2", volume: "a^3" };
    case Solid.Cylinder:
      return { curved: "2\\pi rh", total: "2\\pi r(r + h)", volume: "\\pi r^2 h" };
    case Solid.Cone:
      return { curved: "\\pi rl", total: "\\pi r(l + r)", volume: "\\tfrac{1}{3}\\pi r^2 h" };
    case Solid.Sphere:
      return { curved: "4\\pi r^2", total: "4\\pi r^2", volume: "\\tfrac{4}{3}\\pi r^3" };
    case Solid.Hemisphere:
      return { curved: "2\\pi r^2", total: "3\\pi r^2", volume: "\\tfrac{2}{3}\\pi r^3" };
    case Solid.Frustum:
      return {
        curved: "\\pi(r_1 + r_2)l",
        total: "\\pi(r_1 + r_2)l + \\pi r_1^2 + \\pi r_2^2",
        volume: "\\tfrac{1}{3}\\pi h(r_1^2 + r_2^2 + r_1 r_2)",
      };
  }
}

/**
 * The frustum seen as a big cone minus a small one (Example 12): the small cone's height from
 * similar triangles, h₂ = h·r₂/(r₁ − r₂), and the big cone's, h₁ = h + h₂.
 */
export function conesOfFrustum(r1: number, r2: number, h: number): { h1: number; h2: number } {
  const h2 = (h * r2) / (r1 - r2);
  return { h1: h + h2, h2 };
}

/** A number for TeX: like numText, with the thousands comma braced. */
export function numTex(x: number, places = 2): string {
  return numText(x, places).replace(/,/g, "{,}").replace("−", "-");
}

/** "=" when the value is exact to `places` decimals, "≈" when it was rounded. */
export function eqTex(x: number, places = 2): string {
  const f = 10 ** places;
  return Math.abs(Math.round(x * f) / f - x) < 1e-7 ? "=" : "\\approx";
}

/** A unit in TeX with its power: \text{ cm}^2. */
export function unitTex(unit: string, power: 1 | 2 | 3): string {
  if (unit === "") return "";
  return `\\ \\text{${unit}}${power === 1 ? "" : `^${power}`}`;
}

/** An answer: the number (or k·π when π is kept as π) with its unit. */
export function answerTex(value: number, pi: Pi, unit: string, power: 1 | 2 | 3): string {
  if (pi === Pi.Symbol) {
    const k = value / Math.PI;
    const times = Math.abs(k - 1) < 1e-9 ? "" : numTex(k);
    return `${eqTex(k)} ${times}\\pi${unitTex(unit, power)}`;
  }
  return `${eqTex(value)} ${numTex(value)}${unitTex(unit, power)}`;
}

/** Which measure a worked line is for. */
export type MeasureKey = "curved" | "total" | "volume";

/**
 * The worked line for a solid's measure: the formula, the numbers put in, and the answer, e.g.
 * "2\pi rh = 2 \times \frac{22}{7} \times 3.5 \times 10 = 220 cm²". Cones and frusta get the slant
 * height first, as its own line.
 */
export function workTex(
  solid: Solid,
  d: Dims,
  pi: Pi,
  unit: string,
  measure: MeasureKey,
): string[] {
  const m = measuresOf(solid, d, piValue(pi));
  const P = piTex(pi);
  const v = (x: number) => numTex(x);
  const sq = (x: number) => `${v(x)}^2`;
  const power = measure === "volume" ? 3 : 2;
  const value = m[measure];
  const ans = answerTex(value, pi, unit, power);
  const f = formulasOf(solid)[measure];
  const lines: string[] = [];
  if (m.slant !== null && measure !== "volume") {
    lines.push(
      solid === Solid.Cone
        ? `l = \\sqrt{r^2 + h^2} = \\sqrt{${sq(d.r)} + ${sq(d.h)}} ${eqTex(m.slant)} ${v(m.slant)}${unitTex(unit, 1)}`
        : `l = \\sqrt{h^2 + (r_1 - r_2)^2} = \\sqrt{${sq(d.h)} + ${sq(d.r1 - d.r2)}} ${eqTex(m.slant)} ${v(m.slant)}${unitTex(unit, 1)}`,
    );
  }
  const l = m.slant === null ? "" : v(m.slant);
  const put: Record<Solid, Record<MeasureKey, string>> = {
    [Solid.Cuboid]: {
      curved: `2 \\times ${v(d.h)} \\times (${v(d.l)} + ${v(d.b)})`,
      total: `2(${v(d.l)} \\times ${v(d.b)} + ${v(d.b)} \\times ${v(d.h)} + ${v(d.h)} \\times ${v(d.l)})`,
      volume: `${v(d.l)} \\times ${v(d.b)} \\times ${v(d.h)}`,
    },
    [Solid.Cube]: {
      curved: `4 \\times ${sq(d.a)}`,
      total: `6 \\times ${sq(d.a)}`,
      volume: `${v(d.a)}^3`,
    },
    [Solid.Cylinder]: {
      curved: `2 \\times ${P} \\times ${v(d.r)} \\times ${v(d.h)}`,
      total: `2 \\times ${P} \\times ${v(d.r)} \\times (${v(d.r)} + ${v(d.h)})`,
      volume: `${P} \\times ${sq(d.r)} \\times ${v(d.h)}`,
    },
    [Solid.Cone]: {
      curved: `${P} \\times ${v(d.r)} \\times ${l}`,
      total: `${P} \\times ${v(d.r)} \\times (${l} + ${v(d.r)})`,
      volume: `\\tfrac{1}{3} \\times ${P} \\times ${sq(d.r)} \\times ${v(d.h)}`,
    },
    [Solid.Sphere]: {
      curved: `4 \\times ${P} \\times ${sq(d.r)}`,
      total: `4 \\times ${P} \\times ${sq(d.r)}`,
      volume: `\\tfrac{4}{3} \\times ${P} \\times ${v(d.r)}^3`,
    },
    [Solid.Hemisphere]: {
      curved: `2 \\times ${P} \\times ${sq(d.r)}`,
      total: `3 \\times ${P} \\times ${sq(d.r)}`,
      volume: `\\tfrac{2}{3} \\times ${P} \\times ${v(d.r)}^3`,
    },
    [Solid.Frustum]: {
      curved: `${P} \\times (${v(d.r1)} + ${v(d.r2)}) \\times ${l}`,
      total: `${P} \\times (${v(d.r1)} + ${v(d.r2)}) \\times ${l} + ${P} \\times ${sq(d.r1)} + ${P} \\times ${sq(d.r2)}`,
      volume: `\\tfrac{1}{3} \\times ${P} \\times ${v(d.h)} \\times (${sq(d.r1)} + ${sq(d.r2)} + ${v(d.r1)} \\times ${v(d.r2)})`,
    },
  };
  lines.push(`${f} = ${put[solid][measure]}`);
  lines.push(ans);
  return lines;
}

/**
 * Worked lines as one aligned display, each "a = b = c" broken into rows at its = and ≈ signs (and
 * "⇒" starting a new left side), so long working stays narrow on a phone.
 */
export function alignedTex(lines: readonly string[]): string {
  const rows: string[] = [];
  for (const line of lines) {
    const parts = ` ${line} `.split(/ (=|\\approx|\\Rightarrow) /);
    let lhs = (parts[0] ?? "").trim();
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i] ?? "=";
      const rhs = (parts[i + 1] ?? "").trim();
      if (op === "\\Rightarrow") {
        lhs = `\\Rightarrow ${rhs}`;
        continue;
      }
      rows.push(`${lhs} &${op} ${rhs}`);
      lhs = "";
    }
    if (lhs !== "") rows.push(`${lhs} &`);
  }
  return `$$\\begin{aligned} ${rows.join(" \\\\ ")} \\end{aligned}$$`;
}
