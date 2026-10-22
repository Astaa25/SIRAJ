# TECHSTACK.md — Teknologi SIRAJ

Daftar ini adalah **keputusan**. AI dan developer tidak boleh mengganti framework atau library tanpa persetujuan tertulis dan pembaruan berkas ini.

Versi: gunakan versi stabil terbaru saat proyek diinisialisasi, lalu **kunci** lewat `pubspec.lock` dan `package-lock`/`deno.lock`. Catat versi yang dipilih di bagian "Versi terkunci" di bawah.

## Ringkasan

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Aplikasi | **Flutter** (Dart) satu codebase: Android, iOS, web admin | Satu sistem desain dan satu tim; animasi halus bawaan |
| State | **Riverpod** | Mudah dites, tidak bergantung pada BuildContext |
| Navigasi | **go_router** | Guard per peran, deep link, URL web admin |
| Backend | **Supabase**: PostgreSQL, Auth, Storage, Edge Functions | RLS di level database cocok untuk akses per peran dan data anak |
| Fungsi server | Edge Functions (TypeScript/Deno) | Penandatanganan QR, verifikasi Gate Pass, undangan wali |
| Penjadwalan | `pg_cron` | EWS dan penerbitan SP berjalan di server, bukan di klien |
| Push | Firebase Cloud Messaging (+ APNs) | Standar untuk Android dan iOS |
| Peta | Google Maps SDK atau OpenStreetMap (`flutter_map`) | Sesuai keputusan Fase 0 |
| Monitoring | Sentry dengan penyaringan PII | Crash dan performa tanpa membocorkan data anak |
| CI/CD | GitHub Actions | Tes, analisis, pindai rahasia, build |

## Paket Flutter utama

| Kebutuhan | Paket | Catatan |
|---|---|---|
| Backend | `supabase_flutter` | Hanya anon key di klien |
| State dan DI | `flutter_riverpod` | |
| Navigasi | `go_router` | |
| Pemindai QR | `mobile_scanner` | Izin kamera dengan teks bahasa Indonesia |
| Penyimpanan aman | `flutter_secure_storage` | Token dan sesi; **bukan** `shared_preferences` |
| Biometrik | `local_auth` | Kunci aplikasi untuk wali, musyrif, dan admin |
| Kriptografi | `cryptography` | Verifikasi tanda tangan Ed25519 di klien |
| Animasi | bawaan Flutter + `flutter_animate` | Hormati Kurangi Gerakan |
| Font | `google_fonts` | Plus Jakarta Sans, di-cache |
| Grafik | `fl_chart` | Animasi tumbuh sesuai StyleGuide |
| Notifikasi | `firebase_messaging`, `flutter_local_notifications` | |
| Model | `freezed`, `json_serializable` | Model tak berubah |
| Format/lokal | `intl` | `id_ID`, zona waktu dari konfigurasi |
| PDF | `pdf`, `printing` | Kartu santri dan draf SP |
| Ikon aplikasi | `flutter_launcher_icons`, `flutter_native_splash` | Dari `assets/images/logo_tile_1024.png`, latar `#06271E` |
| Tes | `flutter_test`, `mocktail` | |
| Pelindung layar | `flutter_windowmanager`-setara / kanal native `FLAG_SECURE` | Layar Gate Pass dan kesehatan |

Aturan menambah paket: periksa pemeliharaan terakhir, jumlah pengguna, dan lisensi; jalankan pemindai kerentanan; minta persetujuan. Jangan menambah paket untuk hal yang bisa ditulis dalam beberapa baris.

## Backend

### Basis data
- PostgreSQL di Supabase, **semua perubahan lewat migrasi** di `supabase/migrations/`.
- Semua tabel: RLS aktif, kebijakan eksplisit per peran. Lihat matriks di `SECURITY.md`.
- Semua waktu disimpan `timestamptz` (UTC); tampilan memakai zona pesantren.
- Kunci utama `uuid`; hindari ID berurutan yang mudah ditebak.
- Constraint di level database: `unique(santri_id, sesi_id, tanggal)` untuk absensi; `used_at` Gate Pass diubah lewat update atomik.
- Data kesehatan: enkripsi kolom (Supabase Vault / pgsodium) untuk keluhan dan catatan medis.

### Edge Functions
| Fungsi | Peran yang boleh memanggil | Tugas |
|---|---|---|
| `card-sign` | admin | Menerbitkan QR kartu santri (tanda tangan Ed25519, `card_version`) |
| `attendance-scan` | musyrif | Memverifikasi QR kartu, mencatat absensi dengan waktu server |
| `gatepass-token` | wali | Menerbitkan token berumur pendek yang berganti |
| `gatepass-verify` | satpam | Memverifikasi dan menandai terpakai secara atomik |
| `invite-wali` | admin | Membuat kode undangan sekali pakai |
| `sp-issue` | sistem (cron) | Menerbitkan draf SP saat ambang tercapai |

Semua fungsi memeriksa JWT dan peran, memvalidasi input dengan skema, dan membatasi laju.

### Storage
- Bucket **privat** untuk foto santri dan dokumen SP; akses lewat URL bertanda tangan berumur pendek.
- Batasi tipe berkas dan ukuran; pindai nama berkas; tidak ada bucket publik untuk data anak.

## Lingkungan

| Env | Tujuan | Data |
|---|---|---|
| `dev` | Pengembangan lokal | Seed **fiktif** |
| `staging` | Uji sebelum rilis | Data fiktif atau anonim |
| `prod` | Operasional | Data asli, akses dibatasi, PITR aktif |

Tidak ada data produksi di dev atau staging.

## Konfigurasi terkait (harus beres di Fase 0)

Application ID, 3 proyek Supabase, penyedia OTP, kunci Ed25519, keystore, Firebase/APNs, kunci peta, domain/SMTP, Sentry, dan CI. Daftar lengkap ada di `README.md`.

## Hal yang sengaja tidak dipakai

| Hindari | Alasan |
|---|---|
| Menyimpan token di `shared_preferences` | Tidak terenkripsi |
| `service_role` key di aplikasi | Melewati RLS; sama dengan memberi akses penuh ke semua data |
| QR statis berisi ID polos | Bisa ditebak dan digandakan |
| Logika SP/EWS di klien | Bisa dilewati dan tidak konsisten |
| Firebase untuk data inti dan Supabase sekaligus | Dua sumber kebenaran; hanya FCM dari Firebase |
| Mengganti framework di tengah jalan | Mahal dan berisiko |

## Versi terkunci (isi saat inisialisasi)

```
Flutter:            ______
Dart:               ______
Supabase CLI:       ______
Deno (functions):   ______
PostgreSQL:         ______ (ikut Supabase)
Android minSdk:     ______
iOS minimum:        ______
```
