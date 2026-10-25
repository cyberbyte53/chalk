import { type AnyPropDef, childView, compositeOf } from "@chalk/prop";
import type { ComponentType, JSX } from "preact";
import type { PropViewProps } from "./prop-module";

/**
 * A composite's view: each child drawn by its own view, one under another, from the parent's
 * state. What the learner does to a child goes to the parent as the action the composite routes it
 * to; anything it doesn't route does nothing. Each child sits in `data-child`, so a part inside it
 * is found as "<child> › <part>".
 */
export function compositeView(
  def: AnyPropDef,
  views: Readonly<Record<string, ComponentType<PropViewProps>>>,
  /** Children that take the whole width (a plane); the rest keep their own size. */
  wide: readonly string[] = [],
): ComponentType<PropViewProps> {
  const layout = compositeOf(def);
  if (layout === undefined) throw new Error(`${def.type} is not a composite`);
  for (const name of layout.children)
    if (views[name] === undefined) throw new Error(`${def.type}: no view for child ${name}`);
  function CompositeView({ view, width, locale, call }: PropViewProps): JSX.Element {
    return (
      <div class={`bk-composite composite-${def.type}`}>
        {layout?.children.map((name) => {
          const View = views[name] as ComponentType<PropViewProps>;
          const route = (action: string, args?: Readonly<Record<string, unknown>>) => {
            const to = layout.route(view, name, action, { ...(args ?? {}) });
            if (to !== undefined) call(to[0], to[1] as Record<string, unknown>);
          };
          return (
            <div
              key={name}
              class={`bk-child${wide.includes(name) ? " is-wide" : ""}`}
              data-child={name}
            >
              <View
                view={childView(def, view, name)}
                width={width}
                locale={locale}
                call={route}
                signal={(signal, payload) => route(signal, payload)}
              />
            </div>
          );
        })}
      </div>
    );
  }
  return CompositeView;
}
