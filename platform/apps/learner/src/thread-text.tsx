import { RichText } from "@chalk/player";
import type { JSX } from "preact";

/** A block of a thread's text: a paragraph, or a list of bullets or numbered points. */
type Block = { kind: "p"; text: string } | { kind: "ul" | "ol"; items: string[] };

const BULLET = /^\s*[-*•]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;

/** Splits a thread's text into paragraphs and lists, one line per point. */
export function blocksOf(text: string): Block[] {
  const blocks: Block[] = [];
  for (const line of text.split("\n")) {
    if (line.trim() === "") continue;
    const kind = BULLET.test(line) ? "ul" : NUMBERED.test(line) ? "ol" : "p";
    if (kind === "p") {
      blocks.push({ kind, text: line.trim() });
      continue;
    }
    const item = line.replace(kind === "ul" ? BULLET : NUMBERED, "").trim();
    const last = blocks.at(-1);
    if (last !== undefined && last.kind === kind) last.items.push(item);
    else blocks.push({ kind, items: [item] });
  }
  return blocks;
}

/**
 * A thread's text as written: a paragraph per line, bullets and numbered points as lists, and
 * **bold**, *emphasis* and maths within a line. Every view of a thread draws its text with this.
 */
export function ThreadText({ text }: { text: string }): JSX.Element {
  return (
    <div class="thread-text">
      {blocksOf(text).map((b, i) =>
        b.kind === "p" ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: blocks are a fixed split of the text
          <p key={i}>
            <RichText text={b.text} />
          </p>
        ) : (
          (() => {
            const List = b.kind;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: blocks are a fixed split of the text
              <List key={i}>
                {b.items.map((item, j) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: a list's points, in order
                  <li key={j}>
                    <RichText text={item} />
                  </li>
                ))}
              </List>
            );
          })()
        ),
      )}
    </div>
  );
}
