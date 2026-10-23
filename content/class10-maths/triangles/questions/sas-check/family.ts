import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const sas = t("Yes, by SAS", "हाँ, SAS से");
const sss = t("Yes, by SSS", "हाँ, SSS से");
const no = t("No, not similar", "नहीं, समरूप नहीं");

/** Exercise 6.3 Q1 (iv) and (v), and the SAS criterion itself. */
const items = {
  q1iv: {
    prompt: t(
      "∆ MNL: ∠M = 70°, MN = 2.5 cm, ML = 5 cm. ∆ QPR: ∠Q = 70°, QP = 5 cm, QR = 10 cm. Are they similar?",
      "∆ MNL: ∠M = 70°, MN = 2.5 cm, ML = 5 cm। ∆ QPR: ∠Q = 70°, QP = 5 cm, QR = 10 cm। क्या वे समरूप हैं?",
    ),
    right: sas,
    wrong: [
      {
        label: sss,
        why: t(
          "Only two sides of each are known. Two sides in one ratio with the angle between them equal is SAS.",
          "हर एक की केवल दो भुजाएँ पता हैं। एक अनुपात में दो भुजाएँ और उनके बीच का कोण बराबर: यह SAS है।",
        ),
      },
      {
        label: no,
        why: t(
          "MN/QP = ML/QR = 1/2, and the 70° sits between those sides in both.",
          "MN/QP = ML/QR = 1/2, और 70° दोनों में उन्हीं भुजाओं के बीच है।",
        ),
      },
    ],
  },
  q1v: {
    prompt: t(
      "∆ ABC: AB = 2.5 cm, BC = 5 cm, ∠A = 80°. ∆ PQR: PQ = 5 cm, QR = 10 cm, ∠P = 80°. Are they similar?",
      "∆ ABC: AB = 2.5 cm, BC = 5 cm, ∠A = 80°। ∆ PQR: PQ = 5 cm, QR = 10 cm, ∠P = 80°। क्या वे समरूप हैं?",
    ),
    right: t("Can't tell: the angle isn't between them", "नहीं कह सकते: कोण बीच में नहीं"),
    wrong: [
      {
        label: t(
          "Yes, by SAS: two sides and an angle match",
          "हाँ, SAS से: दो भुजाएँ और एक कोण मिलते हैं",
        ),
        why: t(
          "SAS needs the angle between the two sides. ∠A is not between AB and BC; that would be ∠B.",
          "SAS को दोनों भुजाओं के बीच का कोण चाहिए। ∠A, AB और BC के बीच नहीं; वह ∠B होता।",
        ),
      },
      {
        label: t("Yes, by SSS: the sides are in ratio 1 : 2", "हाँ, SSS से: भुजाएँ 1 : 2 के अनुपात में हैं"),
        why: t(
          "The third sides aren't given, so SSS can't be checked.",
          "तीसरी भुजाएँ नहीं दी गईं, तो SSS नहीं जाँच सकते।",
        ),
      },
    ],
  },
  rule: {
    prompt: t(
      "In ∆ ABC and ∆ PQR, AB/PQ = AC/PR. What else makes them similar by SAS?",
      "∆ ABC और ∆ PQR में AB/PQ = AC/PR। SAS से समरूप होने के लिए और क्या चाहिए?",
    ),
    right: t("∠A = ∠P", "∠A = ∠P"),
    wrong: [
      {
        label: t("∠B = ∠Q", "∠B = ∠Q"),
        why: t(
          "∠B isn't between AB and AC. The included angle is ∠A, matching ∠P.",
          "∠B, AB और AC के बीच नहीं। बीच का कोण ∠A है, जो ∠P से मिलता है।",
        ),
      },
      {
        label: t("BC = QR", "BC = QR"),
        why: t(
          "Equal sides aren't needed; SAS needs the included angle equal.",
          "बराबर भुजाएँ ज़रूरी नहीं; SAS को बीच का कोण बराबर चाहिए।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Decide whether two triangles are similar by SAS. */
export const sasCheck = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.SasAndUsingSimilarity],
});
