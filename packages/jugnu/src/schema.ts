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
