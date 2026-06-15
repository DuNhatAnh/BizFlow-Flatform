import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class PosProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  User? _currentUser;
  String? _tenantId;
  bool _isLoading = false;
  String? _errorMessage;

  List<Category> _categories = [];
  List<Product> _products = [];
  List<Customer> _customers = [];
  List<Order> _orders = [];
  List<Order> _drafts = [];
  ShiftSummary? _shiftSummary;

  // Cart Management
  final List<OrderItem> _cartItems = [];
  Customer? _selectedCustomer;

  // Getters
  User? get currentUser => _currentUser;
  String? get tenantId => _tenantId;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<Category> get categories => _categories;
  List<Product> get products => _products;
  List<Customer> get customers => _customers;
  List<Order> get orders => _orders;
  List<Order> get drafts => _drafts;
  ShiftSummary? get shiftSummary => _shiftSummary;
  List<OrderItem> get cartItems => _cartItems;
  Customer? get selectedCustomer => _selectedCustomer;
  double get cartTotal => _cartItems.fold(0.0, (sum, item) => sum + item.totalPrice);
  int get cartCount => _cartItems.fold(0, (sum, item) => sum + item.quantity);

  String get connectionUrl => ApiService.baseUrl;

  void setConnectionUrl(String url) {
    ApiService.baseUrl = url;
    notifyListeners();
  }

  // Auth Operations
  Future<bool> login(String username, String password) async {
    _setLoading(true);
    _clearError();

    final user = await _apiService.login(username, password);
    if (user != null) {
      _currentUser = user;
      _tenantId = user.tenantId;
      _setLoading(false);
      await loadPOSData();
      return true;
    } else {
      _errorMessage = "Tên đăng nhập hoặc mật khẩu không chính xác";
      _setLoading(false);
      return false;
    }
  }

  Future<void> logout() async {
    await _apiService.logout();
    _currentUser = null;
    _tenantId = null;
    _categories.clear();
    _products.clear();
    _customers.clear();
    _orders.clear();
    _drafts.clear();
    _cartItems.clear();
    _selectedCustomer = null;
    _shiftSummary = null;
    notifyListeners();
  }

  // Load All Business Data
  Future<void> loadPOSData() async {
    if (_tenantId == null) return;
    _setLoading(true);

    try {
      final cats = await _apiService.fetchCategories(_tenantId!);
      final prods = await _apiService.fetchProducts(_tenantId!);
      final custs = await _apiService.fetchCustomers(_tenantId!);
      final ords = await _apiService.fetchOrders(_tenantId!);
      final dfts = await _apiService.fetchDrafts(_tenantId!);

      _categories = cats;
      _products = prods;
      _customers = custs;
      _orders = ords;
      _drafts = dfts;

      if (_currentUser != null) {
        _shiftSummary = await _apiService.fetchShiftSummary(_tenantId!, _currentUser!.id);
      }
    } catch (e) {
      _errorMessage = "Không thể đồng bộ dữ liệu với máy chủ";
    } finally {
      _setLoading(false);
    }
  }

  // Cart Operations
  void addToCart(Product product, ProductUnit unit) {
    // Check if item already exists
    final index = _cartItems.indexWhere(
        (item) => item.productId == product.id && item.productUnitId == unit.id);

    if (index >= 0) {
      final existing = _cartItems[index];
      _cartItems[index] = OrderItem(
        productId: existing.productId,
        productUnitId: existing.productUnitId,
        productName: existing.productName,
        unitName: existing.unitName,
        quantity: existing.quantity + 1,
        unitPrice: existing.unitPrice,
        totalPrice: existing.unitPrice * (existing.quantity + 1),
      );
    } else {
      _cartItems.add(OrderItem(
        productId: product.id,
        productUnitId: unit.id,
        productName: product.name,
        unitName: unit.unitName,
        quantity: 1,
        unitPrice: unit.price,
        totalPrice: unit.price,
      ));
    }
    notifyListeners();
  }

  void adjustCartQuantity(String productId, int unitId, int change) {
    final index = _cartItems.indexWhere(
        (item) => item.productId == productId && item.productUnitId == unitId);

    if (index >= 0) {
      final existing = _cartItems[index];
      final newQty = existing.quantity + change;

      if (newQty <= 0) {
        _cartItems.removeAt(index);
      } else {
        _cartItems[index] = OrderItem(
          productId: existing.productId,
          productUnitId: existing.productUnitId,
          productName: existing.productName,
          unitName: existing.unitName,
          quantity: newQty,
          unitPrice: existing.unitPrice,
          totalPrice: existing.unitPrice * newQty,
        );
      }
      notifyListeners();
    }
  }

  void removeFromCart(String productId, int unitId) {
    _cartItems.removeWhere(
        (item) => item.productId == productId && item.productUnitId == unitId);
    notifyListeners();
  }

  void clearCart() {
    _cartItems.clear();
    _selectedCustomer = null;
    notifyListeners();
  }

  // Customer Operations
  void selectCustomer(Customer customer) {
    _selectedCustomer = customer;
    notifyListeners();
  }

  void deselectCustomer() {
    _selectedCustomer = null;
    notifyListeners();
  }

  Future<Customer?> createCustomer(String name, String? phone) async {
    if (_tenantId == null) return null;
    _setLoading(true);

    final cust = await _apiService.createCustomer(_tenantId!, name, phone);
    if (cust != null) {
      _customers.insert(0, cust);
      _selectedCustomer = cust;
      notifyListeners();
    }
    _setLoading(false);
    return cust;
  }

  // Checkout Operations
  Future<Order> checkout(String paymentMethod) async {
    if (_tenantId == null || _currentUser == null) {
      throw Exception("Chưa đăng nhập hệ thống");
    }

    if (paymentMethod == 'Debt' && _selectedCustomer == null) {
      throw Exception("Vui lòng chọn khách hàng đăng ký để thực hiện ghi nợ");
    }

    final order = Order(
      id: '',
      tenantId: _tenantId!,
      customerId: _selectedCustomer?.id,
      createdBy: _currentUser!.id,
      totalAmount: cartTotal,
      paymentMethod: paymentMethod,
      status: 'Completed',
      orderSource: 'Manual',
      createdAt: DateTime.now(),
      orderItems: List.from(_cartItems),
    );

    _setLoading(true);
    try {
      final completedOrder = await _apiService.createOrder(order);
      if (completedOrder != null) {
        clearCart();
        await loadPOSData(); // Reload stats, customer nợ, and order history
        _setLoading(false);
        return completedOrder;
      } else {
        throw Exception("Lỗi khi kết nối với máy chủ");
      }
    } catch (e) {
      _setLoading(false);
      rethrow;
    }
  }

  // Debt Operations
  Future<bool> collectDebt(String customerId, double amount, String method) async {
    if (_tenantId == null) return false;
    _setLoading(true);

    final success = await _apiService.collectDebt(_tenantId!, customerId, amount, method);
    if (success) {
      await loadPOSData(); // Reload customers (debt balance) and shift dashboard
    }
    _setLoading(false);
    return success;
  }

  // History & Cancellation
  Future<bool> cancelOrder(String orderId) async {
    if (_tenantId == null) return false;
    _setLoading(true);

    final success = await _apiService.cancelOrder(orderId, _tenantId!);
    if (success) {
      await loadPOSData(); // Reload history, inventory, shift totals
    }
    _setLoading(false);
    return success;
  }

  // AI Draft Operations
  Future<bool> confirmAIDraft(String orderId, Order updatedOrder) async {
    _setLoading(true);
    try {
      final confirmed = await _apiService.confirmDraft(orderId, updatedOrder);
      if (confirmed != null) {
        await loadPOSData();
        _setLoading(false);
        return true;
      }
    } catch (e) {
      _errorMessage = e.toString();
    }
    _setLoading(false);
    return false;
  }

  Future<bool> rejectAIDraft(String orderId) async {
    if (_tenantId == null) return false;
    _setLoading(true);

    final success = await _apiService.rejectDraft(orderId, _tenantId!);
    if (success) {
      await loadPOSData();
    }
    _setLoading(false);
    return success;
  }

  // Simulated AI voice dispatch (local demo trigger)
  Future<void> simulateAIVoiceOrder(String transcript) async {
    if (_tenantId == null || _products.isEmpty) return;
    _setLoading(true);

    // Parse logic locally for demonstration
    // "Lấy cho chú Ba 5 bao xi măng Hà Tiên, ghi nợ nghen"
    // Let's create a draft order in DB
    var customer = _customers.firstWhere(
      (c) => c.fullname.toLowerCase().contains("ba"),
      orElse: () => _customers.isNotEmpty ? _customers.first : Customer(id: '', tenantId: _tenantId!, fullname: 'Khách Lẻ', totalDebt: 0),
    );

    var product = _products.firstWhere(
      (p) => p.name.toLowerCase().contains("coca") || p.name.toLowerCase().contains("xi măng"),
      orElse: () => _products.first,
    );

    var defaultUnit = product.productUnits.firstWhere((u) => u.isDefault, orElse: () => product.productUnits.first);

    final draftOrder = Order(
      id: '',
      tenantId: _tenantId!,
      customerId: customer.id.isNotEmpty ? customer.id : null,
      createdBy: _currentUser?.id,
      totalAmount: defaultUnit.price * 5,
      paymentMethod: 'Debt',
      status: 'Draft',
      orderSource: 'AI_Voice',
      createdAt: DateTime.now(),
      orderItems: [
        OrderItem(
          productId: product.id,
          productUnitId: defaultUnit.id,
          productName: product.name,
          unitName: defaultUnit.unitName,
          quantity: 5,
          unitPrice: defaultUnit.price,
          totalPrice: defaultUnit.price * 5,
        )
      ],
    );

    await _apiService.createDraft(draftOrder);
    await loadPOSData();
    _setLoading(false);
  }

  // Private helpers
  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
  }
}

