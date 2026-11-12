# Hasil implementasi MVP P0

Acuan: `PRD.md`, judul **PRD — Website HunianMu**, versi 1.0 tanggal 12 November 2026. Diperiksa 13 November 2026 WIB. Folder awal hanya berisi PRD dan dua folder desain; tidak ada aplikasi, dependensi, migrasi, AGENTS.md yang berlaku, atau metadata `.git`. Aset desain asli dipertahankan; rekomendasi operasional PRD disesuaikan dengan keputusan pengguna. Tidak dibuat commit atau deployment eksternal.

## Penataan folder

Source kini dikelompokkan menjadi `backend/` (Fastify, modul, runner SQL dan CLI admin), `frontend/` (views, aset, public, konfigurasi Tailwind dan referensi desain), serta `database/` (migrasi, seed dan skrip PostgreSQL lokal/uji backup). `tests/`, `deploy/`, `docs/`, konfigurasi bersama dan PRD tetap di root. Struktur awal yang dibahas di bawah merupakan riwayat implementasi. Database dan berkas di `storage/` tidak dipindahkan.

Verifikasi setelah penataan: typecheck, lint, build, 9 skenario integrasi, 16 pemeriksaan browser dan uji backup/restore lulus. Runner migrasi hasil build juga berhasil dijalankan.

Server port 3000 dihentikan sesuai permintaan. Verifikasi setelah penataan menggunakan port sementara 3001 dan proses uji dihentikan setelah selesai. Port default aplikasi kemudian diubah menjadi **8821** (termasuk SITE_URL, Nginx, PM2 dan tes browser). Perintah npm tetap dijalankan dari root; `npm run dev` dapat digunakan jika ingin menyalakan server lagi.

## Operasional native

Aplikasi memakai Node.js dan PostgreSQL yang berjalan langsung di host. Konfigurasi PM2 menetapkan root proyek sebagai cwd dan port 8821; Nginx meneruskan domain HunianMu ke port tersebut. CI juga menyiapkan PostgreSQL langsung pada runner. Instruksi lengkap tersedia di `docs/deployment.md`. Verifikasi penyesuaian ini: `db:local`, migrasi, typecheck, lint, build, 9 skenario integrasi, serta smoke test Node.js pada port 8821 lulus. Sintaks shell, konfigurasi PM2 dan YAML workflow CI diperiksa; workflow belum dieksekusi di GitHub. Server smoke test dihentikan setelah pengujian.

## Rencana dan hasil berdasarkan FR

Seluruh **40 FR berprioritas P0** sudah diimplementasikan; tidak ada FR P0 yang sengaja ditunda.

| FR P0 | Hasil |
| --- | --- |
| FR-101, 102, 103, 105, 106 | Beranda: pencarian mengarah ke katalog; lima kategori dengan jumlah listing terbit; maksimal delapan pilihan admin; tiga layanan iklan; CTA WhatsApp admin. Urutan konten mengikuti PRD. |
| FR-201, 202, 203, 205, 206 | Katalog kartu SSR, pencarian judul/alamat umum/deskripsi/nama lokasi; kategori, lokasi, harga, ketersediaan, kamar tidur, luas tanah, tipe kos; tiga pengurutan; paginasi sembilan hasil; query URL bisa dibagikan dan dibuka ulang. Filter angka kosong tidak menjadi nol. |
| FR-301, 302, 303, 304, 305, 307, 311 | Galeri geser/zoom dengan navigasi tombol/keyboard; video YouTube; kode, harga/periode, lokasi umum, spesifikasi, fasilitas, status termasuk Terisi tetap tampil; CTA mobile tetap terlihat; OG per listing dengan foto. |
| FR-401, 402, 403, 404, 405, 406 | Layanan, contoh hasil berupa listing/ilustrasi penempatan sosial, paket editable harga/durasi/fitur, empat langkah, formulir pengajuan termasuk tautan foto opsional, transaksi sebelum redirect, serta konsultasi WhatsApp langsung. |
| FR-501, 503 | Tiga panduan bernomor mencari/survei/iklan dengan CTA masing-masing. |
| FR-601, 602 | WhatsApp, wilayah, jam layanan dan sosial berasal dari database/pengaturan admin. Sosial kosong tidak menghasilkan tautan mati. |
| FR-701, 702, 703 | Setiap CTA WhatsApp melewati endpoint pelacakan; listing membawa kode dan URL; halaman asal, waktu, sumber konteks dan lima UTM disimpan. Pengajuan iklan/survei dan event submit disimpan sebelum event klik dan redirect. |
| FR-801 | Login Argon2id; cookie sesi terenkripsi, HttpOnly, SameSite, Secure pada produksi; sesi server-side untuk pencabutan; CSRF; limit login dan penguncian sementara di database. Tidak ada password bawaan. |
| FR-802, 804, 805 | CRUD, soft delete, duplikasi termasuk foto ke Draf, arsip, pratinjau terproteksi; Draf/Terbit/Arsip; ketersediaan satu ketukan; pilihan beranda. Perubahan langsung tercermin di publik. |
| FR-803 | Unggah banyak foto; validasi MIME dan decoder; batas ukuran/piksel/jumlah; nama UUID; metadata dibuang; WebP tiga ukuran; urutan, alt, sampul dan penghapusan relasi media. |
| FR-806, 807 | Master kategori/lokasi/fasilitas; paket nama/harga/durasi/fitur/aktif/urutan, seluruhnya dapat dikelola melalui UI admin. |
| FR-808, 811, 813 | Inbox iklan dan survei, status Baru/Dihubungi/Deal/Ditolak serta catatan internal; data pemilik hanya admin, tidak dikirim query/API/template publik; panel responsif. |

P1 yang juga tersedia: pilihan lokasi FR-104, empty state FR-207, UI survei FR-308, konten panduan editable FR-502, dashboard klik FR-704, settings FR-809, dashboard ringkas FR-810. **UI survei tidak ditunda.** P1 yang belum dikerjakan: filter fasilitas FR-204, peta FR-306, tombol bagikan FR-309, properti serupa FR-310, FAQ FR-407. Peran Editor/Super Admin FR-812 (P2) belum diterapkan; akun yang dibuat adalah admin penuh.

SEO tambahan: metadata/canonical halaman, schema.org RealEstateListing/Offer, sitemap dinamis yang hanya memuat listing Terbit, robots.txt, noindex/no-store untuk admin/API admin dan endpoint WhatsApp, pengalihan 301 untuk slug lama serta kategori lama. Kebijakan Privasi tersedia dan editable (teks demo).

## Asumsi desain dan bisnis

- Desain desktop/mobile HunianMu menjadi acuan: navy #132338, hijau WhatsApp, kanvas terang, Plus Jakarta Sans, kartu foto, panel admin, dan sticky CTA mobile. Logo asli dipakai dengan proporsi utuh; font dan gambar referensi disimpan lokal. Rekomendasi warna/font generik dari UI/UX skill tidak mengganti identitas HunianMu.
- Susunan PRD diutamakan ketika contoh desain berbeda. Semua percakapan menuju **admin**, termasuk jika desain menyebut pemilik. Klaim “100% terverifikasi”, respons instan, komisi gratis, favorit pengguna dan login pengguna publik tidak ditambahkan karena tidak didukung data/scope P0.
- Wilayah demo Yogyakarta, tiga paket dan harga contoh, jam layanan contoh, serta nomor dummy dapat diubah tanpa deploy. Tidak ada keputusan bisnis yang menghalangi pengujian lokal.
- Video menggunakan YouTube HTTPS (salah satu opsi FR-301); formulir iklan menerima tautan foto HTTPS (opsi yang memenuhi FR-404). Unggah foto listing dilakukan di admin.
- Berkas foto yang dilepas dari listing tetap berada di disk untuk melindungi foto yang dipakai duplikasi; relasi publiknya dihapus. Pembersihan berkas yatim menjadi pekerjaan pemeliharaan terkontrol.

## Verifikasi aktual

- `npm run db:local`: cluster PostgreSQL 16 khusus proyek, loopback port 55432, tanpa mengubah PostgreSQL sistem. PostgreSQL sistem sudah ada tetapi role user workspace tidak tersedia; isolasi lokal mengatasi kondisi ini tanpa sudo/password sistem.
- `npm run db:migrate`: ketiga migrasi diterapkan; pengulangan berhasil tanpa perubahan skema.
- `npm run db:seed`: 18 listing demo, kategori/lokasi/fasilitas/paket/settings/konten; seed tidak membuat admin.
- `npm run typecheck`: lulus, mencakup aplikasi, skrip dan tes.
- `npm run lint`: lulus tanpa warning.
- `npm run build`: TypeScript dan aset Tailwind/JS berhasil. CLI memberi pemberitahuan basis Browserslist lama; tidak menghalangi build.
- `npm test`: 9 skenario integrasi lulus menggunakan database sementara terisolasi. Mencakup draft/pratinjau/publish, lima foto, cover/urutan, privasi, filter termasuk angka kosong/injeksi, event/UTM, submit iklan/survei terpisah, inbox, master/paket/settings, XSS, SVG/berkas palsu, perubahan slug/301, duplikasi/arsip/soft delete, sitemap/robots, logout, CSRF termasuk input multibyte, rate limit dan penguncian akun.
- `npm run test:e2e`: 16 pemeriksaan UI lulus; alur UI diuji di Chromium. Login/admin dan pembuatan/publikasi listing beserta lima foto dijalankan dengan viewport mobile 360px (3 detik melalui otomasi; bukan pengukuran kecepatan manusia). UI survei mobile juga menyimpan pengajuan sebelum redirect. Pencarian beranda → katalog → filter URL → detail desktop/mobile → galeri → WhatsApp → pengajuan/inbox. Seluruh halaman publik dan admin diuji respons 200/tanpa overflow pada 360/768/1440px. Tidak ada error JavaScript. Redirect WhatsApp diverifikasi dan dicegat pada endpoint lokal; tidak ada pesan dikirim.
- Axe WCAG A/AA: tidak ada pelanggaran pada empat halaman perwakilan (beranda, katalog, formulir iklan, daftar listing admin).
- Lighthouse beranda mobile lokal: **Performance 88, Accessibility 100, Best Practices 100, SEO 100; LCP 1,5 detik, CLS 0**. Lighthouse memperingatkan CPU host lebih lambat dari kalibrasi bawaan. Hasil ini pengukuran lokal, bukan jaminan performa jaringan produksi.
- `npm run test:backup`: custom dump PostgreSQL dan arsip media berhasil; restore ke database kosong terpisah berhasil; jumlah listing dan tiga migrasi cocok. Database restore dihapus setelah uji. Jadwal produksi/offsite belum dipasang.
- Runtime hasil build (`node backend/dist/server.js`) juga diuji dengan NODE_ENV=production pada port sementara: health dan tujuh rute publik/SEO merespons 200; cookie login memuat Secure/HttpOnly/SameSite=Lax dan admin tetap noindex. Proses sementara dihentikan setelah verifikasi. Metadata description unik pada enam halaman publik juga diperiksa.
- `npm audit`: 0 vulnerabilities. Override minimatch ke versi perbaikan digunakan untuk dependensi tooling; lint/build/test tetap lulus.

Bukti lokal: `artifacts/e2e-results.json`, `artifacts/accessibility.json`, `artifacts/backup-results.json`, `artifacts/lighthouse-home.json`, dan screenshot desktop/mobile. `artifacts/` sengaja diabaikan Git agar hasil tes lokal tidak menjadi source aplikasi.

## Yang belum terverifikasi dan keputusan rilis

- Proses PM2, Nginx/TLS, dan workflow CI belum dijalankan pada server rilis atau GitHub. Runtime Node.js dan PostgreSQL native diuji langsung pada host lokal.
- Belum ada domain publik, sehingga indexing Search Console, crawler internet dan preview Open Graph di WhatsApp belum diuji. Metadata HTML dan sitemap telah diperiksa lokal. WhatsApp nyata tidak dikirim; nomor demo perlu diganti.
- Safari/iOS, Firefox/Edge dan perangkat nyata belum diuji. Pengujian mobile saat ini emulasi viewport Chromium.
- Belum memasang cron harian/offsite, uptime alert, DNS/TLS, atau akun analitik eksternal. Skrip/jadwal contoh tersedia, event utama tersimpan first-party di PostgreSQL. Pemulihan media ke direktori produksi belum disimulasikan.
- Sebelum rilis, tetapkan wilayah nyata, nomor/jam layanan, URL sosial, harga/durasi paket, kebijakan penempatan berbayar, domain/VPS/TLS dan penyimpanan backup terpisah. Sahkan teks privasi dan izin materi; ganti data demo dengan listing nyata dan nonaktifkan demo mode. Tidak ada pembayaran, akun pemilik, atau CMS siap pakai ditambahkan.
