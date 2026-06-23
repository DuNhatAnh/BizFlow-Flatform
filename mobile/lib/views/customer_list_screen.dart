import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/models.dart';

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
              title: Text('Thu nợ: ${customer.fullname}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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
                            const Text('Tổng nợ hiện tại:', style: TextStyle(color: Color(0xFFBA1A1A), fontWeight: FontWeight.bold, fontSize: 13)),
                            Text('${customer.totalDebt.toStringAsFixed(0)}đ', style: const TextStyle(color: Color(0xFFBA1A1A), fontWeight: FontWeight.bold, fontSize: 16)),
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
                      ),
                      const SizedBox(height: 16),
                      const Text('Hình thức thanh toán:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: ChoiceChip(
                              label: const Center(
                                child: Text('Tiền mặt', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
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
                                child: Text('Chuyển khoản', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
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
                  child: const Text('Hủy', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
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
                  child: const Text('Xác nhận thu nợ'),
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
                  customer.fullname.substring(0, 1).toUpperCase(),
                  style: const TextStyle(color: Color(0xFF00685F), fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      customer.fullname,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87),
                    ),
                    Text(
                      customer.phone ?? 'Không có SĐT',
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 12, fontWeight: FontWeight.normal),
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
                        ),
                      ),
                      Text(
                        '${customer.totalDebt.toStringAsFixed(0)}đ',
                        style: TextStyle(
                          color: customer.totalDebt > 0 ? const Color(0xFFBA1A1A) : const Color(0xFF006565),
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Lịch sử mua hàng & nợ:',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87),
                ),
                const SizedBox(height: 8),
                const Divider(height: 1),
                const SizedBox(height: 8),
                Expanded(
                  child: customerOrders.isEmpty
                      ? const Center(child: Text('Chưa có lịch sử giao dịch nào', style: TextStyle(color: Colors.grey, fontSize: 13)))
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
                                          'Đơn #${o.id.substring(0, 8).toUpperCase()}',
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black87),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '$date | TT: ${isDebt ? "Ghi nợ" : (o.paymentMethod == "Transfer" ? "Chuyển khoản" : "Tiền mặt")}',
                                          style: TextStyle(color: Colors.grey.shade500, fontSize: 10),
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
                label: const Text('Thu nợ nhanh'),
              ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đóng', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  void _showAddCustomerBottomSheet() {
    final provider = Provider.of<PosProvider>(context, listen: false);
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final addressController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Thêm khách hàng mới',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF00685F)),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Tên khách hàng *',
                    border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
                    prefixIcon: Icon(Icons.person),
                  ),
                  validator: (value) {
                     if (value == null || value.trim().isEmpty) {
                       return 'Họ tên là bắt buộc';
                     }
                     return null;
                  },
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: phoneController,
                  decoration: const InputDecoration(
                    labelText: 'Số điện thoại *',
                    border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
                    prefixIcon: Icon(Icons.phone),
                    hintText: 'Ví dụ: 0912345678',
                  ),
                  keyboardType: TextInputType.phone,
                  validator: (value) {
                     if (value == null || value.trim().isEmpty) {
                       return 'Số điện thoại là bắt buộc';
                     }
                     final phoneRegex = RegExp(r'^(0[3|5|7|8|9])[0-9]{8}$');
                     if (!phoneRegex.hasMatch(value.trim())) {
                       return 'Số điện thoại Việt Nam không hợp lệ (10 số)';
                     }
                     return null;
                  },
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: addressController,
                  decoration: const InputDecoration(
                    labelText: 'Địa chỉ (Tùy chọn)',
                    border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
                    prefixIcon: Icon(Icons.location_on),
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00685F),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () async {
                    if (!formKey.currentState!.validate()) return;

                    // Show loading overlay
                    showDialog(
                      context: context,
                      barrierDismissible: false,
                      builder: (context) => const Center(child: CircularProgressIndicator()),
                    );

                    final cust = await provider.createCustomer(
                      nameController.text.trim(),
                      phoneController.text.trim(),
                    );

                    if (context.mounted) {
                      Navigator.pop(context); // Pop loading
                      Navigator.pop(context); // Close bottom sheet
                      
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
                    }
                  },
                  child: const Text('Lưu thông tin', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
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
        // Search bar & plus button Row
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.grey.shade200),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.03),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      )
                    ],
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) {
                      setState(() {
                        _searchQuery = val;
                      });
                    },
                    decoration: const InputDecoration(
                      hintText: 'Tìm kiếm khách hàng theo tên, SĐT...',
                      hintStyle: TextStyle(color: Colors.grey, fontSize: 13),
                      prefixIcon: Icon(Icons.search, color: Color(0xFF00685F)),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Container(
                decoration: const BoxDecoration(
                  color: Color(0xFF00685F),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: const Icon(Icons.add, color: Colors.white),
                  onPressed: _showAddCustomerBottomSheet,
                ),
              ),
            ],
          ),
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
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.only(bottom: 16),
                      itemCount: filteredList.length,
                      itemBuilder: (context, index) {
                        final cust = filteredList[index];
                        return Card(
                          elevation: 0,
                          margin: const EdgeInsets.only(bottom: 12, left: 16, right: 16),
                          shape: RoundedRectangleBorder(
                            side: BorderSide(color: Colors.grey.shade200, width: 1),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          color: Colors.white,
                          child: InkWell(
                            onTap: () => _showCustomerDetail(cust),
                            borderRadius: BorderRadius.circular(16),
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: const Color(0xFF00685F).withValues(alpha: 0.1),
                                    child: Text(
                                      cust.fullname.substring(0, 1).toUpperCase(),
                                      style: const TextStyle(color: Color(0xFF00685F), fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          cust.fullname,
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black87),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          cust.phone ?? 'Không có SĐT',
                                          style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
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
                                              text: '${cust.totalDebt.toStringAsFixed(0)}đ',
                                              style: const TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.bold),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      if (cust.totalDebt > 0)
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
                                            onPressed: () => _showCollectDebtDialog(cust),
                                            icon: const Icon(Icons.check_circle_outline, size: 14),
                                            label: const Text('Thu nợ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
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
                                            style: TextStyle(color: Colors.grey.shade500, fontSize: 10),
                                          ),
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
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
        title: const Text('Danh sách khách hàng', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF00685F),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: content,
    );
  }
}
