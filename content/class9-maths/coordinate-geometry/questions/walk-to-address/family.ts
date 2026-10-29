import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { TOWN, bareTown, check, isAt, walkTo } from "@chalk/patterns";
import { coordinatePlaneDef } from "@chalk/prop-coordinates";
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
  build: ({ street, house }, b) => {
    const town = b.prop(coordinatePlaneDef, "town", bareTown());
    const isSwapped = street !== house && house <= TOWN.streets && street <= TOWN.houses;
    const ask = check(b, {
      about: town,
      prompt: t(
        `Aman lives at **Street ${street}, House ${house}**. Walk Riya there from the corner, then press Check.`,
        `अमन **गली ${street}, मकान ${house}** पर रहता है। रिया को कोने से वहाँ चलाओ, फिर जाँचो दबाओ।`,
      ),
      isRight: isAt(town, street, house),
      solve: walkTo(town, street, house),
      notes: isSwapped
        ? [
            {
              when: isAt(town, house, street),
              say: t(
                `That's Street ${house}, House ${street}. The street comes first: how far along the main road.`,
                `यह गली ${house}, मकान ${street} है। गली पहले आती है: मुख्य सड़क पर कितनी दूर।`,
              ),
              reach: walkTo(town, house, street),
            },
          ]
        : [],
    });
    return [town, ask];
  },
});
