import 'package:flutter/material.dart';
import '../../models/models.dart';

class POSCategoryList extends StatelessWidget {
  final List<Category> categories;
  final int selectedCategoryId;
  final ValueChanged<int> onCategorySelected;

  const POSCategoryList({
    super.key,
    required this.categories,
    required this.selectedCategoryId,
    required this.onCategorySelected,
  });

  Widget _buildCategoryChip(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF00685F) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? Colors.transparent : Colors.grey.shade300,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : const Color(0xFF00685F),
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              fontSize: 13,
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: categories.length + 1,
        itemBuilder: (context, index) {
          if (index == 0) {
            final isSelected = selectedCategoryId == 0;
            return _buildCategoryChip('Tất cả', isSelected, () {
              onCategorySelected(0);
            });
          }
          final cat = categories[index - 1];
          final isSelected = selectedCategoryId == cat.id;
          return _buildCategoryChip(cat.name, isSelected, () {
            onCategorySelected(cat.id);
          });
        },
      ),
    );
  }
}
