import { type Locale, propBoard } from "@chalk/content";
import { previewQuery, propAddress } from "@chalk/content/address";
import type { EventBus } from "@chalk/events";
import { preloadProps, propLibrary, propPackages } from "@chalk/library";
import { BoardPlayer } from "@chalk/player";
import { useWhenChanged } from "@chalk/player";
import { BOARD, PropRole, purposeOf } from "@chalk/prop";
import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";

/** What the build recorded each board was made from: here, which prop each piece is. */
type Reach = { boards: Record<string, { pieces: Record<string, { type?: string }> }> };

const ROLE_WORDS: Record<string, string> = {
  [PropRole.Explainer]: "explainer",
  [PropRole.Question]: "question",
  [PropRole.Page]: "page",
};

/**
 * The library (`?dev&at=library/props/`, or one package's, `library/props/<package>`): every prop
 * drawn live at its defaults, with its role, what it is for and how many boards use it; a click
 * opens its own page, with its panel. The same facts as the chalk MCP's `look` at the library,
 * read from the same places: the prop definitions and the build's record of every board.
 */
export function LibraryScreen({
  pkg,
  locale,
  bus,
  reach,
}: {
  pkg: string | undefined;
  locale: Locale;
  bus: EventBus;
  reach: () => Promise<unknown>;
}): JSX.Element {
  const [uses, setUses] = useState<Map<string, number> | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);
  const packages = [...propPackages].filter(([name]) => pkg === undefined || name === pkg);
  useWhenChanged([pkg], () => {
    let isLive = true;
    const types = packages.flatMap(([, defs]) => defs.map((d) => d.type));
    void Promise.all([
      preloadProps(types),
      reach()
        .then((r) => {
          // Boards that place each prop type.
          const out = new Map<string, Set<string>>();
          for (const [board, b] of Object.entries((r as Reach).boards))
            for (const p of Object.values(b.pieces))
              if (p.type !== undefined) out.set(p.type, (out.get(p.type) ?? new Set()).add(board));
          return new Map([...out].map(([t, s]) => [t, s.size]));
        })
        .catch(() => new Map<string, number>()),
    ]).then(([, counted]) => {
      if (!isLive) return;
      setUses(counted);
      setIsReady(true);
    });
    return () => {
      isLive = false;
    };
  });
  if (pkg !== undefined && packages.length === 0)
    return (
      <div class="preview-empty">
        No prop package "{pkg}" under library/props (packages: {[...propPackages.keys()].join(", ")}
        )
      </div>
    );
  if (!isReady) return <div class="preview-loading">Loading the library…</div>;
  return (
    <main class="preview library">
      {packages.map(([name, defs]) => (
        <section key={name} class="library-package">
          <h2>
            <a href={`?dev&at=library/props/${name}`}>library/props/{name}</a>
          </h2>
          <div class="library-grid">
            {defs
              .filter((def) => def.type !== BOARD)
              .map((def) => {
                const address = propAddress(name, def.type);
                const n = uses?.get(def.type) ?? 0;
                // A prop whose defaults aren't a whole prop (words it must be given) says what it needs.
                const atDefaults = def.state.safeParse(def.defaults);
                const needs = atDefaults.success
                  ? undefined
                  : [...new Set(atDefaults.error.issues.map((i) => i.path.join(".")))].join(", ");
                return (
                  <a key={def.type} class="library-card" href={`?dev&${previewQuery(address)}`}>
                    <div class="library-picture lesson preview-phone">
                      {needs !== undefined ? (
                        <p class="library-note">
                          Its defaults draw nothing: a board gives it {needs}.
                        </p>
                      ) : def.drawsOn === undefined ? (
                        <BoardPlayer
                          board={propBoard(def.type)}
                          registry={propLibrary}
                          locale={locale}
                          record={bus.record}
                          audio={undefined}
                          onPass={() => {}}
                        />
                      ) : (
                        <p class="library-note">Draws inside a {def.drawsOn} frame.</p>
                      )}
                    </div>
                    <div class="library-words">
                      <b>{def.type}</b> · {ROLE_WORDS[def.role] ?? String(def.role)} · used on {n}{" "}
                      board{n === 1 ? "" : "s"}
                      <p>{purposeOf(def)}</p>
                    </div>
                  </a>
                );
              })}
          </div>
        </section>
      ))}
    </main>
  );
}
