import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/models.dart';
import 'barcode_scanner_screen.dart';
import 'cart_screen.dart';
import 'ai_drafts_screen.dart';
import 'customer_list_screen.dart';
import 'order_history_screen.dart';

import 'login_screen.dart';

class POSScreen extends StatefulWidget {
  const POSScreen({super.key});

  @override
  State<POSScreen> createState() => _POSScreenState();
}

class _POSScreenState extends State<POSScreen> with TickerProviderStateMixin {
  int _currentIndex = 0;
  int _selectedCategoryId = 0; // 0 means 'All'
  String _searchQuery = '';
  final _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();

  // Pulse animation controller for the Neon AI button
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  // Scale animation for the Cart button in AppBar
  late AnimationController _cartAnimationController;
  late Animation<double> _cartScaleAnimation;

  Timer? _searchDebounceTimer;
  bool _isRecordingVoice = false;

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

    _cartAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _cartScaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween<double>(begin: 1.0, end: 1.3), weight: 50),
      TweenSequenceItem(tween: Tween<double>(begin: 1.3, end: 1.0), weight: 50),
    ]).animate(_cartAnimationController);

    // Refresh POS data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PosProvider>(context, listen: false).loadPOSData();
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _cartAnimationController.dispose();
    _searchController.dispose();
    _searchFocusNode.dispose();
    _searchDebounceTimer?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _searchDebounceTimer?.cancel();
    _searchDebounceTimer = Timer(const Duration(milliseconds: 300), () {
      setState(() {
        _searchQuery = query;
      });
    });
  }

  void _startVoiceRecording() {
    setState(() {
      _isRecordingVoice = true;
    });
    showGeneralDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (dialogContext, anim1, anim2) {
        return _VoiceRecordingOverlayWidget();
      },
    );
  }

  void _stopVoiceRecording() async {
    if (!_isRecordingVoice) return;
    setState(() {
      _isRecordingVoice = false;
    });
    Navigator.of(context).pop();

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
            ),
            SizedBox(width: 12),
            Text('Đang xử lý giọng nói AI...'),
          ],
        ),
        duration: Duration(seconds: 2),
      ),
    );

    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    final provider = Provider.of<PosProvider>(context, listen: false);
    await provider.simulateAIVoiceOrder("Lấy cho chú Ba 5 thùng Coca-Cola, ghi nợ nghen");

    if (mounted) {
      ScaffoldMessenger.of(context).clearSnackBars();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.white),
              SizedBox(width: 8),
              Text('AI đã tạo đơn hàng nháp thành công!'),
            ],
          ),
          backgroundColor: const Color(0xFF2D6A4F),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  void _showAITextFallbackSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return const AITextFallbackSheet();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<PosProvider>(context);

    return CallbackShortcuts(
      bindings: <ShortcutActivator, VoidCallback>{
        const SingleActivator(LogicalKeyboardKey.f2): () {
          _searchFocusNode.requestFocus();
        },
        const SingleActivator(LogicalKeyboardKey.f4): () {
          _showCustomerSelectionSheet(provider);
        },
        const SingleActivator(LogicalKeyboardKey.f8): () {
          setState(() {
            _currentIndex = 1;
          });
        },
        const SingleActivator(LogicalKeyboardKey.f9): () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CartScreen()),
          );
          if (result == true) {
            setState(() {
              _currentIndex = 0;
            });
          }
        },
        const SingleActivator(LogicalKeyboardKey.escape): () {
          if (provider.cartCount > 0) {
            showDialog(
              context: context,
              builder: (context) => AlertDialog(
                title: const Text('Hủy đơn hàng'),
                content: const Text('Bạn có chắc chắn muốn hủy đơn hàng hiện tại?'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Hủy bỏ'),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFBA1A1A),
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () {
                      provider.clearCart();
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Đã hủy đơn hàng thành công!'),
                          backgroundColor: Color(0xFFBA1A1A),
                        ),
                      );
                    },
                    child: const Text('Xác nhận'),
                  ),
                ],
              ),
            );
          }
        },
      },
      child: Focus(
        autofocus: true,
        child: Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        titleSpacing: 16,
        title: Text(
          provider.currentUser?.tenantName ?? 'Đại lý Kim Vy',
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
            fontSize: 16,
            fontFamily: 'Inter',
          ),
        ),
        backgroundColor: const Color(0xFF00685F),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner, color: Colors.white),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const BarcodeScannerScreen()),
              );
            },
          ),
          ScaleTransition(
            scale: _cartScaleAnimation,
            child: Stack(
              children: [
                IconButton(
                  icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white),
                  onPressed: () async {
                    final result = await Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const CartScreen()),
                    );
                    if (result == true) {
                      setState(() {
                        _currentIndex = 0;
                      });
                    }
                  },
                ),
                if (provider.cartCount > 0)
                  Positioned(
                    right: 6,
                    top: 6,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: Colors.redAccent,
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF00685F), width: 1.5),
                      ),
                      constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                      child: Text(
                        '${provider.cartCount}',
                        style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Stack(
        children: [
          IndexedStack(
            index: _currentIndex,
            children: [
              _buildSalesBody(provider),
              AIDraftsScreen(
                isEmbedded: true,
                onSwitchTab: (index) {
                  setState(() {
                    _currentIndex = index;
                  });
                },
              ),
              const CustomerListScreen(isEmbedded: true),
              _buildMoreMenuBody(provider),
            ],
          ),
          if (provider.latestDraftNotification != null)
            _buildAIToast(provider),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF00685F),
        unselectedItemColor: Colors.grey.shade500,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
        unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 11),
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.point_of_sale_outlined),
            activeIcon: Icon(Icons.point_of_sale),
            label: 'Bán hàng',
          ),
          BottomNavigationBarItem(
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.auto_awesome_outlined),
                if (provider.drafts.isNotEmpty)
                  Positioned(
                    right: -6,
                    top: -6,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: const BoxDecoration(
                        color: Colors.redAccent,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                      child: Text(
                        '${provider.drafts.length}',
                        style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            activeIcon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.auto_awesome),
                if (provider.drafts.isNotEmpty)
                  Positioned(
                    right: -6,
                    top: -6,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: const BoxDecoration(
                        color: Colors.redAccent,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                      child: Text(
                        '${provider.drafts.length}',
                        style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            label: 'Đơn nháp AI',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.people_outline),
            activeIcon: Icon(Icons.people),
            label: 'Khách hàng',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.more_horiz),
            label: 'Thêm',
          ),
        ],
      ),
      floatingActionButton: _currentIndex == 0
          ? AnimatedBuilder(
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
                    child: GestureDetector(
                      onLongPressStart: (_) => _startVoiceRecording(),
                      onLongPressEnd: (_) => _stopVoiceRecording(),
                      onTap: _showAITextFallbackSheet,
                      child: FloatingActionButton(
                        onPressed: () {}, // Handled by GestureDetector
                        backgroundColor: const Color(0xFF00685F),
                        child: const Icon(Icons.mic, color: Color(0xFF00F5D4), size: 30),
                      ),
                    ),
                  ),
                );
              },
            )
          : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
        ),
      ),
    );
  }

  Widget _buildSalesBody(PosProvider provider) {
    final filteredProducts = provider.products.where((p) {
      final matchesCategory = _selectedCategoryId == 0 || p.categoryId == _selectedCategoryId;
      final matchesSearch = p.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (p.code != null && p.code!.contains(_searchQuery));
      return matchesCategory && matchesSearch;
    }).toList();

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
                    focusNode: _searchFocusNode,
                    controller: _searchController,
                    onChanged: _onSearchChanged,
                    decoration: InputDecoration(
                      hintText: 'Tìm nhanh mặt hàng [F2]...',
                      prefixIcon: const Icon(Icons.search, color: Colors.grey),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, color: Colors.grey),
                              onPressed: () {
                                _searchController.clear();
                                _searchDebounceTimer?.cancel();
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

        // 1.5 Customer Selection Bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 2.0),
          child: InkWell(
            onTap: () => _showCustomerSelectionSheet(provider),
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
                          ? 'Khách hàng: ${provider.selectedCustomer!.fullname} (${provider.selectedCustomer!.phone ?? "Không có SĐT"}) [F4]'
                          : 'Khách hàng: Khách lẻ [F4] (Chạm để thay đổi)',
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

        // 2. Category Tab list
        const SizedBox(height: 8),
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
    );
  }

  void _printMockShiftReport(double initialCash, double cashRevenue, double transferRevenue) {
    final provider = Provider.of<PosProvider>(context, listen: false);
    final tenantName = provider.currentUser?.tenantName ?? 'Đại lý Kim Vy';
    final employeeName = provider.currentUser?.fullname ?? 'Nhân viên';
    final dateStr = DateTime.now().toLocal().toString().split('.').first;

    final buffer = StringBuffer();
    buffer.writeln("==================================================");
    buffer.writeln("             END OF SHIFT HANDOVER REPORT         ");
    buffer.writeln("==================================================");
    buffer.writeln("Cửa Hàng: $tenantName");
    buffer.writeln("Nhân Viên: $employeeName");
    buffer.writeln("Thời Gian Kết Ca: $dateStr");
    buffer.writeln("--------------------------------------------------");
    buffer.writeln("Tiền Mặt Đầu Ca:                    ${initialCash.toStringAsFixed(0)}đ");
    buffer.writeln("Doanh Thu Tiền Mặt:                 ${cashRevenue.toStringAsFixed(0)}đ");
    buffer.writeln("Doanh Thu Chuyển Khoản:             ${transferRevenue.toStringAsFixed(0)}đ");
    buffer.writeln("--------------------------------------------------");
    buffer.writeln("TỔNG TIỀN MẶT BÀN GIAO:             ${(initialCash + cashRevenue).toStringAsFixed(0)}đ");
    buffer.writeln("==================================================");
    buffer.writeln("         CA TRỰC ĐÃ ĐƯỢC BÀN GIAO THÀNH CÔNG       ");
    buffer.writeln("==================================================");

    debugPrint(buffer.toString());
  }

  void _showEndOfShiftReportBottomSheet(PosProvider provider) {
    const double initialCash = 2000000.0; // Fixed initial drawer cash
    final double cashRevenue = provider.shiftSummary?.cashRevenue ?? 0.0;
    final double transferRevenue = provider.shiftSummary?.transferRevenue ?? 0.0;
    final double totalHandover = initialCash + cashRevenue;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 16),
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.assessment_outlined, color: Color(0xFF00685F)),
                  SizedBox(width: 8),
                  Text(
                    'Báo cáo kết ca & Bàn giao',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF00685F), fontFamily: 'Inter'),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Shift stats table
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF7F9FB),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Tiền mặt đầu ca:', style: TextStyle(color: Colors.grey, fontSize: 13, fontFamily: 'Inter')),
                        Text('${initialCash.toStringAsFixed(0)}đ', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'Inter')),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Doanh thu tiền mặt:', style: TextStyle(color: Colors.grey, fontSize: 13, fontFamily: 'Inter')),
                        Text('${cashRevenue.toStringAsFixed(0)}đ', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'Inter')),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Doanh thu chuyển khoản:', style: TextStyle(color: Colors.grey, fontSize: 13, fontFamily: 'Inter')),
                        Text('${transferRevenue.toStringAsFixed(0)}đ', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'Inter')),
                      ],
                    ),
                    const Divider(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Tổng tiền mặt bàn giao:',
                          style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00685F), fontSize: 14, fontFamily: 'Inter'),
                        ),
                        Text(
                          '${totalHandover.toStringAsFixed(0)}đ',
                          style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF00685F), fontSize: 16, fontFamily: 'Inter'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00685F),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () async {
                  // Confirm shift reports actions
                  _printMockShiftReport(initialCash, cashRevenue, transferRevenue);
                  
                  final navigator = Navigator.of(context);
                  final messenger = ScaffoldMessenger.of(context);

                  // Pop BottomSheet
                  navigator.pop();

                  // Show Success SnackBar
                  messenger.showSnackBar(
                    SnackBar(
                      content: const Row(
                        children: [
                          Icon(Icons.check_circle, color: Colors.white),
                          SizedBox(width: 8),
                          Text('Báo cáo bàn giao ca thành công! Đang đăng xuất...'),
                        ],
                      ),
                      backgroundColor: const Color(0xFF2D6A4F),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  );

                  await Future.delayed(const Duration(seconds: 1));
                  
                  // Perform system logout
                  await provider.logout();
                  navigator.pushAndRemoveUntil(
                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                    (route) => false,
                  );
                },
                child: const Text(
                  'XÁC NHẬN KẾ CA',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, fontFamily: 'Inter'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showPrinterSettingsDialog(PosProvider provider) {
    String printerType = 'Bluetooth';
    final controller = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Row(
                children: [
                  Icon(Icons.print, color: Color(0xFF00685F)),
                  SizedBox(width: 8),
                  Text('Cấu hình máy in bill', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Phương thức kết nối:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  DropdownButton<String>(
                    isExpanded: true,
                    value: printerType,
                    items: const [
                      DropdownMenuItem(value: 'Bluetooth', child: Text('Bluetooth')),
                      DropdownMenuItem(value: 'Wi-Fi', child: Text('Wi-Fi (TCP/IP)')),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setDialogState(() {
                          printerType = val;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 12),
                  const Text('Thông tin kết nối:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  const SizedBox(height: 4),
                  TextField(
                    controller: controller,
                    decoration: InputDecoration(
                      hintText: printerType == 'Bluetooth' ? 'Ví dụ: K-Thermal Printer' : 'Ví dụ: 192.168.1.100',
                      border: const OutlineInputBorder(),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    // Test print mock
                    debugPrint("------ TEST PRINT THERMAL ------");
                    debugPrint("Connected to printer: [$printerType] ${controller.text}");
                    debugPrint("Print status: SUCCESS");
                    debugPrint("--------------------------------");
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Lệnh in thử nghiệm đã được gửi!'), backgroundColor: Color(0xFF2D6A4F)),
                    );
                  },
                  child: const Text('In thử nghiệm'),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Hủy'),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00685F), foregroundColor: Colors.white),
                  onPressed: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Đã lưu cấu hình máy in thành công!'), backgroundColor: Color(0xFF2D6A4F)),
                    );
                  },
                  child: const Text('Lưu cấu hình'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _handleLogoutAction(PosProvider provider) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Đăng xuất'),
        content: const Text('Bạn có chắc chắn muốn đăng xuất ca trực?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFBA1A1A), foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Đăng xuất'),
          ),
        ],
      ),
    );
    if (confirm == true) {
      await provider.logout();
      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const LoginScreen()),
          (route) => false,
        );
      }
    }
  }

  Widget _buildMoreMenuBody(PosProvider provider) {
    final employeeName = provider.currentUser?.fullname ?? 'Nhân viên bán hàng';
    final role = provider.currentUser?.role ?? 'Employee';
    final tenantName = provider.currentUser?.tenantName ?? 'Đại lý Kim Vy';

    return Container(
      color: const Color(0xFFF7F9FB),
      child: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // 1. Employee Profile Card
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              side: BorderSide(color: Colors.grey.shade200),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: const Color(0xFF00685F).withValues(alpha: 0.1),
                    child: Text(
                      employeeName.isNotEmpty ? employeeName.substring(0, 1).toUpperCase() : 'E',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF00685F)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          employeeName,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF00685F)),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Vai trò: $role',
                          style: const TextStyle(color: Colors.grey, fontSize: 13),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.store, color: Color(0xFF00685F), size: 16),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                tenantName,
                                style: const TextStyle(color: Colors.black87, fontSize: 12),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // 2. Navigation items
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              side: BorderSide(color: Colors.grey.shade200),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.history, color: Color(0xFF00685F)),
                  title: const Text('Lịch sử đơn hàng', style: TextStyle(fontWeight: FontWeight.w600, fontFamily: 'Inter')),
                  trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const OrderHistoryScreen()),
                    );
                  },
                ),
                const Divider(height: 1, indent: 56),
                ListTile(
                  leading: const Icon(Icons.assessment, color: Color(0xFF00685F)),
                  title: const Text('Báo cáo kết ca', style: TextStyle(fontWeight: FontWeight.w600, fontFamily: 'Inter')),
                  trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                  onTap: () => _showEndOfShiftReportBottomSheet(provider),
                ),
                const Divider(height: 1, indent: 56),
                ListTile(
                  leading: const Icon(Icons.print, color: Color(0xFF00685F)),
                  title: const Text('Cài đặt máy in', style: TextStyle(fontWeight: FontWeight.w600, fontFamily: 'Inter')),
                  trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                  onTap: () => _showPrinterSettingsDialog(provider),
                ),
                const Divider(height: 1, indent: 56),
                ListTile(
                  leading: const Icon(Icons.logout, color: Color(0xFFBA1A1A)),
                  title: const Text(
                    'Đăng xuất',
                    style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFFBA1A1A), fontFamily: 'Inter'),
                  ),
                  trailing: const Icon(Icons.chevron_right, color: Color(0xFFBA1A1A)),
                  onTap: () => _handleLogoutAction(provider),
                ),
              ],
            ),
          ),
        ],
      ),
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
    return ProductCardWidget(
      product: product,
      onAddToCart: () {
        _cartAnimationController.forward(from: 0.0);
      },
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
              onPressed: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const CartScreen()),
                );
                if (result == true) {
                  setState(() {
                    _currentIndex = 0;
                  });
                }
              },
              child: const Row(
                children: [
                  Text('Chi tiết [F9]', style: TextStyle(fontWeight: FontWeight.bold)),
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

  // -------------------------------------------------------------
  // HELPER METHODS FOR NEW GAPS
  // -------------------------------------------------------------

  void _showCustomerSelectionSheet(PosProvider provider) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return CustomerSelectionBottomSheet(provider: provider);
      },
    );
  }

  void _showReviewDialog(Order draft) {
    final provider = Provider.of<PosProvider>(context, listen: false);

    // Create a mutable copy of items for edit simulation
    List<OrderItem> editableItems = List.from(draft.orderItems);
    Customer? selectedCustomer = provider.customers.firstWhere(
      (c) => c.id == draft.customerId,
      orElse: () => Customer(id: '', tenantId: draft.tenantId, fullname: 'Khách Lẻ', totalDebt: 0.0),
    );
    if (selectedCustomer.id == '') {
      selectedCustomer = null;
    }
    String paymentMethod = draft.paymentMethod;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            double draftTotal = editableItems.fold(0.0, (sum, i) => sum + i.totalPrice);

            return AlertDialog(
              title: const Row(
                children: [
                  Icon(Icons.auto_awesome, color: Color(0xFF00F5D4)),
                  SizedBox(width: 8),
                  Text('Duyệt đơn hàng AI', style: TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
              content: SizedBox(
                width: double.maxFinite,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Customer select info
                      const Text('Khách hàng được gán:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      const SizedBox(height: 4),
                      DropdownButton<String>(
                        isExpanded: true,
                        value: selectedCustomer == null ? '' : selectedCustomer!.id,
                        items: [
                          const DropdownMenuItem(value: '', child: Text('Khách Lẻ')),
                          ...provider.customers.map((c) => DropdownMenuItem(value: c.id, child: Text(c.fullname))),
                        ],
                        onChanged: (val) {
                          setDialogState(() {
                            if (val == null || val.isEmpty) {
                              selectedCustomer = null;
                            } else {
                              selectedCustomer = provider.customers.firstWhere((c) => c.id == val);
                            }
                          });
                        },
                      ),
                      const SizedBox(height: 12),

                      // Payment Method
                      const Text('Phương thức thanh toán:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Expanded(
                            child: RadioListTile<String>(
                              title: const Text('Mặt', style: TextStyle(fontSize: 12)),
                              value: 'Cash',
                              groupValue: paymentMethod,
                              onChanged: (val) => setDialogState(() => paymentMethod = val!),
                            ),
                          ),
                          Expanded(
                            child: RadioListTile<String>(
                              title: const Text('Nợ', style: TextStyle(fontSize: 12)),
                              value: 'Debt',
                              groupValue: paymentMethod,
                              onChanged: (val) => setDialogState(() => paymentMethod = val!),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      const Text('Chi tiết sản phẩm:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      const Divider(),

                      ...List.generate(editableItems.length, (index) {
                        final item = editableItems[index];
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  '${item.productName} (${item.unitName})',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                              ),
                              Row(
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.remove, size: 18),
                                    onPressed: () {
                                      setDialogState(() {
                                        if (item.quantity > 1) {
                                          editableItems[index] = OrderItem(
                                            productId: item.productId,
                                            productUnitId: item.productUnitId,
                                            productName: item.productName,
                                            unitName: item.unitName,
                                            quantity: item.quantity - 1,
                                            unitPrice: item.unitPrice,
                                            totalPrice: item.unitPrice * (item.quantity - 1),
                                          );
                                        } else {
                                          editableItems.removeAt(index);
                                        }
                                      });
                                    },
                                  ),
                                  Text('${item.quantity}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                  IconButton(
                                    icon: const Icon(Icons.add, size: 18),
                                    onPressed: () {
                                      setDialogState(() {
                                        editableItems[index] = OrderItem(
                                          productId: item.productId,
                                          productUnitId: item.productUnitId,
                                          productName: item.productName,
                                          unitName: item.unitName,
                                          quantity: item.quantity + 1,
                                          unitPrice: item.unitPrice,
                                          totalPrice: item.unitPrice * (item.quantity + 1),
                                        );
                                      });
                                    },
                                  ),
                                ],
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '${item.totalPrice.toStringAsFixed(0)}đ',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              )
                            ],
                          ),
                        );
                      }),

                      const Divider(),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Tổng tiền đơn duyệt:', style: TextStyle(fontWeight: FontWeight.bold)),
                          Text(
                            '${draftTotal.toStringAsFixed(0)}đ',
                            style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 18),
                          ),
                        ],
                      )
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Hủy'),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00685F), foregroundColor: Colors.white),
                  onPressed: () async {
                    if (paymentMethod == 'Debt' && (selectedCustomer == null || selectedCustomer!.id.isEmpty)) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Vui lòng chọn khách hàng đăng ký để thực hiện ghi nợ'), backgroundColor: Colors.red),
                      );
                      return;
                    }

                    final updatedOrder = Order(
                      id: draft.id,
                      tenantId: draft.tenantId,
                      customerId: selectedCustomer?.id.isEmpty ?? true ? null : selectedCustomer!.id,
                      createdBy: draft.createdBy,
                      totalAmount: draftTotal,
                      paymentMethod: paymentMethod,
                      status: 'Completed',
                      orderSource: draft.orderSource,
                      createdAt: draft.createdAt,
                      orderItems: editableItems,
                    );

                    final success = await provider.confirmAIDraft(draft.id, updatedOrder);
                    if (context.mounted) {
                      Navigator.pop(context);
                      if (success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Đơn hàng AI đã được thanh toán & in hóa đơn thành công!')),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(provider.errorMessage ?? 'Không thể duyệt đơn nháp này')),
                        );
                      }
                    }
                  },
                  child: const Text('Xác nhận & In bill'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildAIToast(PosProvider provider) {
    final draft = provider.latestDraftNotification;
    if (draft == null) return const SizedBox.shrink();

    final customer = draft.customerName ?? 'Khách lẻ';
    final itemsStr = draft.orderItems.map((i) => '${i.productName} x${i.quantity}').join(', ');
    final summary = 'Khách: $customer - $itemsStr';

    return Positioned(
      top: 12,
      left: 12,
      right: 12,
      child: Material(
        color: Colors.transparent,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF00F5D4), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 12,
                offset: const Offset(0, 4),
              )
            ],
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFF00F5D4).withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.auto_awesome,
                  color: Color(0xFF00685F),
                  size: 18,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Có đơn nháp AI mới!',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: Color(0xFF00685F),
                      ),
                    ),
                    const SizedBox(height: 1),
                    Text(
                      summary,
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade700,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 4),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00685F),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                onPressed: () {
                  final draftToConfirm = provider.latestDraftNotification;
                  provider.clearLatestDraftNotification();
                  if (draftToConfirm != null) {
                    _showReviewDialog(draftToConfirm);
                  }
                },
                child: const Text(
                  'Xem & Duyệt',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
              IconButton(
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                icon: const Icon(Icons.close, size: 18, color: Colors.grey),
                onPressed: () {
                  provider.clearLatestDraftNotification();
                },
              ),
            ],
          ),
        ),
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

class ProductCardWidget extends StatefulWidget {
  final Product product;
  final VoidCallback onAddToCart;
  const ProductCardWidget({
    super.key,
    required this.product,
    required this.onAddToCart,
  });

  @override
  State<ProductCardWidget> createState() => _ProductCardWidgetState();
}

class _ProductCardWidgetState extends State<ProductCardWidget> {
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

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final formattedPrice = "${_selectedUnit.price.toStringAsFixed(0)}đ";
    final stockText = "Tồn: ${product.stock.toStringAsFixed(0)} ${product.baseUnit}";

    return Container(
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
            child: InkWell(
              onTap: () {
                Provider.of<PosProvider>(context, listen: false).addToCart(product, _selectedUnit);
                widget.onAddToCart();
              },
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
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
                      itemCount: product.productUnits.length,
                      itemBuilder: (context, idx) {
                        final unit = product.productUnits[idx];
                        final isSelected = unit.id == _selectedUnit.id;
                        return Container(
                          margin: const EdgeInsets.only(right: 4),
                          child: InkWell(
                            onTap: () {
                              setState(() {
                                _selectedUnit = unit;
                              });
                            },
                            borderRadius: BorderRadius.circular(6),
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
    );
  }
}

class _VoiceRecordingOverlayWidget extends StatefulWidget {
  @override
  State<_VoiceRecordingOverlayWidget> createState() => _VoiceRecordingOverlayWidgetState();
}

class _VoiceRecordingOverlayWidgetState extends State<_VoiceRecordingOverlayWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Material(
        color: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.15),
                blurRadius: 20,
              ),
            ],
          ),
          width: 280,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.auto_awesome, color: Color(0xFF00F5D4), size: 40),
              const SizedBox(height: 16),
              const Text(
                'Đang lắng nghe...',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF00685F),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Nói yêu cầu đặt hàng của bạn và thả tay ra',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 24),
              SizedBox(
                height: 40,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    return AnimatedBuilder(
                      animation: _controller,
                      builder: (context, child) {
                        final scale = 1.0 + (index % 2 == 0 ? _controller.value : 1.0 - _controller.value) * 2.0;
                        return Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: 4,
                          height: 10 * scale,
                          decoration: BoxDecoration(
                            color: const Color(0xFF00F5D4),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        );
                      },
                    );
                  }),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class AITextFallbackSheet extends StatefulWidget {
  const AITextFallbackSheet({super.key});

  @override
  State<AITextFallbackSheet> createState() => _AITextFallbackSheetState();
}

class _AITextFallbackSheetState extends State<AITextFallbackSheet> {
  final _textController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  void _submitTextOrder() async {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _isLoading = true;
    });

    await Future.delayed(const Duration(seconds: 1));
    if (!mounted) return;
    final provider = Provider.of<PosProvider>(context, listen: false);
    await provider.simulateAIVoiceOrder(text);

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.white),
              SizedBox(width: 8),
              Text('AI đã tạo đơn hàng nháp thành công!'),
            ],
          ),
          backgroundColor: const Color(0xFF2D6A4F),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
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
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
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
            const Row(
              children: [
                Icon(Icons.auto_awesome, color: Color(0xFF00F5D4)),
                SizedBox(width: 8),
                Text(
                  'Trợ lý ảo AI (Nhập câu lệnh)',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Color(0xFF00685F),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'Gợi ý: "Lấy cho chú Ba 5 bao xi măng Hà Tiên, ghi nợ nghen"',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _textController,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Nhập yêu cầu đặt hàng bằng chữ...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                  borderSide: BorderSide(color: Color(0xFF00685F), width: 2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00685F),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onPressed: _isLoading ? null : _submitTextOrder,
              child: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text('Gửi câu lệnh', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}


