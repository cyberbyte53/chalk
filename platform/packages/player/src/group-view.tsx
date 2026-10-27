import { type AnyPropDef, type StoredState, groupOf, shownOf } from "@chalk/prop";
import { nameOf } from "@chalk/prop";
import { type ComponentType, type JSX, createContext } from "preact";
import { memo } from "preact/compat";
import { useContext } from "preact/hooks";
import { type Door, DoorContext, childDoor, useDoor } from "./door";
import { FrameStage, InFrame } from "./frame";
import type { PropViewProps } from "./prop-module";

type Slot = {
  name: string;
  View: ComponentType<PropViewProps>;
  /** The child's view: the same object until the child's own state changes. */
  view: PropViewProps["view"];
  width: number;
  locale: PropViewProps["locale"];
  /** The group's door: the child's actions go through it under the child's name. */
  door: Door;
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
    door,
    isWide,
    inFrame,
  }: Slot): JSX.Element {
    const own = childDoor(door, name);
    const inner = (
      <DoorContext.Provider value={own}>
        <View
          view={view}
          width={width}
          locale={locale}
          call={(action, ...args) =>
            own.call(nameOf(action), args[0] as Readonly<Record<string, unknown>> | undefined)
          }
          signal={(signal, payload) => own.signal(nameOf(signal), payload)}
        />
      </DoorContext.Provider>
    );
    // A press inside is heard once, by the piece: its path runs through `data-child`.
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
    a.door === b.door &&
    a.width === b.width &&
    a.locale === b.locale &&
    a.View === b.View &&
    !a.inFrame,
);

/**
 * A group's view: each child drawn by its own view, in the group's layout. What the learner does
 * to a child is the group's action by path ("input.change"): the group runs the child's law or
 * routes it. Each child sits in `data-child`, so its parts are named "<child>/<part>" and its
 * inputs do "<child>.<action>".
 */
const ThemeContext = createContext<string>("");

/**
 * The look a group gives its children (the lens's "ln", the mirror's "sm"): a view concern, never
 * state. A leaf reads it to pick its classes.
 */
export function useTheme(): string {
  return useContext(ThemeContext);
}

export type GroupViewOptions = {
  /** The look its children draw in (read with `useTheme`). */
  theme?: string;
  /** Children that take the whole width (a plane); the rest keep their own size. */
  wide?: readonly string[];
  /** Extra classes on a frame's picture, from the group's view (e.g. "is-dial" while draggable). */
  look?: (view: PropViewProps["view"]) => string;
  /**
   * How a frame's `below` children are arranged (a row of controls, some only while shown). Gets
   * a function drawing one child by name, and the group's view. Default: one under another.
   */
  below?: (
    slot: (name: string) => JSX.Element | null,
    view: PropViewProps["view"],
  ) => JSX.Element | null;
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
  const withTheme = (tree: JSX.Element) =>
    options.theme === undefined ? (
      tree
    ) : (
      <ThemeContext.Provider value={options.theme}>{tree}</ThemeContext.Provider>
    );
  function GroupView({ view, width, locale }: PropViewProps): JSX.Element {
    const door = useDoor();
    const shown = shownOf(view);
    const isThere = (name: string) =>
      view[name] !== null && view[name] !== undefined && shown?.[name] !== false;
    const slot = (name: string, inFrame: boolean) =>
      !isThere(name) ? null : (
        <ChildSlot
          key={name}
          name={name}
          View={views[name] as ComponentType<PropViewProps>}
          view={view[name] as PropViewProps["view"]}
          width={width}
          locale={locale}
          door={door}
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
      const inside = [l.provider, ...l.children].filter(isThere);
      return withTheme(
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
          {options.below !== undefined
            ? options.below((name) => slot(name, false), view)
            : (l.below ?? []).map((name) => slot(name, false))}
        </div>,
      );
    }
    return withTheme(
      <div class={`group group-${layout?.layout.kind} group-${def.type}`}>
        {layout?.layout.children.map((name) => slot(name, false))}
      </div>,
    );
  }
  return GroupView;
}
