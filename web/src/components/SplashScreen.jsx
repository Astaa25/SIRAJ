import React, { useEffect, useState, useRef } from "react";
import { playSuccessChime } from "../utils/audio";

/**
 * SIRAJ Cinematic Splash Screen
 * Fast, reliable, and gracefully dismissible.
 */
export default function SplashScreen({ onFinish, pesantrenName = "Ekosistem Digital & Presensi Terpadu Pondok Pesantren" }) {
  const [stage, setStage] = useState(1); // Start immediately at 1 so content is ALWAYS visible (never blank!)
  const [lettersVisible, setLettersVisible] = useState(5);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  useEffect(() => {
    // 0.5s: Tagline & Pesantren Name appears
    const t1 = setTimeout(() => {
      setStage(3);
    }, 500);

    // 2.2s: Chime & exit transition
    const t2 = setTimeout(() => {
      setStage(4);
      playSuccessChime();
    }, 2200);

    // 2.7s: Complete
    const t3 = setTimeout(() => {
      if (onFinishRef.current) onFinishRef.current();
    }, 2700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "radial-gradient(circle at center, #0D4332 0%, #06271E 60%, #020C09 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        opacity: stage === 4 ? 0 : 1,
        transition: "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Background Islamic Geometric Star Pattern */}
      <div
        className="islamic-pattern-bg"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          pointerEvents: "none",
        }}
      />

      {/* Luminous Glow Ambient Circle */}
      <div
        style={{
          position: "absolute",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232, 182, 90, 0.18) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 75%)",
          filter: "blur(40px)",
          transform: stage >= 1 ? "scale(1)" : "scale(0.7)",
          transition: "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
          pointerEvents: "none",
        }}
      />

      {/* Center Branding Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "24px",
          maxWidth: "480px",
        }}
      >
        {/* Logo Tile Framed by Rotating Sacred Islamic Mandala (Lebih Gede & Megah 210px) */}
        <div
          style={{
            position: "relative",
            width: "210px",
            height: "210px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: stage >= 1 ? "scale(1)" : "scale(0.85)",
            opacity: stage >= 1 ? 1 : 0,
            transition: "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          {/* Layer 1: Outer Rotating 8-Point Rub el Hizb Gold Star (210px) */}
          <div
            className="rotate-slow"
            style={{
              position: "absolute",
              inset: 0,
              width: "210px",
              height: "210px",
              pointerEvents: "none",
            }}
          >
            <svg viewBox="0 0 100 100" width="210" height="210" fill="none">
              <circle cx="50" cy="50" r="47" stroke="rgba(232, 182, 90, 0.6)" strokeWidth="1.6" strokeDasharray="4 4" />
              <path
                d="M50 3 L63 37 L97 50 L63 63 L50 97 L37 63 L3 50 L37 37 Z"
                stroke="#FFE49A"
                strokeWidth="2.5"
                style={{ filter: "drop-shadow(0 0 14px rgba(232, 182, 90, 0.85))" }}
              />
            </svg>
          </div>

          {/* Layer 2: Middle Counter-Rotating Emerald Geometric Star (165px) */}
          <div
            className="rotate-reverse-medium"
            style={{
              position: "absolute",
              inset: "22px",
              width: "166px",
              height: "166px",
              pointerEvents: "none",
            }}
          >
            <svg viewBox="0 0 100 100" width="166" height="166" fill="none">
              <path
                d="M50 4 L86 50 L50 96 L14 50 Z"
                stroke="#34D399"
                strokeWidth="2.4"
                opacity="0.9"
                style={{ filter: "drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))" }}
              />
              <circle cx="50" cy="50" r="34" stroke="rgba(52, 211, 153, 0.6)" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* Layer 3: Inner Rotating Celestial Star Ring (130px) */}
          <div
            className="rotate-medium"
            style={{
              position: "absolute",
              inset: "40px",
              width: "130px",
              height: "130px",
              pointerEvents: "none",
            }}
          >
            <svg viewBox="0 0 100 100" width="130" height="130" fill="none">
              <path
                d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z"
                stroke="#E8B65A"
                strokeWidth="2"
                opacity="0.8"
              />
            </svg>
          </div>

          {/* Core Logo Tile with Gold Border */}
          <img
            src="/logo_tile_1024.png"
            alt="SIRAJ"
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "22px",
              objectFit: "cover",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(232, 182, 90, 0.5)",
              border: "2px solid #FFE49A",
              zIndex: 3,
              position: "relative",
            }}
          />
        </div>

        {/* Bismillah Header Inscription */}
        <div
          className="arabic-font"
          style={{
            color: "#E8B65A",
            fontSize: "17px",
            marginTop: "16px",
            letterSpacing: "0.05em",
            opacity: stage >= 1 ? 0.9 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>

        {/* Letters Reveal: S - I - R - A - J */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "12px",
            letterSpacing: "0.2em",
          }}
        >
          {brandLetters.map((char, i) => (
            <span
              key={i}
              style={{
                fontSize: "38px",
                fontWeight: 800,
                color: "#FFFFFF",
                opacity: i < lettersVisible ? 1 : 0,
                transform: i < lettersVisible ? "translateY(0)" : "translateY(12px)",
                transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                textShadow: "0 2px 12px rgba(16, 185, 129, 0.55)",
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Tagline / Kepanjangan SIRAJ (Tampil lebih lama dan jelas) */}
        <div
          style={{
            color: "#FFE49A",
            fontSize: "14px",
            fontWeight: 700,
            marginTop: "10px",
            letterSpacing: "0.03em",
            opacity: stage >= 3 ? 1 : 0,
            transform: stage >= 3 ? "translateY(0)" : "translateY(6px)",
            transition: "all 0.4s ease-out",
            textAlign: "center",
            lineHeight: "1.4",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          Smart Islamic Routine & Attendance Journey
        </div>

        {/* Pesantren Identity (Tampil jelas dan mudah dibaca) */}
        <div
          style={{
            color: "#A7F3D0",
            fontSize: "12px",
            fontWeight: 600,
            marginTop: "8px",
            opacity: stage >= 3 ? 0.95 : 0,
            transition: "opacity 0.4s ease-out",
            letterSpacing: "0.02em",
            textAlign: "center",
          }}
        >
          {pesantrenName}
        </div>

        {/* Bottom Loading Progress Indicator */}
        <div
          style={{
            marginTop: "30px",
            width: "160px",
            height: "3px",
            background: "rgba(255,255,255,0.12)",
            borderRadius: "999px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: stage >= 3 ? "100%" : stage >= 2 ? "60%" : "25%",
              background: "linear-gradient(90deg, #FFE49A 0%, #10B981 100%)",
              transition: "width 3.5s cubic-bezier(0.1, 0.8, 0.2, 1)",
              borderRadius: "999px",
              boxShadow: "0 0 10px rgba(16, 185, 129, 0.8)",
            }}
          />
        </div>
      </div>

      {/* Skip Button on Bottom Right */}
      <button
        onClick={() => {
          if (onFinish) onFinish();
        }}
        style={{
          position: "absolute",
          bottom: "24px",
          right: "24px",
          background: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#FFE49A",
          padding: "7px 14px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: 700,
          cursor: "pointer",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.2s ease",
        }}
      >
        <span>Lewati</span>
        <span>➔</span>
      </button>
    </div>
  );
}
