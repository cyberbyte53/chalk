/**
 * A Hindi span's candidates (platform/docs/plans/sources.md, "Hindi repaired"): every reading the
 * PDF's letters allow. A PDF's text layer breaks Hindi in a few ways that keep its letters: a word
 * split by stray spaces, a sign or consonant written twice (स््थथूल), U+FFFD and joiners strewn in,
 * a letter written as two (अा for आ), a mark (ं ु ि) left standing alone beside its word, and
 * letters in the order they are drawn (ि before its consonant, र् after its cluster). A candidate
 * undoes some of those and nothing else, so nothing in it is invented, and it is spelled as Unicode
 * spells Devanagari; which candidate is right is for the word list (repair.ts) or the agent.
 *
 * Only the Devanagari script is known here: nothing about a book, a subject or a font.
 */

/** Letters by what they do in a word. */
const CONSONANT = /[क-हक़-य़ॸ-ॿ]/u;
const VOWEL = /[ऄ-औॠॡॲ-ॷ]/u;
const VOWEL_SIGN = /[ऺऻा-ौॎॏॕ-ॗॢॣ]/u;
/** Candrabindu, anusvara, visarga: they sit on a letter or its vowel sign. */
const BINDU = /[ऀ-ः]/u;
const NUKTA = "़";
const VIRAMA = "्";
const I_SIGN = "ि";
const RA = "र";
const MARK = /^\p{M}/u;

/** What the PDF strews in: the replacement character, and joiners (only hints for drawing). */
const STRAY = /[�‌‍]/gu;

/** A letter the PDF writes as two (or as the wrong one), and the letter: never anything else. */
const ONE_LETTER: readonly [string, string][] = [
  ["ॠ", "ऋ"],
  ["ाॅ", "ॉ"],
  ["ॅा", "ॉ"],
  ["ाे", "ो"],
  ["ाै", "ौ"],
  ["अा", "आ"],
  ["अो", "ओ"],
  ["अौ", "औ"],
  ["अॉ", "ऑ"],
  ["अॅ", "ॲ"],
  ["एे", "ऐ"],
];

/** Letters some fonts draw alike, so the PDF may give either: both are tried. */
const ALIKE: readonly [string, string][] = [
  // ई is drawn as इ with a hook like र्'s.
  ["र्इ", "ई"],
];

/** The bounds that keep a span's candidates few and quick. */
const MOST = {
  /** PDF words making one word of the reading. */
  piecesInAWord: 8,
  /** Marks standing alone in one word (each tried in every place). */
  looseMarks: 3,
  /** Forms of one word. */
  forms: 512,
  /** The longest run written twice that is collapsed (`््`, `षष`, `्य्य`). */
  doubled: 2,
} as const;

/** A PDF word cleaned of what is never a letter: stray characters gone, letters written as one. */
export function clean(word: string): string {
  let w = word.replace(STRAY, "").replace(/\s+/gu, " ");
  for (const [two, one] of ONE_LETTER) w = w.replaceAll(two, one);
  return w.normalize("NFC");
}

/** A reading as candidates are compared: its joiners dropped (they draw nothing), in NFC. */
export const plain = (reading: string): string =>
  reading.replace(STRAY, "").normalize("NFC").trim().split(/\s+/).join(" ");

const isMarks = (piece: string) => [...piece].every((c) => MARK.test(c));

/**
 * Whether a word is spelled as Unicode spells Devanagari: a vowel sign or virama on a consonant
 * (or its nukta), a nukta on a consonant, a bindu on a letter or its vowel sign. `सेे` and `क््य`
 * aren't; they are the PDF's doubles, never a reading.
 */
export function wellFormed(word: string): boolean {
  let before = "";
  for (const c of word) {
    const onLetter = CONSONANT.test(before) || before === NUKTA;
    if (VOWEL_SIGN.test(c) || c === VIRAMA) {
      if (!onLetter) return false;
    } else if (c === NUKTA) {
      if (!CONSONANT.test(before)) return false;
    } else if (BINDU.test(c)) {
      if (!(onLetter || VOWEL_SIGN.test(before) || VOWEL.test(before))) return false;
    } else if (MARK.test(c) && before === "") return false;
    before = c;
  }
  return true;
}

/** Every way of collapsing what is written twice, each double kept or collapsed (अध्ययन is real). */
function collapses(word: string): string[] {
  const seen = new Set([word]);
  let frontier = [word];
  while (frontier.length > 0 && seen.size < MOST.forms) {
    const next: string[] = [];
    for (const w of frontier)
      for (let n = 1; n <= MOST.doubled; n++)
        for (let i = 0; i + 2 * n <= w.length; i++) {
          if (w.slice(i, i + n) !== w.slice(i + n, i + 2 * n)) continue;
          const made = w.slice(0, i + n) + w.slice(i + 2 * n);
          if (seen.has(made) || seen.size >= MOST.forms) continue;
          seen.add(made);
          next.push(made);
        }
    frontier = next;
  }
  return [...seen];
}

/** The consonants of the cluster starting at `i` (`स्त्र`): where each ends, its nukta included. */
function clusterEnds(word: string, i: number): number[] {
  const ends: number[] = [];
  let j = i;
  while (CONSONANT.test(word[j] ?? "")) {
    j++;
    if (word[j] === NUKTA) j++;
    ends.push(j);
    if (word[j] !== VIRAMA) break;
    j++;
  }
  return ends;
}

/**
 * The word with the letters the PDF gives in the order they are drawn put in Unicode's order, each
 * tried: ि drawn before its consonant moved after it (after any consonant of the cluster), र् drawn
 * after its cluster (the reph) moved before it, and letters drawn alike.
 */
function drawnOrders(word: string): string[] {
  const out = new Set([word]);
  let frontier = [word];
  while (frontier.length > 0 && out.size < MOST.forms) {
    const next: string[] = [];
    const add = (w: string) => {
      if (out.has(w) || out.size >= MOST.forms) return;
      out.add(w);
      next.push(w);
    };
    for (const w of frontier) for (const moved of movedOnce(w)) add(moved);
    frontier = next;
  }
  for (const [one, other] of ALIKE)
    for (const w of [...out]) if (w.includes(one)) out.add(w.replaceAll(one, other));
  return [...out];
}

/** The word with one ि or one reph moved to where Unicode puts it, each way it can go. */
function movedOnce(word: string): string[] {
  const out: string[] = [];
  const inCluster = (c: string) => CONSONANT.test(c) || c === VIRAMA || c === NUKTA;
  for (let i = 0; i < word.length; i++) {
    if (word[i] === I_SIGN && !(CONSONANT.test(word[i - 1] ?? "") || word[i - 1] === NUKTA))
      for (const end of clusterEnds(word, i + 1))
        out.push(word.slice(0, i) + word.slice(i + 1, end) + I_SIGN + word.slice(end));
    if (word[i] === RA && word[i + 1] === VIRAMA && !CONSONANT.test(word[i + 2] ?? "")) {
      // Before any consonant of the cluster before it.
      let start = i;
      while (start > 0 && inCluster(word[start - 1] ?? "")) start--;
      for (let at = start; at < i; at++)
        if (CONSONANT.test(word[at] ?? "") && (at === start || word[at - 1] === VIRAMA))
          out.push(word.slice(0, at) + RA + VIRAMA + word.slice(at, i) + word.slice(i + 2));
    }
  }
  return out;
}

/** A word with marks put in, each in every place after its first letter, in the order given. */
function placed(word: string, marks: readonly string[], out: string[]) {
  const [mark, ...rest] = marks;
  if (mark === undefined) {
    out.push(word);
    return;
  }
  for (let i = 1; i <= word.length; i++) placed(word.slice(0, i) + mark + word.slice(i), rest, out);
}

/** Every order of some marks, each order once. */
function orders(marks: readonly string[]): string[][] {
  if (marks.length <= 1) return [[...marks]];
  const out = new Map<string, string[]>();
  marks.forEach((m, i) => {
    for (const rest of orders([...marks.slice(0, i), ...marks.slice(i + 1)]))
      out.set([m, ...rest].join("|"), [m, ...rest]);
  });
  return [...out.values()];
}

/**
 * Every word some PDF pieces can make: joined, doubles collapsed, loose marks placed, letters put
 * in Unicode's order; only the well-formed ones.
 */
function wordForms(pieces: readonly string[]): string[] {
  const made = new Set<string>();
  const add = (w: string) => {
    for (const d of drawnOrders(w.normalize("NFC"))) made.add(d);
  };
  for (const w of collapses(pieces.join(""))) add(w);
  const marks = pieces.filter(isMarks);
  if (marks.length > 0 && marks.length <= MOST.looseMarks) {
    const bases = collapses(pieces.filter((p) => !isMarks(p)).join(""));
    for (const order of orders(marks))
      for (const base of bases) {
        const out: string[] = [];
        placed(base, order, out);
        // A mark put beside the same mark is the PDF's double: collapsed.
        for (const w of out) for (const c of wellFormed(w) ? [w] : collapses(w)) add(c);
      }
  }
  return [...made].filter(wellFormed).slice(0, MOST.forms);
}

/**
 * A span read: its pieces (the PDF's words, cleaned, empty ones gone) and the forms each run of them
 * can make as one word. A piece that starts with a mark can't start a word.
 */
export type SpanForms = {
  pieces: readonly string[];
  /** The words pieces `from` to `to` (not included) can make; none when they can't be one word. */
  forms(from: number, to: number): readonly string[];
};

export function spanForms(span: readonly string[]): SpanForms {
  const pieces = span.map(clean).filter((p) => p !== "");
  const memo = new Map<string, readonly string[]>();
  return {
    pieces,
    forms(from, to) {
      const key = `${from}-${to}`;
      let forms = memo.get(key);
      if (forms === undefined) {
        const first = pieces[from] ?? "";
        const starts = from === 0 || !MARK.test(first);
        const ends = to >= pieces.length || !MARK.test(pieces[to] ?? "");
        forms =
          to > from && to - from <= MOST.piecesInAWord && starts && ends
            ? wordForms(pieces.slice(from, to))
            : [];
        memo.set(key, forms);
      }
      return forms;
    },
  };
}

/**
 * Every reading a span's letters allow (words separated by a space), up to `limit` of them. A span
 * is the PDF's words, as its text layer gives them.
 */
export function candidates(span: readonly string[], limit = 10_000): string[] {
  const s = spanForms(span);
  const out: string[] = [];
  const walk = (from: number, sofar: string[]) => {
    if (out.length >= limit) return;
    if (from === s.pieces.length) {
      out.push(sofar.join(" "));
      return;
    }
    for (let to = from + 1; to <= s.pieces.length; to++)
      for (const form of s.forms(from, to)) walk(to, [...sofar, form]);
  };
  walk(0, []);
  return out;
}

/** The check "a reading must be one of its span's candidates" (spaces and joiners aside). */
export function isCandidate(span: readonly string[], reading: string): boolean {
  const s = spanForms(span);
  const text = plain(reading);
  const n = s.pieces.length;
  // Depth first over (pieces read, letters of the reading matched), each pair tried once.
  const tried = new Set<string>();
  const from = (i: number, at: number): boolean => {
    if (i === n) return at === text.length;
    const key = `${i} ${at}`;
    if (tried.has(key)) return false;
    tried.add(key);
    const start = at === 0 ? 0 : at + 1;
    if (at > 0 && text[at] !== " ") return false;
    for (let j = i + 1; j <= Math.min(n, i + MOST.piecesInAWord); j++)
      for (const form of s.forms(i, j))
        if (text.startsWith(form, start) && from(j, start + form.length)) return true;
    return false;
  };
  return n > 0 && from(0, 0);
}
