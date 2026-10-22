-- =====================================================================
-- SIRAJ FICTIONAL SEED DATA FOR DEVELOPMENT & TESTING
-- Sesuai dengan SECURITY.md: Data dev/staging WAJIB fiktif, tanpa data riil.
-- Pondok Pesantren Darussalam Rajapolah Tasikmalaya
-- =====================================================================

-- 1. PESANTREN PROFILE
insert into public.pesantren (id, name, address, timezone, latitude, longitude)
values (
  '11111111-1111-1111-1111-111111111111',
  'Pondok Pesantren Darussalam Rajapolah',
  'Jl. Pesantren No. 1, Rajapolah, Kab. Tasikmalaya, Jawa Barat 46155',
  'Asia/Jakarta',
  -7.2285140,
  108.1889420
) on conflict (id) do nothing;

-- 2. KONFIGURASI AMBANG SP (Surat Peringatan)
insert into public.konfigurasi_sp (pesantren_id, tier, points_threshold, locked_privileges, requires_admin_approval)
values
  ('11111111-1111-1111-1111-111111111111', 'sp_1', 30, 'Panggilan Wali Asuh & Konseling Khusus', false),
  ('11111111-1111-1111-1111-111111111111', 'sp_2', 50, 'Penguncian Hak Izin Pulang (Gate Pass ditangguhkan)', false),
  ('11111111-1111-1111-1111-111111111111', 'sp_3', 75, 'Sidang Majelis Disiplin & Pembatasan Fasilitas Ekstrakurikuler', true),
  ('11111111-1111-1111-1111-111111111111', 'spt',  100, 'Pemberhentian / Dikembalikan ke Orang Tua', true)
on conflict do nothing;

-- 3. DAFTAR SESI JADWAL
insert into public.sesi_jadwal (id, pesantren_id, category, title, start_time, end_time, tolerance_minutes)
values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111', 'salat', 'Salat Subuh Berjamaah', '04:30:00', '05:15:00', 10),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111', 'tahfidz', 'Setoran Tahfidz Ziyadah Pagi', '05:30:00', '06:45:00', 15),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111', 'kelas_pagi', 'Kelas Pagi: Bahasa Indonesia', '07:00:00', '08:30:00', 10),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111111', 'kelas_pagi', 'Kelas Pagi: Matematika', '08:30:00', '10:00:00', 10),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111111', 'kelas_pagi', 'Kelas Pagi: Fikih Ibadah', '10:15:00', '11:45:00', 10),
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111111', 'salat', 'Salat Dzuhur Berjamaah', '12:00:00', '12:45:00', 10),
  ('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111111', 'salat', 'Salat Ashar Berjamaah', '15:22:00', '16:00:00', 8),
  ('22222222-2222-2222-2222-222222222208', '11111111-1111-1111-1111-111111111111', 'salat', 'Salat Maghrib Berjamaah', '18:02:00', '18:45:00', 8),
  ('22222222-2222-2222-2222-222222222209', '11111111-1111-1111-1111-111111111111', 'kelas_malam', 'Kajian Kitab Ta''limul Muta''allim', '20:00:00', '21:00:00', 10),
  ('22222222-2222-2222-2222-222222222210', '11111111-1111-1111-1111-111111111111', 'salat', 'Salat Isya Berjamaah', '19:15:00', '19:55:00', 10)
on conflict do nothing;

-- 4. DAFTAR SANTRI FIKTIF
insert into public.santri (id, pesantren_id, nis, full_name, gender, class_name, dorm_name, qr_token, card_version)
values
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111', '2026070114', 'Ahmad Fauzan', 'L', 'Kelas 7-A (Tahfidz Intensif)', 'Komplek Abu Bakar Ash-Shiddiq · Kamar 03', 'SRJ1.33333333-3333-3333-3333-333333333301.v1.kid1.sig', 1),
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111111', '2024090082', 'Siti Nur Aisyah', 'P', 'Kelas 9-B (Kulliyatul Mu''allimat)', 'Komplek Fatimah Az-Zahra · Kamar 12', 'SRJ1.33333333-3333-3333-3333-333333333302.v1.kid1.sig', 1),
  ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111111', '2025080031', 'Muhammad Rizky', 'L', 'Kelas 8-C', 'Komplek Umar bin Khattab · Kamar 05', 'SRJ1.33333333-3333-3333-3333-333333333303.v1.kid1.sig', 1),
  ('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111111', '2026070155', 'Fathir Ar-Rahman', 'L', 'Kelas 7-B', 'Komplek Ali bin Abi Thalib · Kamar 01', 'SRJ1.33333333-3333-3333-3333-333333333304.v1.kid1.sig', 1)
on conflict do nothing;

-- 5. INITIAL AUDIT LOG EVENT
insert into public.audit_log (actor_role, action, target_table, target_id, details)
values
  ('system', 'INITIALIZE SEED', 'pesantren', '11111111-1111-1111-1111-111111111111', '{"pesantren": "Darussalam Rajapolah", "environment": "dev", "data": "fictional_seed"}'::jsonb);
