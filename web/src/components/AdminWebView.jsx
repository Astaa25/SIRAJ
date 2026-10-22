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
  const [selectedStudentForSp, setSelectedStudentForSp] = useState(INITIAL_STUDENTS[2]); // Default: Muhammad Rizky (SP I)
  const [spLevelForPrint, setSpLevelForPrint] = useState("SP I");

  // Kebijakan Reset Poin & Fitur Opsional Ponpes (Diatur di Admin)
  const [pointResetPolicy, setPointResetPolicy] = useState(
    currentTenant?.pointResetPolicy || "semester" // "semester", "tahun", "akumulatif"
  );
  const [enableNightRonda, setEnableNightRonda] = useState(
    currentTenant?.enableNightRonda ?? true
  );
  const [enableTahfidzModule, setEnableTahfidzModule] = useState(
    currentTenant?.enableTahfidzModule ?? true
  );

  // Filter Syahriyyah Santri (ALL, Lunas, Belum Lunas)
  const [syahriyyahFilter, setSyahriyyahFilter] = useState("ALL");

  // Fungsi Buka Cetak SP Otomatis
  const handleOpenSpModal = (student, level = "SP I") => {
    playSoftClick();
    setSelectedStudentForSp(student);
    setSpLevelForPrint(level);
    setIsSpPdfModalOpen(true);
  };

  // 1-Click Toggle Status Syahriyyah (Tanpa Payment Gateway / Tidak Ribet)
  const handleToggleSyahriyyah = (studentId) => {
    playSoftClick();
    triggerHaptic([50]);
    setStudentsList((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const nextStatus = s.syahriyyahStatus === "Lunas" ? "Belum Lunas" : "Lunas";
          playSuccessChime();
          onAuditLogAdd({
            user: "Admin Ponpes",
            role: "Admin",
            action: `UBAH SYAHRIYYAH: ${nextStatus.toUpperCase()}`,
            object: `Santri: ${s.name} (NIS: ${s.nis})`,
            status: "BERHASIL",
            details: `Status tagihan Syahriyyah ${s.syahriyyahMonth || "Oktober 2026"} (Rp 1.250.000) diubah menjadi ${nextStatus}. Pencatatan langsung oleh Bendahara.`,
          });
          return { ...s, syahriyyahStatus: nextStatus };
        }
        return s;
      })
    );
  };

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
    let csvString = "NIS,Nama Santri,Kelas,Asrama/Komplek,No Kamar,Nama Wali,Skor Adab,Syahriyyah\n";
    studentsList.forEach((st) => {
      csvString += `${st.nis},"${st.name}","${st.class}","${st.dormBuilding || st.dorm || ''}","${st.roomNumber || ''}","${st.guardianName}",${st.scoreAdab},"${st.syahriyyahStatus || 'Lunas'}"\n`;
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
          dormBuilding: "Asrama Abu Bakar Ash-Shiddiq",
          roomNumber: "Kamar 02",
          photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
          guardianName: "H. Yusuf Mansur",
          scoreAdab: 100,
          pointsViolation: 0,
          pointsGood: 20,
          spStatus: "Aman",
          syahriyyahStatus: "Lunas",
          syahriyyahMonth: "Oktober 2026",
          syahriyyahAmount: 1250000,
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
          dormBuilding: "Asrama Abu Bakar Ash-Shiddiq",
          roomNumber: "Kamar 04",
          photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
          guardianName: "Dr. H. Lukman",
          scoreAdab: 95,
          pointsViolation: 5,
          pointsGood: 15,
          spStatus: "Aman",
          syahriyyahStatus: "Lunas",
          syahriyyahMonth: "Oktober 2026",
          syahriyyahAmount: 1250000,
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
          pointResetPolicy: pointResetPolicy,
          enableNightRonda: enableNightRonda,
          enableTahfidzModule: enableTahfidzModule,
        });
      }

      onAuditLogAdd({
        user: "Admin Ponpes",
        role: "Admin",
        action: "UPDATE PENGATURAN PONPES",
        object: pesantrenNameInput,
        status: "DISIMPAN",
        details: `Nama Ponpes: "${pesantrenNameInput}", Istilah Hunian: "${effectiveDormTerm}", Wilayah: "${prayerLocationInput}", Reset Poin: "${pointResetPolicy}", Ronda Malam: ${enableNightRonda ? 'Aktif' : 'Nonaktif'}, Tahfidz: ${enableTahfidzModule ? 'Aktif' : 'Nonaktif'}.`,
      });
      alert(`Pengaturan ${pesantrenNameInput} berhasil disimpan!`);
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

  // Filter students by Search Query & Syahriyyah Status
  const filteredStudents = studentsList.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.nis.includes(searchQuery) ||
      st.class.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSyahriyyah =
      syahriyyahFilter === "ALL" ||
      (syahriyyahFilter === "Lunas" && st.syahriyyahStatus === "Lunas") ||
      (syahriyyahFilter === "Belum Lunas" && st.syahriyyahStatus !== "Lunas");
    return matchesSearch && matchesSyahriyyah;
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: "780px",
        background: "var(--theme-card-bg-subtle)",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1px solid var(--theme-card-border)",
        boxShadow: "var(--theme-card-shadow)",
        transition: "all 0.3s ease",
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Animated Rotating Islamic Star Mandala */}
          <div
            style={{
              position: "relative",
              width: "52px",
              height: "52px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              className="rotate-medium"
              style={{
                position: "absolute",
                inset: 0,
                width: "52px",
                height: "52px",
                pointerEvents: "none",
              }}
            >
              <svg viewBox="0 0 100 100" width="52" height="52" fill="none">
                <circle cx="50" cy="50" r="47" stroke="rgba(232, 182, 90, 0.6)" strokeWidth="1.8" strokeDasharray="4 4" />
                <path
                  d="M50 3 L63 37 L97 50 L63 63 L50 97 L37 63 L3 50 L37 37 Z"
                  stroke="#FFE49A"
                  strokeWidth="2.5"
                  style={{ filter: "drop-shadow(0 0 6px rgba(232, 182, 90, 0.7))" }}
                />
              </svg>
            </div>
            <img
              src="/logo_tile_1024.png"
              alt="SIRAJ"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                border: "1.5px solid #FFE49A",
                zIndex: 2,
                position: "relative",
              }}
            />
          </div>
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
              { id: "dashboard", label: "Dashboard & KPI" },
              { id: "santri", label: "Master Santri & CSV" },
              { id: "ews", label: "EWS Asrama Sakit", badge: String(ewsAlerts.length) },
              { id: "sp", label: "Setelan Ambang SP" },
              { id: "settings", label: "Pengaturan Ponpes" },
              { id: "audit", label: "Audit Log (Kekal)" },
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
            <div style={{ fontWeight: 700, color: "#FFE49A" }}>{pesantrenNameInput}</div>
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
            background: "var(--theme-card-bg)",
            padding: "16px 28px",
            borderBottom: "1px solid var(--theme-card-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            transition: "all 0.3s ease",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--theme-text-title)" }}>
              {adminTab === "dashboard" && "Dashboard KPI & Statistik Real-Time"}
              {adminTab === "santri" && "Master Santri & Pengimpor CSV Cerdas"}
              {adminTab === "ews" && "Early Warning System (EWS) — Santri Asrama Sakit & Izin"}
              {adminTab === "sp" && "Konfigurasi Ambang Surat Peringatan (SP) & Nilai Adab"}
              {adminTab === "settings" && "Pengaturan Pondok Pesantren, Istilah Asrama & Jadwal Sholat"}
              {adminTab === "audit" && "Append-Only Security Audit Log (Catatan Kekal Seluruh Sistem)"}
            </h2>
            <div style={{ fontSize: "11.5px", color: "#5B7A70", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>{pesantrenNameInput} · Status Server:</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#059669", fontWeight: 700 }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#059669" }} />
                Terkoneksi Supabase Cloud
              </span>
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
              Koreksi Absensi Beralasan
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
                { label: "Total Santri Aktif", val: "1,248", desc: "100% data terverifikasi", color: "#065F46" },
                { label: "Kehadiran Hari Ini", val: "97.4%", desc: "+1.2% dari pekan lalu", color: "#059669" },
                { label: "Sesi KBM & Salat", val: "14 Sesi", desc: "Kelas Pagi, Salat, Tahfidz, Malam", color: "#D97706" },
                { label: "Santri Asrama Sakit", val: `${ewsAlerts.length} Santri`, desc: "Pantauan Musyrif Komplek", color: "#B42318" },
              ].map((kpi, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--theme-card-bg)",
                    borderRadius: "18px",
                    padding: "18px",
                    border: "1px solid var(--theme-card-border)",
                    boxShadow: "var(--theme-card-shadow)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "var(--theme-text-muted)", fontWeight: 600 }}>{kpi.label}</span>
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
            <div style={{ background: "var(--theme-card-bg)", borderRadius: "18px", padding: "20px", border: "1px solid var(--theme-card-border)", boxShadow: "var(--theme-card-shadow)", transition: "all 0.3s ease" }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--theme-text-title)", marginBottom: "12px" }}>
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
            {/* Syahriyyah Bulanan Monitoring Header (Sederhana Tanpa Payment Gateway) */}
            <div
              style={{
                background: "linear-gradient(135deg, #F4FBF7 0%, #FFFFFF 100%)",
                borderRadius: "16px",
                padding: "16px 20px",
                border: "1px solid #D1FAE5",
                marginBottom: "18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ background: "#D1FAE5", color: "#065F46", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 800 }}>
                    SPP
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                    Pemantauan Tagihan Syahriyyah / SPP Santri (Oktober 2026)
                  </span>
                  <span style={{ background: "#D1FAE5", color: "#065F46", padding: "2px 8px", borderRadius: "6px", fontSize: "10.5px", fontWeight: 700 }}>
                    Rp 1.250.000 / Santri
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "#5B7A70", marginTop: "3px" }}>
                  Status pembayaran dikelola langsung secara manual oleh Bendahara/Admin Ponpes. Tanpa biaya admin & bebas repot.
                </div>
              </div>

              {/* Filter Syahriyyah */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#FFFFFF", padding: "4px", borderRadius: "10px", border: "1px solid #E2EFE9" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70", padding: "0 6px" }}>Filter:</span>
                {[
                  { id: "ALL", label: `Semua (${studentsList.length})` },
                  { id: "Lunas", label: `Lunas (${studentsList.filter(s => s.syahriyyahStatus === "Lunas").length})` },
                  { id: "Belum Lunas", label: `Belum Lunas (${studentsList.filter(s => s.syahriyyahStatus !== "Lunas").length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      playSoftClick();
                      setSyahriyyahFilter(f.id);
                    }}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: syahriyyahFilter === f.id ? 800 : 600,
                      background: syahriyyahFilter === f.id ? "var(--gradient-emerald)" : "transparent",
                      color: syahriyyahFilter === f.id ? "#FFFFFF" : "#5B7A70",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar: Search, Unduh Template, Impor CSV, Ekspor CSV */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
              <input
                type="text"
                placeholder="Cari santri berdasarkan nama, NIS, atau kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  maxWidth: "340px",
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
                  Unduh Template CSV
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
                  Impor CSV Santri
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
                  Ekspor CSV
                </button>
              </div>
            </div>

            {/* Tabel Master Santri (Responsif & Asrama/No Kamar Terpisah) */}
            <div style={{ background: "#FFFFFF", borderRadius: "18px", border: "1px solid #E2EFE9", overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#F4FBF7", borderBottom: "1px solid #E2EFE9", textAlign: "left", color: "#5B7A70" }}>
                    <th style={{ padding: "12px 14px" }}>Santri</th>
                    <th style={{ padding: "12px 14px" }}>NIS</th>
                    <th style={{ padding: "12px 14px" }}>Kelas</th>
                    <th style={{ padding: "12px 14px" }}>Asrama / Komplek</th>
                    <th style={{ padding: "12px 14px" }}>No. Kamar</th>
                    <th style={{ padding: "12px 14px" }}>Wali Sah</th>
                    <th style={{ padding: "12px 14px" }}>Status SP</th>
                    <th style={{ padding: "12px 14px" }}>Syahriyyah Bulanan</th>
                    <th style={{ padding: "12px 14px" }}>Skor Adab</th>
                    <th style={{ padding: "12px 14px", textAlign: "center" }}>Aksi SP Resmi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st) => (
                    <tr key={st.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={st.photo} alt={st.name} style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover" }} />
                        <div>
                          <div style={{ fontWeight: 700, color: "#06271E", whiteSpace: "nowrap" }}>{st.name}</div>
                          <div style={{ fontSize: "10px", color: "#8AA49B" }}>{st.barcode || st.nis}</div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", color: "#5B7A70", whiteSpace: "nowrap" }}>{st.nis}</td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>{st.class}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: "#065F46", whiteSpace: "nowrap" }}>
                        {st.dormBuilding}
                      </td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ background: "#E2EFE9", color: "#06271E", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                          {st.roomNumber}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", color: "#5B7A70", whiteSpace: "nowrap" }}>{st.guardianName}</td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
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
                      {/* Kolom Syahriyyah Bulanan dengan 1-Click Toggle Mudah */}
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              background: st.syahriyyahStatus === "Lunas" ? "#D1FAE5" : "#FEE2E2",
                              color: st.syahriyyahStatus === "Lunas" ? "#065F46" : "#B42318",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 800,
                            }}
                          >
                            {st.syahriyyahStatus === "Lunas" ? "Lunas" : "Belum Lunas"}
                          </span>
                          <button
                            onClick={() => handleToggleSyahriyyah(st.id)}
                            title="Klik untuk ubah status lunas / belum lunas santri ini"
                            style={{
                              background: "#F3F4F6",
                              border: "1px solid #D1D5DB",
                              borderRadius: "6px",
                              padding: "2px 8px",
                              fontSize: "10px",
                              fontWeight: 700,
                              cursor: "pointer",
                              color: "#374151",
                            }}
                          >
                            Ubah
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 800, color: st.scoreAdab >= 80 ? "#059669" : st.scoreAdab >= 50 ? "#D97706" : "#DC2626", whiteSpace: "nowrap" }}>
                        {st.scoreAdab} / 100
                      </td>
                      {/* Kolom Cetak SP Resmi */}
                      <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => {
                            const level = st.spStatus?.includes("SP III") ? "SP III" : st.spStatus?.includes("SP II") ? "SP II" : "SP I";
                            handleOpenSpModal(st, level);
                          }}
                          style={{
                            background: st.spStatus?.includes("SP") ? "#FEF2F2" : "#F4FBF7",
                            border: st.spStatus?.includes("SP") ? "1px solid #FCA5A5" : "1px solid #A7F3D0",
                            color: st.spStatus?.includes("SP") ? "#991B1B" : "#065F46",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span>Cetak SP</span>
                        </button>
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
              <strong>Monitoring Early Warning System (EWS) Asrama:</strong> Fokus memantau santri asrama yang dilaporkan sakit di kamar atau izin darurat oleh Musyrif komplek untuk penanganan cepat.
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#06271E" }}>
                  Konfigurasi Ambang & Penerbitan Surat Peringatan (SP I, SP II, SP III)
                </h3>
                <p style={{ fontSize: "12px", color: "#5B7A70" }}>
                  Parameter nilai, sanksi, dan cetak dokumen resmi ber-kop, bertanda tangan digital Kepala Pengasuhan & Pimpinan Pondok, serta QR validasi resmi.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedStudentForSp(studentsList.find((s) => s.spStatus?.includes("SP")) || studentsList[0]);
                  setIsSpPdfModalOpen(true);
                }}
                style={{
                  background: "var(--gradient-emerald)",
                  color: "#FFFFFF",
                  padding: "9px 16px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 3px 12px rgba(6, 95, 70, 0.25)",
                }}
              >
                <span>Cetak Dokumen Resmi SP (Pratinjau)</span>
              </button>
            </div>

            {/* Daftar Santri Yang Mencapai Ambang Batas SP */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "18px",
                padding: "20px",
                border: "1px solid #E2EFE9",
                marginBottom: "22px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E", marginBottom: "4px" }}>
                Daftar Santri Mencapai Ambang Batas Pelanggaran Poin
              </div>
              <p style={{ fontSize: "11px", color: "#5B7A70", marginBottom: "14px" }}>
                Santri yang telah mencapai batas SP I, SP II, atau SP III secara otomatis dapat dicetak surat resminya untuk arsip pengasuhan & diserahkan ke wali santri.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {studentsList
                  .filter((st) => st.spStatus && st.spStatus !== "Aman")
                  .map((st) => {
                    const isSp3 = st.spStatus?.includes("SP III");
                    const isSp2 = st.spStatus?.includes("SP II");
                    const level = isSp3 ? "SP III" : isSp2 ? "SP II" : "SP I";
                    return (
                      <div
                        key={st.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "14px 18px",
                          borderRadius: "14px",
                          background: isSp3 ? "#FEF2F2" : isSp2 ? "#FFFBEB" : "#F4FBF7",
                          border: isSp3 ? "1px solid #FECACA" : isSp2 ? "1px solid #FCD34D" : "1px solid #A7F3D0",
                          flexWrap: "wrap",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img
                            src={st.photo}
                            alt={st.name}
                            style={{ width: "44px", height: "44px", borderRadius: "10px", objectFit: "cover" }}
                          />
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                                {st.name}
                              </span>
                              <span
                                style={{
                                  background: isSp3 ? "#DC2626" : isSp2 ? "#D97706" : "#059669",
                                  color: "#FFFFFF",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  fontSize: "10px",
                                  fontWeight: 800,
                                }}
                              >
                                {st.spStatus}
                              </span>
                            </div>
                            <div style={{ fontSize: "11.5px", color: "#5B7A70", marginTop: "2px" }}>
                              NIS: {st.nis} · {st.class} · {st.dormBuilding} ({st.roomNumber})
                            </div>
                            <div style={{ fontSize: "11px", color: isSp3 ? "#991B1B" : "#B45309", fontWeight: 700, marginTop: "2px" }}>
                              Total Pelanggaran: <strong>{st.pointsViolation} Poin</strong> (Skor Adab: {st.scoreAdab}/100)
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleOpenSpModal(st, level)}
                            style={{
                              background: "var(--gradient-emerald)",
                              color: "#FFFFFF",
                              padding: "8px 14px",
                              borderRadius: "10px",
                              fontSize: "11.5px",
                              fontWeight: 800,
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: "0 2px 8px rgba(6, 95, 70, 0.25)",
                            }}
                          >
                            <span>Cetak Dokumen Resmi {level}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
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
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E", marginBottom: "12px" }}>
                Setelan Parameter Ambang Batas Poin & Sanksi
              </div>
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
                Simpan Perubahan Ambang SP
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
                Pengaturan Pondok Pesantren & Jadwal Sholat Otomatis
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
                  Identitas & Istilah Pondok Pesantren
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
                  Jadwal Waktu Sholat Otomatis & Toleransi Masbuk
                </div>
                <div style={{ fontSize: "11.5px", color: "#059669", marginBottom: "16px", background: "#ECFDF5", padding: "10px 14px", borderRadius: "10px", border: "1px solid #A7F3D0" }}>
                  <strong>Auto-Switch Sesi:</strong> Saat aplikasi dibuka pada jam tertentu (misal Dzuhur 11:52–15:14, lalu buka 15:15), sistem otomatis masuk ke sesi Ashar tanpa memilih sesi lagi. Presensi lewat batas waktu otomatis dicatat Masbuk. Penentuan tepat waktu vs masbuk murni berdasarkan waktu salat lokal dari setelan admin tanpa perlu pemilihan shaf atau rakaat manual.
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

              {/* Bagian 3: Kebijakan Reset Poin Adab & Fitur Opsional Pesantren */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "18px",
                  padding: "22px",
                  border: "1px solid #E2EFE9",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E", marginBottom: "6px" }}>
                  Kebijakan Reset Poin Adab & Fitur Opsional Pesantren
                </div>
                <div style={{ fontSize: "11.5px", color: "#5B7A70", marginBottom: "16px" }}>
                  Atur siklus evaluasi poin kedisiplinan serta aktifkan/nonaktifkan modul tambahan sesuai kebutuhan pondok.
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  {/* 1. Kebijakan Reset Poin Adab */}
                  <div style={{ background: "#F4FBF7", borderRadius: "14px", padding: "16px", border: "1px solid #D1FAE5" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: "#065F46" }}>
                        Kebijakan Reset Poin Adab Santri
                      </span>
                    </div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>
                      Siklus Reset Poin Kebaikan & Pelanggaran:
                    </label>
                    <select
                      value={pointResetPolicy}
                      onChange={(e) => setPointResetPolicy(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1.5px solid #10B981",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        marginTop: "5px",
                        background: "#FFFFFF",
                        color: "#06271E",
                      }}
                    >
                      <option value="semester">Reset Tiap Semester (Ganjil / Genap) - Standar</option>
                      <option value="tahun">Reset Tiap Tahun Ajaran Baru</option>
                      <option value="akumulatif">Tidak Direset (Akumulatif Selama Menjadi Santri)</option>
                    </select>
                    <div style={{ fontSize: "10.5px", color: "#8AA49B", marginTop: "5px" }}>
                      Kebijakan aktif: <strong>{pointResetPolicy === "semester" ? "Per Semester" : pointResetPolicy === "tahun" ? "Per Tahun Ajaran" : "Akumulatif Penuh"}</strong>. Tampil di grafik tren perkembangan adab Guru BK & Pengasuhan.
                    </div>
                  </div>

                  {/* 2. Fitur Opsional Ronda Malam & Kebersihan Kamar */}
                  <div style={{ background: enableNightRonda ? "#F4FBF7" : "#F9FAFB", borderRadius: "14px", padding: "16px", border: enableNightRonda ? "1px solid #D1FAE5" : "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: enableNightRonda ? "#065F46" : "#6B7280" }}>
                          Ronda Malam (22:00) & Kebersihan Kamar
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableNightRonda}
                        onChange={(e) => setEnableNightRonda(e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "#059669", cursor: "pointer" }}
                      />
                    </div>
                    <div style={{ fontSize: "11px", color: "#5B7A70", lineHeight: "1.4" }}>
                      Fitur bagi Musyrif untuk absen cek fisik santri di kamar/kobong jam 22:00 WIB dan penilaian kebersihan kamar harian untuk pemilihan kamar teladan mingguan.
                    </div>
                    <div style={{ fontSize: "10.5px", fontWeight: 800, color: enableNightRonda ? "#059669" : "#9CA3AF", marginTop: "8px" }}>
                      Status: {enableNightRonda ? "Fitur Aktif di Portal Musyrif" : "Fitur Dinonaktifkan"}
                    </div>
                  </div>

                  {/* 3. Fitur Opsional Modul Tahfidz Ziyadah & Muraja'ah */}
                  <div style={{ background: enableTahfidzModule ? "#F4FBF7" : "#F9FAFB", borderRadius: "14px", padding: "16px", border: enableTahfidzModule ? "1px solid #D1FAE5" : "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: enableTahfidzModule ? "#065F46" : "#6B7280" }}>
                          Modul Tahfidz (Ziyadah & Muraja'ah)
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableTahfidzModule}
                        onChange={(e) => setEnableTahfidzModule(e.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "#059669", cursor: "pointer" }}
                      />
                    </div>
                    <div style={{ fontSize: "11px", color: "#5B7A70", lineHeight: "1.4" }}>
                      Pencatatan setoran hafalan baru (Ziyadah) & pengulangan (Muraja'ah) per surat, ayat, juz dengan predikat Mutqin/Jayyid, serta target wisuda tahfidz pondok.
                    </div>
                    <div style={{ fontSize: "10.5px", fontWeight: 800, color: enableTahfidzModule ? "#059669" : "#9CA3AF", marginTop: "8px" }}>
                      Status: {enableTahfidzModule ? "Fitur Aktif di Portal Santri & Wali" : "Fitur Dinonaktifkan"}
                    </div>
                  </div>
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
                Zero-Trust Immutability
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
                Pengimpor Data Santri Cerdas (CSV)
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
                Unduh Template CSV
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
                Koreksi Absensi Beralasan Resmi
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
          MODAL 3: CETAK SURAT PERINGATAN (SP I, SP II, SP III) OTOMATIS
          Lengkap dengan tanda tangan digital Kepala Pengasuhan & Pimpinan,
          total pelanggaran poin, dan QR validasi resmi.
         ------------------------------------------------------------- */}
      {isSpPdfModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <div
            className="fade-in-up"
            style={{
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px 28px",
              width: "100%",
              maxWidth: "620px",
              color: "#06271E",
              boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
              maxHeight: "92vh",
              overflowY: "auto",
            }}
          >
            {/* Action Bar Pemilihan Santri & Tingkat SP */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #E2EFE9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <div>
                  <label style={{ fontSize: "10.5px", fontWeight: 700, color: "#5B7A70", display: "block" }}>Pilih Santri:</label>
                  <select
                    value={selectedStudentForSp?.id}
                    onChange={(e) => {
                      const found = studentsList.find((s) => s.id === e.target.value);
                      if (found) setSelectedStudentForSp(found);
                    }}
                    style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", fontWeight: 700, background: "#F4FBF7" }}
                  >
                    {studentsList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.spStatus || "Aman"} · {s.pointsViolation} Poin)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "10.5px", fontWeight: 700, color: "#5B7A70", display: "block" }}>Tingkat SP:</label>
                  <select
                    value={spLevelForPrint}
                    onChange={(e) => setSpLevelForPrint(e.target.value)}
                    style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", fontWeight: 700, background: "#F4FBF7" }}
                  >
                    <option value="SP I">SP I (Peringatan Awal)</option>
                    <option value="SP II">SP II (Skorsing Ringan)</option>
                    <option value="SP III">SP III (Panggilan Orang Tua & Sidang Pleno)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    playSuccessChime();
                    onAuditLogAdd({
                      user: "Admin Ponpes",
                      role: "Admin",
                      action: `CETAK SURAT PERINGATAN: ${spLevelForPrint}`,
                      object: `Santri: ${selectedStudentForSp?.name} (${selectedStudentForSp?.nis})`,
                      status: "DICETAK",
                      details: `Mencetak dokumen resmi ${spLevelForPrint} akumulasi ${selectedStudentForSp?.pointsViolation} poin pelanggaran bertanda tangan digital Kepala Pengasuhan & Pimpinan Pondok.`,
                    });
                    window.print();
                  }}
                  style={{
                    background: "var(--gradient-emerald)",
                    color: "#FFFFFF",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontSize: "11.5px",
                    fontWeight: 800,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>Cetak / Print PDF</span>
                </button>
                <button
                  onClick={() => setIsSpPdfModalOpen(false)}
                  style={{
                    background: "#F3F4F6",
                    color: "#374151",
                    padding: "7px 12px",
                    borderRadius: "8px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ✕ Tutup
                </button>
              </div>
            </div>

            {/* LEMBAR SURAT RESMI PONDOK PESANTREN */}
            <div
              id="sp-print-area"
              style={{
                background: "#FFFFFF",
                border: "2px solid #06271E",
                borderRadius: "14px",
                padding: "24px 22px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                fontFamily: "'Times New Roman', Times, serif",
                color: "#111827",
              }}
            >
              {/* Kop Surat Resmi */}
              <div style={{ textAlign: "center", borderBottom: "3px double #06271E", paddingBottom: "10px", marginBottom: "14px" }}>
                <div style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  {pesantrenNameInput || "PONDOK PESANTREN DARUSSALAM RAJAPOLAH"}
                </div>
                <div style={{ fontSize: "11.5px", fontStyle: "italic", color: "#374151", marginTop: "2px" }}>
                  MAJELIS PENGASUHAN SANTRI & BIRO KEDISIPLINAN PONDOK
                </div>
                <div style={{ fontSize: "10px", color: "#4B5563", marginTop: "2px" }}>
                  Jl. Raya Rajapolah No. 01 Tasikmalaya, Jawa Barat · Kode Pos 46155 · Telp: (0265) 421-998
                </div>
              </div>

              {/* Judul & Nomor Surat */}
              <div style={{ textAlign: "center", marginBottom: "14px" }}>
                <div style={{ fontSize: "13.5px", fontWeight: 800, textDecoration: "underline", textTransform: "uppercase" }}>
                  SURAT PERINGATAN KEDISIPLINAN ({spLevelForPrint})
                </div>
                <div style={{ fontSize: "10.5px", color: "#374151", marginTop: "2px" }}>
                  Nomor: SP.{spLevelForPrint.replace(/\s+/g, '')}/PENGASUHAN/X/2026 · Sifat: PENTING & RESMI
                </div>
              </div>

              {/* Pembuka Surat */}
              <div style={{ fontSize: "11.5px", lineHeight: "1.5", textAlign: "justify", marginBottom: "12px" }}>
                <em>Bismillaahirrohmaanirrohiim.</em> Berdasarkan rekapitulasi Sistem Informasi & Presensi Terpadu Santri (SIRAJ), Majelis Pengasuhan Pondok Pesantren dengan ini menerbitkan surat peringatan resmi kepada:
              </div>

              {/* Tabel Biodata Santri */}
              <div style={{ background: "#F9FAFB", border: "1px solid #D1D5DB", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", fontSize: "11.5px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "38%", padding: "2px 0", fontWeight: 700 }}>Nama Lengkap Santri</td>
                      <td style={{ width: "4%" }}>:</td>
                      <td style={{ fontWeight: 800, color: "#06271E" }}>{selectedStudentForSp?.name}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0", fontWeight: 700 }}>Nomor Induk Santri (NIS)</td>
                      <td>:</td>
                      <td>{selectedStudentForSp?.nis}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0", fontWeight: 700 }}>Kelas / Program</td>
                      <td>:</td>
                      <td>{selectedStudentForSp?.class}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0", fontWeight: 700 }}>Tempat Tinggal / Kamar</td>
                      <td>:</td>
                      <td>{selectedStudentForSp?.dormBuilding || selectedStudentForSp?.dorm} · {selectedStudentForSp?.roomNumber || 'Kamar 01'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0", fontWeight: 700 }}>Total Poin Pelanggaran</td>
                      <td>:</td>
                      <td style={{ fontWeight: 800, color: "#B42318" }}>
                        {selectedStudentForSp?.pointsViolation} Poin (Ambang {spLevelForPrint}: {spLevelForPrint === "SP I" ? spThresholds.sp1 : spLevelForPrint === "SP II" ? spThresholds.sp2 : spThresholds.sp3} Poin)
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0", fontWeight: 700 }}>Nama Orang Tua / Wali</td>
                      <td>:</td>
                      <td>{selectedStudentForSp?.guardianName} ({selectedStudentForSp?.guardianPhone || "+62 812-8899-7711"})</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Klausul Tindakan & Sanksi Edukatif */}
              <div style={{ fontSize: "11.5px", lineHeight: "1.5", textAlign: "justify", marginBottom: "14px" }}>
                {spLevelForPrint === "SP I" && (
                  <div>
                    Menimbang bahwa akumulasi poin pelanggaran ananda telah mencapai ambang batas <strong>SP I ({spThresholds.sp1} Poin)</strong>, dengan ini santri diwajibkan:
                    <ol style={{ margin: "4px 0 0 16px", padding: 0 }}>
                      <li>Mengikuti sesi konseling pembinaan bersama Guru BK ({spThresholds.sp1Action}).</li>
                      <li>Melaporkan presensi salat berjamaah secara mandiri kepada Musyrif Asrama selama 14 hari.</li>
                    </ol>
                  </div>
                )}
                {spLevelForPrint === "SP II" && (
                  <div>
                    Menimbang bahwa ananda telah melampaui ambang batas <strong>SP II ({spThresholds.sp2} Poin)</strong>, maka Pengasuhan menetapkan:
                    <ol style={{ margin: "4px 0 0 16px", padding: 0 }}>
                      <li>Pemberian sanksi edukatif khidmat kebersihan lingkungan ({spThresholds.sp2Action}).</li>
                      <li>Pencabutan izin Gate Pass keluar pondok selama 30 hari kalender.</li>
                    </ol>
                  </div>
                )}
                {spLevelForPrint === "SP III" && (
                  <div>
                    Menimbang pelanggaran disiplin berat telah melampaui ambang batas <strong>SP III ({spThresholds.sp3} Poin)</strong>, maka Majelis menetapkan:
                    <ol style={{ margin: "4px 0 0 16px", padding: 0 }}>
                      <li>Panggilan resmi orang tua/wali santri menghadap Pimpinan Pondok Pesantren ({spThresholds.sp3Action}).</li>
                      <li>Penandatanganan pakta integritas bermaterai di hadapan Majelis Pimpinan.</li>
                    </ol>
                  </div>
                )}
              </div>

              <div style={{ fontSize: "11px", color: "#374151", marginBottom: "16px" }}>
                Ditetapkan di: Tasikmalaya pada tanggal 22 Oktober 2026 M / 9 Rabiul Akhir 1448 H.
              </div>

              {/* Tanda Tangan Digital 2 Pejabat Resmi & QR Validasi */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", alignItems: "flex-end", paddingTop: "8px", borderTop: "1px dashed #D1D5DB" }}>
                {/* 1. Tanda Tangan Kepala Pengasuhan */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: "#4B5563" }}>Mengetahui,</div>
                  <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#111827" }}>Kepala Pengasuhan Santri</div>
                  <div style={{ margin: "6px auto", width: "70px", height: "42px", border: "1px dashed #059669", borderRadius: "6px", background: "#ECFDF5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "9px", color: "#065F46", fontWeight: 800 }}>TERVERIFIKASI</span>
                    <span style={{ fontSize: "8px", color: "#047857" }}>ED25519-PENG</span>
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 800, textDecoration: "underline" }}>K.H. Asep Ridwan, Lc.</div>
                  <div style={{ fontSize: "9.5px", color: "#6B7280" }}>NIP. 19780814 200401 1 002</div>
                </div>

                {/* 2. QR Validasi Resmi Kriptografi */}
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ background: "#FFFFFF", padding: "4px", border: "1px solid #111827", borderRadius: "6px" }}>
                    {/* QR Representation */}
                    <div style={{ width: "52px", height: "52px", background: "conic-gradient(from 0deg, #000 0%, #000 25%, #fff 25%, #fff 50%, #000 50%, #000 75%, #fff 75%)", backgroundSize: "13px 13px", borderRadius: "2px" }} />
                  </div>
                  <div style={{ fontSize: "8.5px", fontWeight: 800, color: "#111827", marginTop: "3px" }}>
                    VALIDASI RESMI
                  </div>
                  <div style={{ fontSize: "7.5px", color: "#6B7280" }}>
                    SHA-256: e82f...91a4
                  </div>
                </div>

                {/* 3. Tanda Tangan Pimpinan Pondok */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: "#4B5563" }}>Menyetujui,</div>
                  <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#111827" }}>Pimpinan Pondok Pesantren</div>
                  <div style={{ margin: "6px auto", width: "70px", height: "42px", border: "1px dashed #D97706", borderRadius: "6px", background: "#FFFBEB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "9px", color: "#92400E", fontWeight: 800 }}>STEMPEL RESMI</span>
                    <span style={{ fontSize: "8px", color: "#B45309" }}>PIMPINAN</span>
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 800, textDecoration: "underline" }}>
                    {currentTenant?.leader || "K.H. Hasan Basri"}
                  </div>
                  <div style={{ fontSize: "9.5px", color: "#6B7280" }}>Khadimul Ma'had</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
