import 'package:flutter/material.dart';
import '../theme/siraj_colors.dart';
import '../theme/siraj_motion.dart';

class SirajCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final Color? backgroundColor;
  final Border? border;
  final double borderRadius;

  const SirajCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.backgroundColor,
    this.border,
    this.borderRadius = 20,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: SirajMotion.short,
      curve: SirajMotion.soft,
      decoration: BoxDecoration(
        color: backgroundColor ?? SirajColors.white,
        borderRadius: BorderRadius.circular(borderRadius),
        border: border ?? Border.all(color: const Color(0xFFE2EFE9), width: 1),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(6, 95, 70, 0.05),
            offset: Offset(0, 4),
            blurRadius: 14,
            spreadRadius: -2,
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(borderRadius),
          onTap: onTap,
          child: Padding(
            padding: padding!,
            child: child,
          ),
        ),
      ),
    );
  }
}
