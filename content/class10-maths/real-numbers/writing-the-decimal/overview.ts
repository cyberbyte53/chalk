import { PassOn, column, page, space, t } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { tenMakerDef } from "@chalk/prop-primes";

const r = String.raw;

/** Make the bottom a power of 10: worked examples from NCERT Ex 1.4 Q2. */
const topUp = page("top-up", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Make the bottom a power of 10", "नीचे वाली संख्या को 10 की घात बनाओ")),
    w.body(
      t(
        r`Give every 2 a 5 and every 5 a 2, multiplying top and bottom alike: $$\begin{aligned} \frac{17}{8} &= \frac{17}{2^3} = \frac{17 \times 5^3}{2^3 \times 5^3} \\ &= \frac{2125}{10^3} = 2.125 \end{aligned}$$`,
        r`हर 2 को एक 5 और हर 5 को एक 2 दो, ऊपर और नीचे एक साथ गुणा करके: $$\begin{aligned} \frac{17}{8} &= \frac{17}{2^3} = \frac{17 \times 5^3}{2^3 \times 5^3} \\ &= \frac{2125}{10^3} = 2.125 \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        r`$$\begin{aligned} \frac{13}{125} &= \frac{13 \times 2^3}{5^3 \times 2^3} = \frac{104}{10^3} = 0.104 \\ \frac{23}{2^3 \times 5^2} &= \frac{23 \times 5}{2^3 \times 5^3} = \frac{115}{10^3} = 0.115 \end{aligned}$$`,
        r`$$\begin{aligned} \frac{13}{125} &= \frac{13 \times 2^3}{5^3 \times 2^3} = \frac{104}{10^3} = 0.104 \\ \frac{23}{2^3 \times 5^2} &= \frac{23 \times 5}{2^3 \times 5^3} = \frac{115}{10^3} = 0.115 \end{aligned}$$`,
      ),
    ),
    w.note(
      t(
        r`The number of decimal places is the larger of the two powers: $2^3 \times 5^2$ needs 3 places.`,
        r`दशमलव के बाद अंकों की संख्या दोनों घातों में बड़ी वाली होती है: $2^3 \times 5^2$ को 3 अंक चाहिए।`,
      ),
    ),
    b.prop(tenMakerDef, "maker", { numerator: 17, denominator: 8 }),
    space(),
  ]);
});

/** NCERT Ex 1.4: 15/1600, reduce first. */
const reduceFirst = page("reduce-first", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Lowest terms first", "पहले न्यूनतम पद")),
    w.body(
      t(
        r`$$\begin{aligned} \frac{15}{1600} &= \frac{3}{320} = \frac{3}{2^6 \times 5} \\ &= \frac{3 \times 5^5}{2^6 \times 5^6} = \frac{9375}{10^6} = 0.009375 \end{aligned}$$`,
        r`$$\begin{aligned} \frac{15}{1600} &= \frac{3}{320} = \frac{3}{2^6 \times 5} \\ &= \frac{3 \times 5^5}{2^6 \times 5^6} = \frac{9375}{10^6} = 0.009375 \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        r`Six places, because of the six 2s. Fill the empty places after the point with zeros: $9375$ millionths is $0.009375$.`,
        r`छह 2 के कारण दशमलव के बाद छह अंक। दशमलव के बाद ख़ाली जगहें शून्य से भरो: $9375$ दस-लाखवें भाग $0.009375$ हैं।`,
      ),
    ),
    b.prop(tenMakerDef, "maker", { numerator: 15, denominator: 1600 }),
    space(),
  ]);
});

/** Your turn: 7/80. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        r`$\frac{7}{80} = \frac{7}{2^4 \times 5}$. As a decimal it is…`,
        r`$\frac{7}{80} = \frac{7}{2^4 \times 5}$। दशमलव में यह है…`,
      ),
      options: [
        {
          id: "short",
          label: t("0.875", "0.875"),
          feedback: t(
            r`Four 2s need four places: $\frac{7 \times 5^3}{2^4 \times 5^4} = \frac{875}{10^4}$.`,
            r`चार 2 के लिए चार अंक चाहिए: $\frac{7 \times 5^3}{2^4 \times 5^4} = \frac{875}{10^4}$।`,
          ),
        },
        { id: "right", label: t("0.0875", "0.0875") },
        {
          id: "swap",
          label: t("0.0785", "0.0785"),
          feedback: t(
            r`Check the digits: $7 \times 125 = 875$.`,
            r`अंक जाँचो: $7 \times 125 = 875$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Your turn", "अब तुम")),
      ask,
      b.prop(tenMakerDef, "maker", { numerator: 7, denominator: 80 }),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [topUp, reduceFirst, yourTurn];
