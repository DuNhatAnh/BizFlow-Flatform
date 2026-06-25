import 'package:flutter/material.dart';

class VietQROverlay extends StatelessWidget {
  final double amount;

  const VietQROverlay({super.key, required this.amount});

  @override
  Widget build(BuildContext context) {
    final note = Uri.encodeComponent("Thanh toan don hang BizFlow");
    final qrUrl = "https://img.vietqr.io/image/970436-123456789-qr_only.png?amount=${amount.toInt()}&addInfo=$note";

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          const Text(
            'Mã VietQR Chuyển khoản',
            style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00685F), fontFamily: 'Inter'),
          ),
          const SizedBox(height: 12),
          Image.network(
            qrUrl,
            height: 180,
            width: 180,
            errorBuilder: (context, error, stackTrace) {
              return Container(
                height: 180,
                width: 180,
                color: Colors.grey.shade100,
                child: const Center(
                  child: Icon(Icons.qr_code_2, size: 80, color: Colors.grey),
                ),
              );
            },
          ),
          const SizedBox(height: 8),
          const Text(
            'Nội dung: Thanh toán đơn hàng BizFlow',
            style: TextStyle(fontSize: 12, color: Colors.grey, fontFamily: 'Inter'),
          )
        ],
      ),
    );
  }
}
