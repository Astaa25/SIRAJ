import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:siraj/core/theme/siraj_colors.dart';
import 'package:siraj/core/theme/siraj_motion.dart';
import 'package:siraj/core/widgets/siraj_status_chip.dart';

void main() {
  group('Siraj Design System Tokens', () {
    test('Warna identitas SIRAJ sesuai dengan StyleGuide.md', () {
      expect(SirajColors.deepForest, const Color(0xFF06271E));
      expect(SirajColors.emerald800, const Color(0xFF065F46));
      expect(SirajColors.emerald600, const Color(0xFF059669));
      expect(SirajColors.emerald500, const Color(0xFF10B981));
      expect(SirajColors.mint, const Color(0xFFF4FBF7));
      expect(SirajColors.gold, const Color(0xFFE8B65A));
    });

    test('Token durasi gerak sesuai dengan StyleGuide.md', () {
      expect(SirajMotion.micro, const Duration(milliseconds: 120));
      expect(SirajMotion.short, const Duration(milliseconds: 200));
      expect(SirajMotion.medium, const Duration(milliseconds: 320));
      expect(SirajMotion.long, const Duration(milliseconds: 500));
    });

    testWidgets('SirajStatusChip menampilkan label dan warna yang benar',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SirajStatusChip(status: SirajAttendanceStatus.hadir),
          ),
        ),
      );

      expect(find.text('Hadir'), findsOneWidget);
    });
  });
}
