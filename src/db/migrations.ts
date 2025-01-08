import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import "dotenv/config";

const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(migrationClient);

async function runMigrations() {
  try {
    console.log("Running migrations...");
    
    await migrate(db, {
      migrationsFolder: "./drizzle",
    });
    
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

export { runMigrations }; 