import type { FastifyInstance } from 'fastify';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { mkdir,unlink } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { query,transaction } from '../../db/client.js';
export async function mediaRoutes(app:FastifyInstance){
 app.post('/api/admin/properties/:id/media',async(req,reply)=>{
  const {id}=z.object({id:z.coerce.number().int().positive()}).parse(req.params);
  if(!(await query('SELECT 1 FROM properties WHERE id=$1 AND deleted_at IS NULL',[id])).length)return reply.code(404).send({error:'Listing tidak ditemukan'});
  const folder=path.resolve(env.UPLOAD_DIR,String(id));await mkdir(folder,{recursive:true});
  const staged:{path:string;medium:string;thumb:string;width:number;height:number}[]=[],created:string[]=[];
  try{
   for await(const part of req.parts()){
    if(part.type!=='file')continue;
    if(!['image/jpeg','image/png','image/webp'].includes(part.mimetype))throw Object.assign(new Error('Hanya foto JPG, PNG, atau WebP'),{statusCode:400});
    const buf=await part.toBuffer(),processor=sharp(buf,{limitInputPixels:40000000,animated:false});
    const meta=await processor.metadata().catch(()=>{throw Object.assign(new Error('Berkas tidak dapat dibaca sebagai foto yang valid'),{statusCode:400});});
    if(!['jpeg','png','webp'].includes(meta.format||'')||!meta.width||!meta.height)throw Object.assign(new Error('Isi berkas bukan foto yang didukung'),{statusCode:400});
    const key=randomUUID(),names=[`${key}-large.webp`,`${key}-medium.webp`,`${key}-thumb.webp`];
    for(const [index,width] of [1600,960,480].entries()){const f=path.join(folder,names[index]);created.push(f);await sharp(buf,{limitInputPixels:40000000}).rotate().resize({width,withoutEnlargement:true}).webp({quality:80}).toFile(f);}
    const output=await sharp(path.join(folder,names[0])).metadata();
    staged.push({path:`/uploads/${id}/${names[0]}`,medium:`/uploads/${id}/${names[1]}`,thumb:`/uploads/${id}/${names[2]}`,width:output.width!,height:output.height!});
   }
   if(!staged.length)throw Object.assign(new Error('Pilih minimal satu foto'),{statusCode:400});
   await transaction(async c=>{
    await c.query('SELECT id FROM properties WHERE id=$1 FOR UPDATE',[id]);
    const current=(await c.query('SELECT count(*)::int AS count,coalesce(max(sort_order),-1)::int AS last FROM property_media WHERE property_id=$1',[id])).rows[0];
    if(current.count+staged.length>30)throw Object.assign(new Error('Maksimum 30 foto per listing'),{statusCode:400});
    for(const [i,m] of staged.entries())await c.query('INSERT INTO property_media(property_id,path,medium_path,thumb_path,alt,sort_order,is_cover,width,height) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[id,m.path,m.medium,m.thumb,`Foto properti ${i+1}`,current.last+i+1,current.count===0&&i===0,m.width,m.height]);
    await c.query('UPDATE properties SET updated_at=now() WHERE id=$1',[id]);
   });return reply.code(201).send({uploaded:staged.length});
  }catch(e){await Promise.all(created.map(f=>unlink(f).catch(()=>{})));throw e;}
 });
 app.post('/api/admin/properties/:id/media/order',async(req,reply)=>{
  const {id}=z.object({id:z.coerce.number().int().positive()}).parse(req.params);
  const b=z.object({ids:z.array(z.coerce.number().int().positive()).min(1).max(30),cover_id:z.coerce.number().int().positive(),alts:z.record(z.string(),z.string().trim().min(1).max(300)).optional()}).parse(req.body);
  await transaction(async c=>{await c.query('SELECT id FROM properties WHERE id=$1 FOR UPDATE',[id]);const existing=(await c.query('SELECT id FROM property_media WHERE property_id=$1',[id])).rows.map(r=>r.id);
   if(new Set(b.ids).size!==existing.length||b.ids.length!==existing.length||!b.ids.every(v=>existing.includes(v))||!existing.includes(b.cover_id))throw Object.assign(new Error('Daftar foto tidak valid'),{statusCode:400});
   await c.query('UPDATE property_media SET is_cover=false WHERE property_id=$1',[id]);
   for(const [i,mid] of b.ids.entries())await c.query('UPDATE property_media SET sort_order=$1,is_cover=$2,alt=coalesce($3,alt) WHERE id=$4 AND property_id=$5',[i,mid===b.cover_id,b.alts?.[mid]||null,mid,id]);
  });return reply.send({saved:true});
 });
 app.delete('/api/admin/properties/:id/media/:mid',async(req,reply)=>{
  const p=z.object({id:z.coerce.number().int().positive(),mid:z.coerce.number().int().positive()}).parse(req.params);
  await transaction(async c=>{await c.query('SELECT id FROM properties WHERE id=$1 FOR UPDATE',[p.id]);await c.query('DELETE FROM property_media WHERE id=$1 AND property_id=$2',[p.mid,p.id]);await c.query('UPDATE property_media SET is_cover=true WHERE id=(SELECT id FROM property_media WHERE property_id=$1 ORDER BY is_cover DESC,sort_order,id LIMIT 1) AND NOT EXISTS(SELECT 1 FROM property_media WHERE property_id=$1 AND is_cover)',[p.id]);});return reply.send({deleted:true});
 });
}
