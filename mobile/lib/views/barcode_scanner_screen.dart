import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';

class BarcodeScannerScreen extends StatefulWidget {
  const BarcodeScannerScreen({super.key});

  @override
  State<BarcodeScannerScreen> createState() => _BarcodeScannerScreenState();
}

class _BarcodeScannerScreenState extends State<BarcodeScannerScreen> with SingleTickerProviderStateMixin {
  late AnimationController _laserController;
  late Animation<double> _laserAnimation;
  bool _flashOn = false;

  final _barcodeInputController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _laserController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _laserAnimation = Tween<double>(begin: 0.1, end: 0.9).animate(_laserController);
  }

  @override
  void dispose() {
    _laserController.dispose();
    _barcodeInputController.dispose();
    super.dispose();
  }

  void _processBarcode(String code) {
    if (code.isEmpty) return;

    final provider = Provider.of<PosProvider>(context, listen: false);

    // Look for product matching code
    final matches = provider.products.where((p) => p.code == code).toList();

    if (matches.isNotEmpty) {
      final product = matches.first;
      final defaultUnit = product.productUnits.firstWhere(
        (u) => u.isDefault,
        orElse: () => product.productUnits.first,
      );

      // Add to cart
      provider.addToCart(product, defaultUnit);

      // Feedback sound & vibrate simulation
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: Color(0xFF00F5D4)),
              const SizedBox(width: 8),
              Text('TÍT! Đã thêm ${product.name} vào giỏ hàng'),
            ],
          ),
          backgroundColor: const Color(0xFF00685F),
          behavior: SnackBarBehavior.floating,
        ),
      );

      Navigator.pop(context);
    } else {
      // Not found
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: Colors.red),
              SizedBox(width: 8),
              Text('Không tìm thấy'),
            ],
          ),
          content: Text('Mã vạch "$code" không khớp với bất kỳ sản phẩm nào thuộc cửa hàng này.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Quét lại'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<PosProvider>(context);

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Quét mã vạch sản phẩm', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: Icon(_flashOn ? Icons.flash_on : Icons.flash_off, color: Colors.white),
            onPressed: () {
              setState(() {
                _flashOn = !_flashOn;
              });
            },
          )
        ],
      ),
      body: Column(
        children: [
          // 1. Mock Camera Viewport
          Expanded(
            flex: 3,
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Stack(
                children: [
                  // Camera Box Border
                  Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white54, width: 2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),

                  // Laser beam line animation
                  AnimatedBuilder(
                    animation: _laserAnimation,
                    builder: (context, child) {
                      return Positioned(
                        left: 10,
                        right: 10,
                        top: MediaQuery.of(context).size.height * 0.45 * _laserAnimation.value,
                        child: Container(
                          height: 3,
                          decoration: const BoxDecoration(
                            color: Colors.red,
                            boxShadow: [
                              BoxShadow(color: Colors.red, blurRadius: 8, spreadRadius: 2),
                            ],
                          ),
                        ),
                      );
                    },
                  ),

                  // Helper center text
                  const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.qr_code, color: Colors.white30, size: 80),
                        SizedBox(height: 12),
                        Text(
                          'Căn chỉnh mã vạch vào khung hình',
                          style: TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),

          // 2. Demo Trigger Panel
          Expanded(
            flex: 2,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Color(0xFF00685F),
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'GIẢ LẬP QUÉT MÃ VẠCH (DEV MODE)',
                    style: TextStyle(color: Color(0xFFBCC9C6), fontWeight: FontWeight.bold, fontSize: 12),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),

                  // Selection of seeded products barcodes
                  const Text('Chọn mã sản phẩm có sẵn để giả lập:', style: TextStyle(color: Colors.white70, fontSize: 11)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: provider.products.where((p) => p.code != null && p.code!.isNotEmpty).map((p) {
                      return ActionChip(
                        label: Text(p.name, style: const TextStyle(fontSize: 12)),
                        onPressed: () => _processBarcode(p.code!),
                        backgroundColor: Colors.white,
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),

                  // Manual Input fallback
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _barcodeInputController,
                          style: const TextStyle(color: Colors.white),
                          decoration: const InputDecoration(
                            hintText: 'Nhập mã vạch thủ công...',
                            hintStyle: TextStyle(color: Colors.white30),
                            border: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white30)),
                            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white30)),
                          ),
                          onSubmitted: (val) {
                            _processBarcode(val.trim());
                            _barcodeInputController.clear();
                          },
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.arrow_forward, color: Color(0xFF00F5D4)),
                        onPressed: () {
                          _processBarcode(_barcodeInputController.text.trim());
                          _barcodeInputController.clear();
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}

