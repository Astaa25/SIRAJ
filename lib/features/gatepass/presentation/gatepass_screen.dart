import 'package:flutter/material.dart';
import '../../../core/theme/siraj_colors.dart';
import '../../../core/widgets/siraj_card.dart';

class GatePassScreen extends StatelessWidget {
  const GatePassScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SirajColors.mint,
      appBar: AppBar(
        title: const Text('QR Gate Pass Penjemputan'),
        backgroundColor: SirajColors.deepForest,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // Rotating QR Card
              SirajCard(
                borderRadius: 24,
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Image.asset(
                      'assets/images/logo_tile_1024.png',
                      width: 180,
                      height: 180,
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'GP-2026-X889',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: SirajColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      '🔒 Dilindungi Kriptografi Ed25519',
                      style: TextStyle(
                        fontSize: 11,
                        color: SirajColors.emerald600,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Detail Izin
              SirajCard(
                child: Column(
                  children: [
                    _buildRow('Santri', 'Ahmad Fauzan (Kelas 7-A)'),
                    const Divider(height: 16, color: Color(0xFFE2EFE9)),
                    _buildRow(
                        'Penjemput Sah', 'Ir. H. Abdullah (Ayah Kandung)'),
                    const Divider(height: 16, color: Color(0xFFE2EFE9)),
                    _buildRow('Status', 'Aktif & Disetujui Musyrif Asrama'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style:
              const TextStyle(fontSize: 12, color: SirajColors.textSecondary),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: SirajColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
