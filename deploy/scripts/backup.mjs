import 'dotenv/config';
import { spawn } from 'node:child_process';
import { mkdir,readdir,stat,unlink,chmod } from 'node:fs/promises';
import path from 'node:path';
export function pgEnv(connectionString){const u=new URL(connectionString);return {...process.env,PGHOST:u.hostname,PGPORT:u.port||'5432',PGUSER:decodeURIComponent(u.username),PGPASSWORD:decodeURIComponent(u.password),PGDATABASE:u.pathname.slice(1),PGSSLMODE:u.searchParams.get('sslmode')||'prefer'};}
export function run(command,args,env=process.env){return new Promise((resolve,reject)=>{const child=spawn(command,args,{env,stdio:'inherit'});child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error(`${command} gagal (${code})`)));});}
if(process.argv[1]===new URL(import.meta.url).pathname){
 if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL wajib diisi');
 const folder=path.resolve(process.env.BACKUP_DIR||'storage/backups');await mkdir(folder,{recursive:true,mode:0o700});
 const stamp=new Date().toISOString().replace(/[:.]/g,'-'),db=path.join(folder,`hunianmu-${stamp}.dump`),media=path.join(folder,`hunianmu-${stamp}-uploads.tar.gz`);
 await run('pg_dump',['--format=custom','--no-owner','--no-acl','--file',db],pgEnv(process.env.DATABASE_URL));await chmod(db,0o600);
 await run('tar',['-czf',media,'-C',path.resolve(process.env.UPLOAD_DIR||'storage/uploads'),'.']);await chmod(media,0o600);
 const retention=Number(process.env.BACKUP_RETENTION_DAYS||14);
 for(const file of await readdir(folder)){if(!/^hunianmu-.*\.(dump|tar\.gz)$/.test(file))continue;const full=path.join(folder,file);if(Date.now()-(await stat(full)).mtimeMs>retention*86400000)await unlink(full);}
 console.log(`Backup database dan media selesai: ${folder}`);
}
