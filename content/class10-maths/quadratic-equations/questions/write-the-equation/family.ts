import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemQuestion, seedOf } from "../../kit";

const r = String.raw;
const m = (tex: string) => t(`$${tex}$`, `$${tex}$`);

/** Exercise 4.1 Q2 and Example 1: a situation, and the quadratic equation it gives. */
const items: Record<string, Item> = {
  plot: {
    prompt: t(
      r`A rectangular plot has area 528 m², and its length is one more than twice its breadth $x$. Which equation does $x$ satisfy?`,
      r`एक आयताकार प्लॉट का क्षेत्रफल 528 m² है, और उसकी लंबाई चौड़ाई $x$ के दुगुने से एक ज़्यादा है। $x$ कौन-सा समीकरण संतुष्ट करता है?`,
    ),
    right: m(r`2x^2 + x - 528 = 0`),
    wrong: [
      {
        label: m(r`2x^2 + x + 528 = 0`),
        why: t(
          r`$x(2x + 1) = 528$; moving 528 to the left makes it $-528$.`,
          r`$x(2x + 1) = 528$; 528 को बाईं ओर लाने पर वह $-528$ बनता है।`,
        ),
      },
      {
        label: m(r`2x + 1 = 528`),
        why: t(
          "That's the length alone. The area is breadth times length.",
          "यह तो केवल लंबाई है। क्षेत्रफल चौड़ाई गुणा लंबाई है।",
        ),
      },
    ],
  },
  consecutive: {
    prompt: t(
      r`The product of two consecutive positive integers is 306. With the smaller one $x$, which equation is right?`,
      r`दो क्रमागत धनात्मक पूर्णांकों का गुणनफल 306 है। छोटे को $x$ लेने पर कौन-सा समीकरण सही है?`,
    ),
    right: m(r`x^2 + x - 306 = 0`),
    wrong: [
      {
        label: m(r`x^2 + 2x - 306 = 0`),
        why: t(
          r`Consecutive integers differ by 1, so the next one is $x + 1$, not $x + 2$.`,
          r`क्रमागत पूर्णांकों में 1 का अंतर होता है, तो अगला $x + 1$ है, $x + 2$ नहीं।`,
        ),
      },
      {
        label: m(r`2x + 1 = 306`),
        why: t(
          r`That's their sum. The product is $x(x + 1)$.`,
          r`यह उनका योग है। गुणनफल $x(x + 1)$ है।`,
        ),
      },
    ],
  },
  rohan: {
    prompt: t(
      r`Rohan's mother is 26 years older than him. In 3 years the product of their ages will be 360. With Rohan's present age $x$, which equation is right?`,
      r`रोहन की माँ उससे 26 साल बड़ी हैं। 3 साल बाद उनकी आयु का गुणनफल 360 होगा। रोहन की वर्तमान आयु $x$ लेने पर कौन-सा समीकरण सही है?`,
    ),
    right: m(r`x^2 + 32x - 273 = 0`),
    wrong: [
      {
        label: m(r`x^2 + 26x - 360 = 0`),
        why: t(
          r`That uses today's ages. In 3 years they are $x + 3$ and $x + 29$.`,
          r`यह आज की आयु है। 3 साल बाद वे $x + 3$ और $x + 29$ होंगे।`,
        ),
      },
      {
        label: m(r`x^2 + 32x + 87 = 0`),
        why: t(
          r`$(x + 3)(x + 29) = x^2 + 32x + 87$ must equal 360: subtract 360 to get $-273$.`,
          r`$(x + 3)(x + 29) = x^2 + 32x + 87$ को 360 के बराबर होना है: 360 घटाने पर $-273$ मिलता है।`,
        ),
      },
    ],
  },
  train: {
    prompt: t(
      r`A train covers 480 km at a steady speed $x$ km/h. Had it been 8 km/h slower, it would have taken 3 hours more. Which equation is right?`,
      r`एक ट्रेन एकसमान चाल $x$ km/h से 480 km चलती है। अगर वह 8 km/h धीमी होती, तो 3 घंटे ज़्यादा लगते। कौन-सा समीकरण सही है?`,
    ),
    right: m(r`x^2 - 8x - 1280 = 0`),
    wrong: [
      {
        label: m(r`x^2 + 8x - 1280 = 0`),
        why: t(
          r`Slower is $x - 8$. From $\frac{480}{x - 8} - \frac{480}{x} = 3$ you get $3840 = 3x^2 - 24x$, i.e. $x^2 - 8x - 1280 = 0$.`,
          r`धीमी चाल $x - 8$ है। $\frac{480}{x - 8} - \frac{480}{x} = 3$ से $3840 = 3x^2 - 24x$, यानी $x^2 - 8x - 1280 = 0$।`,
        ),
      },
      {
        label: m(r`x(x - 8) = 480`),
        why: t(
          r`Speed times speed means nothing here. Use time $= \frac{\text{distance}}{\text{speed}}$ for each journey.`,
          r`यहाँ चाल गुणा चाल का कोई अर्थ नहीं। हर यात्रा के लिए समय $= \frac{\text{दूरी}}{\text{चाल}}$ लो।`,
        ),
      },
    ],
  },
  marbles: {
    prompt: t(
      r`John and Jivanti have 45 marbles together. Each loses 5, and the product of what's left is 124. With John's marbles $x$, which equation is right?`,
      r`जॉन और जीवंती के पास मिलाकर 45 कंचे हैं। दोनों 5-5 खोते हैं, और बचे कंचों का गुणनफल 124 है। जॉन के कंचे $x$ लेने पर कौन-सा समीकरण सही है?`,
    ),
    right: m(r`x^2 - 45x + 324 = 0`),
    wrong: [
      {
        label: m(r`x(45 - x) = 124`),
        why: t(
          r`They each lost 5 first: the product is $(x - 5)(40 - x)$.`,
          r`दोनों पहले 5-5 खो चुके हैं: गुणनफल $(x - 5)(40 - x)$ है।`,
        ),
      },
      {
        label: m(r`x^2 - 45x - 324 = 0`),
        why: t(
          r`$(x - 5)(40 - x) = -x^2 + 45x - 200 = 124$ gives $-x^2 + 45x - 324 = 0$; multiplying by $-1$ flips every sign.`,
          r`$(x - 5)(40 - x) = -x^2 + 45x - 200 = 124$ से $-x^2 + 45x - 324 = 0$; $-1$ से गुणा करने पर हर चिह्न पलटता है।`,
        ),
      },
    ],
  },
};
type Name = keyof typeof items;

/** Turn a situation into a quadratic equation in standard form. */
export const writeTheEquation = family({
  level: Level.Medium,
  tests: [Concept.WhatIsAQuadraticEquation],
  params: z.object({ item: z.enum(Object.keys(items) as [Name, ...Name[]]) }).strict(),
  build: ({ item }, b) => {
    const it = items[item];
    if (it === undefined) throw new Error(`no item ${item}`);
    return column([itemQuestion(b, it, seedOf(item)), space()]);
  },
});
