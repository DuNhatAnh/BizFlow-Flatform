import 'package:flutter/material.dart';

class CustomerSearchField extends StatelessWidget {
  final TextEditingController searchController;
  final ValueChanged<String> onChanged;
  final VoidCallback onAddPressed;

  const CustomerSearchField({
    super.key,
    required this.searchController,
    required this.onChanged,
    required this.onAddPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.grey.shade200),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  )
                ],
              ),
              child: TextField(
                controller: searchController,
                onChanged: onChanged,
                decoration: const InputDecoration(
                  hintText: 'Tìm kiếm khách hàng theo tên, SĐT...',
                  hintStyle: TextStyle(color: Colors.grey, fontSize: 13, fontFamily: 'Inter'),
                  prefixIcon: Icon(Icons.search, color: Color(0xFF00685F)),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Container(
            decoration: const BoxDecoration(
              color: Color(0xFF00685F),
              shape: BoxShape.circle,
            ),
            child: IconButton(
              icon: const Icon(Icons.add, color: Colors.white),
              onPressed: onAddPressed,
            ),
          ),
        ],
      ),
    );
  }
}
