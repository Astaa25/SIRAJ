import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:siraj/features/splash/presentation/splash_screen.dart';

void main() {
  group('SplashScreen Islamic Motion & Accessibility Tests', () {
    testWidgets('SplashScreen merender identitas SIRAJ dan logo pesantren',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: SplashScreen(),
        ),
      );

      // Verify Initial Frame
      expect(find.byType(SplashScreen), findsOneWidget);
      expect(find.byType(LinearProgressIndicator), findsOneWidget);

      // Advance animation partially
      await tester.pump(const Duration(milliseconds: 1500));
      expect(find.text('SIRAJ'), findsOneWidget);
      expect(find.text('PP. Darussalam Rajapolah Tasikmalaya'), findsNothing); // In tagline container

      // Advance to full duration
      await tester.pump(const Duration(milliseconds: 2000));
      await tester.pump(const Duration(milliseconds: 100));
    });

    testWidgets('SplashScreen menghormati preferensi Kurangi Gerakan (disableAnimations)',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MediaQuery(
          data: MediaQueryData(disableAnimations: true),
          child: MaterialApp(
            home: SplashScreen(),
          ),
        ),
      );

      // In accessible mode, texts and static layout render immediately without pulsing loop
      expect(find.text('SIRAJ'), findsOneWidget);
      expect(find.text('PP. Darussalam Rajapolah Tasikmalaya'), findsOneWidget);
    });

    testWidgets('SplashScreen memicu callback onFinished setelah 3.5 detik',
        (WidgetTester tester) async {
      bool finished = false;

      await tester.pumpWidget(
        MaterialApp(
          home: SplashScreen(
            onFinished: () {
              finished = true;
            },
          ),
        ),
      );

      // Verify not yet finished at 2 seconds
      await tester.pump(const Duration(seconds: 2));
      expect(finished, isFalse);

      // Advance past 3.5 seconds
      await tester.pump(const Duration(milliseconds: 1600));
      expect(finished, isTrue);
    });
  });
}
