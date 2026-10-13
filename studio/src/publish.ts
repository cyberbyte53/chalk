import { type Board, type Lesson, type Piece, lessonSchema, walkPieces } from "@chalk/content";
import type { Readings } from "@chalk/content";
import type { AnyPropDef } from "@chalk/prop";
import { type Problem, validateLesson } from "./validate";

export type PublishResult =
  | { isOk: true; lesson: Lesson; notes: readonly string[] }
  | { isOk: false; problems: readonly Problem[] };

function bumpPatch(version: string): string {
  const parts = version.split(".").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN))
    throw new Error(`Version "${version}" is not x.y.z`);
  const [major, minor, patch] = parts as [number, number, number];
  return `${major}.${minor}.${patch + 1}`;
}

/** JSON with object keys sorted, so key order never counts as a change. */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v !== null && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );
}

/** The lesson without its version, for "did anything change?" */
function contentOf(lesson: Lesson): string {
  return canonical({ ...lesson, version: undefined });
}

/** Writes keys in a reading order: id, name, kind first; everything else as it was. */
export function orderKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(orderKeys);
  if (value === null || typeof value !== "object") return value;
  const first = ["id", "name", "kind"].filter((k) => k in value);
  const rest = Object.keys(value).filter((k) => !first.includes(k));
  return Object.fromEntries(
    [...first, ...rest].map((k) => [k, orderKeys((value as Record<string, unknown>)[k])]),
  );
}

function maxId(ids: readonly (number | undefined)[]): number {
  return ids.reduce<number>((max, id) => (id !== undefined && id > max ? id : max), 0);
}

function nextCounter(stored: number | undefined, used: readonly (number | undefined)[]): number {
  return Math.max(stored ?? 1, maxId(used) + 1);
}

/**
 * Publish, steps 1–4: check the lesson, retire ids that disappeared since the last published
 * version, hand out permanent ids to new boards and pieces, and bump the version if anything changed.
 * Returns the lesson to write back; it does not touch the disk.
 */
export function publishLesson(
  input: unknown,
  previous: Lesson | null,
  defs: Readonly<Record<string, AnyPropDef>>,
  readings: Readings,
): PublishResult {
  const problems = validateLesson(input, defs, readings);
  if (problems.length > 0) return { isOk: false, problems };
  const lesson = structuredClone(lessonSchema.parse(input));
  const notes: string[] = [];

  // 1. Retire ids that existed in the last published version and are gone now.
  const retiredBoards = new Set(lesson.retiredBoardIds ?? []);
  const previousBoards = new Map(
    (previous?.boards ?? []).flatMap((b) => (b.id === undefined ? [] : [[b.id, b] as const])),
  );
  const currentBoardIds = new Set(lesson.boards.map((b) => b.id));
  for (const [id, board] of previousBoards) {
    if (!currentBoardIds.has(id) && !retiredBoards.has(id)) {
      retiredBoards.add(id);
      notes.push(`retired board ${id} ("${board.name}")`);
    }
  }
  for (const board of lesson.boards) {
    const before = board.id === undefined ? undefined : previousBoards.get(board.id);
    if (before === undefined) continue;
    const retired = new Set(board.retiredPieceIds ?? []);
    const now = new Set(walkPieces(board.root).map((p) => p.id));
    for (const piece of walkPieces(before.root)) {
      if (piece.id !== undefined && !now.has(piece.id) && !retired.has(piece.id)) {
        retired.add(piece.id);
        notes.push(`retired piece ${piece.id} ("${piece.name}") on board "${board.name}"`);
      }
    }
    if (retired.size > 0) board.retiredPieceIds = [...retired].sort((a, b) => a - b);
    board.nextPieceId = nextCounter(board.nextPieceId ?? before.nextPieceId, [...now, ...retired]);
  }
  if (retiredBoards.size > 0) lesson.retiredBoardIds = [...retiredBoards].sort((a, b) => a - b);

  // 2. Hand out ids to anything new.
  let nextBoardId = nextCounter(lesson.nextBoardId ?? previous?.nextBoardId, [
    ...lesson.boards.map((b) => b.id),
    ...retiredBoards,
  ]);
  for (const board of lesson.boards) {
    if (board.id === undefined) {
      board.id = nextBoardId++;
      notes.push(`board "${board.name}" is now board ${board.id}`);
    }
    assignPieceIds(board, notes);
  }
  lesson.nextBoardId = nextBoardId;

  // 3. A retired id must never come back (catches hand edits).
  const reused = validateLesson(lesson, defs, readings);
  if (reused.length > 0) return { isOk: false, problems: reused };

  // 4. Version.
  if (previous !== null && contentOf(lesson) !== contentOf(previous)) {
    const from = previous.version;
    lesson.version = bumpPatch(previous.version);
    notes.push(`version ${from} → ${lesson.version}`);
  }
  return { isOk: true, lesson, notes };
}

function assignPieceIds(board: Board, notes: string[]): void {
  const pieces: Piece[] = walkPieces(board.root);
  let next = nextCounter(board.nextPieceId, [
    ...pieces.map((p) => p.id),
    ...(board.retiredPieceIds ?? []),
  ]);
  for (const piece of pieces) {
    if (piece.id === undefined) {
      piece.id = next++;
      notes.push(`piece "${piece.name}" on board "${board.name}" is now piece ${piece.id}`);
    }
  }
  board.nextPieceId = next;
}
