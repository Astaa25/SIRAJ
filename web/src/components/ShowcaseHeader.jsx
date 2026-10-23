import React from "react";
import { playSoftClick } from "../utils/audio";
import { ROLES_LIST, SYSTEM_USERS } from "../data/mockData";

export default function ShowcaseHeader({
  currentUser,
  setCurrentUser,
  onLogout,
  currentTenant,
  activeRole,
  setActiveRole,
  deviceMode,
  setDeviceMode,
  theme = "dark",
  onToggleTheme,
  is2sLoaderEnabled,
  setIs2sLoaderEnabled,
  isMuted,
  setIsMuted,
  onReplaySplash,
  onTriggerLoader,
}) {
  const isLaptopAllowed = activeRole === "admin" || activeRole === "superadmin" || activeRole === "bendahara";

  const handleRoleChange = (roleId) => {
    playSoftClick();
    const roleObj = ROLES_LIST.find((r) => r.id === roleId);
    const matchingUser = SYSTEM_USERS.find((u) => u.role === roleId) || {
      name: roleObj?.label || roleId,
      role: roleId,
      roleLabel: roleObj?.label || roleId,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
    };
    const willBeLaptopAllowed = roleId === "admin" || roleId === "superadmin" || roleId === "bendahara";

    const applyChange = () => {
      setActiveRole(roleId);
      if (setCurrentUser) {
        setCurrentUser(matchingUser);
      }
      try {
        localStorage.setItem("siraj_active_role", roleId);
        localStorage.setItem("siraj_auth_user", JSON.stringify(matchingUser));
      } catch {}

      if (willBeLaptopAllowed) {
        setDeviceMode("laptop");
      } else {
        setDeviceMode("hp");
      }
    };

    if (onTriggerLoader) {
      onTriggerLoader(`Beralih ke Portal: ${roleObj?.label || roleId}...`, applyChange);
    } else {
      applyChange();
    }
  };

  return (
    <header
      style={{
        background: "var(--theme-header-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--theme-header-border)",
        boxShadow: theme === "dark" ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "0 4px 20px rgba(6, 95, 70, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Top Bar: Brand, Tenant, User, & Controls */}
      <div
        style={{
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          borderBottom: "1px solid rgba(16, 185, 129, 0.15)",
        }}
      >
        {/* Left: Branding & Current Pesantren with Permanent Rotating Sacred Mandala */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Permanent Rotating Sacred Islamic Mandala Ring (Lebih Gede & Jelas) */}
          <div
            style={{
              position: "relative",
              width: "66px",
              height: "66px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            title="SIRAJ · Smart Islamic Routine & Attendance Journey (Animasi Putar Selalu Aktif)"
          >
            {/* Outer Continuous Rotating Rub el Hizb 8-Point Star Ring */}
            <div
              className="rotate-medium"
              style={{
                position: "absolute",
                inset: 0,
                width: "66px",
                height: "66px",
                pointerEvents: "none",
              }}
            >
              <svg viewBox="0 0 100 100" width="66" height="66" fill="none">
                <circle cx="50" cy="50" r="47" stroke={theme === "dark" ? "rgba(232, 182, 90, 0.65)" : "rgba(217, 119, 6, 0.55)"} strokeWidth="1.8" strokeDasharray="4 4" />
                <path
                  d="M50 3 L63 37 L97 50 L63 63 L50 97 L37 63 L3 50 L37 37 Z"
                  stroke={theme === "dark" ? "#FFE49A" : "#D97706"}
                  strokeWidth="2.5"
                  style={{ filter: theme === "dark" ? "drop-shadow(0 0 8px rgba(232, 182, 90, 0.75))" : "drop-shadow(0 0 6px rgba(217, 119, 6, 0.5))" }}
                />
              </svg>
            </div>

            {/* Inner Counter-Rotating Emerald Geometric Star */}
            <div
              className="rotate-reverse-medium"
              style={{
                position: "absolute",
                inset: "6px",
                width: "54px",
                height: "54px",
                pointerEvents: "none",
              }}
            >
              <svg viewBox="0 0 100 100" width="54" height="54" fill="none">
                <path
                  d="M50 5 L85 50 L50 95 L15 50 Z"
                  stroke="#10B981"
                  strokeWidth="2.4"
                  opacity="0.9"
                  style={{ filter: "drop-shadow(0 0 6px rgba(16, 185, 129, 0.65))" }}
                />
                <circle cx="50" cy="50" r="32" stroke="rgba(16, 185, 129, 0.65)" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
            </div>

            {/* Core SIRAJ Logo Tile */}
            <img
              src="/logo_tile_1024.png"
              alt="SIRAJ"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "9px",
                border: "1.5px solid #FFE49A",
                boxShadow: "0 0 14px rgba(232, 182, 90, 0.4)",
                zIndex: 2,
                position: "relative",
              }}
            />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "17px", fontWeight: 800, color: "var(--theme-header-text)", letterSpacing: "0.05em" }}>
                SIRAJ
              </span>
              <span
                style={{
                  fontSize: "9.5px",
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#34D399",
                  border: "1px solid #10B981",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span className="rotate-fast" style={{ display: "inline-block", width: "8px", height: "8px" }}>
                  <svg viewBox="0 0 24 24" width="8" height="8" fill="#34D399">
                    <circle cx="12" cy="12" r="8" fill="none" stroke="#34D399" strokeWidth="3" strokeDasharray="4 4" />
                  </svg>
                </span>
                v1.0 Production
              </span>
            </div>
            <div style={{ fontSize: "10.5px", color: theme === "dark" ? "#FFE49A" : "#047857", fontWeight: 600 }}>
              {currentTenant?.name || "Pondok Pesantren Darussalam Rajapolah Tasikmalaya"}
            </div>
          </div>
        </div>

        {/* Right Controls: User Profile & Toggles */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* User Profile Pill */}
          {currentUser && (
            <div
              style={{
                background: theme === "dark" ? "rgba(13, 67, 50, 0.65)" : "rgba(6, 95, 70, 0.08)",
                border: theme === "dark" ? "1px solid rgba(232, 182, 90, 0.3)" : "1px solid #D1FAE5",
                borderRadius: "12px",
                padding: "4px 10px 4px 6px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <img
                src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80"}
                alt={currentUser.name}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  border: "1px solid #FFE49A",
                  objectFit: "cover",
                }}
              />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--theme-header-text)" }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: "9.5px", color: "var(--theme-header-sub)" }}>
                  {currentUser.roleLabel || currentUser.role}
                </div>
              </div>

              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={() => {
                    playSoftClick();
                    onLogout();
                  }}
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.5)",
                    color: "#FCA5A5",
                    borderRadius: "8px",
                    padding: "4px 8px",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                    marginLeft: "4px",
                  }}
                  title="Logout / Keluar dari Akun"
                >
                  Keluar
                </button>
              )}
            </div>
          )}

          {/* Layout Mode Segmented Control: HP, Tablet, Laptop */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: theme === "dark" ? "rgba(0, 0, 0, 0.45)" : "rgba(6, 95, 70, 0.08)",
              borderRadius: "12px",
              padding: "3px",
              border: theme === "dark" ? "1px solid rgba(232, 182, 90, 0.3)" : "1px solid #D1FAE5",
              gap: "3px",
            }}
          >
            {/* 1. HP Mode (Always Available) */}
            <button
              onClick={() => {
                playSoftClick();
                setDeviceMode("hp");
              }}
              style={{
                background: deviceMode === "hp" ? "var(--gradient-emerald)" : "transparent",
                color: deviceMode === "hp" ? "#FFFFFF" : (theme === "dark" ? "#A7F3D0" : "#065F46"),
                border: deviceMode === "hp" ? "1px solid #FFE49A" : "1px solid transparent",
                borderRadius: "9px",
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.15s ease",
              }}
              title="Layar HP (Smartphone 425px)"
            >
              <span>HP</span>
            </button>

            {/* 2. Tablet Mode (Always Available) */}
            <button
              onClick={() => {
                playSoftClick();
                setDeviceMode("tablet");
              }}
              style={{
                background: deviceMode === "tablet" ? "var(--gradient-emerald)" : "transparent",
                color: deviceMode === "tablet" ? "#FFFFFF" : (theme === "dark" ? "#A7F3D0" : "#065F46"),
                border: deviceMode === "tablet" ? "1px solid #FFE49A" : "1px solid transparent",
                borderRadius: "9px",
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.15s ease",
              }}
              title="Layar Tablet (768px)"
            >
              <span>Tablet</span>
            </button>

            {/* 3. Laptop Mode (Only for Super Admin & Admin Ponpes) */}
            {isLaptopAllowed ? (
              <button
                onClick={() => {
                  playSoftClick();
                  setDeviceMode("laptop");
                }}
                style={{
                  background: deviceMode === "laptop" ? "var(--gradient-emerald)" : "transparent",
                  color: deviceMode === "laptop" ? "#FFFFFF" : (theme === "dark" ? "#FFE49A" : "#065F46"),
                  border: deviceMode === "laptop" ? "1px solid #FFE49A" : "1px solid transparent",
                  borderRadius: "9px",
                  padding: "5px 10px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.15s ease",
                }}
                title="Layar Laptop / PC Desktop (Khusus Super Admin & Admin Ponpes)"
              >
                <span>Laptop</span>
              </button>
            ) : (
              <div
                title="Layar Laptop hanya untuk Super Admin & Admin Ponpes. Akun ini berlayar HP / Tablet."
                style={{
                  opacity: 0.45,
                  cursor: "not-allowed",
                  padding: "5px 8px",
                  fontSize: "10.5px",
                  color: theme === "dark" ? "#8AA49B" : "#94A3B8",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  userSelect: "none",
                }}
              >
                <span>Laptop</span>
              </div>
            )}
          </div>

          {/* Theme Switcher Toggle (Gelap / Terang) */}
          <button
            onClick={() => {
              playSoftClick();
              if (onToggleTheme) onToggleTheme();
            }}
            style={{
              background: theme === "dark" ? "rgba(16, 185, 129, 0.2)" : "#FFFFFF",
              border: theme === "dark" ? "1px solid #10B981" : "1.5px solid #059669",
              color: theme === "dark" ? "#FFE49A" : "#065F46",
              borderRadius: "10px",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              boxShadow: theme === "dark" ? "0 0 12px rgba(16, 185, 129, 0.25)" : "0 2px 8px rgba(6, 95, 70, 0.12)",
              transition: "all 0.2s ease",
            }}
            title="Ganti Tema: Gelap (Base Hijau Gelap) / Terang (Base Putih Gradien Ijo Muda)"
          >
            <span>{theme === "dark" ? "🌙" : "☀️"}</span>
            <span>{theme === "dark" ? "Tema Gelap" : "Tema Terang"}</span>
          </button>

          {/* 2-Second Loading Toggle with Rotating Star Indicator */}
          <button
            onClick={() => {
              playSoftClick();
              setIs2sLoaderEnabled(!is2sLoaderEnabled);
            }}
            style={{
              background: is2sLoaderEnabled
                ? (theme === "dark" ? "linear-gradient(135deg, #0D4332 0%, #06271E 100%)" : "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)")
                : (theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "#F1F5F9"),
              border: is2sLoaderEnabled
                ? "1.5px solid #E8B65A"
                : (theme === "dark" ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid #CBD5E1"),
              color: is2sLoaderEnabled
                ? (theme === "dark" ? "#FFE49A" : "#065F46")
                : (theme === "dark" ? "#8AA49B" : "#64748B"),
              borderRadius: "10px",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              boxShadow: is2sLoaderEnabled ? "0 0 12px rgba(232, 182, 90, 0.3)" : "none",
              transition: "all 0.2s ease",
            }}
            title="Animasi Putar Rub el Hizb 2 Detik saat Transisi & Aksi Dashboard"
          >
            {/* Spinning Islamic 8-Point Star Icon (Lebih Gede & Jelas) */}
            <span
              className={is2sLoaderEnabled ? "rotate-fast" : ""}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "22px",
                height: "22px",
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 100 100" width="22" height="22" fill="none">
                <circle cx="50" cy="50" r="46" stroke={is2sLoaderEnabled ? (theme === "dark" ? "rgba(232, 182, 90, 0.6)" : "rgba(217, 119, 6, 0.5)") : "#94A3B8"} strokeWidth="5" strokeDasharray="8 8" />
                <path
                  d="M50 4 L63 37 L96 50 L63 63 L50 96 L37 63 L4 50 L37 37 Z"
                  stroke={is2sLoaderEnabled ? (theme === "dark" ? "#FFE49A" : "#D97706") : "#94A3B8"}
                  strokeWidth="6"
                  fill={is2sLoaderEnabled ? (theme === "dark" ? "rgba(232, 182, 90, 0.35)" : "rgba(217, 119, 6, 0.25)") : "none"}
                  style={{ filter: is2sLoaderEnabled ? "drop-shadow(0 0 4px rgba(232, 182, 90, 0.8))" : "none" }}
                />
              </svg>
            </span>
            <span style={{ fontSize: "11.5px" }}>Animasi Putar: {is2sLoaderEnabled ? "AKTIF (2s)" : "CEPAT"}</span>
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              playSoftClick();
            }}
            style={{
              background: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "#F1F5F9",
              border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #CBD5E1",
              color: theme === "dark" ? "#A7F3D0" : "#065F46",
              borderRadius: "10px",
              padding: "7px 10px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
            }}
            title="Efek Suara & Haptik"
          >
            {isMuted ? "Senyap" : "Suara"}
          </button>

          {/* Replay Splash */}
          <button
            onClick={() => {
              playSoftClick();
              onReplaySplash();
            }}
            style={{
              background: theme === "dark" ? "rgba(232, 182, 90, 0.12)" : "#FEF3C7",
              border: theme === "dark" ? "1px solid rgba(232, 182, 90, 0.35)" : "1px solid #FDE68A",
              color: theme === "dark" ? "#FFE49A" : "#92400E",
              borderRadius: "10px",
              padding: "7px 12px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Splash
          </button>
        </div>
      </div>

      {/* Sub-Bar: Direct Access Persona/Role Navigation (8 Roles) */}
      <div
        className="no-scrollbar"
        style={{
          padding: "8px 24px",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          whiteSpace: "nowrap",
          background: "var(--theme-subbar-bg)",
          borderTop: "1px solid var(--theme-subbar-border)",
          alignItems: "center",
          transition: "background 0.3s ease",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            color: theme === "dark" ? "#FFE49A" : "#065F46",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            paddingRight: "8px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          Akses Peran:
        </span>

        {ROLES_LIST.map((role) => {
          const isActive = activeRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => handleRoleChange(role.id)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: isActive ? 800 : 600,
                background: isActive
                  ? "var(--gradient-emerald)"
                  : "var(--theme-role-btn-bg)",
                border: isActive
                  ? "1px solid #FFE49A"
                  : "1px solid var(--theme-role-btn-border)",
                color: isActive ? "#FFFFFF" : "var(--theme-role-btn-color)",
                boxShadow: isActive ? "0 4px 14px rgba(16, 185, 129, 0.45)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
            >
              <span>{role.label}</span>
              {isActive && (
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#FFE49A",
                    boxShadow: "0 0 6px #FFE49A",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
