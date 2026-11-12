# PRD — Website HunianMu

Versi 1.0 · 12 November 2026 · Status: Draft untuk pengembangan MVP

## 1. Ringkasan Produk

HunianMu adalah website katalog properti sekaligus etalase layanan periklanan properti dan usaha. Website menampilkan listing indekos, kontrakan, rumah, tanah, dan properti lainnya, menawarkan paket pasang iklan (website, media sosial, atau gabungan), dan mengarahkan **seluruh leads ke WhatsApp admin** dengan pesan yang sudah membawa identitas listing atau kebutuhan periklanan.

Website dibangun **custom tanpa WordPress atau CMS siap pakai**: backend, frontend, dan database dirancang dan dikonfigurasi sendiri. Karena itu PRD ini juga mencakup **panel admin** dan arsitektur teknis, bukan hanya halaman publik.

**Prinsip produk:**

- WhatsApp-first: setiap halaman penting berujung pada tombol WhatsApp.
- Mobile-first: mayoritas pencari kos dan kontrakan membuka lewat HP.
- Ringan dan cepat: dimuat cepat di jaringan seluler biasa.
- Mudah dikelola: admin bisa menambah listing dari HP dalam hitungan menit.
- SEO-friendly: halaman listing harus bisa ditemukan lewat Google.

## 2. Latar Belakang dan Masalah

| Pihak | Masalah saat ini | Solusi lewat HunianMu |
| --- | --- | --- |
| Pencari properti | Info listing tersebar di grup WhatsApp, Instagram, dan marketplace; sulit membandingkan dan memfilter | Katalog terpusat dengan pencarian, filter, foto, harga, dan ketersediaan |
| Pemilik properti/usaha | Bingung bagaimana memasarkan; tidak punya audiens | Layanan iklan website + media sosial dengan paket jelas dan cara pengajuan sederhana |
| Admin | Chat masuk tanpa konteks (listing mana, apa kebutuhannya) | Pesan WhatsApp otomatis terisi kode dan tautan listing |

## 3. Tujuan dan Metrik Keberhasilan

| Tujuan | Metrik | Target awal (3 bulan setelah rilis, dapat disesuaikan) |
| --- | --- | --- |
| Menghasilkan leads pencari properti | Klik tombol WhatsApp per 100 kunjungan | ≥ 5 |
| Menghasilkan leads pengiklan | Pengajuan iklan per bulan | ≥ 20 |
| Katalog terisi dan segar | Jumlah listing aktif; persentase listing diperbarui ≤ 30 hari | ≥ 100 listing; ≥ 80% |
| Performa | Largest Contentful Paint di jaringan 4G | ≤ 2,5 detik |
| Trafik organik | Kunjungan dari Google per bulan | Tren naik tiap bulan |

## 4. Target Pengguna

**Persona 1 — Pencari properti.** Mahasiswa dan pekerja yang mencari indekos, keluarga muda yang mencari kontrakan atau rumah, pembeli atau investor yang mencari tanah. Ingin cepat tahu harga, lokasi, fasilitas, dan apakah masih tersedia, lalu langsung bertanya lewat WhatsApp.

**Persona 2 — Pemilik properti atau usaha.** Pemilik kos, kontrakan, rumah, tanah, atau pelaku usaha yang ingin listing-nya dipromosikan. Tidak ingin proses rumit; cukup tahu paket, harga, dan cara mengajukan.

**Persona 3 — Admin HunianMu.** Mengelola listing, menanggapi leads di WhatsApp, memproses pengajuan iklan dan survei, serta memantau performa.

## 5. Ruang Lingkup

**Termasuk MVP (versi 1.0):**

- 6 halaman publik sesuai menu: Beranda, Cari Properti, Detail Properti, Iklankan Properti/Usaha, Cara Kerja, Kontak.
- Katalog listing dengan pencarian dan filter.
- Integrasi tombol WhatsApp dengan pesan otomatis per konteks.
- Formulir pengajuan iklan, pengajuan survei, dan pencatatan leads.
- Panel admin custom untuk mengelola listing, media, paket iklan, pengajuan, dan pengaturan situs.
- SEO dasar, sitemap, analitik, dan keamanan dasar.

**Tidak termasuk MVP (kandidat fase berikutnya):**

- Akun pengguna dan login pencari properti.
- Pembayaran online untuk paket iklan.
- Chat internal, ulasan, dan penilaian.
- Portal mandiri bagi pemilik untuk mengunggah listing sendiri.
- Aplikasi mobile native.
- Integrasi WhatsApp Business API (kotak masuk otomatis, bot).

## 6. Sitemap dan Navigasi

Menu utama: **Beranda · Cari Properti · Iklankan Properti/Usaha · Cara Kerja · Kontak**

| Halaman | URL | Isi utama |
| --- | --- | --- |
| Beranda | `/` | Pencarian, kategori properti, listing pilihan, layanan iklan |
| Cari Properti | `/properti` | Katalog indekos, kontrakan, rumah, tanah, dan properti lainnya; pencarian dan filter |
| Kategori | `/properti/{kategori}` | Hasil terfilter per kategori (untuk SEO) |
| Detail Properti | `/properti/{kategori}/{slug}` | Foto/video, lokasi, harga, spesifikasi, fasilitas, ketersediaan, tombol WhatsApp |
| Iklankan Properti/Usaha | `/iklankan` | Penawaran listing website, promosi media sosial, paket gabungan, cara pengajuan |
| Cara Kerja | `/cara-kerja` | Panduan mencari properti, mengajukan survei, dan memasang iklan |
| Kontak | `/kontak` | WhatsApp admin dan media sosial |
| Admin | `/admin` | Panel pengelolaan (tidak diindeks mesin pencari) |

**Susunan beranda (berurutan dari atas):** Pencarian → Kategori → Listing Pilihan → Pilihan Lokasi → Layanan Iklan → Hubungi Admin.

**Tombol utama (CTA):** Cari Properti · Tanya Ketersediaan · Iklankan Properti/Usaha.

## 7. Kebutuhan Fungsional

Prioritas: **P0** = wajib ada di MVP, **P1** = penting, bisa menyusul tak lama setelah rilis, **P2** = nilai tambah.

### 7.1 Beranda

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-101 | Kolom pencarian (kata kunci, kategori, lokasi) yang mengarah ke `/properti` dengan filter terisi | P0 |
| FR-102 | Blok kategori (Indekos, Kontrakan, Rumah, Tanah, Lainnya) dengan ikon dan jumlah listing aktif | P0 |
| FR-103 | Blok Listing Pilihan: listing yang ditandai admin sebagai unggulan, maksimal 8 kartu | P0 |
| FR-104 | Blok Pilihan Lokasi: daftar kecamatan atau area populer yang mengarah ke hasil terfilter | P1 |
| FR-105 | Blok Layanan Iklan: ringkasan 3 layanan (listing website, promosi sosial media, paket gabungan) dengan tombol Iklankan Properti/Usaha | P0 |
| FR-106 | Blok Hubungi Admin dengan tombol WhatsApp | P0 |

### 7.2 Cari Properti

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-201 | Daftar listing berbentuk kartu (foto sampul, judul, kategori, lokasi, harga, label ketersediaan) dengan paginasi atau tombol Muat Lebih Banyak | P0 |
| FR-202 | Pencarian kata kunci pada judul, lokasi, dan deskripsi | P0 |
| FR-203 | Filter: kategori, lokasi (kecamatan/area), rentang harga, ketersediaan, serta filter spesifik kategori (jumlah kamar tidur, luas tanah, tipe kos putra/putri/campur) | P0 |
| FR-204 | Fasilitas sebagai filter tambahan (AC, WiFi, kamar mandi dalam, parkir, dan sebagainya) | P1 |
| FR-205 | Pengurutan: terbaru, harga termurah, harga termahal | P0 |
| FR-206 | Status filter tersimpan di URL (query string) agar hasil bisa dibagikan dan diindeks | P0 |
| FR-207 | Tampilan kosong yang membantu, dengan tombol WhatsApp “Minta dicarikan properti” bila tidak ada hasil | P1 |

### 7.3 Detail Properti

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-301 | Galeri foto (geser/zoom) dan dukungan video (tautan YouTube atau berkas video singkat) | P0 |
| FR-302 | Informasi inti: judul, kode listing, kategori, harga beserta periode (per bulan, per tahun, sekali bayar), lokasi/alamat umum | P0 |
| FR-303 | Spesifikasi sesuai kategori: luas tanah/bangunan, kamar tidur/mandi, sertifikat, kondisi furnitur, ukuran kamar, aturan kos, dan lainnya | P0 |
| FR-304 | Daftar fasilitas dengan ikon | P0 |
| FR-305 | Label ketersediaan: Tersedia, Dipesan, Sudah Terisi/Terjual; listing tidak tersedia tetap tampil dengan penanda jelas | P0 |
| FR-306 | Peta lokasi (tautan Google Maps atau peta tersemat) dengan titik perkiraan agar alamat pemilik tetap terlindungi | P1 |
| FR-307 | Tombol **Tanya Ketersediaan** (WhatsApp) tetap terlihat saat halaman digulir di HP (sticky) | P0 |
| FR-308 | Tombol **Ajukan Survei** yang membuka formulir singkat (nama, WhatsApp, tanggal/jam yang diinginkan) lalu diteruskan ke WhatsApp admin | P1 |
| FR-309 | Tombol bagikan (salin tautan, bagikan ke WhatsApp) | P1 |
| FR-310 | Bagian “Properti serupa” berdasarkan kategori dan lokasi | P1 |
| FR-311 | Meta tag Open Graph per listing agar tampilan tautan di WhatsApp dan media sosial menarik | P0 |

### 7.4 Iklankan Properti/Usaha

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-401 | Penjelasan layanan: penawaran listing website, promosi media sosial, dan paket gabungan, lengkap dengan manfaat dan contoh hasil | P0 |
| FR-402 | Daftar paket dengan harga, durasi, dan fitur; seluruh konten dikelola dari panel admin | P0 |
| FR-403 | Langkah pengajuan yang ringkas (misalnya: isi formulir → admin menghubungi → materi dikumpulkan → iklan tayang) | P0 |
| FR-404 | Formulir pengajuan: nama, nomor WhatsApp, jenis (properti/usaha), kategori, paket yang diminati, lokasi, deskripsi singkat, tautan atau unggahan foto (opsional) | P0 |
| FR-405 | Setelah formulir dikirim, data disimpan di database lalu pengguna diarahkan ke WhatsApp admin dengan pesan otomatis berisi ringkasan pengajuan | P0 |
| FR-406 | Alternatif cepat: tombol WhatsApp langsung tanpa mengisi formulir | P0 |
| FR-407 | FAQ pengiklan (biaya, durasi tayang, syarat materi) | P1 |

### 7.5 Cara Kerja

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-501 | Tiga panduan: mencari properti, mengajukan survei, dan memasang iklan; masing-masing berupa langkah bernomor | P0 |
| FR-502 | Konten dapat diedit dari panel admin tanpa mengubah kode | P1 |
| FR-503 | CTA di akhir tiap panduan (Cari Properti / Iklankan Properti/Usaha) | P0 |

### 7.6 Kontak

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-601 | Tombol WhatsApp admin, tautan media sosial (Instagram, TikTok, Facebook, dan lainnya), jam layanan | P0 |
| FR-602 | Nomor WhatsApp dan tautan sosial diambil dari pengaturan situs sehingga bisa diganti tanpa deploy ulang | P0 |

### 7.7 Integrasi WhatsApp dan Pelacakan Leads

Semua leads masuk ke WhatsApp admin. Tombol WhatsApp memakai tautan `https://wa.me/{nomor}?text={pesan_terenkode}`. Templat pesan disimpan di pengaturan situs.

| Konteks | Contoh pesan otomatis |
| --- | --- |
| Detail Properti | Halo admin HunianMu, saya tertarik dengan listing HM-0123 “Kos Putri Dekat UGM” (tautan listing). Apakah masih tersedia? |
| Ajukan Survei | Halo admin, saya ingin survei listing HM-0123 pada (tanggal/jam). Nama: (nama) |
| Iklankan Properti/Usaha | Halo admin, saya ingin memasang iklan (jenis) dengan paket (nama paket). Nama: (nama), lokasi: (lokasi) |
| Beranda/Kontak | Halo admin HunianMu, saya ingin bertanya tentang layanan HunianMu. |

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-701 | Setiap klik tombol WhatsApp dicatat sebagai event (listing, halaman asal, waktu, parameter UTM) sebelum membuka WhatsApp | P0 |
| FR-702 | Pesan WhatsApp selalu menyertakan kode listing dan tautan agar admin langsung tahu konteksnya | P0 |
| FR-703 | Pengajuan iklan dan survei disimpan di database sebagai cadangan, meskipun pengguna tidak mengirim pesan WhatsApp | P0 |
| FR-704 | Dasbor admin menampilkan jumlah klik WhatsApp per listing dan per sumber | P1 |

### 7.8 Panel Admin

Karena tanpa WordPress, panel admin dibuat sendiri dan menjadi inti operasional.

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-801 | Login admin dengan email dan kata sandi (hash kuat), sesi aman, batas percobaan login | P0 |
| FR-802 | CRUD listing: tambah, ubah, hapus (soft delete), duplikasi, arsipkan; status Draf / Terbit / Arsip | P0 |
| FR-803 | Unggah banyak foto sekaligus, atur urutan, tentukan foto sampul; kompresi dan pembuatan ukuran otomatis | P0 |
| FR-804 | Ubah status ketersediaan dengan satu ketukan (Tersedia / Dipesan / Terisi-Terjual) | P0 |
| FR-805 | Tandai listing sebagai Pilihan (unggulan) di beranda | P0 |
| FR-806 | Kelola master data: kategori, lokasi, dan fasilitas | P0 |
| FR-807 | Kelola paket iklan (nama, harga, durasi, fitur, aktif/nonaktif) | P0 |
| FR-808 | Kotak masuk pengajuan iklan dan survei dengan status: Baru → Dihubungi → Deal / Ditolak, plus catatan internal | P0 |
| FR-809 | Pengaturan situs: nomor WhatsApp, templat pesan, tautan sosial, judul dan deskripsi SEO, isi halaman Cara Kerja | P1 |
| FR-810 | Dasbor ringkas: total listing aktif, listing basi (belum diperbarui > 30 hari), klik WhatsApp, pengajuan baru | P1 |
| FR-811 | Data pribadi pemilik (nama, nomor) disimpan sebagai kolom internal dan tidak pernah tampil di publik | P0 |
| FR-812 | Peran pengguna: Super Admin dan Editor (editor tidak dapat mengubah pengaturan atau pengguna) | P2 |
| FR-813 | Panel admin nyaman dipakai di HP (tampilan responsif) | P0 |

## 8. Alur Pengguna Utama

**Alur A — Pencari properti:** Beranda atau Google → Cari Properti (filter) → Detail Properti → Tanya Ketersediaan → WhatsApp admin → (opsional) Ajukan Survei.

**Alur B — Pengiklan:** Beranda atau Iklankan Properti/Usaha → lihat paket → isi formulir pengajuan → data tersimpan → diarahkan ke WhatsApp admin → admin memproses di panel (status Dihubungi → Deal) → listing diterbitkan.

**Alur C — Admin menerbitkan listing:** Login → Listing Baru → isi data dan unggah foto → simpan sebagai Draf → pratinjau → Terbit → listing muncul di katalog dan sitemap.

## 9. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
| --- | --- |
| Performa | LCP ≤ 2,5 detik di 4G; gambar dalam format WebP/AVIF dengan lazy loading dan ukuran responsif; skor Lighthouse mobile ≥ 85 |
| Responsif | Mobile-first; diuji pada lebar 360 px hingga desktop |
| SEO | Halaman listing dirender di server (SSR) agar mudah diindeks; URL bersih; sitemap.xml dinamis; robots.txt; data terstruktur schema.org |
| Aksesibilitas | Kontras warna memadai, teks alternatif gambar, navigasi keyboard pada elemen utama |
| Ketersediaan | Target uptime 99% per bulan; cadangan database harian |
| Skalabilitas | Nyaman hingga ±5.000 listing dan ±50.000 kunjungan per bulan pada satu VPS sederhana |
| Bahasa | Bahasa Indonesia; format harga Rupiah (misalnya Rp1.500.000) |
| Kompatibilitas | Dua versi terakhir Chrome, Safari, Firefox, Edge; Android dan iOS |
| Privasi | Halaman Kebijakan Privasi; data kontak pengguna hanya dipakai untuk menindaklanjuti permintaan |

## 10. Arsitektur Teknis (Rekomendasi)

Pilihan teknologi sepenuhnya milik Anda sebagai pembuat; tabel berikut adalah rekomendasi yang seimbang antara kemudahan dan hasil SEO. Silakan ganti sesuai bahasa pemrograman yang paling Anda kuasai.

| Lapisan | Rekomendasi utama | Alternatif |
| --- | --- | --- |
| Backend | Node.js + TypeScript dengan Fastify atau Express | Laravel (PHP), Go (Gin/Fiber), Python (FastAPI/Django) |
| Database | PostgreSQL | MySQL/MariaDB |
| Akses data | Query builder atau ORM ringan (Drizzle, Knex, atau Prisma) dengan migrasi terversi | SQL mentah dengan alat migrasi |
| Frontend publik | Server-side rendering dengan template (Nunjucks/EJS) + Tailwind CSS + JavaScript ringan (Alpine.js atau htmx) | Next.js atau Astro bila ingin ekosistem React/komponen |
| Panel admin | Halaman server-rendered yang sama dengan JavaScript ringan, atau SPA terpisah | React/Vue SPA yang memanggil API admin |
| Penyimpanan media | Disk server atau penyimpanan kompatibel S3 (MinIO, Cloudflare R2); pemrosesan gambar dengan `sharp` | Penyimpanan objek penyedia lokal |
| Server | VPS (Ubuntu) + Nginx sebagai reverse proxy + PM2 | Platform PaaS |
| HTTPS dan CDN | Let’s Encrypt, Cloudflare (cache, proteksi DDoS) | Sertifikat penyedia hosting |
| Pencarian | Pencarian teks PostgreSQL (full-text, `pg_trgm`) cukup untuk MVP | Meilisearch bila katalog membesar |
| Pemantauan | Log terstruktur, uptime monitor, pelacak galat (opsional) | Layanan pemantauan lain |

**Alasan memilih server-side rendering:** halaman listing adalah aset SEO utama; HTML yang sudah lengkap saat diterima Google dan WhatsApp preview lebih andal serta cepat di HP berspesifikasi rendah.

**Struktur proyek yang disarankan:** satu repositori (monorepo atau monolit modular) dengan modul `public`, `admin`, `api`, `db/migrations`, dan `storage`, supaya mudah dikelola sendirian.

## 11. Model Data

| Tabel | Kolom utama |
| --- | --- |
| `admins` | id, nama, email (unik), password\_hash, peran, dibuat\_pada |
| `property_types` | id, nama, slug (indekos, kontrakan, rumah, tanah, ruko, dan lainnya) |
| `locations` | id, nama, slug, jenis (kota/kecamatan/kelurahan), parent\_id |
| `properties` | id, kode (HM-0001), slug, judul, deskripsi, type\_id, location\_id, alamat\_umum, lat, lng, harga, periode\_harga (bulan/tahun/sekali), luas\_tanah, luas\_bangunan, kamar\_tidur, kamar\_mandi, sertifikat, furnitur, atribut\_tambahan (JSONB), ketersediaan, is\_featured, status (draf/terbit/arsip), nama\_pemilik\*, kontak\_pemilik\*, jumlah\_dilihat, diterbitkan\_pada, diperbarui\_pada, dihapus\_pada |
| `facilities` | id, nama, ikon |
| `property_facilities` | property\_id, facility\_id |
| `property_media` | id, property\_id, jenis (gambar/video), path atau url, urutan, is\_cover, dimensi |
| `ad_packages` | id, nama, deskripsi, kanal (website/sosial/gabungan), harga, durasi\_hari, fitur (JSONB), aktif, urutan |
| `ad_requests` | id, nama, whatsapp, jenis (properti/usaha), type\_id, package\_id, judul, deskripsi, lokasi, status (baru/dihubungi/deal/ditolak), catatan, dibuat\_pada |
| `survey_requests` | id, property\_id, nama, whatsapp, tanggal\_diinginkan, catatan, status, dibuat\_pada |
| `lead_events` | id, property\_id (opsional), jenis\_event, halaman, sumber, utm\_source, utm\_medium, utm\_campaign, dibuat\_pada |
| `site_settings` | kunci, nilai (nomor WhatsApp, templat pesan, tautan sosial, SEO) |
| `content_pages` | id, slug, judul, isi (untuk Cara Kerja dan kebijakan) |

\*Kolom internal, tidak pernah dikirim ke API publik.

**Indeks penting:** `properties(status, type_id, location_id, harga)`, indeks unik pada `slug` dan `kode`, indeks teks pada judul dan deskripsi, serta indeks pada `lead_events(dibuat_pada)`.

## 12. Rancangan Endpoint API

| Metode | Endpoint | Fungsi | Akses |
| --- | --- | --- | --- |
| GET | `/api/properties` | Daftar listing dengan filter, urutan, paginasi | Publik |
| GET | `/api/properties/{slug}` | Detail listing | Publik |
| GET | `/api/filters` | Kategori, lokasi, dan fasilitas untuk filter | Publik |
| GET | `/api/ad-packages` | Paket iklan aktif | Publik |
| POST | `/api/ad-requests` | Kirim pengajuan iklan | Publik (rate limit + validasi) |
| POST | `/api/survey-requests` | Kirim pengajuan survei | Publik (rate limit + validasi) |
| POST | `/api/events/whatsapp-click` | Catat klik WhatsApp | Publik (rate limit) |
| POST | `/api/admin/login` dan `/api/admin/logout` | Autentikasi admin | Admin |
| CRUD | `/api/admin/properties` | Kelola listing | Admin |
| POST | `/api/admin/properties/{id}/media` | Unggah dan atur media | Admin |
| CRUD | `/api/admin/types`, `/locations`, `/facilities`, `/ad-packages` | Kelola master data | Admin |
| GET/PATCH | `/api/admin/ad-requests`, `/survey-requests` | Lihat dan ubah status pengajuan | Admin |
| GET/PUT | `/api/admin/settings` | Pengaturan situs | Admin |
| GET | `/api/admin/dashboard` | Ringkasan statistik | Admin |

Jika memakai SSR penuh, halaman publik dapat memanggil lapisan data yang sama langsung di server; endpoint publik di atas tetap berguna untuk filter interaktif dan pengembangan di masa depan.

## 13. SEO dan Analitik

- Judul dan meta description unik per halaman dan per listing (templat otomatis, bisa diubah manual).
- URL bersih dan stabil; jika slug berubah, buat pengalihan 301.
- `sitemap.xml` dibuat dinamis dari listing terbit; listing arsip dikeluarkan dan halaman admin diberi `noindex`.
- Data terstruktur schema.org (misalnya `RealEstateListing` atau `Product/Offer`) pada halaman detail.
- Halaman kategori dan lokasi yang dioptimalkan untuk kata kunci seperti “kos dekat kampus”, “kontrakan di (daerah)”, dan “tanah dijual di (daerah)”.
- Daftarkan situs di Google Search Console dan Google Business Profile bila relevan.
- Analitik: Google Analytics 4 atau alternatif yang lebih ringan seperti Plausible/Umami; peristiwa kunci: klik WhatsApp, kirim formulir iklan, kirim formulir survei, penggunaan filter.

## 14. Keamanan

- HTTPS wajib, cookie sesi `HttpOnly`, `Secure`, dan `SameSite`.
- Kata sandi di-hash dengan Argon2 atau bcrypt; batas percobaan login dan penguncian sementara.
- Opsional namun disarankan: autentikasi dua langkah (2FA) untuk admin.
- Validasi dan sanitasi seluruh input di server; kueri berparameter untuk mencegah SQL injection; escape keluaran untuk mencegah XSS; proteksi CSRF pada formulir dan panel admin.
- Unggahan: batasi tipe dan ukuran berkas, ganti nama berkas, proses ulang gambar, simpan di luar direktori yang dapat dieksekusi.
- Rate limiting dan honeypot atau CAPTCHA ringan pada formulir publik untuk mencegah spam.
- Header keamanan (CSP, HSTS, X-Content-Type-Options) dan firewall server (hanya port 80/443/SSH).
- Cadangan database harian otomatis, disimpan di lokasi terpisah, dan diuji pemulihannya secara berkala.
- Rahasia (kata sandi database, kunci) disimpan di variabel lingkungan, bukan di repositori.

## 15. Deployment dan Operasional

- Lingkungan: lokal (pengembangan), staging (opsional), dan produksi.
- Kontrol versi dengan Git; migrasi database terversi dan dapat diulang.
- Proses rilis: tarik kode → instal dependensi → jalankan migrasi → build → muat ulang proses (PM2).
- Cadangan: dump PostgreSQL harian + salinan folder media; simpan minimal 14 hari.
- Pemantauan: uptime monitor dengan notifikasi ke WhatsApp atau email; rotasi log.
- Domain, DNS, dan sertifikat SSL diatur di awal; Cloudflare di depan server direkomendasikan.

## 16. Roadmap dan Milestone

Estimasi untuk satu pengembang yang bekerja paruh waktu hingga penuh waktu; sesuaikan dengan ketersediaan waktu Anda.

| Fase | Cakupan | Perkiraan |
| --- | --- | --- |
| 0. Persiapan | Finalisasi PRD, pemilihan stack, desain identitas (logo, warna, tipografi), wireframe halaman utama, pengadaan domain dan VPS | Minggu 1 |
| 1. Fondasi | Struktur proyek, skema database dan migrasi, autentikasi admin, server dan deployment dasar | Minggu 2 |
| 2. Panel Admin | CRUD listing, unggah media, master data, ketersediaan, listing pilihan | Minggu 3–4 |
| 3. Situs Publik | Beranda, Cari Properti dengan filter, Detail Properti, tombol WhatsApp dan pelacakan klik | Minggu 5–6 |
| 4. Layanan Iklan | Halaman Iklankan, paket, formulir pengajuan, kotak masuk admin, formulir survei | Minggu 7 |
| 5. Konten dan SEO | Cara Kerja, Kontak, sitemap, meta/OG, data terstruktur, analitik, input 30–50 listing awal | Minggu 8 |
| 6. Uji dan Rilis | Uji lintas perangkat, performa, keamanan, uji pemulihan cadangan; rilis publik | Minggu 9 |
| 7. Pascarilis | Pantau metrik, perbaiki masukan, mulai promosi media sosial, rencanakan fase 2 | Minggu 10 dan seterusnya |

## 17. Kriteria Penerimaan MVP

- Seluruh kebutuhan berprioritas P0 pada bagian 7 berfungsi di HP dan desktop.
- Admin dapat menambah listing lengkap dengan 5+ foto dari HP dalam kurang dari 5 menit.
- Klik tombol WhatsApp di semua halaman menghasilkan pesan dengan konteks yang benar dan tercatat di `lead_events`.
- Pengajuan iklan dan survei tersimpan di database dan tampil di kotak masuk admin.
- Halaman listing terindeks dengan benar (uji menggunakan alat pengujian URL Google) dan pratinjau tautan di WhatsApp menampilkan foto dan judul.
- Pemeriksaan keamanan dasar lolos (uji injeksi, XSS, unggahan berbahaya, dan brute force login).
- Cadangan otomatis berjalan dan satu kali uji pemulihan berhasil.

## 18. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Katalog sepi atau data basi (listing sudah terisi tapi masih tampil) | Kepercayaan pengunjung turun | Pengingat di dasbor untuk listing > 30 hari; label “Diperbarui (tanggal)”; kebiasaan memperbarui ketersediaan mingguan |
| Semua leads bergantung pada satu nomor WhatsApp | Leads terputus jika nomor bermasalah | Nomor dapat diganti dari pengaturan; pertimbangkan WhatsApp Business dan perangkat cadangan |
| Membangun semuanya sendiri memakan waktu | Rilis mundur | Batasi MVP pada P0; tunda fitur P1/P2; pakai pustaka matang untuk bagian umum (autentikasi, unggah, validasi) |
| Spam pada formulir | Kotak masuk penuh | Rate limit, honeypot, CAPTCHA ringan |
| Kebocoran data kontak pemilik | Masalah privasi dan reputasi | Pisahkan kolom internal dari API publik; uji respons API |
| Server tunggal gagal | Situs mati | Cadangan harian, uptime monitor, dokumentasi pemulihan |
| Hak atas foto dan konten listing | Sengketa konten | Syarat dan ketentuan bagi pengiklan; hanya unggah foto dengan izin pemilik |

## 19. Pertanyaan Terbuka

Hal-hal berikut perlu diputuskan sebelum atau saat fase 0:

1. Area layanan awal: hanya satu kota atau wilayah, atau lebih luas? Ini menentukan struktur data lokasi dan strategi SEO.
2. Apakah listing berbayar dan listing gratis dibedakan tampilannya (misalnya label Iklan Berbayar atau urutan prioritas)?
3. Apakah harga paket iklan ditampilkan terbuka atau cukup “mulai dari” dan detailnya lewat WhatsApp?
4. Apakah video berupa tautan YouTube (hemat penyimpanan) atau unggahan langsung?
5. Berapa nomor WhatsApp admin yang dipakai, dan apakah perlu pembagian nomor per kategori?
6. Bahasa pemrograman dan framework final yang akan Anda pakai (lihat bagian 10)?
7. Apakah di fase 2 pemilik properti boleh mengunggah listing sendiri lewat akun?
8. Perlu halaman Syarat dan Ketentuan serta Kebijakan Privasi dengan teks resmi (disarankan ditinjau ahli hukum)?

## Lampiran — Contoh Templat Pesan WhatsApp (dapat diubah di panel admin)

Variabel yang tersedia: `{kode}`, `{judul}`, `{url}`, `{nama}`, `{paket}`, `{jenis}`, `{lokasi}`, `{tanggal}`.

- Tanya ketersediaan: Halo admin HunianMu, saya tertarik dengan listing {kode} {judul} ({url}). Apakah masih tersedia?
- Ajukan survei: Halo admin, saya ingin survei listing {kode} pada {tanggal}. Nama saya {nama}.
- Pasang iklan: Halo admin, saya ingin memasang iklan {jenis} dengan paket {paket}. Nama: {nama}, lokasi: {lokasi}.
- Umum: Halo admin HunianMu, saya ingin bertanya tentang layanan HunianMu.

## Lampiran B — Struktur Folder Proyek

Struktur ini mengikuti rekomendasi stack di bagian 10 (Node.js + TypeScript, Fastify, template Nunjucks, PostgreSQL, Tailwind CSS) dan memakai pola **monolit modular**: satu repositori, satu proses aplikasi, tetapi kode dipisah per fitur agar mudah dirawat sendirian. Jika Anda memilih bahasa lain (misalnya Laravel atau Go), pola pembagiannya tetap sama: konfigurasi, modul per fitur, tampilan, migrasi database, dan penyimpanan media dipisah.

```
hunianmu/
├── .env.example                  # contoh variabel lingkungan (tanpa nilai rahasia)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── README.md
│
├── docs/
│   ├── PRD.md
│   ├── database.md               # diagram dan catatan skema
│   └── deployment.md             # panduan rilis dan pemulihan
│
├── deploy/
│   ├── nginx/
│   │   └── hunianmu.conf         # reverse proxy, gzip, cache statis, HTTPS
│   ├── pm2.ecosystem.config.js
│   └── scripts/
│       ├── deploy.sh             # tarik kode, migrasi, build, muat ulang
│       ├── backup-db.sh          # dump PostgreSQL harian
│       └── restore-db.sh
│
├── db/
│   ├── migrations/               # file SQL bernomor, dijalankan berurutan
│   │   ├── 001_create_admins.sql
│   │   ├── 002_create_master_data.sql        # property_types, locations, facilities
│   │   ├── 003_create_properties.sql
│   │   ├── 004_create_property_media.sql
│   │   ├── 005_create_ad_packages_requests.sql
│   │   ├── 006_create_survey_requests.sql
│   │   ├── 007_create_lead_events.sql
│   │   └── 008_create_settings_pages.sql
│   └── seeds/
│       ├── 01_property_types.sql
│       ├── 02_locations.sql
│       ├── 03_facilities.sql
│       ├── 04_ad_packages.sql
│       └── 05_site_settings.sql
│
├── src/
│   ├── server.ts                 # titik masuk: menjalankan server
│   ├── app.ts                    # merakit plugin, rute, dan penanganan galat
│   │
│   ├── config/
│   │   ├── env.ts                # membaca dan memvalidasi variabel lingkungan
│   │   └── constants.ts          # status listing, jenis periode harga, dan sejenisnya
│   │
│   ├── db/
│   │   ├── client.ts             # koneksi dan pool PostgreSQL
│   │   └── migrate.ts            # penjalan migrasi
│   │
│   ├── plugins/                  # fungsi lintas modul
│   │   ├── session.ts            # sesi dan cookie admin
│   │   ├── csrf.ts
│   │   ├── rate-limit.ts
│   │   ├── security-headers.ts
│   │   └── error-handler.ts
│   │
│   ├── modules/                  # satu folder per fitur
│   │   ├── properties/
│   │   │   ├── properties.routes.ts          # rute publik: daftar, detail
│   │   │   ├── properties.admin.routes.ts    # rute admin: CRUD listing
│   │   │   ├── properties.service.ts         # logika bisnis
│   │   │   ├── properties.repository.ts      # kueri database
│   │   │   └── properties.schema.ts          # validasi input
│   │   ├── media/                # unggah, kompres, urutkan foto
│   │   ├── master-data/          # kategori, lokasi, fasilitas
│   │   ├── ad-packages/          # paket iklan
│   │   ├── ad-requests/          # pengajuan iklan
│   │   ├── survey-requests/      # pengajuan survei
│   │   ├── leads/                # pencatatan klik WhatsApp
│   │   ├── auth/                 # login dan logout admin
│   │   ├── settings/             # pengaturan situs dan halaman konten
│   │   ├── dashboard/            # statistik ringkas admin
│   │   └── seo/                  # sitemap.xml, robots.txt, data terstruktur
│   │
│   ├── utils/
│   │   ├── whatsapp.ts           # membuat tautan wa.me dan mengisi templat pesan
│   │   ├── slug.ts
│   │   ├── currency.ts           # format Rupiah
│   │   ├── image.ts              # pemrosesan gambar (sharp)
│   │   └── pagination.ts
│   │
│   ├── jobs/
│   │   └── stale-listings.ts     # penanda listing yang belum diperbarui > 30 hari
│   │
│   └── views/                    # template server-side
│       ├── layouts/
│       │   ├── public.njk
│       │   └── admin.njk
│       ├── partials/
│       │   ├── header.njk
│       │   ├── footer.njk
│       │   ├── property-card.njk
│       │   ├── whatsapp-button.njk
│       │   └── seo-meta.njk
│       ├── public/
│       │   ├── home.njk                  # Beranda
│       │   ├── properties-list.njk       # Cari Properti
│       │   ├── property-detail.njk       # Detail Properti
│       │   ├── advertise.njk             # Iklankan Properti/Usaha
│       │   ├── how-it-works.njk          # Cara Kerja
│       │   ├── contact.njk               # Kontak
│       │   └── errors/ (404.njk, 500.njk)
│       └── admin/
│           ├── login.njk
│           ├── dashboard.njk
│           ├── properties/ (index.njk, form.njk)
│           ├── requests/ (ad-requests.njk, survey-requests.njk)
│           ├── master-data/
│           └── settings.njk
│
├── assets/                       # sumber aset sebelum dibuild
│   ├── css/
│   │   └── main.css              # masukan Tailwind
│   └── js/
│       ├── public.js             # filter, galeri, tombol bagikan
│       └── admin.js              # unggah banyak foto, urutan drag and drop
│
├── public/                       # aset statis yang dilayani langsung
│   ├── build/                    # hasil build CSS dan JS (di-gitignore)
│   ├── img/                      # logo, ikon kategori, gambar placeholder
│   ├── favicon.ico
│   └── robots.txt
│
├── storage/                      # di-gitignore; dicadangkan terpisah
│   └── uploads/
│       └── properties/
│           └── {property_id}/
│               ├── original/
│               ├── large/
│               ├── medium/
│               └── thumb/
│
└── tests/
    ├── unit/                     # utilitas dan logika bisnis
    └── integration/              # rute, filter pencarian, formulir
```

### Catatan Penting

| Bagian | Penjelasan |
| --- | --- |
| `src/modules/` | Setiap fitur memegang rute, logika, kueri, dan validasinya sendiri. Menambah fitur baru cukup menambah satu folder tanpa menyentuh modul lain. |
| Rute publik dan admin dipisah | Berkas `*.admin.routes.ts` hanya dapat diakses setelah login, sehingga data internal pemilik tidak pernah bocor lewat rute publik. |
| `db/migrations/` | Setiap perubahan skema ditulis sebagai berkas baru dan tidak mengubah berkas lama, sehingga database lokal, staging, dan produksi selalu bisa disamakan. |
| `storage/uploads/` | Dipisah dari kode dan dikeluarkan dari Git. Sertakan dalam cadangan harian. Nginx melayani folder ini langsung sebagai berkas statis. |
| `assets/` dan `public/build/` | `assets/` berisi sumber CSS dan JS; hasil build masuk ke `public/build/`. Hanya `public/` yang dilayani ke pengunjung. |
| `.env` | Tidak pernah di-commit. Isinya: URL database, rahasia sesi, jalur penyimpanan, dan nomor WhatsApp awal. Gunakan `.env.example` sebagai acuan. |
| `deploy/` | Menyimpan konfigurasi server dan skrip rilis di dalam repositori, sehingga server bisa dipulihkan dengan cepat bila rusak. |

### Urutan Pembuatan yang Disarankan

1. Siapkan kerangka: `package.json`, `tsconfig.json`, `src/server.ts`, `src/app.ts`, dan `config/env.ts`.
2. Tulis migrasi 001–003 dan seed, lalu hubungkan `db/client.ts`.
3. Bangun modul `auth` dan layout admin, lalu modul `properties` beserta `media` (fase 2 pada roadmap).
4. Bangun layout publik, partial, dan halaman Beranda, Cari Properti, serta Detail Properti.
5. Tambahkan `utils/whatsapp.ts` dan modul `leads`, lalu `ad-requests` dan `survey-requests`.
6. Terakhir: `seo`, `settings`, `dashboard`, tes, dan skrip `deploy/`.
