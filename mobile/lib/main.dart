import 'package:flutter/material.dart';
import 'dart:convert';

void main() {
  runApp(const BizFlowApp());
}

class BizFlowApp extends StatelessWidget {
  const BizFlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BizFlow Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF00685F),
          primary: const Color(0xFF00685F),
          surface: const Color(0xFFF7F9FB),
        ),
        fontFamily: 'Inter',
      ),
      home: const DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  // Mock data for draft orders from AI
  final List<Map<String, dynamic>> _draftOrders = [
    {
      "id": "1",
      "customer": "Chú Ba",
      "time": "10 phút trước",
      "source": "AI Giọng nói",
      "items": "5 bao xi măng Hà Tiên",
      "payment": "Ghi nợ",
    },
    {
      "id": "2",
      "customer": "Anh Nam",
      "time": "25 phút trước",
      "source": "AI Văn bản",
      "items": "2 cuộn dây cáp điện Cadivi",
      "payment": "Tiền mặt",
    }
  ];

  void _showVoiceAssistant() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return const VoiceAssistantSheet();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.bolt, color: theme.colorScheme.primary, size: 20),
            ),
            const SizedBox(width: 8),
            const Text(
              'BizFlow Mobile',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {},
          ),
          const CircleAvatar(
            backgroundColor: Color(0xFF89F5E7),
            child: Text('TN', style: TextStyle(color: Color(0xFF00201d), fontSize: 12)),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Quick Stat grid
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    title: 'Doanh thu',
                    value: '12.8M',
                    color: Colors.teal,
                    icon: Icons.monetization_on_outlined,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    title: 'Đơn hàng',
                    value: '156',
                    color: theme.colorScheme.primary,
                    icon: Icons.shopping_bag_outlined,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    title: 'Công nợ',
                    value: '8.5M',
                    color: Colors.redAccent,
                    icon: Icons.account_balance_wallet_outlined,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // AI Drafts Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Đơn hàng AI chờ duyệt',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF191C1E)),
                ),
                TextButton(
                  onPressed: () {},
                  child: const Text('Xem tất cả'),
                ),
              ],
            ),
            const SizedBox(height: 8),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _draftOrders.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final order = _draftOrders[index];
                return Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    side: BorderSide(color: Colors.grey.shade200),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              order['customer'],
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: theme.colorScheme.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                order['source'],
                                style: TextStyle(
                                  color: theme.colorScheme.primary,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          order['items'],
                          style: TextStyle(color: Colors.grey.shade700, fontSize: 13),
                        ),
                        const SizedBox(height: 12),
                        const Divider(height: 1),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Thanh toán: ${order['payment']}',
                              style: const TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                            Row(
                              children: [
                                OutlinedButton(
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                                    visualDensity: VisualDensity.compact,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _draftOrders.removeAt(index);
                                    });
                                  },
                                  child: const Text('Hủy', style: TextStyle(color: Colors.red, fontSize: 12)),
                                ),
                                const SizedBox(width: 8),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: theme.colorScheme.primary,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                                    visualDensity: VisualDensity.compact,
                                    elevation: 0,
                                  ),
                                  onPressed: () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('Đã duyệt đơn hàng của ${order['customer']}')),
                                    );
                                    setState(() {
                                      _draftOrders.removeAt(index);
                                    });
                                  },
                                  child: const Text('Duyệt', style: TextStyle(fontSize: 12)),
                                ),
                              ],
                            )
                          ],
                        )
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.large(
        onPressed: _showVoiceAssistant,
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: Colors.white,
        child: const Icon(Icons.mic),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: color.withValues(alpha: 0.1),
            child: Icon(icon, color: color, size: 16),
          ),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          Text(title, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
        ],
      ),
    );
  }
}

class VoiceAssistantSheet extends StatefulWidget {
  const VoiceAssistantSheet({super.key});

  @override
  State<VoiceAssistantSheet> createState() => _VoiceAssistantSheetState();
}

class _VoiceAssistantSheetState extends State<VoiceAssistantSheet> {
  bool _isRecording = false;
  String _statusText = 'Bấm phím Mic bên dưới để nói...';
  String _extractedResult = '';

  void _toggleRecording() async {
    if (_isRecording) {
      setState(() {
        _isRecording = false;
        _statusText = 'Đang gửi âm thanh tới AI Service...';
      });

      // Simulate network request to FastAPI
      await Future.delayed(const Duration(seconds: 2));

      setState(() {
        _statusText = 'Đã phân tích xong!';
        _extractedResult = jsonEncode({
          "customer_name": "Chú Ba",
          "items": [
            {"product_name": "Xi măng Hà Tiên", "quantity": 5, "unit": "Bao"}
          ],
          "payment_method": "Debt",
          "raw_transcript": "Lấy cho chú Ba 5 bao xi măng Hà Tiên, ghi nợ nghen"
        });
      });
    } else {
      setState(() {
        _isRecording = true;
        _statusText = 'Đang nghe giọng nói của bạn...';
        _extractedResult = '';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 40,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          const SizedBox(height: 24),
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.auto_awesome, color: Color(0xFF00685F)),
              SizedBox(width: 8),
              Text(
                'Trợ lý bán hàng AI',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ],
          ),
          const SizedBox(height: 32),
          Text(
            _statusText,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
          ),
          const SizedBox(height: 24),

          // Microphone display
          GestureDetector(
            onTap: _toggleRecording,
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _isRecording ? Colors.red.shade50 : theme.colorScheme.primary.withValues(alpha: 0.08),
                border: Border.all(
                  color: _isRecording ? Colors.red : theme.colorScheme.primary,
                  width: 2,
                ),
              ),
              child: Center(
                child: Icon(
                  _isRecording ? Icons.stop : Icons.mic,
                  color: _isRecording ? Colors.red : theme.colorScheme.primary,
                  size: 40,
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),

          if (_extractedResult.isNotEmpty) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Dữ liệu phân tích chi tiết:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _extractedResult,
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.primary,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Đơn hàng nháp đã được chuyển lên Hệ thống!')),
                );
              },
              child: const Text('Xác nhận & Gửi hóa đơn nháp'),
            ),
          ]
        ],
      ),
    );
  }
}
