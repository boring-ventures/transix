import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  },
  tablesFilter: ["!_*", "*"],
  schemaFilter: ["public"],
});
