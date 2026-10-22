import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/siraj_colors.dart';
import '../../../core/theme/siraj_motion.dart';

/// Screen Splash Islami SIRAJ (3.5 Detik)
/// Sesuai dengan spesifikasi detail di StyleGuide.md:
/// Latar #06271E, cahaya radial zamrud/emas, animasi logo berdenyut,
/// teks muncul berurutan, dan melebur halus ke beranda.
class SplashScreen extends StatefulWidget {
  final VoidCallback? onFinished;

  const SplashScreen({super.key, this.onFinished});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _glowAnimation;
  late Animation<double> _logoScaleAnimation;
  late Animation<double> _logoOpacityAnimation;
  late Animation<double> _textOpacityAnimation;
  late Animation<double> _taglineOpacityAnimation;
  Timer? _navigationTimer;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3500),
    );

    // 0 - 0.4s: Cahaya radial memudar masuk
    _glowAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.25, curve: Curves.easeOut),
      ),
    );

    // 0.4s - 1.6s: Logo fade + skala 0.92 -> 1.0
    _logoScaleAnimation = Tween<double>(begin: 0.92, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.12, 0.45, curve: SirajMotion.soft),
      ),
    );

    _logoOpacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.12, 0.45, curve: Curves.easeIn),
      ),
    );

    // 1.6s - 2.6s: Teks "SIRAJ" muncul
    _textOpacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.45, 0.75, curve: Curves.easeIn),
      ),
    );

    // 2.6s - 3.2s: Tagline fade in
    _taglineOpacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.75, 0.92, curve: Curves.easeIn),
      ),
    );

    _controller.forward();

    // Selesai pada 3.5 detik (sesuai StyleGuide.md)
    _navigationTimer = Timer(const Duration(milliseconds: 3500), () {
      if (mounted) {
        if (widget.onFinished != null) {
          widget.onFinished!();
        } else {
          try {
            context.go('/wali');
          } catch (_) {
            // Fallback aman bila dijalankan di isolated widget tester tanpa GoRouter
          }
        }
      }
    });
  }

  @override
  void dispose() {
    _navigationTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final disableAnimations = MediaQuery.of(context).disableAnimations;

    if (disableAnimations) {
      return Scaffold(
        backgroundColor: SirajColors.deepForest,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                'assets/images/logo_tile_1024.png',
                width: 120,
                height: 120,
              ),
              const SizedBox(height: 20),
              const Text(
                'SIRAJ',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 4.0,
                  color: SirajColors.goldLight,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'PP. Darussalam Rajapolah Tasikmalaya',
                style: TextStyle(fontSize: 13, color: Colors.white70),
              ),
            ],
          ),
        ),
      );
    }

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Scaffold(
          backgroundColor: SirajColors.deepForest,
          body: Stack(
            children: [
              // Cahaya radial latar zamrud & emas
              Positioned.fill(
                child: Opacity(
                  opacity: _glowAnimation.value * 0.4,
                  child: Container(
                    decoration: const BoxDecoration(
                      gradient: RadialGradient(
                        center: Alignment(0.0, -0.1),
                        radius: 0.9,
                        colors: [
                          Color(0xFF0D4332),
                          Color(0xFF06271E),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              // Konten Utama Tengah
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Glow & Logo Tile
                    Opacity(
                      opacity: _logoOpacityAnimation.value,
                      child: Transform.scale(
                        scale: _logoScaleAnimation.value,
                        child: Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: SirajColors.emerald500.withValues(
                                  alpha: 0.3 * _glowAnimation.value,
                                ),
                                blurRadius: 40,
                                spreadRadius: 8,
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(28),
                            child: Image.asset(
                              'assets/images/logo_tile_1024.png',
                              width: 124,
                              height: 124,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Teks Judul "SIRAJ" Beraksen Emas
                    Opacity(
                      opacity: _textOpacityAnimation.value,
                      child: const Column(
                        children: [
                          Text(
                            'SIRAJ',
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 6.0,
                              color: SirajColors.goldLight,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'Smart Islamic Routine & Attendance Journey',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              letterSpacing: 0.5,
                              color: Color(0xFFA7F3D0),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Tagline & Identitas Pondok
                    Opacity(
                      opacity: _taglineOpacityAnimation.value,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: SirajColors.gold.withValues(alpha: 0.3),
                          ),
                        ),
                        child: const Text(
                          'Pondok Pesantren Darussalam Rajapolah',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.3,
                            color: Colors.white70,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Bilah Progres Halus di Bawah Layar
              Positioned(
                bottom: 32,
                left: 48,
                right: 48,
                child: Opacity(
                  opacity: _glowAnimation.value,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: _controller.value,
                      backgroundColor: Colors.white.withValues(alpha: 0.1),
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        SirajColors.gold,
                      ),
                      minHeight: 3,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
