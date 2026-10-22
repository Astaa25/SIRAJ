# Product Requirements Document — SIRAJ

Versi 1.1 · 22 Oktober 2026 · Sumber: Dokumen Konsep Lengkap SIRAJ v3 + PRD lengkap (Claude Docs). Berkas ini adalah ringkasan kerja untuk developer dan AI; bila ada beda, PRD lengkap yang menang.

## Product Goal

Membuat keseharian santri tercatat rapi dan transparan bagi wali, mudah dibina oleh musyrif, dan aman bagi data anak.

Masalah yang diselesaikan:
- Absensi manual per sesi lambat dan rawan data ganda.
- Wali tidak tahu kondisi anak (kehadiran, kesehatan, adab, hafalan) secara berkala.
- Penjemputan santri rawan diserahkan ke pihak yang tidak sah.
- Pembinaan disiplin tidak konsisten karena tidak ada ambang yang jelas dan terdokumentasi.
- Santri yang mulai bermasalah baru terdeteksi setelah terlambat.

## Target Users

| Peran | Kebutuhan utama | Platform |
|---|---|---|
| Santri | Kartu QR pribadi untuk absensi, tanpa perlu HP | Kartu fisik |
| Wali | Memantau anak, menerima QR Gate Pass dan notifikasi SP | Mobile |
| Musyrif / Ustadz | Memindai absensi, mencatat tahfidz dan poin adab, menerima peringatan EWS | Mobile, tablet |
| Petugas Poskestren | Mencatat kondisi dan status kesehatan | Mobile, tablet |
| Satpam | Memverifikasi QR Gate Pass di gerbang | Mobile, tablet |
| Bendahara | Uang saku dan syahriah | Web admin |
| Admin | Konfigurasi, data master, laporan, dashboard EWS | Web admin |

## Core Features

Prioritas: **P0** wajib di rilis pertama, **P1** menyusul.

### P0
- [ ] **Jurnal harian dan absensi QR multi-sesi.** Sesi diatur Admin; santri memakai kartu QR; satu santri tercatat sekali per sesi per hari; status Hadir/Terlambat/Izin/Sakit/Alpa otomatis; koreksi manual wajib beralasan; mode offline dengan sinkronisasi.
- [ ] **Pelacak Poskestren.** Catatan sakit dan status bertahap (Observasi, Istirahat, Rujukan, Sembuh); notifikasi ke wali; status Sakit otomatis memengaruhi absensi.
- [ ] **QR Gate Pass.** QR penjemputan untuk wali sah; verifikasi satpam: token valid, belum dipakai, belum kedaluwarsa, milik wali yang terhubung, izin aktif.
- [ ] **Early Warning System.** Pemicu bawaan: terlambat 3x berturut-turut, sakit lebih dari 3 hari berturut-turut, poin pelanggaran mendekati ambang (usulan 80%, dapat diatur).
- [ ] **Rapor Adab dan SP berbasis poin.** Katalog poin, ambang SP I/II/III/SPT diatur Admin, draf surat otomatis, notifikasi wali, penguncian hak istimewa sesuai kebijakan.
- [ ] **Autentikasi, peran, dan audit log.**

### P1
- [ ] Profil dan mutaba'ah tahfidz
- [ ] Dompet uang saku dan pembayaran syahriah (v1: pencatatan manual Bendahara)
- [ ] Peta pesantren dan fasilitas rujukan
- [ ] Pusat video kajian dan adab (tautan YouTube)

### Non-tujuan (versi ini)
Bukan LMS (nilai akademik), bukan aplikasi pembayaran publik, tidak menyimpan video sendiri.

## Aturan Perilaku Penting

| Area | Aturan |
|---|---|
| Absensi | Unik per (santri, sesi, tanggal). Waktu pindai ditentukan **server**, bukan jam HP |
| Status terlambat | Dihitung dari jam mulai sesi + toleransi, dalam zona waktu pesantren |
| Gate Pass | Sekali pakai, berumur pendek, berganti otomatis, hanya diverifikasi oleh server |
| SP | Dibuat oleh server saat ambang tercapai; perubahan ambang tidak mengubah SP yang sudah terbit |
| EWS | Satu peringatan per kejadian; dapat ditandai Ditangani dengan catatan |
| Data kesehatan | Musyrif hanya melihat status (sakit/tidak), bukan detail keluhan |
| Hubungan wali-santri | Hanya dibuat oleh Admin atau lewat kode undangan sekali pakai, tidak bisa self-service |

## Persyaratan Keamanan (ringkas, detail di SECURITY.md)

- **SR-1** Semua tabel memakai Row Level Security, tolak secara bawaan.
- **SR-2** QR santri dan Gate Pass bertanda tangan digital; verifikasi hanya di server.
- **SR-3** Tidak ada rahasia di kode atau di aplikasi; hanya anon key dan public key di klien.
- **SR-4** MFA wajib untuk Admin dan Bendahara; sesi singkat dan dapat dicabut.
- **SR-5** Audit log append-only untuk koreksi absensi, perubahan ambang SP, penerbitan SP, validasi Gate Pass, dan transaksi.
- **SR-6** Data kesehatan dan foto santri dilindungi: penyimpanan privat, URL bertanda tangan berumur pendek.
- **SR-7** Kepatuhan UU PDP: persetujuan wali, minimisasi data, kebijakan retensi.

## Kebutuhan Nonfungsional

| Aspek | Target |
|---|---|
| Kinerja | Pindai QR di bawah 2 dtk; validasi Gate Pass di bawah 3 dtk; muat layar utama di bawah 2 dtk (4G) |
| Keandalan | Absensi tetap berjalan offline; ketersediaan 99,5%; cadangan harian + uji pemulihan |
| Aksesibilitas | Kontras WCAG AA, target sentuh minimal 48 px, pembaca layar, mode Kurangi Gerakan |
| Responsif | Mobile (di bawah 600 px), tablet (600–1024), desktop admin (di atas 1024) |
| Gerak | 60 fps pada perangkat kelas menengah; token gerak di StyleGuide.md |
| Bahasa | Indonesia; kerangka siap Arab (RTL) dan Inggris |

## Success Metrics

| Metrik | Target |
|---|---|
| Waktu pindai per santri | < 2 dtk |
| Kelengkapan absensi per sesi | ≥ 98% dalam 10 menit |
| Validasi Gate Pass di gerbang | < 3 dtk |
| Penjemputan oleh pihak tidak sah | 0 kasus |
| Wali aktif bulanan | ≥ 80% |
| Kasus berisiko tertangkap EWS sebelum eskalasi | ≥ 90% |
| Crash-free sessions | ≥ 99,5% |
| Temuan keamanan kritis saat uji penetrasi pra-rilis | 0 |

## Keputusan yang Harus Dikunci Sebelum Coding

Setiap baris memiliki rekomendasi bawaan agar bisa langsung disetujui atau diubah. Daftar konfigurasi teknis ada di `README.md`.

| Keputusan | Rekomendasi |
|---|---|
| SP otomatis terkirim ke wali, atau menunggu persetujuan Admin? | Menunggu persetujuan Admin pada SP III dan SPT; SP I dan II otomatis |
| Hak istimewa yang dikunci | Izin keluar dan hak pulang, dengan alasan pembukaan kunci tercatat |
| Penjemput pengganti | Wali mengajukan, Admin menyetujui, penjemput verifikasi identitas di gerbang |
| Masa berlaku token Gate Pass | Token tampil berganti tiap 30–45 dtk; izin berlaku sesuai jadwal jemput |
| Gate di area sinyal lemah | Satpam tetap bisa verifikasi tanda tangan offline, status "menunggu sinkron" ditandai untuk ditinjau |
| Pembayaran | v1 pencatatan manual; payment gateway di rilis berikutnya |
| Santri punya akun? | Tidak di v1 (kartu QR saja) |

## Rencana Rilis

| Fase | Cakupan | Perkiraan |
|---|---|---|
| 0 | Konfigurasi dan keputusan terkunci | 1 minggu |
| 1 | Fondasi: desain sistem, auth, RLS, data master | 3 minggu |
| 2 | MVP: absensi QR, Poskestren, Gate Pass | 6 minggu |
| 3 | Pembinaan: EWS, Rapor Adab, SP | 5 minggu |
| 4 | Pelengkap: Tahfidz, Dompet/Syahriah, Peta, Video | 5 minggu |
| 5 | Penguatan: uji keamanan, performa, pilot | 3 minggu |

Estimasi awal; sesuaikan dengan ukuran tim.
