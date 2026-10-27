import type { JSX } from "preact";
import { WasteItem } from "./waste";

/** A small drawing of a piece of waste, centred on (0, 0), about 36 × 26 units. */
export function WasteIcon({ item }: { item: WasteItem }): JSX.Element {
  switch (item) {
    case WasteItem.Peels:
      return (
        <g class="ev-w-peel">
          <path d="M-14 4 q 6 -12 14 -4 q 6 6 12 -4" />
          <path d="M-12 10 q 8 -8 16 0 q 6 6 10 -2" />
        </g>
      );
    case WasteItem.TeaLeaves:
      return (
        <g class="ev-w-tea">
          {[-10, -4, 2, 8, -6, 0, 6, -2, 4].map((x, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed specks
            <ellipse key={i} cx={x} cy={i < 4 ? 8 : i < 7 ? 3 : -2} rx={3} ry={2} />
          ))}
        </g>
      );
    case WasteItem.SpoiltFood:
      return (
        <g class="ev-w-food">
          <path d="M-12 10 L-12 -4 q 0 -8 12 -8 q 12 0 12 8 L12 10 Z" />
          <circle class="ev-w-mould" cx={-4} cy={0} r={2.5} />
          <circle class="ev-w-mould" cx={5} cy={4} r={2} />
        </g>
      );
    case WasteItem.Leaves:
      return (
        <g class="ev-w-leaf">
          <path d="M-14 6 q 8 -18 22 -10 q -8 16 -22 10 Z" />
          <path d="M-2 10 q 8 -16 18 -6 q -8 12 -18 6 Z" />
        </g>
      );
    case WasteItem.Paper:
      return (
        <g class="ev-w-paper">
          <rect x={-12} y={-11} width={24} height={22} rx={1} transform="rotate(-8)" />
          <line x1={-7} y1={-4} x2={7} y2={-6} />
          <line x1={-7} y1={1} x2={7} y2={-1} />
          <line x1={-7} y1={6} x2={4} y2={4} />
        </g>
      );
    case WasteItem.Cloth:
      return (
        <g class="ev-w-cloth">
          <path d="M-14 -8 L12 -10 L14 8 L4 6 L-2 11 L-13 9 Z" />
          <line x1={-10} y1={-2} x2={10} y2={-4} />
          <line x1={-10} y1={4} x2={8} y2={2} />
        </g>
      );
    case WasteItem.MilkPacket:
      return (
        <g class="ev-w-plastic">
          <path d="M-10 -12 L10 -12 L12 10 q 0 3 -3 3 L-9 13 q -3 0 -3 -3 Z" />
          <line class="ev-w-print" x1={-6} y1={-2} x2={6} y2={-2} />
          <line class="ev-w-print" x1={-6} y1={3} x2={4} y2={3} />
        </g>
      );
    case WasteItem.MedicineStrip:
      return (
        <g class="ev-w-foil">
          <rect x={-15} y={-9} width={30} height={18} rx={2} />
          {[-9, -3, 3, 9].map((x) => (
            <circle key={x} class="ev-w-blister" cx={x} cy={0} r={2.6} />
          ))}
        </g>
      );
    case WasteItem.GlassBottle:
      return (
        <g class="ev-w-glass">
          <path d="M-3 -14 L3 -14 L3 -8 q 7 2 7 8 L10 12 L-10 12 L-10 0 q 0 -6 7 -8 Z" />
        </g>
      );
    case WasteItem.Slipper:
      return (
        <g class="ev-w-rubber">
          <path d="M-16 4 q -2 -10 10 -10 L12 -6 q 6 0 6 6 q 0 6 -6 6 L-10 8 q -6 0 -6 -4 Z" />
          <path class="ev-w-strap" d="M-4 -6 q 4 -8 8 0" />
        </g>
      );
    case WasteItem.Wrapper:
      return (
        <g class="ev-w-plastic is-shiny">
          <path d="M-14 -8 L-10 -6 L10 -10 L14 -6 L12 8 L-12 10 Z" />
        </g>
      );
    case WasteItem.Battery:
      return (
        <g class="ev-w-battery">
          <rect x={-6} y={-12} width={12} height={24} rx={2} />
          <rect class="ev-w-cap" x={-3} y={-15} width={6} height={3} rx={1} />
        </g>
      );
  }
}
