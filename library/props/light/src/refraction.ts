import { type Box, type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Light crossing from one transparent medium into another, in three pictures:
 * - boundary: one interface, a ray in, the refracted ray out (Snell's law, the refractive index);
 * - slab: a rectangular glass slab, the ray bending in at O and out at O′, emerging parallel but
 *   shifted sideways (NCERT Activity 10.10);
 * - coin: a coin in a bowl hidden behind its rim, seen again once water is poured in (Activity 10.8).
 *
 * Only the media, the angle of incidence and the water level are stored. Every other angle, the
 * speeds, the shift and whether the coin is seen follow from n₁ sin i = n₂ sin r.
 */

export const RefractionMode = { Boundary: "boundary", Slab: "slab", Coin: "coin" } as const;
export type RefractionMode = (typeof RefractionMode)[keyof typeof RefractionMode];

export const RefractionAction = {
  SetIncidence: "setIncidence",
  SetMedium: "setMedium",
  SetWater: "setWater",
} as const;

export const RefractionSignal = { Released: "released" } as const;

export const RefractionDerived = {
  Incidence: "incidence",
  Refraction: "refraction",
  SinRatio: "sinRatio",
  Index: "index",
  SpeedTop: "speedTop",
  SpeedBottom: "speedBottom",
  TowardsNormal: "towardsNormal",
  Emergent: "emergent",
  Shift: "shift",
  CoinSeen: "coinSeen",
} as const;

export const RefractionPart = {
  Interface: "interface",
  Normal: "normal",
  Incident: "incident",
  Refracted: "refracted",
  Emergent: "emergent",
  AngleI: "angleI",
  AngleR: "angleR",
  Top: "top",
  Bottom: "bottom",
  Coin: "coin",
  Eye: "eye",
  Readout: "readout",
} as const;

export const Medium = {
  Air: "air",
  Ice: "ice",
  Water: "water",
  Alcohol: "alcohol",
  Kerosene: "kerosene",
  FusedQuartz: "fusedQuartz",
  Turpentine: "turpentine",
  Benzene: "benzene",
  CrownGlass: "crownGlass",
  CanadaBalsam: "canadaBalsam",
  RockSalt: "rockSalt",
  CarbonDisulphide: "carbonDisulphide",
  DenseFlintGlass: "denseFlintGlass",
  Ruby: "ruby",
  Sapphire: "sapphire",
  Diamond: "diamond",
} as const;
export type Medium = (typeof Medium)[keyof typeof Medium];

/** NCERT Table 10.3: absolute refractive index, and the name in each language. */
export const MEDIA: Readonly<Record<Medium, { n: number; en: string; hi: string }>> = {
  [Medium.Air]: { n: 1.0003, en: "Air", hi: "वायु" },
  [Medium.Ice]: { n: 1.31, en: "Ice", hi: "बर्फ़" },
  [Medium.Water]: { n: 1.33, en: "Water", hi: "जल" },
  [Medium.Alcohol]: { n: 1.36, en: "Alcohol", hi: "ऐल्कोहॉल" },
  [Medium.Kerosene]: { n: 1.44, en: "Kerosene", hi: "किरोसिन" },
  [Medium.FusedQuartz]: { n: 1.46, en: "Fused quartz", hi: "पिघला क्वार्ट्ज़" },
  [Medium.Turpentine]: { n: 1.47, en: "Turpentine oil", hi: "तारपीन का तेल" },
  [Medium.Benzene]: { n: 1.5, en: "Benzene", hi: "बेंज़ीन" },
  [Medium.CrownGlass]: { n: 1.52, en: "Crown glass", hi: "क्राउन काँच" },
  [Medium.CanadaBalsam]: { n: 1.53, en: "Canada balsam", hi: "कनाडा बालसम" },
  [Medium.RockSalt]: { n: 1.54, en: "Rock salt", hi: "खनिज नमक" },
  [Medium.CarbonDisulphide]: { n: 1.63, en: "Carbon disulphide", hi: "कार्बन डाइसल्फ़ाइड" },
  [Medium.DenseFlintGlass]: { n: 1.65, en: "Dense flint glass", hi: "सघन फ्लिंट काँच" },
  [Medium.Ruby]: { n: 1.71, en: "Ruby", hi: "माणिक्य" },
  [Medium.Sapphire]: { n: 1.77, en: "Sapphire", hi: "नीलम" },
  [Medium.Diamond]: { n: 2.42, en: "Diamond", hi: "हीरा" },
};

/** The media in the table's order (lowest index first). */
export const MEDIA_ORDER: readonly Medium[] = Object.values(Medium);

/** Speed of light in vacuum, m/s. */
export const C = 3e8;

/** The scene, in cm: every mode draws on the same 25 × 15 cm stage. */
export const SCENE = { width: 25, height: 15 } as const;
/** Boundary mode: the point of incidence, in the middle of the interface. */
export const BOUNDARY_O = { x: 12.5, y: 7.5 } as const;
/** Slab mode: the slab's faces (y, cm), its thickness, and where the ray enters (O, on the top face). */
export const SLAB = { top: 9.5, bottom: 3.5, left: 1.5, right: 23.5, enterX: 8 } as const;
export const SLAB_THICKNESS = SLAB.top - SLAB.bottom;
/** Coin mode: the bowl (inner walls, floor, rim), the coin on its floor and the eye beside it. */
export const BOWL = { left: 6, right: 18, floor: 2, rim: 8 } as const;
export const COIN = { x: 10.5, halfWidth: 1 } as const;
export const EYE = { x: 23, y: 11.2 } as const;

const MAX_INCIDENCE = 80;
const DEG = 180 / Math.PI;
const RAD = Math.PI / 180;

const mediumSchema = z.nativeEnum(Medium);
const refractionState = z
  .object({
    mode: z.nativeEnum(RefractionMode),
    /** The medium light starts in (drawn above). In slab and coin mode it is also below the slab, and the air over the bowl. */
    top: mediumSchema,
    /** The medium light goes into (drawn below): the slab's glass, or the liquid in the bowl. */
    bottom: mediumSchema,
    /** Angle of incidence, degrees from the normal (boundary and slab mode). */
    incidence: z.number().min(0).max(MAX_INCIDENCE),
    showNormal: z.boolean(),
    showAngles: z.boolean(),
    showSines: z.boolean(),
    showSpeeds: z.boolean(),
    /** Whether the medium chooser shows each medium's refractive index (off until n has been taught). */
    showIndex: z.boolean(),
    /** Whether the learner can change the media (a small control under the picture). */
    canChooseMedium: z.boolean(),
    /** Coin mode: how full the bowl is, 0 (empty) to 1 (to the rim). */
    water: z.number().min(0).max(1),
    /** A dotted line carrying the incident ray straight on, to see how far it bent (and the slab's shift). */
    showIncidentExtension: z.boolean(),
  })
  .strict();
export type RefractionState = z.infer<typeof refractionState>;

type Media = Pick<RefractionState, "top" | "bottom">;

export const indexOf = (m: Medium): number => MEDIA[m].n;
/** Speed of light in a medium, m/s: c / n. */
export const speedIn = (m: Medium): number => C / indexOf(m);

/** The angle of refraction for incidence `i` (deg), from n₁ sin i = n₂ sin r; null when there is no refracted ray. */
export function refractionAngle(n1: number, n2: number, i: number): number | null {
  const s = (n1 * Math.sin(i * RAD)) / n2;
  if (s > 1 + 1e-12) return null;
  return Math.asin(Math.min(1, s)) * DEG;
}

/** The angle of refraction at the (top) interface for this state, or null. */
export function refractedOf(s: Media & Pick<RefractionState, "incidence">): number | null {
  return refractionAngle(indexOf(s.top), indexOf(s.bottom), s.incidence);
}

/** How far the slab moves the ray sideways, cm: t sin(i − r) / cos r. Null if no ray gets in. */
export function shiftOf(s: Media & Pick<RefractionState, "incidence">): number | null {
  const r = refractedOf(s);
  if (r === null) return null;
  const v = (SLAB_THICKNESS * Math.sin((s.incidence - r) * RAD)) / Math.cos(r * RAD);
  return Math.abs(v) < 1e-12 ? 0 : v;
}

/** The water surface's height in the bowl, cm. */
export const surfaceOf = (water: number): number => BOWL.floor + water * (BOWL.rim - BOWL.floor);

export type CoinPath = {
  /** Where the ray leaves the water (or, with no water, passes the rim's height). */
  surface: [number, number];
  /** Where it starts on the floor. */
  floor: [number, number];
  /** Where the coin seems to be: the eye's line carried straight on, above the coin. */
  apparent: [number, number];
};

/**
 * The ray that reaches the eye from the coin, if there is one: it must leave the water inside the
 * bowl, pass over the rim, and start on the coin. With no water light goes straight, and the rim
 * hides the coin. Returns the path nearest the coin's middle, or null.
 */
export function coinPath(s: Pick<RefractionState, "top" | "bottom" | "water">): CoinPath | null {
  const h = surfaceOf(s.water);
  const n1 = indexOf(s.top);
  const n2 = indexOf(s.bottom);
  let best: { path: CoinPath; miss: number } | null = null;
  const STEPS = 600;
  for (let k = 0; k <= STEPS; k++) {
    const sx = BOWL.left + ((BOWL.right - BOWL.left) * k) / STEPS;
    // The air part, eye to the surface point: it must clear the rim at the bowl's right wall.
    const dx = EYE.x - sx;
    const dy = EYE.y - h;
    if (dy <= 0) continue;
    const atRim = h + (dy * (BOWL.right - sx)) / dx;
    if (atRim < BOWL.rim - 1e-9) continue;
    let fx: number;
    if (h <= BOWL.floor + 1e-9) {
      // No water: the line goes straight on to the floor (here the surface is the floor itself).
      fx = sx;
    } else {
      const i = Math.atan(dx / dy) * DEG;
      const r = refractionAngle(n1, n2, i);
      if (r === null) continue;
      fx = sx - (h - BOWL.floor) * Math.tan(r * RAD);
    }
    if (fx < BOWL.left) continue;
    const miss = Math.abs(fx - COIN.x);
    if (miss > COIN.halfWidth) continue;
    if (best === null || miss < best.miss) {
      const slope = dy / dx;
      const ay = h - slope * (sx - COIN.x);
      best = {
        path: { surface: [sx, h], floor: [fx, BOWL.floor], apparent: [COIN.x, ay] },
        miss,
      };
    }
  }
  return best?.path ?? null;
}

const round = (v: number): number => Math.round(v);
const two = (v: number): string => v.toFixed(2);

/** "2.26 × 10⁸ m/s" */
export function speedText(m: Medium): string {
  return `${two(speedIn(m) / 1e8)} × 10⁸ m/s`;
}

/** The stage's pixels at a width: uniform cm in both directions. The view and `locate` share it. */
export const INSET = { left: 6, right: 6, top: 6, bottom: 6 } as const;
export function pixelsOf(width: number): {
  height: number;
  scale: number;
  x: (cm: number) => number;
  y: (cm: number) => number;
  toCm: (px: number, py: number) => [number, number];
} {
  const scale = (width - INSET.left - INSET.right) / SCENE.width;
  const height = Math.round(SCENE.height * scale + INSET.top + INSET.bottom);
  const x = (cm: number) => INSET.left + cm * scale;
  const y = (cm: number) => height - INSET.bottom - cm * scale;
  return {
    height,
    scale,
    x,
    y,
    toCm: (px, py) => [(px - INSET.left) / scale, (height - INSET.bottom - py) / scale],
  };
}

/** Length of the drawn incident and refracted rays, cm. */
export const RAY = { boundary: 6.5, slab: 5, out: 3.2 } as const;

/** Where the incident ray starts, cm: the handle the learner drags. */
export function incidentStart(s: Pick<RefractionState, "mode" | "incidence">): [number, number] {
  const o = s.mode === RefractionMode.Slab ? [SLAB.enterX, SLAB.top] : [BOUNDARY_O.x, BOUNDARY_O.y];
  const len = s.mode === RefractionMode.Slab ? RAY.slab : RAY.boundary;
  return [
    (o[0] ?? 0) - len * Math.sin(s.incidence * RAD),
    (o[1] ?? 0) + len * Math.cos(s.incidence * RAD),
  ];
}

/** The incidence a pointer at (x, y) cm asks for: the angle from the normal at O, whole degrees, 0 to 80. */
export function incidenceAt(s: Pick<RefractionState, "mode">, x: number, y: number): number {
  const o = s.mode === RefractionMode.Slab ? [SLAB.enterX, SLAB.top] : [BOUNDARY_O.x, BOUNDARY_O.y];
  const dx = (o[0] ?? 0) - x;
  const dy = y - (o[1] ?? 0);
  if (dy <= 0) return dx > 0 ? MAX_INCIDENCE : 0;
  if (dx <= 0) return 0;
  return Math.min(MAX_INCIDENCE, Math.max(0, Math.round(Math.atan2(dx, dy) * DEG)));
}

function nameOf(m: Medium): string {
  return MEDIA[m].en.toLowerCase();
}

const act = actionsFor<RefractionState>();

export const refraction = defineProp({
  type: "refraction",
  describe:
    "Light crossing from one transparent medium into another (NCERT Table 10.3's media): the normal, the angles of incidence and refraction (n₁ sin i = n₂ sin r), sin i / sin r, the speed in each medium (c / n); a rectangular glass slab with the emergent ray parallel to the incident one but shifted sideways; and a coin in a bowl, hidden behind the rim until water is poured in.",
  state: refractionState,
  defaults: {
    mode: RefractionMode.Boundary,
    top: Medium.Air,
    bottom: Medium.CrownGlass,
    incidence: 40,
    showNormal: true,
    showAngles: true,
    showSines: false,
    showSpeeds: false,
    showIndex: false,
    canChooseMedium: false,
    water: 0,
    showIncidentExtension: false,
  },
  inputs: [
    "showNormal",
    "showAngles",
    "showSines",
    "showSpeeds",
    "showIndex",
    "canChooseMedium",
    "showIncidentExtension",
  ],
  derived: {
    [RefractionDerived.Incidence]: {
      describe: "Angle of incidence, degrees from the normal (null in coin mode)",
      compute: (s) => (s.mode === RefractionMode.Coin ? null : s.incidence),
    },
    [RefractionDerived.Refraction]: {
      describe:
        "Angle of refraction, degrees from the normal; null when there is no refracted ray (or in coin mode)",
      compute: (s) => (s.mode === RefractionMode.Coin ? null : refractedOf(s)),
    },
    [RefractionDerived.SinRatio]: {
      describe:
        "sin i / sin r: the same for every angle for one pair of media (equals n₂ / n₁); null at i = 0 or with no refracted ray",
      compute: (s) => {
        if (s.mode === RefractionMode.Coin || s.incidence === 0) return null;
        const r = refractedOf(s);
        return r === null || r === 0 ? null : Math.sin(s.incidence * RAD) / Math.sin(r * RAD);
      },
    },
    [RefractionDerived.Index]: {
      describe:
        "Refractive index of the bottom medium with respect to the top one: n₂ / n₁ = v₁ / v₂",
      compute: (s) => indexOf(s.bottom) / indexOf(s.top),
    },
    [RefractionDerived.SpeedTop]: {
      describe: "Speed of light in the top medium, m/s",
      compute: (s) => speedIn(s.top),
    },
    [RefractionDerived.SpeedBottom]: {
      describe: "Speed of light in the bottom medium, m/s",
      compute: (s) => speedIn(s.bottom),
    },
    [RefractionDerived.TowardsNormal]: {
      describe:
        "Going into the bottom medium the ray bends towards the normal (the bottom medium is optically denser: light is slower there)",
      compute: (s) => indexOf(s.bottom) > indexOf(s.top),
    },
    [RefractionDerived.Emergent]: {
      describe:
        "Slab mode: the angle the emergent ray makes with the normal, degrees (null otherwise)",
      compute: (s) =>
        s.mode !== RefractionMode.Slab || refractedOf(s) === null ? null : s.incidence,
    },
    [RefractionDerived.Shift]: {
      describe: "Slab mode: how far sideways the emergent ray is from the incident ray's line, cm",
      compute: (s) => (s.mode === RefractionMode.Slab ? shiftOf(s) : null),
    },
    [RefractionDerived.CoinSeen]: {
      describe: "Coin mode: light from the coin reaches the eye over the rim (null otherwise)",
      compute: (s) => (s.mode === RefractionMode.Coin ? coinPath(s) !== null : null),
    },
  },
  actions: {
    [RefractionAction.SetIncidence]: act({
      describe: "Aim the incident ray at `deg` degrees from the normal (0 to 80)",
      byLearner: true,
      args: z.object({ deg: z.number().min(0).max(MAX_INCIDENCE) }).strict(),
      run: (_s, a) => set({ incidence: a.deg }),
    }),
    [RefractionAction.SetMedium]: act({
      describe:
        "Put `medium` on the `which` side (top: where light starts; bottom: where it goes). In slab mode the top stays air.",
      byLearner: true,
      args: z.object({ which: z.enum(["top", "bottom"]), medium: mediumSchema }).strict(),
      run: (s, a) => {
        if (a.which === "top" && s.mode === RefractionMode.Slab) return set({});
        return set(a.which === "top" ? { top: a.medium } : { bottom: a.medium });
      },
    }),
    [RefractionAction.SetWater]: act({
      describe: "Coin mode: fill the bowl to `level` (0 empty, 1 to the rim)",
      byLearner: true,
      args: z.object({ level: z.number().min(0).max(1) }).strict(),
      run: (_s, a) => set({ water: a.level }),
    }),
  },
  signals: {
    [RefractionSignal.Released]: {
      describe:
        "The learner let go of the ray (payload `incidence`) or the water surface (payload `water`)",
    },
  },
  observe: (s) => {
    const top = nameOf(s.top);
    const bottom = nameOf(s.bottom);
    const elements: Element[] = [];
    if (s.mode === RefractionMode.Coin) {
      const seen = coinPath(s) !== null;
      const h = surfaceOf(s.water);
      elements.push(
        {
          id: RefractionPart.Bottom,
          value:
            s.water === 0
              ? "the bowl is empty"
              : `${bottom} ${Math.round((h - BOWL.floor) * 10) / 10} cm deep (the bowl is ${round(s.water * 100)}% full)`,
        },
        { id: RefractionPart.Coin, value: seen ? "seen" : "hidden behind the rim" },
        { id: RefractionPart.Eye, value: "beside the bowl, just below the line over the rim" },
      );
      const summary = `a coin on the floor of a bowl, an eye beside it; ${s.water === 0 ? "the bowl is empty and the rim hides the coin" : seen ? `with ${bottom} poured in, light from the coin bends at the surface and reaches the eye: the coin is seen, and looks raised` : `with ${bottom} poured in, the coin is still hidden`}`;
      return { summary, elements };
    }
    const i = round(s.incidence);
    const rRaw = refractedOf(s);
    const r = rRaw === null ? null : round(rRaw);
    elements.push(
      { id: RefractionPart.Top, value: s.showSpeeds ? `${top}, ${speedText(s.top)}` : top },
      {
        id: RefractionPart.Bottom,
        value: s.showSpeeds ? `${bottom}, ${speedText(s.bottom)}` : bottom,
      },
      {
        id: RefractionPart.Interface,
        value:
          s.mode === RefractionMode.Slab
            ? "the slab's two parallel faces"
            : `between ${top} and ${bottom}`,
      },
    );
    if (s.showNormal)
      elements.push({ id: RefractionPart.Normal, value: "dashed, at right angles to the surface" });
    elements.push({
      id: RefractionPart.Incident,
      value: s.showAngles ? `${i}° from the normal` : "the incident ray",
    });
    if (r !== null)
      elements.push({
        id: RefractionPart.Refracted,
        value: s.showAngles
          ? `${r}° from the normal, bent ${indexOf(s.bottom) > indexOf(s.top) ? "towards" : indexOf(s.bottom) < indexOf(s.top) ? "away from" : "neither way from"} the normal`
          : "the refracted ray",
      });
    if (s.mode === RefractionMode.Slab && r !== null) {
      const shift = shiftOf(s) ?? 0;
      elements.push({
        id: RefractionPart.Emergent,
        value: s.showAngles
          ? `angle of emergence e = ${i}°, parallel to the incident ray, shifted ${two(shift)} cm sideways`
          : "parallel to the incident ray, shifted sideways",
      });
    }
    if (s.showAngles) {
      elements.push({ id: RefractionPart.AngleI, value: `i = ${i}°` });
      if (r !== null) elements.push({ id: RefractionPart.AngleR, value: `r = ${r}°` });
    }
    if (s.showSines && rRaw !== null && s.incidence > 0) {
      const si = Math.sin(s.incidence * RAD);
      const sr = Math.sin(rRaw * RAD);
      elements.push({
        id: RefractionPart.Readout,
        value: `sin i = ${two(si)}, sin r = ${two(sr)}, sin i / sin r = ${two(si / sr)}, i / r = ${two(s.incidence / rRaw)}`,
      });
    }
    const bend =
      r === null
        ? "there is no refracted ray"
        : `it bends ${indexOf(s.bottom) > indexOf(s.top) ? "towards" : indexOf(s.bottom) < indexOf(s.top) ? "away from" : "neither towards nor away from"} the normal${s.showAngles ? `, r = ${r}°` : ""}`;
    const summary =
      s.mode === RefractionMode.Slab
        ? `a ray in ${top} meets a rectangular ${bottom} slab ${s.showAngles ? `at ${i}° to the normal` : "slantwise"}; inside, ${bend}; it leaves the far face parallel to where it came in, shifted sideways`
        : `a ray in ${top} meets ${bottom} ${s.showAngles ? `at ${i}° to the normal` : "slantwise"}; ${bend}`;
    return s.showAngles
      ? { summary, elements }
      : { summary, elements, hidden: { incidence: i, refraction: r } };
  },
  parts: (s) => {
    if (s.mode === RefractionMode.Coin)
      return [RefractionPart.Bottom, RefractionPart.Coin, RefractionPart.Eye];
    const r = refractedOf(s);
    const out: string[] = [RefractionPart.Top, RefractionPart.Bottom, RefractionPart.Interface];
    if (s.showNormal) out.push(RefractionPart.Normal);
    out.push(RefractionPart.Incident);
    if (r !== null) out.push(RefractionPart.Refracted);
    if (s.mode === RefractionMode.Slab && r !== null) out.push(RefractionPart.Emergent);
    if (s.showAngles) {
      out.push(RefractionPart.AngleI);
      if (r !== null) out.push(RefractionPart.AngleR);
    }
    if (s.showSines && r !== null && s.incidence > 0) out.push(RefractionPart.Readout);
    return out;
  },
  locate: (s, part, width): Box | undefined => {
    const px = pixelsOf(width);
    const around = (cx: number, cy: number, size = 48): Box => ({
      x: px.x(cx) - size / 2,
      y: px.y(cy) - size / 2,
      width: size,
      height: size,
    });
    const box = (x0: number, y0: number, x1: number, y1: number): Box => {
      const a = px.x(Math.min(x0, x1));
      const b = px.x(Math.max(x0, x1));
      const top = px.y(Math.max(y0, y1));
      const bot = px.y(Math.min(y0, y1));
      return {
        x: a - 8,
        y: top - 8,
        width: Math.max(44, b - a + 16),
        height: Math.max(44, bot - top + 16),
      };
    };
    if (s.mode === RefractionMode.Coin) {
      if (part === RefractionPart.Coin) return around(COIN.x, BOWL.floor);
      if (part === RefractionPart.Eye) return around(EYE.x, EYE.y);
      if (part === RefractionPart.Bottom)
        return box(BOWL.left, BOWL.floor, BOWL.right, surfaceOf(s.water));
      return undefined;
    }
    const isSlab = s.mode === RefractionMode.Slab;
    const o: [number, number] = isSlab ? [SLAB.enterX, SLAB.top] : [BOUNDARY_O.x, BOUNDARY_O.y];
    const r = refractedOf(s);
    const start = incidentStart(s);
    switch (part) {
      case RefractionPart.Top:
        return isSlab
          ? box(0, SLAB.top, SCENE.width, SCENE.height)
          : box(0, o[1], SCENE.width, SCENE.height);
      case RefractionPart.Bottom:
        return isSlab
          ? box(SLAB.left, SLAB.bottom, SLAB.right, SLAB.top)
          : box(0, 0, SCENE.width, o[1]);
      case RefractionPart.Interface:
        return isSlab
          ? box(SLAB.left, SLAB.top, SLAB.right, SLAB.top)
          : box(0, o[1], SCENE.width, o[1]);
      case RefractionPart.Normal:
        return s.showNormal ? box(o[0], o[1] - 4, o[0], o[1] + 4) : undefined;
      case RefractionPart.Incident:
        return around(start[0], start[1]);
      case RefractionPart.AngleI:
        return s.showAngles ? around(o[0] - 3, o[1] + 0.8) : undefined;
      case RefractionPart.AngleR:
        return s.showAngles && r !== null ? around(o[0] + 2.6, o[1] - 2.2) : undefined;
      case RefractionPart.Refracted: {
        if (r === null) return undefined;
        if (isSlab) {
          const ox = SLAB.enterX + SLAB_THICKNESS * Math.tan(r * RAD);
          return box(o[0], o[1], ox, SLAB.bottom);
        }
        const len = RAY.boundary;
        return box(o[0], o[1], o[0] + len * Math.sin(r * RAD), o[1] - len * Math.cos(r * RAD));
      }
      case RefractionPart.Emergent: {
        if (!isSlab || r === null) return undefined;
        const ox = SLAB.enterX + SLAB_THICKNESS * Math.tan(r * RAD);
        const i = s.incidence * RAD;
        return box(
          ox,
          SLAB.bottom,
          ox + RAY.out * Math.sin(i),
          SLAB.bottom - RAY.out * Math.cos(i),
        );
      }
      case RefractionPart.Readout:
        return s.showSines && r !== null && s.incidence > 0
          ? { x: 0, y: px.height - 88, width: Math.min(width, 230), height: 88 }
          : undefined;
      default:
        return undefined;
    }
  },
});
