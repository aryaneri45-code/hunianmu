import type { FastifyInstance,FastifyRequest,FastifyReply } from 'fastify';
import { z } from 'zod';
import { query } from '../../db/client.js';
import { catalog,detail,masters } from '../properties/repository.js';
import { settings,propertyPath } from '../settings/service.js';
import { env } from '../../config/env.js';
import { recordEvent } from '../leads/routes.js';
export async function publicRoutes(app:FastifyInstance){
 const render=async(req:FastifyRequest,reply:FastifyReply,view:string,data:Record<string,unknown>={})=>{const s=await settings();return reply.viewAsync(view,{settings:s,title:s.seo_title,description:s.seo_description,path:req.url.split('?')[0],canonical:env.SITE_URL+req.url.split('?')[0],...data});};
 app.get('/health',async()=>{await query('SELECT 1');return {status:'ok'};});
 app.get('/',async(req,reply)=>{
  const categories=await query("SELECT t.id,t.name,t.slug,count(p.id)::int AS count FROM property_types t LEFT JOIN properties p ON p.type_id=t.id AND p.status='terbit' AND p.deleted_at IS NULL GROUP BY t.id ORDER BY t.id");
  const featured=(await query("SELECT p.slug FROM properties p WHERE p.featured=true AND p.status='terbit' AND p.deleted_at IS NULL ORDER BY p.published_at DESC LIMIT 8"));
  const items=await Promise.all(featured.map(p=>detail(p.slug)));return render(req,reply,'public/home.njk',{categories,items,...await masters()});
 });
 const list=async(req:FastifyRequest,reply:FastifyReply)=>{const params=req.params as {category?:string},input={...req.query as object,...(params.category?{category:params.category}:{})};
  const m=await masters();if(params.category&&!m.types.some(t=>t.slug===params.category))return reply.code(404).viewAsync('public/error.njk',{title:'Kategori tidak ditemukan',message:'Kategori ini belum tersedia.'});
  const result=await catalog(input),category=m.types.find(t=>t.slug===result.filters.category);
  if(Object.keys(req.query as object).length)await recordEvent(req,{...req.query as object,page:req.url,context:'catalog'},'filter_used');
  const base=params.category?`/properti/${params.category}`:'/properti';
  const pageLinks=Array.from({length:result.pages},(_,i)=>i+1).filter(p=>Math.abs(p-result.page)<=2).map(p=>({number:p,url:base+'?'+new URLSearchParams({...Object.fromEntries(Object.entries(result.filters).filter(([k,v])=>k!=='page'&&v!==''&&v!=null).map(([k,v])=>[k,String(v)])),page:String(p)})}));
  return render(req,reply,'public/catalog.njk',{...result,...m,pageLinks,title:`${category?category.name:'Cari Properti'} — HunianMu`,heading:category?`${category.name} untuk kebutuhanmu`:'Temukan tempat yang terasa seperti rumah',description:`Jelajahi ${category?category.name.toLowerCase():'indekos, kontrakan, rumah dan tanah'} di HunianMu. Pilih lokasi, anggaran, ketersediaan dan spesifikasi sesuai kebutuhan.`,categoryRoute:params.category||'',canonical:env.SITE_URL+base+(result.page>1?'?page='+result.page:'')});
 };
 app.get('/properti',list);app.get('/properti/:category',list);
 app.get('/properti/:category/:slug',async(req,reply)=>{
  const params=z.object({category:z.string(),slug:z.string().max(200)}).parse(req.params);const p=await detail(params.slug);
  if(!p){const alias=(await query("SELECT p.slug,t.slug AS category_slug FROM property_redirects r JOIN properties p ON p.id=r.property_id JOIN property_types t ON t.id=p.type_id WHERE r.slug=$1 AND p.status='terbit' AND p.deleted_at IS NULL",[params.slug]))[0];if(alias)return reply.code(301).redirect(propertyPath(alias));return render(req,reply.code(404),'public/error.njk',{title:'Properti tidak ditemukan',message:'Listing belum terbit atau telah diarsipkan. Temukan pilihan lain di katalog.'});}
  if(params.category!==p.category_slug)return reply.code(301).redirect(propertyPath(p));
  const structured={'@context':'https://schema.org','@type':'RealEstateListing',name:p.title,description:p.description,url:env.SITE_URL+propertyPath(p),image:p.media.map((m:Record<string,string>)=>env.SITE_URL+m.path),offers:{'@type':'Offer',price:p.price,priceCurrency:'IDR',availability:p.availability==='tersedia'?'https://schema.org/InStock':'https://schema.org/OutOfStock'},dateModified:new Date(p.updated_at).toISOString()};
  return render(req,reply,'public/detail.njk',{property:p,title:p.seo_title||`${p.title} — ${p.code} | HunianMu`,description:p.seo_description||p.description.slice(0,160),ogImage:env.SITE_URL+(p.media[0]?.path||'/static/img/logo.webp'),structured});
 });
 app.get('/iklankan',async(req,reply)=>render(req,reply,'public/advertise.njk',{title:'Iklankan Properti/Usaha — HunianMu',description:'Promosikan properti dan usaha melalui listing website, media sosial, atau paket gabungan. Lihat paket dan ajukan iklan melalui admin HunianMu.',packages:await query('SELECT * FROM ad_packages WHERE active=true ORDER BY sort_order,id'),...await masters()}));
 app.get('/cara-kerja',async(req,reply)=>render(req,reply,'public/how.njk',{title:'Cara Kerja — HunianMu',description:'Panduan mencari properti, mengajukan jadwal survei dan memasang iklan di HunianMu. Ikuti langkah mudah dan hubungi admin melalui WhatsApp.',guides:await query("SELECT * FROM content_pages WHERE slug IN ('mencari','survei','iklan') ORDER BY CASE slug WHEN 'mencari' THEN 1 WHEN 'survei' THEN 2 ELSE 3 END")}));
 app.get('/kontak',async(req,reply)=>render(req,reply,'public/contact.njk',{title:'Kontak — HunianMu',description:'Hubungi admin HunianMu untuk menanyakan properti dan konsultasi iklan. Temukan nomor WhatsApp, jam layanan, wilayah dan tautan sosial resmi.'}));
 app.get('/kebijakan-privasi',async(req,reply)=>render(req,reply,'public/privacy.njk',{title:'Kebijakan Privasi — HunianMu',description:'Pelajari penggunaan data kontak, pengajuan iklan dan survei, serta event WhatsApp di HunianMu. Hubungi admin untuk koreksi atau penghapusan data.',content:(await query("SELECT * FROM content_pages WHERE slug='privasi'"))[0]}));
 app.get('/api/properties',async req=>catalog(req.query));
 app.get('/api/properties/:slug',async(req,reply)=>{const p=await detail((req.params as {slug:string}).slug);return p||reply.code(404).send({error:'Properti tidak ditemukan'});});
 app.get('/api/filters',masters);app.get('/api/ad-packages',async()=>query('SELECT * FROM ad_packages WHERE active=true ORDER BY sort_order,id'));
}
