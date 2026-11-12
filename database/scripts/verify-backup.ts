import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { readdir,writeFile,mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import pg from 'pg';
const database='hunianmu_restore_'+randomBytes(5).toString('hex');
const connection=process.env.DATABASE_URL!;const client=new pg.Client({connectionString:connection});await client.connect();
const run=(file:string,args:string[],extra:Record<string,string>={})=>new Promise<void>((resolve,reject)=>{const child=spawn(process.execPath,[file,...args],{env:{...process.env,...extra},stdio:'inherit'});child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error(`${file} gagal (${code})`)));});
await mkdir('artifacts',{recursive:true});
const backupDir=path.resolve('storage/backups');await run('deploy/scripts/backup.mjs',[],{BACKUP_DIR:backupDir});
const dump=(await readdir(backupDir)).filter(f=>f.endsWith('.dump')).sort().at(-1)!;
const before=(await client.query('SELECT count(*)::int AS count FROM properties')).rows[0].count;
await client.query(`CREATE DATABASE ${database}`);
try{
 const url=new URL(connection);url.pathname='/'+database;
 await run('deploy/scripts/restore.mjs',[path.join(backupDir,dump)],{RESTORE_DATABASE_URL:url.toString()});
 const restored=new pg.Client({connectionString:url.toString()});await restored.connect();
 const count=(await restored.query('SELECT count(*)::int AS count FROM properties')).rows[0].count;
 const migrations=(await restored.query('SELECT count(*)::int AS count FROM schema_migrations')).rows[0].count;await restored.end();
 if(before!==count||migrations<3)throw new Error('Hasil pemulihan tidak sama');
 await writeFile('artifacts/backup-results.json',JSON.stringify({passed:true,sourceProperties:before,restoredProperties:count,migrations,backup:dump,createdAt:new Date().toISOString()},null,2));
 console.log(`PASS backup/restore: ${count} listing, ${migrations} migrasi; database uji dihapus.`);
}finally{await client.query(`DROP DATABASE IF EXISTS ${database}`);await client.end();}
