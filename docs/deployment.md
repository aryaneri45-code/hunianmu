# Rilis dan operasional

Aplikasi memerlukan PostgreSQL persisten, disk media persisten, Node 22+ (diuji 24), dan HTTPS. Runtime produksi tidak boleh memakai cluster trust pengembangan. Aplikasi tidak membuka port database ke internet.

## VPS + PM2

1. Provision PostgreSQL dengan role/database khusus dan password acak. Buat `.env` dari `.env.example`, isi SITE_URL HTTPS dan SESSION_KEY acak. Pisahkan role migrasi dari role runtime bila diperlukan.
2. `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run db:migrate`. Jalankan seed **hanya** pada lingkungan demo; masukkan data produksi yang telah disahkan melalui admin.
3. `npm run admin:create` lewat terminal. Password minimal 12 karakter, di-hash Argon2id; tidak ada kredensial admin dalam repositori. Untuk otomasi, pasok ADMIN_EMAIL/ADMIN_NAME/ADMIN_PASSWORD dari secret manager, bukan argumen shell atau file versi.
4. Pastikan PM2 terpasang pada host, lalu jalankan `pm2 start deploy/pm2.ecosystem.config.cjs`. Pastikan `.env` berada pada cwd aplikasi. Set TRUST_PROXY=true setelah Nginx terpasang dan app hanya bisa dicapai dari loopback.
5. Sesuaikan domain dan sertifikat pada `deploy/nginx/hunianmu.conf`; gunakan Let's Encrypt. Buka firewall hanya untuk SSH/80/443. Header CSP, HSTS produksi, no-sniff dan cookie HttpOnly/Secure/SameSite diberikan aplikasi.
6. Rilis selanjutnya: ambil commit yang ditinjau, jalankan `bash deploy/scripts/deploy.sh`. Buat backup sebelum migrasi. Skrip tidak menjalankan seed. Bila rilis gagal, periksa migrasi dan log; jangan rollback skema dengan menghapus data secara otomatis.

## Menjalankan langsung di host

Pada workspace lokal, PostgreSQL khusus proyek memakai port **55432** dan aplikasi memakai port **8821**. Seluruh perintah dijalankan dari root proyek:

```sh
npm ci
npm run db:local
npm run db:migrate
# Hanya untuk mengisi database demo pertama kali:
npm run db:seed
npm run build
npm start
```

Untuk pengembangan, gunakan `npm run dev` sebagai pengganti `npm start`. `.env` yang sudah ada dipertahankan, termasuk SESSION_KEY dan DATABASE_URL. Situs publik berada di `http://localhost:8821`, admin di `http://localhost:8821/admin`. Klaster lokal berada di `storage/pgdata`, unggahan di `storage/uploads`, dan backup di `storage/backups`; direktori ini tetap berada di host dan harus dipertahankan saat rilis.

Untuk PostgreSQL yang dikelola sendiri, isi DATABASE_URL pada `.env` dan lewati `db:local`. Pada produksi, jalankan PostgreSQL sebagai layanan sistem dengan role/password khusus; jangan memakai autentikasi trust dari skrip pengembangan.

## Pengelolaan proses produksi

Pasang PM2 pada host bila belum tersedia, lalu gunakan konfigurasi proses yang disediakan:

```sh
npm install --global pm2
pm2 start deploy/pm2.ecosystem.config.cjs
pm2 save
# Tampilkan instruksi pemasangan startup untuk user aplikasi:
pm2 startup
```

Jalankan instruksi startup yang ditampilkan PM2 sesuai user layanan server. Konfigurasi menentukan direktori kerja root proyek secara absolut, sehingga `.env`, template dan aset tetap terbaca meski perintah dijalankan dari direktori lain. PM2 menjalankan aplikasi sebagai proses Node.js pada `127.0.0.1:8821`; set SITE_URL ke domain HTTPS dan TRUST_PROXY=true setelah Nginx terpasang. Gunakan `pm2 logs hunianmu`, `pm2 restart hunianmu --update-env`, atau `pm2 stop hunianmu` untuk mengelola aplikasi ini saja.

Nginx yang sudah terpasang dapat melayani beberapa website. Tambahkan server block domain HunianMu dari `deploy/nginx/hunianmu.conf`, arahkan upstream ke `127.0.0.1:8821`, lalu verifikasi `nginx -t` sebelum reload. Port aplikasi website lain tidak perlu diubah.

## CI dengan PostgreSQL native

Workflow `.github/workflows/ci.yml` memasang PostgreSQL dan alat klien langsung pada runner Ubuntu. Langkah `db:local` memakai PG_BIN dari `pg_config --bindir`, membuat klaster pengujian di loopback port 55432, lalu menjalankan migrasi, seed dan tes. Klaster dihentikan pada akhir job. DATABASE_URL hanya menunjuk klaster runner; tidak memakai database atau rahasia produksi.

## Backup dan restore

```sh
node deploy/scripts/backup.mjs
# Pilih database kosong baru dengan izin yang sesuai:
RESTORE_DATABASE_URL='postgresql://user:password@host:5432/hunianmu_restore' node deploy/scripts/restore.mjs /path/file.dump
```

`backup.mjs` membaca DATABASE_URL tanpa menaruh password pada argumen pg_dump, membuat custom dump dan tar.gz upload, chmod 600, retensi 14 hari. BACKUP_DIR dan BACKUP_RETENTION_DAYS dapat diubah. Jadwal harian contoh: `deploy/backup.cron.example`. Pasang jadwal di server produksi dan salin hasil ke lokasi terpisah/encrypted object storage; kredensial/lokasi tujuan belum ditentukan.

Restore menolak target yang sama dengan DATABASE_URL untuk mendorong verifikasi pada database baru. Ia tidak menjalankan clean/drop. Uji `npm run test:backup` membuat database kosong, restore, membandingkan jumlah listing dan migrasi, lalu menghapus database uji. Untuk media: ekstrak tar ke direktori baru, audit izin dan kelengkapan, lalu ganti UPLOAD_DIR setelah verifikasi. Backup PostgreSQL dan media diambil berurutan; jika perlu konsistensi titik waktu saat upload ramai, jeda unggahan atau gunakan snapshot volume terkoordinasi.

## Sebelum domain publik

Sahkan wilayah, nomor WhatsApp aktif, jam layanan, akun sosial, harga/durasi paket, konten privasi, izin media dan listing nyata. Nonaktifkan demo banner setelah data demo diganti. Verifikasi domain/DNS/TLS, persetujuan operasional, snapshot backup luar server dan jadwal harian. Konfigurasikan uptime monitor `/health`, rotasi log/PM2 dan alert milik operator. Integrasi GA4/Plausible/Umami dan akun Search Console dapat dipasang setelah layanan/akun dipilih; event utama MVP sudah disimpan first-party di PostgreSQL.

Lakukan smoke test produksi, uji Search Console/schema, fetch Open Graph dari internet, dan preview WhatsApp. Uji Safari/iOS, Firefox dan Edge pada perangkat nyata. Tidak ada deployment cloud atau pengiriman WhatsApp nyata yang dilakukan dalam implementasi lokal ini.
