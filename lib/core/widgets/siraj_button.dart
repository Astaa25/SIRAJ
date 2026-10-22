import 'package:flutter/material.dart';
import '../theme/siraj_colors.dart';
import '../theme/siraj_motion.dart';

enum SirajButtonVariant { emerald, gold, outline, disabled }

class SirajButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final SirajButtonVariant variant;
  final Widget? icon;
  final double height;

  const SirajButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = SirajButtonVariant.emerald,
    this.icon,
    this.height = 52,
  });

  @override
  Widget build(BuildContext context) {
    BoxDecoration decoration;
    TextStyle textStyle;

    switch (variant) {
      case SirajButtonVariant.emerald:
        decoration = BoxDecoration(
          gradient: SirajColors.emeraldGradient,
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [
            BoxShadow(
              color: Color.fromRGBO(6, 95, 70, 0.25),
              offset: Offset(0, 4),
              blurRadius: 16,
            ),
          ],
        );
        textStyle = const TextStyle(
          color: SirajColors.white,
          fontSize: 15,
          fontWeight: FontWeight.w600,
        );
        break;

      case SirajButtonVariant.gold:
        decoration = BoxDecoration(
          gradient: SirajColors.goldGradient,
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [
            BoxShadow(
              color: Color.fromRGBO(232, 182, 90, 0.3),
              offset: Offset(0, 4),
              blurRadius: 16,
            ),
          ],
        );
        textStyle = const TextStyle(
          color: SirajColors.deepForest,
          fontSize: 15,
          fontWeight: FontWeight.bold,
        );
        break;

      case SirajButtonVariant.outline:
        decoration = BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: SirajColors.emerald600, width: 1.5),
        );
        textStyle = const TextStyle(
          color: SirajColors.emerald600,
          fontSize: 15,
          fontWeight: FontWeight.w600,
        );
        break;

      case SirajButtonVariant.disabled:
        decoration = BoxDecoration(
          color: const Color(0xFFE3EEE9),
          borderRadius: BorderRadius.circular(16),
        );
        textStyle = const TextStyle(
          color: Color(0xFF9CB3AA),
          fontSize: 15,
          fontWeight: FontWeight.w600,
        );
        break;
    }

    return AnimatedContainer(
      duration: SirajMotion.short,
      curve: SirajMotion.soft,
      height: height,
      decoration: decoration,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: variant == SirajButtonVariant.disabled ? null : onPressed,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  icon!,
                  const SizedBox(width: 8),
                ],
                Text(label, style: textStyle),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
