import React, { useState } from "react";
import {
  INITIAL_STUDENTS,
  INITIAL_SYAHRIYYAH_TRANSACTIONS,
} from "../../data/mockData";
import { playSoftClick, playSuccessChime, triggerHaptic } from "../../utils/audio";

export default function PortalBendaharaView({
  currentUser,
  currentTenant,
  onTriggerLoader,
  onAuditLogAdd,
  onUpdateTenant,
}) {
  const bendaharaName = currentUser?.name || "Ustadz H. Mansyur, S.E.";
  const ponpesName = currentTenant?.name || "Pondok Pesantren Darussalam Rajapolah Tasikmalaya";

  // Tab Navigasi Bendahara
  const [activeTab, setActiveTab] = useState("tagihan"); // tagihan, transaksi, pengaturan

  // State Data Santri & Tagihan
  const [studentsList, setStudentsList] = useState(INITIAL_STUDENTS);
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, Lunas, Belum Lunas
  const [dormFilter, setDormFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // State Riwayat Transaksi Kas
  const [transactions, setTransactions] = useState(INITIAL_SYAHRIYYAH_TRANSACTIONS);

  // State Modal Cetak Kuitansi
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // State Pengaturan Tarif & Periode SPP
  const [sppFeeInput, setSppFeeInput] = useState(currentTenant?.syahriyyahFee || 1250000);
  const [sppMonthInput, setSppMonthInput] = useState(
    studentsList[0]?.syahriyyahMonth || "Oktober 2026"
  );
  const [bankAccountInput, setBankAccountInput] = useState(
    "Bank Syariah Indonesia (BSI) · No. Rek: 712-3456-789 a.n. Yayasan Pondok Pesantren"
  );

  // Filter Data Santri
  const filteredStudents = studentsList.filter((st) => {
    const matchSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.nis.includes(searchQuery) ||
      st.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.dormBuilding.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "Lunas"
        ? st.syahriyyahStatus === "Lunas"
        : st.syahriyyahStatus !== "Lunas";

    const matchDorm =
      dormFilter === "ALL"
        ? true
        : st.dormBuilding.toLowerCase().includes(dormFilter.toLowerCase());

    return matchSearch && matchStatus && matchDorm;
  });

  // KPI Hitungan Finansial Real-Time
  const totalStudents = studentsList.length;
  const lunasCount = studentsList.filter((s) => s.syahriyyahStatus === "Lunas").length;
  const belumLunasCount = totalStudents - lunasCount;
  const currentFee = sppFeeInput;
  const targetTotalKas = totalStudents * currentFee;
  const kasTerkumpul = lunasCount * currentFee;
  const piutangTertunggak = belumLunasCount * currentFee;
  const persenLunas = Math.round((lunasCount / (totalStudents || 1)) * 100);

  // 1-Click Toggle Status Syahriyyah Santri
  const handleToggleSyahriyyah = (student) => {
    playSoftClick();
    triggerHaptic([50]);

    const nextStatus = student.syahriyyahStatus === "Lunas" ? "Belum Lunas" : "Lunas";

    onTriggerLoader(
      `Memperbarui Status Pembayaran ${student.name} menjadi ${nextStatus.toUpperCase()}...`,
      () => {
        playSuccessChime();

        setStudentsList((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, syahriyyahStatus: nextStatus } : s))
        );

        if (nextStatus === "Lunas") {
          const newTrx = {
            id: "TRX-" + Date.now(),
            receiptNo: `KW-${Date.now().toString().slice(-6)}-${student.nis.slice(-4)}`,
            studentId: student.id,
            studentName: student.name,
            nis: student.nis,
            class: student.class,
            dormBuilding: student.dormBuilding,
            guardianName: student.guardianName,
            amount: currentFee,
            month: sppMonthInput,
            paymentDate: "Hari Ini, " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
            method: "Tunai / Konfirmasi Bendahara",
            receiver: `${bendaharaName} (Bendahara)`,
            status: "Lunas",
          };
          setTransactions((prev) => [newTrx, ...prev]);
        }

        onAuditLogAdd({
          user: `${bendaharaName} (Bendahara)`,
          role: "Bendahara",
          action: `UBAH STATUS SYAHRIYYAH: ${nextStatus.toUpperCase()}`,
          object: `Santri: ${student.name} (NIS: ${student.nis})`,
          status: "BERHASIL",
          details: `Status tagihan Syahriyyah ${sppMonthInput} (Rp ${currentFee.toLocaleString("id-ID")}) diubah menjadi ${nextStatus}. Dicatat manual di loket kasir bendahara.`,
        });
      }
    );
  };

  // Handler Buka Modal Kuitansi Resmi
  const handleOpenReceiptModal = (student) => {
    playSoftClick();
    const existingTrx = transactions.find((t) => t.studentId === student.id);
    const receiptData = {
      receiptNo: existingTrx?.receiptNo || `KW-202610-${student.nis.slice(-4)}`,
      studentName: student.name,
      nis: student.nis,
      class: student.class,
      dormBuilding: student.dormBuilding,
      roomNumber: student.roomNumber,
      guardianName: student.guardianName,
      amount: currentFee,
      month: sppMonthInput,
      paymentDate: existingTrx?.paymentDate || "Kamis, 22 Oktober 2026 · 10:00 WIB",
      method: existingTrx?.method || "Tunai di Loket Kantor Bendahara",
      receiver: bendaharaName,
      status: student.syahriyyahStatus || "Lunas",
    };
    setSelectedReceipt(receiptData);
    setIsReceiptModalOpen(true);
  };

  // Handler Simpan Pengaturan SPP
  const handleSaveSppSettings = (e) => {
    e.preventDefault();
    playSoftClick();
    triggerHaptic([60]);

    onTriggerLoader("Menyimpan Pengaturan Tarif & Periode Syahriyyah Ponpes...", () => {
      playSuccessChime();

      setStudentsList((prev) =>
        prev.map((s) => ({
          ...s,
          syahriyyahMonth: sppMonthInput,
          syahriyyahAmount: sppFeeInput,
        }))
      );

      if (onUpdateTenant) {
        onUpdateTenant({
          syahriyyahFee: sppFeeInput,
        });
      }

      onAuditLogAdd({
        user: `${bendaharaName} (Bendahara)`,
        role: "Bendahara",
        action: "UPDATE TARIF & PERIODE SYAHRIYYAH",
        object: `Ponpes: ${ponpesName}`,
        status: "TERSINKRONISASI",
        details: `Tarif SPP baru: Rp ${sppFeeInput.toLocaleString("id-ID")} · Periode aktif: ${sppMonthInput}. Tampil otomatis di dashboard seluruh Wali Santri.`,
      });

      alert(`✅ Pengaturan Syahriyyah berhasil diperbarui: Rp ${sppFeeInput.toLocaleString("id-ID")} untuk periode ${sppMonthInput}.`);
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        maxWidth: "1080px",
        margin: "0 auto",
      }}
    >
      {/* -------------------------------------------------------------
          HEADER BENDAHARA / BAGIAN KEUANGAN
         ------------------------------------------------------------- */}
      <div
        style={{
          background: "linear-gradient(135deg, #06271E 0%, #0D4332 100%)",
          borderRadius: "20px",
          padding: "20px 24px",
          border: "1px solid rgba(232, 182, 90, 0.35)",
          color: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: "0 8px 24px rgba(6, 39, 30, 0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "rgba(232, 182, 90, 0.2)",
              border: "1.5px solid #FFE49A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 900,
              color: "#FFE49A",
              boxShadow: "0 0 16px rgba(232, 182, 90, 0.3)",
            }}
          >
            Rp
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF" }}>
                Portal Bendahara & Administrasi Keuangan
              </h1>
              <span
                style={{
                  background: "#D1FAE5",
                  color: "#065F46",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                Pencatatan Manual Bebas Repot
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#FFE49A", marginTop: "2px" }}>
              Petugas: <strong>{bendaharaName}</strong> · Lembaga: {ponpesName}
            </div>
            <div style={{ fontSize: "11px", color: "#A7F3D0", marginTop: "1px" }}>
              Tarif SPP Aktif: <strong>Rp {currentFee.toLocaleString("id-ID")}</strong> / Santri · Periode: <strong>{sppMonthInput}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => {
              playSoftClick();
              setActiveTab("pengaturan");
            }}
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(232, 182, 90, 0.3)",
              color: "#FFE49A",
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "11.5px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Atur SPP & Rekening
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          CARD KPI KAS & PENERIMAAN SYAHRIYYAH (REAL-TIME)
         ------------------------------------------------------------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "16px 18px",
            border: "1px solid #E2EFE9",
            boxShadow: "0 2px 8px rgba(6,39,30,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#5B7A70" }}>Total Target Kas SPP</span>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "#06271E" }}>
            Rp {targetTotalKas.toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: "10.5px", color: "#8AA49B", marginTop: "3px" }}>
            {totalStudents} Santri x Rp {currentFee.toLocaleString("id-ID")}
          </div>
        </div>

        <div
          style={{
            background: "#F4FBF7",
            borderRadius: "16px",
            padding: "16px 18px",
            border: "1px solid #D1FAE5",
            boxShadow: "0 2px 8px rgba(6,39,30,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#065F46" }}>Penerimaan Terkumpul</span>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "#059669" }}>
            Rp {kasTerkumpul.toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: "10.5px", color: "#059669", fontWeight: 700, marginTop: "3px" }}>
            {lunasCount} Santri Lunas ({persenLunas}% Terbayar)
          </div>
        </div>

        <div
          style={{
            background: "#FEF2F2",
            borderRadius: "16px",
            padding: "16px 18px",
            border: "1px solid #FECACA",
            boxShadow: "0 2px 8px rgba(6,39,30,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#991B1B" }}>Piutang / Belum Lunas</span>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "#DC2626" }}>
            Rp {piutangTertunggak.toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: "10.5px", color: "#B91C1C", fontWeight: 700, marginTop: "3px" }}>
            {belumLunasCount} Santri Belum Lunas
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "16px 18px",
            border: "1px solid #E2EFE9",
            boxShadow: "0 2px 8px rgba(6,39,30,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#5B7A70" }}>Periode Aktif</span>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#D97706" }}>
            {sppMonthInput}
          </div>
          <div style={{ fontSize: "10.5px", color: "#8AA49B", marginTop: "3px" }}>
            Kasir: Loket Kantor Bendahara
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          SUB-NAVIGASI BENDAHARA
         ------------------------------------------------------------- */}
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
          { id: "tagihan", label: `Daftar Tagihan Santri (${filteredStudents.length})` },
          { id: "transaksi", label: `Buku Kas Masuk (${transactions.length})` },
          { id: "pengaturan", label: "Pengaturan Tarif & Rekening" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playSoftClick();
              setActiveTab(tab.id);
            }}
            style={{
              flex: "1 1 auto",
              padding: "9px 16px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: activeTab === tab.id ? 800 : 600,
              background: activeTab === tab.id ? "var(--gradient-emerald)" : "transparent",
              color: activeTab === tab.id ? "#FFFFFF" : "#5B7A70",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* -------------------------------------------------------------
          TAB 1: DAFTAR TAGIHAN SYAHRIYYAH & PENCATATAN 1-KLIK
         ------------------------------------------------------------- */}
      {activeTab === "tagihan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Filter Bar */}
          <div
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
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "260px" }}>
              <input
                type="text"
                placeholder="Cari nama santri, NIS, kelas, atau asrama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  fontSize: "12px",
                  color: "#06271E",
                  outline: "none",
                }}
              />
            </div>

            {/* Filter Status Syahriyyah */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Status:</span>
              {[
                { id: "ALL", label: `Semua (${totalStudents})` },
                { id: "Lunas", label: `🟢 Lunas (${lunasCount})` },
                { id: "Belum Lunas", label: `🔴 Belum Lunas (${belumLunasCount})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    playSoftClick();
                    setStatusFilter(f.id);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: statusFilter === f.id ? 800 : 600,
                    background: statusFilter === f.id ? "var(--gradient-emerald)" : "#F3F4F6",
                    color: statusFilter === f.id ? "#FFFFFF" : "#5B7A70",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabel Santri & Syahriyyah */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #E2EFE9",
              overflowX: "auto",
              boxShadow: "0 2px 10px rgba(6,39,30,0.03)",
            }}
          >
            <table style={{ width: "100%", minWidth: "720px", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: "#F4FBF7", borderBottom: "1.5px solid #D1FAE5", color: "#065F46", textAlign: "left" }}>
                  <th style={{ padding: "12px 14px" }}>Santri</th>
                  <th style={{ padding: "12px 14px" }}>NIS & Kelas</th>
                  <th style={{ padding: "12px 14px" }}>Hunian Asrama</th>
                  <th style={{ padding: "12px 14px" }}>Wali Sah</th>
                  <th style={{ padding: "12px 14px" }}>Nominal SPP</th>
                  <th style={{ padding: "12px 14px" }}>Status Tagihan</th>
                  <th style={{ padding: "12px 14px", textAlign: "center" }}>Aksi Bendahara</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st) => (
                  <tr key={st.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={st.photo}
                        alt={st.name}
                        style={{ width: "38px", height: "38px", borderRadius: "10px", objectFit: "cover" }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, color: "#06271E", whiteSpace: "nowrap" }}>
                          {st.name}
                        </div>
                        <div style={{ fontSize: "10px", color: "#8AA49B" }}>
                          ID: {st.id}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#5B7A70", whiteSpace: "nowrap" }}>
                      <div>{st.nis}</div>
                      <div style={{ fontSize: "10.5px", color: "#065F46", fontWeight: 700 }}>{st.class}</div>
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ color: "#06271E", fontWeight: 600 }}>{st.dormBuilding}</div>
                      <span style={{ background: "#E2EFE9", color: "#06271E", padding: "1px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>
                        {st.roomNumber}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ color: "#06271E" }}>{st.guardianName}</div>
                      <div style={{ fontSize: "10.5px", color: "#5B7A70" }}>{st.guardianPhone}</div>
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap", fontWeight: 700, color: "#06271E" }}>
                      Rp {currentFee.toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          background: st.syahriyyahStatus === "Lunas" ? "#D1FAE5" : "#FEE2E2",
                          color: st.syahriyyahStatus === "Lunas" ? "#065F46" : "#B42318",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 800,
                        }}
                      >
                        {st.syahriyyahStatus === "Lunas" ? "Lunas" : "Belum Lunas"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                        {/* 1-Click Toggle */}
                        <button
                          onClick={() => handleToggleSyahriyyah(st)}
                          title="Klik untuk ubah Lunas / Belum Lunas"
                          style={{
                            background: st.syahriyyahStatus === "Lunas" ? "#F3F4F6" : "#ECFDF5",
                            border: st.syahriyyahStatus === "Lunas" ? "1px solid #D1D5DB" : "1px solid #A7F3D0",
                            color: st.syahriyyahStatus === "Lunas" ? "#374151" : "#065F46",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {st.syahriyyahStatus === "Lunas" ? "Tandai Belum Lunas" : "Tandai Lunas"}
                        </button>

                        {/* Cetak Kuitansi */}
                        {st.syahriyyahStatus === "Lunas" && (
                          <button
                            onClick={() => handleOpenReceiptModal(st)}
                            title="Cetak Kuitansi Resmi Pembayaran"
                            style={{
                              background: "rgba(232, 182, 90, 0.2)",
                              border: "1px solid #FFE49A",
                              color: "#92400E",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: 800,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            Kuitansi
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: BUKU KAS & RIWAYAT TRANSAKSI PENERIMAAN
         ------------------------------------------------------------- */}
      {activeTab === "transaksi" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "16px 18px",
              border: "1px solid #E2EFE9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                Buku Rekapitulasi Kas Pembayaran Masuk
              </div>
              <div style={{ fontSize: "11px", color: "#5B7A70", marginTop: "2px" }}>
                Arsip tanda bukti pembayaran resmi yang telah disahkan Bendahara Pondok Pesantren.
              </div>
            </div>
            <span style={{ background: "#D1FAE5", color: "#065F46", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>
              {transactions.length} Transaksi Tercatat
            </span>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #E2EFE9",
              overflowX: "auto",
            }}
          >
            <table style={{ width: "100%", minWidth: "700px", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: "#F4FBF7", borderBottom: "1.5px solid #D1FAE5", color: "#065F46", textAlign: "left" }}>
                  <th style={{ padding: "12px 14px" }}>No. Kuitansi</th>
                  <th style={{ padding: "12px 14px" }}>Nama Santri & NIS</th>
                  <th style={{ padding: "12px 14px" }}>Wali Pembayar</th>
                  <th style={{ padding: "12px 14px" }}>Waktu Pembayaran</th>
                  <th style={{ padding: "12px 14px" }}>Metode Bayar</th>
                  <th style={{ padding: "12px 14px" }}>Jumlah</th>
                  <th style={{ padding: "12px 14px", textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trx) => (
                  <tr key={trx.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: "#047857", whiteSpace: "nowrap" }}>
                      {trx.receiptNo}
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 700, color: "#06271E" }}>{trx.studentName}</div>
                      <div style={{ fontSize: "10px", color: "#8AA49B" }}>NIS: {trx.nis} · {trx.class}</div>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#5B7A70", whiteSpace: "nowrap" }}>
                      {trx.guardianName}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#06271E", whiteSpace: "nowrap" }}>
                      {trx.paymentDate}
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ background: "#EFF6FF", color: "#1D4ED8", padding: "2px 8px", borderRadius: "6px", fontSize: "10.5px", fontWeight: 700 }}>
                        {trx.method}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: "#059669", whiteSpace: "nowrap" }}>
                      Rp {trx.amount.toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => {
                          playSoftClick();
                          setSelectedReceipt(trx);
                          setIsReceiptModalOpen(true);
                        }}
                        style={{
                          background: "var(--gradient-emerald)",
                          color: "#FFFFFF",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Cetak Ulang
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: PENGATURAN TARIF & PERIODE SYAHRIYYAH
         ------------------------------------------------------------- */}
      {activeTab === "pengaturan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              padding: "22px 24px",
              border: "1px solid #E2EFE9",
              boxShadow: "0 2px 10px rgba(6,39,30,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #E2EFE9" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#06271E" }}>
                  Konfigurasi Tarif Syahriyyah / SPP & Periode Aktif
                </div>
                <div style={{ fontSize: "11px", color: "#5B7A70", marginTop: "2px" }}>
                  Perubahan di sini otomatis tampil di kartu status Wali Santri dan rekap tagihan Admin Ponpes.
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSppSettings} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#06271E", display: "block", marginBottom: "4px" }}>
                    Besaran Iuran SPP Bulanan (Rupiah):
                  </label>
                  <input
                    type="number"
                    value={sppFeeInput}
                    onChange={(e) => setSppFeeInput(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "9px 14px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#06271E",
                      outline: "none",
                    }}
                    required
                  />
                  <div style={{ fontSize: "10px", color: "#8AA49B", marginTop: "3px" }}>
                    Saat ini: Rp {sppFeeInput.toLocaleString("id-ID")} per santri per bulan.
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#06271E", display: "block", marginBottom: "4px" }}>
                    Periode Bulan Tagihan Berjalan:
                  </label>
                  <input
                    type="text"
                    value={sppMonthInput}
                    onChange={(e) => setSppMonthInput(e.target.value)}
                    placeholder="Contoh: Oktober 2026, November 2026"
                    style={{
                      width: "100%",
                      padding: "9px 14px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#06271E",
                      outline: "none",
                    }}
                    required
                  />
                  <div style={{ fontSize: "10px", color: "#8AA49B", marginTop: "3px" }}>
                    Label bulan yang ditampilkan di kartu status Wali Santri.
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#06271E", display: "block", marginBottom: "4px" }}>
                  Informasi Rekening Resmi Pembayaran Pesantren:
                </label>
                <input
                  type="text"
                  value={bankAccountInput}
                  onChange={(e) => setBankAccountInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    fontSize: "12px",
                    color: "#06271E",
                    outline: "none",
                  }}
                />
                <div style={{ fontSize: "10px", color: "#8AA49B", marginTop: "3px" }}>
                  Rekening tujuan transfer manual bagi wali santri yang ingin transfer via bank.
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  style={{
                    background: "var(--gradient-emerald)",
                    color: "#FFFFFF",
                    padding: "10px 22px",
                    borderRadius: "12px",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(6, 95, 70, 0.3)",
                  }}
                >
                  Simpan Konfigurasi Syahriyyah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL CETAK KUITANSI PEMBAYARAN SYAHRIYYAH RESMI
         ------------------------------------------------------------- */}
      {isReceiptModalOpen && selectedReceipt && (
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
              borderRadius: "20px",
              padding: "28px 32px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "92vh",
              overflowY: "auto",
              color: "#06271E",
              boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* Header Modal & Print Action */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #E2EFE9" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#06271E" }}>
                Tanda Bukti Kuitansi Pembayaran Syahriyyah
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: "var(--gradient-emerald)",
                    color: "#FFFFFF",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 800,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cetak Kuitansi
                </button>
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  style={{
                    background: "#F3F4F6",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  ✕ Tutup
                </button>
              </div>
            </div>

            {/* Badan Fisik Kuitansi Resmi */}
            <div
              style={{
                border: "2px solid #065F46",
                borderRadius: "14px",
                padding: "20px",
                background: "#FAFCFA",
                position: "relative",
              }}
            >
              {/* Kop Kuitansi */}
              <div style={{ textAlign: "center", borderBottom: "2px solid #065F46", paddingBottom: "10px", marginBottom: "14px" }}>
                <div style={{ fontSize: "15px", fontWeight: 900, color: "#06271E", letterSpacing: "0.04em" }}>
                  {ponpesName.toUpperCase()}
                </div>
                <div style={{ fontSize: "10px", color: "#5B7A70", marginTop: "2px" }}>
                  KANTOR BENDAHARA & ADMINISTRASI KEUANGAN PONDOK PESANTREN
                </div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#047857", marginTop: "6px", textDecoration: "underline" }}>
                  KUITANSI PEMBAYARAN SYAHRIYYAH RESMI
                </div>
                <div style={{ fontSize: "10.5px", color: "#6B7280", marginTop: "2px" }}>
                  No: <strong>{selectedReceipt.receiptNo}</strong>
                </div>
              </div>

              {/* Rincian Kuitansi */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11.5px" }}>
                <div style={{ display: "flex" }}>
                  <span style={{ width: "140px", color: "#5B7A70" }}>Telah Diterima Dari</span>
                  <span style={{ width: "10px" }}>:</span>
                  <strong style={{ color: "#06271E", flex: 1 }}>{selectedReceipt.guardianName} (Wali Santri)</strong>
                </div>

                <div style={{ display: "flex" }}>
                  <span style={{ width: "140px", color: "#5B7A70" }}>Untuk Nama Santri</span>
                  <span style={{ width: "10px" }}>:</span>
                  <strong style={{ color: "#06271E", flex: 1 }}>{selectedReceipt.studentName} (NIS: {selectedReceipt.nis})</strong>
                </div>

                <div style={{ display: "flex" }}>
                  <span style={{ width: "140px", color: "#5B7A70" }}>Kelas & Asrama</span>
                  <span style={{ width: "10px" }}>:</span>
                  <span style={{ color: "#06271E", flex: 1 }}>{selectedReceipt.class} · {selectedReceipt.dormBuilding}</span>
                </div>

                <div style={{ display: "flex" }}>
                  <span style={{ width: "140px", color: "#5B7A70" }}>Untuk Pembayaran</span>
                  <span style={{ width: "10px" }}>:</span>
                  <strong style={{ color: "#065F46", flex: 1 }}>Iuran Syahriyyah / SPP Bulan {selectedReceipt.month}</strong>
                </div>

                <div style={{ display: "flex" }}>
                  <span style={{ width: "140px", color: "#5B7A70" }}>Metode Bayar</span>
                  <span style={{ width: "10px" }}>:</span>
                  <span style={{ color: "#06271E", flex: 1 }}>{selectedReceipt.method}</span>
                </div>
              </div>

              {/* Box Jumlah Nominal Uang */}
              <div
                style={{
                  background: "#ECFDF5",
                  border: "1.5px solid #A7F3D0",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginTop: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "10px", color: "#065F46", fontWeight: 700 }}>JUMLAH PEMBAYARAN:</div>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: "#065F46" }}>
                    Rp {selectedReceipt.amount.toLocaleString("id-ID")},-
                  </div>
                </div>
                <span style={{ background: "#D1FAE5", color: "#065F46", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 900 }}>
                  LUNAS
                </span>
              </div>

              {/* Terbilang */}
              <div style={{ fontSize: "10.5px", color: "#4B5563", fontStyle: "italic", marginTop: "6px" }}>
                Terbilang: <strong>Satu Juta Dua Ratus Lima Puluh Ribu Rupiah</strong>
              </div>

              {/* Tanda Tangan Bendahara */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "24px", paddingTop: "12px", borderTop: "1px dashed #CBD5E1" }}>
                <div style={{ fontSize: "9.5px", color: "#8AA49B" }}>
                  <div>Waktu: {selectedReceipt.paymentDate}</div>
                  <div>Dicatat di SIRAJ Financial Module</div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "10.5px", color: "#5B7A70" }}>Bendahara Penerima,</div>
                  <div
                    style={{
                      fontFamily: "cursive",
                      fontSize: "17px",
                      color: "#065F46",
                      margin: "6px 0",
                      fontWeight: 800,
                    }}
                  >
                    Mansyur, S.E.
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#06271E", textDecoration: "underline" }}>
                    {bendaharaName}
                  </div>
                  <div style={{ fontSize: "9.5px", color: "#5B7A70" }}>NIP. 2026.04.1102</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
