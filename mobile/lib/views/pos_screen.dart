import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/models.dart';
import 'barcode_scanner_screen.dart';
import 'cart_screen.dart';
import 'ai_drafts_screen.dart';
import 'customer_list_screen.dart';
import 'order_history_screen.dart';
import 'dashboard_screen.dart';
import 'login_screen.dart';

class POSScreen extends StatefulWidget {
  const POSScreen({super.key});

  @override
  State<POSScreen> createState() => _POSScreenState();
}

class _POSScreenState extends State<POSScreen> with SingleTickerProviderStateMixin {
  int _selectedCategoryId = 0; // 0 means 'All'
  String _searchQuery = '';
  final _searchController = TextEditingController();

  // Pulse animation controller for the Neon AI button
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.25).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    // Refresh POS data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PosProvider>(context, listen: false).loadPOSData();
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _showUnitSelectionDialog(Product product) {
    if (product.productUnits.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sản phẩm chưa cấu hình đơn vị tính!')),
      );
      return;
    }

    ProductUnit selectedUnit = product.productUnits.firstWhere(
      (u) => u.isDefault,
      orElse: () => product.productUnits.first,
    );

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: Text(
                'Chọn đơn vị tính cho ${product.name}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: product.productUnits.map((unit) {
                  final isSelected = selectedUnit.id == unit.id;
                  return InkWell(
                    onTap: () {
                      setDialogState(() {
                        selectedUnit = unit;
                      });
                    },
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: isSelected ? const Color(0xFF00F5D4) : Colors.grey.shade300,
                          width: isSelected ? 2 : 1,
                        ),
                        borderRadius: BorderRadius.circular(10),
                        color: isSelected ? const Color(0xFF00F5D4).withValues(alpha: 0.05) : Colors.white,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            unit.unitName,
                            style: TextStyle(
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              color: const Color(0xFF00685F),
                            ),
                          ),
                          Text(
                            '${unit.price.toStringAsFixed(0)}đ / ${unit.conversionRate > 1 ? "Quy đổi x${unit.conversionRate}" : "Đơn vị gốc"}',
                            style: const TextStyle(color: Colors.grey, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Hủy'),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00685F),
                    foregroundColor: Colors.white,
                  ),
                  onPressed: () {
                    Provider.of<PosProvider>(context, listen: false).addToCart(product, selectedUnit);
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Đã thêm ${product.name} (${selectedUnit.unitName}) vào giỏ hàng'),
                        duration: const Duration(seconds: 1),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                  child: const Text('Xác nhận'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showAIVoiceSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const AIVoiceAssistantSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<PosProvider>(context);

    // Filter products based on category and search query
    final filteredProducts = provider.products.where((p) {
      final matchesCategory = _selectedCategoryId == 0 || p.categoryId == _selectedCategoryId;
      final matchesSearch = p.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (p.code != null && p.code!.contains(_searchQuery));
      return matchesCategory && matchesSearch;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        title: const Text(
          'BizFlow POS',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: const Color(0xFF00685F),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => provider.loadPOSData(),
          ),
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart_outlined),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const CartScreen()),
                  );
                },
              ),
              if (provider.cartCount > 0)
                Positioned(
                  right: 4,
                  top: 4,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      '${provider.cartCount}',
                      style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  ),
                )
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      drawer: _buildDrawer(provider),
      body: Column(
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
                      controller: _searchController,
                      onChanged: (val) {
                        setState(() {
                          _searchQuery = val;
                        });
                      },
                      decoration: InputDecoration(
                        hintText: 'Tìm kiếm sản phẩm, mã vạch...',
                        prefixIcon: const Icon(Icons.search, color: Colors.grey),
                        suffixIcon: _searchQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear, color: Colors.grey),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() {
                                    _searchQuery = '';
                                  });
                                },
                              )
                            : null,
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.qr_code_scanner, color: Color(0xFF00685F), size: 28),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const BarcodeScannerScreen()),
                    );
                  },
                ),
              ],
            ),
          ),

          // 2. Category Tab list
          SizedBox(
            height: 48,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: provider.categories.length + 1,
              itemBuilder: (context, index) {
                if (index == 0) {
                  final isSelected = _selectedCategoryId == 0;
                  return _buildCategoryChip('Tất cả', isSelected, () {
                    setState(() {
                      _selectedCategoryId = 0;
                    });
                  });
                }
                final cat = provider.categories[index - 1];
                final isSelected = _selectedCategoryId == cat.id;
                return _buildCategoryChip(cat.name, isSelected, () {
                  setState(() {
                    _selectedCategoryId = cat.id;
                  });
                });
              },
            ),
          ),

          // 3. Product grid
          Expanded(
            child: provider.isLoading && provider.products.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : filteredProducts.isEmpty
                    ? const Center(child: Text('Không tìm thấy sản phẩm nào'))
                    : GridView.builder(
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
                          return _buildProductCard(product);
                        },
                      ),
          ),

          // 4. Mini Cart Summary Bar
          if (provider.cartCount > 0) _buildMiniCartBar(provider),
        ],
      ),
      floatingActionButton: AnimatedBuilder(
        animation: _pulseAnimation,
        builder: (context, child) {
          return Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF00F5D4).withValues(alpha: 0.3),
                  blurRadius: 15 * _pulseAnimation.value,
                  spreadRadius: 3 * _pulseAnimation.value,
                )
              ],
            ),
            child: Transform.scale(
              scale: _pulseAnimation.value,
              child: FloatingActionButton(
                onPressed: _showAIVoiceSheet,
                backgroundColor: const Color(0xFF00685F),
                child: const Icon(Icons.mic, color: Color(0xFF00F5D4), size: 30),
              ),
            ),
          );
        },
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }

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

  Widget _buildProductCard(Product product) {
    // Get default unit price
    final defaultUnit = product.productUnits.firstWhere(
      (u) => u.isDefault,
      orElse: () => product.productUnits.isNotEmpty
          ? product.productUnits.first
          : ProductUnit(id: 0, productId: product.id, unitName: '', conversionRate: 1, price: 0.0, isDefault: false),
    );

    return InkWell(
      onTap: () => _showUnitSelectionDialog(product),
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
            // Mock product photo area
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF00685F).withValues(alpha: 0.05),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                ),
                child: Center(
                  child: Icon(
                    Icons.inventory_2_outlined,
                    size: 44,
                    color: const Color(0xFF00685F).withValues(alpha: 0.6),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00685F), fontSize: 14),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${defaultUnit.price.toStringAsFixed(0)}đ',
                        style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      Text(
                        '/ ${product.baseUnit}',
                        style: const TextStyle(color: Colors.grey, fontSize: 11),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniCartBar(PosProvider provider) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF00685F),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 10,
            offset: const Offset(0, -4),
          )
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.shopping_cart, color: Color(0xFF00F5D4)),
                const SizedBox(width: 8),
                Text(
                  '${provider.cartCount} sản phẩm',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 12),
                Text(
                  '${provider.cartTotal.toStringAsFixed(0)}đ',
                  style: const TextStyle(color: Color(0xFF00F5D4), fontWeight: FontWeight.bold, fontSize: 18),
                ),
              ],
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00F5D4),
                foregroundColor: const Color(0xFF00685F),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const CartScreen()),
                );
              },
              child: const Row(
                children: [
                  Text('Chi tiết', style: TextStyle(fontWeight: FontWeight.bold)),
                  SizedBox(width: 4),
                  Icon(Icons.chevron_right, size: 18),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildDrawer(PosProvider provider) {
    return Drawer(
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(color: Color(0xFF00685F)),
            currentAccountPicture: CircleAvatar(
              backgroundColor: const Color(0xFFBCC9C6),
              child: Text(
                provider.currentUser?.fullname.substring(0, 1) ?? 'N',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF00685F)),
              ),
            ),
            accountName: Text(
              provider.currentUser?.fullname ?? 'Nhân viên bán hàng',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            accountEmail: Text(
              provider.currentUser?.role ?? 'Cashier',
              style: const TextStyle(color: Colors.white70),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.shopping_basket, color: Color(0xFF00685F)),
            title: const Text('Bán hàng POS'),
            onTap: () {
              Navigator.pop(context);
            },
          ),
          ListTile(
            leading: const Icon(Icons.auto_awesome, color: Color(0xFF00685F)),
            title: Row(
              children: [
                const Text('Đơn hàng nháp AI'),
                const SizedBox(width: 8),
                if (provider.drafts.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10)),
                    child: Text(
                      '${provider.drafts.length}',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  )
              ],
            ),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const AIDraftsScreen()),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.people, color: Color(0xFF00685F)),
            title: const Text('Khách hàng & Thu nợ'),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const CustomerListScreen()),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.history, color: Color(0xFF00685F)),
            title: const Text('Lịch sử đơn hàng'),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const OrderHistoryScreen()),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.assessment, color: Color(0xFF00685F)),
            title: const Text('Báo cáo kết ca'),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const DashboardScreen()),
              );
            },
          ),
          const Divider(),
          const Spacer(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Đăng xuất', style: TextStyle(color: Colors.red)),
            onTap: () async {
              await provider.logout();
              if (mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class AIVoiceAssistantSheet extends StatefulWidget {
  const AIVoiceAssistantSheet({super.key});

  @override
  State<AIVoiceAssistantSheet> createState() => _AIVoiceAssistantSheetState();
}

class _AIVoiceAssistantSheetState extends State<AIVoiceAssistantSheet> with SingleTickerProviderStateMixin {
  bool _isRecording = false;
  String _statusText = 'Nhấn giữ phím Mic bên dưới để bắt đầu nói...';
  String _transcript = '';
  late AnimationController _waveformController;

  @override
  void initState() {
    super.initState();
    _waveformController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
  }

  @override
  void dispose() {
    _waveformController.dispose();
    super.dispose();
  }

  void _startRecording() {
    setState(() {
      _isRecording = true;
      _statusText = 'Hệ thống đang lắng nghe...';
      _waveformController.repeat(reverse: true);
    });
  }

  void _stopRecording() async {
    setState(() {
      _isRecording = false;
      _statusText = 'Đang gửi âm thanh tới AI Service...';
      _waveformController.stop();
    });

    // Simulate networking delay
    await Future.delayed(const Duration(seconds: 2));

    _transcript = "Lấy cho chú Ba 5 thùng Coca-Cola, ghi nợ nghen";

    if (mounted) {
      setState(() {
        _statusText = 'Đã phân tích xong giọng nói!';
      });
      
      // Dispatch draft order parsing creation in local simulator
      final provider = Provider.of<PosProvider>(context, listen: false);
      await provider.simulateAIVoiceOrder(_transcript);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đơn nháp AI đã được đẩy tới danh sách chờ duyệt!')),
        );
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10)),
          ),
          const SizedBox(height: 24),
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.auto_awesome, color: Color(0xFF00F5D4)),
              SizedBox(width: 8),
              Text(
                'Đặt hàng bằng Giọng nói AI',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF00685F)),
              ),
            ],
          ),
          const SizedBox(height: 32),
          Text(
            _statusText,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
          ),
          const SizedBox(height: 24),

          // Waveform visualization
          if (_isRecording)
            SizedBox(
              height: 40,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  return AnimatedBuilder(
                    animation: _waveformController,
                    builder: (context, child) {
                      final scale = 1.0 + (index % 2 == 0 ? _waveformController.value : 1.0 - _waveformController.value) * 1.5;
                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: 4,
                        height: 12 * scale,
                        decoration: BoxDecoration(
                          color: const Color(0xFF00F5D4),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      );
                    },
                  );
                }),
              ),
            )
          else
            const SizedBox(height: 40),
          const SizedBox(height: 24),

          // Big Mic Button holding action
          GestureDetector(
            onLongPressStart: (_) => _startRecording(),
            onLongPressEnd: (_) => _stopRecording(),
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _isRecording ? Colors.red.shade50 : const Color(0xFF00685F).withValues(alpha: 0.05),
                border: Border.all(
                  color: _isRecording ? Colors.red : const Color(0xFF00685F),
                  width: 2,
                ),
              ),
              child: Center(
                child: Icon(
                  Icons.mic,
                  color: _isRecording ? Colors.red : const Color(0xFF00685F),
                  size: 40,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'ẤN GIỮ ĐỂ NÓI',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

