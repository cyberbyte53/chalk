import { createContext } from "preact";
import { useContext } from "preact/hooks";

/**
 * The one door a piece's learner actions go through, by path: "giveRound" on a leaf, "dial.move" on
 * a group's child. The board's layout opens it for each piece; a group's view hands each child a
 * door under the child's name. A view never sees it: its `call` takes its own actions.
 */
export type Door = {
  call: (path: string, args?: Readonly<Record<string, unknown>>) => void;
  signal: (path: string, payload?: Readonly<Record<string, unknown>>) => void;
};

const nowhere: Door = { call: () => undefined, signal: () => undefined };

export const DoorContext = createContext<Door>(nowhere);

export function useDoor(): Door {
  return useContext(DoorContext);
}

/** The door into one child of a group: its paths under the child's name. */
export function childDoor(door: Door, child: string): Door {
  return {
    call: (path, args) => door.call(`${child}.${path}`, args),
    signal: (path, payload) => door.signal(`${child}.${path}`, payload),
  };
}

/** The path of an input's action from where a press was heard: under each group child between. */
export function pathFrom(input: Element, boundary: Element, action: string): string {
  const children: string[] = [];
  for (let at = input.parentElement; at !== null && at !== boundary; at = at.parentElement) {
    const child = at.getAttribute("data-child");
    if (child !== null) children.unshift(child);
  }
  return [...children, action].join(".");
}
