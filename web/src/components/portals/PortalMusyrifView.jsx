import React, { useState } from "react";
import {
  INITIAL_STUDENTS,
  INITIAL_EWS_ALERTS,
  INITIAL_GATE_PASS,
  INITIAL_DORM_ROOMS,
} from "../../data/mockData";
import { playSoftClick, playSuccessChime, triggerHaptic } from "../../utils/audio";

export default function PortalMusyrifView({
  onTriggerLoader,
  onAuditLogAdd,
  currentUser,
  tenantDormTerm = "Asrama",
  currentTenant,
}) {
  const musyrifName = currentUser?.name || "Ustaz Farhan";
  const assignedDorm = currentUser?.assignedDorm || `${tenantDormTerm} Abu Bakar Ash-Shiddiq`;

  // Tab Navigasi Musyrif
  const [musyrifTab, setMusyrifTab] = useState("binaan"); // binaan, ews, gatepass, ronda

  // Data Santri Binaan per Asrama ini
  const [dormStudents] = useState(() => {
    return INITIAL_STUDENTS.filter(
      (s) =>
        s.dormBuilding === assignedDorm ||
        s.dormBuilding?.toLowerCase().includes("abu bakar") ||
        s.id === "santri-001" ||
        s.id === "santri-005"
    );
  });

  // Modal Cetak Rapor Bulanan Santri
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(INITIAL_STUDENTS[0]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Modal Slip Fisik Gate Pass (1 Lembar Kecil)
  const [selectedGatePassForPrint, setSelectedGatePassForPrint] = useState(INITIAL_GATE_PASS);
  const [isPhysicalSlipModalOpen, setIsPhysicalSlipModalOpen] = useState(false);

  // Ronda Malam (22:00 WIB) & Kebersihan Kamar
  const [dormRooms, setDormRooms] = useState(INITIAL_DORM_ROOMS);

  // EWS Sakit / Izin Asrama
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualFormType, setManualFormType] = useState("Sakit");
  const [manualStudentName, setManualStudentName] = useState("Ahmad Fauzan");
  const [manualRoomNumber, setManualRoomNumber] = useState("Kamar 03");
  const [manualFormNotes, setManualFormNotes] = useState(
    "Febris / demam 37.8°C ba'da dzuhur, istirahat di kamar asrama"
  );
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(2);
  const [dormRecords, setDormRecords] = useState(INITIAL_EWS_ALERTS);

  // Gate Pass Otorisasi Mandiri oleh Musyrif Asrama
  const [gatePassList, setGatePassList] = useState([INITIAL_GATE_PASS]);
  const [isGatePassModalOpen, setIsGatePassModalOpen] = useState(false);
  const [gatePassStudent, setGatePassStudent] = useState("Ahmad Fauzan");
  const [gatePassReason, setGatePassReason] = useState(
    "Izin Pulang: Acara Pernikahan Kakak Kandung di Bandung"
  );
  const [gatePassPicker, setGatePassPicker] = useState("Ir. H. Abdullah (Ayah Kandung)");
  const [gatePassNik, setGatePassNik] = useState("3206012809780003");

  // Modul Tahfidz (Ziyadah & Muraja'ah) State
  const [activeDormStudents, setActiveDormStudents] = useState(dormStudents);
  const [selectedTahfidzStudentId, setSelectedTahfidzStudentId] = useState(
    dormStudents[0]?.id || "santri-001"
  );
  const [tahfidzType, setTahfidzType] = useState("ziyadah"); // "ziyadah" | "murajaah"
  const [tahfidzSurah, setTahfidzSurah] = useState("Surah An-Naba'");
  const [tahfidzVerses, setTahfidzVerses] = useState("Ayat 1 - 25");
  const [tahfidzJuz, setTahfidzJuz] = useState("Juz 30");
  const [tahfidzGrade, setTahfidzGrade] = useState("Mutqin (Sangat Lancar)");
  const [tahfidzAddedJuz, setTahfidzAddedJuz] = useState("0.2");
  const [tahfidzNotes, setTahfidzNotes] = useState("Makharijul huruf & mad thabi'i sangat fasih");

  // Handler Buka Cetak Rapor Bulanan
  const handleOpenReportModal = (student) => {
    playSoftClick();
    setSelectedStudentForReport(student);
    setIsReportModalOpen(true);
  };

  // Handler Buka Slip Fisik Gate Pass
  const handleOpenPhysicalSlip = (pass) => {
    playSoftClick();
    setSelectedGatePassForPrint(pass);
    setIsPhysicalSlipModalOpen(true);
  };

  // Handler Verifikasi Kehadiran Jam 22:00 WIB
  const handleVerifyNightPresence = (roomId) => {
    playSoftClick();
    triggerHaptic([50]);
    setDormRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          playSuccessChime();
          onAuditLogAdd({
            user: `${musyrifName} (Musyrif)`,
            role: "Musyrif",
            action: "RONDA MALAM 22:00 TERVERIFIKASI",
            object: `${assignedDorm} · ${r.roomNumber}`,
            status: "LENGKAP",
            details: `Musyrif memverifikasi fisik santri jam 22:00 WIB di ${r.roomNumber} (${r.presentAtNight}/${r.capacity} santri hadir fisik).`,
          });
          return { ...r, isComplete: true };
        }
        return r;
      })
    );
  };

  // Handler Penilaian Kebersihan Kamar
  const handleUpdateCleanliness = (roomId, newRating, newScore) => {
    playSoftClick();
    setDormRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          playSuccessChime();
          onAuditLogAdd({
            user: `${musyrifName} (Musyrif)`,
            role: "Musyrif",
            action: "PENILAIAN KEBERSIHAN KAMAR",
            object: `${assignedDorm} · ${r.roomNumber}`,
            status: "NILAI_TERCATAT",
            details: `Skor kebersihan: ${newScore}/100 (${newRating}). Masuk kalkulasi kamar teladan mingguan.`,
          });
          return { ...r, cleanlinessScore: newScore, cleanlinessRating: newRating };
        }
        return r;
      })
    );
  };

  // Handler Simpan Setoran Hafalan Baru (Ziyadah) / Pengulangan (Muraja'ah)
  const handleSaveTahfidzRecord = (e) => {
    e.preventDefault();
    playSoftClick();
    triggerHaptic([60]);

    const targetStudent =
      activeDormStudents.find((s) => s.id === selectedTahfidzStudentId) ||
      activeDormStudents[0];

    onTriggerLoader(
      `Mencatat Setoran ${
        tahfidzType === "ziyadah" ? "Hafalan Baru (Ziyadah)" : "Pengulangan (Muraja'ah)"
      } untuk ${targetStudent?.name}...`,
      () => {
        playSuccessChime();
        const newRecord = {
          date: "Hari Ini (22 Okt)",
          surah: tahfidzSurah,
          verses: `${tahfidzVerses} (${tahfidzJuz})`,
          grade: tahfidzGrade,
          ustadz: `${musyrifName} (Musyrif)`,
          notes: tahfidzNotes,
        };

        const addedJuzVal = tahfidzType === "ziyadah" ? parseFloat(tahfidzAddedJuz || 0) : 0;
        const currentJuz = targetStudent?.tahfidzProgress?.totalJuz || 4.5;
        const targetWisuda = targetStudent?.tahfidzProgress?.targetWisuda || 6.0;
        const updatedTotalJuz = Math.min(
          targetWisuda,
          parseFloat((currentJuz + addedJuzVal).toFixed(2))
        );

        setActiveDormStudents((prev) =>
          prev.map((s) => {
            if (s.id === selectedTahfidzStudentId) {
              const currentProgress = s.tahfidzProgress || {
                totalJuz: 4.5,
                targetWisuda: 6.0,
                ziyadah: [],
                murajaah: [],
              };
              if (tahfidzType === "ziyadah") {
                return {
                  ...s,
                  tahfidzProgress: {
                    ...currentProgress,
                    totalJuz: updatedTotalJuz,
                    ziyadah: [newRecord, ...(currentProgress.ziyadah || [])],
                  },
                };
              } else {
                return {
                  ...s,
                  tahfidzProgress: {
                    ...currentProgress,
                    murajaah: [newRecord, ...(currentProgress.murajaah || [])],
                  },
                };
              }
            }
            return s;
          })
        );

        onAuditLogAdd({
          user: `${musyrifName} (Musyrif)`,
          role: "Musyrif",
          action: `SETORAN TAHFIDZ (${tahfidzType.toUpperCase()})`,
          object: `Santri: ${targetStudent?.name} (${tahfidzSurah} ${tahfidzVerses})`,
          status: tahfidzGrade.split(" ")[0].toUpperCase(),
          details: `Setoran ${
            tahfidzType === "ziyadah" ? "Ziyadah" : "Muraja'ah"
          } ${tahfidzSurah} (${tahfidzVerses}, ${tahfidzJuz}) predikat ${tahfidzGrade}. Total capaian: ${updatedTotalJuz}/${targetWisuda} Juz menuju Wisuda Tahfidz.`,
        });

        alert(
          `✅ Setoran ${
            tahfidzType === "ziyadah" ? "Ziyadah" : "Muraja'ah"
          } ananda ${targetStudent?.name} berhasil dicatat dengan predikat ${tahfidzGrade}!`
        );
      }
    );
  };

  // Musyrif Submit Catatan Sakit / Izin Tanpa QR (Seksi 13)
  const handleSubmitManualCondition = () => {
    playSoftClick();
    triggerHaptic([60]);
    setIsManualModalOpen(false);

    onTriggerLoader(
      `Mencatat Kondisi ${manualFormType.toUpperCase()} Santri ${manualStudentName} (Seksi 13 Tanpa QR)...`,
      () => {
        playSuccessChime();
        const newRecord = {
          id: "dorm-" + Date.now(),
          santriName: manualStudentName,
          nis: "2026070114",
          class: "Kelas 7-A",
          dormBuilding: assignedDorm,
          roomNumber: manualRoomNumber,
          conditionType: manualFormType,
          diagnosis: manualFormNotes,
          dateRecorded: "Hari Ini, Ba'da Dzuhur",
          officer: `${musyrifName} (Musyrif ${tenantDormTerm})`,
          status: manualFormType === "Sakit" ? "Istirahat Asrama" : "Izin Tercatat",
          severity: "Perlu Pantauan",
        };

        setDormRecords((prev) => [newRecord, ...prev]);

        onAuditLogAdd({
          user: `${musyrifName} (Musyrif)`,
          role: "Musyrif",
          action: `INPUT MANUAL SEKSI 13: ${manualFormType.toUpperCase()}`,
          object: `Santri: ${manualStudentName} (${assignedDorm} · ${manualRoomNumber})`,
          status: "TERCATAT",
          details: `Keterangan: "${manualFormNotes}". Masuk ke EWS asrama santri sakit/izin.`,
        });
      }
    );
  };

  // Musyrif Terbitkan Gate Pass Mandiri
  const handleIssueGatePassByMusyrif = (e) => {
    e.preventDefault();
    playSoftClick();
    triggerHaptic([60]);
    setIsGatePassModalOpen(false);

    onTriggerLoader(
      `Mengesahkan & Menerbitkan Gate Pass 24 Jam untuk ${gatePassStudent}...`,
      () => {
        playSuccessChime();
        const newPass = {
          id: "GP-" + Date.now().toString().slice(-8),
          santriId: "santri-001",
          studentName: gatePassStudent,
          class: "Kelas 7-A (Tahfidz Intensif)",
          dormBuilding: assignedDorm,
          roomNumber: "Kamar 03",
          photo:
            "https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80",
          reason: gatePassReason,
          authorizedPicker: gatePassPicker,
          pickerNik: gatePassNik,
          validityType: "Berlaku Seharian Penuh",
          validDate: "Kamis, 22 Oktober 2026",
          validTimeRange: "06:00 – 21:00 WIB",
          status: "AKTIF & RESMI (DISETUJUI MUSYRIF)",
          qrCodeString: `GP-${Date.now().toString().slice(-6)}-VALID`,
          issuedByRole: "Musyrif Asrama",
          approvalBy: `${musyrifName} (Musyrif ${assignedDorm})`,
          isUsed: false,
        };

        setGatePassList((prev) => [newPass, ...prev]);

        onAuditLogAdd({
          user: `${musyrifName} (Musyrif)`,
          role: "Musyrif",
          action: "OTORISASI GATE PASS MANDIRI",
          object: `Santri: ${gatePassStudent} (Penjemput: ${gatePassPicker})`,
          status: "DISETUJUI RESMI",
          details: `Musyrif ${assignedDorm} menyetujui izin keluar santri. Berlaku 24 jam langsung tanpa perlu menunggu Kepala Pengasuhan.`,
        });

        alert(
          `Gate Pass untuk ${gatePassStudent} berhasil disahkan oleh Musyrif. Berlaku seharian penuh di gerbang.`
        );
      }
    );
  };

  // Sync Antrean Offline SQLite ke Cloud Supabase (2-Detik)
  const handleSyncOfflineQueue = () => {
    playSoftClick();
    const count = offlineQueueCount > 0 ? offlineQueueCount : 2;
    onTriggerLoader(
      `Menyinkronkan ${count} Data Antrean Presensi Offline SQLite ke Supabase Cloud...`,
      () => {
        playSuccessChime();
        setOfflineQueueCount(0);
        onAuditLogAdd({
          user: `${musyrifName} (Musyrif)`,
          role: "Musyrif",
          action: "SINKRONISASI BATCH CLOUD",
          object: `${count} Antrean Data Asrama`,
          status: "TERSYNCHRONIZED",
          details:
            "Koneksi pulih. Seluruh antrean offline SQLite berhasil diunggah ke database utama Supabase.",
        });
      }
    );
  };

  const isNightRondaEnabled = currentTenant?.enableNightRonda ?? true;
  const isTahfidzEnabled = currentTenant?.enableTahfidzModule ?? true;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        maxWidth: "960px",
        margin: "0 auto",
      }}
    >
      {/* Header Musyrif Asrama */}
      <div
        style={{
          background: "linear-gradient(135deg, #06271E 0%, #0D4332 100%)",
          borderRadius: "20px",
          padding: "18px 22px",
          border: "1px solid rgba(232, 182, 90, 0.3)",
          color: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          boxShadow: "0 8px 24px rgba(6, 39, 30, 0.3)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🏠</span>
            <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#FFFFFF" }}>
              Portal {musyrifName}
            </h2>
            <span
              style={{
                background: "rgba(16, 185, 129, 0.2)",
                color: "#34D399",
                border: "1px solid #10B981",
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              Pembina {assignedDorm}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#FFE49A", marginTop: "3px" }}>
            Istilah Hunian Aktif: <strong>{tenantDormTerm}</strong> · Wilayah: {assignedDorm}
          </div>
        </div>

        {/* Tombol Otorisasi Gate Pass & Catat Sakit */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              playSoftClick();
              setIsGatePassModalOpen(true);
            }}
            style={{
              background: "var(--gradient-emerald)",
              color: "#FFFFFF",
              padding: "8px 14px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 3px 10px rgba(6, 95, 70, 0.35)",
            }}
          >
            <span>🎫</span>
            <span>Otorisasi Gate Pass Mandiri</span>
          </button>

          <button
            onClick={() => {
              playSoftClick();
              setIsManualModalOpen(true);
            }}
            style={{
              background: "var(--gradient-gold)",
              color: "#06271E",
              padding: "8px 14px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 3px 10px rgba(232, 182, 90, 0.35)",
            }}
          >
            <span>➕</span>
            <span>Catat Sakit (Seksi 13)</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigasi Fitur Musyrif Asrama */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          background: "#FFFFFF",
          padding: "6px",
          borderRadius: "14px",
          border: "1px solid #E2EFE9",
          overflowX: "auto",
        }}
      >
        {[
          { id: "binaan", label: "Santri Binaan & Rapor Bulanan", icon: "📄" },
          { id: "ews", label: "EWS Sakit & Izin", icon: "🚨" },
          { id: "gatepass", label: "Gate Pass & Slip Fisik", icon: "🎫" },
          ...(isNightRondaEnabled
            ? [{ id: "ronda", label: "Ronda Malam (22:00) & Kebersihan", icon: "🌙" }]
            : []),
          ...(isTahfidzEnabled
            ? [{ id: "tahfidz", label: "Setoran Tahfidz (Ziyadah & Muraja'ah)", icon: "📖" }]
            : []),
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playSoftClick();
              setMusyrifTab(tab.id);
            }}
            style={{
              flex: "1 1 auto",
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: musyrifTab === tab.id ? 800 : 600,
              background: musyrifTab === tab.id ? "var(--gradient-emerald)" : "transparent",
              color: musyrifTab === tab.id ? "#FFFFFF" : "#5B7A70",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* -------------------------------------------------------------
          TAB 1: SANTRI BINAAN ASRAMA & CETAK RAPOR BULANAN
         ------------------------------------------------------------- */}
      {musyrifTab === "binaan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              padding: "18px 20px",
              border: "1px solid #E2EFE9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#06271E" }}>
                📄 Rapor Bulanan Santri Binaan ({assignedDorm})
              </h3>
              <p style={{ fontSize: "11.5px", color: "#5B7A70", marginTop: "2px" }}>
                Format PDF rekap bulanan siap cetak/kirim ke wali santri: evaluasi 3 pilar (Disiplin, Adab & Ubudiyyah) khusus binaan asrama ini.
              </p>
            </div>
            <span style={{ background: "#D1FAE5", color: "#065F46", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>
              {dormStudents.length} Santri Binaan Aktif
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {dormStudents.map((st) => (
              <div
                key={st.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: "16px",
                  padding: "16px 18px",
                  border: "1px solid #E2EFE9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  boxShadow: "0 2px 8px rgba(6,39,30,0.03)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src={st.photo}
                    alt={st.name}
                    style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                        {st.name}
                      </span>
                      <span
                        style={{
                          background: "#E2EFE9",
                          color: "#06271E",
                          padding: "2px 6px",
                          borderRadius: "6px",
                          fontSize: "10.5px",
                          fontWeight: 700,
                        }}
                      >
                        {st.roomNumber}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#5B7A70", marginTop: "2px" }}>
                      NIS: {st.nis} · {st.class} · Wali: {st.guardianName}
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px", fontSize: "10.5px" }}>
                      <span style={{ color: "#059669", fontWeight: 700 }}>
                        ⭐ Skor Adab: {st.scoreAdab}/100
                      </span>
                      <span style={{ color: "#3B82F6", fontWeight: 700 }}>
                        🕌 Ubudiyyah: 96% Tepat Waktu
                      </span>
                      <span style={{ color: st.pointsViolation > 0 ? "#DC2626" : "#059669", fontWeight: 700 }}>
                        ⚠️ Pelanggaran: {st.pointsViolation} Poin
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleOpenReportModal(st)}
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
                    <span>📄</span>
                    <span>Cetak Rapor Bulanan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: EWS SANTRI SAKIT & IZIN (SEKSI 13)
         ------------------------------------------------------------- */}
      {musyrifTab === "ews" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Offline Mode Banner */}
          {(isOfflineMode || offlineQueueCount > 0) && (
            <div
              style={{
                background: "#FFFBEB",
                border: "1px solid #FCD34D",
                borderRadius: "16px",
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400E" }}>
                  💾 Mode Offline SQLite: {offlineQueueCount} Antrean Presensi Tersimpan Lokal
                </div>
                <div style={{ fontSize: "11px", color: "#B45309", marginTop: "2px" }}>
                  Data presensi {assignedDorm} aman tersimpan di storage lokal perangkat saat jaringan minim.
                </div>
              </div>

              <button
                onClick={handleSyncOfflineQueue}
                style={{
                  background: "var(--gradient-emerald)",
                  color: "#FFFFFF",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                🔄 Sinkronisasi Batch Cloud (2 Detik)
              </button>
            </div>
          )}

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "20px",
              border: "1px solid #E2EFE9",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#06271E" }}>
                  🚨 Santri {assignedDorm} Sedang Sakit / Izin (EWS)
                </h3>
                <p style={{ fontSize: "11px", color: "#5B7A70" }}>
                  Nama {tenantDormTerm} dan Nomor Kamar terpisah untuk akurasi pencatatan
                </p>
              </div>
              <span style={{ fontSize: "11px", color: "#B42318", fontWeight: 700 }}>
                {dormRecords.length} Santri Dalam Pantauan
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {dormRecords.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: item.conditionType === "Sakit" ? "#FEF2F2" : "#F3F4F6",
                    border: item.conditionType === "Sakit" ? "1px solid #FECACA" : "1px solid #E5E7EB",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          background: item.conditionType === "Sakit" ? "#DC2626" : "#6D28D9",
                          color: "#FFFFFF",
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "2px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {item.conditionType.toUpperCase()}
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                        {item.santriName} ({item.class})
                      </span>
                    </div>

                    <div style={{ fontSize: "11.5px", color: "#047857", fontWeight: 700, marginTop: "3px" }}>
                      🏢 {item.dormBuilding} · 🚪 {item.roomNumber}
                    </div>

                    <div style={{ fontSize: "12px", color: "#374151", marginTop: "3px" }}>
                      Keluhan / Alasan: "{item.diagnosis}"
                    </div>
                    <div style={{ fontSize: "10px", color: "#8AA49B", marginTop: "2px" }}>
                      Dicatat: {item.dateRecorded} · Oleh {item.officer}
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: item.status.includes("Istirahat") ? "#FEE2E2" : "#D1FAE5",
                        color: item.status.includes("Istirahat") ? "#B42318" : "#065F46",
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: GATE PASS & SURAT JALAN FISIK (1 LEMBAR KECIL)
         ------------------------------------------------------------- */}
      {musyrifTab === "gatepass" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              padding: "18px 20px",
              border: "1px solid #E2EFE9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#06271E" }}>
                🎫 Otorisasi Gate Pass & Cetak Surat Jalan Resmi Fisik
              </h3>
              <p style={{ fontSize: "11.5px", color: "#5B7A70", marginTop: "2px" }}>
                Musyrif berhak mengesahkan izin keluar 24 jam dan mencetak slip fisik 1 lembar kecil untuk santri yang dijemput.
              </p>
            </div>

            <button
              onClick={() => setIsGatePassModalOpen(true)}
              style={{
                background: "var(--gradient-emerald)",
                color: "#FFFFFF",
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "11.5px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
              }}
            >
              ➕ Terbitkan Gate Pass Baru
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {gatePassList.map((pass) => (
              <div
                key={pass.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: "16px",
                  padding: "16px 18px",
                  border: "1px solid #D1FAE5",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                      {pass.studentName}
                    </span>
                    <span style={{ background: "#D1FAE5", color: "#065F46", padding: "2px 8px", borderRadius: "6px", fontSize: "10.5px", fontWeight: 800 }}>
                      {pass.id}
                    </span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#5B7A70", marginTop: "2px" }}>
                    🏢 {pass.dormBuilding} ({pass.roomNumber}) · Keperluan: "{pass.reason}"
                  </div>
                  <div style={{ fontSize: "11px", color: "#047857", fontWeight: 700, marginTop: "2px" }}>
                    Penjemput: {pass.authorizedPicker} (NIK: {pass.pickerNik}) · Berlaku: {pass.validTimeRange}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleOpenPhysicalSlip(pass)}
                    style={{
                      background: "rgba(232, 182, 90, 0.2)",
                      border: "1px solid #FCD34D",
                      color: "#92400E",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      fontSize: "11.5px",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>🖨️</span>
                    <span>Cetak Slip Fisik (1 Lembar Kecil)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 4: RONDA MALAM (22:00 WIB) & PENILAIAN KEBERSIHAN KAMAR
         ------------------------------------------------------------- */}
      {musyrifTab === "ronda" && isNightRondaEnabled && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              padding: "18px 20px",
              border: "1px solid #E2EFE9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "18px" }}>🌙</span>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#06271E" }}>
                  Ronda Malam Cek Fisik (22:00 WIB) & Kebersihan Kamar
                </h3>
              </div>
              <p style={{ fontSize: "11.5px", color: "#5B7A70", marginTop: "2px" }}>
                Cek keberadaan fisik santri di tiap kamar asrama pada jam malam dan nilai kebersihan harian untuk pemilihan Kamar Teladan Mingguan.
              </p>
            </div>
            <span style={{ background: "#FEF3C7", color: "#92400E", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>
              ⏰ Target Cek: Pukul 22:00 WIB
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            {dormRooms.map((room) => {
              const isBest = room.cleanlinessScore >= 95;
              return (
                <div
                  key={room.id}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "16px",
                    padding: "16px 18px",
                    border: isBest ? "2px solid #10B981" : "1px solid #E2EFE9",
                    boxShadow: isBest ? "0 4px 15px rgba(16, 185, 129, 0.12)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#06271E" }}>
                      🚪 {room.roomNumber}
                    </div>
                    {isBest && (
                      <span style={{ background: "#D1FAE5", color: "#065F46", padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 800 }}>
                        🏆 Kandidat Kamar Teladan
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: "11.5px", color: "#5B7A70", marginBottom: "8px" }}>
                    Kapasitas: {room.capacity} Santri · Kehadiran Malam: <strong>{room.presentAtNight}/{room.capacity} Santri</strong>
                  </div>

                  {/* Kehadiran Fisik 22:00 */}
                  <div style={{ background: "#F4FBF7", padding: "8px 10px", borderRadius: "10px", border: "1px solid #D1FAE5", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#065F46" }}>
                      {room.isComplete ? "✅ Santri Lengkap di Kamar" : "⚠️ Ada Santri Belum Masuk / Sakit"}
                    </div>
                    <button
                      onClick={() => handleVerifyNightPresence(room.id)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: room.isComplete ? "#059669" : "#D97706",
                        color: "#FFFFFF",
                        border: "none",
                        fontSize: "10px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {room.isComplete ? "✓ Terverifikasi" : "Verifikasi 22:00"}
                    </button>
                  </div>

                  {/* Penilaian Kebersihan Kamar */}
                  <div style={{ borderTop: "1px dashed #E2EFE9", paddingTop: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Kebersihan Kamar:</span>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669" }}>{room.cleanlinessScore}/100</span>
                    </div>

                    <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                      {[
                        { stars: 5, score: 96, label: "Bintang 5 (Sangat Bersih)" },
                        { stars: 4, score: 88, label: "Bintang 4 (Bersih)" },
                        { stars: 3, score: 80, label: "Bintang 3 (Cukup)" },
                      ].map((starOpt) => (
                        <button
                          key={starOpt.stars}
                          onClick={() => handleUpdateCleanliness(room.id, starOpt.label, starOpt.score)}
                          style={{
                            flex: 1,
                            padding: "4px 6px",
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontWeight: room.cleanlinessScore === starOpt.score ? 800 : 500,
                            background: room.cleanlinessScore === starOpt.score ? "#D1FAE5" : "#F3F4F6",
                            color: room.cleanlinessScore === starOpt.score ? "#065F46" : "#6B7280",
                            border: "1px solid #E5E7EB",
                            cursor: "pointer",
                          }}
                        >
                          {"⭐".repeat(starOpt.stars)}
                        </button>
                      ))}
                    </div>

                    <div style={{ fontSize: "10.5px", color: "#6B7280", fontStyle: "italic" }}>
                      "{room.notes}"
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 5: MUTABA'AH TAHFIDZ (INPUT ZIYADAH, MURAJA'AH & TARGET WISUDA)
          (Fitur Opsional Ponpes - Diaktifkan oleh Admin Ponpes)
         ------------------------------------------------------------- */}
      {musyrifTab === "tahfidz" && isTahfidzEnabled && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Header & Target Wisuda Tahfidz Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #06271E 0%, #0D4332 100%)",
              borderRadius: "20px",
              padding: "20px 24px",
              border: "1px solid rgba(232, 182, 90, 0.35)",
              color: "#FFFFFF",
              boxShadow: "0 8px 24px rgba(6, 39, 30, 0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px" }}>📖</span>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>
                    Mutaba'ah Setoran Tahfidz (Ziyadah & Muraja'ah)
                  </h3>
                </div>
                <p style={{ fontSize: "12px", color: "#FFE49A", marginTop: "3px" }}>
                  Pencatatan setoran santri binaan {assignedDorm} per surat, ayat, juz & penilaian kelancaran (Mutqin/Jayyid).
                </p>
              </div>

              {/* Santri Selector Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: "#A7F3D0" }}>Santri Binaan:</span>
                <select
                  value={selectedTahfidzStudentId}
                  onChange={(e) => {
                    playSoftClick();
                    setSelectedTahfidzStudentId(e.target.value);
                  }}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(232, 182, 90, 0.4)",
                    color: "#FFFFFF",
                    padding: "6px 12px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {activeDormStudents.map((st) => (
                    <option key={st.id} value={st.id} style={{ background: "#06271E", color: "#FFFFFF" }}>
                      {st.name} ({st.roomNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Wisuda Progress Bar Santri Terpilih */}
            {(() => {
              const activeSt = activeDormStudents.find((s) => s.id === selectedTahfidzStudentId) || activeDormStudents[0];
              const totalJuz = activeSt?.tahfidzProgress?.totalJuz || 4.5;
              const targetWisuda = activeSt?.tahfidzProgress?.targetWisuda || 6.0;
              const percent = Math.min(100, Math.round((totalJuz / targetWisuda) * 100));

              return (
                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "14px", padding: "14px 18px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ fontSize: "12px", color: "#A7F3D0" }}>
                      🎓 Target Kelulusan Wisuda Tahfidz Ananda <strong>{activeSt?.name}</strong>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 900, color: "#FFE49A" }}>
                      {totalJuz} <span style={{ fontSize: "11px", fontWeight: 600 }}>/ {targetWisuda} Juz ({percent}%)</span>
                    </div>
                  </div>

                  <div style={{ width: "100%", height: "10px", background: "rgba(255,255,255,0.15)", borderRadius: "10px", overflow: "hidden", marginBottom: "6px" }}>
                    <div
                      style={{
                        width: `${percent}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #10B981 0%, #F59E0B 100%)",
                        borderRadius: "10px",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "#8AA49B" }}>
                    <span>Syarat Minimal Wisuda Tahfidz: {targetWisuda} Juz Mutqin</span>
                    <span style={{ color: percent >= 100 ? "#10B981" : "#FFE49A", fontWeight: 700 }}>
                      {percent >= 100 ? "🎉 Syarat Wisuda Terpenuhi!" : `Sisa ${parseFloat((targetWisuda - totalJuz).toFixed(2))} Juz Menuju Wisuda`}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Form Input Setoran Baru (Ziyadah) / Pengulangan (Muraja'ah) */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              padding: "20px 22px",
              border: "1px solid #E2EFE9",
              boxShadow: "0 2px 10px rgba(6,39,30,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #E2EFE9" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>✍️</span>
                <span>Form Input Setoran Hafalan Santri</span>
              </div>
              <span style={{ fontSize: "11px", color: "#5B7A70" }}>
                Disinkronkan langsung ke Wali Santri & Rapor Asrama
              </span>
            </div>

            <form onSubmit={handleSaveTahfidzRecord} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Jenis Setoran Toggle */}
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#06271E", display: "block", marginBottom: "6px" }}>
                  Jenis Program Setoran:
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      playSoftClick();
                      setTahfidzType("ziyadah");
                    }}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: tahfidzType === "ziyadah" ? "2px solid #059669" : "1px solid #E2EFE9",
                      background: tahfidzType === "ziyadah" ? "#ECFDF5" : "#F9FAFB",
                      color: tahfidzType === "ziyadah" ? "#065F46" : "#4B5563",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>🟢</span>
                    <span>Ziyadah (Hafalan Baru)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSoftClick();
                      setTahfidzType("murajaah");
                    }}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: tahfidzType === "murajaah" ? "2px solid #D97706" : "1px solid #E2EFE9",
                      background: tahfidzType === "murajaah" ? "#FFFBEB" : "#F9FAFB",
                      color: tahfidzType === "murajaah" ? "#92400E" : "#4B5563",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>🔄</span>
                    <span>Muraja'ah (Pengulangan)</span>
                  </button>
                </div>
              </div>

              {/* Baris 1: Nama Surah & Rentang Ayat & Juz */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#06271E", display: "block", marginBottom: "4px" }}>
                    Surah Al-Qur'an:
                  </label>
                  <input
                    type="text"
                    value={tahfidzSurah}
                    onChange={(e) => setTahfidzSurah(e.target.value)}
                    placeholder="Contoh: Surah An-Naba', Al-Mulk, Al-Baqarah"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      fontSize: "12px",
                      color: "#06271E",
                      outline: "none",
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#06271E", display: "block", marginBottom: "4px" }}>
                    Rentang Ayat:
                  </label>
                  <input
                    type="text"
                    value={tahfidzVerses}
                    onChange={(e) => setTahfidzVerses(e.target.value)}
                    placeholder="Contoh: Ayat 1 - 25"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      fontSize: "12px",
                      color: "#06271E",
                      outline: "none",
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#06271E", display: "block", marginBottom: "4px" }}>
                    Juz:
                  </label>
                  <select
                    value={tahfidzJuz}
                    onChange={(e) => setTahfidzJuz(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      fontSize: "12px",
                      color: "#06271E",
                      outline: "none",
                      background: "#FFFFFF",
                    }}
                  >
                    {[...Array(30)].map((_, i) => (
                      <option key={i + 1} value={`Juz ${i + 1}`}>
                        Juz {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Baris 2: Penilaian Kelancaran (Mutqin/Jayyid/Maqbul) */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#06271E", display: "block", marginBottom: "4px" }}>
                  Penilaian Kelancaran (Fashahah & Tajwid):
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                  {[
                    { label: "Mutqin (Sangat Lancar)", desc: "Tajwid sempurna, tanpa salah", color: "#065F46", bg: "#D1FAE5" },
                    { label: "Jayyid Jiddan (Lancar)", desc: "1-2 koreksi kecil", color: "#1E40AF", bg: "#DBEAFE" },
                    { label: "Jayyid (Cukup)", desc: "Masih ada keraguan", color: "#92400E", bg: "#FEF3C7" },
                    { label: "Maqbul (Ulang)", desc: "Wajib setoran ulang", color: "#991B1B", bg: "#FEE2E2" },
                  ].map((gradeOpt) => (
                    <button
                      key={gradeOpt.label}
                      type="button"
                      onClick={() => {
                        playSoftClick();
                        setTahfidzGrade(gradeOpt.label);
                      }}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "10px",
                        border: tahfidzGrade === gradeOpt.label ? `2px solid ${gradeOpt.color}` : "1px solid #E2EFE9",
                        background: tahfidzGrade === gradeOpt.label ? gradeOpt.bg : "#F9FAFB",
                        color: tahfidzGrade === gradeOpt.label ? gradeOpt.color : "#6B7280",
                        fontSize: "11px",
                        fontWeight: tahfidzGrade === gradeOpt.label ? 800 : 600,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div>{gradeOpt.label.split(" ")[0]}</div>
                      <div style={{ fontSize: "9px", opacity: 0.8 }}>{gradeOpt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Baris 3: Tambahan Capaian Juz & Catatan */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                {tahfidzType === "ziyadah" && (
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#06271E", display: "block", marginBottom: "4px" }}>
                      Tambah Progres Capaian Juz (+):
                    </label>
                    <select
                      value={tahfidzAddedJuz}
                      onChange={(e) => setTahfidzAddedJuz(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: "1px solid #CBD5E1",
                        fontSize: "12px",
                        color: "#06271E",
                        outline: "none",
                        background: "#FFFFFF",
                      }}
                    >
                      <option value="0.05">+0.05 Juz (1/2 Lembar)</option>
                      <option value="0.1">+0.10 Juz (1 Lembar / 2 Halaman)</option>
                      <option value="0.2">+0.20 Juz (1 Maqra / 1/4 Juz)</option>
                      <option value="0.5">+0.50 Juz (1/2 Juz)</option>
                      <option value="1.0">+1.00 Juz (1 Juz Penuh)</option>
                    </select>
                  </div>
                )}

                <div style={{ gridColumn: tahfidzType === "ziyadah" ? "auto" : "1 / -1" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#06271E", display: "block", marginBottom: "4px" }}>
                    Catatan Pembimbing / Musyrif:
                  </label>
                  <input
                    type="text"
                    value={tahfidzNotes}
                    onChange={(e) => setTahfidzNotes(e.target.value)}
                    placeholder="Contoh: Makharijul huruf rapi, perhatikan ghunnah nun bertasydid"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      fontSize: "12px",
                      color: "#06271E",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                <button
                  type="submit"
                  style={{
                    background: "var(--gradient-emerald)",
                    color: "#FFFFFF",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 800,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(6, 95, 70, 0.3)",
                  }}
                >
                  <span>💾</span>
                  <span>Simpan Setoran Hafalan Santri</span>
                </button>
              </div>
            </form>
          </div>

          {/* Riwayat Setoran Terkini Santri Terpilih */}
          {(() => {
            const activeSt = activeDormStudents.find((s) => s.id === selectedTahfidzStudentId) || activeDormStudents[0];
            const ziyadahList = activeSt?.tahfidzProgress?.ziyadah || [];
            const murajaahList = activeSt?.tahfidzProgress?.murajaah || [];

            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
                {/* Kolom Riwayat Ziyadah */}
                <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "16px", border: "1px solid #D1FAE5" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#065F46" }}>
                      🟢 Riwayat Ziyadah ({activeSt?.name})
                    </span>
                    <span style={{ fontSize: "10px", color: "#5B7A70" }}>{ziyadahList.length} Setoran</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {ziyadahList.map((item, idx) => (
                      <div key={idx} style={{ background: "#F4FBF7", borderRadius: "10px", padding: "8px 10px", border: "1px solid #E2EFE9" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: 800, color: "#06271E" }}>{item.surah}</span>
                          <span style={{ background: "#D1FAE5", color: "#065F46", padding: "1px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: 800 }}>
                            {item.grade}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#047857", fontWeight: 600, marginTop: "2px" }}>
                          {item.verses}
                        </div>
                        <div style={{ fontSize: "9.5px", color: "#8AA49B", marginTop: "2px" }}>
                          {item.date} · Oleh {item.ustadz}
                        </div>
                        {item.notes && (
                          <div style={{ fontSize: "9.5px", color: "#065F46", fontStyle: "italic", marginTop: "2px" }}>
                            "{item.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kolom Riwayat Muraja'ah */}
                <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "16px", border: "1px solid #FEF3C7" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#92400E" }}>
                      🔄 Riwayat Muraja'ah ({activeSt?.name})
                    </span>
                    <span style={{ fontSize: "10px", color: "#5B7A70" }}>{murajaahList.length} Pengulangan</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {murajaahList.map((item, idx) => (
                      <div key={idx} style={{ background: "#FFFBEB", borderRadius: "10px", padding: "8px 10px", border: "1px solid #FEF3C7" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: 800, color: "#06271E" }}>{item.surah}</span>
                          <span style={{ background: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: 800 }}>
                            {item.grade}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#92400E", fontWeight: 600, marginTop: "2px" }}>
                          {item.verses}
                        </div>
                        <div style={{ fontSize: "9.5px", color: "#8AA49B", marginTop: "2px" }}>
                          {item.date} · Oleh {item.ustadz}
                        </div>
                        {item.notes && (
                          <div style={{ fontSize: "9.5px", color: "#92400E", fontStyle: "italic", marginTop: "2px" }}>
                            "{item.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL A: PRATINJAU & CETAK RAPOR BULANAN SANTRI (PDF)
          (Disiplin, Adab & Ubudiyyah)
         ------------------------------------------------------------- */}
      {isReportModalOpen && (
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
              maxWidth: "640px",
              maxHeight: "92vh",
              overflowY: "auto",
              color: "#06271E",
              boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* Action Bar Modal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #E2EFE9" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                📄 Draf Rapor Bulanan Siap Cetak (Disiplin, Adab & Ubudiyyah)
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    playSuccessChime();
                    onAuditLogAdd({
                      user: `${musyrifName} (Musyrif)`,
                      role: "Musyrif",
                      action: "CETAK RAPOR BULANAN SANTRI",
                      object: `Santri: ${selectedStudentForReport?.name} (${selectedStudentForReport?.nis})`,
                      status: "DICETAK",
                      details: `Musyrif mencetak rapor evaluasi bulanan disiplin, adab & ubudiyyah periode Oktober 2026.`,
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
                  <span>🖨️</span>
                  <span>Cetak / Print PDF</span>
                </button>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  style={{ background: "#F3F4F6", border: "none", borderRadius: "8px", padding: "7px 12px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                >
                  ✕ Tutup
                </button>
              </div>
            </div>

            {/* LEMBAR RAPOR BULANAN RESMI */}
            <div
              id="monthly-report-print-area"
              style={{
                background: "#FFFFFF",
                border: "2px solid #06271E",
                borderRadius: "14px",
                padding: "22px 20px",
                fontFamily: "'Times New Roman', Times, serif",
                color: "#111827",
              }}
            >
              {/* Kop Pesantren */}
              <div style={{ textAlign: "center", borderBottom: "3px double #06271E", paddingBottom: "10px", marginBottom: "14px" }}>
                <div style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>
                  {currentTenant?.name || "PONDOK PESANTREN DARUSSALAM RAJAPOLAH"}
                </div>
                <div style={{ fontSize: "11px", fontStyle: "italic", color: "#374151" }}>
                  BIRO PENGASUHAN SANTRI · KESEKRETARIATAN MUSYRIF {assignedDorm.toUpperCase()}
                </div>
                <div style={{ fontSize: "9.5px", color: "#4B5563", marginTop: "2px" }}>
                  Tahun Ajaran 2026/2027 · Evaluasi Bulanan Periode: Oktober 2026 M / 1448 H
                </div>
              </div>

              {/* Judul Dokumen */}
              <div style={{ textAlign: "center", marginBottom: "14px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, textDecoration: "underline", textTransform: "uppercase" }}>
                  RAPOR EVALUASI BULANAN SANTRI
                </div>
                <div style={{ fontSize: "10.5px", color: "#374151" }}>
                  Rekapitulasi 3 Pilar: Kedisiplinan, Adab & Ubudiyyah Berjamaah
                </div>
              </div>

              {/* Data Santri */}
              <div style={{ background: "#F9FAFB", border: "1px solid #D1D5DB", borderRadius: "8px", padding: "8px 12px", marginBottom: "14px", fontSize: "11.5px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "35%", fontWeight: 700, padding: "2px 0" }}>Nama Santri</td>
                      <td style={{ width: "4%" }}>:</td>
                      <td style={{ fontWeight: 800 }}>{selectedStudentForReport?.name}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, padding: "2px 0" }}>Nomor Induk (NIS)</td>
                      <td>:</td>
                      <td>{selectedStudentForReport?.nis}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, padding: "2px 0" }}>Kelas / Kamar</td>
                      <td>:</td>
                      <td>{selectedStudentForReport?.class} · {selectedStudentForReport?.roomNumber} ({assignedDorm})</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, padding: "2px 0" }}>Musyrif Pembina</td>
                      <td>:</td>
                      <td>{musyrifName}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rekapitulasi 3 Pilar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px", fontSize: "11px" }}>
                {/* 1. Pilar Disiplin */}
                <div style={{ border: "1px solid #D1D5DB", borderRadius: "8px", padding: "8px 12px", background: "#F4FBF7" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 800, color: "#065F46" }}>1. PILAR KEDISIPLINAN ASRAMA & KBM</span>
                    <span style={{ fontWeight: 800, background: "#D1FAE5", padding: "2px 6px", borderRadius: "4px", color: "#065F46" }}>Predikat: A (Sangat Tertib)</span>
                  </div>
                  <div style={{ color: "#374151" }}>
                    Tingkat Kehadiran KBM: <strong>94.2%</strong> · Izin Gate Pass: <strong>1x Resmi</strong> · Kepatuhan Jam Malam 22:00: <strong>100% Hadir</strong> · Poin Pelanggaran: <strong>{selectedStudentForReport?.pointsViolation} Poin</strong>.
                  </div>
                </div>

                {/* 2. Pilar Adab */}
                <div style={{ border: "1px solid #D1D5DB", borderRadius: "8px", padding: "8px 12px", background: "#FFFBEB" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 800, color: "#92400E" }}>2. PILAR ADAB & AKHLAKUL KARIMAH</span>
                    <span style={{ fontWeight: 800, background: "#FEF3C7", padding: "2px 6px", borderRadius: "4px", color: "#92400E" }}>Skor: {selectedStudentForReport?.scoreAdab}/100 (Mumtaz)</span>
                  </div>
                  <div style={{ color: "#374151" }}>
                    Poin Kebaikan: <strong>+{selectedStudentForReport?.pointsGood} Poin</strong> · Poin Pelanggaran: <strong>-{selectedStudentForReport?.pointsViolation} Poin</strong> · Status Peringatan: <strong>{selectedStudentForReport?.spStatus || "Aman"}</strong>. Santri bertutur kata sopan di lingkungan asrama.
                  </div>
                </div>

                {/* 3. Pilar Ubudiyyah */}
                <div style={{ border: "1px solid #D1D5DB", borderRadius: "8px", padding: "8px 12px", background: "#EFF6FF" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 800, color: "#1E40AF" }}>3. PILAR UBUDIYYAH & SALAT BERJAMAAH</span>
                    <span style={{ fontWeight: 800, background: "#DBEAFE", padding: "2px 6px", borderRadius: "4px", color: "#1E40AF" }}>Predikat: Jayyid Jiddan</span>
                  </div>
                  <div style={{ color: "#374151" }}>
                    Presensi Salat Subuh: <strong>96% Tepat Waktu (Masbuk 4%)</strong> · Salat Dzuhur s.d. Isya di Masjid Jami': <strong>Istiqomah di shaf awal</strong>.
                  </div>
                </div>
              </div>

              {/* Catatan Musyrif */}
              <div style={{ fontSize: "11px", border: "1px dashed #9CA3AF", borderRadius: "8px", padding: "8px 10px", marginBottom: "14px", background: "#F9FAFB" }}>
                <strong>Catatan Pembinaan Musyrif Asrama:</strong>
                <p style={{ margin: "2px 0 0 0", fontStyle: "italic", color: "#374151" }}>
                  "Alhamdulillah ananda istiqomah menjaga salat di shaf awal masjid, tertib saat piket kebersihan kamar, serta rukun dengan rekan sekamar. Pertahankan semangat belajar & adab terpuji."
                </p>
              </div>

              {/* Kolom Tanda Tangan 3 Pihak */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", textAlign: "center", paddingTop: "8px", borderTop: "1px solid #D1D5DB", fontSize: "10px" }}>
                <div>
                  <div style={{ color: "#4B5563" }}>Wali Santri,</div>
                  <div style={{ height: "35px" }} />
                  <div style={{ fontWeight: 800, textDecoration: "underline" }}>{selectedStudentForReport?.guardianName?.split("&")[0] || "Orang Tua / Wali"}</div>
                  <div style={{ color: "#6B7280" }}>Wali Sah</div>
                </div>

                <div>
                  <div style={{ color: "#4B5563" }}>Musyrif Pembina {tenantDormTerm},</div>
                  <div style={{ margin: "4px auto", width: "60px", height: "32px", border: "1px dashed #059669", borderRadius: "4px", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "#065F46", fontWeight: 800 }}>
                    TERVALIDASI
                  </div>
                  <div style={{ fontWeight: 800, textDecoration: "underline" }}>{musyrifName}</div>
                  <div style={{ color: "#6B7280" }}>Musyrif {assignedDorm}</div>
                </div>

                <div>
                  <div style={{ color: "#4B5563" }}>Mengetahui,</div>
                  <div style={{ margin: "4px auto", width: "60px", height: "32px", border: "1px dashed #D97706", borderRadius: "4px", background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "#92400E", fontWeight: 800 }}>
                    PENGASUHAN
                  </div>
                  <div style={{ fontWeight: 800, textDecoration: "underline" }}>K.H. Asep Ridwan, Lc.</div>
                  <div style={{ color: "#6B7280" }}>Kepala Pengasuhan Pondok</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL B: SURAT JALAN / GATE PASS RESMI FISIK (1 LEMBAR KECIL)
         ------------------------------------------------------------- */}
      {isPhysicalSlipModalOpen && (
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
          }}
        >
          <div
            className="fade-in-up"
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              padding: "20px 22px",
              width: "100%",
              maxWidth: "400px",
              color: "#06271E",
              boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #E2EFE9" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#06271E" }}>
                🖨️ Slip Fisik Gate Pass (1 Lembar Kecil)
              </div>
              <button
                onClick={() => setIsPhysicalSlipModalOpen(false)}
                style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* SLIP SURAT JALAN FISIK UKURAN KECIL */}
            <div
              id="gatepass-slip-print-area"
              style={{
                background: "#FFFFFF",
                border: "2px dashed #06271E",
                borderRadius: "12px",
                padding: "16px 14px",
                fontFamily: "'Courier New', Courier, monospace",
                color: "#111827",
                fontSize: "11px",
              }}
            >
              {/* Header Mini Kop */}
              <div style={{ textAlign: "center", borderBottom: "1px solid #000", paddingBottom: "6px", marginBottom: "8px" }}>
                <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "1px" }}>
                  {currentTenant?.shortName || "PP. DARUSSALAM RAJAPOLAH"}
                </div>
                <div style={{ fontSize: "10px", fontWeight: 700, textDecoration: "underline", marginTop: "2px" }}>
                  SLIP RESMI SURAT JALAN KELUAR PONDOK
                </div>
                <div style={{ fontSize: "9px", color: "#4B5563" }}>
                  ID: {selectedGatePassForPrint.id} · Tgl: {selectedGatePassForPrint.validDate}
                </div>
              </div>

              {/* Data Detail Slip */}
              <div style={{ lineHeight: "1.4", marginBottom: "8px" }}>
                <div><strong>Santri</strong> : {selectedGatePassForPrint.studentName}</div>
                <div><strong>Kamar</strong>  : {assignedDorm} · {selectedGatePassForPrint.roomNumber || 'Kamar 03'}</div>
                <div><strong>Alasan</strong> : {selectedGatePassForPrint.reason}</div>
                <div><strong>Jemput</strong> : {selectedGatePassForPrint.authorizedPicker}</div>
                <div><strong>NIK</strong>    : {selectedGatePassForPrint.pickerNik}</div>
                <div><strong>Waktu</strong>  : {selectedGatePassForPrint.validTimeRange} (Wajib Tepat)</div>
                <div><strong>Otorisasi</strong>: {musyrifName} (Musyrif Asrama)</div>
              </div>

              {/* Box QR & Validasi Satpam */}
              <div style={{ border: "1px solid #000", padding: "6px 8px", borderRadius: "6px", textAlign: "center", background: "#F9FAFB", marginBottom: "8px" }}>
                <div style={{ fontWeight: 800, fontSize: "10px", color: "#065F46" }}>
                  STATUS: SAH & DISETUJUI MUSYRIF
                </div>
                <div style={{ fontSize: "9px", color: "#374151", marginTop: "2px" }}>
                  Token QR: {selectedGatePassForPrint.qrCodeString}
                </div>
              </div>

              {/* Instruksi Penting */}
              <div style={{ fontSize: "8.5px", color: "#4B5563", textAlign: "center", fontStyle: "italic", borderTop: "1px dotted #9CA3AF", paddingTop: "6px" }}>
                *Wajib diserahkan ke Satpam Pos Gerbang saat keluar dan kembali sebelum batas waktu berakhir.
              </div>
            </div>

            {/* Tombol Cetak Slip */}
            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
              <button
                onClick={() => {
                  playSuccessChime();
                  onAuditLogAdd({
                    user: `${musyrifName} (Musyrif)`,
                    role: "Musyrif",
                    action: "CETAK SLIP FISIK GATE PASS",
                    object: `Gate Pass: ${selectedGatePassForPrint.id} (${selectedGatePassForPrint.studentName})`,
                    status: "DICETAK",
                    details: "Mencetak slip fisik 1 lembar kecil untuk santri keluar pondok.",
                  });
                  window.print();
                }}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: "10px",
                  background: "var(--gradient-emerald)",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                🖨️ Cetak Slip Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: OTORISASI GATE PASS MANDIRI OLEH MUSYRIF */}
      {isGatePassModalOpen && (
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
              padding: "24px",
              width: "100%",
              maxWidth: "440px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#06271E" }}>
                🎫 Otorisasi Gate Pass (Langsung dari Musyrif)
              </div>
              <button
                onClick={() => setIsGatePassModalOpen(false)}
                style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: "26px", height: "26px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueGatePassByMusyrif} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Nama Santri:</label>
                <select
                  value={gatePassStudent}
                  onChange={(e) => setGatePassStudent(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "3px" }}
                >
                  <option value="Ahmad Fauzan">Ahmad Fauzan (Kelas 7-A · Kamar 03)</option>
                  <option value="Fathir Ar-Rahman">Fathir Ar-Rahman (Kelas 7-B · Kamar 02)</option>
                  <option value="Muhammad Rizky">Muhammad Rizky (Kelas 8-C · Kamar 05)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Keperluan Izin Pulang:</label>
                <input
                  type="text"
                  required
                  value={gatePassReason}
                  onChange={(e) => setGatePassReason(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "3px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Nama Penjemput Sah:</label>
                <input
                  type="text"
                  required
                  value={gatePassPicker}
                  onChange={(e) => setGatePassPicker(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "3px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>NIK KTP Penjemput:</label>
                <input
                  type="text"
                  required
                  value={gatePassNik}
                  onChange={(e) => setGatePassNik(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "3px" }}
                />
              </div>

              <div style={{ background: "#F4FBF7", border: "1px solid #D1FAE5", borderRadius: "10px", padding: "10px", fontSize: "11px", color: "#065F46" }}>
                ✓ Gate pass ini berlaku <strong>Seharian Penuh (06:00 – 21:00 WIB)</strong> dan langsung dikenali di gerbang satpam tanpa verifikasi pengasuhan.
              </div>

              <button
                type="submit"
                style={{
                  padding: "10px",
                  borderRadius: "12px",
                  background: "var(--gradient-emerald)",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Sahkan & Terbitkan Gate Pass Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CATAT SAKIT / IZIN TANPA QR (SEKSI 13) */}
      {isManualModalOpen && (
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
              padding: "20px",
              width: "100%",
              maxWidth: "400px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                📝 Catat Sakit / Izin Tanpa QR (Seksi 13)
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: "26px", height: "26px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Nama Santri:</label>
                <select
                  value={manualStudentName}
                  onChange={(e) => setManualStudentName(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "4px" }}
                >
                  <option value="Ahmad Fauzan">Ahmad Fauzan (Kelas 7-A · Kamar 03)</option>
                  <option value="Fathir Ar-Rahman">Fathir Ar-Rahman (Kelas 7-B · Kamar 02)</option>
                  <option value="Muhammad Rizky">Muhammad Rizky (Kelas 8-C · Kamar 05)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Nomor Kamar:</label>
                <input
                  type="text"
                  value={manualRoomNumber}
                  onChange={(e) => setManualRoomNumber(e.target.value)}
                  placeholder="contoh: Kamar 03"
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Status Kondisi:</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  {["Sakit", "Izin Pulang", "Dispensasi Piket"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setManualFormType(t)}
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: manualFormType === t ? 800 : 500,
                        background: manualFormType === t ? "var(--gradient-emerald)" : "#F4FBF7",
                        color: manualFormType === t ? "#FFFFFF" : "#065F46",
                        border: "1px solid #D1FAE5",
                        cursor: "pointer",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Keterangan / Diagnosa:</label>
                <textarea
                  value={manualFormNotes}
                  onChange={(e) => setManualFormNotes(e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "4px" }}
                />
              </div>
            </div>

            <button
              onClick={handleSubmitManualCondition}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "12px",
                background: "var(--gradient-emerald)",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
              }}
            >
              Simpan ke EWS Asrama
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
