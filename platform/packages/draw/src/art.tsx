/** @jsxImportSource preact */
import { ART_SIZE, ArtFrame } from "@chalk/content";
import type { JSX } from "preact";

export { ArtFrame };

/** A piece of art: what `art.tsx` next to a book's, chapter's or concept's build.yaml exports. */
export type Art = {
  frame: ArtFrame;
  /** Draws it with @chalk/draw's shapes at the frame's size. Run at build, never in the app. */
  draw: (size: { width: number; height: number }) => JSX.Element;
};

/**
 * Art for a book, chapter or concept, drawn with the same shapes as the props. The build renders
 * it to SVG and checks it; see docs/making-art.md.
 *
 *     export const art = defineArt(ArtFrame.Card, ({ width, height }) => (
 *       <Stage label="Dots between 0 and 1" x={[0, 1]} width={width} height={height}>…</Stage>
 *     ));
 */
export function defineArt(frame: ArtFrame, draw: Art["draw"]): Art {
  return { frame, draw };
}

/** The size art in this frame is drawn at. */
export function artSize(frame: ArtFrame): { width: number; height: number } {
  return ART_SIZE[frame];
}
