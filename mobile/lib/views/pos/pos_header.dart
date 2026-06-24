import 'package:flutter/material.dart';
import '../../providers/pos_provider.dart';
import '../barcode_scanner_screen.dart';
import '../cart_screen.dart';

class POSHeader extends StatelessWidget implements PreferredSizeWidget {
  final PosProvider provider;
  final Animation<double> cartScaleAnimation;
  final VoidCallback onCartResult;

  const POSHeader({
    super.key,
    required this.provider,
    required this.cartScaleAnimation,
    required this.onCartResult,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
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
          scale: cartScaleAnimation,
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
                    onCartResult();
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
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
