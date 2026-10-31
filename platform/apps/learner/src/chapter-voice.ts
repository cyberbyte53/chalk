import { type AudioManifest, clipsOf } from "@chalk/content";
import type { AudioSource } from "@chalk/player";
import { useEffect, useState } from "preact/hooks";

/**
 * A chapter's voice in the preview: its clips, made by `pnpm voice <book>/<chapter>` into
 * public/voice/<book>/<chapter>/ (its clips, and manifest.json saying which clip says each phrase,
 * and how long it plays). Undefined until loaded, or when the chapter has none yet.
 */
export function useChapterVoice(
  path: string,
  isOn: boolean,
): { source: AudioSource | undefined; isReady: boolean } {
  const [book, chapter] = path.split("/");
  const base =
    book === undefined || chapter === undefined ? undefined : `/voice/${book}/${chapter}`;
  const [source, setSource] = useState<AudioSource | undefined>(undefined);
  const [isReady, setIsReady] = useState(!isOn);
  useEffect(() => {
    setSource(undefined);
    setIsReady(!isOn || base === undefined);
    if (!isOn || base === undefined) return;
    let isLive = true;
    fetch(`${base}/manifest.json`)
      .then((r) => (r.ok ? (r.json() as Promise<AudioManifest>) : undefined))
      .then((manifest) => {
        if (!isLive) return;
        // The clips first, then ready: a board must never start before its voice is known.
        if (manifest === undefined) {
          setIsReady(true);
          return;
        }
        const clips: AudioSource = {
          clipsOf: (speaker, locale, phrases) =>
            clipsOf(manifest, speaker, locale, phrases)?.map((clip) => ({
              url: `${base}/${clip.file}`,
              seconds: clip.seconds,
            })),
        };
        setSource(() => clips);
        setIsReady(true);
      })
      .catch(() => isLive && setIsReady(true));
    return () => {
      isLive = false;
    };
  }, [base, isOn]);
  return { source, isReady };
}
