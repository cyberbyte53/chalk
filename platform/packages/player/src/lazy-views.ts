import type { AnyPropDef } from "@chalk/prop";
import { type ComponentType, type JSX, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { PropModule, PropRegistry, PropViewProps } from "./prop-module";

/**
 * One prop package as the app loads it: its definitions now (they are small, and a board can't run
 * without them), its drawing code later (`load`, a dynamic import of the whole package), when a
 * chapter that uses one of its props opens.
 */
export type PropPack = {
  defs: readonly AnyPropDef[];
  load: () => Promise<Readonly<Record<string, unknown>>>;
};

/** A placed prop waits this tall (a share of its width) while its drawing code arrives. */
const WAITING_ASPECT = 0.6;

const isPropModule = (value: unknown): value is PropModule =>
  typeof value === "object" &&
  value !== null &&
  "def" in value &&
  "View" in value &&
  typeof (value as PropModule).def?.type === "string";

/**
 * A registry whose views load on demand. Each prop's `View` draws at once if its package is here;
 * otherwise it keeps the prop's place and loads the package. `preload` fetches the packages a set
 * of prop types needs (a chapter's, while Jugnu fetches its lessons), so nothing waits mid-lesson.
 */
export function lazyRegistry(
  packs: readonly PropPack[],
  /** Props every lesson uses (text, choices, buttons): drawn at once, never waited for. */
  eager: readonly PropModule[] = [],
): {
  registry: PropRegistry;
  preload: (types: Iterable<string>) => Promise<void>;
} {
  const views = new Map<string, ComponentType<PropViewProps>>();
  const loading = new Map<PropPack, Promise<void>>();
  const packOf = new Map<string, PropPack>();
  for (const pack of packs) for (const def of pack.defs) packOf.set(def.type, pack);

  const load = (pack: PropPack): Promise<void> => {
    const running = loading.get(pack);
    if (running !== undefined) return running;
    const started = pack.load().then(
      (module) => {
        for (const value of Object.values(module)) {
          const found = Array.isArray(value) ? value.filter(isPropModule) : [value];
          for (const one of found) if (isPropModule(one)) views.set(one.def.type, one.View);
        }
      },
      (error: unknown) => {
        // Offline before this package was ever fetched: the next try asks again.
        loading.delete(pack);
        throw error;
      },
    );
    loading.set(pack, started);
    return started;
  };

  const lazyView = (type: string, pack: PropPack): ComponentType<PropViewProps> =>
    function LazyPropView(props: PropViewProps): JSX.Element {
      const View = views.get(type);
      const [, setArrived] = useState(0);
      // `pack` belongs to this prop type, fixed for the component's whole life.
      // biome-ignore lint/correctness/useExhaustiveDependencies: re-run only when the view arrives
      useEffect(() => {
        if (View !== undefined) return;
        let isLive = true;
        load(pack).then(
          () => isLive && setArrived((n) => n + 1),
          () => {},
        );
        return () => {
          isLive = false;
        };
      }, [View]);
      if (View !== undefined) return h(View, props);
      return h("div", {
        class: "prop-waiting",
        "aria-busy": "true",
        // What it would show isn't known yet: describing it now is refused (tags.ts).
        "data-waiting": "",
        style: {
          width: `${props.width}px`,
          height: `${Math.round(props.width * WAITING_ASPECT)}px`,
        },
      });
    };

  const registry: PropRegistry = Object.fromEntries([
    ...eager.map((module) => [module.def.type, module] as const),
    ...packs.flatMap((pack) =>
      pack.defs.map((def) => [def.type, { def, View: lazyView(def.type, pack) }] as const),
    ),
  ]);

  const preload = async (types: Iterable<string>): Promise<void> => {
    const needed = new Set<PropPack>();
    for (const type of types) {
      const pack = packOf.get(type);
      if (pack !== undefined && !views.has(type)) needed.add(pack);
    }
    await Promise.all([...needed].map(load));
  };

  return { registry, preload };
}
