import { ItemKind } from "./schema";

/**
 * Our ids for a book's items: positions, one scheme for every book and language. The chapter's
 * sections in order are `1`, `2`, …; a section's blocks `1.1`, `1.2`, …; a subsection (`level: 2`)
 * nests a level (`2.3`, its blocks `2.3.1`), and so do an exercise's questions (`1.5`, its `1.5.1`).
 * What comes before the first section (an epigraph) is section `0`'s.
 */
export function positionalIds(
  items: readonly { kind: string; level?: number | undefined }[],
): string[] {
  const counts = new Map<string, number>();
  const next = (parent: string) => {
    const n = (counts.get(parent) ?? 0) + 1;
    counts.set(parent, n);
    return `${parent}.${n}`;
  };
  let sections = 0;
  let section = "0";
  let subsection: string | undefined;
  let exercise: string | undefined;
  return items.map((item) => {
    if (item.kind === ItemKind.Section && item.level !== 2) {
      sections += 1;
      section = `${sections}`;
      subsection = undefined;
      exercise = undefined;
      return section;
    }
    if (item.kind === ItemKind.Section) {
      subsection = next(section);
      exercise = undefined;
      return subsection;
    }
    if (item.kind === ItemKind.Question && exercise !== undefined) return next(exercise);
    const id = next(subsection ?? section);
    exercise = item.kind === ItemKind.Exercise ? id : undefined;
    return id;
  });
}
