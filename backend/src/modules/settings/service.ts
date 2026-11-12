import { query } from '../../db/client.js';
export async function settings():Promise<Record<string,string>>{return Object.fromEntries((await query('SELECT key,value FROM site_settings')).map(r=>[r.key,r.value]));}
export const money=(n:number|string)=>'Rp'+new Intl.NumberFormat('id-ID').format(Number(n));
export const period=(p:string)=>({bulan:'/bulan',tahun:'/tahun',sekali:'sekali bayar'}[p]||'');
export const availability=(s:string)=>({tersedia:'Tersedia',dipesan:'Dipesan',terisi:'Terisi / Terjual'}[s]||s);
export const propertyPath=(p:Record<string,unknown>)=>`/properti/${p.category_slug}/${p.slug}`;
