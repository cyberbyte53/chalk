import { Actor } from "@chalk/content";
import type { LiveBoard } from "@chalk/player";
import type { AnyProp } from "@chalk/prop";
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { ZodFirstPartyTypeKind as Kind, type ZodTypeAny } from "zod";

/** A prop and its parts, each by its path inside it ("" the prop, "walker" a part). */
type Node = { path: string; def: AnyProp };
function nodesOf(def: AnyProp, path = ""): Node[] {
  return [
    { path, def },
    ...Object.entries(def.children ?? {}).flatMap(([name, child]) =>
      nodesOf(child, path === "" ? name : `${path}.${name}`),
    ),
  ];
}

/** A prop's variables by name: none when it has none. */
const variablesOf = (def: AnyProp): Record<string, ZodTypeAny> =>
  def.variables === undefined ? {} : shapeOf(def.variables as ZodTypeAny);

/** What the view reads at a path inside the prop ("walker": its walker's). */
const at = (view: Readonly<Record<string, unknown>>, path: string): Record<string, unknown> =>
  (path === ""
    ? view
    : path
        .split(".")
        .reduce<unknown>((v, k) => (v as Record<string, unknown>)?.[k], view)) as Record<
    string,
    unknown
  >;

/** Its variables now, part by part, as a board would give them: `{ x, walker: { at } }`. */
function variablesNow(
  def: AnyProp,
  view: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const name of Object.keys(variablesOf(def))) out[name] = view[name];
  for (const [name, child] of Object.entries(def.children ?? {}))
    out[name] = variablesNow(child, (view[name] ?? {}) as Record<string, unknown>);
  return out;
}

/** What differs from its start, part by part: what a board would have to give it. */
function givenOf(def: AnyProp, now: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const start = (def.start ?? {}) as Record<string, unknown>;
  for (const name of Object.keys(variablesOf(def)))
    if (JSON.stringify(now[name]) !== JSON.stringify(start[name])) out[name] = now[name];
  for (const [name, child] of Object.entries(def.children ?? {})) {
    const inner = givenOf(child, (now[name] ?? {}) as Record<string, unknown>);
    if (Object.keys(inner).length > 0) out[name] = inner;
  }
  return out;
}

/** `now` with one variable, at a path ("walker.at"), set to `value`. */
function withValue(
  now: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const [head = "", ...rest] = path.split(".");
  if (rest.length === 0) return { ...now, [head]: value };
  return {
    ...now,
    [head]: withValue((now[head] ?? {}) as Record<string, unknown>, rest.join("."), value),
  };
}

/**
 * Beside a prop on its own page: what a lesson controls on a board, for the person to set. Its
 * variables and each part's (what a board starts it from), and a button per action, the parts'
 * too, each with its arguments. Built from what the prop declares, so nothing is written per prop.
 * A prop's variables change only by its own rules: setting one starts the prop again from now with
 * that change (`onStart`, with what differs from its start, as a board would give it). Run does an
 * action as a lesson would. The fields show the live values: drag a point and its field follows.
 */
export function PropPanel({
  runtime,
  piece,
  onStart,
}: {
  runtime: LiveBoard;
  piece: string;
  /** Start the prop again from these fields (what differs from its start, part by part). */
  onStart: (given: Record<string, unknown>) => void;
}): JSX.Element {
  const def = runtime.getDef(piece);
  // Read through the runtime's signals: the panel draws again whenever the prop changes.
  const view = runtime.getView(piece) as Readonly<Record<string, unknown>>;
  const [problem, setProblem] = useState<string | undefined>(undefined);
  const nodes = nodesOf(def);
  const setField = (path: string, schema: ZodTypeAny, value: unknown) => {
    const checked = schema.safeParse(value);
    if (!checked.success) {
      setProblem(`${path}: ${issues(checked.error.issues)}`);
      return;
    }
    setProblem(undefined);
    onStart(givenOf(def, withValue(variablesNow(def, view), path, checked.data)));
  };
  const run = (path: string, schema: ZodTypeAny, args: unknown) => {
    const checked = schema.safeParse(args);
    if (!checked.success) {
      setProblem(`${path}: ${issues(checked.error.issues)}`);
      return;
    }
    setProblem(undefined);
    runtime
      .call(piece, path, checked.data, Actor.Lesson)
      .catch((e: unknown) => setProblem(e instanceof Error ? e.message : String(e)));
  };
  const named = (path: string, name: string) => (path === "" ? name : `${path}.${name}`);
  return (
    <aside class="prop-panel" aria-label={`${def.type}: what a lesson controls`}>
      {problem !== undefined && <p class="prop-panel-problem">{problem}</p>}
      <section class="prop-panel-contract">
        <h3>
          {def.type} · {def.role}
        </h3>
        <p>{def.describe}</p>
      </section>
      <section>
        <h3>Fields</h3>
        <p class="prop-panel-note">
          What a board starts it from. Setting one starts it again from now, with that change.
        </p>
        {nodes.flatMap(({ path, def: d }) =>
          Object.entries(variablesOf(d)).map(([name, schema]) => (
            <Field
              key={named(path, name)}
              label={named(path, name)}
              schema={schema}
              value={at(view, path)?.[name]}
              onChange={(v) => setField(named(path, name), schema, v)}
            />
          )),
        )}
      </section>
      <section>
        <h3>Actions</h3>
        <p class="prop-panel-note">As a lesson would call them.</p>
        {nodes.flatMap(({ path, def: d }) =>
          Object.entries(d.actions ?? {}).map(([name, spec]) => (
            <ActionRow
              key={named(path, name)}
              name={named(path, name)}
              describe={spec.describe ?? ""}
              isLearners={spec.isFromScreen}
              args={spec.payload as ZodTypeAny}
              onRun={(args) => run(named(path, name), spec.payload as ZodTypeAny, args)}
            />
          )),
        )}
      </section>
      {nodes.some(({ def: d }) => Object.keys(d.signals ?? {}).length > 0) && (
        <section>
          <h3>Signals</h3>
          <p class="prop-panel-note">What it tells, for a lesson to hear.</p>
          {nodes.flatMap(({ path, def: d }) =>
            Object.keys(d.signals ?? {}).map((name) => (
              <p key={named(path, name)} class="prop-panel-term">
                <code>{named(path, name)}</code>
              </p>
            )),
          )}
        </section>
      )}
    </aside>
  );
}

function ActionRow({
  name,
  describe,
  isLearners,
  args,
  onRun,
}: {
  name: string;
  describe: string;
  /** The student's finger does it (through the prop's view). */
  isLearners: boolean;
  args: ZodTypeAny;
  onRun: (args: unknown) => void;
}): JSX.Element {
  const [value, setValue] = useState<unknown>(() => blank(args));
  const shape = shapeOf(args);
  const hasArgs = Object.keys(shape).length > 0 || kindOf(args) !== Kind.ZodObject;
  return (
    <div class="prop-panel-action">
      <button type="button" title={describe} onClick={() => onRun(value)}>
        {name}
      </button>
      {isLearners && <span class="prop-panel-tag">learner</span>}
      {hasArgs && <Field label="" schema={args} value={value} onChange={setValue} />}
      <p class="prop-panel-describe">{describe}</p>
    </div>
  );
}

// ---- One control per schema type, recursively ----

type FieldProps = {
  label: string;
  schema: ZodTypeAny;
  value: unknown;
  onChange: (value: unknown) => void;
};

/** The control for a value of this schema: the same rules all the way down. */
function Field({ label, schema, value, onChange }: FieldProps): JSX.Element {
  const hint = schema.description;
  const inner = unwrapped(schema);
  const control = controlFor(inner, value, onChange);
  return (
    <div class={`prop-panel-field kind-${kindOf(inner).replace(/^Zod/, "").toLowerCase()}`}>
      {label !== "" && (
        <span class="prop-panel-label" title={hint}>
          {label}
        </span>
      )}
      {control}
    </div>
  );
}

function controlFor(
  schema: ZodTypeAny,
  value: unknown,
  onChange: (value: unknown) => void,
): JSX.Element {
  const def = schema._def as Record<string, unknown>;
  switch (kindOf(schema)) {
    case Kind.ZodNullable: {
      const inner = def.innerType as ZodTypeAny;
      const isNone = value === null || value === undefined;
      return (
        <span class="prop-panel-nullable">
          <input
            type="checkbox"
            checked={!isNone}
            title="has a value"
            onChange={(e) => onChange(e.currentTarget.checked ? blank(inner) : null)}
          />
          {isNone ? (
            <em>none</em>
          ) : (
            <Field label="" schema={inner} value={value} onChange={onChange} />
          )}
        </span>
      );
    }
    case Kind.ZodBoolean:
      return (
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.currentTarget.checked)}
        />
      );
    case Kind.ZodNumber: {
      const { min, max, isInt } = boundsOf(schema);
      const n = typeof value === "number" ? value : 0;
      const number = (
        <input
          type="number"
          value={n}
          step={isInt ? 1 : "any"}
          {...(min !== undefined ? { min } : {})}
          {...(max !== undefined ? { max } : {})}
          onChange={(e) => onChange(Number(e.currentTarget.value))}
        />
      );
      if (min === undefined || max === undefined) return number;
      return (
        <span class="prop-panel-range">
          <input
            type="range"
            value={n}
            min={min}
            max={max}
            step={isInt ? 1 : (max - min) / 100}
            onInput={(e) => onChange(Number(e.currentTarget.value))}
          />
          {number}
        </span>
      );
    }
    case Kind.ZodString:
      return (
        <input
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      );
    case Kind.ZodEnum:
    case Kind.ZodNativeEnum: {
      const options = optionsOf(schema);
      return (
        <select
          value={String(value)}
          onChange={(e) =>
            onChange(
              options.find((o) => String(o) === e.currentTarget.value) ?? e.currentTarget.value,
            )
          }
        >
          {options.map((o) => (
            <option key={String(o)} value={String(o)}>
              {String(o)}
            </option>
          ))}
        </select>
      );
    }
    case Kind.ZodLiteral:
      return <code>{JSON.stringify(def.value)}</code>;
    case Kind.ZodObject: {
      const shape = shapeOf(schema);
      const now = (value ?? {}) as Record<string, unknown>;
      return (
        <span class="prop-panel-object">
          {Object.entries(shape).map(([key, s]) => (
            <Field
              key={key}
              label={key}
              schema={s}
              value={now[key]}
              onChange={(v) => onChange({ ...now, [key]: v })}
            />
          ))}
        </span>
      );
    }
    case Kind.ZodArray: {
      const item = def.type as ZodTypeAny;
      const list = Array.isArray(value) ? value : [];
      return (
        <span class="prop-panel-list">
          {list.map((v, i) => (
            <span key={i} class="prop-panel-item">
              <Field
                label={String(i + 1)}
                schema={item}
                value={v}
                onChange={(next) => onChange(list.map((x, j) => (j === i ? next : x)))}
              />
              <button
                type="button"
                title="remove"
                onClick={() => onChange(list.filter((_, j) => j !== i))}
              >
                −
              </button>
            </span>
          ))}
          <button type="button" onClick={() => onChange([...list, blank(item)])}>
            + add
          </button>
        </span>
      );
    }
    case Kind.ZodTuple: {
      const items = def.items as ZodTypeAny[];
      const list = Array.isArray(value) ? value : items.map(blank);
      return (
        <span class="prop-panel-object">
          {items.map((s, i) => (
            <Field
              key={i}
              label={String(i + 1)}
              schema={s}
              value={list[i]}
              onChange={(next) => onChange(list.map((x, j) => (j === i ? next : x)))}
            />
          ))}
        </span>
      );
    }
    case Kind.ZodRecord: {
      const item = def.valueType as ZodTypeAny;
      const now = (value ?? {}) as Record<string, unknown>;
      return (
        <span class="prop-panel-list">
          {Object.entries(now).map(([key, v]) => (
            <span key={key} class="prop-panel-item">
              <Field
                label={key}
                schema={item}
                value={v}
                onChange={(next) => onChange({ ...now, [key]: next })}
              />
              <button
                type="button"
                title="remove"
                onClick={() =>
                  onChange(Object.fromEntries(Object.entries(now).filter(([k]) => k !== key)))
                }
              >
                −
              </button>
            </span>
          ))}
          <AddKey onAdd={(key) => onChange({ ...now, [key]: blank(item) })} />
        </span>
      );
    }
    case Kind.ZodUnion:
    case Kind.ZodDiscriminatedUnion: {
      const options = def.options as ZodTypeAny[];
      const at = Math.max(
        0,
        options.findIndex((o) => o.safeParse(value).success),
      );
      const chosen = options[at] as ZodTypeAny;
      return (
        <span class="prop-panel-union">
          <select
            value={String(at)}
            onChange={(e) => onChange(blank(options[Number(e.currentTarget.value)] as ZodTypeAny))}
          >
            {options.map((o, i) => (
              <option key={i} value={String(i)}>
                {optionWords(o, i)}
              </option>
            ))}
          </select>
          {kindOf(unwrapped(chosen)) !== Kind.ZodLiteral && (
            <Field label="" schema={chosen} value={value} onChange={onChange} />
          )}
        </span>
      );
    }
    default:
      // Any value at all (z.unknown, z.any): written as JSON, since it can be anything.
      return (
        <textarea
          value={JSON.stringify(value ?? null)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.currentTarget.value));
            } catch {
              // Not JSON yet: the field keeps what it had.
            }
          }}
        />
      );
  }
}

/** A new key for a record, typed in place. */
function AddKey({ onAdd }: { onAdd: (key: string) => void }): JSX.Element {
  const [key, setKey] = useState("");
  return (
    <span class="prop-panel-item">
      <input
        type="text"
        placeholder="key"
        value={key}
        onInput={(e) => setKey(e.currentTarget.value)}
      />
      <button
        type="button"
        disabled={key === ""}
        onClick={() => {
          onAdd(key);
          setKey("");
        }}
      >
        + add
      </button>
    </span>
  );
}

// ---- Reading schemas ----

const kindOf = (schema: ZodTypeAny): string => (schema._def as { typeName: string }).typeName;

/** The schema under wrappers that don't change what a value looks like. */
function unwrapped(schema: ZodTypeAny): ZodTypeAny {
  const def = schema._def as Record<string, unknown>;
  switch (kindOf(schema)) {
    case Kind.ZodOptional:
    case Kind.ZodDefault:
    case Kind.ZodReadonly:
      return unwrapped(def.innerType as ZodTypeAny);
    case Kind.ZodEffects:
      return unwrapped(def.schema as ZodTypeAny);
    case Kind.ZodBranded:
      return unwrapped(def.type as ZodTypeAny);
    case Kind.ZodLazy:
      return unwrapped((def.getter as () => ZodTypeAny)());
    case Kind.ZodPipeline:
      return unwrapped(def.in as ZodTypeAny);
    default:
      return schema;
  }
}

/** An object schema's fields (none for anything else). */
function shapeOf(schema: ZodTypeAny): Record<string, ZodTypeAny> {
  const inner = unwrapped(schema);
  if (kindOf(inner) !== Kind.ZodObject) return {};
  return (inner._def as { shape: () => Record<string, ZodTypeAny> }).shape();
}

function boundsOf(schema: ZodTypeAny): { min?: number; max?: number; isInt: boolean } {
  const checks = (schema._def as { checks?: { kind: string; value?: number }[] }).checks ?? [];
  const out: { min?: number; max?: number; isInt: boolean } = { isInt: false };
  for (const c of checks) {
    if (c.kind === "min" && c.value !== undefined) out.min = c.value;
    if (c.kind === "max" && c.value !== undefined) out.max = c.value;
    if (c.kind === "int") out.isInt = true;
  }
  return out;
}

function optionsOf(schema: ZodTypeAny): unknown[] {
  const def = schema._def as { values: unknown };
  if (kindOf(schema) === Kind.ZodEnum) return [...(def.values as unknown[])];
  // A native enum's values (a numeric enum also maps names back from numbers: keep the values).
  const values = Object.values(def.values as Record<string, unknown>);
  const numbers = values.filter((v) => typeof v === "number");
  return numbers.length > 0 ? numbers : values;
}

function optionWords(option: ZodTypeAny, i: number): string {
  const inner = unwrapped(option);
  if (kindOf(inner) === Kind.ZodLiteral)
    return JSON.stringify((inner._def as { value: unknown }).value);
  if (option.description) return option.description;
  if (kindOf(inner) === Kind.ZodObject) {
    // A discriminated option is named by its literal field.
    for (const [key, s] of Object.entries(shapeOf(inner)))
      if (kindOf(unwrapped(s)) === Kind.ZodLiteral)
        return `${key}: ${JSON.stringify((unwrapped(s)._def as { value: unknown }).value)}`;
  }
  return `${kindOf(inner).replace(/^Zod/, "").toLowerCase()} ${i + 1}`;
}

/** A value of this schema to start from, when there is none yet (an item added, a field turned on). */
function blank(schema: ZodTypeAny): unknown {
  const def = schema._def as Record<string, unknown>;
  switch (kindOf(schema)) {
    case Kind.ZodDefault:
      return (def.defaultValue as () => unknown)();
    case Kind.ZodOptional:
    case Kind.ZodReadonly:
      return blank(def.innerType as ZodTypeAny);
    case Kind.ZodNullable:
      return null;
    case Kind.ZodEffects:
      return blank(def.schema as ZodTypeAny);
    case Kind.ZodBranded:
      return blank(def.type as ZodTypeAny);
    case Kind.ZodLazy:
      return blank((def.getter as () => ZodTypeAny)());
    case Kind.ZodPipeline:
      return blank(def.in as ZodTypeAny);
    case Kind.ZodBoolean:
      return false;
    case Kind.ZodNumber:
      return boundsOf(schema).min ?? 0;
    case Kind.ZodString:
      return "";
    case Kind.ZodEnum:
    case Kind.ZodNativeEnum:
      return optionsOf(schema)[0];
    case Kind.ZodLiteral:
      return def.value;
    case Kind.ZodObject:
      return Object.fromEntries(Object.entries(shapeOf(schema)).map(([k, s]) => [k, blank(s)]));
    case Kind.ZodArray:
      return [];
    case Kind.ZodTuple:
      return (def.items as ZodTypeAny[]).map(blank);
    case Kind.ZodRecord:
      return {};
    case Kind.ZodUnion:
      return blank((def.options as ZodTypeAny[])[0] as ZodTypeAny);
    case Kind.ZodDiscriminatedUnion:
      return blank((def.options as ZodTypeAny[])[0] as ZodTypeAny);
    default:
      return null;
  }
}

const issues = (list: readonly { path: (string | number)[]; message: string }[]) =>
  list.map((i) => `${i.path.join(".") || "args"}: ${i.message}`).join("; ");
