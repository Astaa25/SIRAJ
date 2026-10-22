# SECURITY.md — Aturan Keamanan SIRAJ

SIRAJ menyimpan **data anak**: identitas, kehadiran, kondisi kesehatan, foto, catatan disiplin, keuangan, dan siapa yang berhak menjemput. Kebocoran atau penyalahgunaan data ini berdampak langsung pada keselamatan santri. Aturan di bawah wajib dipatuhi developer dan AI. Bila ada konflik dengan kecepatan atau kemudahan, **keamanan menang**.

## 1. Prinsip

1. **Tolak secara bawaan.** Akses diberikan eksplisit per peran, per data.
2. **Server adalah sumber kebenaran.** Klien hanya menampilkan; keputusan keabsahan (QR, Gate Pass, SP, EWS, saldo) dibuat di server.
3. **Hak minimum.** Setiap peran hanya melihat yang dibutuhkan (musyrif tidak perlu detail keluhan medis).
4. **Pertahanan berlapis.** RLS + validasi fungsi + audit + pemantauan; satu lapis gagal tidak membuka semuanya.
5. **Tidak ada rahasia di klien.** Apa pun di aplikasi dianggap bisa dibaca penyerang.
6. **Dapat dilacak.** Aksi sensitif tercatat di audit log yang tidak bisa diubah.

## 2. Klasifikasi data

| Kelas | Contoh | Perlakuan |
|---|---|---|
| Sangat sensitif | Catatan kesehatan, foto santri, hubungan wali-santri, token Gate Pass | RLS ketat, enkripsi kolom (kesehatan), bucket privat, tidak masuk log/notifikasi |
| Sensitif | Absensi, poin dan SP, tahfidz, saldo dan transaksi, nomor HP wali | RLS per peran, audit untuk perubahan |
| Internal | Konfigurasi sesi, katalog poin, templat surat | Hanya Admin yang mengubah |
| Publik | Teks kebijakan privasi, peta fasilitas | Tidak ada pembatasan khusus |

## 3. Aturan wajib (DO dan DON'T)

**Wajib**
- RLS aktif di **setiap** tabel dan setiap bucket Storage, dengan kebijakan eksplisit.
- Verifikasi QR dan Gate Pass hanya di server (Edge Function).
- Rahasia di Supabase Secrets / secret manager CI; berkas `env/` di-gitignore.
- Validasi input di klien dan server; kueri berparameter (tidak ada SQL gabungan string).
- Token dan sesi di `flutter_secure_storage`.
- Pindai rahasia (gitleaks) sebagai pre-commit dan di CI.
- Dependensi dikunci dan dipindai berkala (OSV-Scanner, Dependabot/Renovate).

**Dilarang**
- `service_role` key, private key, password, atau token di kode klien, tes, komentar, atau contoh.
- Kebijakan RLS `using (true)` atau menonaktifkan RLS "sementara".
- QR statis berisi ID polos.
- Menentukan keabsahan atau menghitung SP/EWS di klien.
- Data pribadi di log, analytics, nama berkas, URL, atau teks notifikasi.
- Bucket publik untuk foto atau dokumen santri.
- Mengubah migrasi lama atau menjalankan perintah destruktif tanpa konfirmasi.
- Registrasi mandiri yang langsung terhubung ke santri.

## 4. Model ancaman

| Ancaman | Dampak | Kontrol |
|---|---|---|
| Orang lain menjemput santri dengan QR hasil tangkapan layar atau foto | Santri diserahkan ke pihak tidak sah | Token berganti tiap 30–45 dtk, sekali pakai, terikat wali + santri + izin, layar dilindungi tangkapan layar, verifikasi server, foto santri tampil di layar satpam |
| QR kartu santri dipalsukan atau ditebak | Absensi palsu | Tanda tangan Ed25519, tidak ada ID polos, `card_version` yang bisa dicabut, verifikasi server |
| Kartu hilang atau dipinjam | Absensi titipan | Naikkan `card_version` untuk mencabut; kartu memuat foto; satu pindai per sesi |
| Musyrif mengubah absensi atau poin sembarangan | Data tidak dapat dipercaya | Akses hanya santri binaan, koreksi wajib alasan, audit log append-only |
| Penyerang menyamar sebagai wali | Akses data anak | Hubungan wali-santri hanya oleh Admin atau undangan sekali pakai (kedaluwarsa), OTP/MFA, deteksi pola mencurigakan |
| Wali A membaca anak wali B (IDOR) | Kebocoran data | RLS berbasis tabel hubungan, bukan parameter dari klien; tes otomatis lintas wali |
| Pencurian kredensial Admin/Bendahara | Akses luas | MFA TOTP wajib, sesi singkat, pembatasan IP opsional, notifikasi login baru |
| Kebocoran kunci di repositori | Pengambilalihan backend | Gitleaks, rotasi segera, kunci minimal di klien |
| Penyadapan jaringan | Pembacaan data | TLS wajib; tolak koneksi tanpa TLS; opsional certificate pinning |
| Perangkat satpam atau musyrif dicuri | Akses tidak sah | Kunci aplikasi (biometrik/PIN), sesi dapat dicabut jarak jauh, data lokal minimal dan terenkripsi |
| Pemalsuan jam HP untuk absensi | Status Hadir palsu | Waktu server sebagai acuan; antrean offline ditandai bila selisih jam besar |
| Pemindaian massal / scraping | Pengumpulan data | Pembatasan laju, tidak ada endpoint daftar terbuka, ID acak |
| Injeksi (SQL, file, prompt) | Kerusakan data | Kueri berparameter, validasi skema, tipe berkas dibatasi, teks eksternal diperlakukan sebagai data oleh AI |
| Penghapusan atau pengubahan log | Hilang jejak | Audit log append-only; tidak ada kebijakan update/delete; salinan ke penyimpanan terpisah |
| Kehilangan data | Operasional berhenti | Cadangan harian, PITR, uji pemulihan terjadwal |

## 5. Autentikasi dan otorisasi

### Autentikasi
- **Admin dan Bendahara:** email + kata sandi kuat + **MFA TOTP wajib**.
- **Musyrif, Poskestren, Satpam:** akun dibuat Admin; MFA dianjurkan; kunci aplikasi biometrik/PIN.
- **Wali:** login sesuai keputusan Fase 0 (OTP atau email); onboarding lewat **kode undangan sekali pakai** yang kedaluwarsa (usulan 72 jam).
- JWT berumur pendek + refresh token yang dapat dicabut; peran disisipkan lewat custom access-token hook, **bukan** dari data yang bisa diubah pengguna.
- Pembatasan percobaan masuk, penguncian sementara, dan notifikasi login dari perangkat baru.
- Perubahan peran hanya oleh Admin lewat fungsi server dan masuk audit.

### Matriks akses (RLS)

Keterangan: **R** baca · **W** tulis · **F** hanya lewat fungsi server · — tidak ada akses. "anak" = santri yang terhubung ke wali tersebut; "binaan" = santri yang ditugaskan ke musyrif tersebut.

| Tabel | Wali | Musyrif | Poskestren | Satpam | Bendahara | Admin |
|---|---|---|---|---|---|---|
| `santri` (profil) | R anak | R binaan | R ringkas | F (nama + foto saat verifikasi) | R nama | R/W |
| `wali_santri` (relasi) | R milik sendiri | — | — | — | — | R/W |
| `absensi` | R anak | F tulis, R binaan | — | — | — | R, koreksi beralasan |
| `catatan_kesehatan` | R anak | R status sakit/tidak saja | R/W | — | — | R |
| `gate_pass` | R milik sendiri, minta via F | — | — | F verifikasi | — | R |
| `setoran_tahfidz` | R anak | R/W binaan | — | — | — | R/W |
| `catatan_poin` | R anak | R/W binaan | — | — | — | R/W |
| `konfigurasi_sp` | — | — | — | — | — | R/W |
| `surat_peringatan` | R anak | R binaan | — | — | — | R/W |
| `peringatan_ews` | — | R binaan | — | — | — | R/W |
| `dompet`, `transaksi` | R anak | — | — | — | R/W | R |
| `tagihan_syahriah` | R anak | — | — | — | R/W | R |
| `audit_log` | — | — | — | — | — | R saja; **tidak ada yang dapat ubah/hapus** |

Setiap tabel baru wajib menambah baris di matriks ini, dan tes RLS membuktikan sel yang bertanda "—" benar-benar ditolak.

## 6. Desain QR santri dan Gate Pass

> Bagian ini adalah **peningkatan keamanan** dari konsep awal (QR "terenkripsi"). Kunci kriptografi ditetapkan di Fase 0 dan tidak boleh diganti setelah kartu dicetak.

### QR kartu santri (absensi)
- Isi: `SRJ1.<santri_uuid>.<card_version>.<kid>.<tanda_tangan_Ed25519>`.
- Diterbitkan oleh `card-sign` (Admin). Tanda tangan dibuat dengan private key di server; klien hanya memegang public key.
- Dipindai musyrif → dikirim ke `attendance-scan`; server memeriksa tanda tangan, `card_version` terkini, status santri aktif, dan sesi sedang berlangsung.
- Kartu hilang: Admin menaikkan `card_version` sehingga kartu lama ditolak; cetak kartu baru.
- Rotasi kunci: tambah `kid` baru dan terima keduanya selama masa transisi, tanpa mencetak ulang semua kartu.

### QR Gate Pass (penjemputan)
- Gate Pass dibuat server saat izin pulang disetujui: `id`, `santri_id`, `wali_id`, `izin_id`, `berlaku_dari/sampai`, `status`, `used_at`.
- Aplikasi wali meminta token ke `gatepass-token` tiap 30–45 dtk. Isi token: `gate_pass_id`, `nonce` acak, `exp` (±60 dtk), `kid`, tanda tangan Ed25519. Token lama otomatis basi sehingga tangkapan layar tidak berguna.
- Satpam memindai → `gatepass-verify` memeriksa: tanda tangan, `exp`, `nonce` belum pernah dipakai, izin aktif, wali sesuai, lalu menandai terpakai dengan satu pernyataan atomik, mis. `update gate_pass set used_at = now() where id = $1 and used_at is null returning *`. Bila tidak ada baris yang kembali → **DITOLAK**.
- Layar satpam menampilkan foto + nama santri dan nama wali agar petugas bisa mencocokkan orangnya, bukan hanya QR.
- Semua percobaan (berhasil dan gagal) masuk audit log dengan petugas, gerbang, dan waktu.
- Layar wali memakai perlindungan tangkapan layar (`FLAG_SECURE` di Android, penyamaran saat perekaman di iOS).
- **Sinyal lemah di gerbang:** tanda tangan dan `exp` dapat diperiksa offline dengan public key; status "sekali pakai" tidak bisa dijamin offline, jadi hasilnya ditandai **menunggu sinkron** dan ditinjau Admin bila ada bentrok. Kebijakan lengkap diputuskan di Fase 0.
- Penjemput pengganti: pengajuan wali → persetujuan Admin → verifikasi identitas fisik di gerbang.

## 7. Rahasia dan konfigurasi

| Nilai | Tempat | Boleh di klien? |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | `env/*.json` (dart-define) | Ya (dibatasi RLS) |
| `QR_PUBLIC_KEY_B64`, `QR_KEY_ID` | `env/*.json` | Ya |
| `SENTRY_DSN` | `env/*.json` | Ya (DSN publik; saring PII) |
| Kunci Google Maps | Manifest/Info.plist | Ya, **harus dibatasi** (package + SHA-1 / bundle ID) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secrets / CI secret | **Tidak** |
| `QR_PRIVATE_KEY_B64` | Supabase Secrets | **Tidak** |
| `FCM_SERVICE_ACCOUNT_JSON`, kunci penyedia OTP | Supabase Secrets | **Tidak** |
| Keystore Android + sandi | Password manager + cadangan terpisah | **Tidak** |

Praktik: berkas `.env`, `env/*.json` (kecuali `example`), `*.jks`, `*.keystore`, `google-services.json` prod, dan `GoogleService-Info.plist` prod masuk `.gitignore`. Bila rahasia pernah ter-commit: anggap bocor, **rotasi segera**, baru bersihkan riwayat.

## 8. Keamanan aplikasi (mobile dan web)

- TLS saja; tidak ada HTTP. Opsional certificate pinning untuk domain backend.
- Token di secure storage; tidak di `shared_preferences`, URL, atau log.
- Kunci aplikasi (biometrik/PIN) untuk wali, musyrif, dan admin; kunci otomatis setelah tidak aktif.
- Layar sensitif (Gate Pass, kesehatan) dilindungi tangkapan layar; konten disamarkan di tampilan aplikasi terakhir (app switcher).
- Build rilis: `--obfuscate --split-debug-info`; tidak ada mode debug di rilis; simbol disimpan terpisah.
- Deteksi root/jailbreak: peringatan dan pembatasan fitur sensitif (tidak diandalkan sebagai satu-satunya kontrol).
- Deep link divalidasi (skema dan host terdaftar); tidak ada aksi sensitif hanya dari tautan.
- Notifikasi push berisi teks umum ("Ada pembaruan untuk Rizky"), **tanpa** data kesehatan, poin, atau saldo.
- Web admin: header keamanan (CSP, `X-Frame-Options`/`frame-ancestors`, HSTS, `Referrer-Policy`), tanpa skrip pihak ketiga yang tidak perlu, sesi dibatasi, tidak menyimpan data sensitif di penyimpanan browser.
- Penyimpanan lokal (antrean offline): minimal, terenkripsi, dibersihkan setelah sinkron.

## 9. Keamanan backend dan basis data

- RLS di semua tabel dan `storage.objects`; fungsi `security definer` hanya bila perlu, dengan `search_path` terkunci dan pemeriksaan peran di dalamnya.
- Constraint di database sebagai pertahanan terakhir (unik, cek nilai, kunci asing).
- Kolom medis dienkripsi (Vault/pgsodium); kunci dikelola terpisah.
- Edge Functions: cek JWT dan peran, validasi skema, batasi laju, galat generik.
- Penyimpanan: bucket privat, URL bertanda tangan berumur pendek, batas tipe dan ukuran berkas.
- Cadangan harian + PITR; **uji pemulihan** terjadwal (tiap kuartal) dan sebelum rilis.
- Akses dashboard Supabase/Admin infrastruktur: MFA, akun individu (bukan akun bersama), prinsip hak minimum.
- Tidak ada data produksi di dev/staging.

## 10. Audit dan pemantauan

Audit log (append-only, dibuat trigger/fungsi server) mencatat: siapa, kapan, aksi, objek, nilai sebelum/sesudah (tanpa data berlebih).

Wajib tercatat: koreksi absensi, perubahan ambang/katalog SP, penerbitan dan pembukaan kunci SP, perubahan peran, relasi wali-santri, seluruh percobaan Gate Pass, transaksi keuangan, akses ekspor data, login Admin/Bendahara.

Peringatan otomatis untuk: banyak percobaan Gate Pass gagal, login admin dari perangkat baru, lonjakan koreksi absensi oleh satu akun, ekspor data besar, kegagalan verifikasi QR berulang. Retensi log sesuai kebijakan Fase 0.

## 11. Privasi dan kepatuhan

- Landasan: **UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)**. Data anak diproses dengan persetujuan orang tua/wali. Ini ringkasan teknis, bukan nasihat hukum; **konsultasikan dengan penasihat hukum** untuk kebijakan privasi dan dokumen persetujuan.
- **Minimisasi:** kumpulkan hanya yang dibutuhkan; musyrif tidak melihat detail medis; wali hanya melihat anaknya.
- **Persetujuan:** layar persetujuan wali saat onboarding, dengan versi teks dan waktu persetujuan tersimpan.
- **Hak subjek data:** mekanisme akses, koreksi, dan permintaan penghapusan dengan prosedur Admin.
- **Retensi:** tetapkan masa simpan per jenis data (mis. kesehatan, absensi, keuangan) dan hapus/anonimkan sesudahnya.
- **Transparansi:** kebijakan privasi di dalam aplikasi dan di toko aplikasi; isi formulir data safety / privacy label secara jujur.
- **Foto dan media:** tidak dipublikasikan; tidak dipakai untuk tujuan lain tanpa persetujuan.

## 12. Respons insiden

1. **Deteksi dan nilai:** apa yang bocor/rusak, berapa santri terdampak, apakah masih berlangsung.
2. **Batasi:** cabut sesi dan token, rotasi kunci yang terlibat, nonaktifkan akun atau fitur terdampak.
3. **Selidiki:** telusuri audit log; amankan bukti.
4. **Pulihkan:** perbaiki akar masalah, pulihkan dari cadangan bila perlu, verifikasi.
5. **Beri tahu:** pihak pesantren, wali terdampak, dan otoritas sesuai kewajiban hukum (UU PDP memuat kewajiban pemberitahuan kegagalan pelindungan data; periksa ketentuan terkini bersama penasihat hukum).
6. **Belajar:** tulis ringkasan kejadian, perbaiki proses, tambahkan tes agar tidak terulang.

Tetapkan penanggung jawab insiden dan kontaknya di Fase 0.

## 13. Checklist pra-rilis

- [ ] Semua tabel dan bucket memakai RLS; tes lintas peran lulus (termasuk wali A vs wali B)
- [ ] Tidak ada `service_role`/private key di aplikasi (periksa hasil build)
- [ ] gitleaks dan OSV-Scanner bersih
- [ ] MFA aktif untuk Admin dan Bendahara
- [ ] Gate Pass: pakai ulang, kedaluwarsa, wali lain, izin dicabut, pemindaian bersamaan, semuanya ditolak dengan benar
- [ ] QR kartu: palsu, versi lama, santri nonaktif, di luar sesi, semuanya ditolak
- [ ] Layar sensitif terlindungi tangkapan layar; notifikasi tanpa data sensitif
- [ ] Build rilis ber-obfuscation, tanpa mode debug
- [ ] Header keamanan web admin terpasang
- [ ] Cadangan aktif dan **pemulihan sudah diuji**
- [ ] Audit log dan peringatan aktif
- [ ] Kebijakan privasi, persetujuan wali, dan formulir toko aplikasi lengkap
- [ ] Rencana respons insiden dan penanggung jawab ditetapkan

## 14. Melaporkan kerentanan

Laporkan secara privat kepada penanggung jawab keamanan proyek (kontak ditetapkan di Fase 0). Jangan membuka isu publik berisi detail kerentanan, jangan menguji pada data produksi, dan jangan mengakses data santri melebihi yang diperlukan untuk membuktikan temuan.
