import type { FigureSpec } from "./kit";

/* The figures for Exercise 12.3's worked items and questions, in model units (y up). */

const S3 = Math.sqrt(3);

/** Q8: the race track, two straights and two semicircular ends, 10 m wide. */
export const RACE_TRACK: FigureSpec = {
  points: [
    { name: "O", at: [0, 0], isHidden: true },
    { name: "O2", at: [106, 0], isHidden: true },
  ],
  items: [
    {
      kind: "path",
      tone: "accent",
      cmds: [
        { k: "M", p: [0, -40] },
        { k: "L", p: [106, -40] },
        { k: "A", c: "O2", r: 40, from: -90, to: 90 },
        { k: "L", p: [0, 40] },
        { k: "A", c: "O", r: 40, from: 90, to: 270 },
        { k: "Z" },
        { k: "M", p: [0, -30] },
        { k: "L", p: [106, -30] },
        { k: "A", c: "O2", r: 30, from: -90, to: 90 },
        { k: "L", p: [0, 30] },
        { k: "A", c: "O", r: 30, from: 90, to: 270 },
        { k: "Z" },
      ],
    },
    { kind: "seg", a: [0, 30], b: [0, -30], tone: "muted", dashed: true },
    { kind: "note", at: [53, -30], text: "106 m", prefer: 90 },
    { kind: "note", at: [0, 0], text: "60 m", prefer: 0 },
    { kind: "note", at: [53, 35], text: "10 m", prefer: 90 },
  ],
  captions: [],
  about:
    "Exercise 12.3 Q8: a race track 10 m wide, shaded: inner straights 106 m long and 60 m apart, joined by semicircular ends of inner radius 30 m and outer radius 40 m.",
  height: 170,
};

/** Q10: an equilateral triangle, side 200 cm, with a circle of radius 100 cm at each corner. */
export const CORNER_CIRCLES: FigureSpec = {
  points: [
    { name: "A", at: [0, 0] },
    { name: "B", at: [2, 0] },
    { name: "C", at: [1, S3] },
  ],
  items: [
    { kind: "circle", c: "A", r: 1, tone: "muted", dashed: true },
    { kind: "circle", c: "B", r: 1, tone: "muted", dashed: true },
    { kind: "circle", c: "C", r: 1, tone: "muted", dashed: true },
    {
      kind: "path",
      tone: "accent",
      cmds: [
        { k: "M", p: [1, 0] },
        { k: "A", c: "B", r: 1, from: 180, to: 120, cw: true },
        { k: "A", c: "C", r: 1, from: 300, to: 240, cw: true },
        { k: "A", c: "A", r: 1, from: 60, to: 0, cw: true },
        { k: "Z" },
      ],
    },
    { kind: "seg", a: "A", b: "B" },
    { kind: "seg", a: "B", b: "C" },
    { kind: "seg", a: "C", b: "A" },
    { kind: "angle", at: "A", p: "B", q: "C", label: "60°" },
    { kind: "note", at: [1.5, 0], text: "r = 100", prefer: 90 },
  ],
  captions: [],
  about:
    "Exercise 12.3 Q10: an equilateral triangle ABC of side 200 cm with a circle of radius 100 cm centred at each corner; the part of the triangle outside the three 60° corner sectors is shaded.",
  height: 230,
};

/** Q16: two quadrants of radius 8 cm from opposite corners of an 8 cm square; the leaf they share. */
export const LEAF: FigureSpec = {
  points: [
    { name: "A", at: [0, 8] },
    { name: "B", at: [0, 0] },
    { name: "C", at: [8, 0] },
    { name: "D", at: [8, 8] },
  ],
  items: [
    {
      kind: "path",
      tone: "accent",
      cmds: [
        { k: "M", p: "C" },
        { k: "A", c: "B", r: 8, from: 0, to: 90 },
        { k: "A", c: "D", r: 8, from: 180, to: 270 },
        { k: "Z" },
      ],
    },
    { kind: "seg", a: "A", b: "B" },
    { kind: "seg", a: "B", b: "C" },
    { kind: "seg", a: "C", b: "D" },
    { kind: "seg", a: "D", b: "A" },
    { kind: "arc", c: "B", r: 8, from: 0, to: 90, tone: "construction" },
    { kind: "arc", c: "D", r: 8, from: 180, to: 270, tone: "construction" },
    { kind: "seg", a: "A", b: "C", tone: "muted", dashed: true },
    { kind: "note", at: [4, 0], text: "8 cm", prefer: 90 },
  ],
  captions: [],
  about:
    "Exercise 12.3 Q16: square ABCD of side 8 cm with a quadrant of radius 8 cm centred at B and another centred at D; the leaf-shaped region common to both is shaded, and the dashed diagonal AC cuts it into two halves.",
  height: 210,
};

const at = (r: number, deg: number): [number, number] => [
  Math.round(r * Math.cos((deg * Math.PI) / 180) * 100) / 100,
  Math.round(r * Math.sin((deg * Math.PI) / 180) * 100) / 100,
];

/** Worked Q2: the part between radii 7 cm and 14 cm inside the 40° angle AOC. */
export const RING_SECTOR: FigureSpec = {
  points: [
    { name: "O", at: [0, 0] },
    { name: "A", at: at(14, 110) },
    { name: "C", at: at(14, 70) },
    { name: "B", at: at(7, 110) },
    { name: "D", at: at(7, 70) },
  ],
  items: [
    { kind: "circle", c: "O", r: 14, tone: "muted" },
    { kind: "circle", c: "O", r: 7, tone: "muted" },
    {
      kind: "path",
      tone: "accent",
      cmds: [
        { k: "A", c: "O", r: 14, from: 70, to: 110 },
        { k: "A", c: "O", r: 7, from: 110, to: 70, cw: true },
        { k: "Z" },
      ],
    },
    { kind: "seg", a: "O", b: "A" },
    { kind: "seg", a: "O", b: "C" },
    { kind: "angle", at: "O", p: "C", q: "A", label: "40°" },
  ],
  captions: [],
  about:
    "Exercise 12.3 Q2: two circles with centre O and radii 7 cm and 14 cm; the radii OA and OC make 40°, and the shaded part is the piece of the ring between them, from B and D on the small circle out to A and C on the big one.",
  height: 230,
};

/** Your turn (Q5): a 4 cm square, a 1 cm quadrant cut from each corner and a 2 cm circle from the middle. */
export const CUT_SQUARE: FigureSpec = {
  points: [
    { name: "A", at: [0, 4] },
    { name: "B", at: [0, 0] },
    { name: "C", at: [4, 0] },
    { name: "D", at: [4, 4] },
    { name: "O", at: [2, 2], isHidden: true },
  ],
  items: [
    {
      kind: "path",
      tone: "accent",
      cmds: [
        { k: "M", p: "B" },
        { k: "L", p: "C" },
        { k: "L", p: "D" },
        { k: "L", p: "A" },
        { k: "Z" },
        { k: "M", p: "B" },
        { k: "L", p: [1, 0] },
        { k: "A", c: "B", r: 1, from: 0, to: 90 },
        { k: "Z" },
        { k: "M", p: "C" },
        { k: "L", p: [4, 1] },
        { k: "A", c: "C", r: 1, from: 90, to: 180 },
        { k: "Z" },
        { k: "M", p: "D" },
        { k: "L", p: [3, 4] },
        { k: "A", c: "D", r: 1, from: 180, to: 270 },
        { k: "Z" },
        { k: "M", p: "A" },
        { k: "L", p: [0, 3] },
        { k: "A", c: "A", r: 1, from: 270, to: 360 },
        { k: "Z" },
        { k: "A", c: "O", r: 1, from: 0, to: 180 },
        { k: "A", c: "O", r: 1, from: 180, to: 360 },
        { k: "Z" },
      ],
    },
    { kind: "seg", a: "A", b: "B" },
    { kind: "seg", a: "B", b: "C" },
    { kind: "seg", a: "C", b: "D" },
    { kind: "seg", a: "D", b: "A" },
    { kind: "note", at: [2, 0], text: "4 cm", prefer: 90 },
  ],
  captions: [],
  about:
    "A 4 cm square ABCD with a quadrant of radius 1 cm cut from each corner and a circle of diameter 2 cm cut from the middle; what is left is shaded.",
  height: 200,
};
