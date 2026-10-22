# SKILLS.md — Tugas Berulang dan Aturannya

Daftar tugas yang sering diminta ke AI, lengkap dengan langkah dan aturan agar tidak perlu menjelaskan ulang. Setiap skill diawali **Cek konfigurasi**: bila ada yang belum tersedia, berhenti dan tanyakan (lihat `CLAUDE.md`).

---

## 1. Membuat layar baru

**Cek konfigurasi:** token desain (`SirajColors`, `SirajMotion`) sudah ada; rute dan peran yang boleh mengakses sudah ditentukan.

1. Cari desainnya di Figma (frame bernama sesuai layar). Bila tidak ada, minta pengguna membuat atau menyetujui rancangan.
2. Buat `features/<fitur>/presentation/<nama>_screen.dart` dan widget kecil terpisah.
3. Pakai komponen dari `core/widgets`; jangan menyalin gaya.
4. Tambahkan rute di go_router dengan **guard peran**.
5. Tiga keadaan wajib: memuat (skeleton), kosong, galat (pesan ramah + coba lagi).
6. Animasi masuk: fade + naik 12 px, stagger 40 ms; hormati Kurangi Gerakan.
7. Uji di lebar mobile, tablet, dan desktop.

**Aturan:** tidak ada hex, durasi, atau teks keras di widget; teks UI bahasa Indonesia; target sentuh ≥ 48 px.

---

## 2. Membuat komponen UI

1. Cek apakah komponen serupa sudah ada di `core/widgets`.
2. Bangun sesuai `StyleGuide.md` (radius, bayangan, warna, ukuran teks).
3. Sediakan varian dan status (normal, ditekan, nonaktif, galat).
4. Tulis golden test atau widget test sederhana.
5. Dokumentasikan di halaman katalog komponen (jika ada).

**Aturan:** kontras lolos AA (lihat tabel kontras di StyleGuide); label semantik untuk pembaca layar.

---

## 3. Menambah animasi

**Cek konfigurasi:** token gerak tersedia.

1. Pilih token durasi dan kurva dari `SirajMotion`, jangan menulis angka baru.
2. Animasikan hanya `transform`/`opacity`.
3. Sediakan jalur Kurangi Gerakan (fade 150 ms atau nilai akhir langsung).
4. Satu animasi besar aktif per layar; tidak ada kedipan lebih dari 3 kali per detik.
5. Periksa 60 fps di perangkat kelas menengah (profile mode).

---

## 4. Menambah tabel atau kolom baru (migrasi + RLS)

**Cek konfigurasi:** kebijakan akses untuk tiap peran sudah jelas (lihat matriks di `SECURITY.md`); tidak ada data produksi di lingkungan yang dipakai.

1. `supabase migration new <nama>`; jangan ubah migrasi lama.
2. Buat tabel dengan `uuid` PK, `created_at`/`updated_at` `timestamptz`, kunci asing, dan constraint (unik, cek nilai).
3. `alter table … enable row level security;` **dan** buat kebijakan eksplisit per peran. Tidak ada `using (true)`.
4. Tabel yang sensitif: pasang trigger audit; kolom medis dienkripsi.
5. Tulis tes RLS: untuk setiap peran, buktikan **boleh** dan **tidak boleh** (termasuk wali A membaca anak wali B → harus ditolak).
6. Perbarui matriks di `SECURITY.md`.

---

## 5. Menulis Edge Function

**Cek konfigurasi:** secrets yang dibutuhkan sudah ada di Supabase (bukan di kode).

1. Verifikasi JWT dan peran di baris pertama; tolak bila tidak sesuai.
2. Validasi input dengan skema; tolak field tak dikenal.
3. Batasi laju per pengguna dan per IP.
4. Pakai klien dengan hak pengguna bila memungkinkan; `service_role` hanya bila perlu dan hanya di server.
5. Kembalikan galat generik ke klien; detail ke log server **tanpa PII**.
6. Tulis tes untuk jalur sukses, ditolak, input rusak, dan pemakaian ulang.

---

## 6. Absensi QR (pindai, verifikasi, simpan)

1. Klien memindai, mengirim token ke `attendance-scan`; **server** memverifikasi tanda tangan, `card_version`, dan sesi aktif.
2. Waktu pencatatan = waktu server. Bila offline, simpan antrean dengan waktu perangkat dan tandai bila selisih jam lebih dari batas.
3. Anti-duplikasi lewat `unique(santri_id, sesi_id, tanggal)`; tangani konflik sebagai "sudah tercatat", bukan galat.
4. Umpan balik: berhasil (centang + denyut + getar ringan), ganda (goyang kecil amber), gagal (pesan jelas).
5. Koreksi manual wajib alasan dan masuk audit.

---

## 7. Gate Pass (wali dan satpam)

1. Wali: meminta token ke `gatepass-token` tiap 30–45 dtk; layar dilindungi dari tangkapan layar.
2. Satpam: memindai dan memanggil `gatepass-verify`; tampilkan SAH atau DITOLAK + alasan.
3. Server memvalidasi: tanda tangan, kedaluwarsa, `nonce` belum dipakai, izin aktif, wali sesuai santri; menandai terpakai dengan **update atomik**.
4. Semua percobaan (sukses dan gagal) masuk audit log.
5. Uji wajib: pakai ulang token, token kedaluwarsa, token wali lain, izin dicabut, dan dua satpam memindai bersamaan.

---

## 8. Menerbitkan SP dan memproses EWS

1. Logika berjalan di server (`pg_cron` + fungsi), bukan di klien.
2. Ambang dibaca dari tabel konfigurasi; perubahan ambang tidak mengubah SP lama.
3. Idempoten: satu SP per ambang per santri, satu EWS per kejadian.
4. Pembentukan draf PDF memakai templat berkop; simpan di bucket privat.
5. Penguncian hak istimewa dan pembukaannya wajib beralasan dan teraudit.
6. Notifikasi ke wali berisi pesan umum; detail dibuka setelah masuk aplikasi.

---

## 9. Menambah ikon, aset, atau logo

1. Logo asli: `assets/images/logo_tile_1024.png` (sudut transparan). Jangan membuat ulang atau mengubah logo.
2. Daftarkan di `pubspec.yaml`; hasilkan ikon dengan `flutter_launcher_icons` dan splash native dengan `flutter_native_splash` (latar `#06271E`).
3. Ikon UI bergaya garis 2 px, grid 24 px; tambahkan ke katalog ikon.

---

## 10. Tinjauan keamanan sebelum PR

Centang semua sebelum menandai tugas selesai:

- [ ] Tidak ada rahasia di diff (jalankan gitleaks)
- [ ] Tidak ada `service_role` atau private key di kode klien
- [ ] Tabel baru: RLS + kebijakan + tes per peran
- [ ] Keputusan penting (QR, Gate Pass, SP, EWS, harga/saldo) ada di server
- [ ] Input divalidasi di klien dan server; kueri berparameter
- [ ] Tidak ada PII di log, analytics, atau Sentry
- [ ] Penyimpanan token memakai secure storage
- [ ] Layar sensitif (Gate Pass, kesehatan) dilindungi tangkapan layar
- [ ] Dependensi baru sudah diperiksa (pemeliharaan, lisensi, kerentanan)
- [ ] Galat tidak membocorkan detail teknis atau data pengguna lain
- [ ] Audit log tercatat untuk aksi sensitif

---

## 11. Persiapan rilis

1. Seluruh tabel konfigurasi di `README.md` tercentang.
2. Pindai dependensi (OSV-Scanner) dan rahasia (gitleaks) bersih.
3. Build rilis dengan `--obfuscate --split-debug-info`, ditandatangani dengan keystore yang dicadangkan.
4. Uji pemulihan cadangan database dilakukan dan dicatat.
5. Formulir data safety / privacy label dan URL kebijakan privasi siap.
6. Pilot terbatas sebelum rilis penuh; siapkan rencana rollback.

---

## Templat prompt singkat

```
Kerjakan tugas <nomor di Task.md>.
Sebelum mulai: cek konfigurasi yang dibutuhkan dan sebutkan bila ada yang kurang.
Baca: PRD.md, StyleGuide.md, SECURITY.md.
Ikuti skill "<nama skill>" di SKILLS.md.
Keluaran: kode + tes + ringkasan (apa dikerjakan, apa diuji, apa yang masih butuh konfigurasi).
```
