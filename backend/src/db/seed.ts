import { readdir,readFile,access } from 'node:fs/promises';
import { pool,query,transaction } from './client.js';
await transaction(async c=>{for(const name of(await readdir('database/seeds')).filter(n=>n.endsWith('.sql')).sort())await c.query(await readFile(`database/seeds/${name}`,'utf8'));});
const existing=await query('SELECT 1 FROM properties LIMIT 1');
if(!existing.length){
 const titles=['Indekos Putri Nyaman Dekat Kampus','Rumah Modern dengan Taman Keluarga','Kontrakan Asri di Lingkungan Tenang','Indekos Putra dengan Ruang Bersama','Tanah Siap Bangun Akses Jalan Lebar','Rumah Sewa Dua Lantai yang Lapang'];
 const types=['indekos','rumah','kontrakan','indekos','tanah','rumah'],prices=[1850000,885000000,28000000,1200000,450000000,45000000],locations=['depok','yogyakarta','mlati','depok','kalasan','bantul'];
 for(let i=0;i<18;i++){
  const n=i%6,type=(await query('SELECT id FROM property_types WHERE slug=$1',[types[n]]))[0],loc=(await query('SELECT id FROM locations WHERE slug=$1',[locations[n]]))[0];
  const p=(await query(`INSERT INTO properties(slug,title,description,type_id,location_id,public_address,price,price_period,land_area,building_area,bedrooms,bathrooms,certificate,furniture,kos_type,room_size,rules,availability,featured,status,owner_name,owner_contact,published_at)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'terbit','Pemilik Demo Internal','080000000001',now()-($20::int*interval '1 day')) RETURNING id`,
   [`demo-${types[n]}-${i+1}`,titles[n]+(i>=6?` ${Math.floor(i/6)+1}`:''),'[DATA DEMO] Properti ini dibuat untuk pengujian lokal HunianMu, bukan penawaran nyata. Lingkungan nyaman dengan akses ke fasilitas harian. Hubungi admin untuk menanyakan informasi dan jadwal kunjungan.',type.id,loc.id,'Area '+loc.id+' (alamat umum demo)',prices[n]+Math.floor(i/6)*50000,n===0||n===3?'bulan':n===2||n===5?'tahun':'sekali',n===4?180:100,n===4?0:80,n===4?0:n===0||n===3?1:3,n===4?0:2,n===4||n===1?'SHM':'','Semi furnished',n===0?'putri':n===3?'putra':'',n===0||n===3?'3 × 4 m':'','Data demo. Jadwal kunjungan perlu dikonfirmasi admin.',i===7?'dipesan':i===10?'terisi':'tersedia',i<6,i])).at(0)!;
  const file=n+1;try{await access(`frontend/public/img/demo-${file}.webp`);await query('INSERT INTO property_media(property_id,path,medium_path,thumb_path,alt,is_cover,width,height) VALUES($1,$2,$2,$2,$3,true,1200,800)',[p.id,`/static/img/demo-${file}.webp`,`Ilustrasi ${titles[n]} dari referensi desain HunianMu`]);}catch{console.warn('Foto demo belum tersedia; jalankan prepare-demo-assets');}
  for(const fid of [1,2,3,4].slice(n===4?3:0))await query('INSERT INTO property_facilities(property_id,facility_id) VALUES($1,$2)',[p.id,fid]);
 }
 console.log('18 listing DEMO dibuat. Tidak ada akun admin bawaan.');
}else console.log('Listing yang sudah ada dipertahankan.');
await pool.end();
