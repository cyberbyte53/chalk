import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  hotSpot: {
    prompt: t("Where does geothermal energy come from?", "भूतापीय ऊर्जा कहाँ से आती है?"),
    right: t("Molten rock heating water deep below", "गहराई में पिघली चट्टानों से पानी का गर्म होना"),
    wrong: [
      {
        label: t("Sunlight heating the soil on the surface", "सतह पर मिट्टी को गर्म करती धूप"),
        feedback: t(
          "Geothermal heat comes from inside the earth, not the Sun.",
          "भूतापीय ऊष्मा पृथ्वी के भीतर से आती है, सूर्य से नहीं।",
        ),
      },
      {
        label: t("Coal burning slowly in old mines below", "नीचे पुरानी खदानों में धीरे जलता कोयला"),
        feedback: t(
          "Nothing burns: molten rock (magma) heats the water.",
          "कुछ नहीं जलता: पिघली चट्टान (मैग्मा) पानी गर्म करती है।",
        ),
      },
    ],
  },
  springs: {
    prompt: t(
      "When hot groundwater finds an outlet at the surface, it forms…",
      "जब गर्म भूजल को सतह पर निकास मिलता है, तो बनते हैं…",
    ),
    right: t("hot springs", "गर्म चश्मे"),
    wrong: [
      {
        label: t("ice caves", "बर्फ़ की गुफाएँ"),
        feedback: t(
          "Ice caves are cold. Hot water rising out forms hot springs.",
          "बर्फ़ की गुफाएँ ठंडी हैं। ऊपर आता गर्म पानी गर्म चश्मे बनाता है।",
        ),
      },
      {
        label: t("oil wells", "तेल के कुएँ"),
        feedback: t(
          "Oil wells give petroleum. Hot water gives hot springs.",
          "तेल के कुएँ पेट्रोलियम देते हैं। गर्म पानी गर्म चश्मे देता है।",
        ),
      },
    ],
  },
  pros: {
    prompt: t("What are the advantages of geothermal power?", "भूतापीय विद्युत के क्या लाभ हैं?"),
    right: t(
      "Cheap to run once built, and it works day and night",
      "बनने के बाद चलाना सस्ता, और यह दिन-रात चलती है",
    ),
    wrong: [
      {
        label: t(
          "Cheap to build, and it works in every town and city",
          "बनाना सस्ता, और यह हर क़स्बे और शहर में चलती है",
        ),
        feedback: t(
          "It is costly to build and works only at a few hot spots.",
          "इसे बनाना महँगा है और यह कुछ गर्म स्थलों पर ही चलती है।",
        ),
      },
      {
        label: t(
          "It runs only in sunshine, so it needs no fuel at all",
          "यह केवल धूप में चलती है, इसलिए ईंधन नहीं चाहिए",
        ),
        feedback: t(
          "Geothermal doesn't need sunshine; it runs all the time.",
          "भूतापीय को धूप नहीं चाहिए; यह हर समय चलती है।",
        ),
      },
    ],
  },
  few: {
    prompt: t(
      "Why are there only a few geothermal power plants?",
      "भूतापीय विद्युत संयंत्र बहुत कम क्यों हैं?",
    ),
    right: t("Hot spots are few, and deep drilling is costly", "गर्म स्थल कम हैं, और गहरी खुदाई महँगी है"),
    wrong: [
      {
        label: t(
          "Their smoke is too harmful to breathe nearby",
          "उनका धुआँ पास में साँस लेने के लिए बहुत हानिकारक है",
        ),
        feedback: t(
          "They give almost no smoke. The limit is few sites and cost.",
          "वे लगभग धुआँ नहीं देते। सीमा कम जगहें और लागत है।",
        ),
      },
      {
        label: t(
          "The earth will cool down if we use up its heat",
          "अगर हम उसकी ऊष्मा लें तो पृथ्वी ठंडी हो जाएगी",
        ),
        feedback: t(
          "The earth's heat is a huge reservoir; using some hardly matters.",
          "पृथ्वी की ऊष्मा विशाल भंडार है; थोड़ा उपयोग फ़र्क़ नहीं डालता।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Geothermal energy (NCERT 14.3.3). */
export const geothermalFacts = family({
  level: Level.Easy,
  tests: [Concept.SeaAndGeothermal],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});
