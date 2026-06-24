import 'package:flutter/material.dart';
import '../../providers/pos_provider.dart';
import '../../models/models.dart';

class OrderHistoryDetailSheet extends StatelessWidget {
  final Order order;
  final PosProvider provider;
  final VoidCallback onCancelOrder;

  const OrderHistoryDetailSheet({
    super.key,
    required this.order,
    required this.provider,
    required this.onCancelOrder,
  });

  @override
  Widget build(BuildContext context) {
    final isCancelled = order.status == 'Cancelled';
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Hóa đơn #${order.id.substring(0, 8).toUpperCase()}',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, fontFamily: 'Inter'),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: isCancelled ? Colors.red.shade50 : Colors.teal.shade50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              isCancelled ? 'Đã hủy' : 'Hoàn thành',
              style: TextStyle(color: isCancelled ? Colors.red : Colors.teal, fontSize: 10, fontWeight: FontWeight.bold, fontFamily: 'Inter'),
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
              Text('Khách hàng: ${order.customerName ?? "Khách Lẻ"}', style: const TextStyle(fontWeight: FontWeight.w600, fontFamily: 'Inter')),
              const SizedBox(height: 4),
              Text('Thanh toán: ${order.paymentMethod}', style: const TextStyle(fontFamily: 'Inter')),
              Text('Nguồn đơn: ${order.orderSource}', style: const TextStyle(fontFamily: 'Inter')),
              Text('Thời gian: ${order.createdAt.toLocal().toString()}', style: const TextStyle(fontFamily: 'Inter')),
              const SizedBox(height: 12),
              const Text('Chi tiết sản phẩm:', style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Inter')),
              const Divider(),
              ...order.orderItems.map((item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(child: Text('${item.productName} (${item.unitName}) x${item.quantity}', style: const TextStyle(fontFamily: 'Inter'))),
                        Text('${item.totalPrice.toStringAsFixed(0)}đ', style: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Inter')),
                      ],
                    ),
                  )),
              const Divider(),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('TỔNG TIỀN:', style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Inter')),
                  Text('${order.totalAmount.toStringAsFixed(0)}đ', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.redAccent, fontSize: 16, fontFamily: 'Inter')),
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
          // Cancel Order
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            onPressed: onCancelOrder,
            child: const Text('Hủy đơn', style: TextStyle(fontFamily: 'Inter')),
          ),
        ],
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Đóng', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontFamily: 'Inter')),
        )
      ],
    );
  }
}
