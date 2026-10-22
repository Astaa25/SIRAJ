import 'package:flutter/material.dart';

/// SIRAJ Design System — Token Gerak (Soft Motion)
/// Sesuai dengan StyleGuide.md
/// Aturan: Selalu hormati Kurangi Gerakan (disableAnimations).
class SirajMotion {
  SirajMotion._();

  // Durasi
  static const Duration micro = Duration(milliseconds: 120);
  static const Duration short = Duration(milliseconds: 200);
  static const Duration medium = Duration(milliseconds: 320);
  static const Duration long = Duration(milliseconds: 500);
  static const Duration data = Duration(milliseconds: 750);
  static const Duration splash = Duration(milliseconds: 3500);

  // Kurva
  static const Curve soft = Cubic(0.22, 1, 0.36, 1);
  static const Curve exit = Cubic(0.4, 0, 1, 1);
  static const Curve spring = Curves.elasticOut;

  // Stagger Delay
  static const Duration staggerDelay = Duration(milliseconds: 40);
  static const int maxStaggerCount = 8;

  /// Helper untuk durasi adaptif terhadap mode Kurangi Gerakan
  static Duration getAdaptiveDuration(BuildContext context, Duration standard) {
    if (MediaQuery.of(context).disableAnimations) {
      return const Duration(milliseconds: 150);
    }
    return standard;
  }
}
