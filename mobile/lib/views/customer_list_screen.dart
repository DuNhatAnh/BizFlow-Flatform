import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/models.dart';
import 'customer/customer_search_field.dart';
import 'customer/customer_list_tile.dart';
import 'customer/add_customer_modal.dart';

class CustomerListScreen extends StatefulWidget {
  final bool isEmbedded;
  const CustomerListScreen({super.key, this.isEmbedded = false});

  @override
  State<CustomerListScreen> createState() => _CustomerListScreenState();
}

class _CustomerListScreenState extends State<CustomerListScreen> {
  String _searchQuery = '';
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PosProvider>(context, listen: false).loadPOSData();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showCollectDebtDialog(Customer customer) {
    final provider = Provider.of<PosProvider>(context, listen: false);
    final amountController = TextEditingController(text: customer.totalDebt.toStringAsFixed(0));
    final noteController = TextEditingController();
    String method = 'Cash'; // Cash | Transfer
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Text('Thu nợ: ${customer.fullname}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, fontFamily: 'Inter')),
              content: Form(
                key: formKey,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFDAD6),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Tổng nợ hiện tại:', style: TextStyle(color: Color(0xFFBA1A1A), fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'Inter')),
                            Text('${customer.totalDebt.toStringAsFixed(0)}đ', style: const TextStyle(color: Color(0xFFBA1A1A), fontWeight: FontWeight.bold, fontSize: 16, fontFamily: 'Inter')),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: amountController,
                        decoration: const InputDecoration(
                          labelText: 'Số tiền thu nợ *',
                          border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
                          suffixText: 'đ',
                        ),
                        style: const TextStyle(fontFamily: 'Inter'),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Vui lòng nhập số tiền thu nợ';
                          }
                          final amt = double.tryParse(value.trim());
                          if (amt == null) {
                            return 'Số tiền phải là chữ số';
                          }
                          if (amt <= 0) {
                            return 'Số tiền phải lớn hơn 0';
                          }
                          if (amt > customer.totalDebt) {
                            return 'Không thể thu nhiều hơn số nợ hiện tại (${customer.totalDebt.toStringAsFixed(0)}đ)';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: noteController,
                        decoration: const InputDecoration(
                          labelText: 'Ghi chú (Tùy chọn)',
                          border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
                          hintText: 'Ví dụ: Trả nợ xi măng...',
                        ),
                        style: const TextStyle(fontFamily: 'Inter'),
                      ),
                      const SizedBox(height: 16),
                      const Text('Hình thức thanh toán:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87, fontFamily: 'Inter')),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: ChoiceChip(
                              label: const Center(
                                child: Text('Tiền mặt', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'Inter')),
                              ),
                              selected: method == 'Cash',
                              selectedColor: const Color(0xFF00685F),
                              disabledColor: Colors.grey.shade100,
                              labelStyle: TextStyle(
                                color: method == 'Cash' ? Colors.white : const Color(0xFF00685F),
                              ),
                              onSelected: (val) {
                                if (val) setDialogState(() => method = 'Cash');
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: ChoiceChip(
                              label: const Center(
                                child: Text('Chuyển khoản', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'Inter')),
                              ),
                              selected: method == 'Transfer',
                              selectedColor: const Color(0xFF00685F),
                              disabledColor: Colors.grey.shade100,
                              labelStyle: TextStyle(
                                color: method == 'Transfer' ? Colors.white : const Color(0xFF00685F),
                              ),
                              onSelected: (val) {
                                if (val) setDialogState(() => method = 'Transfer');
                              },
                            ),
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
                  child: const Text('Hủy', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontFamily: 'Inter')),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2D6A4F),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () async {
                    if (!formKey.currentState!.validate()) return;

                    final amount = double.parse(amountController.text.trim());

                    // Show loading overlay
                    showDialog(
                      context: context,
                      barrierDismissible: false,
                      builder: (context) => const Center(child: CircularProgressIndicator()),
                    );

                    final success = await provider.collectDebt(customer.id, amount, method);

                    if (context.mounted) {
                      Navigator.pop(context); // Pop loading
                      Navigator.pop(context); // Pop dialog
                      
                      if (success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Row(
                              children: [
                                const Icon(Icons.check_circle, color: Colors.white),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text('Thu nợ thành công cho khách ${customer.fullname}. Đang in biên nhận thu tiền...'),
                                ),
                              ],
                            ),
                            backgroundColor: const Color(0xFF2D6A4F),
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Lỗi khi ghi nhận thu nợ'), backgroundColor: Colors.red, behavior: SnackBarBehavior.floating),
                        );
                      }
                    }
                  },
                  child: const Text('Xác nhận thu nợ', style: TextStyle(fontFamily: 'Inter')),
                )
              ],
            );
          },
        );
      },
    );
  }

  void _showCustomerDetail(Customer customer) {
    final provider = Provider.of<PosProvider>(context, listen: false);
    final customerOrders = provider.orders.where((o) => o.customerId == customer.id).toList();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
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
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87, fontFamily: 'Inter'),
                    ),
                    Text(
                      customer.phone ?? 'Không có SĐT',
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 12, fontWeight: FontWeight.normal, fontFamily: 'Inter'),
                    ),
                  ],
                ),
              ),
            ],
          ),
          content: SizedBox(
            width: double.maxFinite,
            height: 380,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: customer.totalDebt > 0 ? const Color(0xFFFFDAD6) : const Color(0xFFE3FFFE),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Tình trạng nợ:',
                        style: TextStyle(
                          color: customer.totalDebt > 0 ? const Color(0xFFBA1A1A) : const Color(0xFF006565),
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          fontFamily: 'Inter',
                        ),
                      ),
                      Text(
                        '${customer.totalDebt.toStringAsFixed(0)}đ',
                        style: TextStyle(
                          color: customer.totalDebt > 0 ? const Color(0xFFBA1A1A) : const Color(0xFF006565),
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          fontFamily: 'Inter',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Lịch sử mua hàng & nợ:',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87, fontFamily: 'Inter'),
                ),
                const SizedBox(height: 8),
                const Divider(height: 1),
                const SizedBox(height: 8),
                Expanded(
                  child: customerOrders.isEmpty
                      ? const Center(child: Text('Chưa có lịch sử giao dịch nào', style: TextStyle(color: Colors.grey, fontSize: 13, fontFamily: 'Inter')))
                      : ListView.builder(
                          itemCount: customerOrders.length,
                          itemBuilder: (context, index) {
                            final o = customerOrders[index];
                            final date = "${o.createdAt.day}/${o.createdAt.month}/${o.createdAt.year} ${o.createdAt.hour.toString().padLeft(2, '0')}:${o.createdAt.minute.toString().padLeft(2, '0')}";
                            final isDebt = o.paymentMethod == 'Debt';

                            return Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFB),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.grey.shade100),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    isDebt ? Icons.assignment_late_outlined : Icons.assignment_turned_in_outlined,
                                    color: isDebt ? const Color(0xFFBA1A1A) : const Color(0xFF2D6A4F),
                                    size: 20,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Đơn #${(o.code.isNotEmpty ? o.code : o.id.substring(0, 8).toUpperCase())}',
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black87, fontFamily: 'Inter'),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '$date | TT: ${isDebt ? "Ghi nợ" : (o.paymentMethod == "Transfer" ? "Chuyển khoản" : "Tiền mặt")}',
                                          style: TextStyle(color: Colors.grey.shade500, fontSize: 10, fontFamily: 'Inter'),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Text(
                                    '${o.totalAmount.toStringAsFixed(0)}đ',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                      color: isDebt ? const Color(0xFFBA1A1A) : Colors.black87,
                                      fontFamily: 'Inter',
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                )
              ],
            ),
          ),
          actions: [
            if (customer.totalDebt > 0)
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2D6A4F),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () {
                  Navigator.pop(context);
                  _showCollectDebtDialog(customer);
                },
                icon: const Icon(Icons.payments_outlined, size: 16),
                label: const Text('Thu nợ nhanh', style: TextStyle(fontFamily: 'Inter')),
              ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đóng', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontFamily: 'Inter')),
            ),
          ],
        );
      },
    );
  }

  void _showAddCustomerBottomSheet() {
    final provider = Provider.of<PosProvider>(context, listen: false);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return AddCustomerModal(
          provider: provider,
          onSaved: (cust) {
            if (cust != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Row(
                    children: [
                      const Icon(Icons.check_circle, color: Colors.white),
                      const SizedBox(width: 8),
                      Expanded(child: Text('Đã thêm khách hàng mới thành công: ${cust.fullname}')),
                    ],
                  ),
                  backgroundColor: const Color(0xFF2D6A4F),
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              );
            }
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<PosProvider>(context);

    final filteredList = provider.customers.where((c) {
      return c.fullname.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (c.phone != null && c.phone!.contains(_searchQuery));
    }).toList();

    final content = Column(
      children: [
        // Search bar & plus button (Modular Component)
        CustomerSearchField(
          searchController: _searchController,
          onChanged: (val) {
            setState(() {
              _searchQuery = val;
            });
          },
          onAddPressed: _showAddCustomerBottomSheet,
        ),

        // Customers List
        Expanded(
          child: provider.isLoading && provider.customers.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : filteredList.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.people_outline_rounded, size: 48, color: Colors.grey.shade400),
                          const SizedBox(height: 12),
                          Text(
                            'Không tìm thấy khách hàng nào',
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 14, fontFamily: 'Inter'),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.only(bottom: 16),
                      itemCount: filteredList.length,
                      itemBuilder: (context, index) {
                        final cust = filteredList[index];
                        return CustomerListTile(
                          customer: cust,
                          onTap: () => _showCustomerDetail(cust),
                          onCollectDebt: () => _showCollectDebtDialog(cust),
                        );
                      },
                    ),
        ),
      ],
    );

    if (widget.isEmbedded) {
      return Container(
        color: const Color(0xFFF7F9FB),
        child: content,
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        title: const Text('Danh sách khách hàng', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontFamily: 'Inter')),
        backgroundColor: const Color(0xFF00685F),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: content,
    );
  }
}
