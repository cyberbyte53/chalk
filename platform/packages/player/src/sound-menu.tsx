/** @jsxImportSource preact */
import { type Board, type Locale, propPieces } from "@chalk/content";
import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { isEffectsMuted, setEffectsMuted } from "./effects";
import { isMuted, setMuted } from "./narration";
import type { PropRegistry } from "./prop-module";
import { t } from "./ui-text";

/**
 * The board's menu: what is heard (platform/docs/sound.md), each switched on its own and kept on
 * the device: the voice (every board speaks), and the sounds (effects), when it has any. Later
 * settings (the voice's speed, the language) go here too.
 */
export function SoundMenu({
  locale,
  hasSounds,
}: {
  locale: Locale;
  hasSounds: boolean;
}): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  // A tap anywhere else, or Escape, closes it.
  useEffect(() => {
    if (!isOpen) return;
    const away = (e: PointerEvent) => {
      if (!menu.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("pointerdown", away);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("pointerdown", away);
      window.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);
  return (
    <div class="board-menu" ref={menu}>
      <button
        type="button"
        class="board-menu-button"
        aria-label={t(locale, "menu")}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M3 5 H17 M3 10 H17 M3 15 H17" />
        </svg>
      </button>
      {isOpen && (
        <div class="board-menu-panel" role="menu">
          <Switch
            label={t(locale, "voice")}
            isOn={!isMuted.value}
            onChange={(isOn) => setMuted(!isOn)}
          />
          {hasSounds && (
            <Switch
              label={t(locale, "sounds")}
              isOn={!isEffectsMuted.value}
              onChange={(isOn) => setEffectsMuted(!isOn)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Switch({
  label,
  isOn,
  onChange,
}: {
  label: string;
  isOn: boolean;
  onChange: (isOn: boolean) => void;
}): JSX.Element {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={isOn}
      class="board-menu-switch"
      onClick={() => onChange(!isOn)}
    >
      <span>{label}</span>
      <span class={isOn ? "switch is-on" : "switch"} aria-hidden="true" />
    </button>
  );
}

/** Whether a board can sound an effect: one of its lesson's, or one of its pieces' own. */
export function hasEffects(board: Board, registry: PropRegistry): boolean {
  if (board.model === undefined) return false;
  if (Object.values(board.model.effects ?? {}).some((effect) => effect !== null)) return true;
  return propPieces(board.root).some(
    (piece) => Object.keys(registry[piece.prop]?.sound?.effects ?? {}).length > 0,
  );
}
