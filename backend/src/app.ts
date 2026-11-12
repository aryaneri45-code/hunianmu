import Fastify from 'fastify';
import view from '@fastify/view';
import nunjucks from 'nunjucks';
import formbody from '@fastify/formbody';
import staticFiles from '@fastify/static';
import session from '@fastify/secure-session';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import { authRoutes } from './modules/auth/auth.js';
import { adminRoutes } from './modules/admin/routes.js';
import { publicRoutes } from './modules/public/routes.js';
import { leadsRoutes } from './modules/leads/routes.js';
import { seoRoutes } from './modules/seo/routes.js';
import { money,period,availability,propertyPath } from './modules/settings/service.js';
export async function buildApp({logger=true}:{logger?:boolean}={}){
 const app=Fastify({logger:logger?{redact:['req.headers.cookie','req.headers.authorization','body.password','body.whatsapp'],serializers:{req(req){return {method:req.method,url:req.url?.split('?')[0],hostname:req.hostname,remoteAddress:req.ip};}}}:false,trustProxy:env.TRUST_PROXY==='true',bodyLimit:256*1024});
 await app.register(helmet,{contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'"],imgSrc:["'self'",'data:'],fontSrc:["'self'"],connectSrc:["'self'"],frameSrc:["'none'"],formAction:["'self'"],upgradeInsecureRequests:env.NODE_ENV==='production'?[]:null}},hsts:env.NODE_ENV==='production'?{maxAge:31536000,includeSubDomains:true}:false});
 await app.register(rateLimit,{max:300,timeWindow:'1 minute'});
 await app.register(session,{key:Buffer.from(env.SESSION_KEY,'hex'),cookieName:'hm_session',expiry:8*3600,cookie:{path:'/',httpOnly:true,sameSite:'lax',secure:env.NODE_ENV==='production',maxAge:8*3600}});
 await app.register(formbody);await app.register(multipart,{limits:{files:15,fileSize:8*1024*1024,parts:20,fields:5}});
 const configure=(engine:nunjucks.Environment)=>{
 engine.addFilter('money',money);engine.addFilter('period',period);engine.addFilter('availability',availability);engine.addFilter('propertyPath',propertyPath);
 engine.addFilter('datetime',(v:string)=>new Date(v).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',dateStyle:'medium',timeStyle:'short'}));
 engine.addFilter('date',(v:string)=>new Date(v).toLocaleDateString('id-ID',{timeZone:'Asia/Jakarta'}));
 engine.addFilter('lines',(v:string)=>(v||'').replaceAll('\\n','\n').split('\n').filter(Boolean));
 engine.addFilter('jsonld',(v:unknown)=>new nunjucks.runtime.SafeString(JSON.stringify(v).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026')));
 };
 await app.register(view,{engine:{nunjucks},root:path.resolve('frontend/views'),options:{onConfigure:configure,autoescape:true,noCache:env.NODE_ENV!=='production'}});
 await mkdir(path.resolve(env.UPLOAD_DIR),{recursive:true});
 await app.register(staticFiles,{root:path.resolve('frontend/public'),prefix:'/static/',maxAge:'1d'});
 await app.register(staticFiles,{root:path.resolve(env.UPLOAD_DIR),prefix:'/uploads/',decorateReply:false,maxAge:'30d',allowedPath:pathname=>/\.(?:webp)$/.test(pathname)});
 app.addHook('onRequest',async(req,reply)=>{if(req.url.startsWith('/admin')||req.url.startsWith('/api/admin')||req.url.startsWith('/whatsapp'))reply.header('X-Robots-Tag','noindex, nofollow').header('Cache-Control','no-store');});
 await authRoutes(app);await adminRoutes(app);await publicRoutes(app);await leadsRoutes(app);await seoRoutes(app);
 app.setErrorHandler(async(err,req,reply)=>{
  const e=err as Error & {statusCode?:number;code?:string};let status=e.statusCode||500;let message='Terjadi kesalahan. Silakan coba kembali.';let fields:Record<string,string>={};
  if(e instanceof ZodError){status=400;message='Periksa kembali isian formulir.';fields=Object.fromEntries(e.issues.map(i=>[i.path.join('.'),i.message]));}
  else if(e.code==='23505'){status=409;message='Kode atau slug sudah digunakan. Pilih nilai lain.';}
  else if(e.code==='23503'){status=400;message='Data terkait tidak valid atau masih digunakan listing/pengajuan.';}
  else if(status<500)message=e.message;
  if(status>=500)req.log.error({err:e},'Request failed');
  if(req.url.startsWith('/api/')||req.headers.accept?.includes('application/json'))return reply.code(status).send({error:message,fields});
  return reply.code(status).viewAsync('public/error.njk',{title:'Permintaan gagal',message,fields,adminPage:req.url.startsWith('/admin')});
 });
 app.setNotFoundHandler(async(req,reply)=>req.url.startsWith('/api/')?reply.code(404).send({error:'Tidak ditemukan'}):reply.code(404).viewAsync('public/error.njk',{title:'Halaman tidak ditemukan',message:'Alamat ini belum tersedia. Kembali ke katalog untuk mencari properti.'}));
 return app;
}
