import { existsSync, realpathSync, watch } from "node:fs";
import { join, sep } from "node:path";
import * as vscode from "vscode";

/**
 * What the editor installs and runs: a loader. It runs the extension's code from the open repo
 * (`platform/editor/out/`, built by `pnpm editor:build`), and when that code is rebuilt it unloads
 * the old code and loads the new, so nobody reloads the window. Without a repo build it runs the
 * copy installed with it.
 *
 * Only what the editor reads from package.json (commands, menus, views) needs a reinstall
 * (`pnpm editor:install`) and a reload; that is said once, when it happens.
 */

type Extension = {
  activate(context: vscode.ExtensionContext): void;
  deactivate?(): void;
  /** Lets go of what isn't a subscription (the preview panel), before new code takes over. */
  unload?(): void;
};

const OUT = join("platform", "editor", "out");

/** The repo's build of the extension, if the open folder has one. */
function repoBuild(): string | undefined {
  for (const folder of vscode.workspace.workspaceFolders ?? []) {
    const dir = join(folder.uri.fsPath, OUT);
    if (existsSync(join(dir, "extension.js"))) return dir;
  }
  return undefined;
}

export function activate(context: vscode.ExtensionContext): void {
  const dir = repoBuild() ?? __dirname;
  let subscriptions: vscode.Disposable[] = [];
  let running: Extension | undefined;
  // The extension's own context, but with subscriptions the loader can dispose on a reload.
  const own = new Proxy(context, {
    get: (target, key) => (key === "subscriptions" ? subscriptions : Reflect.get(target, key)),
  });

  // Node keys its module cache by real path: a folder reached through a symlink is cached under
  // where it really is.
  const real = realpathSync(dir);
  const load = () => {
    for (const file of Object.keys(require.cache))
      if (file.startsWith(real + sep)) delete require.cache[file];
    running = require(join(real, "extension.js")) as Extension;
    running.activate(own);
  };
  const unload = () => {
    running?.unload?.();
    for (const d of subscriptions.splice(0)) {
      try {
        d.dispose();
      } catch {}
    }
    subscriptions = [];
  };

  load();
  context.subscriptions.push({
    dispose: () => {
      unload();
      running?.deactivate?.();
    },
  });
  if (dir === __dirname) return;

  // tsc writes several files: reload once they settle.
  let timer: NodeJS.Timeout | undefined;
  const watcher = watch(dir, (_, file) => {
    if (file === null || !file.endsWith(".js")) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        unload();
        load();
        void vscode.window.setStatusBarMessage("Chalk: editor code reloaded", 3000);
      } catch (e) {
        void vscode.window.showErrorMessage(`Chalk: the new editor code didn't load: ${String(e)}`);
      }
    }, 400);
  });
  context.subscriptions.push({ dispose: () => watcher.close() });
}

export function deactivate(): void {}
