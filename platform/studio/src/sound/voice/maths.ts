import type { Locale } from "@chalk/content";
import type { MathsReader } from "@chalk/player";
import katex from "katex";
import * as sre from "speech-rule-engine/js/index.js";

/**
 * Drafts maths as words: the LaTeX through KaTeX (the library that draws it) as MathML, the formula
 * as a tree, read by the Speech Rule Engine (what screen readers read maths to blind students with:
 * ClearSpeak in English; its Hindi rules are the weaker, so read every Hindi draft). A draft is a
 * suggestion for a line's spoken words, never said on its own. Build-time only: the engine is large.
 */
const STYLE: Readonly<Record<Locale, string>> = { en: "clearspeak", hi: "mathspeak" };

/** The formula as MathML, from the same parse KaTeX draws. */
function mathml(latex: string): string | undefined {
  try {
    const html = katex.renderToString(latex, { output: "mathml", throwOnError: true });
    const math = html.slice(html.indexOf("<math"), html.lastIndexOf("</math>") + "</math>".length);
    // The LaTeX KaTeX keeps beside the tree isn't part of the formula.
    return math.replace(/<annotation[\s\S]*?<\/annotation>/, "");
  } catch {
    return undefined;
  }
}

let current: Locale | undefined;
let ready: Promise<void> | undefined;

/** A maths reader, every language loaded (once). */
export async function mathsReader(): Promise<MathsReader> {
  ready ??= (async () => {
    for (const locale of Object.keys(STYLE) as Locale[]) {
      sre.setupEngine({ locale, domain: STYLE[locale], modality: "speech" });
      await sre.engineReady();
    }
  })();
  await ready;
  return (latex, locale) => {
    const tree = mathml(latex);
    if (tree === undefined) return undefined;
    if (current !== locale) {
      sre.setupEngine({ locale, domain: STYLE[locale], modality: "speech" });
      current = locale;
    }
    const words = sre.toSpeech(tree).trim();
    return words === "" ? undefined : words;
  };
}
