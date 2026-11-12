# HunianMu

MVP katalog properti dan layanan iklan custom, berdasarkan **PRD — Website HunianMu** di [PRD.md](PRD.md). Node.js 24, TypeScript, Fastify, Nunjucks SSR, Tailwind CSS, PostgreSQL 16. Tanpa WordPress/CMS. Aplikasi dan PostgreSQL berjalan langsung di host; proses produksi dikelola PM2 dan Nginx. Semua halaman berbahasa Indonesia; aset dan font dilayani lokal.

## Menjalankan lokal

Prasyarat: Node.js 22+ (diuji Node 24), npm, PostgreSQL 16+ beserta `psql`, `pg_dump`, `pg_restore`. Untuk tes browser gunakan Chromium Playwright.

```sh
npm ci
# Linux dengan PostgreSQL 16 terpasang; membuat cluster khusus port 55432 dan .env bila belum ada:
npm run db:local
npm run db:migrate
npm run db:seed
npm run build
npm run admin:create
npm run dev
```

Publik: **http://localhost:8821**. Admin: **http://localhost:8821/admin**. Login: `/admin/login`. Isi email, nama, dan kata sandi minimal 12 karakter melalui perintah `admin:create`. Tidak ada akun/kata sandi bawaan pada seed. Jangan menjalankan aplikasi memakai kredensial contoh.

Pada workspace implementasi, akun lokal dengan kata sandi acak tersedia dalam `storage/local-admin.txt` (izin 600, tidak masuk Git). Jika file tidak ada, gunakan `npm run admin:create`.

File tersebut hanya catatan; login membaca akun di PostgreSQL. Setelah mengubah baris `Email:` dan `Kata sandi:` pada file, terapkan perubahan dengan:

```sh
npm run admin:sync-local
```

Kata sandi minimal 12 karakter. Perintah ini memperbarui akun dengan email yang cocok, atau satu-satunya akun admin lokal jika email juga diganti. Jika ada beberapa akun dan email baru belum terdaftar, pilih akun secara eksplisit: `npm run admin:sync-local -- <id>`. Kata sandi di-hash menggunakan Argon2id; penguncian akun direset dan sesi lama dicabut. Sinkronisasi hanya tersedia untuk database pengembangan pada localhost, tidak berjalan otomatis saat login, dan tidak menampilkan kata sandi di terminal.

`db:local` hanya membuat cluster milik proyek di `storage/pgdata` dan mendengarkan loopback. Skrip dapat dijalankan berulang kali, memakai kembali database yang sudah ada, dan tidak memerlukan ripgrep (`rg`). Kegagalan pemeriksaan database menghentikan skrip tanpa mencoba membuat database. Autentikasi trust ini **khusus pengembangan lokal**. Ia tidak mengubah PostgreSQL sistem. Override lokasi binari dengan `PG_BIN=/path/to/postgres/bin`. Untuk menghentikannya:

```sh
/usr/lib/postgresql/16/bin/pg_ctl -D "$PWD/storage/pgdata" stop
```

Untuk PostgreSQL yang sudah dikelola sendiri, salin `.env.example` ke `.env`, isi `DATABASE_URL`, dan buat `SESSION_KEY` melalui `openssl rand -hex 32`. Jangan jalankan `db:local`. Akun DB untuk tes integrasi memerlukan izin `CREATEDB`; gunakan akun khusus pengembangan/CI, bukan akun runtime produksi.

Variabel utama: `NODE_ENV`, `DATABASE_URL`, `SESSION_KEY` (64 hex), `SITE_URL`, `HOST`, `PORT`, `UPLOAD_DIR`, `TRUST_PROXY`. `SITE_URL` harus HTTPS pada produksi. `TRUST_PROXY=true` hanya ketika aplikasi tidak bisa dijangkau selain lewat proxy tepercaya.

## Data demo dan pengelolaan

Seed idempoten mengisi 5 kategori, 5 lokasi, 6 fasilitas, 3 paket, pengaturan dan panduan, lalu 18 listing demo jika belum ada listing. Seed tidak menimpa konfigurasi atau listing pengguna. Nomor WhatsApp `6200000000000` sengaja berupa nomor dummy. Harga paket dan wilayah Yogyakarta adalah asumsi demo, bukan keputusan bisnis.

Lewat `/admin`:

- Buat listing sebagai Draf → Simpan → unggah foto → atur urutan/sampul → Pratinjau → ubah status Terbit → Simpan. Publikasi langsung muncul di katalog dan sitemap.
- Ubah ketersediaan satu ketukan, tandai Pilihan, duplikasi ke Draf, arsipkan, atau soft delete.
- Kelola kategori/lokasi/fasilitas, paket aktif, inbox iklan/survei beserta status dan catatan internal.
- Ubah nomor dan templat WhatsApp, wilayah, jam layanan, sosial, SEO, serta isi Cara Kerja/Kebijakan Privasi tanpa deploy.

Foto: JPG/PNG/WebP, maksimal 8 MB/foto, 15 berkas per unggahan dan 30 foto/listing; divalidasi lewat decoder, metadata dibuang dan diproses ulang menjadi WebP 480/960/1600 px. Berkas asli tidak disajikan. Menghapus media menghapus relasinya dari listing; berkas yang mungkin masih digunakan salinan listing dipertahankan. Bersihkan berkas yatim hanya setelah audit referensi dan retensi cadangan. Video MVP memakai tautan YouTube HTTPS. Formulir iklan menerima tautan foto HTTPS opsional.

Sumber foto demo hanya URL yang sudah direferensikan desain HunianMu yang diberikan. Salinan lokal sudah disertakan di `frontend/public/img`; instalasi tidak memerlukan jaringan untuk gambar/font. `npm run demo:assets` hanya diperlukan untuk mengunduh ulang aset referensi. Penggunaan materi produksi perlu izin pemilik.

## Alur WhatsApp dan data

Semua CTA melewati `/whatsapp` dan menyimpan `whatsapp_click` sebelum redirect `wa.me`. Kode dan URL listing selalu disertakan untuk konteks listing, termasuk survei. UTM diteruskan dari URL dan disimpan dalam sessionStorage per tab selama tersedia. Event menyimpan halaman asal, konteks sumber, waktu, dan lima UTM. URL kampanye saat ini tetap berfungsi jika penyimpanan browser diblokir.

Pengiriman formulir iklan/survei menggunakan transaksi untuk menyimpan pengajuan dan event `ad_request_submitted` / `survey_request_submitted`. Baru setelah commit, browser diarahkan ke `/whatsapp` untuk event klik yang terpisah lalu ke WhatsApp. Penolakan atau kegagalan membuka WhatsApp tidak menghapus pengajuan. Tanpa JavaScript, formulir tetap dapat disubmit dan server mengarahkan setelah penyimpanan. UI survei sederhana sudah tersedia, walau FR-308 adalah P1.

Kolom `owner_name` dan `owner_contact` hanya dibaca rute admin. Query publik menggunakan daftar kolom eksplisit. Catatan pengajuan, token, hash, dan sesi tidak tersedia pada API publik.

## Verifikasi

```sh
npm run typecheck
npm run lint
npm run build
npm test                    # database sementara terisolasi, otomatis dihapus
npx playwright install chromium
npm run test:e2e            # jalankan app terlebih dahulu; Chromium + PostgreSQL lokal
npm run test:backup         # dump database/media dan restore ke database uji baru
npm audit
```

Tes browser membuat akun sementara berkata sandi acak, membuat/menerbitkan listing melalui UI, menguji foto, katalog, galeri, CTA mobile, WhatsApp, pengajuan, inbox, aksesibilitas, dan overflow 360/768/1440 px. Tujuan `wa.me` dicegat; tes tidak mengirim pesan. Akun tes dihapus; listing tes di-soft-delete. Pengajuan/event tes tetap tersimpan untuk audit lokal. Jangan arahkan E2E ke produksi. Screenshot dan laporan JSON terdapat di `artifacts/` (diabaikan Git).

[Laporan verifikasi dan matriks FR](docs/implementation.md) menjelaskan hasil aktual dan batas yang belum diuji. Lighthouse/SEO lokal tidak menggantikan pemeriksaan indexing dan preview WhatsApp pada domain produksi.

## Struktur dan rilis

Jalankan seluruh perintah npm dari root proyek. Frontend tetap dirender server melalui Nunjucks; pemisahan folder tidak menambah proses atau server terpisah.

```text
hunianmu/
├── backend/
│   ├── src/                # Fastify, autentikasi, modul, koneksi dan runner database
│   ├── scripts/            # CLI pembuatan admin
│   └── dist/               # hasil build TypeScript (diabaikan Git)
├── frontend/
│   ├── views/              # template Nunjucks publik dan admin
│   ├── assets/             # sumber CSS dan JavaScript
│   ├── public/             # gambar, font, dan hasil build aset
│   ├── designs/            # referensi desain HunianMu desktop/mobile asli
│   ├── scripts/            # penyiapan ulang aset demo
│   └── tailwind.config.js
├── database/
│   ├── migrations/         # SQL berurutan, terlacak schema_migrations
│   ├── seeds/              # SQL data demo
│   └── scripts/            # cluster PostgreSQL lokal dan uji backup/restore
├── tests/                  # integrasi backend/database dan E2E lintas lapisan
├── deploy/                 # Nginx, PM2, skrip rilis, backup/restore
├── docs/                   # skema, panduan rilis, dan laporan implementasi
├── storage/                # data PostgreSQL lokal, unggahan, dan kredensial lokal
├── package.json            # perintah dan dependensi bersama
└── PRD.md
```

Migrasi tetap atomik dan dilindungi advisory lock. Direktori `storage/` tidak dipindahkan, sehingga cluster PostgreSQL, unggahan dan konfigurasi lokal yang sudah ada tetap digunakan. Hasil build server sekarang `backend/dist/server.js`; URL publik/admin dan seluruh perintah npm tetap sama.

```sh
npm run build
npm run db:migrate
npm start
```

Panduan Node.js + PostgreSQL native, Nginx, PM2, CI, backup/restore, dan urutan rilis: [docs/deployment.md](docs/deployment.md). Skema: [docs/database.md](docs/database.md).
