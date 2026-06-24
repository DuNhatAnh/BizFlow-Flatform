import 'package:flutter/material.dart';
import '../../models/models.dart';
import 'pos_product_card.dart';

class POSProductGrid extends StatelessWidget {
  final List<Product> filteredProducts;
  final bool isLoading;
  final bool isEmptyProducts;
  final VoidCallback onAddToCart;

  const POSProductGrid({
    super.key,
    required this.filteredProducts,
    required this.isLoading,
    required this.isEmptyProducts,
    required this.onAddToCart,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading && isEmptyProducts) {
      return const Center(child: CircularProgressIndicator());
    }

    if (filteredProducts.isEmpty) {
      return const Center(child: Text('Không tìm thấy sản phẩm nào'));
    }

    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.85,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: filteredProducts.length,
      itemBuilder: (context, index) {
        final product = filteredProducts[index];
        return POSProductCard(
          product: product,
          onAddToCart: onAddToCart,
        );
      },
    );
  }
}
