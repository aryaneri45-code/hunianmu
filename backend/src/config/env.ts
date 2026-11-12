import 'dotenv/config';
import { z } from 'zod';
z.config(z.locales.id());
export const env = z.object({
 NODE_ENV:z.enum(['development','test','production']).default('development'),
 HOST:z.string().default('127.0.0.1'), PORT:z.coerce.number().int().positive().default(8821),
 SITE_URL:z.string().url().default('http://localhost:8821'), DATABASE_URL:z.string().min(1),
 SESSION_KEY:z.string().regex(/^[a-f0-9]{64}$/i,'SESSION_KEY harus 64 karakter heksadesimal'),
 UPLOAD_DIR:z.string().default('storage/uploads'), TRUST_PROXY:z.enum(['true','false']).default('false')
}).parse(process.env);
if (env.NODE_ENV==='production' && !env.SITE_URL.startsWith('https://')) throw new Error('Produksi memerlukan SITE_URL HTTPS');
