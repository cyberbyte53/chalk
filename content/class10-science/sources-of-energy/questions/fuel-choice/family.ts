import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  village: {
    prompt: t(
      "For cooking in a village with no gas supply, which fuel is the best choice?",
      "जिस गाँव में गैस नहीं आती, वहाँ खाना पकाने के लिए कौन-सा ईंधन सबसे अच्छा है?",
    ),
    right: t(
      "Charcoal: hot, smokeless, and made locally",
      "काठ-कोयला: गर्म, धुआँ-रहित, और स्थानीय रूप से बना",
    ),
    wrong: [
      {
        label: t(
          "Petrol: very hot, but costly and unsafe at home",
          "पेट्रोल: बहुत गर्म, पर घर में महँगा और असुरक्षित",
        ),
        feedback: t(
          "Petrol is unsafe in a kitchen and costly to bring to a village.",
          "पेट्रोल रसोई में असुरक्षित है और गाँव तक लाना महँगा।",
        ),
      },
      {
        label: t(
          "Cow-dung cakes: cheap, but very smoky to cook on",
          "उपले: सस्ते, पर उन पर पकाने में बहुत धुआँ",
        ),
        feedback: t(
          "Dung cakes give little heat and a lot of smoke.",
          "उपले कम ऊष्मा और बहुत धुआँ देते हैं।",
        ),
      },
    ],
  },
  rocket: {
    prompt: t(
      "Which fuel is used in rockets because it gives the most heat per kilogram?",
      "रॉकेटों में कौन-सा ईंधन उपयोग होता है क्योंकि वह प्रति किलोग्राम सबसे ज़्यादा ऊष्मा देता है?",
    ),
    right: t("Hydrogen", "हाइड्रोजन"),
    wrong: [
      {
        label: t("Kerosene", "मिट्टी का तेल"),
        feedback: t(
          "Kerosene gives less heat per kg than hydrogen.",
          "मिट्टी का तेल हाइड्रोजन से प्रति kg कम ऊष्मा देता है।",
        ),
      },
      {
        label: t("Charcoal", "काठ-कोयला"),
        feedback: t(
          "Charcoal is a solid and gives far less heat per kg.",
          "काठ-कोयला ठोस है और प्रति kg बहुत कम ऊष्मा देता है।",
        ),
      },
    ],
  },
  city: {
    prompt: t(
      "Why do many city kitchens use LPG instead of wood?",
      "शहर की कई रसोइयाँ लकड़ी की जगह एलपीजी क्यों उपयोग करती हैं?",
    ),
    right: t(
      "It burns hot and clean, in handy cylinders",
      "यह गर्म और साफ़ जलती है, और आसान सिलिंडरों में आती है",
    ),
    wrong: [
      {
        label: t(
          "It is free and grows back after each use",
          "यह मुफ़्त है और हर उपयोग के बाद फिर उग आती है",
        ),
        feedback: t(
          "LPG is bought, and it is a fossil fuel: it doesn't grow back.",
          "एलपीजी ख़रीदी जाती है, और यह जीवाश्म ईंधन है: फिर नहीं उगती।",
        ),
      },
      {
        label: t(
          "It gives more smoke, which keeps flies away",
          "यह ज़्यादा धुआँ देती है, जो मक्खियाँ भगाता है",
        ),
        feedback: t(
          "LPG gives almost no smoke; that's one of its strengths.",
          "एलपीजी लगभग धुआँ नहीं देती; यही उसकी एक ख़ूबी है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Choosing a fuel for a job (NCERT 14.1, Activities 14.1 and 14.2). */
export const fuelChoice = family({
  level: Level.Easy,
  tests: [Concept.GoodSourceOfEnergy],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
