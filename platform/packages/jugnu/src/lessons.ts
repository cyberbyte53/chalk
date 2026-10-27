import type { Board, Piece } from "@chalk/content";
import { type AnyPropDef, type Observation, PropRole } from "@chalk/prop";
import type { JugnuBoard, JugnuPlace } from "./board";
import { readable } from "./context";

/**
 * How Jugnu learns what was taught: the lesson of a concept, as its student saw it. The host (the
 * dev shell, the server) knows where lessons are; Jugnu only asks. The lesson of the concept on
 * the board goes in his context up front, and the same `lesson` answers his `lesson` tool for any
 * other concept, so the two never differ.
 */
export type LessonLibrary = {
  /** A concept's lesson as text (`lessonText`), or undefined if it isn't known. */
  lesson: (conceptId: string, locale: JugnuPlace["locale"]) => Promise<string | undefined>;
  /**
   * The concepts around these: their chapter's concepts in order and the ones they build on, one
   * line each with its id, so he knows what he can look up.
   */
  map: (conceptIds: readonly string[], locale: JugnuPlace["locale"]) => Promise<ConceptLine[]>;
};

/** One concept he can look up. */
export type ConceptLine = {
  id: string;
  title: string;
  /** Where it sits, e.g. "Real Numbers, 2 of 5". */
  where: string;
  /** Concepts it builds on (ids). */
  buildsOn: string[];
};

/** The map as he reads it. */
export function mapText(lines: readonly ConceptLine[], current: readonly string[]): string {
  return lines
    .map(
      (line) =>
        `- ${line.id}: ${line.title} (${line.where})${current.includes(line.id) ? " ← this board's concept" : ""}${
          line.buildsOn.length > 0 ? `; builds on ${line.buildsOn.join(", ")}` : ""
        }`,
    )
    .join("\n");
}

/** The concepts the board's questions test (from their `concepts` field), in order. */
export function conceptsOnBoard(board: JugnuBoard): string[] {
  const out: string[] = [];
  for (const name of board.propNames()) {
    const stored = board.getView(name) as { concepts?: unknown };
    if (!Array.isArray(stored.concepts)) continue;
    for (const id of stored.concepts) if (typeof id === "string" && !out.includes(id)) out.push(id);
  }
  return out;
}

/** Longest a prop's line may be; a prop holding a lot (a table, a long list) is cut short. */
const PROP_LINE_MAX = 600;

/**
 * A lesson's pages as its student saw them, top to bottom: each page's purpose (the author's note),
 * its words in order, and each prop as what it stands for there plus what it shows at the start
 * (a question as its prompt and options, the right one marked; authors' notes left out). Pieces that
 * appear only after a question is answered are marked so. Then each kind of prop the lesson used:
 * what it is and what the student could do with it. Hindi or English by locale.
 */
export function lessonText(
  title: string,
  pages: readonly Board[],
  props: LessonProps,
  locale: JugnuPlace["locale"],
): string {
  const out: string[] = [`Lesson: ${title}`];
  const used = new Map<string, AnyPropDef>();
  pages.forEach((page, i) => {
    out.push("", `Page ${i + 1} (${page.name})`);
    if (page.jugnu?.purpose !== undefined) out.push(`Purpose: ${page.jugnu.purpose}`);
    const walk = (piece: Piece, isLater: boolean) => {
      const later = isLater || piece.isHidden === true;
      if (piece.kind !== "prop") {
        if ("children" in piece) for (const child of piece.children) walk(child, later);
        return;
      }
      const def = props.def(piece.prop);
      if (def !== undefined && piece.prop !== "text") used.set(piece.prop, def);
      const line = propLine(piece, page, props, locale);
      if (line !== undefined) out.push(later ? `(after they answer) ${line}` : line);
    };
    walk(page.root, false);
  });
  const kinds = [...used.values()].filter((def) => def.role !== PropRole.Question);
  if (kinds.length > 0) {
    out.push("", "The props in this lesson (what each is, and what the student can do with it):");
    for (const def of kinds) {
      const can = Object.values(def.actions)
        .filter((action) => action.byLearner === true)
        .map((action) => action.describe);
      out.push(
        `- ${def.type}: ${def.describe}${can.length > 0 ? ` The student can: ${can.join("; ")}.` : ""}`,
      );
    }
  }
  return out.join("\n");
}

/** What `lessonText` needs of the props: each type's definition, and a placed one described as it starts. */
export type LessonProps = {
  def: (type: string) => AnyPropDef | undefined;
  /** A prop placed with these fields, as the student first sees it (read from its view). */
  describeStart: (
    type: string,
    given: Readonly<Record<string, unknown>>,
    locale: JugnuPlace["locale"],
  ) => Observation | undefined;
};

/** A question in the lesson: its prompt and its options, the right one marked (no authored notes). */
function questionLine(seen: Observation): string {
  // A single-answer question keeps `answer`, a multiple-answer one `answers`.
  const hidden = seen.hidden ?? {};
  const answer = hidden.answers ?? hidden.answer;
  const right = new Set(
    (Array.isArray(answer) ? answer : [answer]).filter(
      (id): id is string => typeof id === "string",
    ),
  );
  const parts: string[] = [];
  for (const e of seen.elements) {
    if (e.id === "prompt" && typeof e.value === "string") parts.push(e.value);
    const [kind, id] = e.id.split(":");
    if ((kind !== "option" && kind !== "step") || id === undefined) continue;
    const label =
      typeof e.value === "string"
        ? e.value
        : typeof (e.value as { label?: unknown })?.label === "string"
          ? (e.value as { label: string }).label
          : JSON.stringify(e.value);
    parts.push(`  - ${label}${right.has(id) ? " ✓" : ""}`);
  }
  return parts.join("\n");
}

function propLine(
  piece: Extract<Piece, { kind: "prop" }>,
  page: Board,
  props: LessonProps,
  locale: JugnuPlace["locale"],
): string | undefined {
  const given = piece.with ?? {};
  // Words on the page: just the words.
  if (piece.prop === "text") {
    const text = readable(given.text, locale);
    return typeof text === "string" ? text : undefined;
  }
  const standsFor = page.jugnu?.props?.[piece.name];
  const def = props.def(piece.prop);
  const seen = props.describeStart(piece.prop, given, locale);
  let shows = "";
  if (def !== undefined && seen !== undefined) {
    if (def.role === PropRole.Question) return `[question "${piece.name}"] ${questionLine(seen)}`;
    const elements: Record<string, unknown> = {};
    for (const element of seen.elements)
      if (element.words !== undefined) elements[element.id] = element.words;
      else if (element.value !== undefined && element.value !== null)
        elements[element.id] = readable(element.value, locale);
    shows = JSON.stringify(elements);
  }
  const head = `[${piece.prop} "${piece.name}"${standsFor !== undefined ? `: ${standsFor}` : ""}]`;
  const line = shows === "" || shows === "{}" ? head : `${head} shows ${shows}`;
  return line.length > PROP_LINE_MAX ? `${line.slice(0, PROP_LINE_MAX)}…` : line;
}
