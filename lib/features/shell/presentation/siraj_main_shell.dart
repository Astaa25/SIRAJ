import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/siraj_bottom_nav.dart';

/// Shell Scaffold dengan Bottom Navigation Bar SIRAJ untuk peran Wali Santri
class SirajMainShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const SirajMainShell({
    super.key,
    required this.navigationShell,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: SirajBottomNav(
        currentIndex: navigationShell.currentIndex,
        onTap: (index) {
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
      ),
    );
  }
}
