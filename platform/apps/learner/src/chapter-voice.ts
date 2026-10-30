import type { AudioManifest } from "@chalk/content";
import type { AudioSource } from "@chalk/player";
import { useEffect, useState } from "preact/hooks";

/**
 * A chapter's voice in the preview: its clips, made by `pnpm voice <book>/<chapter>` into
 * public/voice/<book>/<chapter>/ (one folder per lesson, and manifest.json saying which clip says
 * which line and how long it plays). Undefined until loaded, or when the chapter has none yet.
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
        setIsReady(true);
        if (manifest === undefined) return;
        const url = (key: string) => {
          const file = manifest.files[key];
          return file === undefined ? undefined : `${base}/${file}`;
        };
        setSource(Object.assign(url, { seconds: (key: string) => manifest.seconds?.[key] }));
      })
      .catch(() => isLive && setIsReady(true));
    return () => {
      isLive = false;
    };
  }, [base, isOn]);
  return { source, isReady };
}
