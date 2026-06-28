import 'package:flutter/material.dart';
import '../../providers/pos_provider.dart';
import '../customer/customer_selection_bottom_sheet.dart';

class POSSearchAndCustomer extends StatelessWidget {
  final PosProvider provider;
  final String searchQuery;
  final TextEditingController searchController;
  final FocusNode searchFocusNode;
  final ValueChanged<String> onSearchChanged;
  final VoidCallback onClearSearch;

  const POSSearchAndCustomer({
    super.key,
    required this.provider,
    required this.searchQuery,
    required this.searchController,
    required this.searchFocusNode,
    required this.onSearchChanged,
    required this.onClearSearch,
  });

  void _showCustomerSelectionSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return CustomerSelectionBottomSheet(provider: provider);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // 1. Search Bar
        Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            children: [
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 5,
                        offset: const Offset(0, 2),
                      )
                    ],
                  ),
                  child: TextField(
                    focusNode: searchFocusNode,
                    controller: searchController,
                    onChanged: onSearchChanged,
                    decoration: InputDecoration(
                      hintText: 'Tìm nhanh mặt hàng...',
                      prefixIcon: const Icon(Icons.search, color: Colors.grey),
                      suffixIcon: searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, color: Colors.grey),
                              onPressed: onClearSearch,
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        // 2. Customer Selection Bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 2.0),
          child: InkWell(
            onTap: () => _showCustomerSelectionSheet(context),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
        ),
      ],
    );
  }
}
