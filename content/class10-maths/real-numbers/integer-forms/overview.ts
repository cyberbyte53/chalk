import { PassOn, column, page, space, t } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { remainderShelvesDef } from "@chalk/prop-primes";

const r = String.raw;

/** Every number on exactly one of three shelves: 3q, 3q + 1, 3q + 2. */
const shelves = page("shelves", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("A shelf for every remainder", "हर शेषफल की एक अलमारी")),
    w.body(
      t(
        r`Divide any positive integer by 3: by the lemma the remainder is 0, 1 or 2. So every positive integer is $3q$, $3q + 1$ or $3q + 2$ for some whole number $q$. Tap +1 and +10 to put numbers on their shelves.`,
        r`किसी भी धनात्मक पूर्णांक को 3 से भाग दो: प्रमेयिका से शेषफल 0, 1 या 2 होगा। इसलिए हर धनात्मक पूर्णांक किसी पूर्ण संख्या $q$ के लिए $3q$, $3q + 1$ या $3q + 2$ है। +1 और +10 दबाकर संख्याओं को उनकी अलमारी में रखो।`,
      ),
    ),
    b.prop(remainderShelvesDef, "shelves", { divisor: 3, power: 1, placed: 0 }),
    w.note(
      t(
        "Every number lands on exactly one shelf, and every shelf fills up in turn.",
        "हर संख्या ठीक एक अलमारी में जाती है, और हर अलमारी बारी-बारी भरती है।",
      ),
    ),
    space(),
  ]);
});

/** NCERT Example 3: odd numbers are 4q + 1 or 4q + 3. */
const odd = page("odd", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Odd numbers on four shelves", "चार अलमारियों पर विषम संख्याएँ")),
    b.prop(remainderShelvesDef, "shelves", { divisor: 4, power: 1, placed: 12 }),
    w.body(
      t(
        r`With 4 shelves every positive integer is $4q$, $4q + 1$, $4q + 2$ or $4q + 3$. But $4q = 2(2q)$ and $4q + 2 = 2(2q + 1)$ are even. So **every odd positive integer** is $4q + 1$ or $4q + 3$.`,
        r`4 अलमारियों पर हर धनात्मक पूर्णांक $4q$, $4q + 1$, $4q + 2$ या $4q + 3$ है। पर $4q = 2(2q)$ और $4q + 2 = 2(2q + 1)$ सम हैं। इसलिए **हर विषम धनात्मक पूर्णांक** $4q + 1$ या $4q + 3$ है।`,
      ),
    ),
    w.note(
      t(
        r`The same way, with 6 shelves an odd positive integer is $6q + 1$, $6q + 3$ or $6q + 5$.`,
        r`इसी तरह 6 अलमारियों पर विषम धनात्मक पूर्णांक $6q + 1$, $6q + 3$ या $6q + 5$ है।`,
      ),
    ),
    space(),
  ]);
});

/** Squares never reach 3q + 2: watch it, then see why. */
const squares = page("squares", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Squares on three shelves", "तीन अलमारियों पर वर्ग")),
    w.body(
      t(
        r`Now the squares $1, 4, 9, 16, \dots$ go on the shelves instead. Add as many as you like.`,
        r`अब अलमारियों पर वर्ग $1, 4, 9, 16, \dots$ रखे जाते हैं। जितने चाहो उतने जोड़ो।`,
      ),
    ),
    b.prop(remainderShelvesDef, "shelves", { divisor: 3, power: 2, placed: 0 }),
    w.body(
      t(
        r`The $3q + 2$ shelf stays empty, however far you go. Every number is $3q$, $3q + 1$ or $3q + 2$; square each one: $$\begin{aligned} (3q)^2 &= 3(3q^2) \\ (3q + 1)^2 &= 3(3q^2 + 2q) + 1 \\ (3q + 2)^2 &= 3(3q^2 + 4q + 1) + 1 \end{aligned}$$`,
        r`$3q + 2$ वाली अलमारी खाली रहती है, चाहे जितना आगे जाओ। हर संख्या $3q$, $3q + 1$ या $3q + 2$ है; हर एक का वर्ग करो: $$\begin{aligned} (3q)^2 &= 3(3q^2) \\ (3q + 1)^2 &= 3(3q^2 + 2q) + 1 \\ (3q + 2)^2 &= 3(3q^2 + 4q + 1) + 1 \end{aligned}$$`,
      ),
    ),
    w.definition(
      t(
        r`The square of any positive integer is of the form $3m$ or $3m + 1$ for some integer $m$.`,
        r`किसी भी धनात्मक पूर्णांक का वर्ग किसी पूर्णांक $m$ के लिए $3m$ या $3m + 1$ के रूप का होता है।`,
      ),
    ),
    space(),
  ]);
});

/** Your turn: cubes on 9 shelves (NCERT Ex 1.1 Q5), then squares on 4 shelves. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "Squares on 4 shelves: which shelves do they land on?",
        "4 अलमारियों पर वर्ग: वे किन अलमारियों पर जाते हैं?",
      ),
      options: [
        {
          id: "all",
          label: t(r`$4q$, $4q + 1$, $4q + 2$, $4q + 3$`, r`$4q$, $4q + 1$, $4q + 2$, $4q + 3$`),
          feedback: t(
            r`Try it: put squares on 4 shelves. Odd squares are $(2k + 1)^2 = 4(k^2 + k) + 1$; even squares are $(2k)^2 = 4k^2$.`,
            r`करके देखो: 4 अलमारियों पर वर्ग रखो। विषम वर्ग $(2k + 1)^2 = 4(k^2 + k) + 1$ हैं; सम वर्ग $(2k)^2 = 4k^2$ हैं।`,
          ),
        },
        {
          id: "odd",
          label: t(r`$4q + 1$ and $4q + 3$`, r`$4q + 1$ और $4q + 3$`),
          feedback: t(
            r`Those are where odd numbers land. Even squares like $4$ and $16$ land on $4q$.`,
            r`वहाँ विषम संख्याएँ जाती हैं। $4$ और $16$ जैसे सम वर्ग $4q$ पर जाते हैं।`,
          ),
        },
        { id: "right", label: t(r`$4q$ and $4q + 1$`, r`$4q$ और $4q + 1$`) },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Your turn", "अब तुम")),
      w.body(
        t(
          r`Cubes on 9 shelves land only on $9m$, $9m + 1$ and $9m + 8$ (try it: tap n³ and set b = 9). Now a question:`,
          r`9 अलमारियों पर घन केवल $9m$, $9m + 1$ और $9m + 8$ पर जाते हैं (करके देखो: n³ दबाओ और b = 9 रखो)। अब एक प्रश्न:`,
        ),
      ),
      b.prop(remainderShelvesDef, "shelves", { divisor: 9, power: 3, placed: 0 }),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [shelves, odd, squares, yourTurn];
