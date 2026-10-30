import type { AudioManifest, Locale } from "@chalk/content";
import { RichText } from "@chalk/player";
import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

/**
 * A board's script, beside the board in the preview (on while reviewing; `v` hides it): every line it can say, in
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
  cue: "opening" | "appears" | "moment" | "rule";
  /** When it is heard, as the event it waits for (`town.walker.arrived · x 4, y 5`). */
  moment: string;
  about?: string;
  shown: Readonly<Record<Locale, string | undefined>>;
  said: Readonly<Record<Locale, Said | undefined>>;
  keys: Readonly<Record<Locale, string>>;
};
type Script = { boards: { id: string; path: string; lines: Entry[] }[] };

const FROM_WORDS: Readonly<Record<"written" | "screen", string>> = {
  written: "the lesson's words",
  screen: "its own words",
};
/** Lines grouped by when they are heard, in the order the groups first come. */
function byMoment(lines: readonly Entry[]): [string, Entry[]][] {
  const groups = new Map<string, Entry[]>();
  for (const line of lines) {
    const moment = line.moment;
    groups.set(moment, [...(groups.get(moment) ?? []), line]);
  }
  return [...groups];
}

/** The piece a line is about glows on the board beside it while the line is pointed at. */
function glow(from: HTMLElement, piece: string | undefined, isOn: boolean): void {
  if (piece === undefined) return;
  const card = from.closest("[data-board]");
  const name = piece.split(".")[0] ?? piece;
  card
    ?.querySelector(`[data-piece="${CSS.escape(name)}"]`)
    ?.classList.toggle("is-line-about", isOn);
}

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
    <div class="script-view">
      {byMoment(board.lines).map(([moment, lines]) => (
        <section key={moment} class="script-moment">
          <h4>{moment}</h4>
          <ol>
            {lines.map((line) => {
              const said = line.said[locale];
              const key = line.keys[locale];
              const clip = loaded.manifest.files[key];
              const seconds = loaded.manifest.seconds?.[key];
              const shown = line.shown[locale];
              return (
                <li
                  key={line.line}
                  class="script-line"
                  data-script-line={line.line}
                  {...(line.piece === undefined ? {} : { "data-script-piece": line.piece })}
                  onMouseEnter={(e) => glow(e.currentTarget, line.about, true)}
                  onMouseLeave={(e) => glow(e.currentTarget, line.about, false)}
                >
                  <div class="script-who">
                    <b>{line.speaker}</b> · {line.line}
                    {line.about !== undefined && line.about !== line.piece && (
                      <span class="script-tag">about {line.about}</span>
                    )}
                  </div>
                  {shown !== undefined && (
                    <div class="script-shown">
                      <RichText text={shown} />
                    </div>
                  )}
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
        </section>
      ))}
    </div>
  );
}
