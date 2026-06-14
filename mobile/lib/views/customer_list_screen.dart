import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/models.dart';

class CustomerListScreen extends StatefulWidget {
  const CustomerListScreen({super.key});

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
    String method = 'Cash'; // Cash | Transfer
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: Text('Thu nợ: ${customer.fullname}', style: const TextStyle(fontWeight: FontWeight.bold)),
              content: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tổng nợ hiện tại: ${customer.totalDebt.toStringAsFixed(0)}đ',
                      style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: amountController,
                      decoration: const InputDecoration(
                        labelText: 'Số tiền thu nợ *',
                        border: OutlineInputBorder(),
                        suffixText: 'đ',
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Nhập số tiền thu nợ';
                        }
                        final amt = double.tryParse(value);
                        if (amt == null || amt <= 0) {
                          return 'Số tiền phải lớn hơn 0';
                        }
                        if (amt > customer.totalDebt) {
                          return 'Không thể thu nhiều hơn số nợ';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    const Text('Hình thức trả nợ:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Expanded(
                          child: ChoiceChip(
                            label: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [Icon(Icons.money, size: 16), SizedBox(width: 4), Text('Tiền mặt')],
                            ),
                            selected: method == 'Cash',
                            onSelected: (val) {
                              if (val) setDialogState(() => method = 'Cash');
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ChoiceChip(
                            label: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [Icon(Icons.qr_code, size: 16), SizedBox(width: 4), Text('Chuyển khoản')],
                            ),
                            selected: method == 'Transfer',
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
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Hủy'),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00685F),
                    foregroundColor: Colors.white,
                  ),
                  onPressed: () async {
                    if (!formKey.currentState!.validate()) return;

                    final amount = double.parse(amountController.text);
                    final success = await provider.collectDebt(customer.id, amount, method);

                    if (context.mounted) {
                      Navigator.pop(context);
                      if (success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Đã thu nợ ${amount.toStringAsFixed(0)}đ từ ${customer.fullname}'),
                            backgroundColor: const Color(0xFF00F5D4),
                          ),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Lỗi khi ghi nhận thu nợ'), backgroundColor: Colors.red),
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

    // Filter orders and debt transactions relating to this customer
    final customerOrders = provider.orders.where((o) => o.customerId == customer.id).toList();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(customer.fullname, style: const TextStyle(fontWeight: FontWeight.bold)),
          content: SizedBox(
            width: double.maxFinite,
            height: 350,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('SĐT: ${customer.phone ?? "Không có"}', style: const TextStyle(color: Colors.grey)),
                    Text(
                      'Tổng nợ: ${customer.totalDebt.toStringAsFixed(0)}đ',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red, fontSize: 16),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text('Lịch sử mua hàng & thanh toán:', style: TextStyle(fontWeight: FontWeight.bold)),
                const Divider(),
                Expanded(
                  child: customerOrders.isEmpty
                      ? const Center(child: Text('Chưa có giao dịch nào'))
                      : ListView.builder(
                          itemCount: customerOrders.length,
                          itemBuilder: (context, index) {
                            final o = customerOrders[index];
                            final date = "${o.createdAt.day}/${o.createdAt.month} ${o.createdAt.hour}:${o.createdAt.minute}";
                            final isDebt = o.paymentMethod == 'Debt';

                            return ListTile(
                              contentPadding: EdgeInsets.zero,
                              leading: Icon(
                                isDebt ? Icons.assignment_late : Icons.assignment_turned_in,
                                color: isDebt ? Colors.redAccent : Colors.teal,
                              ),
                              title: Text('Đơn #${o.id.substring(0, 8).toUpperCase()}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              subtitle: Text('$date | TT: ${o.paymentMethod}', style: const TextStyle(fontSize: 11)),
                              trailing: Text(
                                '${o.totalAmount.toStringAsFixed(0)}đ',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
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
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
                onPressed: () {
                  Navigator.pop(context);
                  _showCollectDebtDialog(customer);
                },
                child: const Text('Thu nợ'),
              ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đóng'),
            ),
          ],
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

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        title: const Text('Danh sách khách hàng', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF00685F),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          // Search box
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 5, offset: const Offset(0, 2))],
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (val) {
                  setState(() {
                    _searchQuery = val;
                  });
                },
                decoration: const InputDecoration(
                  hintText: 'Tìm khách hàng theo tên hoặc SĐT...',
                  prefixIcon: Icon(Icons.search, color: Colors.grey),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ),

          // Customers List
          Expanded(
            child: provider.isLoading && provider.customers.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : filteredList.isEmpty
                    ? const Center(child: Text('Không tìm thấy khách hàng nào'))
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        itemCount: filteredList.length,
                        itemBuilder: (context, index) {
                          final cust = filteredList[index];
                          return Card(
                            elevation: 0,
                            margin: const EdgeInsets.only(bottom: 8),
                            shape: RoundedRectangleBorder(
                              side: BorderSide(color: Colors.grey.shade200),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: ListTile(
                              onTap: () => _showCustomerDetail(cust),
                              leading: CircleAvatar(
                                backgroundColor: const Color(0xFF00685F).withValues(alpha: 0.1),
                                child: Text(cust.fullname.substring(0, 1).toUpperCase(), style: const TextStyle(color: Color(0xFF00685F))),
                              ),
                              title: Text(cust.fullname, style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text(cust.phone ?? 'Không có số điện thoại'),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    '${cust.totalDebt.toStringAsFixed(0)}đ',
                                    style: TextStyle(
                                      color: cust.totalDebt > 0 ? Colors.redAccent : Colors.grey,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                  ),
                                  if (cust.totalDebt > 0)
                                    const Text('Đang nợ', style: TextStyle(color: Colors.redAccent, fontSize: 10)),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

