import 'package:flutter/material.dart';
import 'app/router.dart';
import 'core/theme/siraj_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SirajApp());
}

class SirajApp extends StatelessWidget {
  const SirajApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'SIRAJ — Smart Islamic Routine & Attendance Journey',
      debugShowCheckedModeBanner: false,
      theme: SirajTheme.lightTheme,
      routerConfig: sirajRouter,
    );
  }
}
