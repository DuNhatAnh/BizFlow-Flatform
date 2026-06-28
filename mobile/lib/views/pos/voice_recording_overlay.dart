import 'dart:async';
import 'package:flutter/material.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import '../../providers/pos_provider.dart';

/// Widget ghi âm thật — tự quản lý vòng đời recorder.
class VoiceRecordingOverlay extends StatefulWidget {
  const VoiceRecordingOverlay({super.key});

  @override
  State<VoiceRecordingOverlay> createState() => VoiceRecordingOverlayState();
}

class VoiceRecordingOverlayState extends State<VoiceRecordingOverlay>
    with SingleTickerProviderStateMixin {
  late AnimationController _waveController;
  final AudioRecorder _recorder = AudioRecorder();

  bool _isRecording = false;
  bool _isProcessing = false;
  String? _errorMessage;
  int _seconds = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);

    _startRecording();
  }

  @override
  void dispose() {
    _waveController.dispose();
    _timer?.cancel();
    _recorder.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    // record 6.x: hasPermission() không cần tham số
    final hasPermission = await _recorder.hasPermission();
    if (!hasPermission) {
      if (mounted) {
        setState(() => _errorMessage =
            'Chưa cấp quyền microphone.\nVào Cài đặt → Ứng dụng → BizFlow → Quyền để bật.');
      }
      return;
    }

    final dir = await getTemporaryDirectory();
    final path =
        '${dir.path}/voice_order_${DateTime.now().millisecondsSinceEpoch}.m4a';

    // record 6.x: start() nhận RecordConfig và path
    await _recorder.start(
      const RecordConfig(
        encoder: AudioEncoder.aacLc,
        bitRate: 128000,
        sampleRate: 44100,
      ),
      path: path,
    );

    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _seconds++);
    });

    if (mounted) setState(() => _isRecording = true);
  }

  /// Gọi từ bên ngoài khi người dùng nhả tay
  Future<void> stopAndProcess() async {
    if (!_isRecording) return;
    _timer?.cancel();

    if (mounted) {
      setState(() {
        _isRecording = false;
        _isProcessing = true;
      });
    }

    // record 6.x: stop() trả về path?
    final path = await _recorder.stop();
    if (path == null) {
      if (mounted) Navigator.pop(context);
      return;
    }

    if (!mounted) return;
    final provider = Provider.of<PosProvider>(context, listen: false);
    final error = await provider.processVoiceOrderWithAI(path);

    if (!mounted) return;
    // null = thành công, string = thông báo lỗi
    Navigator.pop(context, error);
  }

  String _formatTime(int s) =>
      '${(s ~/ 60).toString().padLeft(2, '0')}:${(s % 60).toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Material(
        color: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 24),
            ],
          ),
          width: 300,
          child: _errorMessage != null
              ? _buildError()
              : _isProcessing
                  ? _buildProcessing()
                  : _buildRecording(),
        ),
      ),
    );
  }

  Widget _buildRecording() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.auto_awesome, color: Color(0xFF00F5D4), size: 36),
        const SizedBox(height: 14),
        const Text(
          'Đang lắng nghe...',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF00685F)),
        ),
        const SizedBox(height: 6),
        Text(
          _formatTime(_seconds),
          style: const TextStyle(fontSize: 13, color: Colors.grey),
        ),
        const SizedBox(height: 20),
        // Sóng âm animation
        SizedBox(
          height: 40,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(7, (i) {
              return AnimatedBuilder(
                animation: _waveController,
                builder: (_, __) {
                  final v = i % 2 == 0 ? _waveController.value : 1 - _waveController.value;
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: 4,
                    height: 8 + v * 24,
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
        const SizedBox(height: 24),
        // Nút tạo đơn — bấm để dừng ghi và gửi AI
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF00685F),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          onPressed: stopAndProcess,
          icon: const Icon(Icons.send_rounded, size: 18),
          label: const Text(
            'Tạo đơn',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
          ),
        ),
        const SizedBox(height: 10),
        // Nút hủy
        TextButton(
          onPressed: () async {
            _timer?.cancel();
            await _recorder.stop();
            if (mounted) Navigator.pop(context, 'cancelled');
          },
          child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
        ),
      ],
    );
  }

  Widget _buildProcessing() {
    return const Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 40, height: 40,
          child: CircularProgressIndicator(color: Color(0xFF00685F), strokeWidth: 3),
        ),
        SizedBox(height: 16),
        Text(
          'AI đang xử lý giọng nói...',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF00685F)),
        ),
        SizedBox(height: 6),
        Text(
          'Vui lòng chờ trong giây lát',
          style: TextStyle(fontSize: 12, color: Colors.grey),
        ),
      ],
    );
  }

  Widget _buildError() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.mic_off, color: Colors.red, size: 36),
        const SizedBox(height: 14),
        Text(
          _errorMessage!,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 13, color: Colors.red),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00685F), foregroundColor: Colors.white),
          onPressed: () => Navigator.pop(context),
          child: const Text('Đóng'),
        ),
      ],
    );
  }
}
