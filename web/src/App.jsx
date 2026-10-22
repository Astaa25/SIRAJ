import React, { useState, useEffect, useRef } from "react";
import ShowcaseHeader from "./components/ShowcaseHeader";
import SplashScreen from "./components/SplashScreen";
import IslamicLoadingModal from "./components/IslamicLoadingModal";
import LoginView from "./components/LoginView";

// 9 Dedicated Role Portals (Including Super Admin Multi-Tenancy)
import SuperAdminView from "./components/portals/SuperAdminView";
import PortalWaliView from "./components/portals/PortalWaliView";
import PortalGuruView from "./components/portals/PortalGuruView";
import PortalUbudiyyahView from "./components/portals/PortalUbudiyyahView";
import PortalMusyrifView from "./components/portals/PortalMusyrifView";
import PortalSatpamView from "./components/portals/PortalSatpamView";
import PortalBKView from "./components/portals/PortalBKView";
import PortalPengasuhanView from "./components/portals/PortalPengasuhanView";
import PortalBendaharaView from "./components/portals/PortalBendaharaView";
import AdminWebView from "./components/AdminWebView";

import { INITIAL_AUDIT_LOGS, INITIAL_TENANTS, SYSTEM_USERS } from "./data/mockData";
import { setAudioMuted, playSoftClick } from "./utils/audio";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Authentication State: Default to Admin Ponpes so Admin Ponpes is NEVER missing on load/refresh!
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("siraj_auth_user");
      if (saved) return JSON.parse(saved);
      return SYSTEM_USERS.find((u) => u.role === "admin") || null;
    } catch (e) {
      return SYSTEM_USERS.find((u) => u.role === "admin") || null;
    }
  });

  // Multi-Tenancy State (Pondok Pesantren Aktif)
  const [currentTenant, setCurrentTenant] = useState(() => {
    try {
      const saved = localStorage.getItem("siraj_active_tenant");
      return saved ? JSON.parse(saved) : INITIAL_TENANTS[0];
    } catch (e) {
      return INITIAL_TENANTS[0];
    }
  });

  // Active Role State: Default to 'admin' (Admin Ponpes)
  const [activeRole, setActiveRole] = useState(() => {
    try {
      const savedRole = localStorage.getItem("siraj_active_role");
      if (savedRole) return savedRole;
      const savedUser = localStorage.getItem("siraj_auth_user");
      return savedUser ? JSON.parse(savedUser).role : "admin";
    } catch (e) {
      return "admin";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("siraj_active_role", activeRole);
    } catch (e) {}
  }, [activeRole]);

  // Device Mode: 'hp' | 'tablet' | 'laptop'
  // Rule: Non-admin roles (wali, guru, ubudiyyah, musyrif, satpam, bk, pengasuhan) strictly restricted to HP & Tablet.
  // Super Admin & Admin Ponpes can access HP, Tablet, and Laptop.
  const isLaptopRole = activeRole === "admin" || activeRole === "superadmin" || activeRole === "bendahara";

  const [deviceMode, setDeviceMode] = useState(() => {
    return (activeRole === "admin" || activeRole === "superadmin" || activeRole === "bendahara") ? "laptop" : "hp";
  });

  // Guard: If switching to a non-admin role, never allow 'laptop'
  useEffect(() => {
    if (!isLaptopRole && deviceMode === "laptop") {
      setDeviceMode("hp");
    }
  }, [activeRole, isLaptopRole, deviceMode]);

  // Forensic Append-Only Security Audit Logs
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("siraj_audit_logs");
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch (e) {
      return INITIAL_AUDIT_LOGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("siraj_audit_logs", JSON.stringify(auditLogs));
    } catch (e) {}
  }, [auditLogs]);

  const [is2sLoaderEnabled, setIs2sLoaderEnabled] = useState(true);
  const [isLoaderOpen, setIsLoaderOpen] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("");
  const loaderCallbackRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  // Theme State: 'dark' (Base Hijau Gelap) | 'light' (Base Putih Gradien Ijo Muda)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("siraj_theme") || "dark";
    } catch (e) {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("siraj_theme", theme);
    } catch (e) {}
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    setAudioMuted(isMuted);
  }, [isMuted]);

  // Master Action Trigger (2-Second Islamic Loading Animation) with ref safety
  const handleTriggerLoader = (message, callback) => {
    loaderCallbackRef.current = callback;
    if (is2sLoaderEnabled) {
      setLoaderMessage(message || "Memproses Permintaan...");
      setIsLoaderOpen(true);
    } else {
      if (callback) callback();
    }
  };

  const handleLoaderComplete = () => {
    setIsLoaderOpen(false);
    if (loaderCallbackRef.current) {
      const cb = loaderCallbackRef.current;
      loaderCallbackRef.current = null;
      cb();
    }
  };

  // Login handler
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    try {
      localStorage.setItem("siraj_auth_user", JSON.stringify(user));
      localStorage.setItem("siraj_active_role", user.role);
    } catch (e) {}
    if (user.role === "admin" || user.role === "superadmin" || user.role === "bendahara") {
      setDeviceMode("laptop");
    } else {
      setDeviceMode("hp");
    }
    if (user.assignedTenantId) {
      const tenant = INITIAL_TENANTS.find((t) => t.id === user.assignedTenantId);
      if (tenant) {
        setCurrentTenant(tenant);
        localStorage.setItem("siraj_active_tenant", JSON.stringify(tenant));
      }
    }
  };

  // Logout handler
  const handleLogout = () => {
    playSoftClick();
    handleTriggerLoader("Mengakhiri Sesi & Keluar dari Akun...", () => {
      localStorage.removeItem("siraj_auth_user");
      setCurrentUser(null);
      setActiveRole("wali");
    });
  };

  // Append-Only Security Audit Log
  const handleAuditLogAdd = (newLogEntry) => {
    const now = new Date();
    const timeString =
      now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) + " WIB";

    const entry = {
      id: `aud-${Date.now()}`,
      timestamp: timeString,
      ...newLogEntry,
    };

    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Render Portal Component based on Active Role
  const renderActivePortal = () => {
    switch (activeRole) {
      case "superadmin":
        return (
          <SuperAdminView
            onTriggerLoader={handleTriggerLoader}
            onAuditLogAdd={handleAuditLogAdd}
            currentTenant={currentTenant}
            onSwitchTenant={(tenant) => {
              setCurrentTenant(tenant);
              localStorage.setItem("siraj_active_tenant", JSON.stringify(tenant));
            }}
          />
        );
      case "wali":
        return (
          <PortalWaliView
            onTriggerLoader={handleTriggerLoader}
            onAuditLogAdd={handleAuditLogAdd}
            tenantDormTerm={currentTenant?.dormTerm || "Asrama"}
            currentTenant={currentTenant}
          />
        );
      case "guru":
        return (
          <PortalGuruView
            currentUser={currentUser}
            currentTeacher={currentUser}
            onTriggerLoader={handleTriggerLoader}
            onAuditLogAdd={handleAuditLogAdd}
          />
        );
      case "ubudiyyah":
        return (
          <PortalUbudiyyahView
            currentTenant={currentTenant}
            onTriggerLoader={handleTriggerLoader}
            onAuditLogAdd={handleAuditLogAdd}
          />
        );
      case "musyrif":
        return (
          <PortalMusyrifView
            currentMusyrif={currentUser}
            currentUser={currentUser}
            tenantDormTerm={currentTenant?.dormTerm || "Asrama"}
            currentTenant={currentTenant}
            onTriggerLoader={handleTriggerLoader}
            onAuditLogAdd={handleAuditLogAdd}
          />
        );
      case "satpam":
        return (
          <PortalSatpamView
            currentTenant={currentTenant}
            onTriggerLoader={handleTriggerLoader}
            onAuditLogAdd={handleAuditLogAdd}
          />
        );
      case "bk":
        return (
          <PortalBKView
            currentTenant={currentTenant}
            onTriggerLoader={handleTriggerLoader}
            onAuditLogAdd={handleAuditLogAdd}
          />
        );
      case "pengasuhan":
        return (
          <PortalPengasuhanView
            onTriggerLoader={handleTriggerLoader}
            onAuditLogAdd={handleAuditLogAdd}
          />
        );
      case "bendahara":
        return (
          <PortalBendaharaView
            currentUser={currentUser}
            currentTenant={currentTenant}
            theme={theme}
            onTriggerLoader={handleTriggerLoader}
            onAuditLogAdd={handleAuditLogAdd}
            onUpdateTenant={(updated) => {
              setCurrentTenant((prev) => {
                const next = { ...prev, ...updated };
                localStorage.setItem("siraj_active_tenant", JSON.stringify(next));
                return next;
              });
            }}
          />
        );
      case "admin":
        return (
          <AdminWebView
            onTriggerLoader={handleTriggerLoader}
            auditLogs={auditLogs}
            onAuditLogAdd={handleAuditLogAdd}
            currentTenant={currentTenant}
            onUpdateTenant={(updated) => {
              setCurrentTenant((prev) => {
                const next = { ...prev, ...updated };
                localStorage.setItem("siraj_active_tenant", JSON.stringify(next));
                return next;
              });
            }}
          />
        );
      default:
        return (
          <PortalWaliView
            onTriggerLoader={handleTriggerLoader}
            onAuditLogAdd={handleAuditLogAdd}
          />
        );
    }
  };

  return (
    <div
      data-theme={theme}
      className="islamic-pattern-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--theme-base-bg)",
        backgroundColor: "var(--theme-body-bg)",
        color: "var(--theme-text-title)",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Cinematic Splash Screen (Bisa diputar ulang) */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* 2-Second Islamic Loading Overlay */}
      <IslamicLoadingModal
        isOpen={isLoaderOpen}
        message={loaderMessage}
        onComplete={handleLoaderComplete}
      />

      {/* Jika Belum Login: Tampilkan LoginView Terpadu (Tanpa Sign Up) */}
      {!currentUser ? (
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 16px",
          }}
        >
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            currentTenant={currentTenant}
            onSwitchTenant={(tenant) => {
              setCurrentTenant(tenant);
              localStorage.setItem("siraj_active_tenant", JSON.stringify(tenant));
            }}
          />
        </main>
      ) : (
        <>
          {/* Top Header & 9-Role Direct Navigation Bar */}
          <ShowcaseHeader
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            onLogout={handleLogout}
            currentTenant={currentTenant}
            activeRole={activeRole}
            setActiveRole={setActiveRole}
            deviceMode={deviceMode}
            setDeviceMode={setDeviceMode}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            is2sLoaderEnabled={is2sLoaderEnabled}
            setIs2sLoaderEnabled={setIs2sLoaderEnabled}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            onReplaySplash={() => setShowSplash(true)}
            onTriggerLoader={handleTriggerLoader}
          />

          {/* Main Responsive Workspace Stage */}
          <main
            style={{
              flex: 1,
              padding: "20px 16px 48px 16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            {/* 1. HP SMARTPHONE MODE (425px) */}
            {deviceMode === "hp" && (
              <div
                className="fade-in-up"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                  gap: "10px",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--theme-mode-label)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Mode Layar HP (Smartphone · 425px):</span>
                  <span style={{ fontWeight: 800, color: "#FFE49A" }}>
                    {activeRole.toUpperCase()}
                  </span>
                </div>

                <div className="device-hp-frame">
                  {/* Dynamic Island */}
                  <div className="phone-island">
                    <div className="island-camera" />
                    <div style={{ fontSize: "9px", color: "#34D399", fontWeight: 800, letterSpacing: "1px" }}>
                      SIRAJ
                    </div>
                    <div className="island-sensor" />
                  </div>

                  {/* Inner Screen */}
                  <div className="device-hp-inner no-scrollbar">
                    {renderActivePortal()}
                  </div>
                </div>
              </div>
            )}

            {/* 2. TABLET MODE (768px) */}
            {deviceMode === "tablet" && (
              <div
                className="fade-in-up"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                  gap: "10px",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--theme-mode-label)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Mode Layar Tablet (768px Responsive):</span>
                  <span style={{ fontWeight: 800, color: "#FFE49A" }}>
                    {activeRole.toUpperCase()}
                  </span>
                </div>

                <div className="device-tablet-frame">
                  {/* Tablet Bezel Camera Dot */}
                  <div className="device-tablet-header">
                    <div className="tablet-camera-dot" />
                  </div>

                  {/* Inner Screen */}
                  <div className="device-tablet-inner no-scrollbar">
                    {renderActivePortal()}
                  </div>
                </div>
              </div>
            )}

            {/* 3. LAPTOP / DESKTOP MODE (Full Width up to 1420px - Only for Super Admin & Admin Ponpes) */}
            {deviceMode === "laptop" && isLaptopRole && (
              <div
                className="fade-in-up"
                style={{
                  width: "100%",
                  maxWidth: "1420px",
                  margin: "0 auto",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--theme-mode-label)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                  <span>Mode Layar Laptop / Komputer Desktop (1420px):</span>
                  <span style={{ fontWeight: 800, color: "#FFE49A" }}>
                    {activeRole === "superadmin" ? "SUPER ADMIN PUSAT" : activeRole === "bendahara" ? "BENDAHARA PONPES" : "ADMIN PONPES"}
                  </span>
                </div>

                <div className="device-laptop-frame">
                  {renderActivePortal()}
                </div>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}
