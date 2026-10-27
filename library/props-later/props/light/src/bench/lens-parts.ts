import { defineProp } from "@chalk/prop";
import { z } from "zod";

/** The lens's own pieces on the bench: the glass (and the spheres it is cut from), and the card. */

export const GlassKind = { Convex: "convex", Concave: "concave" } as const;

export const thinLens = defineProp({
  type: "thinLens",
  isExplainer: false,
  describe:
    "A thin lens standing on the axis at O: thick in the middle (convex) or at the edges (concave); optionally drawn from the two spheres its faces are cut from, with their centres C₁ and C₂.",
  state: z
    .object({
      kind: z.nativeEnum(GlassKind),
      /** How far it reaches above and below the axis, cm. */
      aperture: z.number().positive(),
      showCentres: z.boolean(),
      says: z.string().max(300),
    })
    .strict(),
  defaults: { kind: GlassKind.Convex, aperture: 10, showCentres: false, says: "" },
  drawsOn: "bench",
  actions: {},
  // A convex lens's faces bulge: each is cut from the sphere centred on the far side. A concave
  // lens's faces are hollow: each from the sphere on its own side.
  anatomy: {
    lens: { is: "drawing", value: (s) => s.says },
    c1: {
      is: "label",
      when: (s) => s.showCentres,
      value: (s) =>
        `C₁, to the left: the centre of the sphere the ${s.kind === GlassKind.Convex ? "right" : "left"} face is cut from`,
    },
    c2: {
      is: "label",
      when: (s) => s.showCentres,
      value: (s) =>
        `C₂, to the right: the centre of the sphere the ${s.kind === GlassKind.Convex ? "left" : "right"} face is cut from`,
    },
  },
  summary: (s) => s.says,
});

export const CardCover = { None: "none", Top: "top", Bottom: "bottom" } as const;

export const lensCard = defineProp({
  type: "lensCard",
  isExplainer: false,
  describe: "A black card covering the top or bottom half of the lens.",
  state: z.object({ cover: z.nativeEnum(CardCover), aperture: z.number().positive() }).strict(),
  defaults: { cover: CardCover.None, aperture: 10 },
  drawsOn: "bench",
  actions: {},
  anatomy: {
    card: {
      is: "drawing",
      when: (s) => s.cover !== CardCover.None,
      value: (s) => `a black card over the lens's ${s.cover} half`,
    },
  },
  summary: (s) => (s.cover === CardCover.None ? "" : `a card over the ${s.cover} half`),
});
