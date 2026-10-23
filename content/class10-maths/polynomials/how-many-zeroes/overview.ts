import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { textDef } from "@chalk/prop-basics";
import {
  PlaneForm,
  ZeroPlaneAction,
  ZeroPlaneDerived,
  ZeroPlaneSignal,
  zeroPlaneDef,
} from "@chalk/prop-polynomials";

const r = String.raw;

/** A parabola meets the x-axis in 2, 1 or 0 points: drag its vertex up until it misses. */
const threeCases = page(
  "three-cases",
  (b) => {
    const w = wordsOn(b);
    const plane = b.prop(zeroPlaneDef, "graph", {
      form: PlaneForm.Vertex,
      vertex: [1, -4],
      canSetLeading: true,
      window: { xMin: -4, xMax: 6, yMin: -6, yMax: 8 },
    });
    b.studentOnly(plane.action(ZeroPlaneAction.MoveVertex));
    const after = b.prop(
      textDef,
      "after",
      {
        text: t(
          r`Two points, then one (the parabola just touches: the two zeroes have come together), then none. A quadratic polynomial has **two zeroes, one, or none**. Change $a$ to $-1$: the parabola opens downward, and the same three cases happen upside down.`,
          r`दो बिंदु, फिर एक (परवलय बस छूता है: दोनों शून्यक मिल गए), फिर कोई नहीं। द्विघात बहुपद के **दो शून्यक होते हैं, एक, या कोई नहीं**। $a$ को $-1$ करो: परवलय नीचे की ओर खुलता है, और यही तीन स्थितियाँ उल्टी होती हैं।`,
        ),
      },
      { isHidden: true },
    );
    b.when(
      plane.on(ZeroPlaneSignal.Changed),
      [theBoard.show(after), theBoard.pass()],
      plane.derived(ZeroPlaneDerived.ZeroCount).eq(0),
    );
    b.witness(plane.learner(ZeroPlaneAction.MoveVertex, { x: 1, y: 2 }));
    return column([
      w.title(t("Two, one or none", "दो, एक या कोई नहीं")),
      w.body(
        t(
          r`The graph of $y = ax^2 + bx + c$ is a **parabola**: it opens upward when $a > 0$ and downward when $a < 0$. Drag its lowest point, the vertex, upward. Count where it meets the $x$-axis as you go, and stop when it meets it nowhere.`,
          r`$y = ax^2 + bx + c$ का ग्राफ़ एक **परवलय** है: $a > 0$ होने पर ऊपर की ओर खुलता है और $a < 0$ होने पर नीचे की ओर। इसके सबसे निचले बिंदु, शीर्ष, को ऊपर खींचो। साथ-साथ गिनो कि यह $x$-अक्ष से कहाँ मिलता है, और रुको जब यह कहीं न मिले।`,
        ),
      ),
      plane,
      after,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A cubic meets the axis at most 3 times; two zeroes brought together make it touch. */
const cubic = page(
  "cubic",
  (b) => {
    const w = wordsOn(b);
    const plane = b.prop(zeroPlaneDef, "graph", {
      form: PlaneForm.Zeroes,
      zeroes: [-2, 0, 2],
      window: { xMin: -4, xMax: 4, yMin: -8, yMax: 8 },
    });
    b.studentOnly(plane.action(ZeroPlaneAction.MoveZero));
    const after = b.prop(
      textDef,
      "after",
      {
        text: t(
          r`Where two zeroes meet, the curve touches the axis and turns back: like $x^3 - x^2 = x^2(x - 1)$ at $x = 0$. That point still counts **once**. Try as you like: a cubic never meets the axis more than 3 times.`,
          r`जहाँ दो शून्यक मिलते हैं, वहाँ वक्र अक्ष को छूकर लौट जाता है: जैसे $x^3 - x^2 = x^2(x - 1)$, $x = 0$ पर। वह बिंदु भी **एक ही बार** गिना जाता है। जितना चाहो कोशिश करो: त्रिघात वक्र अक्ष से 3 से ज़्यादा बार नहीं मिलता।`,
        ),
      },
      { isHidden: true },
    );
    b.when(
      plane.on(ZeroPlaneSignal.Changed),
      [theBoard.show(after), theBoard.pass()],
      plane.derived(ZeroPlaneDerived.HasTouch).eq(true),
    );
    b.witness(plane.learner(ZeroPlaneAction.MoveZero, { index: 1, to: 2 }));
    return column([
      w.title(t("A cubic: at most three", "त्रिघात: अधिकतम तीन")),
      w.body(
        t(
          r`This is $y = x^3 - 4x$, with zeroes $-2$, $0$ and $2$. Drag one zero onto another and watch the curve there.`,
          r`यह $y = x^3 - 4x$ है, जिसके शून्यक $-2$, $0$ और $2$ हैं। एक शून्यक को दूसरे पर ले जाओ और वहाँ वक्र देखो।`,
        ),
      ),
      plane,
      after,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** At most n zeroes for degree n; your turn: count the zeroes of a graph with a touch. */
const atMost = page(
  "at-most-n",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t("How many zeroes does this polynomial have?", "इस बहुपद के कितने शून्यक हैं?"),
      options: [
        {
          id: "one",
          label: t("1", "1"),
          feedback: t(
            "Count every point where the curve meets the $x$-axis, touching included.",
            "उन सभी बिंदुओं को गिनो जहाँ वक्र $x$-अक्ष से मिलता है, छूने वाले बिंदु समेत।",
          ),
        },
        { id: "right", label: t("2", "2") },
        {
          id: "three",
          label: t("3", "3"),
          feedback: t(
            r`At $x = 1$ the curve only touches the axis: that is one point, so one zero.`,
            r`$x = 1$ पर वक्र अक्ष को केवल छूता है: वह एक बिंदु है, यानी एक शून्यक।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("At most n zeroes", "अधिकतम n शून्यक")),
      w.definition(
        t(
          r`A polynomial of degree $n$ meets the $x$-axis at most $n$ times, so it has **at most** $n$ **zeroes**: a line one, a quadratic two, a cubic three.`,
          r`घात $n$ का बहुपद $x$-अक्ष से अधिकतम $n$ बार मिलता है, इसलिए उसके **अधिकतम** $n$ **शून्यक** होते हैं: रैखिक के एक, द्विघात के दो, त्रिघात के तीन।`,
        ),
      ),
      w.body(t("Your turn. Count from the graph:", "अब तुम। ग्राफ़ से गिनो:")),
      b.prop(zeroPlaneDef, "graph", {
        form: PlaneForm.Coefficients,
        fixed: [1, 0, -3, 2],
        isDraggable: false,
        isEquationShown: false,
        window: { xMin: -4, xMax: 4, yMin: -4, yMax: 8 },
      }),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [threeCases, cubic, atMost];
