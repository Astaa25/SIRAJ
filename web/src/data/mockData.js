/**
 * SIRAJ MOCK DATA & REPOSITORY
 * Sistem Informasi & Presensi Terpadu Pondok Pesantren
 * Mendukung Multi-Tenant Super Admin, Admin Ponpes, Kepala Pengasuhan, Guru BK,
 * Guru KBM (per mapel), Ustadz Ubudiyyah (auto waktu salat), Musyrif Asrama (izin mandiri),
 * Satpam (popup notif 5s), dan Wali Santri.
 */

// =====================================================================
// MULTI-TENANT PONDOK PESANTREN (SUPER ADMIN MANAGEMENT)
// =====================================================================
export const INITIAL_TENANTS = [
  {
    id: "ponpes-01",
    name: "Pondok Pesantren Darussalam Rajapolah",
    shortName: "PP. Darussalam Rajapolah",
    location: "Rajapolah, Tasikmalaya, Jawa Barat",
    leader: "K.H. Hasan Basri",
    dormTerm: "Asrama", // Istilah: Asrama, Sakan, Komplek, atau Gedung
    licenseType: "Enterprise Unlimited",
    licenseKey: "SRJ-ENT-DARUSSALAM-2026-X981",
    status: "Aktif",
    studentCount: 1248,
    adminEmail: "admin@darussalam.ac.id",
    prayerSchedule: {
      subuh: { name: "Salat Subuh", adzan: "04:15", start: "04:15", end: "05:45", toleranceOnTime: "04:35" },
      dzuhur: { name: "Salat Dzuhur", adzan: "11:52", start: "11:52", end: "15:14", toleranceOnTime: "12:05" },
      ashar: { name: "Salat Ashar", adzan: "15:15", start: "15:15", end: "17:54", toleranceOnTime: "15:30" },
      maghrib: { name: "Salat Maghrib", adzan: "17:55", start: "17:55", end: "19:07", toleranceOnTime: "18:05" },
      isya: { name: "Salat Isya", adzan: "19:08", start: "19:08", end: "04:14", toleranceOnTime: "19:25" },
    },
  },
  {
    id: "ponpes-02",
    name: "Pondok Modern Darussalam Gontor",
    shortName: "PM. Gontor Darussalam",
    location: "Ponorogo, Jawa Timur",
    leader: "K.H. Hasan Abdullah Sahal",
    dormTerm: "Sakan",
    licenseType: "Enterprise Multi-Campus",
    licenseKey: "SRJ-ENT-GONTOR-2026-B102",
    status: "Aktif",
    studentCount: 4200,
    adminEmail: "admin@gontor.ac.id",
    prayerSchedule: {
      subuh: { name: "Salat Subuh", adzan: "04:05", start: "04:05", end: "05:35", toleranceOnTime: "04:25" },
      dzuhur: { name: "Salat Dzuhur", adzan: "11:42", start: "11:42", end: "15:05", toleranceOnTime: "11:55" },
      ashar: { name: "Salat Ashar", adzan: "15:06", start: "15:06", end: "17:45", toleranceOnTime: "15:20" },
      maghrib: { name: "Salat Maghrib", adzan: "17:46", start: "17:46", end: "18:58", toleranceOnTime: "17:56" },
      isya: { name: "Salat Isya", adzan: "18:59", start: "18:59", end: "04:04", toleranceOnTime: "19:15" },
    },
  },
  {
    id: "ponpes-03",
    name: "Pondok Pesantren Al-Falah Nagreg",
    shortName: "PP. Al-Falah Nagreg",
    location: "Bandung, Jawa Barat",
    leader: "K.H. Quraish Shihab",
    dormTerm: "Komplek",
    licenseType: "Standard Trial (30 Hari)",
    licenseKey: "SRJ-TRL-ALFALAH-2026-C554",
    status: "Trial",
    studentCount: 820,
    adminEmail: "admin@alfalah.ac.id",
    prayerSchedule: {
      subuh: { name: "Salat Subuh", adzan: "04:18", start: "04:18", end: "05:48", toleranceOnTime: "04:38" },
      dzuhur: { name: "Salat Dzuhur", adzan: "11:55", start: "11:55", end: "15:18", toleranceOnTime: "12:08" },
      ashar: { name: "Salat Ashar", adzan: "15:19", start: "15:19", end: "17:58", toleranceOnTime: "15:35" },
      maghrib: { name: "Salat Maghrib", adzan: "17:59", start: "17:59", end: "19:10", toleranceOnTime: "18:09" },
      isya: { name: "Salat Isya", adzan: "19:11", start: "19:11", end: "04:17", toleranceOnTime: "19:28" },
    },
  },
];

// =====================================================================
// DATA MASTER SANTRI (Nama Asrama & No. Kamar Terpisah Sesuai Arahan)
// =====================================================================
export const INITIAL_STUDENTS = [
  {
    id: "santri-001",
    name: "Ahmad Fauzan",
    nis: "2026070114",
    gender: "Laki-laki",
    class: "Kelas 7-A (Tahfidz Intensif)",
    dormBuilding: "Asrama Abu Bakar Ash-Shiddiq", // Terpisah dari kamar
    roomNumber: "Kamar 03", // Terpisah
    photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80",
    guardianName: "Ir. H. Abdullah & Hj. Mariam",
    guardianPhone: "+62 812-8899-7711",
    scoreAdab: 95,
    pointsViolation: 5,
    pointsGood: 25,
    spStatus: "Aman", // Aman, SP I, SP II, SP III
    attendanceRate: 94.2,
    todaySummary: {
      hadir: 8,
      terlambat: 1,
      izinSakit: 1,
      belumDicatat: 2,
    },
    qrCode: "SRJ-2026070114",
    barcode: "2026070114",
    rfidTag: "04:8A:F2:C1",
  },
  {
    id: "santri-002",
    name: "Siti Nur Aisyah",
    nis: "2024090082",
    gender: "Perempuan",
    class: "Kelas 9-B (Kulliyatul Mu'allimat)",
    dormBuilding: "Asrama Fatimah Az-Zahra",
    roomNumber: "Kamar 12",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80",
    guardianName: "Ir. H. Abdullah & Hj. Mariam",
    guardianPhone: "+62 812-8899-7711",
    scoreAdab: 98,
    pointsViolation: 0,
    pointsGood: 35,
    spStatus: "Aman",
    attendanceRate: 98.8,
    todaySummary: {
      hadir: 10,
      terlambat: 0,
      izinSakit: 0,
      belumDicatat: 2,
    },
    qrCode: "SRJ-2024090082",
    barcode: "2024090082",
    rfidTag: "04:9B:D3:E5",
  },
  {
    id: "santri-003",
    name: "Muhammad Rizky",
    nis: "2025080031",
    gender: "Laki-laki",
    class: "Kelas 8-C (KMI Reguler)",
    dormBuilding: "Asrama Umar bin Khattab",
    roomNumber: "Kamar 05",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
    guardianName: "Drs. H. Mulyadi",
    guardianPhone: "+62 813-2233-4455",
    scoreAdab: 62,
    pointsViolation: 48,
    pointsGood: 10,
    spStatus: "SP I (Peringatan)",
    attendanceRate: 88.5,
    todaySummary: {
      hadir: 6,
      terlambat: 2,
      izinSakit: 2,
      belumDicatat: 2,
    },
    qrCode: "SRJ-2025080031",
    barcode: "2025080031",
    rfidTag: "04:3E:D2:11",
  },
  {
    id: "santri-004",
    name: "Fathir Ar-Rahman",
    nis: "2026070155",
    gender: "Laki-laki",
    class: "Kelas 7-B",
    dormBuilding: "Asrama Ali bin Abi Thalib",
    roomNumber: "Kamar 02",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
    guardianName: "Hj. Ratna Sari",
    guardianPhone: "+62 815-6677-8899",
    scoreAdab: 42,
    pointsViolation: 105,
    pointsGood: 5,
    spStatus: "SP II (Skorsing)",
    attendanceRate: 81.2,
    todaySummary: {
      hadir: 5,
      terlambat: 3,
      izinSakit: 1,
      belumDicatat: 3,
    },
    qrCode: "SRJ-2026070155",
    barcode: "2026070155",
    rfidTag: "04:5A:F1:C9",
  },
  {
    id: "santri-005",
    name: "Zaki Mubarak",
    nis: "2025080019",
    gender: "Laki-laki",
    class: "Kelas 8-A",
    dormBuilding: "Asrama Abu Bakar Ash-Shiddiq",
    roomNumber: "Kamar 07",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
    guardianName: "H. Syamsul Bahri",
    guardianPhone: "+62 813-7788-9900",
    scoreAdab: 28,
    pointsViolation: 160,
    pointsGood: 2,
    spStatus: "SP III (Panggilan Orang Tua)",
    attendanceRate: 72.4,
    todaySummary: {
      hadir: 3,
      terlambat: 4,
      izinSakit: 1,
      belumDicatat: 4,
    },
    qrCode: "SRJ-2025080019",
    barcode: "2025080019",
    rfidTag: "04:7B:A8:12",
  },
];

// =====================================================================
// KATEGORI & JURNAL HARIAN MULTI-TANGGAL
// =====================================================================
export const MOCK_SCHEDULE_CATEGORIES = [
  { id: "kelas_pagi", label: "Kelas Pagi", count: 4 },
  { id: "salat", label: "Salat 5 Waktu", count: 5 },
  { id: "tahfidz", label: "Kelas Tahfidz", count: 2 },
  { id: "kelas_malam", label: "Kelas Malam", count: 2 },
];

export const MULTI_DATE_SCHEDULES = {
  "2026-10-22": {
    label: "Kamis, 22 Oktober 2026",
    hijri: "9 Rabiul Akhir 1448 H",
    isToday: true,
    summary: { hadir: 8, terlambat: 1, izinSakit: 1, belumDicatat: 2 },
    categories: {
      kelas_pagi: [
        {
          id: "kp-1",
          subject: "Bahasa Indonesia",
          time: "07:00 - 08:30 WIB",
          teacher: "Ustaz Ahmad Dahlan, M.Pd.",
          actualTime: "07:14 WIB",
          status: "Hadir",
          statusType: "hadir",
          notes: "Tepat waktu di ruang kelas Ibnu Sina 2",
        },
        {
          id: "kp-2",
          subject: "Matematika",
          time: "08:30 - 10:00 WIB",
          teacher: "Ustaz Budi Santoso, S.Si.",
          actualTime: "08:42 WIB",
          status: "Terlambat 12 mnt",
          statusType: "terlambat",
          notes: "Terlambat karena piket kebersihan komplek asrama",
        },
        {
          id: "kp-3",
          subject: "Bahasa Inggris",
          time: "10:15 - 11:45 WIB",
          teacher: "Ustazah Sarah Aminah, S.Pd.",
          actualTime: "—",
          status: "Sakit (Istirahat Asrama)",
          statusType: "sakit",
          notes: "Dispensasi resmi dari Musyrif Asrama: istirahat kamar febris 37.8°C",
        },
        {
          id: "kp-4",
          subject: "Fikih Ibadah",
          time: "13:00 - 14:30 WIB",
          teacher: "Ustaz Dr. H. Fauzi Ridwan",
          actualTime: "—",
          status: "Belum dicatat",
          statusType: "belum",
          notes: "Sesi dijadwalkan siang hari",
        },
      ],
      salat: [
        {
          id: "s-1",
          subject: "Salat Subuh",
          time: "04:30 WIB (Adzan 04:15)",
          teacher: "Petugas: Ustaz Zaid",
          actualTime: "04:28 WIB",
          status: "Hadir Tepat Waktu",
          statusType: "hadir",
          notes: "Hadir tepat waktu sebelum iqamah",
        },
        {
          id: "s-2",
          subject: "Salat Dzuhur",
          time: "12:00 WIB (Adzan 11:52)",
          teacher: "Petugas: Ustaz Zaid",
          actualTime: "11:58 WIB",
          status: "Hadir Tepat Waktu",
          statusType: "hadir",
          notes: "Tercatat sebelum salat dimulai",
        },
        {
          id: "s-3",
          subject: "Salat Ashar",
          time: "15:22 WIB (Adzan 15:15)",
          teacher: "Petugas: Ustaz Zaid",
          actualTime: "15:31 WIB",
          status: "Masbuk",
          statusType: "masbuk",
          notes: "Tercatat masbuk otomatis karena scan melewati toleransi waktu",
        },
        {
          id: "s-4",
          subject: "Salat Maghrib",
          time: "18:02 WIB (Adzan 17:55)",
          teacher: "Petugas: Ustaz Salman",
          actualTime: "18:00 WIB",
          status: "Hadir Tepat Waktu",
          statusType: "hadir",
          notes: "Mengikuti wirid & zikir bersama",
        },
        {
          id: "s-5",
          subject: "Salat Isya",
          time: "19:15 WIB (Adzan 19:08)",
          teacher: "Petugas: Ustaz Salman",
          actualTime: "—",
          status: "Belum dicatat",
          statusType: "belum",
          notes: "Menunggu pelaksanaan sesi",
        },
      ],
      tahfidz: [
        {
          id: "th-1",
          subject: "Setoran Hafalan Baru (Ziyadah)",
          time: "05:30 - 06:45 WIB",
          teacher: "Ustaz Hafizh Al-Mubarok, Al-Hafizh",
          actualTime: "05:50 WIB",
          status: "Jayyid Jiddan (88)",
          statusType: "hadir",
          surah: "Surah Al-Baqarah",
          verses: "Ayat 79 – 102",
          notes: "Tajwid fasih, perhatikan mad jaiz munfashil ayat 91",
        },
        {
          id: "th-2",
          subject: "Murajaah Terpimpin",
          time: "16:15 - 17:15 WIB",
          teacher: "Ustaz Hafizh Al-Mubarok, Al-Hafizh",
          actualTime: "16:30 WIB",
          status: "Lancar (Mutqin)",
          statusType: "hadir",
          surah: "Juz Amma (An-Naba – Al-Muthaffifin)",
          verses: "Surah Penuh",
          notes: "Kelancaran hafalan sangat baik, intonasi tartil",
        },
      ],
      kelas_malam: [
        {
          id: "km-1",
          subject: "Kajian Kitab Ta'limul Muta'allim",
          time: "20:00 - 21:00 WIB",
          teacher: "K.H. Hasan Basri",
          actualTime: "19:55 WIB",
          status: "Hadir",
          statusType: "hadir",
          notes: "Bab: Niat dalam Menuntut Ilmu",
        },
        {
          id: "km-2",
          subject: "Muthala'ah & Lughah Arabiyyah",
          time: "21:00 - 22:00 WIB",
          teacher: "Ustaz Bilal Mahfuzh, Lc.",
          actualTime: "—",
          status: "Belum dicatat",
          statusType: "belum",
          notes: "Persiapan sesi malam",
        },
      ],
    },
  },
  "2026-10-21": {
    label: "Rabu, 21 Oktober 2026",
    hijri: "8 Rabiul Akhir 1448 H",
    isToday: false,
    summary: { hadir: 11, terlambat: 0, izinSakit: 0, belumDicatat: 0 },
    categories: {
      kelas_pagi: [
        {
          id: "kp-r1",
          subject: "Nahwu & Sharaf",
          time: "07:00 - 08:30 WIB",
          teacher: "Ustaz Bilal Mahfuzh, Lc.",
          actualTime: "07:05 WIB",
          status: "Hadir",
          statusType: "hadir",
          notes: "Aktif bertanya kaidah isim ma'rifat",
        },
      ],
      salat: [
        {
          id: "s-r1",
          subject: "Salat Subuh",
          time: "04:30 WIB",
          teacher: "Ustaz Zaid",
          actualTime: "04:18 WIB",
          status: "Hadir Tepat Waktu",
          statusType: "hadir",
          notes: "Hadir sebelum iqamah",
        },
      ],
      tahfidz: [
        {
          id: "th-r1",
          subject: "Setoran Ziyadah",
          time: "05:30 - 06:45 WIB",
          teacher: "Ustaz Hafizh",
          actualTime: "05:45 WIB",
          status: "Mumtaz (95)",
          statusType: "hadir",
          surah: "Surah Al-Baqarah",
          verses: "Ayat 60 – 78",
          notes: "Sangat fasih dan mutqin",
        },
      ],
      kelas_malam: [
        {
          id: "km-r1",
          subject: "Muhadharah 3 Bahasa",
          time: "20:00 - 21:30 WIB",
          teacher: "Ustaz Bilal",
          actualTime: "19:55 WIB",
          status: "Hadir",
          statusType: "hadir",
          notes: "Pidato Bahasa Arab bertema Menuntut Ilmu",
        },
      ],
    },
  },
};

// =====================================================================
// GATE PASS RESMI (Disetujui Langsung Oleh Musyrif Asrama Sesuai Arahan)
// =====================================================================
export const INITIAL_GATE_PASS = {
  id: "GP-20261022-SAN001",
  santriId: "santri-001",
  studentName: "Ahmad Fauzan",
  class: "Kelas 7-A (Tahfidz Intensif)",
  dormBuilding: "Asrama Abu Bakar Ash-Shiddiq",
  roomNumber: "Kamar 03",
  photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80",
  reason: "Izin Pulang: Acara Pernikahan Kakak Kandung di Bandung",
  authorizedPicker: "Ir. H. Abdullah (Ayah Kandung)",
  pickerNik: "3206012809780003",
  validityType: "Berlaku Seharian Penuh",
  validDate: "Kamis, 22 Oktober 2026",
  validTimeRange: "06:00 – 21:00 WIB",
  status: "AKTIF & RESMI",
  qrCodeString: "GP-20261022-2026070114-VALID",
  issuedByRole: "Musyrif Asrama",
  approvalBy: "Ustaz Farhan (Musyrif Asrama Abu Bakar)", // Disahkan langsung oleh musyrif!
  isUsed: false,
};

// =====================================================================
// RAPOR ADAB & REKAP MINGGUAN
// =====================================================================
export const INITIAL_ADAB_RECORD = {
  totalScore: 95,
  classification: "Mumtaz (Sangat Terpuji)",
  goodPoints: [
    { id: "g1", date: "21 Okt 2026", title: "Muadzin Salat Subuh di Masjid Jami'", points: "+10", officer: "Ustaz Zaid (Ubudiyyah)" },
    { id: "g2", date: "19 Okt 2026", title: "Inisiatif Kerja Bakti Asrama", points: "+5", officer: "Ustaz Farhan (Musyrif)" },
    { id: "g3", date: "15 Okt 2026", title: "Juara 1 Lomba Tahfidz", points: "+10", officer: "Ustaz Hafizh (Tahfidz)" },
  ],
  violationPoints: [
    { id: "v1", date: "22 Okt 2026", title: "Terlambat Sesi Matematika (12 menit)", points: "-5", officer: "Ustaz Budi (Guru)" },
  ],
};

export const WEEKLY_SUMMARY_DATA = {
  weekLabel: "Pekan Ke-4 · 19 - 25 Oktober 2026",
  overallRate: 95.8,
  totalSessions: 48,
  hadirCount: 45,
  terlambatCount: 2,
  sakitCount: 1,
  alpaCount: 0,
  days: [
    { day: "Sen", date: "19 Okt", rate: 100, hadir: 12, terlambat: 0, sakit: 0, status: "Sempurna" },
    { day: "Sel", date: "20 Okt", rate: 92, hadir: 11, terlambat: 1, sakit: 0, status: "1 Terlambat" },
    { day: "Rab", date: "21 Okt", rate: 100, hadir: 12, terlambat: 0, sakit: 0, status: "Sempurna" },
    { day: "Kam", date: "22 Okt", rate: 92, hadir: 10, terlambat: 1, sakit: 1, status: "1 Terlambat, 1 Sakit" },
    { day: "Jum", date: "23 Okt", rate: 100, hadir: 8, terlambat: 0, sakit: 0, status: "Khataman & Jumat" },
    { day: "Sab", date: "24 Okt", rate: 100, hadir: 6, terlambat: 0, sakit: 0, status: "Muhadharah" },
    { day: "Ahd", date: "25 Okt", rate: 100, hadir: 4, terlambat: 0, sakit: 0, status: "Piket & Kunjungan" },
  ],
  highlights: [
    "Disiplin Salat Subuh 100% berjamaah di Masjid Jami'",
    "Peningkatan mutaba'ah tahfidz: +23 ayat (Surah Al-Baqarah 79-102 Jayyid Jiddan)",
    "Catatan Asrama: 1 sesi istirahat asrama febris ringan (sudah pulih)",
  ],
  musyrifNote: "Alhamdulillah Ananda Ahmad Fauzan sangat aktif dan menjaga adab pergaulan di asrama. Terus pertahankan ketepatan waktu hadir di kelas KMI.",
};

// =====================================================================
// DATA GURU KBM (Mata Pelajaran Spesifik Per Pengajar)
// =====================================================================
export const TEACHER_ASSIGNMENTS = {
  "guru.dahlan@darussalam.ac.id": {
    teacherName: "Ustaz Ahmad Dahlan, M.Pd.",
    subject: "Bahasa Indonesia",
    classes: [
      {
        id: "cls-bi-7a",
        subject: "Bahasa Indonesia",
        class: "Kelas 7-A (KMI)",
        timeStart: "07:00",
        timeEnd: "08:30",
        timeDisplay: "07:00 - 08:30 WIB",
        room: "Ruang Ibnu Sina 2",
        totalStudents: 32,
        presentCount: 29,
        lateCount: 1,
        sickCount: 1,
        absentCount: 1,
      },
      {
        id: "cls-bi-7b",
        subject: "Bahasa Indonesia",
        class: "Kelas 7-B (KMI)",
        timeStart: "08:30",
        timeEnd: "10:00",
        timeDisplay: "08:30 - 10:00 WIB",
        room: "Ruang Ibnu Sina 3",
        totalStudents: 30,
        presentCount: 28,
        lateCount: 1,
        sickCount: 1,
        absentCount: 0,
      },
    ],
  },
  "guru.budi@darussalam.ac.id": {
    teacherName: "Ustaz Budi Santoso, S.Si.",
    subject: "Matematika",
    classes: [
      {
        id: "cls-mat-7a",
        subject: "Matematika",
        class: "Kelas 7-A (KMI)",
        timeStart: "08:30",
        timeEnd: "10:00",
        timeDisplay: "08:30 - 10:00 WIB",
        room: "Ruang Ibnu Sina 2",
        totalStudents: 32,
        presentCount: 30,
        lateCount: 1,
        sickCount: 1,
        absentCount: 0,
      },
    ],
  },
  "guru.bilal@darussalam.ac.id": {
    teacherName: "Ustaz Bilal Mahfuzh, Lc.",
    subject: "Nahwu & Sharaf",
    classes: [
      {
        id: "cls-nahwu-7a",
        subject: "Nahwu & Sharaf (Al-Ajrumiyyah)",
        class: "Kelas 7-A (KMI Malam)",
        timeStart: "20:00",
        timeEnd: "21:00",
        timeDisplay: "20:00 - 21:00 WIB",
        room: "Aula KMI Lantai 2",
        totalStudents: 32,
        presentCount: 0,
        lateCount: 0,
        sickCount: 1,
        absentCount: 0,
      },
    ],
  },
};

// =====================================================================
// DATA UBUDIYYAH (Auto Sesi Salat Berdasarkan Jam Lokal)
// =====================================================================
export const UBUDIYYAH_PRAYER_SESSIONS = [
  { id: "subuh", name: "Salat Subuh", start: "04:15", end: "05:45", tolerance: "04:35", target: "Masjid Jami'", attendanceRate: "98.2%" },
  { id: "dzuhur", name: "Salat Dzuhur", start: "11:52", end: "15:14", tolerance: "12:05", target: "Masjid Jami'", attendanceRate: "96.5%" },
  { id: "ashar", name: "Salat Ashar", start: "15:15", end: "17:54", tolerance: "15:30", target: "Masjid Jami'", attendanceRate: "95.0%" },
  { id: "maghrib", name: "Salat Maghrib", start: "17:55", end: "19:07", tolerance: "18:05", target: "Masjid Jami'", attendanceRate: "99.1%" },
  { id: "isya", name: "Salat Isya", start: "19:08", end: "04:14", tolerance: "19:25", target: "Masjid Jami'", attendanceRate: "97.4%" },
];

/**
 * Menentukan sesi salat aktif saat ini secara otomatis berdasarkan jam WIB
 */
export function getActivePrayerSessionByTime(dateObj = new Date()) {
  const currentMinutes = dateObj.getHours() * 60 + dateObj.getMinutes();

  // Subuh: 04:15 (255m) - 05:45 (345m)
  if (currentMinutes >= 255 && currentMinutes < 345) return UBUDIYYAH_PRAYER_SESSIONS[0];
  // Dzuhur: 11:52 (712m) - 15:14 (914m)
  if (currentMinutes >= 712 && currentMinutes < 914) return UBUDIYYAH_PRAYER_SESSIONS[1];
  // Ashar: 15:15 (915m) - 17:54 (1074m)
  if (currentMinutes >= 915 && currentMinutes < 1074) return UBUDIYYAH_PRAYER_SESSIONS[2];
  // Maghrib: 17:55 (1075m) - 19:07 (1147m)
  if (currentMinutes >= 1075 && currentMinutes < 1147) return UBUDIYYAH_PRAYER_SESSIONS[3];
  // Isya & Qiyam: 19:08 (1148m) - 04:14 (254m)
  return UBUDIYYAH_PRAYER_SESSIONS[4];
}

// =====================================================================
// DATA GURU BK (Kategori SP I, SP II, SP III & Adab)
// =====================================================================
export const BK_POINT_CATALOGUE = {
  merits: [
    { id: "m1", title: "Muadzin / Imam Salat Berjamaah", points: 10, category: "Ibadah" },
    { id: "m2", title: "Juara Musabaqah Hifzhil Qur'an", points: 15, category: "Prestasi" },
    { id: "m3", title: "Inisiatif Kerja Bakti Asrama", points: 5, category: "Sosial" },
    { id: "m4", title: "Membantu Piket Kamar & Kebersihan", points: 5, category: "Berdikari" },
  ],
  violations: [
    { id: "v1", title: "Terlambat Masuk Sesi KBM (>10 mnt)", points: -5, category: "Kedisiplinan" },
    { id: "v2", title: "Terlambat Salat Berjamaah (Masbuk)", points: -5, category: "Ibadah" },
    { id: "v3", title: "Seragam Tidak Rapi / Tanpa Peci", points: -3, category: "Kerapian" },
    { id: "v4", title: "Keluar Area Pondok Tanpa Gate Pass Sah", points: -25, category: "Pelanggaran Berat" },
  ],
};

// Setelan Ambang SP Dinamis (Bisa diatur Admin)
export const INITIAL_SP_THRESHOLDS = {
  sp1: 50,
  sp2: 100,
  sp3: 150,
  sp1Action: "Panggilan Wali Santri & Bimbingan Konseling (BK)",
  sp2Action: "Skorsing Sementara & Penangguhan Hak Izin Pulang",
  sp3Action: "Sidang Majelis Pimpinan & Pengembalian ke Orang Tua",
};

// =====================================================================
// EWS KHUSUS SANTRI ASRAMA SAKIT & IZIN DARI MUSYRIF
// =====================================================================
export const INITIAL_EWS_ALERTS = [
  {
    id: "ews-1",
    santriName: "Ahmad Fauzan",
    nis: "2026070114",
    class: "Kelas 7-A",
    dormBuilding: "Asrama Abu Bakar Ash-Shiddiq",
    roomNumber: "Kamar 03",
    conditionType: "Sakit",
    diagnosis: "Febris Ringan (Demam 37.8°C) - Istirahat di Kamar",
    dateRecorded: "Hari Ini, Ba'da Dzuhur",
    officer: "Ustaz Farhan (Musyrif Asrama)",
    status: "Istirahat Asrama",
    severity: "Perlu Pantauan",
  },
  {
    id: "ews-2",
    santriName: "Fathir Ar-Rahman",
    nis: "2026070155",
    class: "Kelas 7-B",
    dormBuilding: "Asrama Ali bin Abi Thalib",
    roomNumber: "Kamar 02",
    conditionType: "Izin Pulang",
    diagnosis: "Izin Pulang Darurat Keluarga (Nenek Sakit Keras)",
    dateRecorded: "Hari Ini, 09:30 WIB",
    officer: "Ustaz Hamdan (Musyrif Asrama)",
    status: "Menunggu Penjemputan",
    severity: "Izin Resmi",
  },
  {
    id: "ews-3",
    santriName: "Muhammad Rizky",
    nis: "2025080031",
    class: "Kelas 8-C",
    dormBuilding: "Asrama Umar bin Khattab",
    roomNumber: "Kamar 05",
    conditionType: "Sakit",
    diagnosis: "Batuk & Pusing - Istirahat di Kamar",
    dateRecorded: "Kemarin, 17:00 WIB",
    officer: "Ustaz Salman (Musyrif Asrama)",
    status: "Sudah Membaik",
    severity: "Observasi",
  },
];

// =====================================================================
// APPEND-ONLY SECURITY AUDIT LOG
// =====================================================================
export const INITIAL_AUDIT_LOGS = [
  {
    id: "aud-001",
    timestamp: "16:45:10 WIB",
    user: "Pak Slamet",
    role: "Satpam",
    action: "VERIFIKASI GATE PASS",
    object: "GP-20261022-SAN001 (Ahmad Fauzan)",
    status: "SUKSES",
    details: "Izin seharian sah disetujui Musyrif. Penjemput Ir. H. Abdullah cocok KTP. Gerbang dibuka.",
  },
  {
    id: "aud-002",
    timestamp: "14:15:20 WIB",
    user: "Ustaz Farhan",
    role: "Musyrif",
    action: "CATAT KONDISI SAKIT (SEKSI 13)",
    object: "Santri: Ahmad Fauzan (Kamar 03)",
    status: "TERCATAT",
    details: "Sakit febris, istirahat asrama ba'da dzuhur. Sinkron ke EWS asrama.",
  },
  {
    id: "aud-003",
    timestamp: "08:42:15 WIB",
    user: "Ustaz Ahmad Dahlan",
    role: "Guru KBM",
    action: "ABSENSI BAHASA INDONESIA",
    object: "Kelas 7-A (32 Santri)",
    status: "SUKSES",
    details: "Pindai QR kamera kelas selesai. 29 Hadir, 1 Terlambat, 1 Sakit.",
  },
  {
    id: "aud-004",
    timestamp: "04:35:10 WIB",
    user: "Ustaz Zaid",
    role: "Ubudiyyah",
    action: "ABSENSI SALAT SUBUH",
    object: "Masjid Jami' Darussalam",
    status: "SUKSES",
    details: "Presensi salat subuh otomatis tepat waktu vs masbuk tercatat.",
  },
];

// =====================================================================
// AKUN PENGGUNA TERPADU (UNIFIED LOGIN SYSTEM - NO SIGN UP)
// =====================================================================
export const SYSTEM_USERS = [
  {
    email: "superadmin@siraj.id",
    password: "123",
    name: "Dr. K.H. Qodir Munawar",
    role: "superadmin",
    roleLabel: "Super Admin Pusat",
    assignedTenantId: "all",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80",
    desc: "Akses Pusat Multi-Ponpes & Manajemen Lisensi Database",
  },
  {
    email: "admin@darussalam.ac.id",
    password: "123",
    name: "K.H. Asep Ridwan",
    role: "admin",
    roleLabel: "Admin Ponpes",
    assignedTenantId: "ponpes-01",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
    desc: "Admin Utama Pondok Pesantren Darussalam Rajapolah",
  },
  {
    email: "pengasuhan@darussalam.ac.id",
    password: "123",
    name: "K.H. Asep Ridwan, Lc.",
    role: "pengasuhan",
    roleLabel: "Kepala Pengasuhan",
    assignedTenantId: "ponpes-01",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
    desc: "Pimpinan Seluruh Musyrif Asrama & Kebijakan Santri",
  },
  {
    email: "bk@darussalam.ac.id",
    password: "123",
    name: "Ustaz Hamdan, S.Psi.",
    role: "bk",
    roleLabel: "Guru BK (Konseling)",
    assignedTenantId: "ponpes-01",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80",
    desc: "Konselor Bimbingan Santri & Pemantau Kategori SP",
  },
  {
    email: "guru.dahlan@darussalam.ac.id",
    password: "123",
    name: "Ustaz Ahmad Dahlan, M.Pd.",
    role: "guru",
    roleLabel: "Guru KBM (B. Indonesia)",
    subject: "Bahasa Indonesia", // Hanya mapel ini yg bisa diakses!
    assignedTenantId: "ponpes-01",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
    desc: "Pengajar Resmi Mata Pelajaran Bahasa Indonesia",
  },
  {
    email: "guru.budi@darussalam.ac.id",
    password: "123",
    name: "Ustaz Budi Santoso, S.Si.",
    role: "guru",
    roleLabel: "Guru KBM (Matematika)",
    subject: "Matematika",
    assignedTenantId: "ponpes-01",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
    desc: "Pengajar Resmi Mata Pelajaran Matematika",
  },
  {
    email: "ubudiyyah@darussalam.ac.id",
    password: "123",
    name: "Ustaz Zaid",
    role: "ubudiyyah",
    roleLabel: "Ustadz Ubudiyyah",
    assignedTenantId: "ponpes-01",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80",
    desc: "Pemantau Presensi Salat 5 Waktu Masjid Jami'",
  },
  {
    email: "musyrif.farhan@darussalam.ac.id",
    password: "123",
    name: "Ustaz Farhan",
    role: "musyrif",
    roleLabel: "Musyrif Asrama",
    assignedDorm: "Asrama Abu Bakar Ash-Shiddiq", // Asrama yang dibina
    assignedTenantId: "ponpes-01",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=240&auto=format&fit=crop&q=80",
    desc: "Pembina Asrama Abu Bakar & Otorisasi Gate Pass",
  },
  {
    email: "satpam@darussalam.ac.id",
    password: "123",
    name: "Pak Slamet",
    role: "satpam",
    roleLabel: "Satpam Gerbang",
    assignedTenantId: "ponpes-01",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=240&auto=format&fit=crop&q=80",
    desc: "Petugas Keamanan & Pemindai Gate Pass Gerbang",
  },
  {
    email: "wali.abdullah@gmail.com",
    password: "123",
    name: "Ir. H. Abdullah",
    role: "wali",
    roleLabel: "Wali Santri",
    assignedTenantId: "ponpes-01",
    childrenCount: 2,
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80",
    desc: "Wali dari Ahmad Fauzan (7-A) & Siti Nur Aisyah (9-B)",
  },
];

// List of roles for navigation reference
export const ROLES_LIST = [
  { id: "superadmin", label: "Super Admin", icon: "🌐", desc: "Multi-Ponpes, Lisensi & Database" },
  { id: "admin", label: "Admin Ponpes", icon: "💻", desc: "KPI, Master Santri, Ambang SP" },
  { id: "pengasuhan", label: "Kepala Pengasuhan", icon: "👳", desc: "Pimpinan Musyrif & Per Asrama" },
  { id: "bk", label: "Guru BK", icon: "📋", desc: "Konseling & Kategori SP I-III" },
  { id: "guru", label: "Guru KBM", icon: "👨‍🏫", desc: "Presensi Mapel Guru Tertentu" },
  { id: "ubudiyyah", label: "Ustadz Ubudiyyah", icon: "🕌", desc: "Auto Waktu Salat Masjid" },
  { id: "musyrif", label: "Musyrif Asrama", icon: "🏠", desc: "Nama & Asrama, Izin Gate Pass" },
  { id: "satpam", label: "Satpam Gerbang", icon: "🛡️", desc: "Scan Langsung Popup 5 Detik" },
  { id: "wali", label: "Wali Santri", icon: "👨‍👩‍👧", desc: "Jurnal, Kartu 3D, Gate Pass 24 Jam" },
];
