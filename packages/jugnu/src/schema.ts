import { z } from "zod";

/**
 * A prop action's argument schema (zod) as JSON Schema, for a model's tool definitions. Covers the
 * shapes props use; anything else becomes an open value.
 */
export function jsonSchemaOf(schema: z.ZodTypeAny | z.ZodType): Record<string, unknown> {
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault)
    return jsonSchemaOf(schema instanceof z.ZodOptional ? schema.unwrap() : schema.removeDefault());
  if (schema instanceof z.ZodNullable)
    return { anyOf: [jsonSchemaOf(schema.unwrap()), { type: "null" }] };
  if (schema instanceof z.ZodEffects) return jsonSchemaOf(schema.innerType());
  if (schema instanceof z.ZodNumber) {
    const out: Record<string, unknown> = { type: schema.isInt ? "integer" : "number" };
    for (const check of schema._def.checks) {
      if (check.kind === "min") out[check.inclusive ? "minimum" : "exclusiveMinimum"] = check.value;
      if (check.kind === "max") out[check.inclusive ? "maximum" : "exclusiveMaximum"] = check.value;
    }
    return out;
  }
  if (schema instanceof z.ZodString) return { type: "string" };
  if (schema instanceof z.ZodBoolean) return { type: "boolean" };
  if (schema instanceof z.ZodLiteral) return { const: schema.value };
  if (schema instanceof z.ZodEnum) return { type: "string", enum: schema.options };
  if (schema instanceof z.ZodNativeEnum) return { enum: Object.values(schema.enum as object) };
  if (schema instanceof z.ZodArray) return { type: "array", items: jsonSchemaOf(schema.element) };
  if (schema instanceof z.ZodUnion || schema instanceof z.ZodDiscriminatedUnion)
    return { anyOf: (schema.options as z.ZodTypeAny[]).map(jsonSchemaOf) };
  if (schema instanceof z.ZodRecord)
    return { type: "object", additionalProperties: jsonSchemaOf(schema.valueSchema) };
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const required = Object.entries(shape)
      .filter(([, value]) => !(value instanceof z.ZodOptional || value instanceof z.ZodDefault))
      .map(([key]) => key);
    return {
      type: "object",
      properties: Object.fromEntries(Object.entries(shape).map(([k, v]) => [k, jsonSchemaOf(v)])),
      ...(required.length > 0 ? { required } : {}),
      additionalProperties: false,
    };
  }
  return {};
}

/**
 * A prop action's argument schema in the subset strict tool calling takes (OpenAI's structured
 * outputs, as Microsoft Foundry serves it): every field required (an optional one becomes "or
 * null"), no additional properties, no bounds. The model then can't write arguments of the wrong
 * shape; bounds are still checked by the prop. Undefined if the schema can't be put that way.
 */
export function strictSchemaOf(schema: z.ZodTypeAny): Record<string, unknown> | undefined {
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault) {
    const inner = strictSchemaOf(
      schema instanceof z.ZodOptional ? schema.unwrap() : schema.removeDefault(),
    );
    return inner === undefined ? undefined : { anyOf: [inner, { type: "null" }] };
  }
  if (schema instanceof z.ZodNullable) {
    const inner = strictSchemaOf(schema.unwrap());
    return inner === undefined ? undefined : { anyOf: [inner, { type: "null" }] };
  }
  if (schema instanceof z.ZodEffects) return strictSchemaOf(schema.innerType());
  if (schema instanceof z.ZodNumber) return { type: schema.isInt ? "integer" : "number" };
  if (schema instanceof z.ZodString) return { type: "string" };
  if (schema instanceof z.ZodBoolean) return { type: "boolean" };
  if (schema instanceof z.ZodLiteral) {
    const value: unknown = schema.value;
    const type =
      typeof value === "string"
        ? "string"
        : typeof value === "boolean"
          ? "boolean"
          : Number.isInteger(value)
            ? "integer"
            : "number";
    return { type, enum: [value] };
  }
  if (schema instanceof z.ZodEnum) return { type: "string", enum: schema.options };
  if (schema instanceof z.ZodNativeEnum) {
    const values = Object.values(schema.enum as object);
    return values.every((v) => typeof v === "string")
      ? { type: "string", enum: values }
      : undefined;
  }
  if (schema instanceof z.ZodArray) {
    const items = strictSchemaOf(schema.element);
    return items === undefined ? undefined : { type: "array", items };
  }
  if (schema instanceof z.ZodUnion || schema instanceof z.ZodDiscriminatedUnion) {
    const options = (schema.options as z.ZodTypeAny[]).map(strictSchemaOf);
    return options.some((o) => o === undefined) ? undefined : { anyOf: options };
  }
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const properties: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(shape)) {
      const field = strictSchemaOf(value);
      if (field === undefined) return undefined;
      properties[key] = field;
    }
    return {
      type: "object",
      properties,
      required: Object.keys(shape),
      additionalProperties: false,
    };
  }
  // Records and anything else have no strict form.
  return undefined;
}

/**
 * Arguments written to a strict schema, back as the prop expects them: an optional field the model
 * set to null is left out.
 */
export function fromStrict(schema: z.ZodTypeAny, value: unknown): unknown {
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault) {
    if (value === null) return undefined;
    return fromStrict(
      schema instanceof z.ZodOptional ? schema.unwrap() : schema.removeDefault(),
      value,
    );
  }
  if (schema instanceof z.ZodNullable)
    return value === null ? null : fromStrict(schema.unwrap(), value);
  if (schema instanceof z.ZodEffects) return fromStrict(schema.innerType(), value);
  if (schema instanceof z.ZodArray && Array.isArray(value))
    return value.map((item) => fromStrict(schema.element, item));
  if (schema instanceof z.ZodObject && value !== null && typeof value === "object") {
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      const field = shape[key];
      const converted = field === undefined ? item : fromStrict(field, item);
      if (converted !== undefined) out[key] = converted;
    }
    return out;
  }
  return value;
}

/** How many object properties a schema has in all, and how deep its objects nest. */
export function schemaSize(schema: unknown): { properties: number; depth: number } {
  if (Array.isArray(schema))
    return schema
      .map(schemaSize)
      .reduce(
        (a, b) => ({ properties: a.properties + b.properties, depth: Math.max(a.depth, b.depth) }),
        { properties: 0, depth: 0 },
      );
  if (schema === null || typeof schema !== "object") return { properties: 0, depth: 0 };
  const node = schema as Record<string, unknown>;
  let properties = 0;
  let depth = 0;
  if (node.properties !== null && typeof node.properties === "object") {
    const fields = Object.values(node.properties as Record<string, unknown>);
    properties += fields.length;
    const inner = schemaSize(fields);
    properties += inner.properties;
    depth = Math.max(depth, inner.depth + 1);
  }
  for (const key of ["items", "anyOf"]) {
    const inner = schemaSize(node[key]);
    properties += inner.properties;
    depth = Math.max(depth, inner.depth);
  }
  return { properties, depth };
}
