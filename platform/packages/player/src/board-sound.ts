import { type AudioManifest, type Board, clipsOf } from "@chalk/content";
import { useEffect, useState } from "preact/hooks";
import type { AudioSource } from "./narration";

/**
 * Where a board's sound comes from (platform/docs/sound.md), found by the player itself from the
 * board's address, so every screen that plays a board (a student's phone, the preview, the editor's
 * panel) hears exactly the same: no screen sets sound up, so none can leave it out.
 *
 * Its chapter's clips (made by `pnpm voice` into /voice/<book>/<chapter>/, shipped with the app),
 * then the phone's own voice (narration.ts). A live voice is a source only where the shipped app
 * has one too (none yet): the preview never sounds better than a phone.
 */

/** Each chapter's clips, fetched once: undefined when it has none. */
const chapters = new Map<string, Promise<AudioSource | undefined>>();

function chapterSound(chapter: string): Promise<AudioSource | undefined> {
  const known = chapters.get(chapter);
  if (known !== undefined) return known;
  const base = `/voice/${chapter}`;
  const loading = fetch(`${base}/manifest.json`)
    .then((r) => (r.ok ? (r.json() as Promise<AudioManifest>) : undefined))
    .then((manifest): AudioSource | undefined =>
      manifest === undefined
        ? undefined
        : {
            clipsOf: (speaker, locale, phrases) =>
              clipsOf(manifest, speaker, locale, phrases)?.map((clip) => ({
                url: `${base}/${clip.file}`,
                seconds: clip.seconds,
              })),
          },
    )
    .catch(() => {
      // Offline before it was ever fetched: the next board asks again.
      chapters.delete(chapter);
      return undefined;
    });
  chapters.set(chapter, loading);
  return loading;
}

/** A board's chapter ("class9-maths/coordinate-geometry"), from its address; none for a board made by hand. */
const chapterOf = (board: Board): string | undefined => {
  const [book, chapter] = board.item?.path.split("/") ?? [];
  return book === undefined || chapter === undefined ? undefined : `${book}/${chapter}`;
};

/**
 * A board's sound, once known: a board must never start before it is (its first line would be the
 * phone's while its clip is on the way). Ready at once for a board with no chapter.
 */
export function useBoardSound(board: Board): { source: AudioSource | undefined; isReady: boolean } {
  const chapter = chapterOf(board);
  const [known, setKnown] = useState<{
    chapter: string | undefined;
    source: AudioSource | undefined;
  }>();
  useEffect(() => {
    if (chapter === undefined) return;
    let isLive = true;
    void chapterSound(chapter).then((source) => isLive && setKnown({ chapter, source }));
    return () => {
      isLive = false;
    };
  }, [chapter]);
  if (chapter === undefined) return { source: undefined, isReady: true };
  return known?.chapter === chapter
    ? { source: known.source, isReady: true }
    : { source: undefined, isReady: false };
}
