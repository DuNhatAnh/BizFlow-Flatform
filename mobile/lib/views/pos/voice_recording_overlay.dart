import 'package:flutter/material.dart';

class VoiceRecordingOverlay extends StatefulWidget {
  const VoiceRecordingOverlay({super.key});

  @override
  State<VoiceRecordingOverlay> createState() => _VoiceRecordingOverlayState();
}

class _VoiceRecordingOverlayState extends State<VoiceRecordingOverlay> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Material(
        color: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.15),
                blurRadius: 20,
              ),
            ],
          ),
          width: 280,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.auto_awesome, color: Color(0xFF00F5D4), size: 40),
              const SizedBox(height: 16),
              const Text(
                'Đang lắng nghe...',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF00685F),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Nói yêu cầu đặt hàng của bạn và thả tay ra',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 24),
              SizedBox(
                height: 40,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    return AnimatedBuilder(
                      animation: _controller,
                      builder: (context, child) {
                        final scale = 1.0 + (index % 2 == 0 ? _controller.value : 1.0 - _controller.value) * 2.0;
                        return Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: 4,
                          height: 10 * scale,
                          decoration: BoxDecoration(
                            color: const Color(0xFF00F5D4),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        );
                      },
                    );
                  }),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
