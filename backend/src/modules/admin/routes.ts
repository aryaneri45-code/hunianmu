import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { query,transaction } from '../../db/client.js';
import { requireAdmin,currentAdmin,csrfToken } from '../auth/auth.js';
import { masters,saveProperty,detail } from '../properties/repository.js';
import { requestStatus,packageSchema,masterSchema } from '../properties/schema.js';
import { settings } from '../settings/service.js';
import { mediaRoutes } from '../media/routes.js';
const idParam=(req:FastifyRequest)=>z.object({id:z.coerce.number().int().positive()}).parse(req.params).id;
const done=(req:FastifyRequest,reply:FastifyReply,data:unknown,url:string)=>req.headers.accept?.includes('application/json')?reply.send(data):reply.redirect(url);
async function dashboard(){const [stats,clicks]=await Promise.all([query(`SELECT (SELECT count(*) FROM properties WHERE status='terbit' AND deleted_at IS NULL) AS active,(SELECT count(*) FROM properties WHERE status='terbit' AND deleted_at IS NULL AND updated_at<now()-interval '30 days') AS stale,(SELECT count(*) FROM lead_events WHERE event_type='whatsapp_click') AS clicks,(SELECT count(*) FROM ad_requests WHERE status='baru')+(SELECT count(*) FROM survey_requests WHERE status='baru') AS requests`),query("SELECT coalesce(p.code,'Umum') AS code,e.source,count(*)::int AS total FROM lead_events e LEFT JOIN properties p ON p.id=e.property_id WHERE event_type='whatsapp_click' GROUP BY p.code,e.source ORDER BY total DESC LIMIT 20")]);return {stats:stats[0],clicks};}
export async function adminRoutes(app:FastifyInstance){
 await app.register(async a=>{
 a.addHook('preHandler',requireAdmin);
 const render=async(req:FastifyRequest,reply:FastifyReply,view:string,data:Record<string,unknown>={})=>reply.header('Cache-Control','no-store').viewAsync(view,{...data,adminPage:true,admin:await currentAdmin(req),csrf:csrfToken(req),settings:await settings(),path:req.url.split('?')[0]});
 a.get('/admin',async(req,reply)=>render(req,reply,'admin/dashboard.njk',{...await dashboard(),title:'Dasbor'}));
 a.get('/api/admin/dashboard',async()=>dashboard());
 a.get('/admin/properties',async(req,reply)=>render(req,reply,'admin/properties.njk',{title:'Kelola Listing',items:await query('SELECT p.*,t.name AS category_name,l.name AS location_name,(SELECT count(*) FROM property_media m WHERE m.property_id=p.id) AS photos FROM properties p JOIN property_types t ON t.id=p.type_id JOIN locations l ON l.id=p.location_id WHERE p.deleted_at IS NULL ORDER BY p.id DESC')}));
 a.get('/admin/properties/new',async(req,reply)=>render(req,reply,'admin/property-form.njk',{title:'Listing Baru',property:{status:'draf',availability:'tersedia',price_period:'bulan',facility_ids:[]},...await masters()}));
 a.get('/admin/properties/:id',async(req,reply)=>{const id=idParam(req),p=(await query('SELECT * FROM properties WHERE id=$1 AND deleted_at IS NULL',[id]))[0];if(!p)return reply.code(404).send({error:'Listing tidak ditemukan'});p.facility_ids=(await query('SELECT facility_id FROM property_facilities WHERE property_id=$1',[id])).map(r=>r.facility_id);p.media=await query('SELECT * FROM property_media WHERE property_id=$1 ORDER BY sort_order,id',[id]);return render(req,reply,'admin/property-form.njk',{title:'Ubah Listing',property:p,...await masters()});});
 a.get('/admin/preview/:id',async(req,reply)=>{const p=(await query('SELECT slug FROM properties WHERE id=$1 AND deleted_at IS NULL',[idParam(req)]))[0];if(!p)return reply.code(404).send({error:'Tidak ditemukan'});return render(req,reply,'public/detail.njk',{title:'Pratinjau Listing',property:await detail(p.slug,true),preview:true});});
 a.get('/api/admin/properties',async()=>query('SELECT * FROM properties WHERE deleted_at IS NULL ORDER BY id DESC'));
 a.get('/api/admin/properties/:id',async(req,reply)=>{const p=(await query('SELECT * FROM properties WHERE id=$1 AND deleted_at IS NULL',[idParam(req)]))[0];return p||reply.code(404).send({error:'Tidak ditemukan'});});
 a.post('/api/admin/properties',async(req,reply)=>{const p=await saveProperty(req.body);return done(req,reply,p,`/admin/properties/${p.id}?saved=1`);});
 a.post('/api/admin/properties/:id',async(req,reply)=>{const p=await saveProperty(req.body,idParam(req));return done(req,reply,p,`/admin/properties/${p.id}?saved=1`);});
 a.put('/api/admin/properties/:id',async(req,reply)=>reply.send(await saveProperty(req.body,idParam(req))));
 a.post('/api/admin/properties/:id/action',async(req,reply)=>{
  const id=idParam(req),b=z.object({action:z.enum(['delete','archive','duplicate','availability','feature']),availability:z.enum(['tersedia','dipesan','terisi']).optional()}).parse(req.body);
  if(!(await query('SELECT 1 FROM properties WHERE id=$1 AND deleted_at IS NULL',[id])).length)return reply.code(404).send({error:'Listing tidak ditemukan'});
  if(b.action==='delete')await query("UPDATE properties SET deleted_at=now(),status='arsip',updated_at=now() WHERE id=$1",[id]);
  if(b.action==='archive')await query("UPDATE properties SET status='arsip',updated_at=now() WHERE id=$1",[id]);
  if(b.action==='availability'){if(!b.availability)throw Object.assign(new Error('Pilih ketersediaan'),{statusCode:400});await query('UPDATE properties SET availability=$1,updated_at=now() WHERE id=$2',[b.availability,id]);}
  if(b.action==='feature')await query('UPDATE properties SET featured=NOT featured,updated_at=now() WHERE id=$1',[id]);
  if(b.action==='duplicate'){
   const p=(await query('SELECT * FROM properties WHERE id=$1',[id]))[0];const duplicate=await saveProperty({...p,title:p.title+' (Salinan)',slug:p.slug+'-salinan-'+randomBytes(3).toString('hex'),featured:false,status:'draf',facility_ids:(await query('SELECT facility_id FROM property_facilities WHERE property_id=$1',[id])).map(r=>r.facility_id)});
   await query('INSERT INTO property_media(property_id,path,medium_path,thumb_path,alt,sort_order,is_cover,width,height) SELECT $1,path,medium_path,thumb_path,alt,sort_order,is_cover,width,height FROM property_media WHERE property_id=$2',[duplicate.id,id]);return done(req,reply,duplicate,`/admin/properties/${duplicate.id}`);
  }
  return done(req,reply,{saved:true},'/admin/properties');
 });
 a.delete('/api/admin/properties/:id',async(req,reply)=>{await query("UPDATE properties SET status='arsip',deleted_at=now(),updated_at=now() WHERE id=$1",[idParam(req)]);return reply.send({deleted:true});});
 await mediaRoutes(a);
 const tables={'types':'property_types','locations':'locations','facilities':'facilities'} as const;
 for(const [route,table] of Object.entries(tables)){
  a.get(`/api/admin/${route}`,async()=>query(`SELECT * FROM ${table} ORDER BY id`));
  const save=async(req:FastifyRequest,reply:FastifyReply,update=false)=>{
   const b=masterSchema.parse(req.body),fields:Record<string,unknown>={name:b.name,slug:b.slug};if(table==='locations')Object.assign(fields,{kind:b.kind,parent_id:b.parent_id});if(table==='facilities')fields.icon=b.icon;
   const keys=Object.keys(fields),values=Object.values(fields);
   if(update)await query(`UPDATE ${table} SET ${keys.map((k,i)=>`${k}=$${i+1}`).join(',')} WHERE id=$${values.length+1}`,[...values,idParam(req)]);
   else await query(`INSERT INTO ${table}(${keys.join(',')}) VALUES(${keys.map((_,i)=>`$${i+1}`).join(',')})`,values);
   return done(req,reply,{saved:true},'/admin/master-data');
  };
  a.post(`/api/admin/${route}`,async(req,reply)=>save(req,reply));a.post(`/api/admin/${route}/:id`,async(req,reply)=>save(req,reply,true));a.put(`/api/admin/${route}/:id`,async(req,reply)=>save(req,reply,true));
  const remove=async(req:FastifyRequest,reply:FastifyReply)=>{await query(`DELETE FROM ${table} WHERE id=$1`,[idParam(req)]);return done(req,reply,{deleted:true},'/admin/master-data');};
  a.post(`/api/admin/${route}/:id/delete`,remove);a.delete(`/api/admin/${route}/:id`,remove);
 }
 a.get('/admin/master-data',async(req,reply)=>render(req,reply,'admin/master.njk',{title:'Master Data',...await masters()}));
 a.get('/admin/packages',async(req,reply)=>render(req,reply,'admin/packages.njk',{title:'Paket Iklan',packages:await query('SELECT * FROM ad_packages ORDER BY sort_order,id')}));
 a.get('/api/admin/ad-packages',async()=>query('SELECT * FROM ad_packages ORDER BY sort_order,id'));
 const savePackage=async(req:FastifyRequest,reply:FastifyReply,update=false)=>{const b=packageSchema.parse(req.body),keys=Object.keys(b),vals=Object.entries(b).map(([k,v])=>k==='features'?JSON.stringify(v):v);
  if(update)await query(`UPDATE ad_packages SET ${keys.map((k,i)=>`${k}=$${i+1}`).join(',')} WHERE id=$${vals.length+1}`,[...vals,idParam(req)]);
  else await query(`INSERT INTO ad_packages(${keys.join(',')}) VALUES(${keys.map((_,i)=>`$${i+1}`).join(',')})`,vals);
  return done(req,reply,{saved:true},'/admin/packages');};
 a.post('/api/admin/ad-packages',async(req,reply)=>savePackage(req,reply));a.post('/api/admin/ad-packages/:id',async(req,reply)=>savePackage(req,reply,true));a.put('/api/admin/ad-packages/:id',async(req,reply)=>savePackage(req,reply,true));
 a.delete('/api/admin/ad-packages/:id',async(req,reply)=>{await query('UPDATE ad_packages SET active=false WHERE id=$1',[idParam(req)]);return reply.send({saved:true});});
 for(const kind of ['ad','survey']){
  const table=kind==='ad'?'ad_requests':'survey_requests';
  const list=()=>query(kind==='ad'?'SELECT r.*,p.name AS package_name FROM ad_requests r JOIN ad_packages p ON p.id=r.package_id ORDER BY r.id DESC':'SELECT r.*,p.title AS property_title,p.code FROM survey_requests r JOIN properties p ON p.id=r.property_id ORDER BY r.id DESC');
  a.get(`/api/admin/${kind}-requests`,list);
  a.get(`/admin/requests/${kind}`,async(req,reply)=>render(req,reply,'admin/requests.njk',{title:kind==='ad'?'Pengajuan Iklan':'Pengajuan Survei',kind,requests:await list()}));
  const update=async(req:FastifyRequest,reply:FastifyReply)=>{const b=requestStatus.parse(req.body);await query(`UPDATE ${table} SET status=$1,notes=$2 WHERE id=$3`,[b.status,b.notes,idParam(req)]);return done(req,reply,{saved:true},`/admin/requests/${kind}`);};
  a.patch(`/api/admin/${kind}-requests/:id`,update);a.post(`/api/admin/${kind}-requests/:id`,update);
 }
 a.get('/api/admin/settings',async()=>settings());
 a.get('/admin/settings',async(req,reply)=>render(req,reply,'admin/settings.njk',{title:'Pengaturan Situs',pages:await query('SELECT * FROM content_pages ORDER BY slug')}));
 const settingSchema=z.object({whatsapp_number:z.string().regex(/^62[0-9]{8,14}$/),demo_mode:z.enum(['true','false']),service_area:z.string().min(2).max(300),service_hours:z.string().min(2).max(300),seo_title:z.string().min(5).max(180),seo_description:z.string().min(10).max(320),instagram_url:z.union([z.literal(''),z.string().url().startsWith('https://')]),tiktok_url:z.union([z.literal(''),z.string().url().startsWith('https://')]),facebook_url:z.union([z.literal(''),z.string().url().startsWith('https://')]),whatsapp_listing:z.string().min(10).max(3000),whatsapp_general:z.string().min(10).max(3000),whatsapp_ad:z.string().min(10).max(3000),whatsapp_ad_direct:z.string().min(10).max(3000),whatsapp_survey:z.string().min(10).max(3000)});
 const saveSettings=async(req:FastifyRequest,reply:FastifyReply)=>{const b=settingSchema.parse(req.body);await transaction(async c=>{for(const [k,v] of Object.entries(b))await c.query('INSERT INTO site_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=$2',[k,v]);});return done(req,reply,{saved:true},'/admin/settings?saved=1');};
 a.post('/api/admin/settings',saveSettings);a.put('/api/admin/settings',saveSettings);
 a.post('/api/admin/pages/:slug',async(req,reply)=>{const p=z.object({slug:z.enum(['mencari','survei','iklan','privasi'])}).parse(req.params),b=z.object({title:z.string().min(3).max(200),body:z.string().min(10).max(20000)}).parse(req.body);await query('UPDATE content_pages SET title=$1,body=$2 WHERE slug=$3',[b.title,b.body,p.slug]);return done(req,reply,{saved:true},'/admin/settings?saved=1');});
 });
}
