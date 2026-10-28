import type { BoardRuntime } from "@chalk/player";
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { ZodFirstPartyTypeKind as Kind, type ZodTypeAny } from "zod";

/**
 * Beside a prop on its own page: what a lesson controls on a board, for the person to set. Its
 * fields (the settings a board gives it, and its inputs, which a board's rules feed) and a button
 * per action, each with its arguments. Built from what the prop declares, its state schema and each
 * action's argument schema, so nothing is written per prop. A field is set on the live prop, as a
 * rule would set it; Run does the action as a lesson would. The fields show the live values: drag
 * a point and its field follows.
 */
export function PropPanel({
  runtime,
  piece,
}: {
  runtime: BoardRuntime;
  piece: string;
}): JSX.Element {
  const def = runtime.getDef(piece);
  // Read through the runtime's signals: the panel draws again whenever the prop changes.
  const stored = runtime.getStored(piece);
  const [problem, setProblem] = useState<string | undefined>(undefined);
  const shape = shapeOf(def.state as ZodTypeAny);
  const inputs = new Set(def.inputs ?? []);
  const setField = (name: string, value: unknown) => {
    const next = { ...stored, [name]: value };
    const errors = runtime.checkFacts(piece, next);
    if (errors.length > 0) {
      setProblem(errors.join("; "));
      return;
    }
    setProblem(undefined);
    runtime.restoreFacts(new Map([[piece, next]]));
  };
  const fields = (which: (name: string) => boolean) =>
    Object.entries(shape)
      .filter(([name]) => which(name))
      .map(([name, schema]) => (
        <Field
          key={name}
          label={name}
          schema={schema}
          value={stored[name]}
          onChange={(v) => setField(name, v)}
        />
      ));
  const actions = Object.entries(def.actions);
  return (
    <aside class="prop-panel" aria-label={`${def.type}: what a lesson controls`}>
      {problem !== undefined && <p class="prop-panel-problem">{problem}</p>}
      {inputs.size > 0 && (
        <section>
          <h3>Inputs</h3>
          <p class="prop-panel-note">A board's rules feed these.</p>
          {fields((n) => inputs.has(n))}
        </section>
      )}
      <section>
        <h3>Fields</h3>
        <p class="prop-panel-note">What a board starts it from; what its actions change.</p>
        {fields((n) => !inputs.has(n))}
      </section>
      {actions.length > 0 && (
        <section>
          <h3>Actions</h3>
          <p class="prop-panel-note">As a lesson would call them.</p>
          {actions.map(([name, spec]) => (
            <ActionRow
              key={name}
              name={name}
              describe={spec.describe}
              args={spec.args as ZodTypeAny}
              onRun={(args) => {
                const checked = (spec.args as ZodTypeAny).safeParse(args);
                if (!checked.success) {
                  setProblem(`${name}: ${issues(checked.error.issues)}`);
                  return;
                }
                setProblem(undefined);
                runtime
                  .call(piece, name, checked.data)
                  .catch((e: unknown) => setProblem(e instanceof Error ? e.message : String(e)));
              }}
            />
          ))}
        </section>
      )}
    </aside>
  );
}

function ActionRow({
  name,
  describe,
  args,
  onRun,
}: {
  name: string;
  describe: string;
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
      {hasArgs && <Field label="" schema={args} value={value} onChange={setValue} />}
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
            // biome-ignore lint/suspicious/noArrayIndexKey: an item's place is all it has
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
              // biome-ignore lint/suspicious/noArrayIndexKey: a tuple's places are fixed
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
              // biome-ignore lint/suspicious/noArrayIndexKey: options are known by their place
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
