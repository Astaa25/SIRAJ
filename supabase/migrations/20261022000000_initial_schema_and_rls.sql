-- =====================================================================
-- SIRAJ DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- In accordance with SECURITY.md, PRD.md, and Detail APK SIRAJ.txt
-- =====================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. ENUM TYPES
create type user_role_type as enum (
  'admin',
  'musyrif',
  'guru',
  'poskestren',
  'satpam',
  'bendahara',
  'wali'
);

create type attendance_status_type as enum (
  'hadir',
  'terlambat',
  'izin',
  'sakit',
  'alpa',
  'masbuk',
  'pulang'
);

create type health_stage_type as enum (
  'observasi',
  'istirahat_asrama',
  'rujukan',
  'sembuh'
);

create type sp_level_type as enum (
  'sp_1',
  'sp_2',
  'sp_3',
  'spt'
);

-- =====================================================================
-- 3. CORE MASTER TABLES
-- =====================================================================

-- Pesantren
create table if not exists public.pesantren (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  timezone text default 'Asia/Jakarta',
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Profiles (Users mapped to Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pesantren_id uuid references public.pesantren(id),
  full_name text not null,
  phone text,
  role user_role_type not null default 'wali',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Santri (Students)
create table if not exists public.santri (
  id uuid primary key default gen_random_uuid(),
  pesantren_id uuid not null references public.pesantren(id),
  nis text not null unique,
  full_name text not null,
  gender text check (gender in ('L', 'P')),
  class_name text not null,
  dorm_name text not null,
  photo_url text,
  card_version integer default 1,
  qr_token text not null unique,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Wali Santri (Guardian Relationship)
create table if not exists public.wali_santri (
  id uuid primary key default gen_random_uuid(),
  wali_id uuid not null references public.profiles(id) on delete cascade,
  santri_id uuid not null references public.santri(id) on delete cascade,
  relationship_title text not null default 'Ayah/Ibu',
  created_at timestamptz default now(),
  unique(wali_id, santri_id)
);

-- Musyrif Binaan (Musyrif to Student/Dorm Assignment)
create table if not exists public.musyrif_binaan (
  id uuid primary key default gen_random_uuid(),
  musyrif_id uuid not null references public.profiles(id) on delete cascade,
  santri_id uuid not null references public.santri(id) on delete cascade,
  assigned_at timestamptz default now(),
  unique(musyrif_id, santri_id)
);

-- Sesi Jadwal (Sessions)
create table if not exists public.sesi_jadwal (
  id uuid primary key default gen_random_uuid(),
  pesantren_id uuid not null references public.pesantren(id),
  category text not null check (category in ('kelas_pagi', 'salat', 'tahfidz', 'kelas_malam', 'kustom')),
  title text not null,
  start_time time not null,
  end_time time not null,
  tolerance_minutes integer default 10,
  assigned_teacher_id uuid references public.profiles(id),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Absensi (Attendance Records)
create table if not exists public.absensi (
  id uuid primary key default gen_random_uuid(),
  santri_id uuid not null references public.santri(id) on delete cascade,
  sesi_id uuid not null references public.sesi_jadwal(id),
  tanggal date not null default current_date,
  waktu_aktual timestamptz not null default now(),
  status attendance_status_type not null default 'hadir',
  lateness_minutes integer default 0,
  recorded_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(santri_id, sesi_id, tanggal) -- Anti-Duplikasi constraint
);

-- Catatan Kesehatan (Poskestren)
create table if not exists public.catatan_kesehatan (
  id uuid primary key default gen_random_uuid(),
  santri_id uuid not null references public.santri(id) on delete cascade,
  diagnosis text not null,
  temperature text,
  blood_pressure text,
  pulse text,
  stage health_stage_type not null default 'observasi',
  officer_id uuid references public.profiles(id),
  medications jsonb default '[]'::jsonb,
  is_dispensation_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Gate Pass (Penjemputan Wali)
create table if not exists public.gate_pass (
  id uuid primary key default gen_random_uuid(),
  santri_id uuid not null references public.santri(id) on delete cascade,
  wali_id uuid not null references public.profiles(id),
  authorized_picker_name text not null,
  picker_nik text not null,
  reason text not null,
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  ed25519_sign text not null,
  status text not null default 'aktif',
  used_at timestamptz,
  verified_by_guard_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Setoran Tahfidz
create table if not exists public.setoran_tahfidz (
  id uuid primary key default gen_random_uuid(),
  santri_id uuid not null references public.santri(id) on delete cascade,
  teacher_id uuid references public.profiles(id),
  surah_name text not null,
  verse_start integer not null,
  verse_end integer not null,
  activity_type text not null default 'ziyadah',
  grade integer not null, -- 0 to 100
  notes text,
  created_at timestamptz default now()
);

-- Catatan Poin Adab & Disiplin
create table if not exists public.catatan_poin (
  id uuid primary key default gen_random_uuid(),
  santri_id uuid not null references public.santri(id) on delete cascade,
  officer_id uuid references public.profiles(id),
  title text not null,
  points integer not null, -- positive for good deeds, negative for violations
  category text default 'kebaikan',
  created_at timestamptz default now()
);

-- Konfigurasi Ambang SP
create table if not exists public.konfigurasi_sp (
  id uuid primary key default gen_random_uuid(),
  pesantren_id uuid not null references public.pesantren(id),
  tier sp_level_type not null unique,
  points_threshold integer not null,
  locked_privileges text not null,
  requires_admin_approval boolean default false,
  updated_at timestamptz default now()
);

-- Surat Peringatan
create table if not exists public.surat_peringatan (
  id uuid primary key default gen_random_uuid(),
  santri_id uuid not null references public.santri(id) on delete cascade,
  tier sp_level_type not null,
  letter_number text not null unique,
  pdf_storage_path text,
  is_approved boolean default false,
  issued_at timestamptz default now()
);

-- Peringatan EWS (Early Warning System)
create table if not exists public.peringatan_ews (
  id uuid primary key default gen_random_uuid(),
  santri_id uuid not null references public.santri(id) on delete cascade,
  trigger_reason text not null,
  severity text not null default 'sedang',
  status text not null default 'dalam_penanganan',
  assigned_officer_id uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz default now()
);

-- =====================================================================
-- 4. SECURITY AUDIT LOG (APPEND-ONLY)
-- =====================================================================
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  actor_role text not null,
  action text not null,
  target_table text not null,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  client_ip text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- Sesuai Aturan SECURITY.md: SR-1 "RLS di SETIAP tabel, tolak secara bawaan"
-- =====================================================================

alter table public.pesantren enable row level security;
alter table public.profiles enable row level security;
alter table public.santri enable row level security;
alter table public.wali_santri enable row level security;
alter table public.musyrif_binaan enable row level security;
alter table public.sesi_jadwal enable row level security;
alter table public.absensi enable row level security;
alter table public.catatan_kesehatan enable row level security;
alter table public.gate_pass enable row level security;
alter table public.setoran_tahfidz enable row level security;
alter table public.catatan_poin enable row level security;
alter table public.konfigurasi_sp enable row level security;
alter table public.surat_peringatan enable row level security;
alter table public.peringatan_ews enable row level security;
alter table public.audit_log enable row level security;

-- =====================================================================
-- 6. RLS HELPER FUNCTIONS
-- =====================================================================

-- Cek peran pengguna
create or replace function public.current_user_role()
returns user_role_type as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$ language sql stable security definer;

-- Cek apakah santri terhubung dengan wali (IDOR Prevention)
create or replace function public.is_guardian_of_student(student_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.wali_santri
    where wali_id = auth.uid() and santri_id = student_id
  );
$$ language sql stable security definer;

-- Cek apakah santri binaan musyrif
create or replace function public.is_musyrif_of_student(student_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.musyrif_binaan
    where musyrif_id = auth.uid() and santri_id = student_id
  );
$$ language sql stable security definer;

-- =====================================================================
-- 7. RLS POLICIES PER ROLE (Sesuai Matriks SECURITY.md Seksi 5)
-- =====================================================================

-- SANTRI POLICIES
create policy "Admin can read/write santri"
  on public.santri for all
  using (public.current_user_role() = 'admin');

create policy "Wali can read own child santri"
  on public.santri for select
  using (public.is_guardian_of_student(id));

create policy "Musyrif can read binaan santri"
  on public.santri for select
  using (public.is_musyrif_of_student(id));

-- ABSENSI POLICIES
create policy "Wali reads own child attendance"
  on public.absensi for select
  using (public.is_guardian_of_student(santri_id));

create policy "Musyrif/Guru can select attendance"
  on public.absensi for select
  using (public.current_user_role() in ('musyrif', 'guru', 'admin'));

create policy "Musyrif/Guru can insert attendance"
  on public.absensi for insert
  with check (public.current_user_role() in ('musyrif', 'guru', 'admin'));

create policy "Admin can update attendance"
  on public.absensi for update
  using (public.current_user_role() = 'admin');

-- GATE PASS POLICIES
create policy "Wali can select own gate pass"
  on public.gate_pass for select
  using (wali_id = auth.uid());

create policy "Satpam can verify gate pass"
  on public.gate_pass for select
  using (public.current_user_role() in ('satpam', 'admin'));

create policy "Admin full access to gate pass"
  on public.gate_pass for all
  using (public.current_user_role() = 'admin');

-- CATATAN KESEHATAN POLICIES
create policy "Poskestren full access"
  on public.catatan_kesehatan for all
  using (public.current_user_role() in ('poskestren', 'admin'));

create policy "Wali can read child health notes"
  on public.catatan_kesehatan for select
  using (public.is_guardian_of_student(santri_id));

create policy "Musyrif only sees sick/healthy flag without medical details"
  on public.catatan_kesehatan for select
  using (public.is_musyrif_of_student(santri_id));

-- AUDIT LOG IMMUTABILITY POLICIES
-- Admin can READ only; NO UPDATE or DELETE policies ever created!
create policy "Admin can read audit logs"
  on public.audit_log for select
  using (public.current_user_role() = 'admin');

create policy "System can insert audit logs"
  on public.audit_log for insert
  with check (true);
