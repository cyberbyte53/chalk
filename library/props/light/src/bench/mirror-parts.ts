import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/** The spherical mirror's own pieces on the bench: its face, the sign convention, the kind switch. */

export const MirrorFaceKind = { Concave: "concave", Convex: "convex" } as const;
const cm = z.number().min(-1000).max(1000);

export const curvedMirror = defineProp({
  type: "curvedMirror",
  isExplainer: false,
  describe:
    "A spherical mirror standing on the axis at the pole P: its reflecting face (a shallow arc) and a shaded back.",
  state: z
    .object({
      /** The face, bottom to top, cm: points along the arc the student sees. */
      face: z.array(z.tuple([cm, cm])).max(64),
      says: z.string().max(300),
    })
    .strict(),
  defaults: { face: [], says: "" },
  drawsOn: "bench",
  actions: {},
  observe: (s) => ({ summary: s.says, elements: [{ id: "mirror", value: s.says }] }),
});

export const signConvention = defineProp({
  type: "signConvention",
  isExplainer: false,
  describe:
    "The New Cartesian sign convention drawn at the pole: +x right, −x left, +y up, −y down, light from the left.",
  state: z.object({ isShown: z.boolean() }).strict(),
  defaults: { isShown: false },
  drawsOn: "bench",
  actions: {},
  observe: (s) =>
    s.isShown
      ? {
          summary: "the sign convention at P",
          elements: [
            {
              id: "signs",
              value:
                "New Cartesian signs at P: right +x, left −x, up +y, down −y; light comes from the left",
            },
          ],
        }
      : { summary: "", elements: [] },
});

export const KindToggleAction = { Set: "set" } as const;
const kindToggleState = z
  .object({ isShown: z.boolean(), kind: z.nativeEnum(MirrorFaceKind) })
  .strict();
const onToggle = actionsFor<z.infer<typeof kindToggleState>>();

export const kindToggle = defineProp({
  type: "mirrorKindToggle",
  isExplainer: false,
  describe: "A concave / convex switch: two buttons, the mirror's shape on each.",
  state: kindToggleState,
  defaults: { isShown: false, kind: MirrorFaceKind.Concave },
  actions: {
    [KindToggleAction.Set]: onToggle({
      describe: "Make it concave or convex",
      byLearner: true,
      args: z.object({ kind: z.nativeEnum(MirrorFaceKind) }).strict(),
      changes: ["kind"],
      run: (_s, a) => set({ kind: a.kind }),
    }),
  },
  observe: (s) =>
    s.isShown
      ? {
          summary: `concave / convex, now ${s.kind}`,
          elements: [
            {
              id: "kindToggle",
              value: `concave / convex switch, now ${s.kind}`,
              does: KindToggleAction.Set,
            },
          ],
        }
      : { summary: "", elements: [] },
});
