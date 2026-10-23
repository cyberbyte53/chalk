import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AreaAction,
  AreaDerived,
  QuadraticSceneKind,
  areaBuilderDef,
} from "@chalk/prop-quadratics";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: the school mela, Riya in charge of 10B's stall, Kabir's rocket. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const notice = sceneOn(
    b,
    "notice",
    QuadraticSceneKind.MelaNotice,
    "the school corridor: a poster for the annual mela, Riya reading it, Kabir pointing at a rocket drawn in the corner",
  );
  return column([
    w.title(t("A bigger stall", "एक बड़ा स्टॉल")),
    notice,
    w.body(
      t(
        'Last time, Riya and Kabir ran 10B\'s lemonade-and-samosa stall and balanced the cash box on mela night. It went so well that for the big annual mela, in three weeks, the class has been given a proper plot of its own, and Riya is planning it again. Kabir has a new idea for the opening: a water-bottle rocket, with himself as "chief of rockets".',
        'पिछली बार रिया और कबीर ने 10B का नींबू-पानी और समोसे का स्टॉल चलाया था और मेले की रात गल्ले का हिसाब मिलाया था। वह इतना अच्छा चला कि तीन हफ़्ते बाद होने वाले बड़े सालाना मेले के लिए कक्षा को अपना एक पूरा प्लॉट मिला है, और योजना फिर से रिया बना रही है। उद्घाटन के लिए कबीर के पास नया विचार है: पानी की बोतल वाला रॉकेट, और ख़ुद "रॉकेट प्रमुख"।',
      ),
    ),
    w.definition(
      t(
        "**Riya's list.** (1) The stall's plot must be 300 m², and its length one metre more than twice its breadth. (2) Work out how many toys to make so the cost of making them comes to ₹750. (3) Plan the trip to the wholesale market. (4) Kabir's rocket: when will it be 15 m up?",
        "**रिया की सूची।** (1) स्टॉल का प्लॉट 300 m² का हो, और उसकी लंबाई चौड़ाई के दुगुने से एक मीटर ज़्यादा। (2) कितने खिलौने बनाएँ कि उन्हें बनाने की लागत ₹750 हो। (3) थोक बाज़ार की यात्रा की योजना। (4) कबीर का रॉकेट: वह 15 m ऊपर कब होगा?",
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: every item on the list needs a number that is squared. The stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const day = sceneOn(
    b,
    "day",
    QuadraticSceneKind.MelaDay,
    "the goal: mela day, 10B's stall with a crowd, flags, toys on the table and Kabir's rocket high in the sky",
  );
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    w.body(
      t(
        "Every item on Riya's list hides an unknown number. And in every one, that unknown ends up **multiplied by itself**: breadth times length, number of toys times price per toy, time times time for the rocket. Equations like that are called **quadratic equations**. This chapter is about solving them.",
        "रिया की सूची की हर चीज़ में एक अज्ञात संख्या छिपी है। और हर एक में वह अज्ञात आख़िर में **अपने आप से गुणा** होती है: चौड़ाई गुणा लंबाई, खिलौनों की संख्या गुणा हर खिलौने का दाम, रॉकेट के लिए समय गुणा समय। ऐसे समीकरणों को **द्विघात समीकरण** कहते हैं। यह अध्याय उन्हें हल करने के बारे में है।",
      ),
    ),
    day,
    w.definition(
      t(
        "**The stops on the way.** (1) Writing the equation: *this lesson*. (2) Solving it by factorising. (3) Completing the square. (4) The quadratic formula, which always works. (5) Equations in disguise, and word problems. (6) Is it even possible? Telling, before solving, whether an answer exists.",
        "**रास्ते के पड़ाव।** (1) समीकरण लिखना: *यह पाठ*। (2) गुणनखंड से हल करना। (3) पूर्ण वर्ग बनाना। (4) द्विघाती सूत्र, जो हमेशा काम करता है। (5) छिपे समीकरण और शाब्दिक प्रश्न। (6) क्या यह संभव भी है? हल करने से पहले बताना कि उत्तर है या नहीं।",
      ),
    ),
    w.body(
      t(
        "First stop: what exactly is a quadratic equation, and how do we write one from a situation?",
        "पहला पड़ाव: द्विघात समीकरण ठीक-ठीक है क्या, और किसी स्थिति से उसे कैसे लिखते हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Recap from Chapter 2: a quadratic polynomial, with a rectangle's area as one. */
const polynomial = page(
  "polynomial",
  (b) => {
    const w = wordsOn(b);
    const plot = b.prop(areaBuilderDef, "plot", {
      x: 5,
      m: 2,
      n: 1,
      target: null,
      step: 1,
      xMax: 15,
      unit: "m",
      canMove: true,
      showEquation: false,
    });
    b.studentOnly(plot.action(AreaAction.Nudge));
    b.standsFor(
      plot,
      "a rectangle with breadth x and length 2x + 1; the learner changes x and reads the area x(2x + 1)",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(r`Which of these is a quadratic polynomial?`, r`इनमें से कौन-सा द्विघात बहुपद है?`),
      options: [
        { id: "right", label: t(r`$3x^2 - 5x + 1$`, r`$3x^2 - 5x + 1$`) },
        {
          id: "linear",
          label: t(r`$5x + 1$`, r`$5x + 1$`),
          feedback: t(
            "Its highest power of x is 1: it is linear.",
            "इसमें x की सबसे बड़ी घात 1 है: यह रैखिक है।",
          ),
        },
        {
          id: "cubic",
          label: t(r`$x^3 + 2x^2$`, r`$x^3 + 2x^2$`),
          feedback: t(
            r`Its highest power is 3 ($x^3$): it is cubic.`,
            r`इसकी सबसे बड़ी घात 3 है ($x^3$): यह त्रिघात है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A quick recap: quadratic polynomials", "छोटा दोहराव: द्विघात बहुपद")),
      w.definition(
        t(
          r`**Quadratic polynomial.** In Chapter 2 you met polynomials. A polynomial whose highest power of $x$ is 2 is a **quadratic polynomial**. Every one can be written as $$ax^2 + bx + c$$ where $a$, $b$, $c$ are real numbers called its **coefficients**, and $a \neq 0$.`,
          r`**द्विघात बहुपद।** अध्याय 2 में तुमने बहुपद देखे। जिस बहुपद में $x$ की सबसे बड़ी घात 2 हो, वह **द्विघात बहुपद** है। हर एक को ऐसे लिखा जा सकता है: $$ax^2 + bx + c$$ जहाँ $a$, $b$, $c$ वास्तविक संख्याएँ हैं, जिन्हें **गुणांक** कहते हैं, और $a \neq 0$।`,
        ),
      ),
      w.body(
        t(
          r`They turn up whenever an unknown is multiplied by itself. A rectangle with breadth $x$ and length $2x + 1$ has area $$x(2x + 1) = 2x^2 + x$$ which is a quadratic polynomial with $a = 2$, $b = 1$, $c = 0$. Change the breadth and watch the area.`,
          r`ये तब आते हैं जब कोई अज्ञात अपने आप से गुणा होता है। चौड़ाई $x$ और लंबाई $2x + 1$ वाले आयत का क्षेत्रफल है $$x(2x + 1) = 2x^2 + x$$ जो एक द्विघात बहुपद है, जिसमें $a = 2$, $b = 1$, $c = 0$। चौड़ाई बदलो और क्षेत्रफल देखो।`,
        ),
      ),
      plot,
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A quadratic equation, its standard form, and why a can't be 0. */
const equation = page(
  "equation",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`In $ax^2 + bx + c = 0$, why must $a$ not be 0?`,
        r`$ax^2 + bx + c = 0$ में $a$ शून्य क्यों नहीं होना चाहिए?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            r`With $a = 0$ the $x^2$ term is gone, and the equation is just linear`,
            r`$a = 0$ होने पर $x^2$ वाला पद चला जाता है, और समीकरण बस रैखिक रह जाता है`,
          ),
        },
        {
          id: "divide",
          label: t("Because we divide by a", "क्योंकि हम a से भाग देते हैं"),
          feedback: t(
            r`Some methods do divide by $a$, but the real reason is simpler: with $a = 0$ there is no $x^2$ left, so it isn't quadratic at all.`,
            r`कुछ तरीक़े $a$ से भाग देते हैं, पर असली कारण आसान है: $a = 0$ होने पर $x^2$ बचता ही नहीं, तो यह द्विघात है ही नहीं।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Quadratic equations", "द्विघात समीकरण")),
      w.definition(
        t(
          r`**Quadratic equation.** When a quadratic polynomial is set equal to zero, we get a **quadratic equation**. A quadratic equation in $x$ has the form $$ax^2 + bx + c = 0$$ where $a$, $b$, $c$ are real numbers and $a \neq 0$.`,
          r`**द्विघात समीकरण।** जब किसी द्विघात बहुपद को शून्य के बराबर रखा जाता है, तो **द्विघात समीकरण** मिलता है। $x$ में द्विघात समीकरण का रूप है $$ax^2 + bx + c = 0$$ जहाँ $a$, $b$, $c$ वास्तविक संख्याएँ हैं और $a \neq 0$।`,
        ),
      ),
      w.definition(
        t(
          r`**Standard form.** Written with its terms in descending powers of $x$, as $ax^2 + bx + c = 0$, the equation is in **standard form**. For example, $4x - 3x^2 + 2 = 0$ in standard form is $$-3x^2 + 4x + 2 = 0$$`,
          r`**मानक रूप।** जब पद $x$ की घटती घातों में लिखे हों, जैसे $ax^2 + bx + c = 0$, तो समीकरण **मानक रूप** में है। उदाहरण के लिए, $4x - 3x^2 + 2 = 0$ का मानक रूप है $$-3x^2 + 4x + 2 = 0$$`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 2: simplify first, then decide. The two traps. */
const simplify = page(
  "simplify",
  (b) => {
    const w = wordsOn(b);
    const trap = choiceQuestion(b, {
      name: "trap",
      prompt: t(
        r`Is $x(x + 1) + 8 = (x + 2)(x - 2)$ a quadratic equation? Simplify both sides first.`,
        r`क्या $x(x + 1) + 8 = (x + 2)(x - 2)$ द्विघात समीकरण है? पहले दोनों पक्ष सरल करो।`,
      ),
      options: [
        { id: "right", label: t("No", "नहीं") },
        {
          id: "yes",
          label: t("Yes", "हाँ"),
          feedback: t(
            r`Left: $x^2 + x + 8$. Right: $x^2 - 4$. The $x^2$ on both sides cancels, leaving $x + 12 = 0$: that's linear.`,
            r`बायाँ: $x^2 + x + 8$। दायाँ: $x^2 - 4$। दोनों ओर का $x^2$ कट जाता है, बचता है $x + 12 = 0$: यह रैखिक है।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const cube = choiceQuestion(b, {
      name: "cube",
      prompt: t(
        r`Is $(x + 2)^3 = x^3 - 4$ a quadratic equation? (Use $(x + 2)^3 = x^3 + 6x^2 + 12x + 8$.)`,
        r`क्या $(x + 2)^3 = x^3 - 4$ द्विघात समीकरण है? ($(x + 2)^3 = x^3 + 6x^2 + 12x + 8$ का उपयोग करो।)`,
      ),
      options: [
        { id: "right", label: t("Yes", "हाँ") },
        {
          id: "no",
          label: t("No, it's cubic", "नहीं, यह त्रिघात है"),
          feedback: t(
            r`The $x^3$ is on both sides, so it cancels: $6x^2 + 12x + 12 = 0$, which is quadratic.`,
            r`$x^3$ दोनों ओर है, इसलिए कट जाता है: $6x^2 + 12x + 12 = 0$, जो द्विघात है।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(trap.on(QuestionSignal.Correct), theBoard.show(cube));
    return column([
      w.title(t("Simplify before you decide", "तय करने से पहले सरल करो")),
      w.body(
        t(
          r`An equation can look quadratic and not be one, or look cubic and turn out quadratic. So first expand and move everything to one side, then look at the highest power. For example, $$(x - 2)^2 + 1 = 2x - 3$$ expands to $$x^2 - 4x + 5 = 2x - 3$$ that is, $$x^2 - 6x + 8 = 0$$ which is of the form $ax^2 + bx + c = 0$. So it **is** a quadratic equation.`,
          r`कोई समीकरण द्विघात दिखकर भी न हो, या त्रिघात दिखकर द्विघात निकले। इसलिए पहले खोलो और सब कुछ एक ओर ले जाओ, फिर सबसे बड़ी घात देखो। उदाहरण के लिए, $$(x - 2)^2 + 1 = 2x - 3$$ खोलने पर $$x^2 - 4x + 5 = 2x - 3$$ यानी $$x^2 - 6x + 8 = 0$$ जो $ax^2 + bx + c = 0$ के रूप का है। तो यह द्विघात समीकरण **है**।`,
        ),
      ),
      trap,
      cube,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 1: turning a situation into an equation (marbles, toys). */
const situations = page(
  "situations",
  (b) => {
    const w = wordsOn(b);
    const toys = choiceQuestion(b, {
      name: "toys",
      prompt: t(
        r`A workshop makes $x$ toys in a day. Each toy costs $55 - x$ rupees to make, and the day's total cost is ₹750. Which equation does $x$ satisfy?`,
        r`एक कारख़ाना दिन में $x$ खिलौने बनाता है। हर खिलौना बनाने की लागत $55 - x$ रुपये है, और दिन की कुल लागत ₹750 है। $x$ कौन-सा समीकरण संतुष्ट करता है?`,
      ),
      options: [
        { id: "right", label: t(r`$x^2 - 55x + 750 = 0$`, r`$x^2 - 55x + 750 = 0$`) },
        {
          id: "sum",
          label: t(r`$x + (55 - x) = 750$`, r`$x + (55 - x) = 750$`),
          feedback: t(
            "Total cost is the number of toys **times** the cost of each, not plus.",
            "कुल लागत खिलौनों की संख्या **गुणा** हर एक की लागत है, जोड़ नहीं।",
          ),
        },
        {
          id: "sign",
          label: t(r`$x^2 + 55x - 750 = 0$`, r`$x^2 + 55x - 750 = 0$`),
          feedback: t(
            r`$x(55 - x) = 750$ gives $55x - x^2 = 750$. Move everything to one side and multiply by $-1$ carefully.`,
            r`$x(55 - x) = 750$ से $55x - x^2 = 750$। सब कुछ एक ओर ले जाओ और ध्यान से $-1$ से गुणा करो।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("From a situation to an equation", "स्थिति से समीकरण तक")),
      w.body(
        t(
          "To write a situation as an equation: (1) call the unknown x, (2) write every other quantity in terms of x, (3) write what the situation says is equal, (4) simplify into standard form.",
          "किसी स्थिति को समीकरण में लिखने के लिए: (1) अज्ञात को x कहो, (2) बाक़ी हर राशि x में लिखो, (3) लिखो कि स्थिति के अनुसार क्या बराबर है, (4) सरल करके मानक रूप में लाओ।",
        ),
      ),
      w.body(
        t(
          r`**John and Jivanti** together have 45 marbles. Each loses 5, and the product of what they have left is 124. Let John have $x$ marbles. Then Jivanti has $45 - x$. After losing 5 each, they have $x - 5$ and $40 - x$. So $$(x - 5)(40 - x) = 124$$ Expanding the left side: $$-x^2 + 45x - 200 = 124$$ and so $$x^2 - 45x + 324 = 0$$`,
          r`**जॉन और जीवंती** के पास मिलाकर 45 कंचे हैं। दोनों 5-5 खो देते हैं, और बचे कंचों का गुणनफल 124 है। मान लो जॉन के पास $x$ कंचे थे। तब जीवंती के पास $45 - x$। 5-5 खोने के बाद उनके पास $x - 5$ और $40 - x$ हैं। तो $$(x - 5)(40 - x) = 124$$ बायाँ पक्ष खोलने पर: $$-x^2 + 45x - 200 = 124$$ और इसलिए $$x^2 - 45x + 324 = 0$$`,
        ),
      ),
      toys,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the plot: write it, then find the breadth by trying. Guessing is slow. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ground = sceneOn(
      b,
      "ground",
      QuadraticSceneKind.StallPlot,
      "the school ground: a rectangle chalked on the grass, breadth x and length 2x + 1, Riya and Kabir holding a tape",
    );
    const plot = b.prop(areaBuilderDef, "plot", {
      x: 5,
      m: 2,
      n: 1,
      target: 300,
      step: 1,
      xMax: 15,
      unit: "m",
      canMove: true,
      showEquation: true,
    });
    b.studentOnly(plot.action(AreaAction.Nudge));
    b.standsFor(
      plot,
      "the stall's plot: breadth x, length 2x + 1, area x(2x + 1); the target is 300 m², i.e. 2x² + x − 300 = 0",
    );
    const goal = goalQuestion(b, {
      about: plot,
      prompt: t(
        "Change the breadth until the plot's area is exactly 300 m².",
        "चौड़ाई तब तक बदलो जब तक प्लॉट का क्षेत्रफल ठीक 300 m² न हो जाए।",
      ),
      isMet: plot.derived(AreaDerived.IsOnTarget),
      solve: Array.from({ length: 7 }, () => plot.learner(AreaAction.Nudge, { by: 1 })),
      notes: [
        {
          when: plot.field("x").lt(12),
          say: t(
            "The area is still under 300 m². Make the breadth bigger.",
            "क्षेत्रफल अभी 300 m² से कम है। चौड़ाई बढ़ाओ।",
          ),
          reach: [],
        },
        {
          when: plot.field("x").gt(12),
          say: t(
            "Now the area is over 300 m². Make the breadth smaller.",
            "अब क्षेत्रफल 300 m² से ज़्यादा है। चौड़ाई घटाओ।",
          ),
          reach: Array.from({ length: 9 }, () => plot.learner(AreaAction.Nudge, { by: 1 })),
        },
      ],
    });
    const slow = w.body(
      t(
        r`A breadth of 12 m and a length of 25 m. It worked, but only because 12 is a whole number and we tried them one by one. What if the answer were 11.73? Or what if the plot had to be 528 m²? Trying breadths would take ages. Riya needs a **method**, not a guess. That's the next stop.`,
        r`चौड़ाई 12 m और लंबाई 25 m। यह चल गया, पर सिर्फ़ इसलिए कि 12 पूर्ण संख्या है और हमने एक-एक करके आज़माया। अगर उत्तर 11.73 होता? या प्लॉट 528 m² का होना होता? चौड़ाइयाँ आज़माने में बहुत देर लगती। रिया को अनुमान नहीं, एक **विधि** चाहिए। वही अगला पड़ाव है।`,
      ),
      "slow",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(slow));
    return column([
      w.title(t("Back to the plot", "फिर प्लॉट पर")),
      ground,
      w.body(
        t(
          r`Riya calls the breadth $x$ metres. Then the length is $2x + 1$ metres, and the area must be 300 m²: $$x(2x + 1) = 300$$ that is, $$2x^2 + x - 300 = 0$$ A quadratic equation. Kabir: "So what's $x$?" Riya: "Let's try some breadths."`,
          r`रिया चौड़ाई को $x$ मीटर कहती है। तब लंबाई $2x + 1$ मीटर है, और क्षेत्रफल 300 m² होना चाहिए: $$x(2x + 1) = 300$$ यानी $$2x^2 + x - 300 = 0$$ एक द्विघात समीकरण। कबीर: "तो $x$ क्या है?" रिया: "कुछ चौड़ाइयाँ आज़माते हैं।"`,
        ),
      ),
      plot,
      goal,
      slow,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 4.1 Q2, written out, then the learner's turn. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const rohan = choiceQuestion(b, {
      name: "rohan",
      prompt: t(
        r`Rohan's mother is 26 years older than him. In 3 years, the product of their ages will be 360. If Rohan is $x$ years old now, which equation is right?`,
        r`रोहन की माँ उससे 26 साल बड़ी हैं। 3 साल बाद उनकी आयु का गुणनफल 360 होगा। अगर रोहन अभी $x$ साल का है, तो कौन-सा समीकरण सही है?`,
      ),
      options: [
        { id: "right", label: t(r`$x^2 + 32x - 273 = 0$`, r`$x^2 + 32x - 273 = 0$`) },
        {
          id: "now",
          label: t(r`$x(x + 26) = 360$`, r`$x(x + 26) = 360$`),
          feedback: t(
            r`That uses their ages now. In 3 years they are $x + 3$ and $x + 29$.`,
            r`यह उनकी अभी की आयु है। 3 साल बाद वे $x + 3$ और $x + 29$ होंगे।`,
          ),
        },
        {
          id: "expand",
          label: t(r`$x^2 + 32x + 87 = 0$`, r`$x^2 + 32x + 87 = 0$`),
          feedback: t(
            r`$(x + 3)(x + 29) = x^2 + 32x + 87$, and that must equal 360, so subtract 360: $87 - 360 = -273$.`,
            r`$(x + 3)(x + 29) = x^2 + 32x + 87$, और यह 360 के बराबर हो, तो 360 घटाओ: $87 - 360 = -273$।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        r`**Mission log.** ✓ The plot is the equation $2x^2 + x - 300 = 0$. ✓ We can tell a quadratic equation, even a disguised one. ✗ We found $x = 12$ only by trying. Next stop: a real method, factorising.`,
        r`**मिशन लॉग।** ✓ प्लॉट का समीकरण है $2x^2 + x - 300 = 0$। ✓ हम द्विघात समीकरण पहचान सकते हैं, छिपा हुआ भी। ✗ $x = 12$ हमें सिर्फ़ आज़माकर मिला। अगला पड़ाव: एक सच्ची विधि, गुणनखंड।`,
      ),
      "log",
      { isHidden: true },
    );
    b.when(rohan.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`**Worked: two consecutive positive integers have product 306.** Call the smaller one $x$. The next is $x + 1$, so $$x(x + 1) = 306$$ that is, $$x^2 + x - 306 = 0$$`,
          r`**हल किया हुआ: दो क्रमागत धनात्मक पूर्णांकों का गुणनफल 306 है।** छोटे को $x$ कहो। अगला $x + 1$ है, तो $$x(x + 1) = 306$$ यानी $$x^2 + x - 306 = 0$$`,
        ),
      ),
      rohan,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, why, polynomial, equation, simplify, situations, inLife, yourTurn];
