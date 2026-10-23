import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  litmus: {
    prompt: w("Litmus comes from a lichen. It is a:", "लिटमस लाइकेन से आता है। यह है:"),
    right: w("Natural indicator", "प्राकृतिक सूचक"),
    wrong: [
      wrong(
        w("Synthetic indicator", "संश्लेषित सूचक"),
        w(
          "Synthetic ones are made in factories; litmus comes from a living thing.",
          "संश्लेषित कारख़ानों में बनते हैं; लिटमस एक सजीव से आता है।",
        ),
      ),
      wrong(
        w("Olfactory indicator", "गंधीय सूचक"),
        w(
          "Olfactory indicators change smell; litmus changes colour.",
          "गंधीय सूचक गंध बदलते हैं; लिटमस रंग बदलता है।",
        ),
      ),
    ],
  },
  phenolphthalein: {
    prompt: w("Phenolphthalein is a:", "फ़िनॉल्फ़्थेलिन है:"),
    right: w("Synthetic indicator", "संश्लेषित सूचक"),
    wrong: [
      wrong(
        w("Natural indicator", "प्राकृतिक सूचक"),
        w(
          "It is made in factories, not taken from a plant.",
          "यह कारख़ानों में बनता है, पौधे से नहीं लिया जाता।",
        ),
      ),
    ],
  },
  vanilla: {
    prompt: w(
      "Vanilla essence loses its smell in a base. It can be used as a:",
      "वनीला एसेंस क्षारक में अपनी गंध खो देता है। इसे इस्तेमाल कर सकते हैं:",
    ),
    right: w("Olfactory indicator", "गंधीय सूचक की तरह"),
    wrong: [
      wrong(
        w("Synthetic indicator", "संश्लेषित सूचक की तरह"),
        w(
          "The point is that its smell changes: that's an olfactory indicator.",
          "बात यह है कि इसकी गंध बदलती है: यह गंधीय सूचक है।",
        ),
      ),
    ],
  },
  hydrangea: {
    prompt: w(
      "The petals of Hydrangea, Petunia and Geranium can show acid or base. They are:",
      "हाइड्रेंजिया, पेटूनिया और जेरेनियम की पंखुड़ियाँ अम्ल या क्षारक दिखा सकती हैं। ये हैं:",
    ),
    right: w("Natural indicators", "प्राकृतिक सूचक"),
    wrong: [
      wrong(
        w("Olfactory indicators", "गंधीय सूचक"),
        w("They change colour, not smell.", "ये रंग बदलती हैं, गंध नहीं।"),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** Natural, synthetic or olfactory: what kind of indicator is it? */
export const indicatorKind = family({
  level: Level.Easy,
  tests: [Concept.Indicators],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});
