/**
 * How numbers, quantities and chemical formulas are written: one way everywhere, so a value reads
 * the same in a description, on a label, in the working and in Jugnu's words. Each result has
 * plain text (Unicode: "−3/2", "2√3", "H₂O"), TeX ("-\frac{3}{2}", "2\sqrt{3}", "\mathrm{H_2O}")
 * and says whether it is exact or a rounded decimal.
 *
 * Replaces the many local copies (`numText` in seven prop packages, `niceNumber`, `coordText`,
 * `sqrtText`, `formatValue`, `prettyFormula`); props move to these when their chapters migrate.
 */

export type Written = {
  /** The number itself. */
  value: number;
  /** Plain text with a real minus sign: "−3/2", "2√3", "0.25". */
  text: string;
  /** TeX: "-\frac{3}{2}", "2\sqrt{3}", "0.25". */
  tex: string;
  /** False when it is a rounded decimal, not the exact value. */
  isExact: boolean;
};

export const MINUS = "−";

const EPS = 1e-9;

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y > 0) [x, y] = [y, x % y];
  return x;
}

/** √n as k√m with m square-free: 12 → [2, 3]. */
export function simplifyRoot(n: number): [number, number] {
  let k = 1;
  let m = n;
  for (let f = 2; f * f <= m; f++)
    while (m % (f * f) === 0) {
      k *= f;
      m /= f * f;
    }
  return [k, m];
}

const signed = (negative: boolean, text: string, tex: string) => ({
  text: negative ? `${MINUS}${text}` : text,
  tex: negative ? `-${tex}` : tex,
});

/**
 * A decimal with at most `places` digits, trailing zeros dropped (2.50 → "2.5"); `keep` keeps
 * exactly `places` ("2.50"), for ticks and readings that must line up.
 */
export function decimal(x: number, places = 2, keep = false): Written {
  const rounded = Number(x.toFixed(places));
  const body = keep ? Math.abs(rounded).toFixed(places) : String(Math.abs(rounded));
  const negative = rounded < 0 && Number(body) !== 0;
  return { value: rounded, ...signed(negative, body, body), isExact: Math.abs(rounded - x) < EPS };
}

/** An integer or a fraction with a small denominator (up to `maxDen`), or undefined. */
export function fraction(x: number, maxDen = 12): Written | undefined {
  if (Math.abs(x - Math.round(x)) < EPS) {
    const n = Math.round(x);
    return { value: n, ...signed(n < 0, String(Math.abs(n)), String(Math.abs(n))), isExact: true };
  }
  for (let d = 2; d <= maxDen; d++) {
    const n = Math.round(x * d);
    if (Math.abs(n / d - x) < EPS) {
      const a = Math.abs(n);
      return { value: n / d, ...signed(n < 0, `${a}/${d}`, `\\frac{${a}}{${d}}`), isExact: true };
    }
  }
  return undefined;
}

/** ±(k√m)/d, the form lengths and roots take (√8 = 2√2, √15.25 = √61/2), or undefined. */
export function surd(x: number, maxDen = 12): Written | undefined {
  const sq = x * x;
  for (let d = 1; d <= maxDen; d++) {
    const n = Math.round(sq * d * d);
    if (n <= 0 || Math.abs(n / (d * d) - sq) > 1e-7 * Math.max(1, sq)) continue;
    const root = Math.sqrt(n);
    if (Math.abs(root - Math.round(root)) < EPS) continue; // rational: not a surd
    const [rootK, inside] = simplifyRoot(n);
    const common = gcd(rootK, d);
    const k = rootK / common;
    const den = d / common;
    const surdText = `${k === 1 ? "" : k}√${inside}`;
    const surdTex = `${k === 1 ? "" : k}\\sqrt{${inside}}`;
    const text = den === 1 ? surdText : `${surdText}/${den}`;
    const tex = den === 1 ? surdTex : `\\frac{${surdTex}}{${den}}`;
    return { value: x, ...signed(x < 0, text, tex), isExact: true };
  }
  return undefined;
}

/**
 * The textbook's way to write a number: an integer or a simple fraction exactly, a surd exactly,
 * anything else as a decimal (`places`, default 2) marked not exact.
 */
export function exact(x: number, places = 2): Written {
  return fraction(x) ?? surd(x) ?? decimal(x, places);
}

/** A quantity with its unit: "58√3 m", "2.5 cm²"; TeX keeps the unit upright. */
export function quantity(w: Written, unit: string): Written {
  if (unit === "") return w;
  const texUnit = unit.replace(/²/g, "^2").replace(/³/g, "^3").replace(/°/g, "^\\circ");
  const isDegree = unit === "°";
  return {
    ...w,
    text: isDegree ? `${w.text}°` : `${w.text} ${unit}`,
    tex: isDegree ? `${w.tex}^\\circ` : `${w.tex}\\,\\mathrm{${texUnit}}`,
  };
}

const SUB = "₀₁₂₃₄₅₆₇₈₉";
const SUP: Record<string, string> = {
  "+": "⁺",
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

/**
 * A chemical formula as written: "H2SO4" → H₂SO₄; a charge after "^" is a superscript
 * ("SO4^2-" → SO₄²⁻); a state in brackets stays as it is ("(aq)"). TeX uses upright letters.
 */
export function formula(source: string): { text: string; tex: string } {
  const [body = "", charge = ""] = source.split("^");
  const text = `${body.replace(/(?<=[A-Za-z)\]])\d+/g, (d) => [...d].map((c) => SUB[Number(c)]).join(""))}${[...charge].map((c) => SUP[c] ?? c).join("")}`;
  const texBody = body.replace(/(?<=[A-Za-z)\]])(\d+)/g, "_{$1}");
  const tex = `\\mathrm{${texBody}}${charge === "" ? "" : `^{${charge}}`}`;
  return { text, tex };
}
