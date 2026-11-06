import { atomsOf } from "./formula";

/** One atom of a molecule drawn: its element, where (in atom radii, y down) and how big. */
export type AtomSpot = { element: string; x: number; y: number; r: number };

/** A molecule's atoms, centred on (0, 0), and the box round them. */
export type Shape = { atoms: AtomSpot[]; width: number; height: number };

/** Hydrogen is drawn smaller than every other atom (radius 1). */
export const radiusOf = (element: string): number => (element === "H" ? 0.62 : 1);

/** Two joined atoms' centres are this share of their radii apart: they overlap, as a model does. */
const JOIN = 0.84;
const apart = (a: string, b: string) => (radiusOf(a) + radiusOf(b)) * JOIN;

/** Atoms with lone pairs that bend two partners away from a line (H₂O, H₂S). */
const BENT_CENTRES = ["O", "S"];
/** The angle between the two partners of a bent centre (water's 104.5°). */
const BENT = (104.5 * Math.PI) / 180;

/**
 * How a molecule is drawn, from its formula alone, as a space-filling model flattened onto the
 * page:
 *
 * - one atom alone; two atoms side by side (H₂, O₂, HCl);
 * - one atom of an element with up to four partners all of one other element, the partners round
 *   it: two in a line (CO₂), or bent below it from O or S (H₂O); three or four evenly round (NH₃, CH₄);
 * - anything else as a close cluster, the elements taking turns (Fe₃O₄).
 */
export function shapeOf(formula: string): Shape {
  const counts = atomsOf(formula);
  const list = Object.entries(counts).flatMap(([el, n]) => Array.from({ length: n }, () => el));
  const elements = Object.keys(counts);
  let atoms: AtomSpot[];
  const centre =
    elements.length === 2 ? elements.find((el) => counts[el] === 1 && el !== "H") : undefined;
  const partner = elements.find((el) => el !== centre);
  const partners = partner === undefined ? 0 : (counts[partner] ?? 0);
  if (list.length === 1) {
    atoms = [{ element: list[0] as string, x: 0, y: 0, r: radiusOf(list[0] as string) }];
  } else if (list.length === 2) {
    const [a, b] = list as [string, string];
    const d = apart(a, b);
    atoms = [
      { element: a, x: -d / 2, y: 0, r: radiusOf(a) },
      { element: b, x: d / 2, y: 0, r: radiusOf(b) },
    ];
  } else if (centre !== undefined && partner !== undefined && partners >= 2 && partners <= 4) {
    const d = apart(centre, partner);
    const angles =
      partners === 2
        ? BENT_CENTRES.includes(centre)
          ? [Math.PI / 2 - BENT / 2, Math.PI / 2 + BENT / 2]
          : [0, Math.PI]
        : Array.from({ length: partners }, (_, i) => -Math.PI / 2 + (2 * Math.PI * i) / partners);
    atoms = [
      { element: centre, x: 0, y: 0, r: radiusOf(centre) },
      ...angles.map((a) => ({
        element: partner,
        x: d * Math.cos(a),
        y: d * Math.sin(a),
        r: radiusOf(partner),
      })),
    ];
  } else {
    atoms = clusterOf(list);
  }
  return centred(atoms);
}

/** Many atoms packed close: one in the middle, the rest in rings round it, elements taking turns. */
function clusterOf(list: readonly string[]): AtomSpot[] {
  // Deal the elements out in turn (Fe O Fe O …), so neighbours differ.
  const piles = new Map<string, string[]>();
  for (const el of list) piles.set(el, [...(piles.get(el) ?? []), el]);
  const dealt: string[] = [];
  while (dealt.length < list.length)
    for (const pile of piles.values()) {
      const el = pile.shift();
      if (el !== undefined) dealt.push(el);
    }
  const step = 2 * JOIN;
  return dealt.map((element, i) => {
    if (i === 0) return { element, x: 0, y: 0, r: radiusOf(element) };
    // Ring k holds 6k atoms.
    let k = 1;
    let first = 1;
    while (i >= first + 6 * k) {
      first += 6 * k;
      k++;
    }
    const a = -Math.PI / 2 + (2 * Math.PI * (i - first)) / (6 * k);
    return { element, x: step * k * Math.cos(a), y: step * k * Math.sin(a), r: radiusOf(element) };
  });
}

/** The atoms moved so their box is centred on (0, 0). */
function centred(atoms: readonly AtomSpot[]): Shape {
  const x0 = Math.min(...atoms.map((a) => a.x - a.r));
  const x1 = Math.max(...atoms.map((a) => a.x + a.r));
  const y0 = Math.min(...atoms.map((a) => a.y - a.r));
  const y1 = Math.max(...atoms.map((a) => a.y + a.r));
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return {
    atoms: atoms.map((a) => ({ ...a, x: a.x - cx, y: a.y - cy })),
    width: x1 - x0,
    height: y1 - y0,
  };
}
