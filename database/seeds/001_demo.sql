INSERT INTO property_types(name,slug) VALUES ('Indekos','indekos'),('Kontrakan','kontrakan'),('Rumah','rumah'),('Tanah','tanah'),('Lainnya','lainnya') ON CONFLICT DO NOTHING;
INSERT INTO locations(name,slug) VALUES ('Depok, Sleman','depok'),('Mlati, Sleman','mlati'),('Yogyakarta','yogyakarta'),('Bantul','bantul'),('Kalasan, Sleman','kalasan') ON CONFLICT DO NOTHING;
INSERT INTO facilities(name,slug,icon) VALUES ('AC','ac','snowflake'),('WiFi','wifi','wifi'),('Kamar mandi dalam','km-dalam','bath'),('Parkir mobil','parkir','car'),('Dapur bersama','dapur','home'),('Keamanan 24 jam','keamanan','shield') ON CONFLICT DO NOTHING;
INSERT INTO ad_packages(name,description,channel,price,duration_days,features,sort_order)
SELECT * FROM (VALUES ('Website','Etalase properti dengan halaman detail yang mudah dibagikan.','website',99000,30,'["Listing di website","Galeri foto & detail","Tombol WhatsApp admin"]'::jsonb,1),('Media Sosial','Jangkau calon pelanggan melalui konten media sosial.','sosial',199000,14,'["1 feed Instagram","3 Instagram Story","Materi promosi dibantu admin"]'::jsonb,2),('Paket Gabungan','Website dan media sosial untuk jangkauan yang lebih luas.','gabungan',279000,30,'["Semua fitur Website","Semua fitur Media Sosial","Penempatan listing pilihan"]'::jsonb,3)) AS d(name,description,channel,price,duration_days,features,sort_order)
WHERE NOT EXISTS(SELECT 1 FROM ad_packages);
INSERT INTO site_settings(key,value) VALUES
('demo_mode','true'),('whatsapp_number','6200000000000'),('service_area','Yogyakarta & sekitarnya (wilayah demo)'),('service_hours','Senin–Sabtu, 08.00–17.00 WIB'),
('seo_title','HunianMu — Temukan tempat untuk cerita barumu'),('seo_description','Cari indekos, kontrakan, rumah, dan tanah. Temukan properti sesuai kebutuhan dan hubungi admin HunianMu melalui WhatsApp.'),
('whatsapp_listing','Halo admin HunianMu, saya tertarik dengan listing {kode} “{judul}” ({url}). Apakah masih tersedia?'),
('whatsapp_general','Halo admin HunianMu, saya ingin bertanya tentang layanan HunianMu.'),
('whatsapp_ad','Halo admin HunianMu, saya ingin memasang iklan {jenis} dengan paket {paket}. Nama: {nama}, lokasi: {lokasi}. {deskripsi}'),
('whatsapp_ad_direct','Halo admin HunianMu, saya ingin berkonsultasi tentang pemasangan iklan properti/usaha.'),
('whatsapp_survey','Halo admin HunianMu, saya ingin survei listing {kode} “{judul}” ({url}) pada {tanggal}. Nama: {nama}.'),
('instagram_url',''),('tiktok_url',''),('facebook_url','') ON CONFLICT DO NOTHING;
INSERT INTO content_pages(slug,title,body) VALUES
('mencari','Mencari properti','Cari berdasarkan lokasi, kategori, dan anggaran.\nLihat foto, fasilitas, harga, dan ketersediaan listing.\nKlik Tanya Ketersediaan untuk berbicara dengan admin.'),
('survei','Mengajukan survei','Pilih properti dan periksa informasi detailnya.\nIsi nama, WhatsApp, dan waktu kunjungan pada formulir survei.\nLanjutkan ke WhatsApp; admin akan mengonfirmasi jadwal.'),
('iklan','Memasang iklan','Pilih paket sesuai kebutuhan properti atau usaha.\nIsi formulir pengajuan; data tersimpan sebelum WhatsApp dibuka.\nAdmin menghubungi untuk konfirmasi dan mengumpulkan materi.\nSetelah disepakati, iklan siap ditayangkan.'),
('privasi','Kebijakan Privasi','Data nama, nomor WhatsApp, dan pengajuan dipakai untuk menindaklanjuti permintaan Anda. Data pemilik listing hanya tersedia bagi admin. Kami menyimpan event penggunaan tombol WhatsApp beserta halaman asal dan parameter kampanye, tanpa menyimpan isi percakapan. Hubungi admin untuk meminta koreksi atau penghapusan data. Teks demo ini perlu disahkan sebelum rilis.') ON CONFLICT DO NOTHING;
