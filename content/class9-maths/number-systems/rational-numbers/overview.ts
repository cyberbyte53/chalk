import {
  PassOn,
  after,
  column,
  expect,
  inOrder,
  page,
  space,
  t,
  theBoard,
  wait,
} from "@chalk/author";
import { NumberColor } from "@chalk/content-source/patterns";
import { QuestionAction, QuestionSignal } from "@chalk/prop";
import {
  ButtonAction,
  ButtonSignal,
  ChoiceAction,
  TextStyle,
  buttonDef,
  choiceDef,
  textDef,
} from "@chalk/prop-basics";
import { NumberLineAction, NumberLineDerived, numberLineDef } from "@chalk/prop-number-line";
import {
  Family,
  NumberSorterAction,
  NumberSorterDerived,
  NumberSorterSignal,
  numberSorterDef,
} from "@chalk/prop-number-sets";

/** How far the counting lines slide: far enough that no thumb reaches the end. */
const FAR = 1_000_000;

/** The options of "do the natural numbers ever stop?", by id. */
const Stop = { Yes: "yes", No: "no" } as const;

const addOne = t(
  "Take any natural number and add 1: you get a bigger natural number. So there is no last one.",
  "कोई भी प्राकृत संख्या लो और उसमें 1 जोड़ो: एक बड़ी प्राकृत संख्या मिलती है। इसलिए कोई आख़िरी प्राकृत संख्या नहीं है।",
);

/** N, W and Z: each defined in words, then a line of its own to slide along. */
const numbersYouKnow = page(
  "numbers-you-know",
  (b) => {
    const title = b.prop(textDef, "title", {
      text: t("Natural numbers, whole numbers and integers", "प्राकृत संख्याएँ, पूर्ण संख्याएँ और पूर्णांक"),
      style: TextStyle.Title,
    });
    const natural = b.prop(textDef, "natural", {
      text: t(
        "The counting numbers are called **natural numbers**. We write them as $\\mathbb{N}$.\n$$1, 2, 3, 4, \\dots$$",
        "गिनती की संख्याओं को **प्राकृत संख्याएँ** कहते हैं। इन्हें $\\mathbb{N}$ से लिखते हैं।\n$$1, 2, 3, 4, \\dots$$",
      ),
      speak: t(
        "The counting numbers are called natural numbers. We write them as N: 1, 2, 3, 4, and so on.",
        "गिनती की संख्याओं को प्राकृत संख्याएँ कहते हैं। इन्हें N से लिखते हैं: 1, 2, 3, 4, और आगे।",
      ),
      style: TextStyle.Definition,
      color: NumberColor.Natural,
    });
    const naturalLine = b.prop(numberLineDef, "naturalLine", {
      from: 0.5,
      to: 10.5,
      pan: { min: 0.5, max: FAR },
      color: NumberColor.Natural,
    });
    const ask = b.prop(choiceDef, "everStop", {
      prompt: t("Do the natural numbers ever stop?", "क्या प्राकृत संख्याएँ कभी ख़त्म होती हैं?"),
      options: [
        { id: Stop.Yes, label: t("Yes", "हाँ"), feedback: addOne },
        { id: Stop.No, label: t("No", "नहीं") },
      ],
      answer: Stop.No,
    });
    const why = b.prop(textDef, "why", { text: addOne }, { isHidden: true });
    const whole = b.prop(textDef, "whole", {
      text: t(
        "The natural numbers together with 0 are called **whole numbers**. We write them as $\\mathbb{W}$.\n$$0, 1, 2, 3, \\dots$$",
        "प्राकृत संख्याओं को 0 के साथ **पूर्ण संख्याएँ** कहते हैं। इन्हें $\\mathbb{W}$ से लिखते हैं।\n$$0, 1, 2, 3, \\dots$$",
      ),
      speak: t(
        "The natural numbers together with 0 are called whole numbers. We write them as W: 0, 1, 2, 3, and so on.",
        "प्राकृत संख्याओं को 0 के साथ पूर्ण संख्याएँ कहते हैं। इन्हें W से लिखते हैं: 0, 1, 2, 3, और आगे।",
      ),
      style: TextStyle.Definition,
      color: NumberColor.Whole,
    });
    const wholeLine = b.prop(numberLineDef, "wholeLine", {
      from: -0.5,
      to: 9.5,
      pan: { min: -0.5, max: FAR },
      color: NumberColor.Whole,
    });
    const integer = b.prop(textDef, "integer", {
      text: t(
        "The whole numbers together with their negatives are called **integers**. We write them as $\\mathbb{Z}$.\n$$\\dots, -3, -2, -1, 0, 1, 2, 3, \\dots$$",
        "पूर्ण संख्याओं को उनकी ऋणात्मक संख्याओं के साथ **पूर्णांक** कहते हैं। इन्हें $\\mathbb{Z}$ से लिखते हैं।\n$$\\dots, -3, -2, -1, 0, 1, 2, 3, \\dots$$",
      ),
      speak: t(
        "The whole numbers together with their negatives are called integers. We write them as Z: and so on, minus 3, minus 2, minus 1, 0, 1, 2, 3, and so on.",
        "पूर्ण संख्याओं को उनकी ऋणात्मक संख्याओं के साथ पूर्णांक कहते हैं। इन्हें Z से लिखते हैं: ऋण 3, ऋण 2, ऋण 1, 0, 1, 2, 3, दोनों ओर आगे।",
      ),
      style: TextStyle.Definition,
      color: NumberColor.Integer,
    });
    const integerLine = b.prop(numberLineDef, "integerLine", {
      from: -3.5,
      to: 3.5,
      pan: { min: -FAR, max: FAR },
      color: NumberColor.Integer,
    });
    const nested = b.prop(textDef, "nested", {
      text: t(
        "Every natural number is a whole number, and every whole number is an integer.",
        "हर प्राकृत संख्या एक पूर्ण संख्या है, और हर पूर्ण संख्या एक पूर्णांक है।",
      ),
    });
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(why), theBoard.pass()]);
    b.witness(
      ask.learner(ChoiceAction.Select, { option: Stop.No }),
      ask.learner(QuestionAction.Check),
    );
    b.noteCheck({
      steps: [
        ask.learner(ChoiceAction.Select, { option: Stop.Yes }),
        ask.learner(QuestionAction.Check),
      ],
      feedback: addOne,
    });
    return column([
      title,
      natural,
      naturalLine,
      ask,
      why,
      whole,
      wholeLine,
      integer,
      integerLine,
      nested,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A fraction for the maths: 7/10 → `\frac{7}{10}`. */
type Fraction = { readonly num: number; readonly den: number };
const tex = (f: Fraction) => `\\frac{${f.num}}{${f.den}}`;
const numberOf = (f: Fraction) => f.num / f.den;
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** The gap the middle rule works on: 3/5 and 4/5. */
const LOW: Fraction = { num: 3, den: 5 };
const HIGH: Fraction = { num: 4, den: 5 };

/** Rounds of halving every gap: 2⁷ − 1 = 127 middles, and the line looks filled. */
const ROUNDS = 7;
/** Rounds whose numbers are named on the line; after that there is no room, only dots. */
const NAMED_ROUNDS = 3;
/** Middles the learner finds one press at a time, before Keep going takes over. */
const BY_HAND = 3;

/** The two numbers being halved, their new middle, and every number already found. */
const PAIR_COLOR = "#2B4CD3";
const NEW_COLOR = NumberColor.Rational;
const OLD_COLOR = NumberColor.Ink;

/** A point k/2^round of the way from 3/5 to 4/5. Round 0 is the two ends (k = 0, 1). */
type Point = { readonly k: number; readonly round: number };

/** The round a point first appears in: 2/4 of the way is 1/2, found in round 1. */
function firstRound(p: Point): number {
  let { k, round } = p;
  while (round > 0 && k % 2 === 0) {
    k /= 2;
    round -= 1;
  }
  return round;
}

/** 3/5 + k/(5·2^round) = (3·2^round + k)/(5·2^round), in lowest terms. */
function fractionOf(p: Point): Fraction {
  const num = LOW.num * 2 ** p.round + p.k;
  const den = LOW.den * 2 ** p.round;
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
}

/** Breadth first: round by round, left to right, the middle of every gap. */
const ORDER: readonly Point[] = Array.from({ length: ROUNDS }, (_, r) => r + 1).flatMap((round) =>
  Array.from({ length: 2 ** (round - 1) }, (_, i) => ({ k: 2 * i + 1, round })),
);

/** The two numbers a middle is the middle of. */
const pairOf = (p: Point): [Point, Point] => [
  { k: p.k - 1, round: p.round },
  { k: p.k + 1, round: p.round },
];

/** Seconds Keep going takes to fill the line, with room to spare. */
const KEEP_GOING_SETTLES = 25;

/** How long Keep going lingers on each middle: slow while they can be read, faster as gaps shrink. */
const pauseAfter = (step: number) => (step < 7 ? 0.7 : step < 15 ? 0.26 : step < 31 ? 0.11 : 0.05);

/** The working for one middle: (a + b)/2 = m, the pair and the middle in their colours. */
function working(p: Point): string {
  const [a, b] = pairOf(p).map(fractionOf);
  const pair = (f: Fraction | undefined) =>
    f === undefined ? "" : `\\textcolor{${PAIR_COLOR}}{${tex(f)}}`;
  return `$\\dfrac{${pair(a)} + ${pair(b)}}{2} = \\textcolor{${NEW_COLOR}}{${tex(fractionOf(p))}}$`;
}

/** Rationals between the integers, what makes a number rational, and the middle rule, applied again and again. */
const rationalNumbers = page(
  "rational-numbers",
  (b) => {
    const title = b.prop(textDef, "title", {
      text: t("Rational numbers", "परिमेय संख्याएँ"),
      style: TextStyle.Title,
    });
    const between = b.prop(textDef, "between", {
      text: t(
        "There are numbers **between** the integers too, like $\\frac{1}{2}$ between 0 and 1, or $-\\frac{1}{3}$ between $-1$ and 0.",
        "पूर्णांकों के **बीच** भी संख्याएँ हैं, जैसे 0 और 1 के बीच $\\frac{1}{2}$, या $-1$ और 0 के बीच $-\\frac{1}{3}$।",
      ),
      speak: t(
        "There are numbers between the integers too, like one half between 0 and 1, or minus one third between minus 1 and 0.",
        "पूर्णांकों के बीच भी संख्याएँ हैं, जैसे 0 और 1 के बीच आधा, या ऋण 1 और 0 के बीच ऋण एक तिहाई।",
      ),
    });
    const examples = b.prop(numberLineDef, "examples", {
      from: -2.5,
      to: 2.5,
      marks: [
        { at: -1.25, label: "−5/4", color: NumberColor.Rational },
        { at: -1 / 3, label: "−1/3", color: NumberColor.Rational },
        { at: 0.5, label: "1/2", color: NumberColor.Rational },
        { at: 1.75, label: "7/4", color: NumberColor.Rational },
      ],
    });
    const definition = b.prop(textDef, "definition", {
      text: t(
        "A **rational number** is a number that can be written as $\\frac{p}{q}$, where $p$ and $q$ are integers and $q \\neq 0$ (division by 0 is not defined). The collection of rational numbers is $\\mathbb{Q}$.",
        "**परिमेय संख्या** वह संख्या है जिसे $\\frac{p}{q}$ के रूप में लिखा जा सके, जहाँ $p$ और $q$ पूर्णांक हैं और $q \\neq 0$ (0 से भाग परिभाषित नहीं है)। परिमेय संख्याओं के संग्रह को $\\mathbb{Q}$ कहते हैं।",
      ),
      speak: t(
        "A rational number is a number that can be written as p over q, where p and q are integers and q is not 0, because division by 0 is not defined. The collection of rational numbers is Q.",
        "परिमेय संख्या वह संख्या है जिसे p बटा q के रूप में लिखा जा सके, जहाँ p और q पूर्णांक हैं और q शून्य नहीं है, क्योंकि 0 से भाग परिभाषित नहीं है। परिमेय संख्याओं के संग्रह को Q कहते हैं।",
      ),
      style: TextStyle.Definition,
      color: NumberColor.Rational,
    });
    const names = b.prop(textDef, "names", {
      text: t(
        "One rational number can be written many ways: $\\frac{1}{2} = \\frac{2}{4} = \\frac{10}{20}$. We usually write the simplest, $\\frac{1}{2}$.",
        "एक परिमेय संख्या कई तरह से लिखी जा सकती है: $\\frac{1}{2} = \\frac{2}{4} = \\frac{10}{20}$। हम आमतौर पर सबसे सरल रूप लिखते हैं, $\\frac{1}{2}$।",
      ),
      speak: t(
        "One rational number can be written many ways: one half equals two fourths equals ten twentieths. We usually write the simplest, one half.",
        "एक परिमेय संख्या कई तरह से लिखी जा सकती है: आधा बराबर दो बटा चार बराबर दस बटा बीस। हम आमतौर पर सबसे सरल रूप लिखते हैं, आधा।",
      ),
    });
    const rule = b.prop(textDef, "rule", {
      text: t(
        "Take any two rational numbers $a$ and $b$. The number exactly in the middle, $\\frac{a+b}{2}$, is also rational, and it lies between them.",
        "कोई भी दो परिमेय संख्याएँ $a$ और $b$ लो। ठीक बीच वाली संख्या, $\\frac{a+b}{2}$, भी परिमेय है, और वह इन दोनों के बीच है।",
      ),
      speak: t(
        "Take any two rational numbers a and b. The number exactly in the middle, a plus b over 2, is also rational, and it lies between them.",
        "कोई भी दो परिमेय संख्याएँ a और b लो। ठीक बीच वाली संख्या, a जमा b बटा 2, भी परिमेय है, और वह इन दोनों के बीच है।",
      ),
      style: TextStyle.Definition,
      color: NumberColor.Rational,
    });
    const again = b.prop(textDef, "again", {
      text: t("**Apply it again and again:**", "**इसे बार-बार लगाओ:**"),
    });
    const room = (numberOf(HIGH) - numberOf(LOW)) * 0.1;
    const gap = b.prop(numberLineDef, "gap", {
      from: numberOf(LOW) - room,
      to: numberOf(HIGH) + room,
      showTicks: false,
      marks: [LOW, HIGH].map((f) => ({
        at: numberOf(f),
        label: `${f.num}/${f.den}`,
        color: OLD_COLOR,
      })),
    });
    const find = b.prop(buttonDef, "find", { label: t("Find the middle", "बीच की संख्या निकालो") });
    const keepGoing = b.prop(
      buttonDef,
      "keepGoing",
      { label: t("Keep going", "आगे बढ़ते रहो") },
      { isHidden: true },
    );
    // The working for the named rounds, shown one at a time under the line.
    const named = ORDER.filter((p) => p.round <= NAMED_ROUNDS);
    const rows = named.map((p, i) =>
      b.prop(textDef, `working${i + 1}`, { text: t(working(p), working(p)) }, { isHidden: true }),
    );
    const always = b.prop(
      textDef,
      "always",
      {
        text: t(
          "Every new number makes two new gaps, and every gap has a middle. So this never ends.",
          "हर नई संख्या दो नए अंतर बनाती है, और हर अंतर का एक बीच होता है। इसलिए यह कभी ख़त्म नहीं होता।",
        ),
      },
      { isHidden: true },
    );
    const infinitely = b.prop(
      textDef,
      "infinitely",
      {
        text: t(
          "Between any two rational numbers there are **infinitely many** rational numbers.",
          "किन्हीं भी दो परिमेय संख्याओं के बीच **अनगिनत** परिमेय संख्याएँ होती हैं।",
        ),
      },
      { isHidden: true },
    );

    // A point is named while there's room (a mark), and always a dot: the dots count the middles.
    const paint = (p: Point, color: string) => {
      const f = fractionOf(p);
      const dot = gap.call(NumberLineAction.PlaceDot, { at: numberOf(f), color });
      if (firstRound(p) > NAMED_ROUNDS) return [dot];
      const mark = gap.call(NumberLineAction.PlaceMark, {
        at: numberOf(f),
        label: `${f.num}/${f.den}`,
        color,
      });
      // The ends are marks only: they are not middles, so they don't count.
      return firstRound(p) === 0 ? [mark] : [mark, dot];
    };
    /** One middle: the last one's pair and middle go back to ink, this pair lights up, its middle appears. */
    const stepTo = (i: number) => {
      const p = ORDER[i];
      if (p === undefined) return [];
      const before = ORDER[i - 1];
      const shown = rows[i];
      const shownBefore = rows[i - 1];
      return [
        ...(before === undefined
          ? []
          : [...pairOf(before), before].flatMap((q) => paint(q, OLD_COLOR))),
        ...pairOf(p).flatMap((q) => paint(q, PAIR_COLOR)),
        ...paint(p, NEW_COLOR),
        ...(shownBefore === undefined ? [] : [theBoard.hide(shownBefore)]),
        ...(shown === undefined ? [] : [theBoard.show(shown)]),
      ];
    };

    const found = gap.derived(NumberLineDerived.DotCount);
    b.is(find.field("isEnabled"), found.lt(BY_HAND));
    b.is(keepGoing.field("isEnabled"), found.eq(BY_HAND));
    for (let i = 0; i < BY_HAND; i++) {
      const handOver = i + 1 === BY_HAND ? [theBoard.hide(find), theBoard.show(keepGoing)] : [];
      b.when(find.on(ButtonSignal.Pressed), inOrder(...stepTo(i), ...handOver), found.eq(i));
    }
    const rest = ORDER.slice(BY_HAND).flatMap((_, j) => {
      const i = BY_HAND + j;
      return [...stepTo(i), wait(pauseAfter(i))];
    });
    // Once the line is full, the last pair and middle go back to ink too: nothing is singled out.
    const last = ORDER[ORDER.length - 1];
    const settle =
      last === undefined ? [] : [...pairOf(last), last].flatMap((q) => paint(q, OLD_COLOR));
    b.when(
      keepGoing.on(ButtonSignal.Pressed),
      inOrder(
        ...rest,
        ...settle,
        theBoard.show(always),
        theBoard.show(infinitely),
        theBoard.pass(),
      ),
      found.eq(BY_HAND),
    );

    for (let i = 0; i < BY_HAND; i++) b.witness(find.learner(ButtonAction.Press), after(0.3));
    b.witness(keepGoing.learner(ButtonAction.Press), after(KEEP_GOING_SETTLES));
    b.witness(expect(theBoard.isPassed.eq(true), "the line fills and the page concludes"));
    return column([
      title,
      between,
      examples,
      definition,
      names,
      rule,
      again,
      gap,
      find,
      keepGoing,
      ...rows,
      always,
      infinitely,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The cards to sort: each with the smallest collection it belongs to. */
const CARDS = [
  { id: "seven", label: "7", family: Family.Natural },
  { id: "zero", label: "0", family: Family.Whole },
  { id: "minusFour", label: "−4", family: Family.Integer },
  { id: "threeFifths", label: "3/5", family: Family.Rational },
  { id: "twelve", label: "12", family: Family.Natural },
  { id: "minusTwoThirds", label: "−2/3", family: Family.Rational },
] as const;

/** Every integer is rational too; sort numbers into the smallest box that holds them. */
const howTheyFit = page(
  "how-they-fit",
  (b) => {
    const title = b.prop(textDef, "title", {
      text: t("How the collections fit together", "ये संग्रह एक-दूसरे में कैसे बैठते हैं"),
      style: TextStyle.Title,
    });
    const overOne = b.prop(textDef, "overOne", {
      text: t(
        "$-25 = \\frac{-25}{1}$ and $0 = \\frac{0}{1}$. Every integer can be written over 1, so every integer is also rational. Each collection sits inside the next, like boxes inside boxes.",
        "$-25 = \\frac{-25}{1}$ और $0 = \\frac{0}{1}$। हर पूर्णांक को 1 के ऊपर लिखा जा सकता है, इसलिए हर पूर्णांक परिमेय भी है। हर संग्रह अगले के अंदर बैठता है, जैसे डिब्बों के अंदर डिब्बे।",
      ),
      speak: t(
        "Minus 25 is minus 25 over 1, and 0 is 0 over 1. Every integer can be written over 1, so every integer is also rational. Each collection sits inside the next, like boxes inside boxes.",
        "ऋण 25 बराबर ऋण 25 बटा 1, और 0 बराबर 0 बटा 1। हर पूर्णांक को 1 के ऊपर लिखा जा सकता है, इसलिए हर पूर्णांक परिमेय भी है। हर संग्रह अगले के अंदर बैठता है, जैसे डिब्बों के अंदर डिब्बे।",
      ),
    });
    const ask = b.prop(textDef, "ask", {
      text: t(
        "**What is the smallest box each number belongs in?** Tap a number, then its box.",
        "**हर संख्या किस सबसे छोटे डिब्बे में आती है?** एक संख्या पर टैप करो, फिर उसके डिब्बे पर।",
      ),
    });
    const sorter = b.prop(numberSorterDef, "sorter", {
      cards: CARDS.map((card) => ({ ...card, placedIn: null })),
      families: [Family.Natural, Family.Whole, Family.Integer, Family.Rational],
      isMarked: true,
      names: {
        [Family.Natural]: t("natural numbers", "प्राकृत संख्याएँ"),
        [Family.Whole]: t("whole numbers", "पूर्ण संख्याएँ"),
        [Family.Integer]: t("integers", "पूर्णांक"),
        [Family.Rational]: t("rational numbers", "परिमेय संख्याएँ"),
      },
    });
    const done = b.prop(
      textDef,
      "done",
      {
        text: t(
          "Every natural number is whole, every whole number is an integer, and every integer is rational.",
          "हर प्राकृत संख्या पूर्ण है, हर पूर्ण संख्या पूर्णांक है, और हर पूर्णांक परिमेय है।",
        ),
      },
      { isHidden: true },
    );
    b.when(
      sorter.on(NumberSorterSignal.Placed),
      [theBoard.show(done), theBoard.pass()],
      sorter.derived(NumberSorterDerived.IsAllRight),
    );
    for (const card of CARDS) {
      b.witness(
        sorter.learner(NumberSorterAction.Pick, { card: card.id }),
        sorter.learner(NumberSorterAction.Drop, { place: card.family }),
      );
    }
    b.witness(expect(theBoard.isPassed.eq(true), "every card in its smallest box passes the page"));
    return column([title, overOne, ask, sorter, done, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. Leave one out to drop it from the build. */
export const overview = [numbersYouKnow, rationalNumbers, howTheyFit];
