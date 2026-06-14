import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/models.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  String _paymentMethod = 'Cash'; // Cash | Transfer | Debt
  String _customerSearchQuery = '';
  bool _isSearchingCustomer = false;

  void _showAddCustomerDialog() {
    final provider = Provider.of<PosProvider>(context, listen: false);
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Thêm nhanh khách hàng', style: TextStyle(fontWeight: FontWeight.bold)),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Họ tên *',
                    border: OutlineInputBorder(),
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
                    labelText: 'Số điện thoại',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.phone,
                ),
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

                final cust = await provider.createCustomer(
                  nameController.text.trim(),
                  phoneController.text.trim().isEmpty ? null : phoneController.text.trim(),
                );

                if (context.mounted) {
                  Navigator.pop(context);
                  if (cust != null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Đã thêm khách hàng ${cust.fullname}')),
                    );
                  }
                }
              },
              child: const Text('Đăng ký'),
            ),
          ],
        );
      },
    );
  }

  void _showCustomerSelectionSheet() {
    final provider = Provider.of<PosProvider>(context, listen: false);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            final filteredList = provider.customers.where((c) {
              return c.fullname.toLowerCase().contains(_customerSearchQuery.toLowerCase()) ||
                  (c.phone != null && c.phone!.contains(_customerSearchQuery));
            }).toList();

            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Chọn khách hàng', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                      IconButton(
                        icon: const Icon(Icons.person_add_alt_1, color: Color(0xFF00685F)),
                        onPressed: () {
                          Navigator.pop(context);
                          _showAddCustomerDialog();
                        },
                      )
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    decoration: const InputDecoration(
                      hintText: 'Tìm theo tên hoặc số điện thoại...',
                      prefixIcon: Icon(Icons.search),
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (val) {
                      setSheetState(() {
                        _customerSearchQuery = val;
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 250,
                    child: filteredList.isEmpty
                        ? const Center(child: Text('Không tìm thấy khách hàng nào'))
                        : ListView.builder(
                            itemCount: filteredList.length,
                            itemBuilder: (context, index) {
                              final cust = filteredList[index];
                              return ListTile(
                                leading: const CircleAvatar(child: Icon(Icons.person)),
                                title: Text(cust.fullname, style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text(cust.phone ?? 'Không có SĐT'),
                                trailing: Text(
                                  'Nợ: ${cust.totalDebt.toStringAsFixed(0)}đ',
                                  style: TextStyle(color: cust.totalDebt > 0 ? Colors.red : Colors.grey, fontSize: 12),
                                ),
                                onTap: () {
                                  provider.selectCustomer(cust);
                                  Navigator.pop(context);
                                },
                              );
                            },
                          ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _handleCheckout() async {
    final provider = Provider.of<PosProvider>(context, listen: false);

    if (_paymentMethod == 'Debt' && provider.selectedCustomer == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng chọn khách hàng đăng ký để thực hiện ghi nợ'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    try {
      final order = await provider.checkout(_paymentMethod);
      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => _buildSuccessDialog(order),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll("Exception: ", "")),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Widget _buildSuccessDialog(Order order) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle, color: Color(0xFF00F5D4), size: 80),
          const SizedBox(height: 16),
          const Text(
            'Thanh toán thành công!',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF00685F)),
          ),
          const SizedBox(height: 8),
          Text(
            'Hóa đơn: #${order.id.substring(0, 8).toUpperCase()}',
            style: const TextStyle(color: Colors.grey, fontSize: 12),
          ),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 8),
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.print, color: Colors.grey, size: 16),
              SizedBox(width: 8),
              Text('Đang in hóa đơn nhiệt qua Bluetooth...', style: TextStyle(color: Colors.grey, fontSize: 11)),
            ],
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00685F),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 44),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              Navigator.pop(context); // Pop dialog
              Navigator.pop(context); // Pop cart screen to POS Screen
            },
            child: const Text('Quay lại POS'),
          )
        ],
      ),
    );
  }

  Widget _buildVietQR(double amount) {
    // Generates a mock VietQR image for demonstration
    final note = Uri.encodeComponent("Thanh toan don hang BizFlow");
    final qrUrl = "https://img.vietqr.io/image/970436-123456789-qr_only.png?amount=${amount.toInt()}&addInfo=$note";

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          const Text(
            'Mã VietQR Chuyển khoản',
            style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00685F)),
          ),
          const SizedBox(height: 12),
          Image.network(
            qrUrl,
            height: 180,
            width: 180,
            errorBuilder: (context, error, stackTrace) {
              return Container(
                height: 180,
                width: 180,
                color: Colors.grey.shade100,
                child: const Center(
                  child: Icon(Icons.qr_code_2, size: 80, color: Colors.grey),
                ),
              );
            },
          ),
          const SizedBox(height: 8),
          const Text(
            'Nội dung: Thanh toán đơn hàng BizFlow',
            style: TextStyle(fontSize: 12, color: Colors.grey),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<PosProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        title: const Text('Giỏ hàng & Thanh toán', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF00685F),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: provider.cartItems.isEmpty
          ? const Center(child: Text('Giỏ hàng trống! Hãy chọn sản phẩm ở POS.'))
          : Column(
              children: [
                // 1. Cart Items List
                Expanded(
                  child: ListView.builder(
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
                          padding: const EdgeInsets.all(12.0),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.productName,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${item.unitPrice.toStringAsFixed(0)}đ / ${item.unitName}',
                                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                                    )
                                  ],
                                ),
                              ),
                              Row(
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.remove_circle_outline, color: Color(0xFF00685F)),
                                    onPressed: () => provider.adjustCartQuantity(item.productId, item.productUnitId, -1),
                                  ),
                                  Text(
                                    '${item.quantity}',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.add_circle_outline, color: Color(0xFF00685F)),
                                    onPressed: () => provider.adjustCartQuantity(item.productId, item.productUnitId, 1),
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
                        ),
                      );
                    },
                  ),
                ),

                // 2. Customer & Payment Panel
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                    boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -3))],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Customer row
                      Row(
                        children: [
                          const Icon(Icons.person, color: Color(0xFF00685F)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: provider.selectedCustomer == null
                                ? InkWell(
                                    onTap: _showCustomerSelectionSheet,
                                    child: const Text(
                                      'Chọn khách hàng...',
                                      style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic),
                                    ),
                                  )
                                : Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        provider.selectedCustomer!.fullname,
                                        style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00685F)),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.close, size: 16, color: Colors.red),
                                        onPressed: () => provider.deselectCustomer(),
                                      ),
                                    ],
                                  ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.search, color: Color(0xFF00685F)),
                            onPressed: _showCustomerSelectionSheet,
                          ),
                        ],
                      ),
                      const Divider(),

                      // Payment method tabs
                      Row(
                        children: [
                          Expanded(child: _buildPaymentTab('Tiền mặt', 'Cash', Icons.money)),
                          const SizedBox(width: 8),
                          Expanded(child: _buildPaymentTab('Chuyển khoản', 'Transfer', Icons.qr_code)),
                          const SizedBox(width: 8),
                          Expanded(child: _buildPaymentTab('Ghi nợ', 'Debt', Icons.account_balance_wallet)),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // If Bank Transfer, show VietQR
                      if (_paymentMethod == 'Transfer') _buildVietQR(provider.cartTotal),

                      // If Debt, show old & new debt calculations
                      if (_paymentMethod == 'Debt' && provider.selectedCustomer != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(10)),
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Nợ cũ hiện tại:', style: TextStyle(color: Colors.red)),
                                  Text(
                                    '${provider.selectedCustomer!.totalDebt.toStringAsFixed(0)}đ',
                                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Nợ mới dự kiến:', style: TextStyle(color: Colors.red)),
                                  Text(
                                    '${(provider.selectedCustomer!.totalDebt + provider.cartTotal).toStringAsFixed(0)}đ',
                                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red, fontSize: 16),
                                  ),
                                ],
                              )
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Subtotal and confirm checkout button
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('TỔNG TIỀN CẦN TRẢ:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Text(
                            '${provider.cartTotal.toStringAsFixed(0)}đ',
                            style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 24),
                          )
                        ],
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF00685F),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: provider.isLoading ? null : _handleCheckout,
                        child: provider.isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : const Text('XÁC NHẬN THANH TOÁN & IN BILL', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                )
              ],
            ),
    );
  }

  Widget _buildPaymentTab(String label, String value, IconData icon) {
    final isSelected = _paymentMethod == value;
    return GestureDetector(
      onTap: () {
        setState(() {
          _paymentMethod = value;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF00685F) : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? Colors.transparent : Colors.grey.shade300),
        ),
        child: Column(
          children: [
            Icon(icon, color: isSelected ? Colors.white : const Color(0xFF00685F), size: 20),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : const Color(0xFF00685F),
                fontWeight: FontWeight.bold,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

