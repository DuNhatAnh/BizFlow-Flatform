import 'package:flutter/material.dart';
import '../../providers/pos_provider.dart';
import '../../models/models.dart';
import 'ai_draft_card.dart';

class AIDraftList extends StatelessWidget {
  final PosProvider provider;
  final ValueChanged<Order> onReject;
  final ValueChanged<Order> onEdit;
  final ValueChanged<Order> onConfirm;

  const AIDraftList({
    super.key,
    required this.provider,
    required this.onReject,
    required this.onEdit,
    required this.onConfirm,
  });

  @override
  Widget build(BuildContext context) {
    if (provider.drafts.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFF00CED1).withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF00CED1).withValues(alpha: 0.15),
                      blurRadius: 24,
                      spreadRadius: 4,
                    )
                  ],
                ),
                child: const Icon(
                  Icons.auto_awesome_rounded,
                  color: Color(0xFF008080),
                  size: 64,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Không có đơn hàng nháp nào cần duyệt',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF006565),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Các đơn hàng đặt từ xa qua AI sẽ xuất hiện tại đây để bạn kiểm tra và xác nhận.',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 13,
                  color: Colors.grey.shade600,
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: provider.drafts.length,
      itemBuilder: (context, index) {
        final draft = provider.drafts[index];
        final timeAgo = "${DateTime.now().difference(draft.createdAt).inMinutes} phút trước";
        return AIDraftCard(
          draft: draft,
          timeAgo: timeAgo,
          onReject: () => onReject(draft),
          onEdit: () => onEdit(draft),
          onConfirm: () => onConfirm(draft),
        );
      },
    );
  }
}
