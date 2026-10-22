import 'package:flutter/material.dart';
import '../../../core/theme/siraj_colors.dart';
import '../../../core/widgets/siraj_card.dart';
import '../../../core/widgets/siraj_status_chip.dart';

/// Screen Peta Interaktif & Radar Lokasi Santri Darussalam Rajapolah
class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  String _selectedLocation = 'Gedung KMI Ibnu Sina';

  final List<Map<String, dynamic>> _locations = [
    {
      'name': 'Gedung KMI Ibnu Sina',
      'role': 'Kelas & KBM',
      'desc': 'Lantai 2 - Ruang Kelas 7-A (Saat ini santri berada di sini)',
      'status': 'Aktif KBM',
      'isCurrent': true,
      'icon': Icons.school_outlined,
    },
    {
      'name': 'Masjid Jami\' Darussalam',
      'role': 'Pusat Ibadah & Halaqah',
      'desc': 'Lokasi salat berjamaah 5 waktu & muraja\'ah tahfidz',
      'status': 'Terbuka',
      'isCurrent': false,
      'icon': Icons.mosque_outlined,
    },
    {
      'name': 'Asrama Santri Al-Fath',
      'role': 'Rayon Santri Putra',
      'desc': 'Kamar 12 - Kapasitas 8 santri, Musyrif: Ust. Hamdan',
      'status': 'Aman & Terkunci Siang',
      'isCurrent': false,
      'icon': Icons.hotel_outlined,
    },
    {
      'name': 'Poskestren',
      'role': 'Pos Kesehatan Pesantren',
      'desc': 'Pelayanan medis dasar santri, dokter jaga & perawat pondok',
      'status': 'Buka 24 Jam',
      'isCurrent': false,
      'icon': Icons.medical_services_outlined,
    },
    {
      'name': 'Aula Serbaguna & Olahraga',
      'role': 'Kegiatan Akbar',
      'desc': 'Muhadharah 3 bahasa, ekstrakurikuler & wisuda',
      'status': 'Tersedia',
      'isCurrent': false,
      'icon': Icons.stadium_outlined,
    },
    {
      'name': 'Gerbang Utama & Pos Satpam',
      'role': 'Keamanan & Gate Pass',
      'desc': 'Pintu akses keluar-masuk, validasi QR Pass Zero-Trust',
      'status': 'Penjagaan 24 Jam',
      'isCurrent': false,
      'icon': Icons.security_outlined,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SirajColors.mint,
      appBar: AppBar(
        title: const Text('Peta Pesantren & Radar Santri'),
        backgroundColor: SirajColors.deepForest,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Live Santri Radar Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [SirajColors.deepForest, SirajColors.forest],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: SirajColors.emerald600.withValues(alpha: 0.3),
                    shape: BoxShape.circle,
                    border: Border.all(color: SirajColors.gold, width: 2),
                  ),
                  child: const Center(
                    child: Icon(Icons.radar, color: SirajColors.gold, size: 26),
                  ),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Radar Lokasi Terakhir',
                        style: TextStyle(
                          color: SirajColors.gold,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Ahmad Fauzan Rabbani',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Gedung KMI Ibnu Sina (Lt. 2 - Kelas 7-A)',
                        style: TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                const SirajStatusChip(
                  status: SirajAttendanceStatus.hadir,
                  customLabel: 'Terverifikasi',
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Visual Campus Diagram
          SirajCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Kompleks Pondok Pesantren',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: SirajColors.deepForest,
                      ),
                    ),
                    Text(
                      'Rajapolah, Tasikmalaya',
                      style: TextStyle(fontSize: 11, color: SirajColors.textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  height: 160,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE6F4EA),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: SirajColors.borderEmerald),
                  ),
                  child: Stack(
                    children: [
                      // Grid visual
                      Positioned.fill(
                        child: CustomPaint(
                          painter: _CampusGridPainter(),
                        ),
                      ),
                      // Santri pin indicator
                      Positioned(
                        top: 40,
                        left: 90,
                        child: Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: SirajColors.deepForest,
                                borderRadius: BorderRadius.circular(8),
                                boxShadow: const [
                                  BoxShadow(color: Colors.black26, blurRadius: 4),
                                ],
                              ),
                              child: const Text(
                                'Ahmad Fauzan (Kelas 7-A)',
                                style: TextStyle(
                                  color: SirajColors.gold,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const Icon(
                              Icons.location_pin,
                              color: SirajColors.terlambatText,
                              size: 32,
                            ),
                          ],
                        ),
                      ),
                      // Mosque Pin
                      const Positioned(
                        top: 70,
                        right: 80,
                        child: Column(
                          children: [
                            Icon(Icons.mosque, color: SirajColors.emerald600, size: 24),
                            Text(
                              'Masjid Jami\'',
                              style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Zone Locations
          const Text(
            'Titik Lokasi & Fasilitas Pesantren',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: SirajColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),

          ..._locations.map((loc) {
            final isCurrent = loc['isCurrent'] as bool;
            final isSelected = loc['name'] == _selectedLocation;

            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: InkWell(
                onTap: () {
                  setState(() {
                    _selectedLocation = loc['name'] as String;
                  });
                },
                borderRadius: BorderRadius.circular(16),
                child: SirajCard(
                  backgroundColor: isSelected
                      ? SirajColors.white
                      : Colors.white.withValues(alpha: 0.9),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: isCurrent
                              ? SirajColors.emerald100
                              : SirajColors.mint,
                          borderRadius: BorderRadius.circular(12),
                          border: isCurrent
                              ? Border.all(color: SirajColors.emerald600, width: 1.5)
                              : null,
                        ),
                        child: Icon(
                          loc['icon'] as IconData,
                          color: isCurrent ? SirajColors.emerald600 : SirajColors.textSecondary,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  loc['name'] as String,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: SirajColors.textPrimary,
                                  ),
                                ),
                                if (isCurrent) ...[
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: SirajColors.successBg,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: const Text(
                                      'Lokasi Santri',
                                      style: TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: SirajColors.hadirText,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              loc['desc'] as String,
                              style: const TextStyle(
                                fontSize: 11,
                                color: SirajColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _CampusGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = SirajColors.emerald800.withValues(alpha: 0.08)
      ..strokeWidth = 1;

    for (double x = 0; x < size.width; x += 24) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += 24) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
