import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:siraj/core/widgets/siraj_bottom_nav.dart';
import 'package:siraj/main.dart';

void main() {
  group('SirajBottomNav & Shell Navigation Tests', () {
    testWidgets('SirajBottomNav merender 5 tab navigasi sesuai StyleGuide.md',
        (WidgetTester tester) async {
      int selected = 0;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            bottomNavigationBar: SirajBottomNav(
              currentIndex: selected,
              onTap: (index) {
                selected = index;
              },
            ),
          ),
        ),
      );

      // Verify all 5 tab items are rendered
      expect(find.text('Jurnal'), findsOneWidget);
      expect(find.text('Gate Pass'), findsOneWidget);
      expect(find.text('Poskestren'), findsOneWidget);
      expect(find.text('Tahfidz'), findsOneWidget);
      expect(find.text('Dompet'), findsOneWidget);

      // Tap on Tab 2 (Gate Pass)
      await tester.tap(find.text('Gate Pass'));
      expect(selected, 1);
    });

    testWidgets('SirajApp memulai di rute /wali dan menampilkan Presensi Harian Santri',
        (WidgetTester tester) async {
      await tester.pumpWidget(const SirajApp());
      await tester.pumpAndSettle();

      expect(find.text('Presensi Harian Santri'), findsOneWidget);
      expect(find.text('Jurnal'), findsOneWidget);
      expect(find.text('Gate Pass'), findsOneWidget);
    });
  });
}
