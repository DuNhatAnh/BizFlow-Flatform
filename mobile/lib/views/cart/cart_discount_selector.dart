import 'package:flutter/material.dart';

class CartDiscountSelector extends StatelessWidget {
  final TextEditingController discountController;
  final bool isPercentDiscount;
  final ValueChanged<double> onDiscountChanged;
  final ValueChanged<bool> onTypeChanged;

  const CartDiscountSelector({
    super.key,
    required this.discountController,
    required this.isPercentDiscount,
    required this.onDiscountChanged,
    required this.onTypeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Text(
          'Giảm giá:',
          style: TextStyle(color: Colors.grey, fontSize: 13, fontFamily: 'Inter'),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: SizedBox(
            height: 38,
            child: TextField(
              controller: discountController,
              keyboardType: TextInputType.number,
              style: const TextStyle(fontSize: 13, fontFamily: 'Inter'),
              decoration: InputDecoration(
                hintText: 'Nhập số tiền hoặc %',
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Color(0xFF00685F), width: 1.5),
                ),
              ),
              onChanged: (val) {
                final double amount = double.tryParse(val) ?? 0.0;
                onDiscountChanged(amount);
              },
            ),
          ),
        ),
        const SizedBox(width: 8),
        Container(
          height: 38,
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey.shade300),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              GestureDetector(
                onTap: () => onTypeChanged(false),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: !isPercentDiscount ? const Color(0xFF00685F) : Colors.transparent,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(7),
                      bottomLeft: Radius.circular(7),
                    ),
                  ),
                  child: Text(
                    'đ',
                    style: TextStyle(
                      color: !isPercentDiscount ? Colors.white : const Color(0xFF00685F),
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Inter',
                    ),
                  ),
                ),
              ),
              GestureDetector(
                onTap: () => onTypeChanged(true),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isPercentDiscount ? const Color(0xFF00685F) : Colors.transparent,
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(7),
                      bottomRight: Radius.circular(7),
                    ),
                  ),
                  child: Text(
                    '%',
                    style: TextStyle(
                      color: isPercentDiscount ? Colors.white : const Color(0xFF00685F),
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Inter',
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
