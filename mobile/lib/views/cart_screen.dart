import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/models.dart';
import 'cart/cart_items_list.dart';
import 'cart/cart_discount_selector.dart';
import 'cart/cart_payment_selector.dart';
import 'cart/vietqr_overlay.dart';
import 'cart/cart_success_dialog.dart';
import 'customer/customer_selection_bottom_sheet.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  String _paymentMethod = 'Cash'; // Cash | Transfer | Debt
  double _discountAmount = 0.0;
  bool _isPercentDiscount = false;
  final _discountController = TextEditingController();

  @override
  void dispose() {
    _discountController.dispose();
    super.dispose();
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
    buffer.writeln("Mã Đơn Hàng: #${order.id.isEmpty ? 'MOCK-ORDER' : (order.code.isNotEmpty ? order.code : order.id.substring(0, 8).toUpperCase())}");
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
          builder: (context) => CartSuccessDialog(
            order: order,
            onBackToPOS: () {
              Navigator.pop(context); // Pop dialog
              Navigator.pop(context, true); // Pop cart screen to POS Screen returning true
            },
          ),
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

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<PosProvider>(context);
    final double discountVal = calculatedDiscount;
    final double totalPayable = finalTotalAmount;
    final customer = provider.selectedCustomer;
    final bool isOverDebtLimit = _paymentMethod == 'Debt' &&
        customer != null &&
        (customer.totalDebt + totalPayable) > customer.debtLimit;

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
                      child: CartItemsList(provider: provider),
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
                          // Debt Limit Warning Banner
                          if (isOverDebtLimit) ...[
                            Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFBA1A1A).withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFFBA1A1A).withValues(alpha: 0.3)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.warning_amber_rounded, color: Color(0xFFBA1A1A), size: 24),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'CẢNH BÁO: Vượt hạn mức nợ!',
                                          style: TextStyle(
                                            color: Color(0xFFBA1A1A),
                                            fontWeight: FontWeight.bold,
                                            fontSize: 13,
                                            fontFamily: 'Inter',
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          'Tổng nợ mới (${(customer.totalDebt + totalPayable).toStringAsFixed(0)}đ) vượt hạn mức cho phép (${customer.debtLimit.toStringAsFixed(0)}đ) của khách hàng.',
                                          style: const TextStyle(
                                            color: Color(0xFFBA1A1A),
                                            fontSize: 11,
                                            fontFamily: 'Inter',
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],

                          // Customer Selection Row
                          InkWell(
                            onTap: () {
                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                shape: const RoundedRectangleBorder(
                                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                                ),
                                builder: (context) => CustomerSelectionBottomSheet(provider: provider),
                              );
                            },
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
                              
                              // Discount Selector
                              CartDiscountSelector(
                                discountController: _discountController,
                                isPercentDiscount: _isPercentDiscount,
                                onDiscountChanged: (val) {
                                  setState(() {
                                    _discountAmount = val;
                                  });
                                },
                                onTypeChanged: (val) {
                                  setState(() {
                                    _isPercentDiscount = val;
                                  });
                                },
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

                          // Payment Method Selector
                          CartPaymentSelector(
                            selectedMethod: _paymentMethod,
                            onMethodChanged: (val) {
                              setState(() {
                                _paymentMethod = val;
                              });
                            },
                          ),
                          const SizedBox(height: 12),

                          // Contextual Payment widgets (QR code or Debt calculations)
                          if (_paymentMethod == 'Transfer') VietQROverlay(amount: totalPayable),

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
}
