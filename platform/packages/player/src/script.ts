import { type Board, type Localized, NARRATOR, type SceneLine, propPieces } from "@chalk/content";
import { Board as Core, timedVoice } from "@chalk/prop/next";
import type { PropModule } from "./prop-module";

/**
 * A board's script (platform/docs/sound.md): every line it says, in the order it can be heard, with
 * who says it, what the piece shows and the lesson's own words for it. The one place lines are read
 * from a board: the voice is made from it, the player says it, the preview and `look` show it.
 */
export type ScriptLine = {
  /** Its name: the piece that says it, or a narration line's own. */
  line: string;
  /** The piece, for a piece's line; none for narration. */
  piece?: string;
  /** Who says it: a character of the book's cast, the narrator when the line names no one. */
  speaker: string;
  /** What the piece says of itself (a text its words, a question its prompt): its sound view. */
  own?: Localized;
  /** The lesson's own words for it, when it gives them. */
  says?: Localized;
  /** When it is heard: the board opening, its piece appearing, a moment, or a rule saying it. */
  cue: "opening" | "appears" | "moment" | "rule";
  /** Its moment: a piece's signal ("town.walker.arrived"). */
  when?: string;
  /** The values its moment's signal must carry. */
  where?: Readonly<Record<string, unknown>>;
  /**
   * When it is heard, as the event it waits for, written as events are everywhere: `board.started`,
   * `fiveHouses.appears`, `town.walker.arrived · x 4, y 5`. What the track groups lines by.
   */
  moment: string;
  /** The piece it is about (it glows while the line plays): its own piece for a piece's line. */
  about?: string;
};

/** A line's own moment as an event: its signal, the values it must carry, and any condition. */
function momentOf(line: SceneLine): string {
  return [
    eventText(line.when ?? "", line.where ?? {}),
    line.hasCondition === true ? "a condition in code" : "",
  ]
    .filter((p) => p !== "")
    .join(" · ");
}

/** An event in words, as everywhere: `board.said · line title`, `town.walker.arrived · x 4, y 5`. */
function eventText(path: string, values: Readonly<Record<string, unknown>>): string {
  const told = Object.entries(values)
    .map(([k, v]) => `${k} ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(", ");
  return told === "" ? path : `${path} · ${told}`;
}

/** The board's own events are written so (the scene tells them at its root). */
const BOARD_EVENTS = "board";

/**
 * When each line of the opening is said, as the board says it: the board is opened with a voice
 * that only listens (each line with words takes a second, one with none ends at once), and each
 * line's moment is the board's own event told last before the voice began it. Nothing is worked
 * out beside the board: the moments are what runs. A line the opening never reaches (a piece shown
 * first dropped it) has none.
 */
function openingMoments(
  model: NonNullable<Board["model"]>,
  hasWords: (line: string) => boolean,
): ReadonlyMap<string, string> {
  const moments = new Map<string, string>();
  let last: string | undefined;
  const core = new Core(model.scene, model.given, {
    voice: (board) =>
      timedVoice(board, (line) => {
        if (last !== undefined && !moments.has(line)) moments.set(line, last);
        return hasWords(line) ? 1 : undefined;
      }),
  });
  core.listen((event) => {
    if (event.kind === "tell" && event.path === "")
      last = eventText(`${BOARD_EVENTS}.${event.signal}`, event.payload);
  });
  try {
    core.send("", "start");
    core.runUntilIdle();
  } catch {
    // A board that never goes quiet on its own (a clock that ticks): what was said by then stands.
  }
  return moments;
}

/**
 * What a line is about (it glows while the line plays): what the lesson says it is about, else, for
 * a piece's line, that piece. The one place this is decided: the script and the player both ask.
 */
export function aboutOf(
  model: NonNullable<Board["model"]>,
  line: string,
  isPiece: boolean,
): string | undefined {
  return model.lines[line]?.about ?? (isPiece ? line : undefined);
}

/** The words a piece says of itself, as it is now (its sound view; nothing for one without). */
export function ownLine(
  module: PropModule | undefined,
  view: Readonly<Record<string, unknown>>,
): Localized | undefined {
  return module?.sound?.line?.(view);
}

/**
 * Every line a board says: its pieces' (top to bottom; the opening's first, as the board opens),
 * then its narration lines. A piece that says nothing (a plane with no sound view, no words of the
 * lesson's) has no line. Today's boards say none.
 */
export function scriptOf(
  board: Board,
  lookup: (type: string) => PropModule | undefined,
): ScriptLine[] {
  const model = board.model;
  if (model === undefined) return [];
  const core = new Core(model.scene, model.given);
  const pieces = propPieces(board.root).map((piece) => {
    const given = model.lines[piece.name];
    const own = ownLine(lookup(piece.prop), core.read(piece.name));
    return { piece, given, own, hasWords: own !== undefined || given?.says !== undefined };
  });
  const opening = openingMoments(
    model,
    (line) =>
      pieces.some((p) => p.piece.name === line && p.hasWords) ||
      model.lines[line]?.says !== undefined,
  );
  const out: ScriptLine[] = [];
  // A piece showing is read in the opening, at the moment the board reaches it; a piece shown later
  // is said as it is shown (the board tells `shown`).
  for (const { piece, given, own, hasWords } of pieces) {
    if (!hasWords) continue;
    out.push({
      line: piece.name,
      piece: piece.name,
      speaker: given?.speaker ?? NARRATOR,
      ...(own === undefined ? {} : { own }),
      ...(given?.says === undefined ? {} : { says: given.says }),
      cue: piece.isHidden === true ? "appears" : "opening",
      moment:
        piece.isHidden === true
          ? eventText(`${BOARD_EVENTS}.shown`, { name: piece.name })
          : (opening.get(piece.name) ?? "never: a piece shown first drops it"),
      about: aboutOf(model, piece.name, true) ?? piece.name,
    });
  }
  for (const name of model.freeLines) {
    const free = model.lines[name];
    if (free?.says === undefined) continue;
    out.push({
      line: name,
      speaker: free.speaker ?? NARRATOR,
      says: free.says,
      cue: free.when === undefined ? "rule" : "moment",
      moment: free.when === undefined ? "said by a rule" : momentOf(free),
      ...(free.when === undefined ? {} : { when: free.when }),
      ...(free.where === undefined ? {} : { where: free.where }),
      ...(free.about === undefined ? {} : { about: free.about }),
    });
  }
  return out;
}
