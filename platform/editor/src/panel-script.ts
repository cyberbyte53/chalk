/**
 * The preview panel's own script, as ordinary checked code: panel-html.ts puts this function's
 * compiled text into the panel's page and calls it with where to start. Written here, not inside a
 * string, so nothing in it can be eaten on the way (a `\` in a string vanishes; one bad character
 * stopped the whole panel once). It may use only what it is given and the page: the function is
 * sent as text, so it can't reach anything else in this file or its imports.
 */

declare function acquireVsCodeApi(): { postMessage(message: unknown): void };

export type PanelStart = { base: string; query: string };

export function panelMain(start: PanelStart): void {
  const vscode = acquireVsCodeApi();
  const frame = document.getElementById("frame") as HTMLIFrameElement;
  const where = document.getElementById("where") as HTMLElement;
  const select = document.getElementById("select") as HTMLElement;
  const state = { query: start.query, play: false, hindi: false };
  // The address shown on the bar: what it is about, without the kind of address.
  const placeOf = (query: string) =>
    query.replace(/^(at=content\/|at=|source=)/, "").replace(/^threads.*/, "open threads") ||
    "all books";
  const urlOf = () =>
    `${start.base}?dev&${state.query}${state.play ? "&play" : ""}${state.hindi ? "&locale=hi" : ""}`;
  const toFrame = (m: Record<string, unknown>) =>
    frame.contentWindow?.postMessage({ ...m, chalk: true }, "*");
  const reload = () => {
    frame.src = urlOf();
  };
  const show = (query: string) => {
    state.query = query;
    where.textContent = placeOf(query);
  };
  const toggle = (id: "play" | "hindi", on: boolean) => {
    document.getElementById(id)?.classList.toggle("on", on);
  };
  const setSelecting = (on: boolean) => {
    select.classList.toggle("on", on);
    toFrame({ type: "select", on });
  };
  where.textContent = placeOf(state.query);

  (document.getElementById("play") as HTMLElement).onclick = () => {
    state.play = !state.play;
    toggle("play", state.play);
    reload();
  };
  (document.getElementById("hindi") as HTMLElement).onclick = () => {
    state.hindi = !state.hindi;
    toggle("hindi", state.hindi);
    reload();
  };
  (document.getElementById("out") as HTMLElement).onclick = () =>
    vscode.postMessage({ type: "external", url: urlOf() });
  select.onclick = () => setSelecting(!select.classList.contains("on"));
  // The same keys as inside the preview, when the panel's bar has focus.
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "c") setSelecting(!select.classList.contains("on"));
  });
  window.addEventListener("message", (e) => {
    const m = (e.data ?? {}) as Record<string, unknown>;
    if (e.source === frame.contentWindow && m.chalk) {
      if (m.type === "selecting") {
        select.classList.toggle("on", m.on === true);
        return;
      }
      if (m.type === "toggle") {
        (document.getElementById(m.what === "play" ? "play" : "hindi") as HTMLElement).click();
        return;
      }
      if (m.type === "pick") select.classList.remove("on");
      // The page says where it is: the panel keeps exactly that, so a reload can't drop anything.
      if (m.type === "at" && typeof m.query === "string") show(m.query);
      vscode.postMessage(m);
      return;
    }
    // From the extension.
    if (m.type === "show" && typeof m.query === "string") {
      show(m.query);
      reload();
    } else if (m.type === "pick") setSelecting(true);
    else toFrame(m);
  });
}
