import 'package:flutter/material.dart';
import '../../models/models.dart';
import 'product_detail_sheet.dart';

class POSProductCard extends StatefulWidget {
  final Product product;
  final VoidCallback onAddToCart;

  const POSProductCard({
    super.key,
    required this.product,
    required this.onAddToCart,
  });

  @override
  State<POSProductCard> createState() => _POSProductCardState();
}

class _POSProductCardState extends State<POSProductCard> {
  late ProductUnit _selectedUnit;

  @override
  void initState() {
    super.initState();
    _selectedUnit = widget.product.productUnits.firstWhere(
      (u) => u.isDefault,
      orElse: () => widget.product.productUnits.isNotEmpty
          ? widget.product.productUnits.first
          : ProductUnit(id: 0, productId: widget.product.id, unitName: '', conversionRate: 1, price: 0.0, isDefault: false),
    );
  }

  void _openProductDetail(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Padding(
        // Tránh bàn phím che nội dung nếu có
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: ProductDetailSheet(
          product: widget.product,
          onAddedToCart: widget.onAddToCart,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final formattedPrice = "${_selectedUnit.price.toStringAsFixed(0)}đ";
    final stockText = "Tồn: ${product.stock.toStringAsFixed(0)} ${product.baseUnit}";

    return GestureDetector(
      onTap: () => _openProductDetail(context),
      child: Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 4),
          )
        ],
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF00685F).withValues(alpha: 0.05),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Icon(
                      Icons.inventory_2_outlined,
                      size: 40,
                      color: const Color(0xFF00685F).withValues(alpha: 0.6),
                    ),
                  ),
                  Positioned(
                    left: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00685F).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        stockText,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF00685F),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF00685F),
                    fontSize: 13,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      formattedPrice,
                      style: const TextStyle(
                        color: Colors.redAccent,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      '/ ${_selectedUnit.unitName}',
                      style: const TextStyle(color: Colors.grey, fontSize: 10),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (product.productUnits.length > 1)
                  SizedBox(
                    height: 28,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      // Chặn scroll của ListView con không bubble lên card tap
                      physics: const ClampingScrollPhysics(),
                      itemCount: product.productUnits.length,
                      itemBuilder: (context, idx) {
                        final unit = product.productUnits[idx];
                        final isSelected = unit.id == _selectedUnit.id;
                        return Container(
                          margin: const EdgeInsets.only(right: 4),
                          child: GestureDetector(
                            // Chỉ đổi unit preview trên card, không mở bottom sheet
                            onTap: () {
                              setState(() {
                                _selectedUnit = unit;
                              });
                            },
                            behavior: HitTestBehavior.opaque,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? const Color(0xFF00685F)
                                    : const Color(0xFFF0F2F5),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: isSelected
                                      ? Colors.transparent
                                      : Colors.grey.shade300,
                                  width: 1,
                                ),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                unit.unitName,
                                style: TextStyle(
                                  color: isSelected ? Colors.white : Colors.black87,
                                  fontSize: 10,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  )
                else
                  const SizedBox(height: 28),
              ],
            ),
          ),
        ],
      ),
    ));
  }
}
