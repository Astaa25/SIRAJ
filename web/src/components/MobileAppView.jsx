import React, { useState, useEffect } from "react";
import {
  INITIAL_STUDENTS,
  MOCK_SCHEDULE_CATEGORIES,
  MULTI_DATE_SCHEDULES,
  INITIAL_HEALTH_RECORD,
  INITIAL_GATE_PASS,
  INITIAL_ADAB_RECORD,
  INITIAL_WALLET_DATA,
  INITIAL_KAJIAN_VIDEOS,
  CAMPUS_LOCATIONS,
  WEEKLY_SUMMARY_DATA,
} from "../data/mockData";
import { playSoftClick, playSuccessChime, playWarningTone } from "../utils/audio";

export default function MobileAppView({
  onTriggerLoader,
  activePersona,
  setActivePersona,
  onAuditLogAdd,
}) {
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("jurnal"); // jurnal, gatepass, poskestren, adab, peta
  const [selectedDateKey, setSelectedDateKey] = useState("2026-10-22");
  const [activeCategory, setActiveCategory] = useState("kelas_pagi");
  const [jurnalViewMode, setJurnalViewMode] = useState("daily"); // "daily" | "weekly"
  const [healthRecord, setHealthRecord] = useState(INITIAL_HEALTH_RECORD);
  const [gatePass, setGatePass] = useState(INITIAL_GATE_PASS);
  const [countdown, setCountdown] = useState(30);
  const [currentTimeStr, setCurrentTimeStr] = useState("14:22 WIB");

  // Dompet Digital & Uang Saku State
  const [walletData, setWalletData] = useState(INITIAL_WALLET_DATA);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100000);
  const [isWalletHistoryModalOpen, setIsWalletHistoryModalOpen] = useState(false);

  // Video Kajian & Adab Player State
  const [selectedKajianVideo, setSelectedKajianVideo] = useState(INITIAL_KAJIAN_VIDEOS[0]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);

  // Peta Interaktif Kampus State
  const [selectedLocation, setSelectedLocation] = useState(CAMPUS_LOCATIONS[1]); // Gedung KMI Ibnu Sina (santri here)
  const [mapFilter, setMapFilter] = useState("Semua");

  // Kartu Identitas Digital Santri State
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [isIdCardFlipped, setIsIdCardFlipped] = useState(false);

  // Detail Setoran Tahfidz & Doa Wali State
  const [selectedTahfidzItem, setSelectedTahfidzItem] = useState(null);
  const [isTahfidzModalOpen, setIsTahfidzModalOpen] = useState(false);
  const [isTahfidzAudioPlaying, setIsTahfidzAudioPlaying] = useState(false);
  const [tahfidzDoaSent, setTahfidzDoaSent] = useState(false);

  // Musyrif Scanner & Manual Form State
  const [scannedCount, setScannedCount] = useState(28);
  const [scannerStatus, setScannerStatus] = useState("idle"); // idle, scanning, success, duplicate
  const [scannerMessage, setScannerMessage] = useState("");
  const [selectedSessionForScan, setSelectedSessionForScan] = useState("Salat Subuh Berjamaah");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualFormType, setManualFormType] = useState("Sakit");
  const [manualFormNotes, setManualFormNotes] = useState("Keluhan pusing dan demam sejak ba'da dzuhur");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // Satpam Gate Pass State
  const [gateVerifyStatus, setGateVerifyStatus] = useState("ready"); // ready, verifying, approved, rejected

  const currentStudent = INITIAL_STUDENTS[selectedStudentIndex];
  const currentDateSchedule = MULTI_DATE_SCHEDULES[selectedDateKey] || MULTI_DATE_SCHEDULES["2026-10-22"];
  const currentCategories = currentDateSchedule.categories;

  // Live Clock & Gate Pass 30-Second Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
      );

      setCountdown((prev) => {
        if (prev <= 1) {
          return 30; // Rotate Ed25519 token every 30 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleActionClick = (msg, callback) => {
    playSoftClick();
    onTriggerLoader(msg, callback);
  };

  const handleStudentSwitch = (index) => {
    handleActionClick("Memuat Profil Santri...", () => {
      setSelectedStudentIndex(index);
    });
  };

  const handleDateSwitch = (dateKey) => {
    const targetLabel = dateKey === "2026-10-22" ? "Hari Ini (22 Okt)" : "Riwayat Kemarin (21 Okt)";
    handleActionClick(`Memuat Arsip Tanggal: ${targetLabel}...`, () => {
      setSelectedDateKey(dateKey);
    });
  };

  const handleCategorySwitch = (catId) => {
    handleActionClick("Memuat Jadwal & Sesi...", () => {
      setActiveCategory(catId);
    });
  };

  const handleBottomTabSwitch = (tabId) => {
    handleActionClick("Membuka Modul...", () => {
      setActiveTab(tabId);
    });
  };

  // Musyrif QR Scan Simulation
  const handleSimulateScan = (isDuplicate = false) => {
    playSoftClick();
    setScannerStatus("scanning");
    setScannerMessage("Membaca kartu QR Ed25519 santri...");

    onTriggerLoader(
      isDuplicate ? "Mengecek Anti-Duplikasi Sesi..." : "Verifikasi QR Santri...",
      () => {
        if (isDuplicate) {
          playWarningTone();
          setScannerStatus("duplicate");
          setScannerMessage("Peringatan: Kartu Ahmad Fauzan sudah dipindai pada sesi ini!");
          onAuditLogAdd({
            user: "Ustaz Zaid (Musyrif)",
            role: "Musyrif",
            action: "DUPLIKASI DITOLAK",
            object: "Santri: Ahmad Fauzan",
            status: "DITOLAK",
            details: "Percobaan pemindaian ganda dicegah oleh sistem anti-duplikasi.",
          });
        } else {
          playSuccessChime();
          setScannerStatus("success");
          setScannerMessage("Ahmad Fauzan — Berhasil dicatat HADIR!");
          setScannedCount((prev) => prev + 1);
          onAuditLogAdd({
            user: "Ustaz Zaid (Musyrif)",
            role: "Musyrif",
            action: "ABSENSI QR SUKSES",
            object: "Ahmad Fauzan (Kelas 7-A)",
            status: "SUKSES",
            details: `Presensi ${selectedSessionForScan} diverifikasi secara valid via QR Ed25519.`,
          });
        }
      }
    );
  };

  // Musyrif Manual Condition Submission (Tanpa QR)
  const handleSubmitManualCondition = () => {
    playSoftClick();
    setIsManualModalOpen(false);
    onTriggerLoader(`Mencatat Status ${manualFormType} Tanpa QR...`, () => {
      playSuccessChime();
      setHealthRecord((prev) => ({
        ...prev,
        diagnosis: manualFormNotes,
        timestamp: "22 Okt 2026, " + currentTimeStr,
      }));
      onAuditLogAdd({
        user: "Ustaz Zaid (Musyrif)",
        role: "Musyrif",
        action: `INPUT MANUAL: ${manualFormType.toUpperCase()}`,
        object: `Santri: ${currentStudent.name}`,
        status: "TERCATAT",
        details: `Keterangan: ${manualFormNotes}. Dampak otomatis diterapkan pada sesi terkait.`,
      });
    });
  };

  // Satpam Gate Pass Verification
  const handleVerifyGatePass = () => {
    playSoftClick();
    setGateVerifyStatus("verifying");
    onTriggerLoader("Verifikasi Otoritas Gate Pass Satpam...", () => {
      playSuccessChime();
      setGateVerifyStatus("approved");
      setGatePass((prev) => ({
        ...prev,
        singleUseStatus: "TERPAKAI & SELESAI (Pukul " + currentTimeStr + ")",
      }));
      onAuditLogAdd({
        user: "Pak Slamet (Satpam Gerbang 1)",
        role: "Satpam",
        action: "GATE PASS DITERIMA",
        object: "GP-2026-X889 (Ahmad Fauzan)",
        status: "SUKSES",
        details: "Penjemput Ir. H. Abdullah terverifikasi cocok KTP. Izin keluar santri diizinkan.",
      });
    });
  };

  // Top-Up Uang Saku Santri
  const handleTopUpSubmit = () => {
    playSoftClick();
    setIsTopUpModalOpen(false);
    onTriggerLoader(
      `Memproses Top-Up Uang Saku Rp ${topUpAmount.toLocaleString("id-ID")} via BSI VA...`,
      () => {
        playSuccessChime();
        const newTx = {
          id: "tx-" + Date.now(),
          title: "Top-Up Saldo Uang Saku (Transfer Wali)",
          category: "Top-Up",
          amount: topUpAmount,
          time: "22 Okt 2026 · " + currentTimeStr,
          icon: "",
          merchant: "BSI Virtual Account (+Ir. H. Abdullah)",
          ref: "TOPUP-" + Date.now().toString().slice(-8),
        };
        setWalletData((prev) => ({
          ...prev,
          balance: prev.balance + topUpAmount,
          transactions: [newTx, ...prev.transactions],
        }));
        onAuditLogAdd({
          user: "Ir. H. Abdullah (Wali Santri)",
          role: "Wali Santri",
          action: "TOP-UP SALDO SANTRI",
          object: `Santri: ${currentStudent.name}`,
          status: "BERHASIL",
          details: `Top-up sebesar Rp ${topUpAmount.toLocaleString("id-ID")} berhasil masuk ke dompet digital santri.`,
        });
      }
    );
  };

  // Musyrif Offline Queue Sync
  const handleSyncOfflineQueue = () => {
    playSoftClick();
    const count = offlineQueueCount > 0 ? offlineQueueCount : 3;
    onTriggerLoader(
      `Menyinkronkan ${count} Data Presensi Offline ke Supabase Cloud...`,
      () => {
        playSuccessChime();
        setOfflineQueueCount(0);
        setIsOfflineMode(false);
        onAuditLogAdd({
          user: "Ustaz Zaid (Musyrif)",
          role: "Musyrif",
          action: "SINKRONISASI OFFLINE",
          object: "Antrean Presensi Offline",
          status: "SUKSES",
          details: `${count} presensi santri lokal berhasil disinkronkan ke basis data cloud.`,
        });
      }
    );
  };

  // Video Kajian Player
  const handleOpenKajianVideo = (video) => {
    playSoftClick();
    onTriggerLoader(`Membuka Video Kajian: ${video.title.slice(0, 30)}...`, () => {
      setSelectedKajianVideo(video);
      setIsPlayingVideo(true);
      setIsVideoModalOpen(true);
    });
  };

  // Kartu Digital Santri
  const handleOpenIdCard = () => {
    playSoftClick();
    onTriggerLoader("Membuka Kartu Digital Santri (Ed25519 & RFID)...", () => {
      setIsIdCardFlipped(false);
      setIsIdCardModalOpen(true);
    });
  };

  // Detail Setoran Tahfidz & Doa Wali
  const handleOpenTahfidzDetail = (item) => {
    playSoftClick();
    onTriggerLoader("Memuat Lembar Penilaian & Rekaman Tahfidz...", () => {
      setSelectedTahfidzItem(item);
      setIsTahfidzAudioPlaying(false);
      setTahfidzDoaSent(false);
      setIsTahfidzModalOpen(true);
    });
  };

  const handleSendTahfidzDoa = () => {
    playSuccessChime();
    setTahfidzDoaSent(true);
    onAuditLogAdd({
      user: "Ir. H. Abdullah (Wali Santri)",
      role: "Wali Santri",
      action: "APRESIASI TAHFIDZ",
      object: `Santri: ${currentStudent.name}`,
      status: "TERKIRIM",
      details: "Wali santri mengirimkan doa & apresiasi untuk setoran Surah Al-Baqarah 79-102.",
    });
  };

  return (
    <div className="phone-mockup-frame">
      {/* Dynamic Island Notch */}
      <div className="phone-island">
        <div className="island-camera" />
        <div
          style={{
            fontSize: "10px",
            color: "#10B981",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
          SIRAJ
        </div>
        <div className="island-sensor" />
      </div>

      <div className="phone-inner-screen">
        {/* Mobile Top Status Bar */}
        <div
          style={{
            padding: "10px 18px 6px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            fontWeight: 700,
            color: activeTab === "jurnal" ? "#FFFFFF" : "#06271E",
            background: activeTab === "jurnal" ? "linear-gradient(135deg, #065F46 0%, #06271E 100%)" : "#FFFFFF",
            zIndex: 10,
            transition: "all 0.3s ease",
          }}
        >
          <span className="tabular-nums">{currentTimeStr}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
            <span>LTE 5G</span>
            <span>100% </span>
          </div>
        </div>

        {/* ROLE / PERSONA SELECTOR BAR */}
        <div
          style={{
            background: "#06271E",
            padding: "6px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(232, 182, 90, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="rotate-medium" style={{ display: "inline-flex", width: "13px", height: "13px" }}>
              <svg viewBox="0 0 100 100" width="13" height="13" fill="none">
                <circle cx="50" cy="50" r="47" stroke="rgba(232, 182, 90, 0.5)" strokeWidth="4" strokeDasharray="10 10" />
                <path
                  d="M50 4 L63 37 L96 50 L63 63 L50 96 L37 63 L4 50 L37 37 Z"
                  stroke="#FFE49A"
                  strokeWidth="5"
                />
              </svg>
            </span>
            <span style={{ fontSize: "11px", color: "#FFE49A", fontWeight: 600 }}>Peran Aktif:</span>
            <select
              value={activePersona}
              onChange={(e) => {
                const newRole = e.target.value;
                handleActionClick(`Beralih ke Peran ${newRole}...`, () => {
                  setActivePersona(newRole);
                });
              }}
              style={{
                background: "#0D4332",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 600,
                border: "1px solid #10B981",
                borderRadius: "8px",
                padding: "2px 8px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="Wali Santri">Wali Santri</option>
              <option value="Musyrif">Musyrif (Scan & Manual)</option>
              <option value="Satpam">Satpam (Gate Pass)</option>
            </select>
          </div>

          <div style={{ fontSize: "10px", color: "#8AA49B" }}>
            Tasikmalaya (WIB)
          </div>
        </div>

        {/* ================================================================
            VIEW 1: MUSYRIF SCANNER & MANUAL CONDITION INTERFACE
           ================================================================ */}
        {activePersona === "Musyrif" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "#06271E", color: "#FFFFFF" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFE49A" }}>Terminal Musyrif</h3>
                <p style={{ fontSize: "11px", color: "#8AA49B" }}>Pemindai QR & Pencatatan Kondisi Santri</p>
              </div>
              <div
                style={{
                  background: "#0D4332",
                  border: "1px solid #10B981",
                  borderRadius: "20px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  color: "#34D399",
                  fontWeight: 600,
                }}
              >
                Tersimpan: {scannedCount} Santri
              </div>
            </div>

            {/* Sesi Terpilih */}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", color: "#FFE49A", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Pilih Sesi Berlangsung:
              </label>
              <select
                value={selectedSessionForScan}
                onChange={(e) => setSelectedSessionForScan(e.target.value)}
                style={{
                  width: "100%",
                  background: "#0D4332",
                  color: "#FFFFFF",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <option value="Salat Subuh Berjamaah">Salat Subuh Berjamaah (Masjid Jami')</option>
                <option value="Kelas Pagi - Matematika">Kelas Pagi — Matematika (08:30)</option>
                <option value="Setoran Tahfidz">Setoran Tahfidz Ziyadah Pagi</option>
                <option value="Salat Dzuhur">Salat Dzuhur Berjamaah</option>
              </select>
            </div>

            {/* Simulated Camera Viewfinder */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "190px",
                background: "radial-gradient(circle, #083327 0%, #03140F 100%)",
                borderRadius: "18px",
                border: "2px solid rgba(16, 185, 129, 0.5)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 25px rgba(16, 185, 129, 0.2)",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "120px",
                  height: "120px",
                  border: "2px dashed #FFE49A",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: "linear-gradient(90deg, transparent, #10B981, transparent)",
                    boxShadow: "0 0 10px #10B981",
                    animation: "progressPulse 2s ease-in-out infinite alternate",
                  }}
                />
                <img
                  src="/logo_tile_1024.png"
                  alt="QR"
                  style={{ width: "60px", height: "60px", opacity: 0.85, borderRadius: "10px" }}
                />
              </div>

              <div style={{ marginTop: "8px", fontSize: "11px", color: "#A7F3D0", fontWeight: 500 }}>
                Arahkan kamera ke kartu fisik santri
              </div>
            </div>

            {/* Scan Feedback Banner */}
            {scannerStatus === "success" && (
              <div
                className="fade-in-up"
                style={{
                  background: "#D1FAE5",
                  color: "#065F46",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                
                <span>{scannerMessage}</span>
              </div>
            )}

            {scannerStatus === "duplicate" && (
              <div
                className="shake-amber"
                style={{
                  padding: "10px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#9A6212",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                
                <span>{scannerMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                onClick={() => handleSimulateScan(false)}
                style={{
                  background: "var(--gradient-emerald)",
                  color: "#FFFFFF",
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "13px",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                
                <span>Simulasi Pindai Kartu Santri (Valid)</span>
              </button>

              <button
                onClick={() => handleSimulateScan(true)}
                style={{
                  background: "#FFF1D6",
                  color: "#9A6212",
                  padding: "10px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "12px",
                  border: "1px solid #E8B65A",
                }}
              >
                Tes Pindai Ulang (Anti-Duplikasi)
              </button>

              {/* Seksi 13: Pencatatan Tanpa QR */}
              <button
                onClick={() => setIsManualModalOpen(true)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid #10B981",
                  color: "#A7F3D0",
                  padding: "10px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                
                <span>Catat Sakit / Izin Tanpa QR (Seksi 13)</span>
              </button>

              {/* Mode Offline & Sinkronisasi Antrean */}
              <div
                style={{
                  marginTop: "6px",
                  background: isOfflineMode ? "rgba(217, 119, 6, 0.15)" : "#0D4332",
                  border: isOfflineMode ? "1px solid #D97706" : "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "14px",
                  padding: "10px 12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isOfflineMode ? "8px" : "0px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "14px" }}>{isOfflineMode ? "OFFLINE" : "ONLINE"}</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: isOfflineMode ? "#FFE49A" : "#34D399" }}>
                      {isOfflineMode ? "Mode Offline Lokal (Masjid / Minim Sinyal)" : "Online · Supabase Cloud Sync"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      playSoftClick();
                      const nextMode = !isOfflineMode;
                      setIsOfflineMode(nextMode);
                      if (nextMode) setOfflineQueueCount(4);
                    }}
                    style={{
                      background: isOfflineMode ? "#D97706" : "rgba(255,255,255,0.1)",
                      color: "#FFFFFF",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 700,
                    }}
                  >
                    {isOfflineMode ? "Matikan" : "Simulasi Offline"}
                  </button>
                </div>

                {isOfflineMode && (
                  <div>
                    <div style={{ fontSize: "10.5px", color: "#FFE49A", marginBottom: "8px", lineHeight: "1.3" }}>
                      Tersimpan di SQLite lokal: <b>{offlineQueueCount} data presensi</b>. Otomatis aman tersimpan.
                    </div>
                    <button
                      onClick={handleSyncOfflineQueue}
                      style={{
                        width: "100%",
                        background: "var(--gradient-emerald)",
                        color: "#FFFFFF",
                        padding: "8px",
                        borderRadius: "8px",
                        fontWeight: 800,
                        fontSize: "11px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        boxShadow: "0 2px 10px rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      
                      <span>Pulihkan & Sinkronkan ke Cloud ({offlineQueueCount} Data)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Input Sakit & Izin Tanpa QR */}
            {isManualModalOpen && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.7)",
                  zIndex: 99999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    background: "#06271E",
                    border: "1px solid #FFE49A",
                    borderRadius: "20px",
                    padding: "20px",
                    width: "340px",
                    maxWidth: "90vw",
                    color: "#FFFFFF",
                  }}
                >
                  <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#FFE49A", marginBottom: "4px" }}>
                    Catat Kondisi Santri (Tanpa QR)
                  </h4>
                  <p style={{ fontSize: "11px", color: "#8AA49B", marginBottom: "14px" }}>
                    Untuk santri sakit, izin, atau pulang darurat
                  </p>

                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "11px", color: "#A7F3D0" }}>Santri: </label>
                    <span style={{ fontWeight: 700 }}>{currentStudent.name} ({currentStudent.class})</span>
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "11px", color: "#A7F3D0", display: "block", marginBottom: "4px" }}>Jenis Kondisi:</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {["Sakit", "Izin", "Pulang"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setManualFormType(type)}
                          style={{
                            flex: 1,
                            padding: "6px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 700,
                            background: manualFormType === type ? "#059669" : "#0D4332",
                            color: "#FFFFFF",
                            border: manualFormType === type ? "1px solid #FFE49A" : "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "11px", color: "#A7F3D0", display: "block", marginBottom: "4px" }}>Keterangan / Diagnosa:</label>
                    <textarea
                      rows={3}
                      value={manualFormNotes}
                      onChange={(e) => setManualFormNotes(e.target.value)}
                      style={{
                        width: "100%",
                        background: "#0D4332",
                        color: "#FFFFFF",
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        borderRadius: "10px",
                        padding: "8px",
                        fontSize: "12px",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={handleSubmitManualCondition}
                      style={{
                        flex: 1,
                        background: "var(--gradient-emerald)",
                        color: "#FFFFFF",
                        padding: "10px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      Simpan & Sinkron
                    </button>
                    <button
                      onClick={() => setIsManualModalOpen(false)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.1)",
                        color: "#FFFFFF",
                        fontSize: "12px",
                      }}
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            VIEW 2: SATPAM GATE PASS VERIFICATION INTERFACE
           ================================================================ */}
        {activePersona === "Satpam" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "#06271E", color: "#FFFFFF" }}>
            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFE49A" }}>Pos Keamanan Gerbang Utama</h3>
              <p style={{ fontSize: "11px", color: "#8AA49B" }}>Verifikasi Gate Pass Penjemputan Santri</p>
            </div>

            {/* Santri Card Photo Matching Section */}
            <div
              style={{
                background: "#0D4332",
                border: "1px solid rgba(232, 182, 90, 0.4)",
                borderRadius: "18px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <img
                  src={currentStudent.photo}
                  alt={currentStudent.name}
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "14px",
                    objectFit: "cover",
                    border: "2px solid #FFE49A",
                  }}
                />
                <div>
                  <span
                    style={{
                      background: "#10B981",
                      color: "#06271E",
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      display: "inline-block",
                      marginBottom: "4px",
                    }}
                  >
                    IZIN RESMI TERBIT
                  </span>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>
                    {gatePass.studentName}
                  </div>
                  <div style={{ fontSize: "11px", color: "#A7F3D0" }}>
                    NIS: {currentStudent.nis} · {currentStudent.class}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "14px",
                  paddingTop: "12px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  fontSize: "11px",
                  lineHeight: "1.6",
                }}
              >
                <div>
                  <span style={{ color: "#FFE49A", fontWeight: 600 }}>Penjemput Sah: </span>
                  <span style={{ color: "#FFFFFF" }}>{gatePass.authorizedPicker}</span>
                </div>
                <div>
                  <span style={{ color: "#FFE49A", fontWeight: 600 }}>NIK KTP: </span>
                  <span className="tabular-nums" style={{ color: "#A7F3D0" }}>{gatePass.pickerNik}</span>
                </div>
                <div>
                  <span style={{ color: "#FFE49A", fontWeight: 600 }}>Keperluan: </span>
                  <span style={{ color: "#FFFFFF" }}>{gatePass.reason}</span>
                </div>
                <div>
                  <span style={{ color: "#FFE49A", fontWeight: 600 }}>Status Token: </span>
                  <span style={{ color: gateVerifyStatus === "approved" ? "#34D399" : "#FFE49A", fontWeight: 700 }}>
                    {gatePass.singleUseStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Atomic Clearance Action */}
            {gateVerifyStatus === "approved" ? (
              <div
                className="fade-in-up"
                style={{
                  background: "#D1FAE5",
                  color: "#065F46",
                  padding: "16px",
                  borderRadius: "16px",
                  textAlign: "center",
                  border: "2px solid #10B981",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "4px", fontWeight: 800, color: "#10B981" }}>✓</div>
                <div style={{ fontSize: "15px", fontWeight: 800 }}>GERBANG DIBUKA — SAH</div>
                <div style={{ fontSize: "11px", marginTop: "4px" }}>
                  Data penjemputan berhasil di-update secara atomik ke server & dicatat di audit log.
                </div>
              </div>
            ) : (
              <button
                onClick={handleVerifyGatePass}
                style={{
                  width: "100%",
                  background: "var(--gradient-emerald)",
                  color: "#FFFFFF",
                  padding: "16px",
                  borderRadius: "16px",
                  fontWeight: 800,
                  fontSize: "14px",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
                  border: "1px solid #FFE49A",
                }}
              >
                Verifikasi Identitas & Buka Gerbang
              </button>
            )}
          </div>
        )}

        {/* ================================================================
            VIEW 3: WALI SANTRI (JURNAL HARIAN & MODULES)
           ================================================================ */}
        {activePersona === "Wali Santri" && (
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {/* Top Islamic Banner & Student Selector */}
            <div
              style={{
                background: "linear-gradient(145deg, #06271E 0%, #0D4332 60%, #065F46 100%)",
                padding: "16px 18px 20px 18px",
                color: "#FFFFFF",
                borderBottomLeftRadius: "28px",
                borderBottomRightRadius: "28px",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 25px -5px rgba(6, 39, 30, 0.25)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "120px",
                  height: "120px",
                  opacity: 0.08,
                  pointerEvents: "none",
                }}
              >
                <svg viewBox="0 0 100 100" fill="#FFE49A">
                  <path d="M50 0 L65 35 L100 50 L65 65 L50 100 L35 65 L0 50 L35 35 Z" />
                </svg>
              </div>

              {/* Institution Title & Hijri Date */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div>
                  <div
                    className="arabic-font"
                    style={{ fontSize: "14px", color: "#FFE49A", letterSpacing: "0.03em" }}
                  >
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                  <div style={{ fontSize: "11px", color: "#A7F3D0", fontWeight: 600 }}>
                    PP. Darussalam Rajapolah
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.12)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "16px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    color: "#FFE49A",
                    fontWeight: 600,
                  }}
                >
                  {currentDateSchedule.hijri}
                </div>
              </div>

              {/* Student Profile Switcher Card */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 228, 154, 0.3)",
                  borderRadius: "20px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ position: "relative" }}>
                    <img
                      src={currentStudent.photo}
                      alt={currentStudent.name}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        objectFit: "cover",
                        border: "2px solid #FFE49A",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        right: "-2px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: "#10B981",
                        border: "2px solid #06271E",
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>
                        {currentStudent.name}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#A7F3D0", marginTop: "2px" }}>
                      {currentStudent.class}
                    </div>
                    <div style={{ fontSize: "10px", color: "#8AA49B" }}>
                      {currentStudent.dorm}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                  <button
                    onClick={() =>
                      handleStudentSwitch(selectedStudentIndex === 0 ? 1 : 0)
                    }
                    style={{
                      background: "rgba(232, 182, 90, 0.2)",
                      border: "1px solid #FFE49A",
                      borderRadius: "10px",
                      color: "#FFE49A",
                      padding: "4px 8px",
                      fontSize: "10.5px",
                      fontWeight: 700,
                    }}
                  >
                    Ganti Anak ⇄
                  </button>
                  <button
                    onClick={handleOpenIdCard}
                    style={{
                      background: "#0D4332",
                      border: "1px solid #10B981",
                      borderRadius: "10px",
                      color: "#A7F3D0",
                      padding: "4px 8px",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>🪪</span>
                    <span>Kartu Santri</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TAB CONTENT: JURNAL */}
            {activeTab === "jurnal" && (
              <div style={{ padding: "16px", flex: 1 }}>
                {/* View Mode Segmented Control: Jurnal Harian vs Rekap Mingguan */}
                <div
                  style={{
                    display: "flex",
                    background: "#ECFDF5",
                    padding: "3px",
                    borderRadius: "12px",
                    marginBottom: "12px",
                    border: "1px solid rgba(6, 95, 70, 0.15)",
                  }}
                >
                  <button
                    onClick={() => {
                      if (jurnalViewMode !== "daily") {
                        handleActionClick("Memuat Jurnal Harian Santri...", () => {
                          setJurnalViewMode("daily");
                        });
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: "6px 10px",
                      borderRadius: "10px",
                      fontSize: "11.5px",
                      fontWeight: jurnalViewMode === "daily" ? 800 : 600,
                      background: jurnalViewMode === "daily" ? "#FFFFFF" : "transparent",
                      color: jurnalViewMode === "daily" ? "#065F46" : "#5B7A70",
                      boxShadow: jurnalViewMode === "daily" ? "0 2px 8px rgba(6, 95, 70, 0.1)" : "none",
                      transition: "all 0.2s ease",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Jurnal Harian
                  </button>
                  <button
                    onClick={() => {
                      if (jurnalViewMode !== "weekly") {
                        handleActionClick("Menyusun Rekap Mingguan Santri...", () => {
                          setJurnalViewMode("weekly");
                        });
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: "6px 10px",
                      borderRadius: "10px",
                      fontSize: "11.5px",
                      fontWeight: jurnalViewMode === "weekly" ? 800 : 600,
                      background: jurnalViewMode === "weekly" ? "#FFFFFF" : "transparent",
                      color: jurnalViewMode === "weekly" ? "#065F46" : "#5B7A70",
                      boxShadow: jurnalViewMode === "weekly" ? "0 2px 8px rgba(6, 95, 70, 0.1)" : "none",
                      transition: "all 0.2s ease",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Rekap Mingguan
                  </button>
                </div>

                {jurnalViewMode === "weekly" ? (
                  <div className="fade-in-up">
                    {/* Weekly Card Header */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #06271E 0%, #0D4332 100%)",
                        color: "#FFFFFF",
                        borderRadius: "18px",
                        padding: "16px",
                        marginBottom: "14px",
                        border: "1px solid rgba(232, 182, 90, 0.35)",
                        boxShadow: "0 4px 16px rgba(6, 39, 30, 0.2)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div>
                          <span style={{ fontSize: "11px", color: "#FFE49A", fontWeight: 700 }}>
                            {WEEKLY_SUMMARY_DATA.weekLabel}
                          </span>
                          <h4 style={{ fontSize: "16px", fontWeight: 800, marginTop: "2px" }}>
                            Tingkat Kehadiran: <span style={{ color: "#34D399" }}>{WEEKLY_SUMMARY_DATA.overallRate}%</span>
                          </h4>
                        </div>
                        <span
                          style={{
                            background: "rgba(16, 185, 129, 0.2)",
                            border: "1px solid #10B981",
                            color: "#A7F3D0",
                            fontSize: "10.5px",
                            fontWeight: 700,
                            padding: "4px 8px",
                            borderRadius: "8px",
                          }}
                        >
                          Predikat: Mumtaz ⭐
                        </span>
                      </div>

                      {/* Weekly Mini Bars Chart */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(7, 1fr)",
                          gap: "6px",
                          padding: "10px 0",
                          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                          marginBottom: "12px",
                        }}
                      >
                        {WEEKLY_SUMMARY_DATA.days.map((d) => (
                          <div key={d.day} style={{ textAlign: "center" }}>
                            <div
                              style={{
                                height: "56px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                marginBottom: "4px",
                              }}
                            >
                              <div
                                style={{
                                  width: "14px",
                                  height: `${Math.round((d.rate / 100) * 50)}px`,
                                  borderRadius: "4px",
                                  background: d.rate === 100 ? "var(--gradient-emerald)" : "#E8B65A",
                                  boxShadow: d.rate === 100 ? "0 2px 6px rgba(16, 185, 129, 0.3)" : "none",
                                }}
                              />
                            </div>
                            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#FFE49A" }}>{d.day}</div>
                            <div style={{ fontSize: "9px", color: "#A7F3D0" }}>{d.rate}%</div>
                          </div>
                        ))}
                      </div>

                      {/* 4 Weekly Metric Pills */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "6px", textAlign: "center" }}>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "#34D399" }}>{WEEKLY_SUMMARY_DATA.hadirCount}</div>
                          <div style={{ fontSize: "9px", color: "#A7F3D0" }}>Hadir</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "6px", textAlign: "center" }}>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "#FCD34D" }}>{WEEKLY_SUMMARY_DATA.terlambatCount}</div>
                          <div style={{ fontSize: "9px", color: "#FFE49A" }}>Terlambat</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "6px", textAlign: "center" }}>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "#93C5FD" }}>{WEEKLY_SUMMARY_DATA.sakitCount}</div>
                          <div style={{ fontSize: "9px", color: "#BAE6FD" }}>Sakit</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "6px", textAlign: "center" }}>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "#E5E7EB" }}>{WEEKLY_SUMMARY_DATA.alpaCount}</div>
                          <div style={{ fontSize: "9px", color: "#D1D5DB" }}>Alpa</div>
                        </div>
                      </div>
                    </div>

                    {/* Highlights Card */}
                    <div
                      style={{
                        background: "#FFFFFF",
                        borderRadius: "16px",
                        padding: "14px",
                        border: "1px solid #E2EFE9",
                        marginBottom: "12px",
                      }}
                    >
                      <h5 style={{ fontSize: "12.5px", fontWeight: 800, color: "#06271E", marginBottom: "8px" }}>
                        Sorotan Capaian Pekan Ini
                      </h5>
                      <ul style={{ paddingLeft: "16px", margin: 0, fontSize: "11.5px", color: "#065F46", lineHeight: 1.6 }}>
                        {WEEKLY_SUMMARY_DATA.highlights.map((h, idx) => (
                          <li key={idx}>{h}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Musyrif Note */}
                    <div
                      style={{
                        background: "#ECFDF5",
                        borderRadius: "16px",
                        padding: "12px 14px",
                        border: "1px solid #A7F3D0",
                        marginBottom: "16px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        
                        <div>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: "#065F46" }}>
                            Catatan Musyrif Asrama (Ustaz Farhan)
                          </div>
                          <p style={{ fontSize: "11px", color: "#047857", margin: "4px 0 0 0", fontStyle: "italic", lineHeight: 1.4 }}>
                            "{WEEKLY_SUMMARY_DATA.musyrifNote}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PDF Download Trigger */}
                    <button
                      onClick={() => {
                        handleActionClick("Membuat Draf Rapor Mingguan PDF Berkop Resmi...", () => {
                          playSuccessChime();
                          onAuditLogAdd({
                            user: "Ir. H. Abdullah (Wali Santri)",
                            role: "Wali Santri",
                            action: "UNDUH RAPOR MINGGUAN",
                            object: `Santri: ${currentStudent.name}`,
                            status: "SUKSES",
                            details: "Mengunduh rekap mingguan Pekan ke-4 Oktober 2026.",
                          });
                        });
                      }}
                      style={{
                        width: "100%",
                        background: "var(--gradient-emerald)",
                        color: "#FFFFFF",
                        padding: "12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 700,
                        boxShadow: "0 4px 12px rgba(6, 95, 70, 0.25)",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Unduh Rapor Pekanan (PDF Berkop Pondok)
                    </button>
                  </div>
                ) : (
                  <div>
                {/* Date Navigator Bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                    background: "#FFFFFF",
                    padding: "8px 12px",
                    borderRadius: "14px",
                    border: "1px solid #E2EFE9",
                  }}
                >
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => handleDateSwitch("2026-10-21")}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: selectedDateKey === "2026-10-21" ? 800 : 500,
                        background: selectedDateKey === "2026-10-21" ? "#065F46" : "transparent",
                        color: selectedDateKey === "2026-10-21" ? "#FFFFFF" : "#5B7A70",
                      }}
                    >
                      ← 21 Okt
                    </button>
                    <button
                      onClick={() => handleDateSwitch("2026-10-22")}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: selectedDateKey === "2026-10-22" ? 800 : 500,
                        background: selectedDateKey === "2026-10-22" ? "#065F46" : "transparent",
                        color: selectedDateKey === "2026-10-22" ? "#FFFFFF" : "#5B7A70",
                      }}
                    >
                      Hari Ini (22 Okt)
                    </button>
                  </div>

                  <div style={{ fontSize: "11px", color: "#5B7A70", fontWeight: 600 }}>
                    Ashar: <span className="tabular-nums" style={{ color: "#065F46", fontWeight: 700 }}>15:22 WIB</span>
                  </div>
                </div>

                {/* 4-Metric Attendance Summary Bar */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      background: "var(--status-hadir-bg)",
                      borderRadius: "14px",
                      padding: "10px 6px",
                      textAlign: "center",
                      border: "1px solid rgba(6, 95, 70, 0.15)",
                    }}
                  >
                    <div className="tabular-nums" style={{ fontSize: "18px", fontWeight: 800, color: "var(--status-hadir-text)" }}>
                      {currentDateSchedule.summary.hadir}
                    </div>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--status-hadir-text)" }}>
                      Hadir
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--status-terlambat-bg)",
                      borderRadius: "14px",
                      padding: "10px 6px",
                      textAlign: "center",
                      border: "1px solid rgba(154, 98, 18, 0.15)",
                    }}
                  >
                    <div className="tabular-nums" style={{ fontSize: "18px", fontWeight: 800, color: "var(--status-terlambat-text)" }}>
                      {currentDateSchedule.summary.terlambat}
                    </div>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--status-terlambat-text)" }}>
                      Terlambat
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--status-sakit-bg)",
                      borderRadius: "14px",
                      padding: "10px 6px",
                      textAlign: "center",
                      border: "1px solid rgba(3, 105, 161, 0.15)",
                    }}
                  >
                    <div className="tabular-nums" style={{ fontSize: "18px", fontWeight: 800, color: "var(--status-sakit-text)" }}>
                      {currentDateSchedule.summary.izinSakit}
                    </div>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--status-sakit-text)" }}>
                      Izin/Sakit
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#F3F4F6",
                      borderRadius: "14px",
                      padding: "10px 6px",
                      textAlign: "center",
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <div className="tabular-nums" style={{ fontSize: "18px", fontWeight: 800, color: "#4B5563" }}>
                      {currentDateSchedule.summary.belumDicatat}
                    </div>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "#4B5563" }}>
                      Belum
                    </div>
                  </div>
                </div>

                {/* WIDGET 1: DOMPET SANTRI & UANG SAKU KANTIN / KOPERASI */}
                <div
                  className="fade-in-up"
                  style={{
                    background: "linear-gradient(135deg, #065F46 0%, #06271E 100%)",
                    borderRadius: "18px",
                    padding: "12px 14px",
                    color: "#FFFFFF",
                    marginBottom: "12px",
                    border: "1px solid rgba(232, 182, 90, 0.3)",
                    boxShadow: "0 6px 18px rgba(6, 95, 70, 0.15)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#FFE49A", fontWeight: 700 }}>
                        <span></span>
                        <span>Dompet Uang Saku & Koperasi</span>
                      </div>
                      <div className="tabular-nums" style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF", marginTop: "2px" }}>
                        Rp {walletData.balance.toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => setIsTopUpModalOpen(true)}
                        style={{
                          background: "var(--gradient-gold)",
                          color: "#06271E",
                          padding: "6px 10px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 800,
                          boxShadow: "0 2px 8px rgba(232, 182, 90, 0.4)",
                        }}
                      >
                        + Top-Up
                      </button>
                      <button
                        onClick={() => setIsWalletHistoryModalOpen(true)}
                        style={{
                          background: "rgba(255,255,255,0.12)",
                          color: "#FFFFFF",
                          border: "1px solid rgba(255,255,255,0.2)",
                          padding: "6px 8px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        Riwayat
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                      paddingTop: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "10px",
                      color: "#A7F3D0",
                    }}
                  >
                    <span>Syahriah: <b style={{ color: "#FFE49A" }}>{walletData.syahriahStatus}</b></span>
                    <span>Jajan Hari Ini: <b style={{ color: "#FFFFFF" }}>Rp {walletData.spentToday.toLocaleString("id-ID")}</b></span>
                  </div>
                </div>

                {/* WIDGET 2: VIDEO KAJIAN ADAB & TAUSIYAH HARI INI */}
                <div
                  className="fade-in-up"
                  style={{
                    background: "#06271E",
                    borderRadius: "16px",
                    padding: "10px 12px",
                    border: "1px solid rgba(232, 182, 90, 0.25)",
                    marginBottom: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: "rgba(232, 182, 90, 0.15)",
                        border: "1px solid #FFE49A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                      }}
                    >
                      
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "#FFE49A" }}>
                        Kajian Adab: Ta'limul Muta'allim
                      </div>
                      <div style={{ fontSize: "10px", color: "#A7F3D0" }}>
                        K.H. Hasan Basri · Durasi 18:42
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenKajianVideo(INITIAL_KAJIAN_VIDEOS[0])}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid #10B981",
                      color: "#FFFFFF",
                      padding: "5px 10px",
                      borderRadius: "8px",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ▶ Putar
                  </button>
                </div>

                {/* Dynamic Category Tabs */}
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    overflowX: "auto",
                    paddingBottom: "8px",
                    marginBottom: "14px",
                  }}
                >
                  {MOCK_SCHEDULE_CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    const itemsInCat = currentCategories[cat.id] || [];
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySwitch(cat.id)}
                        style={{
                          whiteSpace: "nowrap",
                          padding: "8px 14px",
                          borderRadius: "14px",
                          fontSize: "12px",
                          fontWeight: isActive ? 700 : 500,
                          background: isActive ? "var(--gradient-emerald)" : "#FFFFFF",
                          color: isActive ? "#FFFFFF" : "#5B7A70",
                          border: isActive ? "none" : "1px solid var(--color-border-subtle)",
                          boxShadow: isActive ? "0 4px 12px rgba(6, 95, 70, 0.2)" : "none",
                        }}
                      >
                        {cat.label} ({itemsInCat.length})
                      </button>
                    );
                  })}
                </div>

                {/* Schedule Item Cards for Selected Category */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(currentCategories[activeCategory] || []).map((item) => {
                    let statusBg = "var(--status-hadir-bg)";
                    let statusColor = "var(--status-hadir-text)";

                    if (item.statusType === "terlambat") {
                      statusBg = "var(--status-terlambat-bg)";
                      statusColor = "var(--status-terlambat-text)";
                    } else if (item.statusType === "sakit") {
                      statusBg = "var(--status-sakit-bg)";
                      statusColor = "var(--status-sakit-text)";
                    } else if (item.statusType === "masbuk") {
                      statusBg = "var(--status-masbuk-bg)";
                      statusColor = "var(--status-masbuk-text)";
                    } else if (item.statusType === "belum") {
                      statusBg = "#F3F4F6";
                      statusColor = "#6B7280";
                    }

                    return (
                      <div
                        key={item.id}
                        className="fade-in-up"
                        style={{
                          background: "#FFFFFF",
                          borderRadius: "16px",
                          padding: "14px",
                          border: "1px solid rgba(6, 95, 70, 0.08)",
                          boxShadow: "0 2px 8px rgba(6, 39, 30, 0.04)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: "#06271E" }}>
                              {item.subject}
                            </div>
                            <div style={{ fontSize: "11px", color: "#5B7A70", marginTop: "2px" }}>
                              {item.time} · {item.teacher}
                            </div>
                          </div>

                          <span
                            style={{
                              background: statusBg,
                              color: statusColor,
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "4px 8px",
                              borderRadius: "10px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.status}
                          </span>
                        </div>

                        {item.surah && (
                          <div
                            onClick={() => handleOpenTahfidzDetail(item)}
                            style={{
                              background: "rgba(232, 182, 90, 0.12)",
                              border: "1px solid rgba(232, 182, 90, 0.35)",
                              borderRadius: "10px",
                              padding: "7px 10px",
                              fontSize: "11px",
                              color: "#9A6212",
                              fontWeight: 600,
                              margin: "6px 0",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <span>{item.surah} ({item.verses})</span>
                            <span
                              style={{
                                fontSize: "10px",
                                background: "#065F46",
                                color: "#FFFFFF",
                                padding: "2px 6px",
                                borderRadius: "6px",
                                fontWeight: 700,
                              }}
                            >
                              Detail Setoran ➔
                            </span>
                          </div>
                        )}

                        <div
                          style={{
                            fontSize: "11px",
                            color: "#8AA49B",
                            borderTop: "1px dashed #E2EFE9",
                            paddingTop: "6px",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Aktual: {item.actualTime}</span>
                          <span style={{ fontStyle: "italic" }}>{item.notes}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

            {/* TAB CONTENT: GATE PASS */}
            {activeTab === "gatepass" && (
              <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#06271E" }}>
                    QR Gate Pass Penjemputan
                  </h3>
                  <p style={{ fontSize: "11px", color: "#5B7A70" }}>
                    Tunjukkan kepada satpam gerbang saat menjemput santri
                  </p>
                </div>

                <div
                  className="gatepass-breathe"
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "28px",
                    padding: "20px",
                    border: "2px solid #059669",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: "0 10px 30px rgba(5, 150, 105, 0.15)",
                    position: "relative",
                    width: "260px",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "#06271E",
                      color: "#FFE49A",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span className="tabular-nums">⏳ {countdown}s</span>
                  </div>

                  <img
                    src="/logo_tile_1024.png"
                    alt="Gate Pass QR"
                    style={{ width: "180px", height: "180px", borderRadius: "18px" }}
                  />

                  <div style={{ marginTop: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#06271E" }}>
                      ID: {gatePass.id}
                    </div>
                    <div style={{ fontSize: "10px", color: "#059669", fontWeight: 600 }}>
                      Dilindungi Tanda Tangan Ed25519
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    width: "100%",
                    background: "#FFFFFF",
                    borderRadius: "16px",
                    padding: "14px",
                    marginTop: "16px",
                    border: "1px solid var(--color-border-subtle)",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#5B7A70" }}>Penjemput Sah:</span>
                    <span style={{ fontWeight: 700, color: "#06271E" }}>{gatePass.authorizedPicker}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#5B7A70" }}>Masa Berlaku:</span>
                    <span style={{ fontWeight: 600, color: "#06271E" }}>{gatePass.validFrom}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#5B7A70" }}>Status Gerbang:</span>
                    <span style={{ fontWeight: 700, color: "#059669" }}>{gatePass.singleUseStatus}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: POSKESTREN */}
            {activeTab === "poskestren" && (
              <div style={{ padding: "16px", flex: 1 }}>
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#06271E" }}>
                    Pelacak Kesehatan Santri
                  </h3>
                  <p style={{ fontSize: "11px", color: "#5B7A70" }}>
                    Layanan Medis Pos Kesehatan Pesantren (Poskestren)
                  </p>
                </div>

                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "20px",
                    padding: "16px",
                    border: "1px solid rgba(3, 105, 161, 0.2)",
                    boxShadow: "0 4px 15px rgba(3, 105, 161, 0.08)",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span
                      style={{
                        background: "#E0F2FE",
                        color: "#0369A1",
                        fontWeight: 700,
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "8px",
                      }}
                    >
                      TAHAP 2 DARI 4
                    </span>
                    <span style={{ fontSize: "11px", color: "#5B7A70" }}>{healthRecord.timestamp}</span>
                  </div>

                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#06271E", marginBottom: "4px" }}>
                    {healthRecord.stageLabel}
                  </div>
                  <div style={{ fontSize: "12px", color: "#0369A1", fontWeight: 600, marginBottom: "12px" }}>
                    Keluhan: {healthRecord.diagnosis}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "8px",
                      background: "#F0F9FF",
                      padding: "10px",
                      borderRadius: "12px",
                      textAlign: "center",
                      fontSize: "11px",
                    }}
                  >
                    <div>
                      <div style={{ color: "#5B7A70" }}>Suhu Tubuh</div>
                      <div className="tabular-nums" style={{ fontWeight: 800, color: "#0369A1" }}>{healthRecord.temp}</div>
                    </div>
                    <div>
                      <div style={{ color: "#5B7A70" }}>Tekanan Darah</div>
                      <div className="tabular-nums" style={{ fontWeight: 800, color: "#0369A1" }}>{healthRecord.bloodPressure}</div>
                    </div>
                    <div>
                      <div style={{ color: "#5B7A70" }}>Denyut Nadi</div>
                      <div className="tabular-nums" style={{ fontWeight: 800, color: "#0369A1" }}>{healthRecord.pulse}</div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "16px",
                    padding: "14px",
                    border: "1px solid var(--color-border-subtle)",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#06271E", marginBottom: "8px" }}>
                    Resep & Petunjuk Perawatan:
                  </div>
                  <ul style={{ paddingLeft: "18px", color: "#5B7A70", lineHeight: "1.7" }}>
                    {healthRecord.medications.map((med, idx) => (
                      <li key={idx}>{med}</li>
                    ))}
                  </ul>

                  <div
                    style={{
                      marginTop: "10px",
                      paddingTop: "8px",
                      borderTop: "1px dashed #E2EFE9",
                      fontSize: "11px",
                      color: "#8AA49B",
                    }}
                  >
                    Petugas Medis: {healthRecord.officer}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: RAPOR ADAB */}
            {activeTab === "adab" && (
              <div style={{ padding: "16px", flex: 1 }}>
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#06271E" }}>
                    Rapor Adab & Kedisiplinan
                  </h3>
                  <p style={{ fontSize: "11px", color: "#5B7A70" }}>
                    Buku Catatan Akhlaq dan Pembinaan Santri
                  </p>
                </div>

                <div
                  style={{
                    background: "linear-gradient(135deg, #06271E 0%, #065F46 100%)",
                    borderRadius: "20px",
                    padding: "18px",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "#FFE49A", fontWeight: 600 }}>
                      Indeks Kedisiplinan & Adab
                    </div>
                    <div className="tabular-nums" style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF" }}>
                      {INITIAL_ADAB_RECORD.totalScore}
                      <span style={{ fontSize: "16px", color: "#A7F3D0" }}> / 100</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#FFE49A", fontWeight: 700 }}>
                      Predikat: {INITIAL_ADAB_RECORD.classification}
                    </div>
                  </div>

                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      border: "4px solid #FFE49A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                    }}
                  >
                    ⭐
                  </div>
                </div>

                <div style={{ fontSize: "13px", fontWeight: 700, color: "#06271E", marginBottom: "8px" }}>
                  Catatan Poin Kebaikan (+):
                </div>
                {INITIAL_ADAB_RECORD.goodPoints.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "12px",
                      padding: "10px 12px",
                      marginBottom: "6px",
                      border: "1px solid #D1FAE5",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "12px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "#06271E" }}>{item.title}</div>
                      <div style={{ fontSize: "10px", color: "#8AA49B" }}>{item.date} · Oleh {item.officer}</div>
                    </div>
                    <span style={{ fontWeight: 800, color: "#059669" }}>{item.points}</span>
                  </div>
                ))}

                <div style={{ fontSize: "13px", fontWeight: 700, color: "#06271E", margin: "14px 0 8px 0" }}>
                  Catatan Pelanggaran (-):
                </div>
                {INITIAL_ADAB_RECORD.violationPoints.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "12px",
                      padding: "10px 12px",
                      marginBottom: "6px",
                      border: "1px solid #FFF1D6",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "12px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "#06271E" }}>{item.title}</div>
                      <div style={{ fontSize: "10px", color: "#8AA49B" }}>{item.date} · Oleh {item.officer}</div>
                    </div>
                    <span style={{ fontWeight: 800, color: "#9A6212" }}>{item.points}</span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: PETA FASILITAS PESANTREN & LIVE SANTRI LOCATOR */}
            {activeTab === "peta" && (
              <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#06271E" }}>
                        Peta Interaktif Kampus
                      </h3>
                      <p style={{ fontSize: "11px", color: "#5B7A70" }}>
                        Pondok Pesantren Darussalam Rajapolah
                      </p>
                    </div>
                    <span
                      style={{
                        background: "#D1FAE5",
                        color: "#065F46",
                        padding: "3px 8px",
                        borderRadius: "10px",
                        fontSize: "10.5px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
                      GPS Ponpes Siaga
                    </span>
                  </div>

                  {/* Live Santri Position Radar Pill */}
                  <div
                    className="fade-in-up"
                    style={{
                      marginTop: "10px",
                      background: "linear-gradient(135deg, #06271E 0%, #065F46 100%)",
                      borderRadius: "14px",
                      padding: "10px 12px",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      border: "1px solid #FFE49A",
                      boxShadow: "0 4px 14px rgba(6, 95, 70, 0.2)",
                    }}
                  >
                    <div style={{ position: "relative", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span
                        style={{
                          position: "absolute",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "rgba(255, 228, 154, 0.4)",
                          animation: "progressPulse 1.8s infinite",
                        }}
                      />
                      
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "10px", color: "#FFE49A", fontWeight: 700 }}>
                        LOKASI SANTRI SAAT INI ({currentTimeStr})
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 800 }}>
                        {currentStudent.name} berada di <b>Gedung KMI Ibnu Sina</b> (Ruang 7-A)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Pills */}
                <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "8px", marginBottom: "10px" }}>
                  {["Semua", "Ibadah", "Akademik", "Asrama", "Kesehatan", "Konsumsi", "Keamanan"].map((filter) => {
                    const isActive = mapFilter === filter;
                    return (
                      <button
                        key={filter}
                        onClick={() => {
                          playSoftClick();
                          setMapFilter(filter);
                        }}
                        style={{
                          whiteSpace: "nowrap",
                          padding: "4px 10px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: isActive ? 700 : 500,
                          background: isActive ? "#065F46" : "#FFFFFF",
                          color: isActive ? "#FFFFFF" : "#5B7A70",
                          border: isActive ? "none" : "1px solid #E2EFE9",
                        }}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>

                {/* Stylized Visual Campus Map Canvas */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "220px",
                    background: "radial-gradient(ellipse at center, #E8F5E9 0%, #D4EDDA 100%)",
                    borderRadius: "20px",
                    border: "2px solid #C8E6C9",
                    overflow: "hidden",
                    marginBottom: "12px",
                    boxShadow: "inset 0 0 20px rgba(6, 95, 70, 0.08)",
                  }}
                >
                  {/* Grid Lines & Garden Pathways */}
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25 }}>
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#059669" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#059669" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="50%" cy="50%" r="60" fill="none" stroke="#059669" strokeWidth="1" />
                    <path d="M 30 180 Q 150 120 280 180" fill="none" stroke="#81C784" strokeWidth="4" />
                  </svg>

                  {/* Location Pins */}
                  {CAMPUS_LOCATIONS.filter((loc) => mapFilter === "Semua" || loc.tag.includes(mapFilter)).map((loc) => {
                    const isSelected = selectedLocation?.id === loc.id;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => {
                          playSoftClick();
                          setSelectedLocation(loc);
                        }}
                        style={{
                          position: "absolute",
                          left: `${loc.posX}%`,
                          top: `${loc.posY}%`,
                          transform: "translate(-50%, -50%)",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          zIndex: isSelected ? 15 : 10,
                          transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                        }}
                      >
                        {/* Radar Pulse if Santri is Here */}
                        {loc.santriHere && (
                          <div
                            style={{
                              position: "absolute",
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              background: "rgba(232, 182, 90, 0.4)",
                              border: "2px solid #E8B65A",
                              animation: "progressPulse 1.5s infinite",
                              pointerEvents: "none",
                            }}
                          />
                        )}

                        {/* Pin Bubble */}
                        <div
                          style={{
                            background: isSelected ? "#06271E" : "#FFFFFF",
                            color: isSelected ? "#FFE49A" : loc.color,
                            width: isSelected ? "36px" : "30px",
                            height: isSelected ? "36px" : "30px",
                            borderRadius: "50%",
                            border: isSelected ? "2px solid #FFE49A" : `2px solid ${loc.color}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: isSelected ? "18px" : "15px",
                            boxShadow: isSelected
                              ? "0 6px 16px rgba(6, 39, 30, 0.35)"
                              : "0 2px 8px rgba(0, 0, 0, 0.12)",
                            transform: isSelected ? "scale(1.15)" : "scale(1)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {loc.icon}
                        </div>

                        {/* Mini Label */}
                        <div
                          style={{
                            marginTop: "2px",
                            background: isSelected ? "#06271E" : "rgba(255, 255, 255, 0.9)",
                            color: isSelected ? "#FFE49A" : "#06271E",
                            fontSize: "9px",
                            fontWeight: 800,
                            padding: "1px 5px",
                            borderRadius: "6px",
                            whiteSpace: "nowrap",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                          }}
                        >
                          {loc.name.split(" ")[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Location Detail Sheet */}
                {selectedLocation && (
                  <div
                    className="fade-in-up"
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "18px",
                      padding: "14px",
                      border: "1px solid #E2EFE9",
                      boxShadow: "0 4px 16px rgba(6, 95, 70, 0.06)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "24px" }}>{selectedLocation.icon}</span>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                            {selectedLocation.name}
                          </div>
                          <span
                            style={{
                              fontSize: "10px",
                              background: "#D1FAE5",
                              color: "#065F46",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              fontWeight: 700,
                            }}
                          >
                            {selectedLocation.tag}
                          </span>
                        </div>
                      </div>

                      {selectedLocation.santriHere && (
                        <span
                          style={{
                            background: "#FFF1D6",
                            color: "#9A6212",
                            border: "1px solid #E8B65A",
                            fontSize: "10px",
                            fontWeight: 800,
                            padding: "3px 6px",
                            borderRadius: "8px",
                          }}
                        >
                          ⭐ Posisi Santri
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: "11px", color: "#5B7A70", margin: "6px 0 10px 0", lineHeight: "1.4" }}>
                      {selectedLocation.description}
                    </p>

                    <div
                      style={{
                        background: "#F4FBF7",
                        borderRadius: "12px",
                        padding: "8px 10px",
                        fontSize: "11px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        marginBottom: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#5B7A70" }}>Status Sesi:</span>
                        <span style={{ fontWeight: 700, color: "#065F46" }}>{selectedLocation.status}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#5B7A70" }}>Penanggung Jawab:</span>
                        <span style={{ fontWeight: 600, color: "#06271E" }}>{selectedLocation.officer}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#5B7A70" }}>Kapasitas:</span>
                        <span style={{ fontWeight: 600, color: "#06271E" }}>{selectedLocation.capacity}</span>
                      </div>
                    </div>

                    {/* Quick Action Button linked to other features */}
                    <button
                      onClick={() => {
                        if (selectedLocation.tag.includes("Ibadah")) {
                          handleActionClick("Membuka Jadwal Salat...", () => {
                            setActiveTab("jurnal");
                            setActiveCategory("salat");
                          });
                        } else if (selectedLocation.tag.includes("Akademik")) {
                          handleActionClick("Membuka Jadwal Kelas...", () => {
                            setActiveTab("jurnal");
                            setActiveCategory("kelas_pagi");
                          });
                        } else if (selectedLocation.tag.includes("Kesehatan")) {
                          handleActionClick("Membuka Rekam Medis...", () => setActiveTab("poskestren"));
                        } else if (selectedLocation.tag.includes("Keamanan")) {
                          handleActionClick("Membuka Gate Pass...", () => setActiveTab("gatepass"));
                        } else {
                          handleActionClick("Membuka Jurnal...", () => setActiveTab("jurnal"));
                        }
                      }}
                      style={{
                        width: "100%",
                        background: "var(--gradient-emerald)",
                        color: "#FFFFFF",
                        padding: "9px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 700,
                        boxShadow: "0 2px 8px rgba(6, 95, 70, 0.2)",
                      }}
                    >
                      Lihat Aktivitas Terkait di Lokasi Ini ➔
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* BOTTOM NAVIGATION BAR (Strictly 5 items per StyleGuide.md Line 67) */}
        {activePersona === "Wali Santri" && (
          <div
            style={{
              background: "#FFFFFF",
              borderTop: "1px solid #E2EFE9",
              display: "flex",
              justifyContent: "space-around",
              padding: "8px 2px 12px 2px",
              boxShadow: "0 -4px 15px rgba(6, 95, 70, 0.04)",
              borderTopLeftRadius: "24px",
              borderTopRightRadius: "24px",
              zIndex: 20,
            }}
          >
            {[
              { id: "jurnal", label: "Jurnal", icon: "" },
              { id: "gatepass", label: "Gate Pass", icon: "" },
              { id: "poskestren", label: "Kesehatan", icon: "" },
              { id: "adab", label: "Rapor Adab", icon: "" },
              { id: "peta", label: "Peta Ponpes", icon: "" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleBottomTabSwitch(tab.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    padding: "4px 6px",
                    borderRadius: "12px",
                    color: isActive ? "#059669" : "#8AA49B",
                    transform: isActive ? "translateY(-2px)" : "none",
                    transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <span style={{ fontSize: "15px" }}>{tab.icon}</span>
                  <span style={{ fontSize: "9.5px", fontWeight: isActive ? 800 : 500 }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {/* ================================================================
            MODAL 1: TOP-UP UANG SAKU DIGITAL SANTRI
           ================================================================ */}
        {isTopUpModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(6, 39, 30, 0.75)",
              backdropFilter: "blur(6px)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <div
              className="fade-in-up"
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                padding: "22px",
                width: "350px",
                maxWidth: "92vw",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                border: "1px solid #E2EFE9",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#06271E" }}>
                    Top-Up Uang Saku
                  </h4>
                  <p style={{ fontSize: "11px", color: "#5B7A70" }}>
                    Untuk: {currentStudent.name} ({currentStudent.class})
                  </p>
                </div>
                <button
                  onClick={() => setIsTopUpModalOpen(false)}
                  style={{
                    background: "#F3F4F6",
                    border: "none",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    color: "#4B5563",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Virtual Account Box */}
              <div
                style={{
                  background: "#F4FBF7",
                  border: "1px dashed #10B981",
                  borderRadius: "14px",
                  padding: "10px 12px",
                  marginBottom: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "10px", color: "#065F46", fontWeight: 700 }}>
                    BANK SYARIAH INDONESIA (BSI) VA
                  </div>
                  <div className="tabular-nums" style={{ fontSize: "13px", fontWeight: 800, color: "#06271E", letterSpacing: "0.05em" }}>
                    {walletData.vaNumber}
                  </div>
                </div>
                <button
                  onClick={() => {
                    playSuccessChime();
                    alert("Nomor Virtual Account BSI berhasil disalin!");
                  }}
                  style={{
                    background: "#065F46",
                    color: "#FFFFFF",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  Salin
                </button>
              </div>

              {/* Nominal Preset Buttons */}
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#06271E", display: "block", marginBottom: "6px" }}>
                Pilih Nominal Top-Up:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                {[50000, 100000, 200000, 500000].map((amt) => {
                  const isSelected = topUpAmount === amt;
                  return (
                    <button
                      key={amt}
                      onClick={() => setTopUpAmount(amt)}
                      style={{
                        padding: "10px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: isSelected ? 800 : 600,
                        background: isSelected ? "var(--gradient-emerald)" : "#F4FBF7",
                        color: isSelected ? "#FFFFFF" : "#06271E",
                        border: isSelected ? "1px solid #FFE49A" : "1px solid #E2EFE9",
                        boxShadow: isSelected ? "0 4px 10px rgba(6, 95, 70, 0.2)" : "none",
                      }}
                    >
                      Rp {amt.toLocaleString("id-ID")}
                    </button>
                  );
                })}
              </div>

              {/* Limit Info Notice */}
              <div
                style={{
                  background: "#FFF1D6",
                  border: "1px solid #E8B65A",
                  borderRadius: "10px",
                  padding: "8px 10px",
                  fontSize: "10.5px",
                  color: "#9A6212",
                  marginBottom: "16px",
                  lineHeight: "1.4",
                }}
              >
                <b>Batas Harian:</b> Maksimal jajan Rp 25.000 / hari untuk melatih kedisiplinan hidup hemat santri.
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleTopUpSubmit}
                  style={{
                    flex: 1,
                    background: "var(--gradient-emerald)",
                    color: "#FFFFFF",
                    padding: "12px",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "13px",
                    boxShadow: "0 4px 12px rgba(6, 95, 70, 0.3)",
                  }}
                >
                   Konfirmasi & Top-Up
                </button>
                <button
                  onClick={() => setIsTopUpModalOpen(false)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    background: "#F3F4F6",
                    color: "#4B5563",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            MODAL 2: RIWAYAT TRANSAKSI UANG SAKU & BELANJA KANTIN
           ================================================================ */}
        {isWalletHistoryModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(6, 39, 30, 0.75)",
              backdropFilter: "blur(6px)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <div
              className="fade-in-up"
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                padding: "20px",
                width: "360px",
                maxWidth: "92vw",
                maxHeight: "80vh",
                overflowY: "auto",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                border: "1px solid #E2EFE9",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#06271E" }}>
                    Riwayat Uang Saku
                  </h4>
                  <p style={{ fontSize: "11px", color: "#5B7A70" }}>
                    Saldo Saat Ini: <b style={{ color: "#065F46" }}>Rp {walletData.balance.toLocaleString("id-ID")}</b>
                  </p>
                </div>
                <button
                  onClick={() => setIsWalletHistoryModalOpen(false)}
                  style={{
                    background: "#F3F4F6",
                    border: "none",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    color: "#4B5563",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Transactions List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                {walletData.transactions.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <div
                      key={tx.id}
                      style={{
                        background: "#F9FAFB",
                        borderRadius: "14px",
                        padding: "10px 12px",
                        border: "1px solid #E5E7EB",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span style={{ fontSize: "22px" }}>{tx.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#06271E" }}>
                          {tx.title}
                        </div>
                        <div style={{ fontSize: "10px", color: "#8AA49B" }}>
                          {tx.merchant} · {tx.time}
                        </div>
                      </div>
                      <div
                        className="tabular-nums"
                        style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          color: isCredit ? "#059669" : "#B42318",
                        }}
                      >
                        {isCredit ? "+" : ""}Rp {Math.abs(tx.amount).toLocaleString("id-ID")}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setIsWalletHistoryModalOpen(false)}
                style={{
                  width: "100%",
                  background: "var(--gradient-emerald)",
                  color: "#FFFFFF",
                  padding: "11px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >
                Tutup Riwayat
              </button>
            </div>
          </div>
        )}

        {/* ================================================================
            MODAL 3: VIDEO PLAYER KAJIAN ADAB SANTRI (TASK 4.4)
           ================================================================ */}
        {isVideoModalOpen && selectedKajianVideo && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(6, 39, 30, 0.85)",
              backdropFilter: "blur(8px)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <div
              className="fade-in-up"
              style={{
                background: "#06271E",
                borderRadius: "24px",
                padding: "18px",
                width: "360px",
                maxWidth: "92vw",
                maxHeight: "85vh",
                overflowY: "auto",
                boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
                border: "1px solid #FFE49A",
                color: "#FFFFFF",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <span
                    style={{
                      background: "rgba(255, 228, 154, 0.2)",
                      color: "#FFE49A",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 800,
                    }}
                  >
                    {selectedKajianVideo.tag}
                  </span>
                  <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF", marginTop: "4px", lineHeight: "1.3" }}>
                    {selectedKajianVideo.title}
                  </h4>
                  <p style={{ fontSize: "11px", color: "#A7F3D0" }}>
                    {selectedKajianVideo.speaker} · {selectedKajianVideo.speakerRole}
                  </p>
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    color: "#FFFFFF",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Simulated Video Player Canvas */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "170px",
                  background: "#000000",
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "12px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
                  marginBottom: "12px",
                }}
              >
                {/* 1080p Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "#FFFFFF",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "9px",
                      fontWeight: 700,
                    }}
                  >
                    1080p Full HD
                  </span>
                  <span style={{ fontSize: "10px", color: "#A7F3D0" }}>
                    {selectedKajianVideo.views}
                  </span>
                </div>

                {/* Animated Equalizer Waves (Representing Playing Lecture) */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  {isPlayingVideo ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {[18, 32, 24, 40, 20, 28, 14].map((h, i) => (
                        <span
                          key={i}
                          style={{
                            width: "4px",
                            height: `${h}px`,
                            background: "linear-gradient(180deg, #FFE49A, #10B981)",
                            borderRadius: "2px",
                            animation: `pulseRing ${1 + i * 0.15}s ease-in-out infinite alternate`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: "36px", opacity: 0.8 }}>⏸️</div>
                  )}
                </div>

                {/* Video Controls Bar */}
                <div>
                  <div
                    style={{
                      height: "4px",
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "2px",
                      overflow: "hidden",
                      marginBottom: "6px",
                    }}
                  >
                    <div style={{ width: "28%", height: "100%", background: "#10B981" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#D1FAE5" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#FFE49A",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        {isPlayingVideo ? "⏸️ Jeda" : "▶️ Putar"}
                      </button>
                      <span className="tabular-nums">04:15 / {selectedKajianVideo.duration}</span>
                    </div>
                    <span>Stereo</span>
                  </div>
                </div>
              </div>

              {/* Rangkuman Intisari Poin Kajian */}
              <div
                style={{
                  background: "#0D4332",
                  borderRadius: "14px",
                  padding: "12px",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  marginBottom: "14px",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#FFE49A", marginBottom: "6px" }}>
                  Ringkasan & Intisari Nasihat:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {selectedKajianVideo.keyPoints.map((point, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "6px", fontSize: "11px", color: "#E2EFE9", lineHeight: "1.4" }}>
                      <span style={{ color: "#FFE49A", fontWeight: 800 }}>•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    playSuccessChime();
                    alert("Rangkuman Nasihat Adab Santri PDF berhasil diunduh!");
                  }}
                  style={{
                    flex: 1,
                    background: "var(--gradient-gold)",
                    color: "#06271E",
                    padding: "10px",
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: "11px",
                  }}
                >
                  Unduh Rangkuman PDF
                </button>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.1)",
                    color: "#FFFFFF",
                    fontSize: "11px",
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ================================================================
            MODAL 4: KARTU IDENTITAS DIGITAL SANTRI (ED25519 & RFID)
           ================================================================ */}
        {isIdCardModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(6, 39, 30, 0.85)",
              backdropFilter: "blur(8px)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <div
              className="fade-in-up"
              style={{
                background: "#06271E",
                borderRadius: "24px",
                padding: "20px",
                width: "360px",
                maxWidth: "92vw",
                border: "2px solid #FFE49A",
                color: "#FFFFFF",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", color: "#FFE49A", fontWeight: 800 }}>
                  🪪 KARTU SANTRI DIGITAL RESMI
                </span>
                <button
                  onClick={() => setIsIdCardModalOpen(false)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    color: "#FFFFFF",
                    fontSize: "12px",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* CARD CONTAINER (FRONT / BACK FLIP) */}
              {!isIdCardFlipped ? (
                /* FRONT OF CARD */
                <div
                  style={{
                    background: "linear-gradient(145deg, #065F46 0%, #06271E 100%)",
                    borderRadius: "20px",
                    padding: "16px",
                    border: "1px solid rgba(232, 182, 90, 0.5)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    position: "relative",
                    overflow: "hidden",
                    marginBottom: "14px",
                  }}
                >
                  {/* Watermark Islamic Star */}
                  <div style={{ position: "absolute", right: "-20px", top: "-20px", opacity: 0.08, pointerEvents: "none" }}>
                    <svg width="140" height="140" viewBox="0 0 100 100" fill="#FFE49A">
                      <polygon points="50,0 65,35 100,50 65,65 50,100 35,65 0,50 35,35" />
                    </svg>
                  </div>

                  {/* Header Pesantren */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid rgba(255,228,154,0.3)", paddingBottom: "10px", marginBottom: "12px" }}>
                    <img src="/logo_tile_1024.png" alt="Logo" style={{ width: "36px", height: "36px", borderRadius: "8px" }} />
                    <div>
                      <div style={{ fontSize: "10px", color: "#FFE49A", fontWeight: 800, letterSpacing: "0.03em" }}>
                        PONDOK PESANTREN DARUSSALAM
                      </div>
                      <div style={{ fontSize: "9px", color: "#A7F3D0" }}>
                        RAJAPOLAH · TASIKMALAYA · JAWA BARAT
                      </div>
                    </div>
                  </div>

                  {/* Body: Photo, Info, and Ed25519 QR */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ position: "relative" }}>
                      <img
                        src={currentStudent.photo}
                        alt={currentStudent.name}
                        style={{
                          width: "72px",
                          height: "90px",
                          borderRadius: "12px",
                          objectFit: "cover",
                          border: "2px solid #FFE49A",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: "4px",
                          left: "4px",
                          background: "#10B981",
                          color: "#FFFFFF",
                          fontSize: "8px",
                          fontWeight: 800,
                          padding: "1px 4px",
                          borderRadius: "4px",
                        }}
                      >
                        AKTIF
                      </span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF" }}>
                        {currentStudent.name}
                      </div>
                      <div className="tabular-nums" style={{ fontSize: "11px", color: "#FFE49A", fontWeight: 700, marginTop: "2px" }}>
                        NIS: {currentStudent.nis}
                      </div>
                      <div style={{ fontSize: "10px", color: "#D1FAE5", marginTop: "2px" }}>
                        {currentStudent.class}
                      </div>
                      <div style={{ fontSize: "9.5px", color: "#8AA49B", marginTop: "1px" }}>
                        {currentStudent.dorm}
                      </div>
                    </div>

                    {/* QR Code */}
                    <div
                      style={{
                        background: "#FFFFFF",
                        padding: "6px",
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <img src="/logo_tile_1024.png" alt="QR" style={{ width: "48px", height: "48px", borderRadius: "6px" }} />
                      <span style={{ fontSize: "7px", color: "#06271E", fontWeight: 800, marginTop: "2px" }}>
                        SRJ1-Ed25519
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Strip */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "9px", color: "#A7F3D0", borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: "8px" }}>
                    <span>RFID / NFC: <b>04:8A:F2:C1</b></span>
                    <span>Masa Berlaku: <b>2026 – 2029</b></span>
                  </div>
                </div>
              ) : (
                /* BACK OF CARD */
                <div
                  style={{
                    background: "linear-gradient(145deg, #0D4332 0%, #06271E 100%)",
                    borderRadius: "20px",
                    padding: "16px",
                    border: "1px solid rgba(232, 182, 90, 0.5)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ fontSize: "11px", color: "#FFE49A", fontWeight: 800, marginBottom: "6px", textAlign: "center" }}>
                    PANCA JIWA PONDOK PESANTREN
                  </div>
                  <div style={{ fontSize: "9.5px", color: "#D1FAE5", lineHeight: "1.5", textAlign: "center", marginBottom: "12px" }}>
                    1. Keikhlasan · 2. Kesederhanaan · 3. Berdikari<br />
                    4. Ukhuwah Islamiyah · 5. Kebebasan
                  </div>

                  <div style={{ fontSize: "10px", color: "#FFE49A", fontWeight: 700, marginBottom: "4px" }}>
                    Ketentuan Kartu:
                  </div>
                  <div style={{ fontSize: "8.5px", color: "#8AA49B", lineHeight: "1.4", marginBottom: "12px" }}>
                    • Kartu ini adalah identitas resmi santri untuk presensi kelas, salat, tahfidz, dan dompet jajan kantin/koperasi.<br />
                    • Penyalahgunaan atau peminjaman kartu kepada orang lain akan dicatat sebagai pelanggaran adab.
                  </div>

                  {/* Signature Section */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: "8px" }}>
                    <div style={{ fontSize: "8px", color: "#A7F3D0" }}>
                      Tasikmalaya, Juli 2026<br />
                      Pimpinan Pondok Pesantren
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "10px", fontWeight: 800, color: "#FFE49A" }}>
                        K.H. Hasan Basri
                      </div>
                      <div style={{ fontSize: "8px", color: "#8AA49B" }}>
                        Direktur Pengasuhan Santri
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setIsIdCardFlipped(!isIdCardFlipped)}
                  style={{
                    flex: 1,
                    background: "rgba(232, 182, 90, 0.2)",
                    border: "1px solid #FFE49A",
                    color: "#FFE49A",
                    padding: "10px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "11px",
                  }}
                >
                  {isIdCardFlipped ? "Lihat Sisi Depan" : "Balik Kartu (Panca Jiwa)"}
                </button>
                <button
                  onClick={() => setIsIdCardModalOpen(false)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px",
                    background: "#059669",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "11px",
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            MODAL 5: LEMBAR MUTABA'AH TAHFIDZ & DOA WALI SANTRI
           ================================================================ */}
        {isTahfidzModalOpen && selectedTahfidzItem && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(6, 39, 30, 0.85)",
              backdropFilter: "blur(8px)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <div
              className="fade-in-up"
              style={{
                background: "#06271E",
                borderRadius: "24px",
                padding: "20px",
                width: "360px",
                maxWidth: "92vw",
                maxHeight: "85vh",
                overflowY: "auto",
                border: "1px solid #FFE49A",
                color: "#FFFFFF",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <span
                    style={{
                      background: "#D1FAE5",
                      color: "#065F46",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 800,
                    }}
                  >
                    MUTABA'AH TAHFIDZ
                  </span>
                  <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#FFE49A", marginTop: "4px" }}>
                    {selectedTahfidzItem.subject}
                  </h4>
                  <p style={{ fontSize: "11px", color: "#A7F3D0" }}>
                    {currentStudent.name} · {selectedTahfidzItem.time}
                  </p>
                </div>
                <button
                  onClick={() => setIsTahfidzModalOpen(false)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    color: "#FFFFFF",
                    fontSize: "12px",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Setoran Surah & Nilai Card */}
              <div
                style={{
                  background: "#0D4332",
                  borderRadius: "16px",
                  padding: "14px",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#FFFFFF" }}>
                    {selectedTahfidzItem.surah}
                  </div>
                  <span
                    style={{
                      background: "rgba(232, 182, 90, 0.2)",
                      color: "#FFE49A",
                      border: "1px solid #FFE49A",
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: "6px",
                    }}
                  >
                    {selectedTahfidzItem.verses}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#A7F3D0" }}>Penilaian Kualitas:</span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#34D399" }}>
                    ⭐ {selectedTahfidzItem.status}
                  </span>
                </div>
              </div>

              {/* Simulated Ustaz Audio Evaluation Player */}
              <div
                style={{
                  background: "#082E23",
                  borderRadius: "14px",
                  padding: "12px",
                  border: "1px solid rgba(232, 182, 90, 0.2)",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#FFE49A" }}>
                    Rekaman Catatan Ustaz Pembimbing
                  </div>
                  <span style={{ fontSize: "10px", color: "#8AA49B" }}>00:45</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => {
                      playSoftClick();
                      setIsTahfidzAudioPlaying(!isTahfidzAudioPlaying);
                    }}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "var(--gradient-emerald)",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    {isTahfidzAudioPlaying ? "⏸️" : "▶️"}
                  </button>

                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "3px" }}>
                    {[12, 22, 16, 28, 14, 26, 18, 30, 10, 24, 16, 20].map((h, i) => (
                      <span
                        key={i}
                        style={{
                          width: "3px",
                          height: `${h}px`,
                          background: isTahfidzAudioPlaying ? "#10B981" : "#5B7A70",
                          borderRadius: "2px",
                          transition: "all 0.2s ease",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: "11px", color: "#D1FAE5", fontStyle: "italic", marginTop: "8px", lineHeight: "1.4" }}>
                  "{selectedTahfidzItem.notes}"
                </div>
              </div>

              {/* Kirim Doa / Apresiasi Orang Tua */}
              <div
                style={{
                  background: tahfidzDoaSent ? "#065F46" : "rgba(255, 255, 255, 0.06)",
                  border: tahfidzDoaSent ? "1px solid #FFE49A" : "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "14px",
                  padding: "12px",
                  marginBottom: "14px",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                }}
              >
                {tahfidzDoaSent ? (
                  <div className="fade-in-up">
                    
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#FFE49A" }}>
                      Doa & Apresiasi Telah Terkirim!
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#D1FAE5", marginTop: "2px" }}>
                      "Barakallahu fiik ananda tercinta, semoga istiqomah menghafal Al-Qur'an."
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "11px", color: "#A7F3D0", marginBottom: "8px" }}>
                      Beri dorongan semangat untuk hafalan ananda hari ini:
                    </div>
                    <button
                      onClick={handleSendTahfidzDoa}
                      style={{
                        background: "var(--gradient-gold)",
                        color: "#06271E",
                        padding: "8px 14px",
                        borderRadius: "10px",
                        fontWeight: 800,
                        fontSize: "11px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 2px 8px rgba(232, 182, 90, 0.4)",
                      }}
                    >
                      
                      <span>Kirim Doa & Apresiasi Orang Tua</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsTahfidzModalOpen(false)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.12)",
                  color: "#FFFFFF",
                  padding: "10px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                Tutup Lembar Mutaba'ah
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
