import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/models.dart';
import '../../providers/pos_provider.dart';

/// Bottom sheet hiển thị chi tiết sản phẩm, cho phép chọn đơn vị,
/// tùy chỉnh số lượng rồi mới thêm vào giỏ hàng.
class ProductDetailSheet extends StatefulWidget {
  final Product product;
  final VoidCallback onAddedToCart;

  const ProductDetailSheet({
    super.key,
    required this.product,
    required this.onAddedToCart,
  });

  @override
  State<ProductDetailSheet> createState() => _ProductDetailSheetState();
}

class _ProductDetailSheetState extends State<ProductDetailSheet> {
  late ProductUnit _selectedUnit;
  int _quantity = 1;

  @override
  void initState() {
    super.initState();
    _selectedUnit = widget.product.productUnits.firstWhere(
      (u) => u.isDefault,
      orElse: () => widget.product.productUnits.isNotEmpty
          ? widget.product.productUnits.first
          : ProductUnit(
              id: 0,
              productId: widget.product.id,
              unitName: widget.product.baseUnit,
              conversionRate: 1,
              price: 0.0,
              isDefault: true,
            ),
    );
  }

  void _decreaseQty() {
    if (_quantity > 1) setState(() => _quantity--);
  }

  void _increaseQty() {
    setState(() => _quantity++);
  }

  void _addToCart() {
    final provider = Provider.of<PosProvider>(context, listen: false);
    // Thêm đúng số lượng đã chọn
    for (int i = 0; i < _quantity; i++) {
      provider.addToCart(widget.product, _selectedUnit);
    }
    Navigator.pop(context);
    widget.onAddedToCart();
  }

  String _formatPrice(double price) {
    // Định dạng số với dấu chấm phân cách hàng nghìn: 1200000 → 1.200.000
    final str = price.toStringAsFixed(0);
    final buffer = StringBuffer();
    int count = 0;
    for (int i = str.length - 1; i >= 0; i--) {
      if (count > 0 && count % 3 == 0) buffer.write('.');
      buffer.write(str[i]);
      count++;
    }
    return buffer.toString().split('').reversed.join();
  }

  Widget _qtyButton({
    required IconData icon,
    required VoidCallback onTap,
    required bool enabled,
  }) {
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: Container(
        width: 34,
        height: 34,
        decoration: BoxDecoration(
          color: enabled
              ? const Color(0xFF00685F).withValues(alpha: 0.1)
              : Colors.grey.shade100,
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          size: 16,
          color: enabled ? const Color(0xFF00685F) : Colors.grey.shade400,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final totalPrice = _selectedUnit.price * _quantity;
    final stockText =
        '${product.stock.toStringAsFixed(0)} ${product.baseUnit}';

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Handle bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Tên sản phẩm + tồn kho
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  product.displayImageUrl,
                  width: 56,
                  height: 56,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    width: 56,
                    height: 56,
                    color: const Color(0xFF00685F).withValues(alpha: 0.08),
                    child: const Icon(
                      Icons.inventory_2_outlined,
                      size: 28,
                      color: Color(0xFF00685F),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Color(0xFF00685F),
                        fontFamily: 'Inter',
                      ),
                    ),
                    if (product.code != null && product.code!.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        'Mã: ${product.code}',
                        style: TextStyle(
                          color: Colors.grey.shade500,
                          fontSize: 12,
                          fontFamily: 'Inter',
                        ),
                      ),
                    ],
                    const SizedBox(height: 6),
                    // Tồn kho badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: product.stock > 0
                            ? const Color(0xFF00685F).withValues(alpha: 0.1)
                            : Colors.red.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        product.stock > 0
                            ? 'Còn hàng: $stockText'
                            : 'Hết hàng',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: product.stock > 0
                              ? const Color(0xFF00685F)
                              : Colors.red,
                          fontFamily: 'Inter',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(height: 1),
          const SizedBox(height: 16),

          // Chọn đơn vị tính
          if (product.productUnits.length > 1) ...[
            const Text(
              'Đơn vị tính',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: Colors.black87,
                fontFamily: 'Inter',
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: product.productUnits.map((unit) {
                final isSelected = unit.id == _selectedUnit.id;
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedUnit = unit;
                    });
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFF00685F)
                          : const Color(0xFFF0F2F5),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected
                            ? const Color(0xFF00685F)
                            : Colors.grey.shade300,
                      ),
                    ),
                    child: Column(
                      children: [
                        Text(
                          unit.unitName,
                          style: TextStyle(
                            color: isSelected ? Colors.white : Colors.black87,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            fontFamily: 'Inter',
                          ),
                        ),
                        Text(
                          '${unit.price.toStringAsFixed(0)}đ',
                          style: TextStyle(
                            color: isSelected
                                ? Colors.white70
                                : Colors.redAccent,
                            fontSize: 11,
                            fontFamily: 'Inter',
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            const Divider(height: 1),
            const SizedBox(height: 16),
          ],

          // Bảng thông tin đơn giá + số lượng gọn trong 1 container
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: const Color(0xFFF7F9FB),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Row(
              children: [
                // Cột đơn giá
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Đơn giá',
                        style: TextStyle(
                          color: Colors.grey,
                          fontSize: 11,
                          fontFamily: 'Inter',
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${_formatPrice(_selectedUnit.price)}đ',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: Colors.redAccent,
                          fontFamily: 'Inter',
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '/ ${_selectedUnit.unitName}',
                        style: TextStyle(
                          color: Colors.grey.shade500,
                          fontSize: 11,
                          fontFamily: 'Inter',
                        ),
                      ),
                    ],
                  ),
                ),

                // Divider dọc
                Container(
                  width: 1,
                  height: 44,
                  color: Colors.grey.shade200,
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                ),

                // Cột số lượng
                Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const Text(
                      'Số lượng',
                      style: TextStyle(
                        color: Colors.grey,
                        fontSize: 11,
                        fontFamily: 'Inter',
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        _qtyButton(
                          icon: Icons.remove,
                          onTap: _decreaseQty,
                          enabled: _quantity > 1,
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                          child: Text(
                            '$_quantity',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              fontFamily: 'Inter',
                            ),
                          ),
                        ),
                        _qtyButton(
                          icon: Icons.add,
                          onTap: _increaseQty,
                          enabled: true,
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Dòng tổng tiền
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Thành tiền:',
                style: TextStyle(
                  color: Colors.grey,
                  fontSize: 13,
                  fontFamily: 'Inter',
                ),
              ),
              Text(
                '${_formatPrice(totalPrice)}đ',
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 20,
                  color: Color(0xFF00685F),
                  fontFamily: 'Inter',
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Nút thêm vào giỏ — label và giá trên 2 dòng, không bao giờ tràn
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00685F),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
            onPressed: product.stock > 0 ? _addToCart : null,
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.add_shopping_cart, size: 20),
                SizedBox(width: 8),
                Text(
                  'Thêm vào giỏ hàng',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    fontFamily: 'Inter',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
