import type { Lesson } from "@chalk/content";

const text = (id: number, name: string, en: string, hi: string, style = "body") => ({
  id,
  name,
  kind: "prop" as const,
  prop: "text",
  with: { text: { en, hi }, style },
});

/**
 * The type specimen (development only): one board with every kind of text and maths a lesson uses,
 * in both languages, to judge the typography on a real phone before content depends on it.
 */
export const specimen: Lesson = {
  id: "dev/type-specimen",
  version: "0.0.0",
  title: { en: "Type specimen", hi: "टाइप नमूना" },
  concepts: [],
  boards: [
    {
      id: 1,
      name: "specimen",
      root: {
        id: 1,
        name: "page",
        kind: "column",
        children: [
          text(
            2,
            "title",
            "The value of $p(x) = x^2 + 3x - 1$",
            "$p(x) = x^2 + 3x - 1$ का मान",
            "title",
          ),
          text(
            3,
            "body",
            "Put **2** wherever $x$ is: $p(2) = 2^2 + 3 \\times 2 - 1 = 9$. *Every* term is worked out first, then added.",
            "जहाँ $x$ है वहाँ **2** रखो: $p(2) = 2^2 + 3 \\times 2 - 1 = 9$। *हर* पद पहले हल करो, फिर जोड़ो।",
          ),
          text(
            4,
            "display",
            "Rationalising: $$\\frac{1}{2 + \\sqrt{3}} = \\frac{2 - \\sqrt{3}}{(2 + \\sqrt{3})(2 - \\sqrt{3})} = 2 - \\sqrt{3}$$",
            "परिमेयकरण: $$\\frac{1}{2 + \\sqrt{3}} = \\frac{2 - \\sqrt{3}}{(2 + \\sqrt{3})(2 - \\sqrt{3})} = 2 - \\sqrt{3}$$",
          ),
          text(
            5,
            "exponents",
            "Laws of exponents: $x^{1/3} \\cdot x^{2/3} = x^{1/3 + 2/3} = x$, and $\\left(a^m\\right)^n = a^{mn}$.",
            "घातांक के नियम: $x^{1/3} \\cdot x^{2/3} = x^{1/3 + 2/3} = x$, और $\\left(a^m\\right)^n = a^{mn}$।",
          ),
          text(
            6,
            "decimals",
            "$\\frac{1}{3} = 0.\\overline{3}$ never ends; $2.665$ ends after three digits; $\\sqrt{2} \\approx 1.414$.",
            "$\\frac{1}{3} = 0.\\overline{3}$ कभी ख़त्म नहीं होता; $2.665$ तीन अंकों पर ख़त्म; $\\sqrt{2} \\approx 1.414$।",
          ),
          text(
            7,
            "geometry",
            "In $\\triangle ABC$, $\\angle A + \\angle B + \\angle C = 180^\\circ$ and $\\overline{AB} \\parallel \\overline{DE}$.",
            "$\\triangle ABC$ में $\\angle A + \\angle B + \\angle C = 180^\\circ$ और $\\overline{AB} \\parallel \\overline{DE}$।",
          ),
          text(
            8,
            "science",
            "Water: $\\ce{2H2 + O2 -> 2H2O}$. A ball falls with $g = 9.8\\,\\text{m/s}^2$.",
            "पानी: $\\ce{2H2 + O2 -> 2H2O}$। गेंद $g = 9.8\\,\\text{m/s}^2$ से गिरती है।",
          ),
          text(
            9,
            "note",
            "A note: smaller, softer, for asides like $\\pi \\approx 3.14$.",
            "टिप्पणी: छोटी, हल्की, जैसे $\\pi \\approx 3.14$।",
            "note",
          ),
          {
            id: 10,
            name: "ask",
            kind: "prop",
            prop: "choice",
            with: {
              prompt: {
                en: "Which is $\\sqrt{50}$ in simplest form?",
                hi: "$\\sqrt{50}$ का सरलतम रूप कौन-सा है?",
              },
              options: [
                { id: "a", label: { en: "$5\\sqrt{2}$", hi: "$5\\sqrt{2}$" } },
                {
                  id: "b",
                  label: { en: "$25\\sqrt{2}$", hi: "$25\\sqrt{2}$" },
                  feedback: {
                    en: "$\\sqrt{50} = \\sqrt{25 \\times 2}$: take the square root of 25.",
                    hi: "$\\sqrt{50} = \\sqrt{25 \\times 2}$: 25 का वर्गमूल लो।",
                  },
                },
                { id: "c", label: { en: "$2\\sqrt{5}$", hi: "$2\\sqrt{5}$" } },
              ],
              answer: "a",
              concepts: ["specimen"],
            },
          },
        ],
      },
      is: [],
      when: [{ on: "ask.correct", do: { call: "board.pass" } }],
      studentOnly: [],
      nextPieceId: 11,
    },
  ],
};
