import type { JSX as PreactJSX } from "preact/jsx-runtime";
import type { InputTags } from "./tags";

/**
 * How prop views write their elements (each prop package's tsconfig: `jsxImportSource:
 * "@chalk/prop"`): preact's, with one rule the type checker keeps while the view is written.
 * Anything a student can press or drag says what it does: an element with an event handler
 * (`onClick`, `onPointerDown`, `onKeyDown`, …) must carry `does(…)` or `says(…)`, which names it.
 * Without them it is a type error, so no unnamed control can be drawn in any state. The drawing
 * kit's own inputs (@chalk/draw) take the same tags as required props.
 */
export { Fragment, jsx, jsxDEV, jsxs } from "preact/jsx-runtime";

/** The event handlers an element's attributes allow. */
type HandlerKey<T> = { [K in keyof T]-?: K extends `on${string}` ? K : never }[keyof T];

/** An element's attributes: no handlers, or handlers together with what it does (its name). */
type Named<T> = Omit<T, HandlerKey<T>> &
  ({ [K in HandlerKey<T>]?: never } | (Pick<T, HandlerKey<T>> & InputTags));

export namespace JSX {
  export type Element = PreactJSX.Element;
  export type ElementType = PreactJSX.ElementType;
  export type ElementClass = PreactJSX.ElementClass;
  export type ElementAttributesProperty = PreactJSX.ElementAttributesProperty;
  export type ElementChildrenAttribute = PreactJSX.ElementChildrenAttribute;
  export type IntrinsicAttributes = PreactJSX.IntrinsicAttributes;
  export type LibraryManagedAttributes<C, P> = PreactJSX.LibraryManagedAttributes<C, P>;
  export type IntrinsicElements = {
    [K in keyof PreactJSX.IntrinsicElements]: Named<PreactJSX.IntrinsicElements[K]>;
  };
}
