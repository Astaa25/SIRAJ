import React, { useState } from "react";
import { INITIAL_EWS_ALERTS, INITIAL_GATE_PASS, INITIAL_SP_THRESHOLDS, INITIAL_STUDENTS } from "../../data/mockData";
import { playSoftClick, playSuccessChime, triggerHaptic } from "../../utils/audio";

export default function PortalPengasuhanView({ onTriggerLoader, onAuditLogAdd }) {
  const [selectedKomplek, setSelectedKomplek] = useState("ALL"); // ALL, Abu Bakar, Umar, Ali, Fatimah
  const [ewsList, setEWSList] = useState(INITIAL_EWS_ALERTS);
  const [pendingGatePass, setPendingGatePass] = useState(INITIAL_GATE_PASS);
  const [gatePassApprovalStatus, setGatePassApprovalStatus] = useState("approved"); // approved, pending, rejected

  // Filter EWS per Komplek / Asrama
  const filteredEws = ewsList.filter((item) => {
    if (selectedKomplek === "ALL") return true;
    return item.dormBuilding?.includes(selectedKomplek);
  });

  // Filter Santri per Komplek / Asrama
  const filteredStudents = INITIAL_STUDENTS.filter((st) => {
    if (selectedKomplek === "ALL") return true;
    return st.dormBuilding?.includes(selectedKomplek);
  });

  // Daftar Komplek / Asrama
  const dormList = [
    { id: "ALL", name: "Semua Asrama & Komplek", musyrif: "Seluruh Tim Musyrif", count: INITIAL_STUDENTS.length },
    { id: "Abu Bakar", name: "Asrama Abu Bakar Ash-Shiddiq", musyrif: "Ustaz Farhan (Musyrif Komplek)", count: INITIAL_STUDENTS.filter(s => s.dormBuilding?.includes("Abu Bakar")).length },
    { id: "Umar", name: "Asrama Umar bin Khattab", musyrif: "Ustaz Salman (Musyrif Komplek)", count: INITIAL_STUDENTS.filter(s => s.dormBuilding?.includes("Umar")).length },
    { id: "Ali", name: "Asrama Ali bin Abi Thalib", musyrif: "Ustaz Hamdan (Musyrif Komplek)", count: INITIAL_STUDENTS.filter(s => s.dormBuilding?.includes("Ali")).length },
    { id: "Fatimah", name: "Asrama Fatimah Az-Zahra (Putri)", musyrif: "Ustadzah Khadijah (Musyrifah Komplek)", count: INITIAL_STUDENTS.filter(s => s.dormBuilding?.includes("Fatimah")).length },
  ];

  // Kepala Pengasuhan Follow-up EWS Santri Sakit Asrama
  const handleFollowUpEws = (id, santriName) => {
    playSoftClick();
    triggerHaptic([50]);

    onTriggerLoader(
      `Menindaklanjuti Penanganan Santri Sakit ${santriName} dengan Musyrif Komplek...`,
      () => {
        playSuccessChime();
        setEWSList((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "Tertangani & Dalam Rawatan Asrama" } : item
          )
        );
        onAuditLogAdd({
          user: "K.H. Asep Ridwan, Lc. (Kepala Pengasuhan)",
          role: "Kepala Pengasuhan",
          action: "TINDAK LANJUT EWS ASRAMA",
          object: `Santri: ${santriName}`,
          status: "TERTANGANI",
          details: "Kepala Pengasuhan menginstruksikan pendampingan istirahat asrama dan koordinasi tim kesehatan.",
        });
      }
    );
  };

  // Approval Gate Pass Pulang Santri
  const handleApproveGatePass = (isApproved = true) => {
    playSoftClick();
    triggerHaptic([60]);

    onTriggerLoader(
      isApproved
        ? "Mengesahkan Gate Pass Izin Pulang Santri Ahmad Fauzan..."
        : "Menolak Permohonan Gate Pass...",
      () => {
        playSuccessChime();
        setGatePassApprovalStatus(isApproved ? "approved" : "rejected");
        onAuditLogAdd({
          user: "K.H. Asep Ridwan, Lc. (Kepala Pengasuhan)",
          role: "Kepala Pengasuhan",
          action: isApproved ? "APPROVAL GATE PASS RESMI" : "GATE PASS DITOLAK",
          object: "Ahmad Fauzan (Kelas 7-A)",
          status: isApproved ? "DISETUJUI" : "DITOLAK",
          details: isApproved
            ? "Izin pulang disahkan. Musyrif juga berwenang menerbitkan izin kepulangan langsung di pos asrama."
            : "Permohonan kepulangan ditolak.",
        });
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
      {/* Header Kepala Pengasuhan */}
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
              Biro Pengasuhan Santri (Kepala Musyrif Asrama)
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
              Pimpinan Pengasuhan
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--theme-portal-header-sub)", marginTop: "3px" }}>
            Kepala Pengasuhan: K.H. Asep Ridwan, Lc. · Koordinator Seluruh Musyrif Komplek Ponpes
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "var(--theme-portal-header-sub)" }}>Cakupan Pengawasan:</div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--theme-portal-header-title)" }}>
            4 Komplek Asrama (1.248 Santri)
          </div>
        </div>
      </div>

      {/* FILTER PER ASRAMA / KOMPLEK */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "18px",
          padding: "16px",
          border: "1px solid #E2EFE9",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#06271E" }}>
            Kategori Komplek / Asrama Santri:
          </div>
          <div style={{ fontSize: "11px", color: "#5B7A70" }}>
            Pilih komplek asrama untuk melihat data musyrif, santri sakit, dan perizinan per komplek
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {dormList.map((dorm) => (
            <button
              key={dorm.id}
              onClick={() => {
                playSoftClick();
                setSelectedKomplek(dorm.id);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "11.5px",
                fontWeight: selectedKomplek === dorm.id ? 800 : 600,
                background: selectedKomplek === dorm.id ? "#065F46" : "#F4FBF7",
                color: selectedKomplek === dorm.id ? "#FFFFFF" : "#06271E",
                border: selectedKomplek === dorm.id ? "1px solid #065F46" : "1px solid #D1FAE5",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.15s ease",
              }}
            >
              <span>{dorm.name}</span>
              <span
                style={{
                  background: selectedKomplek === dorm.id ? "rgba(255,255,255,0.25)" : "#E2EFE9",
                  padding: "1px 6px",
                  borderRadius: "8px",
                  fontSize: "10px",
                }}
              >
                {dorm.count} santri
              </span>
            </button>
          ))}
        </div>

        {/* Selected Komplek Summary Banner */}
        {selectedKomplek !== "ALL" && (
          <div
            style={{
              background: "#ECFDF5",
              border: "1px solid #A7F3D0",
              borderRadius: "12px",
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11.5px",
              color: "#065F46",
              marginTop: "4px",
            }}
          >
            <div>
              <strong>Musyrif Komplek:</strong> {dormList.find(d => d.id === selectedKomplek)?.musyrif}
            </div>
            <div>
              <strong>Santri Terdata:</strong> {filteredStudents.length} santri · {filteredEws.length} laporan aktif
            </div>
          </div>
        )}
      </div>

      {/* Grid: EWS Asrama Sakit/Izin & Otorisasi Gate Pass */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        {/* KOLOM KIRI: EARLY WARNING SYSTEM (SANTRI SAKIT & IZIN ASRAMA DARI MUSYRIF) */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            padding: "20px",
            border: "1px solid #E2EFE9",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                EWS Santri Asrama Sakit & Izin
              </div>
              <div style={{ fontSize: "11px", color: "#5B7A70" }}>
                Laporan real-time musyrif kamar asrama
              </div>
            </div>
            <span
              style={{
                background: "#FEF2F2",
                color: "#B42318",
                border: "1px solid #FECACA",
                padding: "2px 8px",
                borderRadius: "8px",
                fontSize: "10px",
                fontWeight: 800,
              }}
            >
              {filteredEws.length} Santri Terdata
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredEws.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#5B7A70", fontSize: "12px" }}>
                Tidak ada laporan santri sakit/izin untuk komplek asrama ini.
              </div>
            ) : (
              filteredEws.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "#F4FBF7",
                    borderRadius: "14px",
                    padding: "12px 14px",
                    border: "1px solid #E2EFE9",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          background: item.conditionType === "Sakit" ? "#DC2626" : "#6D28D9",
                          color: "#FFFFFF",
                          fontSize: "9px",
                          fontWeight: 800,
                          padding: "1px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {item.conditionType}
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: "#06271E" }}>
                        {item.santriName}
                      </span>
                    </div>
                    <span style={{ fontSize: "10px", color: "#8AA49B" }}>{item.class}</span>
                  </div>

                  <div style={{ fontSize: "11px", color: "#374151", fontWeight: 600 }}>
                    {item.dormBuilding} · {item.roomNumber}
                  </div>
                  <div style={{ fontSize: "11px", color: "#B42318", marginTop: "3px", fontStyle: "italic" }}>
                    "{item.diagnosis}"
                  </div>
                  <div style={{ fontSize: "10px", color: "#5B7A70", marginTop: "4px" }}>
                    Pelapor: {item.officer} · {item.dateRecorded}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", borderTop: "1px solid #E2EFE9", paddingTop: "8px" }}>
                    <span style={{ fontSize: "10.5px", color: "#059669", fontWeight: 700 }}>
                      Status: {item.status}
                    </span>
                    <button
                      onClick={() => handleFollowUpEws(item.id, item.santriName)}
                      style={{
                        background: "var(--gradient-emerald)",
                        color: "#FFFFFF",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Tindak Lanjuti
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KOLOM KANAN: OTORISASI GATE PASS & KEBIJAKAN DISIPLIN ASRAMA */}
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
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
              Otorisasi Gate Pass Kepulangan Santri
            </div>
            <div style={{ fontSize: "11px", color: "#5B7A70" }}>
              Kepala Pengasuhan berwenang mengesahkan izin keluar santri
            </div>
          </div>

          {/* Permohonan Izin Santri Ahmad Fauzan */}
          <div
            style={{
              background: "#F4FBF7",
              borderRadius: "14px",
              padding: "14px",
              border: "1px solid #D1FAE5",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#06271E" }}>
                Ahmad Fauzan (Kelas 7-A)
              </span>
              <span
                style={{
                  background: gatePassApprovalStatus === "approved" ? "#D1FAE5" : "#FEE2E2",
                  color: gatePassApprovalStatus === "approved" ? "#065F46" : "#B42318",
                  fontSize: "10px",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                {gatePassApprovalStatus === "approved" ? "DISETUJUI" : "DITOLAK"}
              </span>
            </div>

            <div style={{ fontSize: "11.5px", color: "#374151", lineHeight: "1.5" }}>
              <div><strong>Alasan:</strong> Izin Pulang: Pernikahan Kakak Kandung di Bandung</div>
              <div><strong>Penjemput:</strong> Ir. H. Abdullah (Ayah Kandung) · NIK: 3206012809780003</div>
              <div><strong>Durasi:</strong> Berlaku Seharian Penuh (06:00 – 21:00 WIB)</div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                onClick={() => handleApproveGatePass(true)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  background: "var(--gradient-emerald)",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Sahkan Izin Pulang
              </button>
              <button
                onClick={() => handleApproveGatePass(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#FEE2E2",
                  color: "#B42318",
                  border: "1px solid #FCA5A5",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Tolak
              </button>
            </div>
          </div>

          {/* Ambang Kebijakan Peringatan SP */}
          <div
            style={{
              background: "#FFFBEB",
              borderRadius: "14px",
              padding: "14px",
              border: "1px solid #FEF3C7",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#92400E", marginBottom: "6px" }}>
              Ambang SP Aktif Pengasuhan:
            </div>
            <div style={{ fontSize: "11px", color: "#78350F", lineHeight: "1.5" }}>
              • SP 1: Ambang {INITIAL_SP_THRESHOLDS.sp1} Poin (Panggilan Wali & BK)<br />
              • SP 2: Ambang {INITIAL_SP_THRESHOLDS.sp2} Poin (Skorsing & Pembekuan Gate Pass)<br />
              • SP 3: Ambang {INITIAL_SP_THRESHOLDS.sp3} Poin (Sidang Majelis Pimpinan Ponpes)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
