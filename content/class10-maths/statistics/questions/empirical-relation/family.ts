import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** 3 Median = Mode + 2 Mean, and which measure suits which data (Section 14.4, Exercise 14.3 Q1 and Q6). */
const items = {
  mode1: numItem(
    t(
      "Exercise 14.3 Q1: median 137 and mean 137.05. Estimate the mode from 3 Median = Mode + 2 Mean.",
      "प्रश्नावली 14.3 प्र1: माध्यक 137 और माध्य 137.05। 3 माध्यक = बहुलक + 2 माध्य से बहुलक का अनुमान लगाओ।",
    ),
    "136.9",
    [
      [
        "137.1",
        t(
          "Mode = 3 × 137 − 2 × 137.05 = 411 − 274.1 = 136.9.",
          "बहुलक = 3 × 137 − 2 × 137.05 = 411 − 274.1 = 136.9।",
        ),
      ],
      [
        "137.0",
        t(
          "Work it out: Mode = 3 Median − 2 Mean = 411 − 274.1 = 136.9.",
          "हल करो: बहुलक = 3 माध्यक − 2 माध्य = 411 − 274.1 = 136.9।",
        ),
      ],
    ],
  ),
  median6: numItem(
    t(
      "Exercise 14.3 Q6: mode 7.88 and mean 8.32. Estimate the median.",
      "प्रश्नावली 14.3 प्र6: बहुलक 7.88 और माध्य 8.32। माध्यक का अनुमान लगाओ।",
    ),
    "8.17",
    [
      [
        "8.10",
        t(
          "That's the plain average. The mean counts twice: (7.88 + 2 × 8.32)/3 = 8.17.",
          "यह सीधा औसत है। माध्य दो बार गिना जाता है: (7.88 + 2 × 8.32)/3 = 8.17।",
        ),
      ],
      [
        "8.03",
        t(
          "That counts the mode twice. Median = (Mode + 2 Mean)/3 = 8.17.",
          "इसमें बहुलक दो बार गिना गया। माध्यक = (बहुलक + 2 माध्य)/3 = 8.17।",
        ),
      ],
    ],
  ),
  mean: numItem(
    t(
      "For some data the median is 30 and the mode is 24. Estimate the mean.",
      "किसी आँकड़े का माध्यक 30 और बहुलक 24 है। माध्य का अनुमान लगाओ।",
    ),
    "33",
    [
      [
        "27",
        t(
          "27 is the plain average. 2 Mean = 3 × 30 − 24 = 66, so the mean is 33.",
          "27 सीधा औसत है। 2 माध्य = 3 × 30 − 24 = 66, तो माध्य 33 है।",
        ),
      ],
      ["66", t("66 is 2 Mean. Halve it: the mean is 33.", "66, 2 माध्य है। इसे आधा करो: माध्य 33 है।")],
    ],
  ),
} satisfies Record<string, Item>;

export const empiricalRelation = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.MedianOfGroupedData],
});
