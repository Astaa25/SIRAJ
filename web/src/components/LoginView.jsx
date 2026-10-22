import React, { useState } from "react";
import { SYSTEM_USERS, INITIAL_TENANTS } from "../data/mockData";
import { playSoftClick, playSuccessChime, playWarningTone, triggerHaptic } from "../utils/audio";

export default function LoginView({ onLoginSuccess, currentTenant = INITIAL_TENANTS[0] }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleManualLogin = (e) => {
    e.preventDefault();
    playSoftClick();

    const query = email.trim().toLowerCase();
    if (!query) {
      setErrorMessage("Silakan masukkan email atau username (contoh: admin, superadmin, wali, guru, dll).");
      return;
    }

    // Support flexible matching by username, role, typo keywords, email, or full name
    const user = SYSTEM_USERS.find((u) => {
      const emailMatch = u.email.toLowerCase() === query;
      const roleMatch = u.role.toLowerCase() === query;
      const roleLabelMatch = u.roleLabel.toLowerCase() === query;
      const nameMatch = u.name.toLowerCase().includes(query);
      const adminMatch = (query === "admin" || query === "admin ponpes" || query === "admin ponpres" || query === "admin pesantren" || query === "administrator") && u.role === "admin";
      const superAdminMatch = (query === "superadmin" || query === "super admin" || query === "pusat") && u.role === "superadmin";
      const waliMatch = (query === "wali" || query === "wali santri" || query === "ortu" || query === "orang tua") && u.role === "wali";
      const guruMatch = (query === "guru" || query === "guru kbm" || query === "ustadz kbm") && u.role === "guru";
      const ubudiyyahMatch = (query === "ubudiyyah" || query === "sholat" || query === "masjid") && u.role === "ubudiyyah";
      const musyrifMatch = (query === "musyrif" || query === "asrama" || query === "kamar") && u.role === "musyrif";
      const satpamMatch = (query === "satpam" || query === "gerbang" || query === "security") && u.role === "satpam";
      const bkMatch = (query === "bk" || query === "guru bk" || query === "konseling") && u.role === "bk";
      const pengasuhanMatch = (query === "pengasuhan" || query === "kepala pengasuhan") && u.role === "pengasuhan";

      return (
        emailMatch ||
        roleMatch ||
        roleLabelMatch ||
        nameMatch ||
        adminMatch ||
        superAdminMatch ||
        waliMatch ||
        guruMatch ||
        ubudiyyahMatch ||
        musyrifMatch ||
        satpamMatch ||
        bkMatch ||
        pengasuhanMatch
      );
    });

    if (!user) {
      playWarningTone();
      triggerHaptic([100, 50]);
      setErrorMessage("Akun tidak ditemukan. Masukkan 'admin', 'superadmin', 'wali', atau klik tombol akun demo di bawah.");
      return;
    }

    if (user.status === "Nonaktif") {
      playWarningTone();
      triggerHaptic([120, 60]);
      setErrorMessage("Akun ini telah dinonaktifkan oleh Administrator Pesantren.");
      return;
    }

    // Success
    playSuccessChime();
    triggerHaptic([60]);
    localStorage.setItem("siraj_auth_user", JSON.stringify(user));
    onLoginSuccess(user);
  };

  const handleQuickLogin = (user) => {
    playSoftClick();
    playSuccessChime();
    triggerHaptic([60]);
    localStorage.setItem("siraj_auth_user", JSON.stringify(user));
    onLoginSuccess(user);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "480px",
        margin: "0 auto",
        padding: "20px 16px",
      }}
    >
      <div
        className="fade-in-up"
        style={{
          background: "#FFFFFF",
          borderRadius: "28px",
          padding: "32px 24px",
          boxShadow: "0 25px 60px -15px rgba(6, 39, 30, 0.4)",
          border: "1.5px solid rgba(232, 182, 90, 0.35)",
          textAlign: "center",
        }}
      >
        {/* Brand Icon & Heading */}
        <div style={{ marginBottom: "20px" }}>
          <img
            src="/logo_tile_1024.png"
            alt="SIRAJ"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              border: "2px solid #FFE49A",
              boxShadow: "0 8px 24px rgba(232, 182, 90, 0.35)",
              marginBottom: "12px",
            }}
          />
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#06271E", letterSpacing: "0.05em" }}>
            SIRAJ
          </h1>
          <p style={{ fontSize: "12px", color: "#059669", fontWeight: 700, marginTop: "2px" }}>
            Smart Islamic Routine & Attendance Journey
          </p>
          <div
            style={{
              fontSize: "11px",
              color: "#5B7A70",
              marginTop: "4px",
              fontWeight: 500,
            }}
          >
            {currentTenant.name}
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "12px",
              padding: "10px 14px",
              fontSize: "12px",
              color: "#B42318",
              fontWeight: 600,
              marginBottom: "16px",
              textAlign: "left",
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Manual Login Form (No Sign Up) */}
        <form onSubmit={handleManualLogin} style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>
              Email atau Username (Admin / Super Admin / Peran):
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage("");
              }}
              placeholder="Ketik: admin, superadmin, wali, guru, dsb."
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1.5px solid #D1FAE5",
                fontSize: "13px",
                marginTop: "4px",
                outline: "none",
                background: "#F4FBF7",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#5B7A70" }}>Kata Sandi:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
              }}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1.5px solid #D1FAE5",
                fontSize: "13px",
                marginTop: "4px",
                outline: "none",
                background: "#F4FBF7",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              background: "var(--gradient-emerald)",
              color: "#FFFFFF",
              padding: "12px",
              borderRadius: "14px",
              fontSize: "13px",
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              marginTop: "8px",
              boxShadow: "0 4px 15px rgba(6, 95, 70, 0.3)",
            }}
          >
            Masuk ke Akun SIRAJ
          </button>
        </form>

        <div style={{ fontSize: "10.5px", color: "#8AA49B", margin: "16px 0 12px 0" }}>
          *Sesi login otomatis tersimpan di perangkat hingga Anda menekan tombol Keluar (Logout).
        </div>

        {/* Quick Demo Login Grid for Testing */}
        <div style={{ borderTop: "1px dashed #E2EFE9", paddingTop: "16px" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#06271E", marginBottom: "10px", textAlign: "left" }}>
            ⚡ Akses Cepat Akun Demo (Pilih Peran Langsung):
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              maxHeight: "260px",
              overflowY: "auto",
              paddingRight: "2px",
            }}
            className="no-scrollbar"
          >
            {SYSTEM_USERS.map((usr) => (
              <button
                key={usr.email}
                onClick={() => handleQuickLogin(usr)}
                style={{
                  background: usr.role === "superadmin" ? "#06271E" : "#F4FBF7",
                  border: usr.role === "superadmin" ? "1px solid #FFE49A" : "1px solid #D1FAE5",
                  color: usr.role === "superadmin" ? "#FFE49A" : "#06271E",
                  borderRadius: "12px",
                  padding: "8px 10px",
                  fontSize: "11px",
                  fontWeight: 700,
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <img src={usr.avatar} alt={usr.name} style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }} />
                  <span style={{ fontWeight: 800 }}>{usr.roleLabel}</span>
                </div>
                <span style={{ fontSize: "9.5px", opacity: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {usr.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
