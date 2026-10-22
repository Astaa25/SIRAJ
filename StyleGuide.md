# StyleGuide.md — Design System SIRAJ

Sumber visual: [Figma — SIRAJ App Design](https://www.figma.com/design/yG877owZ9F47JyI9R0wUi4), frame **0 · Asset & Style Guide**. Warna terdaftar sebagai Figma Variables (koleksi "SIRAJ Colors").

## Design Personality

Hangat · Bersih · Tepercaya · Islami modern · Lembut

Layar utama didominasi putih dan mint dengan gradien zamrud. Hijau gelap `#06271E` dan emas dipakai sebagai aksen dan untuk momen khusus (splash, sidebar admin, mode gelap). Bayangan lembut, tanpa garis tepi keras pada kartu.

## Colors

### Token warna

| Token Dart | Hex | Penggunaan |
|---|---|---|
| `white` | `#FFFFFF` | Latar utama, kartu |
| `mint` | `#F4FBF7` | Latar sekunder |
| `emerald800` | `#065F46` | Awal gradien, teks aksi di atas putih |
| `emerald600` | `#059669` | Tengah gradien, ikon aktif |
| `emerald500` | `#10B981` | Akhir gradien, indikator sukses, glow |
| `deepForest` | `#06271E` | Splash, judul, sidebar admin, mode gelap, status bar |
| `forest` | `#0D4332` | Permukaan di atas deepForest |
| `goldLight` / `gold` / `goldDark` | `#FFE49A` / `#E8B65A` / `#C98A3C` | Logo, aksen, gradien emas |
| `successBg` | `#D1FAE5` | Chip Hadir, latar sukses |
| `warningBg` | `#FFF1D6` | Chip Terlambat, peringatan |
| `dangerBg` | `#FDE8E8` | Chip Alpa, galat |
| `textMuted` | `#5B7A70` | Teks sekunder |

Gradien zamrud: `#065F46 → #059669 → #10B981` (header, tombol utama).
Gradien emas: `#FFE49A → #E8B65A → #C98A3C` (logo, splash).

Warna status (teks): Hadir `#065F46`, Terlambat `#9A6212`, Sakit `#0369A1`, Izin `#6D28D9`, Alpa `#B42318`.

### Aturan kontras (WCAG AA)

| Kombinasi | Rasio | Boleh untuk |
|---|---|---|
| `#06271E` di putih | sangat tinggi | semua teks |
| `#065F46` di putih | ±7,7:1 | semua teks |
| `#5B7A70` di putih | ±4,7:1 | teks sekunder (jangan lebih kecil dari 12 px) |
| `#059669` di putih | ±3,8:1 | **hanya** teks besar (≥ 18 px tebal / 24 px) dan ikon |
| `#10B981` di putih | rendah | **jangan** untuk teks; hanya indikator dan latar |
| Emas `#E8B65A` | tinggi di atas `#06271E` | teks hanya di atas hijau gelap, bukan di atas putih |

## Typography

**Plus Jakarta Sans** (paket `google_fonts`, di-cache agar tidak bergantung jaringan).

| Gaya | Ukuran/Tinggi baris | Berat | Penggunaan |
|---|---|---|---|
| Display | 28/36 | Bold | Angka dan judul utama |
| Judul | 20/28 | SemiBold | Judul halaman |
| Subjudul | 16/24 | Medium | Judul kartu, nama santri |
| Isi | 14/22 | Regular | Teks umum |
| Caption | 12/18 | Regular | Keterangan, label |

Angka pada counter memakai angka tabular (`FontFeature.tabularFigures()`) supaya lebar tidak bergoyang saat berubah.

## Component Style

- **Radius:** 12 (tombol, input), 16 (kartu kecil, chip besar), 20 (kartu utama), 24 (bottom sheet), 32 (header gradien).
- **Bayangan:** hijau lembut, opasitas 6–14%, blur 12–32. Hindari bayangan hitam.
- **Tanpa garis tepi keras** pada kartu. Garis `#D1FAE5` 1 px hanya untuk input dan pemisah.
- **Tombol utama:** gradien zamrud, teks putih SemiBold 15, tinggi 52, radius 14–16. Varian: Emas (teks `#06271E`), Outline (`#059669`), Nonaktif (`#E3EEE9` / teks `#9CB3AA`).
- **Chip status:** titik 6 px + teks 12 Medium, radius penuh, latar pastel sesuai status.
- **Bottom nav (mobile):** 5 item, ikon aktif `#059669` dengan label tebal; latar putih, sudut atas 24.
- **Sidebar (admin web):** latar `#06271E`, item aktif pil bergradien zamrud, teks putih 70% untuk item biasa.
- **Ikon:** gaya garis 2 px, sudut membulat, grid 24 px.
- **Target sentuh:** minimal 48 × 48 px.
- **Responsif:** mobile < 600 px (bottom nav, 1 kolom); tablet 600–1024 (grid 2 kolom); desktop > 1024 (sidebar, tabel, dashboard multi-kolom).

## Motion (Soft Motion)

Prinsip: lembut, natural, konsisten, cepat terasa. Gerak membantu orientasi dan memberi umpan balik, tidak pernah menghalangi tugas.

### Token

| Token Dart | Nilai | Penggunaan |
|---|---|---|
| `SirajMotion.micro` | 120 ms | Tekan tombol, toggle |
| `SirajMotion.short` | 200 ms | Hover, chip, fade kecil |
| `SirajMotion.medium` | 320 ms | Transisi halaman, sheet, dialog |
| `SirajMotion.long` | 500 ms | Reveal kartu, centang sukses |
| `SirajMotion.data` | 600–900 ms | Grafik dan counter |
| `SirajMotion.soft` | `Cubic(0.22, 1, 0.36, 1)` | Kurva bawaan (masuk, geser) |
| `SirajMotion.exit` | `Cubic(0.4, 0, 1, 1)` | Elemen menghilang |
| `SirajMotion.stagger` | 40 ms/item, maks. 8 | Daftar dan grid |
| Pegas | damping 0,8 | Bottom sheet, kartu yang diseret |

### Perilaku

| Elemen | Gerak |
|---|---|
| Ripple | Gelombang emerald 12%, 400 ms |
| Top progress bar | Garis 3 px gradien zamrud di tepi atas, muncul bila muat lebih dari 300 ms |
| Transisi halaman | Fade-through + geser 16 px, 320 ms; elemen bersama pakai Hero |
| Bottom nav | Ikon aktif naik 2 px; indikator pil bergeser dengan pegas |
| Daftar/kartu | Fade + naik 12 px, stagger 40 ms; tekan kartu menskala 0,98 |
| Skeleton | Kilau menyapu tiap 1,4 dtk; ganti konten dengan cross-fade 200 ms |
| Counter | 0 → nilai akhir, 800 ms, ease-out |
| Grafik batang | Tumbuh dari dasar 600 ms, jeda 50 ms antar batang; diputar sekali per tampilan |
| Pindai QR berhasil | Bingkai hijau, centang tergambar 500 ms, denyut 1,0 → 1,04 → 1,0, getar ringan |
| Pindai ganda/gagal | Goyang 6 px 280 ms, warna amber lembut (bukan merah keras) |
| QR Gate Pass | Cincin glow zamrud "bernapas" 2,4 dtk; cincin hitung mundur mengecil halus |

### Splash (3–5 detik)

Latar `#06271E`. Urutan: cahaya radial zamrud/emas memudar masuk (0–0,4 dtk) → logo fade + skala 0,92→1 dengan glow berdenyut (0,4–1,6) → "SIRAJ" muncul huruf demi huruf, stagger 60 ms (1,6–2,6) → tagline fade (2,6–3,2) → lingkaran cahaya mengembang dan melebur ke beranda putih (3,2–4,0).

Aturan: minimal 3 dtk, maksimal 5 dtk; jangan ditutup lebih awal walau data siap; bila lebih dari 5 dtk tampilkan progres halus di bawah. Gunakan `assets/images/logo_tile_1024.png` (logo asli, sudut transparan).

### Aksesibilitas dan kinerja gerak

- **Kurangi Gerakan** (`MediaQuery.disableAnimations`): ganti geser/skala dengan fade 150 ms, counter dan grafik langsung ke nilai akhir, splash dipersingkat tanpa denyut.
- Animasikan hanya `transform` dan `opacity`; hindari memicu tata letak ulang saat bergerak.
- Satu animasi besar aktif per layar; tidak ada kedipan lebih dari 3 kali per detik.
- Mode hemat daya: kurangi blur dan glow, matikan loop dekoratif.
- Target 60 fps di perangkat kelas menengah.

## Aturan penggunaan

1. Jangan menambahkan warna di luar tabel tanpa memperbarui Figma Variables dan berkas ini.
2. Jangan menulis hex langsung di widget; pakai `SirajColors`.
3. Jangan menulis durasi atau kurva langsung; pakai `SirajMotion`.
4. Jangan menaruh teks kecil berwarna `#10B981` atau emas di latar putih.
5. Logo dipakai apa adanya; jangan diputar, diregangkan, atau diberi efek tambahan. Ruang bebas minimal setengah tinggi logo.
