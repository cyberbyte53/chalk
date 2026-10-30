import type { AudioManifest, Locale } from "@chalk/content";
import { RichText } from "@chalk/player";
import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

/**
 * A board's script, beside the board in the preview (`&script`, or `v`): every line it says, in
 * order, who says it, what is shown and what the voice says (and where those words came from), with
 * its clip to play, in the board's language (`h` switches both). A line that still needs its spoken words says so, with the suggested draft to
 * write into its `speak`. Read from what `pnpm voice` made (public/voice/<book>/<chapter>/).
 */

/** What is said for a line in one language (platform/studio/src/voice/said.ts). */
type Said = { words: string; from: "written" | "screen" } | { needs: string; suggested?: string };
type Entry = {
  line: string;
  piece?: string;
  speaker: string;
  cue: "opening" | "appears" | "rule";
  shown: Readonly<Record<Locale, string | undefined>>;
  said: Readonly<Record<Locale, Said | undefined>>;
  keys: Readonly<Record<Locale, string>>;
};
type Script = { boards: { id: string; path: string; lines: Entry[] }[] };

const FROM_WORDS: Readonly<Record<"written" | "screen", string>> = {
  written: "the lesson's words",
  screen: "its own words",
};
const CUE_WORDS: Readonly<Record<Entry["cue"], string>> = {
  opening: "as the board opens",
  appears: "when it appears",
  rule: "narration, said by a rule",
};

/** The chapter's script and clips, loaded once per chapter. */
function useScript(path: string): { script: Script; manifest: AudioManifest; base: string } | null {
  const [book, chapter] = path.split("/");
  const base = `/voice/${book}/${chapter}`;
  const [loaded, setLoaded] = useState<{ script: Script; manifest: AudioManifest } | null>(null);
  useEffect(() => {
    let isLive = true;
    Promise.all([
      fetch(`${base}/script.json`).then((r) => (r.ok ? (r.json() as Promise<Script>) : null)),
      fetch(`${base}/manifest.json`).then((r) =>
        r.ok ? (r.json() as Promise<AudioManifest>) : null,
      ),
    ])
      .then(([script, manifest]) => {
        if (isLive && script !== null && manifest !== null) setLoaded({ script, manifest });
      })
      .catch(() => undefined);
    return () => {
      isLive = false;
    };
  }, [base]);
  return loaded === null ? null : { ...loaded, base };
}

/** Plays one clip at a time. */
function usePlayer(): (url: string) => void {
  const playing = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => playing.current?.pause(), []);
  return (url) => {
    playing.current?.pause();
    playing.current = new Audio(url);
    void playing.current.play().catch(() => undefined);
  };
}

export function ScriptView({
  path,
  boardId,
  locale,
}: {
  path: string;
  boardId: string | undefined;
  /** The board's language: the script follows it. */
  locale: Locale;
}): JSX.Element {
  const loaded = useScript(path);
  const play = usePlayer();
  if (loaded === null)
    return (
      <div class="script-view is-empty">
        No script yet: <code>pnpm voice {path.split("/").slice(0, 2).join("/")}</code>
      </div>
    );
  const board = loaded.script.boards.find((b) => b.id === boardId);
  if (board === undefined || board.lines.length === 0)
    return <div class="script-view is-empty">This board says nothing.</div>;
  return (
    <ol class="script-view">
      {board.lines.map((line) => {
        const said = line.said[locale];
        const key = line.keys[locale];
        const clip = loaded.manifest.files[key];
        const seconds = loaded.manifest.seconds?.[key];
        const shown = line.shown[locale];
        return (
          <li key={line.line} class="script-line" data-script-line={line.line}>
            <div class="script-who">
              <b>{line.speaker}</b> · {line.line}
              <span class="script-tag">{CUE_WORDS[line.cue]}</span>
            </div>
            <div class="script-shown">{shown !== undefined && <RichText text={shown} />}</div>
            {said === undefined ? null : "words" in said ? (
              <div class="script-said">
                <button
                  type="button"
                  class="script-play"
                  disabled={clip === undefined}
                  aria-label="Play its clip"
                  onClick={() => clip !== undefined && play(`${loaded.base}/${clip}`)}
                >
                  ▶
                </button>
                <span>{said.words}</span>
                <span class="script-tag">
                  {FROM_WORDS[said.from]}
                  {seconds === undefined ? "" : ` · ${seconds.toFixed(1)} s`}
                </span>
              </div>
            ) : (
              <div class="script-said is-missing">
                <span>
                  Needs its spoken words ({said.needs}).
                  {said.suggested !== undefined && (
                    <>
                      {" "}
                      Suggested: <q>{said.suggested}</q>
                    </>
                  )}
                </span>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
