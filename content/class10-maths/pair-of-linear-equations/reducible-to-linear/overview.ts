import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { EquationForm, LinearSceneKind, Method } from "@chalk/prop-linear-equations";
import { equals, general, scene, working } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The boatman's boast: equations with the unknowns underneath. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const boat = scene(
    b,
    "boat",
    LinearSceneKind.BoatRiver,
    "the river at the edge of the mela: Grandpa rows a boat with the children aboard; arrows show the stream flowing one way while the boat heads the other way",
  );
  return column([
    w.title(t("The boatman's boast", "नाविक की शेख़ी")),
    w.body(
      t(
        'Cross-multiplication sorted out the bus fares. The next morning, before the stall opens for the mela\'s second day, Grandpa takes the children rowing on the river. The boatman who rents them the boat likes to boast: "My big boat goes 30 km upstream and 44 km downstream in 10 hours. And in 13 hours, 40 km upstream and 55 km downstream!"',
        'वज्र-गुणन ने बस के किराए सुलझा दिए। अगली सुबह, मेले के दूसरे दिन स्टॉल खुलने से पहले, दादाजी बच्चों को नदी में नाव चलाने ले जाते हैं। नाव किराए पर देने वाला नाविक शेख़ी बघारना पसंद करता है: "मेरी बड़ी नाव 10 घंटे में 30 km धारा के विरुद्ध और 44 km धारा के साथ जाती है। और 13 घंटे में 40 km विरुद्ध और 55 km साथ!"',
      ),
    ),
    boat,
    w.body(
      t(
        "Kabir wants to know how fast the river flows. Riya writes the times down, and frowns: the unknown speeds end up **underneath** fractions, like $\\tfrac{30}{x - y}$. That's not $ax + by + c = 0$ at all. Are all her methods useless here?",
        "कबीर जानना चाहता है कि नदी कितनी तेज़ बहती है। रिया समय लिखती है, और माथा सिकोड़ती है: अनजानी चालें भिन्नों के **नीचे** पहुँच जाती हैं, जैसे $\\tfrac{30}{x - y}$। यह तो $ax + by + c = 0$ बिल्कुल नहीं। क्या उसकी सारी विधियाँ यहाँ बेकार हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** NCERT Example 17: 2/x + 3/y = 13, 5/x − 4/y = −2 with p = 1/x, q = 1/y. */
const disguise = page(
  "disguise",
  (b) => {
    const w = wordsOn(b);
    const steps = working(b, "steps", [equals(2, 3, 13), equals(5, -4, -2)], Method.Elimination, {
      variables: ["p", "q"],
    });
    b.standsFor(steps, "2p + 3q = 13 and 5p − 4q = −2 solved by elimination in p and q");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "The working gives $p = 2$ and $q = 3$. So what are $x$ and $y$?",
        "हल से $p = 2$ और $q = 3$ मिलते हैं। तो $x$ और $y$ क्या हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            r`$x = \tfrac{1}{2}$, $y = \tfrac{1}{3}$`,
            r`$x = \tfrac{1}{2}$, $y = \tfrac{1}{3}$`,
          ),
        },
        {
          id: "same",
          label: t("$x = 2$, $y = 3$", "$x = 2$, $y = 3$"),
          feedback: t(
            r`Those are $p$ and $q$. Since $p = \tfrac{1}{x}$, $\tfrac{1}{x} = 2$ means $x = \tfrac{1}{2}$.`,
            r`ये तो $p$ और $q$ हैं। क्योंकि $p = \tfrac{1}{x}$, $\tfrac{1}{x} = 2$ का अर्थ है $x = \tfrac{1}{2}$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Equations in disguise", "भेष बदले समीकरण")),
      w.body(
        t(
          "Some pairs are not linear as they stand, but giving the awkward parts **new names** turns them into a linear pair. NCERT's Example 17:",
          "कुछ युग्म जैसे हैं वैसे रैखिक नहीं, पर अटपटे हिस्सों को **नए नाम** देने से वे रैखिक युग्म बन जाते हैं। NCERT का उदाहरण 17:",
        ),
      ),
      w.body(
        t(
          r`$$\frac{2}{x} + \frac{3}{y} = 13, \qquad \frac{5}{x} - \frac{4}{y} = -2$$`,
          r`$$\frac{2}{x} + \frac{3}{y} = 13, \qquad \frac{5}{x} - \frac{4}{y} = -2$$`,
        ),
      ),
      w.body(
        t(
          r`Read $\tfrac{2}{x}$ as $2 \times \tfrac{1}{x}$. Now give $\tfrac{1}{x}$ and $\tfrac{1}{y}$ their own names: let $p = \tfrac{1}{x}$ and $q = \tfrac{1}{y}$. The pair becomes`,
          r`$\tfrac{2}{x}$ को $2 \times \tfrac{1}{x}$ पढ़ो। अब $\tfrac{1}{x}$ और $\tfrac{1}{y}$ को अपने नाम दो: मान लो $p = \tfrac{1}{x}$ और $q = \tfrac{1}{y}$। युग्म बन जाता है`,
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} 2p + 3q &= 13 \\ 5p - 4q &= -2 \end{aligned}$$`,
          r`$$\begin{aligned} 2p + 3q &= 13 \\ 5p - 4q &= -2 \end{aligned}$$`,
        ),
      ),
      w.definition(
        t(
          "**Reducing to linear.** (1) Spot the expressions that the unknowns hide in, like $\\tfrac{1}{x}$. (2) Name each one with a new letter, so the pair becomes linear in the new letters. (3) Solve that pair by any method. (4) **Go back**: turn each new letter's value into the original unknown.",
          "**रैखिक में बदलना।** (1) वे व्यंजक पहचानो जिनमें अज्ञात छिपे हैं, जैसे $\\tfrac{1}{x}$। (2) हर एक को नया अक्षर दो, ताकि युग्म नए अक्षरों में रैखिक हो जाए। (3) उस युग्म को किसी भी विधि से हल करो। (4) **वापस जाओ**: हर नए अक्षर के मान से मूल अज्ञात निकालो।",
        ),
      ),
      steps,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 18: 1/(x − 1) and 1/(y − 2). */
const shifted = page(
  "shifted",
  (b) => {
    const w = wordsOn(b);
    const steps = working(b, "steps", [equals(5, 1, 2), equals(6, -3, 1)], Method.Elimination, {
      variables: ["p", "q"],
    });
    b.standsFor(steps, "5p + q = 2 and 6p − 3q = 1 solved by elimination in p and q");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`With $p = q = \tfrac{1}{3}$, what are $x$ and $y$?`,
        r`$p = q = \tfrac{1}{3}$ हो, तो $x$ और $y$ क्या हैं?`,
      ),
      options: [
        { id: "right", label: t("$x = 4$, $y = 5$", "$x = 4$, $y = 5$") },
        {
          id: "three",
          label: t("$x = 3$, $y = 3$", "$x = 3$, $y = 3$"),
          feedback: t(
            r`$\tfrac{1}{x - 1} = \tfrac{1}{3}$ means $x - 1 = 3$, so $x = 4$. Don't stop at $x - 1$.`,
            r`$\tfrac{1}{x - 1} = \tfrac{1}{3}$ का अर्थ है $x - 1 = 3$, तो $x = 4$। $x - 1$ पर मत रुको।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example: a shifted disguise", "उदाहरण: खिसका हुआ भेष")),
      w.body(t("NCERT's Example 18:", "NCERT का उदाहरण 18:")),
      w.body(
        t(
          r`$$\frac{5}{x - 1} + \frac{1}{y - 2} = 2, \qquad \frac{6}{x - 1} - \frac{3}{y - 2} = 1$$`,
          r`$$\frac{5}{x - 1} + \frac{1}{y - 2} = 2, \qquad \frac{6}{x - 1} - \frac{3}{y - 2} = 1$$`,
        ),
      ),
      w.body(
        t(
          r`Here the unknowns hide in $\tfrac{1}{x - 1}$ and $\tfrac{1}{y - 2}$. Let $p = \tfrac{1}{x - 1}$ and $q = \tfrac{1}{y - 2}$; the pair becomes the linear one below.`,
          r`यहाँ अज्ञात $\tfrac{1}{x - 1}$ और $\tfrac{1}{y - 2}$ में छिपे हैं। मान लो $p = \tfrac{1}{x - 1}$ और $q = \tfrac{1}{y - 2}$; युग्म नीचे वाला रैखिक युग्म बन जाता है।`,
        ),
      ),
      steps,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Upstream and downstream; NCERT Example 19 with u and v. */
const stream = page(
  "stream",
  (b) => {
    const w = wordsOn(b);
    const steps = working(
      b,
      "steps",
      [general(30, 44, -10), general(40, 55, -13)],
      Method.CrossMultiplication,
      { variables: ["u", "v"], form: EquationForm.General },
    );
    b.standsFor(
      steps,
      "30u + 44v − 10 = 0 and 40u + 55v − 13 = 0 solved by cross-multiplication in u and v",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`So $u = \tfrac{1}{5}$ and $v = \tfrac{1}{11}$. Which pair do $x$ and $y$ satisfy?`,
        r`तो $u = \tfrac{1}{5}$ और $v = \tfrac{1}{11}$। $x$ और $y$ किस युग्म को संतुष्ट करते हैं?`,
      ),
      options: [
        { id: "right", label: t("$x - y = 5$ and $x + y = 11$", "$x - y = 5$ और $x + y = 11$") },
        {
          id: "flip",
          label: t(
            r`$x - y = \tfrac{1}{5}$ and $x + y = \tfrac{1}{11}$`,
            r`$x - y = \tfrac{1}{5}$ और $x + y = \tfrac{1}{11}$`,
          ),
          feedback: t(
            r`$u$ is $\tfrac{1}{x - y}$, not $x - y$. If $\tfrac{1}{x - y} = \tfrac{1}{5}$, then $x - y = 5$.`,
            r`$u$ तो $\tfrac{1}{x - y}$ है, $x - y$ नहीं। यदि $\tfrac{1}{x - y} = \tfrac{1}{5}$, तो $x - y = 5$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Upstream and downstream", "धारा के विरुद्ध और साथ")),
      w.definition(
        t(
          "**Upstream, downstream.** A river's water moves, so a boat's speed depends on its direction. Let the boat's speed in **still water** be $x$ km/h and the stream's speed $y$ km/h. Going **downstream** (with the water) the speeds add: $x + y$. Going **upstream** (against it) the stream holds the boat back: $x - y$.",
          "**धारा के विरुद्ध, धारा के साथ।** नदी का पानी चलता है, इसलिए नाव की चाल उसकी दिशा पर निर्भर करती है। **स्थिर पानी** में नाव की चाल $x$ km/h और धारा की चाल $y$ km/h मानो। **धारा के साथ** जाते हुए चालें जुड़ती हैं: $x + y$। **धारा के विरुद्ध** धारा नाव को पीछे खींचती है: $x - y$।",
        ),
      ),
      w.body(
        t(
          "Time is distance divided by speed. So 30 km upstream takes $\\tfrac{30}{x - y}$ hours. NCERT's Example 19, the boatman's boast:",
          "समय यानी दूरी भाग चाल। तो 30 km धारा के विरुद्ध में $\\tfrac{30}{x - y}$ घंटे लगते हैं। NCERT का उदाहरण 19, नाविक की शेख़ी:",
        ),
      ),
      w.body(
        t(
          r`$$\frac{30}{x - y} + \frac{44}{x + y} = 10, \qquad \frac{40}{x - y} + \frac{55}{x + y} = 13$$`,
          r`$$\frac{30}{x - y} + \frac{44}{x + y} = 10, \qquad \frac{40}{x - y} + \frac{55}{x + y} = 13$$`,
        ),
      ),
      w.body(
        t(
          r`Let $u = \tfrac{1}{x - y}$ and $v = \tfrac{1}{x + y}$. Then $30u + 44v - 10 = 0$ and $40u + 55v - 13 = 0$, a linear pair. NCERT uses cross-multiplication:`,
          r`मान लो $u = \tfrac{1}{x - y}$ और $v = \tfrac{1}{x + y}$। तब $30u + 44v - 10 = 0$ और $40u + 55v - 13 = 0$, एक रैखिक युग्म। NCERT वज्र-गुणन लगाती है:`,
        ),
      ),
      steps,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The river's speed, at last. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const boat = scene(
      b,
      "boat",
      LinearSceneKind.BoatRiver,
      "the boat on the river, the stream flowing past",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "From $x - y = 5$ and $x + y = 11$: how fast is the river flowing?",
        "$x - y = 5$ और $x + y = 11$ से: नदी कितनी तेज़ बह रही है?",
      ),
      options: [
        { id: "right", label: t("3 km/h", "3 km/h") },
        {
          id: "boat",
          label: t("8 km/h", "8 km/h"),
          feedback: t(
            "8 km/h is $x$, the boat in still water. The stream is $y$.",
            "8 km/h तो $x$ है, स्थिर पानी में नाव। धारा $y$ है।",
          ),
        },
        {
          id: "down",
          label: t("11 km/h", "11 km/h"),
          feedback: t(
            "11 km/h is the boat's speed downstream, boat and stream together.",
            "11 km/h धारा के साथ नाव की चाल है, नाव और धारा मिलाकर।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const after = w.body(
      t(
        r`Adding gives $2x = 16$, so $x = 8$; subtracting gives $2y = 6$, so $y = 3$. The boat does 8 km/h in still water and the river runs at 3 km/h. Kabir dips his hand in and declares that it feels like exactly 3.`,
        r`जोड़ने से $2x = 16$, तो $x = 8$; घटाने से $2y = 6$, तो $y = 3$। स्थिर पानी में नाव 8 km/h चलती है और नदी 3 km/h से बहती है। कबीर पानी में हाथ डालकर एलान करता है कि यह ठीक 3 जैसा लगता है।`,
      ),
      "after",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(after), theBoard.pass()]);
    return column([
      w.title(t("How fast is the river?", "नदी कितनी तेज़ है?")),
      boat,
      ask,
      after,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 3.6: Q1(i) and Ritu's rowing. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        r`Solve $\tfrac{1}{2x} + \tfrac{1}{3y} = 2$ and $\tfrac{1}{3x} + \tfrac{1}{2y} = \tfrac{13}{6}$. (Let $p = \tfrac{1}{x}$, $q = \tfrac{1}{y}$, then multiply by 6.)`,
        r`$\tfrac{1}{2x} + \tfrac{1}{3y} = 2$ और $\tfrac{1}{3x} + \tfrac{1}{2y} = \tfrac{13}{6}$ हल करो। ($p = \tfrac{1}{x}$, $q = \tfrac{1}{y}$ मानो, फिर 6 से गुणा करो।)`,
      ),
      options: [
        {
          id: "right",
          label: t(
            r`$x = \tfrac{1}{2}$, $y = \tfrac{1}{3}$`,
            r`$x = \tfrac{1}{2}$, $y = \tfrac{1}{3}$`,
          ),
        },
        {
          id: "pq",
          label: t("$x = 2$, $y = 3$", "$x = 2$, $y = 3$"),
          feedback: t(
            r`$3p + 2q = 12$ and $2p + 3q = 13$ give $p = 2$, $q = 3$. Now go back: $x = \tfrac{1}{p}$.`,
            r`$3p + 2q = 12$ और $2p + 3q = 13$ से $p = 2$, $q = 3$। अब वापस जाओ: $x = \tfrac{1}{p}$।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "Ritu rows 20 km downstream in 2 hours and 4 km upstream in 2 hours. What is the speed of the current?",
        "रितु धारा के साथ 2 घंटे में 20 km और धारा के विरुद्ध 2 घंटे में 4 km नाव चलाती है। धारा की चाल क्या है?",
      ),
      options: [
        { id: "right", label: t("4 km/h (she rows at 6 km/h)", "4 km/h (वह 6 km/h से चलाती है)") },
        {
          id: "six",
          label: t("6 km/h", "6 km/h"),
          feedback: t(
            "$x + y = 10$ and $x - y = 2$ give $x = 6$: that's Ritu. The current is $y$.",
            "$x + y = 10$ और $x - y = 2$ से $x = 6$: यह रितु है। धारा $y$ है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(ask1.on(QuestionSignal.Correct), theBoard.show(ask2));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask1, ask2, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 3.7 (optional): Bhaskara's riddle and a triangle's angles. */
const challenge = page(
  "challenge",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        'From the *Bijaganita* of Bhaskara II. One says: "Give me a hundred, friend! I shall then become twice as rich as you." The other replies: "If you give me ten, I shall be six times as rich as you." How much does each have?',
        'भास्कर द्वितीय के *बीजगणित* से। एक कहता है: "मित्र, मुझे सौ दे दो! तब मैं तुमसे दुगुना धनी हो जाऊँगा।" दूसरा उत्तर देता है: "अगर तुम मुझे दस दो, तो मैं तुमसे छह गुना धनी हो जाऊँगा।" हर एक के पास कितना है?',
      ),
      options: [
        { id: "right", label: t("40 and 170", "40 और 170") },
        {
          id: "swap",
          label: t("170 and 40", "170 और 40"),
          feedback: t(
            "Use NCERT's hint: $x + 100 = 2(y - 100)$ and $y + 10 = 6(x - 10)$, where $x$ belongs to the first speaker. These give $x = 40$.",
            "NCERT का संकेत लो: $x + 100 = 2(y - 100)$ और $y + 10 = 6(x - 10)$, जहाँ $x$ पहले बोलने वाले का है। इनसे $x = 40$ आता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        r`In $\triangle ABC$, $\angle C = 3\angle B = 2(\angle A + \angle B)$. Find the angles.`,
        r`$\triangle ABC$ में $\angle C = 3\angle B = 2(\angle A + \angle B)$। कोण निकालो।`,
      ),
      options: [
        {
          id: "right",
          label: t(
            r`$\angle A = 20°$, $\angle B = 40°$, $\angle C = 120°$`,
            r`$\angle A = 20°$, $\angle B = 40°$, $\angle C = 120°$`,
          ),
        },
        {
          id: "sixty",
          label: t(r`All $60°$`, r`सभी $60°$`),
          feedback: t(
            r`Then $3\angle B$ would be $180°$, not $\angle C$. From $3B = 2(A + B)$, $B = 2A$; with $A + B + C = 180°$ and $C = 3B$, $9A = 180°$.`,
            r`तब $3\angle B$ होता $180°$, $\angle C$ नहीं। $3B = 2(A + B)$ से $B = 2A$; $A + B + C = 180°$ और $C = 3B$ के साथ $9A = 180°$।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(ask1.on(QuestionSignal.Correct), theBoard.show(ask2));
    return column([
      w.title(t("Challenge: an old riddle", "चुनौती: एक पुरानी पहेली")),
      w.note(
        t(
          "NCERT's Exercise 3.7 is optional: harder puzzles, for fun.",
          "NCERT का प्रश्नावली 3.7 वैकल्पिक है: कठिन पहेलियाँ, मज़े के लिए।",
        ),
      ),
      ask1,
      ask2,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Mela night: the accounts closed, every stop recapped. */
const finale = page(
  "finale",
  (b) => {
    const w = wordsOn(b);
    const night = scene(
      b,
      "night",
      LinearSceneKind.MelaNight,
      "mela night: strings of lights, the stall closed, the family round the open cash box with neat piles of notes, Kabir cheering",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Next year the teacher expects to sell 80 things and take ₹1000, at the same prices (lemonade ₹10, samosa ₹15). How many of each should she order?",
        "अगले साल अध्यापिका को 80 चीज़ें बेचने और ₹1000 जुटाने की उम्मीद है, उन्हीं दामों पर (नींबू पानी ₹10, समोसा ₹15)। हर एक कितना मँगाए?",
      ),
      options: [
        { id: "right", label: t("40 lemonades, 40 samosas", "40 नींबू पानी, 40 समोसे") },
        {
          id: "fifty",
          label: t("50 lemonades, 30 samosas", "50 नींबू पानी, 30 समोसे"),
          feedback: t(
            "That's 80 things, but ₹500 + ₹450 = ₹950, not ₹1000.",
            "चीज़ें 80 हैं, पर ₹500 + ₹450 = ₹950, ₹1000 नहीं।",
          ),
        },
        {
          id: "thirty",
          label: t("30 lemonades, 50 samosas", "30 नींबू पानी, 50 समोसे"),
          feedback: t(
            "That's 80 things, but ₹300 + ₹750 = ₹1050, not ₹1000.",
            "चीज़ें 80 हैं, पर ₹300 + ₹750 = ₹1050, ₹1000 नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const working = w.body(
      t(
        r`$$\begin{aligned} x + y &= 80 \\ 10x + 15y &= 1000 \end{aligned}$$ Substitute $y = 80 - x$: $$10x + 1200 - 15x = 1000 \;\Rightarrow\; x = 40, \; y = 40$$`,
        r`$$\begin{aligned} x + y &= 80 \\ 10x + 15y &= 1000 \end{aligned}$$ $y = 80 - x$ रखो: $$10x + 1200 - 15x = 1000 \;\Rightarrow\; x = 40, \; y = 40$$`,
      ),
      "working",
      { isHidden: true },
    );
    const done = w.definition(
      t(
        "**Mission complete.** (1) A clue becomes a **linear equation** $ax + by + c = 0$; two clues make a **pair**. (2) Two lines **intersect**, are **parallel** or **coincide**: one, no or infinitely many solutions. (3) **Drawing** finds the crossing: the cash box, 30 lemonades and 20 samosas. (4) **Substitution** solved Grandpa's riddle: he's 70. (5) **Elimination** opened the lock: 24. (6) **Cross-multiplication** found the bus fares: ₹8 and ₹10. (7) **Equations in disguise** found the river: 3 km/h.",
        "**मिशन पूरा।** (1) एक सुराग **रैखिक समीकरण** $ax + by + c = 0$ बनता है; दो सुराग एक **युग्म**। (2) दो रेखाएँ **प्रतिच्छेद** करती हैं, **समांतर** हैं या **संपाती**: एक, कोई नहीं या अपरिमित हल। (3) **चित्र** कटान ढूँढता है: गल्ला, 30 नींबू पानी और 20 समोसे। (4) **प्रतिस्थापन** ने दादाजी की पहेली सुलझाई: वे 70 के हैं। (5) **विलोपन** ने ताला खोला: 24। (6) **वज्र-गुणन** ने बस किराए निकाले: ₹8 और ₹10। (7) **भेष बदले समीकरणों** ने नदी नापी: 3 km/h।",
      ),
      "done",
      { isHidden: true },
    );
    const next = w.body(
      t(
        'The teacher is so pleased that 10B gets a bigger plot at next year\'s mela. "How long and how wide should our stall be?" asks Kabir. That question, it turns out, needs a new kind of equation, with an $x^2$ in it.',
        'अध्यापिका इतनी ख़ुश होती हैं कि अगले साल के मेले में 10B को बड़ा प्लॉट मिलता है। "हमारा स्टॉल कितना लंबा और कितना चौड़ा हो?" कबीर पूछता है। पता चलता है कि इस सवाल के लिए एक नए तरह का समीकरण चाहिए, जिसमें $x^2$ हो।',
      ),
      "next",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [
      theBoard.show(working),
      theBoard.show(done),
      theBoard.show(next),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("Mela night", "मेले की रात")),
      night,
      w.body(
        t(
          "It's the mela's second night. The family sits round the open cash box, and Riya writes up the first day's accounts for the class teacher: 30 glasses of lemonade at ₹10 is ₹300, and 20 samosas at ₹15 is ₹300. Total ₹600, 50 things. It all adds up.",
          "मेले की दूसरी रात है। परिवार खुले गल्ले के चारों ओर बैठा है, और रिया कक्षा-अध्यापिका के लिए पहले दिन का हिसाब लिखती है: ₹10 के 30 गिलास नींबू पानी ₹300, और ₹15 के 20 समोसे ₹300। कुल ₹600, 50 चीज़ें। सब मेल खाता है।",
        ),
      ),
      ask,
      working,
      done,
      next,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice, the chapter's finale. */
export const overview = [hook, disguise, shifted, stream, inLife, yourTurn, challenge, finale];
