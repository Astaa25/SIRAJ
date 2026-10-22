import React, { useState, useEffect } from "react";
import { INITIAL_GATE_PASS, INITIAL_STUDENTS } from "../../data/mockData";
import { playSoftClick, playSuccessChime, playWarningTone, triggerHaptic } from "../../utils/audio";

export default function PortalSatpamView({ onTriggerLoader, onAuditLogAdd }) {
  const [scanResult, setScanResult] = useState(null); // null, { status: "approved" | "rejected", data: ... }
  const [popupSeconds, setPopupSeconds] = useState(5);
  const [isScanning, setIsScanning] = useState(false);
  const [clearanceHistory, setClearanceHistory] = useState([
    {
      id: "cl-1",
      santriName: "Ahmad Fauzan",
      nis: "2026070114",
      time: "16:20 WIB",
      picker: "Ir. H. Abdullah (Ayah)",
      status: "SAH",
    },
  ]);

  // Timer auto close 5 detik untuk notif / pop-up izin
  useEffect(() => {
    if (!scanResult) return;
    setPopupSeconds(5);
    const interval = setInterval(() => {
      setPopupSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setScanResult(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [scanResult]);

  // Tombol Scan Langsung Cepat (Mendeteksi QR Gate Pass Otomatis)
  const handlePerformDirectScan = (isApproved = true) => {
    playSoftClick();
    triggerHaptic([50]);
    setIsScanning(true);
    setScanResult(null);

    onTriggerLoader(
      isApproved
        ? "Membaca Kode QR Gate Pass Santri & Memverifikasi Izin Resmi..."
        : "Memverifikasi Kode QR Gate Pass...",
      () => {
        setIsScanning(false);

        if (isApproved) {
          playSuccessChime();
          triggerHaptic([80]);

          const resultData = {
            status: "approved",
            student: INITIAL_STUDENTS[0],
            pass: INITIAL_GATE_PASS,
            verifiedAt: "16:45 WIB (Hari Ini)",
          };
          setScanResult(resultData);

          setClearanceHistory((prev) => [
            {
              id: "cl-" + Date.now(),
              santriName: INITIAL_STUDENTS[0].name,
              nis: INITIAL_STUDENTS[0].nis,
              time: "16:45 WIB",
              picker: INITIAL_GATE_PASS.authorizedPicker,
              status: "SAH",
            },
            ...prev,
          ]);

          onAuditLogAdd({
            user: "Pak Slamet (Satpam Gerbang Utama)",
            role: "Satpam",
            action: "GATE PASS VERIFIKASI SAH",
            object: `Santri: ${INITIAL_STUDENTS[0].name} (GP-20261022)`,
            status: "SUKSES",
            details: `Gate pass 24 jam terverifikasi sah. Penjemput ${INITIAL_GATE_PASS.authorizedPicker} cocok NIK ${INITIAL_GATE_PASS.pickerNik}. Gerbang dibuka.`,
          });
        } else {
          playWarningTone();
          triggerHaptic([120, 60, 120]); // Getar ganda penolakan keras

          const resultData = {
            status: "rejected",
            student: {
              name: "Santri Tidak Terdaftar / Izin Belum Terbit",
              nis: "2026070999",
              class: "Tidak Memiliki Izin Pulang Hari Ini",
              photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80",
            },
            reason: "Token QR Tidak Terdaftar di Server atau Belum Disetujui Kepala Pengasuhan",
            verifiedAt: "16:46 WIB",
          };
          setScanResult(resultData);

          onAuditLogAdd({
            user: "Pak Slamet (Satpam Gerbang Utama)",
            role: "Satpam",
            action: "GATE PASS DITOLAK",
            object: "Percobaan Penjemputan Tanpa Izin",
            status: "DITOLAK",
            details: "Kode QR tidak sah / belum memiliki izin resmi. Santri DILARANG keluar dari gerbang pondok.",
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
      {/* Header Satpam */}
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
            <span style={{ fontSize: "20px" }}>🛡️</span>
            <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#FFFFFF" }}>
              Pos Keamanan Gerbang Utama (Satpam Ponpes)
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
              Verifikasi Atomik Gate Pass
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#FFE49A", marginTop: "3px" }}>
            Petugas Piket Gerbang: Pak Slamet & Pak Mulyadi · Pos Gerbang Depan
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#A7F3D0" }}>Sistem Keamanan:</div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#FFE49A" }}>
            Anti-Penculikan & Perlindungan Santri
          </div>
        </div>
      </div>

      {/* Main Scanner Section with Big Direct Scan Buttons */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          padding: "24px",
          border: "1px solid #E2EFE9",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#06271E", marginBottom: "6px" }}>
            📷 Pindai QR Gate Pass Penjemputan Santri
          </h3>
          <p style={{ fontSize: "12px", color: "#5B7A70", marginBottom: "18px" }}>
            Cukup klik tombol di bawah untuk langsung memindai QR kartu / ponsel penjemput.
            Sistem langsung mencocokkan foto santri, nama wali, dan NIK KTP yang sah!
          </p>

          {/* Action Direct Scan Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => handlePerformDirectScan(true)}
              style={{
                background: "var(--gradient-emerald)",
                color: "#FFFFFF",
                padding: "14px 28px",
                borderRadius: "16px",
                fontSize: "14px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 6px 20px rgba(6, 95, 70, 0.35)",
              }}
            >
              <span style={{ fontSize: "18px" }}>📷</span>
              <span>Pindai QR Gate Pass (Tes Izin Sah)</span>
            </button>

            <button
              onClick={() => handlePerformDirectScan(false)}
              style={{
                background: "#FEF2F2",
                color: "#B42318",
                border: "1.5px solid #FCA5A5",
                padding: "14px 20px",
                borderRadius: "16px",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Menguji deteksi penolakan jika penjemput tidak memiliki izin resmi"
            >
              <span>❌</span>
              <span>Uji Scan Gagal (Izin Ditolak)</span>
            </button>
          </div>
        </div>

        {/* Floating Modal / Pop-up Notif Izin Sah / Ditolak (Auto close 5 detik) */}
        {scanResult && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(6, 39, 30, 0.65)",
              backdropFilter: "blur(6px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              animation: "fadeIn 0.25s ease-out",
            }}
            onClick={() => setScanResult(null)}
          >
            <div
              className="pop-in"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "460px",
                background: scanResult.status === "approved" ? "#FFFFFF" : "#FFF8F8",
                borderRadius: "24px",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
                border: scanResult.status === "approved" ? "2px solid #10B981" : "2px solid #EF4444",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Progress bar countdown 5 detik */}
              <div
                style={{
                  height: "5px",
                  background: scanResult.status === "approved" ? "#E2EFE9" : "#FEE2E2",
                  width: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: scanResult.status === "approved" ? "linear-gradient(90deg, #10B981, #059669)" : "#EF4444",
                    animation: "shrinkBar 5s linear forwards",
                  }}
                />
              </div>

              <div style={{ padding: "22px" }}>
                {/* Header Popup */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: scanResult.status === "approved" ? "#10B981" : "#EF4444",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                        fontWeight: 900,
                        boxShadow: scanResult.status === "approved" ? "0 4px 14px rgba(16, 185, 129, 0.4)" : "0 4px 14px rgba(239, 68, 68, 0.4)",
                      }}
                    >
                      {scanResult.status === "approved" ? "✓" : "✕"}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 900,
                          color: scanResult.status === "approved" ? "#065F46" : "#B42318",
                          letterSpacing: "0.2px",
                        }}
                      >
                        {scanResult.status === "approved" ? "GERBANG DIBUKA — SAH" : "DITOLAK — TIDAK SAH"}
                      </div>
                      <div style={{ fontSize: "11px", color: "#5B7A70" }}>
                        Auto-close dalam 5 detik · {scanResult.verifiedAt}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setScanResult(null)}
                    style={{
                      border: "none",
                      background: "#F3F4F6",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      cursor: "pointer",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6B7280",
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Content Details */}
                {scanResult.status === "approved" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div
                      style={{
                        background: "linear-gradient(135deg, #06271E 0%, #0D4332 100%)",
                        borderRadius: "16px",
                        padding: "14px",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        border: "1px solid rgba(232, 182, 90, 0.35)",
                      }}
                    >
                      <img
                        src={scanResult.student.photo}
                        alt={scanResult.student.name}
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "12px",
                          border: "2px solid #FFE49A",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "15px", fontWeight: 800, color: "#FFFFFF" }}>
                          {scanResult.student.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#FFE49A" }}>
                          NIS: {scanResult.student.nis} · {scanResult.student.class}
                        </div>
                        <div style={{ fontSize: "10px", color: "#A7F3D0", marginTop: "2px" }}>
                          {scanResult.student.dormBuilding} — Kamar {scanResult.student.roomNumber}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#F0FDF4",
                        border: "1px solid #BBF7D0",
                        borderRadius: "14px",
                        padding: "12px",
                        fontSize: "12px",
                        color: "#166534",
                        lineHeight: 1.6,
                      }}
                    >
                      <div><strong>Penjemput Sah:</strong> {scanResult.pass.authorizedPicker}</div>
                      <div><strong>NIK KTP:</strong> {scanResult.pass.pickerNik}</div>
                      <div><strong>Keperluan:</strong> {scanResult.pass.reason}</div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      borderRadius: "14px",
                      padding: "14px",
                      color: "#991B1B",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ fontWeight: 800, marginBottom: "4px" }}>
                      Santri DILARANG keluar dari gerbang pondok.
                    </div>
                    <div>Alasan: {scanResult.reason}</div>
                    <div style={{ marginTop: "8px", fontSize: "11px", color: "#B42318" }}>
                      Segera koordinasi dengan Musyrif Asrama / Biro Pengasuhan Santri.
                    </div>
                  </div>
                )}

                {/* Close Button & Print Slip Fisik Gerbang */}
                <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  {scanResult.status === "approved" && (
                    <button
                      onClick={() => {
                        playSuccessChime();
                        onAuditLogAdd({
                          user: "Pak Slamet (Satpam)",
                          role: "Satpam",
                          action: "CETAK SLIP GERBANG FISIK",
                          object: `Santri: ${scanResult.student?.name} (${scanResult.pass?.id})`,
                          status: "DICETAK",
                          details: "Satpam mencetak slip surat jalan fisik 1 lembar kecil untuk santri & penjemput.",
                        });
                        window.print();
                      }}
                      style={{
                        background: "#F4FBF7",
                        border: "1px solid #10B981",
                        color: "#065F46",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>🖨️</span>
                      <span>Cetak Slip Fisik</span>
                    </button>
                  )}
                  <button
                    onClick={() => setScanResult(null)}
                    style={{
                      background: scanResult.status === "approved" ? "#10B981" : "#EF4444",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "10px",
                      padding: "8px 18px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Tutup Notifikasi ({popupSeconds}s)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Log Verifikasi Gerbang Hari Ini */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "18px",
          padding: "18px",
          border: "1px solid #E2EFE9",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 800, color: "#06271E", marginBottom: "10px" }}>
          📜 Riwayat Verifikasi Gerbang Masuk/Keluar Hari Ini:
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {clearanceHistory.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                borderRadius: "12px",
                background: "#F4FBF7",
                border: "1px solid #E2EFE9",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#06271E" }}>
                  {item.santriName} (NIS: {item.nis})
                </div>
                <div style={{ fontSize: "10px", color: "#5B7A70" }}>
                  Penjemput: {item.picker} · Waktu: {item.time}
                </div>
              </div>

              <span
                style={{
                  background: item.status === "SAH" ? "#D1FAE5" : "#FEE2E2",
                  color: item.status === "SAH" ? "#065F46" : "#B42318",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
