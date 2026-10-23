import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemQuestion, seedOf } from "../../kit";

const r = String.raw;
const reject = t(
  "That root satisfies the equation, but not the situation: a length, speed, time or age can't be negative.",
  "वह मूल समीकरण तो संतुष्ट करता है, पर स्थिति नहीं: लंबाई, चाल, समय या आयु ऋणात्मक नहीं हो सकती।",
);
const both = t(
  "The question asks for both quantities: find the second from the first.",
  "प्रश्न दोनों राशियाँ पूछता है: पहली से दूसरी निकालो।",
);

/** Exercise 4.3 Q4–Q11: the equation is given; find the answer that fits the situation. */
const items: Record<string, Item> = {
  rehman: {
    prompt: t(
      r`Rehman's present age $x$ satisfies $x^2 - 4x - 21 = 0$. How old is he?`,
      r`रहमान की वर्तमान आयु $x$, $x^2 - 4x - 21 = 0$ को संतुष्ट करती है। उसकी आयु क्या है?`,
    ),
    right: t("7 years", "7 साल"),
    wrong: [{ label: t("−3 years", "−3 साल"), why: reject }],
  },
  field: {
    prompt: t(
      r`A field's shorter side $x$ m satisfies $x^2 - 60x - 2700 = 0$, and its longer side is 30 m more. What are the sides?`,
      r`एक खेत की छोटी भुजा $x$ m, $x^2 - 60x - 2700 = 0$ को संतुष्ट करती है, और लंबी भुजा 30 m ज़्यादा है। भुजाएँ क्या हैं?`,
    ),
    right: t("90 m and 120 m", "90 m और 120 m"),
    wrong: [
      { label: t("90 m only", "केवल 90 m"), why: both },
      { label: t("30 m and 60 m", "30 m और 60 m"), why: reject },
    ],
  },
  train: {
    prompt: t(
      r`A train's speed $v$ km/h satisfies $v^2 + 5v - 1800 = 0$. What is its speed?`,
      r`एक ट्रेन की चाल $v$ km/h, $v^2 + 5v - 1800 = 0$ को संतुष्ट करती है। उसकी चाल क्या है?`,
    ),
    right: t("40 km/h", "40 km/h"),
    wrong: [
      { label: t("45 km/h", "45 km/h"), why: reject },
      { label: t("−45 km/h", "−45 km/h"), why: reject },
    ],
  },
  taps: {
    prompt: t(
      r`The smaller tap alone fills the tank in $x$ hours, and $4x^2 - 115x + 375 = 0$, with $x$ bigger than 10. How long does each tap take?`,
      r`छोटा नल अकेले टंकी $x$ घंटे में भरता है, और $4x^2 - 115x + 375 = 0$, जहाँ $x$, 10 से बड़ा है। हर नल कितना समय लेता है?`,
    ),
    right: t("25 hours and 15 hours", "25 घंटे और 15 घंटे"),
    wrong: [
      {
        label: t("3.75 hours and −6.25 hours", "3.75 घंटे और −6.25 घंटे"),
        why: t(
          "The roots are 25 and 3.75, but the larger tap takes x − 10 hours, which is negative for 3.75.",
          "मूल 25 और 3.75 हैं, पर बड़ा नल x − 10 घंटे लेता है, जो 3.75 के लिए ऋणात्मक है।",
        ),
      },
      { label: t("25 hours only", "केवल 25 घंटे"), why: both },
    ],
  },
  express: {
    prompt: t(
      r`The passenger train's speed $v$ satisfies $v^2 + 11v - 1452 = 0$, and the express goes 11 km/h faster. What are their speeds?`,
      r`पैसेंजर ट्रेन की चाल $v$, $v^2 + 11v - 1452 = 0$ को संतुष्ट करती है, और एक्सप्रेस 11 km/h तेज़ है। उनकी चालें क्या हैं?`,
    ),
    right: t("33 km/h and 44 km/h", "33 km/h और 44 km/h"),
    wrong: [
      { label: t("44 km/h and 55 km/h", "44 km/h और 55 km/h"), why: reject },
      { label: t("33 km/h only", "केवल 33 km/h"), why: both },
    ],
  },
  squares: {
    prompt: t(
      r`The smaller square's side $y$ m satisfies $y^2 + 6y - 216 = 0$, and the other side is 6 m longer. What are the sides?`,
      r`छोटे वर्ग की भुजा $y$ m, $y^2 + 6y - 216 = 0$ को संतुष्ट करती है, और दूसरी भुजा 6 m लंबी है। भुजाएँ क्या हैं?`,
    ),
    right: t("12 m and 18 m", "12 m और 18 m"),
    wrong: [{ label: t("−18 m and −12 m", "−18 m और −12 m"), why: reject }],
  },
  shefali: {
    prompt: t(
      r`Shefali's Maths marks $x$ satisfy $x^2 - 25x + 156 = 0$, and her English marks are $30 - x$. What could her marks be?`,
      r`शेफाली के गणित के अंक $x$, $x^2 - 25x + 156 = 0$ को संतुष्ट करते हैं, और अंग्रेज़ी के अंक $30 - x$ हैं। उसके अंक क्या हो सकते हैं?`,
    ),
    right: t(
      "Maths 12, English 18; or Maths 13, English 17",
      "गणित 12, अंग्रेज़ी 18; या गणित 13, अंग्रेज़ी 17",
    ),
    wrong: [
      {
        label: t("Maths 12, English 13", "गणित 12, अंग्रेज़ी 13"),
        why: t(
          "12 and 13 are the two roots, two possible Maths marks. English is 30 minus each.",
          "12 और 13 दो मूल हैं, गणित के दो संभव अंक। अंग्रेज़ी 30 में से हर एक घटाकर है।",
        ),
      },
    ],
  },
};
type Name = keyof typeof items;

/** Pick the answer that fits the situation, rejecting roots that don't. */
export const wordProblemAnswer = family({
  level: Level.Medium,
  tests: [Concept.WordProblems],
  params: z.object({ item: z.enum(Object.keys(items) as [Name, ...Name[]]) }).strict(),
  build: ({ item }, b) => {
    const it = items[item];
    if (it === undefined) throw new Error(`no item ${item}`);
    return column([itemQuestion(b, it, seedOf(item)), space()]);
  },
});
