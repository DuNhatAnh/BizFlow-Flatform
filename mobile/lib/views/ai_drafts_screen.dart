import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/models.dart';
import 'cart_screen.dart';
import 'ai_drafts/ai_draft_list.dart';

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
                Text('AI đã duyệt đơn hàng #${(draft.code.isNotEmpty ? draft.code : draft.id.substring(0, 4).toUpperCase())} thành công!'),
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
          'Bạn có chắc chắn muốn hủy đơn hàng nháp #AI-${(draft.code.isNotEmpty ? draft.code : draft.id.substring(0, 4).toUpperCase())} này không?',
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
        orElse: () => Customer(id: draft.customerId!, tenantId: draft.tenantId, fullname: draft.customerName ?? 'Khách hàng', totalDebt: 0, debtLimit: 10000000.0),
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

    final content = AIDraftList(
      provider: provider,
      onConfirm: _handleConfirm,
      onEdit: _handleEdit,
      onReject: _handleReject,
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
