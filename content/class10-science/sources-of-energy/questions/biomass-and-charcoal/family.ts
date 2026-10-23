import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  charcoal: {
    prompt: t("How is charcoal made from wood?", "लकड़ी से काठ-कोयला कैसे बनता है?"),
    right: t("By burning wood with a limited supply of oxygen", "लकड़ी को सीमित ऑक्सीजन में जलाकर"),
    wrong: [
      {
        label: t(
          "By soaking wood in water for several weeks in a pit",
          "लकड़ी को गड्ढे में कई हफ़्ते पानी में भिगोकर",
        ),
        feedback: t(
          "Soaking rots wood. Charcoal needs burning with little oxygen.",
          "भिगोने से लकड़ी सड़ती है। काठ-कोयले के लिए कम ऑक्सीजन में जलाना होता है।",
        ),
      },
      {
        label: t(
          "By burning wood in plenty of oxygen until only ash is left",
          "लकड़ी को भरपूर ऑक्सीजन में तब तक जलाकर कि केवल राख बचे",
        ),
        feedback: t(
          "Plenty of oxygen burns it fully to ash. Oxygen must be limited.",
          "भरपूर ऑक्सीजन उसे पूरा राख बना देती है। ऑक्सीजन सीमित होनी चाहिए।",
        ),
      },
    ],
  },
  better: {
    prompt: t("Why is charcoal a better fuel than wood?", "काठ-कोयला लकड़ी से बेहतर ईंधन क्यों है?"),
    right: t(
      "It burns without flames, gives little smoke and more heat",
      "यह बिना लपटों के जलता है, कम धुआँ और ज़्यादा ऊष्मा देता है",
    ),
    wrong: [
      {
        label: t(
          "It burns with tall flames and thick smoke, so it cooks faster",
          "यह ऊँची लपटों और घने धुएँ से जलता है, इसलिए जल्दी पकाता है",
        ),
        feedback: t(
          "It's the opposite: charcoal is nearly smokeless.",
          "उलटा है: काठ-कोयला लगभग धुआँ-रहित है।",
        ),
      },
      {
        label: t(
          "It is wetter than wood, so it lasts longer in the chulha fire",
          "यह लकड़ी से गीला है, इसलिए चूल्हे में ज़्यादा देर चलता है",
        ),
        feedback: t(
          "The water and volatile matter have been driven out of charcoal.",
          "काठ-कोयले से पानी और वाष्पशील पदार्थ निकाल दिए गए हैं।",
        ),
      },
    ],
  },
  biomass: {
    prompt: t(
      "Cow-dung, crop waste and wood are together called…",
      "गोबर, फ़सल का कचरा और लकड़ी मिलकर कहलाते हैं…",
    ),
    right: t("biomass", "जैव मात्रा"),
    wrong: [
      {
        label: t("fossil fuel", "जीवाश्म ईंधन"),
        feedback: t(
          "Fossil fuels formed over millions of years; these are fresh plant and animal matter.",
          "जीवाश्म ईंधन लाखों वर्षों में बने; ये ताज़ा पौधे और जंतु पदार्थ हैं।",
        ),
      },
      {
        label: t("petroleum", "पेट्रोलियम"),
        feedback: t(
          "Petroleum is a fossil fuel from under the ground.",
          "पेट्रोलियम ज़मीन के नीचे का जीवाश्म ईंधन है।",
        ),
      },
    ],
  },
  dung: {
    prompt: t(
      "Why is burning dung cakes a poor way to use cow-dung?",
      "उपले जलाना गोबर का उपयोग करने का ख़राब तरीक़ा क्यों है?",
    ),
    right: t(
      "It gives little heat, much smoke, and wastes manure",
      "यह कम ऊष्मा, बहुत धुआँ देता है, और खाद बर्बाद करता है",
    ),
    wrong: [
      {
        label: t(
          "It gives far too much heat, so the cooking pots crack",
          "यह बहुत ही ज़्यादा ऊष्मा देता है, जिससे बर्तन चटक जाते हैं",
        ),
        feedback: t("Dung cakes give little heat, not too much.", "उपले कम ऊष्मा देते हैं, ज़्यादा नहीं।"),
      },
      {
        label: t(
          "It is costly, since dung must be bought from cities",
          "यह महँगा है, क्योंकि गोबर शहरों से ख़रीदना पड़ता है",
        ),
        feedback: t(
          "Dung is cheap and local. The problems are smoke and wasted manure.",
          "गोबर सस्ता और स्थानीय है। समस्या धुआँ और बर्बाद खाद है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Biomass as a fuel, and charcoal (NCERT 14.2.3). */
export const biomassAndCharcoal = family({
  level: Level.Easy,
  tests: [Concept.BiomassAndBiogas],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
