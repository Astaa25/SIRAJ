import 'package:flutter/material.dart';
import '../theme/siraj_colors.dart';
import '../theme/siraj_motion.dart';

/// Item representasi Bottom Navigation Bar SIRAJ
class SirajNavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String routePath;

  const SirajNavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.routePath,
  });
}

/// SIRAJ Design System — Bottom Navigation Bar
/// Sesuai StyleGuide.md (Latar putih, sudut atas 24, ikon aktif #059669 naik 2px)
class SirajBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<SirajNavItem> items;

  const SirajBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.items = defaultItems,
  });

  static const List<SirajNavItem> defaultItems = [
    SirajNavItem(
      icon: Icons.calendar_today_outlined,
      activeIcon: Icons.calendar_today,
      label: 'Jurnal',
      routePath: '/wali',
    ),
    SirajNavItem(
      icon: Icons.qr_code_scanner_outlined,
      activeIcon: Icons.qr_code_scanner,
      label: 'Gate Pass',
      routePath: '/gatepass',
    ),
    SirajNavItem(
      icon: Icons.local_hospital_outlined,
      activeIcon: Icons.local_hospital,
      label: 'Poskestren',
      routePath: '/health',
    ),
    SirajNavItem(
      icon: Icons.menu_book_outlined,
      activeIcon: Icons.menu_book,
      label: 'Tahfidz',
      routePath: '/tahfidz',
    ),
    SirajNavItem(
      icon: Icons.account_balance_wallet_outlined,
      activeIcon: Icons.account_balance_wallet,
      label: 'Dompet',
      routePath: '/wallet',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: SirajColors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Color.fromRGBO(6, 95, 70, 0.08),
            offset: Offset(0, -4),
            blurRadius: 20,
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(items.length, (index) {
              final isSelected = index == currentIndex;
              final item = items[index];

              return Expanded(
                child: InkWell(
                  onTap: () => onTap(index),
                  splashColor: SirajColors.emerald100.withValues(alpha: 0.4),
                  highlightColor: Colors.transparent,
                  borderRadius: BorderRadius.circular(16),
                  child: AnimatedContainer(
                    duration: SirajMotion.short,
                    curve: SirajMotion.soft,
                    transform: isSelected
                        ? Matrix4.translationValues(0, -2, 0)
                        : Matrix4.identity(),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          isSelected ? item.activeIcon : item.icon,
                          color: isSelected
                              ? SirajColors.emerald600
                              : SirajColors.textSecondary,
                          size: 22,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.label,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            color: isSelected
                                ? SirajColors.emerald600
                                : SirajColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        AnimatedContainer(
                          duration: SirajMotion.micro,
                          width: isSelected ? 4 : 0,
                          height: isSelected ? 4 : 0,
                          decoration: const BoxDecoration(
                            color: SirajColors.emerald600,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
