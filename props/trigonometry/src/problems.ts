import type { Pt, Words } from "./trig";

/**
 * Heights-and-distances problems, each drawn to scale (metres, y up) with its working. NCERT
 * Ch 9 Examples 1–7 and Exercise 9.1 Q5, Q13, Q14, plus the Kite Hill mission's own problems.
 */

export const Problem = {
  Ex1Tower: "ex1Tower",
  Ex2Ladder: "ex2Ladder",
  Ex3Chimney: "ex3Chimney",
  Ex4Flagstaff: "ex4Flagstaff",
  Ex5Shadow: "ex5Shadow",
  Ex6Buildings: "ex6Buildings",
  Ex7Bridge: "ex7Bridge",
  Q5Kite: "q5Kite",
  Q13Ships: "q13Ships",
  Q14Balloon: "q14Balloon",
  FortTower: "fortTower",
  KiteString: "kiteString",
  TempleRiver: "templeRiver",
} as const;
export type Problem = (typeof Problem)[keyof typeof Problem];

export type Thing =
  | {
      kind: "tower" | "building" | "pole" | "chimney" | "lighthouse" | "wall" | "temple";
      base: string;
      top: string;
    }
  | { kind: "person"; foot: string; eye: string }
  | { kind: "ladder" | "string" | "rope"; a: string; b: string }
  | { kind: "kite" | "balloon" | "ship" | "flag"; at: string }
  | { kind: "water"; a: string; b: string }
  | { kind: "deck"; a: string; b: string };

export type Arc = { at: string; a: string; b: string; text: string; r?: number };
export type Length = {
  a: string;
  b: string;
  /** What is written before the problem is solved ("15 m", "h", "?"). */
  text: string;
  /** What is written once solved (only for unknowns). */
  value?: string;
  /** Which side of a→b the label sits: 1 left of the direction, −1 right. */
  side?: 1 | -1;
};

export type ProblemSpec = {
  title: Words;
  /** The question in a sentence (the prop shows it; lessons may hide it). */
  question: Words;
  points: Record<string, Pt>;
  things: Thing[];
  /** Lines of sight, eye → object. */
  sights: [string, string][];
  /** Horizontal reference lines at an eye (for depression), from → towards. */
  horizontals: [string, string][];
  /** Other construction lines (dashed). */
  guides: [string, string][];
  arcs: Arc[];
  rights: { at: string; a: string; b: string }[];
  lengths: Length[];
  /** Which points get their letter written. */
  labels: string[];
  /** The working, TeX, one line per step. */
  steps: string[];
  /** The answer as a sentence. */
  answer: Words;
  /** The answer as a number (m), for checking. */
  value: number;
};

const r3 = Math.sqrt(3);

export const PROBLEMS: Record<Problem, ProblemSpec> = {
  [Problem.Ex1Tower]: {
    title: { en: "Example 1: the tower", hi: "उदाहरण 1: मीनार" },
    question: {
      en: "From a point 15 m from the foot of a tower, the angle of elevation of its top is 60°. How tall is the tower?",
      hi: "मीनार के पाद से 15 m दूर एक बिंदु से उसके शिखर का उन्नयन कोण 60° है। मीनार कितनी ऊँची है?",
    },
    points: { A: [0, 15 * r3], B: [0, 0], C: [15, 0] },
    things: [{ kind: "tower", base: "B", top: "A" }],
    sights: [["C", "A"]],
    horizontals: [],
    guides: [],
    arcs: [{ at: "C", a: "B", b: "A", text: "60°" }],
    rights: [{ at: "B", a: "C", b: "A" }],
    lengths: [
      { a: "B", b: "C", text: "15 m", side: -1 },
      { a: "B", b: "A", text: "h", value: "15√3 m", side: 1 },
    ],
    labels: ["A", "B", "C"],
    steps: [
      "\\tan 60^\\circ = \\dfrac{AB}{BC}",
      "\\sqrt{3} = \\dfrac{AB}{15}",
      "AB = 15\\sqrt{3}\\ \\text{m} \\approx 25.98\\ \\text{m}",
    ],
    answer: {
      en: "The tower is 15√3 m (about 25.98 m) tall.",
      hi: "मीनार 15√3 m (लगभग 25.98 m) ऊँची है।",
    },
    value: 15 * r3,
  },
  [Problem.Ex2Ladder]: {
    title: { en: "Example 2: the electrician's ladder", hi: "उदाहरण 2: बिजली मिस्त्री की सीढ़ी" },
    question: {
      en: "She must reach 1.3 m below the top of a 5 m pole with a ladder at 60° to the ground. How long is the ladder, and how far from the pole is its foot?",
      hi: "उसे 5 m ऊँचे खंभे के शिखर से 1.3 m नीचे तक पहुँचना है, सीढ़ी भूमि से 60° पर है। सीढ़ी कितनी लंबी हो, और उसका पाद खंभे से कितनी दूर हो?",
    },
    points: { A: [0, 5], B: [0, 3.7], D: [0, 0], C: [3.7 / r3, 0] },
    things: [
      { kind: "pole", base: "D", top: "A" },
      { kind: "ladder", a: "C", b: "B" },
    ],
    sights: [],
    horizontals: [],
    guides: [],
    arcs: [{ at: "C", a: "D", b: "B", text: "60°" }],
    rights: [{ at: "D", a: "C", b: "B" }],
    lengths: [
      { a: "D", b: "B", text: "3.7 m", side: 1 },
      { a: "B", b: "A", text: "1.3 m", side: 1 },
      { a: "C", b: "B", text: "?", value: "4.28 m", side: -1 },
      { a: "D", b: "C", text: "?", value: "2.14 m", side: 1 },
    ],
    labels: ["A", "B", "C", "D"],
    steps: [
      "BD = AD - AB = 5 - 1.3 = 3.7\\ \\text{m}",
      "\\dfrac{BD}{BC} = \\sin 60^\\circ:\\ \\dfrac{3.7}{BC} = \\dfrac{\\sqrt{3}}{2}",
      "BC = \\dfrac{3.7 \\times 2}{\\sqrt{3}} \\approx 4.28\\ \\text{m}",
      "\\dfrac{DC}{BD} = \\cot 60^\\circ = \\dfrac{1}{\\sqrt{3}}:\\ DC = \\dfrac{3.7}{\\sqrt{3}} \\approx 2.14\\ \\text{m}",
    ],
    answer: {
      en: "The ladder is about 4.28 m long; its foot is about 2.14 m from the pole.",
      hi: "सीढ़ी लगभग 4.28 m लंबी है; उसका पाद खंभे से लगभग 2.14 m दूर है।",
    },
    value: 7.4 / r3,
  },
  [Problem.Ex3Chimney]: {
    title: { en: "Example 3: the chimney", hi: "उदाहरण 3: चिमनी" },
    question: {
      en: "A 1.5 m tall observer is 28.5 m from a chimney. The angle of elevation of its top from her eyes is 45°. How tall is the chimney?",
      hi: "1.5 m लंबी एक प्रेक्षक चिमनी से 28.5 m दूर है। उसकी आँखों से चिमनी के शिखर का उन्नयन कोण 45° है। चिमनी कितनी ऊँची है?",
    },
    points: { C: [0, 0], D: [0, 1.5], B: [28.5, 0], E: [28.5, 1.5], A: [28.5, 30] },
    things: [
      { kind: "person", foot: "C", eye: "D" },
      { kind: "chimney", base: "B", top: "A" },
    ],
    sights: [["D", "A"]],
    horizontals: [["D", "E"]],
    guides: [],
    arcs: [{ at: "D", a: "E", b: "A", text: "45°" }],
    rights: [{ at: "E", a: "D", b: "A" }],
    lengths: [
      { a: "C", b: "B", text: "28.5 m", side: -1 },
      { a: "C", b: "D", text: "1.5 m", side: 1 },
      { a: "B", b: "A", text: "?", value: "30 m", side: -1 },
    ],
    labels: ["A", "B", "C", "D", "E"],
    steps: [
      "AB = AE + BE = AE + 1.5",
      "\\tan 45^\\circ = \\dfrac{AE}{DE}:\\ 1 = \\dfrac{AE}{28.5}",
      "AE = 28.5,\\ AB = 28.5 + 1.5 = 30\\ \\text{m}",
    ],
    answer: { en: "The chimney is 30 m tall.", hi: "चिमनी 30 m ऊँची है।" },
    value: 30,
  },
  [Problem.Ex4Flagstaff]: {
    title: { en: "Example 4: the flag on the building", hi: "उदाहरण 4: भवन पर झंडा" },
    question: {
      en: "From P, the top of a 10 m building is at 30° and the top of the flagstaff on it at 45°. How long is the flagstaff, and how far is the building?",
      hi: "P से 10 m ऊँचे भवन का शिखर 30° पर और उस पर लगे ध्वज-दंड का शिखर 45° पर दिखता है। ध्वज-दंड कितना लंबा है, और भवन कितनी दूर है?",
    },
    points: { P: [0, 0], A: [10 * r3, 0], B: [10 * r3, 10], D: [10 * r3, 10 * r3] },
    things: [
      { kind: "building", base: "A", top: "B" },
      { kind: "pole", base: "B", top: "D" },
      { kind: "flag", at: "D" },
    ],
    sights: [
      ["P", "B"],
      ["P", "D"],
    ],
    horizontals: [],
    guides: [],
    arcs: [
      { at: "P", a: "A", b: "B", text: "30°", r: 30 },
      { at: "P", a: "A", b: "D", text: "45°", r: 54 },
    ],
    rights: [{ at: "A", a: "P", b: "B" }],
    lengths: [
      { a: "A", b: "B", text: "10 m", side: -1 },
      { a: "B", b: "D", text: "x", value: "7.32 m", side: -1 },
      { a: "P", b: "A", text: "?", value: "10√3 m", side: -1 },
    ],
    labels: ["P", "A", "B", "D"],
    steps: [
      "\\tan 30^\\circ = \\dfrac{AB}{AP}:\\ \\dfrac{1}{\\sqrt{3}} = \\dfrac{10}{AP}",
      "AP = 10\\sqrt{3} \\approx 17.32\\ \\text{m}",
      "\\tan 45^\\circ = \\dfrac{AD}{AP}:\\ 1 = \\dfrac{10 + x}{10\\sqrt{3}}",
      "x = 10(\\sqrt{3} - 1) \\approx 7.32\\ \\text{m}",
    ],
    answer: {
      en: "The flagstaff is about 7.32 m long; the building is 10√3 m (about 17.32 m) from P.",
      hi: "ध्वज-दंड लगभग 7.32 m लंबा है; भवन P से 10√3 m (लगभग 17.32 m) दूर है।",
    },
    value: 10 * (r3 - 1),
  },
  [Problem.Ex5Shadow]: {
    title: { en: "Example 5: the longer shadow", hi: "उदाहरण 5: लंबी छाया" },
    question: {
      en: "A tower's shadow is 40 m longer when the Sun's altitude is 30° than when it is 60°. How tall is the tower?",
      hi: "जब सूर्य का उन्नतांश 30° होता है, तो मीनार की छाया 60° की तुलना में 40 m लंबी होती है। मीनार कितनी ऊँची है?",
    },
    points: { A: [0, 20 * r3], B: [0, 0], C: [20, 0], D: [60, 0] },
    things: [{ kind: "tower", base: "B", top: "A" }],
    sights: [
      ["C", "A"],
      ["D", "A"],
    ],
    horizontals: [],
    guides: [],
    arcs: [
      { at: "C", a: "B", b: "A", text: "60°" },
      { at: "D", a: "B", b: "A", text: "30°", r: 26 },
    ],
    rights: [{ at: "B", a: "C", b: "A" }],
    lengths: [
      { a: "B", b: "C", text: "x", value: "20 m", side: -1 },
      { a: "C", b: "D", text: "40 m", side: -1 },
      { a: "B", b: "A", text: "h", value: "20√3 m", side: 1 },
    ],
    labels: ["A", "B", "C", "D"],
    steps: [
      "\\tan 60^\\circ = \\dfrac{AB}{BC}:\\ \\sqrt{3} = \\dfrac{h}{x},\\ h = x\\sqrt{3}",
      "\\tan 30^\\circ = \\dfrac{AB}{BD}:\\ \\dfrac{1}{\\sqrt{3}} = \\dfrac{h}{x + 40}",
      "x\\sqrt{3} \\cdot \\sqrt{3} = x + 40:\\ 3x = x + 40,\\ x = 20",
      "h = 20\\sqrt{3}\\ \\text{m} \\approx 34.64\\ \\text{m}",
    ],
    answer: {
      en: "The tower is 20√3 m (about 34.64 m) tall.",
      hi: "मीनार 20√3 m (लगभग 34.64 m) ऊँची है।",
    },
    value: 20 * r3,
  },
  [Problem.Ex6Buildings]: {
    title: { en: "Example 6: two buildings", hi: "उदाहरण 6: दो भवन" },
    question: {
      en: "From the top of a tall building, the angles of depression of the top and bottom of an 8 m building are 30° and 45°. How tall is the tall building, and how far apart are they?",
      hi: "एक ऊँचे भवन के शिखर से 8 m ऊँचे भवन के शिखर और पाद के अवनमन कोण 30° और 45° हैं। ऊँचा भवन कितना ऊँचा है, और दोनों भवन कितनी दूर हैं?",
    },
    points: (() => {
      const pc = 4 * (3 + r3);
      return {
        C: [0, 0] as Pt,
        P: [0, pc] as Pt,
        D: [0, 8] as Pt,
        A: [pc, 0] as Pt,
        B: [pc, 8] as Pt,
        Q: [pc + 6, pc] as Pt,
      };
    })(),
    things: [
      { kind: "building", base: "C", top: "P" },
      { kind: "building", base: "A", top: "B" },
    ],
    sights: [
      ["P", "B"],
      ["P", "A"],
    ],
    horizontals: [["P", "Q"]],
    guides: [["D", "B"]],
    arcs: [
      { at: "P", a: "Q", b: "B", text: "30°", r: 40 },
      { at: "P", a: "Q", b: "A", text: "45°", r: 22 },
    ],
    rights: [{ at: "C", a: "P", b: "A" }],
    lengths: [
      { a: "A", b: "B", text: "8 m", side: -1 },
      { a: "C", b: "P", text: "?", value: "4(3 + √3) m", side: 1 },
      { a: "C", b: "A", text: "?", value: "4(3 + √3) m", side: -1 },
    ],
    labels: ["P", "C", "D", "A", "B"],
    steps: [
      "\\angle PBD = 30^\\circ,\\ \\angle PAC = 45^\\circ\\ (\\text{alternate angles})",
      "\\dfrac{PD}{BD} = \\tan 30^\\circ = \\dfrac{1}{\\sqrt{3}}:\\ BD = PD\\sqrt{3}",
      "\\dfrac{PC}{AC} = \\tan 45^\\circ = 1:\\ PC = AC,\\ \\text{so}\\ PD + 8 = PD\\sqrt{3}",
      "PD = \\dfrac{8}{\\sqrt{3} - 1} = \\dfrac{8(\\sqrt{3} + 1)}{(\\sqrt{3} + 1)(\\sqrt{3} - 1)} = 4(\\sqrt{3} + 1)",
      "PC = 4(\\sqrt{3} + 1) + 8 = 4(3 + \\sqrt{3})\\ \\text{m} = AC",
    ],
    answer: {
      en: "The tall building is 4(3 + √3) m (about 18.93 m) tall, and the buildings are 4(3 + √3) m apart.",
      hi: "ऊँचा भवन 4(3 + √3) m (लगभग 18.93 m) ऊँचा है, और दोनों भवनों के बीच 4(3 + √3) m की दूरी है।",
    },
    value: 4 * (3 + r3),
  },
  [Problem.Ex7Bridge]: {
    title: { en: "Example 7: the river under the bridge", hi: "उदाहरण 7: पुल के नीचे नदी" },
    question: {
      en: "From a point on a bridge 3 m above the banks, the angles of depression of the two banks are 30° and 45°. How wide is the river?",
      hi: "किनारों से 3 m ऊँचे पुल के एक बिंदु से दोनों किनारों के अवनमन कोण 30° और 45° हैं। नदी कितनी चौड़ी है?",
    },
    points: {
      D: [0, 0],
      P: [0, 3],
      A: [-3 * r3, 0],
      B: [3, 0],
      L: [-3 * r3 - 1.2, 3],
      R: [4.2, 3],
    },
    things: [
      { kind: "water", a: "A", b: "B" },
      { kind: "deck", a: "L", b: "R" },
    ],
    sights: [
      ["P", "A"],
      ["P", "B"],
    ],
    horizontals: [],
    guides: [["P", "D"]],
    arcs: [
      { at: "P", a: "L", b: "A", text: "30°", r: 26 },
      { at: "P", a: "R", b: "B", text: "45°", r: 20 },
    ],
    rights: [{ at: "D", a: "A", b: "P" }],
    lengths: [
      { a: "D", b: "P", text: "3 m", side: -1 },
      { a: "A", b: "B", text: "?", value: "3(√3 + 1) m", side: -1 },
    ],
    labels: ["P", "D", "A", "B"],
    steps: [
      "\\tan 30^\\circ = \\dfrac{PD}{AD}:\\ \\dfrac{1}{\\sqrt{3}} = \\dfrac{3}{AD},\\ AD = 3\\sqrt{3}",
      "\\tan 45^\\circ = \\dfrac{PD}{BD}:\\ BD = PD = 3",
      "AB = AD + BD = 3\\sqrt{3} + 3 = 3(\\sqrt{3} + 1)\\ \\text{m} \\approx 8.2\\ \\text{m}",
    ],
    answer: {
      en: "The river is 3(√3 + 1) m (about 8.2 m) wide.",
      hi: "नदी 3(√3 + 1) m (लगभग 8.2 m) चौड़ी है।",
    },
    value: 3 * (r3 + 1),
  },
  [Problem.Q5Kite]: {
    title: { en: "Exercise 9.1, Q5: the kite", hi: "प्रश्नावली 9.1, प्र.5: पतंग" },
    question: {
      en: "A kite flies 60 m above the ground; its string, tied to the ground, makes 60° with it. How long is the string?",
      hi: "एक पतंग भूमि से 60 m ऊपर उड़ रही है; भूमि पर बँधी उसकी डोरी भूमि से 60° बनाती है। डोरी कितनी लंबी है?",
    },
    points: { O: [0, 0], K: [60 / r3, 60], F: [60 / r3, 0] },
    things: [
      { kind: "string", a: "O", b: "K" },
      { kind: "kite", at: "K" },
    ],
    sights: [],
    horizontals: [],
    guides: [["F", "K"]],
    arcs: [{ at: "O", a: "F", b: "K", text: "60°" }],
    rights: [{ at: "F", a: "O", b: "K" }],
    lengths: [
      { a: "F", b: "K", text: "60 m", side: -1 },
      { a: "O", b: "K", text: "?", value: "40√3 m", side: 1 },
    ],
    labels: ["O", "K", "F"],
    steps: [
      "\\sin 60^\\circ = \\dfrac{KF}{OK}:\\ \\dfrac{\\sqrt{3}}{2} = \\dfrac{60}{OK}",
      "OK = \\dfrac{120}{\\sqrt{3}} = 40\\sqrt{3} \\approx 69.28\\ \\text{m}",
    ],
    answer: {
      en: "The string is 40√3 m (about 69.28 m) long.",
      hi: "डोरी 40√3 m (लगभग 69.28 m) लंबी है।",
    },
    value: 40 * r3,
  },
  [Problem.Q13Ships]: {
    title: { en: "Exercise 9.1, Q13: two ships", hi: "प्रश्नावली 9.1, प्र.13: दो जहाज़" },
    question: {
      en: "From the top of a 75 m lighthouse, the angles of depression of two ships, one behind the other, are 45° and 30°. How far apart are the ships?",
      hi: "75 m ऊँचे प्रकाश-स्तंभ के शिखर से एक के पीछे एक खड़े दो जहाज़ों के अवनमन कोण 45° और 30° हैं। जहाज़ों के बीच कितनी दूरी है?",
    },
    points: { A: [0, 0], B: [0, 75], C: [75, 0], D: [75 * r3, 0], E: [75 * r3 + 10, 75] },
    things: [
      { kind: "lighthouse", base: "A", top: "B" },
      { kind: "water", a: "A", b: "E" },
      { kind: "ship", at: "C" },
      { kind: "ship", at: "D" },
    ],
    sights: [
      ["B", "C"],
      ["B", "D"],
    ],
    horizontals: [["B", "E"]],
    guides: [],
    arcs: [
      { at: "B", a: "E", b: "D", text: "30°", r: 44 },
      { at: "B", a: "E", b: "C", text: "45°", r: 22 },
    ],
    rights: [{ at: "A", a: "C", b: "B" }],
    lengths: [
      { a: "A", b: "B", text: "75 m", side: 1 },
      { a: "C", b: "D", text: "?", value: "75(√3 − 1) m", side: -1 },
    ],
    labels: ["A", "B", "C", "D"],
    steps: [
      "\\angle BCA = 45^\\circ,\\ \\angle BDA = 30^\\circ\\ (\\text{alternate angles})",
      "\\tan 45^\\circ = \\dfrac{AB}{AC}:\\ AC = 75",
      "\\tan 30^\\circ = \\dfrac{AB}{AD}:\\ AD = 75\\sqrt{3}",
      "CD = AD - AC = 75(\\sqrt{3} - 1) \\approx 54.9\\ \\text{m}",
    ],
    answer: {
      en: "The ships are 75(√3 − 1) m (about 54.9 m) apart.",
      hi: "जहाज़ों के बीच 75(√3 − 1) m (लगभग 54.9 m) की दूरी है।",
    },
    value: 75 * (r3 - 1),
  },
  [Problem.Q14Balloon]: {
    title: { en: "Exercise 9.1, Q14: the balloon", hi: "प्रश्नावली 9.1, प्र.14: गुब्बारा" },
    question: {
      en: "A 1.2 m tall girl sees a balloon 88.2 m above the ground at 60°; later at 30°. How far did the balloon travel?",
      hi: "1.2 m लंबी एक लड़की भूमि से 88.2 m ऊपर एक गुब्बारे को 60° पर देखती है; कुछ देर बाद 30° पर। गुब्बारा कितनी दूर गया?",
    },
    points: {
      G: [0, 0],
      E: [0, 1.2],
      P: [87 / r3, 88.2],
      Q: [87 * r3, 88.2],
      M: [87 / r3, 1.2],
      N: [87 * r3, 1.2],
    },
    things: [
      { kind: "person", foot: "G", eye: "E" },
      { kind: "balloon", at: "P" },
      { kind: "balloon", at: "Q" },
    ],
    sights: [
      ["E", "P"],
      ["E", "Q"],
    ],
    horizontals: [["E", "N"]],
    guides: [
      ["M", "P"],
      ["N", "Q"],
      ["P", "Q"],
    ],
    arcs: [
      { at: "E", a: "N", b: "P", text: "60°", r: 30 },
      { at: "E", a: "N", b: "Q", text: "30°", r: 52 },
    ],
    rights: [{ at: "M", a: "E", b: "P" }],
    lengths: [
      { a: "M", b: "P", text: "87 m", side: -1 },
      { a: "P", b: "Q", text: "?", value: "58√3 m", side: 1 },
    ],
    labels: ["E", "P", "Q", "M", "N"],
    steps: [
      "PM = QN = 88.2 - 1.2 = 87\\ \\text{m}",
      "\\tan 60^\\circ = \\dfrac{PM}{EM}:\\ EM = \\dfrac{87}{\\sqrt{3}} = 29\\sqrt{3}",
      "\\tan 30^\\circ = \\dfrac{QN}{EN}:\\ EN = 87\\sqrt{3}",
      "PQ = MN = EN - EM = 58\\sqrt{3} \\approx 100.46\\ \\text{m}",
    ],
    answer: {
      en: "The balloon travelled 58√3 m (about 100.46 m).",
      hi: "गुब्बारा 58√3 m (लगभग 100.46 m) गया।",
    },
    value: 58 * r3,
  },
  [Problem.FortTower]: {
    title: { en: "The fort's watch-tower", hi: "किले की बुर्ज" },
    question: {
      en: "Kabir stands 30 m from the watch-tower; his eyes are 1.5 m up, and the clinometer reads 45° to the top. How tall is the tower?",
      hi: "कबीर बुर्ज से 30 m दूर खड़ा है; उसकी आँखें 1.5 m ऊपर हैं, और शिखर तक नताकोणमापी 45° पढ़ता है। बुर्ज कितनी ऊँची है?",
    },
    points: { K: [0, 0], E: [0, 1.5], T: [30, 0], F: [30, 1.5], W: [30, 31.5] },
    things: [
      { kind: "person", foot: "K", eye: "E" },
      { kind: "tower", base: "T", top: "W" },
    ],
    sights: [["E", "W"]],
    horizontals: [["E", "F"]],
    guides: [],
    arcs: [{ at: "E", a: "F", b: "W", text: "45°" }],
    rights: [{ at: "F", a: "E", b: "W" }],
    lengths: [
      { a: "K", b: "T", text: "30 m", side: -1 },
      { a: "K", b: "E", text: "1.5 m", side: 1 },
      { a: "T", b: "W", text: "?", value: "31.5 m", side: -1 },
    ],
    labels: ["E", "F", "W", "T"],
    steps: [
      "\\tan 45^\\circ = \\dfrac{WF}{EF}:\\ 1 = \\dfrac{WF}{30},\\ WF = 30",
      "TW = WF + FT = 30 + 1.5 = 31.5\\ \\text{m}",
    ],
    answer: { en: "The watch-tower is 31.5 m tall.", hi: "बुर्ज 31.5 m ऊँची है।" },
    value: 31.5,
  },
  [Problem.KiteString]: {
    title: { en: "How high is Kabir's kite?", hi: "कबीर की पतंग कितनी ऊँची है?" },
    question: {
      en: "Kabir has let out 60 m of string from his hand, 1.5 m above the ground; the string makes 30° with the horizontal. How high is the kite?",
      hi: "कबीर ने भूमि से 1.5 m ऊपर अपने हाथ से 60 m डोरी छोड़ी है; डोरी क्षैतिज से 30° बनाती है। पतंग कितनी ऊँची है?",
    },
    points: { G: [0, 0], H: [0, 1.5], K: [30 * r3, 31.5], F: [30 * r3, 1.5], B: [30 * r3, 0] },
    things: [
      { kind: "person", foot: "G", eye: "H" },
      { kind: "string", a: "H", b: "K" },
      { kind: "kite", at: "K" },
    ],
    sights: [],
    horizontals: [["H", "F"]],
    guides: [["B", "K"]],
    arcs: [{ at: "H", a: "F", b: "K", text: "30°" }],
    rights: [{ at: "F", a: "H", b: "K" }],
    lengths: [
      { a: "H", b: "K", text: "60 m", side: 1 },
      { a: "G", b: "H", text: "1.5 m", side: 1 },
      { a: "B", b: "K", text: "?", value: "31.5 m", side: -1 },
    ],
    labels: ["H", "K", "F"],
    steps: [
      "\\sin 30^\\circ = \\dfrac{KF}{HK}:\\ \\dfrac{1}{2} = \\dfrac{KF}{60},\\ KF = 30",
      "\\text{height} = KF + 1.5 = 31.5\\ \\text{m}",
    ],
    answer: {
      en: "The kite is 31.5 m up: exactly as high as the watch-tower.",
      hi: "पतंग 31.5 m ऊपर है: ठीक बुर्ज जितनी ऊँची।",
    },
    value: 31.5,
  },
  [Problem.TempleRiver]: {
    title: { en: "The temple across the river", hi: "नदी के पार मंदिर" },
    question: {
      en: "From the fort wall, 20 m above the river level, Riya sees the temple steps on the far bank at an angle of depression of 30°. How far away are the steps?",
      hi: "नदी तल से 20 m ऊँची किले की दीवार से रिया दूसरे किनारे पर मंदिर की सीढ़ियाँ 30° के अवनमन कोण पर देखती है। सीढ़ियाँ कितनी दूर हैं?",
    },
    points: { W: [0, 0], R: [0, 20], T: [20 * r3, 0], S: [20 * r3 + 5, 20], X: [6, 0], Y: [28, 0] },
    things: [
      { kind: "wall", base: "W", top: "R" },
      { kind: "water", a: "X", b: "Y" },
      { kind: "temple", base: "T", top: "T" },
    ],
    sights: [["R", "T"]],
    horizontals: [["R", "S"]],
    guides: [],
    arcs: [
      { at: "R", a: "S", b: "T", text: "30°", r: 30 },
      { at: "T", a: "W", b: "R", text: "30°", r: 26 },
    ],
    rights: [{ at: "W", a: "T", b: "R" }],
    lengths: [
      { a: "W", b: "R", text: "20 m", side: 1 },
      { a: "W", b: "T", text: "?", value: "20√3 m", side: -1 },
    ],
    labels: ["R", "W", "T"],
    steps: [
      "\\angle RTW = 30^\\circ\\ (\\text{alternate angles})",
      "\\tan 30^\\circ = \\dfrac{RW}{WT}:\\ \\dfrac{1}{\\sqrt{3}} = \\dfrac{20}{WT}",
      "WT = 20\\sqrt{3} \\approx 34.64\\ \\text{m}",
    ],
    answer: {
      en: "The temple steps are 20√3 m (about 34.64 m) from the foot of the wall.",
      hi: "मंदिर की सीढ़ियाँ दीवार के पाद से 20√3 m (लगभग 34.64 m) दूर हैं।",
    },
    value: 20 * r3,
  },
};
