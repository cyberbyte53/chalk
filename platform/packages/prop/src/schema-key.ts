import { type ZodTypeAny, z } from "zod";

/**
 * A prop's stored facts as a saved record names them: `type@hash`, the hash of the shape its schema
 * accepts (fields, their kinds, enum values, what may be null or left out). Facts saved under one
 * key are read back only by a prop with the same key; a prop whose schema changed refuses them
 * loudly rather than read them wrong. Descriptions and refinements don't change the key.
 */
export function schemaKey(type: string, schema: ZodTypeAny): string {
  return `${type}@${fnv(shapeOf(schema))}`;
}

/** The shape a schema accepts, as canonical text. */
export function shapeOf(schema: ZodTypeAny): string {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, ZodTypeAny>;
    const keys = Object.keys(shape).sort();
    return `{${keys.map((k) => `${k}:${shapeOf(shape[k] as ZodTypeAny)}`).join(",")}}`;
  }
  if (schema instanceof z.ZodOptional) return `${shapeOf(schema.unwrap())}?`;
  if (schema instanceof z.ZodNullable) return `${shapeOf(schema.unwrap())}|null`;
  if (schema instanceof z.ZodDefault) return shapeOf(schema.removeDefault());
  if (schema instanceof z.ZodEffects) return shapeOf(schema.innerType());
  if (schema instanceof z.ZodBranded) return shapeOf(schema.unwrap());
  if (schema instanceof z.ZodReadonly) return shapeOf(schema.unwrap());
  if (schema instanceof z.ZodLazy) return shapeOf(schema.schema);
  if (schema instanceof z.ZodArray) return `${shapeOf(schema.element)}[]`;
  if (schema instanceof z.ZodTuple)
    return `[${(schema.items as ZodTypeAny[]).map(shapeOf).join(",")}]`;
  if (schema instanceof z.ZodRecord) return `record<${shapeOf(schema.valueSchema)}>`;
  if (schema instanceof z.ZodUnion || schema instanceof z.ZodDiscriminatedUnion)
    return `(${(schema.options as ZodTypeAny[]).map(shapeOf).sort().join("|")})`;
  if (schema instanceof z.ZodEnum) return `enum(${[...schema.options].sort().join(",")})`;
  if (schema instanceof z.ZodNativeEnum)
    return `enum(${Object.values(schema.enum as Record<string, unknown>)
      .map(String)
      .sort()
      .join(",")})`;
  if (schema instanceof z.ZodLiteral) return `=${JSON.stringify(schema.value)}`;
  if (schema instanceof z.ZodNumber) return "number";
  if (schema instanceof z.ZodString) return "string";
  if (schema instanceof z.ZodBoolean) return "boolean";
  if (schema instanceof z.ZodNull) return "null";
  if (schema instanceof z.ZodUnknown || schema instanceof z.ZodAny) return "unknown";
  throw new Error(`schemaKey: no shape for ${schema.constructor.name}`);
}

/** 8 hex characters of FNV-1a (the same on the phone and in Node, no crypto needed). */
function fnv(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}
