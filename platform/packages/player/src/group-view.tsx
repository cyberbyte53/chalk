/** @jsxImportSource preact */
import { nameOf } from "@chalk/prop";
import { type AnyProp, IN_PICTURE, Place, shownOf } from "@chalk/prop";
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

/**
 * What a child draws in each place round a frame's picture (`Place`): `{ on: Walker, below:
 * WhereSheIs, controls: Steps }`. A child given as one view draws on the lines (or, if it is a
 * `below` child, below the picture).
 */
export type PartDrawing = { readonly [P in Place]?: ComponentType<PropViewProps> };

const isDrawing = (v: ComponentType<PropViewProps> | PartDrawing): v is PartDrawing =>
  typeof v !== "function";

export function groupView(
  def: AnyProp,
  views: Readonly<Record<string, ComponentType<PropViewProps> | PartDrawing>>,
  options: GroupViewOptions = {},
): ComponentType<PropViewProps> {
  const wide = options.wide ?? [];
  const layout = def.layout;
  if (layout === undefined) throw new Error(`${def.type} is not made of parts: it has no layout`);
  const l = layout;
  for (const name of l.children)
    if (views[name] === undefined) throw new Error(`${def.type}: no view for child ${name}`);
  const below = l.kind === "frame" ? (l.below ?? []) : [];
  /** A child's drawing in one place (a single view draws on the lines, or below if it's below). */
  const drawingOf = (name: string, place: Place): ComponentType<PropViewProps> | undefined => {
    const v = views[name];
    if (v === undefined) return undefined;
    if (isDrawing(v)) return v[place];
    return place === (below.includes(name) ? Place.Below : Place.On) ? v : undefined;
  };
  // A layout's order for a place names everyone drawing there: a drawing it leaves out is refused
  // here, not dropped from the screen.
  if (l.kind === "frame")
    for (const [place, named] of Object.entries(l.order ?? {}))
      for (const name of [l.provider, ...l.children, ...below])
        if (drawingOf(name, place as Place) !== undefined && !named.includes(name))
          throw new Error(
            `${def.type}: ${name} draws ${place}, but the layout's order.${place} leaves it out`,
          );
  /** Who draws in a place, in order: as the layout says, else provider, children, below. */
  const drawersIn = (place: Place): readonly string[] => {
    if (l.kind !== "frame") return [];
    const named = l.order?.[place];
    const all = named ?? [l.provider, ...l.children, ...below];
    return all.filter((name) => drawingOf(name, place) !== undefined);
  };
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
    const slot = (
      name: string,
      View: ComponentType<PropViewProps> | undefined,
      inFrame: boolean,
      key: string = name,
    ) =>
      !isThere(name) || View === undefined ? null : (
        <ChildSlot
          key={key}
          name={name}
          View={View}
          view={view[name] as PropViewProps["view"]}
          width={width}
          locale={locale}
          door={door}
          isWide={inFrame || wide.includes(name)}
          inFrame={inFrame}
        />
      );
    if (l.kind === "frame") {
      const provider = def.children?.[l.provider];
      const providerState = view[l.provider] as never;
      const px = provider?.frame?.pixels(providerState, width);
      if (px === undefined) throw new Error(`${def.type}: ${l.provider} provides no frame`);
      /** Each drawing inside the picture, back to front, by its key (the child, or child:place). */
      const drawings = IN_PICTURE.flatMap((place) =>
        drawersIn(place)
          .filter(isThere)
          .map((name) => ({ name, place, key: place === Place.On ? name : `${name}:${place}` })),
      );
      const around = (place: Place) =>
        drawersIn(place).map((name) =>
          slot(name, drawingOf(name, place), false, `${name}:${place}`),
        );
      const controls = around(Place.Controls).filter((c) => c !== null);
      return withTheme(
        <div class={`group group-frame group-${def.type}`}>
          {around(Place.Above)}
          <div class="group-picture">
            {l.backdrop !== undefined && slot(l.backdrop, drawingOf(l.backdrop, Place.On), false)}
            <FrameStage
              px={px}
              label={provider?.frame?.label?.(providerState) ?? def.describe}
              look={options.look?.(view) ?? ""}
            >
              {drawings.map(({ name, place, key }) => (
                <InFrame key={key} owner={name} slot={key} px={px}>
                  {slot(name, drawingOf(name, place), true)}
                </InFrame>
              ))}
            </FrameStage>
          </div>
          {options.below !== undefined
            ? options.below((name) => slot(name, drawingOf(name, Place.Below), false), view)
            : around(Place.Below)}
          {controls.length > 0 && <div class="group-controls">{controls}</div>}
        </div>,
      );
    }
    return withTheme(
      <div class={`group group-${l.kind} group-${def.type}`}>
        {l.children.map((name) => slot(name, drawingOf(name, Place.On), false))}
      </div>,
    );
  }
  return GroupView;
}
