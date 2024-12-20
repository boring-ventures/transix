import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from '../src/db/schema';

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });
  
  const introspectedTypes = await db.introspect();
  
  writeFileSync(
    resolve(__dirname, '../src/db/types.generated.ts'),
    introspectedTypes.typescript
  );
  
  await client.end();
}

main().catch(console.error); 