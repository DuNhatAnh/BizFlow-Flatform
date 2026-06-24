import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/models.dart';
import 'order_history/order_history_list.dart';
import 'order_history/order_history_detail_sheet.dart';

class OrderHistoryScreen extends StatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  State<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen> {
  String? _selectedDateStr; // yyyy-MM-dd
  String? _selectedSource; // Manual | AI_Voice | AI_Text

  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  void _fetchOrders() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<PosProvider>(context, listen: false);
      if (provider.tenantId != null) {
        provider.loadPOSData();
      }
    });
  }

  void _handleCancelOrder(Order order) async {
    final provider = Provider.of<PosProvider>(context, listen: false);
    
    // Role validation check: standard employees cannot cancel completed invoices
    final role = provider.currentUser?.role ?? 'Employee';
    if (role != 'Admin' && role != 'Owner') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Chỉ tài khoản Owner hoặc Admin mới có quyền hủy hóa đơn này!'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    // Confirm cancellation dialog
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận hủy đơn hàng', style: TextStyle(fontFamily: 'Inter')),
        content: const Text('Bạn có chắc chắn muốn hủy đơn hàng này? Hệ thống sẽ tự động hoàn kho, hoàn nợ và tạo bút toán đảo.', style: TextStyle(fontFamily: 'Inter')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Không', style: TextStyle(fontFamily: 'Inter', color: Colors.grey))),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Có, hủy đơn', style: TextStyle(fontFamily: 'Inter', color: Colors.red))),
        ],
      ),
    );

    if (confirm == true) {
      if (mounted) {
        // Show loading
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => const Center(child: CircularProgressIndicator()),
        );
      }

      final success = await provider.cancelOrder(order.id);
      
      if (mounted) {
        Navigator.pop(context); // Pop loading
        Navigator.pop(context); // Close details sheet dialog
        
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đã hủy đơn hàng thành công, kho và nợ đã được hoàn trả!')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Lỗi khi hủy đơn hàng'), backgroundColor: Colors.red),
          );
        }
      }
    }
  }

  void _showOrderDetailDialog(Order order) {
    final provider = Provider.of<PosProvider>(context, listen: false);

    showDialog(
      context: context,
      builder: (context) {
        return OrderHistoryDetailSheet(
          order: order,
          provider: provider,
          onCancelOrder: () => _handleCancelOrder(order),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<PosProvider>(context);

    // Apply local filters in memory or request parameters (we filter in memory for clean performance)
    final filteredOrders = provider.orders.where((o) {
      if (_selectedSource != null && o.orderSource != _selectedSource) return false;
      if (_selectedDateStr != null) {
        final orderDateStr = "${o.createdAt.toLocal().year}-${o.createdAt.toLocal().month.toString().padLeft(2, '0')}-${o.createdAt.toLocal().day.toString().padLeft(2, '0')}";
        if (orderDateStr != _selectedDateStr) return false;
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        title: const Text('Lịch sử đơn hàng', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontFamily: 'Inter')),
        backgroundColor: const Color(0xFF00685F),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          // Filter Bar
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                // Source dropdown
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        hint: const Text('Nguồn đơn', style: TextStyle(fontSize: 13, fontFamily: 'Inter')),
                        value: _selectedSource,
                        items: const [
                          DropdownMenuItem(value: null, child: Text('Tất cả nguồn', style: TextStyle(fontFamily: 'Inter'))),
                          DropdownMenuItem(value: 'Manual', child: Text('Thủ công', style: TextStyle(fontFamily: 'Inter'))),
                          DropdownMenuItem(value: 'AI_Voice', child: Text('Giọng nói AI', style: TextStyle(fontFamily: 'Inter'))),
                          DropdownMenuItem(value: 'AI_Text', child: Text('Văn bản AI', style: TextStyle(fontFamily: 'Inter'))),
                        ],
                        onChanged: (val) {
                          setState(() {
                            _selectedSource = val;
                          });
                        },
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // Date select button
                Expanded(
                  child: GestureDetector(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime(2020),
                        lastDate: DateTime(2030),
                      );
                      if (picked != null) {
                        setState(() {
                          _selectedDateStr = "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
                        });
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(_selectedDateStr ?? 'Chọn ngày', style: const TextStyle(fontSize: 13, fontFamily: 'Inter')),
                          if (_selectedDateStr != null)
                            GestureDetector(
                              onTap: () {
                                setState(() {
                                    _selectedDateStr = null;
                                  });
                              },
                              child: const Icon(Icons.clear, size: 16, color: Colors.grey),
                            )
                          else
                            const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Orders List
          Expanded(
            child: provider.isLoading && provider.orders.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : OrderHistoryList(
                    orders: filteredOrders,
                    onTapOrder: _showOrderDetailDialog,
                  ),
          ),
        ],
      ),
    );
  }
}
