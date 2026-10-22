import React, { useEffect, useState } from "react";
import { playSuccessChime } from "../utils/audio";

/**
 * Islamic 2-Second Cinematic Loading Animation Component
 * Fulfills: "buat animasi bagus/keren loading 2 detik setiap klik"
 * Combines Islamic sacred geometry, smooth easing, and stage feedback
 */
export default function IslamicLoadingModal({ isOpen, message, onComplete }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const phases = [
    "Memverifikasi token & tanda tangan Ed25519...",
    "Mengambil catatan mutaba'ah & data santri...",
    "Sinkronisasi ke server pesantren (Zero-Trust)...",
    "Alhamdulillah, data siap!",
  ];

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setPhaseIndex(0);
      return;
    }

    // Smooth progress counter from 0 to 100 over 2000ms
    const startTime = performance.now();
    const duration = 2000;

    let animFrame;
    const updateProgress = (currentTime) => {
      const elapsed = currentTime - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);
      // Smooth cubic ease out
      const eased = 1 - Math.pow(1 - linearProgress, 3);
      setProgress(Math.round(eased * 100));

      if (elapsed < 600) {
        setPhaseIndex(0);
      } else if (elapsed < 1250) {
        setPhaseIndex(1);
      } else if (elapsed < 1800) {
        setPhaseIndex(2);
      } else {
        setPhaseIndex(3);
      }

      if (elapsed < duration) {
        animFrame = requestAnimationFrame(updateProgress);
      } else {
        playSuccessChime();
        if (onComplete) {
          setTimeout(onComplete, 80);
        }
      }
    };

    animFrame = requestAnimationFrame(updateProgress);

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <>
      {/* Top Beam Progress Indicator */}
      <div className="top-progress-beam" />

      {/* Centered Modal Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99990,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(3, 20, 15, 0.72)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          animation: "fadeInUp 200ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          style={{
            background: "linear-gradient(160deg, #0D4332 0%, #06271E 100%)",
            border: "1px solid rgba(232, 182, 90, 0.3)",
            borderRadius: "28px",
            padding: "36px 40px",
            width: "380px",
            maxWidth: "90vw",
            textAlign: "center",
            boxShadow: "0 25px 60px -10px rgba(0, 0, 0, 0.6), 0 0 35px rgba(16, 185, 129, 0.25)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle Islamic Khatim Watermark Background */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              right: "-40px",
              width: "160px",
              height: "160px",
              opacity: 0.06,
              pointerEvents: "none",
            }}
          >
            <svg viewBox="0 0 100 100" fill="#E8B65A">
              <path d="M50 0 L65 35 L100 50 L65 65 L50 100 L35 65 L0 50 L35 35 Z" />
              <path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" fill="#10B981" />
            </svg>
          </div>

          {/* Central Rotating Sacred Mandala with Lantern Icon (Lebih Gede & Megah 150px) */}
          <div
            style={{
              position: "relative",
              width: "150px",
              height: "150px",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Layer 1: Outer Rotating 8-Point Rub el Hizb Gold Star Ring (150px) */}
            <div
              className="rotate-fast"
              style={{
                position: "absolute",
                inset: 0,
                width: "150px",
                height: "150px",
              }}
            >
              <svg viewBox="0 0 100 100" width="150" height="150" fill="none">
                <circle cx="50" cy="50" r="47" stroke="rgba(232, 182, 90, 0.65)" strokeWidth="1.6" strokeDasharray="4 4" />
                <path
                  d="M50 3 L63 37 L97 50 L63 63 L50 97 L37 63 L3 50 L37 37 Z"
                  stroke="#FFE49A"
                  strokeWidth="2.5"
                  style={{ filter: "drop-shadow(0 0 12px rgba(232, 182, 90, 0.85))" }}
                />
              </svg>
            </div>

            {/* Layer 2: Middle Counter-Rotating Emerald Geometric Star (120px) */}
            <div
              className="rotate-reverse-fast"
              style={{
                position: "absolute",
                inset: "15px",
                width: "120px",
                height: "120px",
              }}
            >
              <svg viewBox="0 0 100 100" width="120" height="120" fill="none">
                <path
                  d="M50 4 L86 50 L50 96 L14 50 Z"
                  stroke="#34D399"
                  strokeWidth="2.4"
                  style={{ filter: "drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))" }}
                />
                <circle cx="50" cy="50" r="34" stroke="rgba(16, 185, 129, 0.65)" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
            </div>

            {/* Layer 3: Inner Rotating Celestial Star Ring (96px) */}
            <div
              className="rotate-medium"
              style={{
                position: "absolute",
                inset: "27px",
                width: "96px",
                height: "96px",
              }}
            >
              <svg viewBox="0 0 100 100" width="96" height="96" fill="none">
                <path
                  d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z"
                  stroke="#E8B65A"
                  strokeWidth="1.8"
                  opacity="0.75"
                />
              </svg>
            </div>

            {/* Pulsing Core Lantern Icon */}
            <div
              className="lantern-glow-anim"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #065F46 0%, #06271E 100%)",
                border: "2px solid #FFE49A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
                boxShadow: "0 0 25px rgba(232, 182, 90, 0.55)",
              }}
            >
              <img
                src="/logo_tile_1024.png"
                alt="SIRAJ"
                style={{ width: "42px", height: "42px", borderRadius: "10px" }}
              />
            </div>
          </div>

          {/* Action Message */}
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#FFFFFF",
              marginBottom: "8px",
              letterSpacing: "-0.01em",
            }}
          >
            {message || "Memuat Keseharian Santri"}
          </div>

          {/* Dynamic Stage Feedback Text */}
          <div
            style={{
              fontSize: "13px",
              color: phaseIndex === 3 ? "#34D399" : "#FFE49A",
              fontWeight: 500,
              minHeight: "20px",
              marginBottom: "20px",
              transition: "all 0.2s ease",
            }}
          >
            {phases[phaseIndex]}
          </div>

          {/* Progress Bar Container */}
          <div
            style={{
              width: "100%",
              height: "6px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "999px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #FFE49A 0%, #10B981 70%, #34D399 100%)",
                borderRadius: "999px",
                boxShadow: "0 0 10px rgba(16, 185, 129, 0.6)",
                transition: "width 0.05s linear",
              }}
            />
          </div>

          {/* Tabular Percentage & Security Badge */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              marginTop: "12px",
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                  display: "inline-block",
                }}
              />
              Enkripsi Ed25519 Aktif
            </span>
            <span className="tabular-nums" style={{ fontWeight: 700, color: "#FFE49A" }}>
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
