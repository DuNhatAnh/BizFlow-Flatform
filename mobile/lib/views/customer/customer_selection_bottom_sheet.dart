import 'package:flutter/material.dart';
import '../../providers/pos_provider.dart';

class CustomerSelectionBottomSheet extends StatefulWidget {
  final PosProvider provider;
  const CustomerSelectionBottomSheet({super.key, required this.provider});

  @override
  State<CustomerSelectionBottomSheet> createState() => _CustomerSelectionBottomSheetState();
}

class _CustomerSelectionBottomSheetState extends State<CustomerSelectionBottomSheet> {
  String _searchQuery = '';
  final _searchController = TextEditingController();
  bool _isCreatingNew = false;
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _searchController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filteredCustomers = widget.provider.customers.where((c) {
      final query = _searchQuery.toLowerCase();
      return c.fullname.toLowerCase().contains(query) ||
          (c.phone != null && c.phone!.contains(query));
    }).toList();

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.75,
        ),
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
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _isCreatingNew ? 'Thêm khách hàng mới' : 'Chọn khách hàng',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: Color(0xFF00685F),
                  ),
                ),
                if (!_isCreatingNew)
                  TextButton.icon(
                    icon: const Icon(Icons.add, size: 16, color: Color(0xFF00685F)),
                    label: const Text(
                      'Thêm mới',
                      style: TextStyle(color: Color(0xFF00685F), fontWeight: FontWeight.bold),
                    ),
                    onPressed: () {
                      setState(() {
                        _isCreatingNew = true;
                      });
                    },
                  )
                else
                  TextButton(
                    child: const Text(
                      'Quay lại',
                      style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () {
                      setState(() {
                        _isCreatingNew = false;
                      });
                    },
                  ),
              ],
            ),
            const Divider(),
            const SizedBox(height: 12),

            if (_isCreatingNew) ...[
              // Create customer form
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Họ và tên *',
                        prefixIcon: Icon(Icons.person, color: Color(0xFF00685F)),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.all(Radius.circular(12)),
                        ),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'Vui lòng nhập họ tên khách hàng';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _phoneController,
                      decoration: const InputDecoration(
                        labelText: 'Số điện thoại',
                        prefixIcon: Icon(Icons.phone, color: Color(0xFF00685F)),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.all(Radius.circular(12)),
                        ),
                      ),
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00685F),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () async {
                        if (!_formKey.currentState!.validate()) return;
                        final newCust = await widget.provider.createCustomer(
                          _nameController.text.trim(),
                          _phoneController.text.trim().isEmpty ? null : _phoneController.text.trim(),
                        );
                        if (context.mounted && newCust != null) {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Đã gán khách hàng mới: ${newCust.fullname}'),
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        }
                      },
                      child: const Text('Tạo & Gán khách hàng', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ] else ...[
              // Search field
              Container(
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: TextField(
                  controller: _searchController,
                  onChanged: (val) {
                    setState(() {
                      _searchQuery = val;
                    });
                  },
                  decoration: const InputDecoration(
                    hintText: 'Tìm theo tên hoặc số điện thoại...',
                    prefixIcon: Icon(Icons.search, color: Colors.grey),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Option for Default "Khách lẻ"
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: CircleAvatar(
                  backgroundColor: Colors.grey.shade200,
                  child: const Icon(Icons.people_outline, color: Colors.grey),
                ),
                title: const Text('Khách lẻ (Mặc định)', style: TextStyle(fontWeight: FontWeight.bold)),
                trailing: widget.provider.selectedCustomer == null
                    ? const Icon(Icons.check_circle, color: Color(0xFF00685F))
                    : null,
                onTap: () {
                  widget.provider.deselectCustomer();
                  Navigator.pop(context);
                },
              ),
              const Divider(),

              // Customer List
              Expanded(
                child: filteredCustomers.isEmpty
                    ? const Center(
                        child: Text(
                          'Không tìm thấy khách hàng nào',
                          style: TextStyle(color: Colors.grey),
                        ),
                      )
                    : ListView.builder(
                        itemCount: filteredCustomers.length,
                        itemBuilder: (context, index) {
                          final customer = filteredCustomers[index];
                          final isSelected = widget.provider.selectedCustomer?.id == customer.id;
                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: CircleAvatar(
                              backgroundColor: const Color(0xFF00685F).withValues(alpha: 0.1),
                              child: Text(
                                customer.fullname.substring(0, 1).toUpperCase(),
                                style: const TextStyle(color: Color(0xFF00685F), fontWeight: FontWeight.bold),
                              ),
                            ),
                            title: Text(
                              customer.fullname,
                              style: TextStyle(
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                color: isSelected ? const Color(0xFF00685F) : Colors.black,
                              ),
                            ),
                            subtitle: Text(customer.phone ?? 'Không có SĐT'),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (customer.totalDebt > 0)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.red.shade50,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      'Nợ: ${customer.totalDebt.toStringAsFixed(0)}đ',
                                      style: const TextStyle(color: Colors.red, fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                const SizedBox(width: 8),
                                if (isSelected)
                                  const Icon(Icons.check_circle, color: Color(0xFF00685F)),
                              ],
                            ),
                            onTap: () {
                              widget.provider.selectCustomer(customer);
                              Navigator.pop(context);
                            },
                          );
                        },
                      ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
