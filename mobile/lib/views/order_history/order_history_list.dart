import 'package:flutter/material.dart';
import '../../models/models.dart';

class OrderHistoryList extends StatelessWidget {
  final List<Order> orders;
  final ValueChanged<Order> onTapOrder;

  const OrderHistoryList({
    super.key,
    required this.orders,
    required this.onTapOrder,
  });

  @override
  Widget build(BuildContext context) {
    if (orders.isEmpty) {
      return const Center(child: Text('Không tìm thấy đơn hàng nào trong lịch sử', style: TextStyle(fontFamily: 'Inter')));
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      itemCount: orders.length,
      itemBuilder: (context, index) {
        final order = orders[index];
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
            onTap: () => onTapOrder(order),
            title: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Đơn #${order.id.substring(0, 8).toUpperCase()}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    decoration: isCancelled ? TextDecoration.lineThrough : null,
                    fontFamily: 'Inter',
                  ),
                ),
                Text(
                  '${order.totalAmount.toStringAsFixed(0)}đ',
                  style: TextStyle(
                    color: isCancelled ? Colors.grey : Colors.redAccent,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Inter',
                  ),
                ),
              ],
            ),
            subtitle: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('$date | ${order.paymentMethod}', style: const TextStyle(fontFamily: 'Inter')),
                Text(
                  order.orderSource == 'AI_Voice'
                      ? 'AI Voice'
                      : order.orderSource == 'AI_Text'
                          ? 'AI Text'
                          : 'Thủ công',
                  style: const TextStyle(fontSize: 10, color: Colors.grey, fontFamily: 'Inter'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
