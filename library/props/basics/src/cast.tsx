import type { JSX } from "preact";

/** The lesson cast. Each character has its own voice (authoring/voices.json). */
export const CharacterId = { Maya: "maya", Arjun: "arjun" } as const;
export type CharacterId = (typeof CharacterId)[keyof typeof CharacterId];

const LOOK: Record<CharacterId, { initial: string; colour: string; name: string }> = {
  [CharacterId.Maya]: { initial: "M", colour: "#2459D6", name: "Maya" },
  [CharacterId.Arjun]: { initial: "A", colour: "#C26A00", name: "Arjun" },
};

/** Placeholder portraits for the lesson cast until real art exists. */
export function Avatar({ character }: { character: CharacterId }): JSX.Element {
  const look = LOOK[character];
  return (
    <div
      class="avatar"
      style={{ background: look.colour }}
      title={look.name}
      aria-label={look.name}
    >
      {look.initial}
    </div>
  );
}
