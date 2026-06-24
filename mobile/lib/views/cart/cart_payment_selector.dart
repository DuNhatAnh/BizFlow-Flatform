import 'package:flutter/material.dart';

class CartPaymentSelector extends StatelessWidget {
  final String selectedMethod;
  final ValueChanged<String> onMethodChanged;

  const CartPaymentSelector({
    super.key,
    required this.selectedMethod,
    required this.onMethodChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _buildPaymentTab(context, 'Tiền mặt', 'Cash', Icons.money)),
        const SizedBox(width: 8),
        Expanded(child: _buildPaymentTab(context, 'Chuyển khoản', 'Transfer', Icons.qr_code)),
        const SizedBox(width: 8),
        Expanded(child: _buildPaymentTab(context, 'Ghi nợ', 'Debt', Icons.account_balance_wallet)),
      ],
    );
  }

  Widget _buildPaymentTab(BuildContext context, String label, String value, IconData icon) {
    final isSelected = selectedMethod == value;
    return GestureDetector(
      onTap: () => onMethodChanged(value),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF00685F) : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? Colors.transparent : Colors.grey.shade300),
        ),
        child: Column(
          children: [
            Icon(icon, color: isSelected ? Colors.white : const Color(0xFF00685F), size: 20),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : const Color(0xFF00685F),
                fontWeight: FontWeight.bold,
                fontSize: 11,
                fontFamily: 'Inter',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
