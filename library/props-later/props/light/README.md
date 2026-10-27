# @chalk/prop-light

Props for the light chapters: reflection and refraction. The first is `planeMirror`; spherical mirrors and lenses come next in the same package.

## `planeMirror`

**What world is this?** A plane mirror lying along the floor of a room, a torch held at a fixed height, and the one ray from the torch that strikes the mirror. The prop knows the laws of reflection and nothing about any lesson.

- **Stored:** `torchX` (cm, where the torch is held), `strike` (cm, where the ray meets the mirror), `target` (`{ x, y }` in cm, a spot the reflected ray may light, or null), `showNormal`, `showAngles`. The torch's height (`TORCH_HEIGHT`, 50 cm) and the room (100 × 60 cm) are constants.
- **Derived:** `incidence` and `reflection` (degrees from the normal; equal by the law), `hitX` (where the reflected ray reaches the torch's height), `isLit` (the reflected ray passes within `LIT_WITHIN` of the target).
- **Actions:** `aim { strike }` (the learner's drag; keeps the torch and target fixed), `placeTorch { x }`, `placeTarget { x, y }` / `clearTarget`, `aimAtTarget` (the inverse: moves the strike so the target is lit; **reveals**).
- **Signals:** `aimed` (the learner let go; not a commit).
- **Observation:** one line (torch, strike point, where the beam goes); elements `torch`, `strike` (with its angle of incidence when angles are shown), `normal` (only while shown), `angleIn` / `angleOut` (only while shown, in degrees), `target` (lit or dark); under `hidden`, the angles while they are not shown.
- **Finger:** drag anywhere on the mirror to move the strike point (`aim`); arrow keys nudge it.

## `sphericalMirror`

**What world is this?** A concave or convex mirror on its principal axis, an upright object in front of it, the textbook's standard rays and the image they form. The prop knows the mirror formula, the sign convention and the three ray rules, nothing about any lesson.

- **Stored:** `kind` (concave or convex), `focalLength` (cm, a magnitude), `object` (`{ x, height }` in cm; `x` is negative, in front of the pole), `rays` (which of `parallel`, `focal`, `centre`, `pole` are drawn), `showImage`, `showLabels`. Distances follow the New Cartesian convention: the pole is the origin, light travels left to right, so `u = object.x < 0`, and `f` is `−focalLength` for a concave mirror, `+focalLength` for a convex one.
- **Derived:** `u`, `f` (signed), `v` (from `1/v + 1/u = 1/f`; null when the object is at the focus), `imageHeight` (`m·h`, `m = −v/u`), `magnification`, `isReal`, `isErect`, `place` (where the object stands: beyond C, at C, between C and F, at F, between F and P), `window` (the x range to draw).
- **Actions:** `moveObject { x }` (the learner's drag; keeps everything else), `setHeight { height }`, `setFocalLength { f }`, `setKind { kind }`, `placeObject { at }` (one of the five textbook positions, by name), `showRays { rays }`, `moveObjectSoImageIsAt { v }` (the inverse; **reveals**).
- **Signals:** `objectReleased` (the learner let go; not a commit).
- **Observation:** one line (the mirror, the object, the image); elements `mirror`, `pole`, `focus` and `centre` (while labelled), `object`, one `ray:<name>` per drawn ray saying where it goes, `image` (while shown and formed: real or virtual, erect or inverted, size and place); under `hidden`, the image while it is not shown.
- **Finger:** drag the object's tip along its height line (`moveObject`); arrow keys nudge it.
