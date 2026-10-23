import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  good: {
    prompt: t("What is a good source of energy?", "ऊर्जा का अच्छा स्रोत क्या है?"),
    right: t(
      "One that does much work per unit mass and is easy to store, carry and afford",
      "जो प्रति इकाई द्रव्यमान बहुत कार्य करे और रखने, ढोने व ख़रीदने में आसान हो",
    ),
    wrong: [
      {
        label: t(
          "One that gives lots of smoke so that we can see it is really burning well",
          "जो बहुत धुआँ दे ताकि हम देख सकें कि वह सच में अच्छी तरह जल रहा है",
        ),
        feedback: t(
          "Smoke is a drawback: it pollutes. A good source gives much work cleanly and cheaply.",
          "धुआँ एक कमी है: यह प्रदूषण करता है। अच्छा स्रोत साफ़ और सस्ते में बहुत कार्य देता है।",
        ),
      },
      {
        label: t(
          "One that is rare and costly, so people are careful to use only a little of it",
          "जो दुर्लभ और महँगा हो, ताकि लोग सावधानी से उसका थोड़ा ही उपयोग करें",
        ),
        feedback: t(
          "A good source is easily available and economical, not rare and costly.",
          "अच्छा स्रोत आसानी से मिलता है और सस्ता होता है, दुर्लभ और महँगा नहीं।",
        ),
      },
    ],
  },
  fuel: {
    prompt: t("What is a good fuel?", "अच्छा ईंधन क्या है?"),
    right: t(
      "One that gives much heat per kg, little smoke, and is easy to get",
      "जो प्रति kg बहुत ऊष्मा और कम धुआँ दे, और आसानी से मिले",
    ),
    wrong: [
      {
        label: t(
          "One that burns very slowly and gives a little heat for a very long time",
          "जो बहुत धीरे जले और बहुत लंबे समय तक थोड़ी-सी ऊष्मा देता रहे",
        ),
        feedback: t(
          "A good fuel gives a large amount of heat per unit mass.",
          "अच्छा ईंधन प्रति इकाई द्रव्यमान बहुत ऊष्मा देता है।",
        ),
      },
      {
        label: t(
          "One that is heavy and bulky, so a small amount of it lasts for many days",
          "जो भारी और भरकम हो, ताकि उसकी थोड़ी मात्रा कई दिनों तक चले",
        ),
        feedback: t(
          "Heavy and bulky fuels are hard to store and transport.",
          "भारी और भरकम ईंधन रखने और ढोने में कठिन होते हैं।",
        ),
      },
    ],
  },
  notQuality: {
    prompt: t(
      "Which is NOT a quality of a good source of energy?",
      "इनमें से कौन अच्छे ऊर्जा स्रोत का गुण नहीं है?",
    ),
    right: t("Gives a lot of smoke", "बहुत धुआँ देता है"),
    wrong: [
      {
        label: t("Is easy to store and carry", "रखना और ढोना आसान है"),
        feedback: t("Being easy to store is one of the qualities.", "रखने में आसान होना एक गुण है।"),
      },
      {
        label: t("Is cheap to buy", "ख़रीदना सस्ता है"),
        feedback: t(
          "Being economical is perhaps the most important quality.",
          "सस्ता होना शायद सबसे ज़रूरी गुण है।",
        ),
      },
    ],
  },
  spread: {
    prompt: t(
      "When we use energy, what happens to it?",
      "जब हम ऊर्जा का उपयोग करते हैं, उसका क्या होता है?",
    ),
    right: t(
      "It changes into forms that are less useful to us",
      "वह ऐसे रूपों में बदलती है जो हमारे कम काम के हैं",
    ),
    wrong: [
      {
        label: t(
          "It is destroyed and the total energy goes down",
          "वह नष्ट हो जाती है और कुल ऊर्जा घट जाती है",
        ),
        feedback: t(
          "Energy is never destroyed; it spreads out into less usable forms.",
          "ऊर्जा कभी नष्ट नहीं होती; वह कम उपयोगी रूपों में फैल जाती है।",
        ),
      },
      {
        label: t(
          "It is stored and can all be fully used again later",
          "वह जमा हो जाती है और बाद में पूरी फिर काम आती है",
        ),
        feedback: t(
          "Spread-out energy, like warm air, can't easily be used again.",
          "फैली हुई ऊर्जा, जैसे गर्म हवा, आसानी से फिर काम नहीं आती।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** The qualities of a good source of energy and of a good fuel (NCERT 14.1; in-text Q1, Q2). */
export const goodSourceQualities = family({
  level: Level.Easy,
  tests: [Concept.GoodSourceOfEnergy],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
