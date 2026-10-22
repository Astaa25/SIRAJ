import React, { useEffect, useState } from "react";
import { playSuccessChime } from "../utils/audio";

/**
 * SIRAJ Cinematic Splash Screen
 * Adjusted per user request:
 * - Faster initial brand entrance
 * - Generous reading time for full title ("Smart Islamic Routine & Attendance Journey")
 *   and Pesantren name ("Pondok Pesantren Darussalam Rajapolah Tasikmalaya")
 * - Includes a clean "Lewati ➔" skip button
 */
export default function SplashScreen({ onFinish, pesantrenName = "Ekosistem Digital & Presensi Terpadu Pondok Pesantren" }) {
  const [stage, setStage] = useState(0); // 0: radial, 1: logo, 2: letters, 3: tagline, 4: transition out
  const [lettersVisible, setLettersVisible] = useState(0);
  const brandLetters = ["S", "I", "R", "A", "J"];

  useEffect(() => {
    // 0.2s: Radial glow & logo
    const t1 = setTimeout(() => setStage(1), 200);

    // 0.7s: Quick letters reveal
    const t2 = setTimeout(() => {
      setStage(2);
      brandLetters.forEach((_, idx) => {
        setTimeout(() => {
          setLettersVisible((prev) => Math.max(prev, idx + 1));
        }, idx * 80);
      });
    }, 700);

    // 1.2s: Tagline & Pesantren Name appears early
    const t3 = setTimeout(() => {
      setStage(3);
    }, 1200);

    // 4.8s: Chime & exit transition (gives 3.6s generous reading time!)
    const t4 = setTimeout(() => {
      setStage(4);
      playSuccessChime();
    }, 4800);

    // 5.4s: Complete
    const t5 = setTimeout(() => {
      if (onFinish) onFinish();
    }, 5400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onFinish]);

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
        {/* Logo Tile with Gold Border */}
        <div
          style={{
            transform: stage >= 1 ? "scale(1)" : "scale(0.85)",
            opacity: stage >= 1 ? 1 : 0,
            transition: "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          <img
            src="/logo_tile_1024.png"
            alt="SIRAJ"
            style={{
              width: "110px",
              height: "110px",
              borderRadius: "26px",
              objectFit: "cover",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 25px rgba(232, 182, 90, 0.35)",
              border: "1.5px solid rgba(255, 228, 154, 0.4)",
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
