# @chalk/prop-light

Light: reflection and refraction (NCERT Class 10, Ch 9). One prop so far, `sphericalMirror`.

May import `@chalk/prop`, `@chalk/player`, `@chalk/draw`, `@chalk/content`, `zod`, `preact`. Exports `sphericalMirrorProp` (its module) and `lightProps`; `defs` the definitions alone.

## sphericalMirror

**World.** A concave or convex mirror on its principal axis, with P, F and C marked, a candle (or an upright arrow) standing on the axis in front of it, and the image the mirror forms: by the mirror formula 1/v + 1/u = 1/f with the New Cartesian sign convention (P is the origin, light travels left to right, so u < 0; f < 0 for a concave mirror), m = h′/h = −v/u. A real image is drawn in front of the mirror (inverted), a virtual one behind it (erect, dashed), with two of the textbook's rays from the object's tip reaching it.

**Variables**

| | | start |
|---|---|---|
| `kind` | `MirrorKind`: concave or convex | concave |
| `focalLength` | \|f\|, cm (4 to 40) | 10 |
| `u` | the object's distance, cm, signed (negative: in front) | −30 |
| `objectHeight` | h, cm (at most 1.2 f) | 8.5 |
| `object` | `ObjectKind`: a candle or an arrow | candle |
| `canMoveObject` | the student may drag the object along the axis | true |
| `canSwitchKind` | the concave / convex switch is shown | false |
| `showCase` | the words for the case under the picture (where the object is; what the image is) | true |
| `showNumbers` | u, v and m written under the picture | true |

**Facts.** `f` (signed), `v` (null at infinity), `m`, `imageHeight` (h′, negative inverted), `isReal`, `isErect`, `imageCase` (`ImageCase`: beyond C, at C, between C and F, at F, between F and P, or in front of a convex mirror; "at" within 2.5 % of f), `rays` (the two drawn: parallel to the axis, then through F or as if from F; and to the pole P, reflected at the same angle: both meet the mirror however tall the object).

**Needs.** None.

**Actions**

| | from | does | refuses |
|---|---|---|---|
| `moveObject { x }` | screen (the drag) | the object's foot to x (= u), kept in range; stops any glide | nothing (clamps) |
| `letGo { x }` | screen (the drag's let-go) | tells `released` | — |
| `setKind { kind }` | screen (the switch) | concave or convex; the object is kept in range | — |
| `moveObjectTo { u, seconds }` | board | a glide (smooth) to u, kept in range; `caseChanged` each time the image changes case on the way, `moved` at its end | — |
| `placeObject { at, seconds }` | board | the same glide to a textbook place (3f, 2f, 1.5f, f, 0.6f) | on a convex mirror |
| `setFocalLength { cm }` | board | \|f\|; the object is kept in range | — |

**Signals.** `moved { u, to }`, `caseChanged { to }`, `released { u, to }` (`to`: the `ImageCase` now).

**What the student sees.** `object` (u, its words "u = −35 cm"; dragged), `image` (v or null, its words), `mirror` (its kind), `case` (the `ImageCase`, its words: "Object beyond C · Image between F and C: real, inverted, diminished"), `numbers` ("u = −35 cm  v = −14 cm  m = −0.4"), `kind:concave` / `kind:convex` (the switch, when shown). Summary: one line of the case.
