import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import 'cart_screen.dart';
import 'ai_drafts_screen.dart';
import 'customer_list_screen.dart';
import 'order_history_screen.dart';
import 'login_screen.dart';

// Import modular POS and Customer components
import 'pos/pos_header.dart';
import 'pos/pos_bottom_nav.dart';
import 'pos/pos_search_and_customer.dart';
import 'pos/pos_category_list.dart';
import 'pos/pos_product_grid.dart';
import 'pos/voice_recording_overlay.dart';
import 'pos/ai_text_fallback_sheet.dart';
import 'customer/customer_selection_bottom_sheet.dart';
import 'ai_drafts/ai_draft_review_modal.dart';

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

  // Key để gọi stopAndProcess() trên overlay từ bên ngoài
  final GlobalKey<VoiceRecordingOverlayState> _voiceOverlayKey = GlobalKey();

  void _startVoiceRecording() {
    if (_isRecordingVoice) return;
    setState(() => _isRecordingVoice = true);

    showGeneralDialog<String?>(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (dialogContext, anim1, anim2) {
        return VoiceRecordingOverlay(key: _voiceOverlayKey);
      },
    ).then((error) {
      // Dialog đã đóng (sau khi xử lý xong)
      if (!mounted) return;
      setState(() => _isRecordingVoice = false);
      if (error == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(children: [
              Icon(Icons.check_circle, color: Colors.white),
              SizedBox(width: 8),
              Text('AI đã tạo đơn hàng nháp thành công!'),
            ]),
            backgroundColor: const Color(0xFF2D6A4F),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      }
    });
  }

  void _showTextFallbackSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => const AITextFallbackSheet(),
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
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            builder: (context) => CustomerSelectionBottomSheet(provider: provider),
          );
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
          appBar: _currentIndex == 0
              ? POSHeader(
                  provider: provider,
                  cartScaleAnimation: _cartScaleAnimation,
                  onCartResult: () {
                    setState(() {
                      _currentIndex = 0;
                    });
                  },
                )
              : AppBar(
                  automaticallyImplyLeading: false,
                  titleSpacing: 16,
                  title: Text(
                    _currentIndex == 1
                        ? 'Đơn Hàng Nháp AI'
                        : _currentIndex == 2
                            ? 'Khách Hàng & Công Nợ'
                            : 'Báo Cáo & Khác',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      fontSize: 16,
                      fontFamily: 'Inter',
                    ),
                  ),
                  backgroundColor: const Color(0xFF00685F),
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
          bottomNavigationBar: POSBottomNav(
            currentIndex: _currentIndex,
            draftCount: provider.drafts.length,
            onTap: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
          ),
          // FAB mic chỉ hiện khi ở tab bán hàng VÀ giỏ hàng trống
          // Khi có giỏ hàng, nút mic được tích hợp vào mini cart bar
          floatingActionButton: (_currentIndex == 0 && provider.cartCount == 0)
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
                          onLongPress: _showTextFallbackSheet,
                          child: FloatingActionButton(
                            onPressed: _startVoiceRecording,
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
        POSSearchAndCustomer(
          provider: provider,
          searchQuery: _searchQuery,
          searchController: _searchController,
          searchFocusNode: _searchFocusNode,
          onSearchChanged: _onSearchChanged,
          onClearSearch: () {
            _searchController.clear();
            _searchDebounceTimer?.cancel();
            setState(() {
              _searchQuery = '';
            });
          },
        ),
        const SizedBox(height: 12),
        POSCategoryList(
          categories: provider.categories,
          selectedCategoryId: _selectedCategoryId,
          onCategorySelected: (catId) {
            setState(() {
              _selectedCategoryId = catId;
            });
          },
        ),
        const SizedBox(height: 10),
        Expanded(
          child: POSProductGrid(
            filteredProducts: filteredProducts,
            isLoading: provider.isLoading,
            isEmptyProducts: provider.products.isEmpty,
            onAddToCart: () {
              _cartAnimationController.forward(from: 0.0);
            },
          ),
        ),
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



  Widget _buildMiniCartBar(PosProvider provider) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
          children: [
            // Nút mic tích hợp vào mini cart bar
            AnimatedBuilder(
              animation: _pulseAnimation,
              builder: (context, child) {
                return GestureDetector(
                  onTap: _startVoiceRecording,
                  onLongPress: _showTextFallbackSheet,
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF00F5D4).withValues(alpha: 0.3 * _pulseAnimation.value),
                          blurRadius: 10 * _pulseAnimation.value,
                          spreadRadius: 2 * _pulseAnimation.value,
                        )
                      ],
                    ),
                    child: const Icon(Icons.mic, color: Color(0xFF00F5D4), size: 22),
                  ),
                );
              },
            ),
            const SizedBox(width: 12),
            // Thông tin giỏ hàng
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '${provider.cartCount} sản phẩm',
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                  Text(
                    '${provider.cartTotal.toStringAsFixed(0)}đ',
                    style: const TextStyle(
                      color: Color(0xFF00F5D4),
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ],
              ),
            ),
            // Nút vào giỏ hàng
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00F5D4),
                foregroundColor: const Color(0xFF00685F),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Chi tiết', style: TextStyle(fontWeight: FontWeight.bold)),
                  SizedBox(width: 4),
                  Icon(Icons.chevron_right, size: 18),
                ],
              ),
            ),
          ],
        ),
      ),
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
                    showDialog(
                      context: context,
                      builder: (context) => AIDraftReviewModal(
                        draft: draftToConfirm,
                        provider: provider,
                      ),
                    );
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

