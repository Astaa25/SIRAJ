import React, { useState } from "react";
import { INITIAL_STUDENTS, INITIAL_EWS_ALERTS, INITIAL_GATE_PASS } from "../../data/mockData";
import { playSoftClick, playSuccessChime, triggerHaptic } from "../../utils/audio";

export default function PortalMusyrifView({ onTriggerLoader, onAuditLogAdd, currentUser, tenantDormTerm = "Asrama" }) {
  const musyrifName = currentUser?.name || "Ustaz Farhan";
  const assignedDorm = currentUser?.assignedDorm || `${tenantDormTerm} Abu Bakar Ash-Shiddiq`;

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualFormType, setManualFormType] = useState("Sakit");
  const [manualStudentName, setManualStudentName] = useState("Ahmad Fauzan");
  const [manualRoomNumber, setManualRoomNumber] = useState("Kamar 03");
  const [manualFormNotes, setManualFormNotes] = useState("Febris / demam 37.8°C ba'da dzuhur, istirahat di kamar asrama");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(2);
  const [dormRecords, setDormRecords] = useState(INITIAL_EWS_ALERTS);

  // Gate Pass Otorisasi Mandiri oleh Musyrif Asrama
  const [gatePassList, setGatePassList] = useState([INITIAL_GATE_PASS]);
  const [isGatePassModalOpen, setIsGatePassModalOpen] = useState(false);
  const [gatePassStudent, setGatePassStudent] = useState("Ahmad Fauzan");
  const [gatePassReason, setGatePassReason] = useState("Izin Pulang: Acara Pernikahan Kakak Kandung di Bandung");
  const [gatePassPicker, setGatePassPicker] = useState("Ir. H. Abdullah (Ayah Kandung)");
  const [gatePassNik, setGatePassNik] = useState("3206012809780003");

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
          photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80",
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

        alert(`Gate Pass untuk ${gatePassStudent} berhasil disahkan oleh Musyrif. Berlaku seharian penuh di gerbang.`);
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
          details: "Koneksi pulih. Seluruh antrean offline SQLite berhasil diunggah ke database utama Supabase.",
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
      {/* Header Musyrif Asrama (Menampilkan Nama & Asrama/Sakan yang Dibina) */}
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
          {/* Tombol Otorisasi Gate Pass Mandiri oleh Musyrif */}
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

          {/* Tombol Input Seksi 13 Tanpa QR */}
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

      {/* Daftar Kamar Asrama & Status Santri Sakit / Izin */}
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

                {/* Nama Asrama dan No. Kamar Terpisah Jelas */}
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
