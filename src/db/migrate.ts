import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import "dotenv/config";

const runMigrations = async () => {
  const connection = postgres(process.env.DATABASE_URL!, { max: 1 });
  
  try {
    const db = drizzle(connection);
    
    console.log("Running migrations...");
    
    await migrate(db, {
      migrationsFolder: "./drizzle",
      migrationsSchema: "public", // Important: Use public schema for migrations
    });
    
    console.log("Migrations completed!");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  } finally {
    await connection.end();
  }
};

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
}); 