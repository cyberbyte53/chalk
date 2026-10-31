import { type Locale, type SoundList, clipsOf } from "@chalk/content";
import { RichText, playClip } from "@chalk/player";
import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

/**
 * A board's script, beside the board in the preview (on while reviewing; `v` hides it): every line it can say, in
 * order, who says it, what is shown and what the voice says (and where those words came from), with
 * its clip to play, in the board's language (`h` switches both). A line that still needs its spoken words says so, with the suggested draft to
 * write into its `speak`. Read from the chapter's built content: its script, and its sound list.
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
  /** What is said, as phrases (a line with blanks: an example, its values given). */
  phrases: Readonly<Record<Locale, readonly string[] | undefined>>;
  /** For a line with blanks: the values its example is said with. */
  example?: Readonly<Record<string, unknown>>;
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
function useScript(path: string): { script: Script; sound: SoundList; base: string } | null {
  const [book, chapter] = path.split("/");
  const base = `/content/${book}/${chapter}`;
  const [loaded, setLoaded] = useState<{ script: Script; sound: SoundList } | null>(null);
  useEffect(() => {
    let isLive = true;
    Promise.all([
      fetch(`${base}/script.json`).then((r) => (r.ok ? (r.json() as Promise<Script>) : null)),
      fetch(`${base}/sound/sound.json`).then((r) =>
        r.ok ? (r.json() as Promise<SoundList>) : null,
      ),
    ])
      .then(([script, sound]) => {
        if (isLive && script !== null && sound !== null) setLoaded({ script, sound });
      })
      .catch(() => undefined);
    return () => {
      isLive = false;
    };
  }, [base]);
  return loaded === null ? null : { ...loaded, base };
}

/** Plays a line's clips one after another, through the engine; a new line stops the one playing. */
function usePlayer(): (urls: readonly string[]) => void {
  const playing = useRef<{ stop: () => void } | null>(null);
  const turn = useRef(0);
  useEffect(() => () => playing.current?.stop(), []);
  return (urls) => {
    const mine = ++turn.current;
    playing.current?.stop();
    void (async () => {
      for (const url of urls) {
        if (turn.current !== mine) return;
        const clip = playClip(url, "voice");
        playing.current = clip;
        if ((await clip.done) !== "heard") return;
      }
    })();
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
        No script yet: <code>pnpm build-content</code>
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
              const phrases = line.phrases[locale];
              const clips =
                phrases === undefined
                  ? undefined
                  : clipsOf(loaded.sound, line.speaker, locale, phrases);
              const seconds = clips?.reduce((sum, c) => sum + c.seconds, 0);
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
                        disabled={clips === undefined}
                        aria-label="Play its clips"
                        onClick={() =>
                          clips !== undefined &&
                          play(clips.map((c) => `${loaded.base}/sound/${c.file}`))
                        }
                      >
                        ▶
                      </button>
                      <span>{said.words}</span>
                      {line.example !== undefined && (
                        <span class="script-tag">
                          e.g.{" "}
                          {Object.entries(line.example)
                            .map(([k, v]) => `${k} ${String(v)}`)
                            .join(", ")}
                        </span>
                      )}
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
