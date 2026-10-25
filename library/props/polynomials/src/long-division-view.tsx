import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { termsOf } from "./box-algebra";
import {
  LongDivisionAction,
  type LongDivisionState,
  layoutTex,
  moveCountOf,
  moveTex,
} from "./long-division";
import { SymbolButton } from "./ui";

/**
 * The long division laid out as in the book, the maths of the move just made under it, and two
 * buttons: → for the next move, ↺ to start again.
 */
export function LongDivisionView({ view, call }: PropViewProps): JSX.Element {
  const s = view as unknown as LongDivisionState;
  const total = moveCountOf(s);
  const move = moveTex(s);
  // Six columns or more (the divisor's terms and the dividend's) don't fit a phone at full size.
  const isWide = termsOf(s.divisor).length + s.dividend.length >= 6;
  return (
    <div class={isWide ? "pp-long is-wide" : "pp-long"}>
      <div class="pp-long-layout" data-part="working">
        <RichText text={`$$${layoutTex(s)}$$`} />
      </div>
      {move !== null && (
        <div class="pp-long-move" data-part="move">
          <RichText text={`$$${move}$$`} />
        </div>
      )}
      <div class="pp-long-buttons">
        <SymbolButton
          symbol="→"
          label="Next move"
          part="next"
          isWide
          isEnabled={s.steps < total}
          onPress={() => call(LongDivisionAction.Next, {})}
        />
        <SymbolButton
          symbol="↺"
          label="Start again"
          part="startAgain"
          isEnabled={s.steps > 0}
          onPress={() => call(LongDivisionAction.StartAgain, {})}
        />
      </div>
    </div>
  );
}
