import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  earth: {
    prompt: t(
      "Why are metal-bodied appliances earthed?",
      "धातु के खोल वाले उपकरणों का भू-संपर्कण क्यों किया जाता है?",
    ),
    right: t(
      "So any current leaking to the body goes to the ground, and the user doesn't get a severe shock",
      "ताकि खोल तक रिसने वाली धारा ज़मीन में जाए, और उपयोगकर्ता को गंभीर झटका न लगे",
    ),
    wrong: [
      {
        label: t("To make them heat faster", "ताकि वे तेज़ी से गर्म हों"),
        feedback: t(
          "The earth wire carries no current in normal use; it's purely for safety.",
          "सामान्य उपयोग में भू-तार में कोई धारा नहीं बहती; वह केवल सुरक्षा के लिए है।",
        ),
      },
    ],
  },
  fuse: {
    prompt: t("A fuse protects a circuit by…", "फ़्यूज़ परिपथ की रक्षा करता है…"),
    right: t(
      "melting and breaking the circuit when the current is too large",
      "धारा बहुत बड़ी होने पर पिघलकर परिपथ तोड़कर",
    ),
    wrong: [
      {
        label: t("storing extra current", "अतिरिक्त धारा जमा करके"),
        feedback: t(
          "A fuse stores nothing; Joule heating melts its wire.",
          "फ़्यूज़ कुछ जमा नहीं करता; जूल तापन उसका तार पिघलाता है।",
        ),
      },
    ],
  },
  oven: {
    prompt: t(
      "A 2 kW oven is run on a 220 V circuit rated 5 A. What happens?",
      "2 kW का ओवन 5 A अनुमतांक वाले 220 V परिपथ पर चलाया जाता है। क्या होता है?",
    ),
    right: t("The fuse melts: the oven needs about 9 A", "फ़्यूज़ पिघल जाता है: ओवन को लगभग 9 A चाहिए"),
    wrong: [
      {
        label: t("It works normally, as 5 A is plenty", "वह सामान्य चलता है, क्योंकि 5 A काफ़ी है"),
        feedback: t(
          "I = P/V = 2000/220 ≈ 9.1 A, almost twice the 5 A rating.",
          "I = P/V = 2000/220 ≈ 9.1 A, 5 A अनुमतांक का लगभग दुगना।",
        ),
      },
      {
        label: t("It works at half power, slowly", "वह आधी शक्ति पर, धीरे चलता है"),
        feedback: t(
          "An appliance doesn't adjust itself to a circuit; it draws its current and the fuse melts.",
          "उपकरण अपने को परिपथ के अनुसार नहीं ढालता; वह अपनी धारा लेता है और फ़्यूज़ पिघलता है।",
        ),
      },
    ],
  },
  overload: {
    prompt: t("Which helps avoid overloading?", "अतिभारण से बचने में क्या मदद करता है?"),
    right: t("Not connecting too many appliances to one socket", "एक सॉकेट में बहुत सारे उपकरण न जोड़ना"),
    wrong: [
      {
        label: t("Using a thicker fuse wire", "मोटा फ़्यूज़ तार लगाना"),
        feedback: t(
          "A thicker fuse wouldn't melt in time: the wiring could overheat.",
          "मोटा फ़्यूज़ समय पर नहीं पिघलेगा: वायरिंग गर्म हो सकती है।",
        ),
      },
    ],
  },
  safety: {
    prompt: t(
      "Name two safety measures used in electric circuits.",
      "विद्युत परिपथों में उपयोग होने वाले दो सुरक्षा उपाय बताओ।",
    ),
    right: t("An electric fuse, and earthing", "विद्युत फ़्यूज़, और भू-संपर्कण"),
    wrong: [
      {
        label: t("A switch, and a bulb", "स्विच, और बल्ब"),
        feedback: t("Switches and bulbs aren't safety devices.", "स्विच और बल्ब सुरक्षा युक्तियाँ नहीं हैं।"),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** The earth wire, the fuse and overloading (NCERT 13.7; in-text Q1–Q3; Exercise 18). */
export const electricalSafety = family({
  level: Level.Medium,
  tests: [Concept.DomesticCircuits],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
