import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import 'login_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<PosProvider>(context, listen: false);
      provider.loadPOSData();
    });
  }

  void _handleCloseShift() async {
    final provider = Provider.of<PosProvider>(context, listen: false);

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận Kết ca & Đăng xuất'),
        content: const Text(
          'Hệ thống sẽ lưu vết ca trực, số tiền đối soát thực tế và khóa sổ ca làm việc hiện tại. Bạn có chắc muốn tiếp tục?',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00685F), foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Xác nhận kết ca'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await provider.logout();
      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const LoginScreen()),
          (route) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<PosProvider>(context);
    final summary = provider.shiftSummary;

    final cashierName = provider.currentUser?.fullname ?? 'Nhân viên';
    final role = provider.currentUser?.role ?? 'Cashier';
    final shiftStart = summary != null
        ? "${summary.shiftStart.toLocal().hour}:${summary.shiftStart.toLocal().minute.toString().padLeft(2, '0')} - ${summary.shiftStart.toLocal().day}/${summary.shiftStart.toLocal().month}/${summary.shiftStart.toLocal().year}"
        : "-";

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        title: const Text('Báo cáo kết ca trực', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF00685F),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: provider.isLoading && summary == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // 1. Cashier & Shift Info Card
                  Card(
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
                            children: [
                              CircleAvatar(
                                backgroundColor: const Color(0xFF00685F).withValues(alpha: 0.1),
                                child: const Icon(Icons.person, color: Color(0xFF00685F)),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    cashierName,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF00685F)),
                                  ),
                                  Text(
                                    'Phân quyền: $role',
                                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                                  )
                                ],
                              )
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Divider(),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Bắt đầu ca trực:', style: TextStyle(color: Colors.grey, fontSize: 13)),
                              Text(shiftStart, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Tổng số hóa đơn:', style: TextStyle(color: Colors.grey, fontSize: 13)),
                              Text('${summary?.totalOrders ?? 0} đơn hàng', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            ],
                          )
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // 2. Financial Breakdown Card
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    child: Text(
                      'DÒNG TIỀN CA TRỰC',
                      style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey, fontSize: 12),
                    ),
                  ),
                  Card(
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      side: BorderSide(color: Colors.grey.shade200),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          _buildBreakdownRow('Doanh thu Tiền mặt (1)', summary?.cashRevenue ?? 0.0),
                          const Divider(),
                          _buildBreakdownRow('Doanh thu Chuyển khoản (2)', summary?.transferRevenue ?? 0.0),
                          const Divider(),
                          _buildBreakdownRow('Doanh số ghi nợ (3)', summary?.debtRevenue ?? 0.0, isRed: true),
                          const Divider(),
                          _buildBreakdownRow('Tiền thu nợ thực tế (4)', summary?.debtCollected ?? 0.0, isTeal: true),
                          const Divider(height: 24, thickness: 1.5),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'TỔNG QUỸ MẶT THỰC TẾ (1 + 4)',
                                style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00685F), fontSize: 14),
                              ),
                              Text(
                                '${(summary?.netCashInHand ?? 0.0).toStringAsFixed(0)}đ',
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00685F), fontSize: 20),
                              )
                            ],
                          )
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // 3. Shift end button
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00685F),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _handleCloseShift,
                    icon: const Icon(Icons.exit_to_app),
                    label: const Text('KẾT CA & ĐĂNG XUẤT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildBreakdownRow(String label, double val, {bool isRed = false, bool isTeal = false}) {
    Color valColor = const Color(0xFF00685F);
    if (isRed) valColor = Colors.redAccent;
    if (isTeal) valColor = Colors.teal;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          Text(
            '${val.toStringAsFixed(0)}đ',
            style: TextStyle(fontWeight: FontWeight.bold, color: valColor, fontSize: 14),
          ),
        ],
      ),
    );
  }
}

