import React, { useState } from "react";
import { INITIAL_STUDENTS, BK_POINT_CATALOGUE } from "../../data/mockData";
import { playSoftClick, playSuccessChime, triggerHaptic } from "../../utils/audio";

export default function PortalBKView({ onTriggerLoader, onAuditLogAdd }) {
  const [spCategory, setSpCategory] = useState("ALL"); // ALL, Aman, SP I, SP II, SP III
  const [selectedStudent, setSelectedStudent] = useState(INITIAL_STUDENTS[0]);
  const [counselingNotes, setCounselingNotes] = useState("");
  const [counselingType, setCounselingType] = useState("Pembinaan Kedisiplinan KBM");
  const [recentCounselingLogs, setRecentCounselingLogs] = useState([
    {
      id: "bk-1",
      santriName: "Ahmad Fauzan",
      date: "22 Okt 2026 · 10:15 WIB",
      type: "Evaluasi Keterlambatan KBM (12 mnt)",
      officer: "Ustaz Hamdan, S.Psi. (Guru BK)",
      notes: "Santri terlambat akibat membantu piket asrama. Diberikan pengingat manajemen waktu.",
    },
  ]);

  const filteredStudents = INITIAL_STUDENTS.filter((st) => {
    if (spCategory === "ALL") return true;
    return st.spStatus?.toLowerCase().includes(spCategory.toLowerCase());
  });

  const handleAddPointRecord = (item, isMerit = true) => {
    playSoftClick();
    triggerHaptic([50]);

    onTriggerLoader(
      `Mencatat ${isMerit ? "Poin Kebaikan" : "Poin Pelanggaran"} untuk ${selectedStudent.name}...`,
      () => {
        playSuccessChime();
        onAuditLogAdd({
          user: "Ustaz Hamdan (Guru BK)",
          role: "Guru BK",
          action: isMerit ? "INPUT POIN KEBAIKAN" : "INPUT POIN PELANGGARAN",
          object: `Santri: ${selectedStudent.name} (${item.title})`,
          status: "TERCATAT",
          details: `Poin ${isMerit ? "+" : ""}${item.points} (${item.category}) berhasil ditambahkan ke Rapor Adab santri.`,
        });
        alert(`Poin ${isMerit ? "+" : ""}${item.points} (${item.title}) berhasil dicatat untuk ${selectedStudent.name}.`);
      }
    );
  };

  const handleSubmitCounseling = (e) => {
    e.preventDefault();
    if (!counselingNotes.trim()) return;

    playSoftClick();
    triggerHaptic([60]);

    onTriggerLoader("Menyimpan Catatan Sesi Bimbingan Konseling...", () => {
      playSuccessChime();
      const newLog = {
        id: "bk-" + Date.now(),
        santriName: selectedStudent.name,
        date: "Hari Ini, 16:50 WIB",
        type: counselingType,
        officer: "Ustaz Hamdan, S.Psi. (Guru BK)",
        notes: counselingNotes,
      };
      setRecentCounselingLogs((prev) => [newLog, ...prev]);
      setCounselingNotes("");

      onAuditLogAdd({
        user: "Ustaz Hamdan (Guru BK)",
        role: "Guru BK",
        action: "SESI KONSELING SANTRI",
        object: `Santri: ${selectedStudent.name}`,
        status: "SELESAI",
        details: `Sesi ${counselingType}: "${counselingNotes}". Tersimpan di lembar pembinaan santri.`,
      });
    });
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
      {/* Header Guru BK */}
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
            <span style={{ fontSize: "20px" }}>📋</span>
            <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#FFFFFF" }}>
              Biro Bimbingan Konseling (BK) & Rapor Adab
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
              Pembinaan Akhlak Santri
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#FFE49A", marginTop: "3px" }}>
            Konselor: Ustaz Hamdan, S.Psi. · Ruang Konseling KMI Ibnu Sina
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#A7F3D0" }}>Santri Dibina:</div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>
            {selectedStudent.name} (Skor Adab: {selectedStudent.scoreAdab}/100)
          </div>
        </div>
      </div>

      {/* Filter Kategori SP (Aman, SP I, SP II, SP III) */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "18px",
          padding: "16px",
          border: "1px solid #E2EFE9",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
              📂 Kategori Status Santri & Skor Adab (Surat Peringatan)
            </div>
            <div style={{ fontSize: "11px", color: "#5B7A70" }}>
              Filter santri berdasarkan status pembinaan SP dan pantau akumulasi skor adab santri.
            </div>
          </div>

          {/* SP Category Pills */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[
              { id: "ALL", label: "Semua Santri", count: INITIAL_STUDENTS.length },
              { id: "Aman", label: "🟢 Aman", count: INITIAL_STUDENTS.filter(s => s.spStatus?.includes("Aman")).length },
              { id: "SP I", label: "🟡 SP I", count: INITIAL_STUDENTS.filter(s => s.spStatus?.includes("SP I")).length },
              { id: "SP II", label: "🟠 SP II", count: INITIAL_STUDENTS.filter(s => s.spStatus?.includes("SP II")).length },
              { id: "SP III", label: "🔴 SP III", count: INITIAL_STUDENTS.filter(s => s.spStatus?.includes("SP III")).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playSoftClick();
                  setSpCategory(tab.id);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "10px",
                  fontSize: "11.5px",
                  fontWeight: spCategory === tab.id ? 800 : 600,
                  background: spCategory === tab.id ? "#065F46" : "#F4FBF7",
                  color: spCategory === tab.id ? "#FFFFFF" : "#06271E",
                  border: spCategory === tab.id ? "1px solid #065F46" : "1px solid #D1FAE5",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    background: spCategory === tab.id ? "rgba(255,255,255,0.25)" : "#E2EFE9",
                    padding: "1px 6px",
                    borderRadius: "8px",
                    fontSize: "10px",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Daftar Kartu Santri Sesuai Kategori SP */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "10px",
            marginTop: "6px",
          }}
        >
          {filteredStudents.map((st) => {
            const isSelected = selectedStudent.id === st.id;
            const isSp3 = st.spStatus?.includes("SP III");
            const isSp2 = st.spStatus?.includes("SP II");
            const isSp1 = st.spStatus?.includes("SP I");

            const spBadgeBg = isSp3 ? "#FEE2E2" : isSp2 ? "#FFEDD5" : isSp1 ? "#FEF3C7" : "#D1FAE5";
            const spBadgeColor = isSp3 ? "#991B1B" : isSp2 ? "#9A3412" : isSp1 ? "#92400E" : "#065F46";
            const scoreColor = st.scoreAdab >= 80 ? "#059669" : st.scoreAdab >= 50 ? "#D97706" : "#DC2626";

            return (
              <div
                key={st.id}
                onClick={() => {
                  playSoftClick();
                  setSelectedStudent(st);
                }}
                style={{
                  background: isSelected ? "#F0FDF4" : "#FFFFFF",
                  border: isSelected ? "2px solid #10B981" : "1px solid #E2EFE9",
                  borderRadius: "14px",
                  padding: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isSelected ? "0 4px 12px rgba(16, 185, 129, 0.15)" : "none",
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <img
                    src={st.photo}
                    alt={st.name}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      objectFit: "cover",
                      border: "1.5px solid #E2EFE9",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#06271E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {st.name}
                      </div>
                      <span
                        style={{
                          background: spBadgeBg,
                          color: spBadgeColor,
                          fontSize: "9px",
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: "6px",
                          flexShrink: 0,
                        }}
                      >
                        {st.spStatus?.split(" ")[0] || "Aman"}
                      </span>
                    </div>

                    <div style={{ fontSize: "10.5px", color: "#5B7A70", marginTop: "1px" }}>
                      NIS: {st.nis} · {st.class}
                    </div>

                    <div style={{ fontSize: "10px", color: "#8AA49B" }}>
                      {st.dormBuilding} · {st.roomNumber}
                    </div>
                  </div>
                </div>

                {/* Skor Adab Progress Bar */}
                <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px dashed #E2EFE9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", marginBottom: "4px" }}>
                    <span style={{ color: "#5B7A70", fontWeight: 600 }}>Skor Adab Santri:</span>
                    <span style={{ fontWeight: 800, color: scoreColor }}>{st.scoreAdab}/100</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "#E2EFE9", borderRadius: "10px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(100, Math.max(5, st.scoreAdab))}%`,
                        background: scoreColor,
                        borderRadius: "10px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", color: "#8AA49B", marginTop: "3px" }}>
                    <span>+{st.pointsGood} Kebaikan</span>
                    <span>-{st.pointsViolation} Pelanggaran</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Santri Terpilih */}
      <div
        style={{
          background: "linear-gradient(135deg, #06271E 0%, #0D4332 100%)",
          borderRadius: "18px",
          padding: "16px 20px",
          color: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          border: "1px solid rgba(232, 182, 90, 0.35)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src={selectedStudent.photo}
            alt={selectedStudent.name}
            style={{ width: "52px", height: "52px", borderRadius: "12px", objectFit: "cover", border: "2px solid #FFE49A" }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>
                {selectedStudent.name}
              </div>
              <span
                style={{
                  background: selectedStudent.spStatus?.includes("SP") ? "rgba(239, 68, 68, 0.25)" : "rgba(16, 185, 129, 0.25)",
                  color: selectedStudent.spStatus?.includes("SP") ? "#FCA5A5" : "#6EE7B7",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontSize: "10px",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                {selectedStudent.spStatus}
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#FFE49A", marginTop: "2px" }}>
              NIS: {selectedStudent.nis} · {selectedStudent.class} · {selectedStudent.dormBuilding} ({selectedStudent.roomNumber})
            </div>
            <div style={{ fontSize: "10.5px", color: "#A7F3D0" }}>
              Wali: {selectedStudent.guardianName} ({selectedStudent.guardianPhone})
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#A7F3D0" }}>Skor Adab Santri</div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: selectedStudent.scoreAdab >= 80 ? "#6EE7B7" : selectedStudent.scoreAdab >= 50 ? "#FCD34D" : "#FCA5A5" }}>
            {selectedStudent.scoreAdab} <span style={{ fontSize: "13px", fontWeight: 600 }}>/ 100</span>
          </div>
        </div>
      </div>

      {/* Katalog Poin Adab & Form Konseling */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        {/* KOLOM KIRI: KATALOG POIN KEBAIKAN & PELANGGARAN */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            padding: "20px",
            border: "1px solid #E2EFE9",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E", marginBottom: "12px" }}>
            ⭐ Katalog Input Poin Adab (Sesuai Konfigurasi Admin)
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Poin Kebaikan / Merits */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#059669", marginBottom: "6px" }}>
                🌟 Kebaikan & Prestasi (+Poin):
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {BK_POINT_CATALOGUE.merits.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      background: "#F4FBF7",
                      border: "1px solid #D1FAE5",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#06271E" }}>{item.title}</div>
                      <div style={{ fontSize: "9.5px", color: "#5B7A70" }}>Kategori: {item.category}</div>
                    </div>
                    <button
                      onClick={() => handleAddPointRecord(item, true)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "8px",
                        background: "#D1FAE5",
                        color: "#065F46",
                        border: "1px solid #A7F3D0",
                        fontSize: "11px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      +{item.points} Poin
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Poin Pelanggaran / Violations */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#B42318", marginBottom: "6px" }}>
                ⚠️ Pelanggaran Kedisiplinan (-Poin):
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {BK_POINT_CATALOGUE.violations.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      background: "#FFFBEB",
                      border: "1px solid #FEF3C7",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#06271E" }}>{item.title}</div>
                      <div style={{ fontSize: "9.5px", color: "#92400E" }}>Kategori: {item.category}</div>
                    </div>
                    <button
                      onClick={() => handleAddPointRecord(item, false)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "8px",
                        background: "#FEE2E2",
                        color: "#B42318",
                        border: "1px solid #FCA5A5",
                        fontSize: "11px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {item.points} Poin
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: FORM SESI KONSELING & RIWAYAT PEMBINAAN */}
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
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
            📝 Catat Sesi Bimbingan Konseling Santri
          </div>

          <form onSubmit={handleSubmitCounseling} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Jenis Bimbingan:</label>
              <select
                value={counselingType}
                onChange={(e) => setCounselingType(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "4px" }}
              >
                <option value="Pembinaan Kedisiplinan KBM">Pembinaan Kedisiplinan KBM</option>
                <option value="Motivasi Tahfidz Al-Qur'an">Motivasi Tahfidz Al-Qur'an</option>
                <option value="Konseling Adaptasi Asrama">Konseling Adaptasi Asrama</option>
                <option value="Pencegahan Pelanggaran Ambang SP">Pencegahan Pelanggaran Ambang SP</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Catatan Hasil Konseling:</label>
              <textarea
                value={counselingNotes}
                onChange={(e) => setCounselingNotes(e.target.value)}
                rows={3}
                placeholder="Tuliskan intisari nasihat, kesepakatan pembinaan, atau komitmen santri..."
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "4px" }}
              />
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
                boxShadow: "0 4px 12px rgba(6, 95, 70, 0.2)",
              }}
            >
              Simpan Lembar Konseling BK
            </button>
          </form>

          {/* Riwayat Konseling */}
          <div style={{ marginTop: "10px", borderTop: "1px solid #E2EFE9", paddingTop: "12px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#06271E", marginBottom: "8px" }}>
              Riwayat Pembinaan Santri:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentCounselingLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: "#F4FBF7",
                    borderRadius: "10px",
                    padding: "10px",
                    border: "1px solid #E2EFE9",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#06271E" }}>
                    <span>{log.type}</span>
                    <span style={{ color: "#8AA49B", fontSize: "10px" }}>{log.date}</span>
                  </div>
                  <div style={{ color: "#5B7A70", marginTop: "3px", fontStyle: "italic" }}>
                    "{log.notes}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
