import { cue, hidden, page, place, scene, t } from "@chalk/author";
import { plane, words } from "@chalk/patterns";
import { Side, equationBalance } from "@chalk/prop-chemistry";
import { StandingKind, classroom } from "@chalk/prop-classroom";
import { Marks, coordinatePlane } from "@chalk/prop-coordinates";
import { peaCross } from "@chalk/prop-heredity";
import { sphericalMirror } from "@chalk/prop-light";

const { setup } = plane;

/**
 * The promo, as a lesson: why Chalk exists, in the words of the volunteer teacher who made it. Three
 * reasons their students couldn't follow, and what Chalk does about the first: every idea is
 * something to play with, in any subject. Every board plays on its own, to be recorded.
 */

/** The three reasons, as chalked on the board and said as each is written. */
const REASONS = [
  t("1. Textbooks make ideas feel dull", "1. पाठ्यपुस्तकें विचारों को नीरस बना देती हैं"),
  t("2. One teacher can't sit with every child", "2. एक शिक्षक हर बच्चे के साथ नहीं बैठ सकता"),
  t("3. Mistakes show up late, without the why", "3. गलतियाँ देर से, बिना वजह के दिखती हैं"),
] as const;
const REASONS_SAID = [
  t("One. Textbooks make ideas feel dull.", "एक। पाठ्यपुस्तकें विचारों को नीरस बना देती हैं।"),
  t("Two. One teacher can't sit with every child.", "दो। एक शिक्षक हर बच्चे के साथ नहीं बैठ सकता।"),
  t("Three. Mistakes show up late, and without the why.", "तीन। गलतियाँ देर से दिखती हैं, और बिना वजह के।"),
] as const;
/** Seconds to chalk one reason: the teacher walks up, writes, steps back. */
const CHALK = 3.2;

/** 1. Why Chalk exists: the teacher's own story, in their classroom, and the three reasons. */
const whyChalk = page(
  "why-chalk-exists",
  scene({
    pieces: {
      title: words.title(t("Why Chalk exists", "चॉक क्यों बना")),
      story: words.body(
        t(
          "I'm a volunteer teacher. Many of my students were falling behind, and I wanted to know why. I found three reasons.",
          "मैं एक स्वयंसेवक शिक्षक था, और मेरे विद्यार्थी मेरी बात समझ नहीं पा रहे थे। तो मैंने वजह खोजनी चाही। मुझे तीन वजहें मिलीं।",
        ),
      ),
      room: place(classroom, {}),
    },
    // Each reason is said as it is chalked.
    cues: {
      first: cue(REASONS_SAID[0], { when: "room.raised" }),
      second: cue(REASONS_SAID[1], { when: "room.written", where: { line: 0 } }),
      third: cue(REASONS_SAID[2], { when: "room.written", where: { line: 1 } }),
    },
    passBy: "rules",
    onSaid: {
      title: (_, t) => t.to.room.loseThem({ seconds: 6 }),
      story: (_, t) => t.to.room.raiseHands({}),
      third: (_, t) => t.later(1.5, t.self.pass()),
    },
    hear: {
      "room.raised": (_, __, t) => t.to.room.write({ line: REASONS[0], seconds: CHALK }),
      "room.written": (_, p, t) =>
        p.line < 2 && t.to.room.write({ line: REASONS[p.line + 1] as (typeof REASONS)[number], seconds: CHALK }),
    },
    witness: [],
  }),
);

/** 2. A mirror: the table a child memorises, then the candle they move. */
const mirror = page(
  "a-mirror",
  scene({
    pieces: {
      title: words.title(t("Something to play with", "खेलने की चीज़")),
      book: words.body(
        t(
          "In a textbook, a concave mirror is a table of six rows to memorise. In Chalk, you move the candle, and watch its image.",
          "पाठ्यपुस्तक में, अवतल दर्पण छह पंक्तियों की एक तालिका है जिसे रटना है। चॉक में, तुम मोमबत्ती खिसकाते हो, और उसका प्रतिबिंब देखते हो।",
        ),
      ),
      bench: place(sphericalMirror, { u: -30, showNumbers: false }),
      flip: hidden(
        words.body(
          t(
            "Far away, it's small and upside down. Closer, it grows. Inside the focus, it flips the right way up: your face in a spoon.",
            "दूर, वह छोटा और उल्टा है। पास आने पर, वह बड़ा होता है। फ़ोकस के अंदर, वह सीधा हो जाता है: चम्मच में तुम्हारा चेहरा।",
          ),
        ),
      ),
    },
    passBy: "rules",
    onSaid: {
      book: (_, t) => [
        t.self.show({ name: "flip" }),
        t.to.bench.moveObjectTo({ u: -20, seconds: 3 }),
      ],
    },
    hear: {
      // Beyond C to C, C to F, then inside F: each leg slows to a stop, so its case can be read.
      "bench.moved": (_, p, t) =>
        p.u === -20
          ? t.later(0.6, t.to.bench.moveObjectTo({ u: -10, seconds: 3 }))
          : p.u === -10
            ? t.later(0.6, t.to.bench.moveObjectTo({ u: -4, seconds: 2.5 }))
            : t.later(2, t.self.pass()),
    },
    witness: [],
  }),
);

/** 3. A graph: a quadratic's zeroes are where it meets the axis; move them, and it follows. */
const graph = page(
  "a-graph",
  scene({
    pieces: {
      title: words.title(t("Any subject", "कोई भी विषय")),
      zeroes: words.body(
        t(
          "A quadratic's zeroes are where its graph meets the x-axis. Bring them together, and it only touches. Lift it, and it never meets the axis at all.",
          "द्विघात बहुपद के शून्यक वहाँ हैं जहाँ उसका ग्राफ़ x-अक्ष से मिलता है। उन्हें पास लाओ, तो वह बस छूता है। उसे ऊपर उठाओ, तो वह अक्ष से कभी नहीं मिलता।",
        ),
        {
          says: t(
            "A quadratic's zeroes are where its graph meets the x axis. Bring them together, and it only touches. Lift it, and it never meets the axis at all.",
            "द्विघात बहुपद के शून्यक वहाँ हैं जहाँ उसका ग्राफ़ एक्स-अक्ष से मिलता है। उन्हें पास लाओ, तो वह बस छूता है। उसे ऊपर उठाओ, तो वह अक्ष से कभी नहीं मिलता।",
          ),
        },
      ),
      sheet: place(
        coordinatePlane,
        setup({
          plane: {
            window: { xMin: -4, xMax: 6, yMin: -5, yMax: 6 },
            marks: Marks.Numbers,
            numbered: ["x", "y"] as ("x" | "y")[],
            hasGrid: true,
          },
          parabola: { zeroes: { alpha: -1, beta: 3 } },
        }),
      ),
    },
    passBy: "rules",
    onSaid: { title: (_, t) => t.to.sheet.parabola.trace({ seconds: 3 }) },
    hear: {
      "sheet.parabola.traced": (_, __, t) =>
        t.later(0.8, t.to.sheet.parabola.moveZeroes({ alpha: 1, beta: 1, seconds: 2.5 })),
      "sheet.parabola.zeroesMoved": (_, __, t) =>
        t.later(1, t.to.sheet.parabola.lift({ to: 2, seconds: 2 })),
      "sheet.parabola.lifted": (_, __, t) => t.later(1.5, t.self.pass()),
    },
    witness: [],
  }),
);

/** 4. An equation: balancing is counting atoms, and no atom is made or lost. */
const equation = page(
  "an-equation",
  scene({
    pieces: {
      title: words.title(t("Count the atoms", "परमाणु गिनो")),
      guess: words.body(
        t(
          "Balancing an equation feels like guessing, until you can count the atoms. Every atom on the left ends up on the right.",
          "समीकरण संतुलित करना अंदाज़ा लगाने जैसा लगता है, जब तक तुम परमाणु गिन न सको। बाईं ओर का हर परमाणु दाईं ओर पहुँचता है।",
        ),
      ),
      lab: place(equationBalance, {}),
    },
    passBy: "rules",
    onSaid: {
      title: (_, t) =>
        t.later(1.2, t.to.lab.setCoefficient({ side: Side.Products, index: 0, coefficient: 2 })),
      guess: (_, t) => t.to.lab.regroup(),
    },
    hear: {
      "lab.counted": (_, p, t) =>
        p.side === Side.Products &&
        t.later(1.2, t.to.lab.setCoefficient({ side: Side.Reactants, index: 0, coefficient: 2 })),
      "lab.regrouped": (_, __, t) => t.later(1.5, t.self.pass()),
    },
    witness: [],
  }),
);

/** 5. Peas: the short plant that vanishes in the children and comes back in the grandchildren. */
const peas = page(
  "pea-plants",
  scene({
    pieces: {
      title: words.title(t("Watch the genes", "जीन देखो")),
      story: words.body(
        t(
          "Cross a tall pea plant with a short one, and every child is tall. Cross two of those children, and a short one comes back. The genes show why.",
          "एक लंबे मटर के पौधे को एक बौने से मिलाओ, तो हर संतान लंबी होती है। उनमें से दो संतानों को मिलाओ, तो एक बौना पौधा लौट आता है। जीन दिखाते हैं क्यों।",
        ),
      ),
      field: place(peaCross, {}),
    },
    passBy: "rules",
    onSaid: { title: (_, t) => t.later(0.6, t.to.field.cross({ seconds: 2.4 })) },
    hear: {
      "field.crossed": (_, p, t) =>
        p.generation === 1
          ? t.later(2.5, t.to.field.nextGeneration({ seconds: 4 }))
          : t.later(2, t.self.pass()),
    },
    witness: [],
  }),
);

/** What Chalk does about each reason, chalked on the board at the close. */
const ANSWERS = [
  t("✓ Ideas they play with", "✓ ऐसे विचार जिनसे वे खेलें"),
  t("✓ A tutor beside every child", "✓ हर बच्चे के साथ एक ट्यूटर"),
  t("✓ Who's stuck, and why, right away", "✓ कौन अटका है, और क्यों, तुरंत"),
] as const;

/** Where each child stands, at the close: one needs the teacher, two are curious, the rest on track. */
const NEEDS_HELP = 6;
const STANDING = Array.from({ length: 12 }, (_, i) =>
  i === NEEDS_HELP
    ? { kind: StandingKind.NeedsHelp, words: t("mixes up x and y", "x और y उलझाता है") }
    : i === 2
      ? { kind: StandingKind.Curious, words: t("curious about mirrors", "दर्पणों के बारे में जिज्ञासु") }
      : i === 9
        ? { kind: StandingKind.Curious, words: t("ready for more", "आगे के लिए तैयार") }
        : { kind: StandingKind.OnTrack, words: null },
);

/** 6. The close: the same classroom; the teacher knows where each child stands, and goes to the one who needs him. */
const close = page(
  "thats-why",
  scene({
    pieces: {
      title: words.title(t("That's why Chalk exists", "इसीलिए चॉक बना")),
      room: place(classroom, { lines: [...ANSWERS], standing: STANDING }),
      see: hidden(
        words.body(
          t(
            "Now I can see where each child stands: who needs me, and for what.",
            "अब मैं देख सकता हूँ कि हर बच्चा कहाँ है: किसे मेरी ज़रूरत है, और किस बात में।",
          ),
        ),
      ),
      curious: hidden(
        words.body(
          t(
            "And the rest aren't lost any more. They're curious.",
            "और बाकी अब खोए हुए नहीं हैं। वे जिज्ञासु हैं।",
          ),
        ),
      ),
      made: hidden(
        words.definition(t("This video is a Chalk lesson.", "यह वीडियो चॉक का एक पाठ है।")),
      ),
    },
    passBy: "rules",
    onSaid: {
      title: (_, t) => t.to.room.lightUp({ seconds: 2.5 }),
      curious: (_, t) => t.to.room.spark({ seconds: 1.5 }),
      made: (_, t) => t.later(2, t.self.pass()),
    },
    hear: {
      "room.lit": (_, __, t) => [
        t.self.show({ name: "see" }),
        t.to.room.revealStanding({ seconds: 2.5 }),
      ],
      "room.revealed": (_, __, t) => t.to.room.visit({ child: NEEDS_HELP, seconds: 3 }),
      "room.visited": (_, __, t) => [t.self.hide({ name: "see" }), t.self.show({ name: "curious" })],
      "room.sparked": (_, __, t) => t.later(0.6, t.self.show({ name: "made" })),
    },
    witness: [],
  }),
);

/** The pages, in reading order. */
export const overview = [whyChalk, mirror, graph, equation, peas, close];
