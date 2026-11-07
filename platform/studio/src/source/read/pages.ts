import { execFileSync } from "node:child_process";

/**
 * What every reader gives (platform/docs/plans/sources.md, "The stages"): a PDF's pages, each with
 * every word it holds and where it is (points from the page's top left), in the PDF's reading order.
 * Which words are the running head, a footer or a figure's is the agents' call, from the page image.
 */

export type Word = { text: string; x0: number; y0: number; x1: number; y1: number };

export type PageText = {
  /** The PDF's page, from 1. */
  page: number;
  width: number;
  height: number;
  words: Word[];
};

/** Runs a poppler tool, or says how to install it. */
export function poppler(tool: string, args: string[]): string {
  try {
    return execFileSync(tool, args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT")
      throw new Error(
        `${tool} isn't installed: it comes with poppler (macOS: brew install poppler; Debian: apt install poppler-utils)`,
      );
    throw error;
  }
}

const entities: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
};
export const decode = (s: string): string =>
  s.replace(/&(amp|lt|gt|quot|apos|#\d+);/g, (e) =>
    e.startsWith("&#") ? String.fromCodePoint(Number(e.slice(2, -1))) : (entities[e] ?? e),
  );
export const attr = (tag: string, name: string): number =>
  Number(new RegExp(`${name}="([\\d.]+)"`).exec(tag)?.[1]);
