import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import argon2 from 'argon2';
import { z } from 'zod';
import { pool,query } from '../src/db/client.js';
const rl=createInterface({input:process.stdin,output:process.stdout});
try {
 const email=z.string().email().parse(process.env.ADMIN_EMAIL||await rl.question('Email admin: ')).toLowerCase();
 const name=z.string().min(2).parse(process.env.ADMIN_NAME||await rl.question('Nama admin: '));
 let password=process.env.ADMIN_PASSWORD;
 if(!password){
  if(process.stdin.isTTY){process.stdout.write('Kata sandi (minimal 12 karakter, input disembunyikan): ');rl.close();process.stdin.setRawMode(true);process.stdin.resume();password=await new Promise<string>(resolve=>{let value='';const onData=(chunk:Buffer)=>{const s=chunk.toString();if(s.includes('\u0003'))process.exit(1);if(/[\r\n]/.test(s)){process.stdin.off('data',onData);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');resolve(value);}else if(s==='\u007f'){value=value.slice(0,-1);}else value+=s;};process.stdin.on('data',onData);});}
  else throw new Error('Gunakan input terminal atau ADMIN_PASSWORD melalui environment');
 }
 z.string().min(12).max(512).parse(password);
 await query('INSERT INTO admins(name,email,password_hash) VALUES($1,$2,$3)',[name,email,await argon2.hash(password,{type:argon2.argon2id})]);console.log(`Admin dibuat: ${email}`);
}finally{rl.close();await pool.end();}
