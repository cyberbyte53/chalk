import { type PageText, type Word, attr, decode, poppler } from "./pages";

/**
 * The `chanakya` reader: a PDF set in the Walkman-Chanakya font's text as Unicode. NCERT's Hindi books are set in it: each glyph has an
 * ASCII code (`fcUnq` is बिन्दु), so its text layer is that code. Converted by its fixed table, then
 * the two marks the font writes out of order put back: ि is typed before its consonants, and the reph
 * (र् above) after them and their vowel signs.
 */

/** Marks of the conversion's own, kept until their place is known. */
/** ि with ं above (`¯`), typed before its consonants like ि. */
const I_BINDU = String.fromCodePoint(0xe000);
/** The reph's place in the code: after its consonants and their vowel signs. */
const REPH = String.fromCodePoint(0xe001);
/** `**`, a closing quote (”, itself a code). */
const CLOSE_QUOTE = String.fromCodePoint(0xe002);
/** `%`: ः after a consonant's own vowel (अतः), a colon after a vowel (कीजिए:). */
const VISARGA = String.fromCodePoint(0xe003);

/** Read first: what several codes make together, and Chanakya's क and फ (a stem, its vowel signs, a hook). */
const SEQUENCES: readonly [RegExp, string][] = [
  [/o([sSa¡`zqwhW]*)Q/g, "क$1"],
  [/i([sSa¡`zqwhW]*)Q/g, "फ$1"],
  [/vkS/g, "औ"],
  [/vks/g, "ओ"],
  [/vk/g, "आ"],
  [/,s/g, "ऐ"],
  [/bZ/g, "ई"],
  [/\^\^/g, "“"],
  // Through the table: ” is also a code (ज़्).
  [/\*\*/g, "\uE003"],
  // र् above with ं: the reph is moved like any other.
  [/±/g, "Za"],
];

/** One code, one piece. A half consonant (ending ्) with the stem `k` is the full one. */
const CODES: Readonly<Record<string, string>> = {
  v: "अ",
  b: "इ",
  m: "उ",
  Å: "ऊ",
  "½": "ऋ",
  ",": "ए",
  d: "क",
  D: "क्",
  Ø: "क्र",
  Ñ: "कृ",
  "{": "क्ष्",
  "[": "ख्",
  x: "ग",
  X: "ग्",
  "?": "घ्",
  p: "च",
  P: "च्",
  N: "छ",
  t: "ज",
  T: "ज्",
  "”": "ज़्",
  K: "ज्ञ",
  ">": "झ",
  V: "ट",
  B: "ठ",
  M: "ड",
  "<": "ढ",
  ".": "ण्",
  r: "त",
  R: "त्",
  Ù: "त्त्",
  "=": "त्र्",
  F: "थ्",
  n: "द",
  í: "द्द",
  "¼": "द्ध",
  "|": "द्य",
  "}": "द्व",
  "/": "ध",
  è: "ध्",
  u: "न",
  U: "न्",
  i: "प",
  I: "प्",
  c: "ब",
  C: "ब्",
  H: "भ्",
  e: "म",
  E: "म्",
  ";": "य",
  j: "र",
  ":": "रू",
  y: "ल",
  Y: "ल्",
  o: "व",
  O: "व्",
  "'": "श्",
  J: "श्र",
  '"': "ष्",
  l: "स",
  L: "स्",
  g: "ह",
  É: "ह्न",
  k: "ा",
  f: "ि",
  "¯": I_BINDU,
  h: "ी",
  q: "ु",
  w: "ू",
  "`": "ृ",
  s: "े",
  S: "ै",
  W: "ॅ",
  a: "ं",
  "¡": "ँ",
  z: "्र",
  ª: "्र",
  "~": "्",
  "+": "़",
  Z: REPH,
  A: "।",
  "]": ",",
  "\\": "?",
  "&": "-",
  "-": ".",
  "@": "/",
  "¶": "“",
  "¸": "”",
  "^": "‘",
  "*": "’",
  "\uE003": "”",
};

const CONSONANT = "[\\u0915-\\u0939\\u0958-\\u095F]\\u093C?";
/** A consonant cluster: consonants joined by ्. */
const CLUSTER = `(?:${CONSONANT}\\u094D)*${CONSONANT}`;
/** Vowel signs and marks after a consonant. */
const SIGNS = "[\\u093E-\\u094C\\u0901-\\u0903\\u0949]*";

/** Chanakya's code for one word (or a line) as Unicode. */
export function fromChanakya(code: string): string {
  let s = code;
  for (const [from, to] of SEQUENCES) s = s.replace(from, to);
  s = [...s].map((c) => (c === "%" ? VISARGA : (CODES[c] ?? c))).join("");
  // A half consonant and its stem: the full consonant.
  s = s.replace(/\u094D\u093E/g, "");
  // ि after its consonants.
  s = s.replace(new RegExp(`([\\u093F${I_BINDU}])(${CLUSTER})`, "g"), (_, i: string, c: string) =>
    i === I_BINDU ? `${c}\u093F\u0902` : `${c}\u093F`,
  );
  // ं or ँ typed before a vowel sign is printed after it.
  s = s.replace(/([\u0901\u0902]+)([\u093E-\u094C\u0945]+)/g, "$2$1");
  // The stem and े, ै or ॅ above: ो, ौ, ॉ.
  s = s
    .replace(/\u093E\u0947/g, "\u094B")
    .replace(/\u093E\u0948/g, "\u094C")
    .replace(/\u093E\u0945/g, "\u0949");
  // A sign typed twice prints once (मेें, तोे).
  s = s.replace(/([\u0901-\u0903\u093E-\u094C])\1+/g, "$1").replace(/\u094B\u0947/g, "\u094B");
  // The reph before its consonants.
  s = s.replace(new RegExp(`(${CLUSTER})(${SIGNS})${REPH}`, "g"), "\u0930\u094D$1$2");
  s = s.replace(new RegExp(`(${CONSONANT}\\u0902?)${VISARGA}`, "g"), "$1\u0903");
  return s.replaceAll(VISARGA, ":").replace(new RegExp(`[${I_BINDU}${REPH}]`, "g"), "");
}

/** Whether a PDF font is Chanakya (its code needs converting). */
const isChanakya = (font: string): boolean => /chanakya/i.test(font);

/** How far a Hindi line's marks (ि, ें, the reph) rise above its run, as a share of its height. */
const MARKS_ABOVE = 0.3;
/** And how far its commas and brackets fall below it. */
const MARKS_BELOW = 0.15;

/**
 * `pdftohtml -xml -zoom 1`'s pages, each run of text read by its font (a legacy Hindi font's code
 * converted): its words (placed across the run by their share of its letters) in reading order.
 */
function pagesFromXml(xml: string): PageText[] {
  // A font is declared on the first page that uses it, and used by later pages by its id.
  const fonts = new Map<string | undefined, string>();
  return xml
    .split(/<page /)
    .slice(1)
    .map((chunk, i) => {
      for (const m of chunk.matchAll(/<fontspec id="(\d+)"[^>]*family="([^"]*)"/g))
        fonts.set(m[1], m[2] ?? "");
      const words: Word[] = [];
      for (const m of chunk.matchAll(/<text ([^>]*)>(.*?)<\/text>/g)) {
        const tag = m[1] ?? "";
        const font = fonts.get(/font="(\d+)"/.exec(tag)?.[1]) ?? "";
        const raw = decode((m[2] ?? "").replace(/<[^>]+>/g, ""));
        const [top, left, width, height] = ["top", "left", "width", "height"].map((a) =>
          attr(tag, a),
        ) as [number, number, number, number];
        // Each word's place: the run's width shared by the code's letters (widths aren't known),
        // from the space before it, and the marks above the line (ि, ें, the reph) taken in.
        const share = (n: number) => left + (width * n) / Math.max(1, raw.length);
        let at = 0;
        let from = 0;
        for (const part of raw.split(/(\s+)/)) {
          at += part.length;
          if (part.trim() === "") continue;
          words.push({
            text: isChanakya(font) ? fromChanakya(part) : part,
            x0: share(from),
            y0: top - height * MARKS_ABOVE,
            x1: share(at),
            y1: top + height * (1 + MARKS_BELOW),
          });
          from = at;
        }
      }
      return { page: i + 1, width: attr(chunk, "width"), height: attr(chunk, "height"), words };
    });
}

/** The `chanakya` reader: the text layer read run by run, Chanakya's runs converted. */
export function readChanakya(pdf: string): PageText[] {
  return pagesFromXml(poppler("pdftohtml", ["-xml", "-i", "-stdout", "-q", "-zoom", "1", pdf]));
}
