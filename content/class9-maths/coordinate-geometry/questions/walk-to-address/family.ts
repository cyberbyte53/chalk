import { family, place, scene, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { TOWN, check, plane } from "@chalk/patterns";
import { coordinatePlane } from "@chalk/prop-coordinates";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Given an address, walk Riya there: along the main road to the street, then up it to the house. */
export const walkToAddress = family({
  level: Level.Easy,
  tests: [Concept.TwoNumbersForAPlace],
  params: z
    .object({
      street: z.number().int().min(1).max(TOWN.streets),
      house: z.number().int().min(1).max(TOWN.houses),
    })
    .strict(),
  build: ({ street, house }) => {
    const { isAt, walkTo, walkerAt } = plane;
    const town = place(coordinatePlane, plane.town());
    const isSwapped = street !== house && house <= TOWN.streets && street <= TOWN.houses;
    const ask = check({
      about: "town",
      prompt: t(
        `Aman lives at **Street ${street}, House ${house}**. Walk Riya there from the corner, then press Check.`,
        `अमन **गली ${street}, मकान ${house}** पर रहता है। रिया को कोने से वहाँ चलाओ, फिर जाँचो दबाओ।`,
      ),
      isRight: isAt("town", street, house),
      answer: (read) => {
        const { x, y } = walkerAt("town")(read);
        if (x === 0 && y === 0) return t("the corner", "कोना");
        return y === 0
          ? t(`the main road, at Street ${x}`, `मुख्य सड़क, गली ${x} पर`)
          : t(`Street ${x}, House ${y}`, `गली ${x}, मकान ${y}`);
      },
      solve: walkTo("town", street, house),
      notes: isSwapped
        ? [
            {
              when: isAt("town", house, street),
              say: t(
                `That's Street ${house}, House ${street}. The street comes first: how far along the main road.`,
                `यह गली ${house}, मकान ${street} है। गली पहले आती है: मुख्य सड़क पर कितनी दूर।`,
              ),
              reach: walkTo("town", house, street),
            },
          ]
        : [],
    });
    return scene({ pieces: { town, ask: ask.piece }, uses: [ask.use] });
  },
});
