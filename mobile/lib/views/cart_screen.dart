import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
  double _discountAmount = 0.0;
  bool _isPercentDiscount = false;
  final _discountController = TextEditingController();

  @override
  void dispose() {
    _discountController.dispose();
    super.dispose();
  }

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

  double get calculatedDiscount {
    final provider = Provider.of<PosProvider>(context, listen: false);
    if (_discountAmount < 0) return 0.0;
    if (_isPercentDiscount) {
      double percent = _discountAmount > 100 ? 100 : _discountAmount;
      return provider.cartTotal * (percent / 100);
    } else {
      return _discountAmount > provider.cartTotal ? provider.cartTotal : _discountAmount;
    }
  }

  double get finalTotalAmount {
    final provider = Provider.of<PosProvider>(context, listen: false);
    double total = provider.cartTotal - calculatedDiscount;
    return total < 0 ? 0.0 : total;
  }

  void _printMockThermalReceipt(Order order, double discountAmount) {
    final provider = Provider.of<PosProvider>(context, listen: false);
    final tenantName = provider.currentUser?.tenantName ?? 'Đại lý Kim Vy';
    final employeeName = provider.currentUser?.fullname ?? 'Nhân viên';
    final customerName = provider.selectedCustomer?.fullname ?? 'Khách lẻ';
    final dateStr = DateTime.now().toLocal().toString().split('.').first;

    final buffer = StringBuffer();
    buffer.writeln("==================================================");
    buffer.writeln("              BIZFLOW PLATFORM RECEIPT            ");
    buffer.writeln("==================================================");
    buffer.writeln("Cửa Hàng: $tenantName");
    buffer.writeln("Nhân Viên: $employeeName");
    buffer.writeln("Thời Gian: $dateStr");
    buffer.writeln("Mã Đơn Hàng: #${order.id.isEmpty ? 'MOCK-ORDER' : order.id.substring(0, 8).toUpperCase()}");
    buffer.writeln("Khách Hàng: $customerName");
    buffer.writeln("--------------------------------------------------");
    buffer.writeln("Sản Phẩm                 SL    ĐVT      Thành Tiền");
    buffer.writeln("--------------------------------------------------");

    for (var item in order.orderItems) {
      final name = item.productName.padRight(22).substring(0, 22);
      final qty = item.quantity.toString().padRight(4);
      final unit = item.unitName.padRight(7).substring(0, 7);
      final price = "${item.totalPrice.toStringAsFixed(0)}đ";
      buffer.writeln("$name $qty  $unit   $price");
    }

    buffer.writeln("--------------------------------------------------");
    buffer.writeln("Tổng Tiền Hàng:                     ${(order.totalAmount + discountAmount).toStringAsFixed(0)}đ");
    buffer.writeln("Giảm Giá:                           ${discountAmount.toStringAsFixed(0)}đ");
    buffer.writeln("Tổng Thanh Toán:                    ${order.totalAmount.toStringAsFixed(0)}đ");
    buffer.writeln("Thanh Toán Qua:                     ${_paymentMethod == 'Cash' ? 'Tiền mặt' : _paymentMethod == 'Transfer' ? 'Chuyển khoản' : 'Ghi nợ'}");
    buffer.writeln("==================================================");
    buffer.writeln("           CẢM ƠN QUÝ KHÁCH. HẸN GẶP LẠI!         ");
    buffer.writeln("==================================================");

    debugPrint(buffer.toString());
  }

  void _handleCheckout() async {
    final provider = Provider.of<PosProvider>(context, listen: false);

    if (_paymentMethod == 'Debt' && provider.selectedCustomer == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng chọn khách hàng cụ thể để ghi nợ!'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    try {
      final discountVal = calculatedDiscount;
      final order = await provider.checkout(_paymentMethod, discount: discountVal);
      
      // Print the simulated ASCII thermal receipt
      _printMockThermalReceipt(order, discountVal);

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
          const Icon(Icons.check_circle, color: Color(0xFF2D6A4F), size: 80),
          const SizedBox(height: 16),
          const Text(
            'Thanh toán thành công!',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF00685F)),
          ),
          const SizedBox(height: 8),
          Text(
            'Hóa đơn: #${order.id.isEmpty ? "MOCK" : order.id.substring(0, 8).toUpperCase()}',
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
              Navigator.pop(context, true); // Pop cart screen to POS Screen returning true
            },
            child: const Text('Quay lại POS'),
          )
        ],
      ),
    );
  }

  Widget _buildVietQR(double amount) {
    final note = Uri.encodeComponent("Thanh toan don hang BizFlow");
    final qrUrl = "https://img.vietqr.io/image/970436-123456789-qr_only.png?amount=${amount.toInt()}&addInfo=$note";

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
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
            style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00685F), fontFamily: 'Inter'),
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
            style: TextStyle(fontSize: 12, color: Colors.grey, fontFamily: 'Inter'),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<PosProvider>(context);
    final double discountVal = calculatedDiscount;
    final double totalPayable = finalTotalAmount;

    return CallbackShortcuts(
      bindings: {
        const SingleActivator(LogicalKeyboardKey.f9): () {
          if (!provider.isLoading) {
            _handleCheckout();
          }
        },
        const SingleActivator(LogicalKeyboardKey.enter): () {
          if (!provider.isLoading) {
            _handleCheckout();
          }
        },
        const SingleActivator(LogicalKeyboardKey.escape): () {
          Navigator.pop(context);
        },
      },
      child: Focus(
        autofocus: true,
        child: Scaffold(
        backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        title: const Text(
          'Giỏ hàng & Thanh toán',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontFamily: 'Inter'),
        ),
        backgroundColor: const Color(0xFF00685F),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: provider.cartItems.isEmpty
          ? const Center(
              child: Text(
                'Giỏ hàng trống! Hãy chọn sản phẩm ở POS.',
                style: TextStyle(fontFamily: 'Inter', color: Colors.grey),
              ),
            )
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
                  ),
                ),

                // 2. Customer & Payment Panel
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, -3),
                      )
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Customer Selection Row
                      InkWell(
                        onTap: _showCustomerSelectionSheet,
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFF00685F).withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFF00685F).withValues(alpha: 0.2)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.person_outline, color: Color(0xFF00685F), size: 20),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  provider.selectedCustomer != null
                                      ? 'Khách hàng: ${provider.selectedCustomer!.fullname} (${provider.selectedCustomer!.phone ?? "Không có SĐT"})'
                                      : 'Khách hàng: Khách lẻ (Chạm để thay đổi)',
                                  style: const TextStyle(
                                    color: Color(0xFF00685F),
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13,
                                    fontFamily: 'Inter',
                                  ),
                                ),
                              ),
                              if (provider.selectedCustomer != null)
                                GestureDetector(
                                  onTap: () {
                                    provider.deselectCustomer();
                                  },
                                  child: const Icon(Icons.close, color: Color(0xFF00685F), size: 18),
                                )
                              else
                                const Icon(Icons.arrow_drop_down, color: Color(0xFF00685F)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Cost Summary Breakdown
                      Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Tổng tiền hàng:', style: TextStyle(color: Colors.grey, fontSize: 13, fontFamily: 'Inter')),
                              Text('${provider.cartTotal.toStringAsFixed(0)}đ', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, fontFamily: 'Inter')),
                            ],
                          ),
                          const SizedBox(height: 8),
                          // Discount Row with input and toggle
                          Row(
                            children: [
                              const Text(
                                'Giảm giá:',
                                style: TextStyle(color: Colors.grey, fontSize: 13, fontFamily: 'Inter'),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: SizedBox(
                                  height: 38,
                                  child: TextField(
                                    controller: _discountController,
                                    keyboardType: TextInputType.number,
                                    style: const TextStyle(fontSize: 13, fontFamily: 'Inter'),
                                    decoration: InputDecoration(
                                      hintText: 'Nhập số tiền hoặc %',
                                      isDense: true,
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                      focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8),
                                        borderSide: const BorderSide(color: Color(0xFF00685F), width: 1.5),
                                      ),
                                    ),
                                    onChanged: (val) {
                                      setState(() {
                                        _discountAmount = double.tryParse(val) ?? 0.0;
                                      });
                                    },
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              // Toggle buttons for đ and %
                              Container(
                                height: 38,
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey.shade300),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    GestureDetector(
                                      onTap: () {
                                        setState(() {
                                          _isPercentDiscount = false;
                                        });
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                        alignment: Alignment.center,
                                        decoration: BoxDecoration(
                                          color: !_isPercentDiscount ? const Color(0xFF00685F) : Colors.transparent,
                                          borderRadius: const BorderRadius.only(
                                            topLeft: Radius.circular(7),
                                            bottomLeft: Radius.circular(7),
                                          ),
                                        ),
                                        child: Text(
                                          'đ',
                                          style: TextStyle(
                                            color: !_isPercentDiscount ? Colors.white : const Color(0xFF00685F),
                                            fontWeight: FontWeight.bold,
                                            fontFamily: 'Inter',
                                          ),
                                        ),
                                      ),
                                    ),
                                    GestureDetector(
                                      onTap: () {
                                        setState(() {
                                          _isPercentDiscount = true;
                                        });
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                        alignment: Alignment.center,
                                        decoration: BoxDecoration(
                                          color: _isPercentDiscount ? const Color(0xFF00685F) : Colors.transparent,
                                          borderRadius: const BorderRadius.only(
                                            topRight: Radius.circular(7),
                                            bottomRight: Radius.circular(7),
                                          ),
                                        ),
                                        child: Text(
                                          '%',
                                          style: TextStyle(
                                            color: _isPercentDiscount ? Colors.white : const Color(0xFF00685F),
                                            fontWeight: FontWeight.bold,
                                            fontFamily: 'Inter',
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          if (discountVal > 0) ...[
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Chiết khấu đã giảm:', style: TextStyle(color: Colors.grey, fontSize: 13, fontFamily: 'Inter')),
                                Text('-${discountVal.toStringAsFixed(0)}đ', style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF2D6A4F), fontSize: 13, fontFamily: 'Inter')),
                              ],
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Divider(),
                      const SizedBox(height: 8),

                      // Payment Method Tabs
                      Row(
                        children: [
                          Expanded(child: _buildPaymentTab('Tiền mặt', 'Cash', Icons.money)),
                          const SizedBox(width: 8),
                          Expanded(child: _buildPaymentTab('Chuyển khoản', 'Transfer', Icons.qr_code)),
                          const SizedBox(width: 8),
                          Expanded(child: _buildPaymentTab('Ghi nợ', 'Debt', Icons.account_balance_wallet)),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Contextual Payment widgets (QR code or Debt calculations)
                      if (_paymentMethod == 'Transfer') _buildVietQR(totalPayable),

                      if (_paymentMethod == 'Debt' && provider.selectedCustomer != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFBA1A1A).withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFBA1A1A).withValues(alpha: 0.15)),
                          ),
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Nợ cũ hiện tại:', style: TextStyle(color: Color(0xFFBA1A1A), fontFamily: 'Inter')),
                                  Text(
                                    '${provider.selectedCustomer!.totalDebt.toStringAsFixed(0)}đ',
                                    style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFBA1A1A), fontFamily: 'Inter'),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Nợ mới dự kiến:', style: TextStyle(color: Color(0xFFBA1A1A), fontFamily: 'Inter')),
                                  Text(
                                    '${(provider.selectedCustomer!.totalDebt + totalPayable).toStringAsFixed(0)}đ',
                                    style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFBA1A1A), fontSize: 15, fontFamily: 'Inter'),
                                  ),
                                ],
                              )
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                      ],

                      // Subtotal and confirm checkout button
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'TỔNG THANH TOÁN:',
                            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, fontFamily: 'Inter'),
                          ),
                          Text(
                            '${totalPayable.toStringAsFixed(0)}đ',
                            style: const TextStyle(
                              color: Color(0xFFBA1A1A),
                              fontWeight: FontWeight.w800,
                              fontSize: 22,
                              fontFamily: 'Inter',
                            ),
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
                            : const Text(
                                'THANH TOÁN & IN HÓA ĐƠN [F9/Enter]',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, fontFamily: 'Inter'),
                              ),
                      ),
                    ],
                  ),
                )
              ],
            ),
      ),
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
                fontFamily: 'Inter',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
