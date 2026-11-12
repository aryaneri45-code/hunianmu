import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import argon2 from 'argon2';
import { z } from 'zod';
import { query } from '../../db/client.js';
declare module '@fastify/secure-session' { interface SessionData { csrf:string; sid:string; } }
export function csrfToken(req:FastifyRequest){let v=req.session.get('csrf');if(!v){v=randomBytes(32).toString('hex');req.session.set('csrf',v);}return v;}
export function checkCsrf(req:FastifyRequest){const value=req.headers['x-csrf-token']||(req.body as Record<string,unknown>|undefined)?._csrf;const expected=req.session.get('csrf');if(typeof value!=='string'||!expected||Buffer.byteLength(value)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(value),Buffer.from(expected)))throw Object.assign(new Error('Token CSRF tidak valid. Muat ulang halaman.'),{statusCode:403});}
export async function currentAdmin(req:FastifyRequest){const sid=req.session.get('sid');if(!sid)return null;return (await query('SELECT a.id,a.name,a.email FROM admin_sessions s JOIN admins a ON a.id=s.admin_id WHERE s.id=$1 AND s.expires_at>now()',[sid]))[0]||null;}
export async function requireAdmin(req:FastifyRequest,reply:FastifyReply){const admin=await currentAdmin(req);if(!admin){if(req.url.startsWith('/api/'))return reply.code(401).send({error:'Login admin diperlukan'});return reply.redirect('/admin/login');}if(!['GET','HEAD','OPTIONS'].includes(req.method))checkCsrf(req);}
export async function authRoutes(app:FastifyInstance){
 app.get('/admin/login',async(req,reply)=>reply.viewAsync('admin/login.njk',{csrf:csrfToken(req),title:'Login Admin',adminPage:true}));
 app.post('/api/admin/login',{config:{rateLimit:{max:5,timeWindow:'15 minutes'}}},async(req,reply)=>{
  checkCsrf(req);const b=z.object({email:z.string().email().max(254).transform(s=>s.toLowerCase()),password:z.string().min(1).max(512)}).parse(req.body);
  const a=(await query('SELECT * FROM admins WHERE email=$1',[b.email]))[0];
  const invalid=!a||a.locked_until&&new Date(a.locked_until)>new Date()||!await argon2.verify(a.password_hash,b.password);
  if(invalid){if(a)await query("UPDATE admins SET failed_attempts=failed_attempts+1,locked_until=CASE WHEN failed_attempts>=4 THEN now()+interval '15 minutes' ELSE locked_until END WHERE id=$1",[a.id]);return reply.code(401).viewAsync('admin/login.njk',{csrf:csrfToken(req),error:'Email atau kata sandi salah, atau akun dikunci sementara.',title:'Login Admin',adminPage:true});}
  await query('UPDATE admins SET failed_attempts=0,locked_until=NULL WHERE id=$1',[a.id]);
  const sid=randomBytes(32).toString('hex');await query("INSERT INTO admin_sessions(id,admin_id,expires_at) VALUES($1,$2,now()+interval '8 hours')",[sid,a.id]);
  req.session.regenerate();req.session.set('sid',sid);req.session.set('csrf',randomBytes(32).toString('hex'));return reply.redirect('/admin');
 });
 app.post('/api/admin/logout',{preHandler:requireAdmin},async(req,reply)=>{await query('DELETE FROM admin_sessions WHERE id=$1',[req.session.get('sid')]);req.session.delete();return reply.redirect('/admin/login');});
}
