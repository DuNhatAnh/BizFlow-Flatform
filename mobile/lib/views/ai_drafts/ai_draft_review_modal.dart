import 'package:flutter/material.dart';
import '../../providers/pos_provider.dart';
import '../../models/models.dart';

class AIDraftReviewModal extends StatefulWidget {
  final Order draft;
  final PosProvider provider;

  const AIDraftReviewModal({
    super.key,
    required this.draft,
    required this.provider,
  });

  @override
  State<AIDraftReviewModal> createState() => _AIDraftReviewModalState();
}

class _AIDraftReviewModalState extends State<AIDraftReviewModal> {
  late List<OrderItem> editableItems;
  Customer? selectedCustomer;
  late String paymentMethod;

  @override
  void initState() {
    super.initState();
    editableItems = List.from(widget.draft.orderItems);
    selectedCustomer = widget.provider.customers.firstWhere(
      (c) => c.id == widget.draft.customerId,
      orElse: () => Customer(id: '', tenantId: widget.draft.tenantId, fullname: 'Khách Lẻ', totalDebt: 0.0, debtLimit: 10000000.0),
    );
    if (selectedCustomer?.id == '') {
      selectedCustomer = null;
    }
    paymentMethod = widget.draft.paymentMethod;
  }

  @override
  Widget build(BuildContext context) {
    double draftTotal = editableItems.fold(0.0, (sum, i) => sum + i.totalPrice);

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: const Row(
        children: [
          Icon(Icons.auto_awesome, color: Color(0xFF00CED1)),
          SizedBox(width: 8),
          Text('Duyệt đơn hàng AI', style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Inter')),
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
              const Text('Khách hàng được gán:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, fontFamily: 'Inter')),
              const SizedBox(height: 4),
              DropdownButton<String>(
                isExpanded: true,
                value: selectedCustomer == null ? '' : selectedCustomer!.id,
                items: [
                  const DropdownMenuItem(value: '', child: Text('Khách Lẻ', style: TextStyle(fontFamily: 'Inter'))),
                  ...widget.provider.customers.map((c) => DropdownMenuItem(value: c.id, child: Text(c.fullname, style: const TextStyle(fontFamily: 'Inter')))),
                ],
                onChanged: (val) {
                  setState(() {
                    if (val == null || val.isEmpty) {
                      selectedCustomer = null;
                    } else {
                      selectedCustomer = widget.provider.customers.firstWhere((c) => c.id == val);
                    }
                  });
                },
              ),
              const SizedBox(height: 12),

              // Payment Method
              const Text('Phương thức thanh toán:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, fontFamily: 'Inter')),
              const SizedBox(height: 4),
              RadioGroup<String>(
                groupValue: paymentMethod,
                onChanged: (val) {
                  if (val != null) {
                    setState(() => paymentMethod = val);
                  }
                },
                child: const Row(
                  children: [
                    Expanded(
                      child: RadioListTile<String>(
                        title: Text('Mặt', style: TextStyle(fontSize: 12, fontFamily: 'Inter')),
                        value: 'Cash',
                      ),
                    ),
                    Expanded(
                      child: RadioListTile<String>(
                        title: Text('Nợ', style: TextStyle(fontSize: 12, fontFamily: 'Inter')),
                        value: 'Debt',
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              const Text('Chi tiết sản phẩm:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, fontFamily: 'Inter')),
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
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'Inter'),
                        ),
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove, size: 18),
                            onPressed: () {
                              setState(() {
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
                          Text('${item.quantity}', style: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Inter')),
                          IconButton(
                            icon: const Icon(Icons.add, size: 18),
                            onPressed: () {
                              setState(() {
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
                        style: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Inter'),
                      )
                    ],
                  ),
                );
              }),

              const Divider(),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Tổng tiền đơn duyệt:', style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Inter')),
                  Text(
                    '${draftTotal.toStringAsFixed(0)}đ',
                    style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 18, fontFamily: 'Inter'),
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
          child: const Text('Hủy', style: TextStyle(fontFamily: 'Inter', color: Colors.grey)),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF00685F),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          onPressed: () async {
            if (paymentMethod == 'Debt' && (selectedCustomer == null || selectedCustomer!.id.isEmpty)) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Vui lòng chọn khách hàng đăng ký để thực hiện ghi nợ'),
                  backgroundColor: Colors.red,
                ),
              );
              return;
            }

            final updatedOrder = Order(
              id: widget.draft.id,
              tenantId: widget.draft.tenantId,
              customerId: selectedCustomer?.id.isEmpty ?? true ? null : selectedCustomer!.id,
              createdBy: widget.draft.createdBy,
              totalAmount: draftTotal,
              paymentMethod: paymentMethod,
              status: 'Completed',
              orderSource: widget.draft.orderSource,
              createdAt: widget.draft.createdAt,
              orderItems: editableItems,
            );

            final success = await widget.provider.confirmAIDraft(widget.draft.id, updatedOrder);
            if (context.mounted) {
              Navigator.pop(context);
              if (success) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Đơn hàng AI đã được thanh toán & in hóa đơn thành công!')),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(widget.provider.errorMessage ?? 'Không thể duyệt đơn nháp này')),
                );
              }
            }
          },
          child: const Text('Xác nhận & In bill', style: TextStyle(fontFamily: 'Inter')),
        ),
      ],
    );
  }
}
