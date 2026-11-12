import pg from 'pg';
import { env } from '../config/env.js';
export const pool = new pg.Pool({connectionString:env.DATABASE_URL, max:10});
export const query = async (sql:string, values:unknown[]=[]) => (await pool.query(sql,values)).rows;
export async function transaction<T>(fn:(client:pg.PoolClient)=>Promise<T>):Promise<T>{
 const c=await pool.connect(); try {await c.query('BEGIN'); const result=await fn(c); await c.query('COMMIT'); return result;} catch(e){await c.query('ROLLBACK');throw e;} finally{c.release();}
}
