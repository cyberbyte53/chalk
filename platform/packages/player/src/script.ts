import { type Board, type Localized, NARRATOR, type SceneLine, propPieces } from "@chalk/content";
import { Board as Core } from "@chalk/prop/next";
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
  const values = Object.entries(line.where ?? {})
    .map(([k, v]) => `${k} ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(", ");
  return [line.when, values, line.hasCondition === true ? "a condition in code" : ""]
    .filter((p) => p !== undefined && p !== "")
    .join(" · ");
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
  const out: ScriptLine[] = [];
  // The opening is said in order: the first when the board starts, each next when the one before is
  // said (the board tells `said`). A piece shown later is said when the board tells `shown`.
  let before: string | undefined;
  for (const piece of propPieces(board.root)) {
    const given = model.lines[piece.name];
    const own = ownLine(lookup(piece.prop), core.read(piece.name));
    const after = before;
    // A piece with nothing to say is still said (at once): the next waits for it all the same.
    if (piece.isHidden !== true) before = piece.name;
    if (own === undefined && given?.says === undefined) continue;
    out.push({
      line: piece.name,
      piece: piece.name,
      speaker: given?.speaker ?? NARRATOR,
      ...(own === undefined ? {} : { own }),
      ...(given?.says === undefined ? {} : { says: given.says }),
      cue: piece.isHidden === true ? "appears" : "opening",
      moment:
        piece.isHidden === true
          ? `board.shown · name ${piece.name}`
          : after === undefined
            ? "board.started"
            : `board.said · line ${after}`,
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
