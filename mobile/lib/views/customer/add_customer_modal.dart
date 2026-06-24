import 'package:flutter/material.dart';
import '../../providers/pos_provider.dart';
import '../../models/models.dart';

class AddCustomerModal extends StatefulWidget {
  final PosProvider provider;
  final ValueChanged<Customer?> onSaved;

  const AddCustomerModal({
    super.key,
    required this.provider,
    required this.onSaved,
  });

  @override
  State<AddCustomerModal> createState() => _AddCustomerModalState();
}

class _AddCustomerModalState extends State<AddCustomerModal> {
  final nameController = TextEditingController();
  final phoneController = TextEditingController();
  final addressController = TextEditingController();
  final formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    nameController.dispose();
    phoneController.dispose();
    addressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Form(
        key: formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Thêm khách hàng mới',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF00685F), fontFamily: 'Inter'),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Tên khách hàng *',
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
                prefixIcon: Icon(Icons.person),
              ),
              style: const TextStyle(fontFamily: 'Inter'),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Họ tên là bắt buộc';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: phoneController,
              decoration: const InputDecoration(
                labelText: 'Số điện thoại *',
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
                prefixIcon: Icon(Icons.phone),
                hintText: 'Ví dụ: 0912345678',
              ),
              style: const TextStyle(fontFamily: 'Inter'),
              keyboardType: TextInputType.phone,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Số điện thoại là bắt buộc';
                }
                final phoneRegex = RegExp(r'^(0[3|5|7|8|9])[0-9]{8}$');
                if (!phoneRegex.hasMatch(value.trim())) {
                  return 'Số điện thoại Việt Nam không hợp lệ (10 số)';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: addressController,
              decoration: const InputDecoration(
                labelText: 'Địa chỉ (Tùy chọn)',
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
                prefixIcon: Icon(Icons.location_on),
              ),
              style: const TextStyle(fontFamily: 'Inter'),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00685F),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () async {
                if (!formKey.currentState!.validate()) return;

                // Show loading overlay
                showDialog(
                  context: context,
                  barrierDismissible: false,
                  builder: (context) => const Center(child: CircularProgressIndicator()),
                );

                final cust = await widget.provider.createCustomer(
                  nameController.text.trim(),
                  phoneController.text.trim(),
                );

                if (context.mounted) {
                  Navigator.pop(context); // Pop loading
                  Navigator.pop(context); // Close bottom sheet
                  widget.onSaved(cust);
                }
              },
              child: const Text('Lưu thông tin', style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Inter')),
            ),
          ],
        ),
      ),
    );
  }
}
