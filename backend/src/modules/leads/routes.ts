import type { FastifyInstance, FastifyRequest } from 'fastify';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { query,transaction } from '../../db/client.js';
import { settings,propertyPath } from '../settings/service.js';
import { env } from '../../config/env.js';
import { safeUrl } from '../properties/schema.js';
const name=z.string().trim().min(2).max(150),phone=z.string().trim().regex(/^(?:\+?62|0)8[0-9]{7,13}$/,'Nomor WhatsApp Indonesia tidak valid');
const common={name,whatsapp:phone,website:z.string().max(0).optional(),page:z.string().max(2000).default(''),utm_source:z.string().max(300).default(''),utm_medium:z.string().max(300).default(''),utm_campaign:z.string().max(300).default(''),utm_term:z.string().max(300).default(''),utm_content:z.string().max(300).default('')};
const adSchema=z.object({...common,kind:z.enum(['properti','usaha']),type_id:z.preprocess(v=>v===''||v==null?null:v,z.coerce.number().int().positive().nullable()),package_id:z.coerce.number().int().positive(),location:z.string().trim().min(3).max(300),description:z.string().trim().min(10).max(5000),photo_url:safeUrl.default('')}).refine(v=>v.kind!=='properti'||v.type_id!=null,{path:['type_id'],message:'Kategori properti wajib dipilih'});
const surveySchema=z.object({...common,property_id:z.coerce.number().int().positive(),preferred_at:z.string().datetime({offset:true}).refine(s=>new Date(s)>new Date()&&new Date(s).getTime()<Date.now()+366*86400000,'Pilih waktu mendatang dalam satu tahun')});
const clickSchema=z.object({context:z.enum(['listing','general','ad_direct','ad','survey','search']).default('general'),property_id:z.coerce.number().int().positive().optional(),token:z.string().regex(/^[a-f0-9]{64}$/).optional(),page:z.string().max(2000).default('/'),utm_source:z.string().max(300).default(''),utm_medium:z.string().max(300).default(''),utm_campaign:z.string().max(300).default(''),utm_term:z.string().max(300).default(''),utm_content:z.string().max(300).default('')});
export function eventData(req:FastifyRequest,b:Record<string,unknown>){
 let page=String(b.page||req.headers.referer||'/');try{const u=new URL(page,env.SITE_URL);page=u.pathname+u.search;}catch{page='/';}
 return [page.slice(0,2000),String(b.context||'form'),...['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].map(k=>String(b[k]||'').slice(0,300))];
}
export async function recordEvent(req:FastifyRequest,b:Record<string,unknown>,type='whatsapp_click',pid:number|null=null){return query('INSERT INTO lead_events(event_type,property_id,page,source,utm_source,utm_medium,utm_campaign,utm_term,utm_content) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[type,pid,...eventData(req,b)]);}
export async function whatsapp(req:FastifyRequest,input:unknown){
 const b=clickSchema.parse(input),s=await settings();let template=s.whatsapp_general;let pid:number|null=null;const variables:Record<string,string>={};
 const listing=async(id:number)=>{const p=(await query("SELECT p.id,p.code,p.title,p.slug,t.slug AS category_slug FROM properties p JOIN property_types t ON t.id=p.type_id WHERE p.id=$1 AND p.status='terbit' AND p.deleted_at IS NULL",[id]))[0];if(!p)throw Object.assign(new Error('Listing tidak ditemukan'),{statusCode:404});pid=p.id;Object.assign(variables,{kode:p.code,judul:p.title,url:env.SITE_URL+propertyPath(p)});};
 if(b.context==='listing'){if(!b.property_id)throw Object.assign(new Error('Listing wajib diisi'),{statusCode:400});await listing(b.property_id);template=s.whatsapp_listing;}
 if(b.context==='ad_direct')template=s.whatsapp_ad_direct;
 if(b.context==='search')template=s.whatsapp_general+' Mohon bantu carikan properti sesuai kebutuhan saya.';
 if(b.context==='ad'||b.context==='survey'){
  const isAd=b.context==='ad';const rows=isAd?await query('SELECT r.name,r.kind,r.location,r.description,p.name AS package_name FROM ad_requests r JOIN ad_packages p ON p.id=r.package_id WHERE token=$1',[b.token||'']):await query('SELECT name,property_id,preferred_at FROM survey_requests WHERE token=$1',[b.token||'']);
  const r=rows[0];if(!r)throw Object.assign(new Error('Pengajuan tidak ditemukan'),{statusCode:404});
  variables.nama=r.name;
  if(isAd){Object.assign(variables,{jenis:r.kind,paket:r.package_name,lokasi:r.location,deskripsi:r.description});template=s.whatsapp_ad;}
  else{await listing(r.property_id);variables.tanggal=new Date(r.preferred_at).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'})+' WIB';template=s.whatsapp_survey;}
 }
 let message=template.replace(/\{([^}]+)\}/g,(_m,key:string)=>variables[key]||'');
 // Context cannot be removed accidentally by editing a template.
 if(pid && (!message.includes(variables.kode)||!message.includes(variables.url)))message+=`\n${variables.kode} ${variables.url}`;
 await recordEvent(req,b,'whatsapp_click',pid);
 return `https://wa.me/${s.whatsapp_number}?text=${encodeURIComponent(message)}`;
}
export async function leadsRoutes(app:FastifyInstance){
 app.post('/api/ad-requests',{config:{rateLimit:{max:10,timeWindow:'1 minute'}}},async(req,reply)=>{
  const b=adSchema.parse(req.body),token=randomBytes(32).toString('hex');
  await transaction(async c=>{
   if(!(await c.query('SELECT 1 FROM ad_packages WHERE id=$1 AND active=true',[b.package_id])).rowCount)throw Object.assign(new Error('Paket tidak tersedia'),{statusCode:400});
   await c.query('INSERT INTO ad_requests(token,name,whatsapp,kind,type_id,package_id,location,description,photo_url) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[token,b.name,b.whatsapp,b.kind,b.type_id,b.package_id,b.location,b.description,b.photo_url]);
   await c.query("INSERT INTO lead_events(event_type,page,source,utm_source,utm_medium,utm_campaign,utm_term,utm_content) VALUES('ad_request_submitted',$1,$2,$3,$4,$5,$6,$7)",eventData(req,b));
  });
  const params=new URLSearchParams({context:'ad',token,...Object.fromEntries(Object.entries(b).filter(([k])=>k.startsWith('utm_'))),page:b.page||'/iklankan'});
  const next='/whatsapp?'+params.toString();
  if(req.headers.accept?.includes('application/json'))return reply.code(201).send({saved:true,next});return reply.redirect(next);
 });
 app.post('/api/survey-requests',{config:{rateLimit:{max:10,timeWindow:'1 minute'}}},async(req,reply)=>{
  const raw=req.body as Record<string,unknown>;if(typeof raw.preferred_at==='string'&&!raw.preferred_at.endsWith('Z')&&!/[+-]\d\d:\d\d$/.test(raw.preferred_at)){const date=new Date(raw.preferred_at+'+07:00');if(Number.isFinite(date.getTime()))raw.preferred_at=date.toISOString();}
  const b=surveySchema.parse(raw),token=randomBytes(32).toString('hex');
  await transaction(async c=>{if(!(await c.query("SELECT 1 FROM properties WHERE id=$1 AND status='terbit' AND deleted_at IS NULL",[b.property_id])).rowCount)throw Object.assign(new Error('Listing tidak ditemukan'),{statusCode:404});
   await c.query('INSERT INTO survey_requests(token,property_id,name,whatsapp,preferred_at) VALUES($1,$2,$3,$4,$5)',[token,b.property_id,b.name,b.whatsapp,b.preferred_at]);
   await c.query("INSERT INTO lead_events(event_type,property_id,page,source,utm_source,utm_medium,utm_campaign,utm_term,utm_content) VALUES('survey_request_submitted',$1,$2,$3,$4,$5,$6,$7,$8)",[b.property_id,...eventData(req,b)]);
  });
  const next='/whatsapp?'+new URLSearchParams({context:'survey',token,page:b.page||'/properti',...Object.fromEntries(Object.entries(b).filter(([k])=>k.startsWith('utm_')))});
  if(req.headers.accept?.includes('application/json'))return reply.code(201).send({saved:true,next});return reply.redirect(next);
 });
 app.get('/whatsapp',{config:{rateLimit:{max:30,timeWindow:'1 minute'}}},async(req,reply)=>reply.header('Cache-Control','no-store').header('Referrer-Policy','no-referrer').redirect(await whatsapp(req,req.query)));
 app.post('/api/events/whatsapp-click',{config:{rateLimit:{max:30,timeWindow:'1 minute'}}},async(req,reply)=>reply.send({url:await whatsapp(req,req.body)}));
}
