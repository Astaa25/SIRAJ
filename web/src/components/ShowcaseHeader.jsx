import React from "react";
import { playSoftClick } from "../utils/audio";
import { ROLES_LIST } from "../data/mockData";

export default function ShowcaseHeader({
  currentUser,
  onLogout,
  currentTenant,
  activeRole,
  setActiveRole,
  deviceMode,
  setDeviceMode,
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
    const willBeLaptopAllowed = roleId === "admin" || roleId === "superadmin" || roleId === "bendahara";

    const applyChange = () => {
      setActiveRole(roleId);
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
        background: "linear-gradient(180deg, #06271E 0%, #03140F 100%)",
        borderBottom: "1px solid rgba(232, 182, 90, 0.25)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
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
        {/* Left: Branding & Current Pesantren */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/logo_tile_1024.png"
            alt="SIRAJ"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              border: "1.5px solid #FFE49A",
              boxShadow: "0 0 14px rgba(232, 182, 90, 0.35)",
            }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "17px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.05em" }}>
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
                }}
              >
                v1.0 Production
              </span>
            </div>
            <div style={{ fontSize: "10.5px", color: "#FFE49A", fontWeight: 500 }}>
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
                background: "rgba(13, 67, 50, 0.65)",
                border: "1px solid rgba(232, 182, 90, 0.3)",
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
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#FFFFFF" }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: "9.5px", color: "#A7F3D0" }}>
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
              background: "rgba(0, 0, 0, 0.45)",
              borderRadius: "12px",
              padding: "3px",
              border: "1px solid rgba(232, 182, 90, 0.3)",
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
                color: deviceMode === "hp" ? "#FFFFFF" : "#A7F3D0",
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
                color: deviceMode === "tablet" ? "#FFFFFF" : "#A7F3D0",
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
                  color: deviceMode === "laptop" ? "#FFFFFF" : "#FFE49A",
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
                  color: "#8AA49B",
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

          {/* 2-Second Loading Toggle */}
          <button
            onClick={() => {
              playSoftClick();
              setIs2sLoaderEnabled(!is2sLoaderEnabled);
            }}
            style={{
              background: is2sLoaderEnabled ? "#0D4332" : "rgba(255, 255, 255, 0.08)",
              border: is2sLoaderEnabled ? "1px solid #FFE49A" : "1px solid rgba(255, 255, 255, 0.2)",
              color: is2sLoaderEnabled ? "#FFE49A" : "#8AA49B",
              borderRadius: "10px",
              padding: "6px 10px",
              fontSize: "11px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "5px",
              cursor: "pointer",
            }}
            title="Animasi loading Rub el Hizb 2 detik"
          >
            <span>2s Loader: {is2sLoaderEnabled ? "AKTIF" : "CEPAT"}</span>
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              playSoftClick();
            }}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#A7F3D0",
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
              background: "rgba(232, 182, 90, 0.12)",
              border: "1px solid rgba(232, 182, 90, 0.35)",
              color: "#FFE49A",
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
          background: "rgba(0, 0, 0, 0.35)",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            color: "#FFE49A",
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
                  : "rgba(255, 255, 255, 0.06)",
                border: isActive
                  ? "1px solid #FFE49A"
                  : "1px solid rgba(16, 185, 129, 0.2)",
                color: isActive ? "#FFFFFF" : "#C4D8D0",
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
