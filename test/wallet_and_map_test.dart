import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:siraj/features/finance/presentation/wallet_screen.dart';
import 'package:siraj/features/map/presentation/map_screen.dart';

void main() {
  group('WalletScreen & MapScreen Widget Tests', () {
    testWidgets('WalletScreen merender saldo, limit santri, dan daftar mutasi',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: WalletScreen(),
        ),
      );

      // Verify Saldo Uang Saku & student name
      expect(find.text('Ahmad Fauzan Rabbani'), findsOneWidget);
      expect(find.text('Saldo Uang Saku'), findsOneWidget);
      expect(find.textContaining('185.000'), findsOneWidget);

      // Verify Limit Notice
      expect(find.text('Limit Belanja Santri'), findsOneWidget);

      // Verify Transactions
      expect(find.text('Riwayat Transaksi Terakhir'), findsOneWidget);
      expect(find.text('Makan Siang & Susu Kedelai'), findsOneWidget);
    });

    testWidgets('MapScreen merender radar santri dan titik fasilitas pondok',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: MapScreen(),
        ),
      );

      // Verify Radar Banner
      expect(find.text('Radar Lokasi Terakhir'), findsOneWidget);
      expect(find.text('Ahmad Fauzan Rabbani'), findsOneWidget);
      expect(find.text('Gedung KMI Ibnu Sina (Lt. 2 - Kelas 7-A)'), findsOneWidget);

      // Verify Locations List
      expect(find.text('Titik Lokasi & Fasilitas Pesantren'), findsOneWidget);
      await tester.scrollUntilVisible(find.text('Poskestren'), 200);
      expect(find.text('Poskestren'), findsOneWidget);
    });
  });
}
