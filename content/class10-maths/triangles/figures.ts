import type { FigureSpec } from "./kit";

/* The figures for this chapter's proofs and worked examples, in model units (y up). */

/** Theorem 6.1 (BPT): DE ∥ BC, then BE and CD, then the heights EN and DM, then BDE and DEC. */
export const BPT_PROOF: FigureSpec = {
  points: [
    { name: "A", at: [1.5, 4.5] },
    { name: "B", at: [0, 0] },
    { name: "C", at: [6, 0] },
    { name: "D", at: [0.6, 1.8] },
    { name: "E", at: [4.2, 1.8] },
    { name: "N", at: [0.96, 2.88], step: 2 },
    { name: "M", at: [2.4, 3.6], step: 2 },
  ],
  items: [
    { kind: "seg", a: "A", b: "B" },
    { kind: "seg", a: "B", b: "C" },
    { kind: "seg", a: "C", b: "A" },
    { kind: "seg", a: "D", b: "E", tone: "accent" },
    { kind: "parallel", a: "D", b: "E" },
    { kind: "parallel", a: "B", b: "C" },
    { kind: "seg", a: "B", b: "E", tone: "construction", dashed: true, step: 1 },
    { kind: "seg", a: "C", b: "D", tone: "construction", dashed: true, step: 1 },
    { kind: "seg", a: "E", b: "N", tone: "construction", step: 2 },
    { kind: "right", at: "N", p: "A", q: "E", step: 2 },
    { kind: "seg", a: "D", b: "M", tone: "construction", step: 2 },
    { kind: "right", at: "M", p: "A", q: "D", step: 2 },
    { kind: "poly", pts: ["B", "D", "E"], tone: "accent", step: 3 },
    { kind: "poly", pts: ["D", "E", "C"], tone: "result", step: 3 },
  ],
  captions: [
    {
      en: "Given: DE ∥ BC, with D on AB and E on AC.",
      hi: "दिया है: DE ∥ BC, D भुजा AB पर और E भुजा AC पर।",
    },
    { en: "Join BE and CD.", hi: "BE और CD मिलाओ।" },
    {
      en: "Drop EN ⊥ AB and DM ⊥ AC. EN is the height of ADE and of BDE; DM is the height of ADE and of DEC.",
      hi: "EN ⊥ AB और DM ⊥ AC डालो। EN, ADE और BDE दोनों की ऊँचाई है; DM, ADE और DEC दोनों की।",
    },
    {
      en: "BDE and DEC share the base DE and lie between the parallels DE and BC: equal areas.",
      hi: "BDE और DEC का आधार DE एक ही है और वे समांतर रेखाओं DE और BC के बीच हैं: क्षेत्रफल बराबर।",
    },
  ],
  about:
    "Triangle ABC with DE parallel to BC, D on AB and E on AC; the steps join BE and CD, drop EN perpendicular to AB and DM perpendicular to AC, then shade triangles BDE and DEC.",
  height: 240,
};

/** Example 1: the same triangle, DE ∥ BC, still. */
export const EXAMPLE_1: FigureSpec = {
  points: [
    { name: "A", at: [1.5, 4.5] },
    { name: "B", at: [0, 0] },
    { name: "C", at: [6, 0] },
    { name: "D", at: [0.6, 1.8] },
    { name: "E", at: [4.2, 1.8] },
  ],
  items: [
    { kind: "seg", a: "A", b: "B" },
    { kind: "seg", a: "B", b: "C" },
    { kind: "seg", a: "C", b: "A" },
    { kind: "seg", a: "D", b: "E", tone: "accent" },
    { kind: "parallel", a: "D", b: "E" },
    { kind: "parallel", a: "B", b: "C" },
  ],
  captions: [],
  about: "Example 1: triangle ABC with a line DE parallel to BC, D on AB and E on AC.",
  height: 190,
};

/** Example 3: ST ∥ QR in ∆ PQR, with ∠PST and ∠PRQ marked equal. */
export const EXAMPLE_3: FigureSpec = {
  points: [
    { name: "P", at: [2.5, 4] },
    { name: "Q", at: [0, 0] },
    { name: "R", at: [5, 0] },
    { name: "S", at: [1.5, 2.4] },
    { name: "T", at: [3.5, 2.4] },
  ],
  items: [
    { kind: "seg", a: "P", b: "Q" },
    { kind: "seg", a: "Q", b: "R" },
    { kind: "seg", a: "R", b: "P" },
    { kind: "seg", a: "S", b: "T", tone: "accent" },
    { kind: "angle", at: "S", p: "P", q: "T", tone: "accent" },
    { kind: "angle", at: "R", p: "Q", q: "P", tone: "accent" },
    { kind: "angle", at: "Q", p: "R", q: "P", count: 2, tone: "result" },
  ],
  captions: [],
  about:
    "Example 3: triangle PQR with S on PQ and T on PR; angle PST and angle PRQ are marked equal, and angle PQR is marked as the one to compare.",
  height: 190,
};

/** Example 4: PQ ∥ RS, PS and QR crossing at O. */
export const EXAMPLE_4: FigureSpec = {
  points: [
    { name: "P", at: [0, 3] },
    { name: "Q", at: [2, 3] },
    { name: "O", at: [1.6, 1.8] },
    { name: "R", at: [1, 0] },
    { name: "S", at: [4, 0] },
  ],
  items: [
    { kind: "poly", pts: ["P", "O", "Q"], tone: "accent" },
    { kind: "poly", pts: ["S", "O", "R"], tone: "result" },
    { kind: "seg", a: "P", b: "Q" },
    { kind: "seg", a: "R", b: "S" },
    { kind: "seg", a: "P", b: "S" },
    { kind: "seg", a: "Q", b: "R" },
    { kind: "parallel", a: "P", b: "Q" },
    { kind: "parallel", a: "R", b: "S" },
    { kind: "angle", at: "P", p: "Q", q: "O" },
    { kind: "angle", at: "S", p: "R", q: "O" },
    { kind: "angle", at: "Q", p: "P", q: "O", count: 2 },
    { kind: "angle", at: "R", p: "S", q: "O", count: 2 },
  ],
  captions: [],
  about:
    "Example 4: PQ parallel to RS; PS and QR cross at O, making triangles POQ and SOR, with the alternate angles at P and S, and at Q and R, marked equal.",
  height: 200,
};

/** Example 6: AB and CD crossing at O; triangles AOD and COB. */
export const EXAMPLE_6: FigureSpec = {
  points: [
    { name: "A", at: [0.62, 1.32] },
    { name: "B", at: [3.91, 2.51] },
    { name: "C", at: [3.1, 0.96] },
    { name: "D", at: [1.25, 4.17] },
    { name: "O", at: [2.5, 2] },
  ],
  items: [
    { kind: "poly", pts: ["A", "O", "D"], tone: "accent" },
    { kind: "poly", pts: ["C", "O", "B"], tone: "result" },
    { kind: "seg", a: "A", b: "B" },
    { kind: "seg", a: "C", b: "D" },
    { kind: "seg", a: "A", b: "D" },
    { kind: "seg", a: "C", b: "B" },
    { kind: "angle", at: "O", p: "A", q: "D", tone: "accent" },
    { kind: "angle", at: "O", p: "B", q: "C", tone: "result" },
  ],
  captions: [],
  about:
    "Example 6: segments AB and CD cross at O; triangle AOD and triangle COB, with the vertically opposite angles at O marked.",
  height: 200,
};

/** Example 8: ∆ ABC ~ ∆ PQR with medians CM and RN. */
export const EXAMPLE_8: FigureSpec = {
  points: [
    { name: "A", at: [1.2, 3] },
    { name: "B", at: [0, 0] },
    { name: "C", at: [4, 0] },
    { name: "M", at: [0.6, 1.5] },
    { name: "P", at: [5.72, 1.8] },
    { name: "Q", at: [5, 0] },
    { name: "R", at: [7.4, 0] },
    { name: "N", at: [5.36, 0.9] },
  ],
  items: [
    { kind: "poly", pts: ["A", "M", "C"], tone: "accent" },
    { kind: "poly", pts: ["P", "N", "R"], tone: "accent" },
    { kind: "seg", a: "A", b: "B" },
    { kind: "seg", a: "B", b: "C" },
    { kind: "seg", a: "C", b: "A" },
    { kind: "seg", a: "P", b: "Q" },
    { kind: "seg", a: "Q", b: "R" },
    { kind: "seg", a: "R", b: "P" },
    { kind: "seg", a: "C", b: "M", tone: "result" },
    { kind: "seg", a: "R", b: "N", tone: "result" },
    { kind: "ticks", a: "A", b: "M" },
    { kind: "ticks", a: "M", b: "B" },
    { kind: "ticks", a: "P", b: "N", count: 2 },
    { kind: "ticks", a: "N", b: "Q", count: 2 },
  ],
  captions: [],
  about:
    "Example 8: similar triangles ABC and PQR, with medians CM (M the mid-point of AB) and RN (N the mid-point of PQ); triangles AMC and PNR are shaded.",
  height: 190,
};

/** Theorem 6.6: altitudes AM and PN, then ∆ ABM and ∆ PQN. */
export const AREAS_PROOF: FigureSpec = {
  points: [
    { name: "A", at: [1.2, 3.2] },
    { name: "B", at: [0, 0] },
    { name: "C", at: [4, 0] },
    { name: "M", at: [1.2, 0], step: 1 },
    { name: "P", at: [5.92, 1.92] },
    { name: "Q", at: [5.2, 0] },
    { name: "R", at: [7.6, 0] },
    { name: "N", at: [5.92, 0], step: 1 },
  ],
  items: [
    { kind: "poly", pts: ["A", "B", "M"], tone: "accent", step: 2 },
    { kind: "poly", pts: ["P", "Q", "N"], tone: "accent", step: 2 },
    { kind: "seg", a: "A", b: "B" },
    { kind: "seg", a: "B", b: "C" },
    { kind: "seg", a: "C", b: "A" },
    { kind: "seg", a: "P", b: "Q" },
    { kind: "seg", a: "Q", b: "R" },
    { kind: "seg", a: "R", b: "P" },
    { kind: "angle", at: "B", p: "C", q: "A" },
    { kind: "angle", at: "Q", p: "R", q: "P" },
    { kind: "seg", a: "A", b: "M", tone: "construction", step: 1 },
    { kind: "right", at: "M", p: "C", q: "A", step: 1 },
    { kind: "seg", a: "P", b: "N", tone: "construction", step: 1 },
    { kind: "right", at: "N", p: "R", q: "P", step: 1 },
  ],
  captions: [
    { en: "Given: ∆ ABC ~ ∆ PQR, so ∠B = ∠Q.", hi: "दिया है: ∆ ABC ~ ∆ PQR, इसलिए ∠B = ∠Q।" },
    {
      en: "Draw the altitudes AM ⊥ BC and PN ⊥ QR: the heights for the two areas.",
      hi: "शीर्षलंब AM ⊥ BC और PN ⊥ QR खींचो: दोनों क्षेत्रफलों की ऊँचाइयाँ।",
    },
    {
      en: "∆ ABM and ∆ PQN: ∠B = ∠Q and a right angle each, so they are similar by AA.",
      hi: "∆ ABM और ∆ PQN: ∠B = ∠Q और दोनों में एक समकोण, इसलिए AA से समरूप।",
    },
  ],
  about:
    "Similar triangles ABC and PQR with angle B equal to angle Q; the steps draw the altitudes AM and PN, then shade the small right triangles ABM and PQN.",
  height: 200,
};

/** Exercise 6.6 Q1: PS bisects ∠QPR; through R, TR ∥ SP meets QP extended at T. */
export const BISECTOR: FigureSpec = {
  points: [
    { name: "P", at: [3.2, 2.4] },
    { name: "Q", at: [0, 0] },
    { name: "R", at: [5, 0] },
    { name: "S", at: [2.857, 0] },
    { name: "T", at: [5.6, 4.2], step: 1 },
  ],
  items: [
    { kind: "seg", a: "P", b: "Q" },
    { kind: "seg", a: "Q", b: "R" },
    { kind: "seg", a: "R", b: "P" },
    { kind: "seg", a: "P", b: "S", tone: "accent" },
    { kind: "angle", at: "P", p: "Q", q: "S", tone: "accent" },
    { kind: "angle", at: "P", p: "S", q: "R", tone: "accent" },
    { kind: "seg", a: "P", b: "T", tone: "construction", dashed: true, step: 1 },
    { kind: "seg", a: "T", b: "R", tone: "construction", step: 1 },
    { kind: "parallel", a: "P", b: "S", step: 1 },
    { kind: "parallel", a: "T", b: "R", step: 1 },
    { kind: "ticks", a: "P", b: "T", step: 2 },
    { kind: "ticks", a: "P", b: "R", step: 2 },
  ],
  captions: [
    {
      en: "PS bisects ∠QPR, meeting QR at S.",
      hi: "PS, ∠QPR को समद्विभाजित करती है और QR से S पर मिलती है।",
    },
    {
      en: "Through R draw TR ∥ SP, meeting QP extended at T.",
      hi: "R से TR ∥ SP खींचो, जो बढ़ाई गई QP से T पर मिले।",
    },
    { en: "∠PTR = ∠PRT, so PT = PR.", hi: "∠PTR = ∠PRT, इसलिए PT = PR।" },
  ],
  about:
    "Exercise 6.6 Q1: triangle PQR with PS bisecting angle QPR, S on QR; the steps draw TR parallel to SP, meeting QP extended at T, and mark PT equal to PR.",
  height: 240,
};

/** Exercise 6.6 Q3: ∠ABC obtuse, AD ⊥ CB extended. */
export const OBTUSE: FigureSpec = {
  points: [
    { name: "A", at: [0, 3] },
    { name: "D", at: [0, 0] },
    { name: "B", at: [1.5, 0] },
    { name: "C", at: [5, 0] },
  ],
  items: [
    { kind: "seg", a: "A", b: "B" },
    { kind: "seg", a: "B", b: "C" },
    { kind: "seg", a: "C", b: "A" },
    { kind: "seg", a: "D", b: "B", tone: "construction", dashed: true },
    { kind: "seg", a: "A", b: "D", tone: "construction" },
    { kind: "right", at: "D", p: "A", q: "B" },
    { kind: "angle", at: "B", p: "C", q: "A", label: ">90°", tone: "accent" },
  ],
  captions: [],
  about:
    "Exercise 6.6 Q3: triangle ABC with angle ABC obtuse; CB is extended to D and AD is perpendicular to it.",
  height: 180,
};

/** Exercise 6.6 Q7: chords AB and CD meeting at P inside the circle. */
export const CHORDS: FigureSpec = {
  points: [
    { name: "O", at: [0, 0], isHidden: true },
    { name: "A", at: [-2.27, -1.06] },
    { name: "B", at: [2.05, 1.43] },
    { name: "C", at: [-1.61, 1.92] },
    { name: "D", at: [0.65, -2.41] },
    { name: "P", at: [-0.57, -0.08] },
  ],
  items: [
    { kind: "circle", c: "O", r: 2.5, tone: "muted" },
    { kind: "poly", pts: ["A", "P", "C"], tone: "accent" },
    { kind: "poly", pts: ["D", "P", "B"], tone: "result" },
    { kind: "seg", a: "A", b: "B" },
    { kind: "seg", a: "C", b: "D" },
    { kind: "seg", a: "A", b: "C" },
    { kind: "seg", a: "D", b: "B" },
    { kind: "angle", at: "A", p: "C", q: "P" },
    { kind: "angle", at: "D", p: "B", q: "P" },
  ],
  captions: [],
  about:
    "Exercise 6.6 Q7: a circle with chords AB and CD meeting at P inside it; AC and DB are joined, making triangles APC and DPB, with angle CAP and angle BDP marked equal.",
  height: 220,
};

/** Theorem 6.3's sketch: DP = AB and DQ = AC cut on DE and DF, so PQ ∥ EF. */
export const AAA_SKETCH: FigureSpec = {
  points: [
    { name: "D", at: [1.5, 3] },
    { name: "E", at: [0, 0] },
    { name: "F", at: [5, 0] },
    { name: "P", at: [0.6, 1.2] },
    { name: "Q", at: [3.3, 1.2] },
  ],
  items: [
    { kind: "poly", pts: ["D", "P", "Q"], tone: "accent" },
    { kind: "seg", a: "D", b: "E" },
    { kind: "seg", a: "E", b: "F" },
    { kind: "seg", a: "F", b: "D" },
    { kind: "seg", a: "P", b: "Q", tone: "accent" },
    { kind: "parallel", a: "P", b: "Q" },
    { kind: "parallel", a: "E", b: "F" },
    { kind: "angle", at: "P", p: "D", q: "Q" },
    { kind: "angle", at: "E", p: "D", q: "F" },
    { kind: "note", at: [0.85, 2.3], text: "= AB", prefer: 180 },
    { kind: "note", at: [2.6, 2.3], text: "= AC", prefer: 0 },
  ],
  captions: [],
  about:
    "Triangle DEF with P on DE and Q on DF, DP equal to AB and DQ equal to AC; triangle DPQ is shaded, angle P equals angle E, and PQ is parallel to EF.",
  height: 180,
};
