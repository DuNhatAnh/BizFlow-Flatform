import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/models.dart';

class ApiService {
  static String baseUrl = 'http://10.0.2.2:5178'; // Android emulator-friendly host loopback IP
  final _storage = const FlutterSecureStorage();


  Future<Map<String, String>> _getHeaders([String? tenantId]) async {
    final token = await _storage.read(key: 'access_token');
    final tid = tenantId ?? await _storage.read(key: 'tenant_id');

    final Map<String, String> headers = {
      'Content-Type': 'application/json',
    };

    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    if (tid != null) {
      headers['X-Tenant-Id'] = tid;
    }

    return headers;
  }

  Future<User?> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': username, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final user = User.fromJson(data);

        await _storage.write(key: 'access_token', value: data['accessToken']);
        await _storage.write(key: 'tenant_id', value: data['tenantId']);
        await _storage.write(key: 'user_id', value: data['userId']);
        await _storage.write(key: 'fullname', value: data['fullname']);
        await _storage.write(key: 'role', value: data['role']);

        return user;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'tenant_id');
    await _storage.delete(key: 'user_id');
    await _storage.delete(key: 'fullname');
    await _storage.delete(key: 'role');
  }

  Future<List<Category>> fetchCategories(String tenantId) async {
    try {
      final headers = await _getHeaders(tenantId);
      final response = await http.get(
        Uri.parse('$baseUrl/api/categories?tenantId=$tenantId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((item) => Category.fromJson(item)).toList();
      }
    } catch (e) {
      // Offline fallback or error
    }
    return [];
  }

  Future<List<Product>> fetchProducts(String tenantId) async {
    try {
      final headers = await _getHeaders(tenantId);
      final response = await http.get(
        Uri.parse('$baseUrl/api/products?tenantId=$tenantId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((item) => Product.fromJson(item)).toList();
      }
    } catch (e) {
      // Error
    }
    return [];
  }

  Future<List<Customer>> fetchCustomers(String tenantId, {String? search}) async {
    try {
      final headers = await _getHeaders(tenantId);
      var url = '$baseUrl/api/customers?tenantId=$tenantId';
      if (search != null && search.isNotEmpty) {
        url += '&search=${Uri.encodeComponent(search)}';
      }

      final response = await http.get(Uri.parse(url), headers: headers);
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((item) => Customer.fromJson(item)).toList();
      }
    } catch (e) {
      // Error
    }
    return [];
  }

  Future<Customer?> createCustomer(String tenantId, String fullname, String? phone) async {
    try {
      final headers = await _getHeaders(tenantId);
      final response = await http.post(
        Uri.parse('$baseUrl/api/customers'),
        headers: headers,
        body: jsonEncode({
          'tenantId': tenantId,
          'fullname': fullname,
          'phone': phone,
        }),
      );

      if (response.statusCode == 200) {
        return Customer.fromJson(jsonDecode(response.body));
      }
    } catch (e) {
      // Error
    }
    return null;
  }

  Future<bool> collectDebt(String tenantId, String customerId, double amount, String paymentMethod) async {
    try {
      final headers = await _getHeaders(tenantId);
      final response = await http.post(
        Uri.parse('$baseUrl/api/customers/debt-pay'),
        headers: headers,
        body: jsonEncode({
          'tenantId': tenantId,
          'customerId': customerId,
          'amount': amount,
          'paymentMethod': paymentMethod,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Future<Order?> createOrder(Order order) async {
    try {
      final headers = await _getHeaders(order.tenantId);
      final response = await http.post(
        Uri.parse('$baseUrl/api/orders'),
        headers: headers,
        body: jsonEncode(order.toJson()),
      );

      if (response.statusCode == 200) {
        return Order.fromJson(jsonDecode(response.body));
      } else {
        final err = jsonDecode(response.body);
        throw Exception(err['message'] ?? err['Message'] ?? 'Lỗi khi tạo đơn hàng');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> cancelOrder(String orderId, String tenantId) async {
    try {
      final headers = await _getHeaders(tenantId);
      final response = await http.post(
        Uri.parse('$baseUrl/api/orders/$orderId/cancel?tenantId=$tenantId'),
        headers: headers,
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Future<List<Order>> fetchOrders(String tenantId, {String? date, String? source}) async {
    try {
      final headers = await _getHeaders(tenantId);
      var url = '$baseUrl/api/orders?tenantId=$tenantId';
      if (date != null && date.isNotEmpty) {
        url += '&dateStr=$date';
      }
      if (source != null && source.isNotEmpty) {
        url += '&sourceStr=$source';
      }

      final response = await http.get(Uri.parse(url), headers: headers);
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((item) => Order.fromJson(item)).toList();
      }
    } catch (e) {
      // Error
    }
    return [];
  }

  Future<List<Order>> fetchDrafts(String tenantId) async {
    try {
      final headers = await _getHeaders(tenantId);
      final response = await http.get(
        Uri.parse('$baseUrl/api/orders/drafts?tenantId=$tenantId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((item) => Order.fromJson(item)).toList();
      }
    } catch (e) {
      // Error
    }
    return [];
  }

  Future<Order?> createDraft(Order order) async {
    try {
      final headers = await _getHeaders(order.tenantId);
      final response = await http.post(
        Uri.parse('$baseUrl/api/orders/draft'),
        headers: headers,
        body: jsonEncode(order.toJson()),
      );

      if (response.statusCode == 200) {
        return Order.fromJson(jsonDecode(response.body));
      }
    } catch (e) {
      // Error
    }
    return null;
  }

  Future<Order?> confirmDraft(String orderId, Order updatedOrder) async {
    try {
      final headers = await _getHeaders(updatedOrder.tenantId);
      final response = await http.post(
        Uri.parse('$baseUrl/api/orders/$orderId/confirm'),
        headers: headers,
        body: jsonEncode(updatedOrder.toJson()),
      );

      if (response.statusCode == 200) {
        return Order.fromJson(jsonDecode(response.body));
      } else {
        final err = jsonDecode(response.body);
        throw Exception(err['message'] ?? err['Message'] ?? 'Lỗi khi duyệt đơn hàng nháp');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> rejectDraft(String orderId, String tenantId) async {
    try {
      final headers = await _getHeaders(tenantId);
      final response = await http.post(
        Uri.parse('$baseUrl/api/orders/$orderId/reject?tenantId=$tenantId'),
        headers: headers,
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Future<ShiftSummary?> fetchShiftSummary(String tenantId, String userId) async {
    try {
      final headers = await _getHeaders(tenantId);
      final response = await http.get(
        Uri.parse('$baseUrl/api/dashboard/shift-summary?tenantId=$tenantId&userId=$userId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return ShiftSummary.fromJson(jsonDecode(response.body));
      }
    } catch (e) {
      // Error
    }
    return null;
  }
}

