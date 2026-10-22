import React, { useState } from "react";
import {
  INITIAL_STUDENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_EWS_ALERTS,
  INITIAL_SP_THRESHOLDS,
  BK_POINT_CATALOGUE,
} from "../data/mockData";
import { playSoftClick, playSuccessChime, triggerHaptic } from "../utils/audio";

export default function AdminWebView({
  onTriggerLoader,
  auditLogs,
  onAuditLogAdd,
  currentTenant,
  onUpdateTenant,
}) {
  const [adminTab, setAdminTab] = useState("dashboard"); // dashboard, santri, ews, sp, settings, audit
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentsList, setStudentsList] = useState(INITIAL_STUDENTS);
  const [selectedStudentForQr, setSelectedStudentForQr] = useState(null);
  const [ewsAlerts, setEwsAlerts] = useState(INITIAL_EWS_ALERTS);

  // Modal Koreksi Absensi Beralasan Resmi (Admin)
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionTarget, setCorrectionTarget] = useState("Ahmad Fauzan · Subuh");
  const [correctionNewStatus, setCorrectionNewStatus] = useState("Hadir (Dispensasi Musyrif)");
  const [correctionReason, setCorrectionReason] = useState("");

  // Dynamic Ponpes Settings (Bisa diatur di Admin)
  const [pesantrenNameInput, setPesantrenNameInput] = useState(
    currentTenant?.name || "Pondok Pesantren Darussalam Rajapolah Tasikmalaya"
  );
  const STANDARD_DORM_OPTIONS = ["Asrama", "Sakan", "Komplek", "Kobong"];
  const initialDorm = currentTenant?.dormTerm || "Asrama";
  const [selectedDormOption, setSelectedDormOption] = useState(() => {
    return STANDARD_DORM_OPTIONS.includes(initialDorm) ? initialDorm : "Lainnya";
  });
  const [customDormInput, setCustomDormInput] = useState(() => {
    return STANDARD_DORM_OPTIONS.includes(initialDorm) ? "" : initialDorm;
  });
  const [prayerLocationInput, setPrayerLocationInput] = useState(
    currentTenant?.prayerLocation || "Kabupaten Tasikmalaya (WIB)"
  );
  const [prayerTimes, setPrayerTimes] = useState({
    subuhStart: "04:15",
    subuhEnd: "05:45",
    subuhMasbuk: "04:45",
    dzuhurStart: "11:52",
    dzuhurEnd: "15:14",
    dzuhurMasbuk: "12:15",
    asharStart: "15:15",
    asharEnd: "17:54",
    asharMasbuk: "15:35",
    maghribStart: "17:55",
    maghribEnd: "19:07",
    maghribMasbuk: "18:15",
    isyaStart: "19:08",
    isyaEnd: "23:59",
    isyaMasbuk: "19:35",
  });

  // Dynamic SP Thresholds Configurable by Admin
  const [spThresholds, setSpThresholds] = useState(INITIAL_SP_THRESHOLDS);
  const [sp1Input, setSp1Input] = useState(INITIAL_SP_THRESHOLDS.sp1);
  const [sp2Input, setSp2Input] = useState(INITIAL_SP_THRESHOLDS.sp2);
  const [sp3Input, setSp3Input] = useState(INITIAL_SP_THRESHOLDS.sp3);
  const [sp1ActionInput, setSp1ActionInput] = useState(INITIAL_SP_THRESHOLDS.sp1Action);
  const [sp2ActionInput, setSp2ActionInput] = useState(INITIAL_SP_THRESHOLDS.sp2Action);
  const [sp3ActionInput, setSp3ActionInput] = useState(INITIAL_SP_THRESHOLDS.sp3Action);
  const [isSpPdfModalOpen, setIsSpPdfModalOpen] = useState(false);

  // CSV Importer & Exporter State (Asrama & No Kamar Terpisah)
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState(
    `NIS,Nama Santri,Kelas,Asrama/Komplek,No Kamar,Nama Wali,No HP Wali\n` +
    `2026070188,Bilal Ramadhan,Kelas 7-A,Asrama Abu Bakar Ash-Shiddiq,Kamar 02,H. Yusuf Mansur,+6281234567890\n` +
    `2026070189,Hamzah Al-Farabi,Kelas 7-A,Asrama Abu Bakar Ash-Shiddiq,Kamar 04,Dr. H. Lukman,+6281398765432\n` +
    `2026070190,Aisyah Maharani,Kelas 9-B,Asrama Fatimah Az-Zahra,Kamar 03,Hj. Siti Rahmah,+6281567890123`
  );

  // Tab switch with 2-second loader
  const handleTabSwitch = (tab) => {
    playSoftClick();
    onTriggerLoader(`Membuka Modul Admin: ${tab.toUpperCase()}...`, () => {
      setAdminTab(tab);
    });
  };

  // Unduh Template CSV Santri
  const handleDownloadCsvTemplate = () => {
    playSoftClick();
    const templateData =
      `NIS,Nama Santri,Kelas,Asrama,Nama Wali,No HP Wali\n` +
      `2026070188,Bilal Ramadhan,Kelas 7-A,Komplek Abu Bakar 02,H. Yusuf Mansur,+6281234567890\n` +
      `2026070189,Hamzah Al-Farabi,Kelas 7-A,Komplek Abu Bakar 04,Dr. H. Lukman,+6281398765432\n` +
      `2026070190,Aisyah Maharani,Kelas 9-B,Komplek Fatimah 03,Hj. Siti Rahmah,+6281567890123\n`;

    const blob = new Blob([templateData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_import_santri_darussalam.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSuccessChime();
    alert("Template CSV berhasil diunduh: template_import_santri_darussalam.csv");
  };

  // Ekspor Data Santri ke CSV
  const handleExportStudentsCsv = () => {
    playSoftClick();
    let csvString = "NIS,Nama Santri,Kelas,Asrama/Komplek,No Kamar,Nama Wali,Skor Adab\n";
    studentsList.forEach((st) => {
      csvString += `${st.nis},"${st.name}","${st.class}","${st.dormBuilding || st.dorm || ''}","${st.roomNumber || ''}","${st.guardianName}",${st.scoreAdab}\n`;
    });

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "data_santri_darussalam_rajapolah.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSuccessChime();
  };

  // Proses Impor CSV Santri
  const handleProcessCsvImport = () => {
    playSoftClick();
    setIsCsvModalOpen(false);
    onTriggerLoader("Memvalidasi Format CSV & Mendaftarkan 3 Santri Baru...", () => {
      playSuccessChime();
      const newStudents = [
        {
          id: "santri-003",
          name: "Bilal Ramadhan",
          nis: "2026070188",
          gender: "Laki-laki",
          class: "Kelas 7-A",
          dorm: "Komplek Abu Bakar 02",
          photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
          guardianName: "H. Yusuf Mansur",
          scoreAdab: 100,
          pointsViolation: 0,
          pointsGood: 20,
          qrCode: "SRJ-2026070188",
          barcode: "2026070188",
          rfidTag: "04:7C:E1:A2",
          todaySummary: { hadir: 8, terlambat: 0, izinSakit: 0, belumDicatat: 2 },
        },
        {
          id: "santri-004",
          name: "Hamzah Al-Farabi",
          nis: "2026070189",
          gender: "Laki-laki",
          class: "Kelas 7-A",
          dorm: "Komplek Abu Bakar 04",
          photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
          guardianName: "Dr. H. Lukman",
          scoreAdab: 95,
          pointsViolation: 5,
          pointsGood: 15,
          qrCode: "SRJ-2026070189",
          barcode: "2026070189",
          rfidTag: "04:6D:F3:B5",
          todaySummary: { hadir: 7, terlambat: 1, izinSakit: 0, belumDicatat: 2 },
        },
      ];
      setStudentsList((prev) => [...prev, ...newStudents]);
      onAuditLogAdd({
        user: "K.H. Asep Ridwan (Admin)",
        role: "Admin",
        action: "IMPOR MASSAL SANTRI (CSV)",
        object: "Batch Import: 3 Santri & Wali",
        status: "SUKSES",
        details: "Format kolom CSV valid. Kunci RFID & Barcode resmi diterbitkan secara otomatis.",
      });
    });
  };

  // Simpan Ambang SP Dinamis oleh Admin
  const handleSaveSpThresholds = (e) => {
    e.preventDefault();
    playSoftClick();
    triggerHaptic([60]);

    onTriggerLoader("Menyimpan Perubahan Ambang SP ke Kebijakan Pesantren...", () => {
      playSuccessChime();
      setSpThresholds({
        sp1: Number(sp1Input),
        sp2: Number(sp2Input),
        sp3: Number(sp3Input),
        sp1Action: sp1ActionInput,
        sp2Action: sp2ActionInput,
        sp3Action: sp3ActionInput,
      });

      onAuditLogAdd({
        user: "K.H. Asep Ridwan (Admin)",
        role: "Admin",
        action: "SETELAN AMBANG SP DIUBAH",
        object: `SP1: ${sp1Input} Poin · SP2: ${sp2Input} Poin · SP3: ${sp3Input} Poin`,
        status: "DISIMPAN",
        details: "Admin mengubah parameter ambang surat peringatan santri. Berlaku untuk seluruh sistem pembinaan.",
      });
      alert("Setelan ambang SP dan sanksi berhasil diperbarui dan disimpan.");
    });
  };

  // Simpan Pengaturan Pondok Pesantren
  const handleSavePesantrenSettings = (e) => {
    e.preventDefault();
    playSoftClick();
    triggerHaptic([60]);

    const effectiveDormTerm =
      selectedDormOption === "Lainnya"
        ? (customDormInput.trim() || "Asrama")
        : selectedDormOption;

    onTriggerLoader("Menyimpan Pengaturan Pondok Pesantren...", () => {
      playSuccessChime();
      if (onUpdateTenant) {
        onUpdateTenant({
          name: pesantrenNameInput,
          dormTerm: effectiveDormTerm,
          prayerLocation: prayerLocationInput,
        });
      }

      onAuditLogAdd({
        user: "Admin Ponpes",
        role: "Admin",
        action: "UPDATE PENGATURAN PONPES",
        object: pesantrenNameInput,
        status: "DISIMPAN",
        details: `Nama Ponpes: "${pesantrenNameInput}", Istilah Hunian: "${effectiveDormTerm}", Wilayah: "${prayerLocationInput}". Jadwal & Ambang Masbuk Sholat diperbarui.`,
      });
      alert(`Pengaturan ${pesantrenNameInput} berhasil disimpan! Istilah Tempat Tinggal: "${effectiveDormTerm}".`);
    });
  };

  // Submit Koreksi Absensi Beralasan
  const handleSubmitCorrection = () => {
    playSoftClick();
    setIsCorrectionModalOpen(false);
    onTriggerLoader("Memproses Koreksi Absensi Beralasan...", () => {
      playSuccessChime();
      onAuditLogAdd({
        user: "K.H. Asep Ridwan (Admin)",
        role: "Admin",
        action: "KOREKSI ABSENSI BERALASAN",
        object: correctionTarget,
        status: "DIKOREKSI",
        details: `Status baru: ${correctionNewStatus}. Alasan wajib: "${correctionReason}". Disetujui Admin Ponpes.`,
      });
    });
  };

  // Filter students
  const filteredStudents = studentsList.filter(
    (st) =>
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.nis.includes(searchQuery) ||
      st.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: "780px",
        background: "#F4FBF7",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1px solid rgba(6, 95, 70, 0.15)",
        boxShadow: "0 20px 50px rgba(6, 39, 30, 0.25)",
      }}
    >
      {/* Mobile / Tablet Responsive Bar */}
      <div
        style={{
          background: "#06271E",
          padding: "12px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(232, 182, 90, 0.25)",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/logo_tile_1024.png"
            alt="SIRAJ"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1.5px solid #FFE49A",
            }}
          />
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF" }}>
              SIRAJ ADMIN PONPES
            </div>
            <div style={{ fontSize: "10px", color: "#FFE49A" }}>
              {pesantrenNameInput}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          style={{
            background: isMobileSidebarOpen ? "#10B981" : "rgba(255, 255, 255, 0.12)",
            color: "#FFFFFF",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            borderRadius: "10px",
            padding: "6px 12px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>☰</span>
          <span>{isMobileSidebarOpen ? "Tutup Menu" : "Menu Admin"}</span>
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, flexDirection: "row", position: "relative" }}>
        {/* ================================================================
            SIDEBAR ADMIN PESANTREN (Responsive Desktop & Mobile Collapsible)
           ================================================================ */}
        <div
          className={`admin-desktop-sidebar ${isMobileSidebarOpen ? "is-open" : ""}`}
          style={{
            width: isMobileSidebarOpen ? "100%" : "250px",
            maxWidth: isMobileSidebarOpen ? "100%" : "250px",
            background: "#06271E",
            padding: "20px 14px",
            display: "flex",
            flexDirection: "column",
            color: "#FFFFFF",
            flexShrink: 0,
            borderRight: "1px solid rgba(232, 182, 90, 0.2)",
            position: isMobileSidebarOpen ? "absolute" : "relative",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 100,
            boxShadow: isMobileSidebarOpen ? "0 10px 30px rgba(0,0,0,0.5)" : "none",
          }}
        >
          {/* Sidebar Nav Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
            {[
              { id: "dashboard", label: "Dashboard & KPI", icon: "📊" },
              { id: "santri", label: "Master Santri & CSV", icon: "👥" },
              { id: "ews", label: "EWS Asrama Sakit", icon: "🚨", badge: String(ewsAlerts.length) },
              { id: "sp", label: "Setelan Ambang SP", icon: "⚖️" },
              { id: "settings", label: "Pengaturan Ponpes", icon: "⚙️" },
              { id: "audit", label: "Audit Log (Kekal)", icon: "📜" },
            ].map((item) => {
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabSwitch(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    fontSize: "12.5px",
                    fontWeight: isActive ? 800 : 500,
                    background: isActive ? "var(--gradient-emerald)" : "transparent",
                    color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.75)",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: isActive ? "0 4px 14px rgba(16, 185, 129, 0.35)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        background: "#B42318",
                        color: "#FFFFFF",
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "1px 6px",
                        borderRadius: "8px",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Sidebar */}
          <div
            style={{
              background: "#0D4332",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "12px",
              padding: "12px",
              fontSize: "11px",
              color: "#A7F3D0",
              marginTop: "14px",
            }}
          >
            <div style={{ fontWeight: 700, color: "#FFE49A" }}>🔒 {pesantrenNameInput}</div>
            <div style={{ fontSize: "10px", color: "#8AA49B", marginTop: "2px" }}>
              Audit Forensik Append-Only Aktif
            </div>
          </div>
        </div>

      {/* ================================================================
          MAIN WORKSPACE ADMIN
         ================================================================ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {/* Top Header Bar */}
        <div
          style={{
            background: "#FFFFFF",
            padding: "16px 28px",
            borderBottom: "1px solid #E2EFE9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#06271E" }}>
              {adminTab === "dashboard" && "Dashboard KPI & Statistik Real-Time"}
              {adminTab === "santri" && "Master Santri & Pengimpor CSV Cerdas"}
              {adminTab === "ews" && "Early Warning System (EWS) — Santri Asrama Sakit & Izin"}
              {adminTab === "sp" && "Konfigurasi Ambang Surat Peringatan (SP) & Nilai Adab"}
              {adminTab === "settings" && "Pengaturan Pondok Pesantren, Istilah Asrama & Jadwal Sholat"}
              {adminTab === "audit" && "Append-Only Security Audit Log (Catatan Kekal Seluruh Sistem)"}
            </h2>
            <div style={{ fontSize: "11.5px", color: "#5B7A70", marginTop: "2px" }}>
              {pesantrenNameInput} · Status Server: <span style={{ color: "#059669", fontWeight: 700 }}>🟢 Terkoneksi Supabase Cloud</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setIsCorrectionModalOpen(true)}
              style={{
                background: "rgba(232, 182, 90, 0.2)",
                border: "1px solid #FFE49A",
                color: "#9A6212",
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ✏️ Koreksi Absensi Beralasan
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: DASHBOARD KPI
           ------------------------------------------------------------- */}
        {adminTab === "dashboard" && (
          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              {[
                { label: "Total Santri Aktif", val: "1,248", desc: "100% data terverifikasi", color: "#065F46", icon: "👥" },
                { label: "Kehadiran Hari Ini", val: "97.4%", desc: "+1.2% dari pekan lalu", color: "#059669", icon: "📈" },
                { label: "Sesi KBM & Salat", val: "14 Sesi", desc: "Kelas Pagi, Salat, Tahfidz, Malam", color: "#D97706", icon: "⏱️" },
                { label: "Santri Asrama Sakit", val: `${ewsAlerts.length} Santri`, desc: "Pantauan Musyrif Komplek", color: "#B42318", icon: "🚨" },
              ].map((kpi, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "18px",
                    padding: "18px",
                    border: "1px solid #E2EFE9",
                    boxShadow: "0 4px 15px rgba(6, 39, 30, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#5B7A70", fontWeight: 600 }}>{kpi.label}</span>
                    <span style={{ fontSize: "20px" }}>{kpi.icon}</span>
                  </div>
                  <div style={{ fontSize: "26px", fontWeight: 800, color: kpi.color }}>
                    {kpi.val}
                  </div>
                  <div style={{ fontSize: "11px", color: "#8AA49B", marginTop: "4px" }}>
                    {kpi.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Sesi KBM & Salat Berlangsung */}
            <div style={{ background: "#FFFFFF", borderRadius: "18px", padding: "20px", border: "1px solid #E2EFE9" }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#06271E", marginBottom: "12px" }}>
                Status Sesi Pembelajaran & Salat Hari Ini
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { nama: "Kelas Pagi: Bahasa Indonesia & Matematika", time: "07:00 - 10:00 WIB", hadir: "1.218 Hadir", status: "Selesai" },
                  { nama: "Salat Dzuhur Berjamaah di Masjid Jami'", time: "11:52 - 12:30 WIB", hadir: "1.238 Hadir", status: "Selesai" },
                  { nama: "Kelas Tahfidz Intensif Ba'da Ashar", time: "15:30 - 17:00 WIB", hadir: "1.240 Hadir", status: "Berlangsung" },
                  { nama: "Salat Maghrib & Isya Berjamaah", time: "18:02 - 19:45 WIB", hadir: "Menunggu Sesi", status: "Terjadwal" },
                ].map((ses, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      background: "#F4FBF7",
                      border: "1px solid #E2EFE9",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#06271E" }}>{ses.nama}</div>
                      <div style={{ fontSize: "11px", color: "#5B7A70" }}>{ses.time}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669" }}>{ses.hadir}</span>
                      <div style={{ fontSize: "10px", color: "#8AA49B" }}>{ses.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: MASTER SANTRI & PENGIMPOR CSV CERDAS
           ------------------------------------------------------------- */}
        {adminTab === "santri" && (
          <div style={{ padding: "24px 28px" }}>
            {/* Action Bar: Search, Unduh Template, Impor CSV, Ekspor CSV */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
              <input
                type="text"
                placeholder="Cari santri berdasarkan nama, NIS, atau kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "320px",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: "1px solid #D1FAE5",
                  background: "#FFFFFF",
                  fontSize: "12px",
                }}
              />

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {/* Tombol Unduh Template CSV Santri */}
                <button
                  onClick={handleDownloadCsvTemplate}
                  style={{
                    background: "#F4FBF7",
                    border: "1px solid #10B981",
                    color: "#065F46",
                    padding: "9px 14px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  title="Unduh berkas template CSV resmi untuk format impor"
                >
                  <span>📥</span>
                  <span>Unduh Template CSV</span>
                </button>

                {/* Tombol Impor CSV */}
                <button
                  onClick={() => setIsCsvModalOpen(true)}
                  style={{
                    background: "var(--gradient-emerald)",
                    color: "#FFFFFF",
                    padding: "9px 14px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 800,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>📂</span>
                  <span>Impor CSV Santri</span>
                </button>

                {/* Tombol Ekspor CSV */}
                <button
                  onClick={handleExportStudentsCsv}
                  style={{
                    background: "rgba(232, 182, 90, 0.15)",
                    border: "1px solid #FFE49A",
                    color: "#9A6212",
                    padding: "9px 14px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>📤</span>
                  <span>Ekspor CSV</span>
                </button>
              </div>
            </div>

            {/* Tabel Master Santri (Responsif & Asrama/No Kamar Terpisah) */}
            <div style={{ background: "#FFFFFF", borderRadius: "18px", border: "1px solid #E2EFE9", overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: "750px", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#F4FBF7", borderBottom: "1px solid #E2EFE9", textAlign: "left", color: "#5B7A70" }}>
                    <th style={{ padding: "12px 16px" }}>Santri</th>
                    <th style={{ padding: "12px 16px" }}>NIS</th>
                    <th style={{ padding: "12px 16px" }}>Kelas</th>
                    <th style={{ padding: "12px 16px" }}>Asrama / Komplek</th>
                    <th style={{ padding: "12px 16px" }}>No. Kamar</th>
                    <th style={{ padding: "12px 16px" }}>Wali Sah</th>
                    <th style={{ padding: "12px 16px" }}>Status SP</th>
                    <th style={{ padding: "12px 16px" }}>Skor Adab</th>
                    <th style={{ padding: "12px 16px" }}>Barcode / QR</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st) => (
                    <tr key={st.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={st.photo} alt={st.name} style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover" }} />
                        <span style={{ fontWeight: 700, color: "#06271E", whiteSpace: "nowrap" }}>{st.name}</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#5B7A70", whiteSpace: "nowrap" }}>{st.nis}</td>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{st.class}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#065F46", whiteSpace: "nowrap" }}>
                        {st.dormBuilding}
                      </td>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ background: "#E2EFE9", color: "#06271E", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                          {st.roomNumber}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#5B7A70", whiteSpace: "nowrap" }}>{st.guardianName}</td>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            background: st.spStatus?.includes("SP III") ? "#FEE2E2" : st.spStatus?.includes("SP II") ? "#FFEDD5" : st.spStatus?.includes("SP I") ? "#FEF3C7" : "#D1FAE5",
                            color: st.spStatus?.includes("SP III") ? "#991B1B" : st.spStatus?.includes("SP II") ? "#9A3412" : st.spStatus?.includes("SP I") ? "#92400E" : "#065F46",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "10.5px",
                            fontWeight: 800,
                          }}
                        >
                          {st.spStatus || "Aman"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 800, color: st.scoreAdab >= 80 ? "#059669" : st.scoreAdab >= 50 ? "#D97706" : "#DC2626", whiteSpace: "nowrap" }}>
                        {st.scoreAdab} / 100
                      </td>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ background: "#D1FAE5", color: "#065F46", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                          {st.barcode || st.nis}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: EARLY WARNING SYSTEM (EWS ASRAMA SAKIT & IZIN DARI MUSYRIF)
           ------------------------------------------------------------- */}
        {adminTab === "ews" && (
          <div style={{ padding: "24px 28px" }}>
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "16px",
                padding: "16px",
                marginBottom: "20px",
                color: "#991B1B",
                fontSize: "13px",
              }}
            >
              <strong>🚨 Monitoring Early Warning System (EWS) Asrama:</strong> Fokus memantau santri asrama yang dilaporkan sakit di kamar atau izin darurat oleh Musyrif komplek untuk penanganan cepat.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {ewsAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "16px",
                    padding: "18px",
                    border: "1px solid #FCA5A5",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          background: "#B42318",
                          color: "#FFFFFF",
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "2px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {alert.conditionType.toUpperCase()}
                      </span>
                      <span style={{ fontSize: "15px", fontWeight: 800, color: "#06271E" }}>
                        {alert.santriName} ({alert.class})
                      </span>
                      <span style={{ fontSize: "12px", color: "#5B7A70" }}>· {alert.dorm}</span>
                    </div>

                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#991B1B", marginTop: "4px" }}>
                      Diagnosa / Catatan: "{alert.diagnosis}"
                    </div>
                    <div style={{ fontSize: "11px", color: "#8AA49B", marginTop: "2px" }}>
                      Musyrif Pelapor: {alert.officer} · {alert.dateRecorded}
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: alert.status.includes("Selesai") ? "#D1FAE5" : "#FEF3C7",
                        color: alert.status.includes("Selesai") ? "#065F46" : "#92400E",
                      }}
                    >
                      {alert.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 4: SETELAN AMBANG SP & NILAI RAPOR ADAB (DIATUR ADMIN)
           ------------------------------------------------------------- */}
        {adminTab === "sp" && (
          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#06271E" }}>
                  Konfigurasi Dinamis Ambang Surat Peringatan (SP)
                </h3>
                <p style={{ fontSize: "12px", color: "#5B7A70" }}>
                  Parameter nilai dan sanksi dapat disetel langsung oleh Admin di sini.
                </p>
              </div>

              <button
                onClick={() => setIsSpPdfModalOpen(true)}
                style={{
                  background: "var(--gradient-emerald)",
                  color: "#FFFFFF",
                  padding: "9px 14px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                📄 Pratinjau Draf PDF Surat SP Berkop
              </button>
            </div>

            {/* Form Konfigurasi Ambang SP */}
            <form
              onSubmit={handleSaveSpThresholds}
              style={{
                background: "#FFFFFF",
                borderRadius: "18px",
                padding: "22px",
                border: "1px solid #E2EFE9",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "18px" }}>
                {/* SP 1 */}
                <div style={{ background: "#F4FBF7", borderRadius: "14px", padding: "14px", border: "1px solid #D1FAE5" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#065F46", marginBottom: "8px" }}>
                    Tingkat SP I (Peringatan Awal)
                  </div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Ambang Poin Pelanggaran:</label>
                  <input
                    type="number"
                    value={sp1Input}
                    onChange={(e) => setSp1Input(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #A7F3D0", fontSize: "13px", fontWeight: 700, margin: "4px 0 10px 0" }}
                  />
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Sanksi & Tindakan:</label>
                  <input
                    type="text"
                    value={sp1ActionInput}
                    onChange={(e) => setSp1ActionInput(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #A7F3D0", fontSize: "11px", marginTop: "4px" }}
                  />
                </div>

                {/* SP 2 */}
                <div style={{ background: "#FFFBEB", borderRadius: "14px", padding: "14px", border: "1px solid #FEF3C7" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400E", marginBottom: "8px" }}>
                    Tingkat SP II (Skorsing Ringan)
                  </div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Ambang Poin Pelanggaran:</label>
                  <input
                    type="number"
                    value={sp2Input}
                    onChange={(e) => setSp2Input(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #FCD34D", fontSize: "13px", fontWeight: 700, margin: "4px 0 10px 0" }}
                  />
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Sanksi & Tindakan:</label>
                  <input
                    type="text"
                    value={sp2ActionInput}
                    onChange={(e) => setSp2ActionInput(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #FCD34D", fontSize: "11px", marginTop: "4px" }}
                  />
                </div>

                {/* SP 3 */}
                <div style={{ background: "#FEF2F2", borderRadius: "14px", padding: "14px", border: "1px solid #FECACA" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#B42318", marginBottom: "8px" }}>
                    Tingkat SP III (Majelis Pimpinan)
                  </div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Ambang Poin Pelanggaran:</label>
                  <input
                    type="number"
                    value={sp3Input}
                    onChange={(e) => setSp3Input(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #FCA5A5", fontSize: "13px", fontWeight: 700, margin: "4px 0 10px 0" }}
                  />
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Sanksi & Tindakan:</label>
                  <input
                    type="text"
                    value={sp3ActionInput}
                    onChange={(e) => setSp3ActionInput(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #FCA5A5", fontSize: "11px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: "var(--gradient-emerald)",
                  color: "#FFFFFF",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                💾 Simpan Perubahan Ambang SP
              </button>
            </form>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 5: PENGATURAN PONDOK PESANTREN & JADWAL SHOLAT OTOMATIS
           ------------------------------------------------------------- */}
        {adminTab === "settings" && (
          <div style={{ padding: "24px 28px" }}>
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#06271E" }}>
                ⚙️ Pengaturan Pondok Pesantren & Jadwal Sholat Otomatis
              </h3>
              <p style={{ fontSize: "12px", color: "#5B7A70" }}>
                Sesuaikan nama pondok pesantren, istilah tempat tinggal (Asrama / Sakan / Komplek), lokasi penentuan waktu sholat, dan jam otomatis presensi.
              </p>
            </div>

            <form onSubmit={handleSavePesantrenSettings} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Bagian 1: Identitas & Istilah Ponpes */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "18px",
                  padding: "22px",
                  border: "1px solid #E2EFE9",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E", marginBottom: "14px" }}>
                  🏛️ Identitas & Istilah Pondok Pesantren
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#5B7A70" }}>
                      Nama Pondok Pesantren:
                    </label>
                    <input
                      type="text"
                      value={pesantrenNameInput}
                      onChange={(e) => setPesantrenNameInput(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid #D1FAE5",
                        fontSize: "13px",
                        fontWeight: 700,
                        marginTop: "5px",
                      }}
                      placeholder="Contoh: Pondok Pesantren Darussalam Rajapolah"
                    />
                    <div style={{ fontSize: "10.5px", color: "#8AA49B", marginTop: "3px" }}>
                      Nama ini akan tampil di Splash Screen, Header, dan Kartu Santri.
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#5B7A70" }}>
                      Sebutan Istilah Tempat Tinggal Santri:
                    </label>
                    <select
                      value={selectedDormOption}
                      onChange={(e) => setSelectedDormOption(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid #D1FAE5",
                        fontSize: "13px",
                        fontWeight: 700,
                        marginTop: "5px",
                        background: "#FFFFFF",
                      }}
                    >
                      <option value="Asrama">Asrama (Umum)</option>
                      <option value="Sakan">Sakan (Arab / Pesantren Modern)</option>
                      <option value="Komplek">Komplek (Tradisional / Terpadu)</option>
                      <option value="Kobong">Kobong (Salafiyah Jawa Barat)</option>
                      <option value="Lainnya">Lainnya (Ketik Manual)...</option>
                    </select>

                    {/* Jika memilih Lainnya, tampilkan input kustom */}
                    {selectedDormOption === "Lainnya" && (
                      <div className="fade-in-up" style={{ marginTop: "8px" }}>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#065F46" }}>
                          Ketik Istilah Tempat Tinggal Kustom:
                        </label>
                        <input
                          type="text"
                          value={customDormInput}
                          onChange={(e) => setCustomDormInput(e.target.value)}
                          placeholder="contoh: Wisma, Bilik, Asrama Putra/Putri, Gedung, dsb."
                          style={{
                            width: "100%",
                            padding: "9px 12px",
                            borderRadius: "10px",
                            border: "1.5px solid #10B981",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            marginTop: "4px",
                            background: "#F4FBF7",
                            outline: "none",
                          }}
                        />
                      </div>
                    )}

                    <div style={{ fontSize: "10.5px", color: "#8AA49B", marginTop: "4px" }}>
                      Istilah aktif: <strong>{selectedDormOption === "Lainnya" ? (customDormInput || "(Belum diisi)") : selectedDormOption}</strong>. Diterapkan otomatis pada portal Musyrif, Pengasuhan, dan Wali Santri.
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#5B7A70" }}>
                      Wilayah / Lokasi Jadwal Waktu Sholat:
                    </label>
                    <input
                      type="text"
                      value={prayerLocationInput}
                      onChange={(e) => setPrayerLocationInput(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid #D1FAE5",
                        fontSize: "13px",
                        fontWeight: 700,
                        marginTop: "5px",
                      }}
                      placeholder="Contoh: Kabupaten Tasikmalaya (WIB)"
                    />
                    <div style={{ fontSize: "10.5px", color: "#8AA49B", marginTop: "3px" }}>
                      Penentuan waktu salat lokal disesuaikan dengan zona waktu pondok.
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian 2: Jadwal Waktu Sholat Otomatis & Ambang Masbuk */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "18px",
                  padding: "22px",
                  border: "1px solid #E2EFE9",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E", marginBottom: "6px" }}>
                  🕌 Jadwal Waktu Sholat Otomatis & Toleransi Masbuk
                </div>
                <div style={{ fontSize: "11.5px", color: "#059669", marginBottom: "16px", background: "#ECFDF5", padding: "10px 14px", borderRadius: "10px", border: "1px solid #A7F3D0" }}>
                  ⚡ <strong>Auto-Switch Sesi:</strong> Saat aplikasi dibuka pada jam tertentu (misal Dzuhur 11:52–15:14, lalu buka 15:15), sistem otomatis masuk ke sesi Ashar tanpa memilih sesi lagi. Presensi lewat batas waktu otomatis dicatat Masbuk. Penentuan tepat waktu vs masbuk murni berdasarkan waktu salat lokal dari setelan admin tanpa perlu pemilihan shaf atau rakaat manual.
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  {[
                    { key: "subuh", name: "Subuh", start: "04:15", end: "05:45", masbuk: "04:45" },
                    { key: "dzuhur", name: "Dzuhur", start: "11:52", end: "15:14", masbuk: "12:15" },
                    { key: "ashar", name: "Ashar", start: "15:15", end: "17:54", masbuk: "15:35" },
                    { key: "maghrib", name: "Maghrib", start: "17:55", end: "19:07", masbuk: "18:15" },
                    { key: "isya", name: "Isya", start: "19:08", end: "23:59", masbuk: "19:35" },
                  ].map((s) => (
                    <div
                      key={s.key}
                      style={{
                        background: "#F4FBF7",
                        borderRadius: "12px",
                        padding: "12px",
                        border: "1px solid #D1FAE5",
                      }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#065F46", marginBottom: "6px" }}>
                        Salat {s.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#5B7A70" }}>
                        Rentang Waktu:
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#06271E", marginBottom: "6px" }}>
                        {s.start} – {s.end} WIB
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#92400E", background: "#FEF3C7", padding: "4px 6px", borderRadius: "6px" }}>
                        Masbuk setelah: <strong>{s.masbuk} WIB</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tombol Simpan */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  style={{
                    background: "var(--gradient-emerald)",
                    color: "#FFFFFF",
                    padding: "12px 28px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 800,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(6, 95, 70, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>💾</span>
                  <span>Simpan Pengaturan Pondok Pesantren</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 6: APPEND-ONLY SECURITY AUDIT LOG
           ------------------------------------------------------------- */}
        {adminTab === "audit" && (
          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#06271E" }}>
                  Catatan Forensik Keamanan (Append-Only Immutable Log)
                </h3>
                <p style={{ fontSize: "12px", color: "#5B7A70" }}>
                  Mencatat seluruh aktivitas sistem secara real-time dari Mobile Wali, Guru, Ubudiyyah, Musyrif, Satpam, BK, Pengasuhan, dan Admin.
                </p>
              </div>
              <span style={{ background: "#D1FAE5", color: "#065F46", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>
                🔒 Zero-Trust Immutability
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    border: "1px solid #E2EFE9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12px",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 700, color: "#5B7A70" }}>[{log.timestamp}]</span>
                      <span style={{ fontWeight: 800, color: "#06271E" }}>{log.user} ({log.role})</span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: log.status === "SUKSES" ? "#D1FAE5" : log.status === "DITOLAK" ? "#FEE2E2" : "#FEF3C7",
                          color: log.status === "SUKSES" ? "#065F46" : log.status === "DITOLAK" ? "#B42318" : "#92400E",
                        }}
                      >
                        {log.action}
                      </span>
                    </div>
                    <div style={{ color: "#5B7A70", marginTop: "2px" }}>{log.details}</div>
                  </div>

                  <div style={{ color: "#8AA49B", fontStyle: "italic", fontSize: "11px" }}>
                    Objek: {log.object}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* -------------------------------------------------------------
          MODAL 1: IMPOR CSV SANTRI
         ------------------------------------------------------------- */}
      {isCsvModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            className="fade-in-up"
            style={{
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px",
              width: "100%",
              maxWidth: "520px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#06271E" }}>
                📂 Pengimpor Data Santri Cerdas (CSV)
              </div>
              <button onClick={() => setIsCsvModalOpen(false)} style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: "26px", height: "26px", cursor: "pointer" }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: "11.5px", color: "#5B7A70", marginBottom: "10px" }}>
              Pastikan kolom sesuai: <strong>NIS, Nama Santri, Kelas, Asrama, Nama Wali, No HP Wali</strong>
            </p>

            <textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              rows={6}
              style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #D1FAE5", fontFamily: "monospace", fontSize: "11px", marginBottom: "14px" }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <button
                onClick={handleDownloadCsvTemplate}
                style={{
                  background: "#F4FBF7",
                  border: "1px solid #10B981",
                  color: "#065F46",
                  padding: "9px 14px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                📥 Unduh Template CSV
              </button>

              <button
                onClick={handleProcessCsvImport}
                style={{
                  background: "var(--gradient-emerald)",
                  color: "#FFFFFF",
                  padding: "9px 18px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Proses Impor CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 2: KOREKSI ABSENSI BERALASAN
         ------------------------------------------------------------- */}
      {isCorrectionModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            className="fade-in-up"
            style={{
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px",
              width: "100%",
              maxWidth: "420px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#06271E" }}>
                ✏️ Koreksi Absensi Beralasan Resmi
              </div>
              <button onClick={() => setIsCorrectionModalOpen(false)} style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: "26px", height: "26px", cursor: "pointer" }}>
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Target Santri & Sesi:</label>
                <input
                  type="text"
                  value={correctionTarget}
                  onChange={(e) => setCorrectionTarget(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Status Baru:</label>
                <select
                  value={correctionNewStatus}
                  onChange={(e) => setCorrectionNewStatus(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "4px" }}
                >
                  <option value="Hadir (Dispensasi Musyrif)">Hadir (Dispensasi Musyrif)</option>
                  <option value="Izin (Dispensasi Piket)">Izin (Dispensasi Piket)</option>
                  <option value="Sakit (Istirahat Asrama)">Sakit (Istirahat Asrama)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Alasan Resmi Tertulis (Wajib):</label>
                <textarea
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "4px" }}
                />
              </div>
            </div>

            <button
              onClick={handleSubmitCorrection}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                background: "var(--gradient-emerald)",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
              }}
            >
              Simpan Koreksi ke Audit Log
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 3: PRATINJAU DRAF SURAT SP BERKOP PONDOK
         ------------------------------------------------------------- */}
      {isSpPdfModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            className="fade-in-up"
            style={{
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "28px",
              width: "100%",
              maxWidth: "540px",
              color: "#06271E",
              boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* Kop Surat Resmi */}
            <div style={{ textAlign: "center", borderBottom: "2px solid #06271E", paddingBottom: "12px", marginBottom: "16px" }}>
              <div style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "1px" }}>
                PONDOK PESANTREN DARUSSALAM RAJAPOLAH
              </div>
              <div style={{ fontSize: "11px", color: "#5B7A70" }}>
                Jl. Raya Rajapolah No. 01 Tasikmalaya, Jawa Barat · Kode Pos 46155
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, textDecoration: "underline" }}>
                SURAT PERINGATAN KEDISIPLINAN (SP I)
              </div>
              <div style={{ fontSize: "11px", color: "#5B7A70" }}>
                Nomor: SP1/PENGASUHAN/X/2026
              </div>
            </div>

            <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#374151", marginBottom: "16px" }}>
              Menimbang akumulasi pelanggaran tata tertib pondok telah melampaui ambang batas <strong>{spThresholds.sp1} Poin</strong>, dengan ini Pengasuhan Santri menerbitkan Surat Peringatan I kepada santri bersangkutan untuk menghadiri sesi pembinaan bersama Guru BK.
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", paddingTop: "12px", borderTop: "1px dashed #E2EFE9" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#5B7A70" }}>Mengetahui,</div>
                <div style={{ fontSize: "12px", fontWeight: 700, marginTop: "30px" }}>
                  K.H. Asep Ridwan, Lc.
                </div>
                <div style={{ fontSize: "10px", color: "#8AA49B" }}>Kepala Pengasuhan</div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "#5B7A70" }}>Menyetujui,</div>
                <div style={{ fontSize: "12px", fontWeight: 700, marginTop: "30px" }}>
                  K.H. Hasan Basri
                </div>
                <div style={{ fontSize: "10px", color: "#8AA49B" }}>Pimpinan Pondok Pesantren</div>
              </div>
            </div>

            <button
              onClick={() => setIsSpPdfModalOpen(false)}
              style={{
                width: "100%",
                marginTop: "18px",
                padding: "10px",
                borderRadius: "10px",
                background: "var(--gradient-emerald)",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
