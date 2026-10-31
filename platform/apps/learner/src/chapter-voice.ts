import { type AudioManifest, type Locale, clipsOf } from "@chalk/content";
import type { AudioSource, PlayableClip } from "@chalk/player";
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
        const clips: AudioSource = {
          clipsOf: (speaker, locale, phrases) =>
            manifest === undefined
              ? undefined
              : clipsOf(manifest, speaker, locale, phrases)?.map((clip) => ({
                  url: `${base}/${clip.file}`,
                  seconds: clip.seconds,
                })),
          ...(import.meta.env.DEV ? { live: devLive } : {}),
        };
        if (manifest !== undefined || import.meta.env.DEV) setSource(() => clips);
        setIsReady(true);
      })
      .catch(() => isLive && setIsReady(true));
    return () => {
      isLive = false;
    };
  }, [base, isOn]);
  return { source, isReady };
}

/**
 * The live voice in development: the studio makes the words into a clip in the speaker's voice,
 * when first needed, and keeps it (studio/src/voice/live.ts). Undefined when it can't.
 */
async function devLive(
  speaker: string,
  locale: Locale,
  words: string,
  signal: AbortSignal,
): Promise<PlayableClip | undefined> {
  const answer = await fetch("/dev-voice", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ speaker, locale, words }),
    signal,
  });
  if (!answer.ok) return undefined;
  const clip = (await answer.json()) as { url?: string; seconds?: number };
  return clip.url === undefined || clip.seconds === undefined
    ? undefined
    : { url: clip.url, seconds: clip.seconds };
}
