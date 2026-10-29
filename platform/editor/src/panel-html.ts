import { type PanelStart, panelMain } from "./panel-script";

/**
 * The preview panel's page: a bar of buttons and the app's own `?dev&…` page in a frame. Its
 * script is panel-script.ts, checked code, put in as that function's compiled text with where to
 * start. `panel-html.test.ts` checks the script runs and that the frame follows.
 */
export function panelHtml(base: string, query: string): string {
  const nonce = Math.random().toString(36).slice(2);
  const src = `${base}?dev&${query}`;
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src http://localhost:* http://127.0.0.1:*; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>
  html, body { height: 100%; margin: 0; padding: 0; background: var(--vscode-editor-background); color: var(--vscode-foreground); font: 12px var(--vscode-font-family); }
  body { display: flex; flex-direction: column; }
  .bar { display: flex; gap: 6px; align-items: center; padding: 6px 8px; border-bottom: 1px solid var(--vscode-panel-border); }
  .bar .where { flex: 1; opacity: .7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  button { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: 0; padding: 3px 8px; border-radius: 3px; cursor: pointer; font: inherit; }
  button.on { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
  iframe { flex: 1; border: 0; width: 100%; background: #fff; }
</style></head><body>
<div class="bar">
  <span class="where" id="where"></span>
  <button id="select" title="Pick a piece to comment on (key: c)">Pick</button>
  <button id="copy" class="on" style="display:none" title="Copy one line for the agent: apply this review (key: a)">Copy for agent</button>
  <button id="play" title="Play it as the app does: one board at a time, Continue, practice, results (key: p)">Play</button>
  <button id="hindi" title="Hindi">हि</button>
  <button id="out" title="Open in Cursor\'s browser (design mode: ⌘⇧D, click a piece, ⌘L adds it to the chat)">↗</button>
</div>
<iframe id="frame" src="${src}"></iframe>
<script nonce="${nonce}">(${panelMain.toString()})(${JSON.stringify({ base, query } satisfies PanelStart)});</script></body></html>`;
}
