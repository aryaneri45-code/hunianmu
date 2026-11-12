import 'dotenv/config';
import { pgEnv,run } from './backup.mjs';
const target=process.env.RESTORE_DATABASE_URL;
if(!target||!process.argv[2])throw new Error('Gunakan RESTORE_DATABASE_URL=<database kosong> node deploy/scripts/restore.mjs <file.dump>');
if(target===process.env.DATABASE_URL)throw new Error('Pulihkan ke database baru untuk verifikasi sebelum mengganti database aplikasi.');
await run('pg_restore',['--exit-on-error','--no-owner','--no-acl','--dbname',new URL(target).pathname.slice(1),process.argv[2]],pgEnv(target));
console.log('Pemulihan ke database tujuan selesai.');
