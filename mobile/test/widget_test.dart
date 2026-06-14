import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:bizflow_mobile/main.dart';

void main() {
  testWidgets('Login screen loads successfully smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const BizFlowApp());

    // Verify that we are on the login screen and can see key titles
    expect(find.text('BizFlow Platform'), findsOneWidget);
    expect(find.text('Đăng nhập'), findsOneWidget);

    // Verify username and password fields exist
    expect(find.byType(TextFormField), findsNWidgets(2));
  });
}
