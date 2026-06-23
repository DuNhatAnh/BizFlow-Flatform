import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/models.dart';
import 'cart_screen.dart';

class AIDraftsScreen extends StatefulWidget {
  final bool isEmbedded;
  final ValueChanged<int>? onSwitchTab;
  const AIDraftsScreen({super.key, this.isEmbedded = false, this.onSwitchTab});

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

  void _handleConfirm(Order draft) async {
    final provider = Provider.of<PosProvider>(context, listen: false);

    // 1. Local Stock Verification
    List<String> insufficientStockProducts = [];
    for (var item in draft.orderItems) {
      final product = provider.products.firstWhere(
        (p) => p.id == item.productId,
        orElse: () => Product(id: '', tenantId: '', name: item.productName, baseUnit: item.unitName, productUnits: [], stock: 0),
      );
      if (product.id.isNotEmpty) {
        final unit = product.productUnits.firstWhere(
          (u) => u.id == item.productUnitId,
          orElse: () => ProductUnit(
            id: item.productUnitId,
            productId: item.productId,
            unitName: item.unitName,
            conversionRate: 1,
            price: item.unitPrice,
            isDefault: false,
          ),
        );
        final requestedBase = item.quantity * unit.conversionRate;
        if (requestedBase > product.stock) {
          insufficientStockProducts.add(
            "- ${product.name} (Yêu cầu: $requestedBase ${product.baseUnit}, Tồn kho: ${product.stock.toInt()} ${product.baseUnit})"
          );
        }
      }
    }

    if (insufficientStockProducts.isNotEmpty) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: Colors.red),
              SizedBox(width: 8),
              Text('Không đủ tồn kho', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Không thể duyệt đơn hàng vì các sản phẩm sau không đủ tồn kho:', style: TextStyle(fontSize: 14)),
              const SizedBox(height: 12),
              ...insufficientStockProducts.map((p) => Text(p, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87))),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đồng ý', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00685F))),
            ),
          ],
        ),
      );
      return;
    }

    // 2. Execute confirmation API
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator(color: Color(0xFF2D6A4F))),
    );

    final success = await provider.confirmAIDraft(draft.id, draft);

    if (mounted) {
      Navigator.pop(context); // Pop loading indicator
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: 8),
                Text('AI đã duyệt đơn hàng #${draft.id.substring(0, 4).toUpperCase()} thành công!'),
              ],
            ),
            backgroundColor: const Color(0xFF2D6A4F), // Emerald green
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(provider.errorMessage ?? 'Không thể duyệt đơn nháp này'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  void _handleReject(Order draft) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.help_outline_rounded, color: Color(0xFFBA1A1A)),
            SizedBox(width: 8),
            Text('Hủy đơn hàng nháp', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          'Bạn có chắc chắn muốn hủy đơn hàng nháp #AI-${draft.id.substring(0, 4).toUpperCase()} này không?',
          style: const TextStyle(fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Quay lại', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFBA1A1A),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () async {
              Navigator.pop(context); // Pop dialog
              final provider = Provider.of<PosProvider>(context, listen: false);

              // Show loading
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (context) => const Center(child: CircularProgressIndicator(color: Color(0xFFBA1A1A))),
              );

              final success = await provider.rejectAIDraft(draft.id);
              if (context.mounted) {
                Navigator.pop(context); // Pop loading
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Row(
                        children: [
                          Icon(Icons.check_circle, color: Colors.white),
                          SizedBox(width: 8),
                          Text('Đã hủy đơn hàng nháp AI thành công!'),
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
            child: const Text('Đồng ý hủy'),
          ),
        ],
      ),
    );
  }

  void _handleEdit(Order draft) async {
    final provider = Provider.of<PosProvider>(context, listen: false);

    // Show a loading screen
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    // 1. Populate the Cart in the provider
    provider.clearCart(); // Clean existing cart

    // Load customer if draft has customer
    if (draft.customerId != null && draft.customerId!.isNotEmpty) {
      final customer = provider.customers.firstWhere(
        (c) => c.id == draft.customerId,
        orElse: () => Customer(id: draft.customerId!, tenantId: draft.tenantId, fullname: draft.customerName ?? 'Khách hàng', totalDebt: 0),
      );
      provider.selectCustomer(customer);
    }

    // Load items
    for (var item in draft.orderItems) {
      final product = provider.products.firstWhere(
        (p) => p.id == item.productId,
        orElse: () => Product(id: item.productId, tenantId: draft.tenantId, name: item.productName, baseUnit: item.unitName, productUnits: [], stock: 0),
      );

      // Find product unit matching unitId
      if (product.id.isNotEmpty) {
        final unit = product.productUnits.firstWhere(
          (u) => u.id == item.productUnitId,
          orElse: () => ProductUnit(
            id: item.productUnitId,
            productId: item.productId,
            unitName: item.unitName,
            conversionRate: 1,
            price: item.unitPrice,
            isDefault: true,
          ),
        );

        // Add to cart with quantity
        for (int i = 0; i < item.quantity; i++) {
          provider.addToCart(product, unit);
        }
      }
    }

    // 2. Reject/remove draft from DB
    await provider.rejectAIDraft(draft.id);

    if (mounted) {
      Navigator.pop(context); // Pop loading dialog

      // 3. Switch tab to 0 (POS Sales)
      widget.onSwitchTab?.call(0);

      // 4. Open Cart screen
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const CartScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<PosProvider>(context);

    final content = provider.drafts.isEmpty
        ? Center(
            child: Padding(
              padding: const EdgeInsets.all(32.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: const Color(0xFF00CED1).withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF00CED1).withValues(alpha: 0.15),
                          blurRadius: 24,
                          spreadRadius: 4,
                        )
                      ],
                    ),
                    child: const Icon(
                      Icons.auto_awesome_rounded,
                      color: Color(0xFF008080),
                      size: 64,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Không có đơn hàng nháp nào cần duyệt',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF006565),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Các đơn hàng đặt từ xa qua AI sẽ xuất hiện tại đây để bạn kiểm tra và xác nhận.',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 13,
                      color: Colors.grey.shade600,
                      height: 1.4,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          )
        : ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            itemCount: provider.drafts.length,
            itemBuilder: (context, index) {
              final draft = provider.drafts[index];
              final timeAgo = "${DateTime.now().difference(draft.createdAt).inMinutes} phút trước";

              return Card(
                elevation: 0,
                margin: const EdgeInsets.only(bottom: 16),
                shape: RoundedRectangleBorder(
                  side: BorderSide(color: Colors.grey.shade200, width: 1),
                  borderRadius: BorderRadius.circular(16),
                ),
                color: Colors.white,
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.02),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                decoration: const BoxDecoration(
                                  color: Color(0xFFE3FFFE),
                                  shape: BoxShape.circle,
                                ),
                                padding: const EdgeInsets.all(6),
                                child: const Icon(
                                  Icons.auto_awesome_rounded,
                                  color: Color(0xFF008080),
                                  size: 16,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '#AI-${draft.id.substring(0, 5).toUpperCase()}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  color: Color(0xFF006565),
                                  fontFamily: 'Inter',
                                ),
                              ),
                            ],
                          ),
                          Text(
                            timeAgo,
                            style: TextStyle(
                              color: Colors.grey.shade500,
                              fontSize: 12,
                              fontFamily: 'Inter',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Customer Row
                      Row(
                        children: [
                          const Icon(Icons.person_outline_rounded, size: 16, color: Color(0xFF006565)),
                          const SizedBox(width: 6),
                          Text(
                            'Khách hàng: ',
                            style: TextStyle(
                              color: Colors.grey.shade600,
                              fontSize: 13,
                              fontFamily: 'Inter',
                            ),
                          ),
                          Text(
                            draft.customerName ?? 'Khách Lẻ',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                              fontSize: 13,
                              fontFamily: 'Inter',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // Items Table/Container
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFB),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey.shade100),
                        ),
                        child: Column(
                          children: draft.orderItems.map((item) {
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4.0),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: RichText(
                                      text: TextSpan(
                                        style: const TextStyle(
                                          color: Colors.black87,
                                          fontSize: 13,
                                          fontFamily: 'Inter',
                                        ),
                                        children: [
                                          TextSpan(
                                            text: item.productName,
                                            style: const TextStyle(fontWeight: FontWeight.w500),
                                          ),
                                          TextSpan(
                                            text: ' x${item.quantity}',
                                            style: const TextStyle(
                                              color: Color(0xFF008080),
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          TextSpan(
                                            text: ' (${item.unitName})',
                                            style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  Text(
                                    '${item.totalPrice.toStringAsFixed(0)}đ',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                      color: Colors.black87,
                                      fontFamily: 'Inter',
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Payment Badge and Total
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: draft.paymentMethod == 'Debt'
                                  ? const Color(0xFFFFDAD6)
                                  : const Color(0xFFE3FFFE),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  draft.paymentMethod == 'Debt'
                                      ? Icons.account_balance_wallet_outlined
                                      : Icons.payments_outlined,
                                  size: 14,
                                  color: draft.paymentMethod == 'Debt'
                                      ? const Color(0xFFBA1A1A)
                                      : const Color(0xFF006565),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  draft.paymentMethod == 'Debt' ? 'Đề xuất: Ghi nợ' : 'Đề xuất: Tiền mặt',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: draft.paymentMethod == 'Debt'
                                        ? const Color(0xFFBA1A1A)
                                        : const Color(0xFF006565),
                                    fontFamily: 'Inter',
                                  ),
                                ),
                              ],
                            ),
                          ),
                          RichText(
                            text: TextSpan(
                              style: const TextStyle(fontFamily: 'Inter', color: Colors.black87),
                              children: [
                                const TextSpan(text: 'Tạm tính: ', style: TextStyle(fontSize: 12, color: Colors.grey)),
                                TextSpan(
                                  text: '${draft.totalAmount.toStringAsFixed(0)}đ',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                    color: Color(0xFFDC2626),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Divider(height: 1),
                      const SizedBox(height: 16),

                      // Actions Row
                      Row(
                        children: [
                          // Cancel/Reject Button
                          Expanded(
                            child: OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFFDC2626),
                                side: const BorderSide(color: Color(0xFFFFDAD6)),
                                backgroundColor: const Color(0xFFFFDAD6).withValues(alpha: 0.2),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(vertical: 10),
                              ),
                              onPressed: () => _handleReject(draft),
                              icon: const Icon(Icons.delete_outline_rounded, size: 16),
                              label: const Text('Hủy', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                          ),
                          const SizedBox(width: 8),
                          // Edit Button
                          Expanded(
                            child: OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF556474),
                                side: BorderSide(color: Colors.grey.shade300),
                                backgroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(vertical: 10),
                              ),
                              onPressed: () => _handleEdit(draft),
                              icon: const Icon(Icons.edit_outlined, size: 16),
                              label: const Text('Sửa', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                          ),
                          const SizedBox(width: 8),
                          // Confirm Button
                          Expanded(
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF2D6A4F),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                elevation: 0,
                              ),
                              onPressed: () => _handleConfirm(draft),
                              icon: const Icon(Icons.check_circle_outline_rounded, size: 16),
                              label: const Text('Xác nhận', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
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
        title: const Text('Đơn hàng AI chờ duyệt', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF00685F),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: content,
    );
  }
}
