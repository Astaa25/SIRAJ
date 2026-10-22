import 'package:flutter/material.dart';
import '../../../core/theme/siraj_colors.dart';
import '../../../core/widgets/siraj_card.dart';
import '../../../core/widgets/siraj_status_chip.dart';

class AttendanceScreen extends StatelessWidget {
  const AttendanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SirajColors.mint,
      appBar: AppBar(
        title: const Text('Presensi Harian Santri'),
        backgroundColor: SirajColors.deepForest,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Ringkasan Kehadiran Card
          SirajCard(
            backgroundColor: SirajColors.white,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildSummaryItem('8', 'Hadir', SirajColors.hadirText),
                _buildSummaryItem('1', 'Terlambat', SirajColors.terlambatText),
                _buildSummaryItem('1', 'Sakit', SirajColors.sakitText),
                _buildSummaryItem('2', 'Belum', const Color(0xFF6B7280)),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Sesi Item
          const Text(
            'Sesi Hari Ini (Kamis, 22 Okt)',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: SirajColors.textPrimary,
            ),
          ),
          const SizedBox(height: 10),

          _buildSessionTile(
            subject: 'Bahasa Indonesia',
            time: '07:00 - 08:30 WIB · Ust. Ahmad',
            status: SirajAttendanceStatus.hadir,
          ),
          const SizedBox(height: 8),
          _buildSessionTile(
            subject: 'Matematika',
            time: '08:30 - 10:00 WIB · Ust. Budi',
            status: SirajAttendanceStatus.terlambat,
            customLabel: 'Terlambat 12 mnt',
          ),
          const SizedBox(height: 8),
          _buildSessionTile(
            subject: 'Bahasa Inggris',
            time: '10:15 - 11:45 WIB · Usth. Sarah',
            status: SirajAttendanceStatus.sakit,
            customLabel: 'Sakit (Poskestren)',
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String count, String label, Color color) {
    return Column(
      children: [
        Text(
          count,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: SirajColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildSessionTile({
    required String subject,
    required String time,
    required SirajAttendanceStatus status,
    String? customLabel,
  }) {
    return SirajCard(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                subject,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: SirajColors.textPrimary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                time,
                style: const TextStyle(
                  fontSize: 11,
                  color: SirajColors.textSecondary,
                ),
              ),
            ],
          ),
          SirajStatusChip(status: status, customLabel: customLabel),
        ],
      ),
    );
  }
}
