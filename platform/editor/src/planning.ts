import { existsSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import * as vscode from "vscode";

/**
 * A chapter's planning files in the editor (platform/docs/authoring-pipeline.md): their state in the
 * Chalk tree (the outline, plan.md, boards.md), their failing checks as problems on their lines,
 * and the person's actions on them: approve plan.md (and take it back), comment on selected words.
 * Their state is worked out by the dev server (platform/studio/src/pipeline.ts, through
 * /dev-pipeline); approvals and comments are written by it. Nothing is worked out or written here.
 */

/** One planning file's state, as the dev server reads it. */
export type PlanningFile = {
  step: string;
  file: string;
  /** Whether the person approves it (plan.md); the outline and boards.md are the machine's. */
  isApprovable: boolean;
  status: "missing" | "draft" | "approved" | "changed";
  approvedAt?: string;
  /** Its failing checks, each with the id it is about when there is one. */
  problems: { text: string; about?: string }[];
  notes: string[];
  recheck: string[];
  /** Waiting on your approval, but it can't be given yet: why. */
  blocked?: string;
};
/** A built lesson, and whether it waits on a self-review (platform/studio/src/pipeline.ts). */
export type PlanningLesson = { slug: string; isToSelfReview: boolean; why?: string };

export type PlanningChapter = {
  book: string;
  chapter: string;
  dir: string;
  files: PlanningFile[];
  lessons?: PlanningLesson[];
};

/** A planning file's state in words, for the tree. */
export function stateWords(f: PlanningFile): string {
  if (f.status === "missing") return "not written";
  if (f.problems.length > 0) return "checks fail";
  if (f.blocked !== undefined) return "can't approve yet";
  if (f.recheck.length > 0) return "to check again";
  if (!f.isApprovable) return "checks hold";
  if (f.status === "changed") return "changed since approved";
  return f.status === "approved" ? `approved ${f.approvedAt ?? ""}`.trim() : "to approve";
}

/** Everything a planning file's tooltip says: its checks, what to check again, its notes. */
export function stateDetail(f: PlanningFile): string {
  return [
    ...(f.blocked !== undefined ? [`Can't approve yet: ${f.blocked}`] : []),
    ...f.problems.map((p) => `✗ ${p.text}`),
    ...(f.recheck.length > 0
      ? [`To check again: ${f.recheck.join(", ")} changed since it was approved.`]
      : []),
    ...f.notes,
  ].join("\n");
}

/** Asks the dev server; says why, when it can't. */
async function ask<T>(base: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(new URL(path, base), {
    ...(body === undefined
      ? {}
      : {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }),
  });
  const json = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? `${res.status}`);
  return json;
}

/** Every chapter with planning files. */
export const readAll = (base: string) => ask<PlanningChapter[]>(base, "dev-pipeline");

/** A chapter's planning files, written or not. */
export const readOne = (base: string, book: string, chapter: string) =>
  ask<PlanningChapter>(
    base,
    `dev-pipeline?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}`,
  );

/** The chapter and step of a planning file, from its path, if it is one. */
export function planningFileOf(
  root: string,
  file: string,
): { book: string; chapter: string; name: string } | undefined {
  const rel = relative(root, file).split(sep).join("/");
  const m = /^authoring\/books\/([^/]+)\/([^/]+)\/(.+)$/.exec(rel);
  if (m === null) return undefined;
  return { book: m[1] as string, chapter: m[2] as string, name: m[3] as string };
}

/**
 * The failing checks as problems on the files: each on the line that names the id it is about (an
 * objective, a board, an outline item), else on the first line.
 */
export function showProblems(
  root: string,
  chapters: readonly PlanningChapter[],
  diagnostics: vscode.DiagnosticCollection,
): void {
  diagnostics.clear();
  for (const c of chapters)
    for (const f of c.files) {
      if (f.problems.length === 0 && f.recheck.length === 0) continue;
      const path = join(root, c.dir, f.file);
      if (!existsSync(path)) continue;
      const lines = readFileSync(path, "utf8").split("\n");
      const lineOf = (about: string | undefined): number => {
        if (about === undefined) return 0;
        const id = new RegExp(`(^|[^\\w.-])${about.replace(/[.]/g, "\\.")}([^\\w.-]|$)`);
        return Math.max(
          0,
          lines.findIndex((l) => id.test(l)),
        );
      };
      const items = [
        ...f.problems.map((p) => {
          const line = lineOf(p.about);
          return new vscode.Diagnostic(
            new vscode.Range(line, 0, line, lines[line]?.length ?? 0),
            p.text,
            vscode.DiagnosticSeverity.Error,
          );
        }),
        ...(f.recheck.length > 0
          ? [
              new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, lines[0]?.length ?? 0),
                `To check again: ${f.recheck.join(", ")} changed since it was approved`,
                vscode.DiagnosticSeverity.Warning,
              ),
            ]
          : []),
      ];
      for (const d of items) d.source = "chalk";
      diagnostics.set(vscode.Uri.file(path), items);
    }
}

/** The person approves a planning file, or takes the approval back. Says why, if refused. */
export async function setApproval(
  base: string,
  where: { book: string; chapter: string; step: string },
  isApproved: boolean,
): Promise<boolean> {
  try {
    await ask(base, isApproved ? "dev-pipeline/approve" : "dev-pipeline/reopen", where);
    return true;
  } catch (e) {
    void vscode.window.showErrorMessage(`Chalk: ${(e as Error).message}`);
    return false;
  }
}
