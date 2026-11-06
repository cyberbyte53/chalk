import { Ease, PropRole, action, prop, signal } from "@chalk/prop";
import { z } from "zod";
import {
  ImageCase,
  MirrorKind,
  ObjectKind,
  Place,
  caseOf,
  crossings,
  distanceFor,
  imageOf,
  keepU,
  raysOf,
  signedF,
  smoothTimeOf,
} from "./mirror";
import { caseLine, signed } from "./words";

const imageCase = z.nativeEnum(ImageCase);
const seconds = z.number().min(0).max(60);

/**
 * A concave or convex mirror on its principal axis, with P, F and C marked, a candle (or an
 * arrow) standing in front of it, and the image it forms by the mirror formula, with two of the
 * textbook's rays from the object's tip reaching it. Only the mirror and the object are stored;
 * the image, its case and the rays follow from them (mirror.ts).
 */
export const sphericalMirror = prop({
  type: "sphericalMirror",
  role: PropRole.Explainer,
  describe:
    "A concave or convex mirror on its principal axis with P, F and C marked, and a candle (or an upright arrow) standing on the axis in front of it. The image follows from the mirror formula 1/v + 1/u = 1/f (New Cartesian signs: u < 0, f < 0 for concave), m = −v/u: real and inverted in front of the mirror, or virtual and erect behind it (dashed), with two textbook rays from the object's tip reaching it. As the object moves, the image moves, grows, shrinks, flips and jumps behind the mirror: beyond C, at C, between C and F, at F (at infinity), between F and P; a convex mirror's is always virtual, erect, diminished. The student drags the object along the axis.",
  variables: z
    .object({
      kind: z.nativeEnum(MirrorKind),
      /** |f|, cm. */
      focalLength: z.number().min(4).max(40),
      /** The object's distance, cm, signed: negative, in front of the mirror. */
      u: z.number().max(0),
      /** The object's height h, cm (at most 1.2 f, so the parallel ray meets the mirror). */
      objectHeight: z.number().positive().max(20),
      object: z.nativeEnum(ObjectKind),
      canMoveObject: z.boolean(),
      canSwitchKind: z.boolean(),
      /** The words for the case under the picture. */
      showCase: z.boolean(),
      /** u, v and m under the picture. */
      showNumbers: z.boolean(),
    })
    .strict(),
  start: {
    kind: MirrorKind.Concave,
    focalLength: 10,
    u: -30,
    objectHeight: 8.5,
    object: ObjectKind.Candle,
    canMoveObject: true,
    canSwitchKind: false,
    showCase: true,
    showNumbers: true,
  },
  facts: {
    f: (me) => signedF(me),
    image: (me) => imageOf(me),
    v: (me) => imageOf(me)?.v ?? null,
    m: (me) => imageOf(me)?.m ?? null,
    imageHeight: (me) => imageOf(me)?.height ?? null,
    isReal: (me) => imageOf(me)?.isReal ?? true,
    isErect: (me) => imageOf(me)?.isErect ?? false,
    imageCase: (me) => caseOf(me),
    rays: (me) => raysOf(me),
  },
  actions: {
    moveObject: action(
      { x: z.number() },
      {
        from: "screen",
        describe: "The student drags the object's foot to x on the axis (x = u, cm; kept in range)",
      },
    ),
    letGo: action(
      { x: z.number() },
      { from: "screen", describe: "The student lets the object go" },
    ),
    setKind: action(
      { kind: z.nativeEnum(MirrorKind) },
      { from: "screen", describe: "Make the mirror concave or convex (the student's switch)" },
    ),
    moveObjectTo: action(
      { u: z.number().max(0), seconds },
      {
        describe:
          "The object glides (smoothly) to u cm, kept in range; caseChanged each time the image changes case on the way, moved at the end",
      },
    ),
    placeObject: action(
      { at: z.nativeEnum(Place), seconds },
      {
        describe:
          "The object glides to one of the textbook's places (beyond C: 3f, at C, between C and F: 1.5f, at F, between F and P: 0.6f); concave only",
      },
    ),
    setFocalLength: action(
      { cm: z.number().min(4).max(40) },
      { describe: "Set |f| (cm); the object is kept in range" },
    ),
  },
  signals: {
    moved: signal({ u: z.number(), to: imageCase }),
    caseChanged: signal({ to: imageCase }),
    released: signal({ u: z.number(), to: imageCase }),
  },
  on: {
    moveObject: (me, { x }, t) => {
      if (!me.canMoveObject) return;
      const u = keepU(me, x);
      const was = caseOf(me);
      const now = caseOf({ ...me, u });
      return [t.stop(), t.set({ u }), ...(now !== was ? [t.tell.caseChanged({ to: now })] : [])];
    },
    letGo: (me, _, t) => me.canMoveObject && t.tell.released({ u: me.u, to: caseOf(me) }),
    setKind: (me, { kind }, t) => {
      if (kind === me.kind) return;
      const u = keepU({ ...me, kind }, me.u);
      return [t.stop(), t.set({ kind, u }), t.tell.caseChanged({ to: caseOf({ ...me, kind, u }) })];
    },
    moveObjectTo: (me, { u: asked, seconds: takes }, t) => {
      const u = keepU(me, asked);
      const end = t.tell.moved({ u, to: caseOf({ ...me, u }) });
      if (takes <= 0 || u === me.u) {
        const was = caseOf(me);
        const now = caseOf({ ...me, u });
        return [
          t.stop(),
          t.set({ u }),
          ...(now !== was ? [t.tell.caseChanged({ to: now })] : []),
          end,
        ];
      }
      // A smooth glide; the image's case is told as the object crosses each edge on the way.
      return [
        t.stop(),
        t.move("u", u, takes, { ease: Ease.Smooth, atEnd: [end] }),
        ...crossings(me, me.u, u).map((c) =>
          t.later(takes * smoothTimeOf(c.share), t.tell.caseChanged({ to: c.to })),
        ),
      ];
    },
    placeObject: (me, { at, seconds }, t) =>
      me.kind === MirrorKind.Concave &&
      t.self.moveObjectTo({ u: -distanceFor(at, me.focalLength), seconds }),
    setFocalLength: (me, { cm }, t) => {
      const was = caseOf(me);
      const u = keepU({ ...me, focalLength: cm }, me.u);
      const now = caseOf({ ...me, focalLength: cm, u });
      return [
        t.stop(),
        t.set({ focalLength: cm, u }),
        ...(now !== was ? [t.tell.caseChanged({ to: now })] : []),
      ];
    },
  },
  invariant: (v) =>
    v.objectHeight > 1.2 * v.focalLength
      ? "the object is at most 1.2 f tall, so its rays meet the mirror"
      : undefined,
  summary: (me) =>
    `a ${me.kind} mirror, f = ${signed(signedF(me))} cm, the object at u = ${signed(me.u)} cm: ${caseLine(caseOf(me), "en")}`,
});
