import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** One angle of depression from a known height: how far away? */
const items = {
  temple: numItem(
    t(
      "From a fort wall 20 m above the river level, the temple steps across the river are at a depression of 30°. How far are they from the wall's foot?",
      "नदी के स्तर से 20 m ऊँची किले की दीवार से, नदी पार मंदिर की सीढ़ियाँ 30° अवनमन पर हैं। वे दीवार के आधार से कितनी दूर हैं?",
    ),
    "20√3 m",
    [
      [
        "20/√3 m",
        t(
          "tan 30° = 20/d, so d = 20/tan 30° = 20√3. Dividing by √3 turns the ratio upside down.",
          "tan 30° = 20/d, इसलिए d = 20/tan 30° = 20√3। √3 से भाग देने पर अनुपात उल्टा हो जाता है।",
        ),
      ],
      [
        "40 m",
        t(
          "40 = 20 / sin 30° is the slanting line of sight, not the distance along the ground.",
          "40 = 20 / sin 30° तिरछी दृष्टि रेखा है, ज़मीन पर की दूरी नहीं।",
        ),
      ],
    ],
  ),
  cliff: numItem(
    t(
      "From the top of a 50 m cliff, a boat is at a depression of 45°. How far is the boat from the cliff's foot?",
      "50 m ऊँची चट्टान के शीर्ष से एक नाव 45° अवनमन पर है। नाव चट्टान के आधार से कितनी दूर है?",
    ),
    "50 m",
    [
      [
        "50√2 m",
        t(
          "50√2 is the line of sight. At 45°, tan 45° = 1, so the distance equals the height.",
          "50√2 दृष्टि रेखा है। 45° पर tan 45° = 1, इसलिए दूरी ऊँचाई के बराबर है।",
        ),
      ],
      [
        "50√3 m",
        t(
          "That would be for a depression of 30°. At 45° the distance and height are equal.",
          "यह 30° अवनमन के लिए होता। 45° पर दूरी और ऊँचाई बराबर हैं।",
        ),
      ],
    ],
  ),
  steep: numItem(
    t(
      "From the top of a 60 m tower, a car on the road is at a depression of 60°. How far is the car from the tower's foot?",
      "60 m ऊँची मीनार के शीर्ष से सड़क पर एक कार 60° अवनमन पर है। कार मीनार के आधार से कितनी दूर है?",
    ),
    "20√3 m",
    [
      [
        "60√3 m",
        t(
          "60√3 would be for 30°. A steep 60° look means the car is near: d = 60/tan 60° = 60/√3.",
          "60√3 तो 30° के लिए होता। खड़ी 60° नज़र मतलब कार पास है: d = 60/tan 60° = 60/√3।",
        ),
      ],
      [
        "30 m",
        t(
          "30 = 60 cos 60° treats 60 m as the line of sight. It's the height of the tower.",
          "30 = 60 cos 60° में 60 m को दृष्टि रेखा माना। वह मीनार की ऊँचाई है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Find a distance from a height and one angle of depression. */
export const depressionDistances = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.AngleOfDepression],
});
