import { query, transaction } from '../../db/client.js';
import { filterSchema, propertySchema } from './schema.js';
export const publicColumns=`p.id,p.code,p.slug,p.title,p.description,p.type_id,p.location_id,p.public_address,p.price,p.price_period,p.land_area,p.building_area,p.bedrooms,p.bathrooms,p.certificate,p.furniture,p.kos_type,p.room_size,p.rules,p.video_url,p.availability,p.featured,p.seo_title,p.seo_description,p.updated_at,t.name AS category_name,t.slug AS category_slug,l.name AS location_name,l.slug AS location_slug`;
const join=' FROM properties p JOIN property_types t ON t.id=p.type_id JOIN locations l ON l.id=p.location_id ';
const cover=`,(SELECT thumb_path FROM property_media WHERE property_id=p.id ORDER BY is_cover DESC,sort_order,id LIMIT 1) AS cover`;
export async function masters(){const [types,locations,facilities]=await Promise.all([query('SELECT * FROM property_types ORDER BY id'),query('SELECT * FROM locations ORDER BY name'),query('SELECT * FROM facilities ORDER BY id')]);return {types,locations,facilities};}
export async function catalog(input:unknown){
 const f=filterSchema.parse(input),args:unknown[]=[],where=["p.status='terbit'",'p.deleted_at IS NULL'];
 const add=(sql:string,v:unknown)=>{args.push(v);where.push(sql.replaceAll('?',`$${args.length}`));};
 if(f.q)add("(p.title ILIKE ? OR p.description ILIKE ? OR p.public_address ILIKE ? OR l.name ILIKE ?)",`%${f.q.replace(/[\\%_]/g,'\\$&')}%`);
 if(f.category)add('t.slug=?',f.category);if(f.location)add('l.slug=?',f.location);
 if(f.min_price!=null)add('p.price>=?',f.min_price);if(f.max_price!=null)add('p.price<=?',f.max_price);
 if(f.availability)add('p.availability=?',f.availability);if(f.bedrooms)add('p.bedrooms>=?',f.bedrooms);
 if(f.kos_type)add('p.kos_type=?',f.kos_type);if(f.min_land!=null)add('p.land_area>=?',f.min_land);if(f.max_land!=null)add('p.land_area<=?',f.max_land);
 const clause=` WHERE ${where.join(' AND ')}`,count=Number((await query('SELECT count(*)'+join+clause,args))[0].count),pageSize=9;
 const order={terbaru:'p.published_at DESC NULLS LAST,p.id DESC',termurah:'p.price ASC,p.id DESC',termahal:'p.price DESC,p.id DESC'}[f.sort];
 const rows=await query(`SELECT ${publicColumns}${cover}${join}${clause} ORDER BY ${order} LIMIT $${args.length+1} OFFSET $${args.length+2}`,[...args,pageSize,(f.page-1)*pageSize]);
 return {items:rows,total:count,page:f.page,pages:Math.ceil(count/pageSize),filters:f};
}
export async function detail(slug:string,preview=false){
 const rows=await query(`SELECT ${publicColumns}${cover}${join} WHERE p.slug=$1 AND p.deleted_at IS NULL ${preview?'':"AND p.status='terbit'"}`,[slug]);
 if(!rows.length)return null;const p=rows[0];
 p.media=await query('SELECT id,path,medium_path,thumb_path,alt,width,height,sort_order,is_cover FROM property_media WHERE property_id=$1 ORDER BY is_cover DESC,sort_order,id',[p.id]);
 p.facilities=await query('SELECT f.id,f.name,f.icon FROM facilities f JOIN property_facilities pf ON pf.facility_id=f.id WHERE pf.property_id=$1',[p.id]);return p;
}
export async function saveProperty(input:unknown,id?:number){
 const data=propertySchema.parse(input),{facility_ids,...fields}=data;
 return transaction(async c=>{
  if(id){const old=(await c.query('SELECT slug FROM properties WHERE id=$1 AND deleted_at IS NULL FOR UPDATE',[id])).rows[0];if(!old)throw Object.assign(new Error('Listing tidak ditemukan'),{statusCode:404});if(old.slug!==fields.slug){await c.query('INSERT INTO property_redirects(slug,property_id) VALUES($1,$2) ON CONFLICT(slug) DO UPDATE SET property_id=$2',[old.slug,id]);}}
  // A former slug may not be claimed by another listing.
  if((await c.query('SELECT 1 FROM property_redirects WHERE slug=$1 AND property_id<>$2',[fields.slug,id||0])).rowCount)throw Object.assign(new Error('Slug pernah digunakan listing lain'),{statusCode:409});
  const keys=Object.keys(fields),values=Object.values(fields);let row;
  if(id)row=(await c.query(`UPDATE properties SET ${keys.map((k,i)=>`${k}=$${i+1}`).join(',')},updated_at=now(),published_at=CASE WHEN $${keys.indexOf('status')+1}='terbit' THEN coalesce(published_at,now()) ELSE published_at END WHERE id=$${values.length+1} RETURNING *`,[...values,id])).rows[0];
  else row=(await c.query(`INSERT INTO properties(${keys.join(',')},published_at) VALUES(${keys.map((_,i)=>`$${i+1}`).join(',')},CASE WHEN $${keys.indexOf('status')+1}='terbit' THEN now() ELSE NULL END) RETURNING *`,values)).rows[0];
  await c.query('DELETE FROM property_facilities WHERE property_id=$1',[row.id]);
  for(const fid of new Set(facility_ids))await c.query('INSERT INTO property_facilities(property_id,facility_id) VALUES($1,$2)',[row.id,fid]);return row;
 });
}
