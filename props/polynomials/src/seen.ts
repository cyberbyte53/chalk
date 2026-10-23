/** A button as the student sees it: its id, and "disabled" when it can't be pressed now. */
export function button(id: string, isEnabled = true): { id: string; value?: string } {
  return isEnabled ? { id } : { id, value: "disabled" };
}
