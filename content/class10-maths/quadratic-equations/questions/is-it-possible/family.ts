import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemQuestion, seedOf } from "../../kit";

const r = String.raw;

/** Exercise 4.4 Q3–Q5 and the rocket: is the situation possible? Decide from D. */
const items: Record<string, Item> = {
  grove: {
    prompt: t(
      r`A mango grove twice as long as it is broad, with area 800 m², gives $x^2 - 400 = 0$. Is it possible?`,
      r`चौड़ाई से दुगुना लंबा, 800 m² क्षेत्रफल वाला आम का बाग़ $x^2 - 400 = 0$ देता है। क्या यह संभव है?`,
    ),
    right: t("Yes: 20 m by 40 m", "हाँ: 20 m × 40 m"),
    wrong: [
      {
        label: t("No", "नहीं"),
        why: t(
          r`$D = 0 + 1600 > 0$, so there are real roots: $x = 20$.`,
          r`$D = 0 + 1600 > 0$, तो वास्तविक मूल हैं: $x = 20$।`,
        ),
      },
    ],
  },
  friends: {
    prompt: t(
      r`Two friends' ages add to 20, and four years ago their product was 48. This gives $x^2 - 20x + 112 = 0$. Is it possible?`,
      r`दो दोस्तों की आयु का योग 20 है, और चार साल पहले गुणनफल 48 था। इससे $x^2 - 20x + 112 = 0$ मिलता है। क्या यह संभव है?`,
    ),
    right: t("No: D < 0", "नहीं: D < 0"),
    wrong: [
      {
        label: t("Yes", "हाँ"),
        why: t(
          r`$D = 400 - 448 = -48 < 0$: no real age works.`,
          r`$D = 400 - 448 = -48 < 0$: कोई वास्तविक आयु नहीं चलती।`,
        ),
      },
    ],
  },
  park: {
    prompt: t(
      r`A rectangular park with perimeter 80 m and area 400 m² gives $x^2 - 40x + 400 = 0$. Is it possible?`,
      r`80 m परिमाप और 400 m² क्षेत्रफल वाला आयताकार पार्क $x^2 - 40x + 400 = 0$ देता है। क्या यह संभव है?`,
    ),
    right: t("Yes: a 20 m by 20 m square", "हाँ: 20 m × 20 m का वर्ग"),
    wrong: [
      {
        label: t("No", "नहीं"),
        why: t(
          r`$D = 1600 - 1600 = 0$: one repeated root, $x = 20$. Possible, and it's a square.`,
          r`$D = 1600 - 1600 = 0$: एक दोहराया मूल, $x = 20$। संभव है, और यह एक वर्ग है।`,
        ),
      },
    ],
  },
  rocket25: {
    prompt: t(
      r`Kabir's rocket has height $h = 20t - 5t^2$. Reaching 25 m means $t^2 - 4t + 5 = 0$. Is it possible?`,
      r`कबीर के रॉकेट की ऊँचाई $h = 20t - 5t^2$ है। 25 m तक पहुँचने का अर्थ है $t^2 - 4t + 5 = 0$। क्या यह संभव है?`,
    ),
    right: t("No: D < 0", "नहीं: D < 0"),
    wrong: [
      {
        label: t("Yes, at t = 2 s", "हाँ, t = 2 s पर"),
        why: t(
          r`$D = 16 - 20 = -4$. At $t = 2$ s the rocket is at its top, 20 m.`,
          r`$D = 16 - 20 = -4$। $t = 2$ s पर रॉकेट अपने शिखर, 20 m पर है।`,
        ),
      },
    ],
  },
  rocket15: {
    prompt: t(
      r`Reaching 15 m means $t^2 - 4t + 3 = 0$. When is Kabir's rocket 15 m up?`,
      r`15 m तक पहुँचने का अर्थ है $t^2 - 4t + 3 = 0$। कबीर का रॉकेट 15 m ऊपर कब है?`,
    ),
    right: t("At 1 s and at 3 s", "1 s पर और 3 s पर"),
    wrong: [
      {
        label: t("Only at 1 s", "केवल 1 s पर"),
        why: t(
          "D = 4 > 0: two times, once going up and once coming down.",
          "D = 4 > 0: दो बार, एक बार ऊपर जाते और एक बार नीचे आते।",
        ),
      },
      {
        label: t("Never", "कभी नहीं"),
        why: t(
          "D = 16 − 12 = 4 > 0, so there are two real times.",
          "D = 16 − 12 = 4 > 0, तो दो वास्तविक समय हैं।",
        ),
      },
    ],
  },
};
type Name = keyof typeof items;

/** Is a situation possible? Decide from the discriminant of its equation. */
export const isItPossible = family({
  level: Level.Medium,
  tests: [Concept.NatureOfRoots],
  params: z.object({ item: z.enum(Object.keys(items) as [Name, ...Name[]]) }).strict(),
  build: ({ item }, b) => {
    const it = items[item];
    if (it === undefined) throw new Error(`no item ${item}`);
    return column([itemQuestion(b, it, seedOf(item)), space()]);
  },
});
