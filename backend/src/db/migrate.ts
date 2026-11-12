import { readdir, readFile } from 'node:fs/promises';
import { pool, transaction } from './client.js';
await transaction(async c=>{
 await c.query('SELECT pg_advisory_xact_lock(736241)');
 await c.query('CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY, applied_at timestamptz DEFAULT now())');
 for(const name of (await readdir('database/migrations')).filter(n=>n.endsWith('.sql')).sort()){
  if((await c.query('SELECT 1 FROM schema_migrations WHERE name=$1',[name])).rowCount)continue;
  await c.query(await readFile(`database/migrations/${name}`,'utf8'));await c.query('INSERT INTO schema_migrations(name) VALUES($1)',[name]);console.log(`Migrated ${name}`);
 }
}); await pool.end();
