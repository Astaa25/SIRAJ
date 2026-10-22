import React, { useState } from "react";
import { INITIAL_TENANTS, SYSTEM_USERS } from "../../data/mockData";
import { playSoftClick, playSuccessChime, triggerHaptic } from "../../utils/audio";

export default function SuperAdminView({ onTriggerLoader, onAuditLogAdd, currentTenant, onSelectTenant }) {
  const [tenants, setTenants] = useState(INITIAL_TENANTS);
  const [usersList, setUsersList] = useState(SYSTEM_USERS);
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);

  // Form Tambah Ponpes Baru
  const [newPonpesName, setNewPonpesName] = useState("");
  const [newPonpesLocation, setNewPonpesLocation] = useState("");
  const [newPonpesLeader, setNewPonpesLeader] = useState("");
  const [newPonpesDormTermOption, setNewPonpesDormTermOption] = useState("Asrama"); // Asrama, Sakan, Komplek, Kobong, Lainnya
  const [newPonpesCustomDormTerm, setNewPonpesCustomDormTerm] = useState("");
  const [newPonpesEmail, setNewPonpesEmail] = useState("");
  const [newPonpesLicenseType, setNewPonpesLicenseType] = useState("Enterprise Unlimited");

  // Toggle status aktif/nonaktif akun admin
  const handleToggleUserStatus = (email) => {
    playSoftClick();
    triggerHaptic([50]);

    setUsersList((prev) =>
      prev.map((u) => {
        if (u.email === email) {
          const newStatus = u.status === "Nonaktif" ? "Aktif" : "Nonaktif";
          onAuditLogAdd({
            user: "Super Admin Pusat",
            role: "Super Admin",
            action: newStatus === "Nonaktif" ? "NONAKTIFKAN AKUN" : "AKTIFKAN AKUN",
            object: `Akun: ${u.email} (${u.name})`,
            status: "BERHASIL",
            details: `Status akun diubah menjadi ${newStatus}.`,
          });
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  // Submit Ponpes Baru & Lisensi
  const handleCreateNewTenant = (e) => {
    e.preventDefault();
    if (!newPonpesName.trim()) return;

    playSoftClick();
    triggerHaptic([60]);
    setIsAddTenantModalOpen(false);

    onTriggerLoader(
      `Mendaftarkan ${newPonpesName} & Menerbitkan Lisensi Database Baru...`,
      () => {
        playSuccessChime();
        const tenantId = "ponpes-0" + (tenants.length + 1);
        const licenseKey = `SRJ-${newPonpesLicenseType.slice(0, 3).toUpperCase()}-${newPonpesName.slice(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        const effectiveDormTerm =
          newPonpesDormTermOption === "Lainnya"
            ? (newPonpesCustomDormTerm.trim() || "Asrama")
            : newPonpesDormTermOption;

        const newTenant = {
          id: tenantId,
          name: newPonpesName,
          shortName: newPonpesName,
          location: newPonpesLocation || "Indonesia",
          leader: newPonpesLeader || "Pimpinan Pesantren",
          dormTerm: effectiveDormTerm,
          licenseType: newPonpesLicenseType,
          licenseKey: licenseKey,
          status: "Aktif",
          studentCount: 0,
          adminEmail: newPonpesEmail || `admin@${tenantId}.id`,
          prayerSchedule: INITIAL_TENANTS[0].prayerSchedule,
        };

        setTenants((prev) => [...prev, newTenant]);

        // Otomatis buat akun admin untuk ponpes baru
        const newAdminUser = {
          email: newPonpesEmail || `admin@${tenantId}.id`,
          password: "123",
          name: `Admin ${newPonpesName}`,
          role: "admin",
          roleLabel: "Admin Ponpes",
          assignedTenantId: tenantId,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
          desc: `Admin Resmi ${newPonpesName}`,
          status: "Aktif",
        };
        setUsersList((prev) => [...prev, newAdminUser]);

        onAuditLogAdd({
          user: "Super Admin Pusat",
          role: "Super Admin",
          action: "TERBITKAN LISENSI PONPES BARU",
          object: `${newPonpesName} (${licenseKey})`,
          status: "SUKSES",
          details: `Instansiasi database terisolasi untuk ${newPonpesName} selesai. Skema multi-tenant aktif tanpa konflik data.`,
        });

        alert(`Pondok Pesantren ${newPonpesName} berhasil didaftarkan dengan lisensi: ${licenseKey}`);
        setNewPonpesName("");
        setNewPonpesLocation("");
        setNewPonpesLeader("");
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
        maxWidth: "1080px",
        margin: "0 auto",
      }}
    >
      {/* Header Super Admin */}
      <div
        style={{
          background: "linear-gradient(135deg, #03140F 0%, #06271E 100%)",
          borderRadius: "20px",
          padding: "20px 24px",
          border: "1.5px solid #FFE49A",
          color: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>🌐</span>
            <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#FFFFFF" }}>
              Pusat Kendali Super Admin Multi-Pesantren
            </h2>
            <span
              style={{
                background: "rgba(232, 182, 90, 0.2)",
                color: "#FFE49A",
                border: "1px solid #FFE49A",
                fontSize: "10px",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              Multi-Tenancy Master
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#A7F3D0", marginTop: "4px" }}>
            Manajemen Lisensi Database Terisolasi Antar-Pesantren · Bebas Konflik Data
          </div>
        </div>

        <button
          onClick={() => {
            playSoftClick();
            setIsAddTenantModalOpen(true);
          }}
          style={{
            background: "var(--gradient-gold)",
            color: "#06271E",
            padding: "10px 18px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(232, 182, 90, 0.4)",
          }}
        >
          <span>➕</span>
          <span>Daftarkan Ponpes Baru & Lisensi</span>
        </button>
      </div>

      {/* Grid Status Multi-Ponpes */}
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
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#06271E" }}>
              Daftar Pesantren & Lisensi Database Aktif ({tenants.length} Lembaga)
            </h3>
            <p style={{ fontSize: "11.5px", color: "#5B7A70" }}>
              Setiap pesantren memiliki basis data mandiri dan istilah asrama masing-masing
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "14px" }}>
          {tenants.map((t) => {
            const isCurrentActive = currentTenant?.id === t.id;
            return (
              <div
                key={t.id}
                style={{
                  background: isCurrentActive ? "#F4FBF7" : "#FFFFFF",
                  border: isCurrentActive ? "2px solid #10B981" : "1px solid #E2EFE9",
                  borderRadius: "16px",
                  padding: "16px",
                  boxShadow: "0 4px 12px rgba(6, 95, 70, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", background: "#D1FAE5", padding: "2px 8px", borderRadius: "6px" }}>
                      {t.status} · {t.licenseType}
                    </span>
                    <span style={{ fontSize: "11px", color: "#8AA49B" }}>ID: {t.id}</span>
                  </div>

                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#06271E", marginTop: "6px" }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#5B7A70", marginTop: "2px" }}>
                    📍 {t.location} · Pimpinan: {t.leader}
                  </div>
                  <div style={{ fontSize: "11px", color: "#0D4332", marginTop: "6px", background: "rgba(16, 185, 129, 0.08)", padding: "4px 8px", borderRadius: "6px" }}>
                    Istilah Hunian: <strong>{t.dormTerm}</strong> · Admin: {t.adminEmail}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#92400E", marginTop: "6px" }}>
                    Kunci Lisensi: {t.licenseKey}
                  </div>
                </div>

                <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px dashed #E2EFE9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "#5B7A70" }}>
                    Santri: {t.studentCount}
                  </span>
                  <button
                    onClick={() => {
                      playSoftClick();
                      if (onSelectTenant) onSelectTenant(t);
                    }}
                    style={{
                      background: isCurrentActive ? "var(--gradient-emerald)" : "#F3F4F6",
                      color: isCurrentActive ? "#FFFFFF" : "#374151",
                      border: "none",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {isCurrentActive ? "✓ Sedang Aktif" : "Pilih Konteks Ponpes"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manajemen Akun Admin & Hak Akses */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          padding: "20px",
          border: "1px solid #E2EFE9",
        }}
      >
        <div style={{ fontSize: "15px", fontWeight: 800, color: "#06271E", marginBottom: "12px" }}>
          👥 Manajemen Akun Seluruh Administrator & Pengguna (Bisa Dinonaktifkan)
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {usersList.map((usr) => {
            const isDeactivated = usr.status === "Nonaktif";
            return (
              <div
                key={usr.email}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: isDeactivated ? "#FEF2F2" : "#F4FBF7",
                  border: isDeactivated ? "1px solid #FECACA" : "1px solid #E2EFE9",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={usr.avatar} alt={usr.name} style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover" }} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: isDeactivated ? "#991B1B" : "#06271E" }}>
                        {usr.name}
                      </span>
                      <span style={{ fontSize: "10px", background: "#D1FAE5", color: "#065F46", padding: "1px 6px", borderRadius: "6px", fontWeight: 700 }}>
                        {usr.roleLabel}
                      </span>
                      {isDeactivated && (
                        <span style={{ fontSize: "10px", background: "#EF4444", color: "#FFFFFF", padding: "1px 6px", borderRadius: "6px", fontWeight: 800 }}>
                          NONAKTIF
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", color: "#5B7A70" }}>
                      {usr.email} · {usr.desc}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleToggleUserStatus(usr.email)}
                    style={{
                      background: isDeactivated ? "#10B981" : "#EF4444",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {isDeactivated ? "Aktifkan Akun" : "Nonaktifkan Akun"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: TAMBAH PONPES BARU & LISENSI */}
      {isAddTenantModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(5px)",
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
              padding: "26px",
              width: "100%",
              maxWidth: "500px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#06271E" }}>
                🏛️ Daftarkan Pondok Pesantren Baru & Lisensi
              </div>
              <button
                onClick={() => setIsAddTenantModalOpen(false)}
                style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewTenant} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Nama Resmi Pondok Pesantren:</label>
                <input
                  type="text"
                  required
                  placeholder="contoh: Pondok Pesantren Al-Ihsan"
                  value={newPonpesName}
                  onChange={(e) => setNewPonpesName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "3px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Lokasi / Kota:</label>
                <input
                  type="text"
                  placeholder="contoh: Ciamis, Jawa Barat"
                  value={newPonpesLocation}
                  onChange={(e) => setNewPonpesLocation(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "3px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Nama Pimpinan Pondok:</label>
                  <input
                    type="text"
                    placeholder="K.H. ..."
                    value={newPonpesLeader}
                    onChange={(e) => setNewPonpesLeader(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "3px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Istilah Tempat Tinggal:</label>
                  <select
                    value={newPonpesDormTermOption}
                    onChange={(e) => setNewPonpesDormTermOption(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "3px" }}
                  >
                    <option value="Asrama">Asrama</option>
                    <option value="Sakan">Sakan</option>
                    <option value="Komplek">Komplek</option>
                    <option value="Kobong">Kobong</option>
                    <option value="Lainnya">Lainnya...</option>
                  </select>

                  {newPonpesDormTermOption === "Lainnya" && (
                    <input
                      type="text"
                      placeholder="Ketik istilah kustom (misal: Wisma, Bilik, dll)..."
                      value={newPonpesCustomDormTerm}
                      onChange={(e) => setNewPonpesCustomDormTerm(e.target.value)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid #10B981", fontSize: "11.5px", marginTop: "4px", background: "#F4FBF7", outline: "none" }}
                    />
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Email Admin Utama:</label>
                <input
                  type="email"
                  placeholder="admin@ponpesbaru.id"
                  value={newPonpesEmail}
                  onChange={(e) => setNewPonpesEmail(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "3px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Paket Lisensi:</label>
                <select
                  value={newPonpesLicenseType}
                  onChange={(e) => setNewPonpesLicenseType(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1FAE5", fontSize: "12px", marginTop: "3px" }}
                >
                  <option value="Enterprise Unlimited">Enterprise Unlimited (Database Terdedikasi)</option>
                  <option value="Standard Campus">Standard Campus (Maks 1.500 Santri)</option>
                  <option value="Trial 30 Hari">Trial Gratis 30 Hari</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: "12px",
                  padding: "11px",
                  borderRadius: "12px",
                  background: "var(--gradient-emerald)",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Terbitkan Lisensi & Instansiasi Database
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
