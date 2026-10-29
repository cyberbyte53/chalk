/**
 * The preview panel's page: a bar of buttons and the app's own `?dev&…` page in a frame. Its script
 * is written inside a template string, so a backslash in it is eaten: a regex's `\/` reaches the
 * page as `/`, and one bad character stops the whole script (the panel then never switches pages).
 * `panel-html.test.ts` checks the script parses and that "show" moves the frame.
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
<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();
  const frame = document.getElementById("frame");
  const state = { query: ${JSON.stringify(query)}, play: false, hindi: false, picked: null };
  const urlOf = () => ${JSON.stringify(base)} + "?dev&" + state.query + (state.play ? "&play" : "") + (state.hindi ? "&locale=hi" : "");
  const where = document.getElementById("where");
  where.textContent = state.query.replace(/^(board|source|review)=/, "") || "all books";
  const toFrame = (m) => frame.contentWindow && frame.contentWindow.postMessage({ ...m, chalk: true }, "*");
  const reload = () => { frame.src = urlOf(); };
  document.getElementById("play").onclick = (e) => { state.play = !state.play; e.target.classList.toggle("on", state.play); reload(); };
  document.getElementById("hindi").onclick = (e) => { state.hindi = !state.hindi; e.target.classList.toggle("on", state.hindi); reload(); };
  document.getElementById("out").onclick = () => vscode.postMessage({ type: "external", url: urlOf() });
  const select = document.getElementById("select");
  const setSelecting = (on) => { select.classList.toggle("on", on); toFrame({ type: "select", on }); };
  select.onclick = () => setSelecting(!select.classList.contains("on"));
  const copy = document.getElementById("copy");
  copy.onclick = () => vscode.postMessage({ type: "copy" });
  // The same keys as inside the preview, when the panel's bar has focus.
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "a") vscode.postMessage({ type: "copy" });
    if (e.key === "c") setSelecting(!select.classList.contains("on"));
  });
  window.addEventListener("message", (e) => {
    const m = e.data || {};
    if (e.source === frame.contentWindow && m.chalk) {
      if (m.type === "selecting") { select.classList.toggle("on", !!m.on); return; }
      if (m.type === "toggle") { document.getElementById(m.what === "play" ? "play" : "hindi").click(); return; }
      if (m.type === "pick") select.classList.remove("on");
      // A lesson keeps its questions (as the extension's own copy does): a reload must not drop them.
      if (m.follow !== undefined) { state.query = "at=content/" + m.follow + (m.follow.split("/").length >= 3 ? "&show=questions" : ""); where.textContent = m.follow || "all books"; }
      vscode.postMessage(m);
      return;
    }
    // From the extension.
    if (m.type === "show") { state.query = m.query; where.textContent = m.query.replace(/^(at=content[/]|source=|review=)/, "") || "all books"; reload(); }
    else if (m.type === "pick") setSelecting(true);
    else if (m.type === "review") { copy.style.display = m.count > 0 ? "" : "none"; copy.textContent = "Copy for agent (" + m.count + ")"; }
    else toFrame(m);
  });
</script></body></html>`;
}
