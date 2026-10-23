import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, frac } from "../../kit";

const range = t("A probability always lies from 0 to 1.", "प्रायिकता हमेशा 0 से 1 के बीच होती है।");

/** Exercise 15.1 Q1 (ii, iii, v), Q4 and Q6: impossible, sure, and 0 ≤ P(E) ≤ 1. */
const items = {
  q1ii: {
    prompt: t(
      "Exercise 15.1 Q1 (ii). The probability of an event that cannot happen is …, and it is called …",
      "प्रश्नावली 15.1 प्रश्न 1 (ii). जो घटना हो ही न सके उसकी प्रायिकता … होती है, और उसे … कहते हैं।",
    ),
    right: t("0, an impossible event", "0, असंभव घटना"),
    wrong: [
      {
        label: t("1, an impossible event", "1, असंभव घटना"),
        why: t("No outcome is favourable: 0 ÷ n = 0.", "कोई परिणाम अनुकूल नहीं: 0 ÷ n = 0।"),
      },
      {
        label: t("0, an elementary event", "0, प्रारंभिक घटना"),
        why: t(
          "An elementary event has exactly one outcome; this one has none: impossible.",
          "प्रारंभिक घटना में ठीक एक परिणाम होता है; इसमें कोई नहीं: असंभव।",
        ),
      },
    ],
  },
  q1iii: {
    prompt: t(
      "Exercise 15.1 Q1 (iii). The probability of an event that is certain to happen is …, and it is called …",
      "प्रश्नावली 15.1 प्रश्न 1 (iii). जो घटना निश्चित रूप से हो उसकी प्रायिकता … होती है, और उसे … कहते हैं।",
    ),
    right: t("1, a sure event", "1, निश्चित घटना"),
    wrong: [
      {
        label: t("0, a sure event", "0, निश्चित घटना"),
        why: t("Every outcome is favourable: n ÷ n = 1.", "हर परिणाम अनुकूल है: n ÷ n = 1।"),
      },
      {
        label: t("1, a likely event", "1, संभावित घटना"),
        why: t(
          "Certain to happen has a name of its own: a sure (certain) event.",
          "निश्चित रूप से होने वाली घटना का अपना नाम है: निश्चित घटना।",
        ),
      },
    ],
  },
  q1v: {
    prompt: t(
      "Exercise 15.1 Q1 (v). The probability of an event is greater than or equal to … and less than or equal to …",
      "प्रश्नावली 15.1 प्रश्न 1 (v). किसी घटना की प्रायिकता … से बड़ी या बराबर और … से छोटी या बराबर होती है।",
    ),
    right: t("0 and 1", "0 और 1"),
    wrong: [
      { label: t("−1 and 1", "−1 और 1"), why: range },
      { label: t("0 and 100", "0 और 100"), why: range },
    ],
  },
  q4: {
    prompt: t(
      "Exercise 15.1 Q4. Which of these **cannot** be the probability of an event?",
      "प्रश्नावली 15.1 प्रश्न 4. इनमें से कौन किसी घटना की प्रायिकता **नहीं** हो सकती?",
    ),
    right: t("−1.5", "−1.5"),
    wrong: [
      {
        label: t("15%", "15%"),
        why: t("15% is 0.15, which is between 0 and 1.", "15% यानी 0.15, जो 0 और 1 के बीच है।"),
      },
      {
        label: t(frac(2, 3), frac(2, 3)),
        why: t("2/3 lies between 0 and 1, so it can be.", "2/3, 0 और 1 के बीच है, तो हो सकती है।"),
      },
      {
        label: t("0.7", "0.7"),
        why: t("0.7 lies between 0 and 1, so it can be.", "0.7, 0 और 1 के बीच है, तो हो सकती है।"),
      },
    ],
  },
  q6i: {
    prompt: t(
      "Exercise 15.1 Q6 (i). A bag has only lemon candies. Malini takes one without looking. What is P(an orange candy)?",
      "प्रश्नावली 15.1 प्रश्न 6 (i). एक थैले में केवल नींबू वाली टॉफ़ियाँ हैं। मालिनी बिना देखे एक निकालती है। P(संतरे वाली टॉफ़ी) क्या है?",
    ),
    right: t("0", "0"),
    wrong: [
      {
        label: t("1", "1"),
        why: t(
          "There are no orange candies at all: an impossible event.",
          "संतरे वाली टॉफ़ी है ही नहीं: असंभव घटना।",
        ),
      },
      {
        label: t("½", "½"),
        why: t(
          "Orange and lemon aren't equally likely: there is no orange one. 0.",
          "संतरा और नींबू समप्रायिक नहीं: संतरे वाली एक भी नहीं। 0।",
        ),
      },
    ],
  },
  q6ii: {
    prompt: t(
      "Exercise 15.1 Q6 (ii). The bag has only lemon candies. What is P(a lemon candy)?",
      "प्रश्नावली 15.1 प्रश्न 6 (ii). थैले में केवल नींबू वाली टॉफ़ियाँ हैं। P(नींबू वाली टॉफ़ी) क्या है?",
    ),
    right: t("1", "1"),
    wrong: [
      {
        label: t("0", "0"),
        why: t("Every candy is lemon: a sure event.", "हर टॉफ़ी नींबू वाली है: निश्चित घटना।"),
      },
      {
        label: t("½", "½"),
        why: t(
          "There's no other flavour to share with: it's certain.",
          "बाँटने को कोई और स्वाद नहीं: यह निश्चित है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Impossible and sure events, and the range 0 ≤ P(E) ≤ 1. */
export const zeroToOne = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.ComplementaryEvents],
});
