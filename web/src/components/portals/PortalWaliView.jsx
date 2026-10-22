import React, { useState } from "react";
import {
  INITIAL_STUDENTS,
  MOCK_SCHEDULE_CATEGORIES,
  MULTI_DATE_SCHEDULES,
  INITIAL_GATE_PASS,
  INITIAL_ADAB_RECORD,
  WEEKLY_SUMMARY_DATA,
} from "../../data/mockData";
import { playSoftClick, playSuccessChime } from "../../utils/audio";

export default function PortalWaliView({ onTriggerLoader, onAuditLogAdd, tenantDormTerm = "Asrama" }) {
  const [students] = useState(INITIAL_STUDENTS);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("jurnal"); // jurnal, gatepass, adab (Dompet Uang Saku Dihapus!)
  const [selectedDateKey, setSelectedDateKey] = useState("2026-10-22");
  const [activeCategory, setActiveCategory] = useState("kelas_pagi");
  const [jurnalViewMode, setJurnalViewMode] = useState("daily"); // daily | weekly

  // Kartu Santri 3D Flip State
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);

  // Tahfidz Modal State (Tanpa pemutar audio & tanpa kirim doa)
  const [selectedTahfidzItem, setSelectedTahfidzItem] = useState(null);
  const [isTahfidzModalOpen, setIsTahfidzModalOpen] = useState(false);

  const currentStudent = students[selectedStudentIndex] || students[0];
  const currentDateSchedule =
    MULTI_DATE_SCHEDULES[selectedDateKey] || MULTI_DATE_SCHEDULES["2026-10-22"];
  const currentCategories = currentDateSchedule.categories;

  const handleActionClick = (msg, callback) => {
    playSoftClick();
    onTriggerLoader(msg, callback);
  };

  const handleStudentSwitch = (index) => {
    handleActionClick("Memuat Profil Ananda...", () => {
      setSelectedStudentIndex(index);
    });
  };

  const handleDateSwitch = (dateKey) => {
    const targetLabel =
      dateKey === "2026-10-22" ? "Hari Ini (22 Okt)" : "Riwayat Kemarin (21 Okt)";
    handleActionClick(`Memuat Arsip Tanggal: ${targetLabel}...`, () => {
      setSelectedDateKey(dateKey);
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
      {/* -------------------------------------------------------------
          HEADER WALI & PILIH ANANDA (Ganti Anak diganti kata-katanya)
          (Hanya muncul jika terdaftar lebih dari 1 anak)
         ------------------------------------------------------------- */}
      <div
        style={{
          background: "linear-gradient(135deg, #06271E 0%, #0D4332 100%)",
          borderRadius: "20px",
          padding: "16px 20px",
          border: "1px solid rgba(232, 182, 90, 0.3)",
          boxShadow: "0 8px 24px rgba(6, 39, 30, 0.3)",
          color: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ position: "relative" }}>
            <img
              src={currentStudent.photo}
              alt={currentStudent.name}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                objectFit: "cover",
                border: "2px solid #FFE49A",
                boxShadow: "0 0 12px rgba(232, 182, 90, 0.4)",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: "-4px",
                right: "-4px",
                background: "#10B981",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                border: "2px solid #06271E",
              }}
              title="Status Aktif"
            />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF" }}>
                {currentStudent.name}
              </h2>
              <span
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#A7F3D0",
                  border: "1px solid #10B981",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "12px",
                }}
              >
                AKTIF
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#FFE49A", fontWeight: 600 }}>
              NIS: {currentStudent.nis} · {currentStudent.class}
            </div>
            {/* Nama Asrama dan No Kamar Terpisah Sesuai Arahan */}
            <div style={{ fontSize: "11px", color: "#A7F3D0", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🏢 {currentStudent.dormBuilding}</span>
              <span>·</span>
              <span style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: "6px" }}>
                🚪 {currentStudent.roomNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Pilih Profil Ananda & Buka Kartu Digital */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Ganti kata-kata "Ganti Anak" menjadi "Pilih Ananda" */}
          {students.length > 1 && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <span style={{ fontSize: "10.5px", color: "#FFE49A", padding: "0 4px", fontWeight: 700 }}>
                Pilih Ananda:
              </span>
              {students.map((st, idx) => {
                const isSelected = selectedStudentIndex === idx;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleStudentSwitch(idx)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: isSelected ? 800 : 600,
                      background: isSelected ? "var(--gradient-gold)" : "transparent",
                      color: isSelected ? "#06271E" : "#FFFFFF",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    title={`Lihat data ananda ${st.name}`}
                  >
                    <span>{idx === 0 ? "👦" : "👧"}</span>
                    <span>{st.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tombol Lihat Kartu Santri 3D Flip */}
          <button
            onClick={() => {
              playSoftClick();
              setIsIdCardModalOpen(true);
            }}
            style={{
              background: "rgba(232, 182, 90, 0.15)",
              border: "1px solid #FFE49A",
              color: "#FFE49A",
              borderRadius: "12px",
              padding: "7px 12px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>💳</span>
            <span>Kartu 3D Santri</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          SUB-NAVIGATION TAB FOR WALI SANTRI
          (Diperbaiki agar tidak terpotong seperti di Gambar 1, Dompet Uang Saku dihapus!)
         ------------------------------------------------------------- */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          background: "#FFFFFF",
          padding: "6px 8px",
          borderRadius: "16px",
          border: "1px solid #E2EFE9",
          boxShadow: "0 2px 8px rgba(6, 95, 70, 0.04)",
          flexWrap: "wrap",
        }}
      >
        {[
          { id: "jurnal", label: "Jurnal & Rekap Presensi", icon: "📖" },
          { id: "gatepass", label: "Gate Pass 24 Jam", icon: "🎫" },
          { id: "adab", label: "Rapor Adab Santri", icon: "⭐" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playSoftClick();
                setActiveTab(tab.id);
              }}
              style={{
                flex: "1 1 160px",
                padding: "9px 14px",
                borderRadius: "12px",
                fontSize: "12.5px",
                fontWeight: isActive ? 800 : 600,
                background: isActive ? "var(--gradient-emerald)" : "transparent",
                color: isActive ? "#FFFFFF" : "#5B7A70",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* -------------------------------------------------------------
          TAB 1: JURNAL HARIAN & REKAP MINGGUAN
         ------------------------------------------------------------- */}
      {activeTab === "jurnal" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Sub-Switch: Jurnal Harian vs Rekap Mingguan */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "10px 16px",
              border: "1px solid #E2EFE9",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {/* View Mode Toggle (Daily vs Weekly) */}
            <div
              style={{
                display: "flex",
                background: "#F4FBF7",
                borderRadius: "10px",
                padding: "3px",
                border: "1px solid #D1FAE5",
              }}
            >
              <button
                onClick={() => {
                  playSoftClick();
                  setJurnalViewMode("daily");
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: jurnalViewMode === "daily" ? 800 : 600,
                  background:
                    jurnalViewMode === "daily" ? "var(--gradient-emerald)" : "transparent",
                  color: jurnalViewMode === "daily" ? "#FFFFFF" : "#065F46",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                📅 Jurnal Harian
              </button>
              <button
                onClick={() => {
                  playSoftClick();
                  setJurnalViewMode("weekly");
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: jurnalViewMode === "weekly" ? 800 : 600,
                  background:
                    jurnalViewMode === "weekly" ? "var(--gradient-emerald)" : "transparent",
                  color: jurnalViewMode === "weekly" ? "#FFFFFF" : "#065F46",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                📊 Rekap Mingguan (Pekan Ke-4)
              </button>
            </div>

            {/* Date Switcher for Daily Mode */}
            {jurnalViewMode === "daily" && (
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => handleDateSwitch("2026-10-21")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: selectedDateKey === "2026-10-21" ? 700 : 500,
                    background: selectedDateKey === "2026-10-21" ? "#065F46" : "#F4FBF7",
                    color: selectedDateKey === "2026-10-21" ? "#FFFFFF" : "#5B7A70",
                    border: "1px solid #D1FAE5",
                    cursor: "pointer",
                  }}
                >
                  ◀ Kemarin (21 Okt)
                </button>
                <button
                  onClick={() => handleDateSwitch("2026-10-22")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: selectedDateKey === "2026-10-22" ? 700 : 500,
                    background: selectedDateKey === "2026-10-22" ? "#065F46" : "#F4FBF7",
                    color: selectedDateKey === "2026-10-22" ? "#FFFFFF" : "#5B7A70",
                    border: "1px solid #D1FAE5",
                    cursor: "pointer",
                  }}
                >
                  Hari Ini (22 Okt) 🟢
                </button>
              </div>
            )}
          </div>

          {/* VIEW A: JURNAL HARIAN */}
          {jurnalViewMode === "daily" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Daily Summary Card */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "18px",
                  padding: "16px",
                  border: "1px solid #E2EFE9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                    {currentDateSchedule.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "#5B7A70" }}>
                    {currentDateSchedule.hijri} · Jadwal Salat WIB
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: "#D1FAE5",
                      color: "#065F46",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "8px",
                    }}
                  >
                    ✅ {currentDateSchedule.summary.hadir} Hadir
                  </span>
                  <span
                    style={{
                      background: "#FEF3C7",
                      color: "#92400E",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "8px",
                    }}
                  >
                    ⚠️ {currentDateSchedule.summary.terlambat} Terlambat
                  </span>
                  <span
                    style={{
                      background: "#E0F2FE",
                      color: "#0369A1",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "8px",
                    }}
                  >
                    🏥 {currentDateSchedule.summary.izinSakit} Sakit/Izin
                  </span>
                </div>
              </div>

              {/* Dynamic Category Pill Tabs with .no-scrollbar */}
              <div
                className="no-scrollbar"
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  paddingBottom: "2px",
                }}
              >
                {MOCK_SCHEDULE_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const count = (currentCategories[cat.id] || []).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        playSoftClick();
                        setActiveCategory(cat.id);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: isActive ? 800 : 600,
                        background: isActive ? "var(--gradient-emerald)" : "#FFFFFF",
                        color: isActive ? "#FFFFFF" : "#5B7A70",
                        border: isActive ? "none" : "1px solid #E2EFE9",
                        boxShadow: isActive ? "0 4px 12px rgba(6, 95, 70, 0.25)" : "none",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Category Sessions List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(currentCategories[activeCategory] || []).map((session) => (
                  <div
                    key={session.id}
                    className="fade-in-up"
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "16px",
                      padding: "16px",
                      border: "1px solid #E2EFE9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      boxShadow: "0 2px 6px rgba(6, 95, 70, 0.03)",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                          {session.subject}
                        </span>
                        {session.surah && (
                          <span
                            style={{
                              background: "#FEF3C7",
                              color: "#92400E",
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "6px",
                            }}
                          >
                            {session.surah}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "11px", color: "#5B7A70", marginTop: "3px" }}>
                        🕒 {session.time} · {session.teacher}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#8AA49B",
                          marginTop: "2px",
                          fontStyle: "italic",
                        }}
                      >
                        "{session.notes}"
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 10px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background:
                            session.statusType === "hadir"
                              ? "#D1FAE5"
                              : session.statusType === "terlambat"
                              ? "#FEF3C7"
                              : session.statusType === "sakit"
                              ? "#E0F2FE"
                              : "#F3F4F6",
                          color:
                            session.statusType === "hadir"
                              ? "#065F46"
                              : session.statusType === "terlambat"
                              ? "#92400E"
                              : session.statusType === "sakit"
                              ? "#0369A1"
                              : "#6B7280",
                        }}
                      >
                        {session.status}
                      </span>
                      {session.surah && (
                        <div style={{ marginTop: "6px" }}>
                          <button
                            onClick={() => {
                              playSoftClick();
                              setSelectedTahfidzItem(session);
                              setIsTahfidzModalOpen(true);
                            }}
                            style={{
                              background: "rgba(6, 95, 70, 0.08)",
                              color: "#065F46",
                              border: "1px solid rgba(6, 95, 70, 0.2)",
                              borderRadius: "8px",
                              padding: "4px 8px",
                              fontSize: "10px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            📖 Rincian Setoran
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW B: REKAP MINGGUAN (WEEKLY OVERVIEW) */}
          {jurnalViewMode === "weekly" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Header Rekap & Persentase Kehadiran */}
              <div
                style={{
                  background: "linear-gradient(135deg, #065F46 0%, #059669 100%)",
                  color: "#FFFFFF",
                  borderRadius: "18px",
                  padding: "18px",
                  boxShadow: "0 6px 20px rgba(6, 95, 70, 0.25)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#A7F3D0", fontWeight: 700 }}>
                      RAPOR PEKANAN SANTRI
                    </div>
                    <div style={{ fontSize: "17px", fontWeight: 800, marginTop: "2px" }}>
                      {WEEKLY_SUMMARY_DATA.weekLabel}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: "#FFE49A" }}>
                      {WEEKLY_SUMMARY_DATA.overallRate}%
                    </div>
                    <div style={{ fontSize: "10px", color: "#D1FAE5", fontWeight: 700 }}>
                      Predikat: Mumtaz ⭐
                    </div>
                  </div>
                </div>

                {/* 4 Metrik Akumulatif */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "8px",
                    marginTop: "16px",
                    background: "rgba(0, 0, 0, 0.15)",
                    borderRadius: "12px",
                    padding: "10px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#34D399" }}>
                      {WEEKLY_SUMMARY_DATA.hadirCount}
                    </div>
                    <div style={{ fontSize: "10px", color: "#D1FAE5" }}>Hadir</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#FFE49A" }}>
                      {WEEKLY_SUMMARY_DATA.terlambatCount}
                    </div>
                    <div style={{ fontSize: "10px", color: "#FFE49A" }}>Terlambat</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#93C5FD" }}>
                      {WEEKLY_SUMMARY_DATA.sakitCount}
                    </div>
                    <div style={{ fontSize: "10px", color: "#BFDBFE" }}>Sakit/Izin</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#FCA5A5" }}>
                      {WEEKLY_SUMMARY_DATA.alpaCount}
                    </div>
                    <div style={{ fontSize: "10px", color: "#FECACA" }}>Alpa</div>
                  </div>
                </div>
              </div>

              {/* Diagram Batang Mini 7 Hari (Senin - Ahad) */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "18px",
                  padding: "18px",
                  border: "1px solid #E2EFE9",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#06271E",
                    marginBottom: "12px",
                  }}
                >
                  Tingkat Kehadiran Harian (Senin – Ahad)
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: "8px",
                    height: "120px",
                    paddingTop: "10px",
                  }}
                >
                  {WEEKLY_SUMMARY_DATA.days.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "100%",
                        justifyContent: "flex-end",
                      }}
                    >
                      <span style={{ fontSize: "9px", color: "#065F46", fontWeight: 700, marginBottom: "4px" }}>
                        {d.rate}%
                      </span>
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "32px",
                          height: `${(d.rate / 100) * 80}px`,
                          background:
                            d.rate === 100
                              ? "var(--gradient-emerald)"
                              : "linear-gradient(180deg, #E8B65A 0%, #D97706 100%)",
                          borderRadius: "6px 6px 2px 2px",
                          transition: "height 0.4s ease",
                        }}
                      />
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#06271E", marginTop: "6px" }}>
                        {d.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan Musyrif & Tombol Unduh Rapor PDF */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "18px",
                  padding: "18px",
                  border: "1px solid #E2EFE9",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#06271E", marginBottom: "6px" }}>
                  📝 Catatan Evaluasi Musyrif Asrama (Ustaz Farhan)
                </div>
                <div style={{ fontSize: "12px", color: "#5B7A70", lineHeight: "1.5", fontStyle: "italic" }}>
                  "{WEEKLY_SUMMARY_DATA.musyrifNote}"
                </div>

                <div style={{ marginTop: "14px", borderTop: "1px solid #E2EFE9", paddingTop: "12px" }}>
                  <button
                    onClick={() => {
                      playSoftClick();
                      onTriggerLoader("Menyiapkan Berkas Draf Rapor Mingguan Resmi PDF...", () => {
                        playSuccessChime();
                        alert("Berkas PDF Rapor Mingguan Santri berkop resmi berhasil diunduh.");
                      });
                    }}
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>📥</span>
                    <span>Unduh Draf Rapor Mingguan Resmi (PDF Berkop)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: GATE PASS MANDIRI (BERLAKU SEHARIAN PENUH)
         ------------------------------------------------------------- */}
      {activeTab === "gatepass" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #06271E 0%, #0D4332 100%)",
              color: "#FFFFFF",
              borderRadius: "20px",
              padding: "20px",
              border: "1px solid rgba(232, 182, 90, 0.4)",
              boxShadow: "0 10px 30px rgba(6, 39, 30, 0.35)",
            }}
          >
            {/* Header Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <span
                  style={{
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#34D399",
                    border: "1px solid #10B981",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  IZIN RESMI DISAHKAN MUSYRIF
                </span>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", marginTop: "4px" }}>
                  Gate Pass Penjemputan Santri
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    background: "rgba(232, 182, 90, 0.2)",
                    color: "#FFE49A",
                    border: "1px solid #FFE49A",
                    fontSize: "10px",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "8px",
                  }}
                >
                  🕒 Berlaku Seharian Penuh
                </span>
                <div style={{ fontSize: "10px", color: "#A7F3D0", marginTop: "3px" }}>
                  06:00 – 21:00 WIB
                </div>
              </div>
            </div>

            {/* QR Code & Barcode Display (High Contrast) */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                padding: "20px",
                textAlign: "center",
                marginBottom: "16px",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {/* High Contrast QR Code SVG */}
              <div
                style={{
                  display: "inline-block",
                  padding: "10px",
                  border: "2px solid #06271E",
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  marginBottom: "12px",
                }}
              >
                <svg width="140" height="140" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="#FFFFFF" />
                  <rect x="5" y="5" width="28" height="28" fill="#06271E" rx="3" />
                  <rect x="9" y="9" width="20" height="20" fill="#FFFFFF" rx="2" />
                  <rect x="13" y="13" width="12" height="12" fill="#06271E" rx="2" />

                  <rect x="67" y="5" width="28" height="28" fill="#06271E" rx="3" />
                  <rect x="71" y="9" width="20" height="20" fill="#FFFFFF" rx="2" />
                  <rect x="75" y="13" width="12" height="12" fill="#06271E" rx="2" />

                  <rect x="5" y="67" width="28" height="28" fill="#06271E" rx="3" />
                  <rect x="9" y="71" width="20" height="20" fill="#FFFFFF" rx="2" />
                  <rect x="13" y="75" width="12" height="12" fill="#06271E" rx="2" />

                  <rect x="40" y="8" width="6" height="18" fill="#065F46" />
                  <rect x="52" y="12" width="6" height="10" fill="#06271E" />
                  <rect x="40" y="40" width="20" height="20" fill="#047857" rx="3" />
                  <rect x="68" y="44" width="8" height="14" fill="#06271E" />
                  <rect x="80" y="50" width="12" height="8" fill="#065F46" />
                  <rect x="40" y="70" width="14" height="10" fill="#06271E" />
                  <rect x="60" y="75" width="28" height="8" fill="#047857" />
                  <rect x="75" y="86" width="15" height="6" fill="#06271E" />
                </svg>
              </div>

              {/* Barcode String */}
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "13px",
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  color: "#06271E",
                  background: "#F4FBF7",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  display: "inline-block",
                  border: "1px dashed #A7F3D0",
                }}
              >
                ||| || ||||| | |||| ||| {INITIAL_GATE_PASS.qrCodeString}
              </div>

              <div style={{ fontSize: "11px", color: "#5B7A70", marginTop: "8px" }}>
                Tunjukkan QR / Barcode ini ke Satpam Gerbang Utama saat penjemputan.
                <br />
                <strong>Berlaku fleksibel seharian penuh</strong> (bisa difoto/diteruskan ke penjemput/sopir).
              </div>
            </div>

            {/* Verification Metadata Details (Asrama & No Kamar Terpisah) */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                padding: "14px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                fontSize: "12px",
                lineHeight: "1.6",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,0.15)", paddingBottom: "6px" }}>
                <span style={{ color: "#A7F3D0" }}>Santri:</span>
                <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{currentStudent.name} ({currentStudent.class})</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,0.15)", padding: "6px 0" }}>
                <span style={{ color: "#A7F3D0" }}>Hunian:</span>
                <span style={{ fontWeight: 700, color: "#FFE49A" }}>{currentStudent.dormBuilding} · {currentStudent.roomNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,0.15)", padding: "6px 0" }}>
                <span style={{ color: "#A7F3D0" }}>Penjemput Sah:</span>
                <span style={{ fontWeight: 700, color: "#FFE49A" }}>{INITIAL_GATE_PASS.authorizedPicker}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,0.15)", padding: "6px 0" }}>
                <span style={{ color: "#A7F3D0" }}>NIK KTP Penjemput:</span>
                <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{INITIAL_GATE_PASS.pickerNik}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,0.15)", padding: "6px 0" }}>
                <span style={{ color: "#A7F3D0" }}>Keperluan:</span>
                <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{INITIAL_GATE_PASS.reason}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "6px" }}>
                <span style={{ color: "#A7F3D0" }}>Disahkan Oleh:</span>
                <span style={{ fontWeight: 700, color: "#34D399" }}>{INITIAL_GATE_PASS.approvalBy}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: RAPOR ADAB SANTRI
         ------------------------------------------------------------- */}
      {activeTab === "adab" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "20px",
              border: "1px solid #E2EFE9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", color: "#5B7A70", fontWeight: 700 }}>
                RAPOR KEDISIPLINAN & MORALITAS
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#06271E", marginTop: "2px" }}>
                Skor Adab: {currentStudent.scoreAdab} / 100
              </div>
              <div style={{ fontSize: "12px", color: "#059669", fontWeight: 700, marginTop: "2px" }}>
                Klasifikasi: {INITIAL_ADAB_RECORD.classification} · Status: {currentStudent.spStatus}
              </div>
            </div>

            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "conic-gradient(#10B981 0% 95%, #E2EFE9 95% 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#06271E",
                }}
              >
                95%
              </div>
            </div>
          </div>

          {/* Riwayat Poin Kebaikan & Pelanggaran */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            {/* Poin Kebaikan */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "18px",
                padding: "16px",
                border: "1px solid #D1FAE5",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#065F46", marginBottom: "10px" }}>
                🌟 Riwayat Poin Kebaikan (+{currentStudent.pointsGood} Poin)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {INITIAL_ADAB_RECORD.goodPoints.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "#F4FBF7",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      border: "1px solid #E2EFE9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#06271E" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "10px", color: "#5B7A70" }}>
                        {item.date} · Oleh {item.officer}
                      </div>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669" }}>
                      {item.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Poin Pelanggaran */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "18px",
                padding: "16px",
                border: "1px solid #FED7AA",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#9A6212", marginBottom: "10px" }}>
                ⚠️ Catatan Disiplin (-{currentStudent.pointsViolation} Poin)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {INITIAL_ADAB_RECORD.violationPoints.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "#FFFBEB",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      border: "1px solid #FEF3C7",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#06271E" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "10px", color: "#5B7A70" }}>
                        {item.date} · Dicatat {item.officer}
                      </div>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#D97706" }}>
                      {item.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 1: KARTU SANTRI 3D FLIP (Asrama & No. Kamar Terpisah)
         ------------------------------------------------------------- */}
      {isIdCardModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
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
              borderRadius: "24px",
              padding: "24px",
              width: "100%",
              maxWidth: "380px",
              textAlign: "center",
              boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                Kartu Tanda Santri Digital 3D
              </div>
              <button
                onClick={() => setIsIdCardModalOpen(false)}
                style={{
                  background: "#F3F4F6",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✕
              </button>
            </div>

            {/* 3D Flip Card Container */}
            <div
              onClick={() => {
                playSoftClick();
                setIsCardFlipped(!isCardFlipped);
              }}
              style={{
                perspective: "1000px",
                cursor: "pointer",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  minHeight: "220px",
                  position: "relative",
                  transition: "transform 0.6s",
                  transformStyle: "preserve-3d",
                  transform: isCardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* SISI DEPAN (Asrama dan No Kamar Terpisah) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    background: "linear-gradient(135deg, #06271E 0%, #0D4332 100%)",
                    borderRadius: "18px",
                    padding: "16px",
                    border: "2px solid #FFE49A",
                    boxShadow: "0 10px 25px rgba(6, 39, 30, 0.4)",
                    color: "#FFFFFF",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img src="/logo_tile_1024.png" alt="Logo" style={{ width: "28px", height: "28px", borderRadius: "6px", border: "1px solid #FFE49A" }} />
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "#FFE49A" }}>PONDOK PESANTREN DARUSSALAM</div>
                        <div style={{ fontSize: "9px", color: "#A7F3D0" }}>Rajapolah Tasikmalaya · Jawa Barat</div>
                      </div>
                    </div>
                    <span style={{ fontSize: "9px", background: "#10B981", color: "#FFFFFF", padding: "2px 6px", borderRadius: "8px", fontWeight: 700 }}>
                      RFID CONTACTLESS
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center", margin: "10px 0" }}>
                    <img
                      src={currentStudent.photo}
                      alt={currentStudent.name}
                      style={{ width: "56px", height: "56px", borderRadius: "12px", border: "2px solid #FFE49A", objectFit: "cover" }}
                    />
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#FFFFFF" }}>{currentStudent.name}</div>
                      <div style={{ fontSize: "11px", color: "#FFE49A", fontWeight: 700 }}>NIS: {currentStudent.nis}</div>
                      <div style={{ fontSize: "10px", color: "#A7F3D0" }}>{currentStudent.class}</div>
                      {/* Terpisah Asrama dan No. Kamar */}
                      <div style={{ fontSize: "9.5px", color: "#E3EEE9" }}>
                        {currentStudent.dormBuilding} · <strong>{currentStudent.roomNumber}</strong>
                      </div>
                      <div style={{ fontSize: "9px", color: "#8AA49B" }}>RFID: {currentStudent.rfidTag}</div>
                    </div>
                  </div>

                  {/* Dynamic Barcode & QR Code */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed rgba(255,255,255,0.2)", paddingTop: "8px" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "2px", color: "#FFE49A" }}>
                      |||| | ||||| |||| {currentStudent.barcode}
                    </div>
                    <span style={{ fontSize: "10px", color: "#A7F3D0", fontWeight: 700 }}>
                      QR: {currentStudent.qrCode}
                    </span>
                  </div>
                </div>

                {/* SISI BELAKANG (PANCA JIWA PONDOK) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "linear-gradient(135deg, #0D4332 0%, #06271E 100%)",
                    borderRadius: "18px",
                    padding: "16px",
                    border: "2px solid #FFE49A",
                    boxShadow: "0 10px 25px rgba(6, 39, 30, 0.4)",
                    color: "#FFFFFF",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#FFE49A", letterSpacing: "1px" }}>
                    PANCA JIWA PONDOK PESANTREN
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "4px", margin: "8px 0" }}>
                    {[
                      { num: "I", val: "Keikhlasan" },
                      { num: "II", val: "Kesederhanaan" },
                      { num: "III", val: "Berdikari" },
                      { num: "IV", val: "Ukhuwah" },
                      { num: "V", val: "Kebebasan" },
                    ].map((pj, idx) => (
                      <div key={idx} style={{ background: "rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 2px" }}>
                        <div style={{ fontSize: "9px", color: "#FFE49A", fontWeight: 800 }}>{pj.num}</div>
                        <div style={{ fontSize: "8.5px", color: "#FFFFFF", marginTop: "2px" }}>{pj.val}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: "9px", color: "#D1FAE5", lineHeight: "1.3", fontStyle: "italic" }}>
                    "Kartu ini adalah identitas sah santri Pondok Pesantren Darussalam Rajapolah. Wajib dijaga dan tidak dapat dipindahtangankan."
                  </div>

                  <div style={{ fontSize: "9.5px", color: "#FFE49A", fontWeight: 700, borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: "6px" }}>
                    Pimpinan Pondok: K.H. Hasan Basri
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: "11px", color: "#5B7A70", marginBottom: "14px" }}>
              💡 Ketuk kartu di atas untuk membalik tampilan (Animasi 3D Flip)
            </div>

            <button
              onClick={() => setIsIdCardModalOpen(false)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "12px",
                background: "var(--gradient-emerald)",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 2: RINCIAN SETORAN TAHFIDZ (Bersih Tanpa Audio Player)
         ------------------------------------------------------------- */}
      {isTahfidzModalOpen && selectedTahfidzItem && (
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
              maxWidth: "360px",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                📖 Rincian Mutaba'ah Tahfidz
              </div>
              <button
                onClick={() => setIsTahfidzModalOpen(false)}
                style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: "26px", height: "26px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: "#F4FBF7", borderRadius: "14px", padding: "14px", border: "1px solid #D1FAE5", marginBottom: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                {selectedTahfidzItem.surah}
              </div>
              <div style={{ fontSize: "11px", color: "#0D4332", marginTop: "2px" }}>
                {selectedTahfidzItem.verses} · Sesi: {selectedTahfidzItem.time}
              </div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#059669", marginTop: "8px" }}>
                Skor Penilaian Tajwid / Makhraj: ⭐ {selectedTahfidzItem.status}
              </div>
            </div>

            <div style={{ fontSize: "12px", color: "#5B7A70", marginBottom: "16px", lineHeight: "1.5" }}>
              <strong>Catatan Evaluasi Pembimbing:</strong>
              <div style={{ background: "#FFFBEB", border: "1px solid #FEF3C7", borderRadius: "10px", padding: "10px", color: "#92400E", marginTop: "6px", fontStyle: "italic" }}>
                "{selectedTahfidzItem.notes}"
              </div>
            </div>

            <button
              onClick={() => setIsTahfidzModalOpen(false)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "12px",
                background: "var(--gradient-emerald)",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
