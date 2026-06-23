import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/models.dart';

class OrderHistoryScreen extends StatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  State<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen> {
  String? _selectedDateStr; // yyyy-MM-dd
  String? _selectedSource; // Manual | AI_Voice | AI_Text

  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  void _fetchOrders() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<PosProvider>(context, listen: false);
      if (provider.tenantId != null) {
        provider.loadPOSData();
      }
    });
  }

  void _showOrderDetailDialog(Order order) {
    final provider = Provider.of<PosProvider>(context, listen: false);

    showDialog(
      context: context,
      builder: (context) {
        final isCancelled = order.status == 'Cancelled';
        return AlertDialog(
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Hóa đơn #${order.id.substring(0, 8).toUpperCase()}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isCancelled ? Colors.red.shade50 : Colors.teal.shade50,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  isCancelled ? 'Đã hủy' : 'Hoàn thành',
                  style: TextStyle(color: isCancelled ? Colors.red : Colors.teal, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              )
            ],
          ),
          content: SizedBox(
            width: double.maxFinite,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Khách hàng: ${order.customerName ?? "Khách Lẻ"}', style: const TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text('Thanh toán: ${order.paymentMethod}'),
                  Text('Nguồn đơn: ${order.orderSource}'),
                  Text('Thời gian: ${order.createdAt.toLocal().toString()}'),
                  const SizedBox(height: 12),
                  const Text('Chi tiết sản phẩm:', style: TextStyle(fontWeight: FontWeight.bold)),
                  const Divider(),
                  ...order.orderItems.map((item) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(child: Text('${item.productName} (${item.unitName}) x${item.quantity}')),
                            Text('${item.totalPrice.toStringAsFixed(0)}đ', style: const TextStyle(fontWeight: FontWeight.bold)),
                          ],
                        ),
                      )),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('TỔNG TIỀN:', style: TextStyle(fontWeight: FontWeight.bold)),
                      Text('${order.totalAmount.toStringAsFixed(0)}đ', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.redAccent, fontSize: 16)),
                    ],
                  ),
                ],
              ),
            ),
          ),
          actions: [
            if (!isCancelled) ...[
              // Reprint thermal invoice
              IconButton(
                icon: const Icon(Icons.print_outlined, color: Colors.teal),
                onPressed: () {
                  final tenantName = provider.currentUser?.tenantName ?? 'Đại lý Kim Vy';
                  final employeeName = provider.currentUser?.fullname ?? 'Nhân viên';
                  final customerName = order.customerName ?? 'Khách lẻ';
                  final dateStr = order.createdAt.toLocal().toString().split('.').first;

                  final buffer = StringBuffer();
                  buffer.writeln("==================================================");
                  buffer.writeln("        BIZFLOW RECEIPT REPRINT (IN LẠI BILL)     ");
                  buffer.writeln("==================================================");
                  buffer.writeln("Cửa Hàng: $tenantName");
                  buffer.writeln("Nhân Viên: $employeeName");
                  buffer.writeln("Thời Gian: $dateStr");
                  buffer.writeln("Mã Đơn Hàng: #${order.id.isEmpty ? 'MOCK-ORDER' : order.id.substring(0, 8).toUpperCase()}");
                  buffer.writeln("Khách Hàng: $customerName");
                  buffer.writeln("--------------------------------------------------");
                  buffer.writeln("Sản Phẩm                 SL    ĐVT      Thành Tiền");
                  buffer.writeln("--------------------------------------------------");

                  for (var item in order.orderItems) {
                    final name = item.productName.padRight(22).substring(0, 22);
                    final qty = item.quantity.toString().padRight(4);
                    final unit = item.unitName.padRight(7).substring(0, 7);
                    final price = "${item.totalPrice.toStringAsFixed(0)}đ";
                    buffer.writeln("$name $qty  $unit   $price");
                  }

                  buffer.writeln("--------------------------------------------------");
                  buffer.writeln("Tổng Thanh Toán:                    ${order.totalAmount.toStringAsFixed(0)}đ");
                  buffer.writeln("Thanh Toán Qua:                     ${order.paymentMethod == 'Cash' ? 'Tiền mặt' : order.paymentMethod == 'Transfer' ? 'Chuyển khoản' : 'Ghi nợ'}");
                  buffer.writeln("==================================================");
                  buffer.writeln("           CẢM ƠN QUÝ KHÁCH. HẸN GẶP LẠI!         ");
                  buffer.writeln("==================================================");

                  debugPrint(buffer.toString());

                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Row(
                        children: [
                          Icon(Icons.check_circle, color: Colors.white),
                          SizedBox(width: 8),
                          Text('Đã gửi lệnh in lại hóa đơn nhiệt thành công!'),
                        ],
                      ),
                      backgroundColor: const Color(0xFF2D6A4F),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  );
                },
              ),
              // Cancel Order (Role Restrict checks)
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
                onPressed: () async {
                  // Role validation check: standard employees cannot cancel completed invoices
                  final role = provider.currentUser?.role ?? 'Employee';
                  if (role != 'Admin' && role != 'Owner') {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Chỉ tài khoản Owner hoặc Admin mới có quyền hủy hóa đơn này!'),
                        backgroundColor: Colors.red,
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                    return;
                  }

                  // Confirm cancellation dialog
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Xác nhận hủy đơn hàng'),
                      content: const Text('Bạn có chắc chắn muốn hủy đơn hàng này? Hệ thống sẽ tự động hoàn kho, hoàn nợ và tạo bút toán đảo.'),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Không')),
                        TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Có, hủy đơn')),
                      ],
                    ),
                  );

                  if (confirm == true) {
                    final success = await provider.cancelOrder(order.id);
                    if (context.mounted) {
                      Navigator.pop(context); // Close details
                      if (success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Đã hủy đơn hàng thành công, kho và nợ đã được hoàn trả!')),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Lỗi khi hủy đơn hàng'), backgroundColor: Colors.red),
                        );
                      }
                    }
                  }
                },
                child: const Text('Hủy đơn'),
              ),
            ],
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đóng'),
            )
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<PosProvider>(context);

    // Apply local filters in memory or request parameters (we filter in memory for clean performance)
    final filteredOrders = provider.orders.where((o) {
      if (_selectedSource != null && o.orderSource != _selectedSource) return false;
      if (_selectedDateStr != null) {
        final orderDateStr = "${o.createdAt.toLocal().year}-${o.createdAt.toLocal().month.toString().padLeft(2, '0')}-${o.createdAt.toLocal().day.toString().padLeft(2, '0')}";
        if (orderDateStr != _selectedDateStr) return false;
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        title: const Text('Lịch sử đơn hàng', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF00685F),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          // Filter Bar
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                // Source dropdown
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        hint: const Text('Nguồn đơn', style: TextStyle(fontSize: 13)),
                        value: _selectedSource,
                        items: const [
                          DropdownMenuItem(value: null, child: Text('Tất cả nguồn')),
                          DropdownMenuItem(value: 'Manual', child: Text('Thủ công')),
                          DropdownMenuItem(value: 'AI_Voice', child: Text('Giọng nói AI')),
                          DropdownMenuItem(value: 'AI_Text', child: Text('Văn bản AI')),
                        ],
                        onChanged: (val) {
                          setState(() {
                            _selectedSource = val;
                          });
                        },
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // Date select button
                Expanded(
                  child: GestureDetector(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime(2020),
                        lastDate: DateTime(2030),
                      );
                      if (picked != null) {
                        setState(() {
                          _selectedDateStr = "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
                        });
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(_selectedDateStr ?? 'Chọn ngày', style: const TextStyle(fontSize: 13)),
                          if (_selectedDateStr != null)
                            GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedDateStr = null;
                                });
                              },
                              child: const Icon(Icons.clear, size: 16, color: Colors.grey),
                            )
                          else
                            const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Orders List
          Expanded(
            child: provider.isLoading && provider.orders.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : filteredOrders.isEmpty
                    ? const Center(child: Text('Không tìm thấy đơn hàng nào trong lịch sử'))
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        itemCount: filteredOrders.length,
                        itemBuilder: (context, index) {
                          final order = filteredOrders[index];
                          final isCancelled = order.status == 'Cancelled';
                          final date = "${order.createdAt.toLocal().day}/${order.createdAt.toLocal().month} ${order.createdAt.toLocal().hour}:${order.createdAt.toLocal().minute.toString().padLeft(2, '0')}";

                          return Card(
                            elevation: 0,
                            margin: const EdgeInsets.only(bottom: 8),
                            shape: RoundedRectangleBorder(
                              side: BorderSide(color: Colors.grey.shade200),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: ListTile(
                              onTap: () => _showOrderDetailDialog(order),
                              title: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Đơn #${order.id.substring(0, 8).toUpperCase()}',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      decoration: isCancelled ? TextDecoration.lineThrough : null,
                                    ),
                                  ),
                                  Text(
                                    '${order.totalAmount.toStringAsFixed(0)}đ',
                                    style: TextStyle(
                                      color: isCancelled ? Colors.grey : Colors.redAccent,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              subtitle: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text('$date | ${order.paymentMethod}'),
                                  Text(
                                    order.orderSource == 'AI_Voice' ? 'AI Voice' : order.orderSource == 'AI_Text' ? 'AI Text' : 'Thủ công',
                                    style: const TextStyle(fontSize: 10, color: Colors.grey),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

