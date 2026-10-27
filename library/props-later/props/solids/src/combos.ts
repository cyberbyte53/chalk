import { Look } from "./draw";
import { Pi, type Words, piValue, slantOfCone } from "./solids";

/**
 * The combinations of solids in the chapter (13.2, 13.3), each from NCERT: the parts stacked on one
 * vertical axis (a cone on a hemisphere, a cylinder with hemispherical ends, …), what is cut out
 * of them, and the surface areas or volumes the question asks for, as the sum (and differences) of
 * the parts' own formulas. Values are worked out from the measurements, not typed in.
 */

export const ComboKind = {
  /** Example 1: a lattu, a cone on a hemisphere. */
  Lattu: "lattu",
  /** Example 2: a cube with a hemisphere on top. */
  Block: "block",
  /** Example 3: a toy rocket, a cone on a thinner cylinder. */
  Rocket: "rocket",
  /** Example 4: a bird-bath, a cylinder with a hemispherical hollow on top. */
  BirdBath: "birdBath",
  /** Exercise 13.1 Q1: two cubes end to end. */
  TwoCubes: "twoCubes",
  /** Exercise 13.1 Q2: a vessel, a hollow hemisphere with a hollow cylinder on it. */
  Vessel: "vessel",
  /** Exercise 13.1 Q3: a toy, a cone on a hemisphere. */
  Toy: "toy",
  /** Exercise 13.1 Q4: a cube with a hemisphere on top. */
  CubeDome: "cubeDome",
  /** Exercise 13.1 Q6: a capsule, a cylinder with hemispherical ends. */
  Capsule: "capsule",
  /** Exercise 13.1 Q7: a tent, a cone on a cylinder. */
  Tent: "tent",
  /** Exercise 13.1 Q8: a cylinder with a cone hollowed out of it. */
  ConeHollow: "coneHollow",
  /** Exercise 13.1 Q9: a cylinder with a hemisphere scooped out of each end. */
  Scooped: "scooped",
  /** Example 6: a juice glass with a raised hemispherical bottom. */
  Glass: "glass",
  /** Example 7: a toy (cone on a hemisphere) inside the cylinder round it. */
  ToyInCylinder: "toyInCylinder",
  /** Exercise 13.2 Q1: a cone on a hemisphere, r = h = 1 cm, in terms of π. */
  ConeOnDome: "coneOnDome",
  /** Exercise 13.2 Q2: Rachel's model, a cylinder with a cone at each end. */
  Model: "model",
  /** Exercise 13.2 Q3: a gulab jamun, a cylinder with hemispherical ends. */
  GulabJamun: "gulabJamun",
  /** Exercise 13.2 Q7: a cone on a hemisphere stood in a cylinder of water. */
  InTank: "inTank",
  /** Exercise 13.2 Q8: a round glass flask with a cylindrical neck. */
  Flask: "flask",
} as const;
export type ComboKind = (typeof ComboKind)[keyof typeof ComboKind];

/** One part on the axis. Heights are where its span starts (y0) and ends (y1). */
export type ComboPart =
  | {
      shape: "cylinder";
      y0: number;
      y1: number;
      r: number;
      look: Look;
      tone: number;
      hasTop?: boolean;
    }
  | {
      shape: "cone";
      yBase: number;
      yApex: number;
      r: number;
      look: Look;
      tone: number;
      hasBase?: boolean;
    }
  | {
      shape: "dome";
      yFlat: number;
      r: number;
      isUp: boolean;
      look: Look;
      tone: number;
      hasFace?: boolean;
    }
  | { shape: "sphere"; yc: number; r: number; look: Look; tone: number }
  | {
      shape: "box";
      y0: number;
      y1: number;
      side: number;
      look: Look;
      tone: number;
      hasTop?: boolean;
    };

/** A measurement drawn on the picture. */
export type ComboMark =
  | { kind: "radius"; y: number; r: number; text: string; isBelow?: boolean }
  | { kind: "height"; y0: number; y1: number; x: number; text: string; side?: "left" | "right" }
  | { kind: "axis"; y0: number; y1: number; text: string }
  | { kind: "slant"; yLow: number; rLow: number; yHigh: number; rHigh: number; text: string };

/** One term of a sum: a part's own area or volume, added or taken away. */
export type Term = { label: Words; tex: string; value: number; sign: 1 | -1 };

/** A named total (most questions have one; the rocket has two colours, the glass two capacities). */
export type Group = { label: Words; terms: Term[]; unit: string; power: 2 | 3 };

export type Combo = {
  kind: ComboKind;
  name: Words;
  pi: Pi;
  parts: ComboPart[];
  marks: ComboMark[];
  /** Where two parts meet: the joined faces there are hidden (not painted, not counted). */
  joins: { y: number; r: number }[];
  surface: Group[] | null;
  volume: Group[] | null;
};

const S = Look.Solid;
const C = Look.Cut;
const G = Look.Ghost;

const w = (en: string, hi: string): Words => ({ en, hi });

const LABEL = {
  csaCone: w("curved surface of the cone", "शंकु का वक्र पृष्ठ"),
  csaCyl: w("curved surface of the cylinder", "बेलन का वक्र पृष्ठ"),
  csaHemi: w("curved surface of the hemisphere", "अर्धगोले का वक्र पृष्ठ"),
  csaHemis: w("curved surfaces of the two hemispheres", "दोनों अर्धगोलों के वक्र पृष्ठ"),
  tsaCube: w("total surface of the cube", "घन का कुल पृष्ठ"),
  tsaCubes: w("total surfaces of the two cubes", "दोनों घनों के कुल पृष्ठ"),
  joinedFaces: w("the two faces that touch", "आपस में सटे दोनों फलक"),
  baseHemi: w("the circle the hemisphere covers", "अर्धगोले से ढका वृत्त"),
  baseCone: w("base of the cone", "शंकु का आधार"),
  baseCyl: w("base of the cylinder", "बेलन का आधार"),
  baseCylHidden: w("the circle the cylinder covers", "बेलन से ढका वृत्त"),
  oneBase: w("one end of the cylinder", "बेलन का एक सिरा"),
  bottom: w("the bottom of the cylinder", "बेलन का तल"),
  volCyl: w("volume of the cylinder", "बेलन का आयतन"),
  volCone: w("volume of the cone", "शंकु का आयतन"),
  volCones: w("volumes of the two cones", "दोनों शंकुओं के आयतन"),
  volHemi: w("volume of the hemisphere", "अर्धगोले का आयतन"),
  volHemis: w("two hemispheres (one sphere)", "दो अर्धगोले (एक गोला)"),
  volSphere: w("volume of the sphere", "गोले का आयतन"),
  volToy: w("volume of the toy", "खिलौने का आयतन"),
  volSolid: w("volume of the solid", "ठोस का आयतन"),
};

function cm(pi: Pi) {
  return piValue(pi);
}

/** Every combination, its parts and its sums. */
export function comboOf(kind: ComboKind): Combo {
  switch (kind) {
    case ComboKind.Lattu: {
      const pi = Pi.Sevenths;
      const p = cm(pi);
      const r = 1.75;
      const h = 5 - r;
      const l = slantOfCone(r, h);
      return {
        kind,
        name: w("Rasheed's lattu", "रशीद का लट्टू"),
        pi,
        parts: [
          { shape: "dome", yFlat: r, r, isUp: false, look: S, tone: 2, hasFace: false },
          { shape: "cone", yBase: r, yApex: 5, r, look: S, tone: 1 },
        ],
        marks: [
          { kind: "height", y0: 0, y1: 5, x: r * 1.25, text: "5 cm" },
          { kind: "radius", y: r, r, text: "r = 1.75" },
          { kind: "axis", y0: r, y1: 5, text: "3.25" },
        ],
        joins: [{ y: r, r }],
        surface: [
          {
            label: w("area to colour", "रंगने का क्षेत्रफल"),
            unit: "cm",
            power: 2,
            terms: [
              { label: LABEL.csaHemi, tex: "2\\pi r^2", value: 2 * p * r * r, sign: 1 },
              { label: LABEL.csaCone, tex: "\\pi r l", value: p * r * l, sign: 1 },
            ],
          },
        ],
        volume: null,
      };
    }
    case ComboKind.Block: {
      const pi = Pi.Sevenths;
      const p = cm(pi);
      const r = 2.1;
      return {
        kind,
        name: w("decorative block", "सजावटी ब्लॉक"),
        pi,
        parts: [
          { shape: "box", y0: 0, y1: 5, side: 5, look: S, tone: 3 },
          { shape: "dome", yFlat: 5, r, isUp: true, look: S, tone: 2 },
        ],
        marks: [
          { kind: "height", y0: 0, y1: 5, x: 3.9, text: "5 cm" },
          { kind: "radius", y: 5, r, text: "r = 2.1", isBelow: true },
        ],
        joins: [{ y: 5, r }],
        surface: [
          {
            label: w("total surface of the block", "ब्लॉक का कुल पृष्ठ"),
            unit: "cm",
            power: 2,
            terms: [
              { label: LABEL.tsaCube, tex: "6a^2", value: 150, sign: 1 },
              { label: LABEL.baseHemi, tex: "\\pi r^2", value: p * r * r, sign: -1 },
              { label: LABEL.csaHemi, tex: "2\\pi r^2", value: 2 * p * r * r, sign: 1 },
            ],
          },
        ],
        volume: null,
      };
    }
    case ComboKind.Rocket: {
      const pi = Pi.Hundredths;
      const p = cm(pi);
      const r = 2.5;
      const rc = 1.5;
      const l = slantOfCone(r, 6);
      return {
        kind,
        name: w("toy rocket", "खिलौना रॉकेट"),
        pi,
        parts: [
          { shape: "cylinder", y0: 0, y1: 20, r: rc, look: S, tone: 4 },
          { shape: "cone", yBase: 20, yApex: 26, r, look: S, tone: 1 },
        ],
        marks: [
          { kind: "height", y0: 0, y1: 20, x: r * 1.15, text: "h′ = 20" },
          { kind: "radius", y: 0, r: rc, text: "r′ = 1.5", isBelow: true },
          { kind: "axis", y0: 20, y1: 26, text: "6" },
          { kind: "radius", y: 20, r, text: "r = 2.5", isBelow: true },
        ],
        joins: [{ y: 20, r: rc }],
        surface: [
          {
            label: w("painted orange (the cone)", "नारंगी रंग (शंकु)"),
            unit: "cm",
            power: 2,
            terms: [
              { label: LABEL.csaCone, tex: "\\pi r l", value: p * r * l, sign: 1 },
              { label: LABEL.baseCone, tex: "\\pi r^2", value: p * r * r, sign: 1 },
              { label: LABEL.baseCylHidden, tex: "\\pi r'^2", value: p * rc * rc, sign: -1 },
            ],
          },
          {
            label: w("painted yellow (the cylinder)", "पीला रंग (बेलन)"),
            unit: "cm",
            power: 2,
            terms: [
              { label: LABEL.csaCyl, tex: "2\\pi r'h'", value: 2 * p * rc * 20, sign: 1 },
              { label: LABEL.oneBase, tex: "\\pi r'^2", value: p * rc * rc, sign: 1 },
            ],
          },
        ],
        volume: null,
      };
    }
    case ComboKind.BirdBath: {
      const pi = Pi.Sevenths;
      const p = cm(pi);
      const r = 30;
      const h = 145;
      return {
        kind,
        name: w("Mayank's bird-bath", "मयंक का पक्षी-स्नानपात्र"),
        pi,
        parts: [
          { shape: "cylinder", y0: 0, y1: h, r, look: S, tone: 3, hasTop: false },
          { shape: "dome", yFlat: h, r, isUp: false, look: C, tone: 1, hasFace: false },
        ],
        marks: [
          { kind: "height", y0: 0, y1: h, x: r * 1.15, text: "h = 145 cm" },
          { kind: "radius", y: h, r, text: "r = 30" },
        ],
        joins: [],
        surface: [
          {
            label: w("total surface of the bird-bath", "स्नानपात्र का कुल पृष्ठ"),
            unit: "cm",
            power: 2,
            terms: [
              { label: LABEL.csaCyl, tex: "2\\pi r h", value: 2 * p * r * h, sign: 1 },
              { label: LABEL.csaHemi, tex: "2\\pi r^2", value: 2 * p * r * r, sign: 1 },
            ],
          },
        ],
        volume: null,
      };
    }
    case ComboKind.TwoCubes:
      return {
        kind,
        name: w("two cubes end to end", "दो घन, सिरे से सिरा मिलाकर"),
        pi: Pi.Sevenths,
        parts: [
          { shape: "box", y0: 0, y1: 4, side: 4, look: S, tone: 3 },
          { shape: "box", y0: 4, y1: 8, side: 4, look: S, tone: 2 },
        ],
        marks: [{ kind: "height", y0: 0, y1: 4, x: 3.2, text: "a = 4 cm" }],
        joins: [],
        surface: [
          {
            label: w("surface of the cuboid", "घनाभ का पृष्ठ"),
            unit: "cm",
            power: 2,
            terms: [
              { label: LABEL.tsaCubes, tex: "2 \\times 6a^2", value: 192, sign: 1 },
              { label: LABEL.joinedFaces, tex: "2a^2", value: 32, sign: -1 },
            ],
          },
        ],
        volume: null,
      };
    case ComboKind.Vessel: {
      const pi = Pi.Sevenths;
      const p = cm(pi);
      const r = 7;
      const h = 13 - r;
      return {
        kind,
        name: w("the vessel", "पात्र"),
        pi,
        parts: [
          { shape: "dome", yFlat: r, r, isUp: false, look: S, tone: 2, hasFace: false },
          { shape: "cylinder", y0: r, y1: 13, r, look: S, tone: 4, hasTop: false },
        ],
        marks: [
          { kind: "height", y0: 0, y1: 13, x: r * 1.15, text: "13 cm" },
          { kind: "radius", y: 13, r, text: "r = 7" },
        ],
        joins: [],
        surface: [
          {
            label: w("inner surface of the vessel", "पात्र का भीतरी पृष्ठ"),
            unit: "cm",
            power: 2,
            terms: [
              { label: LABEL.csaHemi, tex: "2\\pi r^2", value: 2 * p * r * r, sign: 1 },
              { label: LABEL.csaCyl, tex: "2\\pi r h", value: 2 * p * r * h, sign: 1 },
            ],
          },
        ],
        volume: null,
      };
    }
    case ComboKind.Toy: {
      const pi = Pi.Sevenths;
      const p = cm(pi);
      const r = 3.5;
      const l = slantOfCone(r, 12);
      return {
        kind,
        name: w("the toy", "खिलौना"),
        pi,
        parts: [
          { shape: "dome", yFlat: r, r, isUp: false, look: S, tone: 2, hasFace: false },
          { shape: "cone", yBase: r, yApex: 15.5, r, look: S, tone: 1 },
        ],
        marks: [
          { kind: "height", y0: 0, y1: 15.5, x: r * 1.25, text: "15.5 cm" },
          { kind: "radius", y: r, r, text: "r = 3.5" },
        ],
        joins: [{ y: r, r }],
        surface: [
          {
            label: w("total surface of the toy", "खिलौने का कुल पृष्ठ"),
            unit: "cm",
            power: 2,
            terms: [
              { label: LABEL.csaHemi, tex: "2\\pi r^2", value: 2 * p * r * r, sign: 1 },
              { label: LABEL.csaCone, tex: "\\pi r l", value: p * r * l, sign: 1 },
            ],
          },
        ],
        volume: null,
      };
    }
    case ComboKind.CubeDome: {
      const pi = Pi.Sevenths;
      const p = cm(pi);
      const r = 3.5;
      return {
        kind,
        name: w("cube with a dome", "गुंबद वाला घन"),
        pi,
        parts: [
          { shape: "box", y0: 0, y1: 7, side: 7, look: S, tone: 3 },
          { shape: "dome", yFlat: 7, r, isUp: true, look: S, tone: 2 },
        ],
        marks: [
          { kind: "height", y0: 0, y1: 7, x: 5.4, text: "7 cm" },
          { kind: "radius", y: 7, r, text: "r = 3.5", isBelow: true },
        ],
        joins: [{ y: 7, r }],
        surface: [
          {
            label: w("surface of the solid", "ठोस का पृष्ठ"),
            unit: "cm",
            power: 2,
            terms: [
              { label: LABEL.tsaCube, tex: "6a^2", value: 294, sign: 1 },
              { label: LABEL.baseHemi, tex: "\\pi r^2", value: p * r * r, sign: -1 },
              { label: LABEL.csaHemi, tex: "2\\pi r^2", value: 2 * p * r * r, sign: 1 },
            ],
          },
        ],
        volume: null,
      };
    }
    case ComboKind.Capsule: {
      const pi = Pi.Sevenths;
      const p = cm(pi);
      const r = 2.5;
      return {
        kind,
        name: w("medicine capsule", "दवा का कैप्सूल"),
        pi,
        parts: [
          { shape: "dome", yFlat: r, r, isUp: false, look: S, tone: 2, hasFace: false },
          { shape: "cylinder", y0: r, y1: 14 - r, r, look: S, tone: 4, hasTop: false },
          { shape: "dome", yFlat: 14 - r, r, isUp: true, look: S, tone: 2 },
        ],
        marks: [
          { kind: "height", y0: 0, y1: 14, x: r * 1.2, text: "14 mm" },
          { kind: "radius", y: 14 - r, r, text: "r = 2.5", isBelow: true },
        ],
        joins: [],
        surface: [
          {
            label: w("surface of the capsule", "कैप्सूल का पृष्ठ"),
            unit: "mm",
            power: 2,
            terms: [
              { label: LABEL.csaHemis, tex: "2 \\times 2\\pi r^2", value: 4 * p * r * r, sign: 1 },
              { label: LABEL.csaCyl, tex: "2\\pi r h", value: 2 * p * r * (14 - 2 * r), sign: 1 },
            ],
          },
        ],
        volume: null,
      };
    }
    case ComboKind.Tent: {
      const pi = Pi.Sevenths;
      const p = cm(pi);
      const r = 2;
      const l = 2.8;
      const hc = Math.sqrt(l * l - r * r);
      return {
        kind,
        name: w("the tent", "तंबू"),
        pi,
        parts: [
          { shape: "cylinder", y0: 0, y1: 2.1, r, look: S, tone: 3, hasTop: false },
          { shape: "cone", yBase: 2.1, yApex: 2.1 + hc, r, look: S, tone: 1 },
        ],
        marks: [
          { kind: "height", y0: 0, y1: 2.1, x: r * 1.15, text: "2.1 m" },
          { kind: "radius", y: 0, r, text: "r = 2", isBelow: true },
          { kind: "slant", yLow: 2.1, rLow: r, yHigh: 2.1 + hc, rHigh: 0, text: "l = 2.8" },
        ],
        joins: [],
        surface: [
          {
            label: w("canvas (no floor)", "कैनवास (फ़र्श नहीं)"),
            unit: "m",
            power: 2,
            terms: [
              { label: LABEL.csaCyl, tex: "2\\pi r h", value: 2 * p * r * 2.1, sign: 1 },
              { label: LABEL.csaCone, tex: "\\pi r l", value: p * r * l, sign: 1 },
            ],
          },
        ],
        volume: null,
      };
    }
    case ComboKind.ConeHollow: {
      const pi = Pi.Sevenths;
      const p = cm(pi);
      const r = 0.7;
      const h = 2.4;
      const l = slantOfCone(r, h);
      return {
        kind,
        name: w("cylinder with a conical hollow", "शंक्वाकार खोखले वाला बेलन"),
        pi,
        parts: [
          { shape: "cylinder", y0: 0, y1: h, r, look: S, tone: 3 },
          { shape: "cone", yBase: 0, yApex: h, r, look: C, tone: 1 },
        ],
        marks: [
          { kind: "height", y0: 0, y1: h, x: r * 1.2, text: "h = 2.4" },
          { kind: "radius", y: h, r, text: "r = 0.7" },
        ],
        joins: [],
        surface: [
          {
            label: w("total surface of what is left", "बचे ठोस का कुल पृष्ठ"),
            unit: "cm",
            power: 2,
            terms: [
              { label: LABEL.csaCyl, tex: "2\\pi r h", value: 2 * p * r * h, sign: 1 },
              {
                label: w("top of the cylinder", "बेलन का ऊपरी सिरा"),
                tex: "\\pi r^2",
                value: p * r * r,
                sign: 1,
              },
              {
                label: w("inside of the hollow cone", "शंक्वाकार खोखले का भीतरी पृष्ठ"),
                tex: "\\pi r l",
                value: p * r * l,
                sign: 1,
              },
            ],
          },
        ],
        volume: null,
      };
    }
    case ComboKind.Scooped: {
      const pi = Pi.Sevenths;
      const p = cm(pi);
      const r = 3.5;
      const h = 10;
      return {
        kind,
        name: w("the wooden article", "लकड़ी की वस्तु"),
        pi,
        parts: [
          { shape: "cylinder", y0: 0, y1: h, r, look: S, tone: 3, hasTop: false },
          { shape: "dome", yFlat: 0, r, isUp: true, look: C, tone: 1 },
          { shape: "dome", yFlat: h, r, isUp: false, look: C, tone: 1, hasFace: false },
        ],
        marks: [
          { kind: "height", y0: 0, y1: h, x: r * 1.15, text: "h = 10 cm" },
          { kind: "radius", y: h, r, text: "r = 3.5" },
        ],
        joins: [],
        surface: [
          {
            label: w("total surface of the article", "वस्तु का कुल पृष्ठ"),
            unit: "cm",
            power: 2,
            terms: [
              { label: LABEL.csaCyl, tex: "2\\pi r h", value: 2 * p * r * h, sign: 1 },
              { label: LABEL.csaHemis, tex: "2 \\times 2\\pi r^2", value: 4 * p * r * r, sign: 1 },
            ],
          },
        ],
        volume: null,
      };
    }
    case ComboKind.Glass: {
      const pi = Pi.Hundredths;
      const p = cm(pi);
      const r = 2.5;
      const h = 10;
      const apparent = p * r * r * h;
      const raised = (2 / 3) * p * r ** 3;
      return {
        kind,
        name: w("the juice glass", "जूस का गिलास"),
        pi,
        parts: [
          { shape: "cylinder", y0: 0, y1: h, r, look: G, tone: 4, hasTop: false },
          { shape: "dome", yFlat: 0, r, isUp: true, look: S, tone: 2 },
        ],
        marks: [
          { kind: "height", y0: 0, y1: h, x: r * 1.15, text: "h = 10 cm" },
          { kind: "radius", y: h, r, text: "r = 2.5" },
        ],
        joins: [],
        surface: null,
        volume: [
          {
            label: w("apparent capacity", "दिखने वाली धारिता"),
            unit: "cm",
            power: 3,
            terms: [{ label: LABEL.volCyl, tex: "\\pi r^2 h", value: apparent, sign: 1 }],
          },
          {
            label: w("actual capacity", "वास्तविक धारिता"),
            unit: "cm",
            power: 3,
            terms: [
              { label: LABEL.volCyl, tex: "\\pi r^2 h", value: apparent, sign: 1 },
              { label: LABEL.volHemi, tex: "\\tfrac{2}{3}\\pi r^3", value: raised, sign: -1 },
            ],
          },
        ],
      };
    }
    case ComboKind.ToyInCylinder: {
      const pi = Pi.Hundredths;
      const p = cm(pi);
      const r = 2;
      const toy = (2 / 3) * p * r ** 3 + (1 / 3) * p * r * r * 2;
      return {
        kind,
        name: w("toy inside a cylinder", "बेलन के भीतर खिलौना"),
        pi,
        parts: [
          { shape: "dome", yFlat: r, r, isUp: false, look: S, tone: 2, hasFace: false },
          { shape: "cone", yBase: r, yApex: 4, r, look: S, tone: 1 },
          { shape: "cylinder", y0: 0, y1: 4, r, look: G, tone: 4 },
        ],
        marks: [
          { kind: "radius", y: r, r, text: "r = 2" },
          { kind: "axis", y0: r, y1: 4, text: "h = 2" },
        ],
        joins: [{ y: r, r }],
        surface: null,
        volume: [
          {
            label: LABEL.volToy,
            unit: "cm",
            power: 3,
            terms: [
              {
                label: LABEL.volHemi,
                tex: "\\tfrac{2}{3}\\pi r^3",
                value: (2 / 3) * p * r ** 3,
                sign: 1,
              },
              {
                label: LABEL.volCone,
                tex: "\\tfrac{1}{3}\\pi r^2 h",
                value: (1 / 3) * p * r * r * 2,
                sign: 1,
              },
            ],
          },
          {
            label: w("cylinder minus toy", "बेलन घटा खिलौना"),
            unit: "cm",
            power: 3,
            terms: [
              { label: LABEL.volCyl, tex: "\\pi r^2 \\times 4", value: p * r * r * 4, sign: 1 },
              { label: LABEL.volToy, tex: "", value: toy, sign: -1 },
            ],
          },
        ],
      };
    }
    case ComboKind.ConeOnDome:
      return {
        kind,
        name: w("cone on a hemisphere", "अर्धगोले पर शंकु"),
        pi: Pi.Symbol,
        parts: [
          { shape: "dome", yFlat: 1, r: 1, isUp: false, look: S, tone: 2, hasFace: false },
          { shape: "cone", yBase: 1, yApex: 2, r: 1, look: S, tone: 1 },
        ],
        marks: [
          { kind: "radius", y: 1, r: 1, text: "r = 1" },
          { kind: "axis", y0: 1, y1: 2, text: "h = 1" },
        ],
        joins: [{ y: 1, r: 1 }],
        surface: null,
        volume: [
          {
            label: LABEL.volSolid,
            unit: "cm",
            power: 3,
            terms: [
              {
                label: LABEL.volHemi,
                tex: "\\tfrac{2}{3}\\pi r^3",
                value: (2 / 3) * Math.PI,
                sign: 1,
              },
              {
                label: LABEL.volCone,
                tex: "\\tfrac{1}{3}\\pi r^2 h",
                value: (1 / 3) * Math.PI,
                sign: 1,
              },
            ],
          },
        ],
      };
    case ComboKind.Model: {
      const pi = Pi.Sevenths;
      const p = cm(pi);
      const r = 1.5;
      return {
        kind,
        name: w("Rachel's model", "रेचल का मॉडल"),
        pi,
        parts: [
          { shape: "cone", yBase: 2, yApex: 0, r, look: S, tone: 1, hasBase: false },
          { shape: "cylinder", y0: 2, y1: 10, r, look: S, tone: 4, hasTop: false },
          { shape: "cone", yBase: 10, yApex: 12, r, look: S, tone: 1 },
        ],
        marks: [
          { kind: "height", y0: 0, y1: 12, x: r * 1.25, text: "12 cm" },
          { kind: "radius", y: 10, r, text: "r = 1.5", isBelow: true },
          { kind: "axis", y0: 10, y1: 12, text: "2" },
        ],
        joins: [],
        surface: null,
        volume: [
          {
            label: w("air inside", "भीतर की हवा"),
            unit: "cm",
            power: 3,
            terms: [
              { label: LABEL.volCyl, tex: "\\pi r^2 h", value: p * r * r * 8, sign: 1 },
              {
                label: LABEL.volCones,
                tex: "2 \\times \\tfrac{1}{3}\\pi r^2 h",
                value: (2 / 3) * p * r * r * 2,
                sign: 1,
              },
            ],
          },
        ],
      };
    }
    case ComboKind.GulabJamun: {
      const pi = Pi.Sevenths;
      const p = cm(pi);
      const r = 1.4;
      const h = 5 - 2 * r;
      const one = p * r * r * h + (4 / 3) * p * r ** 3;
      return {
        kind,
        name: w("a gulab jamun", "एक गुलाब जामुन"),
        pi,
        parts: [
          { shape: "dome", yFlat: r, r, isUp: false, look: S, tone: 2, hasFace: false },
          { shape: "cylinder", y0: r, y1: r + h, r, look: S, tone: 2, hasTop: false },
          { shape: "dome", yFlat: r + h, r, isUp: true, look: S, tone: 2 },
        ],
        marks: [
          { kind: "height", y0: 0, y1: 5, x: r * 1.2, text: "5 cm" },
          { kind: "radius", y: r + h, r, text: "r = 1.4", isBelow: true },
        ],
        joins: [],
        surface: null,
        volume: [
          {
            label: w("one gulab jamun", "एक गुलाब जामुन"),
            unit: "cm",
            power: 3,
            terms: [
              { label: LABEL.volCyl, tex: "\\pi r^2 h", value: p * r * r * h, sign: 1 },
              {
                label: LABEL.volHemis,
                tex: "\\tfrac{4}{3}\\pi r^3",
                value: (4 / 3) * p * r ** 3,
                sign: 1,
              },
            ],
          },
          {
            label: w("syrup in 45 (30% of each)", "45 में चाशनी (हर एक का 30%)"),
            unit: "cm",
            power: 3,
            terms: [
              {
                label: w("45 × 30% of one", "एक का 45 × 30%"),
                tex: "45 \\times 0.3 \\times V",
                value: 45 * 0.3 * one,
                sign: 1,
              },
            ],
          },
        ],
      };
    }
    case ComboKind.InTank: {
      const pi = Pi.Sevenths;
      const p = cm(pi);
      const r = 60;
      return {
        kind,
        name: w("solid in a cylinder of water", "पानी भरे बेलन में ठोस"),
        pi,
        parts: [
          { shape: "dome", yFlat: r, r, isUp: false, look: S, tone: 2, hasFace: false },
          { shape: "cone", yBase: r, yApex: 180, r, look: S, tone: 1 },
          { shape: "cylinder", y0: 0, y1: 180, r, look: G, tone: 4 },
        ],
        marks: [
          { kind: "height", y0: 0, y1: 180, x: r * 1.15, text: "180 cm" },
          { kind: "radius", y: r, r, text: "r = 60" },
          { kind: "axis", y0: r, y1: 180, text: "120" },
        ],
        joins: [{ y: r, r }],
        surface: null,
        volume: [
          {
            label: w("water left", "बचा पानी"),
            unit: "cm",
            power: 3,
            terms: [
              { label: LABEL.volCyl, tex: "\\pi r^2 h", value: p * r * r * 180, sign: 1 },
              {
                label: LABEL.volHemi,
                tex: "\\tfrac{2}{3}\\pi r^3",
                value: (2 / 3) * p * r ** 3,
                sign: -1,
              },
              {
                label: LABEL.volCone,
                tex: "\\tfrac{1}{3}\\pi r^2 h",
                value: (1 / 3) * p * r * r * 120,
                sign: -1,
              },
            ],
          },
        ],
      };
    }
    case ComboKind.Flask: {
      const pi = Pi.Hundredths;
      const p = cm(pi);
      const R = 4.25;
      return {
        kind,
        name: w("the glass flask", "काँच का फ़्लास्क"),
        pi,
        parts: [
          { shape: "sphere", yc: R, r: R, look: S, tone: 4 },
          { shape: "cylinder", y0: 2 * R - 0.2, y1: 2 * R + 8, r: 1, look: S, tone: 4 },
        ],
        marks: [
          { kind: "radius", y: R, r: R, text: "r = 4.25" },
          { kind: "height", y0: 2 * R, y1: 2 * R + 8, x: 1.6, text: "8 cm" },
        ],
        joins: [],
        surface: null,
        volume: [
          {
            label: w("volume of the flask", "फ़्लास्क का आयतन"),
            unit: "cm",
            power: 3,
            terms: [
              {
                label: LABEL.volSphere,
                tex: "\\tfrac{4}{3}\\pi R^3",
                value: (4 / 3) * p * R ** 3,
                sign: 1,
              },
              {
                label: w("volume of the neck", "गर्दन का आयतन"),
                tex: "\\pi r^2 h",
                value: p * 1 * 8,
                sign: 1,
              },
            ],
          },
        ],
      };
    }
  }
}

/** The total of a group: the terms added and taken away. */
export function totalOf(g: Group): number {
  return g.terms.reduce((sum, t) => sum + t.sign * t.value, 0);
}

/** The heights the combination spans and its widest radius, for fitting the picture. */
export function extentOfCombo(c: Combo): { y0: number; y1: number; r: number } {
  let y0 = Number.POSITIVE_INFINITY;
  let y1 = Number.NEGATIVE_INFINITY;
  let r = 0;
  for (const p of c.parts) {
    const [a, b, rr] =
      p.shape === "cylinder" || p.shape === "box"
        ? [p.y0, p.y1, p.shape === "box" ? (Math.SQRT2 * p.side) / 2 : p.r]
        : p.shape === "cone"
          ? [Math.min(p.yBase, p.yApex), Math.max(p.yBase, p.yApex), p.r]
          : p.shape === "dome"
            ? p.isUp
              ? [p.yFlat, p.yFlat + p.r, p.r]
              : [p.yFlat - p.r, p.yFlat, p.r]
            : [p.yc - p.r, p.yc + p.r, p.r];
    y0 = Math.min(y0, a);
    y1 = Math.max(y1, b);
    r = Math.max(r, rr);
  }
  return { y0, y1, r };
}
