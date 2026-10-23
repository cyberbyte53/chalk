import type Fraction from "fraction.js";
import {
  EquationForm,
  type Line,
  Relation,
  equationOf,
  frac,
  fracTex,
  isNegative,
  isWhole,
  isZero,
  joinTerms,
  relationOf,
} from "./algebra";
import { type Words, fill } from "./words";

/**
 * NCERT's three algebraic methods for a pair of linear equations, worked step by step in exact
 * fractions. Each step is a caption (both languages) and lines of working (TeX). The steps follow
 * the book's own layout: x = 3 − 2y, then 7(3 − 2y) − 15y = 2, then 21 − 14y − 15y = 2, …
 */

export const Method = {
  Substitution: "substitution",
  Elimination: "elimination",
  CrossMultiplication: "crossMultiplication",
} as const;
export type Method = (typeof Method)[keyof typeof Method];

export const Outcome = {
  Unique: "unique",
  None: "none",
  InfinitelyMany: "infinitelyMany",
} as const;
export type Outcome = (typeof Outcome)[keyof typeof Outcome];

export const StepKind = { Step: "step", Check: "check", Result: "result" } as const;
export type StepKind = (typeof StepKind)[keyof typeof StepKind];

/** A numbered step of working, the check at the end, or the closing true/false statement. */
export type Step = {
  readonly caption: Words;
  readonly lines: readonly string[];
  readonly kind?: StepKind;
};

export type Worked = {
  readonly steps: readonly Step[];
  readonly outcome: Outcome;
  /** x and y when there is exactly one solution. */
  readonly solution: readonly [Fraction, Fraction] | null;
};

export type Isolate = { readonly equation: 0 | 1; readonly variable: 0 | 1 };

type Names = readonly [string, string];

/** The coefficient of variable v (0: x, 1: y) in a line. */
const coef = (line: Line, v: 0 | 1): Fraction => frac(v === 0 ? line.a : line.b);
/** k in a x + b y = k. */
const rhs = (line: Line): Fraction => frac(line.c).neg();

const isOne = (f: Fraction) => f.equals(1);

/** A value in brackets for substituting: (2000), \left(\frac{19}{29}\right), (−3). */
const paren = (f: Fraction) => (isWhole(f) ? `(${fracTex(f)})` : `\\left(${fracTex(f)}\\right)`);

/** Plain number in a product: (3)(−74). */
const factor = (f: Fraction) => `(${fracTex(f)})`;

/** a − b written out, bracketing b when it's negative: 8000 - 6000, 16 - (-7)… */
const minusTex = (a: Fraction, b: Fraction) =>
  `${fracTex(a)} - ${isNegative(b) ? `(${fracTex(b)})` : fracTex(b)}`;
const plusTex = (a: Fraction, b: Fraction) =>
  `${fracTex(a)} + ${isNegative(b) ? `(${fracTex(b)})` : fracTex(b)}`;

/** a·(something) as the first term: 7(…), −(…), (…). */
const leadTimes = (a: Fraction, inner: string) =>
  isOne(a) ? inner : a.equals(-1) ? `-${inner}` : `${fracTex(a)}${inner}`;

/** + b·(something) as a later term: + 15(…), − 4(…). */
const nextTimes = (b: Fraction, inner: string) => {
  if (isZero(b)) return "";
  const size = b.abs();
  const body = isOne(size) ? inner : `${fracTex(size)}${inner}`;
  return isNegative(b) ? ` - ${body}` : ` + ${body}`;
};

/** + b·u as a later term: + 6y, − 15y, (nothing for 0). */
const nextTerm = (b: Fraction, name: string) => {
  if (isZero(b)) return "";
  const size = b.abs();
  const body = isOne(size) ? name : `${fracTex(size)}${name}`;
  return isNegative(b) ? ` - ${body}` : ` + ${body}`;
};

const tag = (n: number) => `\\qquad (${n})`;

/** "So x = 4, y = 2." as TeX. */
const answerLine = (names: Names, x: Fraction, y: Fraction) =>
  `${names[0]} = ${fracTex(x)},\\quad ${names[1]} = ${fracTex(y)}`;

/** Check one equation: a(x) + b(y) = k ✓. */
function checkLine(line: Line, x: Fraction, y: Fraction): string {
  const a = coef(line, 0);
  const b = coef(line, 1);
  const first = isZero(a) ? "" : leadTimes(a, paren(x));
  const second = isZero(b) ? "" : first === "" ? leadTimes(b, paren(y)) : nextTimes(b, paren(y));
  const total = a.mul(x).add(b.mul(y));
  return `${first}${second} = ${fracTex(total)}\\ \\checkmark`;
}

function checkStep(eqs: readonly [Line, Line], x: Fraction, y: Fraction): Step {
  return {
    caption: CAPTIONS.check,
    lines: [checkLine(eqs[0], x, y), checkLine(eqs[1], x, y)],
    kind: StepKind.Check,
  };
}

/** The last step when no variable is left: a true or false statement. */
function statementStep(statement: string, isTrue: boolean): Step {
  return {
    caption: fill(isTrue ? CAPTIONS.statementTrue : CAPTIONS.statementFalse, {
      s: plain(statement),
    }),
    lines: [statement],
    kind: StepKind.Result,
  };
}

const plain = (tex: string) =>
  tex
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    .replace(/-/g, "−")
    .replace(/\\[a-z]+/g, "")
    .replace(/[{}]/g, "");

/* ---- the choice a learner makes ---- */

/** The easiest variable to write in terms of the other: one with coefficient ±1, else the first. */
export function easiestIsolate(eqs: readonly [Line, Line]): Isolate {
  for (const equation of [1, 0] as const)
    for (const variable of [0, 1] as const)
      if (coef(eqs[equation], variable).abs().equals(1)) return { equation, variable };
  for (const equation of [0, 1] as const)
    for (const variable of [0, 1] as const)
      if (!isZero(coef(eqs[equation], variable))) return { equation, variable };
  return { equation: 0, variable: 0 };
}

/** The variable whose coefficients are quicker to make equal (the smaller common multiple). */
export function easiestEliminate(eqs: readonly [Line, Line]): 0 | 1 {
  const size = (v: 0 | 1) => {
    const p = coef(eqs[0], v).abs();
    const q = coef(eqs[1], v).abs();
    return isZero(p) || isZero(q) ? Number.POSITIVE_INFINITY : p.lcm(q).valueOf();
  };
  return size(1) < size(0) ? 1 : 0;
}

export const canIsolate = (eqs: readonly [Line, Line], c: Isolate) =>
  !isZero(coef(eqs[c.equation], c.variable));

/* ---- substitution ---- */

function substitution(
  eqs: readonly [Line, Line],
  names: Names,
  form: EquationForm,
  choice: Isolate,
): Worked {
  const i = choice.equation;
  const j = i === 0 ? 1 : 0;
  const v = choice.variable;
  const u = v === 0 ? 1 : 0;
  const [vName, uName] = [names[v], names[u]];
  const A = coef(eqs[i], v);
  const B = coef(eqs[i], u);
  const K = rhs(eqs[i]);
  const P = K.div(A);
  const Q = B.neg().div(A);
  const steps: Step[] = [];

  // Step 1: v = P + Q u, written as NCERT does: x = 3 − 2y, or x = (9 − 3y)/2.
  const asFraction = !A.abs().equals(1) && isWhole(K) && isWhole(B) && !(isWhole(P) && isWhole(Q));
  const top = isNegative(A) ? [K.neg(), B] : [K, B.neg()];
  const exprTex = asFraction
    ? `\\frac{${joinTerms(
        [
          { coefficient: top[0] as Fraction, name: "" },
          { coefficient: top[1] as Fraction, name: uName },
        ],
        true,
      )}}{${fracTex(A.abs())}}`
    : joinTerms(
        [
          { coefficient: P, name: "" },
          { coefficient: Q, name: uName },
        ],
        true,
      );
  steps.push({
    caption: fill(CAPTIONS.isolate, { n: String(i + 1), v: vName, u: uName }),
    lines: [equationOf(eqs[i], names, form, true), `${vName} = ${exprTex}${tag(3)}`],
  });

  // Step 2: put it into the other equation.
  const Aj = coef(eqs[j], v);
  const Bj = coef(eqs[j], u);
  const Kj = rhs(eqs[j]);
  const Cu = Aj.mul(Q).add(Bj);
  const R = Kj.sub(Aj.mul(P));
  const lines: string[] = [];
  if (isZero(Aj)) {
    lines.push(equationOf(eqs[j], names, form, true));
  } else {
    const inner = `\\left(${exprTex}\\right)`;
    // Keep the book's order of terms: x's term first, then y's.
    const vFirst = v === 0;
    const vPart = leadTimes(Aj, inner);
    const uPart = isZero(Bj) ? "" : joinTerms([{ coefficient: Bj, name: uName }], true);
    const substituted = vFirst
      ? `${vPart}${nextTerm(Bj, uName)}`
      : uPart === ""
        ? vPart
        : `${uPart}${nextTimes(Aj, inner)}`;
    lines.push(`${substituted} = ${fracTex(Kj)}`);
    lines.push(
      `${joinTerms(
        [
          { coefficient: Aj.mul(P), name: "" },
          { coefficient: Aj.mul(Q), name: uName },
          { coefficient: Bj, name: uName },
        ],
        true,
      )} = ${fracTex(Kj)}`,
    );
  }
  if (isZero(Cu)) {
    const left = Aj.mul(P);
    steps.push({ caption: fill(CAPTIONS.substituteGone, { n: String(j + 1), u: uName }), lines });
    const statement = `${fracTex(left)} = ${fracTex(Kj)}`;
    const isTrue = left.equals(Kj);
    steps.push(statementStep(statement, isTrue));
    return { steps, outcome: isTrue ? Outcome.InfinitelyMany : Outcome.None, solution: null };
  }
  lines.push(`${joinTerms([{ coefficient: Cu, name: uName }], true)} = ${fracTex(R)}`);
  steps.push({ caption: fill(CAPTIONS.substitute, { n: String(j + 1), u: uName }), lines });

  // Step 3: solve for u (nothing to do when it is already u = …).
  const uValue = R.div(Cu);
  if (!isOne(Cu))
    steps.push({
      caption: fill(CAPTIONS.solveFor, { u: uName }),
      lines: [`${uName} = \\frac{${fracTex(R)}}{${fracTex(Cu)}} = ${fracTex(uValue)}`],
    });

  // Step 4: back into (3).
  const vValue = P.add(Q.mul(uValue));
  const back = isZero(Q)
    ? fracTex(P)
    : isZero(P)
      ? leadTimes(Q, paren(uValue))
      : `${fracTex(P)}${nextTimes(Q, paren(uValue))}`;
  const x = v === 0 ? vValue : uValue;
  const y = v === 0 ? uValue : vValue;
  steps.push({
    caption: fill(CAPTIONS.backInto, { u: uName, value: plain(fracTex(uValue)), n: "3", v: vName }),
    lines: [`${vName} = ${back} = ${fracTex(vValue)}`, answerLine(names, x, y)],
  });
  steps.push(checkStep(eqs, x, y));
  return { steps, outcome: Outcome.Unique, solution: [x, y] };
}

/* ---- elimination ---- */

function elimination(
  eqs: readonly [Line, Line],
  names: Names,
  form: EquationForm,
  chosen: 0 | 1,
): Worked {
  // If neither equation has the chosen variable, there is nothing to remove: remove the other.
  const w: 0 | 1 =
    isZero(coef(eqs[0], chosen)) && isZero(coef(eqs[1], chosen)) ? (chosen === 0 ? 1 : 0) : chosen;
  const u = w === 0 ? 1 : 0;
  const [wName, uName] = [names[w], names[u]];
  const W1 = coef(eqs[0], w);
  const W2 = coef(eqs[1], w);
  const steps: Step[] = [];
  let E1 = eqs[0];
  let E2 = eqs[1];
  let n1 = 1;
  let n2 = 2;
  if (!isZero(W1) && !isZero(W2)) {
    const L = W1.abs().lcm(W2.abs());
    const m1 = L.div(W1.abs());
    const m2 = L.div(W2.abs());
    if (isOne(m1) && isOne(m2)) {
      steps.push({
        caption: fill(CAPTIONS.alreadyEqual, { w: wName, size: plain(fracTex(L)) }),
        lines: [equationOf(eqs[0], names, form, true), equationOf(eqs[1], names, form, true)],
      });
    } else {
      E1 = scale(eqs[0], m1);
      E2 = scale(eqs[1], m2);
      n1 = 3;
      n2 = 4;
      steps.push({
        caption: fill(CAPTIONS.multiply, {
          m1: plain(fracTex(m1)),
          m2: plain(fracTex(m2)),
          w: wName,
          size: plain(fracTex(L)),
        }),
        lines: [
          `${equationOf(E1, names, EquationForm.Equals, true)}${tag(3)}`,
          `${equationOf(E2, names, EquationForm.Equals, true)}${tag(4)}`,
        ],
      });
    }
  }
  // Step 2: add or subtract so the w-terms cancel. Subtract the one that leaves u's coefficient
  // positive, as the book does ((4) − (3) in Example 11).
  const sameSign = isNegative(coef(E1, w)) === isNegative(coef(E2, w));
  let U: Fraction;
  let K: Fraction;
  let caption: Words;
  let working: string;
  const U1 = coef(E1, u);
  const U2 = coef(E2, u);
  const K1 = rhs(E1);
  const K2 = rhs(E2);
  if (isZero(coef(E1, w)) || isZero(coef(E2, w))) {
    // One equation has no w already: use it as it stands.
    const lone = isZero(coef(E1, w)) ? E1 : E2;
    U = coef(lone, u);
    K = rhs(lone);
    caption = fill(CAPTIONS.noW, { n: String(lone === E1 ? n1 : n2), w: wName });
    working = equationOf(lone, names, EquationForm.Equals, true);
  } else if (sameSign) {
    // Leave u's coefficient positive; if it cancels too, leave the number positive.
    const secondFirst = U2.equals(U1) ? !isNegative(K2.sub(K1)) : !isNegative(U2.sub(U1));
    const [top, low] = secondFirst
      ? [
          [U2, K2, n2],
          [U1, K1, n1],
        ]
      : [
          [U1, K1, n1],
          [U2, K2, n2],
        ];
    U = (top[0] as Fraction).sub(low[0] as Fraction);
    K = (top[1] as Fraction).sub(low[1] as Fraction);
    caption = fill(CAPTIONS.subtract, { a: String(low[2]), b: String(top[2]), w: wName });
    working = `(${minusTex(top[0] as Fraction, low[0] as Fraction)})${uName} = ${minusTex(top[1] as Fraction, low[1] as Fraction)}`;
  } else {
    U = U1.add(U2);
    K = K1.add(K2);
    caption = fill(CAPTIONS.add, { a: String(n1), b: String(n2), w: wName });
    working = `(${plusTex(U1, U2)})${uName} = ${plusTex(K1, K2)}`;
  }
  if (isZero(U)) {
    steps.push({ caption, lines: [working] });
    const statement = `0 = ${fracTex(K)}`;
    const isTrue = isZero(K);
    steps.push(statementStep(statement, isTrue));
    return { steps, outcome: isTrue ? Outcome.InfinitelyMany : Outcome.None, solution: null };
  }
  steps.push({
    caption,
    lines: [working, `${joinTerms([{ coefficient: U, name: uName }], true)} = ${fracTex(K)}`],
  });

  // Step 3: solve for u (nothing to do when it is already u = …).
  const uValue = K.div(U);
  if (!isOne(U))
    steps.push({
      caption: fill(CAPTIONS.solveFor, { u: uName }),
      lines: [`${uName} = \\frac{${fracTex(K)}}{${fracTex(U)}} = ${fracTex(uValue)}`],
    });

  // Step 4: into an original equation that has w.
  const back: 0 | 1 = isZero(coef(eqs[0], w)) ? 1 : 0;
  const Wb = coef(eqs[back], w);
  const Ub = coef(eqs[back], u);
  const Kb = rhs(eqs[back]);
  const wValue = Kb.sub(Ub.mul(uValue)).div(Wb);
  // A plain number needs no brackets when nothing multiplies it: 4 + y, not (4) + y.
  const known = isOne(Ub) && !isNegative(uValue) ? fracTex(uValue) : paren(uValue);
  const substituted =
    w === 0
      ? `${leadTimes(Wb, wName === "" ? "" : wName)}${nextTimes(Ub, known)}`
      : `${isZero(Ub) ? "" : leadTimes(Ub, known)}${isZero(Ub) ? joinTerms([{ coefficient: Wb, name: wName }], true) : nextTerm(Wb, wName)}`;
  const rest = Kb.sub(Ub.mul(uValue));
  const x = w === 0 ? wValue : uValue;
  const y = w === 0 ? uValue : wValue;
  steps.push({
    caption: fill(CAPTIONS.backInto, {
      u: uName,
      value: plain(fracTex(uValue)),
      n: String(back + 1),
      v: wName,
    }),
    lines: [
      `${substituted} = ${fracTex(Kb)}`,
      `${joinTerms([{ coefficient: Wb, name: wName }], true)} = ${fracTex(rest)}`,
      // When the coefficient is 1 the line above already reads "w = …".
      ...(isOne(Wb) ? [] : [`${wName} = ${fracTex(wValue)}`]),
      answerLine(names, x, y),
    ],
  });
  steps.push(checkStep(eqs, x, y));
  return { steps, outcome: Outcome.Unique, solution: [x, y] };
}

/** k × the whole equation a x + b y + c = 0. */
const scale = (line: Line, k: Fraction): Line => ({
  a: frac(line.a).mul(k).valueOf(),
  b: frac(line.b).mul(k).valueOf(),
  c: frac(line.c).mul(k).valueOf(),
});

/* ---- cross-multiplication ---- */

function crossMultiplication(eqs: readonly [Line, Line], names: Names): Worked {
  const [l1, l2] = eqs;
  const [a1, b1, c1] = [frac(l1.a), frac(l1.b), frac(l1.c)];
  const [a2, b2, c2] = [frac(l2.a), frac(l2.b), frac(l2.c)];
  const [x, y] = names;
  const steps: Step[] = [];
  steps.push({
    caption: CAPTIONS.general,
    lines: [
      `${equationOf(l1, names, EquationForm.General, true)}${tag(1)}`,
      `${equationOf(l2, names, EquationForm.General, true)}${tag(2)}`,
      `a_1 = ${fracTex(a1)},\\ b_1 = ${fracTex(b1)},\\ c_1 = ${fracTex(c1)}`,
      `a_2 = ${fracTex(a2)},\\ b_2 = ${fracTex(b2)},\\ c_2 = ${fracTex(c2)}`,
    ],
  });
  const X = b1.mul(c2).sub(b2.mul(c1));
  const Y = c1.mul(a2).sub(c2.mul(a1));
  const D = a1.mul(b2).sub(a2.mul(b1));
  steps.push({
    caption: CAPTIONS.cross,
    lines: [
      `\\frac{${x}}{b_1c_2 - b_2c_1} = \\frac{${y}}{c_1a_2 - c_2a_1}`,
      "= \\frac{1}{a_1b_2 - a_2b_1}",
    ],
  });
  // Each bottom under its top, as in the diagram's headings x, y, 1: short enough for a phone.
  const bottoms = [
    `${x} \\to ${factor(b1)}${factor(c2)} - ${factor(b2)}${factor(c1)} = ${fracTex(X)}`,
    `${y} \\to ${factor(c1)}${factor(a2)} - ${factor(c2)}${factor(a1)} = ${fracTex(Y)}`,
    `1 \\to ${factor(a1)}${factor(b2)} - ${factor(a2)}${factor(b1)} = ${fracTex(D)}`,
  ];
  if (isZero(D)) {
    const relation = relationOf(l1, l2);
    const isMany = relation === Relation.Coincident;
    steps.push({
      caption: isMany ? CAPTIONS.crossZeroMany : CAPTIONS.crossZeroNone,
      lines: [
        bottoms[2] as string,
        isMany
          ? "\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}"
          : "\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\ne \\frac{c_1}{c_2}",
      ],
    });
    return { steps, outcome: isMany ? Outcome.InfinitelyMany : Outcome.None, solution: null };
  }
  steps.push({
    caption: fill(CAPTIONS.bottoms, { x, y }),
    lines: [
      ...bottoms,
      `\\frac{${x}}{${fracTex(X)}} = \\frac{${y}}{${fracTex(Y)}} = \\frac{1}{${fracTex(D)}}`,
    ],
  });
  const xv = X.div(D);
  const yv = Y.div(D);
  steps.push({
    caption: fill(CAPTIONS.readOff, { x, y }),
    lines: [
      `${x} = \\frac{${fracTex(X)}}{${fracTex(D)}} = ${fracTex(xv)},\\quad ${y} = \\frac{${fracTex(Y)}}{${fracTex(D)}} = ${fracTex(yv)}`,
    ],
  });
  steps.push(checkStep(eqs, xv, yv));
  return { steps, outcome: Outcome.Unique, solution: [xv, yv] };
}

/* ---- all three ---- */

export function workedSolution(
  eqs: readonly [Line, Line],
  names: Names,
  form: EquationForm,
  method: Method,
  choice: { isolate: Isolate | null; eliminate: 0 | 1 | null },
): Worked {
  switch (method) {
    case Method.Substitution: {
      const c = choice.isolate ?? easiestIsolate(eqs);
      return substitution(eqs, names, form, canIsolate(eqs, c) ? c : easiestIsolate(eqs));
    }
    case Method.Elimination:
      return elimination(eqs, names, form, choice.eliminate ?? easiestEliminate(eqs));
    case Method.CrossMultiplication:
      return crossMultiplication(eqs, names);
  }
}

/** A step's working as plain text, for the observation. */
export const stepText = (step: Step): string => step.lines.map(plain).join("; ");

/* ---- the captions ---- */

export const CAPTIONS = {
  isolate: {
    en: "From equation ({n}), write {v} in terms of {u}.",
    hi: "समीकरण ({n}) से {v} को {u} के पदों में लिखो।",
  },
  substitute: {
    en: "Put this into equation ({n}). Now only {u} is left.",
    hi: "इसे समीकरण ({n}) में रखो। अब केवल {u} बचा है।",
  },
  substituteGone: {
    en: "Put this into equation ({n}). The {u}-terms cancel: no variable is left.",
    hi: "इसे समीकरण ({n}) में रखो। {u} वाले पद कट जाते हैं: कोई चर नहीं बचता।",
  },
  solveFor: { en: "Solve for {u}.", hi: "{u} का मान निकालो।" },
  backInto: {
    en: "Put {u} = {value} into equation ({n}) to find {v}.",
    hi: "{v} पाने के लिए {u} = {value} को समीकरण ({n}) में रखो।",
  },
  check: {
    en: "Check: both equations are satisfied.",
    hi: "जाँच: दोनों समीकरण संतुष्ट होते हैं।",
  },
  statementTrue: {
    en: "{s} is true whatever the variables are. So the pair has infinitely many solutions.",
    hi: "{s} चरों के किसी भी मान के लिए सत्य है। इसलिए इस युग्म के अपरिमित रूप से अनेक हल हैं।",
  },
  statementFalse: {
    en: "{s} is false. So no values can satisfy both equations: the pair has no solution.",
    hi: "{s} असत्य है। इसलिए कोई भी मान दोनों समीकरणों को संतुष्ट नहीं कर सकते: इस युग्म का कोई हल नहीं है।",
  },
  multiply: {
    en: "Multiply equation (1) by {m1} and equation (2) by {m2}, so both {w}-terms have size {size}.",
    hi: "समीकरण (1) को {m1} से और समीकरण (2) को {m2} से गुणा करो, ताकि दोनों {w} वाले पदों का आकार {size} हो जाए।",
  },
  alreadyEqual: {
    en: "The {w}-terms already have the same size, {size}. Nothing to multiply.",
    hi: "{w} वाले पदों का आकार पहले से एक ही है, {size}। गुणा करने की ज़रूरत नहीं।",
  },
  subtract: {
    en: "Subtract equation ({a}) from equation ({b}). The {w}-terms cancel.",
    hi: "समीकरण ({b}) में से समीकरण ({a}) घटाओ। {w} वाले पद कट जाते हैं।",
  },
  add: {
    en: "Add equations ({a}) and ({b}). The {w}-terms cancel.",
    hi: "समीकरण ({a}) और ({b}) को जोड़ो। {w} वाले पद कट जाते हैं।",
  },
  noW: {
    en: "Equation ({n}) has no {w} in it already.",
    hi: "समीकरण ({n}) में पहले से कोई {w} नहीं है।",
  },
  general: {
    en: "Write both equations in the form a x + b y + c = 0 and read off the coefficients.",
    hi: "दोनों समीकरणों को a x + b y + c = 0 के रूप में लिखो और गुणांक पढ़ो।",
  },
  cross: {
    en: "Cross-multiply along the arrows. Each bottom is the product going down minus the product going up.",
    hi: "तीरों के साथ वज्र-गुणन करो। हर एक हर है: नीचे जाने वाला गुणनफल घटा ऊपर जाने वाला गुणनफल।",
  },
  bottoms: {
    en: "Work out each bottom: under {x}, under {y} and under 1.",
    hi: "हर एक हर का मान निकालो: {x} के नीचे, {y} के नीचे और 1 के नीचे।",
  },
  readOff: {
    en: "Read off {x} and {y} from the equal fractions.",
    hi: "बराबर भिन्नों से {x} और {y} पढ़ो।",
  },
  crossZeroMany: {
    en: "The last bottom, a₁b₂ − a₂b₁, is 0, so there is no unique solution. All three ratios are equal: infinitely many solutions.",
    hi: "आख़िरी हर, a₁b₂ − a₂b₁, 0 है, इसलिए कोई अद्वितीय हल नहीं। तीनों अनुपात बराबर हैं: अपरिमित रूप से अनेक हल।",
  },
  crossZeroNone: {
    en: "The last bottom, a₁b₂ − a₂b₁, is 0, so there is no unique solution. c₁/c₂ is different: no solution.",
    hi: "आख़िरी हर, a₁b₂ − a₂b₁, 0 है, इसलिए कोई अद्वितीय हल नहीं। c₁/c₂ अलग है: कोई हल नहीं।",
  },
} as const satisfies Record<string, Words>;
