import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/attendance/presentation/attendance_screen.dart';
import '../features/gatepass/presentation/gatepass_screen.dart';
import '../features/health/presentation/health_screen.dart';
import '../features/map/presentation/map_screen.dart';
import '../features/shell/presentation/siraj_main_shell.dart';
import '../features/splash/presentation/splash_screen.dart';
import '../features/tahfidz/presentation/tahfidz_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();

/// SIRAJ App Router — Navigasi Berbasis Peran
/// Dilengkapi StatefulShellRoute untuk Bottom Navigation Bar & Guard Peran
final sirajRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/wali',
  routes: [
    // Shell Route untuk Wali Santri (5 Tab Bottom Nav)
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return SirajMainShell(navigationShell: navigationShell);
      },
      branches: [
        // Tab 1: Jurnal Presensi
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/wali',
              builder: (context, state) => const AttendanceScreen(),
            ),
          ],
        ),
        // Tab 2: Gate Pass
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/gatepass',
              builder: (context, state) => const GatePassScreen(),
            ),
          ],
        ),
        // Tab 3: Poskestren
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/health',
              builder: (context, state) => const HealthScreen(),
            ),
          ],
        ),
        // Tab 4: Tahfidz
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/tahfidz',
              builder: (context, state) => const TahfidzScreen(),
            ),
          ],
        ),
      ],
    ),

    // Rute Mandiri
    GoRoute(
      path: '/splash',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/map',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const MapScreen(),
    ),
    GoRoute(
      path: '/musyrif',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const AttendanceScreen(),
    ),
    GoRoute(
      path: '/admin',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const Scaffold(
        body: Center(child: Text('Portal Web Admin Pesantren')),
      ),
    ),
  ],
);
