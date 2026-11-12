import type { FastifyInstance } from 'fastify';
import { query } from '../../db/client.js';
import { env } from '../../config/env.js';
const xml=(s:string)=>s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export async function seoRoutes(app:FastifyInstance){
 app.get('/robots.txt',async(_req,reply)=>reply.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/\nDisallow: /whatsapp\nSitemap: ${env.SITE_URL}/sitemap.xml\n`));
 app.get('/sitemap.xml',async(_req,reply)=>{
  const types=await query('SELECT slug FROM property_types');const properties=await query("SELECT p.slug,p.updated_at,t.slug AS category_slug FROM properties p JOIN property_types t ON t.id=p.type_id WHERE p.status='terbit' AND p.deleted_at IS NULL");
  const urls=['/','/properti','/iklankan','/cara-kerja','/kontak','/kebijakan-privasi',...types.map(t=>'/properti/'+t.slug)].map(p=>`<url><loc>${xml(env.SITE_URL+p)}</loc></url>`);
  for(const p of properties)urls.push(`<url><loc>${xml(env.SITE_URL+`/properti/${p.category_slug}/${p.slug}`)}</loc><lastmod>${new Date(p.updated_at).toISOString()}</lastmod></url>`);
  return reply.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`);
 });
}
