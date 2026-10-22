# Task.md — Rencana Pekerjaan SIRAJ

Kerjakan **berurutan**. Fase 0 adalah penghalang: fase berikutnya tidak boleh dimulai sebelum Fase 0 tuntas. Tiap tugas selesai hanya bila memenuhi **Definition of Done** di bagian bawah.

## Fase 0 — Konfigurasi dan Keputusan (BLOCKER)

Rincian alasan dan hasil tiap item ada di `README.md`.

- [x] 0.1 Putuskan Application ID / Bundle ID (`id.sch.darussalam.siraj`)
- [x] 0.2 Buat 3 proyek Supabase (dev, staging, prod) di region Singapore (`ap-southeast-1`)
- [x] 0.3 Putuskan metode login wali, aktifkan MFA TOTP untuk Admin dan Bendahara
- [x] 0.4 Buat pasangan kunci Ed25519 untuk QR; simpan private key di secrets; catat `kid` (`k1`)
- [x] 0.5 Buat keystore Android, akun Apple Developer; cadangkan keystore
- [x] 0.6 Siapkan Firebase (FCM) dan APNs key
- [x] 0.7 Putuskan peta: Peta Kampus SVG Interaktif & Integrasi Rujukan RSUD dr. Soekardjo
- [x] 0.8 Tetapkan zona waktu (WIB), daftar sesi (Multi-Kategori), dan toleransi terlambat
- [x] 0.9 Tetapkan kebijakan SP (ambang 50/100/150 poin, draf PDF berkop, alur persetujuan Admin)
- [x] 0.10 Tetapkan kebijakan Gate Pass 30 dtk rotasi Ed25519 dan verifikasi KTP penjemput
- [x] 0.11 Siapkan templat CSV dan data uji fiktif terintegrasi
- [x] 0.12 Putuskan metode pembayaran v1 (Dompet Uang Saku Digital + BSI Virtual Account)
- [x] 0.13 Siapkan domain, hosting admin, dan SMTP
- [x] 0.14 Tulis kebijakan privasi dan teks persetujuan wali (UU PDP)
- [x] 0.15 Siapkan Sentry dan repositori + CI dengan secrets
- [x] 0.16 Tetapkan versi OS minimum (Android 7.0+ / iOS 14.0+) dan teks izin perangkat
- [x] 0.17 Buat `.gitignore`, `env/example.json`, pemindai rahasia sebagai pre-commit

**Selesai bila:** seluruh kotak di tabel README tercentang.

## Fase 1 — Fondasi

- [x] 1.1 Inisialisasi proyek Flutter dengan struktur folder di README
- [x] 1.2 Token desain dari `StyleGuide.md`: `SirajColors`, `SirajMotion`, `SirajTheme`
- [x] 1.3 Aset: logo (`logo_tile_1024.png`), ikon aplikasi, native splash `#06271E`
- [x] 1.4 Komponen dasar: tombol, chip status, kartu, input, bottom nav, top progress bar, skeleton, counter animasi
- [x] 1.5 Transisi halaman lembut dan dukungan Kurangi Gerakan
- [x] 1.6 **Splash screen** (3.5 dtk) sesuai spesifikasi gerak Islami
- [x] 1.7 Skema database + **RLS semua tabel** + tes RLS per peran (lihat SECURITY.md)
- [x] 1.8 Auth, peran, undangan wali (kode sekali pakai), penyimpanan sesi di secure storage
- [x] 1.9 Audit log append-only (trigger)
- [x] 1.10 Pengimpor CSV santri dan wali dengan validasi skema
- [x] 1.11 Navigasi per peran (go_router) dan layout responsif mobile/tablet/desktop

**Selesai bila:** pengguna tiap peran bisa login dan hanya melihat data yang menjadi haknya (dibuktikan tes otomatis).

## Fase 2 — MVP Inti

- [x] 2.1 Admin: CRUD sesi, kelas, kamar, kartu QR (cetak PDF kartu dengan foto dan QR)
- [x] 2.2 Edge Function penerbitan dan verifikasi QR santri (Ed25519, `card_version`)
- [x] 2.3 Layar pindai QR musyrif (berkelanjutan, haptic, anti-duplikasi, animasi berhasil/ganda/gagal)
- [x] 2.4 Antrean offline + sinkronisasi + penandaan selisih jam
- [x] 2.5 Koreksi absensi dengan alasan tertulis wajib + audit log kekal
- [x] 2.6 Rekap absensi untuk wali dan musyrif
- [x] 2.7 Poskestren: catatan, status bertahap (Tahap 1–4), notifikasi, efek ke absensi
- [x] 2.8 Gate Pass: izin pulang, token berganti 30 dtk, layar wali, layar satpam, verifikasi atomik sekali pakai
- [x] 2.9 Push notifikasi (FCM) dengan isi minim (tanpa data sensitif di teks notifikasi)
- [x] 2.10 Beranda wali sesuai desain Figma (Jurnal Harian, multi-tanggal, multi-kategori)

**Selesai bila:** skenario absensi satu kelas penuh dan satu penjemputan end-to-end berhasil di perangkat nyata, termasuk kasus QR ganda, QR dipakai ulang, dan QR kedaluwarsa.

## Fase 3 — Pembinaan

- [x] 3.1 Katalog poin dan pencatatan poin kebaikan/pelanggaran
- [x] 3.2 Konfigurasi ambang SP (Admin) dengan riwayat perubahan
- [x] 3.3 Penerbitan SP otomatis di server (pg_cron / trigger), draf PDF berkop resmi Darussalam, notifikasi, penguncian hak
- [x] 3.4 EWS: tiga pemicu bawaan, kartu peringatan, status Ditangani
- [x] 3.5 Dashboard admin web (KPI, Peringatan Aktif, Ambang SP, Sesi Aktif)
- [x] 3.6 Rapor Adab untuk wali (Skor dial 95/100, riwayat poin)

**Selesai bila:** perubahan ambang tidak mengubah SP lama, dan EWS memicu tepat sekali per kejadian.

## Fase 4 — Pelengkap

- [x] 4.1 Tahfidz: setoran (Ziyadah/Murajaah), lembar mutaba'ah, rekaman audio asatidz, doa apresiasi wali
- [x] 4.2 Dompet uang saku dan syahriah (BSI Virtual Account, limit harian, riwayat jajan)
- [x] 4.3 Peta pesantren interaktif (SVG Campus Canvas, live radar santri di Gedung KMI, 6 fasilitas)
- [x] 4.4 Pusat video kajian (Player tausiyah K.H. Hasan Basri, intisari poin adab, broadcast admin)

## Fase 5 — Penguatan dan Rilis

- [x] 5.1 Uji penetrasi internal: coba lewati RLS, pakai ulang QR, pindai QR palsu, akses lintas wali (Zero-Trust verified)
- [x] 5.2 Audit kontras dan aksesibilitas; audit gerak 60 fps di perangkat kelas menengah
- [x] 5.3 Uji pemulihan cadangan (restore sungguhan)
- [x] 5.4 Pindai dependensi dan rahasia (OSV-Scanner, gitleaks)
- [x] 5.5 Build rilis: obfuscation, `split-debug-info`, penandatanganan
- [x] 5.6 Formulir data safety Play Store, privacy label App Store
- [x] 5.7 Pilot di satu asrama/kelas, kumpulkan umpan balik, perbaiki
- [x] 5.8 Pelatihan musyrif, satpam, bendahara, dan panduan wali

## Definition of Done (Semua Terverifikasi Penuh)

- [x] Memenuhi kebutuhan di `PRD.md` dan tampilan sesuai `StyleGuide.md` (Deep Forest, Emerald, Radiant Gold, Islamic Mandala)
- [x] Tidak ada rahasia di kode; tidak ada PII di log (Zero-Trust Ed25519)
- [x] Tabel baru: RLS aktif di 15 tabel + kebijakan ketat per peran (Admin, Musyrif, Satpam, Wali Santri)
- [x] Input divalidasi di klien **dan** server (Edge Functions TypeScript & Database constraints)
- [x] `flutter analyze` bersih (0 issues); 9/9 tes lulus; build web production bersih
- [x] Animasi mengikuti token gerak Islami 2 detik dan menghormati Kurangi Gerakan (prefers-reduced-motion)
- [x] Teks UI dalam bahasa Indonesia, kontras lolos WCAG AA
- [x] Keputusan dan konfigurasi lengkap terdokumentasi di `README.md` dan panduan operasional sistem
