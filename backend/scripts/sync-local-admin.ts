import { chmod, readFile } from 'node:fs/promises';
import argon2 from 'argon2';
import { z } from 'zod';
import { env } from '../src/config/env.js';
import { pool, transaction } from '../src/db/client.js';

const file = 'storage/local-admin.txt';

try {
  if (env.NODE_ENV === 'production' || !['localhost', '127.0.0.1', '[::1]'].includes(new URL(env.DATABASE_URL).hostname)) {
    throw new Error('Perintah ini hanya untuk database pengembangan lokal.');
  }

  const content = await readFile(file, 'utf8');
  const lines = content.split(/\r?\n/);
  const emailLine = lines.filter(line => /^Email:/i.test(line));
  const passwordLine = lines.filter(line => /^(Kata sandi|Password):/i.test(line));
  if (emailLine.length !== 1 || passwordLine.length !== 1) {
    throw new Error(`Isi ${file} harus memuat tepat satu baris Email: dan satu baris Kata sandi:.`);
  }

  const email = emailLine[0].replace(/^Email:[ \t]*/i, '').trim().toLowerCase();
  const password = passwordLine[0].replace(/^(Kata sandi|Password):[ \t]*/i, '');
  if (!z.string().email().max(254).safeParse(email).success || !z.string().min(12).max(512).safeParse(password).success) {
    throw new Error('Email harus valid dan kata sandi harus berisi 12–512 karakter.');
  }

  const requestedId = process.argv[2];
  if (requestedId && !/^[1-9][0-9]*$/.test(requestedId)) {
    throw new Error('ID admin harus bilangan bulat positif: npm run admin:sync-local -- <id>.');
  }

  await chmod(file, 0o600);
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  const id = await transaction(async client => {
    const admins = (await client.query('SELECT id,email FROM admins ORDER BY id FOR UPDATE')).rows;
    const target = requestedId
      ? admins.find(admin => admin.id === Number(requestedId))
      : admins.find(admin => admin.email.toLowerCase() === email) || (admins.length === 1 ? admins[0] : null);
    if (!target) {
      throw new Error(admins.length === 0
        ? 'Belum ada akun admin. Jalankan npm run admin:create terlebih dahulu.'
        : 'Akun tujuan tidak dapat ditentukan. Gunakan npm run admin:sync-local -- <id> untuk memilih akun.');
    }

    await client.query('UPDATE admins SET email=$1,password_hash=$2,failed_attempts=0,locked_until=NULL WHERE id=$3', [email, hash, target.id]);
    await client.query('DELETE FROM admin_sessions WHERE admin_id=$1', [target.id]);
    return target.id;
  });

  console.log(`Akun admin ID ${id} diperbarui dari ${file}. Sesi lama dicabut. Silakan login kembali.`);
} catch (error) {
  // Do not print database errors, hashes, or input credentials.
  const e = error as Error & { code?: string };
  if (e.code === '23505') console.error('Email sudah dipakai akun admin lain; tidak ada perubahan disimpan.');
  else if (e.code === 'ENOENT') console.error(`Berkas ${file} tidak ditemukan.`);
  else if (e.code) console.error('Sinkronisasi gagal. Periksa koneksi database dan izin berkas lokal.');
  else console.error(e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
