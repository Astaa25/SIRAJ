import React, { useState } from "react";
import { INITIAL_STUDENTS, BK_POINT_CATALOGUE } from "../../data/mockData";
import { playSoftClick, playSuccessChime, triggerHaptic } from "../../utils/audio";

export default function PortalBKView({ onTriggerLoader, onAuditLogAdd, currentTenant }) {
  const [spCategory, setSpCategory] = useState("ALL"); // ALL, Aman, SP I, SP II, SP III
  const [selectedStudent, setSelectedStudent] = useState(INITIAL_STUDENTS[2] || INITIAL_STUDENTS[0]); // Default santri with violation points (Muhammad Rizky)

  // Lembar Catatan Konseling Pribadi (Rahasia/Confidential)
  const [confidentialNotesList, setConfidentialNotesList] = useState(
    selectedStudent.counselingNotes || []
  );
  const [counselingCategory, setCounselingCategory] = useState("Akumulasi Poin Pelanggaran");
  const [counselingTopic, setCounselingTopic] = useState("");
  const [counselingActionPlan, setCounselingActionPlan] = useState("");
  const [counselingStatus, setCounselingStatus] = useState("Dalam Pembinaan");

  // Filter students
  const filteredStudents = INITIAL_STUDENTS.filter((st) => {
    if (spCategory === "ALL") return true;
    return st.spStatus?.toLowerCase().includes(spCategory.toLowerCase());
  });

  // Label Kebijakan Reset Poin dari Admin
  const resetPolicy = currentTenant?.pointResetPolicy || "semester";
  const resetPolicyLabel =
    resetPolicy === "semester"
      ? "Reset Tiap Semester"
      : resetPolicy === "tahun"
      ? "Reset Tiap Tahun Ajaran"
      : "Tidak Direset (Akumulatif)";

  // Switch student
  const handleSelectStudent = (st) => {
    playSoftClick();
    setSelectedStudent(st);
    setConfidentialNotesList(st.counselingNotes || []);
  };

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

  // Simpan Lembar Catatan Konseling Pribadi (Rahasia/Confidential)
  const handleSaveConfidentialCounseling = (e) => {
    e.preventDefault();
    if (!counselingTopic.trim()) return;

    playSoftClick();
    triggerHaptic([60]);

    onTriggerLoader("Menyimpan Lembar Catatan Konseling Rahasia (Confidential)...", () => {
      playSuccessChime();
      const newNote = {
        id: "c-" + Date.now(),
        date: "Hari Ini, 16:50 WIB",
        counselor: "Ustaz Hamdan, S.Psi. (Guru BK)",
        category: counselingCategory,
        topic: counselingTopic,
        actionPlan: counselingActionPlan || "Pendampingan berkala bersama Musyrif asrama",
        status: counselingStatus,
        isConfidential: true,
      };

      setConfidentialNotesList((prev) => [newNote, ...prev]);
      setCounselingTopic("");
      setCounselingActionPlan("");

      onAuditLogAdd({
        user: "Ustaz Hamdan (Guru BK)",
        role: "Guru BK",
        action: "CATATAN KONSELING RAHASIA (CONFIDENTIAL)",
        object: `Santri: ${selectedStudent.name} (${counselingCategory})`,
        status: "TERSINKRONISASI_BK",
        details: `Topik: "${counselingTopic}". Action Plan: "${counselingActionPlan}". Dokumen rahasia tersimpan hanya untuk BK & Kepala Pengasuhan.`,
      });
    });
  };

  // Trend data default if missing
  const trendHistory = selectedStudent.adabTrendHistory || [
    { month: "Juli", good: 10, violation: 0 },
    { month: "Agustus", good: 15, violation: 5 },
    { month: "September", good: 20, violation: 10 },
    { month: "Oktober", good: selectedStudent.pointsGood, violation: selectedStudent.pointsViolation },
  ];

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
              Biro Bimbingan Konseling (BK) & Pembinaan Adab
            </h2>
          </div>
          <p style={{ fontSize: "12px", color: "#FFE49A", marginTop: "3px" }}>
            Pencatatan Poin Adab, Lembar Konseling Pribadi Rahasia, dan Grafik Tren Perkembangan Santri
          </p>
        </div>

        {/* Kebijakan Reset Poin Badge */}
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              background: "rgba(232, 182, 90, 0.2)",
              color: "#FFE49A",
              border: "1px solid #FFE49A",
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 800,
            }}
          >
            📌 Kebijakan: {resetPolicyLabel}
          </span>
          <div style={{ fontSize: "10px", color: "#A7F3D0", marginTop: "3px" }}>
            Dikonfigurasi di Admin Ponpes
          </div>
        </div>
      </div>

      {/* Filter Kategori SP Santri */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          background: "#FFFFFF",
          padding: "8px 12px",
          borderRadius: "14px",
          border: "1px solid #E2EFE9",
          overflowX: "auto",
        }}
      >
        {[
          { id: "ALL", label: "Semua Santri" },
          { id: "Aman", label: "🟢 Bebas SP" },
          { id: "SP I", label: "🟡 Ambang SP I" },
          { id: "SP II", label: "🟠 Ambang SP II" },
          { id: "SP III", label: "🔴 Ambang SP III" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              playSoftClick();
              setSpCategory(cat.id);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: spCategory === cat.id ? 800 : 600,
              background: spCategory === cat.id ? "var(--gradient-emerald)" : "#F4FBF7",
              color: spCategory === cat.id ? "#FFFFFF" : "#065F46",
              border: "1px solid #D1FAE5",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Daftar Kartu Santri untuk Dipilih */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
        {filteredStudents.map((st) => {
          const isSelected = selectedStudent.id === st.id;
          const isSp = st.spStatus && st.spStatus !== "Aman";
          return (
            <div
              key={st.id}
              onClick={() => handleSelectStudent(st)}
              style={{
                background: isSelected ? "#F4FBF7" : "#FFFFFF",
                border: isSelected ? "2px solid #10B981" : "1px solid #E2EFE9",
                borderRadius: "14px",
                padding: "14px",
                cursor: "pointer",
                boxShadow: isSelected ? "0 4px 15px rgba(16, 185, 129, 0.15)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src={st.photo}
                  alt={st.name}
                  style={{ width: "42px", height: "42px", borderRadius: "10px", objectFit: "cover" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#06271E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {st.name}
                    </span>
                    <span
                      style={{
                        background: isSp ? "#FEE2E2" : "#D1FAE5",
                        color: isSp ? "#B42318" : "#065F46",
                        padding: "2px 6px",
                        borderRadius: "6px",
                        fontSize: "9.5px",
                        fontWeight: 800,
                      }}
                    >
                      {st.spStatus || "Aman"}
                    </span>
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#5B7A70", marginTop: "2px" }}>
                    NIS: {st.nis} · {st.dormBuilding} ({st.roomNumber})
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginTop: "4px" }}>
                    <span style={{ color: "#059669", fontWeight: 700 }}>+{st.pointsGood} Kebaikan</span>
                    <span style={{ color: isSp ? "#DC2626" : "#5B7A70", fontWeight: 700 }}>
                      -{st.pointsViolation} Pelanggaran
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
                {selectedStudent.spStatus || "Aman"}
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

      {/* -------------------------------------------------------------
          GRAFIK TREN PERKEMBANGAN ADAB SANTRI
          (Poin Kebaikan vs Pelanggaran - Disesuaikan dengan Reset Policy Admin)
         ------------------------------------------------------------- */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          padding: "20px",
          border: "1px solid #E2EFE9",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#06271E", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>📈</span>
              <span>Grafik Tren Perkembangan Adab: {selectedStudent.name}</span>
            </div>
            <div style={{ fontSize: "11.5px", color: "#5B7A70", marginTop: "2px" }}>
              Visualisasi bulanan apakah poin kebaikan bertambah atau pelanggaran menurun. Siklus evaluasi: <strong>{resetPolicyLabel}</strong>.
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", fontSize: "11px", fontWeight: 700 }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#059669" }}>
              <span style={{ width: "10px", height: "10px", background: "#10B981", borderRadius: "3px", display: "inline-block" }} />
              Poin Kebaikan
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#DC2626" }}>
              <span style={{ width: "10px", height: "10px", background: "#EF4444", borderRadius: "3px", display: "inline-block" }} />
              Poin Pelanggaran
            </span>
          </div>
        </div>

        {/* Bar Visual Trend Chart */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${trendHistory.length}, 1fr)`, gap: "14px", background: "#F9FAFB", padding: "18px 14px", borderRadius: "14px", border: "1px solid #E5E7EB" }}>
          {trendHistory.map((item, idx) => {
            const maxVal = 180;
            const goodHeight = Math.min(100, Math.max(10, (item.good / maxVal) * 160));
            const violHeight = Math.min(100, Math.max(10, (item.violation / maxVal) * 160));
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Bar Container */}
                <div style={{ height: "120px", display: "flex", alignItems: "flex-end", gap: "6px", width: "100%", justifyContent: "center" }}>
                  {/* Good Bar */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "24px" }}>
                    <span style={{ fontSize: "9px", fontWeight: 800, color: "#059669", marginBottom: "2px" }}>
                      +{item.good}
                    </span>
                    <div
                      style={{
                        width: "100%",
                        height: `${goodHeight}px`,
                        background: "linear-gradient(180deg, #34D399 0%, #059669 100%)",
                        borderRadius: "6px 6px 0 0",
                        transition: "height 0.4s ease",
                      }}
                    />
                  </div>

                  {/* Violation Bar */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "24px" }}>
                    <span style={{ fontSize: "9px", fontWeight: 800, color: "#DC2626", marginBottom: "2px" }}>
                      -{item.violation}
                    </span>
                    <div
                      style={{
                        width: "100%",
                        height: `${violHeight}px`,
                        background: "linear-gradient(180deg, #F87171 0%, #DC2626 100%)",
                        borderRadius: "6px 6px 0 0",
                        transition: "height 0.4s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Bulan Label */}
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#374151", marginTop: "8px" }}>
                  {item.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* -------------------------------------------------------------
          LEMBAR CATATAN KONSELING PRIBADI (CONFIDENTIAL / RAHASIA)
          Khusus Santri yang Terkena Akumulasi Poin Pelanggaran
         ------------------------------------------------------------- */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          padding: "20px",
          border: "2px solid #E2EFE9",
        }}
      >
        {/* Banner Kerahasiaan Dokumen BK */}
        <div
          style={{
            background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
            border: "1.5px solid #FCD34D",
            borderRadius: "14px",
            padding: "12px 16px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>🔒</span>
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#92400E" }}>
                LEMBAR CATATAN KONSELING PRIBADI (CONFIDENTIAL)
              </div>
              <div style={{ fontSize: "10.5px", color: "#B45309" }}>
                Dokumen pembinaan rahasia: Hanya diakses oleh Guru BK dan Kepala Pengasuhan Pondok Pesantren.
              </div>
            </div>
          </div>
          <span style={{ background: "#92400E", color: "#FFFFFF", padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 800 }}>
            HAK AKSES BK
          </span>
        </div>

        {/* Grid Form Input Konseling & Riwayat Konseling */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          {/* Form Konseling */}
          <form
            onSubmit={handleSaveConfidentialCounseling}
            style={{
              background: "#F4FBF7",
              borderRadius: "14px",
              padding: "16px",
              border: "1px solid #D1FAE5",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#065F46" }}>
              📝 Tulis Catatan Konseling Pribadi Baru
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Kategori Kasus / Pembinaan:</label>
              <select
                value={counselingCategory}
                onChange={(e) => setCounselingCategory(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #A7F3D0", fontSize: "12px", marginTop: "3px", background: "#FFFFFF" }}
              >
                <option value="Akumulasi Poin Pelanggaran">Akumulasi Poin Pelanggaran (Ambang SP)</option>
                <option value="Kedisiplinan KBM & Keterlambatan">Kedisiplinan KBM & Keterlambatan</option>
                <option value="Pelanggaran Jam Malam & Asrama">Pelanggaran Jam Malam & Asrama</option>
                <option value="Pembinaan Adab & Perilaku Santri">Pembinaan Adab & Perilaku Santri</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Topik & Temuan Konseling:</label>
              <textarea
                value={counselingTopic}
                onChange={(e) => setCounselingTopic(e.target.value)}
                required
                rows={2}
                placeholder="Uraikan faktor penyebab, pengakuan santri, atau temuan konselor..."
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #A7F3D0", fontSize: "12px", marginTop: "3px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Rencana Tindak Lanjut / Action Plan Edukatif:</label>
              <textarea
                value={counselingActionPlan}
                onChange={(e) => setCounselingActionPlan(e.target.value)}
                required
                rows={2}
                placeholder="Target perbaikan: hafalan surat tambahan, khidmat masjid, lapor musyrif..."
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #A7F3D0", fontSize: "12px", marginTop: "3px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Status Penanganan:</label>
              <select
                value={counselingStatus}
                onChange={(e) => setCounselingStatus(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #A7F3D0", fontSize: "12px", marginTop: "3px", background: "#FFFFFF" }}
              >
                <option value="Dalam Pembinaan">Dalam Pembinaan Aktif</option>
                <option value="Sanksi Berjalan">Sanksi Edukatif Berjalan</option>
                <option value="Perjanjian Khusus">Perjanjian Khusus Bermaterai</option>
                <option value="Selesai">Selesai / Teratasi</option>
              </select>
            </div>

            <button
              type="submit"
              style={{
                marginTop: "4px",
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
              🔒 Simpan Catatan Rahasia (Confidential)
            </button>
          </form>

          {/* Daftar Riwayat Catatan Konseling Santri Ini */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#06271E", marginBottom: "8px" }}>
              📁 Arsip Konseling Santri: {selectedStudent.name} ({confidentialNotesList.length} Catatan)
            </div>

            {confidentialNotesList.length === 0 ? (
              <div style={{ background: "#F9FAFB", padding: "20px", borderRadius: "12px", textAlign: "center", color: "#6B7280", fontSize: "12px", border: "1px dashed #D1D5DB" }}>
                Belum ada catatan konseling rahasia untuk santri ini.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {confidentialNotesList.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "12px",
                      padding: "12px 14px",
                      border: "1px solid #E2EFE9",
                      fontSize: "11.5px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 800, color: "#92400E" }}>
                        🔒 {note.category}
                      </span>
                      <span style={{ background: "#FEF3C7", color: "#92400E", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>
                        {note.status}
                      </span>
                    </div>

                    <div style={{ color: "#1F2937", marginBottom: "4px" }}>
                      <strong>Topik:</strong> "{note.topic}"
                    </div>

                    <div style={{ color: "#047857", background: "#ECFDF5", padding: "6px 8px", borderRadius: "6px", fontSize: "10.5px", marginBottom: "4px" }}>
                      <strong>Action Plan:</strong> {note.actionPlan}
                    </div>

                    <div style={{ fontSize: "10px", color: "#9CA3AF" }}>
                      {note.counselor} · {note.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Katalog Input Poin Adab Santri (Merits & Violations) */}
      <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", border: "1px solid #E2EFE9" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E", marginBottom: "12px" }}>
          ⭐ Input Poin Adab Cepat: {selectedStudent.name}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
          {/* Poin Kebaikan */}
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

          {/* Poin Pelanggaran */}
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
                      color: "#991B1B",
                      border: "1px solid #FECACA",
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    -{item.points} Poin
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
