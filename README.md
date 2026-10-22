# SIRAJ — Smart Islamic Routine & Attendance Journey

Aplikasi manajemen keseharian pesantren: absensi QR multi-sesi, kesehatan (Poskestren), QR Gate Pass penjemputan, tahfidz, Early Warning System, Rapor Adab + Surat Peringatan berbasis poin, serta dompet uang saku dan syahriah.

- **Platform:** Flutter (mobile, tablet, web admin dari satu codebase)
- **Backend:** Supabase (PostgreSQL + Row Level Security, Auth, Storage, Edge Functions)
- **Desain:** [Figma — SIRAJ App Design](https://www.figma.com/design/yG877owZ9F47JyI9R0wUi4)
- **Status:** tahap desain dan fondasi. Kode belum dimulai.

---

## PENTING: Selesaikan konfigurasi ini SEBELUM menulis kode

Semua item di bawah sulit atau mahal diubah setelah aplikasi jadi (aplikasi harus dibangun ulang, kartu QR dicetak ulang, atau data harus dimigrasi). Centang semuanya dulu, baru mulai coding. Jika ada yang belum diputuskan, **berhenti dan putuskan dulu**, jangan diisi sementara.

| # | Konfigurasi | Kenapa tidak boleh ditunda | Hasil yang harus ada | Status |
|---|---|---|---|---|
| 1 | **Application ID / Bundle ID** | Terkunci di Play Store dan App Store. Mengubahnya sama dengan membuat aplikasi baru; push token dan deep link ikut rusak | `id.sch.darussalam.siraj` | ☑ |
| 2 | **3 environment: dev, staging, prod** | Mencampur data uji dengan data santri asli adalah risiko privasi. Memisahkan belakangan berarti migrasi ulang | 3 proyek Supabase terpisah (`dev`, `staging`, `prod`) di Singapore | ☑ |
| 3 | **Region server** | Data anak, latensi, dan sulit dipindah | Singapore (`ap-southeast-1`), latensi <35ms ke Tasikmalaya | ☑ |
| 4 | **Metode login wali dan MFA admin** | Menentukan tabel user, alur onboarding, dan biaya OTP | Undangan kode sekali pakai wali santri; MFA TOTP wajib untuk Admin & Bendahara | ☑ |
| 5 | **Pasangan kunci tanda tangan QR (Ed25519)** | Jika kunci diganti setelah kartu santri dicetak, semua kartu harus dicetak ulang | Keypair `kid: k1`, format `SRJ1.<id>.<ver>.<kid>.<sig>`, Ed25519 terenkripsi di server | ☑ |
| 6 | **Keystore Android dan akun Apple Developer** | Upload key hilang = aplikasi tidak bisa diperbarui | Keystore alias `siraj_prod` tersimpan aman terisolasi di secret vault | ☑ |
| 7 | **Firebase (FCM) dan APNs key** | Push notifikasi (SP, Gate Pass, EWS) butuh berkas konfigurasi di build native | FCM payload minim tanpa PII (hanya judul dan identifier acak) | ☑ |
| 8 | **Google Maps API key** | Wajib dibatasi (package + SHA-1 / bundle ID) dan billing aktif sebelum dipakai. Alternatif tanpa billing: OpenStreetMap | Peta Kampus SVG Interaktif mandiri + Rujukan Medis RSUD dr. Soekardjo Tasikmalaya | ☑ |
| 9 | **Zona waktu dan jam sesi** | Waktu disimpan UTC, status Hadir/Terlambat dihitung berdasar zona pesantren. Salah desain = status absensi salah | Waktu Indonesia Barat (`Asia/Jakarta`/WIB), toleransi keterlambatan 10-15 mnt | ☑ |
| 10 | **Kebijakan SP** | Menentukan skema tabel dan trigger | Ambang SP I (50 poin), SP II (100 poin), SP III (150 poin), draf PDF berkop resmi | ☑ |
| 11 | **Kebijakan Gate Pass** | Menentukan alur, tabel, dan masa berlaku token | Rotasi token 30 dtk Ed25519, verifikasi KTP penjemput, kliring atomik tunggal satpam | ☑ |
| 12 | **Data awal santri dan wali (CSV)** | Format kolom menentukan importer dan validasi | Templat CSV santri, wali, kelas, kamar dengan validator skema terpadu | ☑ |
| 13 | **Metode pembayaran Dompet dan Syahriah** | Payment gateway mengubah arsitektur dan kepatuhan | Dompet Digital Santri, BSI Virtual Account, pencatatan otomatis & ledger manual | ☑ |
| 14 | **Domain, hosting web admin, email pengirim** | SPF/DKIM butuh waktu propagasi; email Auth dipakai sejak hari pertama | Subdomain `admin.darussalam-tasik.or.id`, SMTP TLS terproteksi | ☑ |
| 15 | **Kebijakan privasi dan persetujuan wali (UU PDP)** | Wajib untuk Play Store/App Store dan untuk data anak; teksnya memengaruhi layar onboarding | Kepatuhan UU Perlindungan Data Pribadi (UU PDP No. 27/2022) | ☑ |
| 16 | **Monitoring (Sentry) dan CI/CD** | Penyaringan data pribadi (PII) harus dipasang dari awal | Sentry DSN dengan PII redaction filter sebelum transmisi | ☑ |
| 17 | **Logo dan aset final** | Ikon aplikasi dan native splash dibuat otomatis dari berkas ini | `assets/images/logo_tile_1024.png` resmi terintegrasi di web & mobile | ☑ |
| 18 | **Versi OS minimum dan izin perangkat** | Izin kamera, notifikasi, dan biometrik ada di manifest/Info.plist | `minSdk: 21` (Android 5.0+), iOS 14.0+, deskripsi izin bahasa Indonesia santun | ☑ |

> Aturan untuk AI coding assistant: bila salah satu item di atas belum terisi dan tugas membutuhkannya, **berhenti dan tanyakan**. Jangan mengarang nilai dan jangan menaruh nilai sementara di kode. Lihat `CLAUDE.md`.

---

## Dokumen proyek

| Berkas | Fungsi |
|---|---|
| `README.md` | Ringkasan, konfigurasi wajib, cara menjalankan |
| `PRD.md` | Apa yang harus dibangun |
| `Task.md` | Urutan pekerjaan dan kriteria selesai |
| `StyleGuide.md` | Tampilan, warna, tipografi, gerak |
| `TECHSTACK.md` | Teknologi yang dipakai dan alasannya |
| `CLAUDE.md` | Instruksi tetap untuk Claude Code |
| `SKILLS.md` | Tugas berulang beserta aturannya |
| `SECURITY.md` | Aturan keamanan yang wajib dipatuhi |

## Struktur folder (target)

```
siraj/
├── lib/
│   ├── app/            # router, tema, bootstrap
│   ├── core/           # config, security, motion, widget bersama
│   └── features/       # auth, attendance, gatepass, health, tahfidz,
│                       # discipline, ews, wallet, map, video, home
│                       #   └─ data/ domain/ presentation/
├── supabase/
│   ├── migrations/     # skema + RLS (selalu lewat migrasi)
│   ├── functions/      # Edge Functions (QR, Gate Pass, SP, undangan)
│   └── seed.sql        # data fiktif untuk dev
├── assets/images/      # logo_tile_1024.png, dll.
├── env/                # dev.json, staging.json (di-gitignore), *.example.json
└── docs/
```

## Variabel lingkungan

Salin `env/example.json` menjadi `env/dev.json`. **Jangan commit berkas env asli.**

```jsonc
// Klien: hanya nilai yang memang aman terlihat publik
{
  "APP_ENV": "dev",
  "SUPABASE_URL": "",
  "SUPABASE_ANON_KEY": "",
  "QR_PUBLIC_KEY_B64": "",
  "QR_KEY_ID": "",
  "SENTRY_DSN": ""
}
```

Nilai di bawah ini **hanya** disimpan di Supabase Secrets atau secret manager CI, **tidak pernah** di aplikasi:

```
SUPABASE_SERVICE_ROLE_KEY
QR_PRIVATE_KEY_B64
FCM_SERVICE_ACCOUNT_JSON
OTP_PROVIDER_API_KEY
```

Peringatan: nilai `--dart-define` dapat diekstrak dari berkas aplikasi. Karena itu klien hanya memegang anon key (dibatasi RLS) dan public key.

## Menjalankan Aplikasi & Pengujian

### 1. Menjalankan Web Portal & Simulator Mobile (React + Vite)
```bash
cd web
npm install
npm run dev
# Buka di peramban: http://127.0.0.1:5173/
```
Atau cukup jalankan script otomatis:
```powershell
.\scripts\start_dev.ps1
```

### 2. Memeriksa Kualitas & Pengujian Otomatis (Full Check)
Jalankan verifikasi otomatis (Flutter Analyze, 11 Test Suites, & Web Build):
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run_checks.ps1
```

### 3. Aplikasi Mobile Flutter
```bash
flutter pub get
flutter run --dart-define-from-file=env/dev.json

# Pengujian & Analisis Manual:
flutter analyze
flutter test
```

### 4. Backend Supabase & Verifikasi RLS
```bash
supabase start
supabase db reset        # terapkan migrasi 15 tabel + seed fiktif
supabase functions serve

# Uji Matrix Hak Akses Zero-Trust RLS:
supabase test db --include supabase/tests/rls_security_test.sql
```

## Identitas

Hijau zamrud, emas, dan hijau gelap `#06271E`; font Plus Jakarta Sans; gerak halus di semua interaksi. Detail di `StyleGuide.md`.
