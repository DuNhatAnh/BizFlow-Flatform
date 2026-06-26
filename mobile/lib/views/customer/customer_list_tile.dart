import 'package:flutter/material.dart';
import '../../models/models.dart';

class CustomerListTile extends StatelessWidget {
  final Customer customer;
  final VoidCallback onTap;
  final VoidCallback onCollectDebt;

  const CustomerListTile({
    super.key,
    required this.customer,
    required this.onTap,
    required this.onCollectDebt,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12, left: 16, right: 16),
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Colors.grey.shade200, width: 1),
        borderRadius: BorderRadius.circular(16),
      ),
      color: Colors.white,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: const Color(0xFF00685F).withValues(alpha: 0.1),
                child: Text(
                  customer.fullname.isNotEmpty ? customer.fullname.substring(0, 1).toUpperCase() : 'K',
                  style: const TextStyle(color: Color(0xFF00685F), fontWeight: FontWeight.bold, fontFamily: 'Inter'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      customer.fullname,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black87, fontFamily: 'Inter'),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      customer.phone ?? 'Không có SĐT',
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 12, fontFamily: 'Inter'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // Debt Info & Quick Pay Button
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  RichText(
                    text: TextSpan(
                      style: const TextStyle(fontFamily: 'Inter', fontSize: 13),
                      children: [
                        const TextSpan(text: 'Nợ: ', style: TextStyle(color: Colors.grey, fontSize: 11)),
                        TextSpan(
                          text: '${customer.totalDebt.toStringAsFixed(0)}đ',
                          style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 4),
                  if (customer.totalDebt > 0)
                    SizedBox(
                      height: 28,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2D6A4F),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                        ),
                        onPressed: onCollectDebt,
                        icon: const Icon(Icons.check_circle_outline, size: 14),
                        label: const Text('Thu nợ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'Inter')),
                      ),
                    )
                  else
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'Không nợ',
                        style: TextStyle(color: Colors.grey.shade500, fontSize: 10, fontFamily: 'Inter'),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
