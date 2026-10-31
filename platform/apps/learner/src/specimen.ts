import { place, scene } from "@chalk/author";
import type { Lesson } from "@chalk/content";
import { propLibrary } from "@chalk/library";
import type { AnyProp } from "@chalk/prop";

/** A prop's definition, from the library (the app holds no prop package of its own). */
const def = (type: string): AnyProp => {
  const module = propLibrary[type];
  if (module === undefined) throw new Error(`no prop ${type} in the library`);
  return module.def;
};

/**
 * The type specimen (development only): one board with every kind of text and maths a lesson uses,
 * in both languages, to judge the typography on a real phone before content depends on it. Its
 * question passes the board when answered right.
 */
export const specimen: Lesson = {
  id: "dev/type-specimen",
  version: "0.0.0",
  title: { en: "Type specimen", hi: "टाइप नमूना" },
  concepts: [],
  boards: [
    scene({
      pieces: {
        title: place(def("text"), {
          text: { en: "The value of $p(x) = x^2 + 3x - 1$", hi: "$p(x) = x^2 + 3x - 1$ का मान" },
          style: "title",
        } as never),
        body: place(def("text"), {
          text: {
            en: "Put **2** wherever $x$ is: $p(2) = 2^2 + 3 \\times 2 - 1 = 9$. *Every* term is worked out first, then added.",
            hi: "जहाँ $x$ है वहाँ **2** रखो: $p(2) = 2^2 + 3 \\times 2 - 1 = 9$। *हर* पद पहले हल करो, फिर जोड़ो।",
          },
          style: "body",
        } as never),
        display: place(def("text"), {
          text: {
            en: "Rationalising: $$\\frac{1}{2 + \\sqrt{3}} = \\frac{2 - \\sqrt{3}}{(2 + \\sqrt{3})(2 - \\sqrt{3})} = 2 - \\sqrt{3}$$",
            hi: "परिमेयकरण: $$\\frac{1}{2 + \\sqrt{3}} = \\frac{2 - \\sqrt{3}}{(2 + \\sqrt{3})(2 - \\sqrt{3})} = 2 - \\sqrt{3}$$",
          },
          style: "body",
        } as never),
        exponents: place(def("text"), {
          text: {
            en: "Laws of exponents: $x^{1/3} \\cdot x^{2/3} = x^{1/3 + 2/3} = x$, and $\\left(a^m\\right)^n = a^{mn}$.",
            hi: "घातांक के नियम: $x^{1/3} \\cdot x^{2/3} = x^{1/3 + 2/3} = x$, और $\\left(a^m\\right)^n = a^{mn}$।",
          },
          style: "body",
        } as never),
        decimals: place(def("text"), {
          text: {
            en: "$\\frac{1}{3} = 0.\\overline{3}$ never ends; $2.665$ ends after three digits; $\\sqrt{2} \\approx 1.414$.",
            hi: "$\\frac{1}{3} = 0.\\overline{3}$ कभी ख़त्म नहीं होता; $2.665$ तीन अंकों पर ख़त्म; $\\sqrt{2} \\approx 1.414$।",
          },
          style: "body",
        } as never),
        geometry: place(def("text"), {
          text: {
            en: "In $\\triangle ABC$, $\\angle A + \\angle B + \\angle C = 180^\\circ$ and $\\overline{AB} \\parallel \\overline{DE}$.",
            hi: "$\\triangle ABC$ में $\\angle A + \\angle B + \\angle C = 180^\\circ$ और $\\overline{AB} \\parallel \\overline{DE}$।",
          },
          style: "body",
        } as never),
        science: place(def("text"), {
          text: {
            en: "Water: $\\ce{2H2 + O2 -> 2H2O}$. A ball falls with $g = 9.8\\,\\text{m/s}^2$.",
            hi: "पानी: $\\ce{2H2 + O2 -> 2H2O}$। गेंद $g = 9.8\\,\\text{m/s}^2$ से गिरती है।",
          },
          style: "body",
        } as never),
        note: place(def("text"), {
          text: {
            en: "A note: smaller, softer, for asides like $\\pi \\approx 3.14$.",
            hi: "टिप्पणी: छोटी, हल्की, जैसे $\\pi \\approx 3.14$।",
          },
          style: "note",
        } as never),
        ask: place(def("choice"), {
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
        } as never),
      },
    }).build("specimen").board,
  ],
};
