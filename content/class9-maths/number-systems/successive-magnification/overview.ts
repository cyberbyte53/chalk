import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { magnifier } from "@chalk/content-source/patterns";
import { dec } from "@chalk/exact";
import { TextStyle, textDef } from "@chalk/prop-basics";
import { NumberLineDerived, NumberLineSignal, numberLineDef } from "@chalk/prop-number-line";

/** The number the zoom page magnifies into: three zooms, three digits. */
const ZOOM_VALUE = dec("2.665");

/** Every decimal has an exact home on the line; each digit after the point picks one box of ten. */
const idea = page("idea", (b) =>
  column([
    b.prop(textDef, "title", {
      text: t(
        "Every decimal has an exact home on the number line.",
        "हर दशमलव का संख्या रेखा पर एक पक्का घर है।",
      ),
      style: TextStyle.Title,
    }),
    b.prop(textDef, "body", {
      text: t(
        "Between 2 and 3 there are ten equal boxes: 2.1, 2.2, … 2.9. Inside each box, ten more. Each digit after the point picks one box.",
        "2 और 3 के बीच दस बराबर डिब्बे हैं: 2.1, 2.2, … 2.9। हर डिब्बे में दस और। दशमलव के बाद हर अंक एक डिब्बा चुनता है।",
      ),
    }),
    b.prop(numberLineDef, "line", { from: 2, to: 3 }),
    space(),
  ]),
);

/** Zoom into 2.665 one digit at a time: three zooms, three digits, and it sits on a tick. */
const zoom = page(
  "zoom",
  (b) => {
    const title = b.prop(textDef, "title", {
      text: t(
        `Where exactly is ${ZOOM_VALUE}? Tap Zoom in: the line magnifies 10 times into the small box that has ${ZOOM_VALUE}.`,
        `${ZOOM_VALUE} ठीक कहाँ है? 'ज़ूम करो' दबाओ: रेखा उस छोटे डिब्बे में 10 गुना बड़ी हो जाएगी जिसमें ${ZOOM_VALUE} है।`,
      ),
      style: TextStyle.Title,
    });
    const { line, pieces } = magnifier(b, {
      value: ZOOM_VALUE,
      from: 2,
      to: 3,
      zooms: ZOOM_VALUE.places,
    });
    const reveal = b.prop(
      textDef,
      "reveal",
      {
        text: t(
          `First the box 2.6 to 2.7, then 2.66 to 2.67, and now ${ZOOM_VALUE} sits right on a tick. Each zoom reads one digit: a decimal is an address on the line.`,
          `पहले डिब्बा 2.6 से 2.7, फिर 2.66 से 2.67, और अब ${ZOOM_VALUE} ठीक एक निशान पर है। हर ज़ूम एक अंक पढ़ता है: दशमलव, रेखा पर एक पता है।`,
        ),
      },
      { isHidden: true },
    );
    b.when(
      line.on(NumberLineSignal.Zoomed),
      [theBoard.show(reveal), theBoard.pass()],
      line.derived(NumberLineDerived.Level).eq(ZOOM_VALUE.places),
    );
    return column([title, ...pieces, reveal, space()]);
  },
  { passOn: PassOn.Rules },
);

/** A sandbox: drag the marker anywhere and zoom in on it as far as you like. No task, no check. */
const play = page("play", (b) =>
  column([
    b.prop(textDef, "prompt", {
      text: t(
        "Drag the marker anywhere, then zoom in on it. Watch one more digit appear with every zoom.",
        "मार्कर को कहीं भी खींचो, फिर उस पर ज़ूम करो। हर ज़ूम के साथ एक और अंक आता देखो।",
      ),
    }),
    b.prop(numberLineDef, "line", {
      from: 0,
      to: 10,
      showMarker: true,
      marker: 3.7,
      isZoomable: true,
    }),
    space(),
  ]),
);

/** The pages, in reading order. Leave one out to drop it from the build. */
export const overview = [idea, zoom, play];
