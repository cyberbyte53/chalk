import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, frac, numItem } from "../../kit";

const flip = t(
  "That's favourable over unfavourable. P(E) divides by **all** the outcomes.",
  "यह अनुकूल बटा प्रतिकूल है। P(E) में **सारे** परिणामों से भाग देते हैं।",
);

/** Examples 1 and 2, Exercise 15.1 Q11, Q12 (i, ii), Q13 and Q19: P(E) = favourable ÷ all. */
const items = {
  ex1: numItem(
    t(
      "A coin is tossed once. What is the probability of getting a head?",
      "एक सिक्का एक बार उछाला जाता है। चित आने की प्रायिकता क्या है?",
    ),
    frac(1, 2),
    [
      [
        frac(1, 1),
        t(
          "1 head is favourable, but there are 2 outcomes (H and T): 1/2.",
          "1 चित अनुकूल है, पर परिणाम 2 हैं (H और T): 1/2।",
        ),
      ],
      [
        frac(2, 1),
        t(
          "Upside down: favourable goes on top. 1 of 2 outcomes: 1/2.",
          "उलटा है: अनुकूल ऊपर आता है। 2 में 1 परिणाम: 1/2।",
        ),
      ],
    ],
  ),
  ex2: numItem(
    t(
      "A bag has a red, a blue and a yellow ball. Kritika takes one out without looking. What is P(yellow)?",
      "एक थैले में एक लाल, एक नीली और एक पीली गेंद है। कृतिका बिना देखे एक निकालती है। P(पीली) क्या है?",
    ),
    frac(1, 3),
    [
      [frac(1, 2), flip],
      [
        frac(2, 3),
        t(
          '2/3 is "not yellow". Only 1 of the 3 balls is yellow.',
          '2/3, "पीली नहीं" है। 3 गेंदों में केवल 1 पीली है।',
        ),
      ],
    ],
  ),
  q11: numItem(
    t(
      "Exercise 15.1 Q11. A tank has 5 male and 8 female fish. One is taken out at random. What is P(male)?",
      "प्रश्नावली 15.1 प्रश्न 11. एक टंकी में 5 नर और 8 मादा मछलियाँ हैं। एक यादृच्छया निकाली जाती है। P(नर) क्या है?",
    ),
    frac(5, 13),
    [
      [frac(5, 8), flip],
      [frac(8, 13), t("8/13 is the chance of a female fish.", "8/13 मादा मछली की संभावना है।")],
    ],
  ),
  q12i: numItem(
    t(
      "Exercise 15.1 Q12 (i). An arrow spins and stops at one of 1, 2, …, 8, all equally likely. What is P(8)?",
      "प्रश्नावली 15.1 प्रश्न 12 (i). एक तीर घूमकर 1, 2, …, 8 में से किसी पर रुकता है, सब समप्रायिक। P(8) क्या है?",
    ),
    frac(1, 8),
    [
      [frac(8, 8), t("8 is one outcome out of 8.", "8, आठ में से एक परिणाम है।")],
      [frac(1, 7), flip],
    ],
  ),
  q12ii: numItem(
    t(
      "Exercise 15.1 Q12 (ii). The arrow stops at one of 1, 2, …, 8. What is P(an odd number)?",
      "प्रश्नावली 15.1 प्रश्न 12 (ii). तीर 1, 2, …, 8 में से किसी पर रुकता है। P(विषम संख्या) क्या है?",
    ),
    frac(1, 2),
    [
      [
        frac(1, 8),
        t(
          "There are 4 odd numbers: 1, 3, 5, 7. 4 of 8 = 1/2.",
          "4 विषम संख्याएँ हैं: 1, 3, 5, 7। 8 में 4 = 1/2।",
        ),
      ],
      [
        frac(3, 8),
        t(
          "Count again: 1, 3, 5 and 7 are odd. 4 of 8 = 1/2.",
          "फिर गिनो: 1, 3, 5 और 7 विषम हैं। 8 में 4 = 1/2।",
        ),
      ],
    ],
  ),
  q13i: numItem(
    t(
      "Exercise 15.1 Q13 (i). A die is thrown once. What is P(a prime number)?",
      "प्रश्नावली 15.1 प्रश्न 13 (i). एक पासा एक बार फेंका जाता है। P(अभाज्य संख्या) क्या है?",
    ),
    frac(1, 2),
    [
      [
        frac(2, 3),
        t(
          "1 is not prime. The primes are 2, 3, 5: 3 of 6.",
          "1 अभाज्य नहीं है। अभाज्य 2, 3, 5 हैं: 6 में 3।",
        ),
      ],
      [
        frac(1, 3),
        t("2 is prime too: 2, 3 and 5. 3 of 6 = 1/2.", "2 भी अभाज्य है: 2, 3 और 5। 6 में 3 = 1/2।"),
      ],
    ],
  ),
  q13ii: numItem(
    t(
      "Exercise 15.1 Q13 (ii). A die is thrown once. What is P(a number lying between 2 and 6)?",
      "प्रश्नावली 15.1 प्रश्न 13 (ii). एक पासा एक बार फेंका जाता है। P(2 और 6 के बीच की संख्या) क्या है?",
    ),
    frac(1, 2),
    [
      [
        frac(5, 6),
        t(
          '"Between" leaves out 2 and 6: only 3, 4, 5. 3 of 6.',
          '"बीच" में 2 और 6 नहीं आते: केवल 3, 4, 5। 6 में 3।',
        ),
      ],
      [
        frac(2, 3),
        t(
          "2 and 6 themselves don't count: 3, 4, 5 is 3 of 6.",
          "2 और 6 ख़ुद नहीं गिने जाते: 3, 4, 5 यानी 6 में 3।",
        ),
      ],
    ],
  ),
  q19i: numItem(
    t(
      "Exercise 15.1 Q19 (i). A die's faces show A, B, C, D, E, A. It is thrown once. What is P(A)?",
      "प्रश्नावली 15.1 प्रश्न 19 (i). एक पासे के फलकों पर A, B, C, D, E, A हैं। इसे एक बार फेंका जाता है। P(A) क्या है?",
    ),
    frac(1, 3),
    [
      [
        frac(1, 5),
        t(
          "There are 5 letters but 6 faces, and 2 of them show A: 2/6.",
          "अक्षर 5 हैं पर फलक 6, और उनमें 2 पर A है: 2/6।",
        ),
      ],
      [
        frac(1, 6),
        t("A is on 2 faces, not 1: 2 of 6 = 1/3.", "A, 1 नहीं 2 फलकों पर है: 6 में 2 = 1/3।"),
      ],
    ],
  ),
  q19ii: numItem(
    t(
      "Exercise 15.1 Q19 (ii). The die's faces show A, B, C, D, E, A. What is P(D)?",
      "प्रश्नावली 15.1 प्रश्न 19 (ii). पासे के फलकों पर A, B, C, D, E, A हैं। P(D) क्या है?",
    ),
    frac(1, 6),
    [
      [
        frac(1, 5),
        t("Count faces, not letters: D is 1 face of 6.", "अक्षर नहीं, फलक गिनो: D, 6 में से 1 फलक है।"),
      ],
      [frac(1, 4), t("The die has 6 faces: 1 of 6.", "पासे के 6 फलक हैं: 6 में 1।")],
    ],
  ),
} satisfies Record<string, Item>;

/** Find a probability as favourable ÷ all, for one coin, die, spinner or bag. */
export const firstProbabilities = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.ExperimentalAndTheoretical],
});
