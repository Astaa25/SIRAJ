import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'siraj_colors.dart';

/// SIRAJ Design System — Tema Utama
/// Menggunakan Plus Jakarta Sans, radius terstandardisasi, dan bayangan lembut.
class SirajTheme {
  SirajTheme._();

  static ThemeData get lightTheme {
    final baseTextTheme = GoogleFonts.plusJakartaSansTextTheme();

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: SirajColors.mint,
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: SirajColors.emerald600,
        onPrimary: SirajColors.white,
        secondary: SirajColors.gold,
        onSecondary: SirajColors.deepForest,
        error: SirajColors.alpaText,
        onError: SirajColors.white,
        surface: SirajColors.white,
        onSurface: SirajColors.textPrimary,
      ),
      textTheme: baseTextTheme.copyWith(
        displayLarge: baseTextTheme.displayLarge?.copyWith(
          fontSize: 28,
          height: 36 / 28,
          fontWeight: FontWeight.bold,
          color: SirajColors.textPrimary,
        ),
        titleLarge: baseTextTheme.titleLarge?.copyWith(
          fontSize: 20,
          height: 28 / 20,
          fontWeight: FontWeight.w600,
          color: SirajColors.textPrimary,
        ),
        titleMedium: baseTextTheme.titleMedium?.copyWith(
          fontSize: 16,
          height: 24 / 16,
          fontWeight: FontWeight.w500,
          color: SirajColors.textPrimary,
        ),
        bodyMedium: baseTextTheme.bodyMedium?.copyWith(
          fontSize: 14,
          height: 22 / 14,
          fontWeight: FontWeight.normal,
          color: SirajColors.textPrimary,
        ),
        bodySmall: baseTextTheme.bodySmall?.copyWith(
          fontSize: 12,
          height: 18 / 12,
          fontWeight: FontWeight.normal,
          color: SirajColors.textSecondary,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: SirajColors.deepForest,
        foregroundColor: SirajColors.white,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardThemeData(
        color: SirajColors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
    );
  }
}
