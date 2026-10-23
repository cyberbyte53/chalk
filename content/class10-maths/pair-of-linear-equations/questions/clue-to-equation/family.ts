import { column, family, space, t } from "@chalk/author";
import { Level, type Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Clue = {
  Hoopla: "hoopla",
  Spent: "spent",
  AftabThen: "aftabThen",
  AftabLater: "aftabLater",
  Bats: "bats",
  Quiz: "quiz",
  Garden: "garden",
  Notes: "notes",
} as const;
type Clue = (typeof Clue)[keyof typeof Clue];

type Item = { prompt: Localized; right: string; wrong: { tex: string; why: Localized }[] };

const items: Record<Clue, Item> = {
  hoopla: {
    prompt: t(
      "Akhila plays Hoopla ($y$ games) half as many times as she rides the Giant Wheel ($x$ rides).",
      "अखिला हूपला ($y$ खेल) उतनी की आधी बार खेलती है जितनी बार वह बड़ा झूला ($x$ सवारी) झूलती है।",
    ),
    right: "y = \\tfrac{1}{2}x",
    wrong: [
      {
        tex: "x = \\tfrac{1}{2}y",
        why: t(
          "The games are the smaller number: $y$ is half of $x$.",
          "खेल छोटी संख्या हैं: $y$, $x$ का आधा है।",
        ),
      },
      {
        tex: "x + y = 2",
        why: t("Half means divide by 2, not add to 2.", "आधा यानी 2 से भाग, 2 का जोड़ नहीं।"),
      },
    ],
  },
  spent: {
    prompt: t(
      "A ride costs ₹3 and a game ₹4. Akhila spends ₹20 on $x$ rides and $y$ games.",
      "एक सवारी ₹3 की और एक खेल ₹4 का है। अखिला $x$ सवारियों और $y$ खेलों पर ₹20 ख़र्च करती है।",
    ),
    right: "3x + 4y = 20",
    wrong: [
      {
        tex: "x + y = 20",
        why: t("That adds the counts, not the money.", "यह गिनतियाँ जोड़ता है, पैसे नहीं।"),
      },
      { tex: "4x + 3y = 20", why: t("A ride ($x$) is the ₹3 one.", "सवारी ($x$) ₹3 वाली है।") },
    ],
  },
  aftabThen: {
    prompt: t(
      "Seven years ago, Aftab ($s$ years old now) was seven times as old as his daughter ($t$ years old now) was then.",
      "सात साल पहले आफ़ताब (अभी $s$ वर्ष) अपनी बेटी (अभी $t$ वर्ष) की तब की उम्र से सात गुना बड़े थे।",
    ),
    right: "s - 7 = 7(t - 7)",
    wrong: [
      {
        tex: "s = 7t",
        why: t("That's about now, not seven years ago.", "यह अभी के बारे में है, सात साल पहले के नहीं।"),
      },
      {
        tex: "s - 7 = 7t - 7",
        why: t(
          "The daughter's whole age then, $t - 7$, is multiplied by 7.",
          "बेटी की तब की पूरी उम्र, $t - 7$, 7 से गुणा होती है।",
        ),
      },
    ],
  },
  aftabLater: {
    prompt: t(
      "Three years from now, Aftab ($s$ now) will be three times as old as his daughter ($t$ now) will be.",
      "तीन साल बाद आफ़ताब (अभी $s$) अपनी बेटी (अभी $t$) से तीन गुना बड़े होंगे।",
    ),
    right: "s + 3 = 3(t + 3)",
    wrong: [
      {
        tex: "s - 3 = 3(t - 3)",
        why: t(
          "From now means adding 3 years, not taking away.",
          "अब से बाद यानी 3 साल जोड़ना, घटाना नहीं।",
        ),
      },
      {
        tex: "s + 3 = 3t",
        why: t(
          "The daughter will be 3 years older too: $t + 3$.",
          "बेटी भी 3 साल बड़ी होगी: $t + 3$।",
        ),
      },
    ],
  },
  bats: {
    prompt: t(
      "A coach buys 3 bats (₹$x$ each) and 6 balls (₹$y$ each) for ₹3900.",
      "एक कोच ₹3900 में 3 बल्ले (हर एक ₹$x$) और 6 गेंदें (हर एक ₹$y$) ख़रीदती है।",
    ),
    right: "3x + 6y = 3900",
    wrong: [
      {
        tex: "6x + 3y = 3900",
        why: t("$x$ is the price of a bat, and there are 3 bats.", "$x$ बल्ले का दाम है, और बल्ले 3 हैं।"),
      },
      {
        tex: "x + y = 3900",
        why: t("That's one bat and one ball, not 3 and 6.", "यह एक बल्ला और एक गेंद है, 3 और 6 नहीं।"),
      },
    ],
  },
  quiz: {
    prompt: t(
      "In a quiz the number of girls ($y$) is 4 more than the number of boys ($x$).",
      "एक क्विज़ में लड़कियों की संख्या ($y$) लड़कों की संख्या ($x$) से 4 ज़्यादा है।",
    ),
    right: "y = x + 4",
    wrong: [
      {
        tex: "x = y + 4",
        why: t("Then the boys would be the larger number.", "तब लड़के ज़्यादा होते।"),
      },
      { tex: "y = 4x", why: t("4 *more*, not 4 *times*.", "4 *ज़्यादा*, 4 *गुना* नहीं।") },
    ],
  },
  garden: {
    prompt: t(
      "Half the perimeter of a rectangular garden, width $x$ m and length $y$ m, is 36 m.",
      "एक आयताकार बग़ीचे के, चौड़ाई $x$ m और लंबाई $y$ m, परिमाप का आधा 36 m है।",
    ),
    right: "x + y = 36",
    wrong: [
      {
        tex: "2(x + y) = 36",
        why: t(
          "$2(x + y)$ is the whole perimeter. Half of it is $x + y$.",
          "$2(x + y)$ पूरा परिमाप है। उसका आधा $x + y$ है।",
        ),
      },
      {
        tex: "xy = 36",
        why: t("$xy$ is the area, not the perimeter.", "$xy$ क्षेत्रफल है, परिमाप नहीं।"),
      },
    ],
  },
  notes: {
    prompt: t(
      "Meena gets ₹2000 in $x$ notes of ₹50 and $y$ notes of ₹100.",
      "मीना को ₹2000, ₹50 के $x$ नोटों और ₹100 के $y$ नोटों में मिलते हैं।",
    ),
    right: "50x + 100y = 2000",
    wrong: [
      { tex: "x + y = 2000", why: t("That counts notes, not rupees.", "यह नोट गिनता है, रुपये नहीं।") },
      { tex: "100x + 50y = 2000", why: t("$x$ counts the ₹50 notes.", "$x$, ₹50 के नोट गिनता है।") },
    ],
  },
};

/** Turn one clue from a word problem into its linear equation (NCERT 3.2, Exercise 3.1). */
export const clueToEquation = family({
  level: Level.Easy,
  tests: [Concept.PairOfEquations],
  params: z.object({ clue: z.nativeEnum(Clue) }).strict(),
  build: ({ clue }, bk) => {
    const it = items[clue as Clue];
    const options: Option[] = [
      { id: "right", label: t(`$${it.right}$`, `$${it.right}$`) },
      ...it.wrong.map((w, i) => ({
        id: `w${i}`,
        label: t(`$${w.tex}$`, `$${w.tex}$`),
        feedback: w.why,
      })),
    ];
    const ask = choiceQuestion(bk, {
      prompt: t(
        `${it.prompt.en} Which equation says this?`,
        `${it.prompt.hi} कौन-सा समीकरण यह कहता है?`,
      ),
      options: settle(options, clue.length * 7),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
