import { isMuted, setMuted } from "@chalk/player";

/**
 * Messages to and from an editor that shows this page in a panel (platform/editor): the page sits
 * in an iframe inside the editor's webview.
 */
export const isInEditor = window.parent !== window;

export const toEditor = (message: Record<string, unknown>) =>
  isInEditor && window.parent.postMessage({ ...message, chalk: true }, "*");

/** What the editor's own buttons add to an address (play, Hindi), and the preview's own marks. */
const NOT_THE_PLACE = ["dev", "play", "locale", "shot", "run", "end"];

/**
 * Tells an editor showing this page exactly where it is, whenever that changes: on every load, and
 * on every change of address within the page. The editor keeps no address of its own; it shows
 * what the page says, so a reload of the panel can't lose anything the page knew (`&show=questions`).
 */
export function installAddressReports(): void {
  if (!isInEditor) return;
  const report = () => {
    const params = new URLSearchParams(window.location.search);
    for (const k of NOT_THE_PLACE) params.delete(k);
    toEditor({ type: "at", query: params.toString().replace(/=(&|$)/g, "$1") });
  };
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method].bind(history);
    history[method] = (...args: Parameters<History["pushState"]>) => {
      original(...args);
      report();
    };
  }
  window.addEventListener("popstate", report);
  report();
}

/** A view setting kept in the URL (play as the app, Hindi): the editor's panel owns it when there is one. */
export function toggleParam(name: "play" | "locale" | "script"): void {
  if (name === "script") {
    const params = new URLSearchParams(window.location.search);
    if (params.has("noscript")) params.delete("noscript");
    else params.set("noscript", "");
    window.location.search = params.toString().replace(/=(&|$)/g, "$1");
    return;
  }
  if (isInEditor) {
    toEditor({ type: "toggle", what: name === "play" ? "play" : "hindi" });
    return;
  }
  const params = new URLSearchParams(window.location.search);
  if (name === "play") {
    if (params.has("play")) params.delete("play");
    else params.set("play", "");
  } else if (params.get("locale") === "hi") params.delete("locale");
  else params.set("locale", "hi");
  window.location.search = params.toString().replace(/=(&|$)/g, "$1");
}

/** Mutes everything heard (the voice and sounds, as the board's ☰ menu would), or unmutes it. */
export function toggleMuted(): void {
  const isOn = !(isMuted.voice.peek() && isMuted.sounds.peek());
  setMuted("voice", isOn);
  setMuted("sounds", isOn);
}

type Field = HTMLTextAreaElement | HTMLInputElement;

const isField = (el: EventTarget | null): el is Field =>
  (el instanceof HTMLTextAreaElement ||
    (el instanceof HTMLInputElement && /^(text|search|url|email|)$/.test(el.type))) &&
  !el.readOnly &&
  !el.disabled;

/**
 * Copy, cut, paste, select all, undo and redo in this page's text boxes, inside an editor: the
 * editor takes ⌘C/⌘V/⌘X/⌘A/⌘Z (Ctrl on Windows and Linux) for itself and never passes them into
 * an iframe, so the boxes would ignore them. Select all and undo work on the box itself; the
 * clipboard goes through the editor (`clipboard` writes it, `paste` asks for it back as `pasted`).
 * Edits go through execCommand, so they are on the box's undo stack and the page sees the input.
 */
export function installTextKeys(): void {
  if (!isInEditor) return;
  let pasteInto: Field | undefined;
  const selected = (f: Field) => f.value.slice(f.selectionStart ?? 0, f.selectionEnd ?? 0);
  document.addEventListener(
    "keydown",
    (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || !isField(e.target)) return;
      const field = e.target;
      const key = e.key.toLowerCase();
      const act = (run: () => void) => {
        e.preventDefault();
        e.stopPropagation();
        run();
      };
      if (key === "a" && !e.shiftKey) act(() => field.select());
      else if (key === "c" && !e.shiftKey)
        act(() => {
          if (selected(field) !== "") toEditor({ type: "clipboard", text: selected(field) });
        });
      else if (key === "x" && !e.shiftKey)
        act(() => {
          if (selected(field) === "") return;
          toEditor({ type: "clipboard", text: selected(field) });
          document.execCommand("delete");
        });
      else if (key === "v" && !e.shiftKey)
        act(() => {
          pasteInto = field;
          toEditor({ type: "paste" });
        });
      else if (key === "z") act(() => document.execCommand(e.shiftKey ? "redo" : "undo"));
      else if (key === "y" && e.ctrlKey && !e.metaKey) act(() => document.execCommand("redo"));
    },
    true,
  );
  window.addEventListener("message", (e) => {
    const m = e.data as { chalk?: boolean; type?: string; text?: unknown };
    if (m?.chalk !== true || m.type !== "pasted" || typeof m.text !== "string") return;
    const field = pasteInto;
    pasteInto = undefined;
    if (field === undefined || !field.isConnected) return;
    field.focus();
    document.execCommand("insertText", false, m.text);
  });
}

/** ⌘↵ / Ctrl+↵ sends, Esc leaves: for a reply box's onKeyDown. */
export function sendKeys(send: () => void, leave: () => void): (e: KeyboardEvent) => void {
  return (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    } else if (e.key === "Escape") {
      e.preventDefault();
      leave();
    }
  };
}
