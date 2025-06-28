import {type GeneratedAlways, Kysely} from 'kysely'
import {PostgresJSDialect} from 'kysely-postgres-js'
import {DB} from './schema'
import postgres from 'postgres'

// Check if we have a database URL, otherwise use mock
const databaseUrl = process.env.COMBINI_DATABASE_URL;

let db;

if (databaseUrl && databaseUrl !== 'postgresql://username:password@localhost:5432/gajaring') {
  // Use real database
  db = new Kysely<DB>({
    dialect: new PostgresJSDialect({
      postgres: postgres(databaseUrl, {
        prepare: false,
        idle_timeout: 10,
        max: 3,
      }),
    }),
  });
} else {
  // Use mock database for development
  console.warn('⚠️  Using mock database - set COMBINI_DATABASE_URL for real database');
  
  // Import mock database
  const { mockDb } = await import('../server/mockDatabase.js');
  db = mockDb;
}

export { db };