/** @jsxImportSource preact */
import type { JSX } from "preact";

/**
 * Markup our own code made, and nothing else: KaTeX's output for a formula that passed the build's
 * maths check, a built picture's SVG that passed the art checks. The type is only made by `ours`,
 * so text a learner or a lesson typed can't reach the page as HTML by accident.
 */
export type OwnMarkup = string & { readonly __ours: true };

/** Marks markup as ours: call it only where our own code just made it, or the build checked it. */
export const ours = (markup: string): OwnMarkup => markup as OwnMarkup;

/**
 * The one place markup is put on the page as HTML (biome.json allows it in this file only). Every
 * other element gets its text as text.
 */
export function OwnHtml({
  markup,
  tag = "span",
  class: className,
}: {
  markup: OwnMarkup;
  tag?: "span" | "div";
  class?: string;
}): JSX.Element {
  const Tag = tag;
  return <Tag class={className} dangerouslySetInnerHTML={{ __html: markup }} />;
}
