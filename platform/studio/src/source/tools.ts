import { Tool } from "./schema";

/**
 * Each tool's version, raised whenever what it makes can change (platform/docs/plans/sources.md,
 * "Where it is recorded"). `book.yaml` keeps the versions a chapter was built with; a build under
 * other versions raises every piece whose content changed. The reader's covers the words' numbering.
 */
export const TOOL_VERSIONS: Readonly<Record<Tool, number>> = {
  [Tool.Reader]: 1,
  [Tool.HindiRepair]: 4,
  [Tool.FigureSnap]: 1,
  [Tool.TableCells]: 1,
  [Tool.StructureDraft]: 2,
};
