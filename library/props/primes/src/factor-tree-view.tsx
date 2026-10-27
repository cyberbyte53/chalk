import { NumberField, Stage, SymbolButton } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import { does, says, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { toneOf } from "./arithmetic";
import { MAX_TREE_NUMBER, type TreeNode, factorTree } from "./factor-tree";
import { factorPairs } from "./seen";
import { BagTowers } from "./ui";

const LEVEL = 66;
const TOP = 30;
const RADIUS = 21;

/** x for every node: ends spread evenly in tree order, a split node centred over its branches. */
function place(nodes: readonly TreeNode[], width: number): Map<string, number> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const ends: string[] = [];
  const walk = (id: string): void => {
    const n = byId.get(id);
    if (n === undefined) return;
    if (n.children === null) ends.push(id);
    else for (const child of n.children) walk(child);
  };
  walk("r");
  const gap = width / Math.max(1, ends.length);
  const xs = new Map<string, number>();
  ends.forEach((id, i) => xs.set(id, gap * (i + 0.5)));
  const centre = (id: string): number => {
    const known = xs.get(id);
    if (known !== undefined) return known;
    const n = byId.get(id);
    if (n?.children == null) return width / 2;
    const x = (centre(n.children[0]) + centre(n.children[1])) / 2;
    xs.set(id, x);
    return x;
  };
  centre("r");
  return xs;
}

/** Every way to write v as two factors bigger than 1, smaller factor first. */
/** What a node shows: its number, and what became of it. */
function nodeSeen(n: TreeNode, nodes: readonly TreeNode[], selected: string | null) {
  const kids = n.children?.map((c) => nodes.find((m) => m.id === c)?.value);
  return {
    value: n.value,
    ...(kids !== undefined ? { splitInto: kids } : { isPrime: n.isPrime }),
    ...(n.id === selected ? { isPicked: true } : {}),
  };
}

/** The same in words: "180, split into 2 × 90", "5, prime", "90, not split yet". */
function nodeWords(n: TreeNode, nodes: readonly TreeNode[], selected: string | null): string {
  const kids = n.children?.map((c) => nodes.find((m) => m.id === c)?.value);
  return kids !== undefined
    ? `${n.value}, split into ${kids.join(" × ")}`
    : n.isPrime
      ? `${n.value}, prime`
      : `${n.value}, not split yet${n.id === selected ? " (picked)" : ""}`;
}

/**
 * The factor tree, top down. A number not yet split is dashed: tap it, then pick one of its factor
 * pairs to split it. Primes are beads in their colour; they collect in the bag underneath, which is
 * the same whichever pairs were picked.
 */
export function FactorTreeView({
  view,
  width,
  call,
}: PropViewProps<typeof factorTree>): JSX.Element {
  const s = view;
  const depth = Math.max(...s.nodes.map((n) => n.depth));
  const height = TOP + depth * LEVEL + RADIUS + 12;
  const xs = place(s.nodes, width);
  const yOf = (n: TreeNode) => TOP + n.depth * LEVEL;
  const selected = s.nodes.find((n) => n.id === s.selected);
  const ends = s.nodes.filter((n) => n.children === null);
  return (
    <div class="pr-tree">
      {s.isEditable && (
        <div class="pr-steppers">
          <NumberField
            name="n"
            value={s.number}
            min={2}
            max={MAX_TREE_NUMBER}
            {...says(factorTree.actions.setNumber)}
            onChange={(number) => call(factorTree.actions.setNumber, { number })}
          />
        </div>
      )}
      <Stage
        label={`Factor tree of ${s.number}: ${ends.map((n) => n.value).join(" × ")}`}
        x={[0, width]}
        width={width}
        height={height}
      >
        {s.nodes.map((n) =>
          n.children === null
            ? null
            : n.children.map((c) => {
                const child = s.nodes.find((m) => m.id === c);
                if (child === undefined) return null;
                return (
                  <line
                    key={c}
                    class="pr-branch"
                    x1={xs.get(n.id)}
                    y1={yOf(n)}
                    x2={xs.get(c)}
                    y2={yOf(child)}
                  />
                );
              }),
        )}
        {s.nodes.map((n) => {
          const x = xs.get(n.id) ?? 0;
          const y = yOf(n);
          const isOpen = n.children === null && !n.isPrime;
          const classes = ["pr-node"];
          if (n.isPrime) classes.push("is-prime", `pr-${toneOf(n.value)}`);
          else if (isOpen) classes.push("is-open");
          if (n.id === s.selected) classes.push("is-selected");
          const label = String(n.value);
          const r = Math.max(RADIUS, 6 + label.length * 5.5);
          return (
            <g
              key={n.id}
              class={classes.join(" ")}
              transform={`translate(${x} ${y})`}
              {...(isOpen ? does(factorTree.actions.select, { node: n.id }, n.id) : {})}
              {...shows(
                `node:${n.id}`,
                nodeSeen(n, s.nodes, s.selected),
                nodeWords(n, s.nodes, s.selected),
              )}
              role={isOpen ? "button" : undefined}
              aria-label={isOpen ? `Split ${n.value}` : undefined}
              tabIndex={isOpen ? 0 : undefined}
              onKeyDown={
                isOpen
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        call(factorTree.actions.select, { node: n.id });
                      }
                    }
                  : undefined
              }
            >
              {n.isPrime ? (
                <circle r={RADIUS - 3} />
              ) : (
                <rect x={-r} y={-17} width={2 * r} height={34} rx={17} />
              )}
              <text dy="0.36em">{label}</text>
            </g>
          );
        })}
      </Stage>
      {selected !== undefined && (
        <div
          class="pr-pairs"
          {...shows("pairs", selected.value, `ways to split ${selected.value}`)}
        >
          {factorPairs(selected.value).map(([d, e]) => (
            <SymbolButton
              key={d}
              symbol={`${d} × ${e}`}
              label={`${selected.value} = ${d} × ${e}`}
              isWide
              {...does(factorTree.actions.split, { node: selected.id, factor: d }, d)}
            />
          ))}
        </div>
      )}
      <div class="pr-tree-foot">
        {s.splits.length > 0 && (
          <>
            <BagTowers
              bag={s.bag}
              label={`Primes so far: ${s.bagText}`}
              {...shows("primes", s.bag, `primes so far: ${s.bagText}`)}
            />
            <p
              class={`pr-equation${s.isComplete ? " is-done" : ""}`}
              {...shows(
                "equation",
                s.isComplete ? s.bagText : ends.map((n) => n.value),
                `${s.number} = ${s.isComplete ? s.bagText : ends.map((n) => n.value).join(" × ")}`,
              )}
            >
              {s.number} = {s.isComplete ? s.bagText : ends.map((n) => n.value).join(" × ")}
            </p>
          </>
        )}
        <SymbolButton
          symbol="↺"
          label="Start the tree again"
          isEnabled={s.splits.length > 0}
          {...does(factorTree.actions.startAgain)}
        />
      </div>
    </div>
  );
}
