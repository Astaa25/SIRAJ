import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:siraj/core/widgets/siraj_button.dart';
import 'package:siraj/core/widgets/siraj_card.dart';
import 'package:siraj/features/health/domain/health_record.dart';
import 'package:siraj/features/finance/domain/wallet_record.dart';

void main() {
  group('Siraj Core Widgets & Domain Models', () {
    testWidgets('SirajButton memicu onPressed saat ditekan',
        (WidgetTester tester) async {
      bool pressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SirajButton(
              label: 'Verifikasi Gate Pass',
              onPressed: () {
                pressed = true;
              },
            ),
          ),
        ),
      );

      expect(find.text('Verifikasi Gate Pass'), findsOneWidget);
      await tester.tap(find.text('Verifikasi Gate Pass'));
      expect(pressed, isTrue);
    });

    testWidgets('SirajCard merender child dengan padding dan border radius',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SirajCard(
              child: Text('Konten Kartu Pesantren'),
            ),
          ),
        ),
      );

      expect(find.text('Konten Kartu Pesantren'), findsOneWidget);
    });

    test('HealthRecord domain model memvalidasi demam dan tahapan rekam medis',
        () {
      final record = HealthRecord(
        id: 'hr-001',
        studentId: 'santri-001',
        studentName: 'Ahmad Fauzan',
        status: 'Istirahat Asrama',
        stage: 2,
        diagnosis: 'Febris H-1',
        temperature: 38.2,
        bloodPressure: '110/70',
        heartRate: 84,
        medicines: ['Paracetamol 500mg', 'Vitamin C'],
        recordedAt: DateTime.now(),
      );

      expect(record.hasFever, isTrue);
      expect(record.stageText, 'Tahap 2 dari 4');
      expect(record.medicines.length, 2);
    });

    test('WalletRecord memvalidasi transaksi dan status syahriah', () {
      final wallet = WalletRecord(
        id: 'w-001',
        studentId: 'santri-001',
        studentName: 'Ahmad Fauzan',
        balance: 185000,
        syahriahStatus: 'Lunas (Okt 2026)',
        recentTransactions: [
          WalletTransaction(
            id: 'tx-1',
            title: 'Makan Siang Kantin',
            category: 'Kantin',
            amount: -15000,
            timestamp: DateTime.now(),
            merchantOrSource: 'Kantin Al-Falah',
          ),
        ],
      );

      expect(wallet.isSyahriahPaid, isTrue);
      expect(wallet.recentTransactions.first.isCredit, isFalse);
    });
  });
}
