import React, { useState, useEffect } from "react";
import { getActivePrayerSessionByTime, INITIAL_STUDENTS } from "../../data/mockData";
import { playSoftClick, playSuccessChime, playWarningTone, triggerHaptic } from "../../utils/audio";

export default function PortalUbudiyyahView({ onTriggerLoader, onAuditLogAdd, currentTenant }) {
  const [activePrayer, setActivePrayer] = useState(getActivePrayerSessionByTime());
  const [currentTimeStr, setCurrentTimeStr] = useState("15:30 WIB");
  const [scannerStatus, setScannerStatus] = useState("idle");
  const [scannerMsg, setScannerMsg] = useState("");
  const [scannedPrayerCount, setScannedPrayerCount] = useState(1240);

  // Auto-detect prayer session by time every second
  useEffect(() => {
    const updateTimeAndPrayer = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
      );
      setActivePrayer(getActivePrayerSessionByTime(now));
    };

    updateTimeAndPrayer();
    const interval = setInterval(updateTimeAndPrayer, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  // Presensi Otomatis Berdasarkan Waktu Salat
  const handleScanPrayerAttendance = (forceMasbuk = false, isDuplicate = false) => {
    playSoftClick();
    triggerHaptic([40]);
    setScannerStatus("scanning");
    setScannerMsg(`Mendeteksi kartu santri untuk ${activePrayer.name}...`);

    onTriggerLoader(
      isDuplicate
        ? "Mengecek Anti-Duplikasi Salat..."
        : `Mencatat Presensi ${activePrayer.name} Otomatis by Waktu...`,
      () => {
        if (isDuplicate) {
          playWarningTone();
          // Getar di hp pengguna (tanpa goyang layout)
          triggerHaptic([150, 70, 150]);

          setScannerStatus("duplicate");
          setScannerMsg(`⚠️ Santri Ahmad Fauzan SUDAH tercatat pada ${activePrayer.name} hari ini!`);

          onAuditLogAdd({
            user: "Ustaz Zaid (Ubudiyyah)",
            role: "Ubudiyyah",
            action: "DUPLIKASI SALAT DITOLAK",
            object: `Santri: Ahmad Fauzan (${activePrayer.name})`,
            status: "DITOLAK",
            details: "Santri sudah terverifikasi hadir di masjid. Pemindaian ganda dicegah.",
          });
        } else if (forceMasbuk) {
          // Status otomatis Masbuk karena waktu melebihi batas toleransi
          playSuccessChime();
          triggerHaptic([60, 40]);

          setScannerStatus("success");
          setScannerMsg(`🕌 Ahmad Fauzan — Tercatat MASBUK pada ${activePrayer.name} (Waktu Pindai: ${currentTimeStr})`);

          onAuditLogAdd({
            user: "Ustaz Zaid (Ubudiyyah)",
            role: "Ubudiyyah",
            action: "PRESENSI SALAT (MASBUK)",
            object: `Santri: Ahmad Fauzan (${activePrayer.name})`,
            status: "MASBUK",
            details: `Santri tercatat masbuk otomatis berdasarkan jam masuk masjid (${currentTimeStr}).`,
          });
        } else {
          // Status otomatis Hadir Tepat Waktu
          playSuccessChime();
          triggerHaptic([80]);

          setScannerStatus("success");
          setScannerMsg(`⭐ Ahmad Fauzan — HADIR TEPAT WAKTU pada ${activePrayer.name}!`);
          setScannedPrayerCount((prev) => prev + 1);

          onAuditLogAdd({
            user: "Ustaz Zaid (Ubudiyyah)",
            role: "Ubudiyyah",
            action: "PRESENSI SALAT (TEPAT WAKTU)",
            object: `Santri: Ahmad Fauzan (${activePrayer.name})`,
            status: "SUKSES",
            details: `Santri hadir tepat waktu di masjid sebelum batas toleransi ${activePrayer.tolerance} WIB.`,
          });
        }
      }
    );
  };

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
      {/* Header Ubudiyyah */}
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
            <span style={{ fontSize: "20px" }}>🕌</span>
            <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#FFFFFF" }}>
              Biro Ubudiyyah · Presensi Salat Berjamaah
            </h2>
            <span
              style={{
                background: "rgba(232, 182, 90, 0.2)",
                color: "#FFE49A",
                border: "1px solid #FFE49A",
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              Deteksi Otomatis Jam Sholat
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#A7F3D0", marginTop: "3px" }}>
            Petugas: Ustaz Zaid · Lokasi: Masjid Jami' Raudhatul Hasanah
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#A7F3D0" }}>Sesi Aktif Saat Ini:</div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#34D399" }}>
            🕋 {activePrayer.name} ({activePrayer.start} – {activePrayer.end} WIB)
          </div>
        </div>
      </div>

      {/* Banner Sesi Salat Otomatis Berdasarkan Waktu */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "18px",
          padding: "16px 20px",
          border: "1px solid #E2EFE9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#06271E" }}>
            Waktu Salat Dideteksi Otomatis by Waktu:
          </div>
          <div style={{ fontSize: "11.5px", color: "#5B7A70", marginTop: "2px" }}>
            Jam sekarang: <strong>{currentTimeStr}</strong>. Sistem otomatis membuka sesi <strong>{activePrayer.name}</strong> tanpa perlu memilih manual.
          </div>
          <div style={{ fontSize: "11px", color: "#065F46", marginTop: "4px" }}>
            Toleransi Tepat Waktu: Sebelum pukul <strong>{activePrayer.tolerance} WIB</strong> (Lewat dari itu otomatis berstatus <strong>Masbuk</strong>).
          </div>
        </div>

        <span
          style={{
            background: "#D1FAE5",
            color: "#065F46",
            padding: "6px 14px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 800,
          }}
        >
          🟢 Sesi {activePrayer.name} Sedang Aktif
        </span>
      </div>

      {/* Grid: Viewfinder Pemindai Kamera Pintu Masjid & Status Jamaah */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        {/* KOLOM KIRI: SCANNER PINTU MASJID */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            padding: "20px",
            border: scannerStatus === "duplicate" ? "1.5px solid #D97706" : "1px solid #E2EFE9",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
              📷 Kamera Pemindai Pintu Masuk Masjid
            </div>
            <span style={{ fontSize: "10px", background: "#D1FAE5", color: "#065F46", padding: "2px 8px", borderRadius: "8px", fontWeight: 700 }}>
              🟢 Deteksi Jam Salat
            </span>
          </div>

          {/* Viewfinder Reticle */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "220px",
              background: "#06271E",
              borderRadius: "16px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #0D4332",
            }}
          >
            <div
              style={{
                width: "150px",
                height: "150px",
                border: "2px dashed #FFE49A",
                borderRadius: "14px",
                position: "relative",
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
                  background: "#FFE49A",
                  boxShadow: "0 0 10px #FFE49A",
                  animation: "scannerSweep 2s infinite ease-in-out",
                }}
              />
              <span style={{ fontSize: "11px", color: "#FFE49A", fontWeight: 700, textAlign: "center" }}>
                Tempel Kartu / Arahkan QR
              </span>
            </div>

            <div style={{ position: "absolute", bottom: "8px", left: "10px", fontSize: "10px", color: "#A7F3D0" }}>
              Scanner Masjid Jami'
            </div>
          </div>

          {scannerMsg && (
            <div
              style={{
                marginTop: "12px",
                padding: "10px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 700,
                background:
                  scannerStatus === "duplicate"
                    ? "#FFFBEB"
                    : "#D1FAE5",
                color:
                  scannerStatus === "duplicate"
                    ? "#92400E"
                    : "#065F46",
                border:
                  scannerStatus === "duplicate"
                    ? "1px solid #FCD34D"
                    : "1px solid #A7F3D0",
              }}
            >
              {scannerMsg}
            </div>
          )}

          {/* Action Buttons untuk Simulasi Sesuai Waktu */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "14px" }}>
            <button
              onClick={() => handleScanPrayerAttendance(false, false)}
              style={{
                padding: "10px 6px",
                borderRadius: "10px",
                background: "var(--gradient-emerald)",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
              }}
            >
              ✨ Tepat Waktu
            </button>
            <button
              onClick={() => handleScanPrayerAttendance(true, false)}
              style={{
                padding: "10px 6px",
                borderRadius: "10px",
                background: "#FEF3C7",
                color: "#92400E",
                border: "1px solid #FCD34D",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              ⏱️ Masbuk
            </button>
            <button
              onClick={() => handleScanPrayerAttendance(false, true)}
              style={{
                padding: "10px 6px",
                borderRadius: "10px",
                background: "rgba(217, 119, 6, 0.15)",
                color: "#92400E",
                border: "1px solid #FCD34D",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
              }}
              title="Menguji getar ganda pada ponsel petugas"
            >
              ⚡ Uji Getar
            </button>
          </div>
        </div>

        {/* KOLOM KANAN: REKAP JAMAAH ASRAMA */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            padding: "20px",
            border: "1px solid #E2EFE9",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
            📋 Rekap Kehadiran {activePrayer.name} Per Asrama
          </div>

          {[
            { komplek: "Asrama Abu Bakar Ash-Shiddiq", count: "318 / 320", rate: "99.3%", status: "Selesai" },
            { komplek: "Asrama Umar bin Khattab", count: "310 / 315", rate: "98.4%", status: "Selesai" },
            { komplek: "Asrama Ali bin Abi Thalib", count: "295 / 300", rate: "98.3%", status: "Selesai" },
            { komplek: "Asrama Fatimah Az-Zahra", count: "317 / 318", rate: "99.6%", status: "Selesai" },
          ].map((asrama, i) => (
            <div
              key={i}
              style={{
                background: "#F4FBF7",
                borderRadius: "12px",
                padding: "10px 14px",
                border: "1px solid #E2EFE9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#06271E" }}>{asrama.komplek}</div>
                <div style={{ fontSize: "10px", color: "#5B7A70" }}>Santri Hadir: {asrama.count}</div>
              </div>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669" }}>
                {asrama.rate}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
