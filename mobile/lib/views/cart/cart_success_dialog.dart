import 'package:flutter/material.dart';
import '../../models/models.dart';

class CartSuccessDialog extends StatelessWidget {
  final Order order;
  final VoidCallback onBackToPOS;

  const CartSuccessDialog({
    super.key,
    required this.order,
    required this.onBackToPOS,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle, color: Color(0xFF2D6A4F), size: 80),
          const SizedBox(height: 16),
          const Text(
            'Thanh toán thành công!',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF00685F)),
          ),
          const SizedBox(height: 8),
          Text(
            'Hóa đơn: #${order.id.isEmpty ? "MOCK" : (order.code.isNotEmpty ? order.code : order.id.substring(0, 8).toUpperCase())}',
            style: const TextStyle(color: Colors.grey, fontSize: 12),
          ),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 8),
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.print, color: Colors.grey, size: 16),
              SizedBox(width: 8),
              Text('Đang in hóa đơn nhiệt qua Bluetooth...', style: TextStyle(color: Colors.grey, fontSize: 11)),
            ],
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00685F),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 44),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: onBackToPOS,
            child: const Text('Quay lại POS'),
          )
        ],
      ),
    );
  }
}
