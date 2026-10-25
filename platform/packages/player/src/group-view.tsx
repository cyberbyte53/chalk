import { type AnyPropDef, type StoredState, groupOf } from "@chalk/prop";
import type { ComponentType, JSX } from "preact";
import { memo } from "preact/compat";
import { FrameStage, InFrame } from "./frame";
import type { PropViewProps } from "./prop-module";

type Slot = {
  name: string;
  View: ComponentType<PropViewProps>;
  /** The child's view: the same object until the child's own state changes. */
  view: PropViewProps["view"];
  width: number;
  locale: PropViewProps["locale"];
  call: PropViewProps["call"];
  signal: PropViewProps["signal"];
  isWide: boolean;
  /** Drawn inside a frame's picture: an SVG group, not a block. */
  inFrame: boolean;
};

/** One child, redrawn only when its own view changed (or the width). */
const ChildSlot = memo(
  function ChildSlot({
    name,
    View,
    view,
    width,
    locale,
    call,
    signal,
    isWide,
    inFrame,
  }: Slot): JSX.Element {
    const inner = (
      <View
        view={view}
        width={width}
        locale={locale}
        call={(action, args) => call(`${name}.${action}`, args)}
        signal={(s, payload) => signal(`${name}.${s}`, payload)}
      />
    );
    if (inFrame) return <g data-child={name}>{inner}</g>;
    return (
      <div class={`group-child${isWide ? " is-wide" : ""}`} data-child={name}>
        {inner}
      </div>
    );
  },
  // In a frame, a child also redraws when the frame's transform moves (its own view unchanged).
  (a, b) =>
    a.view === b.view &&
    a.width === b.width &&
    a.locale === b.locale &&
    a.View === b.View &&
    !a.inFrame,
);

/**
 * A group's view: each child drawn by its own view, in the group's layout. What the learner does
 * to a child is the group's action by path ("input.change"): the group runs the child's law or
 * routes it. Each child sits in `data-child`, so its parts are found as "<child> › <part>".
 */
export type GroupViewOptions = {
  /** Children that take the whole width (a plane); the rest keep their own size. */
  wide?: readonly string[];
  /** Extra classes on a frame's picture, from the group's view (e.g. "is-dial" while draggable). */
  look?: (view: PropViewProps["view"]) => string;
};

export function groupView(
  def: AnyPropDef,
  views: Readonly<Record<string, ComponentType<PropViewProps>>>,
  options: GroupViewOptions = {},
): ComponentType<PropViewProps> {
  const wide = options.wide ?? [];
  const layout = groupOf(def);
  if (layout === undefined) throw new Error(`${def.type} is not a group`);
  for (const name of layout.layout.children)
    if (views[name] === undefined) throw new Error(`${def.type}: no view for child ${name}`);
  function GroupView({ view, width, locale, call, signal }: PropViewProps): JSX.Element {
    const slot = (name: string, inFrame: boolean) =>
      view[name] === null || view[name] === undefined ? null : (
        <ChildSlot
          key={name}
          name={name}
          View={views[name] as ComponentType<PropViewProps>}
          view={view[name] as PropViewProps["view"]}
          width={width}
          locale={locale}
          call={call}
          signal={signal}
          isWide={inFrame || wide.includes(name)}
          inFrame={inFrame}
        />
      );
    const l = layout?.layout;
    if (l?.kind === "frame") {
      const provider = layout?.children[l.provider] as AnyPropDef;
      const providerState = view[l.provider] as StoredState;
      const px = provider.frame?.pixels(providerState, width);
      if (px === undefined) throw new Error(`${def.type}: ${l.provider} provides no frame`);
      const inside = [l.provider, ...l.children].filter(
        (n) => view[n] !== null && view[n] !== undefined,
      );
      return (
        <div class={`group group-frame group-${def.type}`}>
          <div class="group-picture">
            {l.backdrop !== undefined && slot(l.backdrop, false)}
            <FrameStage
              px={px}
              label={provider.frame?.label?.(providerState) ?? def.describe}
              present={inside}
              look={options.look?.(view) ?? ""}
            >
              {inside.map((name) => (
                <InFrame key={name} owner={name} px={px}>
                  {slot(name, true)}
                </InFrame>
              ))}
            </FrameStage>
          </div>
          {(l.below ?? []).map((name) => slot(name, false))}
        </div>
      );
    }
    return (
      <div class={`group group-${layout?.layout.kind} group-${def.type}`}>
        {layout?.layout.children.map((name) => slot(name, false))}
      </div>
    );
  }
  return GroupView;
}
