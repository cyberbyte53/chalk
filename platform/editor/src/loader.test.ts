import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

const repo = mkdtempSync(join(tmpdir(), "chalk-loader-"));
const out = join(repo, "platform", "editor", "out");

vi.mock("vscode", () => ({
  workspace: { workspaceFolders: [{ uri: { fsPath: repo } }] },
  window: { setStatusBarMessage: () => {}, showErrorMessage: () => {} },
}));

/** An extension that records its activations and disposals on the global object. */
const extensionCode = (version: number) => `
const log = (globalThis.loaderLog ??= []);
exports.activate = (context) => {
  log.push("activate ${version}");
  context.subscriptions.push({ dispose: () => log.push("dispose ${version}") });
};
exports.unload = () => log.push("unload ${version}");
exports.deactivate = () => log.push("deactivate ${version}");
`;

describe("the editor's loader", () => {
  it("runs the repo's build, and swaps in new code when it is rebuilt, without a reload", async () => {
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, "extension.js"), extensionCode(1));
    const { activate } = await import("./loader");
    const subscriptions: { dispose(): void }[] = [];
    // As the editor makes it: subscriptions is fixed (read-only, non-configurable), like Cursor's.
    const context = Object.freeze({ subscriptions, extensionPath: "/x" });
    activate(context as never);
    const log = (globalThis as { loaderLog?: string[] }).loaderLog ?? [];
    expect(log).toEqual(["activate 1"]);

    writeFileSync(join(out, "extension.js"), extensionCode(2));
    // Up to 10 s: with every test file running at once, the rebuild can take more than 3 (seen).
    await vi.waitFor(() => expect(log).toContain("activate 2"), { timeout: 10_000 });
    expect(log).toEqual(["activate 1", "unload 1", "dispose 1", "activate 2"]);

    // The editor closing: the running code is unloaded and deactivated once.
    for (const d of subscriptions) d.dispose();
    expect(log.slice(4)).toEqual(["unload 2", "dispose 2", "deactivate 2"]);
  });
});
