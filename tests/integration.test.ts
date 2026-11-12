import 'dotenv/config';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readdir,readFile,rm } from 'node:fs/promises';
import pg from 'pg';
import argon2 from 'argon2';
import sharp from 'sharp';
import type { FastifyInstance } from 'fastify';
const baseUrl=process.env.DATABASE_URL!;
const database='hunianmu_test_'+randomBytes(6).toString('hex');
const root=new pg.Client({connectionString:baseUrl});
const password=randomBytes(24).toString('hex');
let app:FastifyInstance, pool:pg.Pool, cookie='', csrf='', propertyId:number, propertySlug:string, typeId:number, locationId:number,packageId:number;
const prop=()=>({title:'Listing Integrasi Nyaman',slug:'listing-integrasi',description:'Deskripsi properti integrasi yang cukup panjang untuk validasi.',type_id:typeId,location_id:locationId,public_address:'Area publik untuk pengujian',price:1500000,price_period:'bulan',land_area:120,building_area:80,bedrooms:2,bathrooms:1,kos_type:'putri',status:'draf',featured:true,owner_name:'OWNER_SECRET_NEVER_PUBLIC',owner_contact:'089999999999',facility_ids:[1,2]});
const adminHeaders=()=>({cookie,'x-csrf-token':csrf,accept:'application/json'});
async function createLogin(){const page=await app.inject({url:'/admin/login'});assert.equal(page.statusCode,200);cookie=page.cookies.map(c=>`${c.name}=${encodeURIComponent(c.value)}`).join('; ');csrf=page.body.match(/name="_csrf" value="([^"]+)"/)![1];const login=await app.inject({method:'POST',url:'/api/admin/login',headers:{cookie},payload:{email:'integration@example.test',password,_csrf:csrf}});assert.equal(login.statusCode,302);cookie=login.cookies.map(c=>`${c.name}=${encodeURIComponent(c.value)}`).join('; ');const dash=await app.inject({url:'/admin',headers:{cookie}});assert.equal(dash.statusCode,200,dash.body);csrf=dash.body.match(/name="csrf-token" content="([^"]+)"/)![1];}
before(async()=>{
 await root.connect();await root.query(`CREATE DATABASE ${database}`);const u=new URL(baseUrl);u.pathname='/'+database;process.env.DATABASE_URL=u.toString();process.env.NODE_ENV='test';process.env.UPLOAD_DIR='storage/testuploads/'+database;process.env.SESSION_KEY=randomBytes(32).toString('hex');
 const client=await import('../backend/src/db/client.js');pool=client.pool;
 for(const file of(await readdir('database/migrations')).sort())await pool.query(await readFile('database/migrations/'+file,'utf8'));
 await pool.query(await readFile('database/seeds/001_demo.sql','utf8'));
 typeId=(await pool.query("SELECT id FROM property_types WHERE slug='indekos'")).rows[0].id;locationId=(await pool.query('SELECT id FROM locations ORDER BY id LIMIT 1')).rows[0].id;packageId=(await pool.query('SELECT id FROM ad_packages ORDER BY id LIMIT 1')).rows[0].id;
 await pool.query('INSERT INTO admins(name,email,password_hash) VALUES($1,$2,$3)',['Integration','integration@example.test',await argon2.hash(password)]);
 const {buildApp}=await import('../backend/src/app.js');app=await buildApp({logger:false});await app.ready();
});
after(async()=>{if(app)await app.close();if(pool)await pool.end();assert.equal((await root.query('SELECT count(*)::int AS count FROM pg_stat_activity WHERE datname=$1',[database])).rows[0].count,0);await root.query(`DROP DATABASE IF EXISTS ${database}`);await rm('storage/testuploads/'+database,{recursive:true,force:true});await root.end();});
test('admin requires authentication and login CSRF',async()=>{
 const r=await app.inject({url:'/admin'});assert.equal(r.statusCode,302);assert.equal(r.headers.location,'/admin/login');
 assert.equal((await app.inject({url:'/api/admin/properties'})).statusCode,401);
 assert.equal((await app.inject({method:'POST',url:'/api/admin/login',payload:{email:'x@y.test',password:'test'}})).statusCode,403);
 await createLogin();assert.ok(cookie);assert.equal((await app.inject({method:'POST',url:'/api/admin/properties',headers:{cookie,'x-csrf-token':'é'.repeat(64)},payload:prop()})).statusCode,403);assert.equal((await app.inject({method:'POST',url:'/api/admin/properties',headers:{cookie},payload:prop()})).statusCode,403);
});
test('create draft, preview, upload 5 photos, reorder cover, publish and public privacy',async()=>{
 const draft=await app.inject({method:'POST',url:'/api/admin/properties',headers:adminHeaders(),payload:prop()});assert.equal(draft.statusCode,200,draft.body);const p=draft.json();propertyId=p.id;propertySlug=p.slug;
 assert.equal((await app.inject({url:'/api/properties/'+propertySlug})).statusCode,404);
 assert.equal((await app.inject({url:'/admin/preview/'+propertyId,headers:{cookie}})).statusCode,200);
 const buffer=await sharp({create:{width:100,height:80,channels:3,background:'#abc'}}).png().toBuffer();
 const boundary='hunianmuBoundary';const chunks:Buffer[]=[];
 for(let i=0;i<5;i++)chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="photos"; filename="photo${i}.png"\r\nContent-Type: image/png\r\n\r\n`),buffer,Buffer.from('\r\n'));
 chunks.push(Buffer.from(`--${boundary}--\r\n`));
 const upload=await app.inject({method:'POST',url:`/api/admin/properties/${propertyId}/media`,headers:{...adminHeaders(),'content-type':`multipart/form-data; boundary=${boundary}`},payload:Buffer.concat(chunks)});assert.equal(upload.statusCode,201,upload.body);assert.equal(upload.json().uploaded,5);
 const media=(await pool.query('SELECT * FROM property_media WHERE property_id=$1 ORDER BY id',[propertyId])).rows;
 const order=await app.inject({method:'POST',url:`/api/admin/properties/${propertyId}/media/order`,headers:adminHeaders(),payload:{ids:media.map(m=>m.id).reverse(),cover_id:media[4].id}});assert.equal(order.statusCode,200,order.body);
 const publish=await app.inject({method:'POST',url:`/api/admin/properties/${propertyId}`,headers:adminHeaders(),payload:{...prop(),status:'terbit'}});assert.equal(publish.statusCode,200,publish.body);
 for(const url of ['/api/properties','/api/properties/'+propertySlug,`/properti/indekos/${propertySlug}`,'/']){
  const r=await app.inject({url});assert.equal(r.statusCode,200,r.body);assert.ok(!r.body.includes('OWNER_SECRET_NEVER_PUBLIC'),url);assert.ok(!r.body.includes('089999999999'),url);assert.ok(!r.body.includes('owner_name'),url);assert.ok(!r.body.includes('owner_contact'),url);
 }
 const d=(await app.inject({url:'/api/properties/'+propertySlug})).json();assert.equal(d.media.length,5);assert.equal(d.media[0].id,media[4].id);
 assert.equal((await app.inject({url:d.media[0].thumb_path})).statusCode,200);
 const html=await app.inject({url:`/properti/indekos/${propertySlug}`});assert.match(html.body,/og:image/);assert.match(html.body,/application\/ld\+json/);assert.match(html.body,/mobile-detail-bar/);
});
test('catalog filters, URL, ordering, pagination and injection handling',async()=>{
 let r=await app.inject({url:'/api/properties?category=indekos&location=depok&min_price=1000000&max_price=2000000&bedrooms=2&kos_type=putri&min_land=100&max_land=130&availability=tersedia&sort=termurah'});assert.equal(r.statusCode,200);assert.equal(r.json().total,1);
 assert.equal((await app.inject({url:'/api/properties?max_price=100'})).json().total,0);
 assert.equal((await app.inject({url:'/api/properties?min_price=&max_price=&min_land=&max_land='})).json().total,1);
 assert.equal((await app.inject({url:'/api/properties?page=2'})).json().items.length,0);
 assert.equal((await app.inject({url:'/api/properties?sort=price;DROP%20TABLE%20admins'})).statusCode,400);
 assert.equal((await app.inject({url:'/api/properties?min_price=-1'})).statusCode,400);
 r=await app.inject({url:'/properti?q=%27%20OR%201%3D1--'});assert.equal(r.statusCode,200);assert.match(r.body,/Belum ada yang sesuai/);
 const c=await app.inject({url:'/properti/indekos?sort=termahal&kos_type=putri'});assert.equal(c.statusCode,200,c.body);assert.match(c.body,/value="putri" selected/);
});
test('WhatsApp event persisted before redirect with listing code, URL and full UTM',async()=>{
 const before=(await pool.query("SELECT count(*)::int AS c FROM lead_events WHERE event_type='whatsapp_click'")).rows[0].c;
 const r=await app.inject({url:`/whatsapp?context=listing&property_id=${propertyId}&page=${encodeURIComponent('/properti/indekos/'+propertySlug)}&utm_source=instagram&utm_medium=social&utm_campaign=test&utm_term=kos&utm_content=hero`});assert.equal(r.statusCode,302);const u=new URL(r.headers.location!);assert.equal(u.hostname,'wa.me');const message=u.searchParams.get('text')!;assert.match(message,/HM-/);assert.ok(message.includes('/properti/indekos/'+propertySlug));
 const events=(await pool.query("SELECT * FROM lead_events WHERE event_type='whatsapp_click' ORDER BY id DESC")).rows;assert.equal(events.length,before+1);assert.equal(events[0].property_id,propertyId);assert.equal(events[0].utm_source,'instagram');assert.equal(events[0].utm_content,'hero');assert.ok(events[0].created_at);assert.equal(events[0].page,'/properti/indekos/'+propertySlug);
});
test('ad submission saved before WhatsApp, submission and click are distinct, invalid requests rejected',async()=>{
 const payload={name:'Pengiklan Uji',whatsapp:'081234567890',kind:'properti',type_id:typeId,package_id:packageId,location:'Depok Sleman',description:'Properti untuk pengujian formulir iklan.',page:'/iklankan',utm_source:'e2e'};
 assert.equal((await app.inject({method:'POST',url:'/api/ad-requests',payload:{...payload,whatsapp:'invalid'}})).statusCode,400);
 assert.equal((await app.inject({method:'POST',url:'/api/ad-requests',payload:{...payload,website:'spam'}})).statusCode,400);
 const before=(await pool.query("SELECT count(*)::int AS c FROM lead_events WHERE event_type='whatsapp_click'")).rows[0].c;
 const r=await app.inject({method:'POST',url:'/api/ad-requests',headers:{accept:'application/json'},payload});assert.equal(r.statusCode,201,r.body);
 assert.equal((await pool.query('SELECT count(*)::int AS c FROM ad_requests')).rows[0].c,1);
 assert.equal((await pool.query("SELECT count(*)::int AS c FROM lead_events WHERE event_type='ad_request_submitted'")).rows[0].c,1);
 assert.equal((await pool.query("SELECT count(*)::int AS c FROM lead_events WHERE event_type='whatsapp_click'")).rows[0].c,before);
 const redirect=await app.inject({url:r.json().next});assert.equal(redirect.statusCode,302);assert.match(decodeURIComponent(redirect.headers.location!),/Pengiklan Uji/);
 const inbox=await app.inject({url:'/api/admin/ad-requests',headers:adminHeaders()});assert.equal(inbox.json()[0].name,payload.name);
 const update=await app.inject({method:'PATCH',url:`/api/admin/ad-requests/${inbox.json()[0].id}`,headers:adminHeaders(),payload:{status:'dihubungi',notes:'Catatan rahasia'}});assert.equal(update.statusCode,200);
});
test('survey saved and visible in admin before redirect',async()=>{
 assert.equal((await app.inject({method:'POST',url:'/api/survey-requests',payload:{property_id:propertyId,name:'Survey Uji',whatsapp:'081234567890',preferred_at:'tanggal-invalid'}})).statusCode,400);
 const r=await app.inject({method:'POST',url:'/api/survey-requests',headers:{accept:'application/json'},payload:{property_id:propertyId,name:'Survey Uji',whatsapp:'081234567890',preferred_at:new Date(Date.now()+86400000).toISOString()}});assert.equal(r.statusCode,201,r.body);
 assert.equal((await pool.query('SELECT count(*)::int AS c FROM survey_requests')).rows[0].c,1);const redirect=await app.inject({url:r.json().next});assert.equal(redirect.statusCode,302);assert.ok(decodeURIComponent(redirect.headers.location!).includes('/properti/indekos/'+propertySlug));
 assert.equal((await app.inject({url:'/admin/requests/survey',headers:{cookie}})).statusCode,200);
});
test('master data, packages, settings render and persist changes',async()=>{
 for(const url of ['/admin/master-data','/admin/packages','/admin/settings','/admin/requests/ad','/admin/properties',`/admin/properties/${propertyId}`]){const r=await app.inject({url,headers:{cookie}});assert.equal(r.statusCode,200,url+' '+r.body);}
 const r=await app.inject({method:'POST',url:'/api/admin/types',headers:adminHeaders(),payload:{name:'Ruko Uji',slug:'ruko-uji'}});assert.equal(r.statusCode,200,r.body);
 assert.ok((await app.inject({url:'/api/filters'})).json().types.some((t:{slug:string})=>t.slug==='ruko-uji'));
 const settings=(await app.inject({url:'/api/admin/settings',headers:adminHeaders()})).json();const updated=await app.inject({method:'PUT',url:'/api/admin/settings',headers:adminHeaders(),payload:{...settings,service_hours:'Layanan Uji 09.00–15.00 WIB',whatsapp_number:'6281230000000'}});assert.equal(updated.statusCode,200,updated.body);assert.match((await app.inject({url:'/kontak'})).body,/Layanan Uji/);
 const wa=await app.inject({url:'/whatsapp?context=general'});assert.match(wa.headers.location!,/wa.me\/6281230000000/);
 const pkg=await app.inject({method:'POST',url:'/api/admin/ad-packages',headers:adminHeaders(),payload:{name:'Paket Baru',description:'Paket tambahan untuk integrasi',channel:'website',price:123000,duration_days:20,features:['Fitur Uji'],active:true,sort_order:9}});assert.equal(pkg.statusCode,200,pkg.body);assert.match((await app.inject({url:'/iklankan'})).body,/Paket Baru/);
});
test('XSS escaped, invalid upload rejected, slug redirects, archive, duplicate, soft delete and sitemap',async()=>{
 let r=await app.inject({method:'POST',url:`/api/admin/properties/${propertyId}`,headers:adminHeaders(),payload:{...prop(),status:'terbit',slug:'listing-diubah',title:'Listing <script>alert(1)</script>'}});assert.equal(r.statusCode,200,r.body);
 r=await app.inject({url:'/properti/indekos/'+propertySlug});assert.equal(r.statusCode,301);assert.equal(r.headers.location,'/properti/indekos/listing-diubah');
 r=await app.inject({url:'/properti/indekos/listing-diubah'});assert.ok(!r.body.includes('<script>alert(1)</script>'));assert.match(r.body,/&lt;script&gt;/);
 const boundary='invalidPhoto';r=await app.inject({method:'POST',url:`/api/admin/properties/${propertyId}/media`,headers:{...adminHeaders(),'content-type':`multipart/form-data; boundary=${boundary}`},payload:`--${boundary}\r\nContent-Disposition: form-data; name="photos"; filename="x.svg"\r\nContent-Type: image/svg+xml\r\n\r\n<svg/>\r\n--${boundary}--\r\n`});assert.equal(r.statusCode,400,r.body);
 const forged=await app.inject({method:'POST',url:`/api/admin/properties/${propertyId}/media`,headers:{...adminHeaders(),'content-type':`multipart/form-data; boundary=${boundary}`},payload:`--${boundary}\r\nContent-Disposition: form-data; name="photos"; filename="x.jpg"\r\nContent-Type: image/jpeg\r\n\r\n<script>alert(1)</script>\r\n--${boundary}--\r\n`});assert.equal(forged.statusCode,400,forged.body);
 assert.match((await app.inject({url:'/sitemap.xml'})).body,/listing-diubah/);assert.match((await app.inject({url:'/robots.txt'})).body,/Disallow: \/admin/);
 r=await app.inject({method:'POST',url:`/api/admin/properties/${propertyId}/action`,headers:adminHeaders(),payload:{action:'duplicate'}});assert.equal(r.statusCode,200,r.body);const duplicateId=r.json().id;assert.equal(r.json().status,'draf');assert.equal((await pool.query('SELECT count(*)::int AS c FROM property_media WHERE property_id=$1',[duplicateId])).rows[0].c,5);
 r=await app.inject({method:'POST',url:`/api/admin/properties/${propertyId}/action`,headers:adminHeaders(),payload:{action:'availability',availability:'terisi'}});assert.equal(r.statusCode,200);assert.equal((await app.inject({url:'/api/properties/listing-diubah'})).json().availability,'terisi');
 await app.inject({method:'POST',url:`/api/admin/properties/${propertyId}/action`,headers:adminHeaders(),payload:{action:'archive'}});assert.ok(!(await app.inject({url:'/sitemap.xml'})).body.includes('listing-diubah'));
 await app.inject({method:'DELETE',url:`/api/admin/properties/${duplicateId}`,headers:adminHeaders()});assert.ok((await pool.query('SELECT deleted_at FROM properties WHERE id=$1',[duplicateId])).rows[0].deleted_at);
});
test('logout revokes session, brute-force login rate limited',async()=>{
 assert.equal((await app.inject({url:'/admin',headers:{cookie}})).headers['x-robots-tag'],'noindex, nofollow');
 const oldCookie=cookie;assert.equal((await app.inject({method:'POST',url:'/api/admin/logout',headers:adminHeaders(),payload:{}})).statusCode,302);
 assert.equal((await app.inject({url:'/api/admin/properties',headers:{cookie:oldCookie}})).statusCode,401);
 const p=await app.inject({url:'/admin/login'});const c=p.cookies.map(v=>`${v.name}=${encodeURIComponent(v.value)}`).join('; '),token=p.body.match(/name="_csrf" value="([^"]+)"/)![1];let last=0;for(let i=0;i<6;i++)last=(await app.inject({method:'POST',url:'/api/admin/login',headers:{cookie:c},payload:{email:'integration@example.test',password:'wrong',_csrf:token}})).statusCode;assert.equal(last,429);
 for(let i=0;i<5;i++)await app.inject({method:'POST',url:'/api/admin/login',remoteAddress:`127.0.0.${i+2}`,headers:{cookie:c},payload:{email:'integration@example.test',password:'wrong',_csrf:token}});
 const lock=(await pool.query('SELECT locked_until FROM admins WHERE email=$1',['integration@example.test'])).rows[0];assert.ok(new Date(lock.locked_until)>new Date());
});
