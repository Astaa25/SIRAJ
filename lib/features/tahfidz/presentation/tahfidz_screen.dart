import 'package:flutter/material.dart';
import '../../../core/theme/siraj_colors.dart';
import '../../../core/widgets/siraj_card.dart';

class TahfidzScreen extends StatelessWidget {
  const TahfidzScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SirajColors.mint,
      appBar: AppBar(
        title: const Text('Mutaba' 'ah & Setoran Tahfidz'),
        backgroundColor: SirajColors.deepForest,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Juz Progress Card
          SirajCard(
            backgroundColor: SirajColors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Pencapaian Hafalan (Juz 1 – 30)',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: SirajColors.textPrimary,
                      ),
                    ),
                    Text(
                      '4 Juz 12 Hal',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: SirajColors.emerald600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                LinearProgressIndicator(
                  value: 4.4 / 30.0,
                  backgroundColor: const Color(0xFFE2EFE9),
                  valueColor: const AlwaysStoppedAnimation<Color>(
                      SirajColors.emerald600),
                  borderRadius: BorderRadius.circular(10),
                  minHeight: 8,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Target Wisuda Tahfidz Tahun Ajaran 2026: 6 Juz Mutqin',
                  style:
                      TextStyle(fontSize: 11, color: SirajColors.textSecondary),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          const Text(
            'Riwayat Setoran Ziyadah & Murajaah',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: SirajColors.textPrimary,
            ),
          ),
          const SizedBox(height: 10),

          // Item 1
          _buildTahfidzTile(
            surah: 'Surah Al-Baqarah (Ayat 79 – 102)',
            type: 'Ziyadah (Hafalan Baru)',
            time: 'Kamis, 22 Okt · 05:50 WIB',
            grade: 'Jayyid Jiddan (88)',
            notes:
                'Makharijul huruf fasih, perhatikan mad jaiz munfashil di ayat 91.',
            teacher: 'Ust. Hafizh Al-Mubarok',
          ),
          const SizedBox(height: 10),

          // Item 2
          _buildTahfidzTile(
            surah: 'Juz Amma (An-Naba – Al-Muthaffifin)',
            type: 'Murajaah Terpimpin',
            time: 'Rabu, 21 Okt · 16:30 WIB',
            grade: 'Mumtaz (95)',
            notes: 'Kelancaran hafalan sangat baik, intonasi tartil sempurna.',
            teacher: 'Ust. Hafizh Al-Mubarok',
          ),
        ],
      ),
    );
  }

  Widget _buildTahfidzTile({
    required String surah,
    required String type,
    required String time,
    required String grade,
    required String notes,
    required String teacher,
  }) {
    return SirajCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                surah,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: SirajColors.textPrimary,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFD1FAE5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  grade,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: SirajColors.hadirText,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '$type · $time',
            style:
                const TextStyle(fontSize: 11, color: SirajColors.textSecondary),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFF4FBF7),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFE2EFE9)),
            ),
            child: Text(
              'Catatan: $notes',
              style: const TextStyle(
                  fontSize: 11,
                  color: SirajColors.textSecondary,
                  fontStyle: FontStyle.italic),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Pembimbing: $teacher',
            style:
                const TextStyle(fontSize: 10, color: SirajColors.textTertiary),
          ),
        ],
      ),
    );
  }
}
