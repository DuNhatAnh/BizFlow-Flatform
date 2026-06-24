import 'package:flutter/material.dart';
import '../../providers/pos_provider.dart';

class CartItemsList extends StatelessWidget {
  final PosProvider provider;

  const CartItemsList({super.key, required this.provider});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: provider.cartItems.length,
      itemBuilder: (context, index) {
        final item = provider.cartItems[index];
        return Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 8),
          shape: RoundedRectangleBorder(
            side: BorderSide(color: Colors.grey.shade200),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
            child: Row(
              children: [
                // Product details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.productName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          fontFamily: 'Inter',
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${item.unitName} | Đơn giá: ${item.unitPrice.toStringAsFixed(0)}đ',
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 12,
                          fontFamily: 'Inter',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // Quantity adjuster
                Row(
                  children: [
                    GestureDetector(
                      onTap: () => provider.adjustCartQuantity(
                          item.productId, item.productUnitId, -1),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00685F).withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.remove, size: 16, color: Color(0xFF00685F)),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      '${item.quantity}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        fontFamily: 'Inter',
                      ),
                    ),
                    const SizedBox(width: 10),
                    GestureDetector(
                      onTap: () => provider.adjustCartQuantity(
                          item.productId, item.productUnitId, 1),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00685F).withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.add, size: 16, color: Color(0xFF00685F)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 12),
                // Subtotal
                Text(
                  '${item.totalPrice.toStringAsFixed(0)}đ',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    fontFamily: 'Inter',
                  ),
                ),
                const SizedBox(width: 6),
                // Trash delete icon
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: Color(0xFFBA1A1A), size: 20),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: () => provider.removeFromCart(item.productId, item.productUnitId),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
