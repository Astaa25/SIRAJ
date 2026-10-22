import 'package:flutter/material.dart';
import '../../../core/theme/siraj_colors.dart';
import '../../../core/widgets/siraj_card.dart';

class HealthScreen extends StatelessWidget {
  const HealthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SirajColors.mint,
      appBar: AppBar(
        title: const Text('Poskestren — Kesehatan Santri'),
        backgroundColor: SirajColors.deepForest,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Status Medis Tahap 2 dari 4 Card
          SirajCard(
            border: Border.all(color: const Color(0xFFBAE6FD)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE0F2FE),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'TAHAP 2 DARI 4',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0369A1),
                        ),
                      ),
                    ),
                    const Text(
                      '22 Okt · 08:15 WIB',
                      style: TextStyle(
                          fontSize: 11, color: SirajColors.textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Istirahat di Asrama',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: SirajColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'Keluhan: Demam & Radang Tenggorokan (Febris H-1)',
                  style: TextStyle(
                      fontSize: 12,
                      color: Color(0xFF0369A1),
                      fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 12),

                // Vitals
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0F9FF),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildVitalItem('Suhu', '37.8°C'),
                      _buildVitalItem('Tensi', '110/70'),
                      _buildVitalItem('Nadi', '82 x/mnt'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Resep & Instruksi
          SirajCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Resep & Instruksi Medis',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: SirajColors.textPrimary,
                  ),
                ),
                SizedBox(height: 8),
                Text('• Paracetamol 500mg (3x1 sesudah makan)',
                    style: TextStyle(
                        fontSize: 12, color: SirajColors.textSecondary)),
                Text('• Ambroxol Sirup 30ml (3x1 cth)',
                    style: TextStyle(
                        fontSize: 12, color: SirajColors.textSecondary)),
                Text('• Vitamin C 500mg (1x1)',
                    style: TextStyle(
                        fontSize: 12, color: SirajColors.textSecondary)),
                Text('• Istirahat total & minum air hangat',
                    style: TextStyle(
                        fontSize: 12, color: SirajColors.textSecondary)),
                SizedBox(height: 10),
                Divider(height: 1, color: Color(0xFFE2EFE9)),
                SizedBox(height: 8),
                Text('Petugas: Umi Sarah Novita, S.Kep.',
                    style: TextStyle(
                        fontSize: 11, color: SirajColors.textTertiary)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVitalItem(String label, String value) {
    return Column(
      children: [
        Text(label,
            style: const TextStyle(
                fontSize: 10, color: SirajColors.textSecondary)),
        const SizedBox(height: 2),
        Text(value,
            style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0369A1))),
      ],
    );
  }
}
