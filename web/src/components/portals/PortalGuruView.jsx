import React, { useState } from "react";
import { TEACHER_ASSIGNMENTS, INITIAL_STUDENTS } from "../../data/mockData";
import { playSoftClick, playSuccessChime, playWarningTone, triggerHaptic } from "../../utils/audio";

export default function PortalGuruView({ onTriggerLoader, onAuditLogAdd, currentUser, currentTeacher }) {
  // Ambil konfigurasi kelas sesuai guru yang login (Hanya mapel beliau, mapel lain sama sekali tidak ditampilkan)
  const activeTeacher = currentTeacher || currentUser;
  const teacherEmail = activeTeacher?.email || "guru.dahlan@darussalam.ac.id";
  const teacherData =
    TEACHER_ASSIGNMENTS[teacherEmail] || TEACHER_ASSIGNMENTS["guru.dahlan@darussalam.ac.id"];

  const teacherClasses = teacherData.classes;

  // Auto-detect kelas aktif berdasarkan jam sekarang
  const [selectedClassIndex, setSelectedClassIndex] = useState(() => {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const activeIdx = teacherClasses.findIndex((cls) => {
      const [startH, startM] = cls.timeStart.split(":").map(Number);
      const [endH, endM] = cls.timeEnd.split(":").map(Number);
      const startMins = startH * 60 + startM;
      const endMins = endH * 60 + endM;
      return currentMins >= startMins && currentMins <= endMins;
    });
    return activeIdx !== -1 ? activeIdx : 0;
  });
  const [scannerStatus, setScannerStatus] = useState("idle");
  const [scannerMessage, setScannerMessage] = useState("");

  const activeClass = teacherClasses[selectedClassIndex] || teacherClasses[0];

  // Simulasi Pemindaian Kamera Cepat (Getar di perangkat, bukan menggoyang tampilan!)
  const handleScanCard = (isDuplicate = false) => {
    playSoftClick();
    triggerHaptic([40]);
    setScannerStatus("scanning");
    setScannerMessage("Membaca kartu santri di depan kamera...");

    onTriggerLoader(
      isDuplicate
        ? "Mengecek Anti-Duplikasi Sesi KBM..."
        : "Memverifikasi Kehadiran Santri...",
      () => {
        if (isDuplicate) {
          playWarningTone();
          // Getar di hp pengguna (tanpa menggoyang layout layar)
          triggerHaptic([150, 70, 150]);

          setScannerStatus("duplicate");
          setScannerMessage(
            "DUPLIKASI TERDETEKSI: Kartu Ahmad Fauzan sudah dipindai pada jam 08:42 WIB!"
          );

          onAuditLogAdd({
            user: `${teacherData.teacherName} (Guru KBM)`,
            role: "Guru KBM",
            action: "DUPLIKASI DITOLAK",
            object: `Santri: Ahmad Fauzan (${activeClass.subject})`,
            status: "DITOLAK",
            details:
              "Proteksi anti-duplikasi mencegah pencatatan presensi ganda pada sesi yang sama.",
          });
        } else {
          playSuccessChime();
          triggerHaptic([80]);

          setScannerStatus("success");
          setScannerMessage(
            "SUKSES: Ahmad Fauzan (NIS: 2026070114) — Tercatat HADIR tepat waktu!"
          );

          onAuditLogAdd({
            user: `${teacherData.teacherName} (Guru KBM)`,
            role: "Guru KBM",
            action: `PRESENSI ${activeClass.subject.toUpperCase()}`,
            object: `Santri: Ahmad Fauzan (${activeClass.class})`,
            status: "SUKSES",
            details: `Presensi mapel ${activeClass.subject} berhasil tercatat via kamera viewfinder.`,
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
      {/* Header Guru KBM (Hanya Menampilkan Mapel Guru Tersebut) */}
      <div
        className="portal-header-card"
        style={{
          background: "var(--theme-portal-header-bg)",
          borderRadius: "20px",
          padding: "18px 22px",
          border: "var(--theme-portal-header-border)",
          color: "var(--theme-portal-header-title)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          boxShadow: "var(--theme-card-shadow)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 800, color: "var(--theme-portal-header-title)" }}>
              Portal Guru KBM · {teacherData.subject}
            </h2>
            <span
              style={{
                background: "var(--theme-portal-badge-bg)",
                color: "var(--theme-portal-badge-color)",
                border: "var(--theme-portal-badge-border)",
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              Mata Pelajaran: {teacherData.subject}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--theme-portal-header-sub)", marginTop: "3px" }}>
            Pengajar: {teacherData.teacherName} ({teacherEmail})
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "var(--theme-portal-header-sub)" }}>Sesi Waktu Saat Ini:</div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--theme-portal-header-title)" }}>
            Otomatis Sesuai Jadwal Jam Pelajaran
          </div>
        </div>
      </div>

      {/* Sesi Mengajar Guru (Hanya Sesi Mapel Beliau Saja!) */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "18px",
          padding: "16px",
          border: "1px solid #E2EFE9",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 800, color: "#06271E", marginBottom: "10px" }}>
          Jadwal Mengajar Anda ({teacherData.subject}):
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          {teacherClasses.map((cls, idx) => {
            const isSelected = selectedClassIndex === idx;
            return (
              <div
                key={cls.id}
                onClick={() => {
                  playSoftClick();
                  setSelectedClassIndex(idx);
                }}
                style={{
                  padding: "12px 14px",
                  borderRadius: "14px",
                  background: isSelected ? "var(--gradient-emerald)" : "#F4FBF7",
                  color: isSelected ? "#FFFFFF" : "#06271E",
                  border: isSelected ? "none" : "1px solid #E2EFE9",
                  boxShadow: isSelected ? "0 4px 14px rgba(6, 95, 70, 0.25)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800 }}>{cls.subject}</div>
                  <span style={{ fontSize: "10px", background: isSelected ? "rgba(255,255,255,0.2)" : "#D1FAE5", color: isSelected ? "#FFFFFF" : "#065F46", padding: "1px 6px", borderRadius: "6px", fontWeight: 700 }}>
                    {cls.class}
                  </span>
                </div>
                <div style={{ fontSize: "11px", opacity: 0.9, marginTop: "2px" }}>
                  {cls.room}
                </div>
                <div style={{ fontSize: "10px", marginTop: "6px", fontWeight: 700, color: isSelected ? "#FFE49A" : "#059669" }}>
                  {cls.timeDisplay}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: "11px", color: "#065F46", background: "#ECFDF5", padding: "8px 12px", borderRadius: "10px", marginTop: "12px", border: "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: "6px" }}>
          <span>Mata pelajaran lain tidak ditampilkan. Portal ini dikhususkan hanya untuk mata pelajaran <strong>{teacherData.subject}</strong> yang Anda ampu.</span>
        </div>
      </div>

      {/* Grid: Viewfinder Pemindai Kamera & Rekap Kehadiran */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        {/* KOLOM KIRI: KAMERA VIEWFINDER LANGSUNG AKTIF (Tanpa Goyang Layar) */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            padding: "20px",
            border: scannerStatus === "duplicate" ? "1.5px solid #D97706" : "1px solid #E2EFE9",
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
              Kamera Pemindai Presensi {activeClass.subject}
            </div>
            <span
              style={{
                background: "#D1FAE5",
                color: "#065F46",
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              Viewfinder Aktif
            </span>
          </div>

          {/* Active Camera Viewfinder */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "230px",
              background: "#06271E",
              borderRadius: "16px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #0D4332",
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                width: "160px",
                height: "160px",
                border: "2px dashed #34D399",
                borderRadius: "16px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ position: "absolute", top: "-2px", left: "-2px", width: "16px", height: "16px", borderTop: "3px solid #FFE49A", borderLeft: "3px solid #FFE49A" }} />
              <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "16px", height: "16px", borderTop: "3px solid #FFE49A", borderRight: "3px solid #FFE49A" }} />
              <div style={{ position: "absolute", bottom: "-2px", left: "-2px", width: "16px", height: "16px", borderBottom: "3px solid #FFE49A", borderLeft: "3px solid #FFE49A" }} />
              <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "16px", height: "16px", borderBottom: "3px solid #FFE49A", borderRight: "3px solid #FFE49A" }} />

              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "#10B981",
                  boxShadow: "0 0 10px #10B981, 0 0 20px #34D399",
                  animation: "scannerSweep 2s infinite ease-in-out",
                }}
              />

              <span style={{ fontSize: "11px", color: "#A7F3D0", fontWeight: 700, textAlign: "center", padding: "0 10px" }}>
                Arahkan Kartu Santri ke Kotak
              </span>
            </div>

            <div style={{ position: "absolute", bottom: "8px", left: "10px", fontSize: "10px", color: "#A7F3D0", opacity: 0.8 }}>
              Kamera KBM · {activeClass.room}
            </div>
            <div style={{ position: "absolute", bottom: "8px", right: "10px", fontSize: "10px", color: "#FFE49A", fontWeight: 700 }}>
              AUTO-DETECT
            </div>
          </div>

          {/* Scanner Feedback Message Box */}
          {scannerMessage && (
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
                    : scannerStatus === "success"
                    ? "#D1FAE5"
                    : "#F3F4F6",
                color:
                  scannerStatus === "duplicate"
                    ? "#92400E"
                    : scannerStatus === "success"
                    ? "#065F46"
                    : "#374151",
                border:
                  scannerStatus === "duplicate"
                    ? "1px solid #FCD34D"
                    : scannerStatus === "success"
                    ? "1px solid #A7F3D0"
                    : "1px solid #E5E7EB",
              }}
            >
              {scannerMessage}
            </div>
          )}

          {/* Action Trigger Buttons for Testing Scanner */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "14px" }}>
            <button
              onClick={() => handleScanCard(false)}
              style={{
                padding: "10px 12px",
                borderRadius: "12px",
                background: "var(--gradient-emerald)",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                boxShadow: "0 4px 12px rgba(6, 95, 70, 0.2)",
              }}
            >
              <span>Pindai Kartu (Hadir)</span>
            </button>

            <button
              onClick={() => handleScanCard(true)}
              style={{
                padding: "10px 12px",
                borderRadius: "12px",
                background: "rgba(217, 119, 6, 0.15)",
                color: "#92400E",
                border: "1px solid #FCD34D",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
              }}
              title="Menguji getar ganda pada ponsel pengajar bila kartu dipindai dua kali"
            >
              <span>Uji Getar Anti-Duplikasi</span>
            </button>
          </div>
        </div>

        {/* KOLOM KANAN: REKAP KEHADIRAN KELAS & DAFTAR SISWA */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            padding: "20px",
            border: "1px solid #E2EFE9",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
              Rekap Kelas {activeClass.class} ({activeClass.subject})
            </div>
            <span style={{ fontSize: "11px", color: "#5B7A70" }}>
              Total: {activeClass.totalStudents} Santri
            </span>
          </div>

          {/* Quick Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            <div style={{ background: "#F4FBF7", border: "1px solid #D1FAE5", borderRadius: "12px", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#065F46" }}>{activeClass.presentCount}</div>
              <div style={{ fontSize: "10px", color: "#065F46", fontWeight: 700 }}>Hadir</div>
            </div>
            <div style={{ background: "#FFFBEB", border: "1px solid #FEF3C7", borderRadius: "12px", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#92400E" }}>{activeClass.lateCount}</div>
              <div style={{ fontSize: "10px", color: "#92400E", fontWeight: 700 }}>Terlambat</div>
            </div>
            <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: "12px", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0369A1" }}>{activeClass.sickCount}</div>
              <div style={{ fontSize: "10px", color: "#0369A1", fontWeight: 700 }}>Sakit (Asrama)</div>
            </div>
          </div>

          {/* Daftar Santri Presensi */}
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#06271E" }}>
            Santri Terdata di Kelas Ini:
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
            {INITIAL_STUDENTS.map((st) => (
              <div
                key={st.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  background: "#F4FBF7",
                  border: "1px solid #E2EFE9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <img src={st.photo} alt={st.name} style={{ width: "30px", height: "30px", borderRadius: "8px", objectFit: "cover" }} />
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#06271E" }}>{st.name}</div>
                    <div style={{ fontSize: "10px", color: "#8AA49B" }}>NIS: {st.nis} · {st.dormBuilding}</div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "#D1FAE5",
                    color: "#065F46",
                  }}
                >
                  HADIR
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
