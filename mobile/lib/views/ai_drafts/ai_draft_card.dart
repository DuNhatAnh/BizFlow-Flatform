import 'package:flutter/material.dart';
import '../../models/models.dart';

class AIDraftCard extends StatelessWidget {
  final Order draft;
  final String timeAgo;
  final VoidCallback onReject;
  final VoidCallback onEdit;
  final VoidCallback onConfirm;

  const AIDraftCard({
    super.key,
    required this.draft,
    required this.timeAgo,
    required this.onReject,
    required this.onEdit,
    required this.onConfirm,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Colors.grey.shade200, width: 1),
        borderRadius: BorderRadius.circular(16),
      ),
      color: Colors.white,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      decoration: const BoxDecoration(
                        color: Color(0xFFE3FFFE),
                        shape: BoxShape.circle,
                      ),
                      padding: const EdgeInsets.all(6),
                      child: const Icon(
                        Icons.auto_awesome_rounded,
                        color: Color(0xFF008080),
                        size: 16,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '#AI-${(draft.code.isNotEmpty ? draft.code : draft.id.substring(0, 5).toUpperCase())}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: Color(0xFF006565),
                        fontFamily: 'Inter',
                      ),
                    ),
                  ],
                ),
                Text(
                  timeAgo,
                  style: TextStyle(
                    color: Colors.grey.shade500,
                    fontSize: 12,
                    fontFamily: 'Inter',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Customer Row
            Row(
              children: [
                const Icon(Icons.person_outline_rounded, size: 16, color: Color(0xFF006565)),
                const SizedBox(width: 6),
                Text(
                  'Khách hàng: ',
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 13,
                    fontFamily: 'Inter',
                  ),
                ),
                Text(
                  draft.customerName ?? 'Khách Lẻ',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                    fontSize: 13,
                    fontFamily: 'Inter',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Items Table/Container
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFB),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade100),
              ),
              child: Column(
                children: draft.orderItems.map((item) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: RichText(
                            text: TextSpan(
                              style: const TextStyle(
                                color: Colors.black87,
                                fontSize: 13,
                                fontFamily: 'Inter',
                              ),
                              children: [
                                TextSpan(
                                  text: item.productName,
                                  style: const TextStyle(fontWeight: FontWeight.w500),
                                ),
                                TextSpan(
                                  text: ' x${item.quantity}',
                                  style: const TextStyle(
                                    color: Color(0xFF008080),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                TextSpan(
                                  text: ' (${item.unitName})',
                                  style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Text(
                          '${item.totalPrice.toStringAsFixed(0)}đ',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            color: Colors.black87,
                            fontFamily: 'Inter',
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 12),

            // Payment Badge and Total
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: draft.paymentMethod == 'Debt'
                        ? const Color(0xFFFFDAD6)
                        : const Color(0xFFE3FFFE),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        draft.paymentMethod == 'Debt'
                            ? Icons.account_balance_wallet_outlined
                            : Icons.payments_outlined,
                        size: 14,
                        color: draft.paymentMethod == 'Debt'
                            ? const Color(0xFFBA1A1A)
                            : const Color(0xFF006565),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        draft.paymentMethod == 'Debt' ? 'Đề xuất: Ghi nợ' : 'Đề xuất: Tiền mặt',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: draft.paymentMethod == 'Debt'
                              ? const Color(0xFFBA1A1A)
                              : const Color(0xFF006565),
                          fontFamily: 'Inter',
                        ),
                      ),
                    ],
                  ),
                ),
                RichText(
                  text: TextSpan(
                    style: const TextStyle(fontFamily: 'Inter', color: Colors.black87),
                    children: [
                      const TextSpan(text: 'Tạm tính: ', style: TextStyle(fontSize: 12, color: Colors.grey)),
                      TextSpan(
                        text: '${draft.totalAmount.toStringAsFixed(0)}đ',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: Color(0xFFDC2626),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(height: 1),
            const SizedBox(height: 16),

            // Actions Row
            Row(
              children: [
                // Cancel/Reject Button
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFDC2626),
                      side: const BorderSide(color: Color(0xFFFFDAD6)),
                      backgroundColor: const Color(0xFFFFDAD6).withValues(alpha: 0.2),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    onPressed: onReject,
                    icon: const Icon(Icons.delete_outline_rounded, size: 16),
                    label: const Text('Hủy', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 8),
                // Edit Button
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF556474),
                      side: BorderSide(color: Colors.grey.shade300),
                      backgroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    onPressed: onEdit,
                    icon: const Icon(Icons.edit_outlined, size: 16),
                    label: const Text('Sửa', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 8),
                // Confirm Button
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2D6A4F),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      elevation: 0,
                    ),
                    onPressed: onConfirm,
                    icon: const Icon(Icons.check_circle_outline_rounded, size: 16),
                    label: const Text('Xác nhận', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
