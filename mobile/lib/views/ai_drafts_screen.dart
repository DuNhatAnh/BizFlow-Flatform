import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/models.dart';

class AIDraftsScreen extends StatefulWidget {
  const AIDraftsScreen({super.key});

  @override
  State<AIDraftsScreen> createState() => _AIDraftsScreenState();
}

class _AIDraftsScreenState extends State<AIDraftsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PosProvider>(context, listen: false).loadPOSData();
    });
  }

  void _showReviewDialog(Order draft) {
    final provider = Provider.of<PosProvider>(context, listen: false);

    // Create a mutable copy of items for edit simulation
    List<OrderItem> editableItems = List.from(draft.orderItems);
    Customer? selectedCustomer = provider.customers.firstWhere(
      (c) => c.id == draft.customerId,
      orElse: () => Customer(id: '', tenantId: draft.tenantId, fullname: 'Khách Lẻ', totalDebt: 0.0),
    );
    String paymentMethod = draft.paymentMethod;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            double draftTotal = editableItems.fold(0.0, (sum, i) => sum + i.totalPrice);

            return AlertDialog(
              title: const Row(
                children: [
                  Icon(Icons.auto_awesome, color: Color(0xFF00F5D4)),
                  SizedBox(width: 8),
                  Text('Duyệt đơn hàng AI', style: TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
              content: SizedBox(
                width: double.maxFinite,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Customer select info
                      const Text('Khách hàng được gán:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      const SizedBox(height: 4),
                      DropdownButton<String>(
                        isExpanded: true,
                        value: selectedCustomer?.id.isEmpty ?? true ? '' : selectedCustomer!.id,
                        items: [
                          const DropdownMenuItem(value: '', child: Text('Khách Lẻ')),
                          ...provider.customers.map((c) => DropdownMenuItem(value: c.id, child: Text(c.fullname))),
                        ],
                        onChanged: (val) {
                          setDialogState(() {
                            if (val == null || val.isEmpty) {
                              selectedCustomer = null;
                            } else {
                              selectedCustomer = provider.customers.firstWhere((c) => c.id == val);
                            }
                          });
                        },
                      ),
                      const SizedBox(height: 12),

                      // Payment Method
                      const Text('Phương thức thanh toán:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      const SizedBox(height: 4),
                      SegmentedButton<String>(
                        segments: const [
                          ButtonSegment<String>(value: 'Cash', label: Text('Tiền mặt')),
                          ButtonSegment<String>(value: 'Debt', label: Text('Ghi nợ')),
                        ],
                        selected: {paymentMethod},
                        onSelectionChanged: (Set<String> newSelection) {
                          setDialogState(() {
                            paymentMethod = newSelection.first;
                          });
                        },
                      ),
                      const SizedBox(height: 16),

                      const Text('Chi tiết sản phẩm:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      const Divider(),

                      ...List.generate(editableItems.length, (index) {
                        final item = editableItems[index];
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  '${item.productName} (${item.unitName})',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                              ),
                              Row(
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.remove, size: 18),
                                    onPressed: () {
                                      setDialogState(() {
                                        if (item.quantity > 1) {
                                          editableItems[index] = OrderItem(
                                            productId: item.productId,
                                            productUnitId: item.productUnitId,
                                            productName: item.productName,
                                            unitName: item.unitName,
                                            quantity: item.quantity - 1,
                                            unitPrice: item.unitPrice,
                                            totalPrice: item.unitPrice * (item.quantity - 1),
                                          );
                                        } else {
                                          editableItems.removeAt(index);
                                        }
                                      });
                                    },
                                  ),
                                  Text('${item.quantity}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                  IconButton(
                                    icon: const Icon(Icons.add, size: 18),
                                    onPressed: () {
                                      setDialogState(() {
                                        editableItems[index] = OrderItem(
                                          productId: item.productId,
                                          productUnitId: item.productUnitId,
                                          productName: item.productName,
                                          unitName: item.unitName,
                                          quantity: item.quantity + 1,
                                          unitPrice: item.unitPrice,
                                          totalPrice: item.unitPrice * (item.quantity + 1),
                                        );
                                      });
                                    },
                                  ),
                                ],
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '${item.totalPrice.toStringAsFixed(0)}đ',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              )
                            ],
                          ),
                        );
                      }),

                      const Divider(),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Tổng tiền đơn duyệt:', style: TextStyle(fontWeight: FontWeight.bold)),
                          Text(
                            '${draftTotal.toStringAsFixed(0)}đ',
                            style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 18),
                          ),
                        ],
                      )
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Hủy'),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00685F), foregroundColor: Colors.white),
                  onPressed: () async {
                    if (paymentMethod == 'Debt' && (selectedCustomer == null || selectedCustomer!.id.isEmpty)) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Vui lòng chọn khách hàng đăng ký để thực hiện ghi nợ'), backgroundColor: Colors.red),
                      );
                      return;
                    }

                    final updatedOrder = Order(
                      id: draft.id,
                      tenantId: draft.tenantId,
                      customerId: selectedCustomer?.id.isEmpty ?? true ? null : selectedCustomer!.id,
                      createdBy: draft.createdBy,
                      totalAmount: draftTotal,
                      paymentMethod: paymentMethod,
                      status: 'Completed',
                      orderSource: draft.orderSource,
                      createdAt: draft.createdAt,
                      orderItems: editableItems,
                    );

                    final success = await provider.confirmAIDraft(draft.id, updatedOrder);
                    if (context.mounted) {
                      Navigator.pop(context);
                      if (success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Đơn hàng AI đã được thanh toán & in hóa đơn thành công!')),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(provider.errorMessage ?? 'Không thể duyệt đơn nháp này')),
                        );
                      }
                    }
                  },
                  child: const Text('Xác nhận & In bill'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<PosProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        title: const Text('Đơn hàng AI chờ duyệt', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF00685F),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: provider.drafts.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.auto_awesome, color: Colors.grey, size: 60),
                  SizedBox(height: 12),
                  Text('Không có đơn hàng nháp AI nào chờ duyệt', style: TextStyle(color: Colors.grey)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: provider.drafts.length,
              itemBuilder: (context, index) {
                final draft = provider.drafts[index];
                final timeAgo = "${DateTime.now().difference(draft.createdAt).inMinutes} phút trước";

                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    side: BorderSide(color: Colors.grey.shade200),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              draft.customerName ?? 'Khách Lẻ',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF00685F)),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF00F5D4).withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                draft.orderSource == 'AI_Voice' ? 'Giọng nói AI' : 'Văn bản AI',
                                style: const TextStyle(
                                  color: Color(0xFF00685F),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Sản phẩm: ${draft.orderItems.map((i) => "${i.productName} x${i.quantity}").join(", ")}',
                          style: TextStyle(color: Colors.grey.shade700, fontSize: 13),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Được tạo: $timeAgo',
                              style: const TextStyle(fontSize: 11, color: Colors.grey),
                            ),
                            Text(
                              '${draft.totalAmount.toStringAsFixed(0)}đ',
                              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.redAccent),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Divider(height: 1),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            OutlinedButton(
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.red,
                                side: const BorderSide(color: Colors.red),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              onPressed: () async {
                                final success = await provider.rejectAIDraft(draft.id);
                                if (context.mounted && success) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Đã hủy đơn hàng nháp AI')),
                                  );
                                }
                              },
                              child: const Text('Từ chối'),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF00685F),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              onPressed: () => _showReviewDialog(draft),
                              child: const Text('Duyệt đơn'),
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

