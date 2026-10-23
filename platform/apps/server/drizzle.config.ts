import { defineConfig } from "drizzle-kit";

/** For `drizzle-kit generate`: reads the schema, writes the next migration's SQL to drizzle/. */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
});
