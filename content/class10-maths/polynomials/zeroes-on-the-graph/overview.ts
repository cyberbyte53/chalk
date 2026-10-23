import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  PlaneForm,
  ZeroPlaneAction,
  ZeroPlaneDerived,
  ZeroPlaneSignal,
  zeroPlaneDef,
} from "@chalk/prop-polynomials";

const r = String.raw;

/** The machine's dots joined up: the graph meets the x-axis at the zeroes; a line once. */
const graph = page(
  "graph",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "The graph of y = p(x) is every point (x, p(x)). On the x-axis y = 0, so the graph meets it exactly at the zeroes (−1 and 4 for x² − 3x − 4). The point on the y-axis is p(0), not a zero. A line meets the x-axis once, at −b/a.",
    );
    const curve = b.prop(zeroPlaneDef, "curve", {
      form: PlaneForm.Coefficients,
      fixed: [1, -3, -4],
      probe: 1,
      isDraggable: false,
      window: { xMin: -3, xMax: 6, yMin: -8, yMax: 8 },
    });
    b.standsFor(curve, "the graph of y = x² − 3x − 4, with a point to slide along it");
    b.studentOnly(curve.action(ZeroPlaneAction.MoveProbe));
    const where = choiceQuestion(b, {
      name: "where",
      prompt: t("Where does the curve meet the x-axis?", "वक्र x-अक्ष से कहाँ मिलता है?"),
      options: [
        {
          id: "right",
          label: t(r`At $x = -1$ and $x = 4$`, r`$x = -1$ और $x = 4$ पर`),
        },
        {
          id: "yaxis",
          label: t(r`At $-4$ on the y-axis`, r`y-अक्ष पर $-4$ पर`),
          feedback: t(
            r`That's where it meets the y-axis: the value $p(0) = -4$. It isn't a zero.`,
            r`वहाँ यह y-अक्ष से मिलता है: मान $p(0) = -4$। यह शून्यक नहीं है।`,
          ),
        },
        {
          id: "lowest",
          label: t(r`At $x = 1.5$`, r`$x = 1.5$ पर`),
          feedback: t(
            "That's the lowest point, where the curve turns. Look where it meets the x-axis.",
            "वह सबसे निचला बिंदु है, जहाँ वक्र मुड़ता है। देखो यह x-अक्ष से कहाँ मिलता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const because = w.body(
      t(
        r`On the x-axis, every point has $y = 0$. So the curve meets the x-axis exactly where $p(x) = 0$: at its zeroes, $-1$ and $4$, the same ones you found with the machine.`,
        r`x-अक्ष पर हर बिंदु का $y = 0$ है। तो वक्र x-अक्ष से ठीक वहीं मिलता है जहाँ $p(x) = 0$: अपने शून्यकों पर, $-1$ और $4$, वही जो तुमने मशीन से खोजे।`,
      ),
      "because",
      { isHidden: true },
    );
    const rule = w.definition(
      t(
        r`**The zeroes of $p(x)$ are the $x$-coordinates of the points where the graph of $y = p(x)$ meets the x-axis.**`,
        r`**$p(x)$ के शून्यक उन बिंदुओं के $x$-निर्देशांक हैं जहाँ $y = p(x)$ का ग्राफ़ x-अक्ष से मिलता है।**`,
      ),
      "rule",
      { isHidden: true },
    );
    const lineIntro = w.body(
      t(
        r`A linear polynomial's graph is a straight line. Here is $y = 2x + 3$. It meets the x-axis exactly once, at its zero: $$-\tfrac{3}{2}$$ That's the zero you found in the last lesson.`,
        r`रैखिक बहुपद का ग्राफ़ एक सीधी रेखा है। यह रहा $y = 2x + 3$। यह x-अक्ष से ठीक एक बार मिलता है, अपने शून्यक पर: $$-\tfrac{3}{2}$$ यही शून्यक तुमने पिछले पाठ में खोजा था।`,
      ),
      "lineIntro",
      { isHidden: true },
    );
    const line = b.prop(
      zeroPlaneDef,
      "line",
      {
        form: PlaneForm.Coefficients,
        fixed: [2, 3],
        isDraggable: false,
        window: { xMin: -4, xMax: 3, yMin: -4, yMax: 6 },
      },
      { isHidden: true },
    );
    b.standsFor(line, "the line y = 2x + 3, meeting the x-axis at −3/2");
    b.when(where.on(QuestionSignal.Correct), [
      theBoard.show(because),
      theBoard.show(rule),
      theBoard.show(lineIntro),
      theBoard.show(line),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("Zeroes on the graph", "ग्राफ़ पर शून्यक")),
      w.body(
        t(
          r`Remember your dots from the value machine? Put in every number, and the dots join into a curve: the **graph** of $y = p(x)$. Every point on it is $(x, p(x))$. Slide the point along it.`,
          r`मशीन वाले अपने बिंदु याद हैं? हर संख्या डालो, तो बिंदु जुड़कर एक वक्र बन जाते हैं: $y = p(x)$ का **ग्राफ़**। इस पर हर बिंदु $(x, p(x))$ है। बिंदु को इस पर सरकाओ।`,
        ),
      ),
      curve,
      where,
      because,
      rule,
      lineIntro,
      line,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Lift a parabola: two, one (touching), none; flip it: the same, upside down. */
const quadratic = page(
  "quadratic",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "A quadratic's graph, a parabola, meets the x-axis twice, touches it once (two zeroes come together), or misses it: at most 2 zeroes. It opens upward when a > 0 and downward when a < 0.",
    );
    const curve = b.prop(zeroPlaneDef, "curve", {
      form: PlaneForm.Coefficients,
      fixed: [1, -2, -3],
      canLift: true,
      canFlip: true,
      isDraggable: false,
      window: { xMin: -3, xMax: 5, yMin: -6, yMax: 8 },
    });
    b.standsFor(
      curve,
      "the parabola y = x² − 2x − 3; dragging its point on the y-axis lifts the whole curve, and a button turns it upside down",
    );
    b.studentOnly(curve.action(ZeroPlaneAction.Lift));
    b.studentOnly(curve.action(ZeroPlaneAction.Flip));
    b.witness(
      curve.learner(ZeroPlaneAction.Lift, { to: 4 }),
      curve.learner(ZeroPlaneAction.Lift, { to: 5 }),
      curve.learner(ZeroPlaneAction.Flip),
    );
    const cases = w.body(
      t(
        r`Two places, then one, where it just touches, then none. When it just touches, the two zeroes have come together into one. For example, $x^2 - 2x + 1$ has only one zero, 1.`,
        r`दो जगह, फिर एक, जहाँ यह बस छूता है, फिर कहीं नहीं। जब यह बस छूता है, तो दोनों शून्यक मिलकर एक हो गए हैं। जैसे, $x^2 - 2x + 1$ का केवल एक शून्यक है, 1।`,
      ),
      "cases",
      { isHidden: true },
    );
    const flipNow = w.body(
      t(
        r`Now tap ↕ to turn it upside down, and lift it again.`,
        r`अब ↕ दबाकर इसे उल्टा करो, और फिर से उठाओ।`,
      ),
      "flipNow",
      { isHidden: true },
    );
    const rule = w.definition(
      t(
        r`When $a > 0$ the parabola opens upward; when $a < 0$ it opens downward. Either way: **a quadratic has two zeroes, one, or none: never more than 2.**`,
        r`जब $a > 0$ हो तो परवलय ऊपर की ओर खुलता है; जब $a < 0$ हो तो नीचे की ओर। दोनों में: **द्विघात बहुपद के दो शून्यक होते हैं, एक, या कोई नहीं: कभी 2 से ज़्यादा नहीं।**`,
      ),
      "rule",
      { isHidden: true },
    );
    const touch = b.prop(
      zeroPlaneDef,
      "touch",
      {
        form: PlaneForm.Coefficients,
        fixed: [1, -4, 4],
        isDraggable: false,
        isEquationShown: false,
        window: { xMin: -1, xMax: 5, yMin: -3, yMax: 6 },
      },
      { isHidden: true },
    );
    b.standsFor(touch, "a parabola that just touches the x-axis at x = 2");
    const count = choiceQuestion(b, {
      name: "count",
      prompt: t("How many zeroes does this one have?", "इसके कितने शून्यक हैं?"),
      options: [
        { id: "right", label: t("1", "1") },
        {
          id: "two",
          label: t("2", "2"),
          feedback: t(
            "It only touches the axis at one point, so that's one zero.",
            "यह अक्ष को केवल एक बिंदु पर छूता है, इसलिए एक शून्यक।",
          ),
        },
        {
          id: "none",
          label: t("0", "0"),
          feedback: t(
            "Touching counts: the curve does meet the axis there.",
            "छूना भी गिना जाता है: वक्र वहाँ अक्ष से मिलता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(
      curve.on(ZeroPlaneSignal.Changed),
      [theBoard.show(cases), theBoard.show(flipNow)],
      curve.derived(ZeroPlaneDerived.ZeroCount).eq(0),
    );
    b.when(
      curve.on(ZeroPlaneSignal.Changed),
      [theBoard.show(rule), theBoard.show(touch), theBoard.show(count)],
      curve.derived(ZeroPlaneDerived.Leading).lt(0),
    );
    return column([
      w.title(t("Two, one or none", "दो, एक या कोई नहीं")),
      w.body(
        t(
          r`The graph of a quadratic is a curve called a **parabola**. **Drag its point on the y-axis to lift the curve, slowly.** How many times does it meet the x-axis?`,
          r`द्विघात बहुपद का ग्राफ़ एक वक्र है जिसे **परवलय** कहते हैं। **वक्र को उठाने के लिए y-अक्ष पर उसका बिंदु धीरे-धीरे खींचो।** यह x-अक्ष से कितनी बार मिलता है?`,
        ),
      ),
      curve,
      cases,
      flipNow,
      rule,
      touch,
      count,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A cubic lifted never meets the axis a fourth time: to cross again, a curve must turn back. */
const atMost = page(
  "at-most",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "A cubic meets the x-axis at most 3 times, whatever the lift: to meet the axis again the curve has to turn back, and a cubic turns at most twice. So a polynomial of degree n has at most n zeroes.",
    );
    const curve = b.prop(zeroPlaneDef, "curve", {
      form: PlaneForm.Coefficients,
      fixed: [1, 0, -4, 0],
      canLift: true,
      isDraggable: false,
      window: { xMin: -3, xMax: 3, yMin: -6, yMax: 6 },
    });
    b.standsFor(curve, "the cubic y = x³ − 4x, with its y-axis point to lift it");
    b.studentOnly(curve.action(ZeroPlaneAction.Lift));
    b.witness(curve.learner(ZeroPlaneAction.Lift, { to: 2 }));
    const why = w.body(
      t(
        r`You can't. To meet the axis again, the curve has to turn back. A line never turns, so it meets the axis once. A parabola turns once, so it meets it at most twice. A cubic turns at most twice, so it meets it at most three times.`,
        r`नहीं हो सकता। अक्ष से दोबारा मिलने के लिए वक्र को वापस मुड़ना पड़ता है। रेखा कभी नहीं मुड़ती, तो अक्ष से एक बार मिलती है। परवलय एक बार मुड़ता है, तो अधिकतम दो बार मिलता है। त्रिघात वक्र अधिकतम दो बार मुड़ता है, तो अधिकतम तीन बार मिलता है।`,
      ),
      "why",
      { isHidden: true },
    );
    const rule = w.definition(
      t(
        r`**A polynomial of degree $n$ has at most $n$ zeroes.**`,
        r`**घात $n$ वाले बहुपद के अधिकतम $n$ शून्यक होते हैं।**`,
      ),
      "rule",
      { isHidden: true },
    );
    b.when(curve.on(ZeroPlaneSignal.Changed), [
      theBoard.show(why),
      theBoard.show(rule),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("At most n", "अधिकतम n")),
      w.body(
        t(
          r`Now a cubic: $$y = x^3 - 4x$$ It meets the x-axis three times: at $-2$, $0$ and $2$. **Lift it, and try to make it meet the axis a fourth time.**`,
          r`अब एक त्रिघात बहुपद: $$y = x^3 - 4x$$ यह x-अक्ष से तीन बार मिलता है: $-2$, $0$ और $2$ पर। **इसे उठाओ, और कोशिश करो कि यह अक्ष से चौथी बार मिले।**`,
        ),
      ),
      curve,
      why,
      rule,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Ex 2.1: count the zeroes from the graph. */
const reading = page(
  "reading",
  (b) => {
    const w = wordsOn(b);
    const graphOf = (
      name: string,
      fixed: number[],
      window: { xMin: number; xMax: number; yMin: number; yMax: number },
      about: string,
    ) => {
      const g = b.prop(zeroPlaneDef, name, {
        form: PlaneForm.Coefficients,
        fixed,
        isDraggable: false,
        isEquationShown: false,
        window,
      });
      b.standsFor(g, about);
      return g;
    };
    const miss = graphOf(
      "miss",
      [1, -2, 3],
      { xMin: -2, xMax: 4, yMin: -2, yMax: 8 },
      "a parabola above the x-axis",
    );
    const three = graphOf(
      "three",
      [1, 0, -4, 0],
      { xMin: -3, xMax: 3, yMin: -6, yMax: 6 },
      "a cubic crossing the x-axis three times",
    );
    const both = graphOf(
      "both",
      [1, -1, 0, 0],
      { xMin: -1.5, xMax: 2, yMin: -2, yMax: 3 },
      "a cubic touching the x-axis at 0 and crossing it at 1",
    );
    const options = (right: string) =>
      [
        { id: "n0", label: t("0", "0") },
        { id: "n1", label: t("1", "1") },
        { id: "n2", label: t("2", "2") },
        { id: "n3", label: t("3", "3") },
      ].map((o) =>
        o.id === right
          ? o
          : {
              ...o,
              feedback: t(
                "Count every point where the curve meets the x-axis, touching included. Where it meets the y-axis doesn't count.",
                "हर वह बिंदु गिनो जहाँ वक्र x-अक्ष से मिलता है, छूना भी। y-अक्ष से मिलना नहीं गिना जाता।",
              ),
            },
      );
    const ask = (name: string, right: string, isLast: boolean) =>
      choiceQuestion(b, {
        name,
        prompt: t("How many zeroes?", "कितने शून्यक?"),
        options: options(right),
        answer: right,
        ...(isLast ? {} : { passes: false }),
      });
    return column([
      w.title(t("Reading the graph", "ग्राफ़ पढ़ना")),
      w.body(t("Count the zeroes from each graph.", "हर ग्राफ़ से शून्यक गिनो।")),
      miss,
      ask("askMiss", "n0", false),
      three,
      ask("askThree", "n3", false),
      both,
      ask("askBoth", "n2", true),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [graph, quadratic, atMost, reading];
