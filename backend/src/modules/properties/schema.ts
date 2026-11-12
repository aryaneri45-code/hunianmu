import { z } from 'zod';
const text=(max=300)=>z.string().trim().max(max);
const num=z.coerce.number().finite().min(0).max(999999999999);
const optionalNumber=z.preprocess(v=>v===''||v==null?undefined:v,num.optional());
const int=z.coerce.number().int().min(0).max(1000).default(0);
export const bool=z.preprocess(v=>v===true||v==='true'||v==='on',z.boolean());
export const ids=z.preprocess(v=>v==null||v===''?[]:Array.isArray(v)?v:[v],z.array(z.coerce.number().int().positive()).max(100));
export const safeUrl=z.union([z.literal(''),z.string().url().max(2000).refine(s=>/^https:\/\//.test(s),'Gunakan tautan HTTPS')]);
export const propertySchema=z.object({
 title:text(180).min(5),slug:text(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),description:text(20000).min(20),
 type_id:z.coerce.number().int().positive(),location_id:z.coerce.number().int().positive(),public_address:text(500).min(3),
 price:num,price_period:z.enum(['bulan','tahun','sekali']),land_area:num.default(0),building_area:num.default(0),bedrooms:int,bathrooms:int,
 certificate:text(100).default(''),furniture:text(100).default(''),kos_type:z.enum(['','putra','putri','campur']).default(''),room_size:text(100).default(''),rules:text(3000).default(''),
 video_url:z.union([z.literal(''),z.string().url().refine(s=>{try{const u=new URL(s);return u.protocol==='https:'&&['www.youtube.com','youtube.com','youtu.be'].includes(u.hostname);}catch{return false;}},'Gunakan tautan YouTube HTTPS')]).default(''),
 availability:z.enum(['tersedia','dipesan','terisi']).default('tersedia'),featured:bool,status:z.enum(['draf','terbit','arsip']).default('draf'),
 owner_name:text(150).default(''),owner_contact:text(50).default(''),seo_title:text(180).default(''),seo_description:text(320).default(''),facility_ids:ids
});
export const filterSchema=z.object({q:text(200).default(''),category:text(100).default(''),location:text(100).default(''),min_price:optionalNumber,max_price:optionalNumber,availability:z.enum(['','tersedia','dipesan','terisi']).default(''),bedrooms:int,kos_type:z.enum(['','putra','putri','campur']).default(''),min_land:optionalNumber,max_land:optionalNumber,sort:z.enum(['terbaru','termurah','termahal']).default('terbaru'),page:z.coerce.number().int().min(1).max(100000).default(1)}).refine(v=>v.min_price==null||v.max_price==null||v.min_price<=v.max_price,{message:'Harga minimum melebihi maksimum',path:['max_price']});
export const requestStatus=z.object({status:z.enum(['baru','dihubungi','deal','ditolak']),notes:text(5000).default('')});
export const packageSchema=z.object({name:text(150).min(3),description:text(3000).min(10),channel:z.enum(['website','sosial','gabungan']),price:num,duration_days:z.coerce.number().int().positive().max(3650),features:z.preprocess(v=>typeof v==='string'?v.split('\n').map(s=>s.trim()).filter(Boolean):v,z.array(text(300)).min(1).max(30)),active:bool,sort_order:z.coerce.number().int().min(0).max(1000).default(0)});
export const masterSchema=z.object({name:text(150).min(2),slug:text(150).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),kind:z.enum(['kota','kecamatan','kelurahan']).default('kecamatan'),parent_id:z.preprocess(v=>v===''||v==null?null:v,z.coerce.number().int().positive().nullable()),icon:text(50).default('check')});
