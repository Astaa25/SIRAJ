import 'package:flutter/material.dart';
import '../theme/siraj_colors.dart';

enum SirajAttendanceStatus {
  hadir,
  terlambat,
  sakit,
  izin,
  alpa,
  masbuk,
  belum
}

class SirajStatusChip extends StatelessWidget {
  final SirajAttendanceStatus status;
  final String? customLabel;

  const SirajStatusChip({
    super.key,
    required this.status,
    this.customLabel,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color textColor;
    String label;

    switch (status) {
      case SirajAttendanceStatus.hadir:
        bg = SirajColors.successBg;
        textColor = SirajColors.hadirText;
        label = customLabel ?? 'Hadir';
        break;
      case SirajAttendanceStatus.terlambat:
        bg = SirajColors.warningBg;
        textColor = SirajColors.terlambatText;
        label = customLabel ?? 'Terlambat';
        break;
      case SirajAttendanceStatus.sakit:
        bg = SirajColors.sakitBg;
        textColor = SirajColors.sakitText;
        label = customLabel ?? 'Sakit';
        break;
      case SirajAttendanceStatus.izin:
        bg = SirajColors.izinBg;
        textColor = SirajColors.izinText;
        label = customLabel ?? 'Izin';
        break;
      case SirajAttendanceStatus.alpa:
        bg = SirajColors.dangerBg;
        textColor = SirajColors.alpaText;
        label = customLabel ?? 'Alpa';
        break;
      case SirajAttendanceStatus.masbuk:
        bg = SirajColors.masbukBg;
        textColor = SirajColors.masbukText;
        label = customLabel ?? 'Masbuk';
        break;
      case SirajAttendanceStatus.belum:
        bg = const Color(0xFFF3F4F6);
        textColor = const Color(0xFF6B7280);
        label = customLabel ?? 'Belum dicatat';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: textColor,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: textColor,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
