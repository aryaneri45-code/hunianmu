import { readFile,writeFile,mkdir } from 'node:fs/promises';
import sharp from 'sharp';
// Only images referenced by the supplied HunianMu design are used as demo assets.
const html=await readFile('frontend/designs/design_hunianmu_desktop/stitch_hunianmu_property_portal/beranda_hunianmu_property_ecosystem/code.html','utf8');
const urls=[...new Set(html.match(/https:\/\/lh3\.googleusercontent\.com\/aida-public\/[^"\s]+/g)||[])].slice(0,6);
await mkdir('frontend/public/img',{recursive:true});
for(const [i,url]of urls.entries()){
 try{const r=await fetch(url);if(!r.ok)throw new Error(String(r.status));const b=Buffer.from(await r.arrayBuffer());await sharp(b).resize({width:1200,withoutEnlargement:true}).webp({quality:80}).toFile(`frontend/public/img/demo-${i+1}.webp`);console.log(`Saved design demo photo ${i+1}`);}catch(e){console.error(`Photo ${i+1}:`,String(e));}
}
const font=await fetch('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',{headers:{'user-agent':'Mozilla/5.0'}});
const css=await font.text();let index=0;
const local=await Promise.all([...new Set(css.match(/https:\/\/[^)\s]+/g)||[])].map(async url=>{const p=`/static/fonts/jakarta-${index++}.woff2`;const r=await fetch(url);await writeFile('frontend/public/fonts/'+p.split('/').pop(),Buffer.from(await r.arrayBuffer()));return {url,p};}));
await writeFile('frontend/assets/css/fonts.css',local.reduce((s,f)=>s.replaceAll(f.url,f.p),css));
