import 'package:flutter/material.dart';

class SirajLoadingShimmer extends StatefulWidget {
  final double width;
  final double height;
  final double borderRadius;

  const SirajLoadingShimmer({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 12,
  });

  @override
  State<SirajLoadingShimmer> createState() => _SirajLoadingShimmerState();
}

class _SirajLoadingShimmerState extends State<SirajLoadingShimmer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.borderRadius),
            gradient: LinearGradient(
              begin: Alignment(-1.0 + (_controller.value * 2.0), -0.3),
              end: Alignment(1.0 + (_controller.value * 2.0), 0.3),
              colors: const [
                Color(0xFFE3EEE9),
                Color(0xFFF4FBF7),
                Color(0xFFE3EEE9),
              ],
              stops: const [0.1, 0.5, 0.9],
            ),
          ),
        );
      },
    );
  }
}
