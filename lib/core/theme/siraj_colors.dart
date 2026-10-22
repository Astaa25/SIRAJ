import 'package:flutter/material.dart';

/// SIRAJ Design System — Token Warna
/// Sesuai dengan StyleGuide.md (Figma: SIRAJ Colors)
/// Aturan: Jangan menulis hex langsung di widget, gunakan SirajColors.
class SirajColors {
  SirajColors._();

  // Background & Surface
  static const Color white = Color(0xFFFFFFFF);
  static const Color mint = Color(0xFFF4FBF7);
  static const Color mintSubtle = Color(0xFFECFDF5);

  // Emerald Shades
  static const Color emerald800 = Color(0xFF065F46);
  static const Color emerald700 = Color(0xFF047857);
  static const Color emerald600 = Color(0xFF059669);
  static const Color emerald500 = Color(0xFF10B981);
  static const Color emerald400 = Color(0xFF34D399);
  static const Color emerald100 = Color(0xFFD1FAE5);
  static const Color emerald50 = Color(0xFFECFDF5);

  // Deep Forest (Latar Splash, Sidebar Admin, Mode Gelap)
  static const Color deepForest = Color(0xFF06271E);
  static const Color forest = Color(0xFF0D4332);
  static const Color forestSurface = Color(0xFF113B2E);

  // Radiant Gold
  static const Color goldLight = Color(0xFFFFE49A);
  static const Color gold = Color(0xFFE8B65A);
  static const Color goldDark = Color(0xFFC98A3C);

  // Status Backgrounds (Pastel)
  static const Color successBg = Color(0xFFD1FAE5); // Chip Hadir
  static const Color warningBg = Color(0xFFFFF1D6); // Chip Terlambat
  static const Color dangerBg = Color(0xFFFDE8E8); // Chip Alpa
  static const Color sakitBg = Color(0xFFE0F2FE); // Chip Sakit
  static const Color izinBg = Color(0xFFF3E8FF); // Chip Izin
  static const Color masbukBg = Color(0xFFFEF3C7); // Chip Masbuk

  // Status Texts (WCAG AA Compliant)
  static const Color hadirText = Color(0xFF065F46);
  static const Color terlambatText = Color(0xFF9A6212);
  static const Color sakitText = Color(0xFF0369A1);
  static const Color izinText = Color(0xFF6D28D9);
  static const Color alpaText = Color(0xFFB42318);
  static const Color masbukText = Color(0xFFB45309);

  // Text Colors
  static const Color textPrimary = Color(0xFF06271E);
  static const Color textSecondary = Color(0xFF5B7A70);
  static const Color textTertiary = Color(0xFF8AA49B);
  static const Color textLight = Color(0xFFE3EEE9);

  // Border & Divider
  static const Color borderSubtle = Color(0xFFE2EFE9);
  static const Color borderEmerald = Color(0xFFA7F3D0);

  // Gradient Grids
  static const LinearGradient emeraldGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [emerald800, emerald600, emerald500],
  );

  static const LinearGradient goldGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [goldLight, gold, goldDark],
  );

  static const LinearGradient deepForestGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [deepForest, forest],
  );
}
